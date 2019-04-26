const path = require('path');

module.exports = {
  entry: {
    'bundle': './src/main.ts',
    'kasanegi-service-worker': './src/ServiceWorker.ts',
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

  devtool: 'source-map',

  resolve: {
    extensions: [ '.ts']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'js')
  }
};