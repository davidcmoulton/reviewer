const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: ['webpack/hot/poll?100', './src/client/index.tsx'],
  watch: true,
  watchOptions: {
    ignored: path.join(__dirname, 'dist')
  },
  target: 'web',
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?100'],
    }),
  ],
  module: {
    rules: [
      {
        include: path.join(__dirname, 'src', 'client'),
        // exclude: path.join(__dirname, 'dist'),
        test: /.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }      
    ],
  },
  mode: 'development',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [new webpack.HotModuleReplacementPlugin(), new HtmlWebPackPlugin({
    template: "./index.html",
    filename: "./index.html"
  })],
  output: {
    path: path.join(__dirname, 'dist/client'),
    filename: 'bundle.js',
  },
};