import * as path from 'path';

import { workspace, ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient';

export function activate (context: ExtensionContext) {
	const serverModule = context.asAbsolutePath(path.join('out', 'server.js'));
	const debugOptions = { execArgv: ['--nolazy', '--debug=6009'] };

	const serverOptions: ServerOptions = {
		run : { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions },
	};

	const clientOptions: LanguageClientOptions = {
		documentSelector: [{scheme: 'file', language: 'html'}],
		synchronize: {
			configurationSection: 'markuplint',
			fileEvents: workspace.createFileSystemWatcher('**/{.markuplintrc,markuplintrc.json,markuplint.config.json,markuplint.json,markuplint.config.js}'),
		},
	};

	const disposable = new LanguageClient('markuplint', 'markuplint server', serverOptions, clientOptions).start();
	context.subscriptions.push(disposable);
}
