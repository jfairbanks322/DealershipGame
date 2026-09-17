"use strict";
const { catalog, promotions } = require("../catalog");
const { calculateOffer } = require("./marketing-offers-v1");
// Published lesson IDs are immutable. Add a new module/ID for new mechanics.
const rules = {
  totalRounds: 10,
  practiceRounds: 5,
  promotionsFromRound: 3,
  maxMarkup: 500,
  catalog,
  promotions,
};
function checkPricing(item, b, rules) {
  const markup = Number(b.markup);
  if (
    !["string", "number"].includes(typeof b.markup) ||
    String(b.markup).trim() === "" ||
    !Number.isFinite(markup) ||
    Math.abs(markup * 100 - Math.round(markup * 100)) >= 1e-7 ||
    markup < 0 ||
    markup > rules.maxMarkup
  ) {
    const error = new Error(
      `Choose a markup between 0% and ${rules.maxMarkup}%, with up to two decimal places.`,
    );
    error.status = 400;
    throw error;
  }
  const amount = Math.floor(
      (item.cost * Math.round(markup * 100) + 5000) / 10000,
    ),
    price = item.cost + amount;
  const cents = (value) => {
    if (
      !["string", "number"].includes(typeof value) ||
      String(value).trim() === ""
    )
      return NaN;
    const n = Number(value),
      c = Math.round(n * 100);
    return Number.isFinite(n) && Math.abs(n * 100 - c) < 1e-7 ? c : NaN;
  };
  const correct = cents(b.amount) === amount && cents(b.price) === price;
  return {
    markup,
    price,
    menuPatch: { markup, price },
    correct,
    message: correct
      ? "Math checked. Your price is saved."
      : cents(b.amount) !== amount
        ? "Check markup dollars: cost × markup percentage ÷ 100. Round to the nearest cent."
        : "Check selling price: cost + your rounded markup dollars.",
  };
}
function readyError(game, p) {
  if (!p.menu.some((x) => x.addedRound === game.round))
    return "Add this round’s new menu item first.";
  return null;
}
module.exports = {
  id: "cost-markup-v1",
  label: "Cost & Markup",
  rules,
  checkPricing,
  readyError,
  calculateOffer,
  draftFields: ["markup", "amount", "price"],
};
