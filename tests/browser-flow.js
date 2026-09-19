"use strict";
// Run with PLAYWRIGHT_MODULE pointing to an available Playwright installation.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const contexts = [];
  const pages = [];
  const errors = [];
  const base = process.env.TEST_URL || "http://127.0.0.1:3197";
  const suffix = Date.now().toString(36);
  fs.mkdirSync("output/business-math-flow", { recursive: true });
  async function shot(p, name) {
    await p.screenshot({
      path: `output/business-math-flow/${name}.png`,
      fullPage: true,
    });
  }
  async function state(p) {
    return JSON.parse(await p.evaluate(() => window.render_game_to_text()));
  }
  async function waitRound(p, r, phase) {
    await p.waitForFunction(
      ({ r, phase }) => {
        const s = JSON.parse(window.render_game_to_text());
        return s.game?.round === r && s.game?.phase === phase;
      },
      { r, phase },
      { timeout: 15000 },
    );
  }
  try {
    for (let i = 0; i < 3; i++) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
      });
      contexts.push(context);
      const p = await context.newPage();
      pages.push(p);
      p.on("pageerror", (e) => errors.push(e.message));
      p.on("console", (m) => {
        if (m.type() === "error" && !m.text().includes("status of 400"))
          errors.push(m.text());
      });
      await p.goto(base);
      await p.locator("[name=name]").fill(["Teacher", "Jordan", "Avery"][i]);
      await p.locator("[name=username]").fill(`owner${i}_${suffix}`);
      await p.locator("[name=password]").fill("classroom-pass-2026");
      await p.locator("#auth-form .btn").click();
      await p.locator("#join-form").waitFor();
    }
    const [host, a, b] = pages;
    await host
      .locator("#host-form [name=name]")
      .fill("Period 3 · Fast Food Founders");
    await host.locator("[name=teacherKey]").fill("classroom-local");
    await host.locator("#host-form .btn").click();
    await host.waitForFunction(
      () => JSON.parse(window.render_game_to_text()).game?.code,
    );
    const code = (await state(host)).game.code;
    for (const [i, p] of [a, b].entries()) {
      await p.locator("[name=code]").fill(code);
      await p
        .locator("[name=restaurant]")
        .selectOption(["Fry Society", "Taco Takeover"][i]);
      await p.locator("[name=icon]").selectOption(i ? "🌮" : "🍟");
      await p.locator("[name=color]").selectOption(i ? "#7357b7" : "#167d69");
      await p.locator("#join-form .btn").click();
      await waitRound(p, 1, "lobby");
    }
    await host.waitForFunction(
      () => JSON.parse(window.render_game_to_text()).game.board.length === 2,
    );
    await host.locator("[data-control=start]").click();
    await waitRound(a, 1, "planning");
    await waitRound(b, 1, "planning");
    await a.locator('[data-select="1"]').first().click();
    await a.locator("[name=markup]").fill("75");
    await a.locator("[name=amount]").fill("1.");
    await a.waitForTimeout(350);
    await a.reload();
    await a.locator("[data-open]").click();
    await a.locator('[data-select="1"]').first().click();
    await a.locator("#pricing-form").waitFor();
    assert.equal(await a.locator("[name=markup]").inputValue(), "");
    await shot(a, "01-pricing-desktop");
    for (let round = 1; round <= 10; round++) {
      for (const p of [a, b]) {
        await waitRound(p, round, "planning");

        const id = String(round);
        await p.locator(`[data-select="${id}"]`).first().click();
        const cost = [240, 260, 190, 280, 160, 60, 120, 90, 110, 200][
          round - 1
        ];
        await p.locator("[name=markup]").fill("100");
        await p.locator("[name=amount]").fill("0");
        await p.locator("[name=price]").fill("0");
        await p.locator("#pricing-form .btn").first().click();
        await p.locator(".feedback.error").waitFor();
        if (round === 6) {
          await shot(p, p === a ? "06-penalty" : "06-penalty-second");
          const old = (await state(p)).game.player.wrongRounds.length;
          await p.locator("[name=amount]").fill("0");
          await p.locator("[name=price]").fill("0");
          const repeated = p.waitForResponse((r) => r.url().endsWith("/check"));
          await p.locator("#pricing-form .btn").first().click();
          await repeated;
          await p.locator(".feedback.error").waitFor();
          assert.equal((await state(p)).game.player.wrongRounds.length, old);
        }
        await p.locator("[name=amount]").fill((cost / 100).toFixed(2));
        await p.locator("[name=price]").fill(((cost * 2) / 100).toFixed(2));
        await p.locator("#pricing-form .btn").first().click();
        await p.locator(".feedback.success").waitFor();
        if (round === 3) {
          await p.locator("#promotion-form [name=id]").selectOption("bogo");
          await p.locator("#promotion-form [name=target]").selectOption(id);
          await p.locator("#promotion-form .btn").click();
          await p.waitForFunction(
            () =>
              JSON.parse(window.render_game_to_text()).game.player.promotion
                .id === "bogo",
          );
          await shot(p, p === a ? "03-promotion" : "03-promotion-other");
        }
        if (round === 2 && p === a) {
          await p.setViewportSize({ width: 390, height: 844 });
          await shot(p, "02-mobile");
          assert.ok(
            await p.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
          await p.setViewportSize({ width: 1440, height: 1000 });
        }
        await p.locator("[data-action=ready]").click();
        await p.waitForFunction(
          () => JSON.parse(window.render_game_to_text()).game.player.ready,
        );
      }
      await host
        .locator("[data-control=run]:not([disabled])")
        .waitFor({ timeout: 15000 });
      await host.locator("[data-control=run]").click();
      await waitRound(a, round, round === 10 ? "complete" : "results");
      await waitRound(b, round, round === 10 ? "complete" : "results");
      if (round === 1 || round === 10) {
        await shot(a, `${round}-results`);
        await shot(host, `${round}-teacher`);
      }
      if (round < 10) {
        await host.locator("[data-control=next]").click();
      }
    }
    await a.locator("[data-action=badges]").click();
    await a.locator(".badge-grid").waitFor();
    assert.equal(await a.locator(".badge").count(), 70);
    await a.locator('[data-feature="46"]').click();
    await a
      .locator('[data-feature="46"]')
      .filter({ hasText: "Featured" })
      .waitFor();
    await shot(a, "badges");
    await a.locator("[data-action=global]").click();
    await a
      .getByRole("heading", { name: "Big ambitions. Real results." })
      .waitFor();
    await shot(a, "global");
    const pub = await contexts[0].newPage();
    await pub.goto(base + "/?board=" + code);
    await pub.getByText("LIVE CLASSROOM LEADERBOARD").waitFor();
    assert.ok(await pub.getByText("Jordan", { exact: true }).count());
    await shot(pub, "public-board");
    await a.locator("[data-action=logout]").click();
    await a.locator("[data-action=login-tab]").click();
    await a.locator("[name=username]").fill(`owner1_${suffix}`);
    await a.locator("[name=password]").fill("classroom-pass-2026");
    await a.locator("#auth-form .btn").click();
    await a.locator("[data-open]").click();
    await waitRound(a, 10, "complete");
    assert.deepEqual(errors, []);
    console.log(
      "PASS: real browser registration, customization, unsaved input reset, 10 multiplayer rounds, math penalties, promotion, responsive layout, 70 badges, featured badge, public/career leaderboards and re-login.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
