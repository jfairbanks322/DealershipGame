const assert = require("assert/strict");
const { fork } = require("child_process");
const path = require("path");
const { io } = require("socket.io-client");
const questions = require("../would-you-rather");

const PORT = 3044;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const serverProcess = fork(path.join(__dirname, "..", "server.js"), [], {
  cwd: path.join(__dirname, ".."),
  env: { ...process.env, HOST: "127.0.0.1", PORT: String(PORT) },
  stdio: ["ignore", "pipe", "pipe", "ipc"]
});

let serverErrorOutput = "";
serverProcess.stderr.on("data", (chunk) => { serverErrorOutput += chunk.toString(); });

const sockets = [];
const states = new WeakMap();

async function main() {
  verifyQuestionBank();
  await waitForServer();

  for (const count of [10, 20, 30]) {
    const setupCheck = connect();
    await once(setupCheck, "connect");
    const setupSession = once(setupCheck, "sessionEstablished");
    setupCheck.emit("createRoom", { name: `${count} Check`, mode: "would-you-rather", questionCount: count });
    await setupSession;
    const setupState = await waitState(setupCheck, (state) => state.status === "WAITING_FOR_PLAYER");
    assert.equal(setupState.totalQuestions, count, `${count}-question setup should be accepted`);
    setupCheck.disconnect();
  }

  const invalid = connect();
  await once(invalid, "connect");
  const invalidSession = once(invalid, "sessionEstablished");
  invalid.emit("createRoom", { name: "Default Check", mode: "would-you-rather", questionCount: 17 });
  await invalidSession;
  const invalidState = await waitState(invalid, (state) => state.status === "WAITING_FOR_PLAYER");
  assert.equal(invalidState.totalQuestions, 20, "unsupported lengths should safely default to 20");
  invalid.disconnect();

  const one = connect();
  const two = connect();
  await Promise.all([once(one, "connect"), once(two, "connect")]);
  const oneSessionPromise = once(one, "sessionEstablished");
  one.emit("createRoom", { name: "Avery", mode: "would-you-rather", questionCount: 50 });
  const oneSession = await oneSessionPromise;
  const roomCode = oneSession.roomCode;
  const created = await waitState(one, (state) => state.mode?.id === "would-you-rather" && state.totalQuestions === 50);
  assert.equal(created.mode.choiceGame, true);

  const twoSessionPromise = once(two, "sessionEstablished");
  two.emit("joinRoom", { name: "Jordan", roomCode });
  await twoSessionPromise;
  await waitState(one, (state) => state.status === "READY");
  one.emit("setReady");
  two.emit("setReady");
  await waitState(one, (state) => state.players.every((player) => player.ready));
  one.emit("startGame");
  await Promise.all([
    waitState(one, (state) => state.status === "CHOOSING" && state.choicePhase?.current),
    waitState(two, (state) => state.status === "CHOOSING" && state.choicePhase?.current)
  ]);

  const seenQuestionIds = [];
  for (let index = 0; index < 49; index += 1) {
    const oneState = states.get(one);
    const twoState = states.get(two);
    assert.equal(oneState.choicePhase.current.id, twoState.choicePhase.current.id, "both players should receive the same question order");
    assert.equal(oneState.choicePhase.current.options.length, 4, "every question should present four options");
    assert.equal(Object.hasOwn(oneState.opponent, "preferences"), false, "partner picks must remain private during play");
    assert.equal(oneState.results, undefined, "results must remain locked while either player is choosing");
    seenQuestionIds.push(oneState.choicePhase.current.id);

    const firstOption = oneState.choicePhase.current.options[index % 4];
    const secondOption = index % 2 === 0
      ? twoState.choicePhase.current.options[index % 4]
      : twoState.choicePhase.current.options[(index + 1) % 4];
    one.emit("submitPreference", { questionId: oneState.choicePhase.current.id, optionId: firstOption.id });
    two.emit("submitPreference", { questionId: twoState.choicePhase.current.id, optionId: secondOption.id });
    await Promise.all([
      waitState(one, (state) => state.self.choiceProgress === index + 1),
      waitState(two, (state) => state.self.choiceProgress === index + 1)
    ]);
  }

  const oneLastState = states.get(one);
  const twoLastState = states.get(two);
  seenQuestionIds.push(oneLastState.choicePhase.current.id);
  const oneLastOption = oneLastState.choicePhase.current.options[1];
  const twoLastOption = twoLastState.choicePhase.current.options[2];
  one.emit("submitPreference", { questionId: oneLastState.choicePhase.current.id, optionId: oneLastOption.id });
  const firstFinished = await waitState(one, (state) => state.self.finishedPreferencePhase);
  assert.equal(firstFinished.status, "CHOOSING", "the first finisher should wait without revealing results");
  assert.equal(firstFinished.results, undefined);

  two.emit("submitPreference", { questionId: twoLastState.choicePhase.current.id, optionId: twoLastOption.id });
  const [oneResults, twoResults] = await Promise.all([
    waitState(one, (state) => state.status === "RESULTS"),
    waitState(two, (state) => state.status === "RESULTS")
  ]);
  assert.equal(new Set(seenQuestionIds).size, 50, "a 50-question game should not repeat questions");

  const report = oneResults.results.wouldYouRather;
  assert.ok(report, "Would You Rather should produce its own report");
  assert.equal(report.totalQuestions, 50);
  assert.equal(report.matchCount, 25);
  assert.equal(report.differenceCount, 25);
  assert.equal(report.matchPercent, 50);
  assert.equal(report.categories.length, 5);
  assert.equal(report.categories.every((category) => category.questionCount === 10), true, "50 questions should balance evenly across five categories");
  assert.equal(report.categories.reduce((sum, category) => sum + category.entries.length, 0), 50);
  assert.equal(report.highlights.length, 3);
  assert.deepEqual(twoResults.results.wouldYouRather, report);

  one.emit("requestRematch", { mode: "newTopics" });
  two.emit("requestRematch", { mode: "newTopics" });
  const [oneRematch, twoRematch] = await Promise.all([
    waitState(one, (state) => state.status === "CHOOSING" && state.gameNumber === 2),
    waitState(two, (state) => state.status === "CHOOSING" && state.gameNumber === 2)
  ]);
  assert.equal(oneRematch.totalQuestions, 50, "rematches should preserve the selected length");
  assert.equal(oneRematch.choicePhase.current.id, twoRematch.choicePhase.current.id);

  console.log(JSON.stringify({
    passed: true,
    roomCode,
    questionBank: questions.length,
    supportedLengths: [10, 20, 30, 50],
    privacy: "partner choices hidden until both players finish",
    report: {
      matches: report.matchCount,
      differences: report.differenceCount,
      matchPercent: report.matchPercent,
      categories: report.categories.map(({ label, score, questionCount }) => ({ label, score, questionCount }))
    },
    rematch: "50-question length preserved"
  }, null, 2));
}

