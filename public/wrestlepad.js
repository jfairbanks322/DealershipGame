const WRESTLERS = [
  {
    id: "john-cena",
    name: "John Cena",
    era: "WWE franchise ace",
    popularity: 94,
    tags: ["wwe", "world_champion", "tag_champion", "royal_rumble", "money_in_bank", "mania_main_event"]
  },
  {
    id: "roman-reigns",
    name: "Roman Reigns",
    era: "Modern WWE centerpiece",
    popularity: 95,
    tags: ["wwe", "nxt", "world_champion", "tag_champion", "royal_rumble", "mania_main_event", "faction_leader"]
  },
  {
    id: "seth-rollins",
    name: "Seth Rollins",
    era: "Architect turned world champion",
    popularity: 89,
    tags: ["wwe", "nxt", "world_champion", "tag_champion", "money_in_bank", "mania_main_event", "faction_leader"]
  },
  {
    id: "cody-rhodes",
    name: "Cody Rhodes",
    era: "Roads through WWE, ROH, and AEW",
    popularity: 84,
    tags: ["wwe", "aew", "roh", "world_champion", "tag_champion", "royal_rumble", "mania_main_event", "faction_leader"]
  },
  {
    id: "randy-orton",
    name: "Randy Orton",
    era: "Legend killer with gold everywhere",
    popularity: 90,
    tags: ["wwe", "world_champion", "tag_champion", "royal_rumble", "money_in_bank", "mania_main_event", "faction_leader"]
  },
  {
    id: "cm-punk",
    name: "CM Punk",
    era: "Pipe bomb icon",
    popularity: 87,
    tags: ["wwe", "ecw", "aew", "roh", "world_champion", "money_in_bank", "submission_finisher"]
  },
  {
    id: "aj-styles",
    name: "AJ Styles",
    era: "Phenomenal across continents",
    popularity: 83,
    tags: ["wwe", "njpw", "roh", "world_champion", "tag_champion", "submission_finisher", "high_flyer", "faction_leader"]
  },
  {
    id: "edge",
    name: "Edge",
    aliases: ["Adam Copeland"],
    era: "Rated-R opportunist",
    popularity: 88,
    tags: ["wwe", "aew", "world_champion", "tag_champion", "royal_rumble", "money_in_bank", "ladder_match", "mania_main_event"]
  },
  {
    id: "jeff-hardy",
    name: "Jeff Hardy",
    era: "Risk-taking ladder icon",
    popularity: 82,
    tags: ["wwe", "aew", "world_champion", "tag_champion", "ladder_match", "high_flyer", "hardcore"]
  },
  {
    id: "matt-hardy",
    name: "Matt Hardy",
    era: "Broken pioneer and tag ace",
    popularity: 70,
    tags: ["wwe", "aew", "roh", "tag_champion", "ladder_match", "hardcore"]
  },
  {
    id: "undertaker",
    name: "The Undertaker",
    aliases: ["Undertaker"],
    era: "Dark legend of WrestleMania",
    popularity: 92,
    tags: ["wwe", "wcw", "world_champion", "tag_champion", "royal_rumble", "mania_main_event"]
  },
  {
    id: "triple-h",
    name: "Triple H",
    era: "Cerebral kingmaker",
    popularity: 91,
    tags: ["wwe", "wcw", "world_champion", "tag_champion", "royal_rumble", "mania_main_event", "faction_leader"]
  },
  {
    id: "kurt-angle",
    name: "Kurt Angle",
    era: "Olympic machine",
    popularity: 85,
    tags: ["wwe", "ecw", "world_champion", "tag_champion", "submission_finisher", "mania_main_event"]
  },
  {
    id: "shawn-michaels",
    name: "Shawn Michaels",
    era: "Showstopper and ladder pioneer",
    popularity: 90,
    tags: ["wwe", "world_champion", "tag_champion", "royal_rumble", "ladder_match", "mania_main_event"]
  },
  {
    id: "bret-hart",
    name: "Bret Hart",
    era: "Excellence of execution",
    popularity: 84,
    tags: ["wwe", "wcw", "world_champion", "tag_champion", "submission_finisher", "mania_main_event"]
  },
  {
    id: "stone-cold",
    name: "Stone Cold Steve Austin",
    aliases: ["Steve Austin", "Stone Cold"],
    era: "Attitude Era firestarter",
    popularity: 96,
    tags: ["wwe", "wcw", "ecw", "world_champion", "tag_champion", "royal_rumble", "mania_main_event"]
  },
  {
    id: "the-rock",
    name: "The Rock",
    aliases: ["Rock", "Dwayne Johnson"],
    era: "Electrifying crossover megastar",
    popularity: 97,
    tags: ["wwe", "world_champion", "tag_champion", "royal_rumble", "mania_main_event", "faction_leader"]
  },
  {
    id: "mick-foley",
    name: "Mick Foley",
    era: "Hardcore heart with three faces",
    popularity: 80,
    tags: ["wwe", "wcw", "ecw", "world_champion", "tag_champion", "mania_main_event", "hardcore"]
  },
  {
    id: "chris-jericho",
    name: "Chris Jericho",
    era: "Portable main eventer",
    popularity: 86,
    tags: ["wwe", "wcw", "ecw", "aew", "njpw", "roh", "world_champion", "tag_champion", "ladder_match", "faction_leader"]
  },
  {
    id: "rey-mysterio",
    name: "Rey Mysterio",
    era: "Masked underdog icon",
    popularity: 87,
    tags: ["wwe", "wcw", "world_champion", "tag_champion", "royal_rumble", "high_flyer"]
  },
  {
    id: "becky-lynch",
    name: "Becky Lynch",
    era: "The Man",
    popularity: 88,
    tags: ["wwe", "nxt", "womens", "world_champion", "royal_rumble", "mania_main_event"]
  },
  {
    id: "charlotte-flair",
    name: "Charlotte Flair",
    era: "Record-setting title collector",
    popularity: 86,
    tags: ["wwe", "nxt", "womens", "world_champion", "royal_rumble", "mania_main_event"]
  },
  {
    id: "mercedes-mone",
    name: "Mercedes Mone",
    aliases: ["Sasha Banks"],
    era: "Banks to Mone across brands",
    popularity: 79,
    tags: ["wwe", "nxt", "njpw", "womens", "world_champion", "tag_champion", "mania_main_event"]
  },
  {
    id: "bayley",
    name: "Bayley",
    era: "Role model with every belt",
    popularity: 81,
    tags: ["wwe", "nxt", "womens", "world_champion", "tag_champion", "money_in_bank", "faction_leader"]
  },
  {
    id: "bianca-belair",
    name: "Bianca Belair",
    era: "EST of WWE",
    popularity: 80,
    tags: ["wwe", "nxt", "womens", "world_champion", "royal_rumble", "mania_main_event"]
  },
  {
    id: "rhea-ripley",
    name: "Rhea Ripley",
    era: "Dominant modern powerhouse",
    popularity: 82,
    tags: ["wwe", "nxt", "womens", "world_champion", "royal_rumble", "faction_leader"]
  },
  {
    id: "iyo-sky",
    name: "Iyo Sky",
    era: "Aerial genius",
    popularity: 74,
    tags: ["wwe", "nxt", "womens", "world_champion", "money_in_bank", "high_flyer"]
  },
  {
    id: "asuka",
    name: "Asuka",
    aliases: ["Kana"],
    era: "Undefeated aura and submission ace",
    popularity: 83,
    tags: ["wwe", "nxt", "womens", "world_champion", "money_in_bank", "royal_rumble", "submission_finisher", "tag_champion"]
  },
  {
    id: "alexa-bliss",
    name: "Alexa Bliss",
    era: "Tiny but dangerous",
    popularity: 78,
    tags: ["wwe", "nxt", "womens", "world_champion", "money_in_bank", "tag_champion"]
  },
  {
    id: "trish-stratus",
    name: "Trish Stratus",
    era: "Attitude and Ruthless Era icon",
    popularity: 84,
    tags: ["wwe", "womens", "world_champion", "mania_main_event"]
  },
  {
    id: "lita",
    name: "Lita",
    era: "Fearless trailblazer",
    popularity: 77,
    tags: ["wwe", "womens", "world_champion", "tag_champion", "high_flyer", "mania_main_event"]
  },
  {
    id: "naomi",
    name: "Naomi",
    era: "Glow-era all-arounder",
    popularity: 74,
    tags: ["wwe", "womens", "tag_champion", "money_in_bank"]
  },
  {
    id: "liv-morgan",
    name: "Liv Morgan",
    era: "Underdog title breakthrough",
    popularity: 76,
    tags: ["wwe", "nxt", "womens", "world_champion", "money_in_bank", "tag_champion"]
  },
  {
    id: "toni-storm",
    name: "Toni Storm",
    era: "Timeless cross-brand champion",
    popularity: 77,
    tags: ["wwe", "aew", "roh", "njpw", "womens", "world_champion"]
  },
  {
    id: "saraya",
    name: "Saraya",
    aliases: ["Paige"],
    era: "Anti-diva era disruptor",
    popularity: 72,
    tags: ["wwe", "aew", "womens", "world_champion"]
  },
  {
    id: "jade-cargill",
    name: "Jade Cargill",
    era: "Dominant modern powerhouse",
    popularity: 73,
    tags: ["aew", "wwe", "womens", "tag_champion", "faction_leader"]
  },
  {
    id: "kenny-omega",
    name: "Kenny Omega",
    era: "Belt collector with world range",
    popularity: 84,
    tags: ["aew", "njpw", "roh", "world_champion", "tag_champion", "high_flyer", "faction_leader"]
  },
  {
    id: "kazuchika-okada",
    name: "Kazuchika Okada",
    era: "Rainmaker standard",
    popularity: 78,
    tags: ["aew", "njpw", "world_champion", "faction_leader"]
  },
  {
    id: "will-ospreay",
    name: "Will Ospreay",
    era: "Aerial ace with heavyweight gold",
    popularity: 76,
    tags: ["aew", "njpw", "roh", "world_champion", "high_flyer"]
  },
  {
    id: "mjf",
    name: "MJF",
    era: "Modern heel centerpiece",
    popularity: 75,
    tags: ["aew", "roh", "world_champion", "faction_leader"]
  },
  {
    id: "samoa-joe",
    name: "Samoa Joe",
    era: "Violence with precision",
    popularity: 73,
    tags: ["wwe", "nxt", "aew", "roh", "world_champion", "submission_finisher"]
  },
  {
    id: "sting",
    name: "Sting",
    era: "Franchise icon across eras",
    popularity: 83,
    tags: ["wcw", "wwe", "aew", "world_champion", "faction_leader"]
  },
  {
    id: "drew-mcintyre",
    name: "Drew McIntyre",
    era: "Heavyweight revival story",
    popularity: 79,
    tags: ["wwe", "nxt", "world_champion", "royal_rumble", "mania_main_event"]
  },
  {
    id: "brock-lesnar",
    name: "Brock Lesnar",
    era: "Box office destroyer",
    popularity: 91,
    tags: ["wwe", "njpw", "world_champion", "royal_rumble", "money_in_bank", "mania_main_event"]
  },
  {
    id: "bryan-danielson",
    name: "Bryan Danielson",
    aliases: ["Daniel Bryan"],
    era: "Technical giant killer",
    popularity: 85,
    tags: ["wwe", "nxt", "aew", "roh", "world_champion", "tag_champion", "money_in_bank", "mania_main_event", "submission_finisher"]
  },
  {
    id: "adam-cole",
    name: "Adam Cole",
    era: "Pan-brand faction frontman",
    popularity: 72,
    tags: ["wwe", "nxt", "aew", "roh", "world_champion", "faction_leader"]
  },
  {
    id: "christian-cage",
    name: "Christian Cage",
    aliases: ["Christian"],
    era: "Opportunist with a kill switch",
    popularity: 71,
    tags: ["wwe", "ecw", "aew", "world_champion", "tag_champion", "money_in_bank", "ladder_match"]
  }
];

