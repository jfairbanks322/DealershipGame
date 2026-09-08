const assert = require("assert/strict");
const { fork } = require("child_process");
const path = require("path");
const { io } = require("socket.io-client");
const topics = require("../topics");
const topicAnswerPools = require("../topic-answer-pools");
const {
  getPoolSizes,
  getTopicPoolStats,
  normalizeAnswer,
  normalizedWords,
  pickLocalFakes
} = require("../fake-answer-service");

const PORT = 3042;
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
  const answerSystem = verifyAnswerSystem();
  await waitForServer();
  const one = connect();
  const two = connect();
  await Promise.all([once(one, "connect"), once(two, "connect")]);

  const oneSessionPromise = once(one, "sessionEstablished");
  one.emit("createRoom", { name: "Josh", tone: "silly" });
  const oneSession = await oneSessionPromise;
  const roomCode = oneSession.roomCode;
  const createdState = await waitState(one, (state) => state.status === "WAITING_FOR_PLAYER");
  assert.equal(createdState.tone?.id, "silly");

  const twoSessionPromise = once(two, "sessionEstablished");
  two.emit("joinRoom", { name: "Casandra", roomCode });
  const twoSession = await twoSessionPromise;
  await Promise.all([
    waitState(one, (state) => state.status === "READY" && state.players.length === 2),
    waitState(two, (state) => state.status === "READY" && state.players.length === 2)
  ]);

  const intruder = connect();
  await once(intruder, "connect");
  const fullError = once(intruder, "gameError");
  intruder.emit("joinRoom", { name: "Third", roomCode });
  assert.match((await fullError).message, /already has two/i);
  intruder.disconnect();

  one.emit("setReady");
  two.emit("setReady");
  await Promise.all([
    waitState(one, (state) => state.players.every((player) => player.ready)),
    waitState(two, (state) => state.players.every((player) => player.ready))
  ]);
  one.emit("startGame");
  let oneState = await waitState(one, (state) => state.status === "ANSWERING" && state.answerPhase?.currentTopic);
  let twoState = await waitState(two, (state) => state.status === "ANSWERING" && state.answerPhase?.currentTopic);
  assert.notEqual(oneState.answerPhase.currentTopic.id, twoState.answerPhase.currentTopic.id, "players should start with different topics");
  assert.equal(oneState.answerPhase.currentTopic.category, "random");
  assert.equal(twoState.answerPhase.currentTopic.category, "random");

  const firstTopic = oneState.answerPhase.currentTopic.id;
  const invalidError = once(one, "gameError");
  one.emit("submitAnswer", { answer: "This has four whole words" });
  assert.match((await invalidError).message, /Exactly three words/);
  assert.equal(states.get(one).answerPhase.currentTopic.id, firstTopic, "invalid answer must preserve the current topic");

  const passedTopic = twoState.answerPhase.currentTopic.id;
  two.emit("passTopic");
  twoState = await waitState(two, (state) => state.answerPhase?.currentTopic?.id !== passedTopic);
  assert.equal(twoState.self.answerProgress, 0, "passing should not increment progress");
  assert.equal(twoState.answerPhase.currentTopic.category, "random", "replacement topics should preserve the selected tone");

  const oneTopics = [];
  const twoTopics = [];
  const oneAnswers = Array.from({ length: 10 }, (_, index) => index === 0 ? "Alpha answer zero" : `Alpha answer ${index}`);
  const twoAnswers = Array.from({ length: 10 }, (_, index) => index === 0 ? "I'm easy-going honestly" : `Bravo answer ${index}`);
  const oneSubmissions = [...oneAnswers];
  const twoSubmissions = [...twoAnswers];
  oneSubmissions[0] = "  ALPHA, ANSWER, ZERO!!! ";
  twoSubmissions[0] = "I’M easy‑going, honestly!!!";

  for (let index = 0; index < 10; index += 1) {
    oneState = states.get(one);
    oneTopics.push(oneState.answerPhase.currentTopic.id);
    one.emit("submitAnswer", { answer: oneSubmissions[index] });
    await waitState(one, (state) => state.self.answerProgress === index + 1);
  }
  assert.equal(oneTopics.every((id) => id.startsWith("random-")), true, "silly games should only use playful random topics");
  oneState = states.get(one);
  assert.equal(oneState.self.finishedAnswerPhase, true);
  assert.equal(oneState.status, "ANSWERING", "first finisher should wait without advancing the other player");
  assert.equal(JSON.stringify(oneState).includes("Bravo answer"), false, "opponent answers must stay private during phase one");

  for (let index = 0; index < 10; index += 1) {
    twoState = states.get(two);
    twoTopics.push(twoState.answerPhase.currentTopic.id);
    two.emit("submitAnswer", { answer: twoSubmissions[index] });
    await waitState(two, (state) => state.self.answerProgress === index + 1);
  }
  assert.equal(twoTopics.every((id) => id.startsWith("random-")), true, "silly games should only use playful random topics");

  await Promise.all([
    waitState(one, (state) => state.status === "GUESSING" && !state.self.guessStarted),
    waitState(two, (state) => state.status === "GUESSING" && !state.self.guessStarted)
  ]);
  one.emit("startGuessing");
  two.emit("startGuessing");
  await Promise.all([
    waitState(one, (state) => state.guessPhase?.current?.options?.length === 3),
    waitState(two, (state) => state.guessPhase?.current?.options?.length === 3)
  ]);

  for (let index = 0; index < 10; index += 1) {
    oneState = states.get(one);
    const oneOptions = oneState.guessPhase.current.options;
    assert.equal(oneOptions.some((option) => Object.hasOwn(option, "correct")), false, "guess options must not identify the real answer");
    assert.equal(oneOptions.every((option) => option.text === normalizeAnswer(option.text)), true, "all options should share normalized formatting");
    if (index < 9) assert.equal(JSON.stringify(oneState).includes(twoAnswers[index + 1]), false, "future answers must not be preloaded");
    const oneReal = oneOptions.find((option) => option.text === twoAnswers[index]);
    assert.ok(oneReal, "the current real answer should be one of three anonymous options");
    one.emit("lockGuess", { optionId: oneReal.id });
    oneState = await waitState(one, (state) => state.guessPhase?.reveal?.realAnswer === twoAnswers[index]);
    assert.equal(oneState.guessPhase.reveal.correct, true);
    one.emit("nextGuess");
    await waitState(one, (state) => index === 9
      ? state.self.finishedGuessPhase
      : state.guessPhase?.current?.topicText && !state.guessPhase.reveal && state.self.guessProgress === index + 1);

    twoState = states.get(two);
    const twoReal = twoState.guessPhase.current.options.find((option) => option.text === oneAnswers[index]);
    assert.ok(twoReal);
    two.emit("lockGuess", { optionId: twoReal.id });
    await waitState(two, (state) => state.guessPhase?.reveal?.realAnswer === oneAnswers[index]);
    two.emit("nextGuess");
    await waitState(two, (state) => index === 9
      ? state.self.finishedGuessPhase
      : state.guessPhase?.current?.topicText && !state.guessPhase.reveal && state.self.guessProgress === index + 1);
  }

  const [oneResults, twoResults] = await Promise.all([
    waitState(one, (state) => state.status === "RESULTS"),
    waitState(two, (state) => state.status === "RESULTS")
  ]);
  assert.equal(oneResults.results.scores.every((result) => result.score === 10), true);
  assert.equal(twoResults.results.scores.length, 2);

  const reviewPromise = once(one, "reviewData");
  one.emit("requestReview");
  const review = await reviewPromise;
  assert.equal(review.length, 2);
  assert.equal(review.every((column) => column.entries.length === 10), true);

  one.disconnect();
  const restored = connect();
  await once(restored, "connect");
  const restoredSessionPromise = once(restored, "sessionEstablished");
  restored.emit("restoreSession", { sessionToken: oneSession.sessionToken });
  assert.equal((await restoredSessionPromise).playerId, oneSession.playerId);
  await waitState(restored, (state) => state.status === "RESULTS" && state.self.score === 10);

  restored.emit("requestRematch", { mode: "playAgain" });
  two.emit("requestRematch", { mode: "newTopics" });
  const [rematchOne, rematchTwo] = await Promise.all([
    waitState(restored, (state) => state.status === "ANSWERING" && state.gameNumber === 2),
    waitState(two, (state) => state.status === "ANSWERING" && state.gameNumber === 2)
  ]);
  const newTopicIds = [rematchOne.answerPhase.currentTopic.id, rematchTwo.answerPhase.currentTopic.id];
  assert.equal(newTopicIds.some((id) => oneTopics.includes(id) || twoTopics.includes(id)), false, "rematch should avoid immediately previous topics");
  assert.equal(newTopicIds.every((id) => id.startsWith("random-")), true, "rematches should preserve the room tone");
  assert.equal(twoSession.roomCode, roomCode);

  console.log(JSON.stringify({
    passed: true,
    roomCode,
    scores: oneResults.results.scores.map(({ name, score }) => ({ name, score })),
    privacy: "phase-one and future answers withheld",
    reconnect: "restored",
    rematch: "new topics assigned",
    topicTone: "silly topics preserved through passes and rematch",
    answerNormalization: "punctuation, case, apostrophes, and hyphens standardized",
    fallbackAnswerPools: answerSystem.poolSizes,
    topicSpecificAnswerPools: answerSystem.topicPoolStats,
    uniqueFallbackAnswersObserved: answerSystem.uniqueAnswers
  }, null, 2));
}

