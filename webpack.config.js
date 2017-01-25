/* eslint-disable */

const debug = process.env.NODE_ENV !== "production";
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const node_dir = __dirname + '/node_modules';
const path = require('path');
const plugins = debug ? [
  new ExtractTextPlugin('[name].css'),
  new webpack.ProvidePlugin({
    $: "jquery",
    jQuery: "jquery"
  })
] : [
  new ExtractTextPlugin('[name].css'),
  new webpack.ProvidePlugin({
    $: "jquery",
    jQuery: "jquery"
  })
];

module.exports = {
  entry: {
    villain: [
      './app/styles/villain.scss',
      './app/js/villain.js',
    ],
  },
  output: {
    path: './dist',
    filename: '[name].all.js',
    library: 'Villain',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },

  target: 'web',

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          'presets': [
            ['es2015', { 'modules': false }],
          ],
        }
      }, {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          loader: [
            {
              loader: 'css-loader',
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [autoprefixer({ browsers: ['last 2 versions'] })],
              },
            },
            {
              loader: 'sass-loader',
            },
          ],
        }),
      }, {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          loader: 'css-loader',
        }),
      }, {
        test: /\.(woff|woff2|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          publicPath: '../',
          name: 'fonts/[name].[ext]',
        },
      },
    ],
  },
  plugins: plugins,
  resolve: {
    alias: {},
    modules: [
      path.join(__dirname, 'app/js'),
      'node_modules',
    ],
  },
};
