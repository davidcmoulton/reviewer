const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');

exports.devServer = () => ({
    devServer: {
        stats: 'errors-only',
        host: process.env.HOST,
        historyApiFallback: true,
        port: process.env.CLIENT_PORT,
        open: true,
        overlay: true,
        hot: true,
        proxy: {
            [process.env.CLIENT_API_PROXY_ENDPOINT]: {
                target: `${process.env.CLIENT_API_PROXY_URL}:${process.env.SERVER_PORT}`,
                changeOrigin: true,
            },
        },
    },
});

exports.loaders = () => ({
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {loader: 'style-loader', options: {sourceMap: true}},
                    {loader: 'css-loader', options: {sourceMap: true}},
                    {loader: 'sass-loader', options: {sourceMap: true}},
                ]
            },
            {
                test: /\.ts(x?)$/,
                use: [
                    {
                        loader: 'awesome-typescript-loader',
                    },
                ],
                exclude: /node_modules/,
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader',
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                    },
                ],
            },
        ],
    },
});

exports.clean = () => ({
    plugins: [new CleanWebpackPlugin()],
});


exports.minifyCSS = () => ({
    plugins: [
        new OptimizeCssAssetsPlugin({
            cssProcessor: cssnano,
            cssProcessorOptions: {
                discardComments: {
                    removeAll: true,
                },
                safe: true,
            },
            canPrint: false,
        }),
    ],
})

exports.minifyJS = () => ({
    optimization: {
        minimizer: [new TerserPlugin({ sourceMap: true })],
    }
})