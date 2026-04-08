const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "stock-arena.db");
const LEGACY_STORE_PATH = path.join(DATA_DIR, "store.json");
const PUBLIC_DIR = path.join(__dirname, "public");
const SESSION_COOKIE = "stock_sim_session";

const DEFAULT_TEACHER_USERNAME = "teacher";
const DEFAULT_TEACHER_PASSWORD = "market-open";
const DEFAULT_STARTING_CASH = 10000;
const VOLATILITY_LEVELS = new Set(["Low", "Medium", "High", "Extreme"]);

const sessions = new Map();

const COMPANY_SEEDS = [
  {
    ticker: "HHS",
    name: "Haven Holistics",
    industry: "Pharma",
    startingPrice: 15,
    volatility: "High",
    bio: "A scrappy wellness startup selling natural remedies, herbal gummies, and vibes with enough confidence to terrify actual scientists.",
    pros: ["Huge social media buzz", "Plenty of room to grow"],
    cons: ["Science is optional", "One bad study could wreck it"]
  },
  {
    ticker: "SKY",
    name: "SkyRacers",
    industry: "Travel",
    startingPrice: 65,
    volatility: "Low",
    bio: "A veteran aircraft supplier that makes the planes other companies slap their logos on and pretend they invented.",
    pros: ["Stable contracts", "Trusted industry name"],
    cons: ["Slow and steady can also mean slow and sleepy"]
  },
  {
    ticker: "UNO",
    name: "Utter Nonsense",
    industry: "Gaming",
    startingPrice: 9,
    volatility: "Extreme",
    bio: "Two brothers built this gaming studio in their mom's basement and are now chasing a VR experience so immersive it might require a waiver.",
    pros: ["Massive upside if the game hits", "Cult-following energy"],
    cons: ["Product could be a disaster", "Safety lawsuits are not a great growth plan"]
  },
  {
    ticker: "YTT",
    name: "Yum Yum Tum Tum",
    industry: "Food and Beverage",
    startingPrice: 34,
    volatility: "Low",
    bio: "A century-old snack-and-soda company that still knows how to sell chips, even if its digital strategy is posting once and hoping.",
    pros: ["Reliable brand recognition", "Slow, steady growth"],
    cons: ["Marketing feels stuck in another decade"]
  },
  {
    ticker: "MCM",
    name: "Motor City Muscle",
    industry: "Automotive",
    startingPrice: 82,
    volatility: "Low",
    bio: "A respected parts supplier for major automakers, known for quality engineering and for making mechanics talk about carburetors like poetry.",
    pros: ["Established reputation", "Dependable long-term business"],
    cons: ["Not much moonshot potential"]
  },
  {
    ticker: "IMM",
    name: "Immortal Life",
    industry: "Pharmaceuticals",
    startingPrice: 12,
    volatility: "Extreme",
    bio: "A biotech startup loudly claiming it wants to cure death, which is either the greatest business plan ever pitched or the world's boldest typo.",
    pros: ["If it works, it changes everything", "Investors love big swings"],
    cons: ["If it fails, it fails spectacularly", "Regulators tend to ask follow-up questions"]
  },
  {
    ticker: "JHS",
    name: "Just Horses",
    industry: "Digital Media",
    startingPrice: 2,
    volatility: "Extreme",
    bio: "A digital media company devoted entirely to horse content, for viewers who have long believed mainstream streaming is not nearly horse-centric enough.",
    pros: ["Ultra-cheap entry price", "Could become a surprise meme hit"],
    cons: ["Niche is putting it kindly", "Could gallop straight into irrelevance"]
  },
  {
    ticker: "MC",
    name: "MegaCorp",
    industry: "Consumer Products",
    startingPrice: 185,
    volatility: "Medium",
    bio: "A gigantic conglomerate that somehow sells batteries, cereal, smart fridges, and probably your neighbor's hopes and dreams.",
    pros: ["Everywhere all at once", "Too diversified to ignore"],
    cons: ["Antitrust headaches", "The world may be getting a little tired of them"]
  },
  {
    ticker: "HFW",
    name: "Hello Fellow",
    industry: "Telecommunications",
    startingPrice: 65,
    volatility: "Medium",
    bio: "A global phone and cell service company trying to stay cool while MegaCorp lurks nearby like a billionaire supervillain.",
    pros: ["Massive market share", "Strong global presence"],
    cons: ["Constant pressure from MegaCorp", "One bad product cycle gets expensive fast"]
  },
  {
    ticker: "WW",
    name: "Wik Wok",
    industry: "Digital Content",
    startingPrice: 81,
    volatility: "Medium",
    bio: "Owner of the world's favorite short-form video app, where trends are born, dances spread, and homework mysteriously stops getting done.",
    pros: ["Huge daily engagement", "Advertising gold mine"],
    cons: ["Always one scandal away from hearings", "Critics blame it for melting attention spans"]
  },
  {
    ticker: "SAE",
    name: "Sir Animal Enterprises",
    industry: "Entertainment",
    startingPrice: 23,
    volatility: "Medium",
    bio: "A wildly merchandised internet celebrity empire selling shows, candy, lunch kits, and the powerful idea that branding is a personality.",
    pros: ["Kids adore the brand", "Can sell almost anything with a logo on it"],
    cons: ["Products can feel generic", "Quality control has had some adventurous days"]
  },
  {
    ticker: "WMO",
    name: "WeMoo",
    industry: "Consumer Goods",
    startingPrice: 102,
    volatility: "Medium",
    bio: "A consumer-goods giant built on selling unbelievably cheap stuff people absolutely did not plan to buy five minutes ago.",
    pros: ["Low prices move inventory fast", "Impulse shopping never really goes out of style"],
    cons: ["Ethics questions keep following it", "Margins and reputation can get messy"]
  },
  {
    ticker: "DBM",
    name: "Don't Buy Me",
    industry: "Military Contracting",
    startingPrice: 92,
    volatility: "High",
    bio: "REDACTED",
    pros: ["REDACTED"],
    cons: ["REDACTED"]
  },
  {
    ticker: "SC",
    name: "Snack City",
    industry: "Food and Beverage",
    startingPrice: 33,
    volatility: "Medium",
    bio: "A snack company famous for face-melting cheesy poofs and candy body spray, because apparently someone in product development feared nothing.",
    pros: ["Ridiculously popular with kids", "Strong brand in gross-but-fun snacks"],
    cons: ["Messy products", "Questionable ingredients could cause backlash"]
  },
  {
    ticker: "SSC",
    name: "Steel Services",
    industry: "Cyber Security",
    startingPrice: 212,
    volatility: "Low",
    bio: "The world's biggest cyber security firm, promising to protect your passwords while absolutely definitely probably not peeking through your webcam.",
    pros: ["Critical services for huge clients", "Security spending stays strong when people panic"],
    cons: ["Privacy accusations hit hard", "Trust is the whole business"]
  }
];

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");
db.exec("PRAGMA busy_timeout = 5000;");

