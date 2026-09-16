"use strict";
// Existing promotion accounting, reusable by future lesson modules.
function calculateOffer(p, entry, rules) {
  const { catalog, promotions } = rules;
  const product = catalog.find((x) => x.id === entry.id),
    active = p.promotion.target === entry.id,
    def = promotions.find((x) => x.id === (active ? p.promotion.id : "none"));
  let revenue = entry.price,
    cost = product.cost,
    units = 1,
    expected = product.expected;
  if (def.id === "bogo") {
    cost *= 2;
    units = 2;
    expected *= 2;
  }
  if (def.id === "half") {
    revenue = Math.round(revenue * 1.5);
    cost *= 2;
    units = 2;
    expected *= 2;
  }
  if (def.id === "ten" || def.id === "happy")
    revenue = Math.round(revenue * 0.9);
  if (def.id === "twenty") revenue = Math.round(revenue * 0.8);
  if (def.id === "dollar") revenue = Math.max(0, revenue - 100);
  if (def.companion) {
    const companion = p.menu.find((x) => x.id === p.promotion.companion),
      c = catalog.find((x) => x.id === companion.id);
    cost += c.cost;
    expected += c.expected;
    units = 2;
    revenue =
      def.id === "bundle"
        ? Math.round((revenue + companion.price) * 0.85)
        : def.id === "drink"
          ? revenue + Math.round(companion.price * 0.5)
          : revenue;
  }
  return {
    happy: def.id === "happy",
    discountedPrice: Math.round(entry.price * 0.8),
    revenue,
    cost,
    units,
    expected,
    factor: def.factor,
    fee: def.fee || 0,
    promoted: active && def.id !== "none",
  };
}
module.exports = { calculateOffer };
