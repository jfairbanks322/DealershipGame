const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { prompts, categories } = require("../prompts");
const { AVATAR_CHOICES, normalizeAvatarId, avatarFor } = require("../public/avatars");

test("starter bank contains 144 fully described prompts across the expanded category set", () => {
  const requestedCategories = [
    "Poetry — Rhyming", "Poetry — Free verse", "Suspense and mystery", "Comedy", "Fantasy",
    "Finish the story", "Connect the start and end"
  ];
  assert.equal(categories.length, 16);
  assert.equal(prompts.length, 144);
  assert.equal(new Set(prompts.map((prompt) => prompt.id)).size, prompts.length);
  for (const category of categories) assert.equal(prompts.filter((prompt) => prompt.category === category).length, 9);
  for (const category of requestedCategories) assert.ok(categories.includes(category));
  assert.ok(prompts.filter((prompt) => prompt.category === "Finish the story").every((prompt) => /finish the story/i.test(prompt.text)));
  assert.ok(prompts.filter((prompt) => prompt.category === "Connect the start and end").every((prompt) => /start:.*end:/i.test(prompt.text)));
  for (const prompt of prompts) {
    assert.ok(prompt.text.length >= 20);
    assert.ok(["accessible", "intermediate", "challenge"].includes(prompt.difficulty));
    assert.ok(["short", "medium", "long"].includes(prompt.responseLength));
    assert.ok([120, 240, 360].includes(prompt.timerSeconds));
    assert.ok(prompt.suggestion);
  }
});

test("avatar choices are unique, labeled, and safely normalized", () => {
  assert.equal(AVATAR_CHOICES.length, 70);
  assert.equal(new Set(AVATAR_CHOICES.map((avatar) => avatar.id)).size, AVATAR_CHOICES.length);
  assert.equal(new Set(AVATAR_CHOICES.map((avatar) => avatar.src)).size, AVATAR_CHOICES.length);
  assert.ok(AVATAR_CHOICES.every((avatar) => avatar.id && avatar.src && avatar.label));
  for (const avatar of AVATAR_CHOICES) {
    assert.ok(fs.existsSync(path.join(__dirname, "..", "public", avatar.src.replace(/^\//, ""))), `${avatar.id} image is missing`);
  }
  assert.equal(normalizeAvatarId("robot"), "robot");
  assert.equal(normalizeAvatarId("not-a-real-avatar"), AVATAR_CHOICES[0].id);
  assert.equal(avatarFor("dragon").src, "/assets/avatars/dragon.jpg");
  assert.equal(avatarFor("traveling-bard").src, "/assets/avatars/traveling-bard.png");
});
