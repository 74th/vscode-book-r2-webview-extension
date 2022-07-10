import { Extension2WebViewMessage } from "./message";

const vscode = acquireVsCodeApi();

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

// 16進数変換
function number2hex(n: number): string {
    const hex = n.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

// スライダーの色を読み、カラーコードに変換
function loadColorCode(): string {
    const red = number2hex(sliderRed.valueAsNumber);
    const green = number2hex(sliderGreen.valueAsNumber);
    const blue = number2hex(sliderBlue.valueAsNumber);
    return `#${red}${green}${blue}`;
}

// スライダーを操作（ドラッグ中）
function slideColor() {
    // カラーコードを表示
    const code = loadColorCode();
    colorCell.style.backgroundColor = code;
}

sliderRed?.addEventListener("input", slideColor);
sliderGreen?.addEventListener("input", slideColor);
sliderBlue?.addEventListener("input", slideColor);

// 現在の色を送る
function setColor() {
    const code = loadColorCode();
    log(`color: ${code}`);
}

sliderRed?.addEventListener("change", setColor);
sliderGreen?.addEventListener("change", setColor);
sliderBlue?.addEventListener("change", setColor);

window.addEventListener("message", (event) => {
    const message = event.data as Extension2WebViewMessage;
});
