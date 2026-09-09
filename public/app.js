const socket = io();
const root = document.getElementById("app");
const toast = document.getElementById("toast");
const connectionPill = document.getElementById("connectionPill");
const confettiCanvas = document.getElementById("confettiCanvas");
const confettiContext = confettiCanvas.getContext("2d");
const SESSION_KEY = "threeWordsSession";
const ANSWER_DRAFTS_KEY = "threeWordsAnswerDrafts";

const state = {
  game: null,
  entryMode: "home",
  createMode: "classic",
  createTone: "mixed",
  createChoiceDeck: "balanced",
  createQuestionCount: 20,
  pendingOptionId: null,
  pendingPreferenceId: null,
  review: null,
  session: readSession(),
  answerDrafts: readAnswerDrafts(),
  discardedAnswerDraftKey: null,
  confetti: [],
  toastTimer: null,
  renderCount: 0
};

const inviteCode = new URLSearchParams(location.search).get("room")?.toUpperCase() || "";
if (inviteCode && !state.session) state.entryMode = "join";
if (state.session) state.entryMode = "restoring";

socket.on("connect", () => {
  connectionPill.classList.add("online");
  connectionPill.innerHTML = "<i></i> Live";
  if (state.session?.sessionToken) {
    socket.emit("restoreSession", { sessionToken: state.session.sessionToken });
  }
});

socket.on("disconnect", () => {
  connectionPill.classList.remove("online");
  connectionPill.innerHTML = "<i></i> Reconnecting";
});

socket.on("sessionEstablished", (session) => {
  state.session = session;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  history.replaceState(null, "", `${location.pathname}?room=${session.roomCode}`);
});

socket.on("sessionInvalid", () => {
  clearSession();
  state.entryMode = inviteCode ? "join" : "home";
  render();
});

socket.on("roomState", (game) => {
  captureVisibleAnswerDraft();
  const previousGame = state.game;
  const previousStatus = state.game?.status;
  state.game = game;
  if (state.discardedAnswerDraftKey && answerDraftKey(game) !== state.discardedAnswerDraftKey) {
    state.discardedAnswerDraftKey = null;
  }
  if (state.pendingOptionId && game.guessPhase?.reveal) state.pendingOptionId = null;
  if (previousStatus && previousStatus !== "RESULTS" && game.status === "RESULTS") burstConfetti(100);
  if (canKeepActiveAnswerForm(previousGame, game)) return;
  if (canKeepActiveGuessView(previousGame, game)) return;
  if (canKeepActivePreferenceView(previousGame, game)) return;
  if (canKeepWaitingScreen(previousGame, game)) {
    updateWaitingProgress(game);
    return;
  }
  render();
});

socket.on("gameError", ({ message, field }) => {
  showToast(message, true);
  if (field === "answer") document.getElementById("answerInput")?.focus();
  const lockButton = root.querySelector('[data-action="lock-guess"]');
  if (lockButton) {
    lockButton.textContent = "Lock in";
    lockButton.disabled = !state.pendingOptionId;
  }
  const nextButton = root.querySelector('[data-action="next-guess"]');
  if (nextButton) {
    nextButton.textContent = "Next →";
    nextButton.disabled = false;
  }
  const preferenceButton = root.querySelector('[data-action="lock-preference"]');
  if (preferenceButton) {
    preferenceButton.textContent = "Choose this one →";
    preferenceButton.disabled = !state.pendingPreferenceId;
  }
});

socket.on("answerLocked", () => {
  clearCurrentAnswerDraft();
  showToast("LOCKED IN.");
  burstConfetti(18);
});

socket.on("topicPassed", () => {
  clearCurrentAnswerDraft();
  showToast("New topic. No penalty.");
});
socket.on("preferenceLocked", () => {
  state.pendingPreferenceId = null;
  showToast("PICK LOCKED.");
  burstConfetti(10);
});
socket.on("reviewData", (review) => { state.review = review; render(); });

root.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;

  if (action === "choose-create") { state.createMode = "classic"; state.createTone = "mixed"; state.createChoiceDeck = "balanced"; state.createQuestionCount = 20; state.entryMode = "create"; render(); }
  if (action === "choose-compatibility") { state.createMode = "compatibility"; state.createTone = "mixed"; state.createChoiceDeck = "balanced"; state.createQuestionCount = 20; state.entryMode = "create"; render(); }
  if (action === "choose-would-you-rather") { state.createMode = "would-you-rather"; state.createChoiceDeck = "balanced"; state.createQuestionCount = 20; state.entryMode = "create"; render(); }
  if (action === "choose-join") { state.entryMode = "join"; render(); }
  if (action === "back-home") { state.entryMode = "home"; render(); }
  if (action === "copy-invite") await copyInvite();
  if (action === "ready") socket.emit("setReady");
  if (action === "start") socket.emit("startGame");
  if (action === "pass") socket.emit("passTopic");
  if (action === "start-guessing") socket.emit("startGuessing");
  if (action === "select-answer" && !state.game?.guessPhase?.reveal) {
    selectGuessOption(target.dataset.optionId);
  }
  if (action === "lock-guess" && state.pendingOptionId) {
    target.disabled = true;
    target.textContent = "Checking…";
    socket.emit("lockGuess", { optionId: state.pendingOptionId });
  }
  if (action === "next-guess") {
    target.disabled = true;
    target.textContent = "Next…";
    socket.emit("nextGuess");
  }
  if (action === "select-preference") selectPreferenceOption(target.dataset.optionId);
  if (action === "lock-preference" && state.pendingPreferenceId) {
    target.disabled = true;
    target.textContent = "Locking…";
    socket.emit("submitPreference", {
      questionId: state.game?.choicePhase?.current?.id,
      optionId: state.pendingPreferenceId
    });
  }
  if (action === "review") socket.emit("requestReview");
  if (action === "close-review") { state.review = null; render(); }
  if (action === "play-again") socket.emit("requestRematch", { mode: "playAgain" });
  if (action === "new-topics") socket.emit("requestRematch", { mode: "newTopics" });
  if (action === "leave-room") {
    clearSession();
    location.href = location.pathname;
  }
});

root.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.target.id === "createForm") {
    socket.emit("createRoom", {
      name: document.getElementById("createName").value,
      mode: document.querySelector('input[name="gameMode"]:checked')?.value || state.createMode,
      tone: document.querySelector('input[name="topicTone"]:checked')?.value || state.createTone,
      choiceDeck: document.querySelector('input[name="choiceDeck"]:checked')?.value || state.createChoiceDeck,
      questionCount: Number(document.querySelector('input[name="questionCount"]:checked')?.value || state.createQuestionCount)
    });
  }
  if (event.target.id === "joinForm") {
    socket.emit("joinRoom", {
      name: document.getElementById("joinName").value,
      roomCode: document.getElementById("joinCode").value
    });
  }
  if (event.target.id === "answerForm") {
    const input = document.getElementById("answerInput");
    socket.emit("submitAnswer", { answer: input.value });
  }
});

root.addEventListener("input", (event) => {
  if (event.target.id !== "answerInput") return;
  saveCurrentAnswerDraft(event.target.value);
  const count = countWords(event.target.value);
  const counter = document.getElementById("wordCounter");
  if (!counter) return;
  counter.textContent = `${count} / 3 words`;
  counter.classList.toggle("valid", count === 3);
});

