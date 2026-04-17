const state = {
  data: null,
  ui: {
    companySearch: "",
    volatilityFilter: "all",
    industryFilter: "all",
    selectedCompanyTicker: null,
    companyListScrollTop: 0,
    activeEventModalId: null,
    authPending: false,
    researchModal: {
      open: false,
      mode: "idle",
      result: null
    },
    lotteryModal: {
      open: false,
      mode: "idle",
      result: null
    },
    lobbyModal: {
      open: false,
      result: null
    },
    eventDraft: {
      headline: "",
      body: "",
      isBigStory: false,
      effects: {}
    }
  }
};

const BIG_STORY_IMAGE_SRC = "/assets/ram-financial-report.png";

const EVENT_PRESETS = [
  {
    category: "Momentum",
    id: "hhs-viral",
    label: "HHS goes viral",
    headline: "Haven Holistics explodes on social media",
    body: "A wave of influencers claims Haven Holistics changed their lives, their sleep, and somehow their Wi-Fi signal.",
    effects: [
      { ticker: "HHS", percentChange: 18 },
      { ticker: "WW", percentChange: 4 }
    ]
  },
  {
    category: "Scandals",
    id: "mc-hearing",
    label: "MegaCorp hearing",
    headline: "MegaCorp dragged into another antitrust hearing",
    body: "Lawmakers are once again asking whether one company really needs this much power, this many subsidiaries, and this many suspiciously loyal goats.",
    effects: [
      { ticker: "MC", percentChange: -8 },
      { ticker: "HFW", percentChange: 6 }
    ]
  },
  {
    category: "Momentum",
    id: "snack-hit",
    label: "Snack City hit",
    headline: "Snack City launches a chaotic best-seller",
    body: "Kids cannot stop buying the new flavor even though teachers keep finding glowing orange fingerprints on every worksheet.",
    effects: [
      { ticker: "SC", percentChange: 15 },
      { ticker: "YTT", percentChange: -3 }
    ]
  },
  {
    category: "Scandals",
    id: "ssc-scare",
    label: "Security scandal",
    headline: "Steel Services faces a privacy scandal",
    body: "A reporter asks whether Steel Services is protecting data or collecting enough of it to write a memoir about everyone.",
    effects: [
      { ticker: "SSC", percentChange: -10 },
      { ticker: "HFW", percentChange: -3 }
    ]
  },
  {
    category: "Momentum",
    id: "uno-hype",
    label: "UNO hype train",
    headline: "Utter Nonsense unveils a dangerously exciting demo",
    body: "The company's new VR preview looks amazing, although the legal team would like everyone to stop using the word 'injury' in the reviews.",
    effects: [
      { ticker: "UNO", percentChange: 22 },
      { ticker: "JHS", percentChange: 5 }
    ]
  },
  {
    category: "Breakthroughs",
    id: "imm-breakthrough",
    label: "IMM breakthrough",
    headline: "Immortal Life claims a breakthrough",
    body: "Scientists are skeptical, investors are euphoric, and the CEO is already using the phrase 'pre-post-mortality economy.'",
    effects: [
      { ticker: "IMM", percentChange: 28 },
      { ticker: "HHS", percentChange: -4 }
    ]
  },
  {
    category: "Scandals",
    id: "wmoo-ethics",
    label: "WeMoo backlash",
    headline: "WeMoo faces ethics backlash",
    body: "Consumers love cheap deals until a documentary reminds them there might be actual people involved in making the cheap deals.",
    effects: [
      { ticker: "WMO", percentChange: -11 },
      { ticker: "MC", percentChange: 3 }
    ]
  },
  {
    category: "Momentum",
    id: "sae-merch",
    label: "SAE merch boom",
    headline: "Sir Animal merchandise sells out again",
    body: "The internet star's newest snack, hoodie, and lunch tray bundle sells out in minutes because apparently branding remains undefeated.",
    effects: [
      { ticker: "SAE", percentChange: 14 },
      { ticker: "SC", percentChange: 4 }
    ]
  },
  {
    category: "Breakthroughs",
    id: "sky-contract",
    label: "SKY lands deal",
    headline: "SkyRacers wins a massive aircraft contract",
    body: "A major airline just signed a long-term fleet deal, which is exciting news for shareholders and deeply boring news for everyone else.",
    effects: [
      { ticker: "SKY", percentChange: 11 },
      { ticker: "MCM", percentChange: 3 }
    ]
  },
  {
    category: "Scandals",
    id: "ytt-recall",
    label: "YTT recall",
    headline: "Yum Yum Tum Tum issues a snack recall",
    body: "The company insists the neon cheese dust was only 'unexpectedly energetic,' but regulators have asked several follow-up questions.",
    effects: [
      { ticker: "YTT", percentChange: -9 },
      { ticker: "SC", percentChange: 5 }
    ]
  },
  {
    category: "Rivalries",
    id: "mc-vs-hfw",
    label: "Phone war",
    headline: "MegaCorp and Hello Fellow go to war over phones",
    body: "Both companies unveiled suspiciously similar devices within the same hour and are now accusing each other of copying rectangles.",
    effects: [
      { ticker: "MC", percentChange: -4 },
      { ticker: "HFW", percentChange: -4 },
      { ticker: "WW", percentChange: 2 }
    ]
  },
  {
    category: "Chaos",
    id: "dbm-mystery",
    label: "DBM mystery spike",
    headline: "Don't Buy Me surges for reasons nobody can explain",
    body: "No press release was posted, no product was announced, and yet traders are acting like they know something, which usually ends well for absolutely no one.",
    effects: [
      { ticker: "DBM", percentChange: 19 },
      { ticker: "MC", percentChange: -2 }
    ]
  },
  {
    category: "Momentum",
    id: "ww-ad-boom",
    label: "WW ad boom",
    headline: "Wik Wok reports a monster ad-sales quarter",
    body: "The company says engagement is up, advertisers are thrilled, and productivity experts are once again asking society to please calm down.",
    effects: [
      { ticker: "WW", percentChange: 13 },
      { ticker: "SAE", percentChange: 4 }
    ]
  },
  {
    category: "Chaos",
    id: "jhs-meme-run",
    label: "Horse meme stampede",
    headline: "Just Horses becomes the internet's weird obsession of the week",
    body: "One viral clip led to millions of new viewers, countless horse puns, and several investors making decisions they may later need to explain.",
    effects: [
      { ticker: "JHS", percentChange: 24 },
      { ticker: "WW", percentChange: 3 }
    ]
  }
];

const refs = {
  marketStatusPanel: document.getElementById("market-status-panel"),
  authSection: document.getElementById("auth-section"),
  sessionBar: document.getElementById("session-bar"),
  studentMarketDeck: document.getElementById("student-market-deck"),
  ipoWaveBanner: document.getElementById("ipo-wave-banner"),
  studentView: document.getElementById("student-view"),
  teacherView: document.getElementById("teacher-view"),
  studentNameHeading: document.getElementById("student-name-heading"),
  portfolioSummary: document.getElementById("portfolio-summary"),
  watchlistPanel: document.getElementById("watchlist-panel"),
  researchPanel: document.getElementById("research-panel"),
  lotteryPanel: document.getElementById("lottery-panel"),
  lobbyPanel: document.getElementById("lobby-panel"),
  shadyTipPanel: document.getElementById("shady-tip-panel"),
  badgePanel: document.getElementById("badge-panel"),
  transactionsList: document.getElementById("transactions-list"),
  teacherSummary: document.getElementById("teacher-summary"),
  teacherControls: document.getElementById("teacher-controls"),
  teacherSettingsForm: document.getElementById("teacher-settings-form"),
  resetTools: document.getElementById("reset-tools"),
  eventPresets: document.getElementById("event-presets"),
  studentRoster: document.getElementById("student-roster"),
  teacherTrades: document.getElementById("teacher-trades"),
  teacherBadgeTracker: document.getElementById("teacher-badge-tracker"),
  companyEditor: document.getElementById("company-editor"),
  eventEffects: document.getElementById("event-effects"),
  eventSummary: document.getElementById("event-summary"),
  tickerBar: document.getElementById("ticker-bar"),
  companiesToolbar: document.getElementById("companies-toolbar"),
  marketMovers: document.getElementById("market-movers"),
  companiesGrid: document.getElementById("companies-grid"),
  leaderboard: document.getElementById("leaderboard"),
  eventsFeed: document.getElementById("events-feed"),
  toast: document.getElementById("toast"),
  floatingTooltip: document.getElementById("floating-tooltip"),
  researchModal: document.getElementById("research-modal"),
  researchModalBody: document.getElementById("research-modal-body"),
  researchModalTitle: document.getElementById("research-modal-title"),
  lotteryModal: document.getElementById("lottery-modal"),
  lotteryModalBody: document.getElementById("lottery-modal-body"),
  lotteryModalTitle: document.getElementById("lottery-modal-title"),
  lobbyModal: document.getElementById("lobby-modal"),
  lobbyModalBody: document.getElementById("lobby-modal-body"),
  lobbyModalTitle: document.getElementById("lobby-modal-title"),
  eventModal: document.getElementById("event-modal"),
  eventModalBody: document.getElementById("event-modal-body"),
  eventModalTitle: document.getElementById("event-modal-title"),
  registerForm: document.getElementById("student-register-form"),
  studentLoginForm: document.getElementById("student-login-form"),
  teacherLoginForm: document.getElementById("teacher-login-form"),
  eventForm: document.getElementById("event-form")
};

refs.registerForm.addEventListener("submit", (event) => handleAuth(event, "/api/register"));
refs.studentLoginForm.addEventListener("submit", (event) => handleAuth(event, "/api/login"));
refs.teacherLoginForm.addEventListener("submit", handleTeacherLogin);
refs.teacherSettingsForm.addEventListener("submit", handleTeacherSettingsSubmit);
refs.eventForm.addEventListener("submit", handleEventSubmit);
refs.eventForm.addEventListener("input", handleEventFormChange);
refs.eventForm.addEventListener("change", handleEventFormChange);
refs.eventPresets?.addEventListener("click", handleEventPresetClick);
refs.studentRoster.addEventListener("click", handleStudentRosterClick);
refs.studentRoster.addEventListener("submit", handleStudentRosterSubmit);
refs.resetTools.addEventListener("click", handleResetClick);
refs.companyEditor.addEventListener("submit", handleCompanyEditorSubmit);
refs.companiesToolbar.addEventListener("input", handleCompanyToolbarChange);
refs.companiesToolbar.addEventListener("change", handleCompanyToolbarChange);
refs.companiesGrid.addEventListener("click", handleCompanySelection);
refs.watchlistPanel.addEventListener("click", handleWatchlistPanelClick);
refs.ipoWaveBanner?.addEventListener("click", handleIpoWaveBannerClick);
refs.researchPanel.addEventListener("click", handleResearchPanelClick);
refs.lotteryPanel.addEventListener("click", handleLotteryPanelClick);
refs.lobbyPanel.addEventListener("click", handleLobbyPanelClick);
refs.shadyTipPanel.addEventListener("click", handleShadyTipPanelClick);
refs.researchModal.addEventListener("click", handleResearchModalClick);
refs.lotteryModal.addEventListener("click", handleLotteryModalClick);
refs.lobbyModal.addEventListener("click", handleLobbyModalClick);
refs.eventModal.addEventListener("click", handleEventModalClick);
document.addEventListener("mouseover", handleTooltipPointerEnter);
document.addEventListener("mousemove", handleTooltipPointerMove);
document.addEventListener("mouseout", handleTooltipPointerLeave);
document.addEventListener("focusin", handleTooltipFocusIn);
document.addEventListener("focusout", handleTooltipFocusOut);
window.addEventListener("resize", updateCompanyScrollIndicator);
window.addEventListener("scroll", hideFloatingTooltip, { passive: true });

bootstrap();
setInterval(async () => {
  if (shouldPauseBackgroundRefresh()) {
    return;
  }
  await bootstrap();
}, 15000);

async function bootstrap() {
  const response = await fetch("/api/bootstrap");
  const data = await response.json();
  state.data = data;
  render();
}

function shouldPauseBackgroundRefresh() {
  if (state.ui.authPending) {
    return true;
  }

  const activeElement = document.activeElement;
  if (!activeElement || !refs.authSection) {
    return false;
  }

  return refs.authSection.contains(activeElement);
}

