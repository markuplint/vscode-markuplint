import { satisfies } from 'semver';
import {
	createConnection,
	InitializeResult,
	IPCMessageReader,
	IPCMessageWriter,
	TextDocuments,
	TextDocumentSyncKind,
	PublishDiagnosticsParams,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Config, info, ready } from '../types';
import Deferred from '../utils/deferred';
import { getModule } from './get-module';
import * as v1 from './v1';
import * as v2 from './v2';

export type Context = {
	initialized: Deferred<Config>;
	documents: TextDocuments<TextDocument>;
	sendDiagnostics: (params: PublishDiagnosticsParams) => void;
};

export async function bootServer() {
	const { markuplint, version, isLocalModule } = getModule();
	console.log(`Found version: ${version} (isLocalModule: ${isLocalModule})`);

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

	const initialized = new Deferred<Config>();

	connection.onInitialized(async () => {
		const workspaceConfig = await connection.workspace.getConfiguration();
		const config: Config = workspaceConfig?.markuplint ?? {};

		if (!config.enable) {
			console.log(`markuplint is disabled`);
			return;
		}

		connection.sendRequest(ready, { version });

		if (!isLocalModule) {
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

		console.log(`markuplint is enabled`);
		console.log(`Ready: v${version}`);

		initialized.resolve(config);
	});

	function sendDiagnostics(params: PublishDiagnosticsParams) {
		connection.sendDiagnostics(params);
	}

	documents.onDidOpen(async (e) => {
		if (satisfies(version, '1.x')) {
			return;
		}
		const config = await initialized;
		v2.onDidOpen(e, markuplint.MLEngine, config, sendDiagnostics);
	});

	documents.onDidChangeContent(async (e) => {
		if (satisfies(version, '1.x')) {
			const config = await initialized;
			v1.onDidChangeContent(e, markuplint, config, sendDiagnostics);
			return;
		}
		v2.onDidChangeContent(e);
	});

	connection.listen();
}