root.addEventListener("change", (event) => {
  if (event.target.matches('input[name="gameMode"]')) {
    state.createMode = event.target.value;
    syncCreateOptions();
  }
  if (event.target.matches('input[name="topicTone"]')) state.createTone = event.target.value;
  if (event.target.matches('input[name="choiceDeck"]')) state.createChoiceDeck = event.target.value;
  if (event.target.matches('input[name="questionCount"]')) state.createQuestionCount = Number(event.target.value);
});

document.body.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  if (target.dataset.action === "fullscreen") toggleFullscreen();
  if (target.dataset.action === "home" && !state.game) { state.entryMode = "home"; render(); }
});

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "f" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
    event.preventDefault();
    toggleFullscreen();
  }
});

function render() {
  state.renderCount += 1;
  if (!state.game) {
    root.innerHTML = state.entryMode === "home" ? homeTemplate() : entryTemplate(state.entryMode);
    focusAnswerInput();
    return;
  }

  const game = state.game;
  if (game.status === "WAITING_FOR_PLAYER" || game.status === "READY") root.innerHTML = lobbyTemplate(game);
  if (game.status === "ANSWERING") root.innerHTML = game.self.finishedAnswerPhase ? answerWaitingTemplate(game) : answerTemplate(game);
  if (game.status === "GUESSING") {
    if (game.self.finishedGuessPhase) root.innerHTML = guessWaitingTemplate(game);
    else if (!game.self.guessStarted) root.innerHTML = roundTwoTemplate(game);
    else root.innerHTML = guessingTemplate(game);
  }
  if (game.status === "CHOOSING") root.innerHTML = game.self.finishedPreferencePhase ? preferenceWaitingTemplate(game) : wouldYouRatherTemplate(game);
  if (game.status === "RESULTS") root.innerHTML = resultsTemplate(game);
  if (state.review) root.insertAdjacentHTML("beforeend", reviewTemplate(state.review));
  focusAnswerInput();
}

function focusAnswerInput() {
  const input = document.getElementById("answerInput");
  if (!input) return;
  input.focus({ preventScroll: true });
  const cursorPosition = input.value.length;
  input.setSelectionRange(cursorPosition, cursorPosition);
}

function syncCreateOptions() {
  const wouldYouRatherMode = state.createMode === "would-you-rather";
  const tonePicker = document.getElementById("topicTonePicker");
  const choiceDeckPicker = document.getElementById("choiceDeckPicker");
  const questionCountPicker = document.getElementById("questionCountPicker");
  if (tonePicker) tonePicker.hidden = wouldYouRatherMode;
  if (choiceDeckPicker) choiceDeckPicker.hidden = !wouldYouRatherMode;
  if (questionCountPicker) questionCountPicker.hidden = !wouldYouRatherMode;
}

function homeTemplate() {
  return `
    <section class="screen hero">
      <p class="eyebrow">A game for two</p>
      <h1>THREE <span>WORDS.</span></h1>
      <p class="hero-subtitle">How well do you really know each other?</p>
      <div class="hero-actions">
        <button class="button" data-action="choose-create">Create game <b>＋</b></button>
        <button class="button secondary" data-action="choose-join">Join game <b>→</b></button>
      </div>
      <div class="game-invites">
        <article class="compatibility-invite">
          <div class="compatibility-invite-art" aria-hidden="true"><span>20</span><i></i><i></i><i></i></div>
          <div>
            <p class="eyebrow">Writing compatibility</p>
            <h2>Get your compatibility report.</h2>
            <p>Answer the same prompts in three words, read each other's minds, and see where you click.</p>
          </div>
          <button class="button small" data-action="choose-compatibility">Play with words →</button>
        </article>
        <article class="compatibility-invite wyr-invite">
          <div class="compatibility-invite-art wyr-art" aria-hidden="true"><span>A</span><b>B</b><em>C</em><strong>D</strong></div>
          <div>
            <p class="eyebrow">Four-choice compatibility</p>
            <h2>Would you rather?</h2>
            <p>Make 10, 20, 30, or 50 private picks, then reveal exactly where your instincts match.</p>
          </div>
          <button class="button small" data-action="choose-would-you-rather">Choose category & length →</button>
        </article>
      </div>
      <div class="how-grid" aria-label="How it works">
        ${howCard(1, "Choose your game, topic category, and question length.")}
        ${howCard(2, "Answer privately with three words or one of four picks.")}
        ${howCard(3, "Finish without seeing your partner's choices.")}
        ${howCard(4, "Unlock matches, insights, and conversation starters.")}
      </div>
    </section>`;
}

function entryTemplate(mode) {
  if (mode === "restoring") {
    return `<section class="screen narrow"><div class="panel lobby-center"><div class="waiting-orb"></div><p class="eyebrow">Finding your room</p><h2>Picking up where you left off…</h2></div></section>`;
  }
  const creating = mode === "create";
  return `
    <section class="screen narrow">
      <div class="panel">
        <p class="eyebrow">${creating ? "Start something good" : "Your person is waiting"}</p>
        <h2>${creating ? "Create a private game." : "Join the room."}</h2>
        <p class="panel-copy">${creating ? "We'll make a six-character code you can share." : "Enter the code from your invite and tell us what to call you."}</p>
        <form id="${creating ? "createForm" : "joinForm"}" class="form-grid">
          <div class="field">
            <label for="${creating ? "createName" : "joinName"}">Display name</label>
            <input class="text-input" id="${creating ? "createName" : "joinName"}" maxlength="24" autocomplete="name" placeholder="Your name" autofocus />
          </div>
          ${creating ? `${modePickerTemplate()}${tonePickerTemplate()}${choiceDeckPickerTemplate()}${questionCountPickerTemplate()}` : ""}
          ${creating ? "" : `<div class="field"><label for="joinCode">Room code</label><input class="text-input code-input" id="joinCode" maxlength="6" autocomplete="off" value="${escapeHtml(inviteCode)}" placeholder="ABC123" /></div>`}
          <div class="form-actions">
            <button class="button" type="submit">${creating ? "Create game" : "Join game"}</button>
            <button class="button ghost" type="button" data-action="back-home">Back</button>
          </div>
        </form>
      </div>
    </section>`;
}

function modePickerTemplate() {
  return `
    <fieldset class="mode-picker">
      <legend>Choose your game</legend>
      <label class="mode-choice">
        <input type="radio" name="gameMode" value="classic" ${state.createMode === "classic" ? "checked" : ""} />
        <span class="mode-choice-icon">10</span>
        <span><strong>Classic</strong><small>Different prompts · quick results</small></span>
        <i>Quick</i>
      </label>
      <label class="mode-choice featured">
        <input type="radio" name="gameMode" value="compatibility" ${state.createMode === "compatibility" ? "checked" : ""} />
        <span class="mode-choice-icon">20</span>
        <span><strong>Compatibility</strong><small>Shared prompts · full report</small></span>
        <i>New</i>
      </label>
      <label class="mode-choice wyr-mode-choice">
        <input type="radio" name="gameMode" value="would-you-rather" ${state.createMode === "would-you-rather" ? "checked" : ""} />
        <span class="mode-choice-icon">4×</span>
        <span><strong>Would You Rather</strong><small>Four choices · instant match report</small></span>
        <i>New</i>
      </label>
    </fieldset>`;
}

