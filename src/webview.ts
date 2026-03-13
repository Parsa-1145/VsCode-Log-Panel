import * as vscode from 'vscode';

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const webviewPathOnDisk = vscode.Uri.joinPath(extensionUri, 'out', 'webview');
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

    public postMessage(msg: any) {
        this.webView?.postMessage(msg);
    }

    resolveWebviewView(webviewView: vscode.WebviewView, resolveContext: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): Thenable<void> | void {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.extensionUri, 'out', 'webview')
            ]
        };
        webviewView.webview.html = getWebviewContent(webviewView.webview, this.extensionUri);

        this.webView = webviewView.webview;
    }
}