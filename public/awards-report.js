const reportRefs = {
  printButton: document.getElementById("print-report-button"),
  status: document.getElementById("report-status"),
  summary: document.getElementById("report-summary"),
  awards: document.getElementById("report-awards")
};

const reportDateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

reportRefs.printButton.addEventListener("click", () => {
  window.print();
});

loadAwardsReport();

async function loadAwardsReport() {
  try {
    const response = await fetch("/api/bootstrap", {
      credentials: "same-origin"
    });

    if (!response.ok) {
      throw new Error("Could not load the latest classroom data.");
    }

    const payload = await response.json();
    if (!payload?.isAdmin || !payload?.admin) {
      renderReportError(
        "Teacher login is required to view the awards report.",
        `<a class="button-link" href="/">Return to the main dashboard</a>`
      );
      return;
    }

    renderReport(payload.admin);
  } catch (error) {
    console.error(error);
    renderReportError(
      "The awards report could not be loaded right now.",
      `<a class="button-link" href="/">Return to the main dashboard</a>`
    );
  }
}

function renderReport(admin) {
  const awards = Array.isArray(admin.awards) ? admin.awards : [];
  const studentsById = new Map((admin.students || []).map((student) => [student.id, student]));
  const generatedAt = reportDateFormatter.format(new Date());
  const topStudentName = admin.metrics?.topStudent?.displayName || "No players yet";
  const topStudentScore = admin.metrics?.topStudent?.aggregateScore ?? null;

  reportRefs.status.classList.add("hidden");
  reportRefs.summary.classList.remove("hidden");
  reportRefs.awards.classList.remove("hidden");

  reportRefs.summary.innerHTML = `
    <div class="summary-grid report-summary-grid">
      <article class="hero-stat">
        <span class="eyebrow">Class Snapshot</span>
        <strong>${escapeHtml(topStudentName)}</strong>
        <div class="stat-subline">
          <span>${topStudentScore !== null ? `Top score ${formatScore(topStudentScore)}` : "No score yet"}</span>
          <span>${admin.metrics?.studentCount || 0} students</span>
        </div>
      </article>
      <div class="mini-grid summary-mini-grid">
        <div class="mini-stat"><span>Average Revenue</span><strong>${formatRevenue(admin.metrics?.averageSales || 0)}</strong></div>
        <div class="mini-stat"><span>Average Morale</span><strong>${formatPercent(admin.metrics?.averageMorale || 0)}</strong></div>
        <div class="mini-stat"><span>Awards Listed</span><strong>${awards.length}</strong></div>
        <div class="mini-stat"><span>Generated</span><strong>${escapeHtml(generatedAt)}</strong></div>
      </div>
    </div>
  `;

  if (!awards.length) {
    reportRefs.awards.innerHTML = `
      <article class="card">
        <div class="section-head">
          <p class="eyebrow">Awards</p>
          <h2>No awards generated yet</h2>
        </div>
        <p class="note">Once the class has student data, personalized awards will appear here and can be saved as a PDF.</p>
      </article>
    `;
    return;
  }

  reportRefs.awards.innerHTML = `
    <section class="award-board report-award-board">
      <div class="section-head">
        <p class="eyebrow">Class Awards</p>
        <h2>Personalized awards for this session</h2>
      </div>
      <div class="report-award-grid">
        ${awards
          .map((award, index) => renderReportAwardCard(award, studentsById.get(award.studentId), index + 1))
          .join("")}
      </div>
    </section>
  `;
}

function renderReportAwardCard(award, student, order) {
  const revenue = student?.sales ?? 0;
  const score = student?.aggregateScore ?? 0;
  const avgMorale = student?.avgMorale ?? 0;
  const avgTrust = student?.avgTrust ?? 0;

  return `
    <article class="award-card report-award-card">
      <div class="award-topline">
        <div>
          <p class="eyebrow">Award ${order}</p>
          <strong>${escapeHtml(award.title)}</strong>
          <div class="subtext">${escapeHtml(award.subtitle)}</div>
        </div>
        <span class="pill pill-neutral">${escapeHtml(award.studentName)}</span>
      </div>
      <p class="note">${escapeHtml(award.reason)}</p>
      <div class="history-impact report-impact-grid">
        <span class="impact-chip ${revenue >= 0 ? "positive" : "negative"}">Revenue ${formatSignedRevenue(revenue)}</span>
        <span class="impact-chip ${score >= 0 ? "positive" : "negative"}">Score ${formatSigned(score)}</span>
        <span class="impact-chip ${avgMorale >= 50 ? "positive" : "negative"}">Morale ${formatPercent(avgMorale)}</span>
        <span class="impact-chip ${avgTrust >= 50 ? "positive" : "negative"}">Trust ${formatPercent(avgTrust)}</span>
      </div>
    </article>
  `;
}

function renderReportError(message, actionMarkup) {
  reportRefs.status.classList.remove("hidden");
  reportRefs.summary.classList.add("hidden");
  reportRefs.awards.classList.add("hidden");
  reportRefs.status.innerHTML = `
    <div class="section-head">
      <p class="eyebrow">Awards Report</p>
      <h2>Unable to load</h2>
    </div>
    <p class="note">${escapeHtml(message)}</p>
    <div class="action-row">
      ${actionMarkup}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "\"":
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}

function formatRevenue(value) {
  return `$${Math.round(Number(value || 0)).toLocaleString()}`;
}

function formatSignedRevenue(value) {
  const amount = Math.round(Number(value || 0));
  const prefix = amount >= 0 ? "+" : "-";
  return `${prefix}$${Math.abs(amount).toLocaleString()}`;
}

function formatPercent(value) {
  return `${Math.round(Number(value || 0))}%`;
}

function formatScore(value) {
  return Math.round(Number(value || 0)).toLocaleString();
}

function formatSigned(value) {
  const amount = Math.round(Number(value || 0));
  return `${amount >= 0 ? "+" : ""}${amount.toLocaleString()}`;
}
