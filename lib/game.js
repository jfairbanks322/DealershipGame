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
function newPlayer(user, restaurant, icon, color, storefront = "diner") {
  return {
    userId: user.id,
    owner: user.name,
    restaurant,
    storefront,
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
function mathPenalty(g) {
  return rulesFor(g).mathChecks === false ? 0 : (g.penalty || 0) * Math.max(0, g.round - rulesFor(g).practiceRounds);
}
function pricing(g, p, b, options = {}) {
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
  const assisted = options.assisted === true || (p.guidedUsed || []).includes(key) || (p.hintRounds || []).includes(g.round);
  if(rulesFor(g).mathChecks!==false)require("./math-progress").record(p,g.round,verdict.correct,assisted);
  let penalty = 0;
  if (!verdict.correct) {
    p.failedChecks ??= {};
    p.failedChecks[key] = true;
    const fresh = !p.wrongRounds.includes(g.round);
    if (fresh) p.wrongRounds.push(g.round);
    penalty = fresh && !(p.waivedMathRounds || []).includes(g.round) ? mathPenalty(g) : 0;
  }
  if (verdict.correct && !assisted && rulesFor(g).mathChecks !== false && previous === 0) award(p, 6);
  if (verdict.correct && rulesFor(g).mathChecks !== false && p.failedChecks?.[key]) award(p, 10);
  if (existing) Object.assign(existing, verdict.menuPatch);
  else p.menu.push({ id: item.id, ...verdict.menuPatch, addedRound: g.round });
  delete p.drafts[item.id];
  if(p.roundGuide?.round===g.round)p.roundGuide.review=false;
  if (p.menu.length >= 2) award(p, 5);
  return { correct: verdict.correct, saved: true, penalty, roundPenalty: p.wrongRounds.includes(g.round) && !(p.waivedMathRounds || []).includes(g.round) ? mathPenalty(g) : 0, message: verdict.message };
}
function validatePromotion(g, p, promo) {
  insist(!require("./markdowns").enabled(g) || promo.id === "none", "Markdown lessons replace promotions for this round; discounts do not stack.");
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
  return require("./markdowns").offer(g,p,entry) || lessonFor(g).calculateOffer(p, entry, rulesFor(g));
}

function simulate(g, careers) {
  insist(g.phase === "planning" && !g.paused, "This round cannot run now.");
  const players = Object.values(g.players);
  insist(
    players.length > 0 && players.every((x) => x.ready || x.skippedRound === g.round),
    "Every restaurant must submit or be skipped by the teacher before the round runs.",
  );
  insist(players.some((x) => x.ready && x.skippedRound !== g.round), "At least one restaurant must submit to run a round.");
  const settled = p => p.reports.reduce((n,r)=>n+r.profit,0);
  const prior = [...players].sort((a, b) => settled(b) - settled(a));
  players.forEach(
    (p) => (p.previousRank = prior.findIndex((q) => settled(q) === settled(p)) + 1),
  );
  const businessSimulation=lessonFor(g).simulateRound?.(g,players);
  for (const p of players) {
    const flashIncome = require("./flash-challenges").income(p,g.round);
    const hintFees = require("./classroom").hintFee(p, g.round);
    const mysteryFees = require("./mystery-box").expense(p, g.round);
    const sabotageFees = require("./sabotage").expense(p, g.round);
    if (p.skippedRound === g.round) {
      p.reports.push({round:g.round, skipped:true, items:[], revenue:0, cost:0, fees:sabotageFees+mysteryFees+hintFees-flashIncome, flashIncome, hintFees, sabotageFees, mysteryFees, penalty:0, profit:flashIncome-sabotageFees-mysteryFees-hintFees, units:0, promotion:"none"});
      continue;
    }
    const items = p.menu.map((entry) => {
      if (businessSimulation) return businessSimulation[p.userId].items[entry.id];
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
        markdown: offer.markdown || null,
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
    const competitionFee=require("./lessons/competition").effects(g,p).fee;
    let allianceSavings=0;
    for(const item of items){const saving=require('./alliances').saving(g,p,item.cost);item.cost-=saving;item.profit+=saving;item.allianceSavings=saving;allianceSavings+=saving;}
    const revenue = items.reduce((a, x) => a + x.revenue, 0),
      cost = items.reduce((a, x) => a + x.cost, 0),
      fees = items.reduce((a, x) => a + x.fee, 0) + sabotageFees + mysteryFees + hintFees + competitionFee - flashIncome,
      penalty =
        g.round > rulesFor(g).practiceRounds && p.wrongRounds.includes(g.round) && !(p.waivedMathRounds || []).includes(g.round)
          ? mathPenalty(g)
          : 0;
    p.reports.push({
      round: g.round,
      competitionFee,
      flashIncome,
      competition: require("./lessons/competition").report(g,p),
      allianceSavings,
      marketStrategy: (p.marketStrategies || []).find(x=>x.round===g.round) || null,
      items,
      revenue,
      cost,
      fees,
      sabotageFees,
      mysteryFees,
      hintFees,
      penalty,
      profit: revenue - cost - fees - penalty,
      units: items.reduce((a, x) => a + x.units, 0),
      promotion: require("./markdowns").enabled(g)?"none":p.promotion.id,
    });
  }
  require("./sabotage").settle(g);
  lessonFor(g).finalize?.(g,players,businessSimulation);
  players.filter((p) => p.skippedRound !== g.round).forEach((p) => {
    if (rulesFor(g).mathChecks === false) {
      award(p,1); if(p.reports.at(-1).units>0) award(p,3); if(p.reports.at(-1).profit>0) award(p,4); if(g.round===rulesFor(g).totalRounds) award(p,46);
    } else evaluate(g, p, players, careers(p.userId));
  });
  g.phase = g.round === rulesFor(g).totalRounds ? "complete" : "results";
}
module.exports = {
  insist,
  mathPenalty,
  money,
  newPlayer,
  pricing,
  validatePromotion,
  deal,
  simulate,
};
