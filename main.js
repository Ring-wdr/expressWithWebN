const express = require("express");
const app = express();
const port = 3000;

const fs = require("fs");
const qs = require("querystring");
const path = require("path");
const template = require("./lib/template");
const sanitizeHtml = require("sanitize-html");

app.get("/", (req, res) => {
  fs.readdir("./data", function (error, filelist) {
    const title = "Welcome";
    const description = "Hello, Node.js";
    const list = template.list(filelist);
    const html = template.HTML(
      title,
      list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>`
    );
    res.send(html);
  });
});

app.get("/page/:pageId", (req, res) => {
  fs.readdir("./data", function (error, filelist) {
    const filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
      const title = req.params.pageId;
      const sanitizedTitle = sanitizeHtml(title);
      const sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ["h1"],
      });
      const list = template.list(filelist);
      const html = template.HTML(
        sanitizedTitle,
        list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/create">create</a>
          <a href="/update/${sanitizedTitle}">update</a>
          <form action="/delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>`
      );
      res.send(html);
    });
  });
});

app.get("/create", (req, res) => {
  fs.readdir("./data", (error, filelist) => {
    const title = "WEB - create";
    const list = template.list(filelist);
    const html = template.HTML(
      title,
      list,
      `
        <form action="/create" method="post">
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
});

app.post("/create", (req, res) => {
  var body = "";
  req.on("data", (data) => {
    body += data;
  });
  req.on("end", () => {
    const post = qs.parse(body);
    const title = post.title;
    const description = post.description;
    fs.writeFile(`data/${title}`, description, "utf8", function (err) {
      // res.writeHead(302, { location: `/page/${title}` });
      // res.end();
      res.redirect(`/page/${title}`);
    });
  });
});

app.get("/update/:pageId", (req, res) => {
  fs.readdir("./data", function (error, filelist) {
    const filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
      const title = req.params.pageId;
      const list = template.list(filelist);
      const html = template.HTML(
        title,
        list,
        `
          <form action="/update" method="post">
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
        `<a href="/create">create</a> <a href="/update/${title}">update</a>`
      );
      res.send(html);
    });
  });
});

app.post("/update", (req, res) => {
  var body = "";
  req.on("data", (data) => {
    body += data;
  });
  req.on("end", function () {
    const post = qs.parse(body);
    const id = post.id;
    const title = post.title;
    const description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function (error) {
      fs.writeFile(`data/${title}`, description, "utf8", function (err) {
        // res.writeHead(302, { Location: `/page/${title}` });
        // res.end();
        res.redirect(`/page/${title}`);
      });
    });
  });
});

app.post("/delete_process", (req, res) => {
  var body = "";
  req.on("data", function (data) {
    body = body + data;
  });
  console.log(body);
  req.on("end", function () {
    const post = qs.parse(body);
    const id = post.id;
    const filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function (error) {
      // res.writeHead(302, { Location: `/` });
      // res.end();
      res.redirect("/");
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// var http = require('http');
// var url = require('url');
// var template = require('./lib/template.js');

// var app = http.createServer(function(request,response){
//     var _url = request.url;
//     var queryData = url.parse(_url, true).query;
//     var pathname = url.parse(_url, true).pathname;
//     if(pathname === '/'){
//       if(queryData.id === undefined){
//         implemented!!!
//       } else {
//         implemented!!!
//       }
//     } else if(pathname === '/create'){
//         implemented!!!
//     } else if(pathname === '/create_process'){
//         implemented!!!
//     } else if(pathname === '/update'){
//         implemented!!!
//     } else if(pathname === '/update_process'){
//         implemented!!!
//     } else if(pathname === '/delete_process'){
//         implemented!!!
//     } else {
//   response.writeHead(404);
//   response.end('Not found');
// }
// });
// app.listen(3000);
