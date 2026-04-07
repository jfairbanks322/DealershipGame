const http = require("http");

function requestJson(path, method, payload, cookie = "") {
  return new Promise((resolve, reject) => {
    const body = payload ? JSON.stringify(payload) : "";
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: 3000,
        path,
        method,
        headers: {
          ...(body
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body)
              }
            : {}),
          ...(cookie ? { Cookie: cookie } : {})
        }
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            body: raw ? JSON.parse(raw) : null,
            cookie: res.headers["set-cookie"]?.[0] || cookie
          });
        });
      }
    );

    req.on("error", reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function main() {
  const username = `watchdemo${Date.now()}`;
  const register = await requestJson("/api/register", "POST", {
    displayName: "Watch Demo",
    username,
    password: "class123"
  });

  console.log("REGISTER", register.status, username);

  const watch = await requestJson(
    "/api/watchlist",
    "POST",
    { ticker: "HHS", watching: true },
    register.cookie
  );
  console.log("WATCH", watch.status, watch.body?.user?.watchlist?.map((item) => item.ticker).join(","));

  const bootstrap = await requestJson("/api/bootstrap", "GET", null, register.cookie);
  console.log("BOOT", bootstrap.status, bootstrap.body?.user?.watchlist?.map((item) => item.ticker).join(","));

  const watchlist = bootstrap.body?.user?.watchlist || [];
  if (!watchlist.some((item) => item.ticker === "HHS")) {
    throw new Error("HHS was not persisted in the student watchlist.");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
