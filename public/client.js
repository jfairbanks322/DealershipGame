const socket = io();

const refs = {
  connectionStatus: document.getElementById("connectionStatus"),
  welcomeScreen: document.getElementById("welcomeScreen"),
  gameScreen: document.getElementById("gameScreen"),
  createName: document.getElementById("createName"),
  joinName: document.getElementById("joinName"),
  roomCodeInput: document.getElementById("roomCodeInput"),
  createRoomButton: document.getElementById("createRoomButton"),
  joinRoomButton: document.getElementById("joinRoomButton"),
  roomCodeDisplay: document.getElementById("roomCodeDisplay"),
  phaseDisplay: document.getElementById("phaseDisplay"),
  statusMessage: document.getElementById("statusMessage"),
  roundNumber: document.getElementById("roundNumber"),
  topicName: document.getElementById("topicName"),
  answerCount: document.getElementById("answerCount"),
  overallLeader: document.getElementById("overallLeader"),
  scoreboard: document.getElementById("scoreboard"),
  youName: document.getElementById("youName"),
  youStatus: document.getElementById("youStatus"),
  opponentName: document.getElementById("opponentName"),
  opponentStatus: document.getElementById("opponentStatus"),
  secretPanel: document.getElementById("secretPanel"),
  secretInput: document.getElementById("secretInput"),
  secretButton: document.getElementById("secretButton"),
  secretHelp: document.getElementById("secretHelp"),
  guessPanel: document.getElementById("guessPanel"),
  guessInput: document.getElementById("guessInput"),
  guessButton: document.getElementById("guessButton"),
  latestResult: document.getElementById("latestResult"),
  guessLog: document.getElementById("guessLog"),
  summaryPanel: document.getElementById("summaryPanel"),
  roundSummary: document.getElementById("roundSummary"),
  nextRoundButton: document.getElementById("nextRoundButton"),
  answerBank: document.getElementById("answerBank"),
  toast: document.getElementById("toast")
};

let gameState = null;
let toastTimer = null;

refs.createRoomButton.addEventListener("click", () => {
  socket.emit("createRoom", refs.createName.value);
});

refs.joinRoomButton.addEventListener("click", () => {
  socket.emit("joinRoom", refs.roomCodeInput.value, refs.joinName.value);
});

refs.secretButton.addEventListener("click", () => {
  socket.emit("submitSecretWord", refs.secretInput.value);
  refs.secretInput.value = "";
});

refs.guessButton.addEventListener("click", () => {
  socket.emit("submitGuess", refs.guessInput.value);
  refs.guessInput.value = "";
});

refs.nextRoundButton.addEventListener("click", () => {
  socket.emit("nextRound");
});

[refs.secretInput, refs.guessInput].forEach((input) => {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      input === refs.secretInput ? refs.secretButton.click() : refs.guessButton.click();
    }
  });
});

refs.roomCodeInput.addEventListener("input", () => {
  refs.roomCodeInput.value = refs.roomCodeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
});

socket.on("connect", () => {
  refs.connectionStatus.textContent = "Connected";
});

socket.on("disconnect", () => {
  refs.connectionStatus.textContent = "Disconnected";
});

socket.on("roomCreated", () => {
  showGame();
});

socket.on("roomJoined", (state) => {
  showGame();
  renderState(state);
});

socket.on("waitingForPlayer", (roomCode) => {
  showGame();
  refs.roomCodeDisplay.textContent = roomCode;
  refs.statusMessage.textContent = "Waiting for opponent...";
});

socket.on("roundStarted", () => {
  refs.latestResult.textContent = "New round. Lock your secret word.";
});

socket.on("gameStateUpdate", (state) => {
  showGame();
  renderState(state);
});

socket.on("guessResult", (result) => {
  refs.latestResult.innerHTML = formatGuessResult(result);
});

socket.on("roundComplete", (summary) => {
  if (gameState) {
    gameState.roundSummary = summary;
    gameState.phase = "roundComplete";
    renderSummary(summary);
  }
});

socket.on("scoreboardUpdate", (scores) => {
  renderScoreboard(scores);
});

socket.on("errorMessage", (message) => {
  showToast(message);
});

