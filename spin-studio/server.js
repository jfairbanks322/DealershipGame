"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT) || 4173;
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = __dirname;
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

const server = http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host || HOST}`).pathname);
  } catch (_error) {
    send(response, 400, "Bad request", "text/plain; charset=utf-8");
    return;
  }

  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(ROOT, `.${requestedPath}`);
  if (!filePath.startsWith(`${ROOT}${path.sep}`)) {
    send(response, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      send(response, 404, "Not found", "text/plain; charset=utf-8");
      return;
    }

    response.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    fs.createReadStream(filePath).pipe(response);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Spin Studio is running at http://${HOST}:${PORT}`);
});

function send(response, status, body, contentType) {
  response.writeHead(status, { "Content-Type": contentType });
  response.end(body);
}
