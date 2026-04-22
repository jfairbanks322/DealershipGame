const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const RAILWAY_DATA_DIR = "/app/data";
const DATA_DIR = process.env.DATA_DIR
  || process.env.RAILWAY_VOLUME_MOUNT_PATH
  || (fs.existsSync(RAILWAY_DATA_DIR) ? RAILWAY_DATA_DIR : null)
  || path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "gold-market.db");
const PUBLIC_DIR = path.join(__dirname, "public");
const SESSION_COOKIE = "gold_market_session";
const AVATAR_MANIFEST_PATH = path.join(PUBLIC_DIR, "assets", "avatars", "feast-haven", "manifest.json");

const DEFAULT_TEACHER_USERNAME = "teacher";
const DEFAULT_TEACHER_PASSWORD = "market-open";
const PREDICTION_MARKET_START_CASH = 40;
const PREDICTION_MARKET_TRADE_BLOCK = 5;
const PREDICTION_MARKET_SEED_LIQUIDITY = 120;
const PREDICTION_MARKET_TIMEZONE = process.env.PREDICTION_MARKET_TIMEZONE || "America/Detroit";
const MAX_MARKET_FEED = 18;

const PREDICTION_MARKET_WORK_TEMPLATES = [
  {
    id: "evidence-quiz",
    type: "Quiz",
    title: "Evidence Check Quiz",
    description: "Read a short market story and identify the strongest signal instead of the loudest reaction.",
    prompt: "A city budget memo quietly cuts spending flexibility while social media stays optimistic. What should move the market most?",
    basePay: 3,
    bonusPay: 3,
    artKey: "disciplinedTrader",
    choices: [
      { id: "memo", label: "The budget memo, because it is concrete evidence.", correct: true },
      { id: "hashtags", label: "The optimistic posts, because excitement spreads faster.", correct: false },
      { id: "guess", label: "Whichever side already has more traders in it.", correct: false }
    ]
  },
  {
    id: "risk-reflection",
    type: "Reflection",
    title: "Risk Reflection",
    description: "Pick the response that best protects a student from turning a forecast into a chase.",
    prompt: "A trader loses on one market and feels pressure to win it back fast. What is the healthiest next move?",
    basePay: 3,
    bonusPay: 2,
    artKey: "stayInCash",
    choices: [
      { id: "pause", label: "Pause, review the evidence, and consider sitting out the next move.", correct: true },
      { id: "double", label: "Double the next trade so the loss disappears faster.", correct: false },
      { id: "copy", label: "Copy whatever side the crowd seems most emotional about.", correct: false }
    ]
  },
  {
    id: "signal-sort",
    type: "Assignment",
    title: "Signal Sort Assignment",
    description: "Sort one market update into evidence, hype, or noise to earn steady cash.",
    prompt: "A verified district operations email says buses are being rescheduled. What kind of signal is that?",
    basePay: 4,
    bonusPay: 2,
    artKey: "walletRefilled",
    choices: [
      { id: "evidence", label: "Evidence, because an operational source changed real plans.", correct: true },
      { id: "hype", label: "Hype, because lots of people will react to it.", correct: false },
      { id: "noise", label: "Noise, because markets should ignore logistics.", correct: false }
    ]
  },
  {
    id: "discipline-drill",
    type: "Drill",
    title: "Discipline Drill",
    description: "Choose the bankroll habit that makes a market lesson safer and more teachable.",
    prompt: "Which habit keeps a prediction market from becoming a pure gambling rush?",
    basePay: 3,
    bonusPay: 3,
    artKey: "disciplinedTrader",
    choices: [
      { id: "size", label: "Trading small enough that you can still think clearly.", correct: true },
      { id: "swing", label: "Letting every market use most of your available cash.", correct: false },
      { id: "revenge", label: "Taking bigger trades immediately after a loss.", correct: false }
    ]
  },
  {
    id: "private-bets-quiz",
    type: "Quiz",
    title: "Private Bets Quiz",
    description: "Check whether you understand what the class should and should not see on the live board.",
    prompt: "In the live class market, what should stay hidden from other students even when the odds move?",
    basePay: 3,
    bonusPay: 2,
    artKey: "privateBets",
    choices: [
      { id: "identity", label: "Which student placed each trade.", correct: true },
      { id: "line", label: "The shared market probability.", correct: false },
      { id: "result", label: "Whether a market resolved YES or NO.", correct: false }
    ]
  },
  {
    id: "shared-pool-lab",
    type: "Lab",
    title: "Shared Pool Lab",
    description: "Identify what happens when many students trade into the same class market.",
    prompt: "If several students buy YES in the same market, what should happen to the shared class line?",
    basePay: 4,
    bonusPay: 2,
    artKey: "sharedPoolLive",
    choices: [
      { id: "rise", label: "It should rise, because the shared YES pool becomes more expensive.", correct: true },
      { id: "freeze", label: "It should freeze, because student trades stay private.", correct: false },
      { id: "drop", label: "It should drop, because more people want the same side.", correct: false }
    ]
  }
];

const sessions = new Map();
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
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

    if (pathname === "/market") {
      sendFile(res, path.join(PUBLIC_DIR, "prediction-market.html"));
      return;
    }

    sendStatic(res, pathname);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Something went wrong on the server." });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Gold Market running at http://${HOST}:${PORT}`);
  console.log(`Teacher login: ${DEFAULT_TEACHER_USERNAME} / ${DEFAULT_TEACHER_PASSWORD}`);
});

