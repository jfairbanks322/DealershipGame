const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const db = new DatabaseSync(path.join(__dirname, "..", "data", "stock-arena.db"));

const copy = [
  {
    ticker: "HHS",
    bio: "A scrappy wellness startup selling natural remedies, herbal gummies, and vibes with enough confidence to terrify actual scientists.",
    pros: ["Huge social media buzz", "Plenty of room to grow"],
    cons: ["Science is optional", "One bad study could wreck it"]
  },
  {
    ticker: "SKY",
    bio: "A veteran aircraft supplier that makes the planes other companies slap their logos on and pretend they invented.",
    pros: ["Stable contracts", "Trusted industry name"],
    cons: ["Slow and steady can also mean slow and sleepy"]
  },
  {
    ticker: "UNO",
    bio: "Two brothers built this gaming studio in their mom's basement and are now chasing a VR experience so immersive it might require a waiver.",
    pros: ["Massive upside if the game hits", "Cult-following energy"],
    cons: ["Product could be a disaster", "Safety lawsuits are not a great growth plan"]
  },
  {
    ticker: "YTT",
    bio: "A century-old snack-and-soda company that still knows how to sell chips, even if its digital strategy is posting once and hoping.",
    pros: ["Reliable brand recognition", "Slow, steady growth"],
    cons: ["Marketing feels stuck in another decade"]
  },
  {
    ticker: "MCM",
    bio: "A respected parts supplier for major automakers, known for quality engineering and for making mechanics talk about carburetors like poetry.",
    pros: ["Established reputation", "Dependable long-term business"],
    cons: ["Not much moonshot potential"]
  },
  {
    ticker: "IMM",
    bio: "A biotech startup loudly claiming it wants to cure death, which is either the greatest business plan ever pitched or the world's boldest typo.",
    pros: ["If it works, it changes everything", "Investors love big swings"],
    cons: ["If it fails, it fails spectacularly", "Regulators tend to ask follow-up questions"]
  },
  {
    ticker: "JHS",
    bio: "A digital media company devoted entirely to horse content, for viewers who have long believed mainstream streaming is not nearly horse-centric enough.",
    pros: ["Ultra-cheap entry price", "Could become a surprise meme hit"],
    cons: ["Niche is putting it kindly", "Could gallop straight into irrelevance"]
  },
  {
    ticker: "MC",
    bio: "A gigantic conglomerate that somehow sells batteries, cereal, smart fridges, and probably your neighbor's hopes and dreams.",
    pros: ["Everywhere all at once", "Too diversified to ignore"],
    cons: ["Antitrust headaches", "The world may be getting a little tired of them"]
  },
  {
    ticker: "HFW",
    bio: "A global phone and cell service company trying to stay cool while MegaCorp lurks nearby like a billionaire supervillain.",
    pros: ["Massive market share", "Strong global presence"],
    cons: ["Constant pressure from MegaCorp", "One bad product cycle gets expensive fast"]
  },
  {
    ticker: "WW",
    bio: "Owner of the world's favorite short-form video app, where trends are born, dances spread, and homework mysteriously stops getting done.",
    pros: ["Huge daily engagement", "Advertising gold mine"],
    cons: ["Always one scandal away from hearings", "Critics blame it for melting attention spans"]
  },
  {
    ticker: "SAE",
    bio: "A wildly merchandised internet celebrity empire selling shows, candy, lunch kits, and the powerful idea that branding is a personality.",
    pros: ["Kids adore the brand", "Can sell almost anything with a logo on it"],
    cons: ["Products can feel generic", "Quality control has had some adventurous days"]
  },
  {
    ticker: "WMO",
    bio: "A consumer-goods giant built on selling unbelievably cheap stuff people absolutely did not plan to buy five minutes ago.",
    pros: ["Low prices move inventory fast", "Impulse shopping never really goes out of style"],
    cons: ["Ethics questions keep following it", "Margins and reputation can get messy"]
  },
  {
    ticker: "DBM",
    bio: "REDACTED",
    pros: ["REDACTED"],
    cons: ["REDACTED"]
  },
  {
    ticker: "SC",
    bio: "A snack company famous for face-melting cheesy poofs and candy body spray, because apparently someone in product development feared nothing.",
    pros: ["Ridiculously popular with kids", "Strong brand in gross-but-fun snacks"],
    cons: ["Messy products", "Questionable ingredients could cause backlash"]
  },
  {
    ticker: "SSC",
    bio: "The world's biggest cyber security firm, promising to protect your passwords while absolutely definitely probably not peeking through your webcam.",
    pros: ["Critical services for huge clients", "Security spending stays strong when people panic"],
    cons: ["Privacy accusations hit hard", "Trust is the whole business"]
  }
];

db.exec("BEGIN IMMEDIATE");
try {
  const stmt = db.prepare(
    "UPDATE companies SET bio = ?, pros_json = ?, cons_json = ? WHERE ticker = ?"
  );
  for (const company of copy) {
    stmt.run(company.bio, JSON.stringify(company.pros), JSON.stringify(company.cons), company.ticker);
  }
  db.exec("COMMIT");
  console.log(`Updated ${copy.length} companies.`);
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
}
