import { makeColorCodeText } from "./colorCode";
import { ChangeColorMessage, ColorCode, CursorColorMessage } from "./message";

const vscode = acquireVsCodeApi();

interface State {
    pickerColor: ColorCode
}


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
    // カラーコードを表示
    const newColor = loadColorCode();
    const codeText = makeColorCodeText(newColor);

    // WebView 内で表示
    colorCell.style.backgroundColor = codeText;

    saveState(newColor);
}

sliderRed.addEventListener("input", slideColor);
sliderGreen.addEventListener("input", slideColor);
sliderBlue.addEventListener("input", slideColor);

// 現在の色を送る
function changeSlider() {
    const newColor = loadColorCode();

    // 拡張機能内に送信
    vscode.postMessage({
        type: "change-color",
        newColor,
    } as ChangeColorMessage);
}

sliderRed.addEventListener("change", changeSlider);
sliderGreen.addEventListener("change", changeSlider);
sliderBlue.addEventListener("change", changeSlider);

function receiveColorFromEditor(message: CursorColorMessage) {
    if (!message.color) {
        return;
    }
    showColor(message.color);

    saveState(message.color);
}

function showColor(color: ColorCode) {
    const codeText = makeColorCodeText(color);
    sliderRed.valueAsNumber = color.red;
    sliderGreen.valueAsNumber = color.green;
    sliderBlue.valueAsNumber = color.blue;

    // WebView 内で表示
    colorCell.style.backgroundColor = codeText;
}

function loadState() {
    const state: State | undefined = vscode.getState();
    if (!state) {
        return;
    }

    showColor(state.pickerColor);
}

function saveState(color: ColorCode) {
    vscode.setState({ pickerColor: color } as State);
}

window.addEventListener("message", (e) => {
    const message = e.data as CursorColorMessage;
    log(`receive message ${JSON.stringify(e.data)}`);
    if (message.type === "cursor-color") {
        receiveColorFromEditor(e.data as CursorColorMessage);
    }
});

loadState();
