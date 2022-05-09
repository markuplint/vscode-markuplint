import path from 'path';
import { window, workspace, ExtensionContext, StatusBarAlignment, commands } from 'vscode';
import { LanguageClientOptions, LanguageClient, ServerOptions, TransportKind } from 'vscode-languageclient/node';
import { configs, error, info, LangConfigs, ready, warning } from './types';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	const serverModule = context.asAbsolutePath(path.join('out', 'server', 'index.js'));

	const debugOptions = {
		execArgv: ['--nolazy', '--inspect=6009'],
	};

	const serverOptions: ServerOptions = {
		run: {
			module: serverModule,
			transport: TransportKind.ipc,
		},
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions,
		},
	};

	const languages = [
		'html',
		'vue',
		'jade',
		'svelte',
		'astro',
		'nunjucks',
		'liquid',
		'handlebars',
		'mustache',
		'ejs',
		'haml',
		'jstl',
		'php',
		'smarty',
		'ruby',
		'javascript',
		'javascriptreact',
		'typescript',
		'typescriptreact',
	] as const;

	const langConfigs: LangConfigs = {};
	languages.forEach((v) => {
		langConfigs[v] = JSON.parse(
			JSON.stringify(workspace.getConfiguration('', { languageId: v }).get('markuplint')),
		);
	});

	const clientOptions: LanguageClientOptions = {
		documentSelector: [
			...languages.map((language) => ({ language, scheme: 'file' })),
			...languages.map((language) => ({ language, scheme: 'untitled' })),
		],
		synchronize: {
			configurationSection: 'markuplint',
			fileEvents: workspace.createFileSystemWatcher(
				'**/{.markuplintrc,markuplintrc.json,markuplint.config.json,markuplint.json,markuplint.config.js}',
			),
		},
	};

	client = new LanguageClient('markuplint', 'markuplint', serverOptions, clientOptions);
	client.start();

	client.onReady().then(() => {
		client.sendRequest(configs, langConfigs);

		const statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 0);

		client.onRequest(ready, (data) => {
			statusBar.show();
			statusBar.text = `$(check)markuplint[v${data.version}]`;
			statusBar.command = 'markuplint.openLog';
		});

		client.onNotification(error, (message) => {
			window.showErrorMessage(message);
		});

		client.onNotification(warning, (message) => {
			window.showWarningMessage(message);
		});

		client.onNotification(info, (message) => {
			window.showInformationMessage(message);
		});
	});

	const openLogCommand = commands.registerCommand('markuplint.openLog', () => {
		client.outputChannel.show();
	});
	context.subscriptions.push(openLogCommand);
}

export function deactivate() {
	if (!client) {
		return;
	}
	return client.stop();
}
