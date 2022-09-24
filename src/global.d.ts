declare interface VSCodeAPI {
    postMessage(arg: any): void;
    getState<T>(): T | undefined;
    setState<T>(state: T): void;
}


declare function acquireVsCodeApi(): VSCodeAPI;
