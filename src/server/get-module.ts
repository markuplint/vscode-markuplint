import path from 'path';

export function getModule() {
	let markuplint: any;
	let version: string;
	let isLocalModule = true;
	try {
		const modPath = path.resolve(process.cwd(), 'node_modules', 'markuplint');
		console.log(`Search markuplint on: ${modPath}`);
		markuplint = require(modPath);
		version = require(`${modPath}/package.json`).version;
	} catch (_e) {
		markuplint = require('markuplint');
		version = require('markuplint/package.json').version;
		isLocalModule = false;
	}
	return {
		markuplint,
		version,
		isLocalModule,
	};
}
