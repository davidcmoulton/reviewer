/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const parts = require('./webpack.parts');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const HtmlInjectNewRelicPlugin = require('./webpack/html-inject-newrelic');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const commonConfig = merge([
    {
        entry: './index.tsx',
        plugins: [
            new HtmlWebPackPlugin({
                template: 'index.html',
                filename: 'index.html',
            }),
            new HtmlInjectNewRelicPlugin({
                license: process.env.NEW_RELIC_CLIENT_LICENSE_KEY,
                applicationID: process.env.NEW_RELIC_CLIENT_APP_ID,
            }),
            new webpack.DefinePlugin({
                API_HOST: JSON.stringify(`${process.env.CLIENT_API_URL}:${process.env.CLIENT_PORT}`),
            })
        ],
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json'],
        },
    },
]);

const developmentConfig = merge([
    parts.output({ filename: 'bundle.js' }),
    parts.devServer(),
    parts.loaders(),
    parts.generateSourceMaps({ type: 'eval' })
]);

const productionConfig = merge([
    parts.output({ filename: '[name].[contenthash].js' }),
    parts.clean(),
    parts.loaders(),
    parts.minifyCSS(),
    parts.minifyJS(),
    parts.splitBundles(),
    parts.generateSourceMaps({ type: 'source-map' })
]);

module.exports = mode => {
    if (mode === 'production') {
        return merge(commonConfig, productionConfig, { mode })
    } else {
        return merge(commonConfig, developmentConfig, { mode })
    }
}


