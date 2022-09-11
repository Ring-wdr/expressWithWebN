import express from "express";
const router = express.Router();
import * as template from "../lib/template.js";

router.get("/", (req, res) => {
  const title = "Welcome";
  const description = "Hello, Node.js";
  const list = template.list(req.list);
  const html = template.HTML(
    title,
    list,
    `<h2>${title}</h2>${description}
      <img src="/images/hello.jpg"
          style="width: 50%;
                 display: block;
                 margin-top: 10px">`,
    `<a href="/topic/create">create</a>`
  );
  res.send(html);
});

export default router;
