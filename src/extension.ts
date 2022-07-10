import webviewHTML from "../webview/index.html";
import * as vscode from 'vscode';
import { Message } from "./message";


export function activate(context: vscode.ExtensionContext) {

    let currentPanel: vscode.WebviewPanel | undefined = undefined;

    context.subscriptions.push(
        vscode.commands.registerCommand('color-picker.show', () => {
            if (currentPanel) {
                currentPanel.reveal(vscode.ViewColumn.One);
            } else {
                currentPanel = vscode.window.createWebviewPanel(
                    'color-picker',
                    'color picker',
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true
                    }
                );
                currentPanel.webview.html = getWebviewContent();
                currentPanel.onDidDispose(
                    () => {
                        currentPanel = undefined;
                    },
                    undefined,
                    context.subscriptions
                );
                currentPanel.webview.onDidReceiveMessage((mes: Message) => {
                    if (mes.type === "log") {
                        console.log("webview log:", mes.message);
                    }
                });

            }
        })

    );
}

function getWebviewContent(): string {
    return webviewHTML;
}

// this method is called when your extension is deactivated
export function deactivate() { }
