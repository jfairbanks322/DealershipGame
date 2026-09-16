/* Original vector food illustrations: no image downloads or external requests. */
(function (root) {
  const families = [
    "burger",
    "sandwich",
    "taco",
    "pizza",
    "fries",
    "drink",
    "shake",
    "churro",
    "rings",
    "wrap",
    "burger",
    "sandwich",
    "sundae",
    "taco",
    "mac",
    "drink",
    "waffle",
    "cone",
    "donut",
    "burger",
    "sundae",
    "drink",
    "shake",
    "taco",
    "wrap",
    "fries",
    "burger",
    "shake",
    "wrap",
    "bowl",
    "meatballs",
    "burger",
    "shake",
    "nachos",
  ];
  const palettes = ["#d76247", "#6fa773", "#8666b3", "#e3ad48"];
  root.CounterFoodArt = function (id) {
    const n = Number(id) - 1,
      type = families[n] || "burger",
      color = palettes[Math.max(0, n) % 4],
      wild = n >= 21;
    const circle = (x, y, r, c) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
    let art = "";
    if (["burger", "sandwich", "waffle"].includes(type)) {
      art = `<rect x="21" y="68" width="78" height="17" rx="9" fill="#dea35b"/><rect x="17" y="58" width="86" height="13" rx="6" fill="${type === "sandwich" ? "#c38640" : "#76513a"}"/><path d="M18 55 L31 49 44 54 57 48 70 54 84 48 102 55 96 61 81 58 64 62 47 58 32 62Z" fill="#78a55e"/><path d="M24 49 L53 47 69 65 87 48" fill="#f4c555"/><path d="M20 46 Q20 17 60 16 Q100 17 100 46Z" fill="${wild ? "#9581c2" : "#ebb767"}"/>`;
      for (const [x, y] of [
        [38, 30],
        [57, 26],
        [77, 31],
        [51, 37],
        [83, 39],
      ])
        art += `<path d="M${x} ${y} l3 -1" stroke="#fff0c2" stroke-width="3" stroke-linecap="round"/>`;
      if (type === "waffle")
        art +=
          '<path d="M30 27 H87 M24 36 H96 M40 20 V43 M55 17 V44 M70 20 V44 M85 26 V44" stroke="#c38c45" stroke-width="3"/>';
    } else if (type === "taco") {
      art = '<path d="M18 71 Q26 22 69 31 Q92 32 103 66Z" fill="#6c9f5e"/>';
      for (let i = 0; i < 7; i++)
        art += circle(
          33 + i * 9,
          49 + (i % 2) * 8,
          7,
          i % 2 ? "#d66b4e" : "#86553c",
        );
      art += `<path d="M18 74 Q20 22 68 36 Q92 44 103 74 Q61 95 18 74" fill="${wild ? "#e5a3bd" : "#efc16c"}"/>`;
      for (let i = 0; i < 6; i++)
        art += circle(33 + i * 10, 61 + (i % 2) * 8, 2, "#c89750");
    } else if (["pizza", "cone", "nachos"].includes(type)) {
      art =
        type === "cone"
          ? '<path d="M33 38 L62 96 90 37Z" fill="#d9a359"/><ellipse cx="61" cy="38" rx="29" ry="14" fill="#f3c85c"/>'
          : type === "nachos"
            ? '<path d="M19 77 L40 29 61 72 M43 77 L73 31 100 78 M15 79 L24 47 53 81" fill="#f1c25f"/>'
            : '<path d="M20 29 Q61 10 104 29 L61 94Z" fill="#e9a657"/><path d="M28 33 Q60 20 95 33 L61 83Z" fill="#f4cb61"/>';
      for (const [x, y] of [
        [48, 38],
        [75, 40],
        [59, 60],
      ])
        art += circle(x, y, 7, color);
    } else if (["drink", "shake"].includes(type)) {
      art = `<path d="M63 33 L77 10 H89" fill="none" stroke="${color}" stroke-width="7" stroke-linejoin="round"/><path d="M32 36 H89 L81 91 Q60 98 40 91Z" fill="${type === "shake" ? (wild ? "#a596d4" : "#b88a6c") : color}"/><path d="M40 43 L45 84" stroke="#ffffff55" stroke-width="5" stroke-linecap="round"/><ellipse cx="60" cy="37" rx="30" ry="6" fill="#f9e6c7"/>`;
      if (type === "shake") {
        art +=
          '<path d="M34 32 Q29 22 43 23 Q39 12 56 17 Q67 4 71 19 Q90 17 86 31Z" fill="#fff1d7"/>' +
          circle(64, 15, 6, "#d76a56");
      } else
        art += circle(85, 40, 14, "#f4d27b") + circle(85, 40, 10, "#ffe7a1");
      art += `<circle cx="60" cy="66" r="13" fill="#fff3d34d"/><path d="M55 67 L60 58 66 67 60 76Z" fill="#fff5dd"/>`;
    } else if (["fries", "churro"].includes(type)) {
      for (let i = 0; i < 7; i++)
        art += `<rect x="${24 + i * 9}" y="${18 + (i % 3) * 8}" width="8" height="58" rx="2" fill="${i % 2 ? "#e7ad4f" : "#f1c46b"}" transform="rotate(${(i - 3) * 3} ${28 + i * 9} 74)"/>`;
      art += `<path d="M20 48 Q60 65 101 48 L89 90 Q60 99 31 90Z" fill="${type === "churro" ? "#a58560" : color}"/><path d="M48 74 L57 80 74 66" fill="none" stroke="#fff0cb" stroke-width="5" stroke-linecap="round"/>`;
    } else if (["sundae", "donut"].includes(type)) {
      if (type === "donut") {
        art =
          '<ellipse cx="60" cy="59" rx="38" ry="31" fill="#d9a260"/><ellipse cx="60" cy="53" rx="36" ry="27" fill="#e6a8b2"/>' +
          circle(60, 54, 11, "#c28952");
      } else {
        art =
          '<path d="M25 56 H95 Q91 87 62 87 Q32 85 25 56" fill="#84b8b7"/><path d="M59 86 V97 M44 97 H76" stroke="#84b8b7" stroke-width="5"/>' +
          circle(45, 48, 18, "#f8debc") +
          circle(76, 47, 18, "#b7866d") +
          circle(60, 27, 18, "#edb0bd") +
          '<path d="M45 25 Q57 40 75 26" fill="none" stroke="#89634d" stroke-width="6"/>' +
          circle(62, 10, 6, "#d7604d");
      }
      for (let i = 0; i < 6; i++)
        art += `<path d="M${34 + i * 9} ${42 + (i % 2) * 17} l3 3" stroke="${palettes[i % 4]}" stroke-width="3"/>`;
    } else if (type === "wrap") {
      art =
        '<path d="M34 26 Q46 10 78 20 L91 45 64 94 Q46 99 26 77Z" fill="#edd2a0"/><path d="M35 28 L62 46 84 24" fill="#75a265"/><path d="M31 50 L71 68 64 94 Q41 94 26 77Z" fill="#fff0d7"/>';
      for (let i = 0; i < 4; i++)
        art += circle(
          46 + i * 8,
          27 + (i % 2) * 5,
          5,
          wild ? color : "#d77a55",
        );
      art += '<path d="M32 65 L64 79" stroke="#d8b87e" stroke-width="2"/>';
    } else if (type === "rings") {
      art = '<ellipse cx="60" cy="87" rx="45" ry="7" fill="#f0e2c0"/>';
      for (const [x, y] of [
        [35, 67],
        [70, 70],
        [52, 44],
        [84, 47],
      ])
        art += `<circle cx="${x}" cy="${y}" r="16" fill="none" stroke="#d89944" stroke-width="9"/><circle cx="${x}" cy="${y}" r="15" fill="none" stroke="#f0bd63" stroke-width="4"/>`;
    } else {
      art = `<path d="M17 48 H103 Q95 91 60 92 Q25 90 17 48Z" fill="${color}"/><ellipse cx="60" cy="48" rx="43" ry="16" fill="#e9c484"/>`;
      for (let i = 0; i < 9; i++)
        art += circle(
          30 + (i % 5) * 14,
          41 + Math.floor(i / 5) * 12,
          7,
          type === "meatballs" ? "#976349" : i % 2 ? "#e9b14c" : "#8ba966",
        );
      art +=
        '<path d="M27 65 Q37 83 54 83" fill="none" stroke="#ffffff55" stroke-width="4" stroke-linecap="round"/>';
    }
    const sparkles = wild
      ? '<path d="M16 17 L19 24 26 27 19 30 16 37 13 30 6 27 13 24Z M103 63 L106 69 112 72 106 75 103 81 100 75 94 72 100 69Z" fill="#e5bc60"/>'
      : "";
    return `<svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="61" cy="98" rx="42" ry="6" fill="#76543318"/>${art}${sparkles}</svg>`;
  };
})(globalThis);
