//@ts-check

"use strict";

const path = require("path");

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */

const extensionConfig = {
    target: "web",
    mode: "none",

    entry: "./src/webview.ts",
    output: {
        path: path.resolve(__dirname, "webview"),
        filename: "main.js",
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                    },
                ],
            },
        ],
    },
    devtool: "nosources-source-map",
    infrastructureLogging: {
        level: "log",
    },
};
module.exports = [extensionConfig];
