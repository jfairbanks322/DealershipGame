const state = {
  data: null,
  selectedAvatarId: null,
  toastTimer: null
};

const refs = {
  statusStrip: document.getElementById("status-strip"),
  authSection: document.getElementById("auth-section"),
  dashboardSection: document.getElementById("dashboard-section"),
  welcomeHeading: document.getElementById("welcome-heading"),
  sessionSummary: document.getElementById("session-summary"),
  livePreview: document.getElementById("live-preview"),
  studentView: document.getElementById("student-view"),
  teacherView: document.getElementById("teacher-view"),
  logoutButton: document.getElementById("logout-button"),
  toast: document.getElementById("toast")
};

init();

function init() {
  document.addEventListener("submit", handleSubmit);
  document.addEventListener("click", handleClick);
  bootstrap();
}

async function bootstrap() {
  try {
    state.data = await getJson("/api/bootstrap");
    if (!state.selectedAvatarId && state.data.avatarCatalog?.length) {
      state.selectedAvatarId = state.data.avatarCatalog[0].id;
    }
    if (state.data.walletRefill?.amount) {
      showToast(`Daily wallet floor applied: ${formatMoney(state.data.walletRefill.amount)} added.`);
    }
    render();
  } catch (error) {
    showToast(error.message || "Could not load GOLD MARKET.");
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;

  if (form.matches("[data-form='student-register']")) {
    const formData = new FormData(form);
    try {
      state.data = await postJson("/api/register", {
        displayName: formData.get("displayName"),
        username: formData.get("username"),
        password: formData.get("password"),
        avatarId: state.selectedAvatarId
      });
      showToast("Student account created.");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (form.matches("[data-form='student-login']")) {
    const formData = new FormData(form);
    try {
      state.data = await postJson("/api/login", {
        username: formData.get("username"),
        password: formData.get("password")
      });
      showToast("Welcome back to GOLD MARKET.");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (form.matches("[data-form='teacher-login']")) {
    const formData = new FormData(form);
    try {
      state.data = await postJson("/api/admin/login", {
        username: formData.get("username"),
        password: formData.get("password")
      });
      showToast("Teacher dashboard unlocked.");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (form.matches("[data-form='teacher-settings']")) {
    const formData = new FormData(form);
    try {
      state.data = await postJson("/api/admin/settings", {
        teacherUsername: formData.get("teacherUsername"),
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword")
      });
      showToast("Teacher login settings updated.");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (form.matches("[data-form='market-create']")) {
    const formData = new FormData(form);
    try {
      state.data = await postJson("/api/admin/prediction-markets/create", {
        title: formData.get("title"),
        description: formData.get("description"),
        category: formData.get("category"),
        desk: formData.get("desk"),
        probability: Number(formData.get("probability")),
        evidence: Number(formData.get("evidence")),
        hype: Number(formData.get("hype"))
      });
      form.reset();
      showToast("New classroom market published.");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }
}

async function handleClick(event) {
  const avatarButton = event.target.closest("[data-avatar-id]");
  if (avatarButton) {
    state.selectedAvatarId = avatarButton.dataset.avatarId;
    renderAuth();
    return;
  }

  if (event.target.closest("#logout-button")) {
    try {
      await postJson("/api/logout", {});
      state.data = await getJson("/api/bootstrap");
      showToast("Logged out.");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  const workButton = event.target.closest("[data-work-task][data-work-choice]");
  if (workButton) {
    try {
      state.data = await postJson("/api/prediction-markets/work", {
        taskId: workButton.dataset.workTask,
        choiceId: workButton.dataset.workChoice
      });
      showToast("Work submitted. Steady cash added.");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  const resolveButton = event.target.closest("[data-resolve-market]");
  if (resolveButton) {
    try {
      state.data = await postJson("/api/admin/prediction-markets/resolve", {
        marketId: resolveButton.dataset.marketId,
        resolution: resolveButton.dataset.resolveMarket
      });
      showToast(`Market resolved ${resolveButton.dataset.resolveMarket.toUpperCase()}.`);
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  const archiveButton = event.target.closest("[data-archive-market]");
  if (archiveButton) {
    try {
      state.data = await postJson("/api/admin/prediction-markets/archive", {
        marketId: archiveButton.dataset.marketId
      });
      showToast("Market archived.");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  const refillButton = event.target.closest("[data-action='refill-wallets']");
  if (refillButton) {
    try {
      state.data = await postJson("/api/admin/prediction-markets/refill-wallets", {});
      showToast("Wallet floor applied across the class.");
      render();
    } catch (error) {
      showToast(error.message);
    }
  }
}

function render() {
  renderStatusStrip();
  renderAuth();
  renderDashboard();
  refs.logoutButton.classList.toggle("gm-hidden", !isAuthenticated());
}

function renderStatusStrip() {
  const markets = state.data?.liveMarkets || [];
  const activeCount = markets.filter((market) => market.status === "active").length;
  const resolvedCount = markets.filter((market) => market.status === "resolved").length;
  const viewerRole = state.data?.viewerRole || "guest";

  refs.statusStrip.innerHTML = [
    renderStatusCard("Viewer", viewerRole === "teacher" ? "Teacher" : viewerRole === "student" ? "Student" : "Guest", viewerRole === "student" ? "You can trade private positions." : "Students move shared odds together."),
    renderStatusCard("Live Markets", String(activeCount), activeCount ? "Teacher-published questions are trading now." : "Waiting for the next market."),
    renderStatusCard("Resolved", String(resolvedCount), resolvedCount ? "Debrief settled questions after the round." : "No markets settled yet."),
    renderStatusCard("Trade Block", `${state.data?.rules?.tradeBlock || 5} shares`, `${formatMoney(state.data?.rules?.startingCash || 40)} starting wallet floor`)
  ].join("");
}

function renderStatusCard(label, value, copy) {
  return `
    <article class="gm-status-card">
      <p class="gm-mini-label">${escapeHtml(label)}</p>
      <div class="gm-status-value">${escapeHtml(value)}</div>
      <p class="gm-subtext">${escapeHtml(copy)}</p>
    </article>
  `;
}

function renderAuth() {
  if (isAuthenticated()) {
    refs.authSection.innerHTML = "";
    refs.authSection.classList.add("gm-hidden");
    return;
  }

  const avatars = state.data?.avatarCatalog || [];

  refs.authSection.classList.remove("gm-hidden");
  refs.authSection.innerHTML = `
    <article class="gm-auth-card">
      <p class="gm-eyebrow">Students</p>
      <h2>Join the class</h2>
      <p class="gm-subtext">Create an account, pick an avatar, then decide whether to trade or stay in cash.</p>
      <form class="gm-stack-form" data-form="student-register">
        <label>
          Display name
          <input name="displayName" type="text" maxlength="32" placeholder="Avery" required />
        </label>
        <label>
          Username
          <input name="username" type="text" maxlength="20" placeholder="avery1" required />
        </label>
        <label>
          Password
          <input name="password" type="password" minlength="4" placeholder="4+ characters" required />
        </label>
        <div>
          <p class="gm-mini-label">Choose avatar</p>
          <div class="gm-avatar-grid">
            ${avatars.map((avatar) => `
              <button
                class="gm-avatar-option ${avatar.id === state.selectedAvatarId ? "is-selected" : ""}"
                type="button"
                data-avatar-id="${escapeHtml(avatar.id)}"
                aria-label="Choose ${escapeHtml(avatar.id)}"
              >
                <img src="${escapeHtml(avatar.path)}" alt="${escapeHtml(avatar.id)}" />
              </button>
            `).join("")}
          </div>
        </div>
        <button class="gm-button" type="submit">Create Student Account</button>
      </form>
    </article>

    <article class="gm-auth-card">
      <p class="gm-eyebrow">Returning players</p>
      <h2>Student login</h2>
      <form class="gm-stack-form" data-form="student-login">
        <label>
          Username
          <input name="username" type="text" maxlength="20" placeholder="avery1" required />
        </label>
        <label>
          Password
          <input name="password" type="password" minlength="4" placeholder="Password" required />
        </label>
        <button class="gm-button gm-button-secondary" type="submit">Student Login</button>
      </form>

      <div style="height:16px"></div>

      <p class="gm-eyebrow">Teacher control</p>
      <h2>Publish custom markets</h2>
      <form class="gm-stack-form" data-form="teacher-login">
        <label>
          Username
          <input name="username" type="text" placeholder="teacher" required />
        </label>
        <label>
          Password
          <input name="password" type="password" placeholder="Teacher password" required />
        </label>
        <button class="gm-button" type="submit">Teacher Login</button>
      </form>
    </article>
  `;
}

function renderDashboard() {
  if (!isAuthenticated()) {
    refs.dashboardSection.classList.add("gm-hidden");
    refs.studentView.classList.add("gm-hidden");
    refs.teacherView.classList.add("gm-hidden");
    return;
  }

  refs.dashboardSection.classList.remove("gm-hidden");
  refs.welcomeHeading.textContent = state.data.viewerRole === "teacher"
    ? "Teacher Control Center"
    : `${state.data.user?.displayName || "Student"} Dashboard`;

  refs.sessionSummary.innerHTML = renderSessionSummary();
  refs.livePreview.innerHTML = renderLivePreview();

  const isTeacher = state.data.viewerRole === "teacher";
  refs.studentView.classList.toggle("gm-hidden", isTeacher);
  refs.teacherView.classList.toggle("gm-hidden", !isTeacher);

  if (isTeacher) {
    refs.teacherView.innerHTML = renderTeacherView();
  } else {
    refs.studentView.innerHTML = renderStudentView();
  }
}

function renderSessionSummary() {
  if (state.data.viewerRole === "teacher") {
    const metrics = state.data.admin?.metrics;
    return `
      <div class="gm-stat-grid">
        <div class="gm-stat"><span>Students</span><strong>${metrics.studentCount}</strong></div>
        <div class="gm-stat"><span>Active Markets</span><strong>${metrics.activeMarketCount}</strong></div>
        <div class="gm-stat"><span>Stay in Cash</span><strong>${metrics.stayInCashCount}</strong></div>
        <div class="gm-stat"><span>Average Wallet</span><strong>${formatMoney(metrics.averageCash)}</strong></div>
      </div>
      <p class="gm-note">Teacher-created markets change on the fly, while the live board keeps individual bettors private from the class.</p>
    `;
  }

  const student = state.data.student;
  return `
    <div class="gm-card-top">
      <div>
        <p class="gm-eyebrow">Wallet</p>
        <h3>${formatMoney(student.portfolio.cash)}</h3>
        <p class="gm-subtext">${escapeHtml(student.gradeMessage)}</p>
      </div>
      ${student.avatarPath ? `<img class="gm-student-avatar" src="${escapeHtml(student.avatarPath)}" alt="${escapeHtml(student.displayName)} avatar" />` : ""}
    </div>
    <div class="gm-stat-grid">
      <div class="gm-stat"><span>Total Trades</span><strong>${student.totals.tradeCount}</strong></div>
      <div class="gm-stat"><span>Work Days</span><strong>${student.totals.workDaysCompleted}</strong></div>
      <div class="gm-stat"><span>Live Positions</span><strong>${student.totals.activePositionCount}</strong></div>
      <div class="gm-stat"><span>Automatic A</span><strong>${student.stayInCashEligible ? "Active" : "Not Active"}</strong></div>
    </div>
    <div class="gm-actions">
      <a class="gm-button" href="/market">Enter Live Board</a>
      <a class="gm-button gm-button-ghost" href="/market#finish-panel">See market debrief</a>
    </div>
  `;
}

function renderLivePreview() {
  const markets = state.data.liveMarkets || [];
  const active = markets.filter((market) => market.status === "active");
  if (!active.length) {
    return `
      <div class="gm-live-preview-image">
        <img src="/assets/gold-market/no-live-markets.png" alt="No live markets graphic" />
      </div>
      <p class="gm-note">No teacher-published markets are live right now. Students can still stay in cash or complete off-market work.</p>
      <div class="gm-actions">
        <a class="gm-button gm-button-secondary" href="/market">Open Observer Board</a>
      </div>
    `;
  }

  return `
    <div class="gm-live-preview-image">
      <img src="/assets/gold-market/shared-pool-live.png" alt="Shared pool live graphic" />
    </div>
    <div class="gm-card-list">
      ${active.slice(0, 3).map(renderCompactMarket).join("")}
    </div>
    <div class="gm-actions">
      <a class="gm-button" href="/market">Open Live Board</a>
    </div>
  `;
}

function renderCompactMarket(market) {
  return `
    <div class="gm-summary-card">
      <div class="gm-market-line">
        <strong>${escapeHtml(market.title)}</strong>
        <span class="gm-chip">${market.currentProbability}c YES</span>
      </div>
      <p class="gm-subtext">${escapeHtml(market.description)}</p>
    </div>
  `;
}

function renderStudentView() {
  const student = state.data.student;
  const workBoard = state.data.workBoard;

  return `
    <section class="gm-grid-two">
      <article class="gm-panel">
        <div class="gm-panel-head">
          <div>
            <p class="gm-eyebrow">Off-market work</p>
            <h2>Steady money board</h2>
          </div>
        </div>
        ${renderWorkBoard(workBoard)}
      </article>

      <article class="gm-panel">
        <div class="gm-panel-head">
          <div>
            <p class="gm-eyebrow">Current positions</p>
            <h2>Private portfolio</h2>
          </div>
        </div>
        ${student.positions.length ? `
          <div class="gm-card-list">
            ${student.positions.map((position) => `
              <article class="gm-position-card">
                <div class="gm-market-line">
                  <strong>${escapeHtml(position.title)}</strong>
                  <span class="gm-chip">${position.status === "active" ? "Open" : `Resolved ${String(position.resolution || "").toUpperCase()}`}</span>
                </div>
                <p class="gm-subtext">
                  ${position.status === "active"
                    ? `${position.yesShares} YES shares · ${position.noShares} NO shares`
                    : `${position.finalYesShares} YES · ${position.finalNoShares} NO · payout ${formatMoney(position.finalPayout)}`}
                </p>
              </article>
            `).join("")}
          </div>
        ` : `<div class="gm-empty">No private positions yet. Staying in cash is still a valid strategy.</div>`}
      </article>
    </section>

    <section class="gm-panel">
      <div class="gm-panel-head">
        <div>
          <p class="gm-eyebrow">Recent activity</p>
          <h2>Trade journal</h2>
        </div>
      </div>
      ${student.recentTrades.length ? `
        <div class="gm-card-list">
          ${student.recentTrades.map((trade) => `
            <article class="gm-trade-card">
              <div class="gm-market-line">
                <strong>${escapeHtml(trade.title)}</strong>
                <span class="gm-chip">${trade.direction.toUpperCase()} ${trade.side.toUpperCase()}</span>
              </div>
              <p class="gm-subtext">${trade.quantity} shares at ${formatCents(trade.unitPrice)} each · total ${formatMoney(trade.totalCost)}</p>
            </article>
          `).join("")}
        </div>
      ` : `<div class="gm-empty">No trades yet. If you never place one, the automatic A path remains active.</div>`}
    </section>
  `;
}

function renderWorkBoard(workBoard) {
  if (!workBoard?.available) {
    return `<div class="gm-empty">Log in as a student to access today’s steady-money tasks.</div>`;
  }

  if (workBoard.completedTask) {
    return `
      <div class="gm-side-image">
        <img src="/assets/gold-market/wallet-refilled.png" alt="Wallet refilled graphic" />
      </div>
      <div class="gm-summary-card">
        <p class="gm-eyebrow">Completed today</p>
        <h3>${escapeHtml(workBoard.completedTask.title)}</h3>
        <p class="gm-subtext">
          Earned ${formatMoney(workBoard.completedTask.payout)}
          ${workBoard.completedTask.wasCorrect ? ` including a ${formatMoney(workBoard.completedTask.accuracyBonus)} accuracy bonus.` : "."}
        </p>
      </div>
    `;
  }

  return `
    <div class="gm-card-list">
      ${workBoard.tasks.map((task) => `
        <article class="gm-task-card">
          <div class="gm-market-line">
            <div>
              <p class="gm-eyebrow">${escapeHtml(task.type)}</p>
              <h3>${escapeHtml(task.title)}</h3>
            </div>
            <span class="gm-chip">${formatMoney(task.maxPay)} max</span>
          </div>
          <p class="gm-subtext">${escapeHtml(task.description)}</p>
          <p class="gm-note">${escapeHtml(task.prompt)}</p>
          <div class="gm-card-list">
            ${task.choices.map((choice) => `
              <button class="gm-button gm-button-secondary" type="button" data-work-task="${escapeHtml(task.id)}" data-work-choice="${escapeHtml(choice.id)}">
                ${escapeHtml(choice.label)}
              </button>
            `).join("")}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderTeacherView() {
  const admin = state.data.admin;
  return `
    <section class="gm-grid-two">
      <article class="gm-panel">
        <div class="gm-panel-head">
          <div>
            <p class="gm-eyebrow">Teacher dashboard</p>
            <h2>Publish a new market</h2>
          </div>
          <img src="/assets/gold-market/new-market-published.png" alt="New market published graphic" style="width: 180px; border-radius: 18px;" />
        </div>
        <form class="gm-form" data-form="market-create">
          <label>
            Market question
            <input name="title" type="text" maxlength="120" placeholder="Will our school call a snow day tomorrow?" required />
          </label>
          <label>
            Context
            <textarea name="description" maxlength="280" placeholder="What information do students have right now?" required></textarea>
          </label>
          <div class="gm-grid-three">
            <label>
              Desk
              <input name="desk" type="text" maxlength="48" placeholder="Weather desk" />
            </label>
            <label>
              Category
              <input name="category" type="text" maxlength="48" placeholder="Evidence-led" />
            </label>
            <label>
              Opening YES line
              <input name="probability" type="number" min="5" max="95" value="50" required />
            </label>
          </div>
          <div class="gm-grid-two">
            <label>
              Evidence level
              <input name="evidence" type="number" min="0" max="100" value="60" required />
            </label>
            <label>
              Hype level
              <input name="hype" type="number" min="0" max="100" value="35" required />
            </label>
          </div>
          <div class="gm-inline-actions">
            <button class="gm-button" type="submit">Publish Market</button>
            <button class="gm-button gm-button-secondary" type="button" data-action="refill-wallets">Refill Wallet Floors</button>
          </div>
        </form>
      </article>

      <article class="gm-panel">
        <div class="gm-panel-head">
          <div>
            <p class="gm-eyebrow">Teacher login</p>
            <h2>Access settings</h2>
          </div>
        </div>
        <form class="gm-form" data-form="teacher-settings">
          <label>
            Teacher username
            <input name="teacherUsername" type="text" maxlength="20" value="${escapeHtml(admin.settings.teacherUsername)}" required />
          </label>
          <label>
            Current password
            <input name="currentPassword" type="password" placeholder="Needed only if changing login" />
          </label>
          <label>
            New password
            <input name="newPassword" type="password" minlength="4" placeholder="Leave blank to keep current password" />
          </label>
          <button class="gm-button gm-button-secondary" type="submit">Save Teacher Settings</button>
        </form>
      </article>
    </section>

    <section class="gm-panel">
      <div class="gm-panel-head">
        <div>
          <p class="gm-eyebrow">Results board</p>
          <h2>Student overview</h2>
        </div>
      </div>
      ${admin.students.length ? `
        <div class="gm-grid-three">
          ${admin.students.map((student) => `
            <article class="gm-roster-card">
              <div class="gm-card-top">
                <div>
                  <h3>${escapeHtml(student.displayName)}</h3>
                  <p class="gm-subtext">@${escapeHtml(student.username)}</p>
                </div>
                ${student.avatarPath ? `<img class="gm-student-avatar" src="${escapeHtml(student.avatarPath)}" alt="${escapeHtml(student.displayName)} avatar" />` : ""}
              </div>
              <div class="gm-summary-grid">
                <div class="gm-summary-line"><span>Wallet</span><strong>${formatMoney(student.cash)}</strong></div>
                <div class="gm-summary-line"><span>Trades</span><strong>${student.tradeCount}</strong></div>
                <div class="gm-summary-line"><span>Work days</span><strong>${student.workDaysCompleted}</strong></div>
                <div class="gm-summary-line"><span>Automatic A</span><strong>${student.stayInCashEligible ? "Yes" : "No"}</strong></div>
              </div>
            </article>
          `).join("")}
        </div>
      ` : `<div class="gm-empty">No student accounts yet.</div>`}
    </section>

    <section class="gm-panel">
      <div class="gm-panel-head">
        <div>
          <p class="gm-eyebrow">Published markets</p>
          <h2>Resolve and archive</h2>
        </div>
      </div>
      ${admin.predictionMarkets.length ? `
        <div class="gm-card-list">
          ${admin.predictionMarkets.map((market) => `
            <article class="gm-market-card">
              <div class="gm-card-top">
                <div>
                  <p class="gm-eyebrow">${escapeHtml(market.desk)}</p>
                  <h3>${escapeHtml(market.title)}</h3>
                </div>
                <span class="gm-chip">${market.status === "active" ? `${market.currentProbability}c YES` : `${market.status.toUpperCase()} ${market.resolution ? market.resolution.toUpperCase() : ""}`}</span>
              </div>
              <p class="gm-subtext">${escapeHtml(market.description)}</p>
              <div class="gm-stat-grid">
                <div class="gm-stat"><span>Evidence</span><strong>${market.evidence}</strong></div>
                <div class="gm-stat"><span>Hype</span><strong>${market.hype}</strong></div>
                <div class="gm-stat"><span>YES pool</span><strong>${market.yesPool}</strong></div>
                <div class="gm-stat"><span>NO pool</span><strong>${market.noPool}</strong></div>
              </div>
              <div class="gm-inline-actions">
                ${market.status === "active" ? `
                  <button class="gm-button" type="button" data-resolve-market="yes" data-market-id="${escapeHtml(market.id)}">Resolve YES</button>
                  <button class="gm-button gm-button-secondary" type="button" data-resolve-market="no" data-market-id="${escapeHtml(market.id)}">Resolve NO</button>
                ` : ""}
                ${market.status !== "archived" ? `
                  <button class="gm-button gm-button-danger" type="button" data-archive-market="true" data-market-id="${escapeHtml(market.id)}">Archive</button>
                ` : ""}
              </div>
            </article>
          `).join("")}
        </div>
      ` : `<div class="gm-empty">No custom markets published yet.</div>`}
    </section>
  `;
}

function isAuthenticated() {
  return Boolean(state.data?.viewerRole && state.data.viewerRole !== "guest");
}

function showToast(message) {
  if (!message) {
    return;
  }
  refs.toast.textContent = message;
  refs.toast.classList.remove("gm-hidden");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => {
    refs.toast.classList.add("gm-hidden");
  }, 3200);
}

async function getJson(url) {
  const response = await fetch(url, { credentials: "same-origin" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }
  return payload;
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }
  return payload;
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function formatCents(value) {
  return `${Math.round(Number(value || 0) * 100)}c`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
