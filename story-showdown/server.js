const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { prompts: starterPrompts, categories } = require("./prompts");
const { AVATAR_CHOICES, normalizeAvatarId, avatarFor } = require("./public/avatars");
const { COOP_SECTIONS, normalizeCoopSentence, buildCoopStory, coopStoryText } = require("./public/coop");

const PORT = Number(process.env.PORT || 3040);
const HOST = process.env.HOST || "0.0.0.0";
const DATA_FILE = process.env.STORY_SHOWDOWN_DATA_FILE || (process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, "games.json")
  : path.join(__dirname, "data", "games.json"));
const MAX_GAMES = Number(process.env.MAX_GAMES || 100);
const MAX_PLAYERS_PER_GAME = 30;
const JOIN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TEAM_NAMES = [
  "Plot Twisters", "Ink Sparks", "Cliffhanger Crew", "Syntax Syndicate",
  "Metaphor Makers", "Draft Dodgers", "Story Storm", "Narrative Ninjas",
  "Comma Collective", "Page Turners", "Wild Wordsmiths", "Fiction Fusion"
];
const TEAM_COLORS = ["#6757d9", "#e75a7c", "#0e9f8d", "#f29d38", "#3185d7", "#8b5fbf", "#dc6b35", "#3d8f5f"];
const PLACEMENT_POINTS = { 1: 1000, 2: 750, 3: 500 };
const FLAG_TERMS = ["fuck", "shit", "bitch", "asshole", "damn", "slut", "whore"];

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: false }, maxHttpBufferSize: 250_000 });

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

let games = new Map();
let persistTimer = null;

function cleanText(value, max = 4000) {
  return String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
}

function token(bytes = 24) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function randomCode() {
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    let code = "";
    for (let i = 0; i < 5; i += 1) code += JOIN_ALPHABET[crypto.randomInt(JOIN_ALPHABET.length)];
    if (!games.has(code)) return code;
  }
  throw new Error("Could not create a unique game code.");
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function publicPlayer(player) {
  return {
    id: player.id,
    name: player.name,
    avatar: avatarFor(player.avatarId),
    teamId: player.teamId,
    connected: Boolean(player.connected)
  };
}

function publicTeam(team, revealNames = true) {
  return {
    id: team.id,
    name: team.name,
    color: team.color,
    score: team.score,
    lastRoundPoints: team.lastRoundPoints || 0,
    rank: team.rank || 1,
    winners: (team.winners || []).map((winner) => ({
      ...winner,
      studentName: revealNames ? winner.studentName : "Anonymous writer",
      avatar: revealNames && winner.avatarId ? avatarFor(winner.avatarId) : null
    }))
  };
}

function makeTeams(count) {
  return shuffle(TEAM_NAMES).slice(0, count).map((name, index) => ({
    id: `team-${index + 1}`,
    name,
    color: TEAM_COLORS[index % TEAM_COLORS.length],
    score: 0,
    lastRoundPoints: 0,
    rank: index + 1,
    winners: []
  }));
}

function normalizeSettings(input = {}) {
  const teamCount = Math.max(2, Math.min(8, Number(input.teamCount) || 4));
  const totalRounds = Math.max(1, Math.min(10, Number(input.totalRounds) || 3));
  const defaultDuration = [120, 240, 360].includes(Number(input.defaultDuration)) ? Number(input.defaultDuration) : 240;
  return {
    gameMode: input.gameMode === "cooperative" ? "cooperative" : "competitive",
    teamCount,
    totalRounds,
    defaultDuration,
    promptMode: input.promptMode === "manual" ? "manual" : "random",
    revealNames: input.revealNames !== false,
    joiningLocked: false
  };
}

function createGame(input = {}) {
  if (games.size >= MAX_GAMES) {
    const oldest = [...games.values()].sort((a, b) => a.updatedAt - b.updatedAt)[0];
    if (oldest) games.delete(oldest.code);
  }
  const code = randomCode();
  const settings = normalizeSettings(input);
  const game = {
    version: 1,
    code,
    teacherToken: token(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    phase: "lobby",
    settings,
    teams: makeTeams(settings.teamCount),
    players: {},
    roundNumber: 0,
    currentRound: null,
    coopSession: null,
    roundHistory: [],
    draftPrompt: null,
    customPrompts: [],
    recentlyUsedPromptIds: [],
    notice: "Game created. Share the code when you are ready."
  };
  games.set(code, game);
  changed(game);
  return game;
}

function loadGames() {
  try {
    if (!fs.existsSync(DATA_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    for (const raw of parsed.games || []) {
      if (!raw.code || !raw.teacherToken) continue;
      raw.players ||= {};
      const joiningLocked = Boolean(raw.settings?.joiningLocked);
      raw.settings = { ...normalizeSettings(raw.settings || {}), joiningLocked };
      raw.coopSession ||= null;
      for (const player of Object.values(raw.players)) {
        player.avatarId = normalizeAvatarId(player.avatarId);
        player.coopDraft ||= {};
        player.connected = false;
        delete player.socketId;
      }
      raw.updatedAt ||= Date.now();
      games.set(raw.code, raw);
    }
  } catch (error) {
    console.error("Could not load persisted games:", error.message);
  }
}

function persistNow() {
  persistTimer = null;
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    const payload = JSON.stringify({ savedAt: Date.now(), games: [...games.values()] }, null, 2);
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, payload);
    fs.renameSync(tempFile, DATA_FILE);
  } catch (error) {
    console.error("Could not persist games:", error.message);
  }
}

function changed(game) {
  game.updatedAt = Date.now();
  if (!persistTimer) persistTimer = setTimeout(persistNow, 150);
}

function getGame(code) {
  return games.get(cleanText(code, 8).toUpperCase());
}

function requireTeacher(code, teacherToken) {
  const game = getGame(code);
  if (!game) throw new Error("Game not found.");
  const supplied = Buffer.from(String(teacherToken || ""));
  const expected = Buffer.from(String(game.teacherToken));
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) throw new Error("Teacher authorization failed.");
  return game;
}

function activeRound(game) {
  if (!game.currentRound) throw new Error("There is no active round.");
  return game.currentRound;
}

function assignTeams(game) {
  const players = shuffle(Object.values(game.players));
  players.forEach((player, index) => { player.teamId = game.teams[index % game.teams.length].id; });
}

function updateRanks(game) {
  const sorted = [...game.teams].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  let lastScore = null;
  let lastRank = 0;
  sorted.forEach((team, index) => {
    if (team.score !== lastScore) lastRank = index + 1;
    team.rank = lastRank;
    lastScore = team.score;
  });
}

function promptPool(game, filters = {}) {
  const all = [...starterPrompts, ...game.customPrompts];
  return all.filter((prompt) =>
    (!filters.category || filters.category === "all" || prompt.category === filters.category) &&
    (!filters.responseLength || filters.responseLength === "all" || prompt.responseLength === filters.responseLength)
  );
}

function randomPrompt(game, filters = {}) {
  const pool = promptPool(game, filters);
  if (!pool.length) throw new Error("No prompts match those filters.");
  const fresh = pool.filter((prompt) => !game.recentlyUsedPromptIds.includes(prompt.id));
  return (fresh.length ? fresh : pool)[crypto.randomInt((fresh.length ? fresh : pool).length)];
}

