import express from "express";
const router = express.Router();

import { promises as fs } from "fs";
import path from "path";
import sanitizeHtml from "sanitize-html";

import * as template from "../lib/template.js";

router.get("/create", (req, res) => {
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

router.get("/:pageId", (req, res, next) => {
  const filteredId = path.parse(req.params.pageId).base;
  fs.readFile(`./data/${filteredId}`, "utf8")
    .then((description) => {
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
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/create", (req, res) => {
  const post = req.body;
  const title = post.title;
  const description = post.description;
  fs.writeFile(`data/${title}`, description, "utf8")
    .then(() => {
      res.redirect(`/topic/${title}`);
    })
    .catch((err) => {
      throw err;
    });
});

router.get("/update/:pageId", (req, res) => {
  const filteredId = path.parse(req.params.pageId).base;
  async function update() {
    const description = await fs.readFile(`data/${filteredId}`, "utf8");
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
  }
  update();
});

router.post("/update", (req, res) => {
  const post = req.body;
  const id = post.id;
  const title = post.title;
  const description = post.description;
  fs.rename(`data/${id}`, `data/${title}`)
    .then(() => fs.writeFile(`data/${title}`, description, "utf8"))
    .then(() => {
      res.redirect(`/topic/${title}`);
    })
    .catch((err) => {
      throw err;
    });
});

router.post("/delete_process", (req, res) => {
  const post = req.body;
  const id = post.id;
  const filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`)
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      throw err;
    });
});

export default router;