initializeDatabase();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname.startsWith("/api/")) {
      await handleApi(req, res, pathname);
      return;
    }

    if (pathname === "/") {
      sendFile(res, path.join(PUBLIC_DIR, "index.html"));
      return;
    }

    sendStatic(res, pathname);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Something went wrong on the server." });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Classroom stock sim running at http://${HOST}:${PORT}`);
  console.log(`Teacher login: ${DEFAULT_TEACHER_USERNAME} / ${DEFAULT_TEACHER_PASSWORD}`);
});

async function handleApi(req, res, pathname) {
  const session = getSession(req);

  if (req.method === "GET" && pathname === "/api/bootstrap") {
    sendJson(res, 200, buildBootstrapPayload(session));
    return;
  }

  if (req.method === "POST" && pathname === "/api/register") {
    const body = await readJsonBody(req);
    const username = normalizeUsername(body.username);
    const displayName = String(body.displayName || "").trim();
    const password = String(body.password || "");

    if (!username || !displayName || password.length < 4) {
      sendJson(res, 400, { error: "Provide a display name, username, and a password with at least 4 characters." });
      return;
    }

    if (getUserByUsername(username)) {
      sendJson(res, 409, { error: "That username is already taken." });
      return;
    }

    const userId = crypto.randomUUID();
    db.prepare(
      `INSERT INTO users (id, username, display_name, password_hash, cash, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      userId,
      username,
      displayName,
      hashPassword(password),
      getStartingCash(),
      new Date().toISOString()
    );

    const sid = createSession({ userId, isAdmin: false });
    setSessionCookie(res, sid);
    sendJson(res, 201, buildBootstrapPayload(sessions.get(sid)));
    return;
  }

  if (req.method === "POST" && pathname === "/api/login") {
    const body = await readJsonBody(req);
    const username = normalizeUsername(body.username);
    const password = String(body.password || "");

    const user = getUserByUsername(username);
    if (!user || user.password_hash !== hashPassword(password)) {
      sendJson(res, 401, { error: "Invalid username or password." });
      return;
    }

    const sid = createSession({ userId: user.id, isAdmin: false });
    setSessionCookie(res, sid);
    sendJson(res, 200, buildBootstrapPayload(sessions.get(sid)));
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/login") {
    const body = await readJsonBody(req);
    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    const settings = getSettings();

    if (
      username !== settings.teacherUsername ||
      hashPassword(password) !== settings.teacherPasswordHash
    ) {
      sendJson(res, 401, { error: "Teacher login was not recognized." });
      return;
    }

    const sid = createSession({ isAdmin: true });
    setSessionCookie(res, sid);
    sendJson(res, 200, buildBootstrapPayload(sessions.get(sid)));
    return;
  }

  if (req.method === "POST" && pathname === "/api/logout") {
    clearSession(req, res);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && pathname === "/api/trade") {
    if (!session?.userId || session.isAdmin) {
      sendJson(res, 401, { error: "Log in as a student to trade." });
      return;
    }

    const body = await readJsonBody(req);
    const ticker = String(body.ticker || "").trim().toUpperCase();
    const side = body.side === "sell" ? "sell" : "buy";
    const shares = Number(body.shares);

    if (!Number.isInteger(shares) || shares <= 0) {
      sendJson(res, 400, { error: "Trades must be for a positive whole number of shares." });
      return;
    }

    try {
      runInTransaction(() => executeTrade(session.userId, ticker, side, shares));
      sendJson(res, 200, buildBootstrapPayload(session));
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/watchlist") {
    if (!session?.userId || session.isAdmin) {
      sendJson(res, 401, { error: "Log in as a student to manage a watchlist." });
      return;
    }

    const body = await readJsonBody(req);
    const ticker = String(body.ticker || "").trim().toUpperCase();
    const watching = Boolean(body.watching);
    const company = getCompanyByTicker(ticker);

    if (!company) {
      sendJson(res, 404, { error: "That company could not be found." });
      return;
    }

    try {
      runInTransaction(() => setWatchlistState(session.userId, ticker, watching));
      sendJson(res, 200, buildBootstrapPayload(session));
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/market") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);
    runInTransaction(() => updateMarketState(Boolean(body.isOpen)));
    sendJson(res, 200, buildBootstrapPayload(session));
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/event") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);
    const headline = String(body.headline || "").trim();
    const bodyText = String(body.body || "").trim();
    const effects = Array.isArray(body.effects)
      ? body.effects
          .map((effect) => ({
            ticker: String(effect.ticker || "").trim().toUpperCase(),
            percentChange: Number(effect.percentChange)
          }))
          .filter((effect) => effect.ticker && Number.isFinite(effect.percentChange) && effect.percentChange !== 0)
      : [];

    if (!headline || effects.length === 0) {
      sendJson(res, 400, { error: "Events need a headline and at least one non-zero company effect." });
      return;
    }

    try {
      runInTransaction(() => publishEvent(headline, bodyText, effects));
      sendJson(res, 200, buildBootstrapPayload(session));
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/settings") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);
    const settings = getSettings();
    const nextUsername = body.teacherUsername ? normalizeUsername(body.teacherUsername) : settings.teacherUsername;
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const startingCash = Number(body.startingCash);

    if (!nextUsername) {
      sendJson(res, 400, { error: "Teacher username cannot be blank." });
      return;
    }

    if (!Number.isFinite(startingCash) || startingCash < 100 || startingCash > 1000000) {
      sendJson(res, 400, { error: "Starting cash must be between $100 and $1,000,000." });
      return;
    }

    const isCredentialChange = nextUsername !== settings.teacherUsername || newPassword.length > 0;
    if (isCredentialChange) {
      if (hashPassword(currentPassword) !== settings.teacherPasswordHash) {
        sendJson(res, 400, { error: "Current teacher password is required to change login settings." });
        return;
      }
      if (newPassword && newPassword.length < 4) {
        sendJson(res, 400, { error: "New teacher password must be at least 4 characters." });
        return;
      }
    }

    setSetting("teacher_username", nextUsername);
    setSetting("starting_cash", String(roundMoney(startingCash)));
    if (newPassword) {
      setSetting("teacher_password_hash", hashPassword(newPassword));
    }

    sendJson(res, 200, buildBootstrapPayload(session));
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/company") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);
    const ticker = String(body.ticker || "").trim().toUpperCase();
    const company = getCompanyByTicker(ticker);

    if (!company) {
      sendJson(res, 404, { error: "That company could not be found." });
      return;
    }

    const name = String(body.name || "").trim();
    const industry = String(body.industry || "").trim();
    const bio = String(body.bio || "").trim();
    const volatility = String(body.volatility || "").trim();
    const startingPrice = Number(body.startingPrice);
    const price = Number(body.price);
    const pros = normalizeTextList(body.pros);
    const cons = normalizeTextList(body.cons);

    if (!name || !industry || !bio) {
      sendJson(res, 400, { error: "Company name, industry, and bio are required." });
      return;
    }

    if (!VOLATILITY_LEVELS.has(volatility)) {
      sendJson(res, 400, { error: "Volatility must be Low, Medium, High, or Extreme." });
      return;
    }

    if (!Number.isFinite(startingPrice) || startingPrice < 1 || !Number.isFinite(price) || price < 1) {
      sendJson(res, 400, { error: "Starting price and current price must both be at least $1." });
      return;
    }

    if (pros.length === 0 || cons.length === 0) {
      sendJson(res, 400, { error: "Each company needs at least one pro and one con." });
      return;
    }

    runInTransaction(() => {
      db.prepare(
        `UPDATE companies
         SET name = ?, industry = ?, starting_price = ?, volatility = ?, bio = ?, price = ?, pros_json = ?, cons_json = ?
         WHERE ticker = ?`
      ).run(
        name,
        industry,
        roundMoney(startingPrice),
        volatility,
        bio,
        roundMoney(price),
        JSON.stringify(pros),
        JSON.stringify(cons),
        ticker
      );

      if (roundMoney(price) !== roundMoney(company.price)) {
        addCompanyHistory(ticker, roundMoney(price), "Teacher updated the company profile");
      }
    });

    sendJson(res, 200, buildBootstrapPayload(session));
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/student/reset") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);
    const userId = String(body.userId || "");
    if (!getUserById(userId)) {
      sendJson(res, 404, { error: "Student account not found." });
      return;
    }

    runInTransaction(() => resetStudentPortfolio(userId));
    sendJson(res, 200, buildBootstrapPayload(session));
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/student/delete") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);
    const userId = String(body.userId || "");
    if (!getUserById(userId)) {
      sendJson(res, 404, { error: "Student account not found." });
      return;
    }

    runInTransaction(() => deleteStudent(userId));
    clearStudentSessions(userId);
    sendJson(res, 200, buildBootstrapPayload(session));
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/student/password") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);
    const userId = String(body.userId || "");
    const nextPassword = String(body.password || "");

    if (nextPassword.length < 4) {
      sendJson(res, 400, { error: "Student passwords must be at least 4 characters." });
      return;
    }

    if (!getUserById(userId)) {
      sendJson(res, 404, { error: "Student account not found." });
      return;
    }

    db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(hashPassword(nextPassword), userId);
    clearStudentSessions(userId);
    sendJson(res, 200, buildBootstrapPayload(session));
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/reset") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);
    const scope = String(body.scope || "");

    if (!["portfolios", "market", "full"].includes(scope)) {
      sendJson(res, 400, { error: "Unknown reset scope." });
      return;
    }

    runInTransaction(() => resetGame(scope));
    if (scope === "full") {
      clearAllStudentSessions();
    }
    sendJson(res, 200, buildBootstrapPayload(session));
    return;
  }

  sendJson(res, 404, { error: "Route not found." });
}

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS market_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      is_open INTEGER NOT NULL DEFAULT 0,
      session_number INTEGER NOT NULL DEFAULT 0,
      last_opened_at TEXT,
      last_closed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      cash REAL NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS companies (
      ticker TEXT PRIMARY KEY,
      sort_order INTEGER NOT NULL,
      name TEXT NOT NULL,
      industry TEXT NOT NULL,
      starting_price REAL NOT NULL,
      volatility TEXT NOT NULL,
      bio TEXT NOT NULL,
      price REAL NOT NULL,
      pros_json TEXT NOT NULL,
      cons_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS company_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      price REAL NOT NULL,
      note TEXT NOT NULL,
      FOREIGN KEY (ticker) REFERENCES companies (ticker) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS holdings (
      user_id TEXT NOT NULL,
      ticker TEXT NOT NULL,
      shares INTEGER NOT NULL,
      PRIMARY KEY (user_id, ticker),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (ticker) REFERENCES companies (ticker) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS watchlists (
      user_id TEXT NOT NULL,
      ticker TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, ticker),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (ticker) REFERENCES companies (ticker) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      ticker TEXT NOT NULL,
      company_name TEXT NOT NULL,
      side TEXT NOT NULL,
      shares INTEGER NOT NULL,
      price REAL NOT NULL,
      total REAL NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (ticker) REFERENCES companies (ticker) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      headline TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS event_effects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL,
      ticker TEXT NOT NULL,
      company_name TEXT NOT NULL,
      percent_change REAL NOT NULL,
      old_price REAL NOT NULL,
      new_price REAL NOT NULL,
      FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
      FOREIGN KEY (ticker) REFERENCES companies (ticker) ON DELETE CASCADE
    );
  `);

  const settingsCount = db.prepare("SELECT COUNT(*) AS count FROM settings").get().count;
  if (settingsCount > 0) {
    reconcileSeedCompanies();
    return;
  }

  if (fs.existsSync(LEGACY_STORE_PATH)) {
    const raw = JSON.parse(fs.readFileSync(LEGACY_STORE_PATH, "utf8"));
    importLegacyStore(raw);
    return;
  }

  seedDatabase();
}

function seedDatabase(settingsOverrides = {}) {
  runInTransaction(() => {
    clearAllTables();
    const settings = {
      teacherUsername: settingsOverrides.teacherUsername || DEFAULT_TEACHER_USERNAME,
      teacherPasswordHash: settingsOverrides.teacherPasswordHash || hashPassword(DEFAULT_TEACHER_PASSWORD),
      startingCash: roundMoney(settingsOverrides.startingCash || DEFAULT_STARTING_CASH)
    };

    setSetting("teacher_username", settings.teacherUsername);
    setSetting("teacher_password_hash", settings.teacherPasswordHash);
    setSetting("starting_cash", String(settings.startingCash));
    db.prepare(
      `INSERT INTO market_state (id, is_open, session_number, last_opened_at, last_closed_at)
       VALUES (1, 0, 0, NULL, NULL)`
    ).run();

    const now = new Date().toISOString();
    COMPANY_SEEDS.forEach((company, index) => insertCompany(company, index, now));
    insertWelcomeEvent(now);
  });
}

function importLegacyStore(store) {
  const upgraded = upgradeLegacyStore(store);
  runInTransaction(() => {
    clearAllTables();
    setSetting("teacher_username", upgraded.settings.teacherUsername);
    setSetting("teacher_password_hash", upgraded.settings.teacherPasswordHash);
    setSetting("starting_cash", String(upgraded.settings.startingCash));
    db.prepare(
      `INSERT INTO market_state (id, is_open, session_number, last_opened_at, last_closed_at)
       VALUES (1, ?, ?, ?, ?)`
    ).run(
      upgraded.market.isOpen ? 1 : 0,
      upgraded.market.sessionNumber,
      upgraded.market.lastOpenedAt,
      upgraded.market.lastClosedAt
    );

    upgraded.companies.forEach((company, index) => {
      db.prepare(
        `INSERT INTO companies
         (ticker, sort_order, name, industry, starting_price, volatility, bio, price, pros_json, cons_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        company.ticker,
        index,
        company.name,
        company.industry,
        roundMoney(company.startingPrice),
        company.volatility,
        company.bio,
        roundMoney(company.price),
        JSON.stringify(company.pros),
        JSON.stringify(company.cons)
      );

      company.history.forEach((entry) => {
        db.prepare(
          `INSERT INTO company_history (ticker, timestamp, price, note) VALUES (?, ?, ?, ?)`
        ).run(company.ticker, entry.timestamp, roundMoney(entry.price), entry.note);
      });
    });

    upgraded.users.forEach((user) => {
      db.prepare(
        `INSERT INTO users (id, username, display_name, password_hash, cash, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        user.id,
        user.username,
        user.displayName,
        user.passwordHash,
        roundMoney(user.cash),
        user.createdAt
      );

      Object.entries(user.holdings).forEach(([ticker, shares]) => {
        if (shares > 0) {
          db.prepare(`INSERT INTO holdings (user_id, ticker, shares) VALUES (?, ?, ?)`).run(user.id, ticker, shares);
        }
      });

      user.transactions.forEach((transaction) => {
        db.prepare(
          `INSERT INTO transactions (id, user_id, ticker, company_name, side, shares, price, total, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          transaction.id || crypto.randomUUID(),
          user.id,
          transaction.ticker,
          transaction.companyName || getCompanyName(transaction.ticker),
          transaction.side,
          transaction.shares,
          roundMoney(transaction.price),
          roundMoney(transaction.total),
          transaction.timestamp
        );
      });
    });

    upgraded.events.forEach((event) => {
      const eventId = event.id || crypto.randomUUID();
      db.prepare(`INSERT INTO events (id, headline, body, created_at) VALUES (?, ?, ?, ?)`).run(
        eventId,
        event.headline,
        event.body || "",
        event.createdAt
      );

      event.effects.forEach((effect) => {
        db.prepare(
          `INSERT INTO event_effects (event_id, ticker, company_name, percent_change, old_price, new_price)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(
          eventId,
          effect.ticker,
          effect.companyName || getCompanyName(effect.ticker),
          Number(effect.percentChange) || 0,
          roundMoney(Number(effect.oldPrice) || 0),
          roundMoney(Number(effect.newPrice) || 0)
        );
      });
    });
  });
}

function clearAllTables() {
  db.exec(`
    DELETE FROM event_effects;
    DELETE FROM events;
    DELETE FROM transactions;
    DELETE FROM holdings;
    DELETE FROM company_history;
    DELETE FROM companies;
    DELETE FROM users;
    DELETE FROM market_state;
    DELETE FROM settings;
  `);
}

function insertCompany(company, index, timestamp) {
  db.prepare(
    `INSERT INTO companies
     (ticker, sort_order, name, industry, starting_price, volatility, bio, price, pros_json, cons_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    company.ticker,
    index,
    company.name,
    company.industry,
    roundMoney(company.startingPrice),
    company.volatility,
    company.bio,
    roundMoney(company.startingPrice),
    JSON.stringify(company.pros),
    JSON.stringify(company.cons)
  );
  addCompanyHistory(company.ticker, roundMoney(company.startingPrice), "Opening price", timestamp);
}

function reconcileSeedCompanies() {
  const now = new Date().toISOString();
  COMPANY_SEEDS.forEach((company, index) => {
    const existing = getCompanyByTicker(company.ticker);
    if (existing) {
      db.prepare(`UPDATE companies SET sort_order = ? WHERE ticker = ?`).run(index, company.ticker);
      return;
    }
    insertCompany(company, index, now);
  });
}

function addCompanyHistory(ticker, price, note, timestamp = new Date().toISOString()) {
  db.prepare(
    `INSERT INTO company_history (ticker, timestamp, price, note) VALUES (?, ?, ?, ?)`
  ).run(ticker, timestamp, roundMoney(price), note);

  const historyIds = db.prepare(
    `SELECT id FROM company_history WHERE ticker = ? ORDER BY datetime(timestamp) DESC, id DESC LIMIT -1 OFFSET 40`
  ).all(ticker);
  historyIds.forEach((entry) => {
    db.prepare(`DELETE FROM company_history WHERE id = ?`).run(entry.id);
  });
}

function insertWelcomeEvent(timestamp) {
  db.prepare(`INSERT INTO events (id, headline, body, created_at) VALUES (?, ?, ?, ?)`).run(
    crypto.randomUUID(),
    "Welcome to the Stock Arena",
    "Market news will appear here whenever the teacher posts a new event.",
    timestamp
  );
}

function buildBootstrapPayload(session) {
  return {
    user: session?.userId ? serializeUser(session.userId) : null,
    isAdmin: Boolean(session?.isAdmin),
    market: getMarket(),
    rules: {
      startingCash: getStartingCash()
    },
    companies: getCompanies(),
    leaderboard: computeLeaderboard(),
    events: getEvents(10),
    admin: session?.isAdmin ? buildAdminPayload() : null
  };
}

function getSettings() {
  const rows = db.prepare(`SELECT key, value FROM settings`).all();
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    teacherUsername: map.teacher_username || DEFAULT_TEACHER_USERNAME,
    teacherPasswordHash: map.teacher_password_hash || hashPassword(DEFAULT_TEACHER_PASSWORD),
    startingCash: roundMoney(Number(map.starting_cash || DEFAULT_STARTING_CASH))
  };
}

function setSetting(key, value) {
  db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(key, value);
}

function getStartingCash() {
  return getSettings().startingCash;
}

function getMarket() {
  const row = db.prepare(
    `SELECT is_open, session_number, last_opened_at, last_closed_at FROM market_state WHERE id = 1`
  ).get();
  return {
    isOpen: Boolean(row?.is_open),
    sessionNumber: row?.session_number || 0,
    lastOpenedAt: row?.last_opened_at || null,
    lastClosedAt: row?.last_closed_at || null
  };
}

function getCompanies() {
  const companies = db.prepare(
    `SELECT ticker, sort_order, name, industry, starting_price, volatility, bio, price, pros_json, cons_json
     FROM companies
     ORDER BY sort_order ASC`
  ).all();

  const historyRows = db.prepare(
    `SELECT id, ticker, timestamp, price, note
     FROM company_history
     ORDER BY datetime(timestamp) DESC, id DESC`
  ).all();

  const historyByTicker = new Map();
  historyRows.forEach((row) => {
    if (!historyByTicker.has(row.ticker)) {
      historyByTicker.set(row.ticker, []);
    }
    const entries = historyByTicker.get(row.ticker);
    if (entries.length < 8) {
      entries.push({
        timestamp: row.timestamp,
        price: roundMoney(row.price),
        note: row.note
      });
    }
  });

  return companies.map((company) => ({
    ticker: company.ticker,
    name: company.name,
    industry: company.industry,
    startingPrice: roundMoney(company.starting_price),
    volatility: company.volatility,
    bio: company.bio,
    pros: parseJsonArray(company.pros_json),
    cons: parseJsonArray(company.cons_json),
    price: roundMoney(company.price),
    history: historyByTicker.get(company.ticker) || []
  }));
}

function getEvents(limit = 10) {
  const events = db.prepare(
    `SELECT id, headline, body, created_at
     FROM events
     ORDER BY datetime(created_at) DESC, rowid DESC
     LIMIT ?`
  ).all(limit);

  return events.map((event) => ({
    id: event.id,
    headline: event.headline,
    body: event.body,
    createdAt: event.created_at,
    effects: db.prepare(
      `SELECT ticker, company_name, percent_change, old_price, new_price
       FROM event_effects
       WHERE event_id = ?
       ORDER BY id ASC`
    ).all(event.id).map((effect) => ({
      ticker: effect.ticker,
      companyName: effect.company_name,
      percentChange: Number(effect.percent_change),
      oldPrice: roundMoney(effect.old_price),
      newPrice: roundMoney(effect.new_price)
    }))
  }));
}

function getUserById(userId) {
  return db.prepare(
    `SELECT id, username, display_name, password_hash, cash, created_at FROM users WHERE id = ?`
  ).get(userId);
}

function getUserByUsername(username) {
  return db.prepare(
    `SELECT id, username, display_name, password_hash, cash, created_at FROM users WHERE username = ?`
  ).get(username);
}

function getCompanyByTicker(ticker) {
  return db.prepare(
    `SELECT ticker, name, industry, starting_price, volatility, bio, price, pros_json, cons_json, sort_order
     FROM companies
     WHERE ticker = ?`
  ).get(ticker);
}

function getCompanyName(ticker) {
  return getCompanyByTicker(ticker)?.name || ticker;
}

function serializeUser(userId) {
  const user = getUserById(userId);
  if (!user) {
    return null;
  }

  const positions = db.prepare(
    `SELECT h.ticker, c.name, h.shares, c.price
     FROM holdings h
     JOIN companies c ON c.ticker = h.ticker
     WHERE h.user_id = ?
     ORDER BY (h.shares * c.price) DESC`
  ).all(userId).map((position) => ({
    ticker: position.ticker,
    name: position.name,
    shares: position.shares,
    price: roundMoney(position.price),
    marketValue: roundMoney(position.shares * position.price)
  }));

  const totalValue = roundMoney(
    roundMoney(user.cash) + positions.reduce((sum, position) => sum + position.marketValue, 0)
  );

  const transactions = db.prepare(
    `SELECT id, ticker, company_name, side, shares, price, total, timestamp
     FROM transactions
     WHERE user_id = ?
     ORDER BY datetime(timestamp) DESC, rowid DESC
     LIMIT 15`
  ).all(userId).map((transaction) => ({
    id: transaction.id,
    ticker: transaction.ticker,
    companyName: transaction.company_name,
    side: transaction.side,
    shares: transaction.shares,
    price: roundMoney(transaction.price),
    total: roundMoney(transaction.total),
    timestamp: transaction.timestamp
  }));

  const watchlist = getUserWatchlist(userId);

  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    cash: roundMoney(user.cash),
    totalValue,
    positions,
    transactions,
    watchlist
  };
}

function computeLeaderboard() {
  return db.prepare(
    `SELECT id, username, display_name, cash, created_at FROM users ORDER BY display_name COLLATE NOCASE ASC`
  ).all().map((user) => serializeUser(user.id))
    .filter(Boolean)
    .sort((a, b) => b.totalValue - a.totalValue)
    .map((user, index) => ({
      rank: index + 1,
      id: user.id,
      displayName: user.displayName,
      username: user.username,
      cash: user.cash,
      totalValue: user.totalValue,
      positionsCount: user.positions.length
    }));
}

function buildAdminPayload() {
  const settings = getSettings();
  const leaderboard = computeLeaderboard();
  const students = db.prepare(
    `SELECT id, username, display_name, cash, created_at FROM users ORDER BY display_name COLLATE NOCASE ASC`
  ).all().map((user) => {
    const summary = serializeUser(user.id);
    return {
      id: user.id,
      displayName: user.display_name,
      username: user.username,
      createdAt: user.created_at,
      cash: summary.cash,
      totalValue: summary.totalValue,
      positionsCount: summary.positions.length,
      transactionCount: db.prepare(`SELECT COUNT(*) AS count FROM transactions WHERE user_id = ?`).get(user.id).count,
      positionsLabel: summary.positions.length
        ? summary.positions.map((position) => `${position.ticker} (${position.shares})`).join(", ")
        : "No holdings"
    };
  });

  const recentTrades = db.prepare(
    `SELECT t.id, t.ticker, t.company_name, t.side, t.shares, t.price, t.total, t.timestamp, u.display_name, u.username
     FROM transactions t
     JOIN users u ON u.id = t.user_id
     ORDER BY datetime(t.timestamp) DESC, t.rowid DESC
     LIMIT 12`
  ).all().map((trade) => ({
    id: trade.id,
    ticker: trade.ticker,
    companyName: trade.company_name,
    side: trade.side,
    shares: trade.shares,
    price: roundMoney(trade.price),
    total: roundMoney(trade.total),
    timestamp: trade.timestamp,
    studentName: trade.display_name,
    username: trade.username
  }));

  return {
    settings: {
      teacherUsername: settings.teacherUsername,
      startingCash: settings.startingCash
    },
    metrics: {
      studentCount: students.length,
      eventCount: db.prepare(`SELECT COUNT(*) AS count FROM events`).get().count,
      totalTrades: db.prepare(`SELECT COUNT(*) AS count FROM transactions`).get().count,
      totalClassValue: roundMoney(leaderboard.reduce((sum, entry) => sum + entry.totalValue, 0)),
      topStudent: leaderboard[0] || null
    },
    students,
    recentTrades
  };
}

function executeTrade(userId, ticker, side, shares) {
  const market = getMarket();
  if (!market.isOpen) {
    throw new Error("The market is currently closed.");
  }

  const company = getCompanyByTicker(ticker);
  const user = getUserById(userId);
  if (!company || !user) {
    throw new Error("Could not find that trade target.");
  }

  const tradeValue = roundMoney(company.price * shares);
  const holding = db.prepare(
    `SELECT shares FROM holdings WHERE user_id = ? AND ticker = ?`
  ).get(userId, ticker);
  const currentShares = holding?.shares || 0;

  if (side === "buy") {
    if (tradeValue > user.cash) {
      throw new Error("Not enough cash for that purchase.");
    }

    db.prepare(`UPDATE users SET cash = ? WHERE id = ?`).run(roundMoney(user.cash - tradeValue), userId);
    db.prepare(
      `INSERT INTO holdings (user_id, ticker, shares)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id, ticker) DO UPDATE SET shares = excluded.shares`
    ).run(userId, ticker, currentShares + shares);
  } else {
    if (shares > currentShares) {
      throw new Error("You do not own that many shares.");
    }

    db.prepare(`UPDATE users SET cash = ? WHERE id = ?`).run(roundMoney(user.cash + tradeValue), userId);
    const nextShares = currentShares - shares;
    if (nextShares > 0) {
      db.prepare(`UPDATE holdings SET shares = ? WHERE user_id = ? AND ticker = ?`).run(nextShares, userId, ticker);
    } else {
      db.prepare(`DELETE FROM holdings WHERE user_id = ? AND ticker = ?`).run(userId, ticker);
    }
  }

  db.prepare(
    `INSERT INTO transactions (id, user_id, ticker, company_name, side, shares, price, total, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    crypto.randomUUID(),
    userId,
    ticker,
    company.name,
    side,
    shares,
    roundMoney(company.price),
    tradeValue,
    new Date().toISOString()
  );

  trimUserTransactions(userId, 60);
}

function getUserWatchlist(userId) {
  return db.prepare(
    `SELECT c.ticker, c.name, c.industry, c.volatility, c.price, c.starting_price, w.created_at
     FROM watchlists w
     JOIN companies c ON c.ticker = w.ticker
     WHERE w.user_id = ?
     ORDER BY datetime(w.created_at) ASC, c.sort_order ASC`
  ).all(userId).map((company) => ({
    ticker: company.ticker,
    name: company.name,
    industry: company.industry,
    volatility: company.volatility,
    price: roundMoney(company.price),
    startingPrice: roundMoney(company.starting_price),
    createdAt: company.created_at
  }));
}

function setWatchlistState(userId, ticker, watching) {
  const existing = db.prepare(
    `SELECT ticker FROM watchlists WHERE user_id = ? AND ticker = ?`
  ).get(userId, ticker);

  if (watching) {
    if (existing) {
      return;
    }

    const count = db.prepare(`SELECT COUNT(*) AS count FROM watchlists WHERE user_id = ?`).get(userId).count;
    if (count >= 5) {
      throw new Error("Watchlists can track up to 5 companies at a time.");
    }

    db.prepare(
      `INSERT INTO watchlists (user_id, ticker, created_at) VALUES (?, ?, ?)`
    ).run(userId, ticker, new Date().toISOString());
    return;
  }

  if (!existing) {
    return;
  }

  db.prepare(`DELETE FROM watchlists WHERE user_id = ? AND ticker = ?`).run(userId, ticker);
}

function trimUserTransactions(userId, maxCount) {
  const stale = db.prepare(
    `SELECT id FROM transactions
     WHERE user_id = ?
     ORDER BY datetime(timestamp) DESC, rowid DESC
     LIMIT -1 OFFSET ?`
  ).all(userId, maxCount);
  stale.forEach((row) => {
    db.prepare(`DELETE FROM transactions WHERE id = ?`).run(row.id);
  });
}

function updateMarketState(isOpen) {
  const current = getMarket();
  if (isOpen === current.isOpen) {
    return;
  }

  if (isOpen) {
    db.prepare(
      `UPDATE market_state SET is_open = 1, session_number = ?, last_opened_at = ? WHERE id = 1`
    ).run(current.sessionNumber + 1, new Date().toISOString());
    return;
  }

  db.prepare(
    `UPDATE market_state SET is_open = 0, last_closed_at = ? WHERE id = 1`
  ).run(new Date().toISOString());
}

function publishEvent(headline, bodyText, effects) {
  const eventId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const appliedEffects = [];

  effects.forEach((effect) => {
    const company = getCompanyByTicker(effect.ticker);
    if (!company) {
      return;
    }

    const oldPrice = roundMoney(company.price);
    const newPrice = Math.max(1, roundMoney(oldPrice * (1 + effect.percentChange / 100)));
    db.prepare(`UPDATE companies SET price = ? WHERE ticker = ?`).run(newPrice, company.ticker);
    addCompanyHistory(company.ticker, newPrice, headline, createdAt);
    appliedEffects.push({
      ticker: company.ticker,
      companyName: company.name,
      percentChange: effect.percentChange,
      oldPrice,
      newPrice
    });
  });

  if (appliedEffects.length === 0) {
    throw new Error("None of the selected companies could be updated.");
  }

  db.prepare(`INSERT INTO events (id, headline, body, created_at) VALUES (?, ?, ?, ?)`).run(
    eventId,
    headline,
    bodyText,
    createdAt
  );

  appliedEffects.forEach((effect) => {
    db.prepare(
      `INSERT INTO event_effects (event_id, ticker, company_name, percent_change, old_price, new_price)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      eventId,
      effect.ticker,
      effect.companyName,
      Number(effect.percentChange),
      effect.oldPrice,
      effect.newPrice
    );
  });

  trimEvents(25);
}

function trimEvents(maxCount) {
  const stale = db.prepare(
    `SELECT id FROM events ORDER BY datetime(created_at) DESC, rowid DESC LIMIT -1 OFFSET ?`
  ).all(maxCount);
  stale.forEach((row) => {
    db.prepare(`DELETE FROM events WHERE id = ?`).run(row.id);
  });
}

function resetStudentPortfolio(userId) {
  db.prepare(`UPDATE users SET cash = ? WHERE id = ?`).run(getStartingCash(), userId);
  db.prepare(`DELETE FROM holdings WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM transactions WHERE user_id = ?`).run(userId);
}

function deleteStudent(userId) {
  db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
}

function resetGame(scope) {
  const settings = getSettings();

  if (scope === "portfolios") {
    const userIds = db.prepare(`SELECT id FROM users`).all();
    userIds.forEach((user) => resetStudentPortfolio(user.id));
    return;
  }

  const now = new Date().toISOString();
  db.prepare(
    `UPDATE market_state SET is_open = 0, session_number = 0, last_opened_at = NULL, last_closed_at = NULL WHERE id = 1`
  ).run();

  db.prepare(`DELETE FROM company_history`).run();
  COMPANY_SEEDS.forEach((seed, index) => {
    const current = getCompanyByTicker(seed.ticker);
    db.prepare(
      `UPDATE companies
       SET sort_order = ?, name = ?, industry = ?, starting_price = ?, volatility = ?, bio = ?, price = ?, pros_json = ?, cons_json = ?
       WHERE ticker = ?`
    ).run(
      index,
      seed.name,
      seed.industry,
      roundMoney(seed.startingPrice),
      seed.volatility,
      seed.bio,
      roundMoney(seed.startingPrice),
      JSON.stringify(seed.pros),
      JSON.stringify(seed.cons),
      seed.ticker
    );
    if (!current) {
      insertCompany(seed, index, now);
    } else {
      addCompanyHistory(seed.ticker, roundMoney(seed.startingPrice), "Opening price", now);
    }
  });

  db.prepare(`DELETE FROM event_effects`).run();
  db.prepare(`DELETE FROM events`).run();
  insertWelcomeEvent(now);

  if (scope === "market") {
    return;
  }

  db.prepare(`DELETE FROM transactions`).run();
  db.prepare(`DELETE FROM holdings`).run();
  db.prepare(`DELETE FROM users`).run();
  setSetting("teacher_username", settings.teacherUsername);
  setSetting("teacher_password_hash", settings.teacherPasswordHash);
  setSetting("starting_cash", String(settings.startingCash));
}

function runInTransaction(fn) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function clearStudentSessions(userId) {
  for (const [sid, session] of sessions.entries()) {
    if (session.userId === userId) {
      sessions.delete(sid);
    }
  }
}

function clearAllStudentSessions() {
  for (const [sid, session] of sessions.entries()) {
    if (session.userId) {
      sessions.delete(sid);
    }
  }
}

function createSession(session) {
  const sid = crypto.randomUUID();
  sessions.set(sid, {
    ...session,
    createdAt: Date.now()
  });
  return sid;
}

function getSession(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  const sid = cookies[SESSION_COOKIE];
  if (!sid || !sessions.has(sid)) {
    return null;
  }
  return sessions.get(sid);
}

function clearSession(req, res) {
  const cookies = parseCookies(req.headers.cookie || "");
  const sid = cookies[SESSION_COOKIE];
  if (sid) {
    sessions.delete(sid);
  }
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`);
}

function setSessionCookie(res, sid) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${sid}; Path=/; HttpOnly; SameSite=Lax`);
}

function parseCookies(value) {
  return value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, entry) => {
      const separatorIndex = entry.indexOf("=");
      if (separatorIndex === -1) {
        return acc;
      }
      acc[entry.slice(0, separatorIndex)] = decodeURIComponent(entry.slice(separatorIndex + 1));
      return acc;
    }, {});
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large."));
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("Could not parse JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function sendStatic(res, pathname) {
  const safePath = pathname.replace(/^\/+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendJson(res, 404, { error: "File not found." });
    return;
  }

  sendFile(res, filePath);
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType =
    {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg": "image/svg+xml; charset=utf-8"
    }[ext] || "application/octet-stream";

  const headers = { "Content-Type": contentType };
  if ([".html", ".css", ".js"].includes(ext)) {
    headers["Cache-Control"] = "no-store";
  }

  res.writeHead(200, headers);
  fs.createReadStream(filePath).pipe(res);
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeTextList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
}

function upgradeLegacyStore(store) {
  const settings = {
    teacherUsername: store.settings?.teacherUsername || DEFAULT_TEACHER_USERNAME,
    teacherPasswordHash: store.settings?.teacherPasswordHash || hashPassword(DEFAULT_TEACHER_PASSWORD),
    startingCash: roundMoney(Number(store.settings?.startingCash || DEFAULT_STARTING_CASH))
  };

  const market = {
    isOpen: Boolean(store.market?.isOpen),
    sessionNumber: Number(store.market?.sessionNumber || 0),
    lastOpenedAt: store.market?.lastOpenedAt || null,
    lastClosedAt: store.market?.lastClosedAt || null
  };

  const companies = Array.isArray(store.companies) && store.companies.length
    ? store.companies.map((company, index) => ({
        ticker: String(company.ticker || COMPANY_SEEDS[index]?.ticker || "").toUpperCase(),
        name: company.name || COMPANY_SEEDS[index]?.name || "Company",
        industry: company.industry || "Industry",
        startingPrice: roundMoney(Number(company.startingPrice || company.price || 1)),
        volatility: VOLATILITY_LEVELS.has(company.volatility) ? company.volatility : "Medium",
        bio: company.bio || "",
        price: roundMoney(Number(company.price || company.startingPrice || 1)),
        pros: normalizeTextList(company.pros),
        cons: normalizeTextList(company.cons),
        history: Array.isArray(company.history) && company.history.length
          ? company.history.map((entry) => ({
              timestamp: entry.timestamp || new Date().toISOString(),
              price: roundMoney(Number(entry.price || company.price || company.startingPrice || 1)),
              note: entry.note || "Opening price"
            }))
          : [
              {
                timestamp: new Date().toISOString(),
                price: roundMoney(Number(company.price || company.startingPrice || 1)),
                note: "Opening price"
              }
            ]
      }))
    : COMPANY_SEEDS.map((company) => ({
        ...company,
        price: company.startingPrice,
        history: [
          {
            timestamp: new Date().toISOString(),
            price: company.startingPrice,
            note: "Opening price"
          }
        ]
      }));

  const users = Array.isArray(store.users)
    ? store.users.map((user) => ({
        id: user.id || crypto.randomUUID(),
        username: normalizeUsername(user.username),
        displayName: user.displayName || user.username || "Student",
        passwordHash: user.passwordHash || hashPassword("class123"),
        cash: roundMoney(Number(user.cash || settings.startingCash)),
        holdings: user.holdings || {},
        transactions: Array.isArray(user.transactions) ? user.transactions : [],
        createdAt: user.createdAt || new Date().toISOString()
      }))
    : [];

  const events = Array.isArray(store.events) && store.events.length
    ? store.events.map((event) => ({
        id: event.id || crypto.randomUUID(),
        headline: event.headline || "Untitled event",
        body: event.body || "",
        createdAt: event.createdAt || new Date().toISOString(),
        effects: Array.isArray(event.effects) ? event.effects : []
      }))
    : [
        {
          id: crypto.randomUUID(),
          headline: "Welcome to the Stock Arena",
          body: "Market news will appear here whenever the teacher posts a new event.",
          createdAt: new Date().toISOString(),
          effects: []
        }
      ];

  return { settings, market, companies, users, events };
}

function hashPassword(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}
