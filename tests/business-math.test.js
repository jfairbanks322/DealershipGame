"use strict";
const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  os = require("node:os"),
  path = require("node:path");
const { catalog, promotions } = require("../lib/catalog"),
  { badges } = require("../lib/achievements"),
  { pricing, newPlayer, simulate, deal } = require("../lib/game"),
  { createApp } = require("../server");
test("catalog progression and 50 distinct achievements", () => {
  assert.equal(catalog.length, 34);
  assert.equal(badges.length, 50);
  assert.equal(new Set(badges.map((x) => x.name)).size, 50);
  assert.equal(promotions.length, 11);
  for (let r = 1; r <= 10; r++)
    assert.equal(
      catalog.filter((x) => x.round <= r).length,
      r === 1 ? 5 : 10 + (r - 2) * 3,
    );
});
test("math gate, once-per-round penalty, and cent rounding", () => {
  const p = newPlayer({ id: "a", name: "A", badges: [] }, "A", "🍔", "#da583b");
  const g = { round: 6, phase: "planning", penalty: 500 };
  const b = { id: "1", markup: "33.33", amount: "0", price: "0" };
  assert.equal(pricing(g, p, b).penalty, 500);
  assert.equal(pricing(g, p, b).penalty, 0);
  assert.equal(p.menu.length, 0);
  assert.equal(
    pricing(g, p, { ...b, amount: ".80", price: "3.20" }).correct,
    true,
  );
  assert.deepEqual(p.wrongRounds, [6]);
  assert.equal(p.menu[0].price, 320);
  assert.throws(() => pricing(g, p, { ...b, markup: "Infinity" }));
});
test("promotion accounting includes every free unit and fee", () => {
  const p = {
    menu: [
      { id: "1", price: 350 },
      { id: "5", price: 300 },
    ],
    promotion: { id: "bogo", target: "1" },
  };
  let d = deal(p, p.menu[0]);
  assert.equal(d.revenue, 350);
  assert.equal(d.cost, 480);
  assert.equal(d.units, 2);
  p.promotion = { id: "freeSide", target: "1", companion: "5" };
  d = deal(p, p.menu[0]);
  assert.equal(d.cost, 400);
  assert.equal(d.revenue, 350);
  p.promotion = { id: "ad", target: "1" };
  assert.equal(deal(p, p.menu[0]).fee, 1500);
});
test("complete two-player game, auth, privacy, saves, restart, and career records", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "business-math-test-")),
    dbPath = path.join(dir, "game.db");
  let app = createApp({ dbPath, teacherKey: "test-teacher" });
  async function listen() {
    await new Promise((resolve, reject) => {
      app.server.once("error", reject);
      app.server.listen(0, "127.0.0.1", resolve);
    });
    return "http://127.0.0.1:" + app.server.address().port;
  }
  let base = await listen();
  const cookies = {};
  async function req(who, url, body, expected = 200) {
    const res = await fetch(base + "/api" + url, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies[who] || "",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.headers.get("set-cookie"))
      cookies[who] = res.headers.get("set-cookie").split(";")[0];
    const data = await res.json();
    assert.equal(res.status, expected, JSON.stringify(data));
    return data;
  }
  try {
    for (const who of ["teacher", "alice", "bob"])
      await req(who, "/register", {
        username: who,
        password: "good-password",
        name: who,
      });
    await req("alice", "/games", { teacherKey: "wrong" }, 400);
    assert.equal((await req("teacher", "/me")).user.teacher, false);
    await req(
      "teacher",
      "/login",
      {
        username: "teacher",
        password: "good-password",
        teacherLogin: true,
        teacherKey: "wrong",
      },
      400,
    );
    await req(
      "teacher",
      "/login",
      {
        username: "teacher",
        password: "wrong-password",
        teacherLogin: true,
        teacherKey: "test-teacher",
      },
      400,
    );
    await req("teacher", "/login", {
      username: "teacher",
      password: "good-password",
      teacherLogin: true,
      teacherKey: "test-teacher",
    });
    assert.equal((await req("teacher", "/me")).user.teacher, true);
    await req(
      "teacher",
      "/games",
      { lessonId: "discounts-v1", name: "Unavailable lesson" },
      400,
    );
    let g = await req("teacher", "/games", {
      name: "Test class",
      rules: { practiceRounds: 0 },
    });
    assert.equal(g.lesson.id, "cost-markup-v1");
    assert.equal(g.rules.practiceRounds, 5);
    const url = "/games/" + g.code;
    await req("alice", "/profile", { avatar: "fox" });
    await req("alice", "/profile", { avatar: "not-a-mascot" }, 400);
    assert.equal((await req("alice", "/me")).user.avatar, "fox");
    await req(
      "teacher",
      url + "/join",
      { restaurant: "Teacher Restaurant" },
      400,
    );
    await req("alice", url + "/join", { restaurant: "My custom place" }, 400);
    await req(
      "alice",
      url + "/join",
      { restaurant: "Fry Society", icon: "invalid" },
      400,
    );
    await req(
      "alice",
      url + "/join",
      { restaurant: "Fry Society", color: "#000000" },
      400,
    );
    await req("alice", url + "/join", {
      restaurant: "Fry Society",
      icon: "🚀",
      color: "#246fa8",
    });
    await req("bob", url + "/join", { restaurant: "Taco Takeover" });
    g = await req("teacher", url);
    assert.equal(g.player, null);
    await req("alice", url + "/start", { version: g.version }, 400);
    g = await req("teacher", url + "/start", { version: g.version });
    g = await req("teacher", url + "/pause", { version: g.version });
    await req("alice", url + "/draft", { id: "1", markup: 100 }, 400);
    g = await req("teacher", url + "/pause", { version: g.version });

    await req("alice", url + "/draft", {
      id: "1",
      markup: "75",
      amount: "1.",
      price: "",
    });
    await new Promise((r) => app.server.close(r));
    app.db.close();
    app = createApp({ dbPath, teacherKey: "test-teacher" });
    base = await listen();
    assert.equal((await req("teacher", "/me")).user.teacher, true);
    let saved = await req("alice", url);
    assert.equal(saved.player.icon, "🚀");
    assert.equal(saved.player.color, "#246fa8");
    assert.equal((await req("alice", "/me")).user.avatar, "fox");
    assert.equal(
      (await req("public", "/leaderboard?room=" + g.code)).board.find(
        (x) => x.owner === "alice",
      ).avatar,
      "fox",
    );
    assert.equal(saved.player.drafts["1"].amount, "1.");
    await req("alice", url + "/ready", {}, 400);
    await req(
      "alice",
      url + "/check",
      { id: "34", markup: 100, amount: 4.1, price: 8.2 },
      400,
    );
    for (let round = 1; round <= 10; round++) {
      for (const who of ["alice", "bob"]) {
        const item = catalog[round - 1];
        if (who === "alice") {
          const wrong = { id: item.id, markup: 100, amount: 0, price: 0 };
          let check = await req(who, url + "/check", wrong);
          assert.equal(check.check.penalty, round > 5 ? 500 : 0);
          check = await req(who, url + "/check", wrong);
          assert.equal(check.check.penalty, 0);
        }
        const current = await req(who, url);
        await req(who, url + "/check", {
          id: item.id,
          markup: 100,
          amount: item.cost / 100,
          price: (item.cost * 2) / 100,
        });
        const extra = catalog.find(
          (x) =>
            x.round <= round &&
            !current.player.menu.some((m) => m.id === x.id) &&
            x.id !== item.id,
        );
        if (extra)
          await req(
            who,
            url + "/check",
            {
              id: extra.id,
              markup: 100,
              amount: extra.cost / 100,
              price: (extra.cost * 2) / 100,
            },
            400,
          );
        if (round >= 3)
          await req(who, url + "/promotion", {
            id: round === 3 ? "bogo" : "ad",
            target: item.id,
          });
        await req(who, url + "/ready", {});
        await req(who, url + "/draft", { id: item.id, markup: 20 }, 400);
      }
      g = await req("teacher", url);
      const version = g.version;
      g = await req("teacher", url + "/run", { version });
      await req("teacher", url + "/run", { version }, 400);
      const a = await req("alice", url),
        b = await req("bob", url);
      assert.equal(a.player.reports.length, round);
      assert.equal(a.player.reports.at(-1).penalty, round > 5 ? 500 : 0);
      assert.equal(b.player.reports.at(-1).penalty, 0);
      assert.equal(g.player, null);
      assert.ok(
        g.board.every((x) => !("wrongRounds" in x) && !("drafts" in x)),
      );
      assert.equal(
        (await req("public", "/leaderboard")).board.length,
        round === 10 ? 2 : 0,
      );
      if (round < 10)
        g = await req("teacher", url + "/next", { version: g.version });
    }
    assert.equal((await req("teacher", url + "/export")).rows.length, 20);
    await req("alice", url + "/export", undefined, 400);
    const global = (await req("public", "/leaderboard")).board;
    assert.equal(global.length, 2);
    assert.ok(global.every((x) => x.games === 1));
    const a = await req("alice", "/me");
    assert.ok(a.user.badges.includes(46));
    assert.ok(a.user.badges.includes(10));
    assert.ok(!a.user.badges.includes(9));
    assert.equal(a.user.hash, undefined);
    await req("alice", "/profile", { featured: [49] }, 400);
    await req("alice", "/profile", { featured: [46] });
    await req("alice", "/logout", {});
    assert.equal((await req("alice", "/me")).user, null);
    await req("alice", url, undefined, 401);
    await req(
      "alice",
      "/login",
      { username: "alice", password: "wrong-password" },
      400,
    );
    await req("alice", "/login", {
      username: "alice",
      password: "good-password",
    });
    assert.equal((await req("alice", url)).phase, "complete");
    await req("public", "/leaderboard?lessonId=discounts-v1", undefined, 400);
    const legacy = JSON.parse(
      app.db.prepare("SELECT data FROM games WHERE code=?").get(g.code).data,
    );
    delete legacy.lessonId;
    delete legacy.rules;
    legacy.code = "OLD123";
    legacy.players[a.user.id].restaurant = "Legacy Custom Kitchen";
    app.db
      .prepare("INSERT INTO games(code,data) VALUES(?,?)")
      .run(legacy.code, JSON.stringify(legacy));
    const restored = await req("alice", "/games/OLD123");
    assert.equal(restored.lesson.id, "cost-markup-v1");
    assert.equal(restored.player.restaurant, "Legacy Custom Kitchen");
    assert.equal(restored.player.reports.length, 10);
  } finally {
    await new Promise((r) => app.server.close(r));
    app.db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("rechecking correct work does not award the correction badge", () => {
  const p = newPlayer(
    { id: "clean", name: "Clean", badges: [] },
    "Clean",
    "🍔",
    "#da583b",
  );
  const g = { round: 1, phase: "planning", penalty: 500 };
  const b = { id: "1", markup: 100, amount: 2.4, price: 4.8 };
  pricing(g, p, b);
  pricing(g, p, b);
  assert.ok(!p.badges.includes(10));
  assert.equal(pricing(g, p, { ...b, amount: 2.401 }).correct, false);
  assert.throws(() => pricing(g, p, { ...b, markup: 33.333 }));
});

test("avatar migration preserves an existing account", () => {
  const { DatabaseSync } = require("node:sqlite");
  const { openStore } = require("../lib/store");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "avatar-migration-")),
    file = path.join(dir, "legacy.db");
  let db = new DatabaseSync(file);
  db.exec(
    "CREATE TABLE users(id TEXT PRIMARY KEY,username TEXT UNIQUE NOT NULL,name TEXT NOT NULL,hash TEXT NOT NULL,salt TEXT NOT NULL,badges TEXT NOT NULL DEFAULT '[]',featured TEXT NOT NULL DEFAULT '[]')",
  );
  db.prepare(
    "INSERT INTO users(id,username,name,hash,salt) VALUES(?,?,?,?,?)",
  ).run("old", "existing", "Existing Owner", "test-hash", "test-salt");
  db.close();
  db = openStore(file);
  assert.equal(
    db.prepare("SELECT avatar FROM users WHERE id=?").get("old").avatar,
    "chef",
  );
  assert.equal(
    db.prepare("SELECT name FROM users WHERE id=?").get("old").name,
    "Existing Owner",
  );
  db.close();
  fs.rmSync(dir, { recursive: true, force: true });
});

test("curated restaurant options and lesson snapshots", () => {
  const options = require("../public/restaurant-options");
  const {
    initializeLesson,
    lessonFor,
    rulesFor,
    getLesson,
  } = require("../lib/lessons");
  assert.equal(options.names.length, 50);
  assert.equal(new Set(options.names).size, 50);
  assert.equal(options.signs.length, 32);
  assert.equal(options.colors.length, 16);
  const a = initializeLesson({ round: 1, phase: "planning", penalty: 500 }),
    b = initializeLesson({});
  a.rules.catalog[0].cost = 300;
  assert.equal(b.rules.catalog[0].cost, 240);
  assert.equal(getLesson().rules.catalog[0].cost, 240);
  const p = newPlayer(
    { id: "snap", name: "Snap", badges: [] },
    options.names[0],
    options.signs[0],
    options.colors[0].value,
  );
  assert.equal(
    pricing(a, p, { id: "1", markup: 100, amount: 3, price: 6 }).correct,
    true,
  );
  assert.equal(deal(p, p.menu[0], a).cost, 300);
  assert.equal(rulesFor({}).totalRounds, 10);
  assert.throws(() => getLesson("discounts-v1"));
  assert.equal(lessonFor(a).id, "cost-markup-v1");
});
