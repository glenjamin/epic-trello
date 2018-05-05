const http = require("http");

const express = require("express");
const expressHandlebars = require("express-handlebars");

const app = express();

const config = {
  prod: app.get("env") === "production",
  port: process.env.PORT || 1987,
  trelloApiKey: process.env.TRELLO_API_KEY
};

app.locals = {
  trelloApiKey: config.trelloApiKey
};

app.set("trust proxy", 1);
app.engine("handlebars", expressHandlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Static Assets
Object.entries({
  "bootstrap.min.css": "bootstrap/dist/css/",
  "bootstrap.min.css.map": "bootstrap/dist/css/",
  "jquery.slim.min.js": "jquery/dist/",
  "jquery.slim.min.map": "jquery/dist/"
}).map(([file, source]) => {
  const fullSource = require.resolve(source + file);
  app.get("/" + file, (req, res) => res.sendFile(fullSource));
});
app.use("/", express.static("public"));

// The app code
app.get("/", (req, res) => {
  res.render("main");
});

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
