
export interface LogMessage {
    type: "log";
    message: string
}

// カラーコード
export interface ColorCode {
    red: number;
    green: number;
    blue: number;
}

// カーソルのカラーコードを伝えるメッセージ
export interface CursorColorMessage {
    type: "cursor-color";
    color: ColorCode | null;
}

// WebViewからカラーコード変更を伝えるメッセージ
export interface ChangeColorMessage {
    type: "change-color";
    newColor: ColorCode;
}
