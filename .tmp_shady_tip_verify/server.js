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
const MIN_STOCK_PRICE = 0.01;
const VOLATILITY_LEVELS = new Set(["Low", "Medium", "High", "Extreme"]);
const SHADY_TIP_TARGET_STREAK = 4;
const SHADY_TIP_SHARE_REWARD_RANGE = { min: 5, max: 25 };
const SHADY_TIP_PERCENT_PENALTIES = [50, 35, 20, 10];
const SHADY_TIP_CASH_FINES = [500, 350, 200, 100];
const SCHOOL_TIMEZONE = "America/Detroit";
const RESEARCH_USES_PER_WINDOW = 3;
const RESEARCH_CHOICES = 3;
const RESEARCH_CLASS_DAYS = 5;
const RESEARCH_PLANS_PER_OPEN = 3;
const RESEARCH_OPEN_SLOTS = 2;
const RESEARCH_WAVE_DELAY_MS = 10 * 60 * 1000;
const RESEARCH_PERCENT_OPTIONS = [-16, -13, -11, -8, -6, 6, 8, 11, 13, 16];
const IPO_BREAKOUT_DELAY_MS = 10 * 60 * 1000;
const LOTTERY_TICKET_COST = 500;
const LOTTERY_CHOICES = 50;
const LOTTERY_PAYOUT_MULTIPLIER_RANGE = { min: 5, max: 10 };
const LOBBY_TARGET_VOTES = 4;
const LOBBY_STARTING_VOTES = 1;
const LOBBY_MAX_ATTEMPTS = 3;
const LOBBY_WIN_PERCENT_RANGE = { min: 50, max: 75 };
const LOBBY_LOSS_PERCENT_RANGE = { min: 20, max: 40 };
const LOBBY_FREEZE_MS = 10 * 60 * 1000;
const LOBBY_MEMBERS = [
  {
    id: "chair",
    name: "Committee Chair",
    image: "/assets/congress1.png",
    clue: "High influence, but hates wasting political capital.",
    risk: "Big swing",
    supportChance: 42,
    undecidedChance: 30,
    supportVotes: 2,
    opposeVotes: -1
  },
  {
    id: "business",
    name: "Business Caucus",
    image: "/assets/congress2.png",
    clue: "Usually listens when markets and jobs are involved.",
    risk: "Safer pick",
    supportChance: 60,
    undecidedChance: 25,
    supportVotes: 2,
    opposeVotes: -1
  },
  {
    id: "swing",
    name: "Swing Vote",
    image: "/assets/congress3.png",
    clue: "Persuadable, but nobody knows where they land.",
    risk: "Coin-flip energy",
    supportChance: 35,
    undecidedChance: 50,
    supportVotes: 2,
    opposeVotes: -1
  },
  {
    id: "watchdog",
    name: "Ethics Watchdog",
    image: "/assets/congress4.png",
    clue: "Can help legitimacy, but backlash is more likely.",
    risk: "Risky",
    supportChance: 24,
    undecidedChance: 26,
    supportVotes: 2,
    opposeVotes: -2
  },
  {
    id: "whip",
    name: "Party Whip",
    image: "/assets/congress5.png",
    clue: "Can move votes quickly if the pitch lands.",
    risk: "Power play",
    supportChance: 48,
    undecidedChance: 20,
    supportVotes: 3,
    opposeVotes: -1
  }
];
const IPO_WAVES = {
  "2026-04-16": {
    2: {
      title: "After-Hours IPO Rush",
      breakoutTicker: "NXT",
      breakoutPercent: 350,
      companies: [
        {
          ticker: "NXT",
          name: "NextQuest Arcade",
          industry: "Gaming",
          startingPrice: 14,
          volatility: "Extreme",
          bio: "A flashy arcade studio promising that its next game is part esports hit, part social network, and part sleep-deprivation machine.",
          pros: ["Huge hype energy", "Streamer-friendly launch"],
          cons: ["Can burn out fast", "Depends on one big release"]
        },
        {
          ticker: "POP",
          name: "PopRocket Snacks",
          industry: "Food and Beverage",
          startingPrice: 11,
          volatility: "High",
          bio: "A startup selling fizzy candy, caffeinated gummies, and enough neon branding to make grocery shelves nervous.",
          pros: ["Strong teen buzz", "Cheap enough to feel like a lottery ticket"],
          cons: ["Trend could vanish overnight", "Nutrition experts would like a word"]
        },
        {
          ticker: "AER",
          name: "AeroBurst Systems",
          industry: "Aerospace",
          startingPrice: 19,
          volatility: "Medium",
          bio: "A young aircraft-tech company building lighter parts, smarter dashboards, and investor decks full of words like orbital-adjacent.",
          pros: ["Serious contracts possible", "Feels futuristic"],
          cons: ["Capital-intensive business", "Every delay gets expensive"]
        }
      ]
    }
  },
  "2026-04-17": {
    1: {
      title: "Morning IPO Rush",
      breakoutTicker: "PIX",
      breakoutPercent: 350,
      companies: [
        {
          ticker: "PIX",
          name: "Pixel Paddock",
          industry: "Digital Media",
          startingPrice: 9,
          volatility: "Extreme",
          bio: "An 8-bit media company built on horse games, retro streams, and the powerful belief that every genre improves when hoofbeats are added.",
          pros: ["Meme-stock potential", "Cheap entry with loud upside"],
          cons: ["Wildly niche", "Could collapse just as fast"]
        },
        {
          ticker: "CRD",
          name: "CircuitDrop",
          industry: "Consumer Electronics",
          startingPrice: 16,
          volatility: "High",
          bio: "A gadget startup that keeps shipping tiny flashy devices people absolutely do not need and then somehow convincing them they do.",
          pros: ["Fast product cycles", "Impulse-buy magnet"],
          cons: ["Margins are shaky", "One dud launch hurts"]
        },
        {
          ticker: "BNR",
          name: "Barn Burner Robotics",
          industry: "Industrial Tech",
          startingPrice: 22,
          volatility: "Medium",
          bio: "A robotics company automating warehouses, farms, and any workplace where humans would rather not lift the heavy weird box.",
          pros: ["Real business demand", "Automation story sells well"],
          cons: ["Growth can be slower", "Hardware mistakes are costly"]
        }
      ]
    }
  }
};
const HOLDING_PROGRESS_PREFIX = "holding-start:";
const SEEN_BELOW_START_KEY = "seen-below-start-at";
const SEEN_BELOW_HALF_KEY = "seen-below-half-at";
const SHADY_TIP_USED_AT_KEY = "shady-tip-used-at";
const SHADY_TIP_WON_AT_KEY = "shady-tip-won-at";
const UNTOUCHABLE_STREAK_KEY = "untouchable-streak";
const BADGE_DEFS = [
  { id: "opening-bell", label: "Opening Bell", description: "Make a trade within 60 seconds of logging in." },
  { id: "watch-captain", label: "Watch Captain", description: "Track at least 5 companies on your watchlist." },
  { id: "diversifier", label: "Diversifier", description: "Hold stocks from at least 3 different industries." },
  { id: "in-the-green", label: "In The Green", description: "Grow your portfolio above your starting cash." },
  { id: "heavy-hitter", label: "Heavy Hitter", description: "Own 25 or more shares of a single stock." },
  { id: "floor-veteran", label: "Floor Veteran", description: "Complete 10 or more trades." },
  { id: "shady-survivor", label: "Shady Survivor", description: "Win a Shady Tip run this session." },
  { id: "paper-hands", label: "Paper Hands", description: "Buy and sell the same stock in one session." },
  { id: "diamond-hands", label: "Diamond Hands", description: "Hold the same stock across 3 class sessions." },
  { id: "horse-whisperer", label: "Horse Whisperer", description: "Somehow make money on Just Horses." },
  { id: "goat-logistics-expert", label: "Goat Logistics Expert", description: "Own MegaCorp after a goat-sized MegaCorp headline." },
  { id: "basement-billionaire", label: "Basement Billionaire", description: "Turn a profit on Utter Nonsense." },
  { id: "natural-disaster", label: "Natural Disaster", description: "Own Haven Holistics and Immortal Life at the same time." },
  { id: "snacks-investor-of-the-year", label: "Snacks Investor of the Year", description: "Own Snack City and Yum Yum Tum Tum together." },
  { id: "oops-all-volatility", label: "Oops, All Volatility", description: "Hold 3 high- or extreme-volatility stocks at once." },
  { id: "comeback-kid", label: "Comeback Kid", description: "Climb back above your starting cash after dipping below it." },
  { id: "shady-character", label: "Shady Character", description: "Use Shady Tip at least once." },
  { id: "market-wizard", label: "Market Wizard", description: "Finish a badge day in first place while still in the green." },
  { id: "phoenix", label: "Phoenix", description: "Climb back above your starting cash after dropping below half." },
  { id: "untouchable", label: "Untouchable", description: "Go 3 badge days in a row without a losing sell." },
  { id: "chaos-reigns", label: "Chaos Reigns", description: "Win Shady Tip and still eat a losing sell before badge day." },
  { id: "collector-supreme", label: "Collector Supreme", description: "Own 10 different companies at once." },
  { id: "brain-rot-capital", label: "Brain Rot Capital", description: "Own Wik Wok and Just Horses at the same time." },
  { id: "doomsday-prepper", label: "Doomsday Prepper", description: "Own Haven Holistics, Immortal Life, and Don't Buy Me together." },
  { id: "snackcident", label: "Snackcident", description: "Lose money on Snack City." },
  { id: "go-big-or-goat-home", label: "Go Big or Goat Home", description: "Put more than half your portfolio into MegaCorp." },
  { id: "basement-visitor", label: "Basement Visitor", description: "Own Utter Nonsense and Just Horses at the same time." },
  { id: "ice-in-your-veins", label: "Ice In Your Veins", description: "Hold through bad news and still end badge day in profit." },
  { id: "balanced-breakfast", label: "Balanced Breakfast", description: "Own at least one stock in 5 industries at once." },
  { id: "last-second-legend", label: "Last-Second Legend", description: "Lock in a profitable sell during the final minute before the market closes." }
];

