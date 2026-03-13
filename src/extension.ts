import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {
    console.log('Logz Panel Extension is now active!');

    const provider: vscode.WebviewViewProvider = {
        resolveWebviewView: (webviewView: vscode.WebviewView, resolveContext: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken) => {
            
            // 1. Configure the Webview options
            webviewView.webview.options = {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(context.extensionUri, 'out', 'webview')
                ]
            };

            

            // 2. Set the HTML content
            webviewView.webview.html = getWebviewContent(webviewView.webview, context.extensionUri);
        }
    };

    // 3. Register the provider
    vscode.window.registerWebviewViewProvider(
        "logzPanelView",
        provider,
        {
            webviewOptions: {
                retainContextWhenHidden: false
            }
        }
    );

    console.log(vscode.window.terminals);
}

// Helper function to generate HTML
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

export function deactivate() {}