(function () {
  const { escapeHtml: esc, avatarMarkup, toast, emit, formatTime, remainingSeconds, setStateProvider, categoryIcon } = window.StoryCommon;
  const { COOP_SECTIONS } = window.StoryCoop;
  const app = document.getElementById("app");
  const socket = io({ transports: ["websocket", "polling"] });
  let state = null;
  let credentials = null;
  let coopSpinAnimation = null;

  const phaseNames = {
    lobby: "Lobby", team_reveal: "Team reveal", pre_round: "Prompt lab", writing: "Writing",
    review: "Private review", presentation: "Presentation", voting: "Voting", tie: "Tie decision",
    results: "Round results", leaderboard: "Leaderboard", final: "Final results",
    coop_writing: "Story ingredients", coop_spin: "Story Machine", coop_final: "Our class story"
  };

  setStateProvider(() => state || { mode: "teacher setup" });

  function storedCredentials() {
    const params = new URLSearchParams(location.search);
    const code = params.get("code")?.toUpperCase();
    if (code) {
      const token = localStorage.getItem(`storyShowdownTeacher:${code}`);
      if (token) return { code, teacherToken: token };
    }
    if (sessionStorage.getItem("storyShowdownStartFresh") === "true") return null;
    try {
      const recent = JSON.parse(localStorage.getItem("storyShowdownTeacherRecent"));
      if (recent?.code && recent?.teacherToken) return recent;
    } catch (_) {}
    return null;
  }

  function saveCredentials(value) {
    credentials = value;
    sessionStorage.removeItem("storyShowdownStartFresh");
    localStorage.setItem(`storyShowdownTeacher:${value.code}`, value.teacherToken);
    localStorage.setItem("storyShowdownTeacherRecent", JSON.stringify(value));
    history.replaceState(null, "", `/teacher.html?code=${encodeURIComponent(value.code)}`);
  }

  async function teacherAction(event, payload = {}) {
    if (!credentials) throw new Error("Create or reconnect to a game first.");
    return emit(socket, event, { ...payload, ...credentials });
  }

  function openNewGameSetup() {
    credentials = null;
    state = null;
    sessionStorage.setItem("storyShowdownStartFresh", "true");
    history.replaceState(null, "", "/teacher.html");
    document.body.classList.remove("celebrating");
    socket.disconnect();
    socket.connect();
    createScreen();
  }

  function createScreen() {
    state = null;
    app.innerHTML = `
      <div class="create-shell">
        <section class="create-card">
          <p class="section-kicker">Teacher desk</p>
          <h1>Start a new showdown</h1>
          <p class="muted">Choose the class structure now. You can fine-tune the prompt and timer before every round.</p>
          <form id="create-form" class="form-grid">
            <div class="field full"><label for="game-mode">Game mode</label><select id="game-mode" name="gameMode"><option value="competitive">Competitive · Story Showdown</option><option value="cooperative">Cooperative · Story Machine</option></select></div>
            <div class="mode-explainer full" id="coop-mode-explainer" hidden><b>One class. One wonderfully unpredictable story.</b><span>Students write eight one-sentence ingredients for five minutes. You spin the Story Machine to assemble them—no teams, scores, or voting.</span></div>
            <div class="field" data-competitive-setting><label for="team-count">Teams</label><select id="team-count" name="teamCount"><option>2</option><option>3</option><option selected>4</option><option>5</option><option>6</option><option>7</option><option>8</option></select></div>
            <div class="field" data-competitive-setting><label for="round-count">Rounds</label><select id="round-count" name="totalRounds"><option>1</option><option>2</option><option selected>3</option><option>4</option><option>5</option><option>6</option></select></div>
            <div class="field" data-competitive-setting><label for="default-time">Default writing time</label><select id="default-time" name="defaultDuration"><option value="120">Short · 2 minutes</option><option value="240" selected>Medium · 4 minutes</option><option value="360">Long · 6 minutes</option></select></div>
            <div class="field" data-competitive-setting><label for="prompt-mode">Prompt selection</label><select id="prompt-mode" name="promptMode"><option value="random">Random prompt bank</option><option value="manual">Teacher chooses</option></select></div>
            <label class="check-row full" data-competitive-setting><input type="checkbox" name="revealNames" checked><span>Reveal student names after voting closes</span></label>
            <div class="field full"><button class="button large full" type="submit">Create game</button></div>
          </form>
          <p class="fine-print">Supports up to 30 students. They join with a temporary classroom name; no account, email, camera, or microphone is used.</p>
        </section>
      </div>`;
    syncCreateMode();
  }

  function syncCreateMode() {
    const form = document.getElementById("create-form");
    if (!form) return;
    const cooperative = form.elements.gameMode.value === "cooperative";
    form.querySelectorAll("[data-competitive-setting]").forEach((element) => { element.hidden = cooperative; });
    document.getElementById("coop-mode-explainer").hidden = !cooperative;
  }

  function scoreStrip() {
    if (state.settings.gameMode === "cooperative") return "";
    return `<div class="score-strip">${state.teams.map((team) => `
      <div class="score-chip" style="--team-color:${esc(team.color)}">
        <b>${esc(team.name)}</b><strong>${team.score.toLocaleString()}</strong>
        <span>#${team.rank}${team.lastRoundPoints ? ` · ${team.lastRoundPoints > 0 ? "+" : ""}${team.lastRoundPoints} last round` : " points"}</span>
      </div>`).join("")}</div>`;
  }

  function gameHeader() {
    const cooperative = state.settings.gameMode === "cooperative";
    const progressPill = cooperative ? '<span class="phase-pill">Co-op story</span>' : `<span class="phase-pill">Round ${state.roundNumber}/${state.totalRounds}</span>`;
    return `<div class="game-header">
      <div><p class="section-kicker">Teacher control room</p><h1>${state.phase === "final" ? "The final page" : phaseNames[state.phase] || "Story Showdown"}</h1></div>
      <div class="game-meta"><button class="button tiny ghost" type="button" data-action="new-game">＋ New game</button><span class="code-pill">${esc(state.code)}</span><span class="status-pill online">${state.connectedCount}/${state.playerCount} online</span>${progressPill}</div>
    </div>
    <div class="notice-bar">${esc(state.notice || "Live game ready.")}</div>
    ${scoreStrip()}`;
  }

  function rosterMarkup(teamSelect = true) {
    if (!state.players.length) return `<div class="empty-state"><div><strong>Waiting for writers</strong>Students will appear here as they join.</div></div>`;
    return `<div class="roster-list">${state.players.map((player) => `
      <div class="roster-row">
        <div class="student-name">${avatarMarkup(player.avatar)}<span><i class="connection-dot ${player.connected ? "on" : ""}"></i>${esc(player.name)}</span></div>
        ${teamSelect ? `<select data-action="reassign" data-player-id="${esc(player.id)}" aria-label="Team for ${esc(player.name)}"><option value="">Unassigned</option>${state.teams.map((team) => `<option value="${esc(team.id)}" ${player.teamId === team.id ? "selected" : ""}>${esc(team.name)}</option>`).join("")}</select>` : `<span class="muted">${esc(state.teams.find((team) => team.id === player.teamId)?.name || "Unassigned")}</span>`}
        <button class="button tiny ghost" data-action="remove-player" data-player-id="${esc(player.id)}">Remove</button>
      </div>`).join("")}</div>`;
  }

  function settingsForm() {
    const cooperative = state.settings.gameMode === "cooperative";
    return `<form id="settings-form" class="form-grid">
      <div class="field full"><label>Game mode</label><select name="gameMode"><option value="competitive" ${!cooperative ? "selected" : ""}>Competitive · Story Showdown</option><option value="cooperative" ${cooperative ? "selected" : ""}>Cooperative · Story Machine</option></select></div>
      ${cooperative ? `<div class="mode-explainer full"><b>Cooperative Story Machine</b><span>Eight guided ingredients · five minutes · no teams, scores, or voting.</span></div>` : `
      <div class="field"><label>Teams</label><select name="teamCount">${[2,3,4,5,6,7,8].map((value) => `<option ${value === state.settings.teamCount ? "selected" : ""}>${value}</option>`).join("")}</select></div>
      <div class="field"><label>Rounds</label><select name="totalRounds">${[1,2,3,4,5,6,7,8,9,10].map((value) => `<option ${value === state.settings.totalRounds ? "selected" : ""}>${value}</option>`).join("")}</select></div>
      <div class="field"><label>Default time</label><select name="defaultDuration">${[[120,"2 minutes"],[240,"4 minutes"],[360,"6 minutes"]].map(([value,label]) => `<option value="${value}" ${value === state.settings.defaultDuration ? "selected" : ""}>${label}</option>`).join("")}</select></div>
      <div class="field"><label>Prompt choice</label><select name="promptMode"><option value="random" ${state.settings.promptMode === "random" ? "selected" : ""}>Random</option><option value="manual" ${state.settings.promptMode === "manual" ? "selected" : ""}>Manual</option></select></div>
      <label class="check-row full"><input type="checkbox" name="revealNames" ${state.settings.revealNames ? "checked" : ""}><span>Reveal writers after voting</span></label>
      <p class="fine-print full" role="status">${state.teams.length} team${state.teams.length === 1 ? "" : "s"} ready · Changes save automatically.</p>`}
      <button class="button soft full" type="submit">Save settings now</button>
    </form>`;
  }

  function lobbyView() {
    const cooperative = state.settings.gameMode === "cooperative";
    const maxPlayers = state.maxPlayers || 30;
    const spotsRemaining = Math.max(0, maxPlayers - state.playerCount);
    const capacityNote = state.playerCount < 2
      ? "At least two students are required."
      : spotsRemaining
        ? `${spotsRemaining} of ${maxPlayers} spots still open.`
        : `Classroom full · ${maxPlayers} writers.`;
    return `<div class="dashboard-grid">
      <section class="panel"><div class="panel-head"><div><p class="section-kicker">Live roster</p><h2>${state.playerCount} of ${maxPlayers} writers joined</h2></div><button class="button tiny ${state.settings.joiningLocked ? "gold" : "ghost"}" data-action="toggle-lock">${state.settings.joiningLocked ? "Unlock joining" : "Lock joining"}</button></div><div class="panel-body">${rosterMarkup(false)}<div class="button-row"><button class="button large ${cooperative ? "teal" : ""}" data-action="start-game" ${state.playerCount < 2 ? "disabled" : ""}>${cooperative ? "Start 5-minute story lab" : "Assign teams & start"}</button><span class="fine-print">${capacityNote}</span></div></div></section>
      <aside><section class="panel"><div class="panel-head"><h2>Game setup</h2></div><div class="panel-body">${settingsForm()}</div></section><section class="panel"><div class="panel-head"><h2>Student join</h2></div><div class="panel-body"><p>Send students to</p><p><b>${esc(location.origin)}/student.html</b></p><p>and display code</p><div class="code-pill" style="display:inline-block;font-size:22px">${esc(state.code)}</div></div></section></aside>
    </div>`;
  }

  function teamRevealView() {
    return `<section class="panel"><div class="panel-head"><div><p class="section-kicker">Teams are locked for the game</p><h2>Meet the writing crews</h2></div></div><div class="panel-body"><div class="team-grid">${state.teams.map((team) => `
      <article class="team-card" style="--team-color:${esc(team.color)}"><input aria-label="Rename ${esc(team.name)}" value="${esc(team.name)}" data-team-name="${esc(team.id)}"><button class="button tiny soft" data-action="rename-team" data-team-id="${esc(team.id)}">Rename</button><ul>${state.players.filter((player) => player.teamId === team.id).map((player) => `<li>${avatarMarkup(player.avatar, "avatar-bubble small")}${esc(player.name)}</li>`).join("") || "<li>No writers yet</li>"}</ul></article>`).join("")}</div><div class="button-row"><button class="button large" data-action="continue-teams">Open the prompt lab</button></div></div></section>`;
  }

  function promptView() {
    const prompt = state.draftPrompt;
    const isTeacherDraft = prompt?.id?.startsWith("teacher-");
    const selectedCategory = state.categories.includes(prompt?.category) ? prompt.category : "all";
    const selectedLength = ["short", "medium", "long"].includes(prompt?.responseLength) ? prompt.responseLength : "all";
    return `<div class="dashboard-grid"><section class="panel"><div class="panel-head"><div><p class="section-kicker">Round ${state.roundNumber + 1}</p><h2>Prompt lab</h2></div><span class="phase-pill">${state.promptBank.length + state.customPrompts.length} saved prompts</span></div><div class="panel-body prompt-lab">
      <div class="category-rail" aria-label="Quick prompt categories">${state.categories.map((category) => `<button class="category-card ${selectedCategory === category ? "active" : ""}" type="button" data-action="category-prompt" data-category="${esc(category)}" aria-label="Preview a ${esc(category)} prompt"><span>${esc(categoryIcon(category))}</span><b>${esc(category)}</b></button>`).join("")}</div>
      <div class="prompt-filters"><select id="category-filter" aria-label="Prompt category"><option value="all" ${selectedCategory === "all" ? "selected" : ""}>All categories</option>${state.categories.map((category) => `<option ${selectedCategory === category ? "selected" : ""}>${esc(category)}</option>`).join("")}</select><select id="length-filter" aria-label="Response length"><option value="all" ${selectedLength === "all" ? "selected" : ""}>Any length</option><option value="short" ${selectedLength === "short" ? "selected" : ""}>Short</option><option value="medium" ${selectedLength === "medium" ? "selected" : ""}>Medium</option><option value="long" ${selectedLength === "long" ? "selected" : ""}>Long</option></select><button class="button soft" data-action="reroll-prompt">Reroll prompt</button><button class="button" data-action="blank-prompt">Create my prompt</button></div>
      ${prompt ? `<form id="prompt-form" class="prompt-preview"><div class="prompt-title-row"><p class="section-kicker">${isTeacherDraft ? "Create your round prompt" : "Selected prompt"}</p><span class="prompt-category-badge"><b>${esc(categoryIcon(prompt.category))}</b>${esc(prompt.category)}</span></div>${isTeacherDraft ? '<p class="muted prompt-help">Write the challenge students will see, then choose its guidance and timer.</p>' : ""}<div class="prompt-editor"><div class="field wide"><label>Prompt text</label><textarea name="text" required minlength="10" maxlength="1200" placeholder="Write your creative-writing challenge…">${esc(prompt.text)}</textarea></div><div class="field"><label>Category</label><input name="category" maxlength="80" value="${esc(prompt.category)}"></div><div class="field"><label>Difficulty</label><select name="difficulty">${["accessible","intermediate","challenge","teacher choice"].map((item) => `<option ${item === prompt.difficulty ? "selected" : ""}>${item}</option>`).join("")}</select></div><div class="field"><label>Response length</label><select name="responseLength">${["short","medium","long"].map((item) => `<option ${item === prompt.responseLength ? "selected" : ""}>${item}</option>`).join("")}</select></div><div class="field"><label>Timer (seconds)</label><input type="number" name="timerSeconds" min="30" max="900" value="${prompt.timerSeconds || state.settings.defaultDuration}"></div><div class="field wide"><label>Length guidance</label><input name="suggestion" maxlength="80" value="${esc(prompt.suggestion || "Teacher-selected length")}"></div></div><div class="button-row"><button class="button ghost" data-action="save-custom" type="button">Save custom prompt</button><button class="button large" type="submit">Start round ${state.roundNumber + 1}</button></div></form>` : `<div class="empty-state"><div><strong>Ready for a prompt?</strong>Pick a genre above, draw from the full bank, or create your own challenge.<div class="button-row" style="justify-content:center"><button class="button" data-action="reroll-prompt">Surprise me</button><button class="button ghost" data-action="blank-prompt">Create my prompt</button></div></div></div>`}
      ${!prompt ? "" : `<p class="fine-print">Edits apply to this round. Use “Save custom prompt” to keep a copy in this game’s library.</p>`}
    </div></section><aside><section class="panel"><div class="panel-head"><h2>Standings</h2></div><div class="panel-body">${leaderboardMarkup(false)}</div></section><section class="panel"><div class="panel-head"><h2>Round controls</h2></div><div class="panel-body"><button class="button danger full" data-action="end-game">End game early</button></div></section></aside></div>${state.roundNumber ? writerLeaderboardPanel("Running writer leaderboard") : ""}`;
  }

  function writingView() {
    const round = state.round;
    const submittedPercent = state.playerCount ? Math.round(round.submissionCount / state.playerCount * 100) : 0;
    return `<section class="projector-stage"><div><p class="section-kicker">Round ${state.roundNumber} · ${esc(round.prompt.category)}</p><div class="timer-display timer-live">${formatTime(remainingSeconds(round))}</div><h2 class="projector-copy">${esc(round.prompt.text)}</h2><div class="prompt-meta" style="justify-content:center"><span class="meta-tag">${esc(round.prompt.suggestion)}</span><span class="meta-tag">${esc(round.prompt.responseLength)} response</span></div><div class="writing-status">${round.submissionCount} of ${state.playerCount} responses submitted</div><div class="progress-track"><span style="width:${submittedPercent}%"></span></div></div></section>
      <div class="stage-controls"><button class="button ghost" data-action="${round.pausedRemainingMs !== null ? "resume-timer" : "pause-timer"}">${round.pausedRemainingMs !== null ? "Resume timer" : "Pause timer"}</button><button class="button soft" data-action="add-time" data-seconds="30">+30 seconds</button><button class="button soft" data-action="add-time" data-seconds="60">+60 seconds</button><button class="button danger" data-action="end-writing">End writing now</button><button class="button ghost" data-action="restart-round">Restart round</button></div>`;
  }

  function reviewView() {
    const submissions = state.round.submissions || [];
    return `<section class="panel"><div class="panel-head"><div><p class="section-kicker">Private teacher view</p><h2>Review ${submissions.length} responses</h2><p class="muted">Students cannot see this screen. Flags are only review hints—not automatic discipline.</p></div><button class="button large" data-action="start-presentation">Start anonymous presentation</button></div><div class="panel-body"><div class="submission-list">${submissions.map((entry) => `
      <article class="submission-card ${entry.flags.length ? "flagged" : ""}"><div class="submission-top"><div><b>${esc(entry.studentName)}</b> · ${esc(entry.teamName)}${entry.automatic ? " · auto-submitted" : ""}</div><div>${entry.hidden ? '<span class="status-pill">Hidden</span>' : ""} ${entry.disqualified ? '<span class="status-pill">Disqualified</span>' : ""}</div></div><div class="submission-body">${entry.flags.length ? `<div class="flag-note">Review suggested: ${esc(entry.flags.join(", "))}</div>` : ""}<textarea id="submission-${esc(entry.id)}">${esc(entry.text)}</textarea><div class="button-row"><button class="button tiny soft" data-action="edit-submission" data-id="${esc(entry.id)}">Save typo edit</button><button class="button tiny ghost" data-action="hide-submission" data-id="${esc(entry.id)}" data-value="${entry.hidden ? "false" : "true"}">${entry.hidden ? "Restore" : "Hide"}</button><button class="button tiny ${entry.disqualified ? "ghost" : "danger"}" data-action="disqualify-submission" data-id="${esc(entry.id)}" data-value="${entry.disqualified ? "false" : "true"}">${entry.disqualified ? "Reinstate" : "Disqualify"}</button></div></div></article>`).join("")}</div></div></section>`;
  }

  function presentationView() {
    const round = state.round;
    const entry = round.currentEntry;
    return `<section class="projector-stage"><div><span class="entry-label">${esc(entry?.label || "No eligible entry")}</span><div class="entry-text">${esc(entry?.text || "This response is no longer available.")}</div><div class="progress-track"><span style="width:${round.presentationCount ? (round.presentedCount / round.presentationCount * 100) : 0}%"></span></div><p class="muted">${round.presentedCount} of ${round.presentationCount} entries presented</p></div></section><div class="stage-controls"><button class="button ghost" data-action="navigate" data-direction="-1" ${round.presentationIndex <= 0 ? "disabled" : ""}>← Previous</button><button class="button" data-action="navigate" data-direction="1" ${round.presentationIndex >= round.presentationCount - 1 ? "disabled" : ""}>Next entry →</button><button class="button teal" data-action="start-voting" ${round.presentedCount < round.presentationCount ? "disabled" : ""}>Open voting</button></div>`;
  }

  function votingView() {
    const round = state.round;
    return `<section class="projector-stage"><div><p class="section-kicker">${round.tiebreaker ? "Quick tiebreaker" : "The ballot is live"}</p><div class="timer-display" style="font-size:clamp(65px,11vw,120px)">${round.voterCount}<span style="font-size:.25em;color:var(--muted)"> / ${state.playerCount}</span></div><h2 class="projector-copy">Votes received</h2><p class="muted">Students may change their choice until you close voting. Totals stay hidden.</p></div></section><div class="stage-controls"><button class="button large danger" data-action="close-voting">Close voting & calculate results</button></div>`;
  }

  function tieView() {
    const tie = state.round.tieContext;
    return `<section class="panel"><div class="panel-head"><div><p class="section-kicker">Tie at place ${tie?.placement || "?"}</p><h2>The room has spoken… equally.</h2></div></div><div class="panel-body"><div class="vote-grid">${(tie?.entries || []).map((entry) => `<article class="vote-card"><div class="vote-label">${esc(entry.label.replace("Entry ", ""))}</div><div class="vote-copy"><strong>${esc(entry.label)} · ${esc(entry.studentName)} · ${esc(entry.teamName)}</strong>${esc(entry.text)}</div><button class="button tiny" data-action="resolve-manual" data-id="${esc(entry.id)}">Choose this entry</button></article>`).join("")}</div><div class="button-row"><button class="button teal" data-action="resolve-revote">Run quick tiebreaker</button><button class="button gold" data-action="resolve-share">Award the same placement points</button></div></div></section>`;
  }

  function podiumMarkup() {
    const results = state.round.results || [];
    return `<div class="podium-grid">${[1,2,3].flatMap((place) => {
      const placed = results.filter((item) => item.placement === place);
      return placed.length ? placed.map((result) => `<article class="podium-card ${place === 1 ? "first" : place === 2 ? "second" : "third"}" style="--team-color:${esc(result.teamColor)}"><div class="place">${place}</div><b class="podium-writer">${avatarMarkup(result.avatar)}${esc(result.label)} · ${esc(result.studentName)}</b><p>${esc(result.teamName)}</p><blockquote>${esc(result.text)}</blockquote><div class="points-pop">+${result.points.toLocaleString()} team points</div></article>`) : [`<article class="podium-card hidden-podium ${place === 1 ? "first" : place === 2 ? "second" : "third"}"><div><div class="place">${place}</div><p>Waiting for reveal…</p></div></article>`];
    }).join("")}</div>`;
  }

  function resultsView() {
    const revealGoal = state.round.resultPlacementCount;
    const placementName = { 1: "first place", 2: "second place", 3: "third place" }[state.round.nextRevealPlacement] || "next placement";
    return `<section class="panel"><div class="panel-head"><div><p class="section-kicker">Round ${state.roundNumber} results</p><h2>Third. Second. First.</h2></div></div><div class="panel-body">${podiumMarkup()}<div class="button-row" style="justify-content:center">${state.round.revealCount < revealGoal ? `<button class="button large gold" data-action="reveal-result">Reveal ${placementName}</button>` : `<button class="button large" data-action="show-leaderboard">${state.roundNumber >= state.totalRounds ? "Show final standings" : "Show updated leaderboard"}</button>`}</div></div></section>`;
  }

  function leaderboardMarkup(withTools = true) {
    return `<div class="leaderboard">${state.teams.map((team) => {
      const recentWinner = team.winners?.at(-1);
      return `<div class="leader-row" style="--team-color:${esc(team.color)}"><span class="rank-number">${team.rank}</span><span class="leader-name">${esc(team.name)}${recentWinner ? `<small>R${recentWinner.round}: ${esc(recentWinner.studentName)} · ${recentWinner.placement}${recentWinner.placement === 1 ? "st" : recentWinner.placement === 2 ? "nd" : "rd"}</small>` : ""}</span><span class="leader-delta">${team.lastRoundPoints ? `${team.lastRoundPoints > 0 ? "+" : ""}${team.lastRoundPoints}` : ""}</span><span class="leader-score">${team.score.toLocaleString()}</span>${withTools ? `<span class="score-tools"><input type="number" id="score-${esc(team.id)}" value="100" aria-label="Point adjustment for ${esc(team.name)}"><button class="button tiny ghost" data-action="adjust-score" data-team-id="${esc(team.id)}">Apply</button></span>` : ""}</div>`;
    }).join("")}</div>`;
  }

  function writerRows(entries, metric) {
    return entries.slice(0, 5).map((entry) => `<div class="writer-rank-row" style="--team-color:${esc(entry.teamColor)}"><span class="writer-rank">${entry.rank}</span>${avatarMarkup(entry.avatar)}<span class="writer-name">${esc(entry.name)}<small>${esc(entry.teamName)} · ${entry.roundsPlayed} ${entry.roundsPlayed === 1 ? "round" : "rounds"}</small></span><strong>${metric === "average" ? `${entry.averagePoints.toLocaleString()} avg` : `${entry.totalPoints.toLocaleString()} pts`}</strong></div>`).join("");
  }

  function writerLeaderboardPanel(title = "Writer leaderboard") {
    const boards = state.playerLeaderboards;
    if (!boards?.visible) return `<section class="panel writer-leaderboard-panel"><div class="panel-head"><h2>${esc(title)}</h2></div><div class="panel-body"><p class="muted">Individual rankings are hidden because writer-name reveals are turned off.</p></div></section>`;
    if (!boards.roundsCompleted) return "";
    return `<section class="panel writer-leaderboard-panel"><div class="panel-head"><div><p class="section-kicker">Podium points through round ${boards.roundsCompleted}</p><h2>${esc(title)}</h2></div></div><div class="panel-body"><div class="writer-board-grid"><div class="writer-board"><div class="writer-board-heading"><span>★</span><div><h3>Top overall</h3><p>Total points earned</p></div></div>${writerRows(boards.overall, "total")}</div><div class="writer-board"><div class="writer-board-heading"><span>÷</span><div><h3>Top average</h3><p>Points per completed round</p></div></div>${writerRows(boards.average, "average")}</div></div></div></section>`;
  }

  function leaderboardView() {
    return `<div class="dashboard-grid"><section class="panel"><div class="panel-head"><div><p class="section-kicker">Round ${state.roundNumber} complete</p><h2>Team standings</h2></div></div><div class="panel-body">${leaderboardMarkup(true)}<div class="button-row"><button class="button large" data-action="next-prompt">Choose round ${state.roundNumber + 1} prompt</button><button class="button danger ghost" data-action="end-game">End game now</button></div></div></section><aside><section class="panel"><div class="panel-head"><h2>Round winners</h2></div><div class="panel-body">${(state.round.results || []).map((result) => `<p class="round-winner-line">${avatarMarkup(result.avatar)}<span><b>${result.placement}. ${esc(result.studentName)}</b><br><span class="muted">${esc(result.teamName)} · +${result.points}</span></span></p>`).join("")}</div></section></aside></div>${writerLeaderboardPanel()}`;
  }

  function coopWritingView() {
    const coop = state.coop;
    const submittedPercent = state.playerCount ? Math.round(coop.submissionCount / state.playerCount * 100) : 0;
    return `<section class="projector-stage coop-monitor"><div><p class="section-kicker">Cooperative story lab</p><div class="timer-display timer-live">${formatTime(remainingSeconds(coop))}</div><h2 class="projector-copy">Eight ideas. One shared story.</h2><p class="muted">Students are writing complete sentences on their own screens. Drafts save as they type.</p><div class="writing-status">${coop.submissionCount} of ${state.playerCount} writers submitted</div><div class="progress-track"><span style="width:${submittedPercent}%"></span></div></div></section>
      <div class="stage-controls"><button class="button ghost" data-action="${coop.pausedRemainingMs !== null ? "coop-resume-timer" : "coop-pause-timer"}">${coop.pausedRemainingMs !== null ? "Resume timer" : "Pause timer"}</button><button class="button soft" data-action="coop-add-time" data-seconds="30">+30 seconds</button><button class="button danger" data-action="coop-end-writing">Collect ideas now</button></div>`;
  }

  function coopSelectionMarkup() {
    if (!state.coop.selections.length) return "";
    return `<section class="panel coop-picked-panel"><div class="panel-head"><div><p class="section-kicker">Story so far</p><h2>Locked ingredients</h2></div></div><div class="panel-body coop-picked-list">${state.coop.storyParts.map((part) => {
      const selection = state.coop.selections.find((item) => item.sectionId === part.sectionId);
      return `<article class="coop-picked-card"><span class="coop-part-icon">${esc(part.icon)}</span><div><b>${esc(part.label)}</b><p><em>${esc(part.bridge)}</em> ${esc(part.text)}</p><small>${avatarMarkup(selection?.avatar, "avatar-bubble small")} Contributed by ${esc(selection?.studentName || "the class")}</small></div><button class="button tiny ghost" data-action="coop-spin" data-section-id="${esc(part.sectionId)}">Re-spin</button></article>`;
    }).join("")}</div></section>`;
  }

  function coopSpinView() {
    const coop = state.coop;
    const section = coopSpinAnimation?.section || coop.currentSection;
    const displayedSectionIndex = Math.max(0, COOP_SECTIONS.findIndex((item) => item.id === section?.id));
    const candidates = section ? (coop.candidatesBySection?.[section.id] || []) : [];
    const slotCopy = coopSpinAnimation?.preview || (section ? "Pull the lever to choose a class idea." : "Every ingredient is locked in.");
    if (!section && coop.complete) {
      return `<section class="projector-stage coop-complete-stage"><div><p class="section-kicker">All ${coop.sectionCount} spins complete</p><div class="state-icon">✦</div><h2 class="projector-copy">Our story is ready to read.</h2><p class="muted">The transitions and sentence polish are already in place.</p><button class="button large gold" data-action="coop-finish">Reveal the complete story</button></div></section>${coopSelectionMarkup()}`;
    }
    return `<section class="slot-stage"><div class="slot-topline"><span>Spin ${Math.min(displayedSectionIndex + 1, coop.sectionCount)} of ${coop.sectionCount}</span><span>${candidates.length} possible idea${candidates.length === 1 ? "" : "s"}</span></div><div class="slot-section-icon">${esc(section?.icon || "✦")}</div><p class="section-kicker">${esc(section?.label || "Story ingredient")}</p><h2>${esc(section?.prompt || "Our story is ready.")}</h2><div class="slot-machine ${coopSpinAnimation ? "is-spinning" : ""}"><div class="slot-light-row" aria-hidden="true">${"<i></i>".repeat(11)}</div><div class="slot-window"><p id="slot-copy">${esc(slotCopy)}</p></div><div class="slot-light-row" aria-hidden="true">${"<i></i>".repeat(11)}</div></div><p class="slot-guidance">${esc(section?.guidance || "")}</p><button class="button large gold slot-lever" data-action="coop-spin" data-section-id="${esc(section?.id || "")}" ${coopSpinAnimation ? "disabled" : ""}>${coopSpinAnimation ? "Spinning…" : coop.selections.some((item) => item.sectionId === section?.id) ? "Spin this section again" : "Spin the Story Machine"}</button></section>${coopSelectionMarkup()}`;
  }

  function coopFinalView() {
    document.body.classList.add("celebrating");
    return `<section class="final-banner coop-final-banner"><p class="section-kicker" style="color:#ffd47d">Created together</p><h2 class="winner-name">Our impossible story</h2><p>${state.playerCount} writers · ${state.coop.sectionCount} spins · one shared result</p><div class="button-row"><button class="button large gold" type="button" data-action="new-game">Start another game</button></div></section><section class="panel coop-story-panel"><div class="panel-head"><div><p class="section-kicker">Read it aloud</p><h2>The class story</h2></div></div><div class="panel-body coop-final-story">${state.coop.storyParts.map((part) => {
      const selection = state.coop.selections.find((item) => item.sectionId === part.sectionId);
      return `<article><span>${esc(part.icon)}</span><div><p class="coop-bridge">${esc(part.bridge)}</p><p class="coop-prose">${esc(part.text)}</p><small>${avatarMarkup(selection?.avatar, "avatar-bubble small")} ${esc(selection?.studentName || "The class")}</small></div></article>`;
    }).join("")}</div></section>`;
  }

  async function runCoopSpin(sectionId) {
    const section = COOP_SECTIONS.find((item) => item.id === sectionId);
    const candidates = state.coop.candidatesBySection?.[sectionId] || [];
    if (!section || !candidates.length) throw new Error("No ideas are available for this story section.");
    coopSpinAnimation = { section, preview: candidates[0].text };
    render();
    let previewIndex = 0;
    const ticker = setInterval(() => {
      previewIndex = (previewIndex + 1) % candidates.length;
      const copy = document.getElementById("slot-copy");
      if (copy) copy.textContent = candidates[previewIndex].text;
    }, 90);
    try {
      const response = await teacherAction("teacher:coop-spin", { sectionId });
      await new Promise((resolve) => setTimeout(resolve, 1800));
      clearInterval(ticker);
      const copy = document.getElementById("slot-copy");
      if (copy) copy.textContent = response.selection.text;
      document.querySelector(".slot-machine")?.classList.add("is-locked");
      await new Promise((resolve) => setTimeout(resolve, 650));
      coopSpinAnimation = null;
      render();
    } catch (error) {
      clearInterval(ticker);
      coopSpinAnimation = null;
      render();
      throw error;
    }
  }

  function finalView() {
    const winner = state.teams[0];
    const allResults = state.roundHistory.flatMap((round) => round.results.map((result) => ({ ...result, round: round.number })));
    const studentStats = new Map();
    allResults.forEach((result) => {
      const key = result.studentName;
      const stats = studentStats.get(key) || { name: key, firsts: 0, votes: 0 };
      if (result.placement === 1) stats.firsts += 1;
      stats.votes += result.votes || 0;
      studentStats.set(key, stats);
    });
    const stats = [...studentStats.values()];
    const firstPlaceStar = stats.sort((a, b) => b.firsts - a.firsts || b.votes - a.votes)[0];
    const voteStar = [...stats].sort((a, b) => b.votes - a.votes || b.firsts - a.firsts)[0];
    document.body.classList.add("celebrating");
    return `<section class="final-banner"><p class="section-kicker" style="color:#ffd47d">Story Showdown champions</p><h2 class="winner-name">${esc(winner?.name || "Great writing")}</h2><p>${winner?.score.toLocaleString() || 0} points · A room full of bold ideas</p><div class="button-row"><button class="button large gold" type="button" data-action="new-game">Start a new game</button></div></section><section class="panel" style="margin-top:18px"><div class="panel-head"><h2>Final rankings</h2><div class="button-row" style="margin:0"><a class="button tiny ghost" href="/api/games/${encodeURIComponent(state.code)}/export.csv?token=${encodeURIComponent(credentials.teacherToken)}">Export CSV</a><a class="button tiny" target="_blank" rel="noopener" href="/api/games/${encodeURIComponent(state.code)}/print?token=${encodeURIComponent(credentials.teacherToken)}">Print / Save PDF</a></div></div><div class="panel-body">${leaderboardMarkup(true)}</div></section>
      ${writerLeaderboardPanel("Final writer leaderboard")}<section class="panel"><div class="panel-head"><div><p class="section-kicker">Every round</p><h2>Writer honors</h2></div></div><div class="panel-body"><div class="honors-grid">${state.roundHistory.map((round) => `<article class="honor-card"><p class="section-kicker">Round ${round.number}</p><h3>${esc(round.prompt.category)}</h3><p class="muted">${esc(round.prompt.text)}</p>${[...round.results].sort((a,b) => a.placement-b.placement).map((result) => `<div class="honor-row"><b>${result.placement}. ${esc(result.studentName)}</b><span>${esc(result.teamName)} · ${result.points.toLocaleString()} pts</span></div>`).join("") || '<p class="muted">No placements recorded.</p>'}</article>`).join("")}</div>${state.settings.revealNames && firstPlaceStar ? `<div class="spotlight-row"><div><span>Most first-place finishes</span><b>${esc(firstPlaceStar.name)} · ${firstPlaceStar.firsts}</b></div><div><span>Most total podium votes</span><b>${esc(voteStar.name)} · ${voteStar.votes}</b></div></div>` : ""}</div></section>`;
  }

  function render() {
    if (!state) return createScreen();
    document.body.classList.toggle("celebrating", ["final", "coop_final"].includes(state.phase));
    const views = {
      lobby: lobbyView,
      team_reveal: teamRevealView,
      pre_round: promptView,
      writing: writingView,
      review: reviewView,
      presentation: presentationView,
      voting: votingView,
      tie: tieView,
      results: resultsView,
      leaderboard: leaderboardView,
      final: finalView,
      coop_writing: coopWritingView,
      coop_spin: coopSpinView,
      coop_final: coopFinalView
    };
    app.innerHTML = `${gameHeader()}${(views[state.phase] || lobbyView)()}`;
    updateTimers();
  }

  function updateTimers() {
    document.querySelectorAll(".timer-live").forEach((element) => {
      const timerSource = state?.phase === "coop_writing" ? state.coop : state?.round;
      const remaining = remainingSeconds(timerSource);
      element.textContent = timerSource?.pausedRemainingMs !== null ? `${formatTime(remaining)} PAUSED` : formatTime(remaining);
      element.classList.toggle("warning", remaining <= 60 && remaining > 10);
      element.classList.toggle("urgent", remaining <= 10);
    });
  }

  function promptPayload(form) {
    const data = new FormData(form);
    return {
      id: state.draftPrompt?.id || `teacher-${Date.now()}`,
      text: data.get("text"), category: data.get("category"), difficulty: data.get("difficulty"),
      responseLength: data.get("responseLength"), suggestion: data.get("suggestion"), timerSeconds: Number(data.get("timerSeconds"))
    };
  }

  function settingsPayload(form) {
    const data = new FormData(form);
    const fallback = state?.settings || { gameMode: "competitive", teamCount: 4, totalRounds: 3, defaultDuration: 240, promptMode: "random", revealNames: true };
    const revealControl = form.elements.namedItem("revealNames");
    return {
      gameMode: data.get("gameMode") || fallback.gameMode,
      teamCount: Number(data.get("teamCount")) || fallback.teamCount,
      totalRounds: Number(data.get("totalRounds")) || fallback.totalRounds,
      defaultDuration: Number(data.get("defaultDuration")) || fallback.defaultDuration,
      promptMode: data.get("promptMode") || fallback.promptMode,
      revealNames: revealControl ? revealControl.checked : fallback.revealNames
    };
  }

  async function saveLobbySettings(showToast = true) {
    const form = document.getElementById("settings-form");
    if (!form) return null;
    const settings = settingsPayload(form);
    await teacherAction("teacher:update-settings", { settings });
    if (showToast) toast(settings.gameMode === "cooperative" ? "Cooperative Story Machine ready." : `${settings.teamCount} teams ready. Settings saved.`, "success");
    return settings;
  }

  app.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      if (event.target.id === "create-form") {
        const response = await emit(socket, "game:create", { settings: settingsPayload(event.target) });
        saveCredentials({ code: response.code, teacherToken: response.teacherToken });
        state = response.state;
        render();
      } else if (event.target.id === "settings-form") {
        await saveLobbySettings();
      } else if (event.target.id === "prompt-form") {
        const prompt = promptPayload(event.target);
        await teacherAction("teacher:start-round", { prompt, durationSeconds: prompt.timerSeconds });
      }
    } catch (error) { toast(error.message); }
  });

  app.addEventListener("change", async (event) => {
    try {
      if (event.target.form?.id === "create-form" && event.target.name === "gameMode") syncCreateMode();
      else if (event.target.form?.id === "settings-form") await saveLobbySettings();
      else if (event.target.dataset.action === "reassign") await teacherAction("teacher:reassign-player", { playerId: event.target.dataset.playerId, teamId: event.target.value });
    }
    catch (error) { toast(error.message); }
  });

  app.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    try {
      button.disabled = true;
      if (action === "new-game") {
        if (!confirm("Open a fresh game setup? Your current game will stay saved.")) { button.disabled = false; return; }
        openNewGameSetup();
      }
      else if (action === "toggle-lock") await teacherAction("teacher:lock-joining", { locked: !state.settings.joiningLocked });
      else if (action === "start-game") {
        const settings = document.getElementById("settings-form") ? settingsPayload(document.getElementById("settings-form")) : null;
        await teacherAction("teacher:start-game", settings ? { settings } : {});
      }
      else if (action === "continue-teams") await teacherAction("teacher:continue-from-teams");
      else if (action === "remove-player") { if (!confirm("Remove this student from the game?")) { button.disabled = false; return; } await teacherAction("teacher:remove-player", { playerId: button.dataset.playerId }); }
      else if (action === "rename-team") await teacherAction("teacher:rename-team", { teamId: button.dataset.teamId, name: document.querySelector(`[data-team-name="${CSS.escape(button.dataset.teamId)}"]`).value });
      else if (action === "reroll-prompt") await teacherAction("teacher:preview-prompt", { filters: { category: document.getElementById("category-filter")?.value, responseLength: document.getElementById("length-filter")?.value } });
      else if (action === "category-prompt") await teacherAction("teacher:preview-prompt", { filters: { category: button.dataset.category, responseLength: "all" } });
      else if (action === "blank-prompt") {
        await teacherAction("teacher:select-prompt", { prompt: { id: `teacher-${Date.now()}`, text: "", category: "Custom", difficulty: "teacher choice", responseLength: "medium", suggestion: "Teacher-selected length", timerSeconds: state.settings.defaultDuration } });
        requestAnimationFrame(() => document.querySelector('#prompt-form textarea[name="text"]')?.focus());
      }
      else if (action === "save-custom") { await teacherAction("teacher:save-custom-prompt", { prompt: promptPayload(document.getElementById("prompt-form")) }); toast("Custom prompt saved for this game.", "success"); }
      else if (action === "pause-timer") await teacherAction("teacher:pause-timer");
      else if (action === "resume-timer") await teacherAction("teacher:resume-timer");
      else if (action === "add-time") await teacherAction("teacher:add-time", { seconds: Number(button.dataset.seconds) });
      else if (action === "end-writing") { if (!confirm("End writing and submit all unfinished responses?")) { button.disabled = false; return; } await teacherAction("teacher:end-writing"); }
      else if (action === "coop-pause-timer") await teacherAction("teacher:coop-pause-timer");
      else if (action === "coop-resume-timer") await teacherAction("teacher:coop-resume-timer");
      else if (action === "coop-add-time") await teacherAction("teacher:coop-add-time", { seconds: Number(button.dataset.seconds) });
      else if (action === "coop-end-writing") { if (!confirm("Collect the class ideas now? Saved drafts will be submitted automatically.")) { button.disabled = false; return; } await teacherAction("teacher:coop-end-writing"); }
      else if (action === "coop-spin") await runCoopSpin(button.dataset.sectionId);
      else if (action === "coop-finish") await teacherAction("teacher:coop-finish");
      else if (action === "restart-round") { if (!confirm("Restart this round? Current writing and votes will be cleared.")) { button.disabled = false; return; } await teacherAction("teacher:restart-round"); }
      else if (action === "edit-submission") { await teacherAction("teacher:moderate", { action: "edit", submissionId: button.dataset.id, text: document.getElementById(`submission-${button.dataset.id}`).value }); toast("Typo edit saved.", "success"); }
      else if (action === "hide-submission") await teacherAction("teacher:moderate", { action: "hide", submissionId: button.dataset.id, value: button.dataset.value === "true" });
      else if (action === "disqualify-submission") await teacherAction("teacher:moderate", { action: "disqualify", submissionId: button.dataset.id, value: button.dataset.value === "true" });
      else if (action === "start-presentation") await teacherAction("teacher:start-presentation");
      else if (action === "navigate") await teacherAction("teacher:navigate-presentation", { direction: Number(button.dataset.direction) });
      else if (action === "start-voting") await teacherAction("teacher:start-voting");
      else if (action === "close-voting") await teacherAction("teacher:close-voting");
      else if (action === "resolve-manual") await teacherAction("teacher:resolve-tie", { method: "manual", submissionId: button.dataset.id });
      else if (action === "resolve-revote") await teacherAction("teacher:resolve-tie", { method: "revote" });
      else if (action === "resolve-share") await teacherAction("teacher:resolve-tie", { method: "share" });
      else if (action === "reveal-result") await teacherAction("teacher:reveal-result");
      else if (action === "show-leaderboard") await teacherAction("teacher:show-leaderboard");
      else if (action === "next-prompt") await teacherAction("teacher:open-prompt-lab");
      else if (action === "adjust-score") await teacherAction("teacher:adjust-score", { teamId: button.dataset.teamId, delta: Number(document.getElementById(`score-${button.dataset.teamId}`).value) });
      else if (action === "end-game") { if (!confirm("End the game and show final standings?")) { button.disabled = false; return; } await teacherAction("teacher:end-game"); }
    } catch (error) { toast(error.message); button.disabled = false; }
  });

  socket.on("state", (nextState) => {
    const phaseChanged = Boolean(state?.phase && state.phase !== nextState.phase);
    state = nextState;
    render();
    if (phaseChanged) window.scrollTo({ top: 0, behavior: "auto" });
  });
  socket.on("disconnect", () => { document.getElementById("connection-banner").hidden = false; });
  socket.on("connect", async () => {
    document.getElementById("connection-banner").hidden = true;
    if (!credentials) return;
    try {
      const response = await emit(socket, "teacher:connect", credentials);
      state = response.state;
      render();
    } catch (error) { toast(error.message); credentials = null; createScreen(); }
  });

  credentials = storedCredentials();
  if (!credentials) createScreen();
  setInterval(updateTimers, 250);
})();
