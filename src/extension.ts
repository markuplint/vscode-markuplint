import * as path from 'path';
import * as vscode from 'vscode';
import { LanguageClient, SettingMonitor } from 'vscode-languageclient';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "vscode-markuplint" is now active!');

    const serverModulePath = path.join(__dirname, 'server', 'server.js');
    const workspaceConfig = vscode.workspace.getConfiguration('markuplint');
    const additionalDocuments: string[] = workspaceConfig.get('additionalDocumentSelectors') || [];

    const client = new LanguageClient('markuplint', {
        run: {
            module: serverModulePath,
        },
        debug: {
            module: serverModulePath,
            options: {
                execArgv: ['--nolazy', '--inspect=7000'],
            },
        },
    }, {
        documentSelector: ['html', ...additionalDocuments],
        synchronize: {
            configurationSection: 'markuplint',
            fileEvents: vscode.workspace.createFileSystemWatcher('**/{.markuplintrc,markuplint.json}'),
        },
    });

    context.subscriptions.push(new SettingMonitor(client, 'markuplint.enable').start());
}
