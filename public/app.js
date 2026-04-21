const state = {
  data: null,
  ui: {
    authPending: false,
    scenarioDraft: {
      presetId: "",
      headline: "",
      body: ""
    },
    marketPublishPopup: null,
    selectedAvatarId: null
  }
};

const STAFF_DIRECTORY = {
  jake: {
    name: "Adrian",
    title: "Waiter",
    avatar: "/assets/staff/adrian.png",
    accent: "waiter",
    badge: "Floor Lead"
  },
  nina: {
    name: "Celia",
    title: "Waitress",
    avatar: "/assets/staff/celia.png",
    accent: "waitress",
    badge: "Section Ace"
  },
  marcus: {
    name: "Omar",
    title: "Busser",
    avatar: "/assets/staff/omar.png",
    accent: "busser",
    badge: "Reset Crew"
  },
  tasha: {
    name: "Chef Renata",
    title: "Head Chef",
    avatar: "/assets/staff/chef-renata.png",
    accent: "chef",
    badge: "Expo"
  },
  elena: {
    name: "Marisol",
    title: "Hostess",
    avatar: "/assets/staff/marisol.png",
    accent: "hostess",
    badge: "Front Door"
  },
  luis: {
    name: "Theo",
    title: "Line Cook",
    avatar: "/assets/staff/theo.png",
    accent: "line",
    badge: "Grill"
  },
  priya: {
    name: "Imani",
    title: "Line Cook",
    avatar: "/assets/staff/imani.png",
    accent: "line",
    badge: "Saute"
  },
  devon: {
    name: "Parker",
    title: "Host + Wait",
    avatar: "/assets/staff/parker.png",
    accent: "hybrid",
    badge: "Flex"
  }
};

const EVENT_ART_DIRECTORY = {
  "open-close-kitchen-feud": {
    image: "/assets/feast-haven/events/open-close-kitchen-feud.png",
    alt: "Feast Haven opening staff staring at a trashed kitchen after a rough close"
  },
  "hard-burger-ticket-war": {
    image: "/assets/feast-haven/events/hard-burger-ticket-war.png",
    alt: "Servers and kitchen staff arguing over a ruined burger and unreadable tickets"
  },
  "viral-gossip-backfire": {
    image: "/assets/feast-haven/events/viral-gossip-backfire.png",
    alt: "A hostess filming restaurant drama on her phone while staff argue behind her"
  },
  "emotional-support-date": {
    image: "/assets/feast-haven/events/emotional-support-date.png",
    alt: "A badly behaved dog causing chaos at a white-tablecloth restaurant table"
  },
  "buffalo-breakdown": {
    image: "/assets/feast-haven/events/buffalo-breakdown.png",
    alt: "Feast Haven kitchen staff panicking after running out of buffalo sauce midweek"
  },
  "busser-flirt-slowdown": {
    image: "/assets/feast-haven/events/busser-flirt-slowdown.png",
    alt: "A busser charming guests while jealous coworkers watch from a messy service area"
  },
  "chef-mad-scientist-menu": {
    image: "/assets/feast-haven/events/chef-mad-scientist-menu.png",
    alt: "Chef Renata proudly presenting wild experimental dishes while the staff look stressed"
  },
  "silverware-collapse": {
    image: "/assets/feast-haven/events/silverware-collapse.png",
    alt: "Restaurant staff trying to serve a dining room with only a handful of silverware"
  },
  "dirty-dishes-war": {
    image: "/assets/feast-haven/events/dirty-dishes-war.png",
    alt: "Kitchen, dish, and floor staff in a full blame spiral over grimy plates"
  },
  "food-heaven-rivalry": {
    image: "/assets/feast-haven/events/food-heaven-rivalry.png",
    alt: "Feast Haven staff glaring across the street at the glowing Food Heaven opening"
  }
};

const SCORE_TIER_BADGES = {
  1: "/assets/feast-haven/badges/badge-crossed-utensils.png",
  2: "/assets/feast-haven/badges/badge-service-blades.png",
  3: "/assets/feast-haven/badges/badge-cloche-banner.png",
  4: "/assets/feast-haven/badges/badge-chef-hat.png",
  5: "/assets/feast-haven/badges/badge-cloche-laurels.png",
  6: "/assets/feast-haven/badges/badge-royal-service.png"
};

const TRUST_BADGE_BY_TONE = {
  danger: "/assets/feast-haven/trust-badges/trust-low.png",
  warning: "/assets/feast-haven/trust-badges/trust-low.png",
  muted: "/assets/feast-haven/trust-badges/trust-guarded.png",
  open: "/assets/feast-haven/trust-badges/trust-guarded.png",
  success: "/assets/feast-haven/trust-badges/trust-high.png"
};

const CASE_STAGE_META = {
  1: { label: "Opening Issue", icon: "/assets/feast-haven/case-stage-icons/stage-1-opening-issue.png" },
  2: { label: "First Response", icon: "/assets/feast-haven/case-stage-icons/stage-2-first-response.png" },
  3: { label: "Escalation", icon: "/assets/feast-haven/case-stage-icons/stage-3-escalation.png" },
  4: { label: "Internal Fallout", icon: "/assets/feast-haven/case-stage-icons/stage-4-internal-fallout.png" },
  5: { label: "Public Consequence", icon: "/assets/feast-haven/case-stage-icons/stage-5-public-consequence.png" },
  6: { label: "Final Resolution", icon: "/assets/feast-haven/case-stage-icons/stage-6-final-resolution.png" }
};

const AWARD_ICON_BY_ID = {
  rainmaker: "/assets/feast-haven/award-icons/award-revenue-bag.png",
  profit_protector: "/assets/feast-haven/award-icons/award-revenue-bag.png",
  culture_builder: "/assets/feast-haven/award-icons/award-team-lineup.png",
  people_first: "/assets/feast-haven/award-icons/award-team-lineup.png",
  showroom_anchor: "/assets/feast-haven/award-icons/award-team-lineup.png",
  trusted_leader: "/assets/feast-haven/award-icons/award-trust-heartshield.png",
  customer_whisperer: "/assets/feast-haven/award-icons/award-trust-heartshield.png",
  reputation_shield: "/assets/feast-haven/award-icons/award-trust-heartshield.png",
  balanced_boss: "/assets/feast-haven/award-icons/award-balance-scales.png",
  systems_builder: "/assets/feast-haven/award-icons/award-balance-scales.png",
  steady_hand: "/assets/feast-haven/award-icons/award-balance-scales.png",
  comeback_manager: "/assets/feast-haven/award-icons/award-phoenix-cup.png",
  resilience_engine: "/assets/feast-haven/award-icons/award-phoenix-cup.png",
  hard_lesson: "/assets/feast-haven/award-icons/award-phoenix-cup.png",
  growth_promoter: "/assets/feast-haven/award-icons/award-chef-cup.png",
  fast_closer: "/assets/feast-haven/award-icons/award-chef-cup.png"
};

const refs = {
  marketStatusPanel: document.getElementById("market-status-panel"),
  authSection: document.getElementById("auth-section"),
  sessionBar: document.getElementById("session-bar"),
  studentView: document.getElementById("student-view"),
  teacherView: document.getElementById("teacher-view"),
  studentNameHeading: document.getElementById("student-name-heading"),
  studentSummary: document.getElementById("student-summary"),
  studentRoundPanel: document.getElementById("student-round-panel"),
  staffGrid: document.getElementById("staff-grid"),
  historyPanel: document.getElementById("history-panel"),
  teacherSummary: document.getElementById("teacher-summary"),
  teacherControls: document.getElementById("teacher-controls"),
  teacherSettingsForm: document.getElementById("teacher-settings-form"),
  scenarioForm: document.getElementById("scenario-form"),
  presetSelect: document.getElementById("preset-select"),
  scenarioPreview: document.getElementById("scenario-preview"),
  predictionMarketForm: document.getElementById("prediction-market-form"),
  predictionMarketList: document.getElementById("prediction-market-list"),
  studentAvatarPicker: document.getElementById("student-avatar-picker"),
  studentAvatarInput: document.getElementById("student-avatar-id"),
  marketPublishPopup: document.getElementById("market-publish-popup"),
  marketPublishTitle: document.getElementById("market-publish-title"),
  marketPublishDetail: document.getElementById("market-publish-detail"),
  marketPublishMeta: document.getElementById("market-publish-meta"),
  studentRoster: document.getElementById("student-roster"),
  teacherFeed: document.getElementById("teacher-feed"),
  leaderboard: document.getElementById("leaderboard"),
  roundFeed: document.getElementById("round-feed"),
  launchScenarioButton: document.getElementById("launch-scenario-button"),
  registerForm: document.getElementById("student-register-form"),
  studentLoginForm: document.getElementById("student-login-form"),
  teacherLoginForm: document.getElementById("teacher-login-form"),
  toast: document.getElementById("toast")
};

