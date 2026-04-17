const http = require("http");

function requestJson({ path, method = "GET", payload = null, cookie = "" }) {
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
          let parsed = null;
          try {
            parsed = raw ? JSON.parse(raw) : null;
          } catch (error) {
            reject(new Error(`Could not parse JSON from ${method} ${path}: ${raw.slice(0, 200)}`));
            return;
          }
          resolve({
            status: res.statusCode,
            body: parsed,
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

function expect(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const stamp = Date.now();
  const students = [
    {
      displayName: "Rehearsal Alpha",
      username: `rehearsal_alpha_${stamp}`,
      password: "class123"
    },
    {
      displayName: "Rehearsal Bravo",
      username: `rehearsal_bravo_${stamp}`,
      password: "class123"
    }
  ];

  const studentSessions = [];
  for (const student of students) {
    const response = await requestJson({
      path: "/api/register",
      method: "POST",
      payload: student
    });
    expect(response.status === 201, `Expected student registration to succeed for ${student.username}`);
    studentSessions.push({ ...student, cookie: response.cookie, user: response.body.user });
  }

  const teacherLogin = await requestJson({
    path: "/api/admin/login",
    method: "POST",
    payload: { username: "teacher", password: "market-open" }
  });
  expect(teacherLogin.status === 200, "Teacher login failed.");
  const teacherCookie = teacherLogin.cookie;

  const openMarket = await requestJson({
    path: "/api/admin/market",
    method: "POST",
    cookie: teacherCookie,
    payload: { isOpen: true }
  });
  expect(openMarket.status === 200, "Opening the market failed.");
  expect(openMarket.body.market.isOpen === true, "Market did not report as open.");

  const alphaBuy = await requestJson({
    path: "/api/trade",
    method: "POST",
    cookie: studentSessions[0].cookie,
    payload: { ticker: "HHS", side: "buy", shares: 40 }
  });
  expect(alphaBuy.status === 200, "Alpha buy order failed.");

  const bravoBuyOne = await requestJson({
    path: "/api/trade",
    method: "POST",
    cookie: studentSessions[1].cookie,
    payload: { ticker: "MC", side: "buy", shares: 10 }
  });
  expect(bravoBuyOne.status === 200, "Bravo first buy order failed.");

  const bravoBuyTwo = await requestJson({
    path: "/api/trade",
    method: "POST",
    cookie: studentSessions[1].cookie,
    payload: { ticker: "WW", side: "buy", shares: 20 }
  });
  expect(bravoBuyTwo.status === 200, "Bravo second buy order failed.");

  const eventPublish = await requestJson({
    path: "/api/admin/event",
    method: "POST",
    cookie: teacherCookie,
    payload: {
      headline: "Rehearsal market shake-up",
      body: "A practice event jolts the fake market so we can validate the classroom flow end to end.",
      effects: [
        { ticker: "HHS", percentChange: 12 },
        { ticker: "MC", percentChange: -6 },
        { ticker: "WW", percentChange: 4 }
      ]
    }
  });
  expect(eventPublish.status === 200, "Teacher event publishing failed.");
  expect(eventPublish.body.events[0]?.headline === "Rehearsal market shake-up", "Latest event did not appear in feed.");

  const closeMarket = await requestJson({
    path: "/api/admin/market",
    method: "POST",
    cookie: teacherCookie,
    payload: { isOpen: false }
  });
  expect(closeMarket.status === 200, "Closing the market failed.");
  expect(closeMarket.body.market.isOpen === false, "Market did not report as closed.");

  const blockedTrade = await requestJson({
    path: "/api/trade",
    method: "POST",
    cookie: studentSessions[0].cookie,
    payload: { ticker: "HHS", side: "buy", shares: 1 }
  });
  expect(blockedTrade.status === 400, "Trade after market close should have been blocked.");

  const teacherBootstrap = await requestJson({
    path: "/api/bootstrap",
    cookie: teacherCookie
  });
  expect(teacherBootstrap.status === 200, "Teacher bootstrap fetch failed.");

  const leaderboard = teacherBootstrap.body.leaderboard || [];
  const alphaEntry = leaderboard.find((entry) => entry.username === students[0].username);
  const bravoEntry = leaderboard.find((entry) => entry.username === students[1].username);

  expect(alphaEntry, "Alpha student missing from leaderboard.");
  expect(bravoEntry, "Bravo student missing from leaderboard.");
  expect(alphaEntry.positionsCount >= 1, "Alpha should have at least one active position.");
  expect(bravoEntry.positionsCount >= 2, "Bravo should have two active positions.");

  const tradeFeed = teacherBootstrap.body.admin?.recentTrades || [];
  expect(
    tradeFeed.some((trade) => trade.username === students[0].username) &&
      tradeFeed.some((trade) => trade.username === students[1].username),
    "Recent trade feed did not include both rehearsal students."
  );

  console.log("Rehearsal complete.");
  console.log(`Students created: ${students.map((student) => student.username).join(", ")}`);
  console.log(`Leaderboard entries verified: ${alphaEntry.rank}, ${bravoEntry.rank}`);
  console.log(`Latest event: ${teacherBootstrap.body.events[0]?.headline}`);
  console.log(`Blocked trade after close: ${blockedTrade.body?.error || "yes"}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