const CAREER_SPANS = {
  "john-cena": [2002, 2025],
  "roman-reigns": [2012, 2025],
  "seth-rollins": [2012, 2025],
  "cody-rhodes": [2007, 2025],
  "randy-orton": [2002, 2025],
  "cm-punk": [2005, 2025],
  "aj-styles": [2002, 2025],
  edge: [1998, 2025],
  "jeff-hardy": [1998, 2025],
  "matt-hardy": [1998, 2025],
  undertaker: [1990, 2020],
  "triple-h": [1995, 2019],
  "kurt-angle": [1999, 2023],
  "shawn-michaels": [1988, 2018],
  "bret-hart": [1984, 2000],
  "stone-cold": [1990, 2003],
  "the-rock": [1996, 2013],
  "mick-foley": [1988, 2012],
  "chris-jericho": [1999, 2025],
  "rey-mysterio": [1996, 2025],
  "becky-lynch": [2013, 2025],
  "charlotte-flair": [2013, 2025],
  "mercedes-mone": [2012, 2025],
  bayley: [2013, 2025],
  "bianca-belair": [2016, 2025],
  "rhea-ripley": [2017, 2025],
  "iyo-sky": [2012, 2025],
  asuka: [2015, 2025],
  "alexa-bliss": [2013, 2025],
  "trish-stratus": [2000, 2023],
  lita: [2000, 2023],
  naomi: [2010, 2025],
  "liv-morgan": [2014, 2025],
  "toni-storm": [2017, 2025],
  saraya: [2006, 2025],
  "jade-cargill": [2020, 2025],
  "kenny-omega": [2002, 2025],
  "kazuchika-okada": [2007, 2025],
  "will-ospreay": [2013, 2025],
  mjf: [2016, 2025],
  "samoa-joe": [2002, 2025],
  sting: [1988, 2024],
  "drew-mcintyre": [2007, 2025],
  "brock-lesnar": [2002, 2025],
  "bryan-danielson": [2000, 2025],
  "adam-cole": [2008, 2025],
  "christian-cage": [1998, 2025]
};

function makeSeededStats(totalMatches, totalWins, ppvPleMatches, ppvPleWins, titleMatchWins, cagematchTop10Avg, cagematchRated8Plus) {
  return {
    total_matches: totalMatches,
    total_wins: totalWins,
    ppv_ple_matches: ppvPleMatches,
    ppv_ple_wins: ppvPleWins,
    title_match_wins: titleMatchWins,
    cagematch_top10_avg: cagematchTop10Avg,
    cagematch_rated_8_plus: cagematchRated8Plus
  };
}

const METRIC_DEFS = {
  total_wins: {
    label: "Total Wins",
    shortLabel: "TOTAL WINS",
    compactSuffix: "wins",
    scoreLabel: "wins"
  },
  total_losses: {
    label: "Total Losses",
    shortLabel: "TOTAL LOSSES",
    compactSuffix: "losses",
    scoreLabel: "losses"
  },
  total_matches: {
    label: "Total Matches",
    shortLabel: "TOTAL MATCHES",
    compactSuffix: "matches",
    scoreLabel: "matches"
  },
  ppv_ple_wins: {
    label: "PPV/PLE Wins",
    shortLabel: "PPV/PLE WINS",
    compactSuffix: "PPV wins",
    scoreLabel: "PPV/PLE wins"
  },
  ppv_ple_matches: {
    label: "PPV/PLE Matches",
    shortLabel: "PPV/PLE MATCHES",
    compactSuffix: "PPV matches",
    scoreLabel: "PPV/PLE matches"
  },
  title_match_wins: {
    label: "Title Match Wins",
    shortLabel: "TITLE MATCH WINS",
    compactSuffix: "title wins",
    scoreLabel: "title match wins"
  },
  companies_worked_for: {
    label: "Companies Worked For",
    shortLabel: "COMPANIES",
    compactSuffix: "companies",
    scoreLabel: "companies"
  },
  cagematch_top10_avg: {
    label: "Top 10 Match Rating Avg",
    shortLabel: "TOP 10 RATING AVG",
    compactSuffix: "avg",
    scoreLabel: "Top 10 rating avg"
  },
  cagematch_rated_8_plus: {
    label: "Matches Rated 8.0+",
    shortLabel: "RATED 8.0+",
    compactSuffix: "rated 8+",
    scoreLabel: "matches rated 8.0+"
  }
};

const DAILY_METRIC_ROTATION = [
  "total_wins",
  "ppv_ple_wins",
  "cagematch_top10_avg",
  "title_match_wins",
  "total_matches",
  "cagematch_rated_8_plus",
  "companies_worked_for",
  "ppv_ple_matches",
  "total_losses"
];

const SEEDED_WRESTLER_METRICS = {
  "john-cena": makeSeededStats(2450, 1870, 188, 131, 96, 8.12, 31),
  "roman-reigns": makeSeededStats(1510, 1108, 101, 72, 49, 8.36, 24),
  "seth-rollins": makeSeededStats(1820, 1325, 139, 88, 57, 8.28, 27),
  "cody-rhodes": makeSeededStats(1685, 1208, 122, 71, 36, 8.22, 18),
  "randy-orton": makeSeededStats(2265, 1640, 178, 97, 82, 8.05, 20),
  "cm-punk": makeSeededStats(1540, 1090, 102, 61, 28, 8.41, 24),
  "aj-styles": makeSeededStats(2410, 1742, 96, 60, 47, 8.55, 38),
  edge: makeSeededStats(1625, 1104, 141, 75, 41, 8.11, 19),
  "jeff-hardy": makeSeededStats(2055, 1348, 104, 47, 29, 7.96, 17),
  "matt-hardy": makeSeededStats(2210, 1452, 89, 39, 24, 7.72, 8),
  undertaker: makeSeededStats(2365, 1638, 186, 111, 82, 8.18, 23),
  "triple-h": makeSeededStats(2290, 1570, 178, 96, 88, 8.09, 16),
  "kurt-angle": makeSeededStats(1415, 1023, 84, 46, 51, 8.38, 22),
  "shawn-michaels": makeSeededStats(1680, 1095, 152, 68, 47, 8.34, 26),
  "bret-hart": makeSeededStats(1725, 1180, 96, 50, 44, 8.44, 28),
  "stone-cold": makeSeededStats(1180, 774, 73, 45, 27, 8.47, 25),
  "the-rock": makeSeededStats(1245, 812, 92, 52, 32, 8.21, 18),
  "mick-foley": makeSeededStats(1935, 1240, 109, 44, 26, 8.02, 15),
  "chris-jericho": makeSeededStats(2665, 1894, 177, 89, 63, 8.24, 26),
  "rey-mysterio": makeSeededStats(2340, 1661, 141, 66, 42, 8.17, 22),
  "becky-lynch": makeSeededStats(1084, 741, 63, 36, 22, 8.26, 18),
  "charlotte-flair": makeSeededStats(1192, 836, 84, 45, 37, 8.04, 13),
  "mercedes-mone": makeSeededStats(1015, 698, 62, 32, 28, 8.43, 20),
  bayley: makeSeededStats(1218, 841, 86, 47, 33, 8.18, 17),
  "bianca-belair": makeSeededStats(824, 603, 48, 33, 18, 8.29, 16),
  "rhea-ripley": makeSeededStats(786, 592, 46, 31, 19, 8.23, 14),
  "iyo-sky": makeSeededStats(1280, 933, 38, 24, 29, 8.52, 24),
  asuka: makeSeededStats(1186, 861, 61, 39, 31, 8.31, 19),
  "alexa-bliss": makeSeededStats(942, 622, 57, 31, 18, 7.84, 7),
  "trish-stratus": makeSeededStats(702, 514, 44, 26, 21, 7.98, 8),
  lita: makeSeededStats(688, 475, 39, 20, 13, 8.07, 10),
  naomi: makeSeededStats(893, 606, 47, 22, 16, 7.88, 7),
  "liv-morgan": makeSeededStats(756, 494, 44, 23, 13, 7.93, 8),
  "toni-storm": makeSeededStats(1036, 741, 51, 30, 26, 8.34, 17),
  saraya: makeSeededStats(654, 455, 34, 18, 15, 8.06, 9),
  "jade-cargill": makeSeededStats(386, 314, 15, 12, 11, 7.95, 5),
  "kenny-omega": makeSeededStats(1622, 1177, 82, 55, 39, 8.91, 44),
  "kazuchika-okada": makeSeededStats(1778, 1289, 84, 56, 48, 8.94, 46),
  "will-ospreay": makeSeededStats(1548, 1134, 68, 47, 33, 9.03, 52),
  mjf: makeSeededStats(710, 492, 26, 17, 14, 8.24, 11),
  "samoa-joe": makeSeededStats(1672, 1164, 73, 39, 42, 8.51, 27),
  sting: makeSeededStats(2486, 1716, 121, 71, 53, 8.15, 16),
  "drew-mcintyre": makeSeededStats(1328, 932, 79, 44, 26, 8.09, 12),
  "brock-lesnar": makeSeededStats(712, 501, 65, 34, 27, 8.26, 15),
  "bryan-danielson": makeSeededStats(2145, 1528, 131, 77, 68, 8.78, 42),
  "adam-cole": makeSeededStats(1532, 1079, 57, 33, 31, 8.44, 23),
  "christian-cage": makeSeededStats(1918, 1311, 111, 52, 34, 8.03, 12)
};