function tonePickerTemplate() {
  const tones = [
    { id: "mixed", icon: "✦", label: "Mixed bag", copy: "A little of everything" },
    { id: "silly", icon: "☻", label: "Silly", copy: "Light and ridiculous" },
    { id: "relationship", icon: "♡", label: "Relationship", copy: "All about connection" },
    { id: "deep", icon: "◇", label: "Deep", copy: "Values and vulnerability" },
    { id: "nostalgic", icon: "◷", label: "Nostalgic", copy: "Memories and firsts" }
  ];
  return `
    <fieldset id="topicTonePicker" class="tone-picker" ${state.createMode === "would-you-rather" ? "hidden" : ""}>
      <legend>Pick a topic tone</legend>
      <div class="tone-options">
        ${tones.map((tone) => `
          <label class="tone-choice">
            <input type="radio" name="topicTone" value="${tone.id}" ${state.createTone === tone.id ? "checked" : ""} />
            <span>${tone.icon}</span><strong>${tone.label}</strong><small>${tone.copy}</small>
          </label>`).join("")}
      </div>
    </fieldset>`;
}

function questionCountPickerTemplate() {
  return `
    <fieldset id="questionCountPicker" class="question-count-picker" ${state.createMode === "would-you-rather" ? "" : "hidden"}>
      <legend>How many questions?</legend>
      <div class="question-count-options">
        ${[10, 20, 30, 50].map((count) => `
          <label class="question-count-choice">
            <input type="radio" name="questionCount" value="${count}" ${state.createQuestionCount === count ? "checked" : ""} />
            <strong>${count}</strong><small>${count === 10 ? "Quick" : count === 20 ? "Classic" : count === 30 ? "Long" : "Deep dive"}</small>
          </label>`).join("")}
      </div>
      <p class="picker-note">Both players get the same questions. Picks stay private until the final reveal.</p>
    </fieldset>`;
}

function choiceDeckPickerTemplate() {
  const decks = [
    { id: "balanced", icon: "◇", label: "Balanced Mix", copy: "Play, life, connection & future" },
    { id: "silly", icon: "☻", label: "Silly & Random", copy: "Absurd, chaotic, zero-pressure fun" },
    { id: "adult", icon: "18+", label: "Adult & Intimacy", copy: "Mature and private · consenting adults" }
  ];
  return `
    <fieldset id="choiceDeckPicker" class="choice-deck-picker" ${state.createMode === "would-you-rather" ? "" : "hidden"}>
      <legend>Pick a question category</legend>
      <div class="choice-deck-options">
        ${decks.map((deck) => `
          <label class="choice-deck-choice ${deck.id === "adult" ? "adult" : ""}">
            <input type="radio" name="choiceDeck" value="${deck.id}" ${state.createChoiceDeck === deck.id ? "checked" : ""} />
            <span>${deck.icon}</span><strong>${deck.label}</strong><small>${deck.copy}</small>
          </label>`).join("")}
      </div>
      <p class="picker-note">The category applies to the whole game and is shown to both players before they start.</p>
    </fieldset>`;
}

function lobbyTemplate(game) {
  const opponent = game.opponent;
  const allReady = game.players.length === 2 && game.players.every((player) => player.ready);
  const compatibilityMode = game.mode?.id === "compatibility";
  const wouldYouRatherMode = game.mode?.id === "would-you-rather";
  const modeBadge = wouldYouRatherMode
    ? `◇ Would You Rather · ${game.totalQuestions} shared choices`
    : compatibilityMode
      ? "✦ Compatibility · 20 shared prompts"
      : "Classic · 10 prompts each";
  return `
    <section class="screen narrow">
      <div class="panel">
        <div class="room-topline">
          <div class="room-code">Room <strong>${game.roomCode}</strong><button data-action="copy-invite" aria-label="Copy invite">⧉</button></div>
          <button class="button ghost small" data-action="leave-room">Leave</button>
        </div>
        <div class="lobby-center">
          <div class="lobby-badges">
            <div class="mode-badge ${compatibilityMode || wouldYouRatherMode ? "compatibility" : ""}">${modeBadge}</div>
            ${wouldYouRatherMode
              ? `<div class="choice-deck-badge ${game.choiceDeck?.adult ? "adult" : ""}">${escapeHtml(game.choiceDeck?.icon || "◇")} ${escapeHtml(game.choiceDeck?.label || "Balanced mix")}</div>`
              : `<div class="tone-badge">${escapeHtml(game.tone?.icon || "✦")} ${escapeHtml(game.tone?.label || "Mixed bag")} topics</div>`}
          </div>
          ${game.choiceDeck?.adult ? `<p class="adult-lobby-note"><strong>Adults only.</strong> This round includes mature questions about intimacy, preferences, and boundaries. Make sure both players are comfortable before starting.</p>` : ""}
          <div class="waiting-orb"></div>
          <p class="eyebrow">${opponent ? "The room is full" : "Invite sent. Good vibes pending."}</p>
          <h2>${opponent ? "Both players ready?" : "Waiting for player two…"}</h2>
          <p class="panel-copy">${opponent ? "Tap ready when you're set. The room creator starts the game." : "Share the invite link or room code. We'll keep this screen in sync."}</p>
          <div class="player-row">
            ${playerChip(game.self.name, game.self.ready, true, true)}
            <span class="versus">AND</span>
            ${opponent ? playerChip(opponent.name, game.players.find((p) => p.id === opponent.id)?.ready, opponent.connected, false) : playerChip("Waiting…", false, false, false)}
          </div>
          ${opponent ? `<button class="button ${game.self.ready ? "secondary" : ""}" data-action="ready">${game.self.ready ? "You're ready ✓" : "I'm ready"}</button>` : `<button class="button" data-action="copy-invite">Copy invite link</button>`}
          ${game.isHost && opponent ? `<div style="margin-top:10px"><button class="button secondary" data-action="start" ${allReady ? "" : "disabled"}>Start game →</button></div>` : ""}
        </div>
      </div>
    </section>`;
}

function answerTemplate(game) {
  const phase = game.answerPhase;
  const topic = phase.currentTopic;
  const draft = getAnswerDraft(game, topic.id);
  const draftWordCount = countWords(draft);
  return `
    <section class="screen topic-shell">
      <div class="game-meta"><span>Topic ${phase.completed + 1} of ${phase.total}</span><span>Room ${game.roomCode}</span></div>
      <article class="topic-card" key="${topic.id}">
        <div class="topic-label">${game.mode?.id === "compatibility" ? "Compatibility · " : ""}${game.tone?.id !== "mixed" ? `${escapeHtml(game.tone?.label)} topics` : (topic.category === "adult" ? "Grown-up topic" : categoryName(topic.category))}</div>
        <h1>${escapeHtml(topic.text)}</h1>
        <p class="prompt">What's your immediate reaction?</p>
      </article>
      <form id="answerForm" class="answer-form">
        <div class="answer-input-wrap">
          <input id="answerInput" class="text-input answer-input" maxlength="100" placeholder="Three words only…" autocomplete="off" aria-label="Your three word answer" value="${escapeHtml(draft)}" autofocus />
          <span id="wordCounter" class="word-counter ${draftWordCount === 3 ? "valid" : ""}">${draftWordCount} / 3 words</span>
        </div>
        <div class="answer-actions">
          <button type="submit" class="button">Submit answer →</button>
          <button type="button" class="button ghost" data-action="pass">Pass</button>
        </div>
      </form>
      ${progress(phase.completed, phase.total)}
    </section>`;
}

