const app = {
  playerId: localStorage.getItem("corporateLadderPlayerId") || "",
  data: null,
  teacherMode: localStorage.getItem("corporateLadderTeacherMode") === "true",
  secretDraft: { actionId: "", targetId: "" }
};

const refs = {
  stockTicker: document.getElementById("stock-ticker"),
  phaseBadge: document.getElementById("phase-badge"),
  scenarioTitle: document.getElementById("scenario-title"),
  scenarioSubtitle: document.getElementById("scenario-subtitle"),
  joinForm: document.getElementById("join-form"),
  teacherModeButton: document.getElementById("teacher-mode-button"),
  companyStats: document.getElementById("company-stats"),
  roundHeading: document.getElementById("round-heading"),
  timerValue: document.getElementById("timer-value"),
  phaseTrack: document.getElementById("phase-track"),
  playerPanel: document.getElementById("player-panel"),
  playerTitle: document.getElementById("player-title"),
  playerContent: document.getElementById("player-content"),
  teacherPanel: document.getElementById("teacher-panel"),
  teacherSummary: document.getElementById("teacher-summary"),
  startRoundButton: document.getElementById("start-round-button"),
  advancePhaseButton: document.getElementById("advance-phase-button"),
  resetGameButton: document.getElementById("reset-game-button"),
  levelRoster: document.getElementById("level-roster"),
  leaderboard: document.getElementById("leaderboard"),
  roundLog: document.getElementById("round-log"),
  newsTicker: document.getElementById("news-ticker"),
  toast: document.getElementById("toast")
};

refs.joinForm.addEventListener("submit", handleJoin);
refs.teacherModeButton.addEventListener("click", () => {
  app.teacherMode = !app.teacherMode;
  localStorage.setItem("corporateLadderTeacherMode", String(app.teacherMode));
  render();
});
refs.startRoundButton.addEventListener("click", () => postAction("/api/corporate-ladder/teacher/start", {}));
refs.advancePhaseButton.addEventListener("click", () => postAction("/api/corporate-ladder/teacher/advance", {}));
refs.resetGameButton.addEventListener("click", () => {
  if (confirm("Reset Corporate Ladder for the whole class?")) {
    postAction("/api/corporate-ladder/teacher/reset", {});
  }
});
document.addEventListener("click", handleDocumentClick);

bootstrap();
setInterval(bootstrap, 1800);
setInterval(updateTimerOnly, 500);

async function bootstrap() {
  const response = await fetch(`/api/corporate-ladder/state?playerId=${encodeURIComponent(app.playerId)}`);
  app.data = await response.json();
  render();
}

async function postAction(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, playerId: app.playerId })
  });
  const data = await response.json();
  if (!response.ok) {
    showToast(data.error || "Action failed.");
    return;
  }
  app.data = data;
  render();
}

async function handleJoin(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const response = await fetch("/api/corporate-ladder/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playerId: app.playerId,
      name: formData.get("name")
    })
  });
  const data = await response.json();
  if (!response.ok) {
    showToast(data.error || "Could not join.");
    return;
  }
  app.playerId = data.viewer.id;
  localStorage.setItem("corporateLadderPlayerId", app.playerId);
  app.data = data;
  showToast("You are on the org chart.");
  render();
}

function handleDocumentClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }
  const action = button.dataset.action;
  if (action === "task") {
    postAction("/api/corporate-ladder/task", {
      score: button.dataset.score,
      choice: button.dataset.choice
    });
  }
  if (action === "secret-pick") {
    app.secretDraft.actionId = button.dataset.actionId;
    renderPlayerPanel();
  }
  if (action === "secret-target") {
    app.secretDraft.targetId = button.dataset.targetId;
    postAction("/api/corporate-ladder/secret-action", app.secretDraft);
  }
  if (action === "vote") {
    postAction("/api/corporate-ladder/vote", { optionId: button.dataset.optionId });
  }
}

function render() {
  if (!app.data) {
    return;
  }
  renderHero();
  renderNewsTicker();
  renderCompanyStats();
  renderPhaseTrack();
  updateTimerOnly();
  renderPlayerPanel();
  renderTeacherPanel();
  renderRoster();
  renderLeaderboard();
  renderLog();
}

