// カラーコード
export interface ColorCode {
    red: number;
    green: number;
    blue: number;
}

export function makeColorCodeText(color: ColorCode): string {
    // 16進数変換
    function number2hex(n: number): string {
        const hex = n.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }

    const red = number2hex(color.red);
    const green = number2hex(color.green);
    const blue = number2hex(color.blue);
    return `#${red}${green}${blue}`;
};
