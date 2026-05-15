const FALLBACK_QUESTIONS = [
  {
    prompt: "A stranger at a wedding asks you to give an emergency toast because you look confident. What do you do?",
    options: [
      "Stand up and deliver a moving speech based entirely on vibes.",
      "Pretend you are searching for the couple's uncle until the moment passes.",
      "Give a 14-second toast and immediately sit down like nothing happened."
    ]
  },
  {
    prompt: "You open your fridge and find a tiny door labeled 'Management.' What is your first move?",
    options: [
      "Knock politely and wait for office hours.",
      "Open it, because this is clearly your problem now.",
      "Close the fridge and become someone who orders takeout."
    ]
  },
  {
    prompt: "A crow keeps dropping pennies on your porch every morning. What relationship are you building?",
    options: [
      "Trusted business partners with a formal penny ledger.",
      "Casual acquaintances. You wave, but boundaries matter.",
      "Enemies, somehow. You do not know what you did."
    ]
  },
  {
    prompt: "Your group chat accidentally elects you mayor of brunch. What law do you pass first?",
    options: [
      "No one may say 'whatever is fine' when choosing a place.",
      "Bottomless coffee must actually mean bottomless coffee.",
      "One emergency pancake order is always kept in reserve."
    ]
  },
  {
    prompt: "A time traveler asks you for one modern snack to prove this era had culture. What do you hand over?",
    options: [
      "Gas station nachos, because history deserves the truth.",
      "A perfectly engineered sour candy.",
      "A little cheese board so we look more stable than we are."
    ]
  },
  {
    prompt: "You discover your houseplants have been holding meetings about you. How do you respond?",
    options: [
      "Improve watering schedules and ask for quarterly feedback.",
      "Move one plant as a warning to the others.",
      "Join the meeting with snacks and take minutes."
    ]
  },
  {
    prompt: "A restaurant gives you a menu with one item circled in red and the waiter just whispers 'choose wisely.'",
    options: [
      "Order the circled item. You respect drama.",
      "Order soup. Soup rarely starts a prophecy.",
      "Ask the waiter what they would do and study their face."
    ]
  },
  {
    prompt: "Your phone autocorrects every message to make you sound like a medieval advisor. What is your plan?",
    options: [
      "Accept your new voice and become impossible to ignore.",
      "Send voice memos only, with deep resentment.",
      "Use it strategically for serious texts and deny everything."
    ]
  },
  {
    prompt: "You get one button that summons an extremely specific convenience once a day. What does it do?",
    options: [
      "Find the thing you just had in your hand.",
      "Make every fitted sheet fold itself correctly.",
      "Summon perfect parking within one block."
    ]
  },
  {
    prompt: "A hotel room has a second, smaller bed labeled 'for your decisions.' What happens next?",
    options: [
      "You tuck your worst decision in and wish it growth.",
      "You sleep there out of respect for the signage.",
      "You ask the front desk whether breakfast is included for both of you."
    ]
  },
  {
    prompt: "Your future self sends one warning, but it is only three words long. Which warning would most concern you?",
    options: [
      "Avoid the dolphin.",
      "Delete Thursday's email.",
      "Wear better shoes."
    ]
  },
  {
    prompt: "A mysterious committee offers you a trophy for your most consistent personal flaw. What does the plaque say?",
    options: [
      "Outstanding Achievement in Overthinking Casual Messages.",
      "Lifetime Excellence in Carrying All Grocery Bags at Once.",
      "Best Original Performance as Someone Who Has It Together."
    ]
  }
];

const QUESTIONS = normalizeQuestions(window.WEIRD_SITUATION_QUESTIONS || FALLBACK_QUESTIONS);
const ROUND_SIZE = 5;
const DOUBLE_POINT_VALUE = 2;
const TOTAL_ROUNDS = Math.ceil(QUESTIONS.length / ROUND_SIZE);

const state = {
  players: ["Player 1", "Player 2"],
  roundIndex: 0,
  flow: "local",
  gameId: "",
  resultPollTimer: null,
  remotePayload: null,
  answers: [Array(QUESTIONS.length).fill(null), Array(QUESTIONS.length).fill(null)],
  guesses: [
    [Array(QUESTIONS.length).fill(null), Array(QUESTIONS.length).fill(null)],
    [Array(QUESTIONS.length).fill(null), Array(QUESTIONS.length).fill(null)]
  ],
  scores: [0, 0],
  selections: []
};

const refs = {
  modePill: document.getElementById("mode-pill"),
  introPanel: document.getElementById("intro-panel"),
  form: document.getElementById("quiz-form"),
  template: document.getElementById("question-template"),
  progressText: document.getElementById("progress-text"),
  progressBar: document.getElementById("progress-bar"),
  scoreNameOne: document.getElementById("score-name-1"),
  scoreNameTwo: document.getElementById("score-name-2"),
  scoreValueOne: document.getElementById("score-value-1"),
  scoreValueTwo: document.getElementById("score-value-2"),
  resultPanel: document.getElementById("result-panel")
};

const launchPayload = decodePayload(new URLSearchParams(window.location.search).get("ks"));

if (launchPayload) {
  renderRemoteLaunch(launchPayload);
} else {
  renderSetup();
}