function answerWaitingTemplate(game) {
  const completed = game.opponent?.answerProgress || 0;
  const total = game.totalQuestions || 10;
  return `
    <section class="screen waiting-screen">
      <div class="done-burst">✓</div>
      <p class="eyebrow">${total} answers locked</p>
      <h1>YOU'RE<br>DONE!</h1>
      <p>Waiting for ${escapeHtml(game.opponent?.name || "your partner")} to finish their topics…</p>
      <div class="mini-progress">${Array.from({ length: total }, (_, index) => `<i class="${index < completed ? "done" : ""}"></i>`).join("")}</div>
    </section>`;
}

function wouldYouRatherTemplate(game) {
  const phase = game.choicePhase;
  const question = phase?.current;
  if (!question) return `<section class="screen waiting-screen"><div class="waiting-orb"></div><h1>Finding your next choice…</h1></section>`;
  return `
    <section class="screen choice-shell">
      <div class="game-meta"><span>Question ${phase.completed + 1} of ${phase.total}</span><span>Room ${game.roomCode}</span></div>
      <header class="choice-heading">
        <p class="eyebrow">${game.choiceDeck?.adult ? "18+ · " : ""}${wouldYouRatherCategoryName(question.category)}</p>
        <h1>WOULD YOU<br><span>RATHER?</span></h1>
        <p>${escapeHtml(question.prompt)}</p>
      </header>
      <div class="preference-options" role="group" aria-label="Choose your preferred option">
        ${question.options.map((option, index) => `
          <button class="preference-option ${state.pendingPreferenceId === option.id ? "selected" : ""}" data-action="select-preference" data-option-id="${option.id}">
            <span>${String.fromCharCode(65 + index)}</span><strong>${escapeHtml(option.text)}</strong><i></i>
          </button>`).join("")}
      </div>
      <button class="button full preference-lock" data-action="lock-preference" ${state.pendingPreferenceId ? "" : "disabled"}>Choose this one →</button>
      <p class="choice-privacy">${game.choiceDeck?.adult ? "Private and consensual: any answer can be a boundary. " : ""}Your pick stays hidden until you both finish.</p>
      ${progress(phase.completed, phase.total)}
    </section>`;
}

function preferenceWaitingTemplate(game) {
  const completed = game.opponent?.choiceProgress || 0;
  const total = game.totalQuestions || 20;
  return `
    <section class="screen waiting-screen">
      <div class="done-burst">✓</div>
      <p class="eyebrow">${total} choices locked</p>
      <h1>PICKS<br>ARE IN!</h1>
      <p>Waiting for ${escapeHtml(game.opponent?.name || "your partner")} to finish choosing…</p>
      <div class="mini-progress compact">${Array.from({ length: total }, (_, index) => `<i class="${index < completed ? "done" : ""}"></i>`).join("")}</div>
    </section>`;
}

function roundTwoTemplate(game) {
  const compatibilityMode = game.mode?.id === "compatibility";
  return `
    <section class="screen">
      <div class="panel round-two-card">
        <div class="round-number">02</div>
        <p class="eyebrow" style="margin-top:28px">Round two</p>
        <h1>How well do you know them?</h1>
        <p>${compatibilityMode ? `You both answered the same ${game.totalQuestions} prompts. Now see how accurately you can spot ${escapeHtml(game.opponent.name)}'s words.` : `You'll see the topics ${escapeHtml(game.opponent.name)} answered. One answer is real. Two are believable fakes. Pick the one they actually wrote.`}</p>
        <button class="button" data-action="start-guessing">Start guessing →</button>
      </div>
    </section>`;
}

function guessingTemplate(game) {
  const phase = game.guessPhase;
  if (!phase?.current) return `<section class="screen waiting-screen"><div class="waiting-orb"></div><h1>Building your first guess…</h1></section>`;
  const reveal = phase.reveal;
  return `
    <section class="screen narrow">
      <div class="game-meta"><span>Guess ${Math.min(phase.completed + (reveal ? 0 : 1), phase.total)} of ${phase.total}</span><span>Score ${game.self.score}</span></div>
      <div class="guess-topic">
        <p class="eyebrow">Topic</p>
        <h1>${escapeHtml(phase.current.topicText)}</h1>
        <p>Which answer did ${escapeHtml(game.opponent.name)} actually write?</p>
      </div>
      <div class="answer-options">
        ${phase.current.options.map((option) => answerOption(option, reveal)).join("")}
      </div>
      ${reveal ? revealTemplate(reveal) : `<button class="button full guess-lock" data-action="lock-guess" ${state.pendingOptionId ? "" : "disabled"}>Lock in</button>`}
      ${progress(phase.completed, phase.total)}
    </section>`;
}

function answerOption(option, reveal) {
  let className = state.pendingOptionId === option.id ? "selected" : "";
  if (reveal && option.text === reveal.realAnswer) className = "correct";
  else if (reveal && option.text === reveal.selectedAnswer && !reveal.correct) className = "wrong";
  return `<button class="answer-option ${className}" data-action="select-answer" data-option-id="${option.id}" ${reveal ? "disabled" : ""}>${escapeHtml(option.text)}</button>`;
}

function revealTemplate(reveal) {
  return `
    <div class="reveal-card ${reveal.correct ? "correct" : "wrong"}">
      <div class="reveal-title">${reveal.correct ? "✓ YOU GOT IT" : "✕ NOT THIS TIME"}</div>
      <p>${reveal.correct ? "They actually wrote" : `You guessed <strong>“${escapeHtml(reveal.selectedAnswer)}”</strong><br>They actually wrote`}<br><strong>“${escapeHtml(reveal.realAnswer)}”</strong></p>
      <button class="button small" data-action="next-guess">Next →</button>
    </div>`;
}

function guessWaitingTemplate(game) {
  const completed = game.opponent?.guessProgress || 0;
  const total = game.totalQuestions || 10;
  return `
    <section class="screen waiting-screen">
      <div class="done-burst">✓</div>
      <p class="eyebrow">Your guesses are in</p>
      <h1>NICE<br>WORK.</h1>
      <p>Waiting for ${escapeHtml(game.opponent?.name || "your partner")} to finish guessing…</p>
      <div class="mini-progress">${Array.from({ length: total }, (_, index) => `<i class="${index < completed ? "done" : ""}"></i>`).join("")}</div>
    </section>`;
}

function resultsTemplate(game) {
  if (game.results.wouldYouRather) return wouldYouRatherReportTemplate(game);
  if (game.results.compatibility) return compatibilityReportTemplate(game);
  const rematchCount = game.players.filter((player) => player.rematchReady).length;
  const total = game.results.total || game.totalQuestions || 10;
  return `
    <section class="screen narrow">
      <div class="results-head">
        <p class="eyebrow">The verdict is in</p>
        <h1>RESULTS</h1>
      </div>
      <div class="score-grid">
        ${game.results.scores.map((result) => `<article class="score-card"><small>${escapeHtml(result.name)} knew ${escapeHtml(result.opponentName)}</small><h2>${result.score}<span> / ${total}</span></h2></article>`).join("")}
      </div>
      <p class="results-summary">“${escapeHtml(game.results.summary)}”</p>
      <div class="results-actions">
        <button class="button secondary" data-action="review">Review answers</button>
        <button class="button" data-action="play-again" ${game.self.rematchReady ? "disabled" : ""}>Play again</button>
        <button class="button secondary" data-action="new-topics" ${game.self.rematchReady ? "disabled" : ""}>New topics</button>
      </div>
      ${rematchCount ? `<p class="rematch-note">${rematchCount === 2 ? "Starting the next game…" : `Waiting for ${escapeHtml(game.opponent.name)} to play again…`}</p>` : ""}
    </section>`;
}