const LOADED_STATS_SNAPSHOT = window.WRESTLEPAD_STATS_SNAPSHOT || null;
const STATS_SOURCE_META = LOADED_STATS_SNAPSHOT?.meta || {
  label: "Seeded local snapshot",
  sourceKind: "seeded_fallback",
  updatedAt: null,
  importedCount: 0,
  recordCount: Object.keys(SEEDED_WRESTLER_METRICS).length
};
const WRESTLER_METRICS = LOADED_STATS_SNAPSHOT?.metrics && Object.keys(LOADED_STATS_SNAPSHOT.metrics).length
  ? LOADED_STATS_SNAPSHOT.metrics
  : SEEDED_WRESTLER_METRICS;

const PROMOTION_DEFS = {
  wwe: { label: "WWE", color: "#25468c" },
  wcw: { label: "WCW", color: "#6b3f89" },
  ecw: { label: "ECW", color: "#7a332d" },
  aew: { label: "AEW", color: "#85703a" },
  roh: { label: "ROH", color: "#8a3434" },
  njpw: { label: "NJPW", color: "#a83a3a" },
  nxt: { label: "NXT", color: "#b0802e" }
};

const TAG_DEFS = {
  womens: { label: "Women's Division" },
  world_champion: { label: "World Champion" },
  tag_champion: { label: "Tag Champion" },
  royal_rumble: { label: "Royal Rumble" },
  money_in_bank: { label: "Won MITB" },
  mania_main_event: { label: "Mania Main Event" },
  ladder_match: { label: "Ladder Match" },
  submission_finisher: { label: "Submission Finish" },
  high_flyer: { label: "High Flyer" },
  hardcore: { label: "Hardcore Style" },
  faction_leader: { label: "Faction Leader" }
};

const BOARD_TEMPLATES = [
  {
    id: "gold-rush",
    category: "Gold",
    rows: [
      {
        promotionIds: ["wwe", "aew"],
        years: [2000, 2025],
        clueLabel: "World Champion",
        scopeLabel: "anytime in career",
        requiredTags: ["world_champion"]
      },
      {
        promotionIds: ["wwe"],
        years: [2005, 2025],
        clueLabel: "Won MITB",
        scopeLabel: "anytime in career",
        requiredTags: ["money_in_bank"]
      },
      {
        promotionIds: ["wcw", "wwe"],
        years: [1990, 2025],
        clueLabel: "Royal Rumble",
        scopeLabel: "anytime in career",
        requiredTags: ["royal_rumble"]
      },
      {
        promotionIds: ["roh", "aew"],
        years: [2005, 2025],
        clueLabel: "Faction Leader",
        scopeLabel: "anytime in career",
        requiredTags: ["faction_leader"]
      },
      {
        promotionIds: ["ecw", "wwe"],
        years: [1995, 2025],
        clueLabel: "Hardcore Style",
        scopeLabel: "anytime in career",
        requiredTags: ["hardcore"]
      }
    ]
  },
  {
    id: "air-time",
    category: "Air Time",
    rows: [
      {
        promotionIds: ["wwe", "wcw"],
        years: [1995, 2025],
        clueLabel: "High Flyer",
        scopeLabel: "prime years overlap",
        requiredTags: ["high_flyer"]
      },
      {
        promotionIds: ["aew", "njpw"],
        years: [2010, 2025],
        clueLabel: "World Champion",
        scopeLabel: "prime years overlap",
        requiredTags: ["world_champion"]
      },
      {
        promotionIds: ["wwe", "nxt"],
        years: [2012, 2025],
        clueLabel: "Women's Division",
        scopeLabel: "prime years overlap",
        requiredTags: ["womens"]
      },
      {
        promotionIds: ["roh", "wwe"],
        years: [2000, 2025],
        clueLabel: "Submission Finish",
        scopeLabel: "anytime in career",
        requiredTags: ["submission_finisher"]
      },
      {
        promotionIds: ["wwe", "aew"],
        years: [1998, 2025],
        clueLabel: "Ladder Match",
        scopeLabel: "anytime in career",
        requiredTags: ["ladder_match"]
      }
    ]
  },
  {
    id: "main-event",
    category: "Main Event",
    rows: [
      {
        promotionIds: ["wwe"],
        years: [1995, 2025],
        clueLabel: "Mania Main Event",
        scopeLabel: "anytime in career",
        requiredTags: ["mania_main_event"]
      },
      {
        promotionIds: ["wwe", "nxt"],
        years: [2012, 2025],
        clueLabel: "World Champion",
        scopeLabel: "prime years overlap",
        requiredTags: ["world_champion"]
      },
      {
        promotionIds: ["wwe", "aew"],
        years: [2000, 2025],
        clueLabel: "Tag Champion",
        scopeLabel: "anytime in career",
        requiredTags: ["tag_champion"]
      },
      {
        promotionIds: ["wcw", "ecw"],
        years: [1990, 2025],
        clueLabel: "World Champion",
        scopeLabel: "anytime in career",
        requiredTags: ["world_champion"]
      },
      {
        promotionIds: ["roh", "njpw"],
        years: [2002, 2025],
        clueLabel: "World Champion",
        scopeLabel: "anytime in career",
        requiredTags: ["world_champion"]
      }
    ]
  },
  {
    id: "queens-rule",
    category: "Queens",
    rows: [
      {
        promotionIds: ["wwe", "nxt"],
        years: [2012, 2025],
        clueLabel: "Women's World Champion",
        scopeLabel: "prime years overlap",
        requiredTags: ["womens", "world_champion"]
      },
      {
        promotionIds: ["wwe"],
        years: [2015, 2025],
        clueLabel: "Women's MITB Winner",
        scopeLabel: "anytime in career",
        requiredTags: ["womens", "money_in_bank"]
      },
      {
        promotionIds: ["wwe"],
        years: [2018, 2025],
        clueLabel: "Women's Royal Rumble",
        scopeLabel: "anytime in career",
        requiredTags: ["womens", "royal_rumble"]
      },
      {
        promotionIds: ["wwe", "nxt"],
        years: [2012, 2025],
        clueLabel: "Women's Tag Champion",
        scopeLabel: "anytime in career",
        requiredTags: ["womens", "tag_champion"]
      },
      {
        promotionIds: ["wwe"],
        years: [2000, 2025],
        clueLabel: "Women's Mania Main Event",
        scopeLabel: "anytime in career",
        requiredTags: ["womens", "mania_main_event"]
      }
    ]
  },
  {
    id: "trailblazers",
    category: "Trailblazers",
    rows: [
      {
        promotionIds: ["wwe", "aew"],
        years: [2010, 2025],
        clueLabel: "Women's World Champion",
        scopeLabel: "anytime in career",
        requiredTags: ["womens", "world_champion"]
      },
      {
        promotionIds: ["wwe"],
        years: [2000, 2025],
        clueLabel: "Women's High Flyer",
        scopeLabel: "anytime in career",
        requiredTags: ["womens", "high_flyer"]
      },
      {
        promotionIds: ["wwe", "nxt"],
        years: [2012, 2025],
        clueLabel: "Women's Submission Finish",
        scopeLabel: "prime years overlap",
        requiredTags: ["womens", "submission_finisher"]
      },
      {
        promotionIds: ["aew", "roh"],
        years: [2015, 2025],
        clueLabel: "Women's World Champion",
        scopeLabel: "prime years overlap",
        requiredTags: ["womens", "world_champion"]
      },
      {
        promotionIds: ["wwe"],
        years: [2010, 2025],
        clueLabel: "Women's Tag Champion",
        scopeLabel: "anytime in career",
        requiredTags: ["womens", "tag_champion"]
      }
    ]
  },
  {
    id: "modifiers",
    category: "Modifiers",
    rows: [
      {
        promotionIds: ["wwe", "aew"],
        years: [1998, 2025],
        clueLabel: "Ladder Match",
        scopeLabel: "anytime in career",
        requiredTags: ["ladder_match"]
      },
      {
        promotionIds: ["wwe", "ecw"],
        years: [1995, 2025],
        clueLabel: "Submission Finish",
        scopeLabel: "anytime in career",
        requiredTags: ["submission_finisher"]
      },
      {
        promotionIds: ["wwe", "wcw"],
        years: [1990, 2025],
        clueLabel: "High Flyer",
        scopeLabel: "anytime in career",
        requiredTags: ["high_flyer"]
      },
      {
        promotionIds: ["wwe", "aew"],
        years: [2005, 2025],
        clueLabel: "Faction Leader",
        scopeLabel: "anytime in career",
        requiredTags: ["faction_leader"]
      },
      {
        promotionIds: ["wwe", "nxt"],
        years: [2012, 2025],
        clueLabel: "Women's World Champion",
        scopeLabel: "prime years overlap",
        requiredTags: ["womens", "world_champion"]
      }
    ]
  }
];

