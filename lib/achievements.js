"use strict";
const { rulesFor } = require("./lessons");
const names = [
  ["Open for Business", "Complete your first round."],
  ["Making a Name", "Name and customize your restaurant."],
  ["First Customer", "Sell your first item."],
  ["In the Black", "Finish a round with positive profit."],
  ["Expanding the Menu", "Add your second product."],
  ["First-Time Right", "Pass a pricing check on the first attempt."],
  ["Five for Five", "Finish rounds 1–5 without a wrong check."],
  ["Under Pressure", "Finish rounds 6–10 without a penalty."],
  ["Perfect Pricing", "Complete a game without a wrong check."],
  ["Practice Pays Off", "Correct a calculation and save your price."],
  ["Order Up!", "Sell 100 units in one game."],
  ["Busy Kitchen", "Sell 250 units in one game."],
  ["Rush Hour", "Serve 100 units in one round."],
  ["Crowd Favorite", "Sell 50 units of one item in a round."],
  ["Highest Seller", "Lead units sold in a completed multiplayer game."],
  ["Pocket Change", "Earn $100 profit in one game."],
  ["Building Something", "Earn $500 profit in one game."],
  ["Four Figures", "Earn $1,000 profit in one game."],
  ["Personal Best", "Beat your previous completed-game profit."],
  ["Every Round Counts", "Earn positive profit in all ten rounds."],
  ["Premium Paid Off", "Sell 20 units at 150% markup or more in one round."],
  ["Double or Nothing", "Sell 10 units at 200% markup or more in one round."],
  [
    "Small Markup, Big Crowd",
    "Sell 50 units at a positive markup of 25% or less.",
  ],
  ["Found the Sweet Spot", "Change a price and improve its next-round profit."],
  [
    "Know Your Worth",
    "Raise a price and sell at least as many units next round.",
  ],
  ["Grand Opening Offer", "Run your first promotion."],
  ["BOGO Believer", "Earn positive product profit with BOGO."],
  ["Better Together", "Sell 20 meal bundles in a round."],
  ["Promotion Pays", "Improve a promoted product’s profit from last round."],
  ["Full-Price Favorite", "Complete a profitable game with no promotions."],
  ["Something for Everyone", "Offer four menu categories."],
  [
    "House Specialty",
    "One product earns half your positive round profit with five items on the menu.",
  ],
  ["Sweet Success", "Earn $100 from desserts in one game."],
  ["Beverage Boss", "Earn $100 from drinks in one game."],
  ["That’s Actually Edible?", "Sell a wild item."],
  ["Weird Works", "Earn $50 from one wild item in a round."],
  ["High Stakes", "Earn positive profit on a high-cost item."],
  ["Secret Weapon", "Earn $50 from an item no competitor carries."],
  ["Against the Grain", "Lead multiplayer round profit without burgers."],
  ["Worth the Wait", "Add an older item in round 8+ and earn profit from it."],
  ["Back in Business", "Follow a loss with a profitable round."],
  ["Climbing the Board", "Move up three places in a round."],
  ["Round Champion", "Lead round profit in multiplayer."],
  ["Photo Finish", "Win a multiplayer game by $10 or less."],
  ["Restaurant Royalty", "Win a completed multiplayer game."],
  ["First Season Finished", "Complete a ten-round game."],
  ["Regular Business Owner", "Complete three games."],
  ["Serial Entrepreneur", "Complete five games."],
  ["Career Milestone", "Earn $5,000 across completed games."],
  ["Badge Collector", "Unlock 25 badges."],
];
const badges = names.map(([name, description], i) => ({
  id: i + 1,
  name,
  description,
  icon: ["🏪", "🧮", "🔥", "💰", "💎", "📣", "🍽️", "🚀", "🏆", "⭐"][
    Math.floor(i / 5)
  ],
}));
function award(player, id) {
  if (!player.badges.includes(id)) player.badges.push(id);
}
function evaluate(game, p, all, career) {
  const r = p.reports.at(-1),
    prev = p.reports.at(-2),
    items = r.items,
    allItems = p.reports.flatMap((x) => x.items),
    total = p.reports.reduce((a, x) => a + x.profit, 0),
    units = allItems.reduce((a, x) => a + x.units, 0),
    end = game.round === rulesFor(game).totalRounds;
  const multi = all.length >= 2,
    roundBest = Math.max(...all.map((x) => x.reports.at(-1).profit));
  const rank = [...all].sort((a, b) => sum(b) - sum(a));
  const cond = [
    true,
    false,
    units > 0,
    r.profit > 0,
    p.menu.length >= 2,
    false,
    game.round === 5 && !p.reports.some((x) => x.skipped) && p.wrongRounds.every((n) => n > 5),
    end && !p.reports.some((x) => x.skipped && x.round > 5) && p.wrongRounds.every((n) => n <= 5),
    end && !p.reports.some((x) => x.skipped) && p.wrongRounds.length === 0,
    false,
    units >= 100,
    units >= 250,
    r.units >= 100,
    items.some((x) => x.units >= 50),
    end &&
      multi &&
      units ===
        Math.max(...all.map((x) => x.reports.reduce((a, y) => a + y.units, 0))),
    total >= 10000,
    total >= 50000,
    total >= 100000,
    end &&
      career.length > 0 &&
      total > Math.max(...career.map((x) => x.profit)),
    end && p.reports.every((x) => x.profit > 0),
    items.some((x) => x.markup >= 150 && x.units >= 20),
    items.some((x) => x.markup >= 200 && x.units >= 10),
    items.some((x) => x.markup > 0 && x.markup <= 25 && x.units >= 50),
    items.some((x) =>
      prev?.items.some(
        (y) => y.id === x.id && y.price !== x.price && x.profit > y.profit,
      ),
    ),
    items.some((x) =>
      prev?.items.some(
        (y) =>
          y.id === x.id &&
          x.price > y.price &&
          x.units >= y.units &&
          x.units > 0,
      ),
    ),
    r.promotion !== "none",
    r.promotion === "bogo" && items.some((x) => x.promoted && x.profit > 0),
    r.promotion === "bundle" && items.some((x) => x.promoted && x.orders >= 20),
    items.some(
      (x) =>
        x.promoted &&
        prev?.items.some((y) => y.id === x.id && x.profit > y.profit),
    ),
    end && total > 0 && p.reports.every((x) => x.promotion === "none"),
    new Set(items.map((x) => x.category)).size >= 4,
    items.length >= 5 &&
      r.profit > 0 &&
      items.some((x) => x.profit >= r.profit / 2),
    allItems
      .filter((x) => x.category === "Desserts")
      .reduce((a, x) => a + x.profit, 0) >= 10000,
    allItems
      .filter((x) => x.category === "Drinks")
      .reduce((a, x) => a + x.profit, 0) >= 10000,
    items.some((x) => x.wild && x.units > 0),
    items.some((x) => x.wild && x.profit >= 5000),
    items.some((x) => x.highCost && x.profit > 0),
    multi &&
      items.some(
        (x) =>
          x.profit >= 5000 &&
          all.every((q) => q === p || !q.menu.some((y) => y.id === x.id)),
      ),
    multi &&
      r.profit === roundBest &&
      items.every((x) => x.category !== "Burgers"),
    items.some(
      (x) => x.addedRound >= 8 && x.unlockRound < x.addedRound && x.profit > 0,
    ),
    prev?.profit < 0 && r.profit > 0,
    multi &&
      p.previousRank != null &&
      p.previousRank - (rank.findIndex((x) => sum(x) === sum(p)) + 1) >= 3,
    multi && r.profit === roundBest,
    end &&
      multi &&
      rank[0] === p &&
      sum(p) > sum(rank[1]) &&
      sum(p) - sum(rank[1]) <= 1000,
    end && multi && sum(p) === sum(rank[0]),
    end,
    end && career.length + 1 >= 3,
    end && career.length + 1 >= 5,
    end && career.reduce((a, x) => a + x.profit, 0) + total >= 500000,
    false,
  ];
  cond.forEach((yes, i) => {
    if (yes) award(p, i + 1);
  });
  if (p.badges.length >= 25) award(p, 50);
}
function sum(p) {
  return p.reports.reduce((a, r) => a + r.profit, 0) - (p.sabotageCosts || []).filter(x => !p.reports.some(r => r.round === x.round)).reduce((a, x) => a + x.amount, 0);
}
module.exports = { badges, award, evaluate, sum };
