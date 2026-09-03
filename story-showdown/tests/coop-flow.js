const assert = require("node:assert/strict");
const path = require("node:path");
const os = require("node:os");
const { io: Client } = require("socket.io-client");

process.env.STORY_SHOWDOWN_DATA_FILE = path.join(os.tmpdir(), `story-showdown-coop-${process.pid}.json`);
const { server, COOP_SECTIONS, AVATAR_CHOICES } = require("../server");

const latest = new WeakMap();
const clients = [];

function connect(url) {
  return new Promise((resolve, reject) => {
    const socket = Client(url, { transports: ["websocket"], reconnection: false, forceNew: true });
    clients.push(socket);
    socket.on("state", (state) => latest.set(socket, state));
    socket.once("connect", () => resolve(socket));
    socket.once("connect_error", reject);
  });
}

function action(socket, event, payload = {}) {
  return new Promise((resolve, reject) => {
    socket.timeout(3000).emit(event, payload, (error, response) => {
      if (error) return reject(error);
      if (!response?.ok) return reject(new Error(response?.error || `${event} failed`));
      resolve(response);
    });
  });
}

function rejected(socket, event, payload, pattern) {
  return new Promise((resolve, reject) => {
    socket.timeout(3000).emit(event, payload, (error, response) => {
      if (error) return reject(error);
      try {
        assert.equal(response.ok, false);
        assert.match(response.error, pattern);
        resolve();
      } catch (assertion) { reject(assertion); }
    });
  });
}

function waitFor(socket, predicate, label, timeout = 3500) {
  const current = latest.get(socket);
  if (current && predicate(current)) return Promise.resolve(current);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off("state", listener);
      reject(new Error(`Timed out waiting for ${label}`));
    }, timeout);
    const listener = (state) => {
      latest.set(socket, state);
      if (!predicate(state)) return;
      clearTimeout(timer);
      socket.off("state", listener);
      resolve(state);
    };
    socket.on("state", listener);
  });
}

function teacherAction(teacher, auth, event, payload = {}) {
  return action(teacher, event, { ...auth, ...payload });
}

function answersFor(writerIndex) {
  const variants = [
    {
      character: "a cautious inventor who can hear when machines are lying",
      setting: "the trophy cases whisper tomorrow's date whenever someone walks past",
      goal: "trace the impossible announcements to their source before the next bell",
      "comic-action": "the school mascot steals the map and escapes on a rolling chair",
      complication: "every attempt to unplug the speaker makes two more speakers appear",
      reaction: "form three committees and immediately disagree about which hallway is safest",
      choice: "broadcast an honest confession and wait for the building to answer",
      ending: "the final bell plays backward as every locked door quietly opens"
    },
    {
      character: "an overconfident detective who is secretly afraid of intercoms",
      setting: "the ceiling lights blink in the exact rhythm of the mysterious announcements",
      goal: "decode the final prediction before the empty school fills with people",
      "comic-action": "a runaway floor polisher chases the principal through the only useful clue",
      complication: "the predicted events begin happening faster than anyone can write them down",
      reaction: "gather in the cafeteria and build an enormous shield out of lunch trays",
      choice: "read the unfinished final announcement aloud and change its last word",
      ending: "one harmless paper airplane glides from the silent speaker onto Rowan's desk"
    },
    {
      character: "a patient puzzle-solver who remembers every sound they have ever heard",
      setting: "each classroom clock points toward the office instead of showing the time",
      goal: "reach the office and stop the prediction that mentions their own name",
      "comic-action": "the marching-band uniforms inflate like balloons and block the main stairs",
      complication: "the intercom starts repeating private thoughts in the principal's voice",
      reaction: "run in a perfectly organized circle while shouting completely useless directions",
      choice: "invite the mysterious voice to finish the story face to face",
      ending: "the sunrise reflects in the trophy cases while the intercom says thank you"
    }
  ];
  return { ...variants[writerIndex % variants.length] };
}