const CANVAS = document.getElementById("board-canvas");
const CTX = CANVAS.getContext("2d");
const MIN_SUGGESTION_CHARS = 4;
const USED_POPUP_MS = 3200;
const PORTRAIT_IMAGE_CACHE = new Map();
const LOADED_PORTRAITS_SNAPSHOT = window.WRESTLEPAD_PORTRAITS || { meta: null, paths: {} };

const refs = {
  dailyStart: document.getElementById("daily-start-btn"),
  practiceStart: document.getElementById("practice-start-btn"),
  share: document.getElementById("share-btn"),
  reveal: document.getElementById("reveal-btn"),
  search: document.getElementById("wrestler-search"),
  submit: document.getElementById("submit-guess-btn"),
  clear: document.getElementById("clear-search-btn"),
  cancel: document.getElementById("cancel-guess-btn"),
  selectedRowTitle: document.getElementById("selected-row-title"),
  selectedRowDescription: document.getElementById("selected-row-description"),
  statusLine: document.getElementById("status-line"),
  dailyScoreSummary: document.getElementById("daily-score-summary"),
  helpLine: document.getElementById("help-line"),
  copyStatus: document.getElementById("copy-status"),
  modal: document.getElementById("entry-modal"),
  modalBackdrop: document.getElementById("entry-modal-backdrop"),
  modalTitle: document.getElementById("entry-modal-title"),
  modalDescription: document.getElementById("entry-modal-description"),
  modalSuggestionList: document.getElementById("modal-suggestion-list"),
  usedPopup: document.getElementById("used-popup"),
  usedPopupImage: document.getElementById("used-popup-image"),
  usedPopupFallback: document.getElementById("used-popup-fallback"),
  usedPopupName: document.getElementById("used-popup-name"),
  usedPopupMeta: document.getElementById("used-popup-meta")
};

const state = {
  challengeType: "daily",
  challengeKey: null,
  board: null,
  rows: [],
  selectedRowIndex: 0,
  score: 0,
  bestPossibleScore: 0,
  completionPercent: null,
  guesses: 0,
  status: "active",
  revealAnswers: false,
  modalOpen: false,
  practiceCounter: 0,
  banner: null,
  copiedMessage: "",
  copiedMessageMs: 0,
  usedPopupMs: 0
};

const layout = {
  contentX: 26,
  topY: 24,
  statY: 90,
  statH: 76,
  rowStartY: 190,
  rowH: 98,
  rowGap: 14,
  promoW: 172,
  yearW: 146,
  clueW: 240,
  portraitW: 160,
  actionW: 248,
  footerY: 784
};

refs.dailyStart.addEventListener("click", () => startChallenge("daily"));
refs.practiceStart.addEventListener("click", () => startChallenge("practice"));
refs.share.addEventListener("click", copyShareResult);
refs.reveal.addEventListener("click", () => {
  state.revealAnswers = !state.revealAnswers;
  refs.reveal.textContent = state.revealAnswers ? "Hide" : "Reveal";
  render();
});
refs.submit.addEventListener("click", submitCurrentGuess);
refs.clear.addEventListener("click", () => {
  refs.search.value = "";
  syncControls();
});
refs.cancel.addEventListener("click", closeEntryModal);
refs.modalBackdrop.addEventListener("click", closeEntryModal);
refs.search.addEventListener("input", syncControls);
refs.usedPopupImage.addEventListener("load", handleUsedPopupImageLoad);
refs.usedPopupImage.addEventListener("error", handleUsedPopupImageError);
refs.search.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    submitCurrentGuess();
  } else if (event.key === "Escape") {
    event.preventDefault();
    closeEntryModal();
  }
});
refs.modalSuggestionList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-wrestler-id]");
  if (!button) {
    return;
  }
  const wrestler = getWrestler(button.dataset.wrestlerId);
  if (!wrestler) {
    return;
  }
  refs.search.value = wrestler.name;
  syncControls();
});

CANVAS.addEventListener("click", handleCanvasClick);
document.addEventListener("keydown", handleGlobalKeyDown);
document.addEventListener("fullscreenchange", render);

window.render_game_to_text = renderGameToText;
window.advanceTime = async (ms) => {
  updateTransientState(ms);
  render();
};

startChallenge("daily");

function startChallenge(type) {
  const dailyKey = getDailyKey();
  const seedText = type === "daily" ? `daily:${dailyKey}` : `practice:${state.practiceCounter++}:${Date.now()}`;
  const challenge = buildChallenge(seedText, dailyKey);

  state.challengeType = type;
  state.challengeKey = type === "daily" ? dailyKey : `practice-${state.practiceCounter}`;
  state.board = challenge.board;
  state.rows = challenge.rows;
  state.selectedRowIndex = getNextOpenRowIndex();
  state.score = 0;
  state.bestPossibleScore = challenge.bestPossibleScore;
  state.completionPercent = null;
  state.guesses = 0;
  state.status = "active";
  state.revealAnswers = false;
  state.modalOpen = false;
  state.banner = {
    tone: "info",
    text: type === "daily"
      ? `Today: ${challenge.board.category} · ${challenge.board.dailyMetric.label}`
      : `Practice: ${challenge.board.category} · ${challenge.board.dailyMetric.label}`,
    ms: 2600
  };
  hideUsedPopup();
  refs.search.value = "";
  refs.share.disabled = true;
  refs.reveal.disabled = true;
  refs.reveal.textContent = "Reveal";
  setModalState(false);
  syncSnapshotCopy();
  syncControls();
  render();
}

function buildChallenge(seedText, dailyKey) {
  const dailyMetricId = getMetricIdForSeed(seedText);
  const dailyMetric = METRIC_DEFS[dailyMetricId];
  const startIndex = hashText(seedText) % BOARD_TEMPLATES.length;
  for (let offset = 0; offset < BOARD_TEMPLATES.length; offset++) {
    const template = BOARD_TEMPLATES[(startIndex + offset) % BOARD_TEMPLATES.length];
    const rows = buildRows(template);
    const solution = findCompletionForAssignments(new Map(), rows);
    if (!solution) {
      continue;
    }
    return {
      board: { id: template.id, category: template.category, dailyKey, dailyMetricId, dailyMetric },
      rows,
      bestPossibleScore: getBestPossibleBoardScore(rows, dailyMetricId)
    };
  }

  const fallback = buildRows(BOARD_TEMPLATES[0]);
  return {
    board: {
      id: BOARD_TEMPLATES[0].id,
      category: BOARD_TEMPLATES[0].category,
      dailyKey,
      dailyMetricId,
      dailyMetric
    },
    rows: fallback,
    bestPossibleScore: getBestPossibleBoardScore(fallback, dailyMetricId)
  };
}

function buildRows(template) {
  return template.rows.map((rowTemplate, index) => {
    const validAnswerIds = WRESTLERS.filter((wrestler) => rowMatchesWrestler(rowTemplate, wrestler))
      .sort((left, right) => left.popularity - right.popularity)
      .map((wrestler) => wrestler.id);

    return {
      index,
      promotionIds: [...rowTemplate.promotionIds],
      years: [...rowTemplate.years],
      clueLabel: rowTemplate.clueLabel,
      scopeLabel: rowTemplate.scopeLabel.toUpperCase(),
      requiredTags: [...rowTemplate.requiredTags],
      wrestlerId: null,
      points: 0,
      metricValue: 0,
      metricRank: null,
      metricPercentile: null,
      validAnswerIds,
      flashTone: null,
      flashMs: 0,
      lastGuess: null
    };
  });
}

function rowMatchesWrestler(row, wrestler) {
  const [careerStart, careerEnd] = getCareerSpan(wrestler.id);
  const [rowStart, rowEnd] = row.years;
  const promotionsMatch = row.promotionIds.some((promotionId) => wrestler.tags.includes(promotionId));
  const yearsMatch = careerStart <= rowEnd && careerEnd >= rowStart;
  const tagMatch = row.requiredTags.every((tagId) => wrestler.tags.includes(tagId));
  return promotionsMatch && yearsMatch && tagMatch;
}

function handleCanvasClick(event) {
  const { x, y } = canvasPointFromEvent(event);

  const rowIndex = getRowIndexFromPoint(x, y);
  if (rowIndex !== null) {
    state.selectedRowIndex = rowIndex;
    if (isPointInsideRect(x, y, getRowActionRect(rowIndex))) {
      openEntryModal(rowIndex);
    }
    syncControls();
    render();
  }
}

