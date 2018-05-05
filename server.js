const http = require("http");

const express = require("express");
const expressHandlebars = require("express-handlebars");

const bootstrapPackage = require("bootstrap/package.json");
const bootstrapCss = require.resolve("bootstrap/" + bootstrapPackage.style);

const app = express();

const config = {
  prod: app.get("env") === "production",
  port: process.env.PORT || 1987
};

app.set("trust proxy", 1);
app.engine("handlebars", expressHandlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.get("/bootstrap.min.css", (req, res) => res.sendFile(bootstrapCss));
app.use("/", express.static("public"));

app.use((req, res) => {
  res.status(404);
  res.render("404");
});

app.use((err, req, res, next) => {
  if (!err) return next();

  res.status(500);
  res.render("500", {
    error: err.message,
    stack: config.prod ? "" : err.stack
  });
});

const server = http.createServer(app);
server.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log("Listening on http://localhost:%d", config.port);
});
