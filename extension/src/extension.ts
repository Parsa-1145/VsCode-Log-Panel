import * as vscode from 'vscode';
import LogViewProvider from './webview';
import LogzWrapTaskProvider from './taskProvider';

export function activate(context: vscode.ExtensionContext) {
    const logViewProvider = new LogViewProvider(context.extensionUri);
    vscode.window.registerWebviewViewProvider(
        "logzPanelView",
        logViewProvider,
        {
            webviewOptions: {
                retainContextWhenHidden: false
            }
        }
    );

    const logzWrapTaskProvider = new LogzWrapTaskProvider(logViewProvider);
    context.subscriptions.push(
        vscode.tasks.registerTaskProvider("logz-wrapper", logzWrapTaskProvider)
    );
}

export function deactivate() { }