function verifyQuestionBank() {
  assert.equal(questions.length, 60, "the question bank should include 60 choices");
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);
  assert.equal(questions.every((question) => question.options.length === 4), true);
  assert.equal(questions.every((question) => new Set(question.options.map((option) => option.id)).size === 4), true);
  assert.equal(questions.every((question) => new Set(question.options.map((option) => option.text)).size === 4), true);
}

function connect() {
  const socket = io(BASE_URL, { transports: ["websocket"], forceNew: true, reconnection: false });
  sockets.push(socket);
  socket.on("roomState", (state) => states.set(socket, state));
  return socket;
}

function waitState(socket, predicate, timeout = 10000) {
  const current = states.get(socket);
  if (current && predicate(current)) return Promise.resolve(current);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off("roomState", listener);
      reject(new Error(`Timed out waiting for room state. Last state: ${JSON.stringify(states.get(socket))}`));
    }, timeout);
    function listener(next) {
      if (!predicate(next)) return;
      clearTimeout(timer);
      socket.off("roomState", listener);
      resolve(next);
    }
    socket.on("roomState", listener);
  });
}

function once(socket, event, timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (event === "connect" && socket.connected) return resolve();
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${event}`)), timeout);
    socket.once(event, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Test server did not start${serverErrorOutput ? `: ${serverErrorOutput.trim()}` : ""}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    for (const socket of sockets) socket.disconnect();
    serverProcess.kill("SIGTERM");
  });