function setAuthPending(isPending) {
  state.ui.authPending = isPending;

  refs.authSection.querySelectorAll("input, textarea, select, button").forEach((element) => {
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
  payload.startingCash = Number(payload.startingCash);
  const ok = await postJson("/api/admin/settings", payload);
  if (ok) {
    form.elements.currentPassword.value = "";
    form.elements.newPassword.value = "";
  }
}

async function handleEventSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const effects = (state.data?.companies || [])
    .map((company) => ({
      ticker: company.ticker,
      percentChange: Number(formData.get(`effect_${company.ticker}`))
    }))
    .filter((effect) => Number.isFinite(effect.percentChange) && effect.percentChange !== 0);

  const ok = await postJson("/api/admin/event", {
    headline: formData.get("headline"),
    body: formData.get("body"),
    isBigStory: formData.get("isBigStory") === "on",
    effects
  });

  if (ok) {
    form.reset();
    state.ui.eventDraft = {
      headline: "",
      body: "",
      isBigStory: false,
      effects: {}
    };
  }
}

function handleEventPresetClick(event) {
  const button = event.target.closest("button[data-preset-id]");
  if (!button) {
    return;
  }

  const preset = EVENT_PRESETS.find((entry) => entry.id === button.dataset.presetId);
  if (!preset) {
    return;
  }

  const companyTickers = new Set((state.data?.companies || []).map((company) => company.ticker));
  const effectsByTicker = new Map(
    preset.effects.filter((effect) => companyTickers.has(effect.ticker)).map((effect) => [effect.ticker, effect.percentChange])
  );

  state.ui.eventDraft = {
    headline: preset.headline,
    body: preset.body,
    isBigStory: false,
    effects: Object.fromEntries((state.data?.companies || []).map((company) => [company.ticker, effectsByTicker.get(company.ticker) ?? 0]))
  };

  refs.eventForm.elements.headline.value = preset.headline;
  refs.eventForm.elements.body.value = preset.body;
  refs.eventForm.elements.isBigStory.checked = false;
  (state.data?.companies || []).forEach((company) => {
    const input = refs.eventForm.elements[`effect_${company.ticker}`];
    if (input) {
      input.value = effectsByTicker.get(company.ticker) ?? 0;
    }
  });

  showToast(`Loaded preset: ${preset.label}`);
  renderTeacherEventSummary();
}

function handleCompanyToolbarChange(event) {
  const target = event.target;
  if (target.name === "companySearch") {
    state.ui.companySearch = target.value;
  }
  if (target.name === "volatilityFilter") {
    state.ui.volatilityFilter = target.value;
  }
  if (target.name === "industryFilter") {
    state.ui.industryFilter = target.value;
  }
  renderCompanies();
}

function handleEventFormChange() {
  state.ui.eventDraft = {
    headline: String(refs.eventForm.elements.headline?.value || ""),
    body: String(refs.eventForm.elements.body?.value || ""),
    isBigStory: Boolean(refs.eventForm.elements.isBigStory?.checked),
    effects: Object.fromEntries(
      (state.data?.companies || []).map((company) => [
        company.ticker,
        Number(refs.eventForm.elements[`effect_${company.ticker}`]?.value || 0)
      ])
    )
  };
  renderTeacherEventSummary();
}

function handleEventModalClick(event) {
  if (!event.target.closest("[data-event-close]")) {
    return;
  }

  dismissActiveEventModal();
}

function handleCompanySelection(event) {
  const watchButton = event.target.closest("button[data-watch-toggle]");
  if (watchButton) {
    handleWatchToggle(watchButton);
    return;
  }

  const button = event.target.closest("button[data-company-select]");
  if (!button) {
    return;
  }

  const companyList = refs.companiesGrid.querySelector(".company-list");
  if (companyList) {
    state.ui.companyListScrollTop = companyList.scrollTop;
  }

  state.ui.selectedCompanyTicker = button.dataset.companySelect;
  refreshCompanySelectionView();
}

function handleWatchlistPanelClick(event) {
  const watchButton = event.target.closest("button[data-watch-toggle]");
  if (watchButton) {
    handleWatchToggle(watchButton);
    return;
  }

  const button = event.target.closest("button[data-company-focus]");
  if (!button) {
    return;
  }

  state.ui.selectedCompanyTicker = button.dataset.companyFocus;
  renderCompanies();
  document.getElementById("companies-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleIpoWaveBannerClick(event) {
  const button = event.target.closest("button[data-company-focus]");
  if (!button) {
    return;
  }

  state.ui.selectedCompanyTicker = button.dataset.companyFocus;
  renderCompanies();
  document.getElementById("companies-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function handleWatchToggle(button) {
  const ticker = button.dataset.watchToggle;
  const watching = button.dataset.watching !== "true";
  await postJson("/api/watchlist", { ticker, watching });
}

async function handleShadyTipPanelClick(event) {
  const button = event.target.closest("button[data-shady-tip-action]");
  if (!button) {
    return;
  }

  if (button.dataset.shadyTipAction === "start") {
    await postJson("/api/shady-tip/start", {});
    return;
  }

  if (button.dataset.shadyTipAction === "guess" && button.dataset.guess) {
    await postJson("/api/shady-tip/guess", { guess: button.dataset.guess });
  }
}

async function handleResearchPanelClick(event) {
  const button = event.target.closest("button[data-research-action]");
  if (!button) {
    return;
  }

  const research = state.data?.user?.research;
  const action = button.dataset.researchAction;

  if (action === "open" && research?.activeRun) {
    openResearchModal("pick");
    return;
  }

  if (action === "start") {
    const response = await postJson("/api/research/start", {});
    if (response) {
      openResearchModal("pick");
    }
  }
}

async function handleResearchModalClick(event) {
  if (event.target.closest("[data-research-close]")) {
    closeResearchModal();
    return;
  }

  const button = event.target.closest("button[data-research-choice]");
  if (!button) {
    return;
  }

  const choice = Number(button.dataset.researchChoice);
  const response = await postJson("/api/research/pick", { choice });
  if (response?.researchResult) {
    openResearchModal("result", response.researchResult);
  }
}

async function handleLotteryPanelClick(event) {
  const button = event.target.closest("button[data-lottery-action]");
  if (!button) {
    return;
  }

  const lottery = state.data?.user?.lottery;
  const action = button.dataset.lotteryAction;

  if (action === "open" && lottery?.activeRun) {
    openLotteryModal("pick");
    return;
  }

  if (action === "start") {
    const response = await postJson("/api/lottery/start", {});
    if (response) {
      openLotteryModal("pick");
    }
  }
}

async function handleLotteryModalClick(event) {
  if (event.target.closest("[data-lottery-close]")) {
    closeLotteryModal();
    return;
  }

  const button = event.target.closest("button[data-lottery-choice]");
  if (!button) {
    return;
  }

  const choice = Number(button.dataset.lotteryChoice);
  const response = await postJson("/api/lottery/pick", { choice });
  if (response?.lotteryResult) {
    openLotteryModal("result", response.lotteryResult);
  }
}

async function handleLobbyPanelClick(event) {
  const button = event.target.closest("button[data-lobby-action]");
  if (!button) {
    return;
  }

  const lobby = state.data?.user?.lobby;
  const action = button.dataset.lobbyAction;

  if (action === "open" && lobby?.status === "in_progress") {
    openLobbyModal();
    return;
  }

  if (action === "start") {
    const select = refs.lobbyPanel.querySelector("select[name='lobbyTicker']");
    const response = await postJson("/api/lobby/start", { ticker: select?.value });
    if (response) {
      openLobbyModal();
    }
  }
}

async function handleLobbyModalClick(event) {
  if (event.target.closest("[data-lobby-close]")) {
    closeLobbyModal();
    return;
  }

  const button = event.target.closest("button[data-lobby-member]");
  if (!button) {
    return;
  }

  const response = await postJson("/api/lobby/pick", { memberId: button.dataset.lobbyMember });
  if (response?.lobbyResult) {
    openLobbyModal(response.lobbyResult);
  }
}

function openResearchModal(mode = "pick", result = null) {
  state.ui.researchModal = {
    open: true,
    mode,
    result
  };
  renderResearchModal();
}

function closeResearchModal() {
  state.ui.researchModal = {
    open: false,
    mode: "idle",
    result: null
  };
  renderResearchModal();
}

function openLotteryModal(mode = "pick", result = null) {
  state.ui.lotteryModal = {
    open: true,
    mode,
    result
  };
  renderLotteryModal();
}

function closeLotteryModal() {
  state.ui.lotteryModal = {
    open: false,
    mode: "idle",
    result: null
  };
  renderLotteryModal();
}

function openLobbyModal(result = null) {
  state.ui.lobbyModal = {
    open: true,
    result
  };
  renderLobbyModal();
}

function closeLobbyModal() {
  state.ui.lobbyModal = {
    open: false,
    result: null
  };
  renderLobbyModal();
}

function updateCompanyScrollIndicator() {
  const list = refs.companiesGrid.querySelector(".company-list");
  const indicator = refs.companiesGrid.querySelector(".company-scroll-indicator");
  const thumb = refs.companiesGrid.querySelector(".company-scroll-thumb");

  if (!list || !indicator || !thumb) {
    return;
  }

  state.ui.companyListScrollTop = list.scrollTop;

  const railHeight = indicator.clientHeight || list.clientHeight;
  const scrollHeight = list.scrollHeight;
  const clientHeight = list.clientHeight;
  const maxScroll = Math.max(0, scrollHeight - clientHeight);
  const hasOverflow = maxScroll > 0;

  indicator.classList.toggle("has-overflow", hasOverflow);

  if (!hasOverflow || railHeight <= 0) {
    thumb.style.height = `${Math.max(railHeight, 32)}px`;
    thumb.style.transform = "translateY(0)";
    return;
  }

  const thumbHeight = Math.max(42, Math.round((clientHeight / scrollHeight) * railHeight));
  const maxThumbTravel = Math.max(0, railHeight - thumbHeight);
  const thumbOffset = maxScroll ? Math.round((list.scrollTop / maxScroll) * maxThumbTravel) : 0;

  thumb.style.height = `${thumbHeight}px`;
  thumb.style.transform = `translateY(${thumbOffset}px)`;
}

async function handleLogout() {
  await postJson("/api/logout", {});
}

async function handleTrade(button) {
  const card = button.closest("[data-ticker]");
  const input = card.querySelector("input[name='shares']");
  const shares = Number(input.value);
  const side = button.dataset.side;
  const ticker = card.dataset.ticker;
  const ok = await postJson("/api/trade", { ticker, side, shares });
  if (ok) {
    input.value = "";
  }
}

async function toggleMarket(isOpen) {
  await postJson("/api/admin/market", { isOpen });
}

async function awardBadgeDay() {
  await postJson("/api/admin/badges/award", {});
}

async function handleStudentRosterClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const userId = button.dataset.userId;

  if (action === "reset") {
    const confirmed = window.confirm("Reset this student back to the starting cash amount and clear all trades?");
    if (!confirmed) {
      return;
    }
    await postJson("/api/admin/student/reset", { userId });
    return;
  }

  if (action === "delete") {
    const confirmed = window.confirm("Delete this student account completely? This cannot be undone.");
    if (!confirmed) {
      return;
    }
    await postJson("/api/admin/student/delete", { userId });
  }
}

async function handleStudentRosterSubmit(event) {
  const rewardForm = event.target.closest("form[data-reward-form]");
  if (rewardForm) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(rewardForm).entries());
    payload.amount = Number(payload.amount);
    const ok = await postJson("/api/admin/student/reward", payload);
    if (ok) {
      rewardForm.reset();
      showToast("Student reward added.");
    }
    return;
  }

  const form = event.target.closest("form[data-password-form]");
  if (!form) {
    return;
  }

  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());
  const ok = await postJson("/api/admin/student/password", payload);
  if (ok) {
    form.reset();
    showToast("Student password updated.");
  }
}

async function handleResetClick(event) {
  const button = event.target.closest("button[data-reset-scope]");
  if (!button) {
    return;
  }

  const scope = button.dataset.resetScope;
  const messages = {
    portfolios: "Reset every student portfolio back to the starting cash amount and clear all trades?",
    market: "Reset the market board, session count, news feed, and all stock prices back to starting values?",
    full: "Reset the entire game, remove all student accounts, and start fresh?"
  };

  if (!window.confirm(messages[scope] || "Are you sure?")) {
    return;
  }

  await postJson("/api/admin/reset", { scope });
}

