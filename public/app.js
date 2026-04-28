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
    selectedAvatarId: null,
    sabotageDraft: {
      targetTeamId: "",
      sabotageType: ""
    },
    sabotageInput: [],
    sabotageRevealUntil: 0
  }
};

const SABOTAGE_SYMBOL_META = {
  cloche: { label: "Cloche" },
  bell: { label: "Bell" },
  glass: { label: "Glass" },
  fork: { label: "Fork" },
  knife: { label: "Knife" },
  flame: { label: "Flame" }
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
  "robot-host-roulette": {
    image: "/assets/feast-haven/events/robot-host-roulette.png",
    alt: "A polished AI host robot assigning tables at Feast Haven while confused guests and staff argue around the host stand"
  },
  "funeral-wedding-collision": {
    image: "/assets/feast-haven/events/funeral-wedding-collision.png",
    alt: "A private room disaster where a wedding dinner and memorial gathering have collided inside Feast Haven"
  },
  "balloon-review-blackmail": {
    image: "/assets/feast-haven/events/balloon-review-blackmail.png",
    alt: "A balloon artist critic performing mocking food-review balloons in the dining room while staff and guests react"
  },
  "spice-club-meltdown": {
    image: "/assets/feast-haven/events/spice-club-meltdown.png",
    alt: "A dangerous hot-sauce challenge spiraling out of control at a Feast Haven dinner table while staff intervene"
  },
  "cryo-pod-celebrity": {
    image: "/assets/feast-haven/events/cryo-pod-celebrity.png",
    alt: "A celebrity standing inside a cryotherapy pod placed directly in the Feast Haven dining room as fog spills across the floor"
  },
  "truffle-pig-vip-night": {
    image: "/assets/feast-haven/events/truffle-pig-vip-night.png",
    alt: "A tuxedoed truffle pig being paraded through the Feast Haven dining room by a wealthy guest while staff and diners panic"
  },
  "silent-retreat-buyout": {
    image: "/assets/feast-haven/events/silent-retreat-buyout.png",
    alt: "A silent retreat occupying half of Feast Haven while normal diners and staff struggle through two incompatible room moods"
  },
  "fake-prince-auction": {
    image: "/assets/feast-haven/events/fake-prince-auction.png",
    alt: "A fake prince auctioning off royal blessings in the middle of a Feast Haven dining room while guests wave money and stare"
  },
  "ice-swan-blackout": {
    image: "/assets/feast-haven/events/ice-swan-blackout.png",
    alt: "A massive melting ice swan flooding the gala floor near power strips while Feast Haven staff and guests panic"
  },
  "casino-chip-tipping": {
    image: "/assets/feast-haven/events/casino-chip-tipping.png",
    alt: "Feast Haven staff and management sorting piles of casino chips as tips during a chaotic charity casino night"
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
  5: { label: "Final Resolution", icon: "/assets/feast-haven/case-stage-icons/stage-6-final-resolution.png" }
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
refs.studentRoundPanel.addEventListener("change", handleStudentRoundChange);
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
    syncSabotageState();
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

function syncSabotageState() {
  const sabotage = state.data?.currentRound?.sabotage;
  if (!sabotage) {
    state.ui.sabotageDraft.targetTeamId = "";
    state.ui.sabotageDraft.sabotageType = "";
    state.ui.sabotageInput = [];
    state.ui.sabotageRevealUntil = 0;
    return;
  }

  const targetStillExists = sabotage.availableTargets?.some((team) => team.id === state.ui.sabotageDraft.targetTeamId);
  if (!targetStillExists) {
    state.ui.sabotageDraft.targetTeamId = sabotage.availableTargets?.[0]?.id || "";
  }

  const typeStillExists = sabotage.sabotageTypes?.some((type) => type.id === state.ui.sabotageDraft.sabotageType);
  if (!typeStillExists) {
    state.ui.sabotageDraft.sabotageType = sabotage.sabotageTypes?.[0]?.id || "";
  }

  if (sabotage.outgoing?.status !== "pending") {
    state.ui.sabotageInput = [];
    state.ui.sabotageRevealUntil = 0;
    return;
  }

  const challengeLength = sabotage.outgoing?.challenge?.sequence?.length || 0;
  if (state.ui.sabotageInput.length > challengeLength) {
    state.ui.sabotageInput = state.ui.sabotageInput.slice(0, challengeLength);
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
  const startButton = event.target.closest("button[data-sabotage-start]");
  if (startButton) {
    await postJson("/api/team-sabotage/start", {
      targetTeamId: state.ui.sabotageDraft.targetTeamId,
      sabotageType: state.ui.sabotageDraft.sabotageType
    });
    return;
  }

  const typeButton = event.target.closest("button[data-sabotage-type]");
  if (typeButton) {
    state.ui.sabotageDraft.sabotageType = String(typeButton.dataset.sabotageType || "");
    render();
    return;
  }

  const revealButton = event.target.closest("button[data-sabotage-reveal]");
  if (revealButton) {
    const sabotage = state.data?.currentRound?.sabotage;
    const revealMs = Number(sabotage?.outgoing?.challenge?.revealMs || 4500);
    state.ui.sabotageRevealUntil = Date.now() + revealMs;
    render();
    window.setTimeout(() => {
      if (Date.now() >= state.ui.sabotageRevealUntil) {
        render();
      }
    }, revealMs + 50);
    return;
  }

  const symbolButton = event.target.closest("button[data-sabotage-symbol]");
  if (symbolButton) {
    const sabotage = state.data?.currentRound?.sabotage;
    const expectedLength = sabotage?.outgoing?.challenge?.sequence?.length || 0;
    if (expectedLength && state.ui.sabotageInput.length < expectedLength) {
      state.ui.sabotageInput = [...state.ui.sabotageInput, String(symbolButton.dataset.sabotageSymbol || "")];
      render();
    }
    return;
  }

  const clearButton = event.target.closest("button[data-sabotage-clear]");
  if (clearButton) {
    state.ui.sabotageInput = [];
    render();
    return;
  }

  const submitSabotageButton = event.target.closest("button[data-sabotage-submit]");
  if (submitSabotageButton) {
    await postJson("/api/team-sabotage/resolve", {
      sequence: state.ui.sabotageInput
    });
    return;
  }

  const button = event.target.closest("button[data-option-id]");
  if (!button) {
    return;
  }

  await postJson("/api/respond", {
    optionId: button.dataset.optionId
  });
}

function handleStudentRoundChange(event) {
  const targetSelect = event.target.closest("select[data-sabotage-target]");
  if (targetSelect) {
    state.ui.sabotageDraft.targetTeamId = String(targetSelect.value || "");
    render();
  }
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
  event.preventDefault();
  const passwordForm = event.target.closest("form[data-password-form]");
  if (passwordForm) {
    const payload = Object.fromEntries(new FormData(passwordForm).entries());
    const ok = await postJson("/api/admin/student/password", payload);
    if (ok) {
      passwordForm.reset();
    }
    return;
  }

  const teamForm = event.target.closest("form[data-team-form]");
  if (teamForm) {
    const payload = Object.fromEntries(new FormData(teamForm).entries());
    await postJson("/api/admin/student/team", payload);
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
      syncSabotageState();
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
          <span>Teams</span>
          <strong>${leaderboard.length}</strong>
        </div>
        <div class="mini-stat">
          <span>Class Sessions</span>
          <strong>${game.sessionNumber}</strong>
        </div>
        <div class="mini-stat">
          <span>Completed Teams</span>
          <strong>${currentRound ? `${currentRound.completedCount}/${currentRound.totalTeams || currentRound.totalStudents}` : "Waiting"}</strong>
        </div>
      </div>
      <p class="note">
        ${game.isOpen
          ? currentRound
            ? "All six teams are working the same live event, but each shared restaurant can branch differently based on team choices."
            : "Session is open. Launch a global event when you want every team to start the next chain."
          : "Open the class session before teams can start making management decisions."}
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
        ? `All teams are working Event ${currentRound.roundNumber} right now.`
        : "Session is open and waiting for the next global event."
      : "Session is closed. Open it when class begins."
    : user.isEliminated
      ? `${user.lossState?.name || "A staff member"} quit. ${user.team?.name || "Your restaurant"} is out until standings reset.`
      : game.isOpen
        ? currentRound
          ? currentRound.studentCase?.status === "resolved"
            ? "Your team resolved the current event chain. Watch the leaderboard and wait for the next global event."
            : currentRound.studentCase?.canAct
              ? "It is your turn right now. Your decision will lock in the next branch for the whole team."
              : `A global restaurant event is live. ${currentRound.studentCase?.currentDeciderName || "A teammate"} is currently on the clock.`
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
  refs.studentNameHeading.textContent = `${user.team?.name || "Team Restaurant"} · ${user.displayName}`;
  const leaderboardEntry = state.data.leaderboard.find((entry) => entry.id === user.teamId) || null;

  refs.studentSummary.innerHTML = `
    <div class="summary-profile">
      <img class="player-avatar player-avatar-hero" src="${escapeHtml(user.avatarPath || "")}" alt="${escapeHtml(user.displayName)} avatar" />
      <div>
        <strong>${escapeHtml(user.displayName)}</strong>
        <div class="subtext">@${escapeHtml(user.username)} · Seat ${escapeHtml(String(user.teamSeat || "-"))} · ${escapeHtml(user.team?.name || "Team Restaurant")}</div>
      </div>
    </div>
    ${renderPlayerRoleLoadout(user.roleLoadout)}
    ${renderTeamMemberStrip(user.team?.members || [], user.id)}
    <div class="summary-grid">
      <article class="hero-stat">
        <span class="eyebrow">${user.isEliminated ? "Final Team Score" : "Team Score"}</span>
        <strong>${formatScore(user.aggregateScore)}</strong>
        <div class="stat-subline">
          <span>${user.isEliminated ? "Eliminated" : leaderboardEntry ? `Team Rank #${leaderboardEntry.rank}` : "Not ranked yet"}</span>
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
    <p class="note">${escapeHtml(`${user.managerProfile.summary} Current tier: ${user.scoreTier.label}. Your role loadout is there to guide discussion, and short-handed teams rotate any double-role burden from round to round.`)}</p>
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
  const sabotagePanel = renderSabotagePanel(currentRound.sabotage, user);

  if (user.isEliminated) {
    return `
      <div class="case-chain-layout">
        ${currentRound ? eventOverview : ""}
        ${sabotagePanel}
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
        ${sabotagePanel}
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
    return `<div class="empty-state">Your team case has not started yet. Refresh in a moment if the teacher just launched the event.</div>`;
  }

  const turnNotice = studentCase.status === "active"
    ? `
        <div class="relationship-callout">
          <strong>${studentCase.canAct ? "Your Turn" : "Team Turn Order"}</strong>
          <span>${
            studentCase.canAct
              ? `You are locking in Step ${studentCase.stepIndex} for ${escapeHtml(user.team?.name || "your team")}.`
              : `${escapeHtml(studentCase.currentDeciderName || "A teammate")} owns Step ${studentCase.stepIndex}. You can still advise, but only they can commit the move.`
          }</span>
        </div>
      `
    : "";

  if (studentCase.currentPhase === "consultant") {
    const consultantHeading = studentCase.stepIndex > 1 ? "Who do you talk to next?" : "Who do you talk to first?";
    return `
      <div class="case-chain-layout">
        ${eventOverview}
        ${sabotagePanel}
        <article class="decision-card case-step-card">
          <div class="section-head compact">
            <p class="eyebrow">${escapeHtml(currentRound.category)} · ${escapeHtml(currentRound.pressure)} · ${stepLabel}</p>
            <h3>${escapeHtml(consultantHeading)}</h3>
          </div>
          <p>${escapeHtml(studentCase.currentPromptTitle)} ${escapeHtml(studentCase.currentPromptBody)}</p>
          <p class="note">The card above is the live global event. This step is just deciding whose perspective you want next.</p>
          ${turnNotice}
          ${renderTurnAssignmentRail(studentCase.stepAssignments, studentCase.stepIndex, studentCase.currentDeciderUserId)}
          ${studentCase.cumulativeImpact?.actionCount ? renderImpactSummary(studentCase.cumulativeImpact, "Impact so far") : ""}
          <div class="focus-row">
            ${studentCase.availableConsultants.map((consultant) => renderStaffFocusChip(consultant.id)).join("")}
          </div>
          <div class="option-list">
            ${studentCase.availableConsultants
              .map(
                (consultant) => `
                  <button class="option-button" data-option-id="${consultant.id}" ${studentCase.canAct ? "" : "disabled"}>
                    <span class="option-person">${renderStaffInlineIdentity(consultant.id, `Talk to ${consultant.name}`)}</span>
                    <span class="option-meta">${studentCase.canAct ? escapeHtml(consultant.title) : `Waiting on ${escapeHtml(studentCase.currentDeciderName || "teammate")}`}</span>
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
        ${sabotagePanel}
        <article class="decision-card case-step-card">
          <div class="section-head compact">
            <p class="eyebrow">${escapeHtml(currentRound.category)} · ${escapeHtml(currentRound.pressure)} · ${stepLabel}</p>
            <h3>What ${escapeHtml(selectedName)} tells you</h3>
          </div>
          <p>${escapeHtml(studentCase.currentPromptBody)}</p>
          <p class="note">You are still handling the global event above. This branch is the advice and options coming from ${escapeHtml(selectedName)}.</p>
          ${turnNotice}
          ${renderTurnAssignmentRail(studentCase.stepAssignments, studentCase.stepIndex, studentCase.currentDeciderUserId)}
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
                  <button class="option-button" data-option-id="${option.id}" ${studentCase.canAct ? "" : "disabled"}>
                    <span class="option-label">${escapeHtml(option.label)}</span>
                    <span class="option-meta">${studentCase.canAct ? "Choose this action" : `Waiting on ${escapeHtml(studentCase.currentDeciderName || "teammate")}`}</span>
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
          studentCase?.currentDeciderName
            ? `<span class="pill pill-neutral">Current turn: ${escapeHtml(studentCase.currentDeciderName)}</span>`
            : ""
        }
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
        <span class="eyebrow">Top Team</span>
        <strong>${admin.metrics.topStudent ? formatScore(admin.metrics.topStudent.aggregateScore) : "No players yet"}</strong>
        <div class="stat-subline">
          <span>${admin.metrics.topStudent ? escapeHtml(admin.metrics.topStudent.displayName) : "Waiting for teams"}</span>
          <span>${admin.metrics.teamCount || 0} teams · ${admin.metrics.studentCount} players</span>
        </div>
      </article>
      <div class="mini-grid summary-mini-grid">
        <div class="mini-stat"><span>Average Team Revenue</span><strong>${formatRevenue(admin.metrics.averageSales)}</strong></div>
        <div class="mini-stat"><span>Average Team Morale</span><strong>${formatPercent(admin.metrics.averageMorale)}</strong></div>
        <div class="mini-stat"><span>Average Team Pace</span><strong>${formatDurationCompact(admin.metrics.averageResponseMs)}</strong></div>
        <div class="mini-stat"><span>Completed Teams</span><strong>${currentRound ? `${admin.metrics.activeResponses}/${admin.metrics.teamCount || admin.metrics.studentCount}` : "Waiting"}</strong></div>
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
                ? `Event ${currentRound.roundNumber} is active with ${currentRound.completedCount}/${currentRound.totalTeams || currentRound.totalStudents} teams finished.`
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

  refs.studentRoster.innerHTML = `
    ${renderAdminTeamBoard(admin.teams || [], currentRound)}
    ${
      admin.students.length
        ? `<div class="feed-list">${admin.students.map(renderStudentRosterRow).join("")}</div>`
        : `<div class="empty-state">No student accounts exist yet.</div>`
    }
  `;

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
      fallbackDetail: "Teams need at least one completed case before pace rankings appear.",
      entry: analytics.fastestResponder,
      title: analytics.fastestResponder ? formatDurationCompact(analytics.fastestResponder.averageResolutionMs) : null,
      detail: analytics.fastestResponder
        ? `${escapeHtml(analytics.fastestResponder.studentName)} is leading the team pace average across ${analytics.fastestResponder.completedEventCount} finished ${analytics.fastestResponder.completedEventCount === 1 ? "event" : "events"}.`
        : null,
      chip: analytics.fastestResponder ? "Consistent pace" : "Need data"
    },
    {
      eyebrow: "Slowest Responder",
      tone: "negative",
      fallbackTitle: "Waiting for finished events",
      fallbackDetail: "Once teams complete cases, this will show who may need time support.",
      entry: analytics.slowestResponder,
      title: analytics.slowestResponder ? formatDurationCompact(analytics.slowestResponder.averageResolutionMs) : null,
      detail: analytics.slowestResponder
        ? `${escapeHtml(analytics.slowestResponder.studentName)} currently has the slowest team average over ${analytics.slowestResponder.completedEventCount} finished ${analytics.slowestResponder.completedEventCount === 1 ? "event" : "events"}.`
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
  const teamOptions = (state.data.admin?.teamCatalog || [])
    .map(
      (team) => `
        <option value="${team.id}" ${team.id === student.teamId ? "selected" : ""}>
          ${escapeHtml(team.name)}
        </option>
      `
    )
    .join("");
  const teamAssignmentLocked = Boolean(state.data.game?.isOpen || state.data.currentRound);

  return `
    <article class="feed-row">
      <div class="feed-main">
        ${renderPlayerIdentity(student.displayName, `@${student.username} · ${escapeHtml(student.team?.name || "No team")} · Seat ${escapeHtml(String(student.teamSeat || "-"))} · Joined ${formatDate(student.joinedAt)}`, student.avatarPath)}
        <span class="pill ${student.progressTone === "closed" ? "pill-closed" : student.progressTone === "open" ? "pill-open" : "pill-muted"}">
          ${escapeHtml(student.progressLabel || "Waiting")}
        </span>
      </div>
      <div class="feed-metrics">
        <div><strong>${formatScore(student.aggregateScore)}</strong><span>Team score</span></div>
        <div class="metric-badge-cell">${renderScoreTierBadge(student.scoreTier, true)}</div>
        <div><strong>${formatRevenue(student.sales)}</strong><span>Team revenue</span></div>
        <div><strong>${formatPercent(student.avgMorale)}</strong><span>Team morale</span></div>
        <div><strong>${formatPercent(student.teamHealth)}</strong><span>Team health</span></div>
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
              <span>${escapeHtml(student.award.subtitle)} · ${escapeHtml(student.team?.name || "Team")}</span>
              <p class="note">${escapeHtml(student.award.reason)}</p>
            </div>`
          : ""
      }
      ${renderPlayerRoleLoadout(student.roleLoadout, true)}
      ${student.isEliminated ? `<p class="note">${escapeHtml(student.lossState?.message || "This restaurant has been eliminated.")}</p>` : ""}
      <div class="roster-actions">
        <form data-team-form class="inline-form">
          <input type="hidden" name="userId" value="${student.id}" />
          <select name="teamId" ${teamAssignmentLocked ? "disabled" : ""}>
            ${teamOptions}
          </select>
          <button class="subtle" type="submit" ${teamAssignmentLocked ? "disabled" : ""}>Move Team</button>
        </form>
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
      ${
        teamAssignmentLocked
          ? `<p class="note">Team moves lock once the class session is open. Set teams before starting the day.</p>`
          : ""
      }
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

function renderTurnAssignmentRail(assignments, currentStep, currentDeciderUserId, compact = false) {
  if (!assignments?.length) {
    return "";
  }

  return `
    <div class="team-turn-rail ${compact ? "team-turn-rail-compact" : ""}">
      <strong>${compact ? "Step Owners" : "Event Turn Order"}</strong>
      <div class="team-turn-grid">
        ${assignments
          .map(
            (assignment) => `
              <div class="team-turn-chip ${
                Number(assignment.stepIndex) === Number(currentStep)
                  ? "is-current"
                  : assignment.userId === currentDeciderUserId
                    ? "is-live"
                    : ""
              }">
                <span class="eyebrow">Step ${escapeHtml(String(assignment.stepIndex))}</span>
                <strong>${escapeHtml(assignment.displayName || "Open seat")}</strong>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderPlayerRoleLoadout(roles, compact = false) {
  if (!roles?.length) {
    return "";
  }
  return `
    <div class="${compact ? "focus-row" : "warning-list"}">
      ${roles
        .map(
          (role) => `
            <span class="${compact ? "pill pill-neutral" : "warning-chip"}" title="${escapeHtml(role.summary)}">
              ${escapeHtml(role.label)}
            </span>
          `
        )
        .join("")}
    </div>
  `;
}

function renderTeamMemberStrip(members, currentUserId) {
  if (!members?.length) {
    return "";
  }
  return `
    <div class="focus-row">
      ${members
        .map(
          (member) => `
            <span class="pill ${member.id === currentUserId ? "pill-open" : "pill-neutral"}">
              Seat ${escapeHtml(String(member.seat || "-"))}: ${escapeHtml(member.displayName)}
            </span>
          `
        )
        .join("")}
    </div>
  `;
}

function renderTeacherFeedRow(entry) {
  return `
    <article class="feed-row">
      <div class="feed-main">
        <div>
          <strong>${escapeHtml(entry.teamName || "Team")} · ${escapeHtml(entry.studentName)}</strong>
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

function renderAdminTeamBoard(teams, currentRound) {
  if (!teams?.length) {
    return "";
  }

  return `
    <section class="team-ops-section">
      <div class="section-head compact">
        <div>
          <p class="eyebrow">Restaurant Teams</p>
          <h3>Six restaurants, four seats each</h3>
        </div>
      </div>
      <div class="team-ops-grid">
        ${teams.map((team) => renderAdminTeamCard(team, currentRound)).join("")}
      </div>
    </section>
  `;
}

function renderAdminTeamCard(team, currentRound) {
  const liveCase = team.currentCase;
  const sabotageState = team.sabotageState;
  const statusTone = team.currentResponse
    ? "pill-open"
    : liveCase
      ? "pill-neutral"
      : team.memberCount
        ? "pill-muted"
        : "pill-closed";

  return `
    <article class="team-ops-card accent-${escapeHtml(team.accent || "gold")}">
      <div class="team-ops-header">
        <div>
          <span class="eyebrow">${escapeHtml(team.name)}</span>
          <h4>${team.memberCount}/4 seats filled</h4>
        </div>
        <span class="pill ${statusTone}">${escapeHtml(team.progressLabel || "Waiting")}</span>
      </div>
      <div class="focus-row">
        ${
          team.aggregateScore != null
            ? `<span class="pill pill-neutral">Score ${formatScore(team.aggregateScore)}</span>`
            : ""
        }
        ${
          team.scoreTier?.label
            ? `<span class="pill pill-neutral">${escapeHtml(team.scoreTier.label)}</span>`
            : ""
        }
        <span class="pill pill-neutral">Revenue ${formatRevenue(team.sales || 0)}</span>
      </div>
      <div class="team-seat-list">
        ${team.seatAssignments
          .map(
            (seat) => `
              <div class="team-seat-row ${seat.occupied ? "" : "is-open"}">
                <strong>Seat ${escapeHtml(String(seat.seat))}</strong>
                <span>${seat.occupied ? escapeHtml(seat.displayName || "Player") : "Open seat"}</span>
              </div>
            `
          )
          .join("")}
      </div>
      ${
        liveCase
          ? `
              <div class="note">
                Current turn: <strong>${escapeHtml(liveCase.currentDeciderName || "Waiting")}</strong>
              </div>
              ${renderTurnAssignmentRail(liveCase.stepAssignments, liveCase.stepIndex, liveCase.currentDeciderUserId, true)}
            `
          : currentRound && team.memberCount
            ? `<p class="note">This team is waiting for its live case to load.</p>`
            : `<p class="note">${team.memberCount ? "Roles and any extra step pressure rotate each event, so short-handed teams share the burden over time." : "Seats stay open until players join this restaurant."}</p>`
      }
      ${
        sabotageState
          ? `
              <div class="note">
                Covert lead: <strong>${escapeHtml(sabotageState.operatorName || "Open seat")}</strong>
              </div>
              <div class="note">
                Covert ops:
                <strong>${
                  sabotageState.outgoing
                    ? escapeHtml(
                        sabotageState.outgoing.status === "pending"
                          ? `Attempt live on ${sabotageState.outgoing.targetTeamName}`
                          : sabotageState.outgoing.status === "success"
                            ? `Hit ${sabotageState.outgoing.targetTeamName}`
                            : `Caught targeting ${sabotageState.outgoing.targetTeamName}`
                      )
                    : "Unused"
                }</strong>
                ${
                  sabotageState.incoming?.length
                    ? `<span> · Targeted ${sabotageState.incoming.length} time${sabotageState.incoming.length === 1 ? "" : "s"}</span>`
                    : ""
                }
              </div>
            `
          : ""
      }
      ${
        team.roleLoadouts?.length
          ? `
              <div class="team-role-list">
                ${team.roleLoadouts
                  .map(
                    (entry) => `
                      <div class="team-role-row">
                        <strong>Seat ${escapeHtml(String(entry.seat || "-"))}: ${escapeHtml(entry.displayName)}</strong>
                        ${renderPlayerRoleLoadout(entry.roles || [], true) || `<span class="subtext">Roles assign on the next event.</span>`}
                      </div>
                    `
                  )
                  .join("")}
              </div>
            `
          : ""
      }
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
        <div><strong>${round.completedCount}/${round.totalTeams || round.totalStudents}</strong><span>Teams done</span></div>
        <div><strong>${round.inProgressCount}</strong><span>Teams live</span></div>
        <div><strong>${formatDurationCompact(round.timingStats?.averageResponseMs)}</strong><span>Avg team finish</span></div>
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
              ${renderPlayerIdentity(entry.displayName, `${escapeHtml((entry.memberNames || []).join(", ") || "Waiting for players")}`, entry.avatarPath)}
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
                ? `${renderStaffInlineIdentity(entry.consultantId, getStaffName(entry.consultantId), "staff-inline")}<span>${escapeHtml(entry.summary)}</span>${entry.actorName ? `<span> · ${escapeHtml(entry.actorName)}</span>` : ""}`
                : `${renderStaffInlineIdentity(entry.consultantId, getStaffName(entry.consultantId), "staff-inline")}<span>${escapeHtml(entry.label)}</span>${entry.actorName ? `<span> · ${escapeHtml(entry.actorName)}</span>` : ""}`
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

function getSabotageSymbolLabel(symbol) {
  return SABOTAGE_SYMBOL_META[symbol]?.label || String(symbol || "").toUpperCase();
}

function isSabotageSequenceVisible() {
  return Number(state.ui.sabotageRevealUntil || 0) > Date.now();
}

function renderSabotagePanel(sabotage, user) {
  if (!sabotage) {
    return "";
  }

  const incomingNotices = (sabotage.incoming || [])
    .map(
      (attempt) => `
        <div class="sabotage-alert sabotage-alert-danger">
          <strong>Incoming sabotage from ${escapeHtml(attempt.attackerTeamName)}</strong>
          <span>${escapeHtml(attempt.outcomeNote || `${attempt.sabotageLabel} landed against your restaurant.`)}</span>
        </div>
      `
    )
    .join("");

  if (sabotage.outgoing?.status === "success" || sabotage.outgoing?.status === "failed") {
    return `
      <article class="decision-card sabotage-card">
        <div class="section-head compact">
          <p class="eyebrow">Covert Ops</p>
          <h3>${sabotage.outgoing.status === "success" ? "Sabotage Landed" : "Sabotage Failed"}</h3>
        </div>
        ${incomingNotices}
        <div class="choice-lockup">
          <span class="choice-pill">${escapeHtml(sabotage.outgoing.sabotageLabel)}</span>
          <span class="choice-pill">${escapeHtml(sabotage.outgoing.targetTeamName)}</span>
        </div>
        <p>${escapeHtml(sabotage.outgoing.outcomeNote || sabotage.outgoing.sabotageSummary)}</p>
        <p class="note">Each restaurant only gets one sabotage attempt per live event.</p>
      </article>
    `;
  }

  if (sabotage.outgoing?.status === "pending" && sabotage.outgoing.challenge) {
    const challenge = sabotage.outgoing.challenge;
    const visible = isSabotageSequenceVisible();
    const expectedLength = challenge.sequence.length;

    return `
      <article class="decision-card sabotage-card sabotage-card-live">
        <div class="section-head compact">
          <p class="eyebrow">Covert Ops</p>
          <h3>Mini-Game: Memory Sweep</h3>
        </div>
        ${incomingNotices}
        <div class="relationship-callout">
          <strong>Assigned covert ops lead</strong>
          <span>${
            sabotage.isOperator
              ? "This round belongs to you. Beat the mini-game and the sabotage lands."
              : `${escapeHtml(sabotage.operatorName || "A teammate")} is the only player who can finish this covert action this round.`
          }</span>
        </div>
        <p>${escapeHtml(`${sabotage.outgoing.createdByName} targeted ${sabotage.outgoing.targetTeamName} with ${sabotage.outgoing.sabotageLabel}. Memorize the sweep code, then tap it back exactly. Miss it and your own restaurant gets caught.`)}</p>
        <div class="sabotage-sequence">
          ${(visible ? challenge.sequence : Array.from({ length: expectedLength }, () => "hidden"))
            .map((symbol) => `
              <span class="sabotage-sequence-chip ${symbol === "hidden" ? "is-hidden" : ""}">
                ${escapeHtml(symbol === "hidden" ? "?" : getSabotageSymbolLabel(symbol))}
              </span>
            `)
            .join("")}
        </div>
        <div class="action-row">
          <button class="secondary" type="button" data-sabotage-reveal ${sabotage.canResolve ? "" : "disabled"}>${visible ? "Code Live" : "Reveal Code"}</button>
          <button class="subtle" type="button" data-sabotage-clear ${sabotage.canResolve && state.ui.sabotageInput.length ? "" : "disabled"}>Clear Attempt</button>
        </div>
        <div class="sabotage-input-row">
          ${Array.from({ length: expectedLength }, (_, index) => `
            <span class="sabotage-input-chip ${state.ui.sabotageInput[index] ? "is-filled" : ""}">
              ${escapeHtml(state.ui.sabotageInput[index] ? getSabotageSymbolLabel(state.ui.sabotageInput[index]) : "Waiting")}
            </span>
          `).join("")}
        </div>
        <div class="sabotage-symbol-grid">
          ${challenge.symbolPool.map((symbol) => `
            <button class="option-button sabotage-symbol-button" type="button" data-sabotage-symbol="${escapeHtml(symbol)}" ${sabotage.canResolve && state.ui.sabotageInput.length < expectedLength ? "" : "disabled"}>
              <span class="option-label">${escapeHtml(getSabotageSymbolLabel(symbol))}</span>
              <span class="option-meta">Add to code</span>
            </button>
          `).join("")}
        </div>
        <div class="action-row">
          <button class="danger-button" type="button" data-sabotage-submit ${sabotage.canResolve && state.ui.sabotageInput.length === expectedLength ? "" : "disabled"}>Resolve Sabotage</button>
        </div>
        <p class="note">${escapeHtml(`${user.team?.name || "Your restaurant"} can only submit one full code attempt. Winning hits ${sabotage.outgoing.targetTeamName}; losing burns your own stats.`)}</p>
      </article>
    `;
  }

  return `
    <article class="decision-card sabotage-card">
      <div class="section-head compact">
        <p class="eyebrow">Covert Ops</p>
        <h3>Sabotage Window</h3>
      </div>
      ${incomingNotices}
      <div class="relationship-callout">
        <strong>Rotating covert ops lead</strong>
        <span>${
          sabotage.isOperator
            ? "This round’s sabotage attempt belongs to you."
            : `${escapeHtml(sabotage.operatorName || "A teammate")} is up for covert ops on this event.`
        }</span>
      </div>
      <p>Every team gets one covert move per live event. Pick a rival, choose the kind of disruption, then beat the mini-game to make it stick.</p>
      <label class="stack sabotage-select-block">
        <span>Target Restaurant</span>
        <select data-sabotage-target ${sabotage.canStart ? "" : "disabled"}>
          ${(sabotage.availableTargets || [])
            .map((team) => `
              <option value="${escapeHtml(team.id)}" ${team.id === state.ui.sabotageDraft.targetTeamId ? "selected" : ""}>
                ${escapeHtml(team.name)}
              </option>
            `)
            .join("")}
        </select>
      </label>
      <div class="sabotage-type-grid">
        ${(sabotage.sabotageTypes || [])
          .map((type) => `
            <button
              class="option-button sabotage-type-button ${type.id === state.ui.sabotageDraft.sabotageType ? "is-selected" : ""}"
              type="button"
              data-sabotage-type="${escapeHtml(type.id)}"
              ${sabotage.canStart ? "" : "disabled"}
            >
              <span class="option-label">${escapeHtml(type.label)}</span>
              <span class="option-meta">${escapeHtml(type.summary)}</span>
            </button>
          `)
          .join("")}
      </div>
      <div class="action-row">
        <button class="danger-button" type="button" data-sabotage-start ${sabotage.canStart ? "" : "disabled"}>Start Sabotage Mini-Game</button>
      </div>
      <p class="note">If your team wins the mini-game, the rival takes the hit. If you miss it, your own restaurant gets caught and penalized.</p>
    </article>
  `;
}

function renderTeacherSnapshot(snapshot) {
  const openingConsultants = snapshot.openingConsultants || [];
  const activeNodes = snapshot.activeNodes || [];

  return `
    <div class="snapshot-block">
      <div class="section-head compact">
        <p class="eyebrow">Live Branch Map</p>
        <h3>Where teams are branching</h3>
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
          : `<p class="note">No follow-up branches are active right now. Teams are either still choosing their first staff member or have already resolved the event.</p>`
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
