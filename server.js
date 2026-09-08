const crypto = require("crypto");
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const topics = require("./topics");
const { generateFakeAnswers, normalizeAnswer, normalizedWords } = require("./fake-answer-service");

const PORT = Number(process.env.PORT) || 3040;
const HOST = process.env.HOST || "0.0.0.0";
const ROOM_TTL_MS = 24 * 60 * 60 * 1000;
const GAME_MODES = {
  classic: {
    id: "classic",
    label: "Classic",
    answerCount: 10,
    sharedTopics: false,
    compatibilityReport: false
  },
  compatibility: {
    id: "compatibility",
    label: "Compatibility",
    answerCount: 20,
    sharedTopics: true,
    compatibilityReport: true
  }
};
const DEFAULT_GAME_MODE = GAME_MODES.classic;
const rooms = new Map();
const sessions = new Map();
const topicById = new Map(topics.map((topic) => [topic.id, topic]));

const app = express();
const server = http.createServer(app);
const io = new Server(server, { serveClient: true });

app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_request, response) => {
  response.json({ ok: true, rooms: rooms.size, topics: topics.length });
});

io.on("connection", (socket) => {
  socket.on("createRoom", (payload = {}) => {
    const name = cleanName(payload.name);
    const mode = getGameMode(payload.mode);
    if (!name) return sendError(socket, "Enter a display name first.");

    detachCurrentPlayer(socket);
    const roomCode = createRoomCode();
    const room = {
      roomCode,
      status: "WAITING_FOR_PLAYER",
      hostPlayerId: null,
      players: [],
      modeId: mode.id,
      answerTarget: mode.answerCount,
      gameNumber: 0,
      usedTopicIds: new Set(),
      previousTopicIds: new Set(),
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    const player = createPlayer(name, 1, socket.id);
    room.hostPlayerId = player.id;
    room.players.push(player);
    rooms.set(roomCode, room);
    attachSession(socket, room, player);
    emitRoomState(room);
  });

  socket.on("joinRoom", (payload = {}) => {
    const roomCode = String(payload.roomCode || "").trim().toUpperCase();
    const name = cleanName(payload.name);
    const room = rooms.get(roomCode);
    if (!name) return sendError(socket, "Enter a display name first.");
    if (!room) return sendError(socket, "That room code doesn't exist.");
    if (room.players.length >= 2) return sendError(socket, "That room already has two players.");
    if (room.status !== "WAITING_FOR_PLAYER") return sendError(socket, "That game has already started.");
    if (room.players.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
      return sendError(socket, "Choose a different display name.");
    }

    detachCurrentPlayer(socket);
    const player = createPlayer(name, 2, socket.id);
    room.players.push(player);
    room.status = "READY";
    touch(room);
    attachSession(socket, room, player);
    emitRoomState(room);
  });

  socket.on("restoreSession", (payload = {}) => {
    const token = String(payload.sessionToken || "");
    const session = sessions.get(token);
    const room = session ? rooms.get(session.roomCode) : null;
    const player = room?.players.find((candidate) => candidate.id === session.playerId);
    if (!room || !player) {
      if (token) sessions.delete(token);
      return socket.emit("sessionInvalid");
    }

    player.socketId = socket.id;
    player.connected = true;
    player.disconnectedAt = null;
    socket.data.sessionToken = token;
    socket.data.roomCode = room.roomCode;
    socket.data.playerId = player.id;
    socket.join(room.roomCode);
    touch(room);
    socket.emit("sessionEstablished", sessionPayload(room, player, token));
    emitRoomState(room);
  });

  socket.on("setReady", () => {
    const context = getSocketContext(socket);
    if (!context) return sendError(socket, "Create or join a room first.");
    const { room, player } = context;
    if (room.status !== "READY") return sendError(socket, "The room isn't taking ready checks right now.");
    player.ready = !player.ready;
    touch(room);
    emitRoomState(room);
  });

  socket.on("startGame", () => {
    const context = getSocketContext(socket);
    if (!context) return sendError(socket, "Create or join a room first.");
    const { room, player } = context;
    if (room.hostPlayerId !== player.id) return sendError(socket, "Only the room creator can start.");
    if (room.players.length !== 2 || !room.players.every((candidate) => candidate.ready)) {
      return sendError(socket, "Both players need to be ready.");
    }
    if (room.status !== "READY") return sendError(socket, "This game has already started.");

    startGame(room);
    emitRoomState(room);
  });

  socket.on("submitAnswer", (payload = {}) => {
    const context = getSocketContext(socket);
    if (!context) return sendError(socket, "Your game session couldn't be found.");
    const { room, player } = context;
    if (room.status !== "ANSWERING" || player.finishedAnswerPhase) {
      return sendError(socket, "There isn't a topic waiting for an answer.");
    }
    const answer = normalizeAnswer(String(payload.answer || "").slice(0, 100));
    if (!answer) {
      return sendError(socket, "Exactly three words. Don't overthink it.", "answer");
    }

    const topicId = player.topicQueue[player.answers.length];
    const topic = topicById.get(topicId);
    if (!topic) return sendError(socket, "That topic is no longer available.");
    player.answers.push({ topicId, topicText: topic.text, category: topic.category, answer });
    player.finishedAnswerPhase = player.answers.length === room.answerTarget;
    touch(room);
    socket.emit("answerLocked", { completed: player.answers.length });

    if (room.players.every((candidate) => candidate.finishedAnswerPhase)) {
      room.status = "GUESSING";
      room.players.forEach((candidate) => {
        candidate.guessStarted = false;
        candidate.guessIndex = 0;
        candidate.currentGuess = null;
        candidate.guessReveal = null;
      });
    }
    emitRoomState(room);
  });

  socket.on("passTopic", () => {
    const context = getSocketContext(socket);
    if (!context) return sendError(socket, "Your game session couldn't be found.");
    const { room, player } = context;
    if (room.status !== "ANSWERING" || player.finishedAnswerPhase) {
      return sendError(socket, "There isn't a topic to pass right now.");
    }

    const index = player.answers.length;
    const passedTopicId = player.topicQueue[index];
    player.passedTopicIds.push(passedTopicId);
    const replacement = pickUnusedTopic(room);
    if (!replacement) return sendError(socket, "No replacement topics are available.");
    player.topicQueue[index] = replacement.id;
    room.usedTopicIds.add(replacement.id);
    touch(room);
    socket.emit("topicPassed");
    emitRoomState(room);
  });

  socket.on("startGuessing", async () => {
    const context = getSocketContext(socket);
    if (!context) return sendError(socket, "Your game session couldn't be found.");
    const { room, player } = context;
    if (room.status !== "GUESSING") return sendError(socket, "Round two isn't ready yet.");
    if (player.finishedGuessPhase) return;
    player.guessStarted = true;
    if (!player.currentGuess) await prepareCurrentGuess(room, player);
    touch(room);
    emitRoomState(room);
  });

  socket.on("lockGuess", (payload = {}) => {
    const context = getSocketContext(socket);
    if (!context) return sendError(socket, "Your game session couldn't be found.");
    const { room, player } = context;
    const current = player.currentGuess;
    if (room.status !== "GUESSING" || !player.guessStarted || !current || player.guessReveal) {
      return sendError(socket, "There isn't an answer to lock right now.");
    }
    const selected = current.options.find((option) => option.id === payload.optionId);
    if (!selected) return sendError(socket, "Select an answer first.");
    const real = current.options.find((option) => option.id === current.correctOptionId);
    const correct = selected.id === current.correctOptionId;
    const result = {
      topicId: current.topicId,
      topicText: current.topicText,
      selectedAnswer: selected.text,
      realAnswer: real.text,
      correct
    };
    player.guesses.push(result);
    if (correct) player.score += 1;
    player.guessReveal = result;
    touch(room);
    emitRoomState(room);
  });

  socket.on("nextGuess", async () => {
    const context = getSocketContext(socket);
    if (!context) return sendError(socket, "Your game session couldn't be found.");
    const { room, player } = context;
    if (room.status !== "GUESSING" || !player.guessReveal) {
      return sendError(socket, "Lock in your answer before moving on.");
    }
    player.guessIndex += 1;
    player.currentGuess = null;
    player.guessReveal = null;

    if (player.guessIndex >= room.answerTarget) {
      player.finishedGuessPhase = true;
    } else {
      await prepareCurrentGuess(room, player);
    }
    if (room.players.every((candidate) => candidate.finishedGuessPhase)) room.status = "RESULTS";
    touch(room);
    emitRoomState(room);
  });

  socket.on("requestReview", () => {
    const context = getSocketContext(socket);
    if (!context) return sendError(socket, "Your game session couldn't be found.");
    if (context.room.status !== "RESULTS") return sendError(socket, "Finish the game before reviewing answers.");
    socket.emit("reviewData", buildReview(context.room));
  });

  socket.on("requestRematch", (payload = {}) => {
    const context = getSocketContext(socket);
    if (!context) return sendError(socket, "Your game session couldn't be found.");
    const { room, player } = context;
    if (room.status !== "RESULTS") return sendError(socket, "Finish this game before starting another.");
    player.rematchReady = true;
    player.rematchMode = payload.mode === "newTopics" ? "newTopics" : "playAgain";
    touch(room);

    if (room.players.every((candidate) => candidate.rematchReady)) {
      startGame(room);
    }
    emitRoomState(room);
  });

  socket.on("disconnect", () => {
    const room = rooms.get(socket.data.roomCode);
    const player = room?.players.find((candidate) => candidate.id === socket.data.playerId);
    if (!room || !player || player.socketId !== socket.id) return;
    player.connected = false;
    player.disconnectedAt = Date.now();
    touch(room);
    emitRoomState(room);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`THREE WORDS is running at http://${HOST}:${PORT}`);
});

const cleanupTimer = setInterval(() => {
  const cutoff = Date.now() - ROOM_TTL_MS;
  for (const [roomCode, room] of rooms) {
    if (room.lastActivity >= cutoff) continue;
    rooms.delete(roomCode);
    for (const [token, session] of sessions) {
      if (session.roomCode === roomCode) sessions.delete(token);
    }
  }
}, 60 * 60 * 1000);
cleanupTimer.unref();

function createPlayer(name, number, socketId) {
  return {
    id: crypto.randomUUID(),
    name,
    number,
    socketId,
    connected: true,
    disconnectedAt: null,
    ready: false,
    answers: [],
    topicQueue: [],
    passedTopicIds: [],
    finishedAnswerPhase: false,
    guessStarted: false,
    guessIndex: 0,
    currentGuess: null,
    guessReveal: null,
    guesses: [],
    finishedGuessPhase: false,
    score: 0,
    rematchReady: false,
    rematchMode: null
  };
}

function attachSession(socket, room, player) {
  const token = crypto.randomBytes(24).toString("base64url");
  sessions.set(token, { roomCode: room.roomCode, playerId: player.id });
  socket.data.sessionToken = token;
  socket.data.roomCode = room.roomCode;
  socket.data.playerId = player.id;
  socket.join(room.roomCode);
  socket.emit("sessionEstablished", sessionPayload(room, player, token));
}

function sessionPayload(room, player, token) {
  return {
    sessionToken: token,
    roomCode: room.roomCode,
    playerId: player.id,
    playerNumber: player.number
  };
}

function detachCurrentPlayer(socket) {
  const room = rooms.get(socket.data.roomCode);
  const player = room?.players.find((candidate) => candidate.id === socket.data.playerId);
  if (player && player.socketId === socket.id) {
    player.connected = false;
    player.disconnectedAt = Date.now();
    emitRoomState(room);
  }
  socket.data.roomCode = null;
  socket.data.playerId = null;
  socket.data.sessionToken = null;
}

function startGame(room) {
  room.previousTopicIds = new Set(room.usedTopicIds);
  room.usedTopicIds = new Set();
  room.gameNumber += 1;
  room.status = "ANSWERING";
  const selectedQueues = selectTopicQueues(room);

  room.players.forEach((player, playerIndex) => {
    player.ready = false;
    player.answers = [];
    player.topicQueue = selectedQueues[playerIndex].map((topic) => topic.id);
    player.topicQueue.forEach((topicId) => room.usedTopicIds.add(topicId));
    player.passedTopicIds = [];
    player.finishedAnswerPhase = false;
    player.guessStarted = false;
    player.guessIndex = 0;
    player.currentGuess = null;
    player.guessReveal = null;
    player.guesses = [];
    player.finishedGuessPhase = false;
    player.score = 0;
    player.rematchReady = false;
    player.rematchMode = null;
  });
  touch(room);
}

function selectTopicQueues(room) {
  if (room.modeId === GAME_MODES.compatibility.id) {
    const sharedTopics = selectCompatibilityTopics(room.previousTopicIds, room.answerTarget);
    return [sharedTopics, sharedTopics];
  }

  const selected = selectClassicTopics(room.previousTopicIds, room.answerTarget);
  return [selected.slice(0, room.answerTarget), selected.slice(room.answerTarget)];
}

function selectClassicTopics(excludedIds, answerTarget) {
  const available = topics.filter((topic) => !excludedIds.has(topic.id));
  const nonAdult = shuffle(available.filter((topic) => !topic.adultTopic));
  const adult = shuffle(available.filter((topic) => topic.adultTopic));
  const selected = [];

  for (let playerIndex = 0; playerIndex < 2; playerIndex += 1) {
    const includeAdult = adult.length > 0 && crypto.randomInt(100) < 55;
    const group = nonAdult.splice(0, answerTarget - (includeAdult ? 1 : 0));
    if (includeAdult) group.push(adult.pop());
    selected.push(...shuffle(group));
  }

  if (selected.length === answerTarget * 2) return selected;
  return shuffle(topics).slice(0, answerTarget * 2);
}

function selectCompatibilityTopics(excludedIds, answerTarget) {
  const categoryTargets = { random: 4, nostalgia: 4, life: 4, relationships: 4, deep: 3, adult: 1 };
  const available = topics.filter((topic) => !excludedIds.has(topic.id));
  const selected = [];

  for (const [category, count] of Object.entries(categoryTargets)) {
    selected.push(...shuffle(available.filter((topic) => topic.category === category)).slice(0, count));
  }

  const selectedIds = new Set(selected.map((topic) => topic.id));
  const fill = shuffle(available.filter((topic) => !selectedIds.has(topic.id)));
  while (selected.length < answerTarget && fill.length) selected.push(fill.pop());

  if (selected.length < answerTarget) {
    const fallbackIds = new Set(selected.map((topic) => topic.id));
    selected.push(...shuffle(topics.filter((topic) => !fallbackIds.has(topic.id))).slice(0, answerTarget - selected.length));
  }
  return shuffle(selected.slice(0, answerTarget));
}

async function prepareCurrentGuess(room, player) {
  const opponent = room.players.find((candidate) => candidate.id !== player.id);
  const source = opponent?.answers[player.guessIndex];
  if (!opponent || !source) return;
  const topic = topicById.get(source.topicId);
  const fakeAnswers = await generateFakeAnswers(topic, source.answer);
  const candidates = shuffle([source.answer, ...fakeAnswers]).map((text) => ({
    id: crypto.randomBytes(10).toString("base64url"),
    text
  }));
  const realOption = candidates.find((option) => option.text === source.answer);
  player.currentGuess = {
    topicId: source.topicId,
    topicText: source.topicText,
    options: candidates,
    correctOptionId: realOption.id
  };
}

function pickUnusedTopic(room) {
  const candidates = topics.filter((topic) =>
    !room.usedTopicIds.has(topic.id) && !room.previousTopicIds.has(topic.id)
  );
  const fallback = topics.filter((topic) => !room.usedTopicIds.has(topic.id));
  return shuffle(candidates.length ? candidates : fallback)[0] || null;
}

function buildStateForPlayer(room, player) {
  const opponent = room.players.find((candidate) => candidate.id !== player.id) || null;
  const mode = getGameMode(room.modeId);
  const state = {
    roomCode: room.roomCode,
    status: room.status,
    gameNumber: room.gameNumber,
    mode,
    totalQuestions: room.answerTarget,
    isHost: room.hostPlayerId === player.id,
    players: room.players.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      number: candidate.number,
      connected: candidate.connected,
      ready: candidate.ready,
      answerProgress: candidate.answers.length,
      finishedAnswerPhase: candidate.finishedAnswerPhase,
      guessProgress: candidate.guesses.length,
      finishedGuessPhase: candidate.finishedGuessPhase,
      score: room.status === "RESULTS" ? candidate.score : null,
      rematchReady: candidate.rematchReady
    })),
    self: {
      id: player.id,
      name: player.name,
      number: player.number,
      ready: player.ready,
      answerProgress: player.answers.length,
      finishedAnswerPhase: player.finishedAnswerPhase,
      guessStarted: player.guessStarted,
      guessProgress: player.guesses.length,
      finishedGuessPhase: player.finishedGuessPhase,
      score: player.score,
      rematchReady: player.rematchReady
    },
    opponent: opponent ? {
      id: opponent.id,
      name: opponent.name,
      connected: opponent.connected,
      answerProgress: opponent.answers.length,
      finishedAnswerPhase: opponent.finishedAnswerPhase,
      guessProgress: opponent.guesses.length,
      finishedGuessPhase: opponent.finishedGuessPhase,
      rematchReady: opponent.rematchReady
    } : null
  };

  if (room.status === "ANSWERING" && !player.finishedAnswerPhase) {
    const topic = topicById.get(player.topicQueue[player.answers.length]);
    state.answerPhase = {
      currentTopic: topic ? { id: topic.id, text: topic.text, category: topic.category } : null,
      completed: player.answers.length,
      total: room.answerTarget
    };
  }

  if (room.status === "GUESSING" && player.guessStarted && !player.finishedGuessPhase) {
    state.guessPhase = {
      current: player.currentGuess ? {
        topicId: player.currentGuess.topicId,
        topicText: player.currentGuess.topicText,
        options: player.currentGuess.options
      } : null,
      reveal: player.guessReveal,
      completed: player.guesses.length,
      total: room.answerTarget
    };
  }

  if (room.status === "RESULTS") {
    state.results = {
      scores: room.players.map((candidate) => ({
        playerId: candidate.id,
        name: candidate.name,
        opponentName: room.players.find((other) => other.id !== candidate.id)?.name || "their partner",
        score: candidate.score
      })),
      total: room.answerTarget,
      summary: scoreSummary(
        Math.round(room.players.reduce((sum, candidate) => sum + candidate.score, 0) / 2),
        room.answerTarget
      ),
      compatibility: mode.compatibilityReport ? buildCompatibilityReport(room) : null
    };
  }
  return state;
}