function handleGlobalKeyDown(event) {
  const activeTag = document.activeElement?.tagName;
  const isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA" || Boolean(document.activeElement?.isContentEditable);

  if (!isTyping && event.key.toLowerCase() === "f" && !event.metaKey && !event.ctrlKey) {
    event.preventDefault();
    toggleFullscreen();
    return;
  }

  if (isTyping && event.key !== "Escape") {
    return;
  }

  if (event.key === "Escape" && state.modalOpen) {
    event.preventDefault();
    closeEntryModal();
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    moveSelection(-1);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    moveSelection(1);
  } else if (event.key === "Enter" && !isTyping) {
    event.preventDefault();
    openEntryModal(state.selectedRowIndex);
  }
}

function moveSelection(delta) {
  if (!state.rows.length) {
    return;
  }
  state.selectedRowIndex = (state.selectedRowIndex + delta + state.rows.length) % state.rows.length;
  syncControls();
  render();
}

function submitCurrentGuess() {
  if (!state.modalOpen) {
    return;
  }
  const query = refs.search.value.trim().toLowerCase();
  const wrestler = findTypedWrestler(query) || getAutoCompleteExactSuggestion(query);
  if (!wrestler) {
    setBanner("warning", "Type the full wrestler name before adding.");
    syncControls();
    render();
    return;
  }

  lockGuess(wrestler.id);
}

function lockGuess(wrestlerId) {
  if (state.status !== "active") {
    return;
  }

  const row = getSelectedRow();
  if (!row || row.wrestlerId) {
    setBanner("warning", "Pick an open row first.");
    syncControls();
    render();
    return;
  }

  if (state.rows.some((entry) => entry.wrestlerId === wrestlerId)) {
    setBanner("warning", "Each wrestler can only be used once per card.");
    syncControls();
    render();
    return;
  }

  const wrestler = getWrestler(wrestlerId);
  const isValid = row.validAnswerIds.includes(wrestlerId);
  const keepsBoardSolvable = isValid ? wouldKeepBoardSolvable(row.index, wrestlerId) : false;

  if (!isValid) {
    state.guesses += 1;
    row.flashTone = "bad";
    row.flashMs = 850;
    state.score = Math.max(0, state.score - 12);
    setBanner("danger", `${wrestler.name} does not fit this clue.`);
    syncControls();
    render();
    return;
  }

  if (!keepsBoardSolvable) {
    row.flashTone = "bad";
    row.flashMs = 650;
    setBanner("warning", `${wrestler.name} fits this row, but it would trap the rest of the board.`);
    syncControls();
    render();
    return;
  }

  const scoreResult = scoreGuess(wrestler, row);
  row.wrestlerId = wrestlerId;
  row.points = scoreResult.points;
  row.metricValue = scoreResult.metricValue;
  row.metricRank = scoreResult.rank;
  row.metricPercentile = scoreResult.percentile;
  row.flashTone = "good";
  row.flashMs = 900;
  state.score += scoreResult.points;
  state.guesses += 1;
  refs.search.value = "";
  setBanner(
    "success",
    `${wrestler.name} added. ${formatMetricValue(state.board.dailyMetricId, row.metricValue)} · ${formatPercentile(scoreResult.percentile)} · +${scoreResult.points} points.`
  );
  showUsedPopup(wrestler, row, scoreResult.points);
  state.selectedRowIndex = getNextOpenRowIndex();
  closeEntryModal({ preserveStatus: true });

  if (state.rows.every((entry) => entry.wrestlerId)) {
    finishRun();
  }

  syncControls();
  render();
}

function finishRun() {
  state.status = "complete";
  state.completionPercent = getCompletionPercent(state.score, state.bestPossibleScore);
  refs.share.disabled = false;
  refs.reveal.disabled = false;
  setBanner("success", `Card complete. ${state.completionPercent}% of perfect daily score.`);
}

function scoreGuess(wrestler, row) {
  const ranked = getRankedMetricEntries(row, state.board.dailyMetricId);
  return getScoreResultForWrestler(wrestler, row, state.board.dailyMetricId, ranked);
}

function syncControls() {
  const row = getSelectedRow();
  const metric = getBoardMetric();
  const solvedSummary = row?.wrestlerId
    ? ` · solved by ${getWrestler(row.wrestlerId).name} · ${formatPercentile(row.metricPercentile)}`
    : "";

  refs.selectedRowTitle.textContent = row ? row.clueLabel : "Pick a clue row";
  refs.selectedRowDescription.textContent = row
    ? `${row.promotionIds.map((id) => PROMOTION_DEFS[id].label).join(" / ")} · ${row.years[0]} to ${row.years[1]} · ${row.scopeLabel.toLowerCase()} · score by ${metric.label.toLowerCase()}${solvedSummary}`
    : "Click a row to start.";
  refs.statusLine.textContent = state.banner?.text || "";
  refs.dailyScoreSummary.textContent = buildDailyScoreSummary();
  refs.submit.disabled = !row || Boolean(row.wrestlerId) || state.status !== "active";
  refs.clear.disabled = !state.modalOpen;
  refs.cancel.disabled = !state.modalOpen;
  refs.copyStatus.textContent = state.copiedMessage || "";
  renderModalSuggestions();
}

function render() {
  CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
  CTX.fillStyle = "#252525";
  CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
  drawHeader();
  drawStats();
  drawRows();
  drawFooter();
}

function drawHeader() {
  CTX.fillStyle = "#f2f2f2";
  CTX.font = "700 28px Arial";
  CTX.fillText("WrestlePad.com", layout.contentX + 10, layout.topY + 18);

  CTX.fillStyle = "#bdbdbd";
  CTX.font = "600 13px Arial";
  CTX.fillText(
    `${state.board?.category || "Card"} card · score by ${getBoardMetric().label.toLowerCase()}`,
    layout.contentX + 10,
    layout.topY + 42
  );

  drawChip(CANVAS.width - 206, 18, 86, 38, state.challengeType === "daily" ? "Today" : "Practice");
  drawChip(CANVAS.width - 112, 18, 76, 38, "WRESTLE");
}

function drawStats() {
  const statWidth = 322;
  drawMetricBlock(layout.contentX, layout.statY, statWidth, layout.statH, getBoardMetric().shortLabel, "DAILY METRIC");
  drawStatBlock(layout.contentX + 338, layout.statY, statWidth, layout.statH, String(state.score), "TOTAL SCORE");
  drawStatBlock(layout.contentX + 676, layout.statY, statWidth, layout.statH, String(state.guesses), "TOTAL GUESSES");
}

function drawRows() {
  state.rows.forEach((row) => {
    const rect = getRowRect(row.index);
    drawRoundedRect(rect.x, rect.y, rect.w, rect.h, 8, "#333333", "#3f3f3f");

    const promoRect = { x: rect.x, y: rect.y, w: layout.promoW, h: rect.h };
    const yearRect = { x: promoRect.x + promoRect.w + 8, y: rect.y, w: layout.yearW, h: rect.h };
    const clueRect = { x: yearRect.x + yearRect.w + 8, y: rect.y, w: layout.clueW, h: rect.h };
    const portraitRect = getRowPortraitRect(row.index);
    const actionRect = getRowActionRect(row.index);

    drawRoundedRect(promoRect.x, promoRect.y, promoRect.w, promoRect.h, 8, "#343434", "#3f3f3f");
    drawRoundedRect(yearRect.x, yearRect.y, yearRect.w, yearRect.h, 8, "#343434", "#3f3f3f");
    drawRoundedRect(clueRect.x, clueRect.y, clueRect.w, clueRect.h, 8, "#343434", "#3f3f3f");
    drawRoundedRect(portraitRect.x, portraitRect.y, portraitRect.w, portraitRect.h, 8, "#343434", "#3f3f3f");

    drawPromotionCluster(row.promotionIds, promoRect);
    drawYearCell(row, yearRect);
    drawClueCell(row, clueRect);
    drawPortraitCell(row, portraitRect);
    drawActionCell(row, actionRect, state.selectedRowIndex === row.index);
  });
}

function drawPromotionCluster(promotionIds, rect) {
  const size = 40;
  const positions = promotionIds.length <= 2
    ? [
        { x: rect.x + 56, y: rect.y + 48 },
        { x: rect.x + 112, y: rect.y + 48 }
      ]
    : [
        { x: rect.x + 52, y: rect.y + 32 },
        { x: rect.x + 108, y: rect.y + 32 },
        { x: rect.x + 52, y: rect.y + 74 },
        { x: rect.x + 108, y: rect.y + 74 }
      ];

  promotionIds.forEach((promotionId, index) => {
    const promo = PROMOTION_DEFS[promotionId];
    const point = positions[index] || positions[positions.length - 1];
    drawDiamond(point.x, point.y, size, promo.color, promo.label);
  });
}

function drawYearCell(row, rect) {
  CTX.textAlign = "center";
  CTX.fillStyle = "#f2f2f2";
  CTX.font = "700 26px Arial";
  CTX.fillText(String(row.years[0]), rect.x + rect.w / 2, rect.y + 36);
  CTX.font = "700 16px Arial";
  CTX.fillText("to", rect.x + rect.w / 2, rect.y + 55);
  CTX.font = "700 26px Arial";
  CTX.fillText(String(row.years[1]), rect.x + rect.w / 2, rect.y + 84);
  CTX.textAlign = "left";
}

function drawClueCell(row, rect) {
  CTX.fillStyle = "#d5d5d5";
  CTX.font = "700 13px Arial";
  drawCenteredText(row.clueLabel.toUpperCase(), rect.x + rect.w / 2, rect.y + 42, rect.w - 24, "700 13px Arial", "#d5d5d5");
  drawRoundedRect(rect.x, rect.y + rect.h - 20, rect.w, 20, 0, "#c7c7c7", "#c7c7c7");
  drawCenteredText(row.scopeLabel, rect.x + rect.w / 2, rect.y + rect.h - 6, rect.w - 12, "700 11px Arial", "#2a2a2a");
}

