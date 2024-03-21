const path = require('path');

module.exports = {
  entry: './server.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  resolve: {
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "url": require.resolve("url/"),
      "http": require.resolve("stream-http"),
      "tty": false // No need for a polyfill for "tty"
    }
  },
};
