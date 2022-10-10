import * as vscode from 'vscode';
import * as path from 'path';

import webviewHTML from "../webview/index.html";
import { ChangeColorMessage, ColorCode, CursorColorMessage, LogMessage } from "./message";
import { makeColorCodeText } from "./colorCode";


export function activate(context: vscode.ExtensionContext) {

    let panel: vscode.WebviewPanel | null = null;
    let latestEditor: vscode.TextEditor | null = null;

    /*
     * カーソル位置から7文を読み取る
     */
    const readCursorText = (editor: vscode.TextEditor): string => {
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
    const readColorCode = (text: string): ColorCode => {
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

    /**
     * カーソルが変わるたびに、カーソル位置のテキストを読み取り、
     * WebView に送る
     */
    const changeCursor = (editor: vscode.TextEditor) => {
        // カーソルのテキスト読み取り
        const text = readCursorText(editor);

        // テキストからカラーコード読み取り
        let color: ColorCode | null = null;
        try {
            color = readColorCode(text);

        } catch (NotColorCodeException) {
            // カーソルのテキストが読み取れなかった
            return;
        }

        // カーソルのカラーコードとしてメッセージをWebViewに送る
        panel?.webview.postMessage({
            type: 'cursor-color',
            color,
        } as CursorColorMessage);
    };

    // カーソル位置のテキスト
    const changeToNewColor = (editor: vscode.TextEditor, newColor: ColorCode) => {
        // カーソルのテキスト読み取り
        const text = readCursorText(editor);

        // テキストからカラーコード読み取り
        try {
            readColorCode(text);
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

    context.subscriptions.push(
        vscode.commands.registerCommand('color-picker.show', () => {
            if (panel) {
                panel.reveal(vscode.ViewColumn.One);
            } else {
                const disposables: vscode.Disposable[] = [];

                // extension 内の webview ディレクトリのファイルパス
                const webviewResourcePath = path.join(context.extensionPath, 'webview');
                // 拡張機能の JavaScript での URI
                const webviewResourceRootLocalURI = vscode.Uri.file(webviewResourcePath);

                panel = vscode.window.createWebviewPanel(
                    'color-picker',
                    'color picker',
                    vscode.ViewColumn.Beside,
                    {
                        enableScripts: true,

                        // 追加
                        // localResourceRoots: [webviewResourceRootLocalURI],
                    }
                );

                // WebView での URI
                const webviewResourceRootInWebviewURI = panel.webview.asWebviewUri(webviewResourceRootLocalURI);

                // HTML の拡張機能内のURIを書き換える
                const html = webviewHTML.replace("{{resourceRoot}}", webviewResourceRootInWebviewURI.toString());

                // webview の HTML を設定する
                panel.webview.html = html;

                // webview からのメッセージの受取
                disposables.push(
                    panel.webview.onDidReceiveMessage((mes: LogMessage | ChangeColorMessage) => {
                        if (mes.type === "log") {
                            console.log("webview log:", mes.message);
                        }
                        if (mes.type === "change-color") {
                            if (latestEditor && !latestEditor.document.isClosed) {
                                changeToNewColor(latestEditor, mes.newColor);
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
                            changeCursor(e.textEditor);
                        }
                    )
                );

                // webview リソースが削除された時のクリーンアップ
                disposables.push(
                    panel.onDidDispose(
                        () => {
                            // WebViewPanel のインスタンス解除
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


// this method is called when your extension is deactivated
export function deactivate() { }