function wouldYouRatherReportTemplate(game) {
  const report = game.results.wouldYouRather;
  const deck = game.choiceDeck || report.deck || { label: "Would You Rather", adult: false };
  const rematchCount = game.players.filter((player) => player.rematchReady).length;
  return `
    <section class="screen compatibility-report choice-report">
      <header class="report-heading">
        <p class="eyebrow">Your ${escapeHtml(deck.label)} results${deck.adult ? " · 18+" : ""}</p>
        <div class="report-names"><span>${escapeHtml(report.players[0].name)}</span><i>＋</i><span>${escapeHtml(report.players[1].name)}</span></div>
        <h1>${escapeHtml(report.tier)}</h1>
      </header>

      <section class="report-hero-card choice-report-hero">
        <div class="compatibility-orbit" style="--score:${report.matchPercent}">
          <svg viewBox="0 0 160 160" aria-hidden="true">
            <defs><linearGradient id="reportGradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#66d8ff"/><stop offset=".52" stop-color="#a66cff"/><stop offset="1" stop-color="#ff7fb7"/></linearGradient></defs>
            <circle class="orbit-track" cx="80" cy="80" r="68" pathLength="100" />
            <circle class="orbit-value" cx="80" cy="80" r="68" pathLength="100" />
          </svg>
          <div><strong>${report.matchPercent}<small>%</small></strong><span>exact pick match</span></div>
          <i class="orbit-spark spark-one">◇</i><i class="orbit-spark spark-two">✦</i>
        </div>
        <div class="report-verdict">
          <p class="eyebrow">The big reveal</p>
          <h2>${escapeHtml(report.summary)}</h2>
          <p>You chose the exact same option on <strong>${report.matchCount} of ${report.totalQuestions}</strong> questions. Different picks are not bad news—they are the interesting part.</p>
          <div class="report-formula"><span>${report.matchCount} same picks</span><b>＋</b><span>${report.differenceCount} conversation starters</span></div>
        </div>
      </section>

      <section class="choice-summary-grid" aria-label="Would You Rather result summary">
        <article><span>◎</span><strong>${report.matchCount}</strong><small>Exact matches</small></article>
        <article><span>↗</span><strong>${report.differenceCount}</strong><small>Different picks</small></article>
        <article><span>□</span><strong>${report.totalQuestions}</strong><small>Total questions</small></article>
      </section>

      <section class="category-report">
        <div class="section-heading">
          <div><p class="eyebrow">Your match map</p><h2>Where instincts align.</h2></div>
          <p>Each category shows the percentage of questions where you made the exact same choice.</p>
        </div>
        <div class="category-visuals">
          ${compatibilityRadar(report.categories, "Match map")}
          <div class="category-bars">
            ${report.categories.map((category, index) => `
              <div class="category-bar" style="--delay:${index * 90}ms">
                <div><span>${escapeHtml(category.label)}</span><strong>${category.matchCount}/${category.questionCount} · ${category.score}%</strong></div>
                <i><b style="--value:${category.score}"></b></i>
              </div>`).join("")}
          </div>
        </div>
      </section>

      <section class="report-highlights choice-highlights">
        ${report.highlights.map((highlight, index) => `
          <article style="--delay:${index * 90}ms">
            <small>${escapeHtml(highlight.kicker)}</small>
            <h3>${escapeHtml(highlight.value)}</h3>
            <p>${escapeHtml(highlight.copy)}</p>
          </article>`).join("")}
      </section>

      <section class="report-deep-dive">
        <div class="section-heading">
          <div><p class="eyebrow">Every answer revealed</p><h2>Compare your picks.</h2></div>
          <p>Open a category to see exactly what each person chose on every question.</p>
        </div>
        <div class="category-accordions">
          ${report.categories.map((category) => wouldYouRatherCategoryAccordion(category)).join("")}
        </div>
      </section>

      <p class="report-disclaimer">${deck.adult ? "For consenting adults. Preferences are conversation starters, never obligations. " : ""}For fun, not science. A different pick is not a compatibility verdict.</p>
      <div class="results-actions report-actions">
        <button class="button" data-action="play-again" ${game.self.rematchReady ? "disabled" : ""}>Play again</button>
        <button class="button secondary" data-action="new-topics" ${game.self.rematchReady ? "disabled" : ""}>New questions</button>
      </div>
      ${rematchCount ? `<p class="rematch-note">${rematchCount === 2 ? "Starting the next set…" : `Waiting for ${escapeHtml(game.opponent.name)} to play again…`}</p>` : ""}
    </section>`;
}

function wouldYouRatherCategoryAccordion(category) {
  return `
    <details class="category-accordion choice-accordion">
      <summary>
        <span class="category-symbol">${wouldYouRatherCategoryIcon(category.id)}</span>
        <span><strong>${escapeHtml(category.label)}</strong><small>${category.matchCount} of ${category.questionCount} matched</small></span>
        <b>${category.score}%</b><i>＋</i>
      </summary>
      <div class="category-detail">
        <div class="compatibility-answers">
          ${category.entries.map((entry) => `
            <article class="preference-result ${entry.matched ? "matched" : "different"}">
              <div class="compatibility-topic"><span>${escapeHtml(entry.prompt)}</span><b>${entry.matched ? "✓ Same pick" : "↗ Different picks"}</b></div>
              <div class="answer-comparison">
                ${entry.choices.map((choice) => `<p><small>${escapeHtml(choice.name)}</small><strong>${escapeHtml(choice.text)}</strong></p>`).join("")}
              </div>
            </article>`).join("")}
        </div>
      </div>
    </details>`;
}

