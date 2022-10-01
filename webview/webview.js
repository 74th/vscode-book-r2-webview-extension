/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.makeColorCodeText = void 0;
function makeColorCodeText(color) {
    // 16進数変換
    function number2hex(n) {
        const hex = n.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }
    const red = number2hex(color.red);
    const green = number2hex(color.green);
    const blue = number2hex(color.blue);
    return `#${red}${green}${blue}`;
}
exports.makeColorCodeText = makeColorCodeText;
;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const colorCode_1 = __webpack_require__(1);
const vscode = acquireVsCodeApi();
function log(mes) {
    vscode.postMessage({
        type: "log",
        message: mes,
    });
}
// HTML要素
const colorCell = document.getElementById("color-cell");
const sliderRed = document.getElementById("slider-red");
const sliderGreen = document.getElementById("slider-green");
const sliderBlue = document.getElementById("slider-blue");
/**
 *  スライダーの色を読み、カラーコードに変換
 */
function loadColorCode() {
    const red = sliderRed.valueAsNumber;
    const green = sliderGreen.valueAsNumber;
    const blue = sliderBlue.valueAsNumber;
    return { red, green, blue };
}
/**
 * スライダーを操作（ドラッグ中）
 */
function slideColor() {
    // カラーコードを表示
    const newColor = loadColorCode();
    const codeText = (0, colorCode_1.makeColorCodeText)(newColor);
    // WebView 内で表示
    colorCell.style.backgroundColor = codeText;
    saveState(newColor);
}
sliderRed.addEventListener("input", slideColor);
sliderGreen.addEventListener("input", slideColor);
sliderBlue.addEventListener("input", slideColor);
/**
 * 現在の色を送る
 */
function changeSlider() {
    const newColor = loadColorCode();
    // 拡張機能内に送信
    vscode.postMessage({
        type: "change-color",
        newColor,
    });
}
sliderRed.addEventListener("change", changeSlider);
sliderGreen.addEventListener("change", changeSlider);
sliderBlue.addEventListener("change", changeSlider);
/**
 * エディタから色を受信
 */
function receiveColorFromEditor(message) {
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
function showColor(color) {
    const codeText = (0, colorCode_1.makeColorCodeText)(color);
    sliderRed.valueAsNumber = color.red;
    sliderGreen.valueAsNumber = color.green;
    sliderBlue.valueAsNumber = color.blue;
    // WebView 内で表示
    colorCell.style.backgroundColor = codeText;
}
/**
 * ステートの読み込み
 */
function loadState() {
    const state = vscode.getState();
    if (!state) {
        return;
    }
    showColor(state.pickerColor);
}
/**
 * ステートの保存
 */
function saveState(color) {
    vscode.setState({ pickerColor: color });
}
// 拡張機能からのメッセージの受信
window.addEventListener("message", (e) => {
    const message = e.data;
    if (message.type === "cursor-color") {
        receiveColorFromEditor(e.data);
    }
});
// ステートから読み込む
loadState();

})();

/******/ })()
;