function renderHero() {
  const { state } = app.data;
  const scenario = state.currentScenario;
  refs.phaseBadge.textContent = formatPhase(state.phase);
  refs.roundHeading.textContent = state.phase === "lobby" ? "Lobby" : `Round ${state.roundNumber}: ${formatPhase(state.phase)}`;
  refs.scenarioTitle.textContent = scenario?.headline || "One company. Four levels. Zero clean hands.";
  refs.scenarioSubtitle.textContent = scenario?.ticker || "Join the company, wait for the teacher to launch a round, then decide whether to help the business or help yourself.";
  refs.stockTicker.textContent = `CLDR ${state.company.stock.toFixed(2)} ${state.company.stock >= 65 ? "▲" : "▼"} ${scenario?.ticker || "The board is pretending everything is normal."}`;
}

function renderNewsTicker() {
  const scenario = app.data.state.currentScenario;
  const items = scenario?.intro?.newsTicker?.length
    ? scenario.intro.newsTicker
    : ["Investors demand emergency meeting", "Public trust under review", "Internal blame map forming"];
  refs.newsTicker.innerHTML = `<span>${items.map(escapeHtml).join("   /   ")}</span>`;
}

function renderCompanyStats() {
  const labels = {
    profit: "Profit",
    morale: "Morale",
    publicTrust: "Public Trust",
    productivity: "Productivity",
    ethics: "Ethics",
    stock: "Stock"
  };
  refs.companyStats.innerHTML = Object.entries(labels).map(([key, label]) => {
    const value = app.data.state.company[key] || 0;
    return `
      <div class="stat-card">
        <span class="muted">${label}</span>
        <strong>${Math.round(value)}</strong>
        <div class="meter" style="--value: ${Math.min(100, value)}%"><span></span></div>
      </div>
    `;
  }).join("");
}

function renderPhaseTrack() {
  refs.phaseTrack.innerHTML = app.data.phaseOrder.map((phase) => `
    <div class="phase-step ${phase === app.data.state.phase ? "is-active" : ""}">${formatPhase(phase)}</div>
  `).join("");
}

function updateTimerOnly() {
  if (!app.data) {
    return;
  }
  const { phaseStartedAt, phaseDurationSeconds } = app.data.state;
  const elapsed = Math.max(0, Math.floor((Date.now() - phaseStartedAt) / 1000));
  const remaining = Math.max(0, phaseDurationSeconds - elapsed);
  refs.timerValue.textContent = phaseDurationSeconds ? formatClock(remaining) : "--:--";
  const percent = phaseDurationSeconds ? `${Math.max(0, Math.min(100, (remaining / phaseDurationSeconds) * 100))}%` : "0%";
  document.querySelector(".timer-ring").style.setProperty("--time", percent);
}

function renderPlayerPanel() {
  const viewer = app.data.viewer;
  if (!viewer) {
    refs.playerTitle.textContent = "Not joined yet";
    refs.playerContent.innerHTML = `<p class="muted">Students join with a name and company level. The game will show each player different information based on their level.</p>`;
    return;
  }

  refs.playerTitle.textContent = `${viewer.name} · ${viewer.title}`;
  refs.playerContent.innerHTML = [
    renderPersonalStats(viewer),
    renderLevelIntel(viewer),
    renderPhaseAction(viewer)
  ].join("");
}

function renderPersonalStats(player) {
  const stats = ["performance", "reputation", "influence", "loyalty", "suspicion", "ambition"];
  return `
    <div class="profile-strip">
      <div class="avatar avatar-large" style="background-image: url('${escapeHtml(player.avatarPath || "")}')"></div>
      <div>
        <strong>${escapeHtml(player.name)}</strong>
        <p class="muted">${escapeHtml(player.title)} · Vote power ${player.votePower} · Score ${player.score}</p>
      </div>
    </div>
    <div class="stat-grid">
      ${stats.map((key) => `
        <div class="stat-card">
          <span class="muted">${capitalize(key)}</span>
          <strong>${Math.round(player[key])}</strong>
          <div class="meter" style="--value: ${player[key]}%"><span></span></div>
        </div>
      `).join("")}
    </div>
    <p><span class="pill">Vote power ${player.votePower}</span> <span class="pill">Score ${player.score}</span></p>
  `;
}

function renderLevelIntel(player) {
  const scenario = app.data.state.currentScenario;
  if (!scenario) {
    return `<div class="mini-card"><strong>Waiting for a crisis</strong><p class="muted">The teacher starts the first round from the host dashboard.</p></div>`;
  }
  const info = scenario.levelInfo[player.level] || [];
  return `
    <div class="mini-card">
      <strong>Your level-specific information</strong>
      <ul class="info-list">${info.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div>
  `;
}