function makeRound(game, prompt, duration) {
  return {
    id: token(8),
    number: game.roundNumber,
    prompt: { ...prompt, text: cleanText(prompt.text, 1200) },
    durationSeconds: Math.max(30, Math.min(900, Number(duration) || prompt.timerSeconds || game.settings.defaultDuration)),
    startedAt: null,
    endsAt: null,
    pausedRemainingMs: null,
    submissions: {},
    presentationOrder: [],
    presentationIndex: 0,
    presentedIds: [],
    votes: {},
    results: [],
    votingOpen: false,
    tieContext: null,
    tiebreaker: null,
    baseCounts: null,
    revealCount: 0
  };
}

function makeCoopSession() {
  const now = Date.now();
  return {
    id: token(8),
    durationSeconds: 300,
    startedAt: now,
    endsAt: now + 300_000,
    pausedRemainingMs: null,
    submissions: {},
    selections: [],
    currentSectionIndex: 0
  };
}

function activeCoop(game) {
  if (!game.coopSession) throw new Error("There is no cooperative story in progress.");
  return game.coopSession;
}

function cleanCoopAnswers(input = {}, polish = false) {
  return Object.fromEntries(COOP_SECTIONS.map((section) => {
    const cleaned = cleanText(input?.[section.id], 360);
    return [section.id, polish ? normalizeCoopSentence(cleaned) : cleaned];
  }));
}

function submitCoopPlayer(game, player, answers, automatic = false) {
  if (game.phase !== "coop_writing") throw new Error("Cooperative writing is not open.");
  const session = activeCoop(game);
  const cleaned = cleanCoopAnswers(answers, true);
  const missing = COOP_SECTIONS.filter((section) => !cleaned[section.id]);
  if (!automatic && missing.length) throw new Error(`Complete every story ingredient before submitting. ${missing.length} still need an idea.`);
  player.coopDraft = { ...cleaned };
  session.submissions[player.id] = {
    playerId: player.id,
    answers: cleaned,
    submittedAt: Date.now(),
    automatic: Boolean(automatic)
  };
}

function endCoopWriting(game, automatic = false) {
  if (game.phase !== "coop_writing") return;
  const session = activeCoop(game);
  for (const player of Object.values(game.players)) {
    if (!session.submissions[player.id]) submitCoopPlayer(game, player, player.coopDraft || {}, true);
  }
  session.endsAt = Date.now();
  session.pausedRemainingMs = null;
  game.phase = "coop_spin";
  game.notice = automatic
    ? "Time is up. Every saved idea is in the Story Machine."
    : "Ideas collected. Spin one story ingredient at a time.";
}

function coopCandidates(game, sectionId) {
  const section = COOP_SECTIONS.find((item) => item.id === sectionId);
  if (!section) throw new Error("Story section not found.");
  const session = activeCoop(game);
  const candidates = Object.values(session.submissions).flatMap((submission) => {
    const text = normalizeCoopSentence(submission.answers?.[sectionId]);
    if (!text) return [];
    const player = game.players[submission.playerId];
    return [{
      id: `${sectionId}-${submission.playerId}`,
      sectionId,
      playerId: submission.playerId,
      studentName: player?.name || "A classmate",
      avatarId: player?.avatarId || null,
      text
    }];
  });
  if (candidates.length) return candidates;
  return [{
    id: `${sectionId}-fallback`,
    sectionId,
    playerId: null,
    studentName: "Story Machine",
    avatarId: null,
    text: section.fallback
  }];
}

function publicCoopSelection(selection) {
  return {
    id: selection.id,
    sectionId: selection.sectionId,
    playerId: selection.playerId,
    studentName: selection.studentName,
    avatar: selection.avatarId ? avatarFor(selection.avatarId) : null,
    text: normalizeCoopSentence(selection.text)
  };
}

function coopSnapshot(game, { teacher = false, player = null } = {}) {
  if (!game.coopSession) return null;
  const session = game.coopSession;
  const selections = session.selections.map(publicCoopSelection);
  const snapshot = {
    id: session.id,
    durationSeconds: session.durationSeconds,
    startedAt: session.startedAt,
    endsAt: session.endsAt,
    pausedRemainingMs: session.pausedRemainingMs,
    submissionCount: Object.keys(session.submissions).length,
    sectionCount: COOP_SECTIONS.length,
    sections: COOP_SECTIONS,
    currentSectionIndex: session.currentSectionIndex,
    currentSection: COOP_SECTIONS[session.currentSectionIndex] || null,
    selections,
    storyParts: buildCoopStory(selections),
    storyText: coopStoryText(selections),
    complete: session.currentSectionIndex >= COOP_SECTIONS.length
  };
  if (teacher) {
    snapshot.candidatesBySection = Object.fromEntries(COOP_SECTIONS.map((section) => [
      section.id,
      coopCandidates(game, section.id).map(publicCoopSelection)
    ]));
  }
  if (player) {
    snapshot.myDraft = player.coopDraft || {};
    const submission = session.submissions[player.id];
    snapshot.mySubmission = submission ? { answers: submission.answers, automatic: Boolean(submission.automatic) } : null;
  }
  return snapshot;
}

function inappropriateFlags(text) {
  const lower = ` ${String(text).toLowerCase()} `;
  const hits = FLAG_TERMS.filter((term) => new RegExp(`\\b${term}\\b`, "i").test(lower));
  const excessiveCaps = String(text).length > 40 && String(text).replace(/[^A-Z]/g, "").length / Math.max(1, String(text).replace(/[^A-Za-z]/g, "").length) > 0.8;
  return [...hits.map(() => "possible inappropriate language"), ...(excessiveCaps ? ["excessive capitalization"] : [])];
}

function submitPlayer(game, player, text, automatic = false) {
  const round = activeRound(game);
  if (game.phase !== "writing") throw new Error("Writing is not open.");
  const cleaned = cleanText(text, 12000);
  round.submissions[player.id] = {
    id: round.submissions[player.id]?.id || token(8),
    playerId: player.id,
    teamId: player.teamId,
    text: cleaned,
    submittedAt: Date.now(),
    automatic,
    hidden: false,
    disqualified: false,
    flags: inappropriateFlags(cleaned),
    editedByTeacher: false
  };
}

function endWriting(game, automatic = false) {
  if (game.phase !== "writing") return;
  const round = activeRound(game);
  for (const player of Object.values(game.players)) {
    if (!round.submissions[player.id]) submitPlayer(game, player, player.draftText || "", automatic);
  }
  game.phase = "review";
  game.notice = automatic ? "Time expired. Responses were submitted automatically." : "Writing ended. Review responses privately.";
  round.endsAt = Date.now();
  round.pausedRemainingMs = null;
}

function visibleSubmissions(round) {
  return Object.values(round.submissions).filter((submission) => !submission.hidden && !submission.disqualified && submission.text.trim());
}

function labelFor(index) {
  let n = index;
  let label = "";
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return `Entry ${label}`;
}

