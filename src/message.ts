
export interface LogMessage {
    type: "log";
    message: string
}

export interface CursorColorMessage {
    type: "cursor-color";
    color: string
}

export interface ChangeColorMessage {
    type: "change-color";
    newColor: string
}


export type WebView2ExtensionMessage = LogMessage;
export type Extension2WebViewMessage = CursorColorMessage;
