import * as vscode from 'vscode';
import * as path from 'path';

import webviewHTML from "../webview/index.html";
import { ChangeColorMessage, ColorCode, CursorColorMessage, LogMessage } from "./message";
import { makeColorCodeText } from "./colorCode";


export function activate(context: vscode.ExtensionContext) {

    let panel: vscode.WebviewPanel | null = null;
    const colorPicker = new ColorPicker();
    let latestEditor: vscode.TextEditor | null = null;

    context.subscriptions.push(
        vscode.commands.registerCommand('color-picker.show', () => {
            if (panel) {
                panel.reveal(vscode.ViewColumn.One);
            } else {
                const disposables: vscode.Disposable[] = [];

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
                colorPicker.webViewPanel = panel;

                // extension 内のファイルパス
                const webviewResourceRootLocalPath = vscode.Uri.file(path.join(context.extensionPath, 'webview'));
                // webview 内のファイルパス
                const webviewResourceRootInWebviewPath = panel.webview.asWebviewUri(webviewResourceRootLocalPath);

                // webview の HTML を設定する
                panel.webview.html = getWebviewContent(webviewResourceRootInWebviewPath.toString());

                // webview からのメッセージの受取
                disposables.push(
                    panel.webview.onDidReceiveMessage((mes: LogMessage | ChangeColorMessage) => {
                        if (mes.type === "log") {
                            console.log("webview log:", mes.message);
                        }
                        if (mes.type === "change-color") {
                            if (latestEditor && !latestEditor.document.isClosed) {
                                colorPicker.changeToNewColor(latestEditor, mes.newColor);
                            }
                        }
                    })
                );

                // カーソルの変更
                disposables.push(
                    vscode.window.onDidChangeTextEditorSelection(
                        (e) => {
                            console.log(`onDidChangeTextEditorSelection`);
                            latestEditor = e.textEditor;
                            colorPicker.changeCursor(e.textEditor);
                        }
                    )
                );

                // webview リソースが削除された時のクリーンアップ
                disposables.push(
                    panel.onDidDispose(
                        () => {
                            // WebViewPanel のインスタンス解除
                            colorPicker.webViewPanel = null;
                            panel = null;

                            // WebView を開いてから仕込んだイベントを解除する
                            disposables.forEach((disposes) => { disposes.dispose(); });
                        },
                    )
                );

            }
        })

    );


}

class NotColorCodeException extends Error { };

class ColorPicker {

    public webViewPanel: vscode.WebviewPanel | null = null;

    /*
     * カーソル位置から7文を読み取る
     */
    private readCursorText = (editor: vscode.TextEditor): string => {
        // ドキュメント
        const document = editor.document;

        // カーソルの Position
        const cursorPosition: vscode.Position = editor.selection.active;
        // カーソル座標をオフセットに変換
        const cursorOffset: number = document.offsetAt(cursorPosition);
        // 後ろ7文字目を、オフセットで計算
        const readRangeEndOffset = cursorOffset + 7;
        // オフセットを Position に変換
        const readRangeEndPosition = document.positionAt(readRangeEndOffset);
        // カーソル位置から後ろ7文字のレンジを作成
        const readRange = new vscode.Range(cursorPosition, readRangeEndPosition);
        // Range の範囲のテキストを読み取る
        const text = document.getText(readRange);

        return text;
    };

    /**
     * テキストからカラーコードを抽出
     */
    private readColorCode = (text: string): ColorCode => {
        if (text.length !== 7) {
            // 文字数が7文字ではない
            throw new NotColorCodeException();
        }

        // 正規表現で #ffffff の記法か確認する
        if (!/#[A-Fa-f0-9]{6}/.test(text)) {
            // カラーコードの文字列ではない
            throw new NotColorCodeException();
        }

        // 16進数の文字列を数値に変換
        const red = parseInt(text.slice(1, 3), 16);
        const green = parseInt(text.slice(3, 5), 16);
        const blue = parseInt(text.slice(5, 7), 16);

        return { red, green, blue } as ColorCode;
    };

    // カーソルが変わるたびに処理する
    changeCursor = (editor: vscode.TextEditor) => {
        console.log("change corsor");

        // カーソルのテキスト読み取り
        const text = this.readCursorText(editor);

        // テキストからカラーコード読み取り
        let color: ColorCode | null = null;
        try {
            color = this.readColorCode(text);

        } catch (NotColorCodeException) {
            // カーソルのテキストが読み取れなかった
            return;
        }

        // カーソルのカラーコードとしてメッセージをWebViewに送る
        this.webViewPanel?.webview.postMessage({
            type: 'cursor-color',
            color,
        } as CursorColorMessage);
    };

    // カーソル位置のテキスト
    changeToNewColor = (editor: vscode.TextEditor, newColor: ColorCode) => {
        // カーソルのテキスト読み取り
        const text = this.readCursorText(editor);

        // テキストからカラーコード読み取り
        try {
            this.readColorCode(text);
        } catch (NotColorCodeException) {
            // カーソルのテキストがカラーコードではないので編集しない
            return;
        }

        // ドキュメント
        const document = editor.document;

        // カーソルの Position
        const cursorPosition: vscode.Position = editor.selection.active;
        const cursorOffset: number = document.offsetAt(cursorPosition);
        const readRangeEndOffset = cursorOffset + 7;
        const readRangeEndPosition = document.positionAt(readRangeEndOffset);
        const replaceRange = new vscode.Range(cursorPosition, readRangeEndPosition);

        // カラーコードのテキスト
        const newText = makeColorCodeText(newColor);

        // 編集
        editor.edit((editBuilder) => {
            editBuilder.replace(replaceRange, newText);
        });
    };
}

function getWebviewContent(resourceRoot: string): string {
    // webview から参照できる URL に置き換える
    return webviewHTML.replace("{{resourceRoot}}", resourceRoot);
}

// this method is called when your extension is deactivated
export function deactivate() { }
