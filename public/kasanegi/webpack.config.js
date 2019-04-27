const path = require('path');

module.exports = {
  entry: {
    'bundle': './src/main.ts',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  },

  target: 'web',

  resolve: {
    extensions: [ '.ts']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'js')
  }
};