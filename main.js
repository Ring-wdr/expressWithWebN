const express = require("express");
const app = express();
const port = 3000;

const fs = require("fs");
const bodyParser = require("body-parser");
const compression = require("compression");
const helmet = require("helmet");
app.use(helmet);

const topicRouter = require("./routes/topic");
const indexRouter = require("./routes/index");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.get("*", (req, res, next) => {
  fs.readdir("./data", function (error, filelist) {
    req.list = filelist;
    next();
  });
});

app.use("/", indexRouter);
app.use("/topic", topicRouter);

app.use((req, res, next) => {
  res.status(404).send(`Sorry can't find path`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(`something **cked`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