function showGame() {
  refs.welcomeScreen.classList.remove("active");
  refs.gameScreen.classList.add("active");
}

function renderState(state) {
  gameState = state;
  // One filtered state payload drives the whole UI, so each player only sees what the server allows.
  refs.roomCodeDisplay.textContent = state.roomCode || "-----";
  refs.phaseDisplay.textContent = getPhaseLabel(state.phase);
  refs.roundNumber.textContent = state.roundNumber || 0;
  refs.topicName.textContent = state.topic || "Waiting...";
  refs.answerCount.textContent = state.answers?.length
    ? `${state.answers.length} approved answers sorted alphabetically.`
    : "Answer bank appears when the round starts.";
  refs.overallLeader.textContent = state.overallLeader || "Waiting for players";

  renderAnswerBank(state.answers || []);
  renderPlayers(state);
  renderScoreboard(state.scores || []);
  renderControls(state);
  renderGuessLog(state.you?.guessLog || []);
  renderSummary(state.roundSummary);

  window.__whatInTheWordState = state;
}

function renderAnswerBank(answers) {
  refs.answerBank.innerHTML = answers.map((answer) => `<option value="${escapeHtml(answer)}"></option>`).join("");
}

function renderPlayers(state) {
  const you = state.you;
  const opponent = state.opponent;

  refs.youName.textContent = you ? `Player ${you.number}: ${you.name}` : "Player";
  refs.youStatus.textContent = you ? getPlayerStatus(you, state.phase, true) : "Not in a room";
  refs.opponentName.textContent = opponent ? `Player ${opponent.number}: ${opponent.name}` : "Waiting...";
  refs.opponentStatus.textContent = opponent
    ? getPlayerStatus(opponent, state.phase, false)
    : "Waiting for second player...";
}

function renderScoreboard(scores) {
  refs.scoreboard.innerHTML = scores.length
    ? scores.map((score) => `
        <div class="score-tile">
          <span>Player ${score.number}: ${escapeHtml(score.name)}</span>
          <strong>${score.score}</strong>
          <small>${score.solved ? `Solved +${score.pointsEarned}` : "Still playing"}</small>
        </div>
      `).join("")
    : "<p class=\"muted\">Scores appear after players join.</p>";
}

function renderControls(state) {
  const hasTwoPlayers = Boolean(state.you && state.opponent);
  const you = state.you || {};
  const guessedWords = new Set((you.guessLog || []).map((entry) => entry.word.toLowerCase()));
  // The server repeats these checks, but disabling controls keeps the classroom flow obvious.
  const secretAllowed = state.phase === "secret" && hasTwoPlayers && !you.hasSecret;
  const guessAllowed = state.phase === "guessing" && hasTwoPlayers && !you.solved;

  refs.secretButton.disabled = !secretAllowed;
  refs.secretInput.disabled = !secretAllowed;
  refs.guessButton.disabled = !guessAllowed;
  refs.guessInput.disabled = !guessAllowed;
  refs.nextRoundButton.disabled = state.phase !== "roundComplete";
  refs.secretPanel.classList.toggle("is-disabled", !secretAllowed);
  refs.guessPanel.classList.toggle("is-disabled", !guessAllowed);

  refs.secretHelp.textContent = you.secretWord
    ? `Locked in: ${you.secretWord}`
    : "Your opponent will not see this until the round is over.";

  if (state.phase === "waiting") refs.statusMessage.textContent = "Waiting for opponent...";
  if (state.phase === "secret" && you.hasSecret) refs.statusMessage.textContent = "Secret locked. Waiting for opponent...";
  if (state.phase === "secret" && !you.hasSecret) refs.statusMessage.textContent = "Choose and lock your secret word.";
  if (state.phase === "guessing") refs.statusMessage.textContent = "Both players are guessing independently.";
  if (state.phase === "roundComplete") refs.statusMessage.textContent = "Round complete. Either player can start the next round.";

  refs.guessInput.oninput = () => {
    const alreadyGuessed = guessedWords.has(refs.guessInput.value.trim().toLowerCase());
    refs.guessButton.disabled = !guessAllowed || alreadyGuessed;
  };
}

