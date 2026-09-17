"use strict";
const { lessonFor, rulesFor, draftFor } = require("./lessons");
const { award, evaluate, sum } = require("./achievements");
function insist(ok, message) {
  if (!ok) {
    const e = new Error(message);
    e.status = 400;
    throw e;
  }
}
const money = (n) => {
  if (!["string", "number"].includes(typeof n) || String(n).trim() === "")
    return NaN;
  const value = Number(n),
    cents = Math.round(value * 100);
  return Number.isFinite(value) && Math.abs(value * 100 - cents) < 1e-7
    ? cents
    : NaN;
};
function newPlayer(user, restaurant, icon, color) {
  return {
    userId: user.id,
    owner: user.name,
    restaurant,
    icon,
    color,
    menu: [],
    drafts: {},
    ready: false,
    wrongRounds: [],
    attempts: {},
    failedChecks: {},
    reports: [],
    badges: [...user.badges],
    promotion: { id: "none" },
  };
}
function pricing(g, p, b) {
  insist(
    g.phase === "planning" && !g.paused && !p.ready && p.skippedRound !== g.round,
    "Pricing is closed right now.",
  );
  const item = rulesFor(g).catalog.find(
    (x) => x.id === b.id && x.round <= g.round,
  );
  insist(item, "That item is not available.");
  const existing = p.menu.find((x) => x.id === b.id);
  insist(
    existing || !p.menu.some((x) => x.addedRound === g.round),
    "You can add only one new item each round.",
  );
  const verdict = lessonFor(g).checkPricing(item, b, rulesFor(g));
  const { markup, price } = verdict;
  const key = g.round + ":" + item.id;
  const previous = p.attempts[key] || 0;
  p.attempts[key] = previous + 1;
  if (!verdict.correct) {
    p.failedChecks ??= {};
    p.failedChecks[key] = true;
    const fresh = !p.wrongRounds.includes(g.round);
    if (fresh) p.wrongRounds.push(g.round);
    return {
      correct: false,
      penalty: fresh && g.round > rulesFor(g).practiceRounds ? g.penalty : 0,
      message: verdict.message,
    };
  }
  if (rulesFor(g).mathChecks !== false && previous === 0) award(p, 6);
  if (rulesFor(g).mathChecks !== false && p.failedChecks?.[key]) award(p, 10);
  if (existing) Object.assign(existing, verdict.menuPatch);
  else p.menu.push({ id: item.id, ...verdict.menuPatch, addedRound: g.round });
  delete p.drafts[item.id];
  if (p.menu.length >= 2) award(p, 5);
  return { correct: true, message: verdict.message };
}
function validatePromotion(g, p, promo) {
  const def = rulesFor(g).promotions.find((x) => x.id === promo.id);
  insist(def, "Unknown promotion.");
  insist(
    g.round >= rulesFor(g).promotionsFromRound || def.id === "none",
    `Promotions unlock in round ${rulesFor(g).promotionsFromRound}.`,
  );
  if (def.id === "none") return { id: "none" };
  insist(
    p.menu.some((x) => x.id === promo.target),
    "Choose an item from your menu.",
  );
  if (def.companion) {
    const other = rulesFor(g).catalog.find((x) => x.id === promo.companion);
    insist(
      other &&
        promo.target !== promo.companion &&
        p.menu.some((x) => x.id === other.id),
      "Choose a different companion item from your menu.",
    );
    insist(
      def.id === "drink"
        ? other.category === "Drinks"
        : def.id === "freeSide"
          ? other.category === "Sides"
          : ["Sides", "Drinks"].includes(other.category),
      "Choose an eligible side or drink.",
    );
  }
  return {
    id: def.id,
    target: promo.target,
    companion: def.companion ? promo.companion : null,
  };
}
function deal(p, entry, g = {}) {
  return lessonFor(g).calculateOffer(p, entry, rulesFor(g));
}

function simulate(g, careers) {
  insist(g.phase === "planning" && !g.paused, "This round cannot run now.");
  const players = Object.values(g.players);
  insist(
    players.length > 0 && players.every((x) => x.ready || x.skippedRound === g.round),
    "Every restaurant must submit or be skipped by the teacher before the round runs.",
  );
  insist(players.some((x) => x.ready && x.skippedRound !== g.round), "At least one restaurant must submit to run a round.");
  const prior = [...players].sort((a, b) => sum(b) - sum(a));
  players.forEach(
    (p) => (p.previousRank = prior.findIndex((q) => sum(q) === sum(p)) + 1),
  );
  for (const p of players) {
    if (p.skippedRound === g.round) {
      p.reports.push({round:g.round, skipped:true, items:[], revenue:0, cost:0, fees:0, penalty:0, profit:0, units:0, promotion:"none"});
      continue;
    }
    const items = p.menu.map((entry) => {
      if (lessonFor(g).simulateItem) return lessonFor(g).simulateItem(g, p, entry, players);
      const product = rulesFor(g).catalog.find((x) => x.id === entry.id),
        offer = deal(p, entry, g);
      // Shared conditions; deterministic demand prevents refreshes from rerolling sales.
      const weather = 1 + ((g.round % 3) - 1) * 0.06;
      const demand = Math.max(
        0.025,
        Math.min(
          1.8,
          Math.exp(-product.sensitivity * (offer.revenue / offer.expected - 1)),
        ),
      );
      const orders = Math.max(
        0,
        Math.round(
          (product.popularity * weather * demand * offer.factor) /
            Math.pow(p.menu.length, 0.38),
        ),
      );
      const revenue = offer.happy
          ? Math.floor(orders / 2) * offer.discountedPrice +
            Math.ceil(orders / 2) * entry.price
          : orders * offer.revenue,
        cost = orders * offer.cost,
        fee = offer.fee;
      return {
        ...entry,
        name: product.name,
        icon: product.icon,
        category: product.category,
        wild: product.wild,
        highCost: product.highCost,
        unlockRound: product.round,
        orders,
        units: orders * offer.units,
        revenue,
        cost,
        fee,
        profit: revenue - cost - fee,
        promoted: offer.promoted,
        feedback:
          offer.revenue > offer.expected * 1.3
            ? "Premium pricing limited demand."
            : offer.revenue < offer.expected * 0.75
              ? "Value pricing attracted a crowd."
              : "Customers responded well to your price.",
      };
    });
    const revenue = items.reduce((a, x) => a + x.revenue, 0),
      cost = items.reduce((a, x) => a + x.cost, 0),
      fees = items.reduce((a, x) => a + x.fee, 0),
      penalty =
        g.round > rulesFor(g).practiceRounds && p.wrongRounds.includes(g.round)
          ? g.penalty
          : 0;
    p.reports.push({
      round: g.round,
      items,
      revenue,
      cost,
      fees,
      penalty,
      profit: revenue - cost - fees - penalty,
      units: items.reduce((a, x) => a + x.units, 0),
      promotion: p.promotion.id,
    });
  }
  players.filter((p) => p.skippedRound !== g.round).forEach((p) => {
    if (rulesFor(g).mathChecks === false) {
      award(p,1); if(p.reports.at(-1).units>0) award(p,3); if(p.reports.at(-1).profit>0) award(p,4); if(g.round===rulesFor(g).totalRounds) award(p,46);
    } else evaluate(g, p, players, careers(p.userId));
  });
  g.phase = g.round === rulesFor(g).totalRounds ? "complete" : "results";
}
module.exports = {
  insist,
  money,
  newPlayer,
  pricing,
  validatePromotion,
  deal,
  simulate,
};
