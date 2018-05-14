const mode = process.env.NODE_ENV || "development";
const dev = mode === "development";

const path = p => require("path").resolve(__dirname, p);

module.exports = {
  mode,
  context: __dirname,
  entry: [
    "./client",
    // error handling overlay in dev mode
    dev && "@glenjamin/webpack-hot-client-overlay"
  ].filter(Boolean),
  devtool: dev ? "cheap-module-eval-source-map" : "source-map",
  output: {
    publicPath: "/",
    path: path("./dist"),
    filename: "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path("./client"),
        use: "babel-loader"
      }
    ]
  }
};
