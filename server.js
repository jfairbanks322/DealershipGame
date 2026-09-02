const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const topics = require("./topics");

const PORT = process.env.PORT || 3000;
const ROOM_CODE_LENGTH = 5;
const rooms = new Map();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({ ok: true, rooms: rooms.size });
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("createRoom", (playerName) => {
    const name = cleanName(playerName);
    if (!name) return sendError(socket, "Enter a player name first.");

    const roomCode = createRoomCode();
    const room = createRoom(roomCode, socket.id, name);
    rooms.set(roomCode, room);
    socket.join(roomCode);

    console.log(`Room ${roomCode} created by ${name}`);
    socket.emit("roomCreated", roomCode, getPlayerInfo(room, socket.id));
    socket.emit("waitingForPlayer", roomCode);
    emitRoomState(room);
  });

  socket.on("joinRoom", (roomCodeInput, playerName) => {
    const roomCode = String(roomCodeInput || "").trim().toUpperCase();
    const name = cleanName(playerName);
    const room = rooms.get(roomCode);

    if (!name) return sendError(socket, "Enter a player name first.");
    if (!room) return sendError(socket, "That room code does not exist.");
    if (room.players.length >= 2 && !room.players.some((player) => player.id === socket.id)) {
      return sendError(socket, "That room already has two players.");
    }

    if (!room.players.some((player) => player.id === socket.id)) {
      room.players.push(createPlayer(socket.id, name, 2));
    }

    socket.join(roomCode);
    console.log(`${name} joined room ${roomCode}`);
    socket.emit("roomJoined", buildStateForPlayer(room, socket.id));

    if (room.players.length === 2 && room.phase === "waiting") {
      startRound(room);
    } else {
      emitRoomState(room);
    }
  });

  socket.on("submitSecretWord", (word) => {
    const room = findRoomBySocket(socket.id);
    if (!room) return sendError(socket, "Create or join a room first.");
    if (room.phase !== "secret") return sendError(socket, "Secret words can only be locked before guessing starts.");

    const player = getPlayer(room, socket.id);
    const answerMatch = normalizeAnswer(room, word);
    if (!answerMatch) return sendError(socket, "Choose a secret word from the current topic list.");

    player.secretWord = answerMatch.answer;
    console.log(`${player.name} locked a secret word in room ${room.roomCode}`);

    if (room.players.every((roomPlayer) => roomPlayer.secretWord)) {
      room.phase = "guessing";
    }

    emitRoomState(room);
  });

  socket.on("submitGuess", (word) => {
    const room = findRoomBySocket(socket.id);
    if (!room) return sendError(socket, "Create or join a room first.");
    if (room.phase !== "guessing") return sendError(socket, "Wait until both players have locked secret words.");

    const player = getPlayer(room, socket.id);
    const opponent = getOpponent(room, socket.id);
    if (!player || !opponent) return sendError(socket, "Both players are required to guess.");
    if (player.solved) return sendError(socket, "You already solved this round.");

    const answerMatch = normalizeAnswer(room, word);
    if (!answerMatch) return sendError(socket, "Guesses must come from the current topic list.");
    if (player.guessLog.some((entry) => entry.word === answerMatch.answer)) {
      return sendError(socket, "You already guessed that word this round.");
    }

    const result = scoreGuess(room, player, opponent, answerMatch);
    socket.emit("guessResult", result);
    io.to(room.roomCode).emit("scoreboardUpdate", buildScores(room));

    if (room.players.every((roomPlayer) => roomPlayer.solved)) {
      finishRound(room);
    }

    emitRoomState(room);
  });

  socket.on("nextRound", () => {
    const room = findRoomBySocket(socket.id);
    if (!room) return sendError(socket, "Create or join a room first.");
    if (room.phase !== "roundComplete") return sendError(socket, "Finish the current round before starting another.");

    console.log(`Next round requested in room ${room.roomCode}`);
    startRound(room);
  });

  socket.on("disconnect", () => {
    const room = findRoomBySocket(socket.id);
    console.log(`Socket disconnected: ${socket.id}`);
    if (!room) return;

    const player = getPlayer(room, socket.id);
    if (player) player.connected = false;

    const connectedPlayers = room.players.filter((roomPlayer) => roomPlayer.connected);
    if (connectedPlayers.length === 0) {
      rooms.delete(room.roomCode);
      console.log(`Room ${room.roomCode} cleaned up after all players disconnected`);
      return;
    }

    emitRoomState(room);
  });
});