async function main() {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}`;

  const customTeacher = await connect(url);
  await rejected(customTeacher, "game:create", { settings: { gameMode: "cooperative", coopTopicId: "custom", coopCustomTopic: "" } }, /enter a custom broad topic/i);
  const customCreated = await action(customTeacher, "game:create", { settings: { gameMode: "cooperative", coopFrameId: "midnight-museum", coopTopicId: "custom", coopCustomTopic: "  Who gets to own history?  " } });
  const customAuth = { code: customCreated.code, teacherToken: customCreated.teacherToken };
  for (const [index, name] of ["Drew", "Emery"].entries()) {
    const writer = await connect(url);
    await action(writer, "student:join", { code: customCreated.code, name, avatarId: AVATAR_CHOICES[index].id });
  }
  await teacherAction(customTeacher, customAuth, "teacher:start-game");
  const customState = await waitFor(customTeacher, (state) => state.phase === "coop_writing", "custom-topic writing");
  assert.equal(customState.coop.topic.id, "custom");
  assert.equal(customState.coop.topic.label, "Who gets to own history?");
  assert.equal(customState.coop.topic.category, "Teacher-created");
  assert.ok(customState.coop.sections.every((section) => section.prompt.includes("Who gets to own history?")));

  const teacher = await connect(url);
  const created = await action(teacher, "game:create", { settings: { gameMode: "cooperative", coopFrameId: "last-bell", coopTopicId: "friendship", teamCount: 7 } });
  const auth = { code: created.code, teacherToken: created.teacherToken };
  latest.set(teacher, created.state);
  assert.equal(created.state.settings.gameMode, "cooperative");

  const players = [];
  const sessions = [];
  for (const [index, name] of ["Avery", "Blake", "Casey"].entries()) {
    const socket = await connect(url);
    const avatarId = AVATAR_CHOICES[index].id;
    const joined = await action(socket, "student:join", { code: created.code, name, avatarId });
    latest.set(socket, joined.state);
    players.push(socket);
    sessions.push({ code: created.code, name, avatarId, sessionToken: joined.sessionToken });
  }
  await waitFor(teacher, (state) => state.playerCount === 3, "three cooperative writers");

  await teacherAction(teacher, auth, "teacher:start-game", { settings: { gameMode: "cooperative", coopFrameId: "last-bell", coopTopicId: "friendship", teamCount: 7 } });
  let teacherState = await waitFor(teacher, (state) => state.phase === "coop_writing", "cooperative writing");
  assert.equal(teacherState.coop.durationSeconds, 300);
  assert.equal(teacherState.coop.sectionCount, 8);
  assert.equal(teacherState.coop.structureVersion, 3);
  assert.equal(teacherState.coop.frame.id, "last-bell");
  assert.equal(teacherState.coop.frame.hero, "Rowan");
  assert.equal(teacherState.coop.topic.id, "friendship");
  assert.equal(teacherState.coop.topic.label, "Friendship");
  assert.ok(teacherState.coop.sections.every((section) => section.prompt.includes("Friendship")));
  assert.ok(teacherState.coop.sections.every((section) => section.stem && !/[{}]/.test(`${section.prompt}${section.stem}`)));
  assert.ok(teacherState.players.every((player) => player.teamId === null));

  await teacherAction(teacher, auth, "teacher:coop-pause-timer");
  teacherState = await waitFor(teacher, (state) => state.coop.pausedRemainingMs !== null, "paused cooperative timer");
  const pausedAt = teacherState.coop.pausedRemainingMs;
  await teacherAction(teacher, auth, "teacher:coop-add-time", { seconds: 30 });
  teacherState = await waitFor(teacher, (state) => state.coop.pausedRemainingMs >= pausedAt + 29_000, "added cooperative time");
  await teacherAction(teacher, auth, "teacher:coop-resume-timer");

  const reconnectDraft = answersFor(2);
  reconnectDraft.ending = "";
  await action(players[2], "student:coop-draft", { answers: reconnectDraft });
  players[2].disconnect();
  const rejoined = await connect(url);
  const rejoinResponse = await action(rejoined, "student:join", sessions[2]);
  latest.set(rejoined, rejoinResponse.state);
  assert.equal(rejoinResponse.state.coop.myDraft.character, reconnectDraft.character);
  assert.equal(rejoinResponse.state.coop.myDraft.ending, "");
  players[2] = rejoined;

  await rejected(players[0], "student:coop-submit", { answers: { character: "Only one answer" } }, /complete every story ingredient/i);
  await action(players[0], "student:coop-submit", { answers: answersFor(0) });
  await action(players[1], "student:coop-submit", { answers: answersFor(1) });
  await waitFor(teacher, (state) => state.coop.submissionCount === 2, "two submitted writers");
  await teacherAction(teacher, auth, "teacher:coop-end-writing");
  teacherState = await waitFor(teacher, (state) => state.phase === "coop_spin", "Story Machine");
  assert.equal(teacherState.coop.submissionCount, 3, "unfinished saved drafts should auto-submit");
  assert.equal(teacherState.coop.candidatesBySection.character.length, 3);
  assert.equal(teacherState.coop.candidatesBySection.ending.length, 2);
  const studentSpin = await waitFor(players[0], (state) => state.phase === "coop_spin", "private student spin view");
  assert.equal(Object.hasOwn(studentSpin.coop, "candidatesBySection"), false);
  await rejected(teacher, "teacher:coop-spin", { ...auth, sectionId: COOP_SECTIONS[1].id }, /in order/i);

  for (let index = 0; index < COOP_SECTIONS.length; index += 1) {
    const section = COOP_SECTIONS[index];
    const response = await teacherAction(teacher, auth, "teacher:coop-spin", { sectionId: section.id });
    assert.equal(response.selection.sectionId, section.id);
    assert.match(response.selection.text, /^[A-Z].*[.!?]$/);
    teacherState = await waitFor(teacher, (state) => state.coop.selections.length === index + 1, `spin ${index + 1}`);
  }
  const expectedPrefixes = [
    "Rowan is ",
    "Inside a nearly empty school after the final bell, ",
    "Rowan wants to ",
    "The first sign that things are going wrong is when ",
    "The situation becomes more difficult because ",
    "Meanwhile, the people nearby ",
    "With no easy option left, Rowan decides to ",
    "In the end, "
  ];
  teacherState.coop.selections.forEach((selection, index) => assert.ok(selection.text.startsWith(expectedPrefixes[index]), `${selection.sectionId} should use its locked sentence stem`));
  assert.equal(teacherState.coop.complete, true);
  assert.equal(teacherState.coop.storyParts.length, 8);
  const previousCharacterId = teacherState.coop.selections[0].id;
  await teacherAction(teacher, auth, "teacher:coop-spin", { sectionId: COOP_SECTIONS[0].id });
  teacherState = await waitFor(teacher, (state) => state.coop.selections[0].id !== previousCharacterId, "character re-spin");
  assert.equal(teacherState.coop.selections.length, 8);

  await teacherAction(teacher, auth, "teacher:coop-finish");
  teacherState = await waitFor(teacher, (state) => state.phase === "coop_final", "cooperative finale");
  assert.equal(teacherState.coop.storyParts.length, COOP_SECTIONS.length);
  assert.equal(teacherState.coop.storyText.split("\n\n").length, COOP_SECTIONS.length + 1);
  assert.ok(teacherState.coop.storyText.startsWith(teacherState.coop.frame.opening));
  for (const section of COOP_SECTIONS) assert.match(teacherState.coop.storyText, new RegExp(section.bridge));

  console.log(JSON.stringify({
    ok: true,
    mode: teacherState.settings.gameMode,
    writers: teacherState.playerCount,
    prompts: COOP_SECTIONS.length,
    timer: "pause, add time, resume",
    persistence: "draft restored after reconnect",
    privacy: "candidate pool hidden from students",
    storyMachine: "100 topics or a custom topic, shared recipe, locked stems, ordered spins, re-spin, sentence polish, and transitions"
  }, null, 2));
}

main().then(() => {
  clients.forEach((client) => client.disconnect());
  server.close(() => process.exit(0));
}).catch((error) => {
  console.error(error.stack || error);
  clients.forEach((client) => client.disconnect());
  server.close(() => process.exit(1));
});