async function handleCompanyEditorSubmit(event) {
  event.preventDefault();
  const form = event.target.closest("form[data-company-editor]");
  if (!form) {
    return;
  }

  const payload = Object.fromEntries(new FormData(form).entries());
  payload.startingPrice = Number(payload.startingPrice);
  payload.price = Number(payload.price);
  const ok = await postJson("/api/admin/company", payload);
  if (ok) {
    showToast(`${payload.ticker} updated.`);
  }
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
      showToast(data.error || "Something went wrong.");
      return false;
    }

    if (Object.prototype.hasOwnProperty.call(data, "user")) {
      state.data = data;
      render();
    } else {
      await bootstrap();
    }

    if (url !== "/api/logout" && !url.startsWith("/api/research/") && !url.startsWith("/api/lottery/") && !url.startsWith("/api/lobby/")) {
      showToast(data.message || "Updated.");
    }
    return data;
  } catch (error) {
    showToast("Could not reach the server. Please try again.");
    return false;
  }
}

function render() {
  if (!state.data) {
    return;
  }

  renderMarketStatus();
  renderSessionBar();
  renderAuthSection();
  renderStudentView();
  renderTeacherView();
  renderCompanies();
  renderLeaderboard();
  renderEvents();
  syncStudentEventModal();
  renderResearchModal();
  renderLotteryModal();
  renderLobbyModal();
}

function renderAuthSection() {
  if (state.data.user || state.data.isAdmin) {
    refs.authSection.classList.add("hidden");
    return;
  }

  refs.authSection.classList.remove("hidden");
}

function renderMarketStatus() {
  const { market, leaderboard } = state.data;
  refs.marketStatusPanel.innerHTML = `
    <div class="market-box">
      <div class="stats-row">
        <span class="market-pill ${market.isOpen ? "open" : "closed"}">${market.isOpen ? "Market Open" : "Market Closed"}</span>
        <span class="role-pill ${state.data.isAdmin ? "teacher" : state.data.user ? "student" : "guest"}">
          ${state.data.isAdmin ? "Teacher Session" : state.data.user ? "Student Session" : "Guest View"}
        </span>
      </div>
      <div class="stats-row">
        <div class="mini-stat">
          <span>Class Sessions</span>
          <strong>${market.sessionNumber}</strong>
        </div>
        <div class="mini-stat">
          <span>Students Playing</span>
          <strong>${leaderboard.length}</strong>
        </div>
        <div class="mini-stat">
          <span>Last Opened</span>
          <strong>${market.lastOpenedAt ? formatDate(market.lastOpenedAt) : "Not yet"}</strong>
        </div>
      </div>
      <p class="note">
        Students can always research the fake companies, but they can only buy or sell while the market is open.
      </p>
    </div>
  `;
}

function renderSessionBar() {
  const { user, isAdmin, market } = state.data;
  if (!user && !isAdmin) {
    refs.sessionBar.classList.add("hidden");
    refs.sessionBar.innerHTML = "";
    return;
  }

  refs.sessionBar.classList.remove("hidden");
  refs.sessionBar.innerHTML = `
    <div>
      <strong>${isAdmin ? "Teacher controls unlocked" : `Welcome back, ${escapeHtml(user.displayName)}`}</strong>
      <span> ${market.isOpen ? "Trading is live now." : "Market is closed until the next class session opens."}</span>
    </div>
    <button class="subtle" id="logout-button">Logout</button>
  `;
  document.getElementById("logout-button").addEventListener("click", handleLogout);
}