server.listen(PORT, () => {
  console.log(`What In The Word is running on port ${PORT}`);
});

function createRoom(roomCode, socketId, playerName) {
  return {
    roomCode,
    players: [createPlayer(socketId, playerName, 1)],
    phase: "waiting",
    roundNumber: 0,
    topic: null,
    answers: [],
    lastTopicName: null,
    roundSummary: null
  };
}

function createPlayer(id, name, number) {
  return {
    id,
    name,
    number,
    score: 0,
    secretWord: "",
    guessLog: [],
    guessCount: 0,
    solved: false,
    pointsEarned: 0,
    connected: true
  };
}

function startRound(room) {
  const topic = pickTopic(room.lastTopicName);
  room.roundNumber += 1;
  room.phase = "secret";
  room.topic = topic.name;
  room.answers = topic.answers;
  room.lastTopicName = topic.name;
  room.roundSummary = null;

  room.players.forEach((player) => {
    player.secretWord = "";
    player.guessLog = [];
    player.guessCount = 0;
    player.solved = false;
    player.pointsEarned = 0;
  });

  console.log(`Round ${room.roundNumber} started in ${room.roomCode}: ${room.topic}`);
  io.to(room.roomCode).emit("roundStarted", room.topic, room.answers);
  emitRoomState(room);
}

function finishRound(room) {
  room.phase = "roundComplete";
  const [playerOne, playerTwo] = room.players;
  const winner = getRoundWinner(playerOne, playerTwo);

  room.roundSummary = {
    topic: room.topic,
    playerOne: summarizeRoundPlayer(playerOne, playerTwo.secretWord),
    playerTwo: summarizeRoundPlayer(playerTwo, playerOne.secretWord),
    winner,
    overallLeader: getOverallLeader(room)
  };

  console.log(`Round ${room.roundNumber} complete in ${room.roomCode}: ${winner}`);
  io.to(room.roomCode).emit("roundComplete", room.roundSummary);
}

function scoreGuess(room, player, opponent, answerMatch) {
  const answer = answerMatch.answer;
  const guessIndex = room.answers.indexOf(answer);
  const secretIndex = room.answers.indexOf(opponent.secretWord);
  // Distance is based on the sorted answer-bank index, not raw dictionary spelling.
  const distance = Math.abs(secretIndex - guessIndex);
  const correct = distance === 0;
  const direction = correct ? "Correct" : guessIndex < secretIndex ? "Go UP" : "Go DOWN";
  const temperature = getTemperature(distance);

  player.guessCount += 1;

  const entry = {
    number: player.guessCount,
    word: answer,
    direction,
    distance,
    temperature,
    correct,
    points: 0,
    correctedFrom: answerMatch.correctedFrom
  };

  if (correct) {
    const points = getPointsForGuessCount(player.guessCount);
    player.solved = true;
    player.pointsEarned = points;
    player.score += points;
    entry.points = points;
  }

  player.guessLog.push(entry);
  return entry;
}

function getPointsForGuessCount(count) {
  if (count === 1) return 10;
  if (count === 2) return 8;
  if (count === 3) return 6;
  if (count === 4) return 4;
  return 2;
}

function getTemperature(distance) {
  if (distance === 0) return "Correct";
  if (distance === 1) return "Burning";
  if (distance <= 4) return "Hot";
  if (distance <= 9) return "Warm";
  if (distance <= 19) return "Cold";
  return "Ice Cold";
}

function getRoundWinner(playerOne, playerTwo) {
  if (playerOne.pointsEarned > playerTwo.pointsEarned) return `${playerOne.name} wins the round`;
  if (playerTwo.pointsEarned > playerOne.pointsEarned) return `${playerTwo.name} wins the round`;
  if (playerOne.guessCount < playerTwo.guessCount) return `${playerOne.name} wins the round`;
  if (playerTwo.guessCount < playerOne.guessCount) return `${playerTwo.name} wins the round`;
  return "The round is a tie";
}

function getOverallLeader(room) {
  const [playerOne, playerTwo] = room.players;
  if (!playerOne || !playerTwo) return "Waiting for players";
  if (playerOne.score > playerTwo.score) return `${playerOne.name} leads overall`;
  if (playerTwo.score > playerOne.score) return `${playerTwo.name} leads overall`;
  return "Overall score is tied";
}

function summarizeRoundPlayer(player, guessedSecretWord) {
  return {
    name: player.name,
    number: player.number,
    guesses: player.guessCount,
    points: player.pointsEarned,
    secretWord: guessedSecretWord
  };
}

