"use strict";
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict"),
  fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({ headless: true }),
    context = await browser.newContext({
      viewport: { width: 1440, height: 1100 },
      colorScheme: "light",
    }),
    p = await context.newPage(),
    host = await browser.newContext();
  const base = process.env.TEST_URL || "http://127.0.0.1:3198",
    suffix = Date.now().toString(36),
    errors = [];
  fs.mkdirSync("output/business-math-visuals", { recursive: true });
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  async function shot(name) {
    await p.screenshot({
      path: "output/business-math-visuals/" + name + ".png",
      fullPage: true,
    });
  }
  async function post(ctx, path, b) {
    const res = await ctx.request.post(base + "/api" + path, { data: b });
    assert.equal(res.status(), 200, await res.text());
    return res.json();
  }
  try {
    await p.goto(base);
    await p.locator("#auth-form").waitFor();
    await p.locator("[name=name]").fill("Jordan");
    await p.locator("[name=username]").fill("visual_" + suffix);
    await p.locator("[name=password]").fill("visual-test-password");
    await p.locator("[data-avatar=fox]").click();
    assert.equal(
      await p.locator("[name=username]").inputValue(),
      "visual_" + suffix,
    );
    await p.locator("[data-action=theme]").click();
    assert.equal(await p.locator("html").getAttribute("data-theme"), "dark");
    assert.equal(await p.locator("[name=name]").inputValue(), "Jordan");
    await shot("registration-dark");
    await p.locator("#auth-form > button").click();
    await p.locator("#join-form").waitFor();
    assert.equal(
      (await (await context.request.get(base + "/api/me")).json()).user.avatar,
      "fox",
    );
    await p.locator(".avatar-trigger").click();
    await p.getByRole("heading", { name: "Your owner identity." }).waitFor();
    await shot("avatars-dark");
    await p.locator("[data-avatar=robot]").click();
    await p.waitForFunction(
      () => document.querySelector(".hero-avatar")?.title === "Byte Bite",
    );
    await p.reload();
    await p.locator(".avatar-trigger").click();
    assert.equal(
      await p.locator("[data-avatar=robot]").getAttribute("aria-pressed"),
      "true",
    );
    assert.equal(await p.locator("html").getAttribute("data-theme"), "dark");
    await p.setViewportSize({ width: 390, height: 844 });
    await shot("avatars-mobile");
    assert.ok(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await p.setViewportSize({ width: 1440, height: 1100 });
    await post(host, "/register", {
      name: "Teacher",
      username: "host_" + suffix,
      password: "visual-test-password",
    });
    let game = await post(host, "/games", {
      teacherKey: "classroom-local",
      name: "Night Shift Founders",
    });
    const code = game.code;
    await p.locator("[data-action=home]").click();
    await p.locator("[name=code]").fill(code);
    await p.locator("[name=restaurant]").selectOption("Midnight Munch");
    await p.locator("[name=color]").selectOption("#7357b7");
    await p.locator("#join-form button").click();
    await p.waitForFunction(
      () => JSON.parse(window.render_game_to_text()).game?.phase === "lobby",
    );
    game = await (await host.request.get(base + "/api/games/" + code)).json();
    await post(host, "/games/" + code + "/start", { version: game.version });
    await p.waitForFunction(
      () => JSON.parse(window.render_game_to_text()).game?.phase === "planning",
    );
    await p.locator('[data-select="1"]').click();
    await p.locator("[name=markup]").fill("75");
    await p.locator("[name=amount]").fill("1.80");
    await p.locator("[name=price]").fill("4.20");
    await p.locator("#pricing-form .btn").first().click();
    await p.locator(".feedback.success").waitFor();
    await p.evaluate(() => scrollTo(0, 0));
    await shot("restaurant-dark");
    await p.locator("[data-action=theme]").click();
    await shot("restaurant-light");
    await p.locator("[data-action=theme]").click();
    await p.setViewportSize({ width: 390, height: 844 });
    await shot("restaurant-mobile");
    assert.ok(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await p.setViewportSize({ width: 1440, height: 1100 });
    await p.locator("[data-action=ready]").click();
    await p.waitForFunction(
      () => JSON.parse(window.render_game_to_text()).game.player.ready,
    );
    game = await (await host.request.get(base + "/api/games/" + code)).json();
    await post(host, "/games/" + code + "/run", { version: game.version });
    await p.waitForFunction(
      () => JSON.parse(window.render_game_to_text()).game.phase === "results",
    );
    await p.locator(".profit-total").waitFor();
    const report = await p.evaluate(() =>
      JSON.parse(window.render_game_to_text()).game.player.reports.at(-1),
    );
    assert.equal(
      await p.locator(".profit-total").innerText(),
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(report.profit / 100),
    );
    assert.equal(await p.locator(".round-rail li").count(), 10);
    await shot("results-dark");
    await p.locator("[data-action=theme]").click();
    await shot("results-light");
    await p.locator("[data-action=theme]").click();
    await p.setViewportSize({ width: 390, height: 844 });
    await shot("results-mobile");
    assert.ok(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await p.setViewportSize({ width: 1440, height: 1100 });
    await p.locator("[data-action=badges]").click();
    await p.locator(".badge-grid").waitFor();
    await shot("badges-dark");
    const earned = Number(
      await p.locator(".collection-progress").getAttribute("aria-valuenow"),
    );
    await p.locator("[data-badge-filter=earned]").click();
    assert.equal(await p.locator(".badge").count(), earned);
    await p.locator("[data-badge-filter=locked]").click();
    assert.equal(await p.locator(".badge").count(), 50 - earned);
    await p.locator("[data-badge-filter=all]").click();
    assert.equal(await p.locator(".badge").count(), 50);
    await p.goto(base + "/?board=" + code);
    await p.locator(".owner-cell svg").waitFor();
    assert.equal(
      await p.locator(".owner-cell .owner-art").getAttribute("title"),
      "Byte Bite",
    );
    await shot("leaderboard-dark");
    await p.locator("[data-action=theme]").click();
    assert.equal(await p.locator("html").getAttribute("data-theme"), "light");
    await p.goto(base);
    await p.locator("[data-action=logout]").click();
    await p.locator("[data-action=login-tab]").click();
    await p.locator("[name=username]").fill("visual_" + suffix);
    await p.locator("[name=password]").fill("visual-test-password");
    await p.locator("#auth-form > button").click();
    await p.locator("#join-form").waitFor();
    assert.equal(
      await p.locator(".avatar-trigger .owner-art").getAttribute("title"),
      "Byte Bite",
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS: theme persistence, draft-preserving toggles, registration avatar, account update/reload/login, public board avatars, mobile layouts, pricing and round results.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