function compatibilityReportTemplate(game) {
  const report = game.results.compatibility;
  const rematchCount = game.players.filter((player) => player.rematchReady).length;
  const focusedReport = report.categories.length === 1;
  return `
    <section class="screen compatibility-report">
      <header class="report-heading">
        <p class="eyebrow">Your ${game.tone?.id !== "mixed" ? `${escapeHtml(game.tone?.label).toLowerCase()} ` : ""}compatibility report</p>
        <div class="report-names"><span>${escapeHtml(report.players[0].name)}</span><i>＋</i><span>${escapeHtml(report.players[1].name)}</span></div>
        <h1>${escapeHtml(report.tier)}</h1>
      </header>

      <section class="report-hero-card">
        <div class="compatibility-orbit" style="--score:${report.overall}">
          <svg viewBox="0 0 160 160" aria-hidden="true">
            <defs><linearGradient id="reportGradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#9d62ff"/><stop offset=".52" stop-color="#f15ea8"/><stop offset="1" stop-color="#ff9e5e"/></linearGradient></defs>
            <circle class="orbit-track" cx="80" cy="80" r="68" pathLength="100" />
            <circle class="orbit-value" cx="80" cy="80" r="68" pathLength="100" />
          </svg>
          <div><strong>${report.overall}<small>%</small></strong><span>overall connection</span></div>
          <i class="orbit-spark spark-one">✦</i><i class="orbit-spark spark-two">✦</i>
        </div>
        <div class="report-verdict">
          <p class="eyebrow">The vibe check</p>
          <h2>${escapeHtml(report.summary)}</h2>
          <p>Built from how closely your real answers aligned, how well you spotted each other's words, and how balanced that understanding was.</p>
          <div class="report-formula"><span>Answer alignment</span><b>＋</b><span>Mind reading</span><b>＋</b><span>Balance</span></div>
        </div>
      </section>

      <section class="report-metrics" aria-label="Compatibility score details">
        ${reportMetric("Same-page energy", report.answerAlignment, "How closely your answers and emotional tone matched.", "✦")}
        ${reportMetric("Mind-reading score", report.mutualKnowledge, "Your combined accuracy guessing each other's real answers.", "◎")}
        ${reportMetric("Two-way balance", report.balance, "How evenly you understood one another across the game.", "↔")}
      </section>

      <section class="category-report">
        <div class="section-heading">
          <div><p class="eyebrow">Your connection map</p><h2>Where you click.</h2></div>
          <p>${focusedReport ? "This category blends answer similarity with how accurately you read each other." : "Every category blends answer similarity with how accurately you read each other."}</p>
        </div>
        <div class="category-visuals">
          ${compatibilityRadar(report.categories)}
          <div class="category-bars">
            ${report.categories.map((category, index) => `
              <div class="category-bar" style="--delay:${index * 90}ms">
                <div><span>${escapeHtml(category.label)}</span><strong>${category.score}%</strong></div>
                <i><b style="--value:${category.score}"></b></i>
              </div>`).join("")}
          </div>
        </div>
      </section>

      <section class="report-highlights">
        ${report.highlights.map((highlight, index) => `
          <article style="--delay:${index * 90}ms">
            <small>${escapeHtml(highlight.kicker)}</small>
            <h3>${escapeHtml(highlight.value)}</h3>
            <p>${escapeHtml(highlight.copy)}</p>
          </article>`).join("")}
      </section>

      <section class="report-deep-dive">
        <div class="section-heading">
          <div><p class="eyebrow">Go deeper</p><h2>Open up the ${focusedReport ? "category" : "categories"}.</h2></div>
          <p>Compare what you each wrote and find the prompts worth talking about next.</p>
        </div>
        <div class="category-accordions">
          ${report.categories.map((category) => categoryAccordion(category)).join("")}
        </div>
      </section>

      <p class="report-disclaimer">For fun, not science. Compatibility is bigger than any score—and the differences are often the best part.</p>
      <div class="results-actions report-actions">
        <button class="button secondary" data-action="review">Review every guess</button>
        <button class="button" data-action="play-again" ${game.self.rematchReady ? "disabled" : ""}>Play again</button>
        <button class="button secondary" data-action="new-topics" ${game.self.rematchReady ? "disabled" : ""}>New report</button>
      </div>
      ${rematchCount ? `<p class="rematch-note">${rematchCount === 2 ? "Starting the next compatibility check…" : `Waiting for ${escapeHtml(game.opponent.name)} to play again…`}</p>` : ""}
    </section>`;
}

function reportMetric(label, value, copy, icon) {
  return `
    <article class="report-metric" style="--value:${value}">
      <div class="metric-top"><span>${icon}</span><strong>${value}%</strong></div>
      <h3>${escapeHtml(label)}</h3>
      <p>${escapeHtml(copy)}</p>
      <i><b></b></i>
    </article>`;
}

function compatibilityRadar(categories, chartLabel = "Connection map") {
  if (categories.length === 1) {
    const category = categories[0];
    return `
      <div class="radar-wrap focused" aria-label="${escapeHtml(category.label)} compatibility score: ${category.score} percent">
        <div class="radar-glow"></div>
        <svg viewBox="0 0 220 220" role="img">
          <circle class="focus-radar-track" cx="110" cy="110" r="78" pathLength="100" />
          <circle class="focus-radar-value" cx="110" cy="110" r="78" pathLength="100" style="--value:${category.score}" />
        </svg>
        <div class="focus-radar-score"><strong>${category.score}%</strong><span>${escapeHtml(category.label)}</span></div>
      </div>`;
  }
  const center = 110;
  const radius = 78;
  const points = categories.map((category, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / categories.length;
    const scaledRadius = radius * Math.max(0.08, category.score / 100);
    return `${(center + Math.cos(angle) * scaledRadius).toFixed(1)},${(center + Math.sin(angle) * scaledRadius).toFixed(1)}`;
  }).join(" ");
  const outerPoints = categories.map((_category, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / categories.length;
    return `${(center + Math.cos(angle) * radius).toFixed(1)},${(center + Math.sin(angle) * radius).toFixed(1)}`;
  }).join(" ");
  const axes = categories.map((_category, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / categories.length;
    return `<line x1="${center}" y1="${center}" x2="${(center + Math.cos(angle) * radius).toFixed(1)}" y2="${(center + Math.sin(angle) * radius).toFixed(1)}" />`;
  }).join("");
  return `
    <div class="radar-wrap" aria-label="${escapeHtml(chartLabel)} category radar chart">
      <div class="radar-glow"></div>
      <svg viewBox="0 0 220 220" role="img">
        <polygon class="radar-grid outer" points="${outerPoints}" />
        <polygon class="radar-grid inner" points="${outerPoints}" transform="translate(${center} ${center}) scale(.55) translate(${-center} ${-center})" />
        <g class="radar-axes">${axes}</g>
        <polygon class="radar-shape" points="${points}" />
        ${points.split(" ").map((point) => { const [x, y] = point.split(","); return `<circle cx="${x}" cy="${y}" r="4" />`; }).join("")}
      </svg>
      <span>${escapeHtml(chartLabel)}</span>
    </div>`;
}

function categoryAccordion(category) {
  return `
    <details class="category-accordion">
      <summary>
        <span class="category-symbol">${categoryIcon(category.id)}</span>
        <span><strong>${escapeHtml(category.label)}</strong><small>${category.questionCount} shared prompt${category.questionCount === 1 ? "" : "s"}</small></span>
        <b>${category.score}%</b><i>＋</i>
      </summary>
      <div class="category-detail">
        <div class="category-detail-metrics">
          <span>Answer alignment <b>${category.alignment}%</b></span>
          <span>Mind reading <b>${category.knowledge}%</b></span>
        </div>
        <div class="compatibility-answers">
          ${category.entries.map((entry) => `
            <article>
              <div class="compatibility-topic"><span>${escapeHtml(entry.topic)}</span><b>${entry.similarity}% similar</b></div>
              <div class="answer-comparison">
                ${entry.answers.map((answer) => `<p><small>${escapeHtml(answer.name)}</small><strong>“${escapeHtml(answer.text)}”</strong></p>`).join("")}
              </div>
              <div class="guess-comparison">
                ${entry.guesses.map((guess) => `<span class="${guess.correct ? "correct" : "missed"}">${guess.correct ? "✓" : "○"} ${escapeHtml(guess.name)} ${guess.correct ? "called it" : "was surprised"}</span>`).join("")}
              </div>
            </article>`).join("")}
        </div>
      </div>
    </details>`;
}

function categoryIcon(category) {
  return ({ random: "✦", nostalgia: "◷", life: "↗", relationships: "♡", deep: "◇", adult: "⚡" })[category] || "•";
}