function drawPortraitCell(row, rect) {
  if (!row.wrestlerId) {
    drawCenteredText("portrait", rect.x + rect.w / 2, rect.y + 42, rect.w - 18, "700 15px Arial", "#bdbdbd");
    drawCenteredText("shows here", rect.x + rect.w / 2, rect.y + 68, rect.w - 18, "700 13px Arial", "#888888");
    return;
  }

  const wrestler = getWrestler(row.wrestlerId);
  const imageRecord = getPortraitImageRecord(wrestler);
  const innerRect = {
    x: rect.x + 12,
    y: rect.y + 10,
    w: rect.w - 24,
    h: rect.h - 20
  };

  if (imageRecord.status === "loaded" && imageRecord.image) {
    const fitRect = getAspectFitRect(imageRecord.image, innerRect, 6);
    drawRoundedRect(innerRect.x, innerRect.y, innerRect.w, innerRect.h, 12, "#2f2f2f", "#4a4a4a");
    CTX.save();
    CTX.beginPath();
    roundedRectPath(innerRect.x, innerRect.y, innerRect.w, innerRect.h, 12);
    CTX.clip();
    CTX.drawImage(imageRecord.image, fitRect.x, fitRect.y, fitRect.w, fitRect.h);
    CTX.restore();
    return;
  }

  drawRoundedRect(innerRect.x, innerRect.y, innerRect.w, innerRect.h, 12, "#2f2f2f", "#4a4a4a");
  drawCenteredText(getInitials(wrestler.name), innerRect.x + innerRect.w / 2, innerRect.y + 40, innerRect.w - 12, "700 28px Arial", "#f2f2f2");
  drawCenteredText("local image", innerRect.x + innerRect.w / 2, innerRect.y + 68, innerRect.w - 12, "700 11px Arial", "#a9a9a9");
}

function drawActionCell(row, rect, isSelected) {
  const fill = row.wrestlerId ? "#447d41" : "#53944e";
  const stroke = isSelected ? "#d4b25d" : fill;
  drawRoundedRect(rect.x, rect.y, rect.w, rect.h, 8, fill, stroke, isSelected ? 2 : 1);

  if (row.flashTone === "bad") {
    drawRoundedRect(rect.x, rect.y, rect.w, rect.h, 8, "rgba(120, 50, 50, 0.35)", "rgba(120, 50, 50, 0.35)");
  }

  if (row.wrestlerId) {
    const wrestler = getWrestler(row.wrestlerId);
    drawCenteredText(wrestler.name, rect.x + rect.w / 2, rect.y + 40, rect.w - 22, "700 24px Arial", "#f2fff0");
    drawCenteredText(
      `${formatMetricValue(state.board.dailyMetricId, row.metricValue, { compact: true })} · +${row.points} pts`,
      rect.x + rect.w / 2,
      rect.y + 74,
      rect.w - 20,
      "700 14px Arial",
      "#f2fff0"
    );
    return;
  }

  if (state.revealAnswers && state.status === "complete") {
    const reveals = row.validAnswerIds.slice(0, 2).map((id) => getWrestler(id).name).join(" / ");
    drawCenteredText(reveals || "No answers", rect.x + rect.w / 2, rect.y + 40, rect.w - 18, "700 18px Arial", "#f2fff0");
    drawCenteredText("revealed fits", rect.x + rect.w / 2, rect.y + 74, rect.w - 18, "700 14px Arial", "#f2fff0");
    return;
  }

  drawCenteredText("+", rect.x + rect.w / 2, rect.y + 42, rect.w, "700 44px Arial", "#f2fff0");
  drawCenteredText(isSelected ? "type wrestler" : "add wrestler", rect.x + rect.w / 2, rect.y + 76, rect.w - 20, "700 16px Arial", "#f2fff0");
}

function drawFooter() {
  drawCenteredText(
    state.banner?.text || `Manual-entry wrestling clue board. Daily stat: ${getBoardMetric().label}.`,
    CANVAS.width / 2,
    layout.footerY,
    CANVAS.width - 80,
    "600 16px Arial",
    "#d5d5d5"
  );
}

function drawStatBlock(x, y, w, h, value, label) {
  drawRoundedRect(x, y, w, h, 10, "#2f2f2f", "#3e3e3e");
  drawCenteredText(String(value).toUpperCase(), x + w / 2, y + 34, w - 16, "700 30px Arial", "#f2f2f2");
  drawCenteredText(label, x + w / 2, y + 58, w - 16, "700 12px Arial", "#b9b9b9");
}

function drawMetricBlock(x, y, w, h, value, label) {
  drawRoundedRect(x, y, w, h, 10, "#2f2f2f", "#3e3e3e");
  drawCenteredText(String(value).toUpperCase(), x + w / 2, y + 30, w - 26, "700 18px Arial", "#f2f2f2");
  drawCenteredText(label, x + w / 2, y + 58, w - 16, "700 12px Arial", "#b9b9b9");
}

function drawChip(x, y, w, h, text) {
  drawRoundedRect(x, y, w, h, 8, "#2f2f2f", "#4c4c4c");
  drawCenteredText(text, x + w / 2, y + 24, w - 12, "700 16px Arial", "#f2f2f2");
}

function drawDiamond(cx, cy, size, fill, text) {
  CTX.save();
  CTX.translate(cx, cy);
  CTX.rotate(Math.PI / 4);
  CTX.fillStyle = fill;
  CTX.strokeStyle = "#5c5c5c";
  CTX.lineWidth = 1;
  CTX.fillRect(-size / 2, -size / 2, size, size);
  CTX.strokeRect(-size / 2, -size / 2, size, size);
  CTX.restore();
  drawCenteredText(text, cx, cy + 5, size * 1.4, "700 13px Arial", "#f2f2f2");
}

function roundedRectPath(x, y, w, h, radius) {
  CTX.moveTo(x + radius, y);
  CTX.lineTo(x + w - radius, y);
  CTX.quadraticCurveTo(x + w, y, x + w, y + radius);
  CTX.lineTo(x + w, y + h - radius);
  CTX.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  CTX.lineTo(x + radius, y + h);
  CTX.quadraticCurveTo(x, y + h, x, y + h - radius);
  CTX.lineTo(x, y + radius);
  CTX.quadraticCurveTo(x, y, x + radius, y);
  CTX.closePath();
}

function getAspectFitRect(image, targetRect, inset = 0) {
  const sourceW = image.naturalWidth || image.width || targetRect.w;
  const sourceH = image.naturalHeight || image.height || targetRect.h;
  const box = {
    x: targetRect.x + inset,
    y: targetRect.y + inset,
    w: Math.max(1, targetRect.w - inset * 2),
    h: Math.max(1, targetRect.h - inset * 2)
  };

  if (!sourceW || !sourceH) {
    return box;
  }

  const scale = Math.min(box.w / sourceW, box.h / sourceH);
  const drawW = Math.max(1, Math.round(sourceW * scale));
  const drawH = Math.max(1, Math.round(sourceH * scale));

  return {
    x: box.x + (box.w - drawW) / 2,
    y: box.y + (box.h - drawH) / 2,
    w: drawW,
    h: drawH
  };
}

function drawRoundedRect(x, y, w, h, radius, fill, stroke, lineWidth = 1) {
  CTX.beginPath();
  roundedRectPath(x, y, w, h, radius);
  CTX.fillStyle = fill;
  CTX.fill();
  CTX.lineWidth = lineWidth;
  CTX.strokeStyle = stroke;
  CTX.stroke();
}

function drawCenteredText(text, centerX, baselineY, maxWidth, font, fillStyle) {
  CTX.font = font;
  CTX.fillStyle = fillStyle;
  CTX.textAlign = "center";
  CTX.textBaseline = "alphabetic";
  const words = String(text).split(/\s+/);
  let line = "";
  let lineCount = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (CTX.measureText(test).width > maxWidth && line) {
      CTX.fillText(line, centerX, baselineY + lineCount * 18);
      line = word;
      lineCount += 1;
    } else {
      line = test;
    }
  }
  if (line) {
    CTX.fillText(line, centerX, baselineY + lineCount * 18);
  }
  CTX.textAlign = "left";
}

function renderGameToText() {
  const row = getSelectedRow();
  return JSON.stringify({
    origin: "Canvas origin is top-left; x increases to the right and y increases downward.",
    challengeType: state.challengeType,
    challengeKey: state.challengeKey,
    category: state.board?.category || null,
    dailyMetric: getBoardMetric().label,
    statsSource: getStatsSourceSummary(),
    score: state.score,
    guesses: state.guesses,
    status: state.status,
    selectedRow: row
      ? {
          clue: row.clueLabel,
          promotions: row.promotionIds.map((id) => PROMOTION_DEFS[id].label),
          years: row.years,
          candidateCount: getLiveCandidateIds(row).length
        }
      : null,
    rows: state.rows.map((entry) => ({
      clue: entry.clueLabel,
      promotions: entry.promotionIds.map((id) => PROMOTION_DEFS[id].label),
      years: entry.years,
      wrestler: entry.wrestlerId ? getWrestler(entry.wrestlerId).name : null,
      metricValue: entry.wrestlerId ? formatMetricValue(state.board.dailyMetricId, entry.metricValue) : null,
      percentile: entry.wrestlerId ? formatPercentile(entry.metricPercentile) : null,
      points: entry.points,
      solved: Boolean(entry.wrestlerId),
      candidateCount: getLiveCandidateIds(entry).length
    })),
    bestPossibleScore: state.bestPossibleScore,
    completionPercent: state.completionPercent,
    modalOpen: state.modalOpen,
    usedPopupVisible: !refs.usedPopup.classList.contains("hidden"),
    banner: state.banner?.text || null
  });
}

