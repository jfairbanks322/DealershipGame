const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { prompts, categories } = require("../prompts");
const { AVATAR_CHOICES, normalizeAvatarId, avatarFor } = require("../public/avatars");
const {
  COOP_STORY_FRAMES, COOP_TOPIC_GROUPS, COOP_TOPICS, COOP_SECTIONS, coopFrameById, coopTopicById, coopSectionsForFrame,
  normalizeCoopSentence, formatCoopAnswer, buildCoopStory, coopStoryText
} = require("../public/coop");

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

test("cooperative prompts create a polished, connected eight-part story", () => {
  assert.equal(COOP_STORY_FRAMES.length, 6);
  assert.equal(new Set(COOP_STORY_FRAMES.map((frame) => frame.id)).size, COOP_STORY_FRAMES.length);
  assert.ok(COOP_STORY_FRAMES.every((frame) => frame.title && frame.genre && frame.tone && frame.hero && frame.setting && frame.problem && frame.opening));
  assert.equal(COOP_TOPIC_GROUPS.length, 10);
  assert.ok(COOP_TOPIC_GROUPS.every((group) => group.category && group.topics.length === 10));
  assert.equal(COOP_TOPICS.length, 100);
  assert.equal(new Set(COOP_TOPICS.map((topic) => topic.id)).size, 100);
  assert.equal(new Set(COOP_TOPICS.map((topic) => topic.label)).size, 100);
  assert.ok(COOP_TOPICS.every((topic) => topic.id && topic.label && topic.category));
  assert.equal(COOP_SECTIONS.length, 8);
  assert.equal(new Set(COOP_SECTIONS.map((section) => section.id)).size, 8);
  assert.ok(COOP_SECTIONS.every((section) => section.prompt && section.stem && section.guidance && section.placeholder && section.bridge && section.fallback));
  assert.ok(COOP_SECTIONS.some((section) => /make someone laugh/i.test(section.prompt)));
  assert.ok(COOP_SECTIONS.some((section) => /nearby group/i.test(section.prompt)));
  assert.equal(normalizeCoopSentence("  a tiny dragon sneezes glitter  "), "A tiny dragon sneezes glitter.");
  assert.equal(normalizeCoopSentence("already finished!"), "Already finished!");

  const frame = coopFrameById("last-bell");
  const topic = coopTopicById("friendship");
  const framedSections = coopSectionsForFrame(frame, topic);
  assert.ok(framedSections.every((section) => !/[{}]/.test(`${section.prompt}${section.stem}`)));
  assert.ok(framedSections.every((section) => section.prompt.includes("Friendship")));
  assert.equal(formatCoopAnswer("character", "A cautious inventor who can hear lies", frame, topic), "Rowan is a cautious inventor who can hear lies.");
  assert.equal(formatCoopAnswer("goal", "Rowan wants to stop the messages!", frame, topic), "Rowan wants to stop the messages!");
  assert.equal(formatCoopAnswer("setting", "The lights flicker whenever someone lies", frame, topic), "Inside a nearly empty school after the final bell, the lights flicker whenever someone lies.");

  const selections = COOP_SECTIONS.map((section, index) => ({
    sectionId: section.id,
    text: formatCoopAnswer(section.id, `class idea number ${index + 1}`, frame, topic),
    studentName: `Writer ${index + 1}`
  }));
  const story = buildCoopStory(selections);
  assert.equal(story.length, 8);
  assert.deepEqual(story.map((part) => part.sectionId), COOP_SECTIONS.map((section) => section.id));
  assert.ok(story.every((part) => /^[A-Z]/.test(part.text) && /[.!?]$/.test(part.text)));
  assert.equal(coopStoryText(selections, frame).split("\n\n").length, 9);
  assert.ok(coopStoryText(selections, frame).startsWith(frame.opening));
  assert.match(coopStoryText(selections, frame), new RegExp(COOP_SECTIONS[0].bridge));
});

test("student game screens always expose a saved-session exit", () => {
  const studentClient = fs.readFileSync(path.join(__dirname, "..", "public", "student.js"), "utf8");
  assert.match(studentClient, /data-action="leave-game"/);
  assert.match(studentClient, /localStorage\.removeItem\(`storyShowdownStudent:\$\{previousSession\.code\}`\)/);
  assert.match(studentClient, /history\.replaceState\(null, "", "\/student\.html"\)/);
  assert.match(studentClient, /socket\.disconnect\(\);\s*socket\.connect\(\);/);
});
