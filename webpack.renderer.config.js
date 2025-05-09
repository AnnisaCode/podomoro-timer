const rules = require('./webpack.rules');
const path = require('path');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

rules.push({
  test: /\.(png|jpe?g|gif|svg|mp3|wav)$/i,
  type: 'asset/resource',
});

module.exports = {
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.json', '.node']
  },
};