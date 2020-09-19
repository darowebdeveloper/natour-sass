const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src/js/index.js'),
  output: {
    path: path.resolve(__dirname, 'src'),
    filename: 'bundled.js',
  },
  devServer: {
    before: (app, server) => {
      server._watch('./src/**/*.html');
    },
    contentBase: path.join(__dirname, 'src'),
    port: 3300,
    hot: true,
    host: '0.0.0.0',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.module\.s(a|c)ss$/,
        loader: [
          'style-loader',
          {
            loader: 'css-loader?url=false',
            options: {
              modules: true,
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        loader: [
          'style-loader',
          'css-loader?url=false',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.scss'],
  },
  plugins: [
    // new MiniCssExtractPlugin({
    //   filename: isDevelopment ? '[name].css' : '[name].[hash].css',
    //   chunkFilename: isDevelopment ? '[id].css' : '[id].[hash].css',
    // }),
  ],
};
