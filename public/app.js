const state = {
  data: null,
  ui: {
    authPending: false,
    scenarioDraft: {
      presetId: "",
      headline: "",
      body: ""
    }
  }
};

const STAFF_DIRECTORY = {
  jake: {
    name: "Jake",
    title: "Floor Sales",
    avatar: "/assets/staff/jake.png",
    accent: "sales",
    badge: "Closer"
  },
  nina: {
    name: "Nina",
    title: "Online Sales",
    avatar: "/assets/staff/nina.png",
    accent: "online",
    badge: "CRM"
  },
  marcus: {
    name: "Marcus",
    title: "Accounting",
    avatar: "/assets/staff/marcus.png",
    accent: "accounting",
    badge: "Numbers"
  },
  tasha: {
    name: "Tasha",
    title: "Service Bay",
    avatar: "/assets/staff/tasha.png",
    accent: "service",
    badge: "Shop"
  },
  elena: {
    name: "Elena",
    title: "Marketing",
    avatar: "/assets/staff/elena.png",
    accent: "marketing",
    badge: "Brand"
  }
};

const EVENT_ART_DIRECTORY = {
  "rotting-return": {
    image: "/assets/trunk.png",
    alt: "A blue car with a foul-smelling trunk open"
  },
  "minivan-bet-meltdown": {
    image: "/assets/minivan.png",
    alt: "A minivan overflowing with cash"
  },
  "ex-husband-drama": {
    image: "/assets/exhusband.png",
    alt: "A smug man in sunglasses holding up a peace sign"
  },
  "tiktok-sunroof": {
    image: "/assets/sunroof.png",
    alt: "A blue car with someone's legs sticking out of a shattered sunroof"
  },
  "sleep-detox-breakdown": {
    image: "/assets/marcusdetox.png",
    alt: "An exhausted accountant holding a coffee cup"
  },
  "church-flyer-disaster": {
    image: "/assets/churchlady.png",
    alt: "A shocked church lady holding an offensive ad flyer"
  },
  "gym-ego-spiral": {
    image: "/assets/gym.png",
    alt: "Jake flexing with oversized confidence after getting obsessed with the gym"
  },
  "airpods-ultimatum": {
    image: "/assets/airpods.png",
    alt: "An angry Tasha pulling at her hair after losing her AirPods"
  },
  "closet-side-hustle": {
    image: "/assets/clothes.png",
    alt: "A dealership website listing both cars and expensive used clothes"
  },
  "daycare-breakdown": {
    image: "/assets/marcuskids.png",
    alt: "Marcus's sister's kids running wildly through the dealership"
  }
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
  updateAutomationHooks();
}

function renderAuthSection() {
  if (state.data.user || state.data.isAdmin) {
    refs.authSection.classList.add("hidden");
    return;
  }

  refs.authSection.classList.remove("hidden");
}