function verifyAnswerSystem() {
  assert.equal(normalizeAnswer("fun, LOUD, chaotic!!!"), "Fun loud chaotic");
  assert.equal(normalizeAnswer("I’M easy‑going, honestly."), "I'm easy-going honestly");
  assert.equal(normalizeAnswer("  TRUST   comes FIRST  "), "Trust comes first");
  assert.equal(normalizeAnswer("really really very fun"), null);

  const poolSizes = getPoolSizes();
  assert.equal(Object.values(poolSizes).every((size) => size >= 40), true, "every category needs at least 40 valid fallback answers");
  const topicPoolStats = getTopicPoolStats();
  assert.deepEqual(topicPoolStats, { topics: topics.length, answers: topics.length * 3, minimumPerTopic: 3 });
  const uniqueAnswers = new Set();
  for (const topic of topics) {
    const topicalAnswers = (topicAnswerPools[topic.text] || []).map(normalizeAnswer).filter(Boolean);
    assert.equal(topicalAnswers.length, 3, `three topical decoys required for ${topic.text}`);
    const fakes = pickLocalFakes(topic, "Scary but beautiful");
    assert.equal(fakes.length, 2, `two fallback answers required for ${topic.text}`);
    assert.equal(new Set(fakes.map((answer) => answer.toLocaleLowerCase("en-US"))).size, 2, `fallback answers must differ for ${topic.text}`);
    assert.equal(fakes.every((answer) => normalizedWords(answer).length === 3), true, `fallback answers must use three words for ${topic.text}`);
    assert.equal(fakes.every((answer) => answer === normalizeAnswer(answer)), true, `fallback formatting must match for ${topic.text}`);
    assert.equal(fakes.every((answer) => topicalAnswers.includes(answer)), true, `fallback answers must be topic-specific for ${topic.text}`);
    for (const topicalRealAnswer of topicalAnswers) {
      const collisionFakes = pickLocalFakes(topic, topicalRealAnswer);
      assert.equal(collisionFakes.length, 2, `two topical alternatives required when a player matches a decoy for ${topic.text}`);
      assert.equal(collisionFakes.every((answer) => topicalAnswers.includes(answer) && answer !== topicalRealAnswer), true, `decoy collision fallback must stay topical for ${topic.text}`);
    }
    fakes.forEach((answer) => uniqueAnswers.add(answer));
  }
  assert.ok(uniqueAnswers.size >= 150, `fallback selection should be varied; observed ${uniqueAnswers.size} unique answers`);
  return { poolSizes, topicPoolStats, uniqueAnswers: uniqueAnswers.size };
}

function connect() {
  const socket = io(BASE_URL, { transports: ["websocket"], forceNew: true, reconnection: false });
  sockets.push(socket);
  socket.on("roomState", (state) => states.set(socket, state));
  return socket;
}

function waitState(socket, predicate, timeout = 5000) {
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

function once(socket, event, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, listener);
      reject(new Error(`Timed out waiting for ${event}`));
    }, timeout);
    function listener(payload) {
      clearTimeout(timer);
      resolve(payload);
    }
    socket.once(event, listener);
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
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
