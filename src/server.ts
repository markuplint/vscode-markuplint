import path from 'path';
import type { exec } from 'markuplint';

console.log('Started: markuplint language server');

import {
	createConnection,
	Diagnostic,
	DiagnosticSeverity,
	InitializeResult,
	IPCMessageReader,
	IPCMessageWriter,
	TextDocuments,
} from 'vscode-languageserver';

import { error, info, ready, warning } from './types';

// tslint:disable
let markuplint: { exec: typeof exec };
let version: string;
let onLocalNodeModule = true;
try {
	const modPath = path.join(process.cwd(), 'node_modules', 'markuplint');
	markuplint = require(modPath);
	version = require(`${modPath}/package.json`).version;
} catch (err) {
	markuplint = require('markuplint');
	version = require('markuplint/package.json').version;
	onLocalNodeModule = false;
}
// tslint:enable

const connection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
const documents = new TextDocuments();
documents.listen(connection);

connection.onInitialize(
	(params): InitializeResult => {
		return {
			capabilities: {
				textDocumentSync: documents.syncKind,
			},
		};
	},
);

connection.onInitialized(() => {
	connection.sendRequest(ready, { version });

	if (!onLocalNodeModule) {
		const locale = process.env.VSCODE_NLS_CONFIG ? JSON.parse(process.env.VSCODE_NLS_CONFIG).locale : '';
		let msg: string;
		switch (locale) {
			case 'ja': {
				msg = `ワークスペースのnode_modulesにmarkuplintが発見できなかったためVS Code拡張にインストールされているバージョン(v${version})を利用します。`;
				break;
			}
			default: {
				msg = `Since markuplint could not be found in the node_modules of the workspace, this use the version (v${version}) installed in VS Code Extension.`;
			}
		}
		connection.sendNotification(info, `<markuplint> ${msg}`);
	} else {
		console.log(`markuplint ready: v${version}`);
	}
});

function getFilePath(uri: string, langId: string) {
	const decodePath = decodeURIComponent(uri);
	let filePath: string;
	let untitled = false;
	if (/^file:/.test(decodePath)) {
		filePath = decodePath.replace(/^file:\/+/i, '/');
	} else if (/^untitled:/.test(decodePath)) {
		filePath = decodePath.replace(/^untitled:/i, '');
		untitled = true;
	} else {
		filePath = decodePath;
	}
	const dirname = path.resolve(path.dirname(filePath));
	let basename = path.basename(filePath);
	if (untitled) {
		basename += `.${langId}`;
	}
	return {
		dirname,
		basename,
	};
}

documents.onDidChangeContent(async (change) => {
	const diagnostics: Diagnostic[] = [];

	const file = getFilePath(change.document.uri, change.document.languageId);

	const html = change.document.getText();

	const totalResults = await markuplint.exec({
		sourceCodes: html,
		names: file.basename,
		workspace: file.dirname,
	});

	const result =  totalResults[0];
	if (!result) {
		return;
	}

	console.log(`Linting: "${file.basename}" on "${file.dirname}"\n\tConfig: [${result.configSet.files.map(file => `\n\t\t${file}`)}\n\t]\n\tParser: ${result.parser}\n\tResult: ${result.results.length} reports.`);

	for (const report of result.results) {
		diagnostics.push({
			severity: report.severity === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
			range: {
				start: {
					line: Math.max(report.line - 1, 0),
					character: Math.max(report.col - 1, 0),
				},
				end: {
					line: Math.max(report.line - 1, 0),
					character: Math.max(report.col + report.raw.length - 1, 0),
				},
			},
			message: `${report.message} (${report.ruleId})`,
			source: 'markuplint',
		});
	}

	connection.sendDiagnostics({
		uri: change.document.uri,
		diagnostics,
	});
});

connection.listen();
