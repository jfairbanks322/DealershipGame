/* Original, code-drawn mascots. Shared IDs keep account validation and UI in sync. */
(function (root) {
  const rows = [
    ["chef", "Chef Sprout", "#ffbd79", "#f19e78", "chef"],
    ["fox", "Sly Fry", "#fac997", "#e77e42", "fox"],
    ["panda", "Bao Boss", "#b8d9bd", "#f9f5e9", "panda"],
    ["frog", "Flip", "#bbda90", "#72ad66", "frog"],
    ["robot", "Byte Bite", "#a7d9e1", "#6ca8b6", "robot"],
    ["space", "Orbit", "#b9b2e2", "#dedcf6", "space"],
    ["cat", "Mochi", "#e7b8d9", "#ad81b5", "cat"],
    ["bear", "Honey", "#e6c39b", "#b7865c", "bear"],
    ["alien", "Nova", "#bac0ee", "#8ebf99", "alien"],
    ["raccoon", "Bandit", "#c7d2e2", "#889baa", "raccoon"],
    ["owl", "Professor Hoot", "#dfc497", "#b38b61", "owl"],
    ["tiger", "Chili", "#ffc3a0", "#ee984f", "tiger"],
  ];
  const circle = (x, y, r, color) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
  const avatars = rows.map(([id, name, bg, fur, type]) => {
    let art = `<path d="M15 96 Q18 71 48 72 Q78 71 81 96" fill="#254a43"/><path d="M35 77 L48 88 61 77" fill="#fff6e4"/>`;
    if (["fox", "cat", "tiger"].includes(type))
      art += `<path d="M20 43 L18 15 39 30 M57 30 L78 15 76 44" fill="${fur}" stroke="#304439" stroke-width="2"/><path d="M23 32 L23 23 32 32 M64 32 L73 23 72 34" fill="#f5c1aa"/>`;
    if (["panda", "bear", "raccoon"].includes(type))
      art +=
        circle(23, 31, 12, type === "panda" ? "#304439" : fur) +
        circle(73, 31, 12, type === "panda" ? "#304439" : fur);
    art += `<rect x="20" y="28" width="56" height="48" rx="24" fill="${fur}"/>`;
    if (type === "frog")
      art += circle(31, 33, 13, fur) + circle(65, 33, 13, fur);
    if (type === "fox")
      art += `<path d="M22 48 L48 59 74 48 Q68 76 48 77 Q27 75 22 48" fill="#fff3dd"/>`;
    if (type === "panda" || type === "raccoon")
      art += `<ellipse cx="35" cy="48" rx="10" ry="12" fill="#354741"/><ellipse cx="61" cy="48" rx="10" ry="12" fill="#354741"/>`;
    if (type === "robot")
      art += `<rect x="21" y="29" width="54" height="44" rx="13" fill="${fur}"/><path d="M48 30 V18" stroke="#304439" stroke-width="4"/>${circle(48, 16, 5, "#f2a14d")}<rect x="27" y="39" width="42" height="19" rx="7" fill="#26473f"/><path d="M36 65 H60" stroke="#e3ede1" stroke-width="4"/>`;
    if (type === "owl")
      art +=
        circle(35, 47, 15, "#fff0cf") +
        circle(61, 47, 15, "#fff0cf") +
        `<path d="M43 57 L48 66 53 57" fill="#ec9a44"/>`;
    if (type === "alien")
      art += `<path d="M30 30 L25 16 M66 30 L71 16" stroke="${fur}" stroke-width="5"/>${circle(25, 15, 5, fur)}${circle(71, 15, 5, fur)}`;
    if (type === "tiger")
      art += `<path d="M43 29 L46 40 49 29 M57 29 L56 38 M21 47 L30 50 21 53 M75 47 L66 50 75 53" fill="#634d37"/>`;
    if (type === "space")
      art += `<rect x="22" y="31" width="52" height="39" rx="20" fill="#3a4665"/><path d="M31 37 Q40 31 48 36" stroke="#becce2" stroke-width="3" fill="none"/>`;
    const light = ["panda", "raccoon", "robot", "space"].includes(type);
    art +=
      circle(36, 48, 3.2, light ? "#fff8e6" : "#293e35") +
      circle(60, 48, 3.2, light ? "#fff8e6" : "#293e35");
    if (!["robot", "owl"].includes(type))
      art += `<path d="M42 61 Q48 67 54 61" fill="none" stroke="${type === "space" ? "#fff8e6" : "#293e35"}" stroke-width="2.8" stroke-linecap="round"/>`;
    if (!["robot", "space", "panda"].includes(type))
      art += `<ellipse cx="29" cy="57" rx="5" ry="3" fill="#ee9c86" opacity=".7"/><ellipse cx="67" cy="57" rx="5" ry="3" fill="#ee9c86" opacity=".7"/>`;
    if (type === "chef")
      art += `<path d="M27 32 V22 Q16 9 32 10 Q36 -1 48 8 Q62 -1 67 13 Q80 17 68 27 V33Z" fill="#fffdf4"/><path d="M28 32 H68" stroke="#e5dac4" stroke-width="3"/>`;
    if (type === "space")
      art += `<rect x="16" y="42" width="8" height="16" rx="3" fill="#f2c260"/><rect x="72" y="42" width="8" height="16" rx="3" fill="#f2c260"/>`;
    art +=
      circle(68, 84, 9, "#efac51") +
      `<path d="M64 84 H72 M68 80 V88" stroke="#684e28" stroke-width="2"/>`;
    return {
      id,
      name,
      svg: `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="96" height="96" rx="28" fill="${bg}"/>${art}</svg>`,
    };
  });
  if (typeof module !== "undefined" && module.exports) module.exports = avatars;
  else root.CounterAvatars = avatars;
})(globalThis);
