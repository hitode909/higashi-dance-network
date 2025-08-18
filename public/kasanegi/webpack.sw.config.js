const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
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
  target: 'webworker',
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../'),
    clean: false
  }
};