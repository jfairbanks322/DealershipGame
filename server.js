"use strict";
const restaurantOptions = require("./public/restaurant-options");
const {
  DEFAULT_LESSON,
  getLesson,
  lessonFor,
  rulesFor,
  initializeLesson,
  publishedLessons,
  draftFor,
} = require("./lib/lessons");
const avatars = require("./public/avatars");
const http = require("node:http"),
  fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto");
const { promisify } = require("node:util");
const scrypt = promisify(crypto.scrypt);
const { openStore } = require("./lib/store"),
  { badges, sum } = require("./lib/achievements");
const {
  insist,
  newPlayer,
  pricing,
  validatePromotion,
  simulate,
} = require("./lib/game");
function createApp({ dbPath, teacherKey, production = false } = {}) {
  const db = openStore(
    dbPath || path.join(__dirname, "data", "business-math.db"),
  );
  const key = teacherKey || "classroom-local";
  const attempts = new Map();
  const userById = (id) => {
    const u = db.prepare("SELECT * FROM users WHERE id=?").get(id);
    if (u) {
      u.badges = JSON.parse(u.badges);
      u.featured = JSON.parse(u.featured);
    }
    return u;
  };
  const safeUser = (u, teacher = false) => ({
    teacher,
    id: u.id,
    name: u.name,
    username: u.username,
    avatar: u.avatar,
    badges: u.badges,
    featured: u.featured,
  });
  const career = (id, lessonId = DEFAULT_LESSON) =>
    db
      .prepare("SELECT * FROM careers WHERE userId=? AND lessonId=?")
      .all(id, lessonId);
  const load = (code) => {
    const row = db.prepare("SELECT data FROM games WHERE code=?").get(code);
    if (!row) { const error = new Error("This game was deleted or the room code is incorrect."); error.status = 404; throw error; }
    const g = JSON.parse(row.data);
    if (!g.lessonId) initializeLesson(g);
    getLesson(g.lessonId);
    return g;
  };
  const save = (g) => {
    g.version++;
    for (const p of Object.values(g.players)) {
      const u = userById(p.userId);
      const earned = [...new Set([...u.badges, ...p.badges])];
      if (earned.length >= 25 && !earned.includes(50)) earned.push(50);
      p.badges = earned;
      db.prepare("UPDATE users SET badges=? WHERE id=?").run(
        JSON.stringify(earned),
        p.userId,
      );
    }
    db.prepare("INSERT OR REPLACE INTO games(code,data) VALUES(?,?)").run(
      g.code,
      JSON.stringify(g),
    );
  };
  const board = (g) =>
    Object.values(g.players)
      .map((p) => ({
        userId: p.userId,
        owner: p.owner,
        avatar: userById(p.userId).avatar,
        restaurant: p.restaurant,
        icon: p.icon,
        color: p.color,
        profit: sum(p),
        last: p.reports.at(-1)?.profit || 0,
        units: p.reports.reduce((a, r) => a + r.units, 0),
        ready: p.ready,
        skipped: p.skippedRound === g.round,
        previousRank: p.previousRank,
        featured: userById(p.userId).featured[0] || null,
        featuredName:
          badges.find((b) => b.id === userById(p.userId).featured[0])?.name ||
          null,
      }))
      .sort(
        (a, b) =>
          b.profit - a.profit || a.restaurant.localeCompare(b.restaurant),
      )
      .map((p, i, a) => ({
        ...p,
        rank: a.findIndex((x) => x.profit === p.profit) + 1,
      }));
  function view(g, u) {
    return {
      code: g.code,
      name: g.name,
      lesson: { id: g.lessonId || DEFAULT_LESSON, label: lessonFor(g).label },
      market: lessonFor(g).market?.(g) || null,
      rules: {
        totalRounds: rulesFor(g).totalRounds,
        practiceRounds: rulesFor(g).practiceRounds,
        promotionsFromRound: rulesFor(g).promotionsFromRound,
      },
      round: g.round,
      phase: g.phase,
      paused: g.paused,
      penalty: g.penalty,
      version: g.version,
      host: g.host === u.id,
      board: board(g),
      player: g.players[u.id] || null,
      catalog: rulesFor(g).catalog.filter((x) => x.round <= g.round),
      promotions: rulesFor(g).promotions,
    };
  }
  function transaction(fn) {
    db.exec("BEGIN IMMEDIATE");
    try {
      const r = fn();
      db.exec("COMMIT");
      return r;
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  }
  const files = {
    "/": ["index.html", "text/html"],
    "/index.html": ["index.html", "text/html"],
    "/app.js": ["app.js", "text/javascript"],
    "/avatars.js": ["avatars.js", "text/javascript"],
    "/restaurant-options.js": ["restaurant-options.js", "text/javascript"],
    "/food-art.js": ["food-art.js", "text/javascript"],
    "/styles.css": ["styles.css", "text/css"],
  };
  async function handler(req, res) {
    const send = (status, obj) => {
      res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(obj));
    };
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    );
    try {
      const url = new URL(req.url, "http://localhost");
      if (req.method === "GET" && url.pathname === "/health")
        return send(200, { status: "ok", game: "business-math" });
      if (req.method === "GET" && files[url.pathname]) {
        const [file, type] = files[url.pathname];
        res.writeHead(200, {
          "Content-Type": type + "; charset=utf-8",
          "Cache-Control": "no-cache",
        });
        return res.end(fs.readFileSync(path.join(__dirname, "public", file)));
      }
      if (!url.pathname.startsWith("/api/"))
        return send(404, { error: "Not found" });
      let b = {};
      if (req.method === "POST") {
        if (req.headers["sec-fetch-site"] === "cross-site")
          return send(403, { error: "Use this site to make changes." });
        if (
          req.headers.origin &&
          new URL(req.headers.origin).host !== req.headers.host
        )
          return send(403, { error: "Origin not allowed." });
        insist(
          (req.headers["content-type"] || "").startsWith("application/json"),
          "Send JSON.",
        );
        let raw = "";
        for await (const chunk of req) {
          raw += chunk;
          insist(raw.length <= 20000, "Request too large.");
        }
        try {
          b = JSON.parse(raw || "{}");
        } catch {
          insist(false, "Invalid JSON.");
        }
        insist(
          b && typeof b === "object" && !Array.isArray(b),
          "Invalid request.",
        );
      } else if (req.method !== "GET")
        return send(405, { error: "Method not allowed" });
      if (
        ["/api/register", "/api/login"].includes(url.pathname) &&
        req.method === "POST"
      ) {
        const addr =
          req.socket.remoteAddress +
          ":" +
          String(b.username || "")
            .toLowerCase()
            .slice(0, 24);
        const now = Date.now();
        let bucket = attempts.get(addr);
        if (!bucket || bucket.until < now) {
          bucket = { count: 0, until: now + 60000 };
          attempts.set(addr, bucket);
        }
        if (++bucket.count > 30)
          return send(429, { error: "Too many attempts. Wait one minute." });
        if (attempts.size > 1000)
          for (const [a, v] of attempts) if (v.until < now) attempts.delete(a);
        const username = String(b.username || "")
            .toLowerCase()
            .trim(),
          password = String(b.password || "");
        insist(
          /^[a-z0-9_-]{3,24}$/.test(username),
          "Use 3–24 letters, numbers, underscores or hyphens for your username.",
        );
        insist(
          password.length >= 8 && password.length <= 128,
          "Use a password with 8–128 characters.",
        );
        const teacherLogin = b.teacherLogin === true;
        if (teacherLogin)
          insist(
            typeof b.teacherKey === "string" && b.teacherKey === key,
            "Enter the correct teacher access key.",
          );
        let u;
        if (url.pathname === "/api/register") {
          const name = String(b.name || "").trim();
          insist(
            name.length >= 1 && name.length <= 40,
            "Enter an owner name up to 40 characters.",
          );
          insist(
            !db.prepare("SELECT id FROM users WHERE username=?").get(username),
            "That username is taken.",
          );
          const avatar = b.avatar || "chef";
          insist(
            avatars.some((a) => a.id === avatar),
            "Choose an available avatar.",
          );
          const salt = crypto.randomBytes(16).toString("hex");
          const hash = (await scrypt(password, salt, 64)).toString("hex");
          try {
            db.prepare(
              "INSERT INTO users(id,username,name,hash,salt,avatar) VALUES(?,?,?,?,?,?)",
            ).run(crypto.randomUUID(), username, name, hash, salt, avatar);
          } catch (e) {
            if (String(e).includes("UNIQUE"))
              insist(false, "That username is taken.");
            throw e;
          }
          u = db.prepare("SELECT * FROM users WHERE username=?").get(username);
        } else {
          u = db.prepare("SELECT * FROM users WHERE username=?").get(username);
          const hashed = await scrypt(
            password,
            u?.salt || "unregistered-account",
            64,
          );
          insist(
            u && crypto.timingSafeEqual(hashed, Buffer.from(u.hash, "hex")),
            "Username or password is incorrect.",
          );
        }
        const token = crypto.randomBytes(32).toString("hex");
        db.prepare("DELETE FROM sessions WHERE expires < ?").run(now);
        db.prepare(
          "INSERT INTO sessions(token,userId,expires,teacher) VALUES(?,?,?,?)",
        ).run(
          crypto.createHash("sha256").update(token).digest("hex"),
          u.id,
          now + 30 * 86400000,
          teacherLogin ? 1 : 0,
        );
        res.setHeader(
          "Set-Cookie",
          `bm_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${production ? "; Secure" : ""}`,
        );
        return send(200, { user: safeUser(userById(u.id), teacherLogin) });
      }
      const token =
        (req.headers.cookie || "")
          .split(";")
          .map((s) => s.trim())
          .find((s) => s.startsWith("bm_session="))
          ?.slice(11) || "";
      const session = db
        .prepare(
          "SELECT userId,teacher FROM sessions WHERE token=? AND expires>?",
        )
        .get(
          crypto.createHash("sha256").update(token).digest("hex"),
          Date.now(),
        );
      const u = session ? userById(session.userId) : null;
      if (url.pathname === "/api/leaderboard" && req.method === "GET") {
        if (url.searchParams.get("room")) {
          const g = load(url.searchParams.get("room").toUpperCase());
          return send(200, {
            name: g.name,
            round: g.round,
            phase: g.phase,
            board: board(g),
          });
        }
        const leaderboardLesson =
          url.searchParams.get("lessonId") || DEFAULT_LESSON;
        getLesson(leaderboardLesson);
        const rows = db
          .prepare(
            "SELECT u.id,u.name,u.avatar,u.featured,COUNT(*) AS games,SUM(c.profit) AS profit,MAX(c.profit) AS best,SUM(c.win) AS wins FROM careers c JOIN users u ON u.id=c.userId WHERE c.lessonId=? GROUP BY u.id ORDER BY profit DESC",
          )
          .all(leaderboardLesson)
          .map((x) => ({ ...x, featured: JSON.parse(x.featured) }));
        return send(200, {
          board: rows,
          lessonId: leaderboardLesson,
          lessons: publishedLessons(),
        });
      }
      if (!u && url.pathname === "/api/me" && req.method === "GET")
        return send(200, { user: null, games: [], badges, lessons: publishedLessons() });
      if (!u) return send(401, { error: "Please log in to continue." });
      if (url.pathname === "/api/me" && req.method === "GET") {
        const games = db
          .prepare("SELECT data FROM games")
          .all()
          .map((r) => JSON.parse(r.data))
          .filter((g) => g.host === u.id || g.players[u.id])
          .map((g) => ({
            code: g.code,
            name: g.name,
            round: g.round,
            phase: g.phase,
            host: g.host === u.id,
          }));
        return send(200, {
          user: safeUser(u, session.teacher === 1),
          games,
          badges,
          lessons: publishedLessons(),
        });
      }
      if (url.pathname === "/api/logout" && req.method === "POST") {
        db.prepare("DELETE FROM sessions WHERE token=?").run(
          crypto.createHash("sha256").update(token).digest("hex"),
        );
        res.setHeader(
          "Set-Cookie",
          "bm_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
        );
        return send(200, { ok: true });
      }
      if (url.pathname === "/api/profile" && req.method === "POST") {
        if (b.avatar !== undefined)
          insist(
            avatars.some((a) => a.id === b.avatar),
            "Choose an available avatar.",
          );
        if (b.featured !== undefined)
          insist(
            Array.isArray(b.featured) &&
              b.featured.length <= 3 &&
              b.featured.every((id) => u.badges.includes(id)),
            "Choose up to three earned badges.",
          );
        if (b.featured !== undefined)
          db.prepare("UPDATE users SET featured=? WHERE id=?").run(
            JSON.stringify([...new Set(b.featured)]),
            u.id,
          );
        if (b.avatar !== undefined)
          db.prepare("UPDATE users SET avatar=? WHERE id=?").run(
            b.avatar,
            u.id,
          );
        return send(200, {
          user: safeUser(userById(u.id), session.teacher === 1),
        });
      }
      if (url.pathname === "/api/games" && req.method === "POST") {
        insist(
          session.teacher === 1 ||
            (typeof b.teacherKey === "string" && b.teacherKey === key),
          "Enter the teacher access key to host a game.",
        );
        const name =
          String(b.name || "Business Math Championship")
            .trim()
            .slice(0, 60) || "Business Math Championship";
        let code;
        do {
          code = crypto
            .randomBytes(4)
            .toString("hex")
            .slice(0, 6)
            .toUpperCase();
        } while (db.prepare("SELECT code FROM games WHERE code=?").get(code));
        const penalty =
          b.penalty == null ? 500 : Math.round(Number(b.penalty) * 100);
        insist(
          Number.isFinite(penalty) && penalty >= 0 && penalty <= 2000,
          "Penalty must be between $0 and $20.",
        );
        const g = {
          code,
          name,
          host: u.id,
          phase: "lobby",
          round: 1,
          paused: false,
          penalty,
          players: {},
          version: 0,
        };
        initializeLesson(g, b.lessonId || DEFAULT_LESSON);
        if (rulesFor(g).mathChecks === false) g.penalty = 0;
        transaction(() => save(g));
        return send(200, view(g, u));
      }
      const match = url.pathname.match(
        /^\/api\/games\/([A-Z0-9]{6})(?:\/(\w+))?$/,
      );
      if (!match) return send(404, { error: "Not found" });
      const result = transaction(() => {
        const g = load(match[1]),
          action = match[2];
        let p = g.players[u.id];
        if (req.method === "GET" && action === "export") {
          insist(g.host === u.id, "Only the teacher can export results.");
          return {
            rows: Object.values(g.players).flatMap((p) =>
              p.reports.map((r) => ({
                owner: p.owner,
                restaurant: p.restaurant,
                round: r.round,
                skipped: !!r.skipped,
                revenue: r.revenue,
                cost: r.cost,
                fees: r.fees,
                penalty: r.penalty,
                profit: r.profit,
                units: r.units,
              })),
            ),
          };
        }
        if (req.method === "GET" && !action) {
          insist(g.host === u.id || p, "Join this room to view it.");
          return view(g, u);
        }
        insist(req.method === "POST" && action, "Unknown action.");
        if (action === "tutorial") {
          insist(p, "Join the room first.");
          p.tutorialSeen = true;
          save(g);
          return view(g, u);
        }
        if (action === "reset" || action === "delete") {
          insist(g.host === u.id, "Only the teacher who owns this game can reset or delete it.");
          insist(b.version === g.version, "The room changed. Refresh and try again.");
          insist(b.confirmCode === g.code, "Enter the room code to confirm.");
          db.prepare("DELETE FROM careers WHERE game=?").run(g.code);
          if (action === "delete") {
            db.prepare("DELETE FROM games WHERE code=?").run(g.code);
            return { deleted: true, code: g.code };
          }
          g.phase = "lobby";
          g.round = 1;
          g.paused = false;
          for (const [id, owner] of Object.entries(g.players)) {
            g.players[id] = newPlayer(userById(id), owner.restaurant, owner.icon, owner.color);
          }
          save(g);
          return view(g, u);
        }
        if (action === "join") {
          if (!p) {
            insist(
              g.host !== u.id,
              "The teacher account manages this room. Use a separate student account to play.",
            );
            insist(
              g.phase === "lobby",
              "This game has started. Rejoin with your original account, or join the next game.",
            );
            insist(Object.keys(g.players).length < 100, "This room is full.");
            const restaurant = String(b.restaurant || "");
            insist(
              restaurantOptions.names.includes(restaurant),
              "Choose a restaurant name from the provided list.",
            );
            const icon = b.icon ?? restaurantOptions.signs[0],
              color = b.color ?? restaurantOptions.colors[0].value;
            insist(
              restaurantOptions.signs.includes(icon),
              "Choose an available restaurant sign.",
            );
            insist(
              restaurantOptions.colors.some((c) => c.value === color),
              "Choose an available restaurant color.",
            );
            p = newPlayer(u, restaurant, icon, color);
            p.badges.push(2);
            g.players[u.id] = p;
          }
        } else if (["start", "pause", "run", "next", "skip", "restore"].includes(action)) {
          insist(g.host === u.id, "Only the teacher can control rounds.");
          // Expected version prevents double-clicks or stale tabs from advancing twice.
          insist(
            b.version === g.version,
            "The room changed. Refresh and try again.",
          );
          if (action === "skip" || action === "restore") {
            insist(g.phase === "planning" && !g.paused, "Attendance can only change during open planning.");
            const target = g.players[b.userId];
            insist(target, "Choose a restaurant in this room.");
            insist(!target.ready, "Submitted restaurants cannot be skipped.");
            target.skippedRound = action === "skip" ? g.round : null;
          }
          if (action === "start") {
            insist(
              g.phase === "lobby" && Object.keys(g.players).length > 0,
              "At least one restaurant must join.",
            );
            g.phase = "planning";
          }
          if (action === "pause") {
            insist(g.phase !== "complete", "The game is complete.");
            g.paused = !g.paused;
          }
          if (action === "run") {
            simulate(g, (id) => career(id, g.lessonId));
            if (g.phase === "complete") {
              const max = Math.max(...Object.values(g.players).map(sum));
              for (const q of Object.values(g.players))
                db.prepare(
                  "INSERT INTO careers(game,userId,profit,win,lessonId) VALUES(?,?,?,?,?)",
                ).run(
                  g.code,
                  q.userId,
                  sum(q),
                  Object.keys(g.players).length >= 2 && sum(q) === max ? 1 : 0,
                  g.lessonId,
                );
            }
          }
          if (action === "next") {
            insist(
              g.phase === "results" && !g.paused,
              "Reveal results before advancing.",
            );
            g.round++;
            g.phase = "planning";
            for (const q of Object.values(g.players)) {
              q.ready = false;
              if (q.skippedRound !== g.round - 1) q.drafts = {};
              q.skippedRound = null;
              q.promotion = { id: "none" };
            }
          }
        } else {
          insist(p, "Join the room first.");
          insist(
            g.phase === "planning" && !g.paused,
            "Wait for the teacher to open planning.",
          );
          insist(p.skippedRound !== g.round, "Your teacher skipped this round. Your saved work is kept for your return.");
          if (action === "unready") {
            p.ready = false;
          } else {
            insist(!p.ready, "Reopen your submission before making changes.");
            if (action === "draft") {
              insist(false, "Draft saving has been removed. Refresh the page and use Check math & save price.");
            } else if (action === "check") {
              const check = pricing(g, p, b);
              save(g);
              return { ...view(g, u), check };
            } else if (action === "promotion") {
              p.promotion = validatePromotion(g, p, b);
            } else if (action === "ready") {
              const error = lessonFor(g).readyError(g, p);
              insist(!error, error);
              validatePromotion(g, p, p.promotion);
              p.ready = true;
            } else insist(false, "Unknown action.");
          }
        }
        save(g);
        return view(g, u);
      });
      return send(200, result);
    } catch (e) {
      if (!e.status) console.error(e);
      return send(e.status || 500, {
        error: e.status ? e.message : "Something went wrong. Please try again.",
      });
    }
  }
  return { server: http.createServer(handler), db };
}
if (require.main === module) {
  const production =
    process.env.NODE_ENV === "production" ||
    !!process.env.RAILWAY_ENVIRONMENT_ID;
  if (production && !process.env.RAILWAY_VOLUME_MOUNT_PATH)
    throw new Error(
      "Attach a Railway persistent volume before starting Business Math.",
    );
  if (
    production &&
    (!process.env.TEACHER_KEY || process.env.TEACHER_KEY.length < 12)
  )
    throw new Error(
      "Set TEACHER_KEY to a private access key of at least 12 characters.",
    );
  const dbPath = production
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, "business-math.db")
    : process.env.DB_PATH || path.join(__dirname, "data", "business-math.db");
  const app = createApp({
    dbPath,
    teacherKey: process.env.TEACHER_KEY,
    production,
  });
  app.server.listen(Number(process.env.PORT) || 3040, "0.0.0.0", () =>
    console.log("Business Math ready on port " + (process.env.PORT || 3040)),
  );
}
module.exports = { createApp };