function reviewTemplate(review) {
  return `
    <div class="review-overlay">
      <div class="review-dialog">
        <div class="review-header"><div><p class="eyebrow">No more secrets</p><h2>Review answers</h2></div><button class="button secondary small" data-action="close-review">Close</button></div>
        <div class="review-columns">
          ${review.map((column) => `<section class="review-column"><h3>${escapeHtml(column.answeringPlayer)}'s answers</h3>${column.entries.map((entry) => `<article class="review-entry"><small>${escapeHtml(entry.topic)}</small><strong>“${escapeHtml(entry.answer)}”</strong><p>${escapeHtml(column.guessingPlayer)} guessed “${escapeHtml(entry.guessed)}” <span class="${entry.correct ? "correct-text" : "wrong-text"}">${entry.correct ? "✓ Correct" : "✕ Missed"}</span></p></article>`).join("")}</section>`).join("")}
        </div>
      </div>
    </div>`;
}

function howCard(number, copy) { return `<article class="how-card"><span>${number}</span><p>${copy}</p></article>`; }

function playerChip(name, ready, connected, self) {
  return `<div class="player-chip ${connected ? "" : "offline"}"><div class="avatar">${escapeHtml(name.charAt(0).toUpperCase() || "?")}</div><strong>${escapeHtml(name)}${self ? " (you)" : ""}</strong><small>${connected ? (ready ? "Ready ✓" : "Not ready") : "Offline"}</small></div>`;
}

function progress(value, total) {
  const percent = Math.max(0, Math.min(100, (value / total) * 100));
  return `<div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div><div class="progress-caption"><span>Your progress</span><span>${value} / ${total}</span></div>`;
}

function categoryName(category) {
  return ({ random: "Funny / random", nostalgia: "Nostalgia", life: "Personality / life", relationships: "Relationships", deep: "Deep / meaningful" })[category] || category;
}

function wouldYouRatherCategoryName(category) {
  return ({
    play: "Play style", everyday: "Everyday rhythm", adventure: "Adventure mode", connection: "Connection style", future: "Future vision",
    absurd: "Pure absurdity", "food-chaos": "Food chaos", "social-chaos": "Social chaos", "weird-powers": "Weird powers", "random-life": "Random life",
    chemistry: "Chemistry", bedroom: "Bedroom style", exploration: "Exploration", communication: "Communication", aftercare: "Aftercare"
  })[category] || category;
}

function wouldYouRatherCategoryIcon(category) {
  return ({
    play: "✦", everyday: "⌂", adventure: "↗", connection: "♡", future: "◇",
    absurd: "?!", "food-chaos": "♨", "social-chaos": "☻", "weird-powers": "⚡", "random-life": "⌁",
    chemistry: "✦", bedroom: "☾", exploration: "↗", communication: "◌", aftercare: "♡"
  })[category] || "•";
}

function countWords(value) {
  return (String(value || "").match(/[\p{L}\p{N}]+(?:['’\-‐‑–—][\p{L}\p{N}]+)*/gu) || []).length;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

async function copyInvite() {
  const code = state.game?.roomCode || state.session?.roomCode;
  if (!code) return;
  const url = new URL(location.origin + location.pathname);
  url.searchParams.set("room", code);
  try {
    await navigator.clipboard.writeText(url.toString());
    showToast("Invite link copied.");
  } catch {
    showToast(`Room code: ${code}`);
  }
}

function showToast(message, isError = false) {
  clearTimeout(state.toastTimer);
  toast.textContent = message;
  toast.className = `toast show${isError ? " error" : ""}`;
  state.toastTimer = setTimeout(() => { toast.className = "toast"; }, 2300);
}

function readSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
}

function readAnswerDrafts() {
  try {
    const drafts = JSON.parse(sessionStorage.getItem(ANSWER_DRAFTS_KEY) || "{}");
    return drafts && typeof drafts === "object" && !Array.isArray(drafts) ? drafts : {};
  } catch {
    return {};
  }
}

function answerDraftKey(game = state.game, topicId = game?.answerPhase?.currentTopic?.id) {
  if (!game?.roomCode || !game?.self?.id || !topicId) return null;
  return `${game.roomCode}:${game.gameNumber}:${game.self.id}:${topicId}`;
}

function getAnswerDraft(game, topicId) {
  const key = answerDraftKey(game, topicId);
  return key ? state.answerDrafts[key] || "" : "";
}

function saveCurrentAnswerDraft(value) {
  const key = answerDraftKey();
  if (!key || key === state.discardedAnswerDraftKey) return;
  state.answerDrafts[key] = String(value || "");
  persistAnswerDrafts();
}

function captureVisibleAnswerDraft() {
  const input = document.getElementById("answerInput");
  if (input) saveCurrentAnswerDraft(input.value);
}

function clearCurrentAnswerDraft() {
  const key = answerDraftKey();
  if (!key) return;
  delete state.answerDrafts[key];
  state.discardedAnswerDraftKey = key;
  persistAnswerDrafts();
}

function persistAnswerDrafts() {
  try {
    sessionStorage.setItem(ANSWER_DRAFTS_KEY, JSON.stringify(state.answerDrafts));
  } catch {
    // Drafts still remain in memory when browser storage is unavailable.
  }
}

function canKeepActiveAnswerForm(previousGame, nextGame) {
  const previousTopicId = previousGame?.answerPhase?.currentTopic?.id;
  const nextTopicId = nextGame?.answerPhase?.currentTopic?.id;
  return Boolean(
    document.getElementById("answerInput") &&
    previousGame?.status === "ANSWERING" &&
    nextGame?.status === "ANSWERING" &&
    previousTopicId &&
    previousTopicId === nextTopicId &&
    previousGame.self.answerProgress === nextGame.self.answerProgress
  );
}

function canKeepActiveGuessView(previousGame, nextGame) {
  if (
    previousGame?.status !== "GUESSING" ||
    nextGame?.status !== "GUESSING" ||
    !previousGame.self?.guessStarted ||
    !nextGame.self?.guessStarted ||
    previousGame.self.finishedGuessPhase ||
    nextGame.self.finishedGuessPhase
  ) return false;

  const previousPhase = previousGame.guessPhase;
  const nextPhase = nextGame.guessPhase;
  if (!previousPhase?.current || !nextPhase?.current) return false;
  return previousGame.self.guessProgress === nextGame.self.guessProgress &&
    previousGame.self.score === nextGame.self.score &&
    previousPhase.current.topicId === nextPhase.current.topicId &&
    JSON.stringify(previousPhase.current.options) === JSON.stringify(nextPhase.current.options) &&
    JSON.stringify(previousPhase.reveal || null) === JSON.stringify(nextPhase.reveal || null);
}

function canKeepActivePreferenceView(previousGame, nextGame) {
  if (previousGame?.status !== "CHOOSING" || nextGame?.status !== "CHOOSING") return false;
  if (previousGame.self?.finishedPreferencePhase || nextGame.self?.finishedPreferencePhase) return false;
  const previousQuestion = previousGame.choicePhase?.current;
  const nextQuestion = nextGame.choicePhase?.current;
  return Boolean(
    document.querySelector(".preference-options") &&
    previousQuestion &&
    nextQuestion &&
    previousGame.self.choiceProgress === nextGame.self.choiceProgress &&
    previousQuestion.id === nextQuestion.id &&
    JSON.stringify(previousQuestion.options) === JSON.stringify(nextQuestion.options)
  );
}

function canKeepWaitingScreen(previousGame, nextGame) {
  if (!document.querySelector(".waiting-screen .mini-progress") || previousGame?.status !== nextGame?.status) return false;
  if (nextGame.status === "ANSWERING") {
    return Boolean(previousGame.self?.finishedAnswerPhase && nextGame.self?.finishedAnswerPhase);
  }
  if (nextGame.status === "GUESSING") {
    return Boolean(previousGame.self?.finishedGuessPhase && nextGame.self?.finishedGuessPhase);
  }
  if (nextGame.status === "CHOOSING") {
    return Boolean(previousGame.self?.finishedPreferencePhase && nextGame.self?.finishedPreferencePhase);
  }
  return false;
}

function updateWaitingProgress(game) {
  const completed = game.status === "ANSWERING"
    ? game.opponent?.answerProgress
    : game.status === "CHOOSING"
      ? game.opponent?.choiceProgress
      : game.opponent?.guessProgress;
  document.querySelectorAll(".waiting-screen .mini-progress i").forEach((dot, index) => {
    dot.classList.toggle("done", index < (completed || 0));
  });
}

function selectGuessOption(optionId) {
  state.pendingOptionId = optionId;
  root.querySelectorAll(".answer-option").forEach((option) => {
    option.classList.toggle("selected", option.dataset.optionId === optionId);
  });
  const lockButton = root.querySelector('[data-action="lock-guess"]');
  if (lockButton) lockButton.disabled = false;
}

function selectPreferenceOption(optionId) {
  state.pendingPreferenceId = optionId;
  root.querySelectorAll(".preference-option").forEach((option) => {
    option.classList.toggle("selected", option.dataset.optionId === optionId);
  });
  const lockButton = root.querySelector('[data-action="lock-preference"]');
  if (lockButton) lockButton.disabled = false;
}

function clearSession() {
  state.session = null;
  state.game = null;
  state.pendingOptionId = null;
  state.pendingPreferenceId = null;
  state.answerDrafts = {};
  state.discardedAnswerDraftKey = null;
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(ANSWER_DRAFTS_KEY);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
}

function resizeConfetti() {
  const scale = Math.min(devicePixelRatio || 1, 2);
  confettiCanvas.width = innerWidth * scale;
  confettiCanvas.height = innerHeight * scale;
  confettiContext.setTransform(scale, 0, 0, scale, 0, 0);
}

function burstConfetti(count) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#9d62ff", "#f15ea8", "#ff9e5e", "#53d6a2", "#ffffff"];
  for (let index = 0; index < count; index += 1) {
    state.confetti.push({ x: innerWidth / 2, y: innerHeight * .28, vx: (Math.random() - .5) * 11, vy: -4 - Math.random() * 9, gravity: .19, rotation: Math.random() * Math.PI, spin: (Math.random() - .5) * .25, color: colors[index % colors.length], life: 100 + Math.random() * 50 });
  }
  requestAnimationFrame(drawConfetti);
}

function drawConfetti() {
  confettiContext.clearRect(0, 0, innerWidth, innerHeight);
  state.confetti = state.confetti.filter((piece) => piece.life > 0 && piece.y < innerHeight + 30);
  for (const piece of state.confetti) {
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.vy += piece.gravity;
    piece.rotation += piece.spin;
    piece.life -= 1;
    confettiContext.save();
    confettiContext.translate(piece.x, piece.y);
    confettiContext.rotate(piece.rotation);
    confettiContext.fillStyle = piece.color;
    confettiContext.fillRect(-4, -2, 8, 4);
    confettiContext.restore();
  }
  if (state.confetti.length) requestAnimationFrame(drawConfetti);
}

window.addEventListener("resize", resizeConfetti);
resizeConfetti();

window.render_game_to_text = () => JSON.stringify({
  coordinateSystem: "DOM card interface; viewport origin top-left, x right, y down",
  screen: state.game?.status || state.entryMode,
  roomCode: state.game?.roomCode || null,
  gameMode: state.game?.mode?.id || (state.entryMode === "create" ? state.createMode : null),
  topicTone: (state.game?.mode?.id || (state.entryMode === "create" ? state.createMode : null)) === "would-you-rather"
    ? null
    : state.game?.tone?.id || (state.entryMode === "create" ? state.createTone : null),
  choiceDeck: state.game?.choiceDeck?.id || (state.entryMode === "create" && state.createMode === "would-you-rather" ? state.createChoiceDeck : null),
  selectedQuestionCount: state.entryMode === "create" ? state.createQuestionCount : null,
  totalQuestions: state.game?.totalQuestions || null,
  self: state.game ? {
    name: state.game.self.name,
    answerProgress: state.game.self.answerProgress,
    guessProgress: state.game.self.guessProgress,
    choiceProgress: state.game.self.choiceProgress,
    score: state.game.self.score,
    ready: state.game.self.ready
  } : null,
  opponent: state.game?.opponent ? {
    name: state.game.opponent.name,
    connected: state.game.opponent.connected,
    answerProgress: state.game.opponent.answerProgress,
    guessProgress: state.game.opponent.guessProgress,
    choiceProgress: state.game.opponent.choiceProgress
  } : null,
  currentTopic: state.game?.answerPhase?.currentTopic?.text || state.game?.guessPhase?.current?.topicText || null,
  currentChoiceQuestion: state.game?.choicePhase?.current?.prompt || null,
  visiblePreferenceOptions: state.game?.choicePhase?.current?.options?.map((option) => option.text) || [],
  selectedPreferenceId: state.pendingPreferenceId,
  currentAnswerDraft: document.getElementById("answerInput")?.value || null,
  currentAnswerWordCount: document.getElementById("answerInput") ? countWords(document.getElementById("answerInput").value) : null,
  activeElement: document.activeElement?.id || null,
  visibleAnswerOptions: state.game?.guessPhase?.current?.options?.map((option) => option.text) || [],
  revealedAnswer: state.game?.guessPhase?.reveal?.realAnswer || null,
  selectedOptionId: state.pendingOptionId,
  reviewOpen: Boolean(state.review),
  compatibilityReport: state.game?.results?.compatibility ? {
    overall: state.game.results.compatibility.overall,
    tier: state.game.results.compatibility.tier,
    answerAlignment: state.game.results.compatibility.answerAlignment,
    mutualKnowledge: state.game.results.compatibility.mutualKnowledge,
    balance: state.game.results.compatibility.balance,
    categories: state.game.results.compatibility.categories.map(({ label, score }) => ({ label, score }))
  } : null,
  wouldYouRatherReport: state.game?.results?.wouldYouRather ? {
    matchPercent: state.game.results.wouldYouRather.matchPercent,
    matchCount: state.game.results.wouldYouRather.matchCount,
    differenceCount: state.game.results.wouldYouRather.differenceCount,
    totalQuestions: state.game.results.wouldYouRather.totalQuestions,
    categories: state.game.results.wouldYouRather.categories.map(({ label, score, matchCount, questionCount }) => ({ label, score, matchCount, questionCount }))
  } : null,
  renderCount: state.renderCount
});

window.advanceTime = (milliseconds) => new Promise((resolve) => setTimeout(resolve, Math.min(milliseconds, 50)));

render();
