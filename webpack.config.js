const path = require('path');
var pkg = require('./package.json');
const webpack = require('webpack');


module.exports = {
  context: __dirname,

  watch: true,

  resolve: {
    extensions: ['', '.js', '.json'],
    modulesDirectories: [
      'node_modules',
      path.resolve(__dirname, './node_modules')
    ]
  },

  entry: {
    // core: './source/hamsa.js',
    test: './spec/test.js',
  },

  output: {
    path: './build',
    filename: pkg.name + '.[name].js'
  },

  module: {
    loaders: [
      {
        test: /(\.js)$/,
        exclude: /(node_modules)/,
        loader: 'babel',
        query: { presets: ['es2015', 'stage-0'] }
      }
    ]
  }
};
