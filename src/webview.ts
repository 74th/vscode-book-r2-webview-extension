import { makeColorCodeText } from "./colorCode";
import { ChangeColorMessage, ColorCode, CursorColorMessage } from "./message";

const vscode = acquireVsCodeApi();
let editorLoading = false;

function log(mes: string) {
    vscode.postMessage({
        type: "log",
        message: mes,
    });
}

// HTML要素
const colorCell = document.getElementById("color-cell") as HTMLDivElement;
const sliderRed = document.getElementById("slider-red") as HTMLInputElement;
const sliderGreen = document.getElementById("slider-green") as HTMLInputElement;
const sliderBlue = document.getElementById("slider-blue") as HTMLInputElement;

// スライダーの色を読み、カラーコードに変換
function loadColorCode(): ColorCode {
    const red = sliderRed.valueAsNumber;
    const green = sliderGreen.valueAsNumber;
    const blue = sliderBlue.valueAsNumber;
    return { red, green, blue };
}

// スライダーを操作（ドラッグ中）
function slideColor() {
    if (editorLoading) {
        return;
    }

    // カラーコードを表示
    const newColor = loadColorCode();
    const codeText = makeColorCodeText(newColor);

    // WebView 内で表示
    colorCell.style.backgroundColor = codeText;
}

sliderRed.addEventListener("input", slideColor);
sliderGreen.addEventListener("input", slideColor);
sliderBlue.addEventListener("input", slideColor);

// 現在の色を送る
function setColor() {
    log(`setColor editorLoading:${editorLoading}`);
    if (editorLoading) {
        return;
    }

    const newColor = loadColorCode();

    // 拡張機能内に送信
    vscode.postMessage({
        type: "change-color",
        newColor,
    } as ChangeColorMessage);
}

sliderRed.addEventListener("change", setColor);
sliderGreen.addEventListener("change", setColor);
sliderBlue.addEventListener("change", setColor);

function receiveEditorColorCode(message: CursorColorMessage) {
    if (!message.color) {
        return;
    }
    const color = message.color;

    editorLoading = true;

    const codeText = makeColorCodeText(message.color);
    sliderRed.valueAsNumber = color.red;
    sliderGreen.valueAsNumber = color.green;
    sliderBlue.valueAsNumber = color.blue;

    // WebView 内で表示
    colorCell.style.backgroundColor = codeText;

    setTimeout(() => {
        editorLoading = false;
    }, 100);
}

window.addEventListener("message", (e) => {
    const message = e.data as CursorColorMessage;
    log(`receive message ${JSON.stringify(e.data)}`);
    if (message.type === "cursor-color") {
        receiveEditorColorCode(e.data as CursorColorMessage);
    }
});