function renderSetup() {
  setScreenMode("setup");
  refs.modePill.textContent = "Pass-and-play";
  refs.progressText.textContent = `0 of ${QUESTIONS.length}`;
  refs.progressBar.style.width = "0%";
  renderScoreboard();
  refs.resultPanel.classList.add("hidden");
  refs.form.innerHTML = "";

  const setup = document.createElement("section");
  setup.className = "setup-card";
  setup.innerHTML = `
    <div>
      <p class="eyebrow">Two-player hot seat</p>
      <h2>Who is playing?</h2>
    </div>
    <div class="name-grid">
      <label>
        Player 1
        <input name="player-1" type="text" maxlength="24" value="Player 1" />
      </label>
      <label>
        Player 2
        <input name="player-2" type="text" maxlength="24" value="Player 2" />
      </label>
    </div>
    <div class="submit-row">
      <button class="primary-action" type="submit">Start Two-Device Game</button>
      <button class="secondary-action" type="button" data-local-start>Play on One Device</button>
      <span class="helper-text">${QUESTIONS.length} questions total, ${ROUND_SIZE} per round. Two-device play is the default.</span>
    </div>
  `;

  refs.form.append(setup);
  refs.form.onsubmit = (event) => {
    event.preventDefault();
    beginRemoteRound();
  };

  setup.querySelector("[data-local-start]").addEventListener("click", beginLocalRound);
}

function syncPlayerNamesFromSetup() {
  const formData = new FormData(refs.form);
  state.players = [
    cleanName(formData.get("player-1"), "Player 1"),
    cleanName(formData.get("player-2"), "Player 2")
  ];
  renderScoreboard();
}

function beginRemoteRound() {
  syncPlayerNamesFromSetup();
  state.flow = "remote-start";
  ensureGameId();
  showPassScreen({
    title: `${state.players[0]}, answer the first remote round.`,
    detail: "After these five answers, KitchenSync will create a link for the second player to open on their device.",
    action: "Begin Answers",
    next: () => renderQuestionStep({ mode: "answer", playerIndex: 0 })
  });
}

function beginLocalRound() {
  syncPlayerNamesFromSetup();
  state.flow = "local";
  showPassScreen({
    title: `${state.players[0]}, you answer first.`,
    detail: "Pick your own answers for these five questions. Do not let the other player peek.",
    action: "Begin Answers",
    next: () => renderQuestionStep({ mode: "answer", playerIndex: 0 })
  });
}

function renderRemoteLaunch(payload) {
  state.flow = payload.phase === "results"
    ? "remote-results"
    : payload.phase === "return"
      ? "remote-return"
      : "remote-p2-answer";
  state.remotePayload = payload;
  state.gameId = payload.gameId || state.gameId || "";
  state.players = Array.isArray(payload.players) ? payload.players.map((name, index) => cleanName(name, `Player ${index + 1}`)) : state.players;
  state.roundIndex = clampRoundIndex(payload.roundIndex);
  state.scores = Array.isArray(payload.scores) ? [Number(payload.scores[0]) || 0, Number(payload.scores[1]) || 0] : [0, 0];
  renderScoreboard();

  applyRemoteAnswers(0, payload.p1Answers);
  applyRemoteAnswers(1, payload.p2Answers);
  applyRemoteGuesses(0, 1, payload.p1Guesses);
  applyRemoteGuesses(1, 0, payload.p2Guesses);

  if (payload.phase === "results") {
    showRoundReveal();
    return;
  }

  if (payload.phase === "return") {
    showPassScreen({
      title: `${state.players[0]}, finish the remote round.`,
      detail: `${state.players[1]} answered and guessed. Now guess ${state.players[1]}'s answers to reveal the round.`,
      action: "Begin Guesses",
      next: () => renderQuestionStep({ mode: "guess", playerIndex: 0, targetIndex: 1 })
    });
    return;
  }

  showPassScreen({
    title: `${state.players[1]}, your KitchenSync round is ready.`,
    detail: `Answer these five, then guess what ${state.players[0]} picked. You will send one return link back.`,
    action: "Begin Answers",
    next: () => renderQuestionStep({ mode: "answer", playerIndex: 1 })
  });
  addPreviousRoundResultsButton(payload.previousRoundIndex);
}