async function handleApi(req, res, pathname) {
  const session = getSession(req);

  if (req.method === "GET" && pathname === "/api/bootstrap") {
    sendJson(res, 200, buildBootstrapPayload(session));
    return;
  }

  if (req.method === "GET" && pathname === "/api/prediction-markets") {
    sendJson(res, 200, buildPredictionMarketPayload(session));
    return;
  }

  if (req.method === "POST" && pathname === "/api/register") {
    const body = await readJsonBody(req);
    const username = normalizeUsername(body.username);
    const displayName = toShortText(body.displayName, "", 32);
    const password = String(body.password || "");
    const avatarId = String(body.avatarId || "").trim();

    if (!username || !displayName || password.length < 4) {
      sendJson(res, 400, { error: "Provide a display name, username, and a password with at least 4 characters." });
      return;
    }

    const avatars = getAvatarCatalog();
    if (avatars.length && !getAvatarById(avatarId)) {
      sendJson(res, 400, { error: "Choose one of the available avatars." });
      return;
    }

    if (getUserByUsername(username)) {
      sendJson(res, 409, { error: "That username is already taken." });
      return;
    }

    const userId = crypto.randomUUID();
    runInTransaction(() => {
      db.prepare(
        `INSERT INTO users (id, username, display_name, password_hash, avatar_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        userId,
        username,
        displayName,
        hashPassword(password),
        avatarId || null,
        new Date().toISOString()
      );
      initializePredictionPortfolio(userId);
    });

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
    const username = normalizeUsername(body.username);
    const password = String(body.password || "");
    const settings = getSettings();

    if (username !== settings.teacherUsername || hashPassword(password) !== settings.teacherPasswordHash) {
      sendJson(res, 401, { error: "Teacher login was not recognized." });
      return;
    }

    const sid = createSession({ userId: null, isAdmin: true });
    setSessionCookie(res, sid);
    sendJson(res, 200, buildBootstrapPayload(sessions.get(sid)));
    return;
  }

  if (req.method === "POST" && pathname === "/api/logout") {
    clearSession(req, res);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && pathname === "/api/prediction-markets/trade") {
    if (!session?.userId || session.isAdmin) {
      sendJson(res, 401, { error: "Log in as a student to trade in the live class market." });
      return;
    }

    const body = await readJsonBody(req);

    try {
      runInTransaction(() => executePredictionTrade(session.userId, body));
      sendJson(res, 200, buildPredictionMarketPayload(session));
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/prediction-markets/work") {
    if (!session?.userId || session.isAdmin) {
      sendJson(res, 401, { error: "Log in as a student to complete off-market work." });
      return;
    }

    const body = await readJsonBody(req);

    try {
      runInTransaction(() => executePredictionWork(session.userId, body));
      sendJson(res, 200, buildPredictionMarketPayload(session));
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
    const nextUsername = normalizeUsername(body.teacherUsername || settings.teacherUsername);
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!nextUsername) {
      sendJson(res, 400, { error: "Teacher username cannot be blank." });
      return;
    }

    const credentialsChanging = nextUsername !== settings.teacherUsername || newPassword.length > 0;
    if (credentialsChanging) {
      if (hashPassword(currentPassword) !== settings.teacherPasswordHash) {
        sendJson(res, 400, { error: "Current teacher password is required to change teacher login settings." });
        return;
      }
      if (newPassword && newPassword.length < 4) {
        sendJson(res, 400, { error: "New teacher password must be at least 4 characters." });
        return;
      }
    }

    setSetting("teacher_username", nextUsername);
    if (newPassword) {
      setSetting("teacher_password_hash", hashPassword(newPassword));
    }

    sendJson(res, 200, buildBootstrapPayload(session));
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/prediction-markets/create") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);

    try {
      runInTransaction(() => createPredictionMarket(body));
      sendJson(res, 200, buildBootstrapPayload(session));
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/prediction-markets/resolve") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);

    try {
      runInTransaction(() => resolvePredictionMarket(String(body.marketId || ""), String(body.resolution || "")));
      sendJson(res, 200, buildBootstrapPayload(session));
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/prediction-markets/archive") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);

    try {
      runInTransaction(() => archivePredictionMarket(String(body.marketId || "")));
      sendJson(res, 200, buildBootstrapPayload(session));
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/prediction-markets/refill-wallets") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    try {
      runInTransaction(() => refillAllPredictionWallets());
      sendJson(res, 200, buildBootstrapPayload(session));
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  sendJson(res, 404, { error: "Not found." });
}

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prediction_markets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      desk TEXT NOT NULL,
      probability INTEGER NOT NULL,
      evidence INTEGER NOT NULL,
      hype INTEGER NOT NULL,
      yes_pool REAL NOT NULL DEFAULT 0,
      no_pool REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      resolution TEXT,
      created_at TEXT NOT NULL,
      published_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS prediction_market_portfolios (
      user_id TEXT PRIMARY KEY,
      cash REAL NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS prediction_market_positions (
      market_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      yes_shares REAL NOT NULL DEFAULT 0,
      no_shares REAL NOT NULL DEFAULT 0,
      final_yes_shares REAL,
      final_no_shares REAL,
      final_payout REAL,
      settled_at TEXT,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (market_id, user_id),
      FOREIGN KEY (market_id) REFERENCES prediction_markets (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS prediction_market_trades (
      id TEXT PRIMARY KEY,
      market_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      direction TEXT NOT NULL,
      side TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      total_cost REAL NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (market_id) REFERENCES prediction_markets (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS prediction_market_work (
      user_id TEXT NOT NULL,
      work_date TEXT NOT NULL,
      task_id TEXT NOT NULL,
      choice_id TEXT NOT NULL,
      title TEXT NOT NULL,
      payout REAL NOT NULL,
      accuracy_bonus REAL NOT NULL DEFAULT 0,
      was_correct INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, work_date),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS prediction_market_wallet_refreshes (
      user_id TEXT NOT NULL,
      refresh_date TEXT NOT NULL,
      amount REAL NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, refresh_date, reason),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_prediction_markets_status ON prediction_markets (status, updated_at);
    CREATE INDEX IF NOT EXISTS idx_prediction_market_positions_user ON prediction_market_positions (user_id, market_id);
    CREATE INDEX IF NOT EXISTS idx_prediction_market_trades_market ON prediction_market_trades (market_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_prediction_market_work_user ON prediction_market_work (user_id, work_date);
  `);

  const settingsCount = db.prepare(`SELECT COUNT(*) AS count FROM settings`).get().count;
  if (settingsCount === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  setSetting("teacher_username", DEFAULT_TEACHER_USERNAME);
  setSetting("teacher_password_hash", hashPassword(DEFAULT_TEACHER_PASSWORD));
}

function buildBootstrapPayload(session) {
  const viewerRole = session?.isAdmin ? "teacher" : session?.userId ? "student" : "guest";
  const currentUser = session?.userId ? getUserById(session.userId) : null;
  const walletRefill = currentUser && !session?.isAdmin ? applyDailyWalletFloor(currentUser.id) : null;

  return {
    viewerRole,
    user: currentUser ? serializeViewerUser(currentUser.id) : null,
    rules: {
      startingCash: PREDICTION_MARKET_START_CASH,
      tradeBlock: PREDICTION_MARKET_TRADE_BLOCK,
      dailyWalletFloor: PREDICTION_MARKET_START_CASH
    },
    avatarCatalog: getAvatarCatalog(),
    liveMarkets: getPredictionMarketFeed(session, 8),
    workBoard: buildPredictionWorkBoard(session),
    walletRefill,
    student: currentUser && !session?.isAdmin ? buildStudentPayload(currentUser.id) : null,
    admin: session?.isAdmin ? buildAdminPayload() : null
  };
}

function buildPredictionMarketPayload(session) {
  const viewerRole = session?.isAdmin ? "teacher" : session?.userId ? "student" : "guest";
  const walletRefill = session?.userId && !session?.isAdmin ? applyDailyWalletFloor(session.userId) : null;

  return {
    viewerRole,
    canTrade: Boolean(session?.userId && !session?.isAdmin),
    portfolio: session?.userId && !session?.isAdmin ? serializePredictionPortfolio(session.userId) : null,
    workBoard: buildPredictionWorkBoard(session),
    walletRefill,
    markets: getPredictionMarketFeed(session, MAX_MARKET_FEED)
  };
}

function buildStudentPayload(userId) {
  const user = getUserById(userId);
  const portfolio = serializePredictionPortfolio(userId);
  const positions = listStudentPositions(userId);
  const recentTrades = listStudentTrades(userId, 10);
  const totals = getStudentTotals(userId);

  return {
    id: user.id,
    displayName: user.display_name,
    username: user.username,
    avatarPath: getAvatarPath(user.avatar_id),
    portfolio,
    positions,
    recentTrades,
    totals,
    stayInCashEligible: totals.tradeCount === 0,
    gradeMessage: totals.tradeCount === 0
      ? "Automatic A path active: you have stayed in cash and chosen not to bet."
      : "You have entered the market. Use evidence, sizing, and restraint to avoid turning the lesson into gambling."
  };
}

function buildAdminPayload() {
  const settings = getSettings();
  const students = listStudentSummaries();
  const markets = listPredictionMarkets(MAX_MARKET_FEED).map((market) => serializePredictionMarket(market));
  const activeCount = markets.filter((market) => market.status === "active").length;
  const resolvedCount = markets.filter((market) => market.status === "resolved").length;
  const totalTrades = db.prepare(`SELECT COUNT(*) AS count FROM prediction_market_trades`).get().count;
  const totalWorkSubmissions = db.prepare(`SELECT COUNT(*) AS count FROM prediction_market_work`).get().count;

  return {
    settings: {
      teacherUsername: settings.teacherUsername
    },
    metrics: {
      studentCount: students.length,
      activeMarketCount: activeCount,
      resolvedMarketCount: resolvedCount,
      totalTrades,
      totalWorkSubmissions,
      stayInCashCount: students.filter((student) => student.stayInCashEligible).length,
      averageCash: roundNumber(
        students.length ? students.reduce((sum, student) => sum + student.cash, 0) / students.length : 0,
        2
      )
    },
    students,
    predictionMarkets: markets
  };
}

function listStudentSummaries() {
  return db.prepare(
    `SELECT id, username, display_name, avatar_id, created_at
     FROM users
     ORDER BY display_name COLLATE NOCASE ASC`
  ).all().map((user) => {
    applyDailyWalletFloor(user.id);
    const portfolio = ensurePredictionPortfolio(user.id);
    const totals = getStudentTotals(user.id);
    return {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      avatarPath: getAvatarPath(user.avatar_id),
      createdAt: user.created_at,
      cash: roundNumber(portfolio.cash, 2),
      tradeCount: totals.tradeCount,
      settledTrades: totals.settledTradeCount,
      workDaysCompleted: totals.workDaysCompleted,
      activePositionCount: totals.activePositionCount,
      stayInCashEligible: totals.tradeCount === 0
    };
  });
}

function getStudentTotals(userId) {
  return {
    tradeCount: db.prepare(`SELECT COUNT(*) AS count FROM prediction_market_trades WHERE user_id = ?`).get(userId).count,
    settledTradeCount: db.prepare(
      `SELECT COUNT(*) AS count
       FROM prediction_market_positions
       WHERE user_id = ? AND settled_at IS NOT NULL AND final_payout IS NOT NULL`
    ).get(userId).count,
    workDaysCompleted: db.prepare(`SELECT COUNT(*) AS count FROM prediction_market_work WHERE user_id = ?`).get(userId).count,
    activePositionCount: db.prepare(
      `SELECT COUNT(*) AS count
       FROM prediction_market_positions
       WHERE user_id = ? AND (yes_shares > 0 OR no_shares > 0)`
    ).get(userId).count
  };
}

function getPredictionMarketById(marketId) {
  return db.prepare(
    `SELECT id, title, description, category, desk, probability, evidence, hype, yes_pool, no_pool, status, resolution,
            created_at, published_at, updated_at, resolved_at
     FROM prediction_markets
     WHERE id = ?`
  ).get(marketId);
}

function listPredictionMarkets(limit = 18) {
  return db.prepare(
    `SELECT id, title, description, category, desk, probability, evidence, hype, yes_pool, no_pool, status, resolution,
            created_at, published_at, updated_at, resolved_at
     FROM prediction_markets
     ORDER BY
       CASE status
         WHEN 'active' THEN 0
         WHEN 'resolved' THEN 1
         ELSE 2
       END,
       datetime(updated_at) DESC,
       rowid DESC
     LIMIT ?`
  ).all(limit);
}

function getPredictionMarketFeed(session, limit = 12) {
  const viewerUserId = session?.userId && !session?.isAdmin ? session.userId : null;
  const markets = db.prepare(
    `SELECT id, title, description, category, desk, probability, evidence, hype, yes_pool, no_pool, status, resolution,
            created_at, published_at, updated_at, resolved_at
     FROM prediction_markets
     WHERE status IN ('active', 'resolved')
     ORDER BY
       CASE status
         WHEN 'active' THEN 0
         WHEN 'resolved' THEN 1
         ELSE 2
       END,
       datetime(updated_at) DESC,
       rowid DESC
     LIMIT ?`
  ).all(limit);

  if (!viewerUserId) {
    return markets.map((row) => serializePredictionMarket(row));
  }

  const positions = db.prepare(
    `SELECT market_id, yes_shares, no_shares, final_yes_shares, final_no_shares, final_payout, settled_at
     FROM prediction_market_positions
     WHERE user_id = ?`
  ).all(viewerUserId);
  const positionsByMarket = new Map(positions.map((row) => [row.market_id, row]));

  return markets.map((row) => serializePredictionMarket(row, positionsByMarket.get(row.id) || null));
}

function calculatePredictionMarketProbability(row) {
  if (row.status === "resolved") {
    return row.resolution === "yes" ? 100 : row.resolution === "no" ? 0 : clampPercent(row.probability);
  }
  const yesPool = Math.max(0.001, Number(row.yes_pool || 0));
  const noPool = Math.max(0.001, Number(row.no_pool || 0));
  return clampPercent((yesPool / (yesPool + noPool)) * 100);
}

function serializePredictionMarket(row, position = null) {
  const currentProbability = calculatePredictionMarketProbability(row);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    desk: row.desk,
    probability: clampPercent(row.probability),
    currentProbability,
    evidence: clampPercent(row.evidence),
    hype: clampPercent(row.hype),
    yesPool: roundNumber(row.yes_pool, 2),
    noPool: roundNumber(row.no_pool, 2),
    totalPool: roundNumber(Number(row.yes_pool || 0) + Number(row.no_pool || 0), 2),
    status: row.status,
    resolution: row.resolution || null,
    yesShares: roundNumber(position?.yes_shares, 2),
    noShares: roundNumber(position?.no_shares, 2),
    finalHoldings: position?.settled_at
      ? {
          yesShares: roundNumber(position.final_yes_shares, 2),
          noShares: roundNumber(position.final_no_shares, 2),
          payout: roundNumber(position.final_payout, 2)
        }
      : null,
    createdAt: row.created_at,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at || null
  };
}

function createPredictionMarket(input) {
  const title = toShortText(input.title, "", 120);
  const description = toShortText(input.description, "", 280);
  const category = toShortText(input.category, "Classroom Question", 48);
  const desk = toShortText(input.desk, "Class Market", 48);
  const probability = Math.round(Number(input.probability));
  const evidence = Math.round(Number(input.evidence));
  const hype = Math.round(Number(input.hype));

  if (!title) {
    throw new Error("Write a market question for students to trade.");
  }
  if (!description) {
    throw new Error("Add a little context so students know why the market exists.");
  }
  if (!Number.isFinite(probability) || probability < 5 || probability > 95) {
    throw new Error("Opening probability must be between 5 and 95.");
  }
  if (!Number.isFinite(evidence) || evidence < 0 || evidence > 100) {
    throw new Error("Evidence level must be between 0 and 100.");
  }
  if (!Number.isFinite(hype) || hype < 0 || hype > 100) {
    throw new Error("Hype level must be between 0 and 100.");
  }

  const now = new Date().toISOString();
  const yesPool = roundNumber((probability / 100) * PREDICTION_MARKET_SEED_LIQUIDITY, 2);
  const noPool = roundNumber(PREDICTION_MARKET_SEED_LIQUIDITY - yesPool, 2);
  db.prepare(
    `INSERT INTO prediction_markets
     (id, title, description, category, desk, probability, evidence, hype, yes_pool, no_pool, status, resolution, created_at, published_at, updated_at, resolved_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NULL, ?, ?, ?, NULL)`
  ).run(
    crypto.randomUUID(),
    title,
    description,
    category,
    desk,
    probability,
    evidence,
    hype,
    yesPool,
    noPool,
    now,
    now,
    now
  );
}

function resolvePredictionMarket(marketId, resolution) {
  const market = getPredictionMarketById(marketId);
  if (!market) {
    throw new Error("Prediction market not found.");
  }
  if (market.status !== "active") {
    throw new Error("Only active prediction markets can be resolved.");
  }
  if (!["yes", "no"].includes(resolution)) {
    throw new Error("Resolution must be YES or NO.");
  }

  const now = new Date().toISOString();
  db.prepare(
    `UPDATE prediction_markets
     SET status = 'resolved',
         resolution = ?,
         updated_at = ?,
         resolved_at = ?
     WHERE id = ?`
  ).run(resolution, now, now, marketId);
  settlePredictionMarketPositions(marketId, resolution, now);
}

function archivePredictionMarket(marketId) {
  const market = getPredictionMarketById(marketId);
  if (!market) {
    throw new Error("Prediction market not found.");
  }
  if (market.status === "active") {
    const openInterest = db.prepare(
      `SELECT COUNT(*) AS count
       FROM prediction_market_positions
       WHERE market_id = ? AND (yes_shares > 0 OR no_shares > 0)`
    ).get(marketId).count;
    if (openInterest > 0) {
      throw new Error("Resolve this market before archiving it so student positions can settle cleanly.");
    }
  }

  db.prepare(
    `UPDATE prediction_markets
     SET status = 'archived',
         updated_at = ?
     WHERE id = ?`
  ).run(new Date().toISOString(), marketId);
}

function initializePredictionPortfolio(userId) {
  const now = new Date().toISOString();
  db.prepare(
    `INSERT OR REPLACE INTO prediction_market_portfolios (user_id, cash, created_at, updated_at)
     VALUES (?, ?, COALESCE((SELECT created_at FROM prediction_market_portfolios WHERE user_id = ?), ?), ?)`
  ).run(userId, PREDICTION_MARKET_START_CASH, userId, now, now);
}

function ensurePredictionPortfolio(userId) {
  const existing = db.prepare(
    `SELECT user_id, cash, created_at, updated_at
     FROM prediction_market_portfolios
     WHERE user_id = ?`
  ).get(userId);
  if (existing) {
    return existing;
  }
  initializePredictionPortfolio(userId);
  return db.prepare(
    `SELECT user_id, cash, created_at, updated_at
     FROM prediction_market_portfolios
     WHERE user_id = ?`
  ).get(userId);
}

function serializePredictionPortfolio(userId) {
  const portfolio = ensurePredictionPortfolio(userId);
  return {
    cash: roundNumber(portfolio?.cash, 2)
  };
}

function getPredictionMarketWorkDate(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: PREDICTION_MARKET_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value || "0000";
  const month = parts.find((part) => part.type === "month")?.value || "00";
  const day = parts.find((part) => part.type === "day")?.value || "00";
  return `${year}-${month}-${day}`;
}

function getPredictionMarketWorkSeed(workDate) {
  return workDate
    .replace(/-/g, "")
    .split("")
    .reduce((sum, digit, index) => sum + Number(digit) * (index + 1), 0);
}

function getPredictionMarketWorkTasks(workDate = getPredictionMarketWorkDate()) {
  const start = getPredictionMarketWorkSeed(workDate) % PREDICTION_MARKET_WORK_TEMPLATES.length;
  const picked = [];

  for (let offset = 0; picked.length < 3; offset += 1) {
    const candidate = PREDICTION_MARKET_WORK_TEMPLATES[(start + offset) % PREDICTION_MARKET_WORK_TEMPLATES.length];
    if (!picked.some((task) => task.id === candidate.id)) {
      picked.push(candidate);
    }
  }

  return picked;
}

function serializePredictionWorkTask(task) {
  return {
    id: task.id,
    type: task.type,
    title: task.title,
    description: task.description,
    prompt: task.prompt,
    basePay: roundNumber(task.basePay, 2),
    bonusPay: roundNumber(task.bonusPay, 2),
    maxPay: roundNumber(task.basePay + task.bonusPay, 2),
    artKey: task.artKey || null,
    choices: task.choices.map((choice) => ({
      id: choice.id,
      label: choice.label
    }))
  };
}

function getPredictionWorkSubmission(userId, workDate = getPredictionMarketWorkDate()) {
  return db.prepare(
    `SELECT user_id, work_date, task_id, choice_id, title, payout, accuracy_bonus, was_correct, created_at
     FROM prediction_market_work
     WHERE user_id = ? AND work_date = ?`
  ).get(userId, workDate);
}

function buildPredictionWorkBoard(session) {
  const workDate = getPredictionMarketWorkDate();
  if (!session?.userId || session?.isAdmin) {
    return {
      available: false,
      canWork: false,
      workDate,
      tasks: [],
      completedTask: null
    };
  }

  const tasks = getPredictionMarketWorkTasks(workDate);
  const submission = getPredictionWorkSubmission(session.userId, workDate);
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const completedTask = submission
    ? (() => {
        const task = taskById.get(submission.task_id) || null;
        const selectedChoice = task?.choices.find((choice) => choice.id === submission.choice_id) || null;
        return {
          taskId: submission.task_id,
          title: submission.title,
          type: task?.type || "Work",
          payout: roundNumber(submission.payout, 2),
          accuracyBonus: roundNumber(submission.accuracy_bonus, 2),
          wasCorrect: Boolean(submission.was_correct),
          selectedChoiceLabel: selectedChoice?.label || null,
          submittedAt: submission.created_at
        };
      })()
    : null;

  return {
    available: true,
    canWork: !submission,
    workDate,
    tasks: tasks.map(serializePredictionWorkTask),
    completedTask
  };
}

function getPredictionPosition(marketId, userId) {
  return db.prepare(
    `SELECT market_id, user_id, yes_shares, no_shares, final_yes_shares, final_no_shares, final_payout, settled_at, updated_at
     FROM prediction_market_positions
     WHERE market_id = ? AND user_id = ?`
  ).get(marketId, userId);
}

function ensurePredictionPosition(marketId, userId) {
  const existing = getPredictionPosition(marketId, userId);
  if (existing) {
    return existing;
  }
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO prediction_market_positions
     (market_id, user_id, yes_shares, no_shares, final_yes_shares, final_no_shares, final_payout, settled_at, updated_at)
     VALUES (?, ?, 0, 0, NULL, NULL, NULL, NULL, ?)`
  ).run(marketId, userId, now);
  return getPredictionPosition(marketId, userId);
}

function getPredictionMarketUnitPrice(market, side) {
  const yesProbability = calculatePredictionMarketProbability(market) / 100;
  return side === "yes" ? yesProbability : 1 - yesProbability;
}

function updatePredictionPortfolioCash(userId, nextCash, now) {
  db.prepare(
    `UPDATE prediction_market_portfolios
     SET cash = ?, updated_at = ?
     WHERE user_id = ?`
  ).run(roundNumber(nextCash, 2), now, userId);
}

function updatePredictionPositionShares(marketId, userId, yesShares, noShares, now) {
  db.prepare(
    `UPDATE prediction_market_positions
     SET yes_shares = ?, no_shares = ?, updated_at = ?
     WHERE market_id = ? AND user_id = ?`
  ).run(roundNumber(yesShares, 2), roundNumber(noShares, 2), now, marketId, userId);
}

function executePredictionTrade(userId, input) {
  const marketId = String(input.marketId || "");
  const tradeKey = String(input.trade || "");
  const quantity = PREDICTION_MARKET_TRADE_BLOCK;
  const market = getPredictionMarketById(marketId);

  if (!market || market.status !== "active") {
    throw new Error("That market is not open for trading.");
  }

  const [direction, side] = tradeKey.split("-");
  if (!["buy", "sell"].includes(direction) || !["yes", "no"].includes(side)) {
    throw new Error("Unknown trade type.");
  }

  const portfolio = ensurePredictionPortfolio(userId);
  const position = ensurePredictionPosition(marketId, userId);
  const unitPrice = getPredictionMarketUnitPrice(market, side);
  const totalCost = roundNumber(unitPrice * quantity, 2);
  const yesShares = Number(position.yes_shares || 0);
  const noShares = Number(position.no_shares || 0);
  const nextYesShares = side === "yes"
    ? yesShares + (direction === "buy" ? quantity : -quantity)
    : yesShares;
  const nextNoShares = side === "no"
    ? noShares + (direction === "buy" ? quantity : -quantity)
    : noShares;

  if (direction === "buy" && totalCost > Number(portfolio.cash || 0) + 0.001) {
    throw new Error("Not enough cash for that 5-share block.");
  }
  if (side === "yes" && nextYesShares < -0.001) {
    throw new Error("You do not own enough YES shares to sell that amount.");
  }
  if (side === "no" && nextNoShares < -0.001) {
    throw new Error("You do not own enough NO shares to sell that amount.");
  }

  const now = new Date().toISOString();
  const nextCash = direction === "buy"
    ? Number(portfolio.cash || 0) - totalCost
    : Number(portfolio.cash || 0) + totalCost;
  const yesPool = Number(market.yes_pool || 0) + (side === "yes" ? (direction === "buy" ? quantity : -quantity) : 0);
  const noPool = Number(market.no_pool || 0) + (side === "no" ? (direction === "buy" ? quantity : -quantity) : 0);

  if (yesPool <= 0 || noPool <= 0) {
    throw new Error("That trade would break market liquidity. Try a smaller move.");
  }

  updatePredictionPortfolioCash(userId, nextCash, now);
  updatePredictionPositionShares(marketId, userId, nextYesShares, nextNoShares, now);
  db.prepare(
    `UPDATE prediction_markets
     SET yes_pool = ?, no_pool = ?, updated_at = ?
     WHERE id = ?`
  ).run(roundNumber(yesPool, 2), roundNumber(noPool, 2), now, marketId);
  db.prepare(
    `INSERT INTO prediction_market_trades
     (id, market_id, user_id, direction, side, quantity, unit_price, total_cost, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(crypto.randomUUID(), marketId, userId, direction, side, quantity, roundNumber(unitPrice, 4), totalCost, now);
}

function executePredictionWork(userId, input) {
  const workDate = getPredictionMarketWorkDate();
  if (getPredictionWorkSubmission(userId, workDate)) {
    throw new Error("You already completed today’s off-market work.");
  }

  const taskId = String(input.taskId || "");
  const choiceId = String(input.choiceId || "");
  const task = getPredictionMarketWorkTasks(workDate).find((entry) => entry.id === taskId);
  if (!task) {
    throw new Error("That work opportunity is no longer available.");
  }

  const choice = task.choices.find((entry) => entry.id === choiceId);
  if (!choice) {
    throw new Error("Choose one answer to turn in that work task.");
  }

  const accuracyBonus = choice.correct ? Number(task.bonusPay || 0) : 0;
  const payout = roundNumber(Number(task.basePay || 0) + accuracyBonus, 2);
  const now = new Date().toISOString();
  const portfolio = ensurePredictionPortfolio(userId);

  updatePredictionPortfolioCash(userId, Number(portfolio.cash || 0) + payout, now);
  db.prepare(
    `INSERT INTO prediction_market_work
     (user_id, work_date, task_id, choice_id, title, payout, accuracy_bonus, was_correct, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    userId,
    workDate,
    task.id,
    choice.id,
    task.title,
    payout,
    roundNumber(accuracyBonus, 2),
    choice.correct ? 1 : 0,
    now
  );
}

function settlePredictionMarketPositions(marketId, resolution, now) {
  const positions = db.prepare(
    `SELECT user_id, yes_shares, no_shares
     FROM prediction_market_positions
     WHERE market_id = ? AND settled_at IS NULL AND (yes_shares > 0 OR no_shares > 0)`
  ).all(marketId);

  positions.forEach((position) => {
    const payout = roundNumber(
      Number(position.yes_shares || 0) * (resolution === "yes" ? 1 : 0)
      + Number(position.no_shares || 0) * (resolution === "no" ? 1 : 0),
      2
    );
    const portfolio = ensurePredictionPortfolio(position.user_id);
    updatePredictionPortfolioCash(position.user_id, Number(portfolio.cash || 0) + payout, now);
    db.prepare(
      `UPDATE prediction_market_positions
       SET final_yes_shares = ?, final_no_shares = ?, final_payout = ?, yes_shares = 0, no_shares = 0, settled_at = ?, updated_at = ?
       WHERE market_id = ? AND user_id = ?`
    ).run(
      roundNumber(position.yes_shares, 2),
      roundNumber(position.no_shares, 2),
      payout,
      now,
      now,
      marketId,
      position.user_id
    );
  });
}

function applyDailyWalletFloor(userId) {
  const refreshDate = getPredictionMarketWorkDate();
  const existing = db.prepare(
    `SELECT amount
     FROM prediction_market_wallet_refreshes
     WHERE user_id = ? AND refresh_date = ? AND reason = 'daily-floor'`
  ).get(userId, refreshDate);

  if (existing) {
    return null;
  }

  const portfolio = ensurePredictionPortfolio(userId);
  const currentCash = Number(portfolio.cash || 0);
  const amount = currentCash < PREDICTION_MARKET_START_CASH
    ? roundNumber(PREDICTION_MARKET_START_CASH - currentCash, 2)
    : 0;
  const now = new Date().toISOString();

  if (amount > 0) {
    updatePredictionPortfolioCash(userId, currentCash + amount, now);
  }

  db.prepare(
    `INSERT INTO prediction_market_wallet_refreshes (user_id, refresh_date, amount, reason, created_at)
     VALUES (?, ?, ?, 'daily-floor', ?)`
  ).run(userId, refreshDate, amount, now);

  return amount > 0
    ? {
        amount,
        refreshDate,
        reason: "daily-floor"
      }
    : null;
}

function refillAllPredictionWallets() {
  const users = db.prepare(`SELECT id FROM users`).all();
  const now = new Date().toISOString();
  users.forEach((user) => {
    const portfolio = ensurePredictionPortfolio(user.id);
    const currentCash = Number(portfolio.cash || 0);
    if (currentCash >= PREDICTION_MARKET_START_CASH) {
      return;
    }
    updatePredictionPortfolioCash(user.id, PREDICTION_MARKET_START_CASH, now);
  });
}

function listStudentPositions(userId) {
  return db.prepare(
    `SELECT p.market_id, p.yes_shares, p.no_shares, p.final_yes_shares, p.final_no_shares, p.final_payout, p.settled_at,
            m.title, m.status, m.resolution, m.updated_at
     FROM prediction_market_positions p
     JOIN prediction_markets m ON m.id = p.market_id
     WHERE p.user_id = ? AND (
       p.yes_shares > 0 OR p.no_shares > 0 OR p.settled_at IS NOT NULL
     )
     ORDER BY
       CASE WHEN m.status = 'active' THEN 0 ELSE 1 END,
       datetime(m.updated_at) DESC`
  ).all(userId).map((row) => ({
    marketId: row.market_id,
    title: row.title,
    status: row.status,
    resolution: row.resolution || null,
    yesShares: roundNumber(row.yes_shares, 2),
    noShares: roundNumber(row.no_shares, 2),
    finalYesShares: roundNumber(row.final_yes_shares, 2),
    finalNoShares: roundNumber(row.final_no_shares, 2),
    finalPayout: roundNumber(row.final_payout, 2),
    settledAt: row.settled_at || null,
    updatedAt: row.updated_at
  }));
}

function listStudentTrades(userId, limit = 10) {
  return db.prepare(
    `SELECT t.market_id, t.direction, t.side, t.quantity, t.unit_price, t.total_cost, t.created_at, m.title
     FROM prediction_market_trades t
     JOIN prediction_markets m ON m.id = t.market_id
     WHERE t.user_id = ?
     ORDER BY datetime(t.created_at) DESC, t.rowid DESC
     LIMIT ?`
  ).all(userId, limit).map((row) => ({
    marketId: row.market_id,
    title: row.title,
    direction: row.direction,
    side: row.side,
    quantity: roundNumber(row.quantity, 2),
    unitPrice: roundNumber(row.unit_price, 4),
    totalCost: roundNumber(row.total_cost, 2),
    createdAt: row.created_at
  }));
}

function serializeViewerUser(userId) {
  const user = getUserById(userId);
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    avatarPath: getAvatarPath(user.avatar_id)
  };
}

function getUserById(userId) {
  return db.prepare(
    `SELECT id, username, display_name, password_hash, avatar_id, created_at
     FROM users
     WHERE id = ?`
  ).get(userId);
}

function getUserByUsername(username) {
  return db.prepare(
    `SELECT id, username, display_name, password_hash, avatar_id, created_at
     FROM users
     WHERE username = ?`
  ).get(username);
}

let avatarCatalogCache = null;

function getAvatarCatalog() {
  if (avatarCatalogCache) {
    return avatarCatalogCache;
  }

  try {
    const raw = fs.readFileSync(AVATAR_MANIFEST_PATH, "utf8");
    const parsed = JSON.parse(raw);
    avatarCatalogCache = Array.isArray(parsed)
      ? parsed.map((entry) => ({
          id: String(entry.id || ""),
          path: String(entry.path || ""),
          filename: String(entry.filename || "")
        })).filter((entry) => entry.id && entry.path)
      : [];
  } catch {
    avatarCatalogCache = [];
  }

  return avatarCatalogCache;
}

function getAvatarById(avatarId) {
  return getAvatarCatalog().find((entry) => entry.id === avatarId) || null;
}

function getAvatarPath(avatarId) {
  return getAvatarById(avatarId)?.path || null;
}

function getSettings() {
  const rows = db.prepare(`SELECT key, value FROM settings`).all();
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    teacherUsername: map.teacher_username || DEFAULT_TEACHER_USERNAME,
    teacherPasswordHash: map.teacher_password_hash || hashPassword(DEFAULT_TEACHER_PASSWORD)
  };
}

function setSetting(key, value) {
  db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(key, value);
}

function runInTransaction(callback) {
  db.exec("BEGIN IMMEDIATE TRANSACTION");
  try {
    const value = callback();
    db.exec("COMMIT");
    return value;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function createSession(payload) {
  const sid = crypto.randomUUID();
  sessions.set(sid, {
    userId: payload.userId || null,
    isAdmin: Boolean(payload.isAdmin),
    createdAt: Date.now()
  });
  return sid;
}

function getSession(req) {
  const sid = parseCookies(req.headers.cookie || "")[SESSION_COOKIE];
  if (!sid) {
    return null;
  }
  return sessions.get(sid) || null;
}

function setSessionCookie(res, sid) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${sid}; HttpOnly; Path=/; SameSite=Lax`);
}

function clearSession(req, res) {
  const sid = parseCookies(req.headers.cookie || "")[SESSION_COOKIE];
  if (sid) {
    sessions.delete(sid);
  }
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
}

function parseCookies(raw) {
  return raw.split(";").reduce((cookies, pair) => {
    const [key, ...rest] = pair.trim().split("=");
    if (!key) {
      return cookies;
    }
    cookies[key] = decodeURIComponent(rest.join("=") || "");
    return cookies;
  }, {});
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Request body was not valid JSON.");
  }
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, contents) => {
    if (error) {
      sendJson(res, 404, { error: "Not found." });
      return;
    }
    res.writeHead(200, {
      "Content-Type": getContentType(filePath),
      "Cache-Control": "no-store"
    });
    res.end(contents);
  });
}

function sendStatic(res, pathname) {
  const safePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!safePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { error: "Forbidden." });
    return;
  }
  fs.stat(safePath, (error, stats) => {
    if (error || !stats.isFile()) {
      sendJson(res, 404, { error: "Not found." });
      return;
    }
    sendFile(res, safePath);
  });
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 20);
}

function toShortText(value, fallback, maxLength) {
  const trimmed = String(value ?? "").trim();
  return trimmed ? trimmed.slice(0, maxLength) : fallback;
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

function clampPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(number)));
}

function roundNumber(value, places = 2) {
  const number = Number(value || 0);
  const factor = 10 ** places;
  return Math.round(number * factor) / factor;
}