function renderMarketStatus() {
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
            ? "Students are working through a shared dealership event, but each case can branch differently."
            : "Session is open. Launch a global dealership event when you want the next chain to begin."
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
      ? `${user.lossState?.name || "A staff member"} quit. Your dealership is out until the teacher resets standings.`
      : game.isOpen
        ? currentRound
          ? currentRound.studentCase?.status === "resolved"
            ? "You resolved the current event chain. Watch the leaderboard and wait for the next global event."
            : "A global dealership event is live. Your choices will branch your dealership's case."
          : "Your teacher has the session open. Wait for the next global event."
        : "Your teacher has not opened the class session yet.";

  refs.sessionBar.classList.remove("hidden");
  refs.sessionBar.innerHTML = `
    <div>
      <strong>${isAdmin ? "Teacher controls unlocked" : `Welcome back, ${escapeHtml(user.displayName)}`}</strong>
      <span>${message}</span>
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
  refs.studentNameHeading.textContent = `${user.displayName}'s Dealership`;
  const leaderboardEntry = state.data.leaderboard.find((entry) => entry.id === user.id) || null;

  refs.studentSummary.innerHTML = `
    <div class="summary-grid">
      <article class="hero-stat">
        <span class="eyebrow">${user.isEliminated ? "Final Score" : "Dealership Score"}</span>
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
        <div class="mini-stat"><span>Manager Style</span><strong>${escapeHtml(user.managerProfile.title)}</strong></div>
      </div>
    </div>
    <p class="note">${escapeHtml(user.managerProfile.summary)}</p>
    ${
      user.warnings.length
        ? `<div class="warning-list">${user.warnings.map((warning) => `<div class="warning-chip">${escapeHtml(warning)}</div>`).join("")}</div>`
        : `<p class="note">Balanced management keeps dealership revenue moving without creating hidden team penalties.</p>`
    }
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
          <p class="eyebrow">Dealership Eliminated</p>
          <h3>${escapeHtml(user.lossState?.name || "An employee")} quit</h3>
        </div>
        <p>${escapeHtml(user.lossState?.message || "A staff member walked out, and your dealership is out of the game.")}</p>
        <p class="note">The class session is closed, and this dealership will stay out until the teacher resets standings.</p>
      </article>
    `;
  }

  if (!game.isOpen) {
    return `<div class="empty-state">The class session is closed right now. Once your teacher opens it, live staff situations will appear here.</div>`;
  }

  if (user.isEliminated && !currentRound) {
    return `
      <article class="decision-card loss-card">
        <div class="section-head compact">
          <p class="eyebrow">Dealership Eliminated</p>
          <h3>${escapeHtml(user.lossState?.name || "An employee")} quit</h3>
        </div>
        <p>${escapeHtml(user.lossState?.message || "A staff member walked out, and your dealership is out of the game.")}</p>
        <p class="note">No new global event is active, and this dealership will not receive the next one unless standings are reset.</p>
      </article>
    `;
  }

  if (!currentRound) {
    return `<div class="empty-state">Session is open, but there is no active global event yet. Stay ready for the next dealership crisis.</div>`;
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
            <p class="eyebrow">Dealership Eliminated</p>
            <h3>${escapeHtml(user.lossState?.name || "An employee")} quit</h3>
          </div>
          <p>${escapeHtml(user.lossState?.message || "A staff member walked out, and your dealership is out of the game.")}</p>
          <div class="impact-summary">
            <strong>Final standing snapshot</strong>
            <div class="impact-grid">
              <div class="impact-chip positive">Score ${formatScore(user.aggregateScore)}</div>
              <div class="impact-chip positive">Revenue ${formatRevenue(user.sales)}</div>
              <div class="impact-chip ${user.avgMorale >= 50 ? "positive" : "negative"}">Morale ${formatPercent(user.avgMorale)}</div>
              <div class="impact-chip ${user.avgTrust >= 50 ? "positive" : "negative"}">Trust ${formatPercent(user.avgTrust)}</div>
            </div>
          </div>
          <p class="note">You can still review the case timeline and leaderboard, but this dealership will not receive new event chains until the standings are reset.</p>
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
    return `<div class="empty-state">Your dealership case has not started yet. Refresh in a moment if the teacher just launched the event.</div>`;
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
            ? `<span class="pill ${studentCase.status === "lost" ? "pill-closed" : studentCase.status === "resolved" ? "pill-open" : "pill-muted"}">${studentCase.status === "lost" ? "Dealership lost" : studentCase.status === "resolved" ? "Case resolved" : `Following ${escapeHtml(studentCase.currentPromptTitle)}`}</span>`
            : ""
        }
      </div>
      <p class="note">Everything below branches out from this event. The follow-up conversations and actions come from the selected event template.</p>
    </article>
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
        <div class="mini-stat"><span>Completed Cases</span><strong>${currentRound ? `${admin.metrics.activeResponses}/${admin.metrics.studentCount}` : "Waiting"}</strong></div>
        <div class="mini-stat"><span>Session State</span><strong>${game.isOpen ? "Open" : "Closed"}</strong></div>
      </div>
    </div>
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
                ? `Event ${currentRound.roundNumber} is active with ${currentRound.completedCount}/${currentRound.totalStudents} completed dealership cases.`
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
  refs.leaderboard.innerHTML = state.data.leaderboard.length
    ? `<div class="feed-list">${state.data.leaderboard
        .map(
          (entry) => `
            <article class="feed-row leaderboard-row">
              <div class="feed-main">
                <span class="rank-pill">#${entry.rank}</span>
                <div>
                  <strong>${escapeHtml(entry.displayName)}</strong>
                  <div class="subtext">@${escapeHtml(entry.username)}</div>
                </div>
              </div>
              <div class="feed-metrics">
                <div><strong>${formatScore(entry.aggregateScore)}</strong><span>Score</span></div>
                <div><strong>${formatRevenue(entry.sales)}</strong><span>Revenue</span></div>
                <div><strong>${formatPercent(entry.teamHealth)}</strong><span>Team health</span></div>
              </div>
              <div class="focus-row">
                <span class="pill ${entry.isEliminated ? "pill-closed" : "pill-open"}">${entry.isEliminated ? `Lost: ${escapeHtml(entry.lossState?.name || "Staff quit")}` : "Active"}</span>
              </div>
            </article>
          `
        )
        .join("")}</div>`
    : `<div class="empty-state">No students have joined yet. Once they do, live dealership standings will appear here.</div>`;
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
      <p class="note">${escapeHtml(staff.hasQuit ? `${staff.name} has quit the dealership.` : staff.tension)}</p>
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
        <div>
          <strong>${escapeHtml(student.displayName)}</strong>
          <div class="subtext">@${escapeHtml(student.username)} · Joined ${formatDate(student.joinedAt)}</div>
        </div>
        <span class="pill ${student.progressTone === "closed" ? "pill-closed" : student.progressTone === "open" ? "pill-open" : "pill-muted"}">
          ${escapeHtml(student.progressLabel || "Waiting")}
        </span>
      </div>
      <div class="feed-metrics">
        <div><strong>${formatScore(student.aggregateScore)}</strong><span>Score</span></div>
        <div><strong>${formatRevenue(student.sales)}</strong><span>Revenue</span></div>
        <div><strong>${formatPercent(student.avgMorale)}</strong><span>Morale</span></div>
        <div><strong>${formatPercent(student.teamHealth)}</strong><span>Health</span></div>
      </div>
      ${
        student.award
          ? `<div class="award-inline">
              <strong>${escapeHtml(student.award.title)}</strong>
              <span>${escapeHtml(student.award.subtitle)}</span>
              <p class="note">${escapeHtml(student.award.reason)}</p>
            </div>`
          : ""
      }
      ${student.isEliminated ? `<p class="note">${escapeHtml(student.lossState?.message || "This dealership has been eliminated.")}</p>` : ""}
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
      </div>
      <div class="subtext">${formatDate(entry.submittedAt)}</div>
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

function renderEventArtwork(presetId, headline, className = "event-artwork") {
  const meta = EVENT_ART_DIRECTORY[presetId];
  if (!meta?.image) {
    return "";
  }

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
  return `
    <article class="feed-row compact-feed-row">
      <div class="feed-main">
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
                          <div class="subtext">${node.count} active dealership case${node.count === 1 ? "" : "s"} at this branch</div>
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
        accent: STAFF_DIRECTORY[staffId]?.accent || "sales",
        badge: STAFF_DIRECTORY[staffId]?.badge || "Team"
      };
    }
  }

  return STAFF_DIRECTORY[staffId] || {
    name: staffId,
    title: "",
    avatar: "/assets/staff/jake.png",
    accent: "sales",
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