function buildCompatibilityReport(room) {
  const [first, second] = room.players;
  if (!first || !second) return null;

  const secondAnswers = new Map(second.answers.map((answer) => [answer.topicId, answer]));
  const firstGuesses = new Map(first.guesses.map((guess) => [guess.topicId, guess]));
  const secondGuesses = new Map(second.guesses.map((guess) => [guess.topicId, guess]));
  const sharedEntries = first.answers.flatMap((firstAnswer) => {
    const secondAnswer = secondAnswers.get(firstAnswer.topicId);
    if (!secondAnswer) return [];
    return [{
      topicId: firstAnswer.topicId,
      topic: firstAnswer.topicText,
      category: firstAnswer.category,
      similarity: answerSimilarity(firstAnswer.answer, secondAnswer.answer),
      answers: [
        { playerId: first.id, name: first.name, text: firstAnswer.answer },
        { playerId: second.id, name: second.name, text: secondAnswer.answer }
      ],
      guesses: [
        { playerId: first.id, name: first.name, about: second.name, correct: Boolean(firstGuesses.get(firstAnswer.topicId)?.correct) },
        { playerId: second.id, name: second.name, about: first.name, correct: Boolean(secondGuesses.get(firstAnswer.topicId)?.correct) }
      ]
    }];
  });

  const categoryOrder = ["random", "nostalgia", "life", "relationships", "deep", "adult"];
  const categories = categoryOrder.flatMap((category) => {
    const entries = sharedEntries.filter((entry) => entry.category === category);
    if (!entries.length) return [];
    const alignment = average(entries.map((entry) => entry.similarity));
    const guessResults = entries.flatMap((entry) => entry.guesses.map((guess) => guess.correct ? 100 : 0));
    const knowledge = average(guessResults);
    return [{
      id: category,
      label: categoryLabel(category),
      score: Math.round(alignment * 0.6 + knowledge * 0.4),
      alignment,
      knowledge,
      questionCount: entries.length,
      entries
    }];
  });

  const answerAlignment = average(sharedEntries.map((entry) => entry.similarity));
  const firstKnowledge = Math.round(first.score / Math.max(1, room.answerTarget) * 100);
  const secondKnowledge = Math.round(second.score / Math.max(1, room.answerTarget) * 100);
  const mutualKnowledge = Math.round((firstKnowledge + secondKnowledge) / 2);
  const balance = Math.max(0, 100 - Math.abs(firstKnowledge - secondKnowledge));
  const overall = Math.round(answerAlignment * 0.55 + mutualKnowledge * 0.35 + balance * 0.1);
  const tier = compatibilityTier(overall);
  const strongest = [...categories].sort((a, b) => b.score - a.score)[0];
  const growth = [...categories].sort((a, b) => a.score - b.score)[0];
  const closest = [...sharedEntries].sort((a, b) => b.similarity - a.similarity)[0];
  const alignedCount = sharedEntries.filter((entry) => entry.similarity >= 55).length;

  return {
    overall,
    tier: tier.title,
    summary: tier.summary,
    answerAlignment,
    mutualKnowledge,
    balance,
    sharedQuestionCount: sharedEntries.length,
    totalQuestions: room.answerTarget,
    players: [
      { playerId: first.id, name: first.name, correctGuesses: first.score, knowledge: firstKnowledge },
      { playerId: second.id, name: second.name, correctGuesses: second.score, knowledge: secondKnowledge }
    ],
    highlights: [
      {
        kicker: "Your sweet spot",
        value: strongest?.label || "Still unfolding",
        copy: strongest ? `${strongest.score}% connection across ${strongest.questionCount} shared prompts.` : "Play again to reveal more."
      },
      {
        kicker: "Same wavelength",
        value: `${alignedCount} of ${sharedEntries.length}`,
        copy: "Shared prompts where your wording or emotional read lined up."
      },
      {
        kicker: "Closest answer",
        value: closest?.topic || "A future round",
        copy: closest ? `${closest.similarity}% answer similarity on this prompt.` : "Your strongest overlap is still waiting."
      },
      {
        kicker: "Conversation starter",
        value: growth?.label || "Anything goes",
        copy: growth ? "This category had the most room for a good follow-up conversation." : "Keep the questions coming."
      }
    ],
    categories
  };
}

