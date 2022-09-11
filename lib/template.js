const HTML = (title, list, body, control) =>
  `
<!doctype html>
<html>
<head>
  <title>WEB1 - ${title}</title>
  <meta charset="utf-8">
</head>
<body>
  <h1><a href="/">WEB</a></h1>
  ${list}
  ${control}
  ${body}
</body>
</html>
`;

const list = (filelist) =>
  `
<ul>
  ${[...filelist].reduce(
    (list, file) => list + `<li><a href="/topic/${file}">${file}</a></li>`,
    ""
  )}
</ul>
`;
export { HTML, list };