function entryFor(game, submission, includeAuthor = false) {
  const round = game.currentRound;
  const index = round.presentationOrder.indexOf(submission.id);
  const player = game.players[submission.playerId];
  const team = game.teams.find((item) => item.id === submission.teamId);
  const entry = {
    id: submission.id,
    label: labelFor(Math.max(0, index)),
    text: submission.text,
    hidden: submission.hidden,
    disqualified: submission.disqualified,
    flags: submission.flags || [],
    automatic: Boolean(submission.automatic),
    editedByTeacher: Boolean(submission.editedByTeacher)
  };
  if (includeAuthor) {
    entry.playerId = submission.playerId;
    entry.studentName = player?.name || "Former student";
    entry.teamId = team?.id || submission.teamId;
    entry.teamName = team?.name || "Unknown team";
    entry.teamColor = team?.color || "#777";
  }
  return entry;
}

function countVotes(round) {
  const counts = {};
  for (const submission of visibleSubmissions(round)) counts[submission.id] = 0;
  for (const submissionId of Object.values(round.votes)) {
    if (Object.hasOwn(counts, submissionId)) counts[submissionId] += 1;
  }
  return counts;
}

function findTie(counts, allowedIds = null) {
  const ids = (allowedIds || Object.keys(counts)).filter((id) => Object.hasOwn(counts, id));
  const sorted = ids.sort((a, b) => counts[b] - counts[a]);
  for (let index = 0; index < Math.min(sorted.length, 3); index += 1) {
    const tied = sorted.filter((id) => counts[id] === counts[sorted[index]]);
    const firstIndex = sorted.indexOf(tied[0]);
    if (tied.length > 1 && firstIndex < 3) return { ids: tied, placement: firstIndex + 1, voteCount: counts[tied[0]] };
  }
  return null;
}

function archiveCurrentRound(game) {
  const round = game.currentRound;
  const existing = game.roundHistory.findIndex((item) => item.id === round.id);
  const archived = JSON.parse(JSON.stringify(round));
  if (existing >= 0) game.roundHistory[existing] = archived;
  else game.roundHistory.push(archived);
}

function awardResults(game, counts, allowSharedTies = false) {
  const round = activeRound(game);
  const submissions = visibleSubmissions(round);
  const sorted = submissions.sort((a, b) => counts[b.id] - counts[a.id] || round.presentationOrder.indexOf(a.id) - round.presentationOrder.indexOf(b.id));
  const results = [];
  let placement = 0;
  let previousCount = null;
  sorted.forEach((submission, index) => {
    if (counts[submission.id] !== previousCount) placement = index + 1;
    previousCount = counts[submission.id];
    if (placement > 3) return;
    if (!allowSharedTies && index > 0 && counts[submission.id] === counts[sorted[index - 1].id]) return;
    const player = game.players[submission.playerId];
    const team = game.teams.find((item) => item.id === submission.teamId);
    const points = PLACEMENT_POINTS[placement];
    if (!player || !team || !points) return;
    team.score += points;
    team.lastRoundPoints += points;
    team.winners.push({ round: game.roundNumber, placement, studentName: player.name, playerId: player.id, avatarId: player.avatarId, points });
    results.push({
      placement,
      submissionId: submission.id,
      votes: Math.floor(counts[submission.id]),
      points,
      studentName: player.name,
      playerId: player.id,
      avatarId: player.avatarId,
      teamId: team.id,
      teamName: team.name,
      teamColor: team.color,
      label: labelFor(round.presentationOrder.indexOf(submission.id)),
      text: submission.text
    });
  });
  round.results = results.sort((a, b) => a.placement - b.placement);
  round.votingOpen = false;
  round.tieContext = null;
  round.revealCount = 0;
  game.phase = "results";
  game.notice = "Voting is closed. Reveal the winners from third place to first.";
  updateRanks(game);
  archiveCurrentRound(game);
}

function closeVoting(game) {
  const round = activeRound(game);
  if (game.phase !== "voting") throw new Error("Voting is not open.");
  const liveCounts = countVotes(round);
  if (round.tiebreaker) {
    const tieIds = round.tiebreaker.ids;
    const highest = Math.max(...tieIds.map((id) => liveCounts[id] || 0));
    const winners = tieIds.filter((id) => (liveCounts[id] || 0) === highest);
    if (winners.length > 1) {
      round.tieContext = { ids: winners, placement: round.tiebreaker.placement, voteCount: highest, repeated: true };
      game.phase = "tie";
      round.votingOpen = false;
      game.notice = "The tiebreaker is still tied. Choose another resolution.";
      return;
    }
    const counts = { ...round.tiebreaker.originalCounts };
    counts[winners[0]] += 0.01;
    round.baseCounts = counts;
    round.tiebreaker = null;
    const remainingTie = findTie(counts);
    if (remainingTie) {
      round.tieContext = remainingTie;
      game.phase = "tie";
      round.votingOpen = false;
      return;
    }
    awardResults(game, counts, false);
    return;
  }
  round.baseCounts = liveCounts;
  const tie = findTie(liveCounts);
  if (tie) {
    round.tieContext = tie;
    round.votingOpen = false;
    game.phase = "tie";
    game.notice = "A placement tie needs the teacher’s decision.";
    return;
  }
  awardResults(game, liveCounts, false);
}

function scoreboard(game) {
  updateRanks(game);
  return game.teams.map((team) => publicTeam(team, game.settings.revealNames)).sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));
}

function rankPlayerStats(entries, metric, secondaryMetric) {
  const sorted = [...entries].sort((a, b) =>
    b[metric] - a[metric] ||
    b[secondaryMetric] - a[secondaryMetric] ||
    b.podiums - a.podiums ||
    a.name.localeCompare(b.name)
  );
  let previous = null;
  let rank = 0;
  return sorted.map((entry, index) => {
    if (entry[metric] !== previous) rank = index + 1;
    previous = entry[metric];
    return { ...entry, rank };
  });
}

function playerLeaderboards(game) {
  const completedRounds = game.roundHistory || [];
  const entries = Object.values(game.players).map((player) => {
    let totalPoints = 0;
    let roundsPlayed = 0;
    let podiums = 0;
    let firstPlaces = 0;
    for (const round of completedRounds) {
      if (round.submissions?.[player.id]) roundsPlayed += 1;
      const result = (round.results || []).find((item) => item.playerId === player.id);
      if (!result) continue;
      totalPoints += Number(result.points) || 0;
      podiums += 1;
      if (result.placement === 1) firstPlaces += 1;
    }
    const team = game.teams.find((item) => item.id === player.teamId);
    return {
      playerId: player.id,
      name: player.name,
      avatar: avatarFor(player.avatarId),
      teamId: player.teamId,
      teamName: team?.name || "Unassigned",
      teamColor: team?.color || "#777",
      totalPoints,
      averagePoints: roundsPlayed ? Math.round(totalPoints / roundsPlayed * 10) / 10 : 0,
      roundsPlayed,
      podiums,
      firstPlaces
    };
  });
  return {
    visible: Boolean(game.settings.revealNames),
    roundsCompleted: completedRounds.length,
    overall: game.settings.revealNames ? rankPlayerStats(entries, "totalPoints", "averagePoints") : [],
    average: game.settings.revealNames ? rankPlayerStats(entries, "averagePoints", "totalPoints") : []
  };
}

function resultFor(game, result) {
  const revealNames = game.settings.revealNames;
  const player = game.players[result.playerId];
  const avatarId = result.avatarId || player?.avatarId;
  return {
    ...result,
    studentName: revealNames ? result.studentName : "Anonymous writer",
    avatar: revealNames && avatarId ? avatarFor(avatarId) : null
  };
}

function baseSnapshot(game) {
  const round = game.currentRound;
  const resultPlacements = round ? [...new Set((round.results || []).map((result) => result.placement))].sort((a, b) => b - a) : [];
  return {
    code: game.code,
    phase: game.phase,
    settings: game.settings,
    roundNumber: game.roundNumber,
    totalRounds: game.settings.totalRounds,
    teams: scoreboard(game),
    playerCount: Object.keys(game.players).length,
    maxPlayers: MAX_PLAYERS_PER_GAME,
    connectedCount: Object.values(game.players).filter((player) => player.connected).length,
    notice: game.notice,
    coop: coopSnapshot(game),
    round: round ? {
      id: round.id,
      number: round.number,
      prompt: round.prompt,
      durationSeconds: round.durationSeconds,
      startedAt: round.startedAt,
      endsAt: round.endsAt,
      pausedRemainingMs: round.pausedRemainingMs,
      submissionCount: Object.keys(round.submissions).length,
      presentationIndex: round.presentationIndex,
      presentationCount: round.presentationOrder.length,
      presentedCount: round.presentedIds.length,
      votingOpen: round.votingOpen,
      voterCount: Object.keys(round.votes).length,
      revealCount: round.revealCount,
      resultPlacementCount: resultPlacements.length,
      nextRevealPlacement: resultPlacements[round.revealCount] || null
    } : null
  };
}

function teacherSnapshot(game) {
  const snapshot = baseSnapshot(game);
  snapshot.coop = coopSnapshot(game, { teacher: true });
  snapshot.players = Object.values(game.players).map(publicPlayer).sort((a, b) => a.name.localeCompare(b.name));
  if (["pre_round", "leaderboard", "final"].includes(game.phase)) snapshot.playerLeaderboards = playerLeaderboards(game);
  snapshot.promptBank = starterPrompts;
  snapshot.categories = categories;
  snapshot.customPrompts = game.customPrompts;
  snapshot.draftPrompt = game.draftPrompt;
  snapshot.roundHistory = game.roundHistory.map((round) => ({
    id: round.id,
    number: round.number,
    prompt: round.prompt,
    results: (round.results || []).map((result) => resultFor(game, result))
  }));
  if (game.currentRound) {
    const round = game.currentRound;
    snapshot.round.submissions = Object.values(round.submissions).map((submission) => entryFor(game, submission, true));
    snapshot.round.presentationOrder = round.presentationOrder;
    snapshot.round.currentEntry = round.presentationOrder.length ? entryFor(game, Object.values(round.submissions).find((item) => item.id === round.presentationOrder[round.presentationIndex]), false) : null;
    const revealedPlacements = [...new Set((round.results || []).map((result) => result.placement))]
      .sort((a, b) => b - a)
      .slice(0, round.revealCount);
    snapshot.round.results = (game.phase === "results"
      ? round.results.filter((result) => revealedPlacements.includes(result.placement))
      : round.results).map((result) => resultFor(game, result));
    snapshot.round.tieContext = round.tieContext ? {
      ...round.tieContext,
      entries: round.tieContext.ids.map((id) => entryFor(game, Object.values(round.submissions).find((item) => item.id === id), true))
    } : null;
  }
  return snapshot;
}

function studentSnapshot(game, player) {
  const snapshot = baseSnapshot(game);
  snapshot.me = publicPlayer(player);
  snapshot.coop = coopSnapshot(game, { player });
  if (["pre_round", "leaderboard", "final"].includes(game.phase)) snapshot.playerLeaderboards = playerLeaderboards(game);
  snapshot.players = ["lobby", "team_reveal", "pre_round", "leaderboard", "final"].includes(game.phase)
    ? Object.values(game.players).map(publicPlayer)
    : [];
  if (!game.currentRound) return snapshot;
  const round = game.currentRound;
  snapshot.round.myDraft = player.draftText || "";
  snapshot.round.mySubmission = round.submissions[player.id] ? entryFor(game, round.submissions[player.id], false) : null;
  if (["presentation", "voting", "tie", "results", "leaderboard", "final"].includes(game.phase)) {
    snapshot.round.entries = round.presentationOrder.map((id) => {
      const submission = Object.values(round.submissions).find((item) => item.id === id);
      return submission && !submission.hidden && !submission.disqualified ? { ...entryFor(game, submission, false), own: submission.playerId === player.id } : null;
    }).filter(Boolean);
  }
  if (game.phase === "presentation") {
    const currentId = round.presentationOrder[round.presentationIndex];
    const submission = Object.values(round.submissions).find((item) => item.id === currentId);
    snapshot.round.currentEntry = submission && !submission.hidden && !submission.disqualified ? entryFor(game, submission, false) : null;
  }
  if (game.phase === "voting") {
    const eligibleIds = round.tiebreaker?.ids || round.presentationOrder;
    snapshot.round.entries = snapshot.round.entries.filter((entry) => eligibleIds.includes(entry.id));
    snapshot.round.myVote = round.votes[player.id] || null;
    snapshot.round.tiebreaker = Boolean(round.tiebreaker);
  }
  if (["results", "leaderboard", "final"].includes(game.phase)) {
    const revealedPlacements = [...new Set(round.results.map((result) => result.placement))]
      .sort((a, b) => b - a)
      .slice(0, round.revealCount);
    const visibleResults = game.phase === "results" ? round.results.filter((result) => revealedPlacements.includes(result.placement)) : round.results;
    snapshot.round.results = visibleResults.map((result) => resultFor(game, result));
  }
  return snapshot;
}

function emitGame(game) {
  for (const socket of io.sockets.sockets.values()) {
    if (socket.data.code !== game.code) continue;
    if (socket.data.role === "teacher") socket.emit("state", teacherSnapshot(game));
    if (socket.data.role === "student") {
      const player = game.players[socket.data.playerId];
      if (player) socket.emit("state", studentSnapshot(game, player));
    }
  }
}

function success(ack, data = {}) {
  if (typeof ack === "function") ack({ ok: true, ...data });
}

function failure(ack, error) {
  if (typeof ack === "function") ack({ ok: false, error: error instanceof Error ? error.message : String(error) });
}

function teacherHandler(socket, event, handler) {
  socket.on(event, (payload = {}, ack) => {
    try {
      const game = requireTeacher(payload.code, payload.teacherToken);
      const result = handler(game, payload, socket) || {};
      changed(game);
      emitGame(game);
      success(ack, result);
    } catch (error) { failure(ack, error); }
  });
}

io.on("connection", (socket) => {
  socket.on("game:create", (payload = {}, ack) => {
    try {
      const game = createGame(payload.settings || {});
      socket.data = { role: "teacher", code: game.code };
      socket.join(game.code);
      success(ack, { code: game.code, teacherToken: game.teacherToken, state: teacherSnapshot(game) });
    } catch (error) { failure(ack, error); }
  });

  socket.on("teacher:connect", (payload = {}, ack) => {
    try {
      const game = requireTeacher(payload.code, payload.teacherToken);
      socket.data = { role: "teacher", code: game.code };
      socket.join(game.code);
      success(ack, { state: teacherSnapshot(game) });
    } catch (error) { failure(ack, error); }
  });

  socket.on("student:join", (payload = {}, ack) => {
    try {
      const game = getGame(payload.code);
      if (!game) throw new Error("That game code was not found.");
      let player = Object.values(game.players).find((item) => item.sessionToken === payload.sessionToken);
      if (!player) {
        if (game.settings.joiningLocked) throw new Error("Joining is currently locked.");
        if (!["lobby", "team_reveal", "pre_round"].includes(game.phase)) throw new Error("This game is already in progress. Rejoin from the same browser to continue.");
        if (Object.keys(game.players).length >= MAX_PLAYERS_PER_GAME) throw new Error(`This game is full. Up to ${MAX_PLAYERS_PER_GAME} students can play.`);
        const name = cleanText(payload.name, 24);
        if (name.length < 2) throw new Error("Enter a name with at least two characters.");
        if (Object.values(game.players).some((item) => item.name.toLowerCase() === name.toLowerCase())) throw new Error("That name is already being used in this game.");
        player = {
          id: token(8), sessionToken: token(), name,
          avatarId: normalizeAvatarId(payload.avatarId),
          teamId: null, connected: true, joinedAt: Date.now(), draftText: "", coopDraft: {}
        };
        game.players[player.id] = player;
        if (game.phase !== "lobby" && game.teams.length) {
          const sizes = game.teams.map((team) => ({ team, count: Object.values(game.players).filter((item) => item.teamId === team.id).length }));
          sizes.sort((a, b) => a.count - b.count);
          player.teamId = sizes[0].team.id;
        }
      }
      if (payload.avatarId) player.avatarId = normalizeAvatarId(payload.avatarId);
      player.connected = true;
      player.socketId = socket.id;
      socket.data = { role: "student", code: game.code, playerId: player.id };
      socket.join(game.code);
      changed(game);
      emitGame(game);
      success(ack, { sessionToken: player.sessionToken, state: studentSnapshot(game, player) });
    } catch (error) { failure(ack, error); }
  });

  socket.on("student:draft", (payload = {}, ack) => {
    try {
      const game = getGame(socket.data.code);
      const player = game?.players[socket.data.playerId];
      if (!game || !player) throw new Error("Reconnect to the game first.");
      if (game.phase !== "writing" || game.currentRound?.submissions[player.id]) throw new Error("This response can no longer be edited.");
      player.draftText = cleanText(payload.text, 12000);
      changed(game);
      success(ack);
    } catch (error) { failure(ack, error); }
  });

  socket.on("student:submit", (payload = {}, ack) => {
    try {
      const game = getGame(socket.data.code);
      const player = game?.players[socket.data.playerId];
      if (!game || !player) throw new Error("Reconnect to the game first.");
      if (game.currentRound?.submissions[player.id]) throw new Error("Your response has already been submitted.");
      player.draftText = cleanText(payload.text, 12000);
      submitPlayer(game, player, player.draftText, false);
      changed(game);
      emitGame(game);
      success(ack);
    } catch (error) { failure(ack, error); }
  });

  socket.on("student:coop-draft", (payload = {}, ack) => {
    try {
      const game = getGame(socket.data.code);
      const player = game?.players[socket.data.playerId];
      if (!game || !player) throw new Error("Reconnect to the game first.");
      const session = activeCoop(game);
      if (game.phase !== "coop_writing" || session.submissions[player.id]) throw new Error("These story ingredients can no longer be edited.");
      player.coopDraft = cleanCoopAnswers(payload.answers || {});
      changed(game);
      success(ack);
    } catch (error) { failure(ack, error); }
  });

  socket.on("student:coop-submit", (payload = {}, ack) => {
    try {
      const game = getGame(socket.data.code);
      const player = game?.players[socket.data.playerId];
      if (!game || !player) throw new Error("Reconnect to the game first.");
      const session = activeCoop(game);
      if (session.submissions[player.id]) throw new Error("Your story ingredients are already submitted.");
      submitCoopPlayer(game, player, payload.answers || {}, false);
      changed(game);
      emitGame(game);
      success(ack);
    } catch (error) { failure(ack, error); }
  });

  socket.on("student:vote", (payload = {}, ack) => {
    try {
      const game = getGame(socket.data.code);
      const player = game?.players[socket.data.playerId];
      if (!game || !player) throw new Error("Reconnect to the game first.");
      const round = activeRound(game);
      if (game.phase !== "voting" || !round.votingOpen) throw new Error("Voting is not open.");
      const submission = Object.values(round.submissions).find((item) => item.id === payload.submissionId);
      if (!submission || submission.hidden || submission.disqualified) throw new Error("That entry is not eligible.");
      if (submission.playerId === player.id) throw new Error("You cannot vote for your own response.");
      if (round.tiebreaker && !round.tiebreaker.ids.includes(submission.id)) throw new Error("That entry is not in this tiebreaker.");
      round.votes[player.id] = submission.id;
      changed(game);
      emitGame(game);
      success(ack);
    } catch (error) { failure(ack, error); }
  });

  teacherHandler(socket, "teacher:update-settings", (game, payload) => {
    if (!["lobby", "pre_round", "leaderboard"].includes(game.phase)) throw new Error("These settings cannot be changed during an active round.");
    const previousCount = game.settings.teamCount;
    const previousMode = game.settings.gameMode;
    const nextSettings = normalizeSettings({ ...game.settings, ...payload.settings });
    if (previousCount !== nextSettings.teamCount && (game.phase !== "lobby" || game.roundNumber !== 0)) {
      throw new Error("The number of teams can only be changed in the lobby before the game starts.");
    }
    if (previousMode !== nextSettings.gameMode && (game.phase !== "lobby" || game.roundNumber !== 0)) {
      throw new Error("The game mode can only be changed in the lobby before the game starts.");
    }
    game.settings = { ...game.settings, ...nextSettings, joiningLocked: game.settings.joiningLocked };
    if (previousCount !== game.settings.teamCount) game.teams = makeTeams(game.settings.teamCount);
  });

  teacherHandler(socket, "teacher:lock-joining", (game, payload) => {
    game.settings.joiningLocked = Boolean(payload.locked);
    game.notice = payload.locked ? "Student joining is locked." : "Student joining is open.";
  });

  teacherHandler(socket, "teacher:start-game", (game, payload) => {
    if (game.phase !== "lobby") throw new Error("The game has already started.");
    if (Object.keys(game.players).length < 2) throw new Error("At least two students are needed to start.");
    if (payload.settings) {
      const nextSettings = normalizeSettings({ ...game.settings, ...payload.settings });
      if (nextSettings.teamCount !== game.settings.teamCount) game.teams = makeTeams(nextSettings.teamCount);
      game.settings = { ...game.settings, ...nextSettings, joiningLocked: game.settings.joiningLocked };
    }
    if (game.settings.gameMode === "cooperative") {
      for (const player of Object.values(game.players)) {
        player.teamId = null;
        player.coopDraft = {};
      }
      game.coopSession = makeCoopSession();
      game.settings.joiningLocked = true;
      game.phase = "coop_writing";
      game.notice = "Five minutes: write one complete sentence for each story ingredient.";
      return;
    }
    assignTeams(game);
    game.settings.joiningLocked = true;
    game.phase = "team_reveal";
    game.notice = "Teams are set for the game.";
  });

  teacherHandler(socket, "teacher:continue-from-teams", (game) => {
    if (game.phase !== "team_reveal") throw new Error("Team reveal is not active.");
    game.phase = "pre_round";
    game.notice = "Choose the next prompt and start the round.";
  });

  teacherHandler(socket, "teacher:open-prompt-lab", (game) => {
    if (game.phase !== "leaderboard") throw new Error("The prompt lab cannot open yet.");
    game.phase = "pre_round";
    game.notice = "Choose the next prompt and start the round.";
  });

  teacherHandler(socket, "teacher:remove-player", (game, payload) => {
    const player = game.players[payload.playerId];
    if (!player) throw new Error("Student not found.");
    if (game.phase === "writing" && !game.currentRound.submissions[player.id]) submitPlayer(game, player, player.draftText || "", true);
    if (game.phase === "coop_writing" && !game.coopSession.submissions[player.id]) submitCoopPlayer(game, player, player.coopDraft || {}, true);
    const targetSocket = player.socketId ? io.sockets.sockets.get(player.socketId) : null;
    targetSocket?.emit("removed", { message: "The teacher removed you from this game." });
    targetSocket?.disconnect(true);
    delete game.players[payload.playerId];
  });

  teacherHandler(socket, "teacher:reassign-player", (game, payload) => {
    const player = game.players[payload.playerId];
    if (!player) throw new Error("Student not found.");
    if (!game.teams.some((team) => team.id === payload.teamId)) throw new Error("Team not found.");
    player.teamId = payload.teamId;
  });

  teacherHandler(socket, "teacher:rename-team", (game, payload) => {
    const team = game.teams.find((item) => item.id === payload.teamId);
    if (!team) throw new Error("Team not found.");
    const name = cleanText(payload.name, 32);
    if (name.length < 2) throw new Error("Team names need at least two characters.");
    team.name = name;
  });

  teacherHandler(socket, "teacher:preview-prompt", (game, payload) => {
    game.draftPrompt = { ...randomPrompt(game, payload.filters || {}) };
    return { prompt: game.draftPrompt };
  });

  teacherHandler(socket, "teacher:select-prompt", (game, payload) => {
    const prompt = payload.prompt || starterPrompts.find((item) => item.id === payload.promptId) || game.customPrompts.find((item) => item.id === payload.promptId);
    if (!prompt) throw new Error("Prompt not found.");
    game.draftPrompt = {
      id: cleanText(prompt.id, 80) || `custom-${token(6)}`,
      text: cleanText(prompt.text, 1200),
      category: cleanText(prompt.category, 80) || "Custom",
      difficulty: cleanText(prompt.difficulty, 30) || "teacher choice",
      responseLength: ["short", "medium", "long"].includes(prompt.responseLength) ? prompt.responseLength : "medium",
      suggestion: cleanText(prompt.suggestion, 80) || "Teacher-selected length",
      timerSeconds: Math.max(30, Math.min(900, Number(prompt.timerSeconds) || game.settings.defaultDuration))
    };
  });

  teacherHandler(socket, "teacher:save-custom-prompt", (game, payload) => {
    const text = cleanText(payload.prompt?.text, 1200);
    if (text.length < 10) throw new Error("Custom prompts need at least 10 characters.");
    const prompt = {
      id: `custom-${token(6)}`,
      text,
      category: cleanText(payload.prompt.category, 80) || "Custom",
      difficulty: cleanText(payload.prompt.difficulty, 30) || "teacher choice",
      responseLength: ["short", "medium", "long"].includes(payload.prompt.responseLength) ? payload.prompt.responseLength : "medium",
      suggestion: cleanText(payload.prompt.suggestion, 80) || "Teacher-selected length",
      timerSeconds: Math.max(30, Math.min(900, Number(payload.prompt.timerSeconds) || game.settings.defaultDuration))
    };
    game.customPrompts.push(prompt);
    game.draftPrompt = prompt;
    return { prompt };
  });

  teacherHandler(socket, "teacher:start-round", (game, payload) => {
    if (!["pre_round", "leaderboard"].includes(game.phase)) throw new Error("The next round cannot start yet.");
    if (game.roundNumber >= game.settings.totalRounds) throw new Error("All scheduled rounds are complete.");
    const prompt = payload.prompt || game.draftPrompt || randomPrompt(game, payload.filters || {});
    if (!cleanText(prompt.text, 1200)) throw new Error("Choose or enter a prompt first.");
    game.roundNumber += 1;
    for (const team of game.teams) team.lastRoundPoints = 0;
    for (const player of Object.values(game.players)) player.draftText = "";
    game.currentRound = makeRound(game, prompt, payload.durationSeconds);
    game.currentRound.startedAt = Date.now();
    game.currentRound.endsAt = Date.now() + game.currentRound.durationSeconds * 1000;
    game.recentlyUsedPromptIds.push(prompt.id);
    game.recentlyUsedPromptIds = game.recentlyUsedPromptIds.slice(-12);
    game.draftPrompt = null;
    game.phase = "writing";
    game.notice = `Round ${game.roundNumber} writing is open.`;
  });

  teacherHandler(socket, "teacher:pause-timer", (game) => {
    const round = activeRound(game);
    if (game.phase !== "writing") throw new Error("Writing is not open.");
    if (round.pausedRemainingMs !== null) throw new Error("The timer is already paused.");
    round.pausedRemainingMs = Math.max(0, round.endsAt - Date.now());
    round.endsAt = null;
    game.notice = "The writing timer is paused.";
  });

  teacherHandler(socket, "teacher:resume-timer", (game) => {
    const round = activeRound(game);
    if (game.phase !== "writing" || round.pausedRemainingMs === null) throw new Error("The timer is not paused.");
    round.endsAt = Date.now() + round.pausedRemainingMs;
    round.pausedRemainingMs = null;
    game.notice = "The writing timer resumed.";
  });

  teacherHandler(socket, "teacher:add-time", (game, payload) => {
    const round = activeRound(game);
    if (game.phase !== "writing") throw new Error("Writing is not open.");
    const extraMs = Math.max(10, Math.min(300, Number(payload.seconds) || 30)) * 1000;
    if (round.pausedRemainingMs !== null) round.pausedRemainingMs += extraMs;
    else round.endsAt += extraMs;
    game.notice = `${Math.round(extraMs / 1000)} seconds added.`;
  });

  teacherHandler(socket, "teacher:end-writing", (game) => endWriting(game, false));

  teacherHandler(socket, "teacher:coop-pause-timer", (game) => {
    const session = activeCoop(game);
    if (game.phase !== "coop_writing") throw new Error("Cooperative writing is not open.");
    if (session.pausedRemainingMs !== null) throw new Error("The timer is already paused.");
    session.pausedRemainingMs = Math.max(0, session.endsAt - Date.now());
    session.endsAt = null;
    game.notice = "The cooperative writing timer is paused.";
  });

  teacherHandler(socket, "teacher:coop-resume-timer", (game) => {
    const session = activeCoop(game);
    if (game.phase !== "coop_writing" || session.pausedRemainingMs === null) throw new Error("The timer is not paused.");
    session.endsAt = Date.now() + session.pausedRemainingMs;
    session.pausedRemainingMs = null;
    game.notice = "The cooperative writing timer resumed.";
  });

  teacherHandler(socket, "teacher:coop-add-time", (game, payload) => {
    const session = activeCoop(game);
    if (game.phase !== "coop_writing") throw new Error("Cooperative writing is not open.");
    const extraMs = Math.max(10, Math.min(300, Number(payload.seconds) || 30)) * 1000;
    if (session.pausedRemainingMs !== null) session.pausedRemainingMs += extraMs;
    else session.endsAt += extraMs;
    game.notice = `${Math.round(extraMs / 1000)} seconds added to cooperative writing.`;
  });

  teacherHandler(socket, "teacher:coop-end-writing", (game) => endCoopWriting(game, false));

  teacherHandler(socket, "teacher:coop-spin", (game, payload) => {
    if (game.phase !== "coop_spin") throw new Error("The Story Machine is not ready to spin.");
    const session = activeCoop(game);
    const requestedSectionId = cleanText(payload.sectionId, 40);
    const section = requestedSectionId
      ? COOP_SECTIONS.find((item) => item.id === requestedSectionId)
      : COOP_SECTIONS[session.currentSectionIndex];
    if (!section) throw new Error("Every story section has already been selected.");
    const sectionIndex = COOP_SECTIONS.findIndex((item) => item.id === section.id);
    const existingIndex = session.selections.findIndex((selection) => selection.sectionId === section.id);
    if (sectionIndex > session.currentSectionIndex || (existingIndex < 0 && sectionIndex < session.currentSectionIndex)) {
      throw new Error("Spin the story sections in order.");
    }
    let candidates = coopCandidates(game, section.id);
    const previous = existingIndex >= 0 ? session.selections[existingIndex] : null;
    if (previous && candidates.length > 1) candidates = candidates.filter((candidate) => candidate.id !== previous.id);
    const selection = { ...candidates[crypto.randomInt(candidates.length)] };
    if (existingIndex >= 0) session.selections[existingIndex] = selection;
    else {
      session.selections.push(selection);
      session.currentSectionIndex += 1;
    }
    session.selections.sort((a, b) => COOP_SECTIONS.findIndex((sectionItem) => sectionItem.id === a.sectionId) - COOP_SECTIONS.findIndex((sectionItem) => sectionItem.id === b.sectionId));
    game.notice = existingIndex >= 0
      ? `${section.label} was spun again. The new piece is locked in.`
      : `${section.label} is locked in. ${Math.max(0, COOP_SECTIONS.length - session.currentSectionIndex)} spins remain.`;
    return { selection: publicCoopSelection(selection), section };
  });

  teacherHandler(socket, "teacher:coop-finish", (game) => {
    if (game.phase !== "coop_spin") throw new Error("The cooperative story is not ready.");
    const session = activeCoop(game);
    if (session.currentSectionIndex < COOP_SECTIONS.length) throw new Error("Spin every story section first.");
    game.phase = "coop_final";
    game.notice = "The class story is complete.";
  });

  teacherHandler(socket, "teacher:moderate", (game, payload) => {
    if (!["review", "presentation"].includes(game.phase)) throw new Error("Moderation is not available now.");
    const round = activeRound(game);
    const submission = Object.values(round.submissions).find((item) => item.id === payload.submissionId);
    if (!submission) throw new Error("Submission not found.");
    if (payload.action === "edit") {
      const text = cleanText(payload.text, 12000);
      if (!text) throw new Error("A presented response cannot be empty.");
      submission.text = text;
      submission.editedByTeacher = true;
      submission.flags = inappropriateFlags(text);
    } else if (payload.action === "hide") submission.hidden = Boolean(payload.value);
    else if (payload.action === "disqualify") submission.disqualified = Boolean(payload.value);
    else throw new Error("Unknown moderation action.");
    if (game.phase === "presentation") {
      const eligible = !submission.hidden && !submission.disqualified && submission.text.trim();
      const currentIndex = round.presentationOrder.indexOf(submission.id);
      if (!eligible && currentIndex >= 0) round.presentationOrder.splice(currentIndex, 1);
      if (eligible && currentIndex < 0) round.presentationOrder.push(submission.id);
      round.presentedIds = round.presentedIds.filter((id) => round.presentationOrder.includes(id));
      round.presentationIndex = Math.max(0, Math.min(round.presentationIndex, round.presentationOrder.length - 1));
      const visibleId = round.presentationOrder[round.presentationIndex];
      if (visibleId && !round.presentedIds.includes(visibleId)) round.presentedIds.push(visibleId);
    }
  });

  teacherHandler(socket, "teacher:start-presentation", (game) => {
    if (game.phase !== "review") throw new Error("Finish writing before presentation.");
    const round = activeRound(game);
    const available = visibleSubmissions(round);
    if (available.length < 2) throw new Error("At least two eligible responses are needed.");
    round.presentationOrder = shuffle(available.map((item) => item.id));
    round.presentationIndex = 0;
    round.presentedIds = [round.presentationOrder[0]];
    game.phase = "presentation";
    game.notice = "Responses are anonymous. Present each selected entry before voting.";
  });

  teacherHandler(socket, "teacher:navigate-presentation", (game, payload) => {
    if (game.phase !== "presentation") throw new Error("Presentation mode is not active.");
    const round = activeRound(game);
    const direction = Number(payload.direction) < 0 ? -1 : 1;
    round.presentationIndex = Math.max(0, Math.min(round.presentationOrder.length - 1, round.presentationIndex + direction));
    const currentId = round.presentationOrder[round.presentationIndex];
    if (!round.presentedIds.includes(currentId)) round.presentedIds.push(currentId);
  });

  teacherHandler(socket, "teacher:start-voting", (game, payload) => {
    if (game.phase !== "presentation") throw new Error("Presentation mode is not active.");
    const round = activeRound(game);
    if (!payload.force && round.presentedIds.length < round.presentationOrder.length) throw new Error("Present every selected response before opening voting.");
    round.votes = {};
    round.votingOpen = true;
    game.phase = "voting";
    game.notice = "Voting is open. Vote totals remain hidden.";
  });

  teacherHandler(socket, "teacher:close-voting", (game) => closeVoting(game));

  teacherHandler(socket, "teacher:resolve-tie", (game, payload) => {
    if (game.phase !== "tie") throw new Error("There is no tie to resolve.");
    const round = activeRound(game);
    const context = round.tieContext;
    if (payload.method === "share") {
      awardResults(game, round.baseCounts || countVotes(round), true);
      return;
    }
    if (payload.method === "manual") {
      if (!context.ids.includes(payload.submissionId)) throw new Error("Choose one of the tied entries.");
      const counts = { ...(round.baseCounts || countVotes(round)) };
      counts[payload.submissionId] = (counts[payload.submissionId] || 0) + 0.01;
      round.baseCounts = counts;
      const remainingTie = findTie(counts);
      if (remainingTie) {
        round.tieContext = remainingTie;
        game.notice = "One tie is resolved; another placement still needs a decision.";
      } else awardResults(game, counts, false);
      return;
    }
    if (payload.method === "revote") {
      round.tiebreaker = { ids: [...context.ids], placement: context.placement, originalCounts: { ...(round.baseCounts || countVotes(round)) } };
      round.votes = {};
      round.votingOpen = true;
      round.tieContext = null;
      game.phase = "voting";
      game.notice = `Quick tiebreaker vote for place ${context.placement}.`;
      return;
    }
    throw new Error("Choose a tie resolution method.");
  });

  teacherHandler(socket, "teacher:reveal-result", (game) => {
    if (game.phase !== "results") throw new Error("Results are not ready.");
    const round = activeRound(game);
    const placementCount = new Set(round.results.map((result) => result.placement)).size;
    round.revealCount = Math.min(placementCount, round.revealCount + 1);
    archiveCurrentRound(game);
  });

  teacherHandler(socket, "teacher:show-leaderboard", (game) => {
    if (game.phase !== "results") throw new Error("Results are not active.");
    const round = activeRound(game);
    if (round.revealCount < new Set(round.results.map((result) => result.placement)).size) throw new Error("Reveal all available placements first.");
    game.phase = game.roundNumber >= game.settings.totalRounds ? "final" : "leaderboard";
    game.notice = game.phase === "final" ? "The final standings are ready!" : "Round complete. Review the standings before the next prompt.";
  });

  teacherHandler(socket, "teacher:adjust-score", (game, payload) => {
    const team = game.teams.find((item) => item.id === payload.teamId);
    if (!team) throw new Error("Team not found.");
    const delta = Math.max(-10000, Math.min(10000, Math.round(Number(payload.delta) || 0)));
    if (!delta) throw new Error("Enter a non-zero point adjustment.");
    team.score += delta;
    team.lastRoundPoints += delta;
    game.notice = `${delta > 0 ? "+" : ""}${delta} point correction applied to ${team.name}.`;
    updateRanks(game);
  });

  teacherHandler(socket, "teacher:restart-round", (game) => {
    const round = activeRound(game);
    if (!["writing", "review", "presentation", "voting", "tie"].includes(game.phase)) throw new Error("This round cannot be restarted now.");
    for (const player of Object.values(game.players)) player.draftText = "";
    game.currentRound = makeRound(game, round.prompt, round.durationSeconds);
    game.currentRound.startedAt = Date.now();
    game.currentRound.endsAt = Date.now() + round.durationSeconds * 1000;
    game.phase = "writing";
    game.notice = `Round ${game.roundNumber} restarted.`;
  });

  teacherHandler(socket, "teacher:end-game", (game) => {
    if (game.currentRound?.results?.length) archiveCurrentRound(game);
    game.phase = "final";
    game.notice = "The teacher ended the game. Final standings are ready.";
    updateRanks(game);
  });

  socket.on("disconnect", () => {
    if (socket.data.role !== "student") return;
    const game = getGame(socket.data.code);
    const player = game?.players[socket.data.playerId];
    if (!game || !player || player.socketId !== socket.id) return;
    player.connected = false;
    delete player.socketId;
    changed(game);
    emitGame(game);
  });
});

function exportRows(game) {
  const rows = [["Round", "Prompt", "Entry", "Student", "Team", "Response", "Placement", "Votes", "Points", "Team total"]];
  for (const round of game.roundHistory) {
    const bySubmission = new Map((round.results || []).map((result) => [result.submissionId, result]));
    for (const submission of Object.values(round.submissions || {})) {
      const player = game.players[submission.playerId];
      const team = game.teams.find((item) => item.id === submission.teamId);
      const result = bySubmission.get(submission.id);
      rows.push([
        round.number, round.prompt.text, labelFor((round.presentationOrder || []).indexOf(submission.id)), player?.name || "Former student",
        team?.name || "Unknown", submission.text, result?.placement || "", result?.votes ?? "", result?.points || 0, team?.score || 0
      ]);
    }
  }
  return rows;
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function sendHealth(_req, res) {
  res.json({ ok: true, games: games.size, promptCount: starterPrompts.length });
}

app.get("/health", sendHealth);
app.get("/api/health", sendHealth);

app.get("/api/games/:code/export.csv", (req, res) => {
  try {
    const game = requireTeacher(req.params.code, req.query.token);
    const csv = exportRows(game).map((row) => row.map(csvCell).join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="story-showdown-${game.code}.csv"`);
    res.send(`\uFEFF${csv}`);
  } catch (error) { res.status(403).send(error.message); }
});

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

app.get("/api/games/:code/print", (req, res) => {
  try {
    const game = requireTeacher(req.params.code, req.query.token);
    const rounds = game.roundHistory.map((round) => `
      <section><h2>Round ${round.number}</h2><p class="prompt">${escapeHtml(round.prompt.text)}</p>
      ${Object.values(round.submissions || {}).map((submission) => {
        const player = game.players[submission.playerId];
        const team = game.teams.find((item) => item.id === submission.teamId);
        const result = (round.results || []).find((item) => item.submissionId === submission.id);
        return `<article><h3>${escapeHtml(player?.name || "Former student")} · ${escapeHtml(team?.name || "Unknown")}${result ? ` · Place ${result.placement} · ${result.points} pts` : ""}</h3><p>${escapeHtml(submission.text)}</p></article>`;
      }).join("")}</section>`).join("");
    res.send(`<!doctype html><html><head><meta charset="utf-8"><title>Story Showdown ${game.code}</title><style>body{font:15px system-ui;margin:40px;color:#172033}header{border-bottom:4px solid #6757d9}section{break-inside:avoid;margin:28px 0}.prompt{font-size:18px;font-weight:700}article{border:1px solid #ccd3e0;border-radius:10px;padding:14px;margin:12px 0}h1,h2,h3{margin:.3em 0}@media print{button{display:none}}</style></head><body><header><h1>Story Showdown · ${game.code}</h1><p>${game.roundHistory.length} rounds · ${Object.keys(game.players).length} writers</p><button onclick="window.print()">Print / Save as PDF</button></header><h2>Final standings</h2><ol>${scoreboard(game).map((team) => `<li>${escapeHtml(team.name)} — ${team.score} points</li>`).join("")}</ol>${rounds}</body></html>`);
  } catch (error) { res.status(403).send(error.message); }
});

setInterval(() => {
  const now = Date.now();
  for (const game of games.values()) {
    const round = game.currentRound;
    if (game.phase === "writing" && round?.endsAt && now >= round.endsAt) {
      endWriting(game, true);
      changed(game);
      emitGame(game);
    }
    const coop = game.coopSession;
    if (game.phase === "coop_writing" && coop?.endsAt && now >= coop.endsAt) {
      endCoopWriting(game, true);
      changed(game);
      emitGame(game);
    }
  }
}, 250);

loadGames();

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received; saving active games.`);
  if (persistTimer) clearTimeout(persistTimer);
  persistNow();
  io.close(() => server.close(() => process.exit(0)));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

if (require.main === module) {
  server.listen(PORT, HOST, () => console.log(`Story Showdown listening on http://${HOST}:${PORT}`));
}

module.exports = {
  app, server, io, games, createGame, teacherSnapshot, studentSnapshot, starterPrompts,
  AVATAR_CHOICES, COOP_SECTIONS, normalizeCoopSentence, buildCoopStory, coopStoryText,
  playerLeaderboards, MAX_PLAYERS_PER_GAME
};