refs.registerForm.addEventListener("submit", (event) => handleAuth(event, "/api/register"));
refs.studentLoginForm.addEventListener("submit", (event) => handleAuth(event, "/api/login"));
refs.teacherLoginForm.addEventListener("submit", handleTeacherLogin);
refs.teacherSettingsForm.addEventListener("submit", handleTeacherSettingsSubmit);
refs.scenarioForm.addEventListener("submit", handleScenarioSubmit);
refs.scenarioForm.addEventListener("input", handleScenarioDraftChange);
refs.scenarioForm.addEventListener("change", handleScenarioDraftChange);
refs.registerForm.addEventListener("click", handleRegisterFormClick);
if (refs.predictionMarketForm) {
  refs.predictionMarketForm.addEventListener("submit", handlePredictionMarketSubmit);
}
document.addEventListener("click", handleDocumentClick);
if (refs.predictionMarketList) {
  refs.predictionMarketList.addEventListener("click", handlePredictionMarketListClick);
}
refs.teacherControls.addEventListener("click", handleTeacherControlsClick);
refs.studentRoundPanel.addEventListener("click", handleStudentRoundClick);
refs.studentRoster.addEventListener("click", handleStudentRosterClick);
refs.studentRoster.addEventListener("submit", handleStudentRosterSubmit);

bootstrap();
setInterval(async () => {
  if (shouldPauseBackgroundRefresh()) {
    return;
  }
  await bootstrap(false);
}, 10000);

async function bootstrap(showErrors = true) {
  try {
    const response = await fetch("/api/bootstrap");
    if (!response.ok) {
      throw new Error("Could not load the latest game state.");
    }
    state.data = await response.json();
    syncScenarioDraft();
    syncAvatarSelection();
    render();
  } catch (error) {
    if (showErrors) {
      showToast(error.message || "Could not reach the server.");
    }
  }
}

function shouldPauseBackgroundRefresh() {
  if (state.ui.authPending) {
    return true;
  }

  const activeElement = document.activeElement;
  if (!activeElement) {
    return false;
  }

  return refs.authSection.contains(activeElement) || refs.scenarioForm.contains(activeElement) || refs.teacherSettingsForm.contains(activeElement);
}

function syncScenarioDraft() {
  if (!state.data?.presets?.length) {
    return;
  }

  const stillExists = state.data.presets.some((preset) => preset.id === state.ui.scenarioDraft.presetId);
  if (!stillExists) {
    state.ui.scenarioDraft.presetId = state.data.presets[0].id;
  }
}

function syncAvatarSelection() {
  const options = state.data?.avatarOptions || [];
  if (!options.length) {
    state.ui.selectedAvatarId = null;
    if (refs.studentAvatarInput) {
      refs.studentAvatarInput.value = "";
    }
    return;
  }

  const stillExists = options.some((option) => option.id === state.ui.selectedAvatarId);
  if (!stillExists) {
    state.ui.selectedAvatarId = options[0].id;
  }

  if (refs.studentAvatarInput) {
    refs.studentAvatarInput.value = state.ui.selectedAvatarId || "";
  }
}

function setAuthPending(isPending) {
  state.ui.authPending = isPending;
  refs.authSection.querySelectorAll("input, button").forEach((element) => {
    element.disabled = isPending;
  });
}

function normalizeStudentUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
}

async function handleAuth(event, endpoint) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  if (Object.prototype.hasOwnProperty.call(payload, "username")) {
    payload.username = normalizeStudentUsername(payload.username);
    if (form.elements.username) {
      form.elements.username.value = payload.username;
    }
  }

  setAuthPending(true);
  try {
    const ok = await postJson(endpoint, payload);
    if (ok) {
      form.reset();
      if (endpoint === "/api/register") {
        state.ui.selectedAvatarId = null;
      }
    }
  } finally {
    setAuthPending(false);
  }
}

async function handleTeacherLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  setAuthPending(true);
  try {
    const ok = await postJson("/api/admin/login", payload);
    if (ok) {
      form.reset();
    }
  } finally {
    setAuthPending(false);
  }
}

async function handleTeacherSettingsSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.salesGoal = Number(payload.salesGoal);
  const ok = await postJson("/api/admin/settings", payload);
  if (ok) {
    form.elements.currentPassword.value = "";
    form.elements.newPassword.value = "";
  }
}

function handleScenarioDraftChange() {
  state.ui.scenarioDraft = {
    presetId: String(refs.presetSelect.value || ""),
    headline: String(refs.scenarioForm.elements.headline.value || ""),
    body: String(refs.scenarioForm.elements.body.value || "")
  };
  renderScenarioPreview();
}

function handleRegisterFormClick(event) {
  const avatarButton = event.target.closest("[data-avatar-option]");
  if (!avatarButton) {
    return;
  }

  state.ui.selectedAvatarId = String(avatarButton.dataset.avatarOption || "");
  renderRegisterAvatarPicker();
}

async function handleScenarioSubmit(event) {
  event.preventDefault();
  const payload = {
    presetId: state.ui.scenarioDraft.presetId,
    headline: state.ui.scenarioDraft.headline.trim(),
    body: state.ui.scenarioDraft.body.trim()
  };
  const ok = await postJson("/api/admin/round/publish", payload);
  if (ok) {
    refs.scenarioForm.elements.headline.value = "";
    refs.scenarioForm.elements.body.value = "";
    state.ui.scenarioDraft.headline = "";
    state.ui.scenarioDraft.body = "";
    renderScenarioPreview();
  }
}

async function handleTeacherControlsClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  if (action === "open-session") {
    await postJson("/api/admin/session", { isOpen: true });
    return;
  }

  if (action === "close-session") {
    await postJson("/api/admin/session", { isOpen: false });
    return;
  }

  if (action === "close-round") {
    await postJson("/api/admin/round/close", {});
    return;
  }

  if (action === "reset-results") {
    if (window.confirm("Reset standings, morale, trust, and event history but keep student accounts?")) {
      await postJson("/api/admin/reset", { scope: "results" });
    }
    return;
  }

  if (action === "reset-full") {
    if (window.confirm("Delete all student accounts and reset the whole simulation?")) {
      await postJson("/api/admin/reset", { scope: "full" });
    }
  }
}

async function handlePredictionMarketSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.probability = Number(payload.probability);
  payload.evidence = Number(payload.evidence);
  payload.hype = Number(payload.hype);

  const ok = await postJson("/api/admin/prediction-markets/create", payload);
  if (ok) {
    form.reset();
    form.elements.probability.value = "50";
    form.elements.evidence.value = "55";
    form.elements.hype.value = "35";
    state.ui.marketPublishPopup = {
      title: payload.title,
      description: payload.description,
      desk: payload.desk || "Class market",
      category: payload.category || "Classroom question",
      probability: payload.probability,
      evidence: payload.evidence,
      hype: payload.hype
    };
    renderMarketPublishPopup();
  }
}

function handleDocumentClick(event) {
  if (!event.target.closest("[data-market-publish-close]")) {
    return;
  }

  state.ui.marketPublishPopup = null;
  renderMarketPublishPopup();
}

async function handlePredictionMarketListClick(event) {
  const resolveButton = event.target.closest("button[data-resolve-market]");
  if (resolveButton) {
    await postJson("/api/admin/prediction-markets/resolve", {
      marketId: resolveButton.dataset.resolveMarket,
      resolution: resolveButton.dataset.resolution
    });
    return;
  }

  const archiveButton = event.target.closest("button[data-archive-market]");
  if (archiveButton) {
    await postJson("/api/admin/prediction-markets/archive", {
      marketId: archiveButton.dataset.archiveMarket
    });
  }
}

async function handleStudentRoundClick(event) {
  const button = event.target.closest("button[data-option-id]");
  if (!button) {
    return;
  }

  await postJson("/api/respond", {
    optionId: button.dataset.optionId
  });
}

async function handleStudentRosterClick(event) {
  const button = event.target.closest("button[data-delete-user]");
  if (!button) {
    return;
  }

  const userId = button.dataset.deleteUser;
  const name = button.dataset.studentName || "this student";
  if (!window.confirm(`Delete ${name}'s account?`)) {
    return;
  }

  await postJson("/api/admin/student/delete", { userId });
}

async function handleStudentRosterSubmit(event) {
  const form = event.target.closest("form[data-password-form]");
  if (!form) {
    return;
  }

  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());
  const ok = await postJson("/api/admin/student/password", payload);
  if (ok) {
    form.reset();
  }
}

async function handleLogout() {
  const response = await fetch("/api/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: "{}"
  });

  if (!response.ok) {
    showToast("Could not log out right now.");
    return;
  }

  await bootstrap();
}

async function postJson(url, payload) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "That request could not be completed.");
    }

    if (data && typeof data === "object" && "game" in data) {
      state.data = data;
      syncScenarioDraft();
      render();
    } else {
      await bootstrap(false);
    }

    return true;
  } catch (error) {
    showToast(error.message || "That request could not be completed.");
    return false;
  }
}

function render() {
  if (!state.data) {
    return;
  }

  renderAuthSection();
  renderMarketStatus();
  renderSessionBar();
  renderStudentView();
  renderTeacherView();
  renderLeaderboard();
  renderRoundFeed();
  renderMarketPublishPopup();
  updateAutomationHooks();
}

