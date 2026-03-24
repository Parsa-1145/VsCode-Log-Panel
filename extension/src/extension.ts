import * as vscode from 'vscode';
import LogViewProvider from './webview';
import LogzWrapTaskProvider from './taskProvider';
import { logPageManager } from './logPageManager';

export function activate(context: vscode.ExtensionContext) {
    const logViewProvider = new LogViewProvider(context.extensionUri);
    vscode.window.registerWebviewViewProvider(
        "logPanelView",
        logViewProvider,
        {
            webviewOptions: {
                retainContextWhenHidden: true
            }
        }
    );

    const logzWrapTaskProvider = new LogzWrapTaskProvider(logViewProvider);
    context.subscriptions.push(
        vscode.tasks.registerTaskProvider("log-panel-wrapper", logzWrapTaskProvider)
    );
}

export function deactivate() { 
    logPageManager.clearLogPages()
}