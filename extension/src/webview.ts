import { ExtensionCommand, WebviewCommand } from '@logPanelz/shared';
import * as vscode from 'vscode';
import { logPageManager } from './logPageManager';

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const webviewPathOnDisk = vscode.Uri.joinPath(extensionUri, 'dist', 'webview');
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(webviewPathOnDisk, 'index.js'));
    const stylesUri = webview.asWebviewUri(vscode.Uri.joinPath(webviewPathOnDisk, 'index.css'));

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>Logz Panel</title>
    <link rel="stylesheet" type="text/css" href="${stylesUri}">
</head>
<body>
    <div id="root"></div>
    <script type="module" src="${scriptUri}"></script>
</body>
</html>`;
}

export default class LogViewProvider implements vscode.WebviewViewProvider {
    private extensionUri: vscode.Uri;
    private webView?: vscode.Webview;

    constructor(extensionUri: vscode.Uri) {
        this.extensionUri = extensionUri;
    }

    public postMessage(msg: WebviewCommand) {
        this.webView?.postMessage(msg);
    }

    resolveWebviewView(webviewView: vscode.WebviewView, resolveContext: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): Thenable<void> | void {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview')
            ]
        };

        webviewView.webview.onDidReceiveMessage((msg: ExtensionCommand) => {
            switch (msg.action) {
                case "ready":
                    webviewView.webview.postMessage({
                        action: "logPages:load",
                        logPages: logPageManager.getLogPages()
                    });
                    break;
                case 'logPage:process:terminate': {
                    logPageManager.terminateProcess(msg.pageId);
                    break;
                }
                case 'logPage:process:restart': {
                    // logPageManager .(msg.pageId);
                    vscode.window.showInformationMessage("not implemented!")
                    break;
                }
                case 'logPage:remove': {
                    logPageManager.removeLogPage(msg.pageId);
                    break;
                }
            }
        });

        webviewView.webview.html = getWebviewContent(webviewView.webview, this.extensionUri);

        this.webView = webviewView.webview;
    }
}