(function () {
  const canvas = document.getElementById("ambient-canvas");
  const context = canvas?.getContext("2d");
  const particles = [];
  let animationTime = 0;
  let lastFrame = performance.now();
  let stateProvider = () => ({ mode: document.body.dataset.role || "landing" });
  const categoryIcons = {
    "Story starters": "✦", "Suspense and mystery": "◉", "Comedy": "☺", "Poetry — Rhyming": "♫",
    "Poetry — Free verse": "≈", "Finish the story": "…", "Connect the start and end": "↝",
    "Science fiction": "⌁", "Fantasy": "✧", "Realistic fiction": "◌", "Dialogue challenges": "“ ”",
    "Plot twists": "↻", "Character challenges": "◇", "Setting descriptions": "▣",
    "Perspective changes": "◐", "Extremely strange or absurd scenarios": "?!", "Custom": "✎"
  };

  function resizeCanvas() {
    if (!canvas) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function seedParticles() {
    if (particles.length) return;
    const colors = ["#6757d9", "#0e9f8d", "#f2a23a", "#e75a7c"];
    for (let index = 0; index < 34; index += 1) {
      particles.push({
        x: (index * 149) % Math.max(1, window.innerWidth),
        y: (index * 83) % Math.max(1, window.innerHeight),
        size: 2 + (index % 4),
        drift: 5 + (index % 7),
        color: colors[index % colors.length],
        phase: index * 0.7
      });
    }
  }

  function drawParticles() {
    if (!context || !canvas) return;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const celebration = document.body.classList.contains("celebrating") || document.body.classList.contains("landing-page");
    context.globalAlpha = celebration ? 0.28 : 0.11;
    particles.forEach((particle) => {
      const x = (particle.x + animationTime * particle.drift) % (window.innerWidth + 40) - 20;
      const y = particle.y + Math.sin(animationTime * 0.7 + particle.phase) * 18;
      context.fillStyle = particle.color;
      context.save();
      context.translate(x, y);
      context.rotate(animationTime + particle.phase);
      context.fillRect(-particle.size, -particle.size / 2, particle.size * 2, particle.size);
      context.restore();
    });
    context.globalAlpha = 1;
  }

  function step(ms) {
    animationTime += ms / 1000;
    drawParticles();
  }

  function frame(now) {
    const delta = Math.min(50, now - lastFrame);
    lastFrame = now;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) step(delta);
    requestAnimationFrame(frame);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
  }

  function avatarMarkup(avatar, className = "avatar-bubble", accessible = false) {
    if (!avatar) return "";
    const safeClass = String(className).replace(/[^a-zA-Z0-9 _-]/g, "").trim() || "avatar-bubble";
    const attributes = accessible
      ? `role="img" aria-label="${escapeHtml(avatar.label || "Profile")} avatar"`
      : 'aria-hidden="true"';
    if (avatar.src) return `<span class="${safeClass}" ${attributes}><img src="${escapeHtml(avatar.src)}" alt="" draggable="false"></span>`;
    return `<span class="${safeClass}" ${attributes}>${escapeHtml(avatar.emoji || "✦")}</span>`;
  }

  function formatTime(seconds) {
    const safe = Math.max(0, Math.ceil(seconds));
    return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
  }

  function remainingSeconds(round) {
    if (!round) return 0;
    if (round.pausedRemainingMs !== null && round.pausedRemainingMs !== undefined) return round.pausedRemainingMs / 1000;
    if (!round.endsAt) return 0;
    return (round.endsAt - Date.now()) / 1000;
  }

  function wordCount(text) {
    const trimmed = String(text || "").trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }

  function toast(message, type = "error") {
    const region = document.getElementById("toast-region");
    if (!region) return;
    const element = document.createElement("div");
    element.className = `toast ${type}`;
    element.textContent = message;
    region.appendChild(element);
    setTimeout(() => element.remove(), 4200);
  }

  function emit(socket, event, payload = {}) {
    return new Promise((resolve, reject) => {
      socket.timeout(7000).emit(event, payload, (timeoutError, response) => {
        if (timeoutError) return reject(new Error("The server did not respond. Check the connection and try again."));
        if (!response?.ok) return reject(new Error(response?.error || "Something went wrong."));
        resolve(response);
      });
    });
  }

  function setStateProvider(provider) { stateProvider = provider; }
  function categoryIcon(category) { return categoryIcons[category] || "✦"; }

  function renderGameToText() {
    const source = stateProvider() || {};
    const round = source.round || null;
    return JSON.stringify({
      coordinateSystem: "DOM interface; ambient canvas origin top-left, x right, y down",
      role: document.body.dataset.role || "landing",
      mode: source.phase || source.mode || "landing",
      code: source.code || null,
      playerCount: source.playerCount ?? null,
      maxPlayers: source.maxPlayers ?? null,
      round: source.roundNumber || 0,
      totalRounds: source.totalRounds || 0,
      timerSeconds: round ? Math.max(0, Math.ceil(remainingSeconds(round))) : null,
      prompt: round?.prompt?.text || null,
      submissionCount: round?.submissionCount ?? null,
      voterCount: round?.voterCount ?? null,
      presentation: round ? { index: round.presentationIndex, count: round.presentationCount, currentLabel: round.currentEntry?.label || null } : null,
      teams: (source.teams || []).map((team) => ({ name: team.name, score: team.score, rank: team.rank })),
      cooperativeStory: source.coop ? {
        submissionCount: source.coop.submissionCount,
        sectionCount: source.coop.sectionCount,
        currentSectionIndex: source.coop.currentSectionIndex,
        currentSection: source.coop.currentSection?.label || null,
        selections: (source.coop.selections || []).map((selection) => ({ sectionId: selection.sectionId, text: selection.text, studentName: selection.studentName })),
        storyParts: (source.coop.storyParts || []).map((part) => ({ label: part.label, bridge: part.bridge, text: part.text })),
        complete: Boolean(source.coop.complete)
      } : null,
      writerLeaders: source.playerLeaderboards?.visible ? {
        overall: source.playerLeaderboards.overall.slice(0, 5).map((entry) => ({ name: entry.name, totalPoints: entry.totalPoints, rank: entry.rank })),
        average: source.playerLeaderboards.average.slice(0, 5).map((entry) => ({ name: entry.name, averagePoints: entry.averagePoints, rank: entry.rank }))
      } : null,
      me: source.me ? { name: source.me.name, avatar: source.me.avatar?.id || null, teamId: source.me.teamId } : null
    });
  }

  function toggleTheme() {
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("storyShowdownTheme", dark ? "dark" : "light");
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (error) { toast("Fullscreen is not available in this browser."); }
  }

  if (localStorage.getItem("storyShowdownTheme") === "dark") document.documentElement.classList.add("dark");
  document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);
  document.getElementById("fullscreen-toggle")?.addEventListener("click", toggleFullscreen);
  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "f" && !["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) toggleFullscreen();
  });
  window.addEventListener("resize", () => { resizeCanvas(); seedParticles(); drawParticles(); });
  resizeCanvas();
  seedParticles();
  drawParticles();
  requestAnimationFrame(frame);

  window.StoryCommon = { escapeHtml, avatarMarkup, formatTime, remainingSeconds, wordCount, toast, emit, setStateProvider, categoryIcon };
  window.render_game_to_text = renderGameToText;
  window.advanceTime = (ms) => step(Math.max(0, Number(ms) || 0));
})();