function renderPhaseAction(player) {
  const phase = app.data.state.phase;
  if (phase === "task") {
    return renderTaskPhase(player);
  }
  if (phase === "reveal") {
    return renderEventIntro(player);
  }
  if (phase === "discussion") {
    return `<div class="mini-card"><strong>Team discussion</strong><p class="muted">Talk openly. Persuade, defend, bargain, accuse, form alliances, or act extremely normal while planning something questionable.</p></div>`;
  }
  if (phase === "secret") {
    return renderSecretPhase(player);
  }
  if (phase === "vote") {
    return renderVotePhase(player);
  }
  if (phase === "results") {
    return `<div class="mini-card"><strong>Performance review screen</strong><p class="muted">Results are in. Watch the log for betrayals, exposure, promotions, demotions, and company consequences.</p></div>`;
  }
  return `<div class="mini-card"><strong>${formatPhase(phase)}</strong><p class="muted">Watch the teacher dashboard and your level intel.</p></div>`;
}

function renderEventIntro(player) {
  const scenario = app.data.state.currentScenario;
  if (!scenario?.intro) {
    return "";
  }
  const intro = scenario.intro;
  const levelConcern = intro.levelConcerns[player.level] || "Your level has partial information. Use it carefully.";
  return `
    <div class="event-intro">
      <div class="event-alert-row">
        <span class="alert-light"></span>
        <strong>${escapeHtml(intro.visualCue || "BREAKING NEWS")}</strong>
        <span>Emergency shareholder alert</span>
      </div>
      <h3>${escapeHtml(intro.headline)}</h3>
      ${intro.image ? `
        <figure class="event-art">
          <img src="${escapeHtml(intro.image)}" alt="${escapeHtml(intro.imageAlt || intro.headline)}" />
        </figure>
      ` : ""}
      <p>${escapeHtml(intro.breakingNews)}</p>
      <div class="impact-grid">
        ${intro.companyImpact.map((item) => `<div><span class="impact-dot"></span>${escapeHtml(item)}</div>`).join("")}
      </div>
      <div class="level-concern">
        <strong>Your level concern</strong>
        <p>${escapeHtml(levelConcern)}</p>
      </div>
      <div class="political-warning">
        <strong>Political tension</strong>
        <p>${escapeHtml(intro.politicalTension)}</p>
      </div>
      <div class="social-feed">
        <strong>Live social feed</strong>
        <div class="social-scroll">
          ${intro.socialFeed.map((item, index) => `<p style="--delay: ${index * 0.14}s">@panicdesk${index + 1}: ${escapeHtml(item)}</p>`).join("")}
        </div>
      </div>
      <div class="stage-preview">
        ${scenario.stages.map((stage) => `
          <div>
            <strong>${escapeHtml(stage.label)}</strong>
            <span>${escapeHtml(stage.betrayal)}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderTaskPhase(player) {
  const tasks = {
    entry: [
      ["Identify defects", 82, "Quality control caught rushed products"],
      ["Calm customers", 70, "Customer complaint responses were steady"],
      ["Push through workload", 48, "Speed improved, morale took a hit"]
    ],
    management: [
      ["Balance staffing", 80, "Schedules protect morale and output"],
      ["Hit quotas", 66, "Production stays moving"],
      ["Pressure workers", 45, "Numbers rise while trust drops"]
    ],
    senior: [
      ["Fund the fix", 78, "Budget absorbs the crisis"],
      ["Limit legal risk", 72, "Legal exposure narrows"],
      ["Protect revenue", 50, "Targets survive with ethical bruising"]
    ],
    executive: [
      ["Careful statement", 76, "Investors hear control without denial"],
      ["Market confidence", 68, "Stock panic slows"],
      ["Bonus defense", 42, "The room smells like self-interest"]
    ]
  };
  return `
    <div class="mini-card">
      <strong>Level task mini-game</strong>
      <p class="muted">Pick the work your level completes this phase. Higher scores increase performance and influence.</p>
      <div class="action-grid">
        ${(tasks[player.level] || tasks.entry).map(([label, score, choice]) => `
          <button class="option-button" data-action="task" data-score="${score}" data-choice="${escapeHtml(choice)}">
            <strong>${label}</strong><br><span class="muted">${choice} · ${score}%</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderSecretPhase(player) {
  const coworkers = app.data.players.filter((candidate) => candidate.id !== player.id && candidate.level === player.level);
  const fallbackTargets = app.data.players.filter((candidate) => candidate.id !== player.id);
  const targets = coworkers.length ? coworkers : fallbackTargets;
  const selectedAction = app.data.secretActions.find((action) => action.id === app.secretDraft.actionId);
  return `
    <div class="mini-card">
      <strong>Secret action</strong>
      <p class="muted">Choose one hidden action. Betrayal can raise your standing, but suspicion and exposure can wreck your review.</p>
      <div class="action-grid">
        ${app.data.secretActions.map((action) => `
          <button class="option-button" data-action="secret-pick" data-action-id="${action.id}">
            <strong>${action.label}</strong><br><span class="muted">${action.type} · exposure risk ${action.risk}%</span>
          </button>
        `).join("")}
      </div>
    </div>
    <div class="mini-card">
      <strong>Target ${selectedAction ? `for ${selectedAction.label}` : ""}</strong>
      <div class="target-grid">
        ${targets.map((target) => `
          <button class="target-button" data-action="secret-target" data-target-id="${target.id}" ${selectedAction ? "" : "disabled"}>
            ${escapeHtml(target.name)}<br><span class="muted">${target.title} · rep ${target.reputation} · suspicion ${target.suspicion}</span>
          </button>
        `).join("") || `<p class="muted">Waiting for coworkers to join.</p>`}
      </div>
    </div>
  `;
}

function renderVotePhase() {
  const scenario = app.data.state.currentScenario;
  if (!scenario) {
    return "";
  }
  return `
    <div class="mini-card">
      <strong>Company vote</strong>
      <p class="muted">Votes are individual. Influence and level change vote strength.</p>
      <div class="action-grid">
        ${scenario.options.map((option) => `
          <button class="option-button" data-action="vote" data-option-id="${option.id}">
            <strong>${escapeHtml(option.label)}</strong><br>
            <span class="muted">Profit ${signed(option.effects.profit)} · Morale ${signed(option.effects.morale)} · Trust ${signed(option.effects.publicTrust)} · Ethics ${signed(option.effects.ethics)}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderTeacherPanel() {
  refs.teacherPanel.classList.toggle("hidden", !app.teacherMode);
  refs.teacherModeButton.textContent = app.teacherMode ? "Hide Teacher Dashboard" : "Teacher Dashboard";
  const counts = app.data.state.counts;
  refs.teacherSummary.innerHTML = `
    <div class="mini-card"><strong>Class pulse</strong><p>${counts.players} players · ${counts.tasks} tasks · ${counts.secretActions} secret actions · ${counts.votes} votes</p></div>
    <div class="mini-card"><strong>Host pacing</strong><p class="muted">Recommended: reveal 1 min, task 2 min, discussion 5 min, secret 1 min, vote 1 min, results 2 min.</p></div>
  `;
}

function renderRoster() {
  refs.levelRoster.innerHTML = app.data.levels.map((level) => {
    const players = app.data.players.filter((player) => player.level === level.id);
    return `
      <div class="level-column">
        <h3>${level.label}</h3>
        <p class="muted">${level.risk}</p>
        ${players.map((player, index) => renderPlayerRow(player, index)).join("") || `<p class="muted">Open seats</p>`}
      </div>
    `;
  }).join("");
}

function renderPlayerRow(player, index) {
  return `
    <div class="player-row">
      <div class="avatar" style="background-image: url('${escapeHtml(player.avatarPath || "")}')"></div>
      <div>
        <strong>${escapeHtml(player.name)}</strong>
        <p class="muted">Score ${player.score} · vote ${player.votePower}${player.hasSecretAction ? " · sealed envelope" : ""}</p>
      </div>
    </div>
  `;
}

function renderLeaderboard() {
  refs.leaderboard.innerHTML = app.data.players.slice(0, 8).map((player, index) => `
    <div class="leader-row">
      <strong>#${index + 1}</strong>
      <div class="avatar" style="background-image: url('${escapeHtml(player.avatarPath || "")}')"></div>
      <div>
        <strong>${escapeHtml(player.name)}</strong>
        <p class="muted">${player.title} · rep ${player.reputation} · suspicion ${player.suspicion}</p>
      </div>
      <span class="pill">${player.score}</span>
    </div>
  `).join("") || `<p class="muted">No employees on the leaderboard yet.</p>`;
}

function renderLog() {
  const items = app.data.state.roundLog.length ? app.data.state.roundLog : app.data.state.announcements;
  refs.roundLog.innerHTML = items.slice().reverse().map((item) => `<div class="log-item">${escapeHtml(item)}</div>`).join("");
}

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatPhase(phase) {
  return String(phase || "lobby").replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function signed(value) {
  return value > 0 ? `+${value}` : String(value);
}

function showToast(message) {
  refs.toast.textContent = message;
  refs.toast.classList.remove("hidden");
  setTimeout(() => refs.toast.classList.add("hidden"), 2600);
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}