function renderMarketPublishPopup() {
  if (!refs.marketPublishPopup) {
    return;
  }

  const popup = state.ui.marketPublishPopup;
  refs.marketPublishPopup.classList.toggle("hidden", !popup);
  if (!popup) {
    return;
  }

  refs.marketPublishTitle.textContent = popup.title;
  refs.marketPublishDetail.textContent = popup.description;
  refs.marketPublishMeta.innerHTML = [
    `<span class="tag subtle">${escapeHtml(popup.desk)}</span>`,
    `<span class="tag subtle">${escapeHtml(popup.category)}</span>`,
    `<span class="tag subtle">Opening YES ${escapeHtml(String(popup.probability))}%</span>`,
    `<span class="tag subtle">Evidence ${escapeHtml(String(popup.evidence))}</span>`,
    `<span class="tag subtle">Hype ${escapeHtml(String(popup.hype))}</span>`
  ].join("");
}

function renderAuthSection() {
  if (state.data.user || state.data.isAdmin) {
    refs.authSection.classList.add("hidden");
    return;
  }

  refs.authSection.classList.remove("hidden");
  renderRegisterAvatarPicker();
}

function renderRegisterAvatarPicker() {
  const options = state.data?.avatarOptions || [];
  if (!refs.studentAvatarPicker) {
    return;
  }

  refs.studentAvatarInput.value = state.ui.selectedAvatarId || "";
  refs.studentAvatarPicker.innerHTML = options.length
    ? options.map((option) => renderAvatarOption(option, option.id === state.ui.selectedAvatarId)).join("")
    : `<div class="empty-state">Manager portraits will appear here once the Feast Haven library is available.</div>`;
}

function renderAvatarOption(option, isSelected) {
  return `
    <button
      class="avatar-option ${isSelected ? "avatar-option-selected" : ""}"
      type="button"
      data-avatar-option="${escapeHtml(option.id)}"
      aria-pressed="${isSelected ? "true" : "false"}"
    >
      <img class="avatar-option-image" src="${escapeHtml(option.path)}" alt="Manager portrait ${escapeHtml(option.id)}" />
    </button>
  `;
}

function renderMarketStatus() {
  if (!refs.marketStatusPanel) {
    return;
  }

  const { game, leaderboard, rules, currentRound } = state.data;
  refs.marketStatusPanel.innerHTML = `
    <div class="status-stack">
      <div class="status-top">
        <span class="pill ${game.isOpen ? "pill-open" : "pill-closed"}">${game.isOpen ? "Class Session Live" : "Class Session Closed"}</span>
        <span class="pill ${currentRound ? "pill-neutral" : "pill-muted"}">${currentRound ? `Event ${currentRound.roundNumber}` : "No Active Event"}</span>
      </div>
      <div class="mini-grid">
        <div class="mini-stat">
          <span>Revenue Goal</span>
          <strong>${formatRevenue(rules.salesGoal)}</strong>
        </div>
        <div class="mini-stat">
          <span>Students</span>
          <strong>${leaderboard.length}</strong>
        </div>
        <div class="mini-stat">
          <span>Class Sessions</span>
          <strong>${game.sessionNumber}</strong>
        </div>
        <div class="mini-stat">
          <span>Completed Cases</span>
          <strong>${currentRound ? `${currentRound.completedCount}/${currentRound.totalStudents}` : "Waiting"}</strong>
        </div>
      </div>
      <p class="note">
        ${game.isOpen
          ? currentRound
            ? "Students are working through a shared restaurant event, but each case can branch differently."
            : "Session is open. Launch a global restaurant event when you want the next chain to begin."
          : "Open the class session before students can make management decisions."}
      </p>
    </div>
  `;
}

function renderSessionBar() {
  const { user, isAdmin, game, currentRound } = state.data;
  if (!user && !isAdmin) {
    refs.sessionBar.classList.add("hidden");
    refs.sessionBar.innerHTML = "";
    return;
  }

  const message = isAdmin
    ? game.isOpen
      ? currentRound
        ? `Students are working Event ${currentRound.roundNumber} right now.`
        : "Session is open and waiting for the next global event."
      : "Session is closed. Open it when class begins."
    : user.isEliminated
      ? `${user.lossState?.name || "A staff member"} quit. Your restaurant is out until the teacher resets standings.`
      : game.isOpen
        ? currentRound
          ? currentRound.studentCase?.status === "resolved"
            ? "You resolved the current event chain. Watch the leaderboard and wait for the next global event."
            : "A global restaurant event is live. Your choices will branch your restaurant's case."
          : "Your teacher has the session open. Wait for the next global event."
        : "Your teacher has not opened the class session yet.";

  refs.sessionBar.classList.remove("hidden");
  refs.sessionBar.innerHTML = `
    ${
      isAdmin
        ? `<div>
            <strong>Teacher controls unlocked</strong>
            <span>${message}</span>
          </div>`
        : renderPlayerIdentity(user.displayName, message, user.avatarPath, "player-avatar-large")
    }
    <button class="subtle" id="logout-button">Logout</button>
  `;

  document.getElementById("logout-button").addEventListener("click", handleLogout);
}