function renderGuessLog(log) {
  refs.guessLog.innerHTML = log.length
    ? log.map((entry) => `<li>${formatGuessResult(entry)}</li>`).join("")
    : "<li class=\"muted\">Your guessing log will appear here.</li>";
}

function renderSummary(summary) {
  refs.summaryPanel.style.display = summary ? "grid" : "none";
  if (!summary) {
    refs.roundSummary.innerHTML = "";
    return;
  }

  refs.roundSummary.innerHTML = `
    <div class="summary-row"><span>Topic</span><strong>${escapeHtml(summary.topic)}</strong></div>
    <div class="summary-row"><span>${escapeHtml(summary.playerOne.name)} guesses</span><strong>${summary.playerOne.guesses}</strong></div>
    <div class="summary-row"><span>${escapeHtml(summary.playerTwo.name)} guesses</span><strong>${summary.playerTwo.guesses}</strong></div>
    <div class="summary-row"><span>${escapeHtml(summary.playerOne.name)} earned</span><strong>+${summary.playerOne.points}</strong></div>
    <div class="summary-row"><span>${escapeHtml(summary.playerTwo.name)} earned</span><strong>+${summary.playerTwo.points}</strong></div>
    <div class="summary-row"><span>${escapeHtml(summary.playerOne.name)} secret</span><strong>${escapeHtml(summary.playerOne.secretWord)}</strong></div>
    <div class="summary-row"><span>${escapeHtml(summary.playerTwo.name)} secret</span><strong>${escapeHtml(summary.playerTwo.secretWord)}</strong></div>
    <div class="summary-row"><span>Round winner</span><strong>${escapeHtml(summary.winner)}</strong></div>
    <div class="summary-row"><span>Overall leader</span><strong>${escapeHtml(summary.overallLeader)}</strong></div>
  `;
}

function formatGuessResult(entry) {
  const points = entry.correct ? ` — +${entry.points} points` : "";
  const distance = entry.correct ? "Correct" : `${entry.distance} away`;
  const correction = entry.correctedFrom
    ? ` <small>(read as ${escapeHtml(entry.word)})</small>`
    : "";
  return `
    Guess ${entry.number}: ${escapeHtml(entry.correctedFrom || entry.word)}${correction} — ${entry.direction} — ${distance}
    — <span class="temperature">${entry.temperature}</span>${points}
  `;
}

function getPlayerStatus(player, phase, isYou) {
  if (!player.connected) return "Disconnected";
  if (phase === "waiting") return isYou ? "Waiting in room" : "Not joined yet";
  if (phase === "secret") return player.hasSecret ? "Secret locked" : "Choosing secret word";
  if (phase === "guessing") return player.solved ? "Solved" : "Guessing";
  if (phase === "roundComplete") return `Round points: +${player.pointsEarned}`;
  return "Ready";
}

function getPhaseLabel(phase) {
  return {
    waiting: "Waiting",
    secret: "Secret word selection",
    guessing: "Guessing phase",
    roundComplete: "Round results"
  }[phase] || "Welcome";
}

function showToast(message) {
  refs.toast.textContent = message;
  refs.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => refs.toast.classList.remove("show"), 3200);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[char]));
}

window.render_game_to_text = () => {
  const state = gameState || {};
  return JSON.stringify({
    screen: refs.gameScreen.classList.contains("active") ? "game" : "welcome",
    roomCode: state.roomCode,
    phase: state.phase,
    roundNumber: state.roundNumber,
    topic: state.topic,
    answerCount: state.answers?.length || 0,
    you: state.you ? {
      name: state.you.name,
      hasSecret: state.you.hasSecret,
      guessCount: state.you.guessCount,
      solved: state.you.solved,
      score: state.you.score
    } : null,
    opponent: state.opponent ? {
      name: state.opponent.name,
      hasSecret: state.opponent.hasSecret,
      guessCount: state.opponent.guessCount,
      solved: state.opponent.solved,
      score: state.opponent.score
    } : null,
    latestResult: refs.latestResult.textContent.trim(),
    summaryVisible: refs.summaryPanel.style.display !== "none"
  });
};

window.advanceTime = () => {};