function copyShareResult() {
  if (state.status !== "complete") {
    return;
  }
  const text = buildShareText();
  const onSuccess = () => {
    state.copiedMessage = "Share text copied to clipboard.";
    state.copiedMessageMs = 2200;
    syncControls();
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
      state.copiedMessage = text;
      state.copiedMessageMs = 2200;
      syncControls();
    });
    return;
  }
  state.copiedMessage = text;
  state.copiedMessageMs = 2200;
  syncControls();
}

function buildShareText() {
  return [
    `WrestlePad ${state.challengeType === "daily" ? "Today" : "Practice"} ${state.challengeKey}`,
    `Daily stat: ${state.board.dailyMetric.label}`,
    `Score ${state.score} / ${state.bestPossibleScore} · ${state.completionPercent ?? getCompletionPercent(state.score, state.bestPossibleScore)}% of perfect · Guesses ${state.guesses}`,
    ...state.rows.map((row) => (row.wrestlerId ? "🟩" : "⬛"))
  ].join("\n");
}

function getRowIndexFromPoint(x, y) {
  return state.rows.find((row) => {
    const rect = getRowRect(row.index);
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  })?.index ?? null;
}

function getSpotlightIndexFromPoint(x, y) {
  return null;
}

function getRowRect(index) {
  return {
    x: layout.contentX,
    y: layout.rowStartY + index * (layout.rowH + layout.rowGap),
    w: CANVAS.width - layout.contentX * 2,
    h: layout.rowH
  };
}

function getRowActionRect(index) {
  const rowRect = getRowRect(index);
  return {
    x: rowRect.x + rowRect.w - layout.actionW,
    y: rowRect.y,
    w: layout.actionW,
    h: rowRect.h
  };
}

function getRowPortraitRect(index) {
  const actionRect = getRowActionRect(index);
  return {
    x: actionRect.x - layout.portraitW - 8,
    y: actionRect.y,
    w: layout.portraitW,
    h: actionRect.h
  };
}

function canvasPointFromEvent(event) {
  const rect = CANVAS.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (CANVAS.width / rect.width),
    y: (event.clientY - rect.top) * (CANVAS.height / rect.height)
  };
}

function getSelectedRow() {
  return state.rows[state.selectedRowIndex] || null;
}

function getLiveCandidateIds(row) {
  const usedIds = new Set(state.rows.filter((entry) => entry.wrestlerId).map((entry) => entry.wrestlerId));
  return row.validAnswerIds.filter((id) => !usedIds.has(id));
}

function getSafeCandidateIds(row) {
  return getLiveCandidateIds(row).filter((wrestlerId) => wouldKeepBoardSolvable(row.index, wrestlerId));
}

function findTypedWrestler(query) {
  if (!query) {
    return null;
  }
  const normalizedQuery = normalizeName(query);
  return WRESTLERS.find((wrestler) => getNormalizedWrestlerNames(wrestler).includes(normalizedQuery)) || null;
}

function isPointInsideRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function openEntryModal(rowIndex = state.selectedRowIndex) {
  const row = state.rows[rowIndex];
  if (!row || row.wrestlerId || state.status !== "active") {
    return;
  }
  state.selectedRowIndex = rowIndex;
  refs.search.value = "";
  refs.modalTitle.textContent = row.clueLabel;
  refs.modalDescription.textContent = `${row.promotionIds.map((id) => PROMOTION_DEFS[id].label).join(" / ")} · ${row.years[0]} to ${row.years[1]} · ${row.scopeLabel.toLowerCase()} · score by ${getBoardMetric().label.toLowerCase()}`;
  setModalState(true);
  syncControls();
  render();
  requestAnimationFrame(() => {
    refs.search.focus();
    refs.search.select();
  });
}

function closeEntryModal(options = {}) {
  refs.search.value = "";
  setModalState(false);
  if (!options.preserveStatus) {
    syncControls();
    render();
  }
}

function setModalState(isOpen) {
  state.modalOpen = isOpen;
  refs.modal.classList.toggle("hidden", !isOpen);
  refs.modal.setAttribute("aria-hidden", isOpen ? "false" : "true");
}

function renderModalSuggestions() {
  if (!state.modalOpen) {
    refs.modalSuggestionList.innerHTML = "";
    return;
  }

  const rawQuery = refs.search.value.trim();
  const query = normalizeName(rawQuery);
  if (!rawQuery) {
    refs.modalSuggestionList.innerHTML = '<p class="modal-suggestion-empty">Start typing to see wrestler name suggestions.</p>';
    return;
  }

  if (query.length < MIN_SUGGESTION_CHARS) {
    const remaining = MIN_SUGGESTION_CHARS - query.length;
    refs.modalSuggestionList.innerHTML = `<p class="modal-suggestion-empty">Type ${remaining} more ${remaining === 1 ? "letter" : "letters"} to unlock suggestions.</p>`;
    return;
  }

  const suggestions = getModalSuggestions();
  if (!suggestions.length) {
    refs.modalSuggestionList.innerHTML = '<p class="modal-suggestion-empty">No close name matches yet.</p>';
    return;
  }

  refs.modalSuggestionList.innerHTML = suggestions
    .map((entry) => {
      const stateLabel = entry.isSafe ? "safe" : entry.isValid ? "valid" : "search";
      const fitLabel = entry.isSafe ? "Safe fit for this row" : entry.isValid ? "Fits this row" : "Name match only";
      return `
        <button class="modal-suggestion-button" type="button" data-wrestler-id="${entry.wrestler.id}" data-state="${stateLabel}">
          <div class="modal-suggestion-name">${escapeHtml(entry.wrestler.name)}</div>
          <div class="modal-suggestion-meta">${escapeHtml(formatMetricValue(state.board.dailyMetricId, entry.metricValue))} · ${escapeHtml(fitLabel)} · ${escapeHtml(entry.wrestler.era)}</div>
        </button>
      `;
    })
    .join("");
}

function getModalSuggestions() {
  const row = getSelectedRow();
  const query = normalizeName(refs.search.value);
  if (!row || !query || query.length < MIN_SUGGESTION_CHARS) {
    return [];
  }

  const usedIds = new Set(state.rows.filter((entry) => entry.wrestlerId).map((entry) => entry.wrestlerId));
  const safeIds = new Set(getSafeCandidateIds(row));

  return WRESTLERS.filter((wrestler) => !usedIds.has(wrestler.id))
    .filter((wrestler) => {
      return getNormalizedWrestlerNames(wrestler).some((name) => name.includes(query));
    })
    .map((wrestler) => ({
      wrestler,
      isValid: row.validAnswerIds.includes(wrestler.id),
      isSafe: safeIds.has(wrestler.id),
      metricValue: getMetricValueForWrestler(wrestler, state.board.dailyMetricId),
      startsWith: getNormalizedWrestlerNames(wrestler).some((name) => name.startsWith(query)),
      aliasMatch: getNormalizedAliasNames(wrestler).some((name) => name.includes(query))
    }))
    .sort((left, right) => {
      if (left.isSafe !== right.isSafe) {
        return left.isSafe ? -1 : 1;
      }
      if (left.isValid !== right.isValid) {
        return left.isValid ? -1 : 1;
      }
      if (left.aliasMatch !== right.aliasMatch) {
        return left.aliasMatch ? -1 : 1;
      }
      if (left.metricValue !== right.metricValue) {
        return right.metricValue - left.metricValue;
      }
      if (left.startsWith !== right.startsWith) {
        return left.startsWith ? -1 : 1;
      }
      return left.wrestler.name.localeCompare(right.wrestler.name);
    })
    .slice(0, 6);
}

function getAutoCompleteExactSuggestion(query) {
  const normalizedQuery = normalizeName(query);
  if (!normalizedQuery) {
    return null;
  }
  return WRESTLERS.find((wrestler) => getNormalizedWrestlerNames(wrestler).includes(normalizedQuery)) || null;
}

function wouldKeepBoardSolvable(targetIndex, wrestlerId) {
  const assignments = new Map();
  state.rows.forEach((row) => {
    if (row.wrestlerId) {
      assignments.set(row.index, row.wrestlerId);
    }
  });
  assignments.set(targetIndex, wrestlerId);
  return Boolean(findCompletionForAssignments(assignments, state.rows));
}

function findCompletionForAssignments(assignments, rows) {
  const usedIds = new Set(assignments.values());
  const entries = rows.map((row) => {
    if (assignments.has(row.index)) {
      return { row, candidates: [assignments.get(row.index)] };
    }
    return {
      row,
      candidates: row.validAnswerIds.filter((id) => !usedIds.has(id))
    };
  });

  const ordered = [...entries].sort((left, right) => left.candidates.length - right.candidates.length);
  const picked = new Set();

  function walk(position) {
    if (position >= ordered.length) {
      return true;
    }
    const entry = ordered[position];
    for (const candidate of entry.candidates) {
      if (picked.has(candidate)) {
        continue;
      }
      picked.add(candidate);
      if (walk(position + 1)) {
        return true;
      }
      picked.delete(candidate);
    }
    return false;
  }

  return walk(0);
}

function getNextOpenRowIndex() {
  const next = state.rows.find((row) => !row.wrestlerId);
  return next ? next.index : Math.max(0, state.rows.length - 1);
}

function getCareerSpan(id) {
  return CAREER_SPANS[id] || [1990, 2025];
}

function getWrestler(id) {
  return WRESTLERS.find((wrestler) => wrestler.id === id);
}

