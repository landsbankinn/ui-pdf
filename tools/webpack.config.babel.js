const webpack = require("webpack");
const path = require("path");

const dev = path.resolve(__dirname, "../", "dev");
const src = path.resolve(__dirname, "../", "src");
const node_modules = path.resolve(__dirname, "../", "node_modules");

module.exports = {
  context: path.resolve(__dirname, "../"),

  entry: {
    app: `${dev}/index.jsx`,
  },

  output: {
    path: dev,
    filename: "bundle.js",
  },

  resolve: {
    extensions: [".js", ".jsx"],
    modules: [src, node_modules],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
  ],
  module: {
    // noParse: node_modules, // expect we don't have to parse node_modules
    rules: [
      {
        test: /\.(css)$/, // Check for sass or scss file names
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },

  devServer: {
    open: true, // to open the local server in browser
    static: dev,
    // publicPath: dev,
    compress: true,
    port: 9000,
    liveReload: true,
  },
};
