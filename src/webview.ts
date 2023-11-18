import { ColorCode, makeColorCodeText } from "./colorCode";
import { ChangeColorMessage, CursorColorMessage, LogMessage } from "./message";

const vscode = acquireVsCodeApi();

interface State {
    pickerColor: ColorCode
}


function log(mes: string) {
    vscode.postMessage({
        type: "log",
        message: mes,
    } as LogMessage);
}

// HTML要素
const colorCell = document.getElementById("color-cell") as HTMLDivElement;
const sliderRed = document.getElementById("slider-red") as HTMLInputElement;
const sliderGreen = document.getElementById("slider-green") as HTMLInputElement;
const sliderBlue = document.getElementById("slider-blue") as HTMLInputElement;

/**
 *  スライダーの色を読み、カラーコードに変換
 */
function loadColorCode(): ColorCode {
    const red = sliderRed.valueAsNumber;
    const green = sliderGreen.valueAsNumber;
    const blue = sliderBlue.valueAsNumber;
    return { red, green, blue };
}

/**
 * スライダーを操作（ドラッグ中）
 */
function slideColor() {
    const newColor = loadColorCode();

    // WebView 内で表示
    const codeText = makeColorCodeText(newColor);
    colorCell.style.backgroundColor = codeText;
}

sliderRed.addEventListener("input", slideColor);
sliderGreen.addEventListener("input", slideColor);
sliderBlue.addEventListener("input", slideColor);

/**
 * 現在の色を送る
 */
function changeSlider() {
    const newColor = loadColorCode();

    // WebView 内で表示
    const codeText = makeColorCodeText(newColor);
    colorCell.style.backgroundColor = codeText;

    // ステートに保存
    saveState(newColor);

    // 拡張機能内に送信
    vscode.postMessage({
        type: "change-color",
        newColor,
    } as ChangeColorMessage);
}

sliderRed.addEventListener("change", changeSlider);
sliderGreen.addEventListener("change", changeSlider);
sliderBlue.addEventListener("change", changeSlider);

/**
 * エディタから色を受信
 */
function receiveColorFromEditor(message: CursorColorMessage) {
    if (!message.color) {
        return;
    }
    // 受け取った色の表示
    showColor(message.color);

    // ステートとして保存
    saveState(message.color);
}

/**
 * 色の表示
 */
function showColor(color: ColorCode) {
    const codeText = makeColorCodeText(color);
    sliderRed.valueAsNumber = color.red;
    sliderGreen.valueAsNumber = color.green;
    sliderBlue.valueAsNumber = color.blue;

    // WebView 内で表示
    colorCell.style.backgroundColor = codeText;
}

/**
 * ステートの保存
 */
function saveState(color: ColorCode) {
    vscode.setState({ pickerColor: color } as State);
}

// 拡張機能からのメッセージの受信
window.addEventListener("message", (e) => {
    const message = e.data as CursorColorMessage;

    if (message.type === "cursor-color") {
        receiveColorFromEditor(e.data as CursorColorMessage);
    }
});

/**
 * ステートの読み込み
 */
function loadState() {
    const state: State | undefined = vscode.getState();
    if (!state) {
        return;
    }

    showColor(state.pickerColor);
}

// ステートから読み込む
loadState();
