import express from "express";
const app = express();
const port = 3000;

import { promises as fs } from "fs";

import bodyParser from "body-parser";
import compression from "compression";

// const helmet = require("helmet");
// app.use(helmet);

import indexRouter from "./routes/index.js";
import topicRouter from "./routes/topic.js";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.get("*", (req, res, next) => {
  async function getList() {
    try {
      req.list = await fs.readdir("./data");
      next();
    } catch (err) {
      next(err);
    }
  }
  getList();
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