function renderQuestionStep({ mode, playerIndex, targetIndex = null }) {
  const questions = getRoundQuestions();
  if (!questions.length) {
    showFinalScore();
    return;
  }
  state.selections = Array(questions.length).fill(null);
  refs.resultPanel.classList.add("hidden");
  refs.form.innerHTML = "";
  refs.form.onsubmit = null;

  const isGuess = mode === "guess";
  const playerName = state.players[playerIndex];
  const targetName = Number.isInteger(targetIndex) ? state.players[targetIndex] : "";
  setScreenMode(isGuess ? "guess" : "answer");
  refs.modePill.textContent = isGuess ? `${playerName} guesses` : `${playerName} answers`;

  refs.introPanel.querySelector("h1").textContent = isGuess
    ? `${playerName}, guess ${targetName}'s answers.`
    : `${playerName}, answer these five.`;
  refs.introPanel.querySelector(".intro-description").textContent = isGuess
    ? "Choose what you think they picked. The truth stays hidden until both guesses are locked."
    : "Choose what you would do. When you submit, pass the device before the next person starts.";

  const turnNotice = document.createElement("section");
  turnNotice.className = `turn-notice ${isGuess ? "turn-notice-guess" : "turn-notice-answer"}`;
  turnNotice.innerHTML = `
    <div>
      <p class="eyebrow">${isGuess ? "Guessing mode" : "Answer mode"}</p>
      <h2>${isGuess
        ? `${escapeHtml(playerName)} is predicting ${escapeHtml(targetName)}.`
        : `${escapeHtml(playerName)} is choosing personal answers.`}</h2>
    </div>
    <span>${isGuess ? "Predict" : "Pick"}</span>
  `;
  refs.form.append(turnNotice);

  questions.forEach(({ question, originalIndex, isDoublePoint }, localIndex) => {
    const node = refs.template.content.firstElementChild.cloneNode(true);
    const groupName = `question-${localIndex}`;
    node.dataset.index = originalIndex;
    if (isDoublePoint) {
      node.classList.add("question-card-double");
    }
    node.querySelector(".question-index").textContent = originalIndex + 1;
    node.querySelector("h2").textContent = question.prompt;
    if (isDoublePoint) {
      const badge = document.createElement("div");
      badge.className = "double-badge";
      badge.textContent = "Double Sync";
      node.querySelector(".question-head").append(badge);
    }

    const options = node.querySelector(".options");
    question.options.forEach((label, optionIndex) => {
      const optionId = `${groupName}-${optionIndex}`;
      const wrapper = document.createElement("label");
      wrapper.className = "option";
      wrapper.setAttribute("for", optionId);

      const input = document.createElement("input");
      input.id = optionId;
      input.type = "radio";
      input.name = groupName;
      input.value = String(optionIndex);
      input.addEventListener("change", () => {
        state.selections[localIndex] = optionIndex;
        node.classList.add("is-complete");
        renderProgress();
      });

      const text = document.createElement("span");
      text.dataset.letter = String.fromCharCode(65 + optionIndex);
      text.textContent = label;

      wrapper.append(input, text);
      options.append(wrapper);
    });

    refs.form.append(node);
  });

  const row = document.createElement("div");
  row.className = "submit-row";

  const button = document.createElement("button");
  button.className = "primary-action";
  button.type = "submit";
  button.textContent = isGuess ? "Lock Guesses" : "Lock Answers";
  button.disabled = true;

  const helper = document.createElement("span");
  helper.className = "helper-text";
  helper.textContent = `Round ${state.roundIndex + 1} of ${TOTAL_ROUNDS}. Answer all ${questions.length} to continue.`;

  row.append(button, helper);
  refs.form.append(row);

  refs.form.onsubmit = (event) => {
    event.preventDefault();
    if (!isComplete()) {
      return;
    }

    questions.forEach(({ originalIndex }, localIndex) => {
      if (isGuess) {
        state.guesses[playerIndex][targetIndex][originalIndex] = state.selections[localIndex];
      } else {
        state.answers[playerIndex][originalIndex] = state.selections[localIndex];
      }
    });

    advanceFrom({ mode, playerIndex, targetIndex });
  };

  renderProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderProgress() {
  const completeCount = state.selections.filter(Number.isInteger).length;
  const total = getRoundQuestions().length || ROUND_SIZE;
  const answeredOverall = getAnsweredOverallCount();
  const percent = Math.round((completeCount / total) * 100);
  const button = refs.form.querySelector(".primary-action");
  refs.progressText.textContent = `${completeCount} of ${total}`;
  refs.progressBar.style.width = `${percent}%`;
  refs.progressText.title = `${answeredOverall} total private answers locked`;
  renderScoreboard();
  if (button) {
    button.disabled = !isComplete();
  }
}

function advanceFrom({ mode, playerIndex }) {
  if (state.flow === "remote-start" && mode === "answer" && playerIndex === 0) {
    showRemoteLinkForSecondPlayer();
    return;
  }

  if (state.flow === "remote-p2-answer" && mode === "answer" && playerIndex === 1) {
    showPassScreen({
      title: `${state.players[1]}, now guess ${state.players[0]}.`,
      detail: "Pick what you think they answered for these same five questions. Then send the return link back.",
      action: "Begin Guesses",
      next: () => renderQuestionStep({ mode: "guess", playerIndex: 1, targetIndex: 0 })
    });
    return;
  }

  if (state.flow === "remote-p2-answer" && mode === "guess" && playerIndex === 1) {
    showRemoteReturnLink();
    return;
  }

  if (state.flow === "remote-return" && mode === "guess" && playerIndex === 0) {
    scoreRound();
    showRoundReveal();
    return;
  }

  if (mode === "answer" && playerIndex === 0) {
    showPassScreen({
      title: `Pass to ${state.players[1]}.`,
      detail: `${state.players[1]} answers the same five questions now. No checking ${state.players[0]}'s picks.`,
      action: "Begin Answers",
      next: () => renderQuestionStep({ mode: "answer", playerIndex: 1 })
    });
    return;
  }

  if (mode === "answer" && playerIndex === 1) {
    showPassScreen({
      title: `Pass to ${state.players[0]}.`,
      detail: `${state.players[0]} now guesses what ${state.players[1]} picked for this round.`,
      action: "Begin Guesses",
      next: () => renderQuestionStep({ mode: "guess", playerIndex: 0, targetIndex: 1 })
    });
    return;
  }

  if (mode === "guess" && playerIndex === 0) {
    showPassScreen({
      title: `Pass to ${state.players[1]}.`,
      detail: `${state.players[1]} now guesses what ${state.players[0]} picked. Last secret step before the reveal.`,
      action: "Begin Guesses",
      next: () => renderQuestionStep({ mode: "guess", playerIndex: 1, targetIndex: 0 })
    });
    return;
  }

  scoreRound();
  showRoundReveal();
}

function showPassScreen({ title, detail, action, next }) {
  setScreenMode("pass");
  renderScoreboard();
  refs.form.innerHTML = "";
  refs.form.onsubmit = null;
  refs.resultPanel.classList.remove("hidden");
  refs.resultPanel.innerHTML = `
    <div class="result-head">
      <div>
        <p class="eyebrow">Pass the device</p>
        <h2>${escapeHtml(title)}</h2>
      </div>
    </div>
    <p class="helper-text">${escapeHtml(detail)}</p>
    <div class="submit-row">
      <button class="primary-action" type="button" data-next>${escapeHtml(action)}</button>
    </div>
  `;
  refs.progressText.textContent = `Round ${state.roundIndex + 1} of ${TOTAL_ROUNDS}`;
  refs.progressBar.style.width = "0%";
  refs.resultPanel.querySelector("[data-next]").addEventListener("click", next);
  refs.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showRemoteLinkForSecondPlayer() {
  const url = buildRemoteUrl({
    phase: "p2",
    gameId: ensureGameId(),
    players: state.players,
    roundIndex: state.roundIndex,
    previousRoundIndex: state.roundIndex > 0 ? state.roundIndex - 1 : null,
    scores: state.scores,
    p1Answers: collectRoundValues(state.answers[0])
  });

  showSharePanel({
    eyebrow: "Send this round",
    title: `Send this link to ${state.players[1]}.`,
    detail: `${state.players[1]} will answer the same five questions, guess ${state.players[0]}'s answers, and send a return link back.`,
    url,
    primaryLabel: "Send to Other Player",
    copyLabel: "Copy Link"
  });
}

function showRemoteReturnLink() {
  const url = buildRemoteUrl({
    phase: "return",
    gameId: ensureGameId(),
    players: state.players,
    roundIndex: state.roundIndex,
    scores: state.scores,
    p1Answers: collectRoundValues(state.answers[0]),
    p2Answers: collectRoundValues(state.answers[1]),
    p2Guesses: collectRoundValues(state.guesses[1][0])
  });

  showSharePanel({
    eyebrow: "Send it back",
    title: `Send this return link to ${state.players[0]}.`,
    detail: `${state.players[0]} will open it, guess your answers, and reveal the round score. Keep this page open after sending; results will appear here automatically.`,
    url,
    primaryLabel: "Send Back",
    copyLabel: "Copy Return Link"
  });
  appendResultWaitPanel();
  startResultPolling();
}

function showSharePanel({ eyebrow, title, detail, url, primaryLabel, copyLabel }) {
  setScreenMode("share");
  stopResultPolling();
  renderScoreboard();
  const localNetworkNote = isLoopbackUrl(url)
    ? " For a real second device, open KitchenSync from a deployed URL or your computer's local network address first."
    : "";
  refs.form.innerHTML = "";
  refs.resultPanel.classList.remove("hidden");
  refs.resultPanel.innerHTML = `
    <div class="result-head">
      <div>
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h2>${escapeHtml(title)}</h2>
      </div>
      <button class="secondary-action" type="button" data-copy>${escapeHtml(copyLabel)}</button>
    </div>
    <p class="helper-text">${escapeHtml(detail + localNetworkNote)}</p>
    <div class="share-box">
      <input type="text" readonly value="${escapeAttribute(url)}" aria-label="Share link" />
      <button class="primary-action" type="button" data-share>${escapeHtml(primaryLabel)}</button>
    </div>
  `;
  refs.progressText.textContent = `Round ${state.roundIndex + 1} link`;
  refs.progressBar.style.width = "100%";
  refs.resultPanel.querySelector("[data-copy]").addEventListener("click", () => copyShareUrl(url));
  refs.resultPanel.querySelector("[data-share]").addEventListener("click", () => shareUrl(url));
  refs.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scoreRound() {
  getRoundQuestions().forEach(({ originalIndex, pointValue }) => {
    if (state.guesses[0][1][originalIndex] === state.answers[1][originalIndex]) {
      state.scores[0] += pointValue;
    }
    if (state.guesses[1][0][originalIndex] === state.answers[0][originalIndex]) {
      state.scores[1] += pointValue;
    }
  });
  renderScoreboard();
}

function showRoundReveal() {
  setScreenMode("reveal");
  stopResultPolling();
  renderScoreboard();
  const questions = getRoundQuestions();
  const roundOneScore = calculateRoundScore(0, 1);
  const roundTwoScore = calculateRoundScore(1, 0);
  const maxRoundScore = getMaxRoundScore();
  const revealItems = questions.map(({ question, originalIndex, isDoublePoint, pointValue }) => {
    const firstMatched = state.guesses[0][1][originalIndex] === state.answers[1][originalIndex];
    const secondMatched = state.guesses[1][0][originalIndex] === state.answers[0][originalIndex];
    return `
      <div class="reveal-item reveal-card ${isDoublePoint ? "reveal-card-double" : ""}">
        <div class="reveal-question">
          <span>Q${originalIndex + 1}</span>
          <strong>${escapeHtml(question.prompt)}</strong>
          ${isDoublePoint ? "<em>Double Sync</em>" : ""}
        </div>
        <div class="reveal-match-grid">
          ${renderGuessResult({
            guesserName: state.players[0],
            targetName: state.players[1],
            question,
            guessed: state.guesses[0][1][originalIndex],
            actual: state.answers[1][originalIndex],
            matched: firstMatched,
            pointValue
          })}
          ${renderGuessResult({
            guesserName: state.players[1],
            targetName: state.players[0],
            question,
            guessed: state.guesses[1][0][originalIndex],
            actual: state.answers[0][originalIndex],
            matched: secondMatched,
            pointValue
          })}
        </div>
      </div>
    `;
  }).join("");
  const leader = getRoundLeader(roundOneScore, roundTwoScore);

  refs.resultPanel.classList.remove("hidden");
  refs.resultPanel.innerHTML = `
    <div class="result-hero">
      <div class="result-burst" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div>
        <p class="eyebrow">Round ${state.roundIndex + 1} reveal</p>
        <h2>${getRoundMessage(roundOneScore, roundTwoScore)}</h2>
        <p>${getRoundFlavor(roundOneScore, roundTwoScore, maxRoundScore)}</p>
      </div>
      <div class="round-score-lockup" aria-label="Round score">
        <span>${roundOneScore}</span>
        <small>to</small>
        <span>${roundTwoScore}</span>
      </div>
    </div>
    <div class="player-result-grid">
      ${renderPlayerScoreTile({
        name: state.players[0],
        roundScore: roundOneScore,
        totalScore: state.scores[0],
        total: maxRoundScore,
        tone: leader === 0 ? "winner" : leader === 1 ? "runner" : "tie"
      })}
      ${renderPlayerScoreTile({
        name: state.players[1],
        roundScore: roundTwoScore,
        totalScore: state.scores[1],
        total: maxRoundScore,
        tone: leader === 1 ? "winner" : leader === 0 ? "runner" : "tie"
      })}
    </div>
    <div class="reveal-list">${revealItems}</div>
    <div class="submit-row">
      ${getRoundRevealActions()}
      <button class="secondary-action" type="button" data-restart>Restart</button>
    </div>
  `;

  const nextRoundButton = refs.resultPanel.querySelector("[data-next-round]");
  if (nextRoundButton) {
    nextRoundButton.addEventListener("click", () => {
      state.roundIndex += 1;
      state.flow = "local";
      renderQuestionStep({ mode: "answer", playerIndex: 0 });
    });
  }

  const finalButton = refs.resultPanel.querySelector("[data-final]");
  if (finalButton) {
    finalButton.addEventListener("click", showFinalScore);
  }

  refs.resultPanel.querySelector("[data-restart]").addEventListener("click", () => window.location.reload());
  publishRemoteResults();
  addRemoteResultsButton();
  addRemoteNextRoundButton();
  refs.form.innerHTML = "";
  refs.progressText.textContent = `${questions.length} of ${questions.length}`;
  refs.progressBar.style.width = "100%";
  refs.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function addRemoteNextRoundButton() {
  if (state.flow !== "remote-return" || state.roundIndex + 1 >= TOTAL_ROUNDS) {
    return;
  }

  const row = refs.resultPanel.querySelector(".submit-row");
  const button = document.createElement("button");
  button.className = "secondary-action";
  button.type = "button";
  button.textContent = "Start Next Remote Round";
  button.addEventListener("click", () => {
    state.roundIndex += 1;
    state.flow = "remote-start";
    renderQuestionStep({ mode: "answer", playerIndex: 0 });
  });
  row.prepend(button);
}

function addRemoteResultsButton() {
  if (state.flow !== "remote-return") {
    return;
  }

  const row = refs.resultPanel.querySelector(".submit-row");
  const button = document.createElement("button");
  button.className = "primary-action";
  button.type = "button";
  button.textContent = `Send Results to ${state.players[1]}`;
  button.addEventListener("click", () => shareUrl(buildRemoteUrl({
    phase: "results",
    gameId: ensureGameId(),
    players: state.players,
    roundIndex: state.roundIndex,
    scores: state.scores,
    p1Answers: collectRoundValues(state.answers[0]),
    p2Answers: collectRoundValues(state.answers[1]),
    p1Guesses: collectRoundValues(state.guesses[0][1]),
    p2Guesses: collectRoundValues(state.guesses[1][0])
  })));
  row.prepend(button);
}

function addPreviousRoundResultsButton(previousRoundIndex) {
  const roundIndex = Number(previousRoundIndex);
  if (!state.gameId || !Number.isInteger(roundIndex) || roundIndex < 0) {
    return;
  }

  const row = refs.resultPanel.querySelector(".submit-row");
  if (!row) {
    return;
  }

  const button = document.createElement("button");
  button.className = "secondary-action previous-results-action";
  button.type = "button";
  button.textContent = `View Round ${roundIndex + 1} Results`;
  button.addEventListener("click", () => loadPreviousRoundResults(roundIndex, button));
  row.prepend(button);
}

async function loadPreviousRoundResults(roundIndex, button) {
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Loading Results";

  try {
    const response = await fetch(getResultMailboxUrl(roundIndex), { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Previous results are not ready on this device yet.");
    }

    const payload = await response.json();
    renderPreviousRoundResults(payload);
    button.disabled = false;
    button.textContent = "Show Results Again";
  } catch (error) {
    showPreviousRoundMessage(error.message || "Could not load the previous round results yet.");
    button.disabled = false;
    button.textContent = originalText;
  }
}

function renderPreviousRoundResults(payload) {
  const roundIndex = clampRoundIndex(payload.roundIndex);
  const questions = getRoundQuestionsForRound(roundIndex);
  const p1Answers = Array.isArray(payload.p1Answers) ? payload.p1Answers : [];
  const p2Answers = Array.isArray(payload.p2Answers) ? payload.p2Answers : [];
  const p1Guesses = Array.isArray(payload.p1Guesses) ? payload.p1Guesses : [];
  const p2Guesses = Array.isArray(payload.p2Guesses) ? payload.p2Guesses : [];
  const previewItems = questions.map(({ question, originalIndex, localIndex, isDoublePoint, pointValue }) => {
    const firstMatched = p1Guesses[localIndex] === p2Answers[localIndex];
    const secondMatched = p2Guesses[localIndex] === p1Answers[localIndex];
    return `
      <div class="previous-result-item ${isDoublePoint ? "previous-result-double" : ""}">
        <div class="reveal-question">
          <span>Q${originalIndex + 1}</span>
          <strong>${escapeHtml(question.prompt)}</strong>
          ${isDoublePoint ? "<em>Double Sync</em>" : ""}
        </div>
        <div class="reveal-match-grid">
          ${renderGuessResult({
            guesserName: state.players[0],
            targetName: state.players[1],
            question,
            guessed: p1Guesses[localIndex],
            actual: p2Answers[localIndex],
            matched: firstMatched,
            pointValue
          })}
          ${renderGuessResult({
            guesserName: state.players[1],
            targetName: state.players[0],
            question,
            guessed: p2Guesses[localIndex],
            actual: p1Answers[localIndex],
            matched: secondMatched,
            pointValue
          })}
        </div>
      </div>
    `;
  }).join("");

  removePreviousRoundPanel();
  const panel = document.createElement("div");
  panel.className = "previous-results-panel";
  panel.innerHTML = `
    <div class="previous-results-head">
      <div>
        <p class="eyebrow">Previous round</p>
        <h3>Round ${roundIndex + 1} Results</h3>
      </div>
      <button class="secondary-action compact-action" type="button" data-close-previous>Hide</button>
    </div>
    <div class="previous-results-list">${previewItems}</div>
  `;
  refs.resultPanel.append(panel);
  panel.querySelector("[data-close-previous]").addEventListener("click", removePreviousRoundPanel);
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function showPreviousRoundMessage(message) {
  removePreviousRoundPanel();
  const panel = document.createElement("div");
  panel.className = "previous-results-panel previous-results-message";
  panel.innerHTML = `
    <p class="eyebrow">Previous round</p>
    <h3>Results are not available yet</h3>
    <p>${escapeHtml(message)}</p>
  `;
  refs.resultPanel.append(panel);
}

function removePreviousRoundPanel() {
  refs.resultPanel.querySelector(".previous-results-panel")?.remove();
}

function appendResultWaitPanel() {
  const waitCard = document.createElement("div");
  waitCard.className = "waiting-card";
  waitCard.innerHTML = `
    <div>
      <p class="eyebrow">Auto-sync results</p>
      <h3>Waiting for ${escapeHtml(state.players[0])} to reveal the round</h3>
      <p>Leave this page open. When ${escapeHtml(state.players[0])} finishes guessing, the full round results will appear here automatically.</p>
    </div>
    <div class="waiting-dots" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  refs.resultPanel.append(waitCard);
}

function startResultPolling() {
  if (!state.gameId) {
    return;
  }

  stopResultPolling();
  checkForPublishedResults();
  state.resultPollTimer = window.setInterval(checkForPublishedResults, 2500);
}

function stopResultPolling() {
  if (!state.resultPollTimer) {
    return;
  }

  window.clearInterval(state.resultPollTimer);
  state.resultPollTimer = null;
}

async function checkForPublishedResults() {
  try {
    const response = await fetch(getResultMailboxUrl(), { cache: "no-store" });
    if (response.status === 404) {
      return;
    }
    if (!response.ok) {
      updateWaitStatus("Still waiting. If this page was opened from a local preview, automatic results need the deployed KitchenSync link.");
      return;
    }

    const payload = await response.json();
    if (payload?.phase !== "results" || clampRoundIndex(payload.roundIndex) !== state.roundIndex) {
      return;
    }

    stopResultPolling();
    renderRemoteLaunch(payload);
  } catch {
    updateWaitStatus("Still waiting. Automatic results will retry as soon as this device can reach KitchenSync.");
  }
}

async function publishRemoteResults() {
  if (state.flow !== "remote-return" || !state.gameId) {
    return;
  }

  try {
    const response = await fetch(getResultMailboxUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildResultsPayload())
    });

    addPublishStatus(response.ok
      ? `${state.players[1]}'s device will update automatically when it checks in.`
      : "Automatic result sync could not publish. The send-results button is still here as a backup.");
  } catch {
    addPublishStatus("Automatic result sync could not publish. The send-results button is still here as a backup.");
  }
}

function buildResultsPayload() {
  return {
    v: 1,
    phase: "results",
    gameId: ensureGameId(),
    players: state.players,
    roundIndex: state.roundIndex,
    scores: state.scores,
    p1Answers: collectRoundValues(state.answers[0]),
    p2Answers: collectRoundValues(state.answers[1]),
    p1Guesses: collectRoundValues(state.guesses[0][1]),
    p2Guesses: collectRoundValues(state.guesses[1][0])
  };
}

function getResultMailboxUrl(roundIndex = state.roundIndex) {
  return `/api/results/${encodeURIComponent(getResultMailboxId(roundIndex))}`;
}

function getResultMailboxId(roundIndex = state.roundIndex) {
  return `${ensureGameId()}-round-${roundIndex}`;
}

function updateWaitStatus(message) {
  const waitCard = refs.resultPanel.querySelector(".waiting-card p:last-child");
  if (waitCard) {
    waitCard.textContent = message;
  }
}

function addPublishStatus(message) {
  const row = refs.resultPanel.querySelector(".submit-row");
  if (!row || refs.resultPanel.querySelector(".result-publish-note")) {
    return;
  }

  const note = document.createElement("p");
  note.className = "result-publish-note";
  note.textContent = message;
  row.before(note);
}

function getRoundRevealActions() {
  if (["remote-return", "remote-results"].includes(state.flow) && state.roundIndex + 1 < TOTAL_ROUNDS) {
    return "";
  }
  if (state.roundIndex + 1 < TOTAL_ROUNDS) {
    return '<button class="primary-action" type="button" data-next-round>Next 5 Questions</button>';
  }
  return '<button class="primary-action" type="button" data-final>Final Score</button>';
}

function showFinalScore() {
  setScreenMode("reveal");
  renderScoreboard();
  const [firstScore, secondScore] = state.scores;
  const winner = firstScore === secondScore
    ? "It is a tie. Suspiciously balanced."
    : `${state.players[firstScore > secondScore ? 0 : 1]} wins the mind-reading contest.`;
  const leader = firstScore === secondScore ? "tie" : firstScore > secondScore ? 0 : 1;

  refs.resultPanel.classList.remove("hidden");
  refs.resultPanel.innerHTML = `
    <div class="result-hero final-hero">
      <div class="result-burst" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div>
        <p class="eyebrow">Final Score</p>
        <h2>${escapeHtml(winner)}</h2>
        <p>${escapeHtml(getFinalFlavor(firstScore, secondScore))}</p>
      </div>
      <div class="result-score">${Math.max(firstScore, secondScore)}/${QUESTIONS.length}</div>
    </div>
    <div class="player-result-grid">
      ${renderPlayerScoreTile({
        name: state.players[0],
        roundScore: firstScore,
        totalScore: firstScore,
        total: QUESTIONS.length,
        tone: leader === 0 ? "winner" : leader === 1 ? "runner" : "tie",
        label: "Final"
      })}
      ${renderPlayerScoreTile({
        name: state.players[1],
        roundScore: secondScore,
        totalScore: secondScore,
        total: QUESTIONS.length,
        tone: leader === 1 ? "winner" : leader === 0 ? "runner" : "tie",
        label: "Final"
      })}
    </div>
    <div class="submit-row">
      <button class="primary-action" type="button" data-restart>Play Again</button>
    </div>
  `;
  refs.resultPanel.querySelector("[data-restart]").addEventListener("click", () => window.location.reload());
  refs.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getRoundMessage(firstScore, secondScore) {
  if (firstScore === secondScore) {
    return "Perfectly synced this round.";
  }
  return `${state.players[firstScore > secondScore ? 0 : 1]} read the room better this round.`;
}

function getRoundFlavor(firstScore, secondScore, total) {
  const combined = firstScore + secondScore;
  if (firstScore === total && secondScore === total) {
    return "That was full KitchenSync. No crumbs left in the sink.";
  }
  if (combined >= total * 1.6) {
    return "High signal, low mystery. You two are dangerously readable.";
  }
  if (combined >= total) {
    return "A respectable sync rate, with just enough weirdness still uncharted.";
  }
  return "The sink is full of surprises. Honestly, that is half the fun.";
}

function getFinalFlavor(firstScore, secondScore) {
  if (firstScore === secondScore) {
    return "No winner, just two people with suspiciously balanced instincts.";
  }
  const gap = Math.abs(firstScore - secondScore);
  if (gap <= 3) {
    return "A close finish. The rematch has legal standing.";
  }
  return "A decisive read of the room. Frame the scoreboard.";
}

function getRoundLeader(firstScore, secondScore) {
  if (firstScore === secondScore) {
    return "tie";
  }
  return firstScore > secondScore ? 0 : 1;
}

function renderPlayerScoreTile({ name, roundScore, totalScore, total, tone, label = "Round" }) {
  return `
    <div class="player-score-card player-score-${tone}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(name)}</strong>
      <div>${roundScore}<small>/${total}</small></div>
      <p>${label === "Final" ? "Final score" : `Total score: ${totalScore}`}</p>
    </div>
  `;
}

function renderGuessResult({ guesserName, targetName, question, guessed, actual, matched, pointValue }) {
  return `
    <div class="guess-result ${matched ? "guess-result-hit" : "guess-result-miss"}">
      <div>
        <span>${matched ? `+${pointValue}` : "0"}</span>
        <strong>${escapeHtml(guesserName)} guessed ${escapeHtml(targetName)}</strong>
      </div>
      <p class="guess-status">${matched ? "Correct" : "Wrong"}</p>
      <p>Guessed: ${escapeHtml(question.options[guessed])}</p>
      <p>Answer: ${escapeHtml(question.options[actual])}</p>
    </div>
  `;
}

function renderScoreboard() {
  refs.scoreNameOne.textContent = state.players[0];
  refs.scoreNameTwo.textContent = state.players[1];
  refs.scoreValueOne.textContent = state.scores[0];
  refs.scoreValueTwo.textContent = state.scores[1];
}

function isComplete() {
  return state.selections.every(Number.isInteger);
}

function getRoundQuestions() {
  return getRoundQuestionsForRound(state.roundIndex);
}

function getRoundQuestionsForRound(roundIndex) {
  const start = roundIndex * ROUND_SIZE;
  const doublePointIndex = getDoublePointQuestionIndexForRound(roundIndex);
  return QUESTIONS.slice(start, start + ROUND_SIZE).map((question, offset) => ({
    question,
    localIndex: offset,
    originalIndex: start + offset,
    isDoublePoint: start + offset === doublePointIndex,
    pointValue: start + offset === doublePointIndex ? DOUBLE_POINT_VALUE : 1
  }));
}

function getDoublePointQuestionIndex() {
  return getDoublePointQuestionIndexForRound(state.roundIndex);
}

function getDoublePointQuestionIndexForRound(roundIndex) {
  const start = roundIndex * ROUND_SIZE;
  const questionCount = QUESTIONS.slice(start, start + ROUND_SIZE).length;
  if (!questionCount) {
    return start;
  }
  return start + ((roundIndex * 2 + 1) % questionCount);
}

function getMaxRoundScore() {
  return getRoundQuestions().reduce((total, question) => total + question.pointValue, 0);
}

function calculateRoundScore(guesserIndex, targetIndex) {
  return getRoundQuestions().reduce((total, { originalIndex, pointValue }) => {
    if (state.guesses[guesserIndex][targetIndex][originalIndex] === state.answers[targetIndex][originalIndex]) {
      return total + pointValue;
    }
    return total;
  }, 0);
}

function collectRoundValues(values) {
  return getRoundQuestions().map(({ originalIndex }) => values[originalIndex]);
}

function applyRemoteAnswers(playerIndex, values) {
  if (!Array.isArray(values)) {
    return;
  }

  getRoundQuestions().forEach(({ originalIndex }, localIndex) => {
    const value = Number(values[localIndex]);
    if (Number.isInteger(value) && value >= 0 && value <= 2) {
      state.answers[playerIndex][originalIndex] = value;
    }
  });
}

function applyRemoteGuesses(playerIndex, targetIndex, values) {
  if (!Array.isArray(values)) {
    return;
  }

  getRoundQuestions().forEach(({ originalIndex }, localIndex) => {
    const value = Number(values[localIndex]);
    if (Number.isInteger(value) && value >= 0 && value <= 2) {
      state.guesses[playerIndex][targetIndex][originalIndex] = value;
    }
  });
}

function buildRemoteUrl(payload) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("ks", encodePayload({ v: 1, ...payload }));
  return url.toString();
}

function ensureGameId() {
  if (state.gameId) {
    return state.gameId;
  }

  if (window.crypto?.randomUUID) {
    state.gameId = window.crypto.randomUUID();
  } else {
    state.gameId = `ks-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
  return state.gameId;
}

function encodePayload(payload) {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodePayload(value) {
  if (!value) {
    return null;
  }

  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    if (payload?.v !== 1 || !["p2", "return", "results"].includes(payload.phase)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function clampRoundIndex(value) {
  const roundIndex = Number(value);
  if (!Number.isInteger(roundIndex)) {
    return 0;
  }
  return Math.max(0, Math.min(TOTAL_ROUNDS - 1, roundIndex));
}

function isLoopbackUrl(value) {
  try {
    return ["127.0.0.1", "localhost", "::1"].includes(new URL(value).hostname);
  } catch {
    return false;
  }
}

function getAnsweredOverallCount() {
  return state.answers.flat().filter(Number.isInteger).length;
}

function formatGuess(question, guessed, actual, matched) {
  const marker = matched ? "Matched" : "Missed";
  return `${escapeHtml(marker)}. Guessed "${escapeHtml(question.options[guessed])}"; answer was "${escapeHtml(question.options[actual])}".`;
}

function cleanName(value, fallback) {
  const trimmed = String(value || "").trim();
  return trimmed || fallback;
}

function setScreenMode(mode) {
  document.body.dataset.screenMode = mode;
}

function normalizeQuestions(items) {
  return items
    .map((item) => ({
      prompt: item.prompt || item.question,
      options: item.options
    }))
    .filter((item) => item.prompt && Array.isArray(item.options) && item.options.length === 3);
}

async function copyShareUrl(url) {
  const button = refs.resultPanel.querySelector("[data-copy]");
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(url);
  } else {
    const input = refs.resultPanel.querySelector(".share-box input");
    input.focus();
    input.select();
    document.execCommand("copy");
  }
  button.textContent = "Copied";
  setTimeout(() => {
    button.textContent = "Copy Link";
  }, 1600);
}

async function shareUrl(url) {
  if (navigator.share) {
    await navigator.share({
      title: "KitchenSync",
      text: "Play KitchenSync with me and see if our answers line up.",
      url
    });
    return;
  }

  await copyShareUrl(url);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
