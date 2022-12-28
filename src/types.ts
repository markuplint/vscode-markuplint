import { NotificationType, RequestType } from 'vscode-languageserver';
import { Config as MLConfig } from '@markuplint/ml-config';
import type { ARIAVersion } from '@markuplint/ml-spec';

export const ready = new RequestType<{ version: string }, void, void>('markuplint/ready');
export const configs = new RequestType<LangConfigs, void, void>('markuplint/configs');
export const error = new NotificationType<string>('markuplint/error');
export const warning = new NotificationType<string>('markuplint/warning');
export const info = new NotificationType<string>('markuplint/info');

export type Config = {
	enable: boolean;
	debug: boolean;
	defaultConfig: MLConfig;
	hover: {
		accessibility: {
			enable: boolean;
			ariaVersion: ARIAVersion;
		};
	}
};

export type LangConfigs = Record<string, Config>;
