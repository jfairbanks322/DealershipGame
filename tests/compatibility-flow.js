const assert = require("assert/strict");
const { fork } = require("child_process");
const path = require("path");
const { io } = require("socket.io-client");

const PORT = 3043;
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
  await waitForServer();
  const one = connect();
  const two = connect();
  await Promise.all([once(one, "connect"), once(two, "connect")]);

  const oneSessionPromise = once(one, "sessionEstablished");
  one.emit("createRoom", { name: "Avery", mode: "compatibility", tone: "relationship" });
  const oneSession = await oneSessionPromise;
  const roomCode = oneSession.roomCode;
  await waitState(one, (state) => state.mode?.id === "compatibility" && state.tone?.id === "relationship" && state.totalQuestions === 20);

  const twoSessionPromise = once(two, "sessionEstablished");
  two.emit("joinRoom", { name: "Jordan", roomCode });
  await twoSessionPromise;
  await Promise.all([
    waitState(one, (state) => state.status === "READY"),
    waitState(two, (state) => state.status === "READY")
  ]);

  one.emit("setReady");
  two.emit("setReady");
  await waitState(one, (state) => state.players.every((player) => player.ready));
  one.emit("startGame");
  await Promise.all([
    waitState(one, (state) => state.status === "ANSWERING"),
    waitState(two, (state) => state.status === "ANSWERING")
  ]);

  const oneAnswers = [];
  const twoAnswers = [];
  const sharedTopicIds = [];
  const answerPairs = [
    ["Absolutely love this", "Absolutely love this"],
    ["Honestly pretty wonderful", "Really great experience"],
    ["Hard pass forever", "Absolutely not happening"],
    ["Maybe sometimes complicated", "Never really enjoyable"]
  ];

  for (let index = 0; index < 20; index += 1) {
    const oneState = states.get(one);
    const twoState = states.get(two);
    assert.equal(oneState.answerPhase.total, 20);
    assert.equal(twoState.answerPhase.currentTopic.id, oneState.answerPhase.currentTopic.id, "compatibility players should answer the same prompts");
    assert.equal(oneState.answerPhase.currentTopic.category, "relationships", "relationship tone should stay relationship-only");
    sharedTopicIds.push(oneState.answerPhase.currentTopic.id);
    const [oneAnswer, twoAnswer] = answerPairs[index % answerPairs.length];
    oneAnswers.push(oneAnswer);
    twoAnswers.push(twoAnswer);
    one.emit("submitAnswer", { answer: oneAnswer });
    two.emit("submitAnswer", { answer: twoAnswer });
    await Promise.all([
      waitState(one, (state) => state.self.answerProgress === index + 1),
      waitState(two, (state) => state.self.answerProgress === index + 1)
    ]);
  }
  assert.equal(new Set(sharedTopicIds).size, 20);

  await Promise.all([
    waitState(one, (state) => state.status === "GUESSING"),
    waitState(two, (state) => state.status === "GUESSING")
  ]);
  one.emit("startGuessing");
  two.emit("startGuessing");
  await Promise.all([
    waitState(one, (state) => state.guessPhase?.current?.options?.length === 3),
    waitState(two, (state) => state.guessPhase?.current?.options?.length === 3)
  ]);

  for (let index = 0; index < 20; index += 1) {
    let oneState = states.get(one);
    let twoState = states.get(two);
    assert.equal(oneState.guessPhase.total, 20);
    const oneSelection = oneState.guessPhase.current.options.find((option) => option.text === twoAnswers[index]);
    const twoCorrect = twoState.guessPhase.current.options.find((option) => option.text === oneAnswers[index]);
    const twoWrong = twoState.guessPhase.current.options.find((option) => option.text !== oneAnswers[index]);
    assert.ok(oneSelection && twoCorrect && twoWrong);

    one.emit("lockGuess", { optionId: oneSelection.id });
    two.emit("lockGuess", { optionId: (index % 2 === 0 ? twoCorrect : twoWrong).id });
    await Promise.all([
      waitState(one, (state) => Boolean(state.guessPhase?.reveal)),
      waitState(two, (state) => Boolean(state.guessPhase?.reveal))
    ]);
    one.emit("nextGuess");
    two.emit("nextGuess");
    await Promise.all([
      waitState(one, (state) => index === 19 ? state.self.finishedGuessPhase : state.self.guessProgress === index + 1 && !state.guessPhase?.reveal),
      waitState(two, (state) => index === 19 ? state.self.finishedGuessPhase : state.self.guessProgress === index + 1 && !state.guessPhase?.reveal)
    ]);
  }

  const [oneResults, twoResults] = await Promise.all([
    waitState(one, (state) => state.status === "RESULTS"),
    waitState(two, (state) => state.status === "RESULTS")
  ]);
  const report = oneResults.results.compatibility;
  assert.ok(report, "compatibility mode should produce a report");
  assert.equal(oneResults.results.total, 20);
  assert.deepEqual(oneResults.results.scores.map((score) => score.score), [20, 10]);
  assert.equal(report.sharedQuestionCount, 20);
  assert.equal(report.categories.length, 1);
  assert.equal(report.categories[0].label, "Relationship rhythm");
  assert.equal(report.categories.reduce((sum, category) => sum + category.questionCount, 0), 20);
  assert.equal(report.mutualKnowledge, 75);
  assert.ok(report.answerAlignment >= 0 && report.answerAlignment <= 100);
  assert.ok(report.overall >= 0 && report.overall <= 100);
  assert.equal(report.highlights.length, 4);
  assert.deepEqual(twoResults.results.compatibility, report);

  const reviewPromise = once(one, "reviewData");
  one.emit("requestReview");
  const review = await reviewPromise;
  assert.equal(review.every((column) => column.entries.length === 20), true);

  console.log(JSON.stringify({
    passed: true,
    roomCode,
    mode: oneResults.mode,
    scores: oneResults.results.scores.map(({ name, score }) => ({ name, score })),
    report: {
      overall: report.overall,
      tier: report.tier,
      answerAlignment: report.answerAlignment,
      mutualKnowledge: report.mutualKnowledge,
      balance: report.balance,
      categories: report.categories.map(({ label, score, questionCount }) => ({ label, score, questionCount }))
    }
  }, null, 2));
}

function connect() {
  const socket = io(BASE_URL, { transports: ["websocket"], forceNew: true, reconnection: false });
  sockets.push(socket);
  socket.on("roomState", (state) => states.set(socket, state));
  return socket;
}

function waitState(socket, predicate, timeout = 8000) {
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

function once(socket, event, timeout = 8000) {
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
