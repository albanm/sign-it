const webpack = require('webpack')

// cf https://vuejs.org/v2/guide/deployment.html
const prodPlugin = new webpack.DefinePlugin({ 'process.env': { NODE_ENV: '"production"' } })

module.exports = {
  entry: './public/app.js',
  output: {
    filename: 'app.js',
    path: './public/bundles',
    publicPath: './bundles/',
    chunkFilename: process.env.NODE_ENV !== 'development' ? '[name].[hash].app.js' : '[name].app.js'
  },
  module: {
    loaders: [{
      test: /\.vue$/,
      loader: 'vue-loader'
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015']
      }
    }, {
      test: /\.css$/,
      loader: process.env.NODE_ENV !== 'development' ? 'style-loader!css-loader?minimize' : 'style-loader!css-loader'
    }, {
      test: /\.less$/,
      loader: process.env.NODE_ENV !== 'development' ? 'style-loader!css-loader?minimize!less-loader' : 'style-loader!css-loader?-minimize!less-loader'
    }, {
      test: [/flags\/(1x1|4x3)\/.*\.svg$/, /moment\/locale\/(?!fr)/],
      exclude: /flags\/(1x1|4x3)\/(gb|fr)\.svg$/,
      loader: 'ignore-loader'
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }, {
      test: [/assets\/.*$/, /\.png$/, /\.svg$/],
      loader: 'file-loader'
    }]
  },
  devtool: process.env.NODE_ENV !== 'development' ? 'source-map' : 'eval',
  plugins: process.env.NODE_ENV !== 'development' ? [ new webpack.optimize.UglifyJsPlugin(), prodPlugin ] : []
}
