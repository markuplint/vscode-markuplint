import { defaultConfig } from '../default-config';
import {
	createConnection,
	Diagnostic,
	DiagnosticSeverity,
	InitializeResult,
	IPCMessageReader,
	IPCMessageWriter,
	TextDocuments,
	TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { info, ready } from '../types';
import { getFilePath } from '../utils/get-file-path';

export function server_v1(markuplint: any, version: string, onLocalNodeModule: boolean) {
	console.log(`Boot server v1`);
	const connection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
	const documents = new TextDocuments(TextDocument);
	documents.listen(connection);
	connection.onInitialize((): InitializeResult => {
		return {
			capabilities: {
				textDocumentSync: TextDocumentSyncKind.Incremental,
			},
		};
	});

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

	documents.onDidOpen((e) => {
		console.log('onDidOpen', e);
	});

	documents.onWillSave((e) => {
		console.log('onWillSave', e);
	});

	documents.onDidChangeContent(async (change) => {
		const diagnostics: Diagnostic[] = [];

		const file = getFilePath(change.document.uri, change.document.languageId);

		const html = change.document.getText();

		const totalResults = await markuplint.exec({
			sourceCodes: html,
			names: file.basename,
			workspace: file.dirname,
			// Add option since markuplint v1.7.0 @see https://github.com/markuplint/markuplint/pull/167
			extMatch: true,
			defaultConfig,
		});

		const result = totalResults[0];
		if (!result) {
			return;
		}

		/**
		 * The process for until version 1.6.x.
		 * @see https://github.com/markuplint/markuplint/pull/167
		 *
		 * @deprecated
		 */
		if (result.parser === '@markuplint/html-parser' && !/\.html?/i.test(file.basename)) {
			console.log(`Skipped: "${change.document.uri}"`);
			return;
		}

		console.log(
			[
				`Linting: "${change.document.uri}"`,
				`\tLangId: ${change.document.languageId}`,
				`\tConfig: [${result.configSet.files.map((file: string) => `\n\t\t${file}`)}\n\t]`,
				`\tParser: ${result.parser}`,
				`\tResult: ${result.results.length} reports.`,
			].join('\n'),
		);

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
}
