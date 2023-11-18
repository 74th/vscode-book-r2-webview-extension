import { ColorCode } from "./colorCode";

export interface LogMessage {
    type: "log";
    message: string
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
