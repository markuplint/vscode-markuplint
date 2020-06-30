import { NotificationType, RequestType } from 'vscode-languageserver';

export const ready = new RequestType<{ version: string }, void, void, void>('markuplint/ready');
export const error = new NotificationType<string, void>('markuplint/error');
export const warning = new NotificationType<string, void>('markuplint/warning');
export const info = new NotificationType<string, void>('markuplint/info');
