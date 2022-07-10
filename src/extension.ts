import * as vscode from 'vscode';
import * as path from 'path';

import webviewHTML from "../webview/index.html";
import { WebView2ExtensionMessage } from "./message";


export function activate(context: vscode.ExtensionContext) {

    let panel: vscode.WebviewPanel | undefined = undefined;

    context.subscriptions.push(
        vscode.commands.registerCommand('color-picker.show', () => {
            if (panel) {
                panel.reveal(vscode.ViewColumn.One);
            } else {

                panel = vscode.window.createWebviewPanel(
                    'color-picker',
                    'color picker',
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true,

                        // 拡張機能内、ワークスペース内以外のファイルを webview 内に持ち込む場合
                        // localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'webview'))],
                    }
                );

                // extension 内のファイルパス
                const webviewResourceRootLocalPath = vscode.Uri.file(path.join(context.extensionPath, 'webview'));
                // webview 内のファイルパス
                const webviewResourceRootInWebviewPath = panel.webview.asWebviewUri(webviewResourceRootLocalPath);

                // webview の HTML を設定する
                panel.webview.html = getWebviewContent(webviewResourceRootInWebviewPath.toString());

                // webview からのメッセージの受取
                panel.webview.onDidReceiveMessage((mes: WebView2ExtensionMessage) => {
                    if (mes.type === "log") {
                        console.log("webview log:", mes.message);
                    }
                });

                // webview リソースが削除された時のクリーンアップ
                panel.onDidDispose(
                    () => {
                        panel = undefined;
                    },
                    undefined,
                    context.subscriptions
                );

            }
        })

    );
}

function getWebviewContent(resourceRoot: string): string {
    // webview から参照できる URL に置き換える
    return webviewHTML.replace("{{resourceRoot}}", resourceRoot);
}

// this method is called when your extension is deactivated
export function deactivate() { }