function renderStudentView() {
  const user = state.data.user;
  if (!user || state.data.isAdmin) {
    refs.studentMarketDeck.classList.add("hidden");
    refs.ipoWaveBanner?.classList.add("hidden");
    if (refs.ipoWaveBanner) {
      refs.ipoWaveBanner.innerHTML = "";
    }
    refs.studentView.classList.add("hidden");
    return;
  }

  refs.studentMarketDeck.classList.remove("hidden");
  refs.studentView.classList.remove("hidden");
  refs.studentNameHeading.textContent = `${user.displayName}'s Portfolio`;
  const leaderboardEntry = state.data.leaderboard.find((entry) => entry.id === user.id) || null;
  const companiesByTicker = new Map(state.data.companies.map((company) => [company.ticker, company]));
  const startingCash = Number(state.data.rules?.startingCash || 10000);
  const investedValue = roundMoney(user.totalValue - user.cash);
  const gainLoss = roundMoney(user.totalValue - startingCash);
  const gainLossClass = gainLoss > 0 ? "price-up" : gainLoss < 0 ? "price-down" : "";
  const gainLossLabel = gainLoss === 0 ? "Even" : `${gainLoss > 0 ? "+" : ""}${formatMoney(gainLoss)}`;
  const topPosition = user.positions[0] || null;
  const lastTrade = user.transactions[0] || null;
  const marketMessage = state.data.market.isOpen ? "Trading window is live" : "Research mode only";
  const marketPillClass = state.data.market.isOpen ? "open" : "closed";
  const positionsTotal = user.positions.reduce((sum, position) => sum + position.marketValue, 0);

  const positions = user.positions.length
    ? `<div class="positions-list">${user.positions
        .map(
          (position) => {
            const ownershipShare = positionsTotal ? Math.max(6, Math.round((position.marketValue / positionsTotal) * 100)) : 0;
            return `
            <div class="position-row position-card">
              <div>
                <strong>${escapeHtml(position.name)}</strong>
                <div class="event-tag">${position.ticker} • ${position.shares} shares</div>
              </div>
              <div>
                <div>${formatMoney(position.marketValue)}</div>
                <span>${formatMoney(position.price)} per share</span>
              </div>
              <div class="position-meter">
                <div class="position-meter-fill" style="width: ${ownershipShare}%"></div>
              </div>
            </div>
          `;
          }
        )
        .join("")}</div>`
    : `<div class="empty-state">No stocks owned yet. When the market opens, you can start building a portfolio.</div>`;

  refs.portfolioSummary.innerHTML = `
    <div class="student-snapshot-grid">
      <article class="student-hero-stat">
        <span class="eyebrow">Portfolio Value</span>
        <strong class="money">${formatMoney(user.totalValue)}</strong>
        <div class="student-hero-meta">
          <span class="${gainLossClass}">${gainLossLabel} vs start</span>
          <span class="market-pill ${marketPillClass}">${marketMessage}</span>
        </div>
      </article>
      <div class="student-mini-grid">
        <div class="mini-stat student-mini-stat">
          <span>Leaderboard Rank</span>
          <strong>${leaderboardEntry ? `#${leaderboardEntry.rank}` : "-"}</strong>
        </div>
        <div class="mini-stat student-mini-stat">
          <span>Cash Ready</span>
          <strong>${formatMoney(user.cash)}</strong>
        </div>
        <div class="mini-stat student-mini-stat">
          <span>Money in Stocks</span>
          <strong>${formatMoney(investedValue)}</strong>
        </div>
        <div class="mini-stat student-mini-stat">
          <span>Watching</span>
          <strong>${user.watchlist.length}/10</strong>
        </div>
        <div class="mini-stat student-mini-stat">
          <span>Top Position</span>
          <strong>${topPosition ? topPosition.ticker : "None"}</strong>
        </div>
        <div class="mini-stat student-mini-stat">
          <span>Last Trade</span>
          <strong>${lastTrade ? `${lastTrade.side.toUpperCase()} ${lastTrade.ticker}` : "Not yet"}</strong>
        </div>
      </div>
    </div>
    <div class="student-section-head">
      <div>
        <p class="eyebrow">Holdings</p>
        <h3>Current Positions</h3>
      </div>
      <div class="student-section-note">
        ${user.positions.length ? `${user.positions.length} active position${user.positions.length === 1 ? "" : "s"}` : "Ready to buy"}
      </div>
    </div>
    ${positions}
  `;

  refs.watchlistPanel.innerHTML = user.watchlist.length
    ? `<div class="watchlist-grid">${user.watchlist
        .map((item) => {
          const company = companiesByTicker.get(item.ticker);
          const previousPrice = company?.history?.[1]?.price ?? item.startingPrice;
          const delta = roundMoney(item.price - previousPrice);
          return `
            <div class="watchlist-row">
              <button type="button" class="watchlist-focus" data-company-focus="${item.ticker}">
                <div>
                  <strong>${escapeHtml(item.name)}</strong>
                  <div class="company-summary-subtitle">
                    <span class="ticker">${item.ticker}</span>
                    <span>${escapeHtml(item.industry)}</span>
                  </div>
                </div>
                <div class="company-list-price">
                  <div>${formatMoney(item.price)}</div>
                  <span class="${delta > 0 ? "price-up" : delta < 0 ? "price-down" : ""}">
                    ${delta === 0 ? "No change" : `${delta > 0 ? "+" : ""}${formatMoney(delta)}`}
                  </span>
                </div>
              </button>
              <button
                type="button"
                class="watch-toggle watching"
                data-watch-toggle="${item.ticker}"
                data-watching="true"
                aria-label="Remove ${escapeAttribute(item.name)} from watchlist"
                title="Remove from watchlist"
              >&#9733;</button>
            </div>
          `;
        })
        .join("")}</div>`
    : `<div class="empty-state">Star up to 10 companies to build a quick watchlist for class. Use the gold star on any company card to save it here.</div>`;

  refs.researchPanel.innerHTML = buildResearchPanel(user.research);
  renderIpoWaveBanner(user.ipo);
  refs.lotteryPanel.innerHTML = buildLotteryPanel(user.lottery);
  refs.lobbyPanel.innerHTML = buildLobbyPanel(user.lobby);
  refs.shadyTipPanel.innerHTML = buildShadyTipPanel(user.shadyTip);
  refs.badgePanel.innerHTML = buildBadgeBoard(user.badges || []);
  renderTickerBar();

  refs.transactionsList.innerHTML = user.transactions.length
    ? `<div class="student-section-head compact-panel-head">
        <div>
          <p class="eyebrow">Recent Activity</p>
          <h3>Trade History</h3>
        </div>
        <div class="student-section-note">Last ${Math.min(user.transactions.length, 15)} trades</div>
      </div>
      <div class="transactions">${user.transactions
        .map(
          (transaction) => `
            <div class="transaction-row">
              <div>
                <strong>${transaction.side.toUpperCase()} ${transaction.ticker}</strong>
                <div class="event-tag">${formatDate(transaction.timestamp)}</div>
              </div>
              <div>
                <div>${transaction.shares} shares at ${formatMoney(transaction.price)}</div>
                <strong>${formatMoney(transaction.total)}</strong>
              </div>
            </div>
          `
        )
        .join("")}</div>`
      : `<div class="empty-state">Trades will appear here after the first market session.</div>`;
}

function renderIpoWaveBanner(ipo) {
  if (!refs.ipoWaveBanner) {
    return;
  }

  if (!ipo?.active) {
    refs.ipoWaveBanner.classList.add("hidden");
    refs.ipoWaveBanner.innerHTML = "";
    return;
  }

  const breakoutLine = ipo.breakoutApplied
    ? `<div class="ipo-wave-callout success">Winner revealed: <strong>${escapeHtml(ipo.breakoutTicker)}</strong> just launched <strong>+${ipo.breakoutPercent}%</strong>.</div>`
    : `<div class="ipo-wave-callout">One of these three IPOs will break out in about <strong>${Math.max(1, Math.ceil((ipo.secondsUntilBreakout || 0) / 60))} minute${Math.ceil((ipo.secondsUntilBreakout || 0) / 60) === 1 ? "" : "s"}</strong>.</div>`;

  const choiceLine = ipo.chosenTicker
    ? `<div class="student-section-note">Your IPO pick for this wave is <strong>${escapeHtml(ipo.chosenTicker)}</strong>. You can still trade it, but the other two are locked for this wave.</div>`
    : `<div class="student-section-note">Your first IPO buy locks your pick for this wave. Choose carefully.</div>`;

  refs.ipoWaveBanner.classList.remove("hidden");
  refs.ipoWaveBanner.innerHTML = `
    <div class="card lift ipo-wave-shell">
      <div class="ipo-wave-head">
        <div>
          <p class="eyebrow">Limited-Time IPO Wave</p>
          <h2>${escapeHtml(ipo.title || ipo.label)}</h2>
          <div class="student-section-note">${escapeHtml(ipo.label)} is live right now with 3 fresh listings.</div>
        </div>
        <span class="event-tag">${ipo.chosenTicker ? `Locked: ${escapeHtml(ipo.chosenTicker)}` : "Pick 1 of 3"}</span>
      </div>
      ${breakoutLine}
      <div class="ipo-wave-grid">
        ${ipo.entrants.map((company) => `
          <article class="ipo-card ${ipo.chosenTicker === company.ticker ? "chosen" : ""} ${ipo.breakoutApplied && ipo.breakoutTicker === company.ticker ? "winner" : ""}">
            <div class="ipo-card-top">
              <div>
                <strong>${escapeHtml(company.name)}</strong>
                <div class="company-summary-subtitle">
                  <span class="ticker">${company.ticker}</span>
                  <span>${escapeHtml(company.industry)}</span>
                </div>
              </div>
              <div class="ipo-card-price">
                <div>${formatMoney(company.price)}</div>
                <span>${escapeHtml(company.volatility)} Risk</span>
              </div>
            </div>
            <button type="button" class="secondary" data-company-focus="${company.ticker}">
              ${ipo.chosenTicker === company.ticker ? "Focus Your Pick" : "View on Trade Board"}
            </button>
          </article>
        `).join("")}
      </div>
      ${choiceLine}
    </div>
  `;
}

function renderTickerBar() {
  if (!state.data?.user || state.data.isAdmin) {
    refs.tickerBar.classList.add("hidden");
    refs.tickerBar.innerHTML = "";
    return;
  }

  const movers = state.data.companies
    .map((company) => {
      const previousPrice = company.history[1]?.price ?? company.startingPrice;
      const delta = roundMoney(company.price - previousPrice);
      const percent = previousPrice ? roundMoney((delta / previousPrice) * 100) : 0;
      return { ticker: company.ticker, price: company.price, delta, percent };
    })
    .sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent))
    .slice(0, 8);

  const liveTrades = (state.data.liveTrades || []).slice(0, 10);

  const moverItems = movers.length
    ? movers.map((entry) => `
        <span class="ticker-chip ${entry.delta > 0 ? "up" : entry.delta < 0 ? "down" : "neutral"}">
          <strong>${entry.ticker}</strong>
          <span>${formatMoney(entry.price)}</span>
          <span>${entry.delta > 0 ? "+" : ""}${entry.percent}%</span>
        </span>
      `).join("")
    : `<span class="ticker-chip neutral"><strong>Market</strong><span>Waiting for movers</span></span>`;

  const tradeItems = liveTrades.length
    ? liveTrades.map((trade) => `
        <span class="ticker-chip trade">
          <strong>${escapeHtml(trade.studentName)}</strong>
          <span>${trade.side === "buy" ? "bought" : "sold"} ${trade.shares} ${trade.ticker}</span>
        </span>
      `).join("")
    : `<span class="ticker-chip neutral"><strong>Class Feed</strong><span>Trades will start rolling once students jump in.</span></span>`;

  refs.tickerBar.classList.remove("hidden");
  refs.tickerBar.innerHTML = `
    <div class="ticker-shell">
      <div class="ticker-row">
        <div class="ticker-label">Market Movers</div>
        <div class="ticker-track-wrap">
          <div class="ticker-track">
            <div class="ticker-stream">${moverItems}</div>
            <div class="ticker-stream" aria-hidden="true">${moverItems}</div>
          </div>
        </div>
      </div>
      <div class="ticker-row ticker-row-secondary">
        <div class="ticker-label">Live Trades</div>
        <div class="ticker-track-wrap">
          <div class="ticker-track reverse">
            <div class="ticker-stream">${tradeItems}</div>
            <div class="ticker-stream" aria-hidden="true">${tradeItems}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderTeacherView() {
  if (!state.data.isAdmin || !state.data.admin) {
    refs.teacherView.classList.add("hidden");
    return;
  }

  refs.teacherView.classList.remove("hidden");

  const { admin, market } = state.data;
  const topStudent = admin.metrics.topStudent;
  const tradeHighlights = state.data.tradeHighlights || { biggestWins: [], biggestLosses: [] };

  refs.teacherSummary.innerHTML = `
    <div class="stats-row">
      <div class="mini-stat">
        <span>Students</span>
        <strong>${admin.metrics.studentCount}</strong>
      </div>
      <div class="mini-stat">
        <span>Total Class Value</span>
        <strong>${formatMoney(admin.metrics.totalClassValue)}</strong>
      </div>
      <div class="mini-stat">
        <span>Total Trades</span>
        <strong>${admin.metrics.totalTrades}</strong>
      </div>
      <div class="mini-stat">
        <span>Badge Days</span>
        <strong>${admin.metrics.badgeDaysAwarded || 0}</strong>
      </div>
      <div class="mini-stat">
        <span>News Events</span>
        <strong>${admin.metrics.eventCount}</strong>
      </div>
    </div>
    <div class="empty-state">
      ${topStudent ? `<strong>Current Leader:</strong> ${escapeHtml(topStudent.displayName)} with ${formatMoney(topStudent.totalValue)}.` : "No students have joined yet."}
      ${market.isOpen ? " The market is currently live." : " The market is currently closed."}
    </div>
    <div class="teacher-highlight-shell">
      <div class="section-head compact">
        <div>
          <p class="eyebrow">Trade Highlights</p>
          <h3>Biggest Swings</h3>
        </div>
      </div>
      <div class="trade-highlight-grid teacher-highlight-grid">
        ${buildTradeHighlightColumn(
          "Biggest Winners",
          "Best Completed Trades",
          tradeHighlights.biggestWins,
          "As students lock in profits, the top three winning exits will appear here.",
          "win"
        )}
        ${buildTradeHighlightColumn(
          "Biggest Losses",
          "Toughest Lessons",
          tradeHighlights.biggestLosses,
          "No painful sell-offs yet. Once someone sells at a loss, the biggest misses will land here.",
          "loss"
        )}
      </div>
    </div>
  `;

  refs.teacherSettingsForm.elements.teacherUsername.value = admin.settings.teacherUsername;
  refs.teacherSettingsForm.elements.startingCash.value = admin.settings.startingCash;

  refs.teacherControls.innerHTML = `
    <div class="teacher-session-card">
      <div class="teacher-session-top">
        <div>
          <p class="eyebrow">Session ${market.sessionNumber || 0}</p>
          <h3>${market.isOpen ? "Market is live right now" : "Market is waiting for class"}</h3>
        </div>
        <span class="market-pill ${market.isOpen ? "open" : "closed"}">${market.isOpen ? "Open Now" : "Closed Now"}</span>
      </div>
      <div class="teacher-session-grid">
        <div class="mini-stat">
          <span>Next Move</span>
          <strong>${market.isOpen ? "Monitor trades + publish news" : "Open market for class"}</strong>
        </div>
        <div class="mini-stat">
          <span>Last Opened</span>
          <strong>${market.lastOpenedAt ? formatDate(market.lastOpenedAt) : "Not yet"}</strong>
        </div>
        <div class="mini-stat">
          <span>Last Closed</span>
          <strong>${market.lastClosedAt ? formatDate(market.lastClosedAt) : "Not yet"}</strong>
        </div>
        <div class="mini-stat">
          <span>Latest Badge Day</span>
          <strong>${admin.badgeDay?.cycleNumber ? `Day ${admin.badgeDay.cycleNumber}` : "None yet"}</strong>
        </div>
      </div>
      <div class="teacher-run-sheet">
        <div class="run-step ${market.isOpen ? "done" : "active"}">
          <strong>1. Open market</strong>
          <span>Start the class trading window.</span>
        </div>
        <div class="run-step ${market.isOpen ? "active" : ""}">
          <strong>2. Let students trade</strong>
          <span>Watch the feed, leaderboard, and publish news if you want to shake things up.</span>
        </div>
        <div class="run-step ${market.isOpen ? "" : "pending"}">
          <strong>3. Close market</strong>
          <span>Freeze the board until the next class session.</span>
        </div>
      </div>
      <div class="teacher-actions">
        <button ${market.isOpen ? "disabled" : ""} id="open-market-button">Open Market</button>
        <button class="secondary" ${market.isOpen ? "" : "disabled"} id="close-market-button">Close Market</button>
        <button class="subtle" id="award-badge-day-button">Award Badge Day ${((admin.badgeDay?.cycleNumber || 0) + 1)}</button>
      </div>
      <p class="note">Use badge days when both classes are done for the day. Each click snapshots the current winners and adds repeat counts to any badges they earn again.</p>
    </div>
  `;

  refs.resetTools.innerHTML = `
    <div class="section-head compact">
      <p class="eyebrow">Reset Tools</p>
      <h3>Classroom Cleanup</h3>
    </div>
    <div class="reset-grid">
      <button class="subtle" data-reset-scope="portfolios">Reset All Portfolios</button>
      <button class="subtle" data-reset-scope="market">Reset Market Board</button>
      <button data-reset-scope="full">Full Game Reset</button>
    </div>
    <p class="note">Use the smaller resets during the school year, and the full reset when you want to start with a brand new class.</p>
  `;

  refs.eventEffects.innerHTML = state.data.companies
    .map(
      (company) => `
        <div class="effect-row">
          <div>
            <strong>${escapeHtml(company.name)}</strong>
            <div class="event-tag">${company.ticker} • ${company.industry}</div>
          </div>
          <label>
            Price change %
            <input
              type="number"
              name="effect_${company.ticker}"
              step="1"
              value="${Number(state.ui.eventDraft.effects?.[company.ticker] || 0)}"
            />
          </label>
        </div>
      `
    )
    .join("");

  refs.eventForm.elements.headline.value = state.ui.eventDraft.headline || "";
  refs.eventForm.elements.body.value = state.ui.eventDraft.body || "";
  refs.eventForm.elements.isBigStory.checked = Boolean(state.ui.eventDraft.isBigStory);

  renderTeacherEventSummary();

  const openRosterIds = getOpenDetailIds(refs.studentRoster);
  const openBadgeTrackerIds = getOpenDetailIds(refs.teacherBadgeTracker);

  refs.studentRoster.innerHTML = admin.students.length
    ? `<div class="admin-list">${admin.students
        .map(
          (student) => `
            <details class="admin-card" data-user-id="${student.id}" ${openRosterIds.has(String(student.id)) ? "open" : ""}>
              <summary class="admin-summary">
                <div class="admin-summary-main">
                  <strong>${escapeHtml(student.displayName)}</strong>
                  <div class="event-tag">@${escapeHtml(student.username)}</div>
                </div>
                <div class="admin-summary-side">
                  <span class="admin-metric">${formatMoney(student.totalValue)}</span>
                  <span class="company-summary-toggle">Show Tools</span>
                </div>
              </summary>
              <div class="admin-body">
                <div>
                  <div class="event-tag">Joined ${formatDate(student.createdAt)}</div>
                  <div class="admin-subtext">${escapeHtml(student.positionsLabel)}</div>
                </div>
                <div class="admin-actions">
                  <div class="admin-subtext">Cash: ${formatMoney(student.cash)}</div>
                  <form class="reward-form" data-reward-form>
                    <input type="hidden" name="userId" value="${student.id}" />
                    <input name="amount" type="number" min="1" step="1" placeholder="Reward amount" required />
                    <button class="subtle" type="submit">Add Cash</button>
                  </form>
                  <form class="password-form" data-password-form>
                    <input type="hidden" name="userId" value="${student.id}" />
                    <input name="password" type="text" minlength="4" placeholder="New password" required />
                    <button class="subtle" type="submit">Reset Password</button>
                  </form>
                  <button class="subtle" data-action="reset" data-user-id="${student.id}">Reset Portfolio</button>
                  <button data-action="delete" data-user-id="${student.id}">Delete</button>
                </div>
              </div>
            </details>
          `
        )
        .join("")}</div>`
    : `<div class="empty-state">No student accounts yet. Once students register, you can reset or remove them from here.</div>`;

  refs.teacherTrades.innerHTML = admin.recentTrades.length
    ? `<div class="transactions">${admin.recentTrades
        .map(
          (trade) => `
            <div class="transaction-row">
              <div>
                <strong>${escapeHtml(trade.studentName)} • ${trade.side.toUpperCase()} ${trade.ticker}</strong>
                <div class="event-tag">@${escapeHtml(trade.username)} • ${formatDate(trade.timestamp)}</div>
              </div>
              <div>
                <div>${trade.shares} shares at ${formatMoney(trade.price)}</div>
                <strong>${formatMoney(trade.total)}</strong>
              </div>
            </div>
          `
        )
        .join("")}</div>`
    : `<div class="empty-state">Student trades will appear here as the class starts using the market.</div>`;

  refs.teacherBadgeTracker.innerHTML = admin.students.length
    ? `<div class="admin-list">${admin.students
        .map(
          (student) => `
            <details class="admin-card badge-tracker-card" data-user-id="${student.id}" ${openBadgeTrackerIds.has(String(student.id)) ? "open" : ""}>
              <summary class="admin-summary">
                <div class="admin-summary-main">
                  <strong>${escapeHtml(student.displayName)}</strong>
                  <div class="event-tag">@${escapeHtml(student.username)}</div>
                </div>
                <div class="admin-summary-side badge-tracker-summary">
                  <span class="admin-metric">${student.badgeTypes} badges</span>
                  <span class="admin-metric">${student.totalBadgeWins} wins</span>
                  <span class="company-summary-toggle">Show Badges</span>
                </div>
              </summary>
              <div class="admin-body badge-tracker-body">
                ${
                  student.badges.length
                    ? `
                      <div class="badge-tracker-meta">
                        <span class="event-tag">Latest badge day: ${student.latestBadgeDayNumber ? `Day ${student.latestBadgeDayNumber}` : "None yet"}</span>
                        ${student.winsToday ? `<span class="badge-tag">+${student.winsToday} today</span>` : ""}
                      </div>
                      <div class="badge-chip-grid">
                        ${student.badges
                          .map(
                            (badge) => `
                              <div class="badge-chip ${badge.wonToday ? "today" : ""}">
                                <span class="badge-title" tabindex="0" data-tooltip="${escapeAttribute(badge.description)}">${escapeHtml(badge.label)}</span>
                                <span>Won ${badge.count} time${badge.count === 1 ? "" : "s"}</span>
                              </div>
                            `
                          )
                          .join("")}
                      </div>
                    `
                    : `<div class="empty-state">No badges awarded yet. After the next Badge Day, this student’s trophy case will fill in.</div>`
                }
              </div>
            </details>
          `
        )
        .join("")}</div>`
    : `<div class="empty-state">No student accounts yet. Once students register, their badge tracker will appear here.</div>`;

  refs.companyEditor.innerHTML = state.data.companies
    .map(
      (company) => `
        <form class="company-edit-card" data-company-editor data-ticker="${company.ticker}">
          <div class="company-top">
            <div>
              <h3>${escapeHtml(company.name)}</h3>
              <span class="ticker">${company.ticker}</span>
            </div>
            <button type="submit" class="secondary">Save Company</button>
          </div>
          <input type="hidden" name="ticker" value="${company.ticker}" />
          <div class="editor-grid">
            <label>
              Company Name
              <input name="name" type="text" value="${escapeAttribute(company.name)}" required />
            </label>
            <label>
              Industry
              <input name="industry" type="text" value="${escapeAttribute(company.industry)}" required />
            </label>
            <label>
              Starting Price
              <input name="startingPrice" type="number" min="0.01" step="0.01" value="${company.startingPrice}" required />
            </label>
            <label>
              Current Price
              <input name="price" type="number" min="0.01" step="0.01" value="${company.price}" required />
            </label>
            <label>
              Volatility
              <select name="volatility">
                ${["Low", "Medium", "High", "Extreme"]
                  .map((level) => `<option value="${level}" ${company.volatility === level ? "selected" : ""}>${level}</option>`)
                  .join("")}
              </select>
            </label>
          </div>
          <label>
            Bio
            <textarea name="bio" rows="3" required>${escapeHtml(company.bio)}</textarea>
          </label>
          <div class="editor-grid">
            <label>
              Pros
              <textarea name="pros" rows="4" placeholder="One per line">${escapeHtml(company.pros.join("\n"))}</textarea>
            </label>
            <label>
              Cons
              <textarea name="cons" rows="4" placeholder="One per line">${escapeHtml(company.cons.join("\n"))}</textarea>
            </label>
          </div>
        </form>
      `
    )
    .join("");

  document.getElementById("open-market-button")?.addEventListener("click", () => toggleMarket(true));
  document.getElementById("close-market-button")?.addEventListener("click", () => toggleMarket(false));
  document.getElementById("award-badge-day-button")?.addEventListener("click", awardBadgeDay);
}

function getOpenDetailIds(container) {
  if (!container) {
    return new Set();
  }

  return new Set(
    Array.from(container.querySelectorAll("details[open][data-user-id]"))
      .map((element) => element.dataset.userId)
      .filter(Boolean)
  );
}

function renderTeacherEventSummary() {
  if (!state.data?.isAdmin || !refs.eventSummary) {
    return;
  }

  const effects = (state.data.companies || [])
    .map((company) => {
      const input = refs.eventForm.elements[`effect_${company.ticker}`];
      const percentChange = Number(input?.value || 0);
      return Number.isFinite(percentChange) && percentChange !== 0
        ? { ticker: company.ticker, percentChange }
        : null;
    })
    .filter(Boolean);

  const headline = String(refs.eventForm.elements.headline?.value || "").trim();
  const publishButton = document.getElementById("publish-event-button");
  const isBigStory = Boolean(refs.eventForm.elements.isBigStory?.checked);

  if (publishButton) {
    publishButton.textContent = effects.length
      ? `${isBigStory ? "Publish Big Story" : "Publish Event"} for ${effects.length} Stock${effects.length === 1 ? "" : "s"}`
      : isBigStory ? "Publish Big Story" : "Publish Event";
  }

  const bodyText = String(refs.eventForm.elements.body?.value || "").trim();

  refs.eventSummary.innerHTML = effects.length
    ? `
      <div class="teacher-event-preview">
        <div class="teacher-event-preview-head">
          <div>
            <p class="eyebrow">Event Preview</p>
            <h3>${headline ? escapeHtml(headline) : "Headline still needed"}</h3>
            ${isBigStory ? `<div class="event-tag big-story-tag">RAM Financial Report graphic enabled</div>` : ""}
          </div>
          <div class="student-section-note">${effects.length} company impact${effects.length === 1 ? "" : "s"}</div>
        </div>
        <div class="event-effect-list">
          ${effects
            .map(
              (effect) => `
                <span class="event-tag ${effect.percentChange > 0 ? "preview-up" : "preview-down"}">
                  ${effect.ticker} ${effect.percentChange > 0 ? "+" : ""}${effect.percentChange}%
                </span>
              `
            )
            .join("")}
        </div>
      </div>
    `
    : headline || bodyText
      ? `
        <div class="teacher-event-preview">
          <div class="teacher-event-preview-head">
            <div>
              <p class="eyebrow">News-Only Event</p>
              <h3>${headline ? escapeHtml(headline) : "Headline still needed"}</h3>
              ${isBigStory ? `<div class="event-tag big-story-tag">RAM Financial Report graphic enabled</div>` : ""}
            </div>
            <div class="student-section-note">No price changes</div>
          </div>
          <p class="admin-subtext">This update will appear in the student news feed without changing any stock prices.</p>
        </div>
      `
      : `<div class="empty-state">Add a headline to post classroom news, and include stock changes only when you want prices to move.</div>`;
}

function getFilteredCompanies() {
  return state.data.companies.filter((company) => {
    const search = state.ui.companySearch.trim().toLowerCase();
    const matchesSearch =
      !search ||
      company.name.toLowerCase().includes(search) ||
      company.ticker.toLowerCase().includes(search) ||
      company.industry.toLowerCase().includes(search);
    const matchesVolatility =
      state.ui.volatilityFilter === "all" || company.volatility === state.ui.volatilityFilter;
    const matchesIndustry =
      state.ui.industryFilter === "all" || company.industry === state.ui.industryFilter;
    return matchesSearch && matchesVolatility && matchesIndustry;
  });
}

function buildCompanyDetailCard(selectedCompany, isWatchingSelected) {
  const previousPrice = selectedCompany.history[1]?.price ?? selectedCompany.startingPrice;
  const delta = roundMoney(selectedCompany.price - previousPrice);
  const deltaClass = delta > 0 ? "price-up" : delta < 0 ? "price-down" : "";
  const deltaLabel = delta === 0 ? "No change" : `${delta > 0 ? "+" : ""}${formatMoney(delta)}`;

  let footer = `<div class="empty-state">Log in as a student to trade this stock during the market window.</div>`;
  if (state.data.user) {
    const tradeFrozen = Boolean(state.data.user.lobby?.tradeFrozen);
    const canTrade = state.data.market.isOpen && !tradeFrozen;
    footer = `
      <div class="trade-controls">
        <input name="shares" type="number" min="1" step="1" placeholder="Shares" ${canTrade ? "" : "disabled"} />
        <button data-side="buy" ${canTrade ? "" : "disabled"}>Buy</button>
        <button class="secondary" data-side="sell" ${canTrade ? "" : "disabled"}>Sell</button>
      </div>
      ${tradeFrozen ? `<div class="student-section-note">Compliance Review is active, so trading is frozen for now.</div>` : ""}
    `;
  } else if (state.data.isAdmin) {
    footer = `<div class="empty-state">Teacher mode: edit this company in the Company Editor above.</div>`;
  }

  return `
    <article class="company-card company-detail-card" data-ticker="${selectedCompany.ticker}">
      <div class="company-top">
        <div>
          <h3>${escapeHtml(selectedCompany.name)}</h3>
          <div class="company-summary-subtitle">
            <span class="ticker">${selectedCompany.ticker}</span>
            <span>${escapeHtml(selectedCompany.industry)}</span>
            <span class="vol-pill">${selectedCompany.volatility} Volatility</span>
          </div>
        </div>
        <div class="company-summary-price">
          ${
            state.data.user
              ? `
                <button
                  type="button"
                  class="watch-toggle detail-watch-toggle ${isWatchingSelected ? "watching" : ""}"
                  data-watch-toggle="${selectedCompany.ticker}"
                  data-watching="${isWatchingSelected ? "true" : "false"}"
                  aria-label="${isWatchingSelected ? "Remove" : "Add"} ${escapeAttribute(selectedCompany.name)} ${isWatchingSelected ? "from" : "to"} watchlist"
                  title="${isWatchingSelected ? "Remove from watchlist" : "Add to watchlist"}"
                >${isWatchingSelected ? "&#9733; Watching" : "&#9734; Watchlist"}</button>
              `
              : ""
          }
          <div class="money">${formatMoney(selectedCompany.price)}</div>
          <div class="${deltaClass}">${deltaLabel}</div>
        </div>
      </div>
      <div class="company-meta">
        <span>${escapeHtml(selectedCompany.industry)}</span>
        <span class="vol-pill">${selectedCompany.volatility} Volatility</span>
        <span>Start: ${formatMoney(selectedCompany.startingPrice)}</span>
      </div>
      <p>${escapeHtml(selectedCompany.bio)}</p>
      <div class="pros-cons">
        <div>
          <strong>Pros</strong>
          <span>${selectedCompany.pros.map(escapeHtml).join(", ")}</span>
        </div>
        <div>
          <strong>Cons</strong>
          <span>${selectedCompany.cons.map(escapeHtml).join(", ")}</span>
        </div>
      </div>
      ${footer}
    </article>
  `;
}

function refreshCompanySelectionView() {
  const filteredCompanies = getFilteredCompanies();
  if (!filteredCompanies.length) {
    renderCompanies();
    return;
  }

  const selectedCompany =
    filteredCompanies.find((company) => company.ticker === state.ui.selectedCompanyTicker) || filteredCompanies[0];
  const watchlistTickers = new Set((state.data.user?.watchlist || []).map((item) => item.ticker));
  const isWatchingSelected = watchlistTickers.has(selectedCompany.ticker);

  refs.companiesGrid.querySelectorAll("button[data-company-select]").forEach((entryButton) => {
    entryButton.classList.toggle("selected", entryButton.dataset.companySelect === selectedCompany.ticker);
  });

  const detailCard = refs.companiesGrid.querySelector(".company-detail-card");
  if (!detailCard) {
    renderCompanies();
    return;
  }

  detailCard.outerHTML = buildCompanyDetailCard(selectedCompany, isWatchingSelected);
  refs.companiesGrid.querySelectorAll("button[data-side]").forEach((tradeButton) => {
    tradeButton.addEventListener("click", () => handleTrade(tradeButton));
  });
}

function renderCompanies() {
  const industries = [...new Set(state.data.companies.map((company) => company.industry))].sort((a, b) =>
    a.localeCompare(b)
  );
  const filteredCompanies = getFilteredCompanies();
  const activeToolbarElement = document.activeElement;
  const shouldRestoreSearchFocus =
    activeToolbarElement?.name === "companySearch" && refs.companiesToolbar.contains(activeToolbarElement);
  const searchSelectionStart = shouldRestoreSearchFocus ? activeToolbarElement.selectionStart : null;
  const searchSelectionEnd = shouldRestoreSearchFocus ? activeToolbarElement.selectionEnd : null;

  if (!filteredCompanies.some((company) => company.ticker === state.ui.selectedCompanyTicker)) {
    state.ui.selectedCompanyTicker = filteredCompanies[0]?.ticker || null;
  }

  const movers = state.data.companies
    .map((company) => {
      const previousPrice = company.history[1]?.price ?? company.startingPrice;
      const delta = roundMoney(company.price - previousPrice);
      const percent = previousPrice ? Math.round((delta / previousPrice) * 100) : 0;
      return { company, delta, percent };
    })
    .sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent))
    .slice(0, 3);

  refs.companiesToolbar.innerHTML = `
    <div class="companies-toolbar">
      <label>
        Search
        <input
          type="text"
          name="companySearch"
          placeholder="Search by name, ticker, or industry"
          value="${escapeAttribute(state.ui.companySearch)}"
        />
      </label>
      <label>
        Risk
        <select name="volatilityFilter">
          ${["all", "Low", "Medium", "High", "Extreme"]
            .map(
              (value) =>
                `<option value="${value}" ${state.ui.volatilityFilter === value ? "selected" : ""}>${
                  value === "all" ? "All Risk Levels" : value
                }</option>`
            )
            .join("")}
        </select>
      </label>
      <label>
        Industry
        <select name="industryFilter">
          <option value="all">All Industries</option>
          ${industries
            .map(
              (industry) =>
                `<option value="${escapeAttribute(industry)}" ${
                  state.ui.industryFilter === industry ? "selected" : ""
                }>${escapeHtml(industry)}</option>`
            )
            .join("")}
        </select>
      </label>
    </div>
  `;

  if (shouldRestoreSearchFocus) {
    const searchInput = refs.companiesToolbar.querySelector('input[name="companySearch"]');
    if (searchInput) {
      searchInput.focus();
      const nextStart = Number.isInteger(searchSelectionStart) ? searchSelectionStart : state.ui.companySearch.length;
      const nextEnd = Number.isInteger(searchSelectionEnd) ? searchSelectionEnd : nextStart;
      searchInput.setSelectionRange(nextStart, nextEnd);
    }
  }

  refs.marketMovers.innerHTML = movers.length
    ? `
      <div class="section-head compact">
        <p class="eyebrow">Market Movers</p>
        <h3>Recent Action</h3>
      </div>
      <div class="movers-grid">
        ${movers
          .map(
            ({ company, delta, percent }) => `
              <div class="mover-card">
                <div>
                  <strong>${escapeHtml(company.name)}</strong>
                  <div class="event-tag">${company.ticker} • ${company.industry}</div>
                </div>
                <div class="${delta > 0 ? "price-up" : delta < 0 ? "price-down" : ""}">
                  ${delta > 0 ? "+" : ""}${percent}% 
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    `
    : "";

  if (!filteredCompanies.length) {
    refs.companiesGrid.innerHTML = `<div class="empty-state">No companies match that search right now. Try a different ticker, industry, or risk level.</div>`;
    return;
  }

  const selectedCompany =
    filteredCompanies.find((company) => company.ticker === state.ui.selectedCompanyTicker) || filteredCompanies[0];
  const watchlistTickers = new Set((state.data.user?.watchlist || []).map((item) => item.ticker));
  const isWatchingSelected = watchlistTickers.has(selectedCompany.ticker);

  refs.companiesGrid.innerHTML = `
    <div class="company-layout">
      <div class="company-list-shell">
        <div class="company-list">
          ${filteredCompanies
            .map((company) => {
              const isSelected = company.ticker === selectedCompany.ticker;
              const isWatching = watchlistTickers.has(company.ticker);
              const prior = company.history[1]?.price ?? company.startingPrice;
              const change = roundMoney(company.price - prior);
              return `
                <div class="company-list-entry">
                  <button type="button" class="company-list-item ${isSelected ? "selected" : ""}" data-company-select="${company.ticker}">
                    <div>
                      <strong>${escapeHtml(company.name)}</strong>
                      <div class="company-summary-subtitle">
                        <span class="ticker">${company.ticker}</span>
                        <span>${escapeHtml(company.industry)}</span>
                      </div>
                    </div>
                    <div class="company-list-price">
                      <div>${formatMoney(company.price)}</div>
                      <span class="${change > 0 ? "price-up" : change < 0 ? "price-down" : ""}">
                        ${change === 0 ? "0%" : `${change > 0 ? "+" : ""}${Math.round((change / prior) * 100)}%`}
                      </span>
                    </div>
                  </button>
                  ${
                    state.data.user
                      ? `
                        <button
                          type="button"
                          class="watch-toggle ${isWatching ? "watching" : ""}"
                          data-watch-toggle="${company.ticker}"
                          data-watching="${isWatching ? "true" : "false"}"
                          aria-label="${isWatching ? "Remove" : "Add"} ${escapeAttribute(company.name)} ${isWatching ? "from" : "to"} watchlist"
                          title="${isWatching ? "Remove from watchlist" : "Add to watchlist"}"
                        >&#9733;</button>
                      `
                      : ""
                  }
                </div>
              `;
            })
            .join("")}
        </div>
        <div class="company-scroll-indicator" aria-hidden="true">
          <div class="company-scroll-thumb"></div>
        </div>
      </div>
      ${buildCompanyDetailCard(selectedCompany, isWatchingSelected)}
    </div>
  `;

  refs.companiesGrid.querySelectorAll("button[data-side]").forEach((button) => {
    button.addEventListener("click", () => handleTrade(button));
  });

  const companyList = refs.companiesGrid.querySelector(".company-list");
  if (companyList) {
    companyList.scrollTop = state.ui.companyListScrollTop;
  }
  companyList?.addEventListener("scroll", updateCompanyScrollIndicator, { passive: true });
  window.requestAnimationFrame(updateCompanyScrollIndicator);
}

function renderLeaderboard() {
  const badgeLeaders = state.data.badgeLeaderboard || [];
  const tradeHighlights = state.data.tradeHighlights || { biggestWins: [], biggestLosses: [] };

  refs.leaderboard.innerHTML = `
    <div class="leaderboard-stack">
      ${
        state.data.leaderboard.length
          ? `<div class="leaderboard-list">${state.data.leaderboard
              .map(
                (entry) => `
                  <div class="leaderboard-row">
                    <div class="leaderboard-main">
                      <span class="leaderboard-rank">${entry.rank}</span>
                      <div>
                        <strong>${escapeHtml(entry.displayName)}</strong>
                        <div class="event-tag">@${escapeHtml(entry.username)}</div>
                      </div>
                    </div>
                    <div>
                      <strong class="money">${formatMoney(entry.totalValue)}</strong>
                      <div>${entry.positionsCount} active positions</div>
                    </div>
                  </div>
                `
              )
              .join("")}</div>`
          : `<div class="empty-state">No students have registered yet. Once they do, the leaderboard will update automatically.</div>`
      }
      ${buildBadgeLeaderboardCard(badgeLeaders)}
      <div class="trade-highlight-grid">
        ${buildTradeHighlightColumn(
          "Biggest Winners",
          "Best Completed Trades",
          tradeHighlights.biggestWins,
          "As students lock in profits, the top three winning exits will appear here.",
          "win"
        )}
        ${buildTradeHighlightColumn(
          "Biggest Losses",
          "Toughest Lessons",
          tradeHighlights.biggestLosses,
          "No painful sell-offs yet. Once someone sells at a loss, the biggest misses will land here.",
          "loss"
        )}
      </div>
    </div>
  `;
}

function renderEvents() {
  refs.eventsFeed.innerHTML = state.data.events.length
    ? `<div class="events-list">${state.data.events
        .map(
          (event) => `
            <article class="event-row">
              <div class="company-top">
                <div>
                  <strong>${escapeHtml(event.headline)}</strong>
                  <div class="event-effect-list">
                    <span class="event-tag">${formatDate(event.createdAt)}</span>
                    ${event.isBigStory ? `<span class="event-tag big-story-tag">Big Story</span>` : ""}
                  </div>
                </div>
              </div>
              ${event.isBigStory ? `<img class="event-feed-graphic" src="${BIG_STORY_IMAGE_SRC}" alt="RAM Financial Report breaking news graphic" loading="lazy" />` : ""}
              ${event.body ? `<p>${escapeHtml(event.body)}</p>` : ""}
              ${
                event.effects?.length
                  ? `<div class="event-effect-list">${event.effects
                      .map(
                        (effect) => `
                          <span class="event-tag">
                            ${effect.ticker} ${effect.percentChange > 0 ? "+" : ""}${effect.percentChange}% →
                            ${formatMoney(effect.newPrice)}
                          </span>
                        `
                      )
                      .join("")}</div>`
                  : ""
              }
            </article>
          `
        )
        .join("")}</div>`
    : `<div class="empty-state">Teacher-published market events will appear here.</div>`;
}

function buildShadyTipPanel(shadyTip) {
  if (!shadyTip) {
    return `<div class="empty-state">Shady Tip is loading.</div>`;
  }

  const rules = `<div class="shady-tip-rules">Guess higher or lower four times in a row. Ties reroll automatically. One attempt per market session.</div>`;

  if (shadyTip.status === "in_progress") {
    return `
      <div class="shady-tip-shell">
        <div class="shady-tip-top">
          <div>
            <strong>Current Number</strong>
            <div class="shady-tip-number">${shadyTip.currentNumber}</div>
          </div>
          <div class="mini-stat shady-tip-progress">
            <span>Correct Guesses</span>
            <strong>${shadyTip.streak}/${shadyTip.targetStreak}</strong>
          </div>
        </div>
        ${rules}
        <div class="teacher-actions shady-tip-actions">
          <button type="button" data-shady-tip-action="guess" data-guess="higher" ${shadyTip.canGuess ? "" : "disabled"}>Guess Higher</button>
          <button type="button" class="secondary" data-shady-tip-action="guess" data-guess="lower" ${shadyTip.canGuess ? "" : "disabled"}>Guess Lower</button>
        </div>
        ${shadyTip.canGuess ? "" : `<div class="student-section-note">The market is closed, so this run is frozen until the next class session.</div>`}
      </div>
    `;
  }

  if (shadyTip.status === "won" && shadyTip.lastOutcome) {
    return `
      <div class="shady-tip-shell">
        <div class="shady-tip-outcome shady-tip-win">
          <strong>Shady Tip Hit</strong>
          <div>You cleared all four guesses and picked up <strong>${shadyTip.lastOutcome.sharesAwarded} ${shadyTip.lastOutcome.ticker}</strong> shares.</div>
        </div>
        <div class="shady-tip-rules">This session's run is complete. You'll get a fresh Shady Tip when the next market session opens.</div>
      </div>
    `;
  }

  if (shadyTip.status === "lost" && shadyTip.lastOutcome) {
    const consequence = shadyTip.lastOutcome.penaltyType === "shares"
      ? `You lost <strong>${shadyTip.lastOutcome.sharesLost} ${shadyTip.lastOutcome.ticker}</strong> shares.`
      : `You paid a <strong>${formatMoney(shadyTip.lastOutcome.cashLost)}</strong> cash fine.`;

    return `
      <div class="shady-tip-shell">
        <div class="shady-tip-outcome shady-tip-loss">
          <strong>Shady Tip Backfired</strong>
          <div>${consequence}</div>
          <div class="student-section-note">Failure tier: ${shadyTip.lastOutcome.penaltyPercent}% penalty.</div>
        </div>
        <div class="shady-tip-rules">This session's run is complete. You'll get a fresh Shady Tip when the next market session opens.</div>
      </div>
    `;
  }

  if (shadyTip.canStart) {
    return `
      <div class="shady-tip-shell">
        <div class="shady-tip-outcome">
          <strong>Play the shady odds</strong>
          <div>Start with a random number from 1 to 10. Predict whether the next number will be higher or lower.</div>
        </div>
        ${rules}
        <button type="button" data-shady-tip-action="start">Start Shady Tip</button>
      </div>
    `;
  }

  return `
    <div class="shady-tip-shell">
      <div class="shady-tip-outcome">
        <strong>Waiting for the next session</strong>
        <div>Shady Tip opens when the market opens for class.</div>
      </div>
      ${rules}
    </div>
  `;
}

function buildResearchPanel(research) {
  if (!research) {
    return `<div class="empty-state">Research tools are loading.</div>`;
  }

  const targetLabel = research.target ? research.target.label : "No more scheduled waves are waiting right now.";
  const ctaLabel = research.activeRun ? "Choose a Dollar Sign" : "Research Stocks";

  return `
    <div class="research-shell">
      <div class="research-topline">
        <div>
          <strong>${research.usesLeft}/${research.usesPerWindow} scans left this window</strong>
          <div class="student-section-note">Next lead points to ${escapeHtml(targetLabel)}</div>
        </div>
        <button
          type="button"
          class="secondary"
          data-research-action="${research.activeRun ? "open" : "start"}"
          ${research.canStart || research.activeRun ? "" : "disabled"}
        >${ctaLabel}</button>
      </div>
      <div class="student-section-note">
        Each scan gives you one shot at three dollar signs. Pick the right one to unlock a tip about the next planned market move.
      </div>
    </div>
  `;
}

function buildLotteryPanel(lottery) {
  if (!lottery) {
    return `<div class="empty-state">Lottery tickets are loading.</div>`;
  }

  const rules = `
    <div class="student-section-note">
      One ticket per trading window. Costs ${formatMoney(lottery.cost)}. Pick the 1 winning ticket out of ${lottery.choiceCount} for a ${lottery.payoutMin}x-${lottery.payoutMax}x payout.
    </div>
  `;

  if (lottery.activeRun) {
    return `
      <div class="lottery-shell">
        <div class="lottery-topline">
          <div>
            <strong>Ticket already bought</strong>
            <div class="student-section-note">Your live ticket is for ${escapeHtml(lottery.activeRun.label)}.</div>
          </div>
          <button type="button" class="secondary" data-lottery-action="open">Pick a Ticket</button>
        </div>
        ${rules}
      </div>
    `;
  }

  if (lottery.status === "won" && lottery.lastResult) {
    return `
      <div class="lottery-shell">
        <div class="lottery-result lottery-result-win">
          <strong>Jackpot Landed</strong>
          <div>You hit this window's winning ticket for <strong>${formatMoney(lottery.lastResult.payoutAmount)}</strong> (${lottery.lastResult.multiplier}x).</div>
        </div>
        ${rules}
      </div>
    `;
  }

  if (lottery.status === "lost") {
    return `
      <div class="lottery-shell">
        <div class="lottery-result lottery-result-miss">
          <strong>No jackpot this window</strong>
          <div>The ${formatMoney(lottery.cost)} ticket missed. You can try again next trading window.</div>
        </div>
        ${rules}
      </div>
    `;
  }

  if (lottery.canStart) {
    return `
      <div class="lottery-shell">
        <div class="lottery-topline">
          <div>
            <strong>${escapeHtml(lottery.windowLabel || "Trading window live")}</strong>
            <div class="student-section-note">Buy one ticket and pick from 50 hidden winners.</div>
          </div>
          <button type="button" data-lottery-action="start">Buy Ticket</button>
        </div>
        ${rules}
      </div>
    `;
  }

  return `
    <div class="lottery-shell">
      <div class="lottery-result">
        <strong>Waiting for the next market open</strong>
        <div>Lottery tickets go live during each AM and PM Trading Window.</div>
      </div>
      ${rules}
    </div>
  `;
}

function buildLobbyPanel(lobby) {
  if (!lobby) {
    return `<div class="empty-state">Lobby tools are loading.</div>`;
  }

  const rules = `
    <div class="student-section-note">
      Once per game. Pass committee for a +50% to +75% stock jump. Fail and the stock drops while you sit in Compliance Review for 10 minutes.
    </div>
  `;

  if (lobby.tradeFrozen) {
    return `
      <div class="lobby-shell">
        <div class="lobby-result lobby-result-loss">
          <strong>Compliance Review Active</strong>
          <div>Trading unlocks in about ${Math.max(1, Math.ceil((lobby.freezeSecondsLeft || 0) / 60))} minute${Math.ceil((lobby.freezeSecondsLeft || 0) / 60) === 1 ? "" : "s"}.</div>
        </div>
        ${rules}
      </div>
    `;
  }

  if (lobby.status === "in_progress") {
    return `
      <div class="lobby-shell">
        <div class="lobby-topline">
          <div>
            <strong>${escapeHtml(lobby.selectedTicker)} committee push</strong>
            <div class="student-section-note">${lobby.currentVotes}/${lobby.targetVotes} votes. ${lobby.maxAttempts - lobby.attemptsUsed} persuasion attempt${lobby.maxAttempts - lobby.attemptsUsed === 1 ? "" : "s"} left.</div>
          </div>
          <button type="button" class="secondary" data-lobby-action="open">Open Committee</button>
        </div>
        ${rules}
      </div>
    `;
  }

  if (lobby.status === "won" && lobby.outcome) {
    return `
      <div class="lobby-shell">
        <div class="lobby-result lobby-result-win">
          <strong>Bill Passed</strong>
          <div>${escapeHtml(lobby.outcome.ticker)} jumped ${lobby.outcome.percentChange}% after your lobbying push.</div>
        </div>
        ${rules}
      </div>
    `;
  }

  if (lobby.status === "lost" && lobby.outcome) {
    return `
      <div class="lobby-shell">
        <div class="lobby-result lobby-result-loss">
          <strong>Bill Failed</strong>
          <div>${escapeHtml(lobby.outcome.ticker)} dropped ${Math.abs(lobby.outcome.percentChange)}%. Your once-per-game lobby attempt is used.</div>
        </div>
        ${rules}
      </div>
    `;
  }

  const companyOptions = (state.data?.companies || [])
    .map((company) => `<option value="${company.ticker}">${company.ticker} - ${escapeHtml(company.name)}</option>`)
    .join("");

  return `
    <div class="lobby-shell">
      <div class="lobby-topline">
        <div>
          <strong>${lobby.marketOpen ? "Choose a stock to lobby for" : "Available when the market opens"}</strong>
          <div class="student-section-note">Pick the company you want Congress to boost.</div>
        </div>
        <button type="button" data-lobby-action="start" ${lobby.canStart ? "" : "disabled"}>Start Lobby</button>
      </div>
      <label>
        Target Stock
        <select name="lobbyTicker" ${lobby.canStart ? "" : "disabled"}>${companyOptions}</select>
      </label>
      ${rules}
    </div>
  `;
}

function renderResearchModal() {
  const research = state.data?.user?.research;
  const modalState = state.ui.researchModal;

  if (!refs.researchModal || !refs.researchModalBody || !refs.researchModalTitle) {
    return;
  }

  if (!modalState.open || !research || state.data?.isAdmin || !state.data?.user) {
    refs.researchModal.classList.add("hidden");
    refs.researchModal.setAttribute("aria-hidden", "true");
    return;
  }

  refs.researchModal.classList.remove("hidden");
  refs.researchModal.setAttribute("aria-hidden", "false");

  if (modalState.mode === "result" && modalState.result) {
    refs.researchModalTitle.textContent = modalState.result.won ? "Research Lead Found" : "No Useful Lead";
    refs.researchModalBody.innerHTML = modalState.result.won
      ? `
        <div class="research-result research-result-win">
          <strong>One of the dollar signs paid off.</strong>
          <div>${escapeHtml(modalState.result.tip)}</div>
          <div class="student-section-note">Write it down. Once you close this, the clue is gone.</div>
        </div>
        <button type="button" data-research-close>Lock It In</button>
      `
      : `
        <div class="research-result research-result-miss">
          <strong>The trail went cold.</strong>
          <div>No tip this time. You still have ${research.usesLeft} scan${research.usesLeft === 1 ? "" : "s"} left for this trading window.</div>
        </div>
        <button type="button" data-research-close>Close</button>
      `;
    return;
  }

  if (!research.activeRun) {
    closeResearchModal();
    return;
  }

  refs.researchModalTitle.textContent = "Pick a Dollar Sign";
  refs.researchModalBody.innerHTML = `
    <div class="research-result">
      <strong>Scanning for a lead about ${escapeHtml(research.activeRun.label)}</strong>
      <div>Choose one dollar sign. Only one of them contains real market intel.</div>
    </div>
    <div class="research-choice-grid">
      ${Array.from({ length: research.activeRun.choiceCount }, (_, index) => `
        <button type="button" class="research-choice" data-research-choice="${index + 1}">$</button>
      `).join("")}
    </div>
    <div class="student-section-note">This scan already used one of your three research chances for this trading window.</div>
  `;
}

function renderLotteryModal() {
  const lottery = state.data?.user?.lottery;
  const modalState = state.ui.lotteryModal;

  if (!refs.lotteryModal || !refs.lotteryModalBody || !refs.lotteryModalTitle) {
    return;
  }

  if (!modalState.open || !lottery || state.data?.isAdmin || !state.data?.user) {
    refs.lotteryModal.classList.add("hidden");
    refs.lotteryModal.setAttribute("aria-hidden", "true");
    return;
  }

  refs.lotteryModal.classList.remove("hidden");
  refs.lotteryModal.setAttribute("aria-hidden", "false");

  if (modalState.mode === "result" && modalState.result) {
    refs.lotteryModalTitle.textContent = modalState.result.won ? "Jackpot" : "No Winner";
    refs.lotteryModalBody.innerHTML = modalState.result.won
      ? `
        <div class="lottery-result lottery-result-win">
          <strong>Your ticket hit.</strong>
          <div>You turned ${formatMoney(lottery.cost)} into <strong>${formatMoney(modalState.result.payoutAmount)}</strong> with a ${modalState.result.multiplier}x payout.</div>
        </div>
        <button type="button" data-lottery-close>Lock It In</button>
      `
      : `
        <div class="lottery-result lottery-result-miss">
          <strong>No jackpot this time.</strong>
          <div>Your ${formatMoney(lottery.cost)} ticket missed. Another ticket unlocks next trading window.</div>
        </div>
        <button type="button" data-lottery-close>Close</button>
      `;
    return;
  }

  if (!lottery.activeRun) {
    closeLotteryModal();
    return;
  }

  refs.lotteryModalTitle.textContent = "Pick One Ticket";
  refs.lotteryModalBody.innerHTML = `
    <div class="lottery-result">
      <strong>${escapeHtml(lottery.activeRun.label)}</strong>
      <div>One of these ${lottery.activeRun.choiceCount} tickets wins. Your ticket cost is already in the pot.</div>
    </div>
    <div class="lottery-choice-grid">
      ${Array.from({ length: lottery.activeRun.choiceCount }, (_, index) => `
        <button type="button" class="lottery-choice" data-lottery-choice="${index + 1}" aria-label="Pick lottery ticket ${index + 1}">
          <span class="lottery-choice-icon">$$$</span>
          <span class="lottery-choice-label">${index + 1}</span>
        </button>
      `).join("")}
    </div>
    <div class="student-section-note">You only get one pick per ticket, so choose once and live with it.</div>
  `;
}

function renderLobbyModal() {
  const lobby = state.data?.user?.lobby;
  const modalState = state.ui.lobbyModal;

  if (!refs.lobbyModal || !refs.lobbyModalBody || !refs.lobbyModalTitle) {
    return;
  }

  if (!modalState.open || !lobby || state.data?.isAdmin || !state.data?.user) {
    refs.lobbyModal.classList.add("hidden");
    refs.lobbyModal.setAttribute("aria-hidden", "true");
    return;
  }

  refs.lobbyModal.classList.remove("hidden");
  refs.lobbyModal.setAttribute("aria-hidden", "false");
  refs.lobbyModalTitle.textContent = lobby.status === "in_progress" ? "Committee Count" : "Lobby Congress";

  const latestResult = modalState.result?.memberResult;
  const outcome = modalState.result?.outcome || lobby.outcome;
  const progressClass = lobby.currentVotes >= lobby.targetVotes ? "win" : lobby.attemptsUsed >= lobby.maxAttempts ? "loss" : "";

  refs.lobbyModalBody.innerHTML = `
    <div class="lobby-modal-summary ${progressClass}">
      <div>
        <strong>${escapeHtml(lobby.selectedTicker || "Lobby Congress")}${lobby.selectedCompanyName ? ` - ${escapeHtml(lobby.selectedCompanyName)}` : ""}</strong>
        <div>${lobby.currentVotes}/${lobby.targetVotes} votes secured. ${Math.max(0, lobby.maxAttempts - lobby.attemptsUsed)} attempt${Math.max(0, lobby.maxAttempts - lobby.attemptsUsed) === 1 ? "" : "s"} left.</div>
      </div>
      <div class="lobby-vote-meter" aria-hidden="true">
        ${Array.from({ length: lobby.targetVotes }, (_, index) => `<span class="${index < lobby.currentVotes ? "filled" : ""}"></span>`).join("")}
      </div>
    </div>
    ${latestResult ? `
      <div class="lobby-result ${latestResult.voteChange > 0 ? "lobby-result-win" : latestResult.voteChange < 0 ? "lobby-result-loss" : ""}">
        <strong>${escapeHtml(latestResult.stance)}</strong>
        <div>${escapeHtml(latestResult.text)}</div>
      </div>
    ` : ""}
    ${outcome ? `
      <div class="lobby-result ${outcome.result === "passed" ? "lobby-result-win" : "lobby-result-loss"}">
        <strong>${outcome.result === "passed" ? "Bill Passed" : "Bill Failed"}</strong>
        <div>${escapeHtml(outcome.ticker)} ${outcome.percentChange > 0 ? "jumped" : "dropped"} ${Math.abs(outcome.percentChange)}%.</div>
        ${outcome.freezeUntil ? `<div class="student-section-note">Compliance Review freezes your trading for 10 minutes.</div>` : ""}
      </div>
      <button type="button" data-lobby-close>Close</button>
    ` : `
      <div class="lobby-member-grid">
        ${lobby.members.map((member) => `
          <button type="button" class="lobby-member-card ${member.selected ? "revealed" : ""}" data-lobby-member="${member.id}" ${member.selected ? "disabled" : ""}>
            <img src="${member.image}" alt="${escapeAttribute(member.name)} portrait" />
            <span class="lobby-member-name">${escapeHtml(member.name)}</span>
            <span class="lobby-member-risk">${escapeHtml(member.risk)}</span>
            <span class="lobby-member-clue">${escapeHtml(member.clue)}</span>
            ${member.selected && member.result ? `<strong>${escapeHtml(member.result.stance)} (${member.result.voteChange > 0 ? "+" : ""}${member.result.voteChange})</strong>` : ""}
          </button>
        `).join("")}
      </div>
      <div class="student-section-note">Choose carefully. You can lobby only three members, and each member can only be targeted once.</div>
    `}
  `;
}

function buildBadgeBoard(badges) {
  if (!badges.length) {
    const nextDay = (state.data?.badgeDay?.cycleNumber || 0) + 1;
    return `
      <div class="badge-board-shell">
        <div class="badge-empty-card">
          <div class="badge-empty-icon" aria-hidden="true">?</div>
          <div>
            <strong>Nothing revealed yet</strong>
            <div>Secret badges only show up after a teacher awards a badge day. Your first discoveries can land on Badge Day ${nextDay}.</div>
          </div>
        </div>
      </div>
    `;
  }

  const latestBadgeDay = state.data?.badgeDay?.cycleNumber || 0;
  const totalWins = badges.reduce((sum, badge) => sum + (badge.count || 0), 0);
  const wonTodayCount = badges.filter((badge) => badge.wonToday).length;

  return `
    <div class="badge-board-shell">
      <div class="student-section-head compact-panel-head">
        <div>
          <p class="eyebrow">Secret Badges</p>
          <h3>${badges.length} discovered</h3>
        </div>
        <div class="student-section-note">${latestBadgeDay ? `Latest badge day: ${latestBadgeDay}` : "Waiting for the first badge day."}</div>
      </div>
      <div class="badge-summary-grid">
        <div class="badge-summary-chip">
          <span>Badges Found</span>
          <strong>${badges.length}</strong>
        </div>
        <div class="badge-summary-chip">
          <span>Total Wins</span>
          <strong>${totalWins}</strong>
        </div>
        <div class="badge-summary-chip ${wonTodayCount ? "today" : ""}">
          <span>Won Today</span>
          <strong>${wonTodayCount}</strong>
        </div>
      </div>
      <div class="badge-grid">
        ${badges
          .map(
            (badge) => `
              <article class="badge-card earned ${badge.wonToday ? "today" : ""}">
                <div class="badge-icon" aria-hidden="true">${badge.wonToday ? "✦" : "★"}</div>
                <div class="badge-copy">
                  <div class="badge-topline">
                    <span class="badge-title" tabindex="0" data-tooltip="${escapeAttribute(badge.description)}">${escapeHtml(badge.label)}</span>
                    ${badge.wonToday ? `<span class="event-tag badge-tag">Won today</span>` : ""}
                  </div>
                  <div>${escapeHtml(badge.description)}</div>
                  <div class="badge-footer">
                    <div class="badge-meta">Won ${badge.count} time${badge.count === 1 ? "" : "s"}</div>
                    <div class="badge-stamp">${badge.lastBadgeDayNumber ? `Badge Day ${badge.lastBadgeDayNumber}` : "Newly discovered"}</div>
                  </div>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function getSeenEventsStorageKey() {
  const username = state.data?.user?.username;
  return username ? `stock-arena:seen-events:${username}` : null;
}

function loadSeenEventIds() {
  const key = getSeenEventsStorageKey();
  if (!key) {
    return new Set();
  }

  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveSeenEventIds(seenIds) {
  const key = getSeenEventsStorageKey();
  if (!key) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify([...seenIds]));
}

function syncStudentEventModal() {
  if (!state.data?.user || state.data.isAdmin) {
    closeEventModal(false);
    return;
  }

  const seenIds = loadSeenEventIds();
  const nextEvent = (state.data.events || []).find(
    (event) => (event.isBigStory || event.effects?.length) && !seenIds.has(event.id)
  );

  if (!nextEvent) {
    closeEventModal(false);
    return;
  }

  if (state.ui.activeEventModalId === nextEvent.id && !refs.eventModal.classList.contains("hidden")) {
    return;
  }

  openEventModal(nextEvent);
}

function openEventModal(event) {
  state.ui.activeEventModalId = event.id;
  refs.eventModalTitle.textContent = event.headline;
  const effectsMarkup = event.effects?.length
    ? `
      <div class="event-effect-list">
        ${event.effects
          .map(
            (effect) => `
              <span class="event-tag ${effect.percentChange > 0 ? "preview-up" : "preview-down"}">
                ${effect.ticker} ${effect.percentChange > 0 ? "+" : ""}${effect.percentChange}% to ${formatMoney(effect.newPrice)}
              </span>
            `
          )
          .join("")}
      </div>
    `
    : "";
  refs.eventModalBody.innerHTML = `
    ${event.isBigStory ? `<img class="big-story-graphic" src="${BIG_STORY_IMAGE_SRC}" alt="RAM Financial Report breaking news graphic" />` : ""}
    ${event.body ? `<p class="hero-copy">${escapeHtml(event.body)}</p>` : ""}
    ${effectsMarkup}
    <div class="event-modal-note">
      <strong>What this means:</strong> ${event.effects?.length ? "Prices changed immediately. Check your portfolio, watchlist, and trade board before making your next move." : "This is a major classroom news alert. Read it closely before your next move."}
    </div>
  `;
  refs.eventModal.classList.remove("hidden");
  refs.eventModal.setAttribute("aria-hidden", "false");
}

function dismissActiveEventModal() {
  if (!state.ui.activeEventModalId) {
    closeEventModal(false);
    return;
  }

  const seenIds = loadSeenEventIds();
  seenIds.add(state.ui.activeEventModalId);
  saveSeenEventIds(seenIds);
  closeEventModal(false);
  syncStudentEventModal();
}

function closeEventModal(resetActiveId = true) {
  refs.eventModal.classList.add("hidden");
  refs.eventModal.setAttribute("aria-hidden", "true");
  refs.eventModalBody.innerHTML = "";
  if (resetActiveId) {
    state.ui.activeEventModalId = null;
  } else {
    state.ui.activeEventModalId = null;
  }
}

function buildTradeHighlightColumn(title, eyebrow, trades, emptyCopy, tone) {
  return `
    <section class="trade-highlight-card ${tone === "loss" ? "trade-highlight-losses" : "trade-highlight-wins"}">
      <div class="section-head compact">
        <div>
          <p class="eyebrow">${eyebrow}</p>
          <h3>${title}</h3>
        </div>
      </div>
      ${
        trades.length
          ? `<div class="trade-highlight-list">${trades
              .map(
                (trade, index) => `
                  <article class="trade-highlight-row">
                    <div class="trade-highlight-main">
                      <span class="trade-highlight-rank">${index + 1}</span>
                      <div class="trade-highlight-copy">
                        <div class="trade-highlight-title-line">
                          <strong>${escapeHtml(trade.displayName)}</strong>
                          <span class="trade-highlight-meta">${trade.ticker} · ${trade.shares} shares</span>
                        </div>
                      </div>
                    </div>
                    <div class="trade-highlight-stats">
                      <div class="trade-highlight-profit-line">
                        <strong class="${trade.profit >= 0 ? "price-up" : "price-down"}">
                          ${formatSignedMoney(trade.profit)}
                        </strong>
                        <span class="trade-highlight-separator" aria-hidden="true">·</span>
                        <span class="${trade.profit >= 0 ? "price-up" : "price-down"}">${formatSignedPercent(trade.profitPercent)}</span>
                      </div>
                    </div>
                  </article>
                `
              )
              .join("")}</div>`
          : `<div class="empty-state">${emptyCopy}</div>`
      }
    </section>
  `;
}

function buildBadgeLeaderboardCard(entries) {
  return `
    <section class="badge-leader-card">
      <div class="section-head compact">
        <div>
          <p class="eyebrow">Badge Hunt</p>
          <h3>Badge Leaders</h3>
        </div>
      </div>
      ${
        entries.length
          ? `<div class="badge-leader-list">${entries
              .map(
                (entry) => `
                  <article class="badge-leader-row">
                    <div class="badge-leader-main">
                      <span class="trade-highlight-rank">${entry.rank}</span>
                      <div class="badge-leader-copy">
                        <div class="badge-leader-topline">
                          <strong>${escapeHtml(entry.displayName)}</strong>
                          <span class="event-tag">@${escapeHtml(entry.username)}</span>
                        </div>
                        <div class="badge-leader-meta">${entry.badgeTypes} badge types discovered</div>
                      </div>
                    </div>
                    <div class="badge-leader-stats">
                      <strong>${entry.totalWins} wins</strong>
                      ${entry.winsToday ? `<span class="badge-tag">+${entry.winsToday} today</span>` : ""}
                    </div>
                  </article>
                `
              )
              .join("")}</div>`
          : `<div class="empty-state">Award the first Badge Day and the top collectors will show up here.</div>`
      }
    </section>
  `;
}

function getTooltipTarget(target) {
  return target instanceof Element ? target.closest("[data-tooltip]") : null;
}

function showFloatingTooltip(target, x, y) {
  const message = target?.dataset?.tooltip;
  if (!message || !refs.floatingTooltip) {
    return;
  }

  refs.floatingTooltip.textContent = message;
  refs.floatingTooltip.classList.remove("hidden");
  refs.floatingTooltip.setAttribute("aria-hidden", "false");
  positionFloatingTooltip(x, y);
}

function positionFloatingTooltip(x, y) {
  if (!refs.floatingTooltip || refs.floatingTooltip.classList.contains("hidden")) {
    return;
  }

  const tooltip = refs.floatingTooltip;
  const margin = 14;
  const width = tooltip.offsetWidth;
  const height = tooltip.offsetHeight;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = x + 16;
  let top = y + 18;

  if (left + width + margin > viewportWidth) {
    left = Math.max(margin, x - width - 16);
  }

  if (top + height + margin > viewportHeight) {
    top = Math.max(margin, y - height - 18);
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function hideFloatingTooltip() {
  if (!refs.floatingTooltip) {
    return;
  }

  refs.floatingTooltip.classList.add("hidden");
  refs.floatingTooltip.setAttribute("aria-hidden", "true");
}

function handleTooltipPointerEnter(event) {
  const target = getTooltipTarget(event.target);
  if (!target) {
    return;
  }

  showFloatingTooltip(target, event.clientX, event.clientY);
}

function handleTooltipPointerMove(event) {
  const target = getTooltipTarget(event.target);
  if (!target) {
    return;
  }

  positionFloatingTooltip(event.clientX, event.clientY);
}

function handleTooltipPointerLeave(event) {
  const fromTarget = getTooltipTarget(event.target);
  if (!fromTarget) {
    return;
  }

  const toTarget = getTooltipTarget(event.relatedTarget);
  if (toTarget === fromTarget) {
    return;
  }

  hideFloatingTooltip();
}

function handleTooltipFocusIn(event) {
  const target = getTooltipTarget(event.target);
  if (!target) {
    return;
  }

  const rect = target.getBoundingClientRect();
  showFloatingTooltip(target, rect.left + rect.width / 2, rect.bottom);
}

function handleTooltipFocusOut(event) {
  if (!getTooltipTarget(event.target)) {
    return;
  }

  hideFloatingTooltip();
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function formatSignedMoney(value) {
  return `${value > 0 ? "+" : value < 0 ? "-" : ""}${formatMoney(Math.abs(value))}`;
}

function formatSignedPercent(value) {
  return `${value > 0 ? "+" : value < 0 ? "" : ""}${roundMoney(value)}%`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

function showToast(message) {
  refs.toast.textContent = message;
  refs.toast.classList.remove("hidden");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    refs.toast.classList.add("hidden");
  }, 2400);
}
