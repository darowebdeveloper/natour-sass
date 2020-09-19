// Get the current npm script that just executed
const currentTask = process.env.npm_lifecycle_event;

const path = require('path');
// npm install clean-webpack-plugin --save-dev
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// npm install mini-css-extract-plugin --save-dev
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// npm install html-webpack-plugin --save-dev
const HtmlWebpackPlugin = require('html-webpack-plugin');
// npm in fs-extra --save-dev
const fse = require('fs-extra');
// PostCSS plugins for webpack...
// npm i all of the following --save-dev
const postCSSPlugins = [require('autoprefixer')];
// Our own webpack plugin to copy images to the dist folder
class RunAfterCompile {
  apply(compiler) {
    compiler.hooks.done.tap('Copy images', () => {
      // To host on github we need to name the folder to docs not dist
      // fse.copySync('./app/assets/images', './dist/assets/images');
      fse.copySync('./src/img', './docs/img');
    });
  }
}

let cssConfig = {
  test: /\.(sass|scss|css)$/,
  exclude: /\.module.(s(a|c)ss)$/,
  use: [
    {
      loader: 'css-loader',
      options: {
        url: (url, resourcePath) => {
          // resourcePath - path to css file

          // Don't handle `img.png` urls
          if (/\.(jpg|jpeg|png|gif|mp3|mp4|webm)$/gi.test(url)) {
            return false;
          }

          return true;
        },
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        sourceMap: true,
        postcssOptions: {
          plugins: postCSSPlugins,
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
};
// Get all the files in ./app folder used in the config.plugins
let pages = fse
  .readdirSync('./src')
  .filter((file) => {
    return file.endsWith('.html');
  })
  .map((page) => {
    return new HtmlWebpackPlugin({
      filename: page,
      template: `./src/${page}`,
    });
  });
let config = {
  entry: path.resolve(__dirname, 'src/js/index.js'),
  // Add webpack plugins to render the html files
  plugins: pages,
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
      cssConfig,
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
    ],
  },
  resolve: {
    extensions: ['.js', '.scss'],
  },
};

if (currentTask == 'dev') {
  cssConfig.use.unshift(
    // npm i style-loader --save-dev for parsing styles in browsers & in App.js
    'style-loader',
  );
  // After bundling what the name and location
  config.output = {
    // Name after bundling
    filename: 'bundled.js',
    // Absolute location to store the bundled by using path.resolve
    path: path.resolve(__dirname, 'src'),
  };
  // Use devSErver -> npm i webpack-dev-server --save-dev => "script":{"dev":"webpack-dev-server"}
  config.devServer = {
    // Watch & reload the changes made to html files
    before: function (app, server) {
      server._watch('./src/**/*.html');
    },
    // Where to serve to the output bundled directory by using path.join
    contentBase: path.join(__dirname, 'src'),
    // Use hot module replacing (inject css & js) <=> need to add module.hot in the App.js file
    hot: true,
    port: 3300,
    // For local hosting with local network
    host: '0.0.0.0',
  };
  // Required by webpack
  config.mode = 'development';
}

if (currentTask == 'build') {
  // Use babel loader to ensure old browser compatability
  // npm install @babel/core @babel/preset-env babel-loader --save-dev
  // config.module.rules.push({
  //   test: /\.js$/,
  //   exclude: /(node_modules)/,
  //   use: {
  //     loader: 'babel-loader',
  //     options: {
  //       presets: ['@babel/preset-env']
  //     }
  //   }
  // }); // Before adding React.js
  // Extract css to its own files
  cssConfig.use.unshift(MiniCssExtractPlugin.loader);
  // npm install cssnano --save-dev to minify the css extracted files
  postCSSPlugins.push(require('cssnano'));
  // After bundling what the name and location
  config.output = {
    // Name after bundling
    // Dealing with browser caching with filename and chunkFilename
    filename: '[name].[chuckhash].js',
    chunkFilename: '[name].[chuckhash].js',
    // Absolute location to store the bundled by using path.resolve
    // To host on github we need to name the folder to docs not dist
    // path: path.resolve(__dirname, "dist"),
    path: path.resolve(__dirname, 'docs'),
  };
  // Required by webpack
  config.mode = 'production';
  // Split vendor codes, our codes to separate files
  config.optimization = {
    splitChunks: {
      chunks: 'all',
    },
  };
  config.plugins.push(
    // Remove old files so only new files
    new CleanWebpackPlugin(),
    // Create the plugin
    new MiniCssExtractPlugin({ filename: 'styles.[chunkhash].css' }),
    // Create our own plugin
    new RunAfterCompile(),
  );
}
// Export the {} for webpack npm i webpack webpack-cli --save-dev
// Inside package.json => "script": {"dev":"webpack"} for no webpack-dev-server
module.exports = config;
