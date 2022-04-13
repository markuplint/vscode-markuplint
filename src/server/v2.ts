import type { MLEngine as _MLEngine } from 'markuplint';
import type { TextDocumentChangeEvent, PublishDiagnosticsParams } from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';

import { defaultConfig } from '../default-config';
import { Config } from '../types';
import { getFilePath } from '../utils/get-file-path';
import { convertDiagnostics } from './convert-diagnostics';

const engines = new Map<string, _MLEngine>();

export async function onDidOpen(
	opened: TextDocumentChangeEvent<TextDocument>,
	MLEngine: typeof _MLEngine,
	config: Config,
	sendDiagnostics: (params: PublishDiagnosticsParams) => void,
) {
	console.log('Settings:', config);

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
		debug: false,
		defaultConfig,
		watch: true,
	});

	engines.set(key, engine);

	engine.on('config', (filePath, configSet) => {
		// console.log(`get config: ${filePath}`, configSet);
	});

	engine.on('log', (phase, message) => {
		// console.log(phase, message);
	});

	engine.on('lint-error', (filePath, sourceCode, error) => {
		// console.log('❌', { error });
	});

	engine.on('lint', (filePath, sourceCode, violations, fixedCode, debug) => {
		// if (debug) {
		// 	console.log(debug.join('\n'));
		// }

		const rep = violations.map(
			(v) => `${v.line}:${v.col} [${v.severity}] ${v.message}${v.reason ? ` - ${v.reason}` : ''} (${v.ruleId})`,
		);
		const date = new Date().toLocaleDateString();
		const time = new Date().toLocaleTimeString();

		console.log(`Linted(${date} ${time}): ${opened.document.uri}`);
		// console.log('  |> ' + rep.join('\n  |> '));

		const diagnostics = convertDiagnostics({ filePath, sourceCode, violations, fixedCode });
		sendDiagnostics({
			uri: opened.document.uri,
			diagnostics,
		});
	});

	console.log('Call: exec');
	engine.exec();
}

let debounceTimer: NodeJS.Timer;

export async function onDidChangeContent(change: TextDocumentChangeEvent<TextDocument>) {
	clearTimeout(debounceTimer);

	const key = change.document.uri;
	const engine = engines.get(key);

	debounceTimer = setTimeout(async () => {
		if (!engine) {
			return;
		}

		const code = change.document.getText();
		await engine.setCode(code);
		console.log('Call: exec from onDidChangeContent');
		engine.exec();
	}, 300);
}
