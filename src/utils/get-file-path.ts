import path from 'path';

export function getFilePath(uri: string, langId: string) {
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
