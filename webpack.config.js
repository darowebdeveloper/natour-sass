const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src/js/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
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
        test: /\.(sass|scss|css)$/,
        exclude: /\.module.(s(a|c)ss)$/,
        loader: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              postcssOptions: {
                plugins: [require('autoprefixer')],
              },
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
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/webfonts',
            },
          },
        ],
      },
      {
        test: /\.(jpg|jpeg|png|gif|mp3|mp4|webm)$/gi,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[hash].[ext]',
            outputPath: 'assets/images',
          },
        },
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
