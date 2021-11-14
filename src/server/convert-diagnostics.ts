import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver/node';
import type { MLResultInfo } from 'markuplint';

export function convertDiagnostics(result: MLResultInfo | null) {
	const diagnostics: Diagnostic[] = [];

	if (!result) {
		return diagnostics;
	}

	console.log(new Date().toLocaleTimeString());
	console.log(
		[
			`Linting: "${result.filePath}"`,
			// `\tConfig: [${result.configSet.files.map((file) => `\n\t\t${file}`)}\n\t]`,
			// `\tParser: ${result.parser}`,
			// `\tResult: ${result.results.length} reports.`,
		].join('\n'),
	);

	for (const violation of result.violations) {
		diagnostics.push({
			severity: violation.severity === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
			range: {
				start: {
					line: Math.max(violation.line - 1, 0),
					character: Math.max(violation.col - 1, 0),
				},
				end: {
					line: Math.max(violation.line - 1, 0),
					character: Math.max(violation.col + violation.raw.length - 1, 0),
				},
			},
			message: violation.message,
			source: 'markuplint',
			code: violation.ruleId,
			codeDescription: {
				href: `https://markuplint.dev/rules/${violation.ruleId}`,
			},
		});
	}

	return diagnostics;
}
