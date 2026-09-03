(function () {
  const { escapeHtml: esc, avatarMarkup, toast, emit, formatTime, remainingSeconds, wordCount, setStateProvider, categoryIcon } = window.StoryCommon;
  const { AVATAR_CHOICES } = window.StoryAvatars;
  const { COOP_SECTIONS } = window.StoryCoop;
  const app = document.getElementById("app");
  const socket = io({ transports: ["websocket", "polling"] });
  let state = null;
  let session = null;
  let draftTimer = null;
  let lastWarning = null;

  setStateProvider(() => state || { mode: "student join" });

  function queryCode() { return (new URLSearchParams(location.search).get("code") || "").toUpperCase().slice(0, 5); }

  function loadSession() {
    const code = queryCode();
    if (code) {
      try {
        const saved = JSON.parse(localStorage.getItem(`storyShowdownStudent:${code}`));
        if (saved?.sessionToken) return saved;
      } catch (_) {}
    }
    try {
      const recent = JSON.parse(localStorage.getItem("storyShowdownStudentRecent"));
      if (recent?.code && recent?.sessionToken && (!code || recent.code === code)) return recent;
    } catch (_) {}
    return null;
  }

  function saveSession(value) {
    session = value;
    localStorage.setItem(`storyShowdownStudent:${value.code}`, JSON.stringify(value));
    localStorage.setItem("storyShowdownStudentRecent", JSON.stringify(value));
    history.replaceState(null, "", `/student.html?code=${encodeURIComponent(value.code)}`);
  }

  function joinScreen(message = "") {
    state = null;
    document.body.classList.remove("celebrating");
    app.innerHTML = `<div class="join-shell"><section class="join-card"><p class="section-kicker">Student entrance</p><h1>Join the showdown</h1><p class="muted">Use the five-character code on the classroom screen. Pick a temporary nickname and a writing avatar.</p>${message ? `<div class="notice-bar">${esc(message)}</div>` : ""}<form id="join-form" class="form-grid" autocomplete="off"><div class="field full"><label for="game-code">Game code</label><input class="join-code-input" id="game-code" name="code" maxlength="5" value="${esc(queryCode())}" required autocomplete="off" autocapitalize="characters" placeholder="ABCDE"></div><div class="field full"><label for="student-name">First name or classroom nickname</label><input id="student-name" name="name" maxlength="24" minlength="2" required autocomplete="nickname" placeholder="Your name"></div><fieldset class="avatar-picker full"><legend>Choose your profile avatar · ${AVATAR_CHOICES.length} characters</legend><div class="avatar-grid">${AVATAR_CHOICES.map((avatar, index) => `<label class="avatar-choice"><input type="radio" name="avatarId" value="${esc(avatar.id)}" ${index === 0 ? "checked" : ""}>${avatarMarkup(avatar, "avatar-orb")}<small>${esc(avatar.label)}</small></label>`).join("")}</div></fieldset><div class="field full"><button class="button large teal full" type="submit">Join game</button></div></form><p class="fine-print">Up to 30 students can join. Your name and avatar are temporary and only used inside this game.</p></section></div>`;
  }

  function myTeam() { return state?.teams?.find((team) => team.id === state.me?.teamId); }
  function teamBadge() {
    const team = myTeam();
    return team ? `<span class="student-team-badge" style="--team-color:${esc(team.color)}">${esc(team.name)}</span>` : "";
  }
  function shell(content) {
    const cooperative = state.settings.gameMode === "cooperative";
    return `<div class="game-header"><div class="student-profile-title">${avatarMarkup(state.me.avatar, "profile-avatar", true)}<div><p class="section-kicker">${cooperative ? "Cooperative Story Machine" : `Round ${state.roundNumber}/${state.totalRounds}`}</p><h1>${esc(state.me.name)}’s desk</h1></div></div><div class="game-meta"><span class="code-pill">${esc(state.code)}</span>${cooperative ? '<span class="phase-pill">One class · one story</span>' : teamBadge()}</div></div><div class="notice-bar">${esc(state.notice || "Connected to the game.")}</div>${content}`;
  }

  function waitState(icon, kicker, title, copy, extra = "") {
    return `<section class="student-state state-hero"><div class="state-icon" aria-hidden="true">${icon}</div><p class="section-kicker">${esc(kicker)}</p><h2 class="phase-title">${esc(title)}</h2><p class="muted">${esc(copy)}</p>${extra}</section>`;
  }

  function lobbyView() {
    const maxPlayers = state.maxPlayers || 30;
    const cooperative = state.settings.gameMode === "cooperative";
    return waitState(cooperative ? "⁂" : "✦", "You’re in", cooperative ? "The Story Machine is gathering ideas" : "The room is gathering", `${state.playerCount} of ${maxPlayers} writers joined. ${cooperative ? "You’ll have five minutes to write eight one-sentence story ingredients." : "Your teacher will start when everyone is ready."}`, `<div class="feature-row"><span>${state.connectedCount} online</span><i></i><span>${cooperative ? "No scores · create together" : "No refresh needed"}</span></div>`);
  }

  function teamRevealView() {
    const team = myTeam();
    const mates = state.players.filter((player) => player.teamId === team?.id && player.id !== state.me.id);
    return `<section class="state-hero" style="border-top:7px solid ${esc(team?.color || "var(--purple)")};text-align:center"><div class="state-icon">⚑</div><p class="section-kicker">Your team for the whole game</p><h2 class="phase-title">${esc(team?.name || "Team pending")}</h2>${mates.length ? `<div class="mate-list">${mates.map((player) => `<span>${avatarMarkup(player.avatar, "avatar-bubble small")}<b>${esc(player.name)}</b></span>`).join("")}</div>` : '<p class="muted">You are the first writer on this team.</p>'}<p>Individual entries. Shared points. Cheer for every bold idea.</p></section>`;
  }

  function preRoundView() {
    const waiting = waitState("⌁", `Round ${state.roundNumber + 1} is next`, "Prompt incoming", "Your teacher is choosing the next creative-writing challenge.");
    return `${waiting}${state.roundNumber ? writerLeaderboardPanel("Running writer leaderboard") : ""}`;
  }

  function writingView() {
    const round = state.round;
    if (round.mySubmission) return waitState("✓", "Response submitted", "Your entry is locked in", "Watch the classroom screen. The teacher will move to anonymous presentation after everyone is ready.", `<p class="word-count">${wordCount(round.mySubmission.text)} words submitted</p>`);
    return `<div class="student-writing"><div class="student-timer timer-box"><span>${round.pausedRemainingMs !== null ? "Timer paused" : "Time remaining"}</span><strong class="timer-live">${formatTime(remainingSeconds(round))}</strong></div><section class="student-prompt"><div class="prompt-title-row"><span class="prompt-category-badge"><b>${esc(categoryIcon(round.prompt.category))}</b>${esc(round.prompt.category)}</span><span class="difficulty-badge">${esc(round.prompt.difficulty)}</span></div><h2>${esc(round.prompt.text)}</h2><div class="prompt-meta"><span class="meta-tag">${esc(round.prompt.suggestion)}</span><span class="meta-tag">${esc(round.prompt.responseLength)} response</span></div></section><section class="writing-desk"><div class="desk-heading"><label class="field-label" for="response-draft">Your response</label><span>Make the room lean in.</span></div><textarea id="response-draft" maxlength="12000" placeholder="Start writing here…">${esc(round.myDraft || "")}</textarea><div class="writing-tools"><span id="word-count" class="word-count">${wordCount(round.myDraft)} words</span><button class="button large teal" data-action="submit-response">Submit response</button></div><p class="fine-print">You can edit until you submit. If time runs out, your current draft submits automatically.</p></section></div>`;
  }

  function watchingView() {
    return waitState("◌", "Responses collected", "Eyes on the classroom screen", "Your teacher is privately reviewing entries before anonymous presentation begins.");
  }

  function presentationView() {
    const entry = state.round.currentEntry;
    return `<section class="projector-stage"><div><span class="entry-label">${esc(entry?.label || "Next entry")}</span><div class="entry-text">${esc(entry?.text || "Watch the projected screen for the next response.")}</div><p class="muted">Writers stay anonymous until results. Read, listen, and choose based on the writing.</p></div></section>`;
  }

  function votingView() {
    const round = state.round;
    return `<section><div class="state-hero" style="padding:30px;margin-bottom:14px"><p class="section-kicker">${round.tiebreaker ? "Quick tiebreaker" : "One vote · changeable until close"}</p><h2 class="phase-title">Choose your favorite</h2><p class="muted">You cannot vote for your own response. Live totals are hidden.</p></div><div class="vote-grid">${round.entries.map((entry) => `<article class="vote-card ${round.myVote === entry.id ? "selected" : ""}"><div class="vote-label">${esc(entry.label.replace("Entry ", ""))}</div><div class="vote-copy"><strong>${esc(entry.label)} ${entry.own ? "· Your entry" : ""}</strong>${esc(entry.text)}</div><button class="button ${entry.own ? "ghost" : "teal"}" data-action="vote" data-id="${esc(entry.id)}" ${entry.own ? "disabled" : ""}>${entry.own ? "Yours" : round.myVote === entry.id ? "Selected ✓" : "Vote"}</button></article>`).join("")}</div>${round.myVote ? `<p class="notice-bar" style="margin-top:14px">Vote saved. You can choose a different entry until voting closes.</p>` : ""}</section>`;
  }

  function tieView() {
    return waitState("≈", "Tie detected", "The finish is too close to call", "Your teacher is choosing a tiebreaker method. Keep this screen open.");
  }

  function resultCards() {
    const results = state.round?.results || [];
    if (!results.length) return `<div class="empty-state"><div><strong>Drumroll…</strong>The teacher is about to reveal the next placement.</div></div>`;
    return `<div class="podium-grid">${results.map((result) => `<article class="podium-card ${result.placement === 1 ? "first" : result.placement === 2 ? "second" : "third"}" style="--team-color:${esc(result.teamColor)}"><div class="place">${result.placement}</div><b class="podium-writer">${avatarMarkup(result.avatar)}${esc(result.label)} · ${esc(result.studentName)}</b><p>${esc(result.teamName)}</p><blockquote>${esc(result.text)}</blockquote><div class="points-pop">+${result.points.toLocaleString()} team points</div></article>`).join("")}</div>`;
  }

  function resultsView() {
    return `<section class="state-hero" style="padding:26px"><p class="section-kicker">Round ${state.roundNumber} results</p><h2 class="phase-title">The podium</h2>${resultCards()}</section>`;
  }

  function leaderboardMarkup() {
    return `<div class="leaderboard">${state.teams.map((team) => { const recentWinner = team.winners?.at(-1); return `<div class="leader-row" style="--team-color:${esc(team.color)}"><span class="rank-number">${team.rank}</span><span class="leader-name">${esc(team.name)}${recentWinner ? `<small>R${recentWinner.round}: ${esc(recentWinner.studentName)} · place ${recentWinner.placement}</small>` : ""}</span><span class="leader-delta">${team.lastRoundPoints ? `${team.lastRoundPoints > 0 ? "+" : ""}${team.lastRoundPoints} this round` : ""}</span><span class="leader-score">${team.score.toLocaleString()}</span></div>`; }).join("")}</div>`;
  }

  function writerRows(entries, metric) {
    return entries.slice(0, 5).map((entry) => `<div class="writer-rank-row ${entry.playerId === state.me.id ? "mine" : ""}" style="--team-color:${esc(entry.teamColor)}"><span class="writer-rank">${entry.rank}</span>${avatarMarkup(entry.avatar)}<span class="writer-name">${esc(entry.name)}<small>${esc(entry.teamName)} · ${entry.roundsPlayed} ${entry.roundsPlayed === 1 ? "round" : "rounds"}</small></span><strong>${metric === "average" ? `${entry.averagePoints.toLocaleString()} avg` : `${entry.totalPoints.toLocaleString()} pts`}</strong></div>`).join("");
  }

  function writerLeaderboardPanel(title = "Writer leaderboard") {
    const boards = state.playerLeaderboards;
    if (!boards?.visible) return `<section class="panel writer-leaderboard-panel"><div class="panel-head"><h2>${esc(title)}</h2></div><div class="panel-body"><p class="muted">Individual rankings are hidden because writer-name reveals are turned off.</p></div></section>`;
    if (!boards.roundsCompleted) return "";
    return `<section class="panel writer-leaderboard-panel"><div class="panel-head"><div><p class="section-kicker">Podium points through round ${boards.roundsCompleted}</p><h2>${esc(title)}</h2></div></div><div class="panel-body"><div class="writer-board-grid"><div class="writer-board"><div class="writer-board-heading"><span>★</span><div><h3>Top overall</h3><p>Total points earned</p></div></div>${writerRows(boards.overall, "total")}</div><div class="writer-board"><div class="writer-board-heading"><span>÷</span><div><h3>Top average</h3><p>Points per completed round</p></div></div>${writerRows(boards.average, "average")}</div></div></div></section>`;
  }

  function leaderboardView() {
    return `<section class="panel"><div class="panel-head"><div><p class="section-kicker">After round ${state.roundNumber}</p><h2>Team standings</h2></div></div><div class="panel-body">${leaderboardMarkup()}<p class="muted" style="text-align:center">The next prompt is coming soon.</p></div></section>${writerLeaderboardPanel()}`;
  }

  function coopAnswersFromForm(form = document.getElementById("coop-form")) {
    if (!form) return state.coop?.myDraft || {};
    const data = new FormData(form);
    return Object.fromEntries(COOP_SECTIONS.map((section) => [section.id, data.get(section.id) || ""]));
  }

  function coopWritingView() {
    const coop = state.coop;
    if (coop.mySubmission) {
      return waitState("✓", "Ideas submitted", "Your ingredients are in the machine", `${coop.submissionCount} of ${state.playerCount} writers are ready. Watch the classroom screen when the spinning begins.`, '<div class="feature-row"><span>Draft locked</span><i></i><span>Creating together</span></div>');
    }
    return `<div class="student-writing coop-writing"><div class="student-timer timer-box"><span>Time to write eight ingredients</span><strong class="timer-live">${formatTime(remainingSeconds(coop))}</strong></div><section class="student-prompt coop-intro"><div><p class="section-kicker">Creative writing Mad Lib</p><h2>Complete sentences make the magic work.</h2><p class="muted">Each box is a separate idea. The Story Machine will randomly choose one class answer for every part.</p></div></section><form id="coop-form" class="coop-prompt-grid">${COOP_SECTIONS.map((section, index) => `<label class="coop-prompt-card" for="coop-${esc(section.id)}"><span class="coop-step">${index + 1}</span><span class="coop-part-icon">${esc(section.icon)}</span><span><b>${esc(section.label)}</b><strong>${esc(section.prompt)}</strong><small>${esc(section.guidance)}</small></span><textarea id="coop-${esc(section.id)}" name="${esc(section.id)}" data-coop-answer maxlength="360" required placeholder="Example: ${esc(section.placeholder)}">${esc(coop.myDraft?.[section.id] || "")}</textarea><i data-coop-count="${esc(section.id)}">${String(coop.myDraft?.[section.id] || "").length}/360</i></label>`).join("")}<div class="coop-submit-bar"><span>Write one complete sentence in every box.</span><button class="button large teal" type="submit">Send all ideas to the machine</button></div></form></div>`;
  }

  function coopStoryMarkup() {
    if (!state.coop.storyParts.length) return "";
    return `<section class="panel coop-story-panel"><div class="panel-head"><div><p class="section-kicker">Built together</p><h2>Our story so far</h2></div></div><div class="panel-body coop-final-story">${state.coop.storyParts.map((part) => {
      const selection = state.coop.selections.find((item) => item.sectionId === part.sectionId);
      return `<article><span>${esc(part.icon)}</span><div><p class="coop-bridge">${esc(part.bridge)}</p><p class="coop-prose">${esc(part.text)}</p><small>${avatarMarkup(selection?.avatar, "avatar-bubble small")} ${esc(selection?.studentName || "The class")}</small></div></article>`;
    }).join("")}</div></section>`;
  }

  function coopSpinView() {
    const current = state.coop.currentSection;
    return `<section class="student-state state-hero coop-watch"><div class="state-icon">${esc(current?.icon || "✦")}</div><p class="section-kicker">Story Machine · ${state.coop.selections.length}/${state.coop.sectionCount}</p><h2 class="phase-title">${current ? `Spinning for ${esc(current.label)}` : "Every ingredient is chosen"}</h2><p class="muted">${current ? "Watch the classroom screen. Any class idea could click into place." : "The complete story is about to be revealed."}</p></section>${coopStoryMarkup()}`;
  }

  function coopFinalView() {
    document.body.classList.add("celebrating");
    return `<section class="final-banner"><p class="section-kicker" style="color:#ffd47d">Created together</p><h2 class="winner-name">Our impossible story</h2><p>${state.playerCount} writers · ${state.coop.sectionCount} story ingredients</p></section>${coopStoryMarkup()}`;
  }

  function finalView() {
    const winner = state.teams[0];
    document.body.classList.add("celebrating");
    return `<section class="final-banner"><p class="section-kicker" style="color:#ffd47d">Story Showdown champions</p><h2 class="winner-name">${esc(winner?.name || "Great writing")}</h2><p>${winner?.score.toLocaleString() || 0} points</p></section><section class="panel" style="margin-top:18px"><div class="panel-head"><h2>Final team rankings</h2></div><div class="panel-body">${leaderboardMarkup()}<p class="muted" style="text-align:center">Every finished draft is a win. Thanks for bringing your voice.</p></div></section>${writerLeaderboardPanel("Final writer leaderboard")}`;
  }

  function render() {
    if (!state) return joinScreen();
    document.body.classList.toggle("celebrating", state.phase === "final");
    const views = { lobby: lobbyView, team_reveal: teamRevealView, pre_round: preRoundView, writing: writingView, review: watchingView, presentation: presentationView, voting: votingView, tie: tieView, results: resultsView, leaderboard: leaderboardView, final: finalView, coop_writing: coopWritingView, coop_spin: coopSpinView, coop_final: coopFinalView };
    app.innerHTML = shell((views[state.phase] || lobbyView)());
    updateTimer();
  }

  function updateTimer() {
    const timer = document.querySelector(".timer-live");
    const box = document.querySelector(".timer-box");
    const timerSource = state?.phase === "coop_writing" ? state.coop : state?.round;
    if (!timer || !timerSource) return;
    const remaining = remainingSeconds(timerSource);
    timer.textContent = formatTime(remaining);
    box?.classList.toggle("warning", remaining <= 60 && remaining > 10);
    box?.classList.toggle("urgent", remaining <= 10);
    const threshold = remaining <= 10 ? 10 : remaining <= 30 ? 30 : remaining <= 60 ? 60 : null;
    if (threshold && threshold !== lastWarning) {
      lastWarning = threshold;
      toast(`${threshold} seconds remaining.`, threshold === 10 ? "error" : "success");
    }
  }

  async function connectSession(saved) {
    const response = await emit(socket, "student:join", saved);
    saveSession({ code: saved.code, name: saved.name, avatarId: response.state.me.avatar.id, sessionToken: response.sessionToken });
    state = response.state;
    render();
  }

  app.addEventListener("submit", async (event) => {
    if (!["join-form", "coop-form"].includes(event.target.id)) return;
    event.preventDefault();
    const button = event.target.querySelector("button");
    try {
      button.disabled = true;
      if (event.target.id === "join-form") {
        const data = new FormData(event.target);
        await connectSession({ code: String(data.get("code")).toUpperCase(), name: data.get("name"), avatarId: data.get("avatarId"), sessionToken: null });
      } else await emit(socket, "student:coop-submit", { answers: coopAnswersFromForm(event.target) });
    } catch (error) { toast(error.message); button.disabled = false; }
  });

  app.addEventListener("input", (event) => {
    if (event.target.id === "response-draft") {
      document.getElementById("word-count").textContent = `${wordCount(event.target.value)} words`;
      clearTimeout(draftTimer);
      draftTimer = setTimeout(() => emit(socket, "student:draft", { text: event.target.value }).catch(() => {}), 500);
    } else if (event.target.matches("[data-coop-answer]")) {
      const count = document.querySelector(`[data-coop-count="${CSS.escape(event.target.name)}"]`);
      if (count) count.textContent = `${event.target.value.length}/360`;
      clearTimeout(draftTimer);
      draftTimer = setTimeout(() => emit(socket, "student:coop-draft", { answers: coopAnswersFromForm() }).catch(() => {}), 500);
    }
  });

  app.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button || button.disabled) return;
    try {
      button.disabled = true;
      if (button.dataset.action === "submit-response") {
        const text = document.getElementById("response-draft").value;
        if (!text.trim() && !confirm("Submit an empty response?")) { button.disabled = false; return; }
        await emit(socket, "student:submit", { text });
      } else if (button.dataset.action === "vote") await emit(socket, "student:vote", { submissionId: button.dataset.id });
    } catch (error) { toast(error.message); button.disabled = false; }
  });

  socket.on("state", (nextState) => {
    const phaseChanged = Boolean(state?.phase && state.phase !== nextState.phase);
    const sameWritingInput = state?.phase === "writing" && nextState.phase === "writing" && document.activeElement?.id === "response-draft";
    const liveDraft = sameWritingInput ? document.activeElement.value : null;
    const sameCoopInput = state?.phase === "coop_writing" && nextState.phase === "coop_writing" && document.activeElement?.matches("[data-coop-answer]");
    const activeCoopField = sameCoopInput ? document.activeElement.name : null;
    const liveCoopDraft = sameCoopInput ? coopAnswersFromForm() : null;
    const coopCursor = sameCoopInput ? document.activeElement.selectionStart : null;
    state = nextState;
    if (liveDraft !== null) state.round.myDraft = liveDraft;
    if (liveCoopDraft) state.coop.myDraft = liveCoopDraft;
    render();
    if (phaseChanged) window.scrollTo({ top: 0, behavior: "auto" });
    if (sameWritingInput) {
      const textarea = document.getElementById("response-draft");
      textarea?.focus();
      textarea?.setSelectionRange(liveDraft.length, liveDraft.length);
    }
    if (activeCoopField) {
      const textarea = document.querySelector(`[data-coop-answer][name="${CSS.escape(activeCoopField)}"]`);
      textarea?.focus();
      textarea?.setSelectionRange(coopCursor, coopCursor);
    }
  });
  socket.on("removed", ({ message }) => { localStorage.removeItem(`storyShowdownStudent:${session?.code}`); session = null; joinScreen(message); });
  socket.on("disconnect", () => { document.getElementById("connection-banner").hidden = false; });
  socket.on("connect", async () => {
    document.getElementById("connection-banner").hidden = true;
    if (!session) return;
    try { await connectSession(session); }
    catch (error) { session = null; joinScreen(error.message); }
  });

  session = loadSession();
  if (!session) joinScreen();
  setInterval(updateTimer, 250);
})();
