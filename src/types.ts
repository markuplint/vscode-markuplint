import { NotificationType, RequestType } from 'vscode-languageserver';
import { Config as MLConfig } from '@markuplint/ml-config';

export const ready = new RequestType<{ version: string }, void, void>('markuplint/ready');
export const error = new NotificationType<string>('markuplint/error');
export const warning = new NotificationType<string>('markuplint/warning');
export const info = new NotificationType<string>('markuplint/info');

export type Config = {
	enable: boolean;
	debug: boolean;
	defaultConfig: MLConfig;
};
