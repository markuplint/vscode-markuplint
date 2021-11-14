import path from 'path';
import { satisfies } from 'semver';
import { server_v1 } from './v1';
import { server } from './v2';

console.log('Started: markuplint language server');

let markuplint: any;
let version: string;
let onLocalNodeModule = true;
try {
	const modPath = path.resolve(process.cwd(), 'node_modules', 'markuplint');
	console.log(`Search markuplint on: ${modPath}`);
	markuplint = require(modPath);
	version = require(`${modPath}/package.json`).version;
} catch (err) {
	console.log(err);
	markuplint = require('markuplint-v1');
	version = require('markuplint-v1/package.json').version;
	onLocalNodeModule = false;
}

console.log(`Found mod: ${version} (onLocalNodeModule: ${onLocalNodeModule})`);
if (satisfies(version, '1.x')) {
	server_v1(markuplint, version, onLocalNodeModule);
} else {
	console.log(markuplint);
	server(markuplint.MLEngine, version, onLocalNodeModule);
}