const PLANNED_RESEARCH_WEEK = {
  "2026-04-13": {
    1: [
      { ticker: "HHS", percentChange: 62, hintText: "One wellness stock is lining up for a huge AM Trading Window." },
      { ticker: "MC", percentChange: -8, hintText: "A mega-sized consumer giant may wobble in the AM Trading Window." },
      { ticker: "SC", percentChange: 13, hintText: "A snack stock looks ready to pop in the AM Trading Window." }
    ],
    2: [
      { ticker: "SSC", percentChange: -54, hintText: "A cyber security name may get crushed in the PM Trading Window." },
      { ticker: "WW", percentChange: 8, hintText: "A scrolling-video company could quietly rise in the PM Trading Window." },
      { ticker: "MCM", percentChange: 6, hintText: "An auto parts stock may grind a little higher in the PM Trading Window." }
    ]
  },
  "2026-04-14": {
    1: [
      { ticker: "UNO", percentChange: 71, hintText: "A gaming company looks dangerously explosive for the AM Trading Window." },
      { ticker: "YTT", percentChange: -6, hintText: "A classic snack-and-soda company may slide a bit in the AM Trading Window." },
      { ticker: "HFW", percentChange: 8, hintText: "A phone giant could catch a modest lift in the AM Trading Window." }
    ],
    2: [
      { ticker: "IMM", percentChange: 83, hintText: "A biotech moonshot may go absolutely wild in the PM Trading Window." },
      { ticker: "WMO", percentChange: -8, hintText: "A cheap-stuff retail player may sag in the PM Trading Window." },
      { ticker: "SKY", percentChange: 6, hintText: "An aircraft stock looks steady-to-strong for the PM Trading Window." }
    ]
  },
  "2026-04-15": {
    1: [
      { ticker: "DBM", percentChange: 94, hintText: "A mystery stock may go totally off the rails in the AM Trading Window." },
      { ticker: "SAE", percentChange: 11, hintText: "A merch-heavy entertainment name looks ready for a strong AM Trading Window." },
      { ticker: "JHS", percentChange: -13, hintText: "A very horse-focused media stock may get bucked in the AM Trading Window." }
    ],
    2: [
      { ticker: "MC", percentChange: 57, hintText: "A sprawling conglomerate may stampede upward in the PM Trading Window." },
      { ticker: "HHS", percentChange: -8, hintText: "A wellness darling may cool off in the PM Trading Window." },
      { ticker: "SC", percentChange: 11, hintText: "One messy snack company still has momentum heading into the PM Trading Window." }
    ]
  },
  "2026-04-16": {
    1: [
      { ticker: "SSC", percentChange: 68, hintText: "A security firm may rocket higher in the AM Trading Window." },
      { ticker: "WW", percentChange: -8, hintText: "A viral media stock may take a hit in the AM Trading Window." },
      { ticker: "MCM", percentChange: 6, hintText: "An old-school manufacturing name could inch up in the AM Trading Window." }
    ],
    2: [
      { ticker: "UNO", percentChange: -63, hintText: "A high-chaos game stock may completely wipe out in the PM Trading Window." },
      { ticker: "YTT", percentChange: 8, hintText: "A familiar food stock may recover in the PM Trading Window." },
      { ticker: "IMM", percentChange: 16, hintText: "A biotech wildcard looks primed for another surge in the PM Trading Window." }
    ]
  },
  "2026-04-17": {
    1: [
      { ticker: "HFW", percentChange: -52, hintText: "A phone company may crater in the AM Trading Window." },
      { ticker: "WMO", percentChange: 11, hintText: "A discount-shopping giant may rip higher in the AM Trading Window." },
      { ticker: "SKY", percentChange: 8, hintText: "An aircraft stock could cruise upward in the AM Trading Window." }
    ],
    2: [
      { ticker: "SAE", percentChange: -77, hintText: "A celebrity brand stock may face a brutal collapse in the PM Trading Window." },
      { ticker: "DBM", percentChange: -11, hintText: "A mystery stock may reverse hard in the PM Trading Window." },
      { ticker: "JHS", percentChange: 16, hintText: "A horse stock may make one last ridiculous run in the PM Trading Window." }
    ]
  }
};

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
    recordLoginEvent(userId);

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

    recordLoginEvent(user.id);
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

  if (req.method === "POST" && pathname === "/api/shady-tip/start") {
    if (!session?.userId || session.isAdmin) {
      sendJson(res, 401, { error: "Log in as a student to use Shady Tip." });
      return;
    }

    try {
      const currentNumber = runInTransaction(() => startShadyTip(session.userId));
      sendJson(res, 200, {
        ...buildBootstrapPayload(session),
        message: `Shady Tip is live. Starting number: ${currentNumber}.`
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/shady-tip/guess") {
    if (!session?.userId || session.isAdmin) {
      sendJson(res, 401, { error: "Log in as a student to use Shady Tip." });
      return;
    }

    const body = await readJsonBody(req);
    const guess = body.guess === "lower" ? "lower" : body.guess === "higher" ? "higher" : "";
    if (!guess) {
      sendJson(res, 400, { error: "Choose higher or lower." });
      return;
    }

    try {
      const result = runInTransaction(() => resolveShadyTipGuess(session.userId, guess));
      sendJson(res, 200, {
        ...buildBootstrapPayload(session),
        message: result.message
      });
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

  if (req.method === "POST" && pathname === "/api/research/start") {
    if (!session?.userId || session.isAdmin) {
      sendJson(res, 401, { error: "Log in as a student to research stocks." });
      return;
    }

    try {
      const result = runInTransaction(() => startResearchRun(session.userId));
      sendJson(res, 200, {
        ...buildBootstrapPayload(session),
        researchResult: {
          type: "started",
          label: result.label
        },
        message: `Research scan started for ${result.label}.`
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/research/pick") {
    if (!session?.userId || session.isAdmin) {
      sendJson(res, 401, { error: "Log in as a student to research stocks." });
      return;
    }

    const body = await readJsonBody(req);
    const choice = Number(body.choice);
    if (!Number.isInteger(choice) || choice < 1 || choice > RESEARCH_CHOICES) {
      sendJson(res, 400, { error: "Pick one of the three dollar signs." });
      return;
    }

    try {
      const result = runInTransaction(() => resolveResearchPick(session.userId, choice));
      sendJson(res, 200, {
        ...buildBootstrapPayload(session),
        researchResult: result,
        message: result.message
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/lottery/start") {
    if (!session?.userId || session.isAdmin) {
      sendJson(res, 401, { error: "Log in as a student to buy a lottery ticket." });
      return;
    }

    try {
      const result = runInTransaction(() => startLotteryRun(session.userId));
      sendJson(res, 200, {
        ...buildBootstrapPayload(session),
        lotteryResult: {
          type: "started",
          label: result.label
        },
        message: `Ticket bought for ${formatCurrency(LOTTERY_TICKET_COST)}. Pick one of the 50 tickets.`
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/lottery/pick") {
    if (!session?.userId || session.isAdmin) {
      sendJson(res, 401, { error: "Log in as a student to use a lottery ticket." });
      return;
    }

    const body = await readJsonBody(req);
    const choice = Number(body.choice);
    if (!Number.isInteger(choice) || choice < 1 || choice > LOTTERY_CHOICES) {
      sendJson(res, 400, { error: "Pick one of the 50 tickets." });
      return;
    }

    try {
      const result = runInTransaction(() => resolveLotteryPick(session.userId, choice));
      sendJson(res, 200, {
        ...buildBootstrapPayload(session),
        lotteryResult: result,
        message: result.message
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/lobby/start") {
    if (!session?.userId || session.isAdmin) {
      sendJson(res, 401, { error: "Log in as a student to lobby Congress." });
      return;
    }

    const body = await readJsonBody(req);
    const ticker = String(body.ticker || "").trim().toUpperCase();

    try {
      const result = runInTransaction(() => startLobbyRun(session.userId, ticker));
      sendJson(res, 200, {
        ...buildBootstrapPayload(session),
        lobbyResult: {
          type: "started",
          ticker: result.ticker
        },
        message: `Lobbying effort started for ${result.ticker}.`
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/lobby/pick") {
    if (!session?.userId || session.isAdmin) {
      sendJson(res, 401, { error: "Log in as a student to lobby Congress." });
      return;
    }

    const body = await readJsonBody(req);
    const memberId = String(body.memberId || "").trim();

    try {
      const result = runInTransaction(() => resolveLobbyPick(session.userId, memberId));
      sendJson(res, 200, {
        ...buildBootstrapPayload(session),
        lobbyResult: result,
        message: result.message
      });
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
    const result = runInTransaction(() => updateMarketState(Boolean(body.isOpen)));
    sendJson(res, 200, {
      ...buildBootstrapPayload(session),
      message: result?.message || "Market updated."
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/badges/award") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    try {
      const result = runInTransaction(() => awardBadgeDay());
      sendJson(res, 200, {
        ...buildBootstrapPayload(session),
        badgeAwardResult: result,
        message: `Badge Day ${result.badgeDayNumber} awarded with ${result.awardsGranted} badge win${result.awardsGranted === 1 ? "" : "s"}.`
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
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

    if (!headline) {
    sendJson(res, 400, { error: "Events need a headline." });
    return;
  }

  try {
    runInTransaction(() => publishEvent(headline, bodyText, effects, { isBigStory: Boolean(body.isBigStory) }));
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

    if (!Number.isFinite(startingPrice) || startingPrice < MIN_STOCK_PRICE || !Number.isFinite(price) || price < MIN_STOCK_PRICE) {
      sendJson(res, 400, { error: "Starting price and current price must both be at least $0.01." });
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

  if (req.method === "POST" && pathname === "/api/admin/student/reward") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);
    const userId = String(body.userId || "");
    const amount = roundMoney(Number(body.amount));
    if (!Number.isFinite(amount) || amount <= 0) {
      sendJson(res, 400, { error: "Reward amount must be a positive dollar value." });
      return;
    }

    if (amount > 1000000) {
      sendJson(res, 400, { error: "Reward amounts must be under $1,000,000." });
      return;
    }

    const user = getUserById(userId);
    if (!user) {
      sendJson(res, 404, { error: "Student account not found." });
      return;
    }

    db.prepare(`UPDATE users SET cash = ? WHERE id = ?`).run(roundMoney(user.cash + amount), userId);
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

    CREATE TABLE IF NOT EXISTS login_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      logged_in_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS market_closes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      closed_at TEXT NOT NULL
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

    CREATE TABLE IF NOT EXISTS shady_tips (
      user_id TEXT PRIMARY KEY,
      session_number INTEGER NOT NULL,
      status TEXT NOT NULL,
      current_number INTEGER,
      streak INTEGER NOT NULL DEFAULT 0,
      last_outcome_json TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_badges (
      user_id TEXT NOT NULL,
      badge_id TEXT NOT NULL,
      earned_at TEXT NOT NULL,
      PRIMARY KEY (user_id, badge_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS badge_days (
      cycle_number INTEGER PRIMARY KEY,
      awarded_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS badge_awards (
      user_id TEXT NOT NULL,
      badge_id TEXT NOT NULL,
      badge_day_number INTEGER NOT NULL,
      awarded_at TEXT NOT NULL,
      PRIMARY KEY (user_id, badge_id, badge_day_number),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (badge_day_number) REFERENCES badge_days (cycle_number) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, key),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS market_open_days (
      trade_date TEXT PRIMARY KEY,
      open_count INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS research_plans (
      trade_date TEXT NOT NULL,
      open_slot INTEGER NOT NULL,
      plan_index INTEGER NOT NULL,
      ticker TEXT NOT NULL,
      percent_change REAL NOT NULL,
      hint_text TEXT NOT NULL,
      applied_event_id TEXT,
      applied_at TEXT,
      PRIMARY KEY (trade_date, open_slot, plan_index),
      FOREIGN KEY (ticker) REFERENCES companies (ticker) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS research_usage (
      user_id TEXT NOT NULL,
      research_date TEXT NOT NULL,
      used_count INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, research_date),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS research_runs (
      user_id TEXT PRIMARY KEY,
      research_date TEXT NOT NULL,
      target_trade_date TEXT NOT NULL,
      target_open_slot INTEGER NOT NULL,
      winning_choice INTEGER NOT NULL,
      hint_text TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      resolved_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lottery_runs (
      user_id TEXT NOT NULL,
      lottery_key TEXT NOT NULL,
      trade_date TEXT NOT NULL,
      open_slot INTEGER NOT NULL,
      winning_choice INTEGER NOT NULL,
      chosen_choice INTEGER,
      status TEXT NOT NULL,
      ticket_cost REAL NOT NULL,
      payout_multiplier INTEGER,
      payout_amount REAL,
      won INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      resolved_at TEXT,
      PRIMARY KEY (user_id, lottery_key),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lobby_runs (
      user_id TEXT PRIMARY KEY,
      ticker TEXT NOT NULL,
      status TEXT NOT NULL,
      current_votes INTEGER NOT NULL,
      attempts_used INTEGER NOT NULL DEFAULT 0,
      selected_members_json TEXT NOT NULL DEFAULT '[]',
      outcome_json TEXT,
      freeze_until TEXT,
      created_at TEXT NOT NULL,
      resolved_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (ticker) REFERENCES companies (ticker) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ipo_waves (
      trade_date TEXT NOT NULL,
      open_slot INTEGER NOT NULL,
      breakout_ticker TEXT NOT NULL,
      breakout_percent REAL NOT NULL,
      activation_event_id TEXT,
      breakout_event_id TEXT,
      activated_at TEXT NOT NULL,
      breakout_applied_at TEXT,
      PRIMARY KEY (trade_date, open_slot)
    );

    CREATE TABLE IF NOT EXISTS ipo_choices (
      user_id TEXT NOT NULL,
      wave_key TEXT NOT NULL,
      chosen_ticker TEXT NOT NULL,
      chosen_at TEXT NOT NULL,
      PRIMARY KEY (user_id, wave_key),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      headline TEXT NOT NULL,
      body TEXT NOT NULL,
      is_big_story INTEGER NOT NULL DEFAULT 0,
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

  ensureTransactionsSessionColumn();
  ensureEventsBigStoryColumn();
  migrateLegacyBadgeUnlocks();

  const settingsCount = db.prepare("SELECT COUNT(*) AS count FROM settings").get().count;
  if (settingsCount > 0) {
    reconcileSeedCompanies();
  } else if (fs.existsSync(LEGACY_STORE_PATH)) {
    const raw = JSON.parse(fs.readFileSync(LEGACY_STORE_PATH, "utf8"));
    importLegacyStore(raw);
  } else {
    seedDatabase();
  }

  ensureResearchWeekPlan();
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
      db.prepare(`INSERT INTO events (id, headline, body, is_big_story, created_at) VALUES (?, ?, ?, ?, ?)`).run(
        eventId,
        event.headline,
        event.body || "",
        0,
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
    DELETE FROM badge_awards;
    DELETE FROM badge_days;
    DELETE FROM user_progress;
    DELETE FROM user_badges;
    DELETE FROM shady_tips;
    DELETE FROM research_runs;
    DELETE FROM research_usage;
    DELETE FROM research_plans;
    DELETE FROM lottery_runs;
    DELETE FROM lobby_runs;
    DELETE FROM ipo_choices;
    DELETE FROM ipo_waves;
    DELETE FROM market_open_days;
    DELETE FROM login_events;
    DELETE FROM market_closes;
    DELETE FROM transactions;
    DELETE FROM holdings;
    DELETE FROM company_history;
    DELETE FROM companies;
    DELETE FROM users;
    DELETE FROM market_state;
    DELETE FROM settings;
  `);
}

function recordLoginEvent(userId, timestamp = new Date().toISOString()) {
  db.prepare(
    `INSERT INTO login_events (user_id, logged_in_at) VALUES (?, ?)`
  ).run(userId, timestamp);
}

function recordMarketClose(timestamp = new Date().toISOString()) {
  db.prepare(
    `INSERT INTO market_closes (closed_at) VALUES (?)`
  ).run(timestamp);
}

function getPlannedClassDates() {
  const curatedDates = Object.keys(PLANNED_RESEARCH_WEEK).sort();
  if (curatedDates.length) {
    return curatedDates;
  }

  const dates = [];
  let cursor = shiftDateString(getSchoolDateString(), 1);

  while (dates.length < RESEARCH_CLASS_DAYS) {
    const weekday = getSchoolWeekday(cursor);
    if (weekday !== "Sat" && weekday !== "Sun") {
      dates.push(cursor);
    }
    cursor = shiftDateString(cursor, 1);
  }

  return dates;
}

function getPlanWindowLabel(tradeDate, openSlot) {
  const today = getSchoolDateString();
  const dateLabel = tradeDate === today ? "today" : formatPlanDateLabel(tradeDate);
  const windowLabel = openSlot === 1 ? "the AM Trading Window" : "the PM Trading Window";
  return `${windowLabel} on ${dateLabel}`;
}

function buildResearchHint(company, tradeDate, openSlot, percentChange) {
  const direction = percentChange > 0 ? "higher" : "lower";
  return `${company.name} (${company.ticker}) looks likely to move ${direction} during ${getPlanWindowLabel(tradeDate, openSlot)}.`;
}

function buildAutoPlanForDate(tradeDate) {
  const curated = PLANNED_RESEARCH_WEEK[tradeDate];
  if (curated) {
    return Object.entries(curated).flatMap(([openSlot, plans]) => (
      plans.map((plan, index) => ({
        tradeDate,
        openSlot: Number(openSlot),
        planIndex: index + 1,
        ticker: plan.ticker,
        percentChange: Number(plan.percentChange),
        hintText: plan.hintText
      }))
    ));
  }

  const companies = db.prepare(
    `SELECT ticker, name FROM companies ORDER BY sort_order ASC, ticker ASC`
  ).all();

  const available = [...companies];
  const rows = [];

  for (let openSlot = 1; openSlot <= RESEARCH_OPEN_SLOTS; openSlot += 1) {
    for (let planIndex = 1; planIndex <= RESEARCH_PLANS_PER_OPEN; planIndex += 1) {
      const companyIndex = deterministicIndex(`${tradeDate}:${openSlot}:${planIndex}:company`, available.length);
      const [company] = available.splice(companyIndex, 1);
      const percentChange = RESEARCH_PERCENT_OPTIONS[
        deterministicIndex(`${tradeDate}:${openSlot}:${planIndex}:change`, RESEARCH_PERCENT_OPTIONS.length)
      ];

      rows.push({
        tradeDate,
        openSlot,
        planIndex,
        ticker: company.ticker,
        percentChange,
        hintText: buildResearchHint(company, tradeDate, openSlot, percentChange)
      });
    }
  }

  return rows;
}

function ensureResearchWeekPlan() {
  const targetDates = getPlannedClassDates();

  targetDates.forEach((tradeDate) => {
    buildAutoPlanForDate(tradeDate).forEach((plan) => {
      db.prepare(
        `INSERT INTO research_plans
         (trade_date, open_slot, plan_index, ticker, percent_change, hint_text, applied_event_id, applied_at)
         VALUES (?, ?, ?, ?, ?, ?, NULL, NULL)
         ON CONFLICT(trade_date, open_slot, plan_index) DO UPDATE SET
           ticker = excluded.ticker,
           percent_change = excluded.percent_change,
           hint_text = excluded.hint_text`
      ).run(
        plan.tradeDate,
        plan.openSlot,
        plan.planIndex,
        plan.ticker,
        plan.percentChange,
        plan.hintText
      );
    });
  });
}

function getOrCreateMarketOpenDay(tradeDate) {
  const existing = db.prepare(
    `SELECT trade_date, open_count FROM market_open_days WHERE trade_date = ?`
  ).get(tradeDate);

  if (existing) {
    return {
      tradeDate: existing.trade_date,
      openCount: Number(existing.open_count) || 0
    };
  }

  db.prepare(
    `INSERT INTO market_open_days (trade_date, open_count, updated_at) VALUES (?, 0, ?)`
  ).run(tradeDate, new Date().toISOString());

  return { tradeDate, openCount: 0 };
}

function markResearchOpenCount(tradeDate, openCount) {
  db.prepare(
    `INSERT INTO market_open_days (trade_date, open_count, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(trade_date) DO UPDATE SET open_count = excluded.open_count, updated_at = excluded.updated_at`
  ).run(tradeDate, openCount, new Date().toISOString());
}

function getMarketOpenDay(tradeDate) {
  const row = db.prepare(
    `SELECT trade_date, open_count FROM market_open_days WHERE trade_date = ?`
  ).get(tradeDate);

  if (!row) {
    return null;
  }

  return {
    tradeDate: row.trade_date,
    openCount: Number(row.open_count) || 0
  };
}

function getResearchPlansForWindow(tradeDate, openSlot) {
  return db.prepare(
    `SELECT trade_date, open_slot, plan_index, ticker, percent_change, hint_text, applied_at
     FROM research_plans
     WHERE trade_date = ? AND open_slot = ?
     ORDER BY plan_index ASC`
  ).all(tradeDate, openSlot).map((row) => ({
    tradeDate: row.trade_date,
    openSlot: row.open_slot,
    planIndex: row.plan_index,
    ticker: row.ticker,
    percentChange: Number(row.percent_change),
    hintText: row.hint_text,
    appliedAt: row.applied_at || null
  }));
}

function getResearchPeriodKey(tradeDate, openSlot) {
  return `${tradeDate}:slot-${openSlot}`;
}

function getIpoWaveConfig(tradeDate, openSlot) {
  return IPO_WAVES[tradeDate]?.[openSlot] || null;
}

function getIpoWaveKey(tradeDate, openSlot) {
  return `${tradeDate}:ipo:${openSlot}`;
}

function getIpoWaveRecord(tradeDate, openSlot) {
  return db.prepare(
    `SELECT trade_date, open_slot, breakout_ticker, breakout_percent, activation_event_id, breakout_event_id, activated_at, breakout_applied_at
     FROM ipo_waves
     WHERE trade_date = ? AND open_slot = ?`
  ).get(tradeDate, openSlot);
}

function getCurrentIpoWindow() {
  const market = getMarket();
  if (!market.isOpen || !market.lastOpenedAt) {
    return null;
  }

  const tradeDate = getSchoolDateString(new Date(market.lastOpenedAt));
  const dayState = getMarketOpenDay(tradeDate);
  const openSlot = dayState?.openCount || 0;
  const config = getIpoWaveConfig(tradeDate, openSlot);
  const record = config ? getIpoWaveRecord(tradeDate, openSlot) : null;
  if (!config || !record) {
    return null;
  }

  return {
    tradeDate,
    openSlot,
    waveKey: getIpoWaveKey(tradeDate, openSlot),
    label: `${openSlot === 1 ? "AM" : "PM"} IPO Wave`,
    config,
    record
  };
}

function getIpoChoice(userId, waveKey) {
  const row = db.prepare(
    `SELECT user_id, wave_key, chosen_ticker, chosen_at
     FROM ipo_choices
     WHERE user_id = ? AND wave_key = ?`
  ).get(userId, waveKey);

  return row
    ? {
        userId: row.user_id,
        waveKey: row.wave_key,
        chosenTicker: row.chosen_ticker,
        chosenAt: row.chosen_at
      }
    : null;
}

function saveIpoChoice(userId, waveKey, ticker) {
  db.prepare(
    `INSERT INTO ipo_choices (user_id, wave_key, chosen_ticker, chosen_at)
     VALUES (?, ?, ?, ?)`
  ).run(userId, waveKey, ticker, new Date().toISOString());
}

function getNextCompanySortOrder() {
  return Number(
    db.prepare(`SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort_order FROM companies`).get()?.next_sort_order || 0
  );
}

function ensureIpoCompaniesForWave(config) {
  const timestamp = new Date().toISOString();
  let nextSortOrder = getNextCompanySortOrder();

  config.companies.forEach((company) => {
    if (getCompanyByTicker(company.ticker)) {
      return;
    }

    insertCompany(company, nextSortOrder, timestamp);
    nextSortOrder += 1;
  });
}

function activateIpoWave(tradeDate, openSlot) {
  const config = getIpoWaveConfig(tradeDate, openSlot);
  if (!config) {
    return null;
  }

  const existing = getIpoWaveRecord(tradeDate, openSlot);
  if (existing) {
    return {
      tradeDate,
      openSlot,
      label: `${openSlot === 1 ? "AM" : "PM"} IPO Wave`,
      breakoutTicker: existing.breakout_ticker
    };
  }

  ensureIpoCompaniesForWave(config);
  const createdAt = new Date().toISOString();
  const headline = `${openSlot === 1 ? "AM" : "PM"} IPO Wave is live`;
  const bodyText = `${config.companies.map((company) => `${company.ticker} (${company.name})`).join(", ")} just hit the board. Students can buy into only one of the three before one breakout stock takes off.`;
  const publishResult = publishEvent(headline, bodyText, [], { isBigStory: true });

  db.prepare(
    `INSERT INTO ipo_waves
     (trade_date, open_slot, breakout_ticker, breakout_percent, activation_event_id, breakout_event_id, activated_at, breakout_applied_at)
     VALUES (?, ?, ?, ?, ?, NULL, ?, NULL)`
  ).run(
    tradeDate,
    openSlot,
    config.breakoutTicker,
    config.breakoutPercent,
    publishResult.eventId,
    createdAt
  );

  return {
    tradeDate,
    openSlot,
    label: `${openSlot === 1 ? "AM" : "PM"} IPO Wave`,
    breakoutTicker: config.breakoutTicker
  };
}

function activateIpoWaveForToday() {
  const tradeDate = getSchoolDateString();
  const dayState = getMarketOpenDay(tradeDate);
  const openSlot = dayState?.openCount || 0;
  if (!openSlot) {
    return null;
  }

  return activateIpoWave(tradeDate, openSlot);
}

function applyIpoBreakoutIfDue() {
  const currentWave = getCurrentIpoWindow();
  if (!currentWave || currentWave.record.breakout_applied_at) {
    return null;
  }

  const market = getMarket();
  const openedAt = new Date(market.lastOpenedAt).getTime();
  if (!Number.isFinite(openedAt) || (Date.now() - openedAt) < IPO_BREAKOUT_DELAY_MS) {
    return null;
  }

  const breakoutCompany = getCompanyByTicker(currentWave.record.breakout_ticker);
  if (!breakoutCompany) {
    return null;
  }

  const headline = `${breakoutCompany.ticker} detonates out of the IPO wave`;
  const bodyText = `${breakoutCompany.name} just became the breakout winner from the ${currentWave.label}. Students who picked it early are suddenly looking very smart.`;
  const publishResult = publishEvent(
    headline,
    bodyText,
    [{ ticker: breakoutCompany.ticker, percentChange: Number(currentWave.record.breakout_percent) }],
    { isBigStory: true }
  );

  db.prepare(
    `UPDATE ipo_waves
     SET breakout_event_id = ?, breakout_applied_at = ?
     WHERE trade_date = ? AND open_slot = ?`
  ).run(
    publishResult.eventId,
    publishResult.createdAt,
    currentWave.tradeDate,
    currentWave.openSlot
  );

  return {
    tradeDate: currentWave.tradeDate,
    openSlot: currentWave.openSlot,
    breakoutTicker: breakoutCompany.ticker
  };
}

function getIpoState(userId) {
  const currentWave = getCurrentIpoWindow();
  if (!currentWave) {
    return {
      active: false
    };
  }

  const market = getMarket();
  const choice = getIpoChoice(userId, currentWave.waveKey);
  const breakoutApplied = Boolean(currentWave.record.breakout_applied_at);
  const openedAtMs = market.lastOpenedAt ? new Date(market.lastOpenedAt).getTime() : NaN;
  const secondsUntilBreakout = breakoutApplied || !Number.isFinite(openedAtMs)
    ? 0
    : Math.max(0, Math.ceil(((openedAtMs + IPO_BREAKOUT_DELAY_MS) - Date.now()) / 1000));

  return {
    active: true,
    label: currentWave.label,
    title: currentWave.config.title,
    waveKey: currentWave.waveKey,
    chosenTicker: choice?.chosenTicker || null,
    breakoutApplied,
    breakoutTicker: breakoutApplied ? currentWave.record.breakout_ticker : null,
    breakoutPercent: breakoutApplied ? Number(currentWave.record.breakout_percent) : null,
    secondsUntilBreakout,
    entrants: currentWave.config.companies
      .map((company) => getCompanyByTicker(company.ticker))
      .filter(Boolean)
      .map((company) => ({
        ticker: company.ticker,
        name: company.name,
        industry: company.industry,
        price: roundMoney(company.price),
        volatility: company.volatility
      }))
  };
}

function getResearchUseCount(userId, researchKey) {
  return Number(
    db.prepare(
      `SELECT used_count FROM research_usage WHERE user_id = ? AND research_date = ?`
    ).get(userId, researchKey)?.used_count || 0
  );
}

function setResearchUseCount(userId, researchKey, usedCount) {
  db.prepare(
    `INSERT INTO research_usage (user_id, research_date, used_count, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, research_date) DO UPDATE SET used_count = excluded.used_count, updated_at = excluded.updated_at`
  ).run(userId, researchKey, usedCount, new Date().toISOString());
}

function getActiveResearchRun(userId, researchKey = null) {
  if (!researchKey) {
    return db.prepare(
      `SELECT user_id, research_date, target_trade_date, target_open_slot, winning_choice, hint_text, status, created_at
       FROM research_runs
       WHERE user_id = ? AND status = 'pending'`
    ).get(userId);
  }

  return db.prepare(
    `SELECT user_id, research_date, target_trade_date, target_open_slot, winning_choice, hint_text, status, created_at
     FROM research_runs
     WHERE user_id = ? AND research_date = ? AND status = 'pending'`
  ).get(userId, researchKey);
}

function setResearchRun(userId, researchKey, payload) {
  db.prepare(
    `INSERT INTO research_runs
     (user_id, research_date, target_trade_date, target_open_slot, winning_choice, hint_text, status, created_at, resolved_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
     ON CONFLICT(user_id) DO UPDATE SET
       research_date = excluded.research_date,
       target_trade_date = excluded.target_trade_date,
       target_open_slot = excluded.target_open_slot,
       winning_choice = excluded.winning_choice,
       hint_text = excluded.hint_text,
       status = excluded.status,
       created_at = excluded.created_at,
       resolved_at = NULL`
  ).run(
    userId,
    researchKey,
    payload.targetTradeDate,
    payload.targetOpenSlot,
    payload.winningChoice,
    payload.hintText,
    "pending",
    new Date().toISOString()
  );
}

function clearResearchRun(userId) {
  db.prepare(`DELETE FROM research_runs WHERE user_id = ?`).run(userId);
}

function getResearchState(userId) {
  ensureResearchWeekPlan();

  const researchDate = getSchoolDateString();
  const market = getMarket();
  const dayState = getMarketOpenDay(researchDate);
  const openCount = dayState?.openCount || 0;

  let target = null;
  let researchKey = null;
  let targetOpenSlot = null;
  if (!market.isOpen) {
    targetOpenSlot = openCount === 0 ? 1 : openCount === 1 ? 2 : null;
    if (targetOpenSlot) {
      const pendingPlans = getResearchPlansForWindow(researchDate, targetOpenSlot).filter((plan) => !plan.appliedAt);
      if (pendingPlans.length) {
        researchKey = getResearchPeriodKey(researchDate, targetOpenSlot);
        target = {
          tradeDate: researchDate,
          openSlot: targetOpenSlot,
          label: getPlanWindowLabel(researchDate, targetOpenSlot)
        };
      }
    }
  }

  const activeRun = getActiveResearchRun(userId, researchKey);
  const activeResearchKey = activeRun?.research_date || researchKey;
  const usedCount = activeResearchKey ? getResearchUseCount(userId, activeResearchKey) : 0;
  const usesLeft = Math.max(0, RESEARCH_USES_PER_WINDOW - usedCount);

  return {
    researchDate,
    researchKey: activeResearchKey,
    usesPerWindow: RESEARCH_USES_PER_WINDOW,
    usedCount,
    usesLeft,
    target,
    canStart: Boolean(target) && usesLeft > 0 && !activeRun,
    activeRun: activeRun
      ? {
          targetTradeDate: activeRun.target_trade_date,
          targetOpenSlot: activeRun.target_open_slot,
          label: getPlanWindowLabel(activeRun.target_trade_date, activeRun.target_open_slot),
          choiceCount: RESEARCH_CHOICES
        }
      : null
  };
}

function startResearchRun(userId) {
  const researchState = getResearchState(userId);

  if (researchState.activeRun) {
    return researchState.activeRun;
  }

  if (!researchState.target || !researchState.researchKey || researchState.usesLeft <= 0) {
    throw new Error("No research attempts left for this trading window.");
  }

  const plans = getResearchPlansForWindow(researchState.target.tradeDate, researchState.target.openSlot);
  if (!plans.length) {
    throw new Error("No stock leads are scheduled for that window.");
  }

  const chosenPlan = plans[randomInt(0, plans.length - 1)];
  const winningChoice = randomInt(1, RESEARCH_CHOICES);
  setResearchUseCount(userId, researchState.researchKey, researchState.usedCount + 1);
  setResearchRun(userId, researchState.researchKey, {
    targetTradeDate: chosenPlan.tradeDate,
    targetOpenSlot: chosenPlan.openSlot,
    winningChoice,
    hintText: chosenPlan.hintText
  });

  return {
    label: getPlanWindowLabel(chosenPlan.tradeDate, chosenPlan.openSlot),
    choiceCount: RESEARCH_CHOICES
  };
}

function resolveResearchPick(userId, choice) {
  const activeRun = getActiveResearchRun(userId);
  if (!activeRun) {
    throw new Error("Start a research scan first.");
  }

  const won = Number(choice) === Number(activeRun.winning_choice);
  clearResearchRun(userId);

  return won
    ? {
        won: true,
        tip: activeRun.hint_text,
        targetTradeDate: activeRun.target_trade_date,
        targetOpenSlot: activeRun.target_open_slot,
        message: "Research hit. You found a real lead."
      }
    : {
        won: false,
        message: "No useful lead this time."
      };
}

function getCurrentOpenLotteryWindow() {
  const market = getMarket();
  if (!market.isOpen || !market.lastOpenedAt) {
    return null;
  }

  const tradeDate = getSchoolDateString(new Date(market.lastOpenedAt));
  const dayState = getMarketOpenDay(tradeDate);
  const openSlot = dayState?.openCount || 0;
  if (!openSlot || openSlot > RESEARCH_OPEN_SLOTS) {
    return null;
  }

  return {
    tradeDate,
    openSlot,
    lotteryKey: getResearchPeriodKey(tradeDate, openSlot),
    label: getPlanWindowLabel(tradeDate, openSlot)
  };
}

function getLotteryRun(userId, lotteryKey) {
  return db.prepare(
    `SELECT user_id, lottery_key, trade_date, open_slot, winning_choice, chosen_choice, status,
            ticket_cost, payout_multiplier, payout_amount, won, created_at, resolved_at
     FROM lottery_runs
     WHERE user_id = ? AND lottery_key = ?`
  ).get(userId, lotteryKey);
}

function getActiveLotteryRun(userId) {
  return db.prepare(
    `SELECT user_id, lottery_key, trade_date, open_slot, winning_choice, chosen_choice, status,
            ticket_cost, payout_multiplier, payout_amount, won, created_at, resolved_at
     FROM lottery_runs
     WHERE user_id = ? AND status = 'pending'
     ORDER BY datetime(created_at) DESC
     LIMIT 1`
  ).get(userId);
}

function createLotteryRun(userId, lotteryWindow, winningChoice) {
  db.prepare(
    `INSERT INTO lottery_runs
     (user_id, lottery_key, trade_date, open_slot, winning_choice, chosen_choice, status, ticket_cost, payout_multiplier, payout_amount, won, created_at, resolved_at)
     VALUES (?, ?, ?, ?, ?, NULL, 'pending', ?, NULL, NULL, 0, ?, NULL)`
  ).run(
    userId,
    lotteryWindow.lotteryKey,
    lotteryWindow.tradeDate,
    lotteryWindow.openSlot,
    winningChoice,
    LOTTERY_TICKET_COST,
    new Date().toISOString()
  );
}

function finishLotteryRun(userId, lotteryKey, choice, outcome) {
  db.prepare(
    `UPDATE lottery_runs
     SET chosen_choice = ?,
         status = ?,
         payout_multiplier = ?,
         payout_amount = ?,
         won = ?,
         resolved_at = ?
     WHERE user_id = ? AND lottery_key = ?`
  ).run(
    choice,
    outcome.won ? "won" : "lost",
    outcome.multiplier ?? null,
    outcome.payoutAmount ?? 0,
    outcome.won ? 1 : 0,
    new Date().toISOString(),
    userId,
    lotteryKey
  );
}

function getLotteryState(userId) {
  const activeRun = getActiveLotteryRun(userId);
  if (activeRun) {
    return {
      cost: LOTTERY_TICKET_COST,
      choiceCount: LOTTERY_CHOICES,
      payoutMin: LOTTERY_PAYOUT_MULTIPLIER_RANGE.min,
      payoutMax: LOTTERY_PAYOUT_MULTIPLIER_RANGE.max,
      status: "pending",
      canStart: false,
      windowLabel: getPlanWindowLabel(activeRun.trade_date, activeRun.open_slot),
      activeRun: {
        tradeDate: activeRun.trade_date,
        openSlot: activeRun.open_slot,
        label: getPlanWindowLabel(activeRun.trade_date, activeRun.open_slot),
        choiceCount: LOTTERY_CHOICES
      },
      lastResult: null
    };
  }

  const lotteryWindow = getCurrentOpenLotteryWindow();
  if (!lotteryWindow) {
    return {
      cost: LOTTERY_TICKET_COST,
      choiceCount: LOTTERY_CHOICES,
      payoutMin: LOTTERY_PAYOUT_MULTIPLIER_RANGE.min,
      payoutMax: LOTTERY_PAYOUT_MULTIPLIER_RANGE.max,
      status: "locked",
      canStart: false,
      windowLabel: null,
      activeRun: null,
      lastResult: null
    };
  }

  const existingRun = getLotteryRun(userId, lotteryWindow.lotteryKey);
  if (!existingRun) {
    return {
      cost: LOTTERY_TICKET_COST,
      choiceCount: LOTTERY_CHOICES,
      payoutMin: LOTTERY_PAYOUT_MULTIPLIER_RANGE.min,
      payoutMax: LOTTERY_PAYOUT_MULTIPLIER_RANGE.max,
      status: "ready",
      canStart: true,
      windowLabel: lotteryWindow.label,
      activeRun: null,
      lastResult: null
    };
  }

  return {
    cost: LOTTERY_TICKET_COST,
    choiceCount: LOTTERY_CHOICES,
    payoutMin: LOTTERY_PAYOUT_MULTIPLIER_RANGE.min,
    payoutMax: LOTTERY_PAYOUT_MULTIPLIER_RANGE.max,
    status: existingRun.status,
    canStart: false,
    windowLabel: lotteryWindow.label,
    activeRun: null,
    lastResult: {
      won: Boolean(existingRun.won),
      chosenChoice: existingRun.chosen_choice,
      payoutAmount: roundMoney(existingRun.payout_amount || 0),
      multiplier: existingRun.payout_multiplier || null
    }
  };
}

function startLotteryRun(userId) {
  const lotteryWindow = getCurrentOpenLotteryWindow();
  if (!lotteryWindow) {
    throw new Error("Lottery tickets are only sold while the market is open.");
  }

  const existingRun = getLotteryRun(userId, lotteryWindow.lotteryKey);
  if (existingRun?.status === "pending") {
    return {
      label: lotteryWindow.label,
      choiceCount: LOTTERY_CHOICES
    };
  }
  if (existingRun) {
    throw new Error("You already bought a ticket for this trading window.");
  }

  const user = getUserById(userId);
  if (roundMoney(user.cash) < LOTTERY_TICKET_COST) {
    throw new Error(`You need at least ${formatCurrency(LOTTERY_TICKET_COST)} in cash to buy a ticket.`);
  }

  db.prepare(`UPDATE users SET cash = ? WHERE id = ?`).run(roundMoney(user.cash - LOTTERY_TICKET_COST), userId);
  createLotteryRun(userId, lotteryWindow, randomInt(1, LOTTERY_CHOICES));

  return {
    label: lotteryWindow.label,
    choiceCount: LOTTERY_CHOICES
  };
}

function resolveLotteryPick(userId, choice) {
  const activeRun = getActiveLotteryRun(userId);
  if (!activeRun) {
    throw new Error("Buy a lottery ticket first.");
  }

  const won = Number(choice) === Number(activeRun.winning_choice);
  const multiplier = won
    ? randomInt(LOTTERY_PAYOUT_MULTIPLIER_RANGE.min, LOTTERY_PAYOUT_MULTIPLIER_RANGE.max)
    : null;
  const payoutAmount = won ? roundMoney(activeRun.ticket_cost * multiplier) : 0;

  if (won) {
    const user = getUserById(userId);
    db.prepare(`UPDATE users SET cash = ? WHERE id = ?`).run(roundMoney(user.cash + payoutAmount), userId);
  }

  finishLotteryRun(userId, activeRun.lottery_key, choice, {
    won,
    multiplier,
    payoutAmount
  });

  return won
    ? {
        won: true,
        multiplier,
        payoutAmount,
        message: `Jackpot. Your ${formatCurrency(LOTTERY_TICKET_COST)} ticket paid ${multiplier}x for ${formatCurrency(payoutAmount)}.`
      }
    : {
        won: false,
        message: `No winner this time. Your ${formatCurrency(LOTTERY_TICKET_COST)} ticket is gone.`
      };
}

function getLobbyRun(userId) {
  return db.prepare(
    `SELECT user_id, ticker, status, current_votes, attempts_used, selected_members_json, outcome_json, freeze_until, created_at, resolved_at
     FROM lobby_runs
     WHERE user_id = ?`
  ).get(userId);
}

function getLobbyMemberProfile(memberId) {
  return LOBBY_MEMBERS.find((member) => member.id === memberId) || null;
}

function parseLobbySelections(row) {
  return parseJsonValue(row?.selected_members_json, []);
}

function getLobbyFreezeInfo(row) {
  if (!row?.freeze_until) {
    return { tradeFrozen: false, freezeUntil: null, secondsLeft: 0 };
  }

  const freezeUntilMs = new Date(row.freeze_until).getTime();
  const nowMs = Date.now();
  const isFrozen = Number.isFinite(freezeUntilMs) && freezeUntilMs > nowMs;
  return {
    tradeFrozen: isFrozen,
    freezeUntil: row.freeze_until,
    secondsLeft: isFrozen ? Math.ceil((freezeUntilMs - nowMs) / 1000) : 0
  };
}

function getLobbyState(userId) {
  const row = getLobbyRun(userId);
  const market = getMarket();
  const company = row ? getCompanyByTicker(row.ticker) : null;
  const selections = parseLobbySelections(row);
  const selectedById = new Map(selections.map((selection) => [selection.memberId, selection]));
  const freezeInfo = getLobbyFreezeInfo(row);

  return {
    status: row?.status || "available",
    canStart: !row && market.isOpen,
    marketOpen: market.isOpen,
    selectedTicker: row?.ticker || null,
    selectedCompanyName: company?.name || null,
    currentVotes: row?.current_votes ?? LOBBY_STARTING_VOTES,
    targetVotes: LOBBY_TARGET_VOTES,
    attemptsUsed: row?.attempts_used || 0,
    maxAttempts: LOBBY_MAX_ATTEMPTS,
    tradeFrozen: freezeInfo.tradeFrozen,
    freezeUntil: freezeInfo.freezeUntil,
    freezeSecondsLeft: freezeInfo.secondsLeft,
    outcome: parseJsonValue(row?.outcome_json, null),
    members: LOBBY_MEMBERS.map((member) => {
      const selected = selectedById.get(member.id);
      return {
        id: member.id,
        name: member.name,
        image: member.image,
        clue: member.clue,
        risk: member.risk,
        selected: Boolean(selected),
        result: selected || null
      };
    })
  };
}

function startLobbyRun(userId, ticker) {
  const market = getMarket();
  if (!market.isOpen) {
    throw new Error("Lobby Congress is only available while the market is open.");
  }

  const existing = getLobbyRun(userId);
  if (existing) {
    throw new Error("You already used Lobby Congress this game.");
  }

  const company = getCompanyByTicker(ticker);
  if (!company) {
    throw new Error("Choose a valid stock to lobby for.");
  }

  db.prepare(
    `INSERT INTO lobby_runs
     (user_id, ticker, status, current_votes, attempts_used, selected_members_json, outcome_json, freeze_until, created_at, resolved_at)
     VALUES (?, ?, 'in_progress', ?, 0, '[]', NULL, NULL, ?, NULL)`
  ).run(userId, company.ticker, LOBBY_STARTING_VOTES, new Date().toISOString());

  return {
    ticker: company.ticker,
    companyName: company.name
  };
}

function rollLobbyMemberOutcome(member) {
  const roll = randomInt(1, 100);
  if (roll <= member.supportChance) {
    return {
      stance: "Support",
      voteChange: member.supportVotes,
      text: `${member.name} backed the bill and moved ${member.supportVotes} vote${member.supportVotes === 1 ? "" : "s"}.`
    };
  }

  if (roll <= member.supportChance + member.undecidedChance) {
    const persuaded = Math.random() >= 0.5;
    return {
      stance: persuaded ? "Undecided: Persuaded" : "Undecided: Stalled",
      voteChange: persuaded ? 1 : 0,
      text: persuaded
        ? `${member.name} was undecided, but your pitch earned 1 vote.`
        : `${member.name} stayed undecided. No votes moved.`
    };
  }

  return {
    stance: "Oppose",
    voteChange: member.opposeVotes,
    text: `${member.name} opposed the bill and triggered ${Math.abs(member.opposeVotes)} backlash vote${Math.abs(member.opposeVotes) === 1 ? "" : "s"}.`
  };
}

function applyLobbyOutcome(userId, row, didPass) {
  const company = getCompanyByTicker(row.ticker);
  if (!company) {
    throw new Error("Could not find the lobbied stock.");
  }

  const percentChange = didPass
    ? randomInt(LOBBY_WIN_PERCENT_RANGE.min, LOBBY_WIN_PERCENT_RANGE.max)
    : -randomInt(LOBBY_LOSS_PERCENT_RANGE.min, LOBBY_LOSS_PERCENT_RANGE.max);
  const headline = didPass
    ? `Lobbying win sends ${company.name} soaring`
    : `Lobbying scandal slams ${company.name}`;
  const bodyText = didPass
    ? `A major policy push passed committee, and investors rushed into ${company.ticker}.`
    : `A failed lobbying push sparked a compliance review. ${company.ticker} fell and the student trader is frozen for 10 minutes.`;
  const publishResult = publishEvent(headline, bodyText, [{ ticker: company.ticker, percentChange }], { isBigStory: true });
  const freezeUntil = didPass ? null : new Date(Date.now() + LOBBY_FREEZE_MS).toISOString();
  const outcome = {
    result: didPass ? "passed" : "failed",
    ticker: company.ticker,
    companyName: company.name,
    percentChange,
    freezeUntil,
    eventId: publishResult.eventId,
    resolvedAt: publishResult.createdAt
  };

  db.prepare(
    `UPDATE lobby_runs
     SET status = ?, outcome_json = ?, freeze_until = ?, resolved_at = ?
     WHERE user_id = ?`
  ).run(didPass ? "won" : "lost", JSON.stringify(outcome), freezeUntil, publishResult.createdAt, userId);

  return outcome;
}

function resolveLobbyPick(userId, memberId) {
  const row = getLobbyRun(userId);
  if (!row || row.status !== "in_progress") {
    throw new Error("Start a Lobby Congress run first.");
  }

  const member = getLobbyMemberProfile(memberId);
  if (!member) {
    throw new Error("Choose one of the committee members.");
  }

  const selections = parseLobbySelections(row);
  if (selections.some((selection) => selection.memberId === member.id)) {
    throw new Error("You already lobbied that committee member.");
  }
  if (selections.length >= LOBBY_MAX_ATTEMPTS) {
    throw new Error("You already used all three persuasion attempts.");
  }

  const result = rollLobbyMemberOutcome(member);
  const nextVotes = Math.max(0, Number(row.current_votes || 0) + result.voteChange);
  const nextAttempts = Number(row.attempts_used || 0) + 1;
  const nextSelection = {
    memberId: member.id,
    memberName: member.name,
    stance: result.stance,
    voteChange: result.voteChange,
    text: result.text
  };
  const nextSelections = [...selections, nextSelection];

  db.prepare(
    `UPDATE lobby_runs
     SET current_votes = ?, attempts_used = ?, selected_members_json = ?
     WHERE user_id = ?`
  ).run(nextVotes, nextAttempts, JSON.stringify(nextSelections), userId);

  const didPass = nextVotes >= LOBBY_TARGET_VOTES;
  const didFail = !didPass && nextAttempts >= LOBBY_MAX_ATTEMPTS;
  let outcome = null;

  if (didPass || didFail) {
    outcome = applyLobbyOutcome(userId, {
      ...row,
      current_votes: nextVotes,
      attempts_used: nextAttempts,
      selected_members_json: JSON.stringify(nextSelections)
    }, didPass);
  }

  return {
    memberResult: nextSelection,
    currentVotes: nextVotes,
    attemptsUsed: nextAttempts,
    completed: Boolean(outcome),
    outcome,
    message: outcome
      ? didPass
        ? `The committee passed the bill. ${outcome.ticker} jumped ${outcome.percentChange}%.`
        : `The lobbying push failed. ${outcome.ticker} dropped ${Math.abs(outcome.percentChange)}% and trading is frozen for 10 minutes.`
      : result.text
  };
}

function armScheduledResearchPlansForToday() {
  ensureResearchWeekPlan();

  const tradeDate = getSchoolDateString();
  const current = getOrCreateMarketOpenDay(tradeDate);
  const nextOpenCount = current.openCount + 1;
  markResearchOpenCount(tradeDate, nextOpenCount);

  if (nextOpenCount > RESEARCH_OPEN_SLOTS) {
    return null;
  }

  const plans = getResearchPlansForWindow(tradeDate, nextOpenCount).filter((plan) => !plan.appliedAt);
  if (!plans.length) {
    return null;
  }

  return {
    tradeDate,
    openSlot: nextOpenCount,
    appliedCount: plans.length,
    headline: `Scheduled market wave armed for ${nextOpenCount === 1 ? "AM Trading Window" : "PM Trading Window"}`
  };
}

function applyScheduledResearchPlansIfDue() {
  ensureResearchWeekPlan();

  const market = getMarket();
  if (!market.isOpen || !market.lastOpenedAt) {
    return null;
  }

  const tradeDate = getSchoolDateString(new Date(market.lastOpenedAt));
  const dayState = getMarketOpenDay(tradeDate);
  const openSlot = dayState?.openCount || 0;
  if (!openSlot || openSlot > RESEARCH_OPEN_SLOTS) {
    return null;
  }

  const openedAt = new Date(market.lastOpenedAt).getTime();
  if (!Number.isFinite(openedAt) || (Date.now() - openedAt) < RESEARCH_WAVE_DELAY_MS) {
    return null;
  }

  const plans = getResearchPlansForWindow(tradeDate, openSlot).filter((plan) => !plan.appliedAt);
  if (!plans.length) {
    return null;
  }

  const headline = `Scheduled market wave hits ${openSlot === 1 ? "AM Trading Window" : "PM Trading Window"}`;
  const bodyText = `The planned market wave for ${formatPlanDateLabel(tradeDate)} just moved three companies on the board.`;
  const publishResult = publishEvent(
    headline,
    bodyText,
    plans.map((plan) => ({
      ticker: plan.ticker,
      percentChange: plan.percentChange
    }))
  );

  db.prepare(
    `UPDATE research_plans
     SET applied_event_id = ?, applied_at = ?
     WHERE trade_date = ? AND open_slot = ?`
  ).run(
    publishResult.eventId,
    publishResult.createdAt,
    tradeDate,
    openSlot
  );

  return {
    tradeDate,
    openSlot,
    appliedCount: plans.length,
    headline
  };
}

function ensureTransactionsSessionColumn() {
  const hasSessionNumber = db.prepare(`PRAGMA table_info(transactions)`).all()
    .some((column) => column.name === "session_number");

  if (!hasSessionNumber) {
    db.exec(`ALTER TABLE transactions ADD COLUMN session_number INTEGER`);
  }
}

function ensureEventsBigStoryColumn() {
  const hasBigStory = db.prepare(`PRAGMA table_info(events)`).all()
    .some((column) => column.name === "is_big_story");

  if (!hasBigStory) {
    db.exec(`ALTER TABLE events ADD COLUMN is_big_story INTEGER NOT NULL DEFAULT 0`);
  }
}

function migrateLegacyBadgeUnlocks() {
  const hasLegacyRows = db.prepare(`SELECT COUNT(*) AS count FROM user_badges`).get().count > 0;
  if (!hasLegacyRows) {
    return;
  }

  const alreadyMigrated = db.prepare(`SELECT COUNT(*) AS count FROM badge_days WHERE cycle_number = 0`).get().count > 0;
  if (alreadyMigrated) {
    return;
  }

  const earliestLegacy = db.prepare(`SELECT MIN(earned_at) AS earned_at FROM user_badges`).get();
  const awardedAt = earliestLegacy?.earned_at || new Date().toISOString();

  db.prepare(`INSERT INTO badge_days (cycle_number, awarded_at) VALUES (?, ?)`).run(0, awardedAt);

  db.prepare(
    `INSERT OR IGNORE INTO badge_awards (user_id, badge_id, badge_day_number, awarded_at)
     SELECT user_id, badge_id, 0, earned_at
     FROM user_badges`
  ).run();
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
  db.prepare(`INSERT INTO events (id, headline, body, is_big_story, created_at) VALUES (?, ?, ?, ?, ?)`).run(
    crypto.randomUUID(),
    "Welcome to the Stock Arena",
    "Market news will appear here whenever the teacher posts a new event.",
    0,
    timestamp
  );
}

function buildBootstrapPayload(session) {
  applyScheduledResearchPlansIfDue();
  applyIpoBreakoutIfDue();

  return {
    user: session?.userId ? serializeUser(session.userId) : null,
    isAdmin: Boolean(session?.isAdmin),
    market: getMarket(),
    badgeDay: getBadgeDayInfo(),
    rules: {
      startingCash: getStartingCash()
    },
    companies: getCompanies(),
    leaderboard: computeLeaderboard(),
    badgeLeaderboard: computeBadgeLeaderboard(),
    tradeHighlights: computeTradeHighlights(),
    liveTrades: getRecentTrades(12),
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

function getBadgeDayInfo() {
  const latest = db.prepare(
    `SELECT cycle_number, awarded_at
     FROM badge_days
     ORDER BY cycle_number DESC
     LIMIT 1`
  ).get();

  return {
    cycleNumber: latest?.cycle_number || 0,
    awardedAt: latest?.awarded_at || null
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
    `SELECT id, headline, body, is_big_story, created_at
     FROM events
     ORDER BY datetime(created_at) DESC, rowid DESC
     LIMIT ?`
  ).all(limit);

  return events.map((event) => ({
    id: event.id,
    headline: event.headline,
    body: event.body,
    isBigStory: Boolean(event.is_big_story),
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

function parseJsonValue(raw, fallback = null) {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function getSchoolDateString(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SCHOOL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function getSchoolWeekday(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: SCHOOL_TIMEZONE,
    weekday: "short"
  }).format(new Date(`${dateString}T12:00:00Z`));
}

function shiftDateString(dateString, dayOffset) {
  const [year, month, day] = dateString.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + dayOffset));
  return shifted.toISOString().slice(0, 10);
}

function formatPlanDateLabel(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: SCHOOL_TIMEZONE,
    month: "short",
    day: "numeric"
  }).format(new Date(`${dateString}T12:00:00Z`));
}

function deterministicIndex(seed, max) {
  if (max <= 0) {
    return 0;
  }

  const digest = crypto.createHash("sha256").update(seed).digest();
  return digest.readUInt32BE(0) % max;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(items) {
  if (!items.length) {
    return null;
  }

  return items[randomInt(0, items.length - 1)];
}

function getCurrentSessionShadyTipRow(userId, sessionNumber = getMarket().sessionNumber) {
  if (!sessionNumber) {
    return null;
  }

  return db.prepare(
    `SELECT user_id, session_number, status, current_number, streak, last_outcome_json, updated_at
     FROM shady_tips
     WHERE user_id = ? AND session_number = ?`
  ).get(userId, sessionNumber);
}

function saveShadyTipRow(userId, sessionNumber, updates) {
  db.prepare(
    `INSERT INTO shady_tips (user_id, session_number, status, current_number, streak, last_outcome_json, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       session_number = excluded.session_number,
       status = excluded.status,
       current_number = excluded.current_number,
       streak = excluded.streak,
       last_outcome_json = excluded.last_outcome_json,
       updated_at = excluded.updated_at`
  ).run(
    userId,
    sessionNumber,
    updates.status,
    updates.currentNumber ?? null,
    updates.streak ?? 0,
    updates.lastOutcome ? JSON.stringify(updates.lastOutcome) : null,
    new Date().toISOString()
  );
}

function getShadyTipState(userId) {
  const market = getMarket();
  const row = getCurrentSessionShadyTipRow(userId, market.sessionNumber);
  const status = row?.status || (market.isOpen && market.sessionNumber > 0 ? "ready" : "locked");
  const lastOutcome = parseJsonValue(row?.last_outcome_json, null);

  return {
    sessionNumber: market.sessionNumber,
    marketOpen: market.isOpen,
    status,
    targetStreak: SHADY_TIP_TARGET_STREAK,
    streak: row?.streak || 0,
    currentNumber: row?.current_number ?? null,
    guessesRemaining: Math.max(0, SHADY_TIP_TARGET_STREAK - (row?.streak || 0)),
    canStart: market.isOpen && market.sessionNumber > 0 && !row,
    canGuess: market.isOpen && row?.status === "in_progress",
    lastOutcome
  };
}

function assertShadyTipMarketOpen() {
  const market = getMarket();
  if (!market.isOpen || market.sessionNumber <= 0) {
    throw new Error("Shady Tip unlocks when the market opens for class.");
  }
  return market;
}

function rollShadyTipNumber(previousNumber = null) {
  let next = randomInt(1, 10);
  while (previousNumber !== null && next === previousNumber) {
    next = randomInt(1, 10);
  }
  return next;
}

function startShadyTip(userId) {
  const market = assertShadyTipMarketOpen();
  const existing = getCurrentSessionShadyTipRow(userId, market.sessionNumber);
  if (existing?.status === "in_progress") {
    throw new Error("Your Shady Tip run is already in progress.");
  }
  if (existing) {
    throw new Error("You already used Shady Tip this session.");
  }

  const currentNumber = rollShadyTipNumber();
  saveShadyTipRow(userId, market.sessionNumber, {
    status: "in_progress",
    currentNumber,
    streak: 0,
    lastOutcome: null
  });
  setUserProgressValue(userId, SHADY_TIP_USED_AT_KEY, new Date().toISOString());
  return currentNumber;
}

function applyShadyTipReward(userId) {
  const companies = getCompanies();
  const company = pickRandom(companies);
  const sharesAwarded = randomInt(SHADY_TIP_SHARE_REWARD_RANGE.min, SHADY_TIP_SHARE_REWARD_RANGE.max);
  const holdingProgressKey = `${HOLDING_PROGRESS_PREFIX}${company.ticker}`;
  const existingHolding = db.prepare(
    `SELECT shares FROM holdings WHERE user_id = ? AND ticker = ?`
  ).get(userId, company.ticker);

  db.prepare(
    `INSERT INTO holdings (user_id, ticker, shares)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id, ticker) DO UPDATE SET shares = holdings.shares + excluded.shares`
  ).run(userId, company.ticker, sharesAwarded);

  if (!existingHolding) {
    setUserProgressValue(userId, holdingProgressKey, String(getBadgeDayInfo().cycleNumber));
  }

  return {
    result: "won",
    ticker: company.ticker,
    companyName: company.name,
    sharesAwarded,
    previousShares: existingHolding?.shares || 0
  };
}

function applyShadyTipPenalty(userId, guessNumber) {
  const penaltyPercent = SHADY_TIP_PERCENT_PENALTIES[Math.max(0, guessNumber - 1)] || SHADY_TIP_PERCENT_PENALTIES.at(-1);
  const holdings = db.prepare(
    `SELECT h.ticker, h.shares, c.name
     FROM holdings h
     JOIN companies c ON c.ticker = h.ticker
     WHERE h.user_id = ?
     ORDER BY h.ticker ASC`
  ).all(userId);

  const holding = pickRandom(holdings);
  if (holding) {
    const sharesLost = Math.min(holding.shares, Math.max(1, Math.ceil(holding.shares * (penaltyPercent / 100))));
    const remainingShares = holding.shares - sharesLost;
    if (remainingShares > 0) {
      db.prepare(`UPDATE holdings SET shares = ? WHERE user_id = ? AND ticker = ?`).run(remainingShares, userId, holding.ticker);
    } else {
      db.prepare(`DELETE FROM holdings WHERE user_id = ? AND ticker = ?`).run(userId, holding.ticker);
      deleteUserProgressValue(userId, `${HOLDING_PROGRESS_PREFIX}${holding.ticker}`);
    }

    return {
      result: "lost",
      penaltyType: "shares",
      ticker: holding.ticker,
      companyName: holding.name,
      penaltyPercent,
      sharesLost
    };
  }

  const user = getUserById(userId);
  const cashFine = Math.min(roundMoney(user.cash), SHADY_TIP_CASH_FINES[Math.max(0, guessNumber - 1)] || SHADY_TIP_CASH_FINES.at(-1));
  db.prepare(`UPDATE users SET cash = ? WHERE id = ?`).run(roundMoney(user.cash - cashFine), userId);

  return {
    result: "lost",
    penaltyType: "cash",
    penaltyPercent,
    cashLost: roundMoney(cashFine)
  };
}

function resolveShadyTipGuess(userId, guess) {
  const market = assertShadyTipMarketOpen();
  const row = getCurrentSessionShadyTipRow(userId, market.sessionNumber);
  if (!row || row.status !== "in_progress" || row.current_number === null) {
    throw new Error("Start a Shady Tip run before making a guess.");
  }

  const nextNumber = rollShadyTipNumber(row.current_number);
  const correct = guess === (nextNumber > row.current_number ? "higher" : "lower");
  const guessNumber = row.streak + 1;

  if (correct) {
    if (guessNumber >= SHADY_TIP_TARGET_STREAK) {
      const reward = applyShadyTipReward(userId);
      saveShadyTipRow(userId, market.sessionNumber, {
        status: "won",
        currentNumber: nextNumber,
        streak: guessNumber,
        lastOutcome: {
          ...reward,
          guess,
          previousNumber: row.current_number,
          nextNumber,
          guessNumber
        }
      });
      setUserProgressValue(userId, SHADY_TIP_WON_AT_KEY, new Date().toISOString());

      return {
        message: `Shady Tip hit. ${row.current_number} → ${nextNumber}. You picked correctly four times and got ${reward.sharesAwarded} ${reward.ticker} shares.`
      };
    }

    saveShadyTipRow(userId, market.sessionNumber, {
      status: "in_progress",
      currentNumber: nextNumber,
      streak: guessNumber,
      lastOutcome: null
    });
    return {
      message: `Correct. ${row.current_number} → ${nextNumber}. Keep going.`
    };
  }

  const penalty = applyShadyTipPenalty(userId, guessNumber);
  saveShadyTipRow(userId, market.sessionNumber, {
    status: "lost",
    currentNumber: nextNumber,
    streak: row.streak,
    lastOutcome: {
      ...penalty,
      guess,
      previousNumber: row.current_number,
      nextNumber,
      guessNumber
    }
  });

  if (penalty.penaltyType === "shares") {
    return {
      message: `Shady Tip blew up. ${row.current_number} → ${nextNumber}. You lost ${penalty.sharesLost} ${penalty.ticker} shares.`
    };
  }

  return {
    message: `Shady Tip blew up. ${row.current_number} → ${nextNumber}. You paid a ${formatCurrency(penalty.cashLost)} cash fine.`
  };
}

function serializeUser(userId) {
  const user = getUserById(userId);
  if (!user) {
    return null;
  }

  const positions = db.prepare(
    `SELECT h.ticker, c.name, c.industry, c.volatility, h.shares, c.price
     FROM holdings h
     JOIN companies c ON c.ticker = h.ticker
     WHERE h.user_id = ?
     ORDER BY (h.shares * c.price) DESC`
  ).all(userId).map((position) => ({
    ticker: position.ticker,
    name: position.name,
    industry: position.industry,
    volatility: position.volatility,
    shares: position.shares,
    price: roundMoney(position.price),
    marketValue: roundMoney(position.shares * position.price)
  }));

  const totalValue = roundMoney(
    roundMoney(user.cash) + positions.reduce((sum, position) => sum + position.marketValue, 0)
  );

  if (totalValue < getStartingCash()) {
    setUserProgressValue(userId, SEEN_BELOW_START_KEY, new Date().toISOString());
  }
  if (totalValue < getStartingCash() * 0.5) {
    setUserProgressValue(userId, SEEN_BELOW_HALF_KEY, new Date().toISOString());
  }

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
    watchlist,
    shadyTip: getShadyTipState(userId),
    research: getResearchState(userId),
    ipo: getIpoState(userId),
    lottery: getLotteryState(userId),
    lobby: getLobbyState(userId),
    badges: getUserBadgeSummary(userId)
  };
}

function getUserProgressMap(userId) {
  return new Map(
    db.prepare(`SELECT key, value FROM user_progress WHERE user_id = ?`).all(userId).map((row) => [row.key, row.value])
  );
}

function setUserProgressValue(userId, key, value) {
  db.prepare(
    `INSERT INTO user_progress (user_id, key, value, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).run(userId, key, String(value), new Date().toISOString());
}

function deleteUserProgressValue(userId, key) {
  db.prepare(`DELETE FROM user_progress WHERE user_id = ? AND key = ?`).run(userId, key);
}

function syncHoldingProgress(userId, positions, badgeDayNumber, progressMap) {
  const heldTickers = new Set(positions.map((position) => position.ticker));

  [...progressMap.keys()]
    .filter((key) => key.startsWith(HOLDING_PROGRESS_PREFIX) && !heldTickers.has(key.slice(HOLDING_PROGRESS_PREFIX.length)))
    .forEach((key) => {
      deleteUserProgressValue(userId, key);
      progressMap.delete(key);
    });

  positions.forEach((position) => {
    const key = `${HOLDING_PROGRESS_PREFIX}${position.ticker}`;
    const existingValue = Number(progressMap.get(key));
    if (!progressMap.has(key) || (Number.isFinite(existingValue) && existingValue > badgeDayNumber)) {
      const seedDay = Math.max(Number(badgeDayNumber) || 0, 0);
      setUserProgressValue(userId, key, String(seedDay));
      progressMap.set(key, String(seedDay));
    }
  });
}

function getUserBadgeSummary(userId) {
  const latestBadgeDay = getBadgeDayInfo().cycleNumber;
  const awardRows = db.prepare(
    `SELECT badge_id, COUNT(*) AS win_count, MAX(awarded_at) AS last_earned_at, MAX(badge_day_number) AS last_badge_day_number
     FROM badge_awards
     WHERE user_id = ?
     GROUP BY badge_id`
  ).all(userId);

  return awardRows
    .map((row) => {
      const def = BADGE_DEFS.find((badge) => badge.id === row.badge_id);
      if (!def) {
        return null;
      }

      return {
        id: def.id,
        label: def.label,
        description: def.description,
        count: row.win_count,
        lastEarnedAt: row.last_earned_at,
        lastBadgeDayNumber: row.last_badge_day_number,
        wonToday: latestBadgeDay > 0 && row.last_badge_day_number === latestBadgeDay
      };
    })
    .filter(Boolean)
    .sort((a, b) => (
      Number(b.wonToday) - Number(a.wonToday)
      || b.count - a.count
      || new Date(b.lastEarnedAt).getTime() - new Date(a.lastEarnedAt).getTime()
      || a.label.localeCompare(b.label)
    ));
}

function awardBadgeAward(userId, badgeId, badgeDayNumber, awardedAt) {
  db.prepare(
    `INSERT OR IGNORE INTO badge_awards (user_id, badge_id, badge_day_number, awarded_at) VALUES (?, ?, ?, ?)`
  ).run(userId, badgeId, badgeDayNumber, awardedAt);
}

function getUserTransactions(userId) {
  return db.prepare(
    `SELECT id, user_id, ticker, company_name, side, shares, price, total, timestamp,
            COALESCE(session_number, 0) AS session_number, rowid AS sequence_id
     FROM transactions
     WHERE user_id = ?
     ORDER BY datetime(timestamp) ASC, rowid ASC`
  ).all(userId).map((transaction) => ({
    id: transaction.id,
    user_id: transaction.user_id,
    ticker: transaction.ticker,
    company_name: transaction.company_name,
    side: transaction.side,
    shares: transaction.shares,
    price: roundMoney(transaction.price),
    total: roundMoney(transaction.total),
    timestamp: transaction.timestamp,
    sessionNumber: Number(transaction.session_number) || 0,
    sequenceId: transaction.sequence_id
  }));
}

function getUserLoginEvents(userId, sinceTime = null) {
  return db.prepare(
    `SELECT logged_in_at
     FROM login_events
     WHERE user_id = ?
       ${sinceTime ? "AND datetime(logged_in_at) > datetime(?)" : ""}
     ORDER BY datetime(logged_in_at) ASC, id ASC`
  ).all(...(sinceTime ? [userId, sinceTime] : [userId]))
    .map((row) => row.logged_in_at);
}

function getMarketCloses(sinceTime = null) {
  return db.prepare(
    `SELECT closed_at
     FROM market_closes
     ${sinceTime ? "WHERE datetime(closed_at) > datetime(?)" : ""}
     ORDER BY datetime(closed_at) ASC, id ASC`
  ).all(...(sinceTime ? [sinceTime] : []))
    .map((row) => row.closed_at);
}

function getNegativeEventTickers(sinceTime = null) {
  return new Set(
    db.prepare(
      `SELECT DISTINCT ee.ticker
       FROM event_effects ee
       JOIN events e ON e.id = ee.event_id
       WHERE ee.percent_change < 0
       ${sinceTime ? "AND datetime(e.created_at) > datetime(?)" : ""}
       ORDER BY ee.ticker ASC`
    ).all(...(sinceTime ? [sinceTime] : []))
      .map((row) => row.ticker)
  );
}

function computeOpenLotsByTicker(transactions) {
  const lotsByTicker = new Map();

  transactions.forEach((transaction) => {
    const lots = lotsByTicker.get(transaction.ticker) || [];

    if (transaction.side === "buy") {
      lots.push({
        sharesRemaining: transaction.shares,
        price: roundMoney(transaction.price)
      });
      lotsByTicker.set(transaction.ticker, lots);
      return;
    }

    let sharesRemaining = transaction.shares;
    while (sharesRemaining > 0 && lots.length) {
      const lot = lots[0];
      const matchedShares = Math.min(sharesRemaining, lot.sharesRemaining);
      lot.sharesRemaining -= matchedShares;
      sharesRemaining -= matchedShares;

      if (lot.sharesRemaining <= 0) {
        lots.shift();
      }
    }

    lotsByTicker.set(transaction.ticker, lots);
  });

  return lotsByTicker;
}

function hasProfitableOpenPosition(ticker, positions, openLotsByTicker) {
  const position = positions.find((entry) => entry.ticker === ticker);
  if (!position || position.shares <= 0) {
    return false;
  }

  const lots = openLotsByTicker.get(ticker) || [];
  const totalShares = lots.reduce((sum, lot) => sum + lot.sharesRemaining, 0);
  if (totalShares <= 0) {
    return false;
  }

  const costBasis = lots.reduce((sum, lot) => sum + (lot.sharesRemaining * lot.price), 0);
  const averageCost = roundMoney(costBasis / totalShares);
  return position.price > averageCost;
}

function getUserPortfolioSnapshot(userId) {
  const user = getUserById(userId);
  if (!user) {
    return null;
  }

  const positions = db.prepare(
    `SELECT h.ticker, c.name, c.industry, c.volatility, h.shares, c.price
     FROM holdings h
     JOIN companies c ON c.ticker = h.ticker
     WHERE h.user_id = ?
     ORDER BY (h.shares * c.price) DESC`
  ).all(userId).map((position) => ({
    ticker: position.ticker,
    name: position.name,
    industry: position.industry,
    volatility: position.volatility,
    shares: position.shares,
    price: roundMoney(position.price),
    marketValue: roundMoney(position.shares * position.price)
  }));

  return {
    user,
    positions,
    totalValue: roundMoney(
      roundMoney(user.cash) + positions.reduce((sum, position) => sum + position.marketValue, 0)
    ),
    watchlist: getUserWatchlist(userId),
    transactions: getUserTransactions(userId)
  };
}

function getBadgeAwardCandidates(userId, sinceTime, badgeDayNumber) {
  const snapshot = getUserPortfolioSnapshot(userId);
  if (!snapshot) {
    return [];
  }

  const { positions, totalValue, watchlist, transactions } = snapshot;
  const startingCash = getStartingCash();
  const progressMap = getUserProgressMap(userId);
  const sinceMs = sinceTime ? new Date(sinceTime).getTime() : -Infinity;
  const activitySince = (timestamp) => !sinceTime || new Date(timestamp).getTime() > sinceMs;
  const loginEventsSince = getUserLoginEvents(userId, sinceTime);
  const marketClosesSince = getMarketCloses(sinceTime);
  const negativeEventTickers = getNegativeEventTickers(sinceTime);

  syncHoldingProgress(userId, positions, badgeDayNumber - 1, progressMap);

  const industryCount = new Set(positions.map((position) => position.industry).filter(Boolean)).size;
  const heldTickers = new Set(positions.map((position) => position.ticker));
  const highVolatilityCount = positions.filter((position) => ["High", "Extreme"].includes(position.volatility)).length;
  const maxShares = positions.reduce((max, position) => Math.max(max, position.shares), 0);
  const transactionsSince = transactions.filter((transaction) => activitySince(transaction.timestamp));
  const realizedTradesSince = computeRealizedTradesFromTransactions(transactions).filter((trade) => activitySince(trade.timestamp));
  const openLotsByTicker = computeOpenLotsByTicker(transactions);
  const mcPosition = positions.find((position) => position.ticker === "MC");
  const mcRatio = mcPosition && totalValue > 0 ? mcPosition.marketValue / totalValue : 0;

  const hasPaperHands = (() => {
    const tickerState = new Map();
    for (const transaction of transactionsSince) {
      const current = tickerState.get(transaction.ticker) || { bought: false, sold: false };
      current[transaction.side === "buy" ? "bought" : "sold"] = true;
      if (current.bought && current.sold) {
        return true;
      }
      tickerState.set(transaction.ticker, current);
    }
    return false;
  })();

  const hasOpeningBell = transactionsSince.some((transaction) => {
    const tradeTime = new Date(transaction.timestamp).getTime();
    return loginEventsSince.some((loginAt) => {
      const loginTime = new Date(loginAt).getTime();
      const delta = tradeTime - loginTime;
      return delta >= 0 && delta <= 60000;
    });
  });

  const hasDiamondHands = positions.some((position) => {
    const startedDay = Number(progressMap.get(`${HOLDING_PROGRESS_PREFIX}${position.ticker}`) || 0);
    return badgeDayNumber - startedDay >= 3;
  });
  const hasLastSecondLegend = realizedTradesSince.some((trade) => (
    trade.profit > 0 && marketClosesSince.some((closedAt) => {
      const closeTime = new Date(closedAt).getTime();
      const tradeTime = new Date(trade.timestamp).getTime();
      const delta = closeTime - tradeTime;
      return delta >= 0 && delta <= 60000;
    })
  ));
  const hasIceInYourVeins = [...negativeEventTickers].some((ticker) => hasProfitableOpenPosition(ticker, positions, openLotsByTicker));

  const shadyTipUsedAt = progressMap.get(SHADY_TIP_USED_AT_KEY);
  const shadyTipWonAt = progressMap.get(SHADY_TIP_WON_AT_KEY);
  const seenBelowStartAt = progressMap.get(SEEN_BELOW_START_KEY);
  const seenBelowHalfAt = progressMap.get(SEEN_BELOW_HALF_KEY);
  const untouchableStreak = Number(progressMap.get(UNTOUCHABLE_STREAK_KEY) || 0);
  const hasLossingSellSince = realizedTradesSince.some((trade) => trade.profit < 0);
  const nextUntouchableStreak = transactionsSince.length > 0 && !hasLossingSellSince ? untouchableStreak + 1 : 0;
  setUserProgressValue(userId, UNTOUCHABLE_STREAK_KEY, String(nextUntouchableStreak));

  const shouldAward = new Set();

  if (hasOpeningBell) shouldAward.add("opening-bell");
  if (watchlist.length >= 5) shouldAward.add("watch-captain");
  if (industryCount >= 3) shouldAward.add("diversifier");
  if (totalValue > startingCash) shouldAward.add("in-the-green");
  if (maxShares >= 25) shouldAward.add("heavy-hitter");
  if (transactionsSince.length >= 10) shouldAward.add("floor-veteran");
  if (shadyTipWonAt && activitySince(shadyTipWonAt)) shouldAward.add("shady-survivor");
  if (shadyTipUsedAt && activitySince(shadyTipUsedAt)) shouldAward.add("shady-character");
  if (hasPaperHands) shouldAward.add("paper-hands");
  if (hasDiamondHands) shouldAward.add("diamond-hands");
  if (realizedTradesSince.some((trade) => trade.ticker === "JHS" && trade.profit > 0)) shouldAward.add("horse-whisperer");
  if (realizedTradesSince.some((trade) => trade.ticker === "UNO" && trade.profit > 0)) shouldAward.add("basement-billionaire");
  if (heldTickers.has("HHS") && heldTickers.has("IMM")) shouldAward.add("natural-disaster");
  if (heldTickers.has("SC") && heldTickers.has("YTT")) shouldAward.add("snacks-investor-of-the-year");
  if (highVolatilityCount >= 3) shouldAward.add("oops-all-volatility");
  if (seenBelowStartAt && activitySince(seenBelowStartAt) && totalValue > startingCash) shouldAward.add("comeback-kid");
  if (seenBelowHalfAt && activitySince(seenBelowHalfAt) && totalValue > startingCash) shouldAward.add("phoenix");
  if (heldTickers.has("MC") && hasGoatMegaEvent(sinceTime)) shouldAward.add("goat-logistics-expert");
  if (mcRatio > 0.5) shouldAward.add("go-big-or-goat-home");
  if (heldTickers.has("WW") && heldTickers.has("JHS")) shouldAward.add("brain-rot-capital");
  if (heldTickers.has("HHS") && heldTickers.has("IMM") && heldTickers.has("DBM")) shouldAward.add("doomsday-prepper");
  if (heldTickers.has("UNO") && heldTickers.has("JHS")) shouldAward.add("basement-visitor");
  if (positions.length >= 10) shouldAward.add("collector-supreme");
  if (industryCount >= 5) shouldAward.add("balanced-breakfast");
  if (realizedTradesSince.some((trade) => trade.ticker === "SC" && trade.profit < 0)) shouldAward.add("snackcident");
  if (shadyTipWonAt && activitySince(shadyTipWonAt) && hasLossingSellSince) shouldAward.add("chaos-reigns");
  if (nextUntouchableStreak >= 3) shouldAward.add("untouchable");
  if (hasIceInYourVeins) shouldAward.add("ice-in-your-veins");
  if (hasLastSecondLegend) shouldAward.add("last-second-legend");

  const leaderboard = computeLeaderboard();
  if (leaderboard[0]?.id === userId && totalValue > startingCash) {
    shouldAward.add("market-wizard");
  }

  return [...shouldAward];
}

function awardBadgeDay() {
  const current = getBadgeDayInfo();
  const nextCycle = current.cycleNumber + 1;
  const awardedAt = new Date().toISOString();
  const studentIds = db.prepare(`SELECT id FROM users ORDER BY created_at ASC`).all().map((row) => row.id);

  db.prepare(`INSERT INTO badge_days (cycle_number, awarded_at) VALUES (?, ?)`).run(nextCycle, awardedAt);

  let awardsGranted = 0;
  studentIds.forEach((userId) => {
    const badgeIds = getBadgeAwardCandidates(userId, current.awardedAt, nextCycle);
    badgeIds.forEach((badgeId) => {
      awardBadgeAward(userId, badgeId, nextCycle, awardedAt);
      awardsGranted += 1;
    });
  });

  return {
    badgeDayNumber: nextCycle,
    awardedAt,
    awardsGranted,
    studentsReviewed: studentIds.length
  };
}

function hasGoatMegaEvent(sinceTime = null) {
  return Boolean(db.prepare(
    `SELECT 1
     FROM events e
     LEFT JOIN event_effects ee ON ee.event_id = e.id
     WHERE (LOWER(e.headline) LIKE '%goat%' OR LOWER(e.body) LIKE '%goat%')
       AND (ee.ticker = 'MC' OR LOWER(e.headline) LIKE '%mega%' OR LOWER(e.body) LIKE '%mega%')
       ${sinceTime ? "AND datetime(e.created_at) > datetime(?)" : ""}
     LIMIT 1`
  ).get(...(sinceTime ? [sinceTime] : [])));
}

function computeRealizedTradesFromTransactions(transactions) {
  const lotsByPosition = new Map();
  const realizedTrades = [];

  transactions.forEach((transaction) => {
    const positionKey = `${transaction.user_id}:${transaction.ticker}`;
    const lots = lotsByPosition.get(positionKey) || [];

    if (transaction.side === "buy") {
      lots.push({
        sharesRemaining: transaction.shares,
        price: roundMoney(transaction.price)
      });
      lotsByPosition.set(positionKey, lots);
      return;
    }

    let sharesRemaining = transaction.shares;
    let costBasis = 0;

    while (sharesRemaining > 0 && lots.length) {
      const lot = lots[0];
      const matchedShares = Math.min(sharesRemaining, lot.sharesRemaining);
      costBasis = roundMoney(costBasis + matchedShares * lot.price);
      lot.sharesRemaining -= matchedShares;
      sharesRemaining -= matchedShares;

      if (lot.sharesRemaining <= 0) {
        lots.shift();
      }
    }

    if (sharesRemaining > 0) {
      costBasis = roundMoney(costBasis + sharesRemaining * roundMoney(transaction.price));
    }

    const proceeds = roundMoney(transaction.total);
    const profit = roundMoney(proceeds - costBasis);
    const profitPercent = costBasis > 0 ? roundMoney((profit / costBasis) * 100) : 0;

    realizedTrades.push({
      id: transaction.id,
      userId: transaction.user_id,
      displayName: transaction.display_name,
      username: transaction.username,
      ticker: transaction.ticker,
      companyName: transaction.company_name,
      shares: transaction.shares,
      sellPrice: roundMoney(transaction.price),
      proceeds,
      costBasis,
      profit,
      profitPercent,
      sessionNumber: transaction.sessionNumber || 0,
      timestamp: transaction.timestamp,
      sequenceId: transaction.sequenceId
    });
    lotsByPosition.set(positionKey, lots);
  });

  return realizedTrades;
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

function computeBadgeLeaderboard(limit = 8) {
  const latestBadgeDay = getBadgeDayInfo().cycleNumber;

  return db.prepare(
    `SELECT
        u.id,
        u.username,
        u.display_name,
        COUNT(*) AS total_badge_wins,
        COUNT(DISTINCT ba.badge_id) AS badge_types,
        SUM(CASE WHEN ba.badge_day_number = ? THEN 1 ELSE 0 END) AS wins_today
     FROM badge_awards ba
     JOIN users u ON u.id = ba.user_id
     GROUP BY u.id, u.username, u.display_name
     ORDER BY total_badge_wins DESC, badge_types DESC, u.display_name COLLATE NOCASE ASC
     LIMIT ?`
  ).all(latestBadgeDay, limit).map((row, index) => ({
    rank: index + 1,
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    totalWins: Number(row.total_badge_wins) || 0,
    badgeTypes: Number(row.badge_types) || 0,
    winsToday: Number(row.wins_today) || 0
  }));
}

function computeTradeHighlights(limit = 3) {
  const transactions = db.prepare(
    `SELECT t.id, t.user_id, t.ticker, t.company_name, t.side, t.shares, t.price, t.total, t.timestamp,
            COALESCE(t.session_number, 0) AS session_number, t.rowid AS sequence_id, u.display_name, u.username
     FROM transactions t
     JOIN users u ON u.id = t.user_id
     ORDER BY datetime(t.timestamp) ASC, t.rowid ASC`
  ).all().map((transaction) => ({
    id: transaction.id,
    user_id: transaction.user_id,
    ticker: transaction.ticker,
    company_name: transaction.company_name,
    side: transaction.side,
    shares: transaction.shares,
    price: roundMoney(transaction.price),
    total: roundMoney(transaction.total),
    timestamp: transaction.timestamp,
    sessionNumber: Number(transaction.session_number) || 0,
    sequenceId: transaction.sequence_id,
    display_name: transaction.display_name,
    username: transaction.username
  }));

  const realizedTrades = computeRealizedTradesFromTransactions(transactions);

  const byWin = (a, b) => (
    b.profit - a.profit
    || new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    || b.sequenceId - a.sequenceId
  );
  const byLoss = (a, b) => (
    a.profit - b.profit
    || new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    || b.sequenceId - a.sequenceId
  );

  const serializeHighlight = (trade) => ({
    id: trade.id,
    displayName: trade.displayName,
    username: trade.username,
    ticker: trade.ticker,
    companyName: trade.companyName,
    shares: trade.shares,
    sellPrice: trade.sellPrice,
    proceeds: trade.proceeds,
    costBasis: trade.costBasis,
    profit: trade.profit,
    profitPercent: trade.profitPercent,
    timestamp: trade.timestamp
  });

  return {
    biggestWins: realizedTrades
      .filter((trade) => trade.profit > 0)
      .sort(byWin)
      .slice(0, limit)
      .map(serializeHighlight),
    biggestLosses: realizedTrades
      .filter((trade) => trade.profit < 0)
      .sort(byLoss)
      .slice(0, limit)
      .map(serializeHighlight)
  };
}

function buildAdminPayload() {
  const settings = getSettings();
  const leaderboard = computeLeaderboard();
  const badgeDay = getBadgeDayInfo();
  const students = db.prepare(
    `SELECT id, username, display_name, cash, created_at FROM users ORDER BY display_name COLLATE NOCASE ASC`
  ).all().map((user) => {
    const summary = serializeUser(user.id);
    const badges = getUserBadgeSummary(user.id);
    const totalBadgeWins = badges.reduce((sum, badge) => sum + (badge.count || 0), 0);
    return {
      id: user.id,
      displayName: user.display_name,
      username: user.username,
      createdAt: user.created_at,
      cash: summary.cash,
      totalValue: summary.totalValue,
      positionsCount: summary.positions.length,
      transactionCount: db.prepare(`SELECT COUNT(*) AS count FROM transactions WHERE user_id = ?`).get(user.id).count,
      badgeTypes: badges.length,
      totalBadgeWins,
      winsToday: badges.filter((badge) => badge.wonToday).length,
      latestBadgeDayNumber: badges.reduce((max, badge) => Math.max(max, Number(badge.lastBadgeDayNumber) || 0), 0),
      badges,
      positionsLabel: summary.positions.length
        ? summary.positions.map((position) => `${position.ticker} (${position.shares})`).join(", ")
        : "No holdings"
    };
  });

  const recentTrades = getRecentTrades(12);

  return {
    settings: {
      teacherUsername: settings.teacherUsername,
      startingCash: settings.startingCash
    },
    badgeDay,
    metrics: {
      studentCount: students.length,
      eventCount: db.prepare(`SELECT COUNT(*) AS count FROM events`).get().count,
      totalTrades: db.prepare(`SELECT COUNT(*) AS count FROM transactions`).get().count,
      badgeDaysAwarded: badgeDay.cycleNumber,
      totalClassValue: roundMoney(leaderboard.reduce((sum, entry) => sum + entry.totalValue, 0)),
      topStudent: leaderboard[0] || null
    },
    students,
    recentTrades
  };
}

function getRecentTrades(limit = 12) {
  return db.prepare(
    `SELECT t.id, t.ticker, t.company_name, t.side, t.shares, t.price, t.total, t.timestamp, u.display_name, u.username
     FROM transactions t
     JOIN users u ON u.id = t.user_id
     ORDER BY datetime(t.timestamp) DESC, t.rowid DESC
     LIMIT ?`
  ).all(limit).map((trade) => ({
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
}

function executeTrade(userId, ticker, side, shares) {
  const market = getMarket();
  if (!market.isOpen) {
    throw new Error("The market is currently closed.");
  }

  const lobbyState = getLobbyState(userId);
  if (lobbyState.tradeFrozen) {
    throw new Error(`Compliance Review is active. Trading unlocks in about ${Math.max(1, Math.ceil(lobbyState.freezeSecondsLeft / 60))} minute${Math.ceil(lobbyState.freezeSecondsLeft / 60) === 1 ? "" : "s"}.`);
  }

  const company = getCompanyByTicker(ticker);
  const user = getUserById(userId);
  if (!company || !user) {
    throw new Error("Could not find that trade target.");
  }

  const activeIpoWave = getCurrentIpoWindow();
  if (side === "buy" && activeIpoWave) {
    const currentWaveTickers = new Set(activeIpoWave.config.companies.map((entry) => entry.ticker));
    if (currentWaveTickers.has(ticker)) {
      const existingChoice = getIpoChoice(userId, activeIpoWave.waveKey);
      if (existingChoice && existingChoice.chosenTicker !== ticker) {
        throw new Error(`This IPO wave only lets you back one launch stock. You already picked ${existingChoice.chosenTicker}.`);
      }
      if (!existingChoice) {
        saveIpoChoice(userId, activeIpoWave.waveKey, ticker);
      }
    }
  }

  const tradeValue = roundMoney(company.price * shares);
  const holding = db.prepare(
    `SELECT shares FROM holdings WHERE user_id = ? AND ticker = ?`
  ).get(userId, ticker);
  const currentShares = holding?.shares || 0;
  const holdingProgressKey = `${HOLDING_PROGRESS_PREFIX}${ticker}`;
  const currentBadgeDay = getBadgeDayInfo().cycleNumber;

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

    if (currentShares === 0) {
      setUserProgressValue(userId, holdingProgressKey, String(currentBadgeDay));
    }
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
      deleteUserProgressValue(userId, holdingProgressKey);
    }
  }

  db.prepare(
    `INSERT INTO transactions (id, user_id, ticker, company_name, side, shares, price, total, timestamp, session_number)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    crypto.randomUUID(),
    userId,
    ticker,
    company.name,
    side,
    shares,
    roundMoney(company.price),
    tradeValue,
    new Date().toISOString(),
    market.sessionNumber || 0
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
    if (count >= 10) {
      throw new Error("Watchlists can track up to 10 companies at a time.");
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
    return {
      message: isOpen ? "Market is already open." : "Market is already closed."
    };
  }

  if (isOpen) {
    const openedAt = new Date().toISOString();
    db.prepare(
      `UPDATE market_state SET is_open = 1, session_number = ?, last_opened_at = ? WHERE id = 1`
    ).run(current.sessionNumber + 1, openedAt);
    const scheduledWave = armScheduledResearchPlansForToday();
    const ipoWave = activateIpoWaveForToday();
    const messageParts = ["Market opened."];
    if (scheduledWave) {
      messageParts.push(`${scheduledWave.appliedCount} scheduled stock moves will hit in 10 minutes for the ${scheduledWave.openSlot === 1 ? "AM Trading Window" : "PM Trading Window"}.`);
    }
    if (ipoWave) {
      messageParts.push(`${ipoWave.label} is live with 3 fresh stocks, and one of them is hiding a +350% breakout.`);
    }
    return {
      message: messageParts.join(" ")
    };
  }

  const closedAt = new Date().toISOString();
  db.prepare(
    `UPDATE market_state SET is_open = 0, last_closed_at = ? WHERE id = 1`
  ).run(closedAt);
  recordMarketClose(closedAt);
  return {
    message: "Market closed."
  };
}

function publishEvent(headline, bodyText, effects, options = {}) {
  const eventId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const appliedEffects = [];
  const isBigStory = Boolean(options.isBigStory);

  effects.forEach((effect) => {
    const company = getCompanyByTicker(effect.ticker);
    if (!company) {
      return;
    }

    const oldPrice = roundMoney(company.price);
    const newPrice = Math.max(MIN_STOCK_PRICE, roundMoney(oldPrice * (1 + effect.percentChange / 100)));
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

  db.prepare(`INSERT INTO events (id, headline, body, is_big_story, created_at) VALUES (?, ?, ?, ?, ?)`).run(
    eventId,
    headline,
    bodyText,
    isBigStory ? 1 : 0,
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

  return {
    eventId,
    createdAt,
    appliedEffects
  };
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
  db.prepare(`DELETE FROM shady_tips WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM research_runs WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM research_usage WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM lottery_runs WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM lobby_runs WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM ipo_choices WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM login_events WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM badge_awards WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM user_badges WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM user_progress WHERE user_id = ?`).run(userId);
}

function deleteStudent(userId) {
  db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
}

function resetGame(scope) {
  const settings = getSettings();

  if (scope === "portfolios") {
    const userIds = db.prepare(`SELECT id FROM users`).all();
    userIds.forEach((user) => resetStudentPortfolio(user.id));
    db.prepare(`DELETE FROM badge_days`).run();
    return;
  }

  const now = new Date().toISOString();
  db.prepare(
    `UPDATE market_state SET is_open = 0, session_number = 0, last_opened_at = NULL, last_closed_at = NULL WHERE id = 1`
  ).run();

  db.prepare(`DELETE FROM company_history`).run();
  const seedTickers = COMPANY_SEEDS.map((company) => company.ticker);
  const deleteExtraCompanies = db.prepare(
    `DELETE FROM companies WHERE ticker NOT IN (${seedTickers.map(() => "?").join(", ")})`
  );
  deleteExtraCompanies.run(...seedTickers);
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
  db.prepare(`DELETE FROM shady_tips`).run();
  db.prepare(`DELETE FROM research_runs`).run();
  db.prepare(`DELETE FROM research_usage`).run();
  db.prepare(`DELETE FROM market_open_days`).run();
  db.prepare(`DELETE FROM ipo_choices`).run();
  db.prepare(`DELETE FROM ipo_waves`).run();
  db.prepare(`UPDATE research_plans SET applied_event_id = NULL, applied_at = NULL`).run();
  db.prepare(`DELETE FROM market_closes`).run();
  insertWelcomeEvent(now);

  if (scope === "market") {
    return;
  }

  db.prepare(`DELETE FROM transactions`).run();
  db.prepare(`DELETE FROM holdings`).run();
  db.prepare(`DELETE FROM login_events`).run();
  db.prepare(`DELETE FROM badge_awards`).run();
  db.prepare(`DELETE FROM badge_days`).run();
  db.prepare(`DELETE FROM user_badges`).run();
  db.prepare(`DELETE FROM user_progress`).run();
  db.prepare(`DELETE FROM users`).run();
  db.prepare(`DELETE FROM research_plans`).run();
  setSetting("teacher_username", settings.teacherUsername);
  setSetting("teacher_password_hash", settings.teacherPasswordHash);
  setSetting("starting_cash", String(settings.startingCash));
  ensureResearchWeekPlan();
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

function formatCurrency(value) {
  return `$${roundMoney(value).toFixed(2)}`;
}