function buildStateForPlayer(room, socketId) {
  const currentPlayer = getPlayer(room, socketId);
  const opponent = getOpponent(room, socketId);
  // Fairness boundary: opponents never receive each other's secret words until the round is complete.
  const revealSecrets = room.phase === "roundComplete";

  return {
    roomCode: room.roomCode,
    phase: room.phase,
    roundNumber: room.roundNumber,
    topic: room.topic,
    answers: room.answers,
    scores: buildScores(room),
    overallLeader: getOverallLeader(room),
    roundSummary: room.roundSummary,
    you: currentPlayer ? serializePlayer(currentPlayer, true, revealSecrets) : null,
    opponent: opponent ? serializePlayer(opponent, false, revealSecrets) : null,
    players: room.players.map((player) => serializePlayer(player, player.id === socketId, revealSecrets))
  };
}

function serializePlayer(player, isYou, revealSecret) {
  return {
    name: player.name,
    number: player.number,
    score: player.score,
    isYou,
    connected: player.connected,
    hasSecret: Boolean(player.secretWord),
    secretWord: isYou || revealSecret ? player.secretWord : "",
    guessLog: isYou ? player.guessLog : [],
    guessCount: player.guessCount,
    solved: player.solved,
    pointsEarned: player.pointsEarned
  };
}

function buildScores(room) {
  return room.players.map((player) => ({
    name: player.name,
    number: player.number,
    score: player.score,
    solved: player.solved,
    pointsEarned: player.pointsEarned
  }));
}

function emitRoomState(room) {
  room.players.forEach((player) => {
    io.to(player.id).emit("gameStateUpdate", buildStateForPlayer(room, player.id));
  });
}

function normalizeAnswer(room, rawWord) {
  const submitted = String(rawWord || "").trim();
  // Server-side validation is authoritative; client autocomplete is only a spelling helper.
  const exact = room.answers.find((answer) => answer.toLowerCase() === submitted.toLowerCase());
  if (exact) return { answer: exact, correctedFrom: null };

  const simplifiedSubmitted = simplifyAnswer(submitted);
  const simplifiedExact = room.answers.find((answer) => simplifyAnswer(answer) === simplifiedSubmitted);
  if (simplifiedExact) return { answer: simplifiedExact, correctedFrom: submitted };

  if (simplifiedSubmitted.length < 5) return null;

  const maxDistance = simplifiedSubmitted.length >= 8 ? 2 : 1;
  const matches = room.answers
    .map((answer) => ({
      answer,
      distance: getEditDistance(simplifiedSubmitted, simplifyAnswer(answer), maxDistance)
    }))
    .filter((match) => match.distance > 0 && match.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance || a.answer.localeCompare(b.answer));

  if (!matches.length) return null;
  if (matches[1] && matches[1].distance === matches[0].distance) return null;

  return { answer: matches[0].answer, correctedFrom: submitted };
}

function simplifyAnswer(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

function getEditDistance(left, right, maxDistance) {
  if (Math.abs(left.length - right.length) > maxDistance) return maxDistance + 1;

  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    let rowMinimum = current[0];

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      const cost = Math.min(
        previous[rightIndex] + 1,
        current[rightIndex - 1] + 1,
        previous[rightIndex - 1] + substitutionCost
      );
      current[rightIndex] = cost;
      rowMinimum = Math.min(rowMinimum, cost);
    }

    if (rowMinimum > maxDistance) return maxDistance + 1;
    previous = current;
  }

  return previous[right.length];
}

function cleanName(rawName) {
  return String(rawName || "").trim().replace(/\s+/g, " ").slice(0, 24);
}

function getPlayer(room, socketId) {
  return room.players.find((player) => player.id === socketId);
}

function getOpponent(room, socketId) {
  return room.players.find((player) => player.id !== socketId);
}

function findRoomBySocket(socketId) {
  for (const room of rooms.values()) {
    if (room.players.some((player) => player.id === socketId)) return room;
  }
  return null;
}

function pickTopic(lastTopicName) {
  const candidates = topics.filter((topic) => topic.name !== lastTopicName);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function createRoomCode() {
  let code = "";
  do {
    code = Array.from({ length: ROOM_CODE_LENGTH }, () =>
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]
    ).join("");
  } while (rooms.has(code));
  return code;
}

function getPlayerInfo(room, socketId) {
  const player = getPlayer(room, socketId);
  return player ? { name: player.name, number: player.number } : null;
}

function sendError(socket, message) {
  socket.emit("errorMessage", message);
}
