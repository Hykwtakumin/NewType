const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackOnBuildPlugin = require('on-build-webpack');
const exec = require('child_process').execSync;


let plugins = [
    new CopyWebpackPlugin([
        {from: './src/option/option.html', to: 'option/option.html'},
        {from: './src/popup/popup.html', to: 'popup/popup.html'},
        {from: './src/libs/linda.js', to: "libs/linda.js"},
        {from: './src/libs/socket.io.js', to: "libs/socket.io.js"},
        {from: './src/icons/icon.png', to: 'icons/icon.png'},
        {from: './src/manifest.json'}
    ]),
    new WebpackOnBuildPlugin(() => {
        exec('mv dist/common/popup.js dist/common/popup/');
        exec('mv dist/common/option.js dist/common/option/');
    })
];


module.exports = {
    devtool: 'inline-source-map',
    entry: {
        background: ['chrome-browser-object-polyfill', 'babel-polyfill', './src/background.js'],
        content: ['chrome-browser-object-polyfill', 'babel-polyfill', './src/content.js'],
        option: ['chrome-browser-object-polyfill', 'babel-polyfill', './src/option/option.js'],
        popup: ['chrome-browser-object-polyfill', 'babel-polyfill', './src/popup/popup.js']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/common')
    },
    target: 'web',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    presets: [['env', {'modules': false}]]
                }
            }
        ]
    }, resolve: {
        modules: [
            "node_modules"
        ]
    },
    plugins
};