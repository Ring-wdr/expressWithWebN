const express = require("express");
const app = express();
const port = 3000;

const fs = require("fs");
const qs = require("querystring");
const path = require("path");
const template = require("./lib/template");
const sanitizeHtml = require("sanitize-html");
const bodyParser = require("body-parser");
const compression = require("compression");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.get("*", (req, res, next) => {
  fs.readdir("./data", function (error, filelist) {
    req.list = filelist;
    next();
  });
});

app.get("/", (req, res) => {
  const title = "Welcome";
  const description = "Hello, Node.js";
  const list = template.list(req.list);
  const html = template.HTML(
    title,
    list,
    `<h2>${title}</h2>${description}
    <img src="/images/hello.jpg" style="width: 50%; display: block; margin-top:10px">`,
    `<a href="/topic/create">create</a>`
  );
  res.send(html);
});

app.get("/topic/create", (req, res) => {
  const title = "WEB - create";
  const list = template.list(req.list);
  const html = template.HTML(
    title,
    list,
    `
        <form action="/topic/create" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
    ""
  );
  res.send(html);
});

app.get("/topic/:pageId", (req, res, next) => {
  const filteredId = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
    if (err) {
      next(err);
    } else {
      const title = req.params.pageId;
      const sanitizedTitle = sanitizeHtml(title);
      const sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ["h1"],
      });
      const list = template.list(req.list);
      const html = template.HTML(
        sanitizedTitle,
        list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/topic/create">create</a>
          <a href="/topic/update/${sanitizedTitle}">update</a>
          <form action="/topic/delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>`
      );
      res.send(html);
    }
  });
});

app.post("/topic/create", (req, res) => {
  const post = req.body;
  const title = post.title;
  const description = post.description;
  fs.writeFile(`data/${title}`, description, "utf8", (err) => {
    res.redirect(`/topic/${title}`);
  });
});

app.get("/topic/update/:pageId", (req, res) => {
  const filteredId = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
    const title = req.params.pageId;
    const list = template.list(req.list);
    const html = template.HTML(
      title,
      list,
      `
      <form action="/topic/update" method="post">
        <input type="hidden" name="id" value="${title}">
        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
        <p>
          <textarea name="description" placeholder="description">${description}</textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `,
      `<a href="/topic/create">create</a>
      <a href="/topic/update/${title}">update</a>`
    );
    res.send(html);
  });
});

app.post("/topic/update", (req, res) => {
  const post = req.body;
  const id = post.id;
  const title = post.title;
  const description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, (error) => {
    fs.writeFile(`data/${title}`, description, "utf8", (err) => {
      res.redirect(`/topic/${title}`);
    });
  });
});

app.post("/topic/delete_process", (req, res) => {
  const post = req.body;
  const id = post.id;
  const filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, (error) => {
    res.redirect("/");
  });
});

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
