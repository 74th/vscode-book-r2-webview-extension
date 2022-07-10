declare interface VSCodeAPI {
    postMessage(arg: any): void;
}


declare function acquireVsCodeApi(): VSCodeAPI;
