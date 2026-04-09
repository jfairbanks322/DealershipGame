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
    eventDraft: {
      headline: "",
      body: "",
      effects: {}
    }
  }
};

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
  studentView: document.getElementById("student-view"),
  teacherView: document.getElementById("teacher-view"),
  studentNameHeading: document.getElementById("student-name-heading"),
  portfolioSummary: document.getElementById("portfolio-summary"),
  watchlistPanel: document.getElementById("watchlist-panel"),
  transactionsList: document.getElementById("transactions-list"),
  teacherSummary: document.getElementById("teacher-summary"),
  teacherControls: document.getElementById("teacher-controls"),
  teacherSettingsForm: document.getElementById("teacher-settings-form"),
  resetTools: document.getElementById("reset-tools"),
  studentRoster: document.getElementById("student-roster"),
  teacherTrades: document.getElementById("teacher-trades"),
  companyEditor: document.getElementById("company-editor"),
  eventEffects: document.getElementById("event-effects"),
  eventSummary: document.getElementById("event-summary"),
  companiesToolbar: document.getElementById("companies-toolbar"),
  marketMovers: document.getElementById("market-movers"),
  companiesGrid: document.getElementById("companies-grid"),
  leaderboard: document.getElementById("leaderboard"),
  eventsFeed: document.getElementById("events-feed"),
  toast: document.getElementById("toast"),
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
refs.studentRoster.addEventListener("click", handleStudentRosterClick);
refs.studentRoster.addEventListener("submit", handleStudentRosterSubmit);
refs.resetTools.addEventListener("click", handleResetClick);
refs.companyEditor.addEventListener("submit", handleCompanyEditorSubmit);
refs.companiesToolbar.addEventListener("input", handleCompanyToolbarChange);
refs.companiesToolbar.addEventListener("change", handleCompanyToolbarChange);
refs.companiesGrid.addEventListener("click", handleCompanySelection);
refs.watchlistPanel.addEventListener("click", handleWatchlistPanelClick);
refs.eventModal.addEventListener("click", handleEventModalClick);
window.addEventListener("resize", updateCompanyScrollIndicator);

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
    effects
  });

  if (ok) {
    form.reset();
    state.ui.eventDraft = {
      headline: "",
      body: "",
      effects: {}
    };
  }
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

async function handleWatchToggle(button) {
  const ticker = button.dataset.watchToggle;
  const watching = button.dataset.watching !== "true";
  await postJson("/api/watchlist", { ticker, watching });
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

    if (url !== "/api/logout") {
      showToast(data.message || "Updated.");
    }
    return true;
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
  if (!user) {
    refs.studentView.classList.add("hidden");
    return;
  }

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
          <strong>${user.watchlist.length}/5</strong>
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
    : `<div class="empty-state">Star up to 5 companies to build a quick watchlist for class. Use the gold star on any company card to save it here.</div>`;

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

function renderTeacherView() {
  if (!state.data.isAdmin || !state.data.admin) {
    refs.teacherView.classList.add("hidden");
    return;
  }

  refs.teacherView.classList.remove("hidden");

  const { admin, market } = state.data;
  const topStudent = admin.metrics.topStudent;

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
        <span>News Events</span>
        <strong>${admin.metrics.eventCount}</strong>
      </div>
    </div>
    <div class="empty-state">
      ${topStudent ? `<strong>Current Leader:</strong> ${escapeHtml(topStudent.displayName)} with ${formatMoney(topStudent.totalValue)}.` : "No students have joined yet."}
      ${market.isOpen ? " The market is currently live." : " The market is currently closed."}
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
      </div>
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
          <div class="effect-company">
            <strong>${escapeHtml(company.name)}</strong>
            <div class="event-tag">${company.industry}</div>
          </div>
          <label class="effect-input-group">
            <span>Change %</span>
            <input
              type="number"
              name="effect_${company.ticker}"
              min="-90"
              max="200"
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

  renderTeacherEventSummary();

  refs.studentRoster.innerHTML = admin.students.length
    ? `<div class="admin-list">${admin.students
        .map(
          (student) => `
            <details class="admin-accordion">
              <summary class="admin-summary">
                <div class="admin-summary-main">
                  <strong>${escapeHtml(student.displayName)}</strong>
                  <span class="company-summary-toggle">Show Details</span>
                </div>
              </summary>
              <div class="admin-body">
                <div class="admin-meta">
                  <div class="event-tag">@${escapeHtml(student.username)} • Joined ${formatDate(student.createdAt)}</div>
                  <div class="admin-subtext">${escapeHtml(student.positionsLabel)}</div>
                </div>
                <div class="admin-actions">
                  <div class="admin-metric">${formatMoney(student.totalValue)}</div>
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
              <input name="startingPrice" type="number" min="1" step="0.01" value="${company.startingPrice}" required />
            </label>
            <label>
              Current Price
              <input name="price" type="number" min="1" step="0.01" value="${company.price}" required />
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

  if (publishButton) {
    publishButton.textContent = effects.length
      ? `Publish Event for ${effects.length} Stock${effects.length === 1 ? "" : "s"}`
      : "Publish Event";
  }

  const bodyText = String(refs.eventForm.elements.body?.value || "").trim();

  refs.eventSummary.innerHTML = effects.length
    ? `
      <div class="teacher-event-preview">
        <div class="teacher-event-preview-head">
          <div>
            <p class="eyebrow">Event Preview</p>
            <h3>${headline ? escapeHtml(headline) : "Headline still needed"}</h3>
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
            </div>
            <div class="student-section-note">No price changes</div>
          </div>
          <p class="admin-subtext">This update will appear in the student news feed without changing any stock prices.</p>
        </div>
      `
      : "";
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
    footer = `
      <div class="trade-controls">
        <input name="shares" type="number" min="1" step="1" placeholder="Shares" ${state.data.market.isOpen ? "" : "disabled"} />
        <button data-side="buy" ${state.data.market.isOpen ? "" : "disabled"}>Buy</button>
        <button class="secondary" data-side="sell" ${state.data.market.isOpen ? "" : "disabled"}>Sell</button>
      </div>
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
  refs.leaderboard.innerHTML = state.data.leaderboard.length
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
    : `<div class="empty-state">No students have registered yet. Once they do, the leaderboard will update automatically.</div>`;
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
                  <div class="event-tag">${formatDate(event.createdAt)}</div>
                </div>
              </div>
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
    (event) => event.effects?.length && !seenIds.has(event.id)
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
  refs.eventModalBody.innerHTML = `
    ${event.body ? `<p class="hero-copy">${escapeHtml(event.body)}</p>` : ""}
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
    <div class="event-modal-note">
      <strong>What this means:</strong> Prices changed immediately. Check your portfolio, watchlist, and trade board before making your next move.
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

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
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
