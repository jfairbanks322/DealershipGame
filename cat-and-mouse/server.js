const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT || 8787);
const distDir = path.join(__dirname, "dist");
const games = new Map();

function send(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(payload));
}

function sendStatic(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
  };

  fs.readFile(filePath, (error, data) => {
    if (error) {
      send(res, 404, { error: "File not found" });
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream"
    });
    res.end(data);
  });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 5; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return games.has(code) ? makeCode() : code;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    send(res, 200, { ok: true });
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  try {
    if (req.method === "GET" && url.pathname === "/health") {
      send(res, 200, { ok: true, activeGames: games.size });
      return;
    }

    if (req.method === "POST" && url.pathname === "/games") {
      const body = await readJson(req);
      if (!body.game) {
        send(res, 400, { error: "Missing game payload" });
        return;
      }

      const caseCode = makeCode();
      games.set(caseCode, { game: body.game, updatedAt: Date.now() });
      send(res, 201, { caseCode, game: body.game });
      return;
    }

    const match = url.pathname.match(/^\/games\/([A-Z0-9]+)$/);
    if (match && req.method === "GET") {
      const caseCode = match[1].toUpperCase();
      const record = games.get(caseCode);
      if (!record) {
        send(res, 404, { error: "Case not found" });
        return;
      }
      send(res, 200, { caseCode, game: record.game });
      return;
    }

    if (match && req.method === "PUT") {
      const caseCode = match[1].toUpperCase();
      if (!games.has(caseCode)) {
        send(res, 404, { error: "Case not found" });
        return;
      }

      const body = await readJson(req);
      if (!body.game) {
        send(res, 400, { error: "Missing game payload" });
        return;
      }

      games.set(caseCode, { game: body.game, updatedAt: Date.now() });
      send(res, 200, { caseCode, game: body.game });
      return;
    }

    if (req.method === "GET") {
      const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
      const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
      const staticPath = path.join(distDir, safePath);

      if (staticPath.startsWith(distDir) && fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
        sendStatic(res, staticPath);
        return;
      }

      const indexPath = path.join(distDir, "index.html");
      if (fs.existsSync(indexPath)) {
        sendStatic(res, indexPath);
        return;
      }
    }

    send(res, 404, { error: "Not found" });
  } catch (error) {
    send(res, 500, { error: error instanceof Error ? error.message : "Unknown server error" });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Cat and Mouse multiplayer server listening on http://0.0.0.0:${port}`);
});
