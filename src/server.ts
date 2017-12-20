require('util.promisify/shim')(); // tslint:disable-line

import * as path from 'path';

import * as markuplint from 'markuplint';
import { getRuleModules } from 'markuplint/lib/rule';
import { getRuleset } from 'markuplint/lib/ruleset';

import {
	createConnection,
	Diagnostic,
	DiagnosticSeverity,
	InitializeResult,
	IPCMessageReader,
	IPCMessageWriter,
	TextDocuments,
} from 'vscode-languageserver';

const connection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
const documents = new TextDocuments();
documents.listen(connection);

connection.onInitialize((params): InitializeResult => {
	return {
		capabilities: {
			textDocumentSync: documents.syncKind,
			completionProvider: {
				resolveProvider: true,
			},
		},
	};
});

documents.onDidChangeContent((change) => {
	const diagnostics: Diagnostic[] = [];

	const filePath = change.document.uri.replace(/^file:\//, '');
	const dir = path.dirname(filePath);

	Promise.all([
		getRuleset(dir),
		getRuleModules(),
	]).then(([ruleset, rules]) => {
		markuplint.verify(
			change.document.getText(),
			ruleset,
			rules,
		).then((reports) => {
			for (const report of reports) {
				diagnostics.push({
					severity: report.level === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
					range: {
						start: { line: report.line - 1, character: report.col - 1},
						end: { line: report.line - 1, character: report.col + report.raw.length - 1 },
					},
					message: `${report.message} (${report.ruleId})`,
					source: 'markuplint',
				});
			}
			connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
		});
	}).catch((err) => {
		console.log(err);
	});
});

connection.listen();