function getMetricIdForSeed(seedText) {
  return DAILY_METRIC_ROTATION[hashText(`metric:${seedText}`) % DAILY_METRIC_ROTATION.length];
}

function getStatsSourceSummary() {
  const label = STATS_SOURCE_META.label || "Stats snapshot";
  const updatedAt = STATS_SOURCE_META.updatedAt ? ` · updated ${STATS_SOURCE_META.updatedAt}` : "";
  return `${label}${updatedAt}`;
}

function syncSnapshotCopy() {
  if (!refs.helpLine) {
    return;
  }
  const importedCount = Number.isFinite(STATS_SOURCE_META.importedCount) ? STATS_SOURCE_META.importedCount : 0;
  const partialImportCount = Number.isFinite(STATS_SOURCE_META.partialImportCount) ? STATS_SOURCE_META.partialImportCount : 0;
  const mappedCount = Number.isFinite(STATS_SOURCE_META.mappedCount) ? STATS_SOURCE_META.mappedCount : 0;
  const recordCount = Number.isFinite(STATS_SOURCE_META.recordCount) ? STATS_SOURCE_META.recordCount : Object.keys(WRESTLER_METRICS).length;
  const sourceLabel = STATS_SOURCE_META.label || "stats snapshot";
  const updatedAt = STATS_SOURCE_META.updatedAt ? ` Updated ${STATS_SOURCE_META.updatedAt}.` : "";
  if (STATS_SOURCE_META.sourceKind === "cagematch_import") {
    refs.helpLine.textContent = `Manual entry only. Click a green row button or press Enter on a selected row to open the popup. Press F for fullscreen. Data source: ${sourceLabel}.${updatedAt}`;
    return;
  }
  refs.helpLine.textContent = `Manual entry only. Click a green row button or press Enter on a selected row to open the popup. Press F for fullscreen. Data source: ${sourceLabel} (${importedCount} imported, ${partialImportCount} partial, ${mappedCount} mapped, ${recordCount} total).${updatedAt}`;
}

function getBoardMetric() {
  return state.board?.dailyMetric || METRIC_DEFS.total_wins;
}

function getMetricValueForWrestler(wrestler, metricId) {
  const stats = WRESTLER_METRICS[wrestler.id];
  if (!stats) {
    return 0;
  }
  if (metricId === "total_losses") {
    return Math.max(0, stats.total_matches - stats.total_wins);
  }
  if (metricId === "companies_worked_for") {
    return wrestler.tags.filter((tagId) => PROMOTION_DEFS[tagId]).length;
  }
  return stats[metricId] ?? 0;
}

function getRankedMetricEntries(row, metricId) {
  return row.validAnswerIds
    .map((wrestlerId) => {
      const wrestler = getWrestler(wrestlerId);
      return {
        wrestler,
        value: getMetricValueForWrestler(wrestler, metricId)
      };
    })
    .sort((left, right) => {
      if (left.value !== right.value) {
        return right.value - left.value;
      }
      return left.wrestler.name.localeCompare(right.wrestler.name);
    });
}

function getScoreResultForWrestler(wrestler, row, metricId, rankedEntries = null) {
  const ranked = rankedEntries || getRankedMetricEntries(row, metricId);
  const metricValue = getMetricValueForWrestler(wrestler, metricId);
  const total = ranked.length || 1;
  const higherCount = ranked.filter((entry) => entry.value > metricValue).length;
  const atOrBelowCount = ranked.filter((entry) => entry.value <= metricValue).length;
  const percentile = Math.max(1, Math.min(100, Math.round((atOrBelowCount / total) * 100)));
  return {
    points: scorePointsFromPercentile(percentile),
    metricValue,
    rank: higherCount + 1,
    percentile
  };
}

function scorePointsFromPercentile(percentile) {
  return Math.round(20 + percentile * 0.8);
}

function buildDailyScoreSummary() {
  if (!state.bestPossibleScore) {
    return "";
  }
  if (state.status === "complete") {
    return `Daily efficiency: ${state.score} / ${state.bestPossibleScore} points · ${state.completionPercent}% of perfect`;
  }
  return `Perfect daily score available: ${state.bestPossibleScore} points`;
}

function getCompletionPercent(score, bestPossibleScore) {
  if (!bestPossibleScore) {
    return 100;
  }
  return Math.max(0, Math.min(100, Math.round((score / bestPossibleScore) * 100)));
}

function getBestPossibleBoardScore(rows, metricId) {
  const entries = rows
    .map((row) => ({
      row,
      candidates: getRankedMetricEntries(row, metricId).map((entry) => ({
        wrestlerId: entry.wrestler.id,
        points: getScoreResultForWrestler(entry.wrestler, row, metricId).points
      }))
    }))
    .sort((left, right) => left.candidates.length - right.candidates.length);

  const memo = new Map();

  function walk(position, usedIds) {
    if (position >= entries.length) {
      return 0;
    }

    const usedKey = [...usedIds].sort().join(",");
    const memoKey = `${position}|${usedKey}`;
    if (memo.has(memoKey)) {
      return memo.get(memoKey);
    }

    let best = 0;
    for (const candidate of entries[position].candidates) {
      if (usedIds.has(candidate.wrestlerId)) {
        continue;
      }
      usedIds.add(candidate.wrestlerId);
      best = Math.max(best, candidate.points + walk(position + 1, usedIds));
      usedIds.delete(candidate.wrestlerId);
    }

    memo.set(memoKey, best);
    return best;
  }

  return walk(0, new Set());
}

function formatMetricValue(metricId, value, options = {}) {
  const metric = METRIC_DEFS[metricId] || METRIC_DEFS.total_wins;
  const compact = Boolean(options.compact);
  if (metricId === "cagematch_top10_avg") {
    return `${Number(value).toFixed(2)} ${compact ? "avg" : metric.scoreLabel.toLowerCase()}`;
  }
  const rounded = Math.round(value);
  return `${rounded} ${compact ? metric.compactSuffix : metric.scoreLabel}`;
}

function formatPercentile(percentile) {
  return `${ordinalize(percentile)} percentile`;
}

function ordinalize(value) {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return `${value}th`;
  }
  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

function setBanner(tone, text) {
  state.banner = { tone, text, ms: 2600 };
}

function showUsedPopup(wrestler, row, points) {
  const portraitPath = getWrestlerPortraitPath(wrestler);
  refs.usedPopupName.textContent = wrestler.name;
  refs.usedPopupMeta.textContent = `${formatMetricValue(state.board.dailyMetricId, row.metricValue)} · ${formatPercentile(row.metricPercentile)} · ${row.clueLabel} · +${points} points`;
  refs.usedPopupFallback.textContent = getInitials(wrestler.name);
  refs.usedPopupFallback.classList.remove("hidden");

  refs.usedPopupImage.src = portraitPath;
  refs.usedPopupImage.alt = `${wrestler.name} portrait`;
  refs.usedPopupImage.classList.remove("hidden");

  refs.usedPopup.classList.remove("hidden");
  state.usedPopupMs = USED_POPUP_MS;
}

function hideUsedPopup() {
  refs.usedPopup.classList.add("hidden");
  refs.usedPopupImage.classList.add("hidden");
  refs.usedPopupImage.removeAttribute("src");
  refs.usedPopupImage.alt = "";
  refs.usedPopupFallback.classList.remove("hidden");
  state.usedPopupMs = 0;
}

function handleUsedPopupImageError() {
  refs.usedPopupImage.classList.add("hidden");
  refs.usedPopupFallback.classList.remove("hidden");
}

function handleUsedPopupImageLoad() {
  refs.usedPopupImage.classList.remove("hidden");
  refs.usedPopupFallback.classList.add("hidden");
}

function getWrestlerPortraitPath(wrestler) {
  return LOADED_PORTRAITS_SNAPSHOT.paths?.[wrestler.id] || `/assets/wrestlers/${wrestler.id}.png`;
}

function getPortraitImageRecord(wrestler) {
  if (PORTRAIT_IMAGE_CACHE.has(wrestler.id)) {
    return PORTRAIT_IMAGE_CACHE.get(wrestler.id);
  }

  const record = {
    status: "loading",
    image: new Image()
  };

  record.image.addEventListener("load", () => {
    record.status = "loaded";
    render();
  });
  record.image.addEventListener("error", () => {
    record.status = "error";
    render();
  });
  record.image.src = getWrestlerPortraitPath(wrestler);
  PORTRAIT_IMAGE_CACHE.set(wrestler.id, record);
  return record;
}

function getInitials(name) {
  const initials = String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
  return initials || "WP";
}

function updateTransientState(ms) {
  if (state.banner) {
    state.banner.ms -= ms;
    if (state.banner.ms <= 0) {
      state.banner = null;
      syncControls();
    }
  }
  if (state.copiedMessageMs > 0) {
    state.copiedMessageMs -= ms;
    if (state.copiedMessageMs <= 0) {
      state.copiedMessage = "";
      syncControls();
    }
  }
  if (state.usedPopupMs > 0) {
    state.usedPopupMs -= ms;
    if (state.usedPopupMs <= 0) {
      hideUsedPopup();
    }
  }
  state.rows.forEach((row) => {
    if (row.flashMs > 0) {
      row.flashMs -= ms;
      if (row.flashMs <= 0) {
        row.flashMs = 0;
        row.flashTone = null;
      }
    }
  });
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
    return;
  }
  document.documentElement.requestFullscreen().catch(() => {});
}

function getDailyKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hashText(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeName(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

function getNormalizedWrestlerNames(wrestler) {
  const names = [wrestler.name, ...(wrestler.aliases || [])];
  return names.map((name) => normalizeName(name));
}

function getNormalizedAliasNames(wrestler) {
  return (wrestler.aliases || []).map((name) => normalizeName(name));
}