function renderStudentView() {
  const user = state.data.user;
  if (!user) {
    refs.studentView.classList.add("hidden");
    return;
  }

  refs.studentView.classList.remove("hidden");
  refs.studentNameHeading.textContent = `${user.displayName}'s Feast Haven`;
  const leaderboardEntry = state.data.leaderboard.find((entry) => entry.id === user.id) || null;

  refs.studentSummary.innerHTML = `
    <div class="summary-profile">
      <img class="player-avatar player-avatar-hero" src="${escapeHtml(user.avatarPath || "")}" alt="${escapeHtml(user.displayName)} avatar" />
      <div>
        <strong>${escapeHtml(user.displayName)}</strong>
        <div class="subtext">@${escapeHtml(user.username)} · ${escapeHtml(user.managerProfile.title)}</div>
      </div>
    </div>
    <div class="summary-grid">
      <article class="hero-stat">
        <span class="eyebrow">${user.isEliminated ? "Final Score" : "Restaurant Score"}</span>
        <strong>${formatScore(user.aggregateScore)}</strong>
        <div class="stat-subline">
          <span>${user.isEliminated ? "Eliminated" : leaderboardEntry ? `Rank #${leaderboardEntry.rank}` : "Not ranked yet"}</span>
          <span>${user.isEliminated ? `${user.lossState?.name || "Employee"} quit` : user.sales >= state.data.rules.salesGoal ? "Goal reached" : `${formatRevenue(state.data.rules.salesGoal - user.sales)} to goal`}</span>
        </div>
      </article>
      <div class="mini-grid summary-mini-grid">
        <div class="mini-stat"><span>Revenue</span><strong>${formatRevenue(user.sales)}</strong></div>
        <div class="mini-stat"><span>Customer Satisfaction</span><strong>${formatPercent(user.satisfaction)}</strong></div>
        <div class="mini-stat"><span>Reputation</span><strong>${formatPercent(user.reputation)}</strong></div>
        <div class="mini-stat"><span>Avg Morale</span><strong>${formatPercent(user.avgMorale)}</strong></div>
        <div class="mini-stat"><span>Avg Trust</span><strong>${formatPercent(user.avgTrust)}</strong></div>
        <div class="mini-stat mini-stat-badge"><span>Score Tier</span>${renderScoreTierBadge(user.scoreTier)}</div>
        <div class="mini-stat"><span>Manager Style</span><strong>${escapeHtml(user.managerProfile.title)}</strong></div>
      </div>
    </div>
    <p class="note">${escapeHtml(`${user.managerProfile.summary} Current tier: ${user.scoreTier.label}.`)}</p>
    ${
      user.warnings.length
        ? `<div class="warning-list">${user.warnings.map((warning) => `<div class="warning-chip">${escapeHtml(warning)}</div>`).join("")}</div>`
        : `<p class="note">Balanced management keeps restaurant revenue moving without creating hidden team penalties.</p>`
    }
    ${renderRestaurantStateSection(user.restaurantState)}
    ${renderLingeringEffectsPanel(user.lingeringEffects)}
  `;

  refs.studentRoundPanel.innerHTML = renderStudentRoundPanel();
  refs.staffGrid.innerHTML = user.staff.map(renderStaffCard).join("");
  refs.historyPanel.innerHTML = user.decisionHistory.length
    ? `<div class="feed-list">${user.decisionHistory.map(renderHistoryRow).join("")}</div>`
    : `<div class="empty-state">Your management decisions will start appearing here after the first completed global event.</div>`;
}

function renderStudentRoundPanel() {
  const { game, currentRound, user } = state.data;

  if (user.isEliminated && !game.isOpen) {
    return `
      <article class="decision-card loss-card">
        <div class="section-head compact">
        <p class="eyebrow">Restaurant Eliminated</p>
        <h3>${escapeHtml(user.lossState?.name || "An employee")} quit</h3>
      </div>
      <p>${escapeHtml(user.lossState?.message || "A staff member walked out, and your restaurant is out of the game.")}</p>
      <p class="note">The class session is closed, and this restaurant will stay out until the teacher resets standings.</p>
      </article>
    `;
  }

  if (!game.isOpen) {
    return `<div class="empty-state">The class session is closed right now. Once your teacher opens it, live restaurant situations will appear here.</div>`;
  }

  if (user.isEliminated && !currentRound) {
    return `
      <article class="decision-card loss-card">
        <div class="section-head compact">
        <p class="eyebrow">Restaurant Eliminated</p>
        <h3>${escapeHtml(user.lossState?.name || "An employee")} quit</h3>
      </div>
      <p>${escapeHtml(user.lossState?.message || "A staff member walked out, and your restaurant is out of the game.")}</p>
      <p class="note">No new global event is active, and this restaurant will not receive the next one unless standings are reset.</p>
      </article>
    `;
  }

  if (!currentRound) {
    return `<div class="empty-state">Session is open, but there is no active global event yet. Stay ready for the next restaurant crisis.</div>`;
  }

  const studentCase = currentRound.studentCase;
  const response = currentRound.userResponse || user.currentResponse;
  const stepLabel = studentCase ? `Step ${studentCase.stepIndex} of ${studentCase.totalSteps}` : "";
  const eventOverview = renderCaseEventOverview(currentRound, studentCase);
  const caseTimeline = renderCaseTimeline(studentCase);

  if (user.isEliminated) {
    return `
      <div class="case-chain-layout">
        ${currentRound ? eventOverview : ""}
        <article class="decision-card case-step-card loss-card">
          <div class="section-head compact">
          <p class="eyebrow">Restaurant Eliminated</p>
          <h3>${escapeHtml(user.lossState?.name || "An employee")} quit</h3>
        </div>
        <p>${escapeHtml(user.lossState?.message || "A staff member walked out, and your restaurant is out of the game.")}</p>
        <div class="impact-summary">
          <strong>Final standing snapshot</strong>
            <div class="impact-grid">
              <div class="impact-chip positive">Score ${formatScore(user.aggregateScore)}</div>
              <div class="impact-chip positive">Revenue ${formatRevenue(user.sales)}</div>
              <div class="impact-chip ${user.avgMorale >= 50 ? "positive" : "negative"}">Morale ${formatPercent(user.avgMorale)}</div>
              <div class="impact-chip ${user.avgTrust >= 50 ? "positive" : "negative"}">Trust ${formatPercent(user.avgTrust)}</div>
            </div>
          </div>
          <p class="note">You can still review the case timeline and leaderboard, but this restaurant will not receive new event chains until the standings are reset.</p>
        </article>
        ${caseTimeline}
      </div>
    `;
  }

  if (studentCase?.status === "resolved" && response) {
    return `
      <div class="case-chain-layout">
        ${eventOverview}
        <article class="decision-card case-step-card">
          <div class="section-head compact">
            <p class="eyebrow">${escapeHtml(currentRound.category)} · ${escapeHtml(currentRound.pressure)} · Event Complete</p>
            <h3>Final Outcome</h3>
          </div>
          <div class="choice-lockup">
            <strong>Final move:</strong>
            <span class="choice-pill">${escapeHtml(response.optionLabel)}</span>
          </div>
          <p>${escapeHtml(response.outcomeText)}</p>
          ${renderImpactSummary(studentCase.cumulativeImpact, "Case result")}
          <p class="note">${escapeHtml(response.noteText)}</p>
        </article>
        ${caseTimeline}
      </div>
    `;
  }

  if (!studentCase) {
    return `<div class="empty-state">Your restaurant case has not started yet. Refresh in a moment if the teacher just launched the event.</div>`;
  }

  if (studentCase.currentPhase === "consultant") {
    const consultantHeading = studentCase.stepIndex > 1 ? "Who do you talk to next?" : "Who do you talk to first?";
    return `
      <div class="case-chain-layout">
        ${eventOverview}
        <article class="decision-card case-step-card">
          <div class="section-head compact">
            <p class="eyebrow">${escapeHtml(currentRound.category)} · ${escapeHtml(currentRound.pressure)} · ${stepLabel}</p>
            <h3>${escapeHtml(consultantHeading)}</h3>
          </div>
          <p>${escapeHtml(studentCase.currentPromptTitle)} ${escapeHtml(studentCase.currentPromptBody)}</p>
          <p class="note">The card above is the live global event. This step is just deciding whose perspective you want next.</p>
          ${studentCase.cumulativeImpact?.actionCount ? renderImpactSummary(studentCase.cumulativeImpact, "Impact so far") : ""}
          <div class="focus-row">
            ${studentCase.availableConsultants.map((consultant) => renderStaffFocusChip(consultant.id)).join("")}
          </div>
          <div class="option-list">
            ${studentCase.availableConsultants
              .map(
                (consultant) => `
                  <button class="option-button" data-option-id="${consultant.id}">
                    <span class="option-person">${renderStaffInlineIdentity(consultant.id, `Talk to ${consultant.name}`)}</span>
                    <span class="option-meta">${escapeHtml(consultant.title)}</span>
                  </button>
                `
              )
              .join("")}
          </div>
        </article>
        ${caseTimeline}
      </div>
    `;
  }

  if (studentCase.currentPhase === "action") {
    const selectedName = studentCase.selectedConsultant?.name || "this staff member";
    return `
      <div class="case-chain-layout">
        ${eventOverview}
        <article class="decision-card case-step-card">
          <div class="section-head compact">
            <p class="eyebrow">${escapeHtml(currentRound.category)} · ${escapeHtml(currentRound.pressure)} · ${stepLabel}</p>
            <h3>What ${escapeHtml(selectedName)} tells you</h3>
          </div>
          <p>${escapeHtml(studentCase.currentPromptBody)}</p>
          <p class="note">You are still handling the global event above. This branch is the advice and options coming from ${escapeHtml(selectedName)}.</p>
          ${studentCase.cumulativeImpact?.actionCount ? renderImpactSummary(studentCase.cumulativeImpact, "Impact so far") : ""}
          <div class="choice-lockup">
            <strong>Consulting:</strong>
            ${studentCase.selectedConsultant ? renderStaffInlineIdentity(studentCase.selectedConsultant.id, studentCase.selectedConsultant.name, "choice-pill choice-pill-person") : `<span class="choice-pill">Staff</span>`}
          </div>
          ${
            studentCase.selectedConsultant?.relationshipBeat
              ? `<div class="relationship-callout">
                  <strong>Relationship undercurrent</strong>
                  <span>${escapeHtml(studentCase.selectedConsultant.relationshipBeat.prompt)}</span>
                </div>`
              : ""
          }
          <div class="option-list">
            ${studentCase.actionOptions
              .map(
                (option) => `
                  <button class="option-button" data-option-id="${option.id}">
                    <span class="option-label">${escapeHtml(option.label)}</span>
                    <span class="option-meta">Choose this action</span>
                  </button>
                `
              )
              .join("")}
          </div>
        </article>
        ${caseTimeline}
      </div>
    `;
  }

  return `
    <article class="decision-card">
      <div class="section-head compact">
        <p class="eyebrow">${escapeHtml(currentRound.category)} · ${escapeHtml(currentRound.pressure)}</p>
        <h3>${escapeHtml(currentRound.headline)}</h3>
      </div>
      <p>${escapeHtml(currentRound.body)}</p>
    </article>
  `;
}

function renderCaseEventOverview(currentRound, studentCase) {
  return `
    <article class="decision-card case-overview-card">
      ${renderEventArtwork(currentRound.presetId, currentRound.headline, "event-artwork event-artwork-wide")}
      <div class="section-head compact">
        <p class="eyebrow">Global Event</p>
        <h3>${escapeHtml(currentRound.headline)}</h3>
      </div>
      <p>${escapeHtml(currentRound.body)}</p>
      <div class="focus-row">
        <span class="pill pill-neutral">Event ${currentRound.roundNumber}</span>
        <span class="pill pill-neutral">${escapeHtml(currentRound.category)}</span>
        <span class="pill pill-neutral">${escapeHtml(currentRound.pressure)} Pressure</span>
        ${
          studentCase
            ? `<span class="pill ${studentCase.status === "lost" ? "pill-closed" : studentCase.status === "resolved" ? "pill-open" : "pill-muted"}">${studentCase.status === "lost" ? "Restaurant lost" : studentCase.status === "resolved" ? "Case resolved" : `Following ${escapeHtml(studentCase.currentPromptTitle)}`}</span>`
            : ""
        }
      </div>
      ${studentCase ? renderCaseStageRail(studentCase) : ""}
      ${renderCarryoverStrip(state.data.user)}
      <p class="note">Everything below branches out from this event. The follow-up conversations and actions come from the selected event template.</p>
    </article>
  `;
}

function renderRestaurantStateSection(states) {
  if (!states?.length) {
    return "";
  }

  return `
    <section class="student-state-section">
      <div class="section-head compact">
        <div>
          <p class="eyebrow">Restaurant State</p>
          <h3>What earlier choices changed</h3>
        </div>
      </div>
      <div class="restaurant-state-grid">
        ${states.map(renderRestaurantStateCard).join("")}
      </div>
    </section>
  `;
}

function renderRestaurantStateCard(stateEntry) {
  return `
    <article class="restaurant-state-card restaurant-state-card-${escapeHtml(stateEntry.tone || "muted")}">
      <div class="feed-main">
        <div>
          <strong>${escapeHtml(stateEntry.label)}</strong>
          <div class="subtext">${escapeHtml(stateEntry.statusLabel)}</div>
        </div>
        <span class="pill pill-neutral">${formatPercent(stateEntry.value)}</span>
      </div>
      <div class="meter">
        <div class="meter-fill ${stateEntry.tone === "danger" ? "low" : stateEntry.key === "staff_burnout" && stateEntry.value > 55 ? "low" : ""}" style="width: ${Math.max(6, Math.min(100, Number(stateEntry.value || 0)))}%"></div>
      </div>
      <p class="note">${escapeHtml(stateEntry.summary)}</p>
    </article>
  `;
}

function renderLingeringEffectsPanel(effects) {
  return `
    <section class="student-state-section">
      <div class="section-head compact">
        <div>
          <p class="eyebrow">Lingering Effects</p>
          <h3>What is still following this restaurant</h3>
        </div>
      </div>
      ${
        effects?.length
          ? `<div class="lingering-effects-grid">${effects.slice(0, 3).map(renderLingeringEffectCard).join("")}</div>`
          : `<p class="note">No strong aftershocks are carrying over right now. Future events will feel cleaner if you can keep it that way.</p>`
      }
    </section>
  `;
}

function renderLingeringEffectCard(effect) {
  return `
    <article class="lingering-effect-card lingering-effect-card-${escapeHtml(effect.tone || "muted")}">
      <div class="feed-main">
        <div>
          <strong>${escapeHtml(effect.title)}</strong>
          <div class="subtext">${effect.targetStaffName ? escapeHtml(effect.targetStaffName) : "Restaurant-wide"}</div>
        </div>
        <span class="pill pill-neutral">${effect.roundsRemaining === 1 ? "1 round left" : `${effect.roundsRemaining} rounds left`}</span>
      </div>
      <p class="note">${escapeHtml(effect.summary)}</p>
    </article>
  `;
}

function renderCarryoverStrip(user) {
  if (!user) {
    return "";
  }
  const lowStates = (user.restaurantState || [])
    .filter((entry) => {
      if (entry.key === "staff_burnout") {
        return entry.value >= 60;
      }
      return entry.value <= 45;
    })
    .slice(0, 2)
    .map((entry) => `${entry.label}: ${entry.statusLabel}`);
  const effectTitles = (user.lingeringEffects || []).slice(0, 2).map((entry) => entry.title);
  const items = [...effectTitles, ...lowStates].slice(0, 3);
  if (!items.length) {
    return "";
  }

  return `
    <div class="carryover-strip">
      <strong>Carryover into this event</strong>
      <div class="focus-row">
        ${items.map((item) => `<span class="pill pill-neutral">${escapeHtml(item)}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderCaseTimeline(studentCase) {
  if (!studentCase?.choiceLog?.length) {
    return "";
  }

  return `
    <article class="decision-card case-timeline-card">
      <div class="section-head compact">
        <p class="eyebrow">Case Timeline</p>
        <h3>What has happened so far</h3>
      </div>
      <div class="case-timeline-list">
        ${studentCase.choiceLog.map(renderCaseChoiceRow).join("")}
      </div>
    </article>
  `;
}

function renderTeacherView() {
  if (!state.data.isAdmin) {
    refs.teacherView.classList.add("hidden");
    return;
  }

  refs.teacherView.classList.remove("hidden");
  const { admin, game, currentRound } = state.data;

  refs.teacherSettingsForm.elements.teacherUsername.value = admin.settings.teacherUsername;
  refs.teacherSettingsForm.elements.salesGoal.value = admin.settings.salesGoal;

  refs.teacherSummary.innerHTML = `
    <div class="teacher-scene-banner">
      <img src="/assets/feast-haven/scenes/teacher-control-banner.png" alt="Feast Haven teacher control center artwork" />
    </div>
    <div class="summary-grid admin-summary-grid">
      <article class="hero-stat">
        <span class="eyebrow">Top Score</span>
        <strong>${admin.metrics.topStudent ? formatScore(admin.metrics.topStudent.aggregateScore) : "No players yet"}</strong>
        <div class="stat-subline">
          <span>${admin.metrics.topStudent ? escapeHtml(admin.metrics.topStudent.displayName) : "Waiting for students"}</span>
          <span>${admin.metrics.studentCount} students active</span>
        </div>
      </article>
      <div class="mini-grid summary-mini-grid">
        <div class="mini-stat"><span>Average Revenue</span><strong>${formatRevenue(admin.metrics.averageSales)}</strong></div>
        <div class="mini-stat"><span>Average Morale</span><strong>${formatPercent(admin.metrics.averageMorale)}</strong></div>
        <div class="mini-stat"><span>Average Pace</span><strong>${formatDurationCompact(admin.metrics.averageResponseMs)}</strong></div>
        <div class="mini-stat"><span>Completed Cases</span><strong>${currentRound ? `${admin.metrics.activeResponses}/${admin.metrics.studentCount}` : "Waiting"}</strong></div>
        <div class="mini-stat"><span>Session State</span><strong>${game.isOpen ? "Open" : "Closed"}</strong></div>
      </div>
    </div>
    ${renderTeacherTimingHighlights(admin.analytics || {})}
    ${renderAwardsBoard(admin.awards || [])}
  `;

  refs.teacherControls.innerHTML = `
    <div class="teacher-control-card">
      <div class="control-row">
        <div>
          <p class="eyebrow">Session</p>
          <h3>${game.isOpen ? "Class is live" : "Class is paused"}</h3>
          <p class="note">
            ${
              currentRound
                ? `Event ${currentRound.roundNumber} is active with ${currentRound.completedCount}/${currentRound.totalStudents} completed restaurant cases.`
                : game.isOpen
                  ? "No global event is active yet. Launch one when you are ready."
                  : "Open the session before pushing the next event chain."
            }
          </p>
        </div>
        <span class="pill ${game.isOpen ? "pill-open" : "pill-closed"}">${game.isOpen ? "Live" : "Closed"}</span>
      </div>
      ${currentRound?.teacherSnapshot ? renderTeacherSnapshot(currentRound.teacherSnapshot) : ""}
      <div class="action-row">
        <button data-action="open-session" ${game.isOpen ? "disabled" : ""}>Open Session</button>
        <button class="secondary" data-action="close-session" ${game.isOpen ? "" : "disabled"}>Close Session</button>
        <button class="subtle" data-action="close-round" ${currentRound ? "" : "disabled"}>Close Current Event</button>
      </div>
      <div class="action-row">
        <button class="subtle" data-action="reset-results">Reset Standings</button>
        <button class="subtle danger-button" data-action="reset-full">Reset Everything</button>
      </div>
    </div>
  `;

  renderPresetOptions();
  renderScenarioPreview();

  refs.studentRoster.innerHTML = admin.students.length
    ? `<div class="feed-list">${admin.students.map(renderStudentRosterRow).join("")}</div>`
    : `<div class="empty-state">No student accounts exist yet.</div>`;

  refs.teacherFeed.innerHTML = admin.recentResponses.length
    ? `<div class="feed-list">${admin.recentResponses.map(renderTeacherFeedRow).join("")}</div>`
    : `<div class="empty-state">Student decisions will appear here once the class starts responding.</div>`;

  if (refs.predictionMarketList) {
    refs.predictionMarketList.innerHTML = admin.predictionMarkets.length
      ? `<div class="feed-list">${admin.predictionMarkets.map(renderPredictionMarketAdminRow).join("")}</div>`
      : `<div class="empty-state">No side lesson activities have been published yet.</div>`;
  }
}

function renderTeacherTimingHighlights(analytics) {
  const cards = [
    {
      eyebrow: "Fastest Responder",
      tone: "positive",
      fallbackTitle: "Waiting for finished events",
      fallbackDetail: "Students need at least one completed case before pace rankings appear.",
      entry: analytics.fastestResponder,
      title: analytics.fastestResponder ? formatDurationCompact(analytics.fastestResponder.averageResolutionMs) : null,
      detail: analytics.fastestResponder
        ? `${escapeHtml(analytics.fastestResponder.studentName)} is leading the class average across ${analytics.fastestResponder.completedEventCount} finished ${analytics.fastestResponder.completedEventCount === 1 ? "event" : "events"}.`
        : null,
      chip: analytics.fastestResponder ? "Consistent pace" : "Need data"
    },
    {
      eyebrow: "Slowest Responder",
      tone: "negative",
      fallbackTitle: "Waiting for finished events",
      fallbackDetail: "Once students complete cases, this will show who may need time support.",
      entry: analytics.slowestResponder,
      title: analytics.slowestResponder ? formatDurationCompact(analytics.slowestResponder.averageResolutionMs) : null,
      detail: analytics.slowestResponder
        ? `${escapeHtml(analytics.slowestResponder.studentName)} currently has the slowest class average over ${analytics.slowestResponder.completedEventCount} finished ${analytics.slowestResponder.completedEventCount === 1 ? "event" : "events"}.`
        : null,
      chip: analytics.slowestResponder ? "Watch support" : "Need data"
    },
    {
      eyebrow: "Most Improved",
      tone: "neutral",
      fallbackTitle: "Need two finished events",
      fallbackDetail: "This starts tracking once someone speeds up from one completed event to the next.",
      entry: analytics.mostImprovedResponder,
      title: analytics.mostImprovedResponder ? `${formatDurationCompact(analytics.mostImprovedResponder.paceGainMs)} faster` : null,
      detail: analytics.mostImprovedResponder
        ? `${escapeHtml(analytics.mostImprovedResponder.studentName)} improved from ${formatDurationCompact(analytics.mostImprovedResponder.previousResolutionMs)} to ${formatDurationCompact(analytics.mostImprovedResponder.latestResolutionMs)} on the last completed event.`
        : null,
      chip: analytics.mostImprovedResponder ? "Momentum" : "Still settling"
    }
  ];

  return `
    <div class="teacher-analytics-grid">
      ${cards.map(renderTeacherTimingCard).join("")}
    </div>
  `;
}

function renderTeacherTimingCard(card) {
  return `
    <article class="teacher-analytics-card">
      <span class="eyebrow">${card.eyebrow}</span>
      <strong>${card.title || card.fallbackTitle}</strong>
      <span class="impact-chip ${card.tone}">${card.chip}</span>
      <p class="teacher-analytics-detail">${card.detail || card.fallbackDetail}</p>
    </article>
  `;
}

function renderPresetOptions() {
  if (!state.data?.presets?.length) {
    refs.presetSelect.innerHTML = "";
    return;
  }

  refs.presetSelect.innerHTML = state.data.presets
    .map(
      (preset) => `
        <option value="${preset.id}" ${preset.id === state.ui.scenarioDraft.presetId ? "selected" : ""}>
          ${preset.category}: ${preset.headline}
        </option>
      `
    )
    .join("");
}

function renderScenarioPreview() {
  const presets = state.data?.presets || [];
  const preset = presets.find((entry) => entry.id === state.ui.scenarioDraft.presetId) || presets[0];
  if (!preset) {
    refs.scenarioPreview.innerHTML = `<div class="empty-state">No preset library loaded.</div>`;
    return;
  }

  const headline = state.ui.scenarioDraft.headline.trim() || preset.headline;
  const body = state.ui.scenarioDraft.body.trim() || preset.body;
  refs.launchScenarioButton.disabled = false;
  refs.launchScenarioButton.textContent = "Launch Global Event";

  refs.scenarioPreview.innerHTML = `
    <article class="preview-card">
      ${renderEventArtwork(preset.id, headline, "event-artwork")}
      <div class="section-head compact">
        <p class="eyebrow">${escapeHtml(preset.category)} · ${escapeHtml(preset.pressure)}</p>
        <h3>${escapeHtml(headline)}</h3>
      </div>
      <p>${escapeHtml(body)}</p>
      <div class="focus-row">
        ${(preset.openingConsultants || Object.keys(STAFF_DIRECTORY)).map((staffId) => renderStaffFocusChip(staffId)).join("")}
      </div>
      <p class="note">Your custom headline and prompt become the live global event. The follow-up branches still come from this selected event template.</p>
    </article>
  `;
}

function renderLeaderboard() {
  const leaderboards = state.data.leaderboards || {
    overall: { id: "overall", title: "Overall Leaders", subtitle: "Weighted manager score", entries: state.data.leaderboard || [] }
  };
  const boards = Object.values(leaderboards).filter((board) => board?.entries?.length);
  refs.leaderboard.innerHTML = boards.length
    ? `<div class="leaderboard-board-grid">${boards.map(renderLeaderboardBoard).join("")}</div>`
    : `<div class="empty-state">No students have joined yet. Once they do, live restaurant standings will appear here.</div>`;
}

function renderRoundFeed() {
  refs.roundFeed.innerHTML = state.data.rounds.length
    ? `<div class="feed-list">${state.data.rounds.map(renderRoundRow).join("")}</div>`
    : `<div class="empty-state">Published global events will appear here once the teacher starts the first session.</div>`;
}

function renderStaffCard(staff) {
  const meta = getStaffMeta(staff.id);
  return `
    <article class="staff-card staff-card-${meta.accent}">
      <div class="staff-top">
        <div class="staff-identity">
          <img class="staff-avatar staff-avatar-large" src="${meta.avatar}" alt="${escapeHtml(staff.name)} portrait" />
          <div>
            <h3>${escapeHtml(staff.name)}</h3>
            <div class="subtext">${escapeHtml(staff.title)}</div>
            <div class="role-badge role-badge-${meta.accent}">${escapeHtml(meta.badge)}</div>
          </div>
        </div>
        <span class="tag ${staff.hasQuit ? "tag-danger" : ""}">${staff.hasQuit ? "Quit" : staff.morale < 40 || staff.trust < 40 ? "At risk" : "Stable"}</span>
      </div>
      <p>${escapeHtml(staff.summary)}</p>
      <div class="focus-row">
        ${renderTrustBadge(staff)}
        <span class="pill pill-muted">${escapeHtml(staff.hasQuit ? "No longer available" : staff.trustEffectLabel)}</span>
      </div>
      ${renderRelationshipStack(staff.relationships)}
      <p class="note">${escapeHtml(staff.hasQuit ? `${staff.name} has quit the restaurant.` : staff.tension)}</p>
      <div class="meter-block">
        <div class="meter-label"><span>Morale</span><strong>${formatPercent(staff.morale)}</strong></div>
        <div class="meter"><div class="meter-fill ${staff.morale < 40 ? "low" : ""}" style="width: ${staff.morale}%"></div></div>
      </div>
      <div class="meter-block">
        <div class="meter-label"><span>Trust</span><strong>${formatPercent(staff.trust)}</strong></div>
        <div class="meter"><div class="meter-fill trust ${staff.trust < 40 ? "low" : ""}" style="width: ${staff.trust}%"></div></div>
      </div>
    </article>
  `;
}

function renderStaffFocusChip(staffId) {
  const meta = getStaffMeta(staffId);
  return `
    <span class="staff-chip staff-chip-${meta.accent}">
      <img class="staff-avatar" src="${meta.avatar}" alt="${escapeHtml(meta.name)} portrait" />
      <span>${escapeHtml(meta.name)}</span>
    </span>
  `;
}

function renderStaffInlineIdentity(staffId, label, className = "staff-inline staff-inline-pill") {
  const meta = getStaffMeta(staffId);
  return `
    <span class="${className} staff-inline-${meta.accent}">
      <img class="staff-avatar staff-avatar-inline" src="${meta.avatar}" alt="${escapeHtml(meta.name)} portrait" />
      <span>${escapeHtml(label || meta.name)}</span>
    </span>
  `;
}

function renderHistoryRow(entry) {
  return `
    <article class="feed-row">
      <div class="feed-main">
        <div>
          <strong>Event ${entry.roundNumber}: ${escapeHtml(entry.headline)}</strong>
          <div class="subtext">${escapeHtml(entry.optionLabel)} · ${formatDate(entry.submittedAt)}</div>
        </div>
      </div>
      <div class="history-impact">
        <span class="impact-chip ${entry.salesDelta >= 0 ? "positive" : "negative"}">Revenue ${formatSignedRevenue(entry.salesDelta)}</span>
        <span class="impact-chip ${entry.satisfactionDelta >= 0 ? "positive" : "negative"}">Sat ${formatSigned(entry.satisfactionDelta)}</span>
        <span class="impact-chip ${entry.reputationDelta >= 0 ? "positive" : "negative"}">Rep ${formatSigned(entry.reputationDelta)}</span>
      </div>
      <p>${escapeHtml(entry.outcomeText)}</p>
      <p class="note">${escapeHtml(entry.noteText)}</p>
    </article>
  `;
}

function renderStudentRosterRow(student) {
  return `
    <article class="feed-row">
      <div class="feed-main">
        ${renderPlayerIdentity(student.displayName, `@${student.username} · Joined ${formatDate(student.joinedAt)}`, student.avatarPath)}
        <span class="pill ${student.progressTone === "closed" ? "pill-closed" : student.progressTone === "open" ? "pill-open" : "pill-muted"}">
          ${escapeHtml(student.progressLabel || "Waiting")}
        </span>
      </div>
      <div class="feed-metrics">
        <div><strong>${formatScore(student.aggregateScore)}</strong><span>Score</span></div>
        <div class="metric-badge-cell">${renderScoreTierBadge(student.scoreTier, true)}</div>
        <div><strong>${formatRevenue(student.sales)}</strong><span>Revenue</span></div>
        <div><strong>${formatPercent(student.avgMorale)}</strong><span>Morale</span></div>
        <div><strong>${formatPercent(student.teamHealth)}</strong><span>Health</span></div>
      </div>
      <div class="history-impact">
        <span class="impact-chip neutral">Avg pace ${formatDurationCompact(student.timingStats?.averageResolutionMs)}</span>
        <span class="impact-chip neutral">
          ${
            student.currentRoundTiming?.state === "completed"
              ? `This event ${formatDurationCompact(student.currentRoundTiming.elapsedMs)}`
              : student.currentRoundTiming?.state === "in_progress"
                ? `Current event ${formatDurationCompact(student.currentRoundTiming.elapsedMs)}`
                : "This event waiting"
          }
        </span>
      </div>
      ${
        student.award
          ? `<div class="award-inline">
              ${renderAwardIcon(student.award)}
              <strong>${escapeHtml(student.award.title)}</strong>
              <span>${escapeHtml(student.award.subtitle)}</span>
              <p class="note">${escapeHtml(student.award.reason)}</p>
            </div>`
          : ""
      }
      ${student.isEliminated ? `<p class="note">${escapeHtml(student.lossState?.message || "This restaurant has been eliminated.")}</p>` : ""}
      <div class="roster-actions">
        <form data-password-form class="inline-form">
          <input type="hidden" name="userId" value="${student.id}" />
          <input name="password" type="text" minlength="4" placeholder="New password" required />
          <button class="subtle" type="submit">Reset Password</button>
        </form>
        <button
          class="subtle danger-button"
          type="button"
          data-delete-user="${student.id}"
          data-student-name="${escapeHtml(student.displayName)}"
        >
          Delete Student
        </button>
      </div>
    </article>
  `;
}

function renderPlayerIdentity(name, subtext, avatarPath, avatarClass = "") {
  return `
    <div class="player-identity">
      <img class="player-avatar ${avatarClass}" src="${escapeHtml(avatarPath || "")}" alt="${escapeHtml(name)} manager portrait" />
      <div>
        <strong>${escapeHtml(name)}</strong>
        <div class="subtext">${escapeHtml(subtext)}</div>
      </div>
    </div>
  `;
}

function renderTeacherFeedRow(entry) {
  return `
    <article class="feed-row">
      <div class="feed-main">
        <div>
          <strong>${escapeHtml(entry.studentName)}</strong>
          <div class="subtext">Event ${entry.roundNumber} · ${escapeHtml(entry.headline)}</div>
        </div>
        <span class="tag">${escapeHtml(entry.optionLabel)}</span>
      </div>
      <div class="history-impact">
        <span class="impact-chip ${entry.salesDelta >= 0 ? "positive" : "negative"}">Revenue ${formatSignedRevenue(entry.salesDelta)}</span>
        <span class="impact-chip ${entry.satisfactionDelta >= 0 ? "positive" : "negative"}">Sat ${formatSigned(entry.satisfactionDelta)}</span>
        <span class="impact-chip ${entry.reputationDelta >= 0 ? "positive" : "negative"}">Rep ${formatSigned(entry.reputationDelta)}</span>
        <span class="impact-chip neutral">Time ${formatDurationCompact(entry.responseDurationMs)}</span>
      </div>
      <div class="subtext">${formatDate(entry.submittedAt)}</div>
    </article>
  `;
}

function renderPredictionMarketAdminRow(market) {
  const probability = `${Math.round(Number(market.probability || 0))}c YES`;
  const currentLine = `${Math.round(Number(market.currentProbability || market.probability || 0))}c YES`;
  const resolvedLabel = market.status === "resolved"
    ? `Resolved ${String(market.resolution || "").toUpperCase()}`
    : market.status === "active"
      ? "Live"
      : "Archived";

  return `
    <article class="feed-row market-admin-row">
      <div class="feed-main">
        <div>
          <div class="focus-row">
            <span class="pill ${market.status === "active" ? "pill-open" : market.status === "resolved" ? "pill-neutral" : "pill-closed"}">${escapeHtml(resolvedLabel)}</span>
            <span class="pill pill-muted">${escapeHtml(market.category)}</span>
            <span class="pill pill-muted">${escapeHtml(market.desk)}</span>
          </div>
          <strong>${escapeHtml(market.title)}</strong>
          <div class="subtext">${escapeHtml(market.description)}</div>
        </div>
      </div>
      <div class="market-admin-metrics">
        <div><strong>${escapeHtml(probability)}</strong><span>Opening line</span></div>
        <div><strong>${escapeHtml(currentLine)}</strong><span>Current line</span></div>
        <div><strong>${formatPercent(market.evidence)}</strong><span>Evidence</span></div>
        <div><strong>${formatPercent(market.hype)}</strong><span>Hype</span></div>
        <div><strong>${roundToTwo(market.totalPool)}</strong><span>Shared pool</span></div>
      </div>
      <div class="action-row">
        <button class="secondary" data-resolve-market="${market.id}" data-resolution="yes" ${market.status === "active" ? "" : "disabled"}>Resolve YES</button>
        <button class="secondary" data-resolve-market="${market.id}" data-resolution="no" ${market.status === "active" ? "" : "disabled"}>Resolve NO</button>
        <button class="subtle" data-archive-market="${market.id}" ${market.status === "archived" ? "disabled" : ""}>Archive</button>
      </div>
      <div class="subtext">Published ${formatDate(market.publishedAt)}${market.resolvedAt ? ` · Settled ${formatDate(market.resolvedAt)}` : ""}</div>
    </article>
  `;
}

function renderAwardsBoard(awards) {
  if (!awards.length) {
    return "";
  }

  return `
    <section class="award-board">
      <div class="section-head compact award-board-head">
        <div>
          <p class="eyebrow">End Of Game Awards</p>
          <h3>Personalized awards for today</h3>
        </div>
        <a class="button-link subtle" href="/awards-report.html" target="_blank" rel="noopener noreferrer">Open PDF Report</a>
      </div>
      <div class="award-grid">
        ${awards
          .map(
            (award) => `
              <article class="award-card">
                <div class="award-topline">
                  ${renderAwardIcon(award)}
                  <div>
                    <strong>${escapeHtml(award.title)}</strong>
                    <div class="subtext">${escapeHtml(award.subtitle)}</div>
                  </div>
                  <span class="pill pill-neutral">${escapeHtml(award.studentName)}</span>
                </div>
                <p class="note">${escapeHtml(award.reason)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderRoundRow(round) {
  return `
    <article class="feed-row">
      ${renderEventArtwork(round.presetId, round.headline, "event-artwork event-artwork-feed")}
      <div class="feed-main">
        <div>
          <strong>Event ${round.roundNumber}: ${escapeHtml(round.headline)}</strong>
          <div class="subtext">${escapeHtml(round.category)} · ${escapeHtml(round.pressure)} · ${formatDate(round.createdAt)}</div>
        </div>
        <span class="pill ${round.status === "active" ? "pill-open" : "pill-muted"}">${round.status === "active" ? "Active" : "Closed"}</span>
      </div>
      <p>${escapeHtml(round.body)}</p>
      <div class="feed-metrics">
        <div><strong>${round.completedCount}/${round.totalStudents}</strong><span>Completed</span></div>
        <div><strong>${round.inProgressCount}</strong><span>In progress</span></div>
        <div><strong>${formatDurationCompact(round.timingStats?.averageResponseMs)}</strong><span>Avg finish</span></div>
      </div>
      ${
        round.userResponse
          ? `<div class="focus-row">
              <span class="pill pill-open">Your final move: ${escapeHtml(round.userResponse.optionLabel)}</span>
              <span class="pill pill-neutral">Net result ${formatSignedRevenue(round.userResponse.salesDelta)}</span>
            </div>`
          : ""
      }
    </article>
  `;
}

function renderLeaderboardBoard(board) {
  return `
    <section class="leaderboard-board">
      <div class="section-head compact">
        <div>
          <p class="eyebrow">${escapeHtml(board.title)}</p>
          <h3>${escapeHtml(board.subtitle)}</h3>
        </div>
      </div>
      <div class="feed-list">
        ${board.entries.slice(0, 5).map((entry) => `
          <article class="feed-row leaderboard-row">
            <div class="feed-main">
              <span class="rank-pill">#${entry.rank}</span>
              ${renderPlayerIdentity(entry.displayName, `@${entry.username}`, entry.avatarPath)}
            </div>
            <div class="feed-metrics">
              <div><strong>${board.id === "revenue" ? formatRevenue(entry.sales) : formatScore(entry.boardScore)}</strong><span>${board.id === "revenue" ? "Revenue" : board.id === "culture" ? "Culture" : "Score"}</span></div>
              <div class="metric-badge-cell">${renderScoreTierBadge(entry.scoreTier, true)}</div>
              <div><strong>${formatRevenue(entry.sales)}</strong><span>Revenue</span></div>
              <div><strong>${formatPercent(entry.teamHealth)}</strong><span>Team health</span></div>
            </div>
            <div class="focus-row">
              <span class="pill ${entry.isEliminated ? "pill-closed" : "pill-open"}">${entry.isEliminated ? `Lost: ${escapeHtml(entry.lossState?.name || "Staff quit")}` : "Active"}</span>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderEventArtwork(presetId, headline, className = "event-artwork") {
  const meta = EVENT_ART_DIRECTORY[presetId] || {
    image: "/assets/feast-haven/scenes/dining-room-main.png",
    alt: "Feast Haven dining room artwork"
  };

  return `
    <div class="${className}">
      <img src="${meta.image}" alt="${escapeHtml(meta.alt || `${headline} artwork`)}" />
    </div>
  `;
}

function renderCaseChoiceRow(entry) {
  const label = entry.phase === "consultant"
    ? `Step ${entry.stepIndex}: Consultation`
    : `Step ${entry.stepIndex}: Action Taken`;
  const stage = getCaseStageMeta(entry.stepIndex);
  return `
    <article class="feed-row compact-feed-row">
      <div class="feed-main">
        ${renderStageIcon(stage, entry.stepIndex)}
        <div>
          <strong>${escapeHtml(label)}</strong>
          <div class="subtext">
            ${
              entry.phase === "consultant"
                ? `${renderStaffInlineIdentity(entry.consultantId, getStaffName(entry.consultantId), "staff-inline")}<span>${escapeHtml(entry.summary)}</span>`
                : `${renderStaffInlineIdentity(entry.consultantId, getStaffName(entry.consultantId), "staff-inline")}<span>${escapeHtml(entry.label)}</span>`
            }
          </div>
          ${
            entry.phase === "action"
              ? `<div class="note">${escapeHtml(entry.summary)}</div>`
              : ""
          }
        </div>
      </div>
      ${
        entry.phase === "action"
          ? `<div class="history-impact">
              <span class="impact-chip ${entry.salesDelta >= 0 ? "positive" : "negative"}">Revenue ${formatSignedRevenue(entry.salesDelta)}</span>
              <span class="impact-chip ${entry.satisfactionDelta >= 0 ? "positive" : "negative"}">Sat ${formatSigned(entry.satisfactionDelta)}</span>
              <span class="impact-chip ${entry.reputationDelta >= 0 ? "positive" : "negative"}">Rep ${formatSigned(entry.reputationDelta)}</span>
            </div>`
          : ""
      }
    </article>
  `;
}

function renderScoreTierBadge(scoreTier, compact = false) {
  if (!scoreTier) {
    return "";
  }
  const image = SCORE_TIER_BADGES[scoreTier.level];
  return `
    <div class="score-tier-badge ${compact ? "compact" : ""}">
      <img src="${image}" alt="${escapeHtml(scoreTier.label)} badge" />
      <div>
        <strong>${compact ? `T${scoreTier.level}` : escapeHtml(scoreTier.label)}</strong>
        <span>${compact ? escapeHtml(scoreTier.label) : `Tier ${scoreTier.level}`}</span>
      </div>
    </div>
  `;
}

function renderTrustBadge(staff) {
  const image = TRUST_BADGE_BY_TONE[staff?.trustBand?.tone] || TRUST_BADGE_BY_TONE.muted;
  return `
    <span class="trust-badge trust-badge-${escapeHtml(staff?.trustBand?.tone || "muted")}">
      <img src="${image}" alt="${escapeHtml(staff?.trustBand?.label || "Trust")} trust badge" />
      <span>${escapeHtml(staff?.trustBand?.label || "Trust")}</span>
    </span>
  `;
}

function renderRelationshipChip(relationship) {
  if (!relationship) {
    return "";
  }
  return `
    <span class="relationship-chip relationship-chip-${escapeHtml(relationship.tone || "volatile")}">
      <strong>${escapeHtml(relationship.counterpartName)}</strong>
      <span>${escapeHtml(relationship.label)}</span>
    </span>
  `;
}

function renderRelationshipStack(relationships) {
  if (!relationships?.length) {
    return "";
  }
  return `
    <div class="relationship-stack">
      ${relationships.slice(0, 2).map(renderRelationshipChip).join("")}
    </div>
  `;
}

function getCaseStageMeta(stepIndex) {
  const numericStep = Math.max(1, Math.min(6, Number(stepIndex || 1)));
  return CASE_STAGE_META[numericStep] || CASE_STAGE_META[1];
}

function renderStageIcon(stage, stepIndex) {
  if (!stage) {
    return "";
  }
  return `
    <div class="case-stage-icon">
      <img src="${stage.icon}" alt="${escapeHtml(stage.label)} icon" />
      <span>Step ${Number(stepIndex || 1)}</span>
    </div>
  `;
}

function renderCaseStageRail(studentCase) {
  const currentStep = studentCase.status === "resolved" || studentCase.status === "lost"
    ? 6
    : Math.max(1, Math.min(6, Number(studentCase.stepIndex || 1)));
  return `
    <div class="case-stage-rail">
      ${Object.entries(CASE_STAGE_META)
        .map(([step, stage]) => {
          const stepNumber = Number(step);
          const tone = stepNumber < currentStep ? "done" : stepNumber === currentStep ? "active" : "pending";
          return `
            <div class="case-stage-stop case-stage-stop-${tone}">
              <img src="${stage.icon}" alt="${escapeHtml(stage.label)} icon" />
              <span>${escapeHtml(stage.label)}</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderAwardIcon(award) {
  const image = AWARD_ICON_BY_ID[award?.awardId] || "/assets/feast-haven/award-icons/award-chef-cup.png";
  return `<img class="award-icon" src="${image}" alt="${escapeHtml(award?.title || "Award")} icon" />`;
}

function renderImpactSummary(impact, label) {
  if (!impact) {
    return "";
  }

  return `
    <div class="impact-summary">
      <strong>${escapeHtml(label)}</strong>
      <div class="impact-grid">
        <div class="impact-chip ${impact.salesDelta >= 0 ? "positive" : "negative"}">Revenue ${formatSignedRevenue(impact.salesDelta)}</div>
        <div class="impact-chip ${impact.satisfactionDelta >= 0 ? "positive" : "negative"}">Satisfaction ${formatSigned(impact.satisfactionDelta)}</div>
        <div class="impact-chip ${impact.reputationDelta >= 0 ? "positive" : "negative"}">Reputation ${formatSigned(impact.reputationDelta)}</div>
      </div>
    </div>
  `;
}

function renderTeacherSnapshot(snapshot) {
  const openingConsultants = snapshot.openingConsultants || [];
  const activeNodes = snapshot.activeNodes || [];

  return `
    <div class="snapshot-block">
      <div class="section-head compact">
        <p class="eyebrow">Live Branch Map</p>
        <h3>Where students are branching</h3>
      </div>
      <div class="snapshot-grid">
        ${openingConsultants
          .map(
            (entry) => `
              <article class="preview-option">
                <div class="feed-main">
                  ${renderStaffFocusChip(entry.staffId)}
                  <span class="tag subtle">${entry.count} opened here</span>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
      ${
        activeNodes.length
          ? `<div class="feed-list">
              ${activeNodes
                .map(
                  (node) => `
                    <article class="feed-row compact-feed-row">
                      <div class="feed-main">
                        <div>
                          <strong>${escapeHtml(node.title)}</strong>
                          <div class="subtext">${node.count} active restaurant case${node.count === 1 ? "" : "s"} at this branch</div>
                        </div>
                      </div>
                    </article>
                  `
                )
                .join("")}
            </div>`
          : `<p class="note">No follow-up branches are active right now. Students are either still choosing their first staff member or have already resolved the event.</p>`
      }
    </div>
  `;
}

function getStaffName(staffId) {
  return getStaffMeta(staffId).name;
}

function getStaffMeta(staffId) {
  const user = state.data?.user;
  if (user) {
    const match = user.staff.find((staff) => staff.id === staffId);
    if (match) {
      return {
        name: match.name,
        title: match.title,
        avatar: STAFF_DIRECTORY[staffId]?.avatar || "/assets/staff/jake.png",
        accent: STAFF_DIRECTORY[staffId]?.accent || "waiter",
        badge: STAFF_DIRECTORY[staffId]?.badge || "Team"
      };
    }
  }

  return STAFF_DIRECTORY[staffId] || {
    name: staffId,
    title: "",
    avatar: "/assets/staff/jake.png",
    accent: "waiter",
    badge: "Team"
  };
}

function showToast(message) {
  refs.toast.textContent = message;
  refs.toast.classList.remove("hidden");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    refs.toast.classList.add("hidden");
  }, 3200);
}

function formatRevenue(value) {
  return `$${Math.round(Number(value || 0)).toLocaleString()}k`;
}

function formatScore(value) {
  return Number(value || 0).toFixed(1);
}

function formatSignedRevenue(value) {
  const number = Math.round(Number(value || 0));
  const absolute = Math.abs(number).toLocaleString();
  return `${number >= 0 ? "+" : "-"}$${absolute}k`;
}

function formatPercent(value) {
  return `${Math.round(Number(value || 0))}%`;
}

function formatDurationCompact(value) {
  if (!Number.isFinite(Number(value))) {
    return "Not yet";
  }
  const totalSeconds = Math.max(0, Math.round(Number(value) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (!minutes) {
    return `${seconds}s`;
  }
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function formatSigned(value) {
  const number = Math.round(Number(value || 0));
  return `${number > 0 ? "+" : ""}${number}`;
}

function formatDate(value) {
  if (!value) {
    return "Not yet";
  }
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function updateAutomationHooks() {
  window.render_game_to_text = () => {
    const payload = {
      role: state.data?.isAdmin ? "teacher" : state.data?.user ? "student" : "guest",
      sessionOpen: Boolean(state.data?.game?.isOpen),
      currentRound: state.data?.currentRound
        ? {
            eventNumber: state.data.currentRound.roundNumber,
            headline: state.data.currentRound.headline,
            completedCases: state.data.currentRound.completedCount,
            totalStudents: state.data.currentRound.totalStudents,
            userResponded: Boolean(state.data.currentRound.userResponse),
            casePhase: state.data.currentRound.studentCase?.currentPhase || null,
            currentRevenueDelta: state.data.currentRound.studentCase?.cumulativeImpact?.salesDelta || 0
          }
        : null,
      user: state.data?.user
        ? {
            revenue: state.data.user.sales,
            satisfaction: state.data.user.satisfaction,
            reputation: state.data.user.reputation,
            avgMorale: state.data.user.avgMorale,
            avgTrust: state.data.user.avgTrust,
            managerStyle: state.data.user.managerProfile?.title || null
          }
        : null,
      leaderboard: (state.data?.leaderboard || []).slice(0, 3).map((entry) => ({
        rank: entry.rank,
        name: entry.displayName,
        revenue: entry.sales,
        teamHealth: entry.teamHealth
      }))
    };
    return JSON.stringify(payload);
  };

  window.advanceTime = () => {
    render();
  };
}
