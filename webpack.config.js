const mode = process.env.NODE_ENV || "development";

const path = p => require("path").resolve(__dirname, p);

module.exports = {
  mode,
  context: __dirname,
  entry: ["./client"],
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
