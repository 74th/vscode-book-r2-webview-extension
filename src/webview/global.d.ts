declare interface VSCodeApi {
    postMessage(arg: any): void;
}


declare function acquireVsCodeApi(): VSCodeApi;