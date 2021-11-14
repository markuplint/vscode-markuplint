import type { MLEngine as MLEngineInstance } from 'markuplint';

import { defaultConfig } from '../default-config';
import {
	createConnection,
	InitializeResult,
	IPCMessageReader,
	IPCMessageWriter,
	TextDocuments,
	TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { info, ready } from '../types';
import { getFilePath } from '../utils/get-file-path';
import { convertDiagnostics } from './convert-diagnostics';

export function server(MLEngine: typeof MLEngineInstance, version: string, onLocalNodeModule: boolean) {
	console.log(`Boot server v2`);
	const connection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
	const documents = new TextDocuments(TextDocument);
	documents.listen(connection);
	connection.onInitialize((params): InitializeResult => {
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
		}

		console.log(`markuplint ready: v${version}`);
	});

	const engines = new Map<string, MLEngineInstance>();

	documents.onDidOpen(async (opened) => {
		const key = opened.document.uri;
		console.log(`Opend: ${key}`);
		const currentEngine = engines.get(key);
		if (currentEngine) {
			return;
		}

		const filePath = getFilePath(opened.document.uri, opened.document.languageId);
		const sourceCode = opened.document.getText();
		const file = await MLEngine.toMLFile({ sourceCode, name: filePath.basename, workspace: filePath.dirname });

		console.log(file);

		const engine = new MLEngine(file, {
			extMatch: true,
			defaultConfig,
			watch: true,
		});

		engines.set(key, engine);

		engine.on('config', (filePath, configSet) => {
			console.log(`get config: ${filePath}`, configSet);
		});

		engine.on('log', (phase, message) => {
			console.log(phase, message);
		});

		engine.on('lint-error', (filePath, sourceCode, error) => {
			console.log('❌', { error });
		});

		engine.on('lint', (filePath, sourceCode, violations, fixedCode, debug) => {
			if (debug) {
				console.log(debug.join('\n'));
			}
			console.log('🎉', { violations });
			const diagnostics = convertDiagnostics({ filePath, sourceCode, violations, fixedCode });
			connection.sendDiagnostics({
				uri: opened.document.uri,
				diagnostics,
			});
		});

		console.log('Call: exec');
		engine.exec();
	});

	documents.onDidChangeContent(async (change) => {
		const key = change.document.uri;
		console.log(`Changed: ${key}`);

		const engine = engines.get(key);
		console.log({ engine });
		if (!engine) {
			return;
		}

		const code = change.document.getText();
		await engine.setCode(code);
		console.log('Call: exec from onDidChangeContent');
		engine.exec();
	});

	connection.listen();
}
