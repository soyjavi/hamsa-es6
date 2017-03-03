const { join } = require('path');

const isDevelop = process.env.NODE_ENV !== 'production';

module.exports = {
  context: join(__dirname, '/src'),
  entry: {
    app: './hamsa.js',
  },
  output: {
    path: join(__dirname, '/dist'),
    filename: 'index.js',
  },
  devServer: {
    open: true,
    contentBase: join(__dirname, '/spec'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader',
          options: { presets: ['es2015', 'stage-0'] },
        }],
      },
    ],
  },
  devtool: isDevelop ? 'eval-source-map' : 'source-map',
};