function answerSimilarity(firstAnswer, secondAnswer) {
  const firstText = String(firstAnswer || "").toLocaleLowerCase("en-US");
  const secondText = String(secondAnswer || "").toLocaleLowerCase("en-US");
  if (firstText === secondText) return 100;

  const firstWords = meaningfulAnswerWords(firstText);
  const secondWords = meaningfulAnswerWords(secondText);
  const firstSet = new Set(firstWords);
  const secondSet = new Set(secondWords);
  const sharedWords = [...firstSet].filter((word) => secondSet.has(word)).length;
  const lexicalSimilarity = firstSet.size + secondSet.size
    ? (2 * sharedWords) / (firstSet.size + secondSet.size)
    : 0;
  const firstTone = answerTone(firstWords);
  const secondTone = answerTone(secondWords);
  let toneSimilarity = 0;
  if (firstTone === secondTone && firstTone !== "neutral") toneSimilarity = 1;
  else if (firstTone === secondTone) toneSimilarity = 0.35;
  else if ([firstTone, secondTone].includes("mixed")) toneSimilarity = 0.4;
  return Math.round(Math.min(1, lexicalSimilarity * 0.7 + toneSimilarity * 0.3) * 100);
}

function meaningfulAnswerWords(answer) {
  const ignored = new Set(["a", "an", "and", "but", "i", "i'm", "is", "it", "its", "so", "the", "this", "very"]);
  return normalizedWords(answer)
    .flatMap((word) => word.toLocaleLowerCase("en-US").split(/[-']/))
    .filter((word) => word && !ignored.has(word));
}

function answerTone(words) {
  const positive = new Set([
    "adore", "amazing", "beautiful", "best", "comfortable", "delightful", "enjoy", "exciting", "fun",
    "good", "great", "happy", "hope", "joy", "like", "love", "lovely", "safe", "sweet", "wonderful", "yes"
  ]);
  const negative = new Set([
    "annoying", "awful", "bad", "boring", "disappointing", "exhausting", "fear", "hard", "hate", "hurt",
    "never", "no", "not", "overrated", "painful", "pass", "regret", "sad", "scary", "stressful", "terrible", "worse"
  ]);
  const uncertain = new Set(["complicated", "depends", "maybe", "mixed", "sometimes", "unsure"]);
  const positiveCount = words.filter((word) => positive.has(word)).length;
  const negativeCount = words.filter((word) => negative.has(word)).length;
  if (positiveCount && negativeCount) return "mixed";
  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  if (words.some((word) => uncertain.has(word))) return "mixed";
  return "neutral";
}

function average(values) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function compatibilityTier(score) {
  if (score >= 90) return { title: "Mind-meld territory", summary: "Different brains, one suspiciously shared frequency." };
  if (score >= 75) return { title: "Dynamic duo energy", summary: "You read each other well and meet in plenty of the same places." };
  if (score >= 60) return { title: "Same wavelength", summary: "A strong signal, with just enough plot twists to keep things interesting." };
  if (score >= 45) return { title: "Finding the frequency", summary: "You connect in meaningful ways and still have excellent things left to discover." };
  if (score >= 25) return { title: "Plot still developing", summary: "There are sparks of overlap and lots of material for the next conversation." };
  return { title: "Delightfully unpredictable", summary: "You keep each other guessing—which might be the most interesting result of all." };
}

function categoryLabel(category) {
  return ({
    random: "Play & humor",
    nostalgia: "Shared nostalgia",
    life: "Life outlook",
    relationships: "Relationship rhythm",
    deep: "Deeper values",
    adult: "Chemistry"
  })[category] || category;
}

function getGameMode(value) {
  return value === GAME_MODES.compatibility.id ? GAME_MODES.compatibility : DEFAULT_GAME_MODE;
}

function buildReview(room) {
  return room.players.map((answeringPlayer) => {
    const guessingPlayer = room.players.find((candidate) => candidate.id !== answeringPlayer.id);
    return {
      answeringPlayer: answeringPlayer.name,
      guessingPlayer: guessingPlayer.name,
      entries: answeringPlayer.answers.map((answer, index) => {
        const guess = guessingPlayer.guesses[index];
        return {
          topic: answer.topicText,
          answer: answer.answer,
          guessed: guess?.selectedAnswer || "No guess",
          correct: Boolean(guess?.correct)
        };
      })
    };
  });
}

function scoreSummary(score, total) {
  const ratio = score / Math.max(1, total);
  if (ratio <= 0.2) return "You two have some homework to do.";
  if (ratio <= 0.5) return "You're getting there.";
  if (ratio <= 0.7) return "Okay, you definitely pay attention.";
  if (ratio < 1) return "That's suspiciously impressive.";
  return "Either soulmates or excellent spies.";
}

function emitRoomState(room) {
  for (const player of room.players) {
    if (!player.socketId || !player.connected) continue;
    io.to(player.socketId).emit("roomState", buildStateForPlayer(room, player));
  }
}

function getSocketContext(socket) {
  const room = rooms.get(socket.data.roomCode);
  const player = room?.players.find((candidate) => candidate.id === socket.data.playerId);
  return room && player ? { room, player } : null;
}

function createRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 100; attempt += 1) {
    let code = "";
    const bytes = crypto.randomBytes(6);
    for (const byte of bytes) code += alphabet[byte % alphabet.length];
    if (!rooms.has(code)) return code;
  }
  return crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
}

function cleanName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 24);
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = crypto.randomInt(index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function sendError(socket, message, field = null) {
  socket.emit("gameError", { message, field });
}

function touch(room) {
  room.lastActivity = Date.now();
}

module.exports = { app, server };
