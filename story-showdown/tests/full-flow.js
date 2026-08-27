const assert = require("node:assert/strict");
const path = require("path");
const os = require("os");
const { io: Client } = require("socket.io-client");

process.env.STORY_SHOWDOWN_DATA_FILE = path.join(os.tmpdir(), `story-showdown-smoke-${process.pid}.json`);
const { server, games, AVATAR_CHOICES, teacherSnapshot, studentSnapshot } = require("../server");

const latest = new WeakMap();
const clients = [];

function connect(url) {
  return new Promise((resolve, reject) => {
    const socket = Client(url, { transports: ["websocket"], reconnection: false, forceNew: true });
    clients.push(socket);
    socket.on("state", (state) => latest.set(socket, state));
    socket.once("connect", () => resolve(socket));
    socket.once("connect_error", reject);
  });
}

function action(socket, event, payload = {}) {
  return new Promise((resolve, reject) => {
    socket.timeout(3000).emit(event, payload, (error, response) => {
      if (error) return reject(error);
      if (!response?.ok) return reject(new Error(response?.error || `${event} failed`));
      resolve(response);
    });
  });
}

function rejected(socket, event, payload, pattern) {
  return new Promise((resolve, reject) => {
    socket.timeout(3000).emit(event, payload, (error, response) => {
      if (error) return reject(error);
      try {
        assert.equal(response.ok, false);
        assert.match(response.error, pattern);
        resolve(response);
      } catch (assertion) { reject(assertion); }
    });
  });
}

function waitFor(socket, predicate, label, timeout = 3500) {
  const current = latest.get(socket);
  if (current && predicate(current)) return Promise.resolve(current);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { socket.off("state", listener); reject(new Error(`Timed out waiting for ${label}`)); }, timeout);
    const listener = (state) => {
      latest.set(socket, state);
      if (!predicate(state)) return;
      clearTimeout(timer);
      socket.off("state", listener);
      resolve(state);
    };
    socket.on("state", listener);
  });
}

function teacherAction(teacher, auth, event, payload = {}) {
  return action(teacher, event, { ...auth, ...payload });
}

function assignVotes(players, entries, desiredCounts) {
  const targets = [];
  desiredCounts.forEach((count, index) => { for (let i = 0; i < count; i += 1) targets.push(entries[index]); });
  function solve(playerIndex, remaining, chosen) {
    if (playerIndex === players.length) return chosen;
    const playerId = latest.get(players[playerIndex]).me.id;
    for (let index = 0; index < remaining.length; index += 1) {
      if (remaining[index].playerId === playerId) continue;
      const next = [...remaining];
      const [entry] = next.splice(index, 1);
      const result = solve(playerIndex + 1, next, [...chosen, entry]);
      if (result) return result;
    }
    return null;
  }
  const result = solve(0, targets, []);
  assert.ok(result, "a valid no-self-vote assignment should exist");
  return result;
}

async function main() {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}`;
  const teacher = await connect(url);
  const created = await action(teacher, "game:create", { settings: { teamCount: 3, totalRounds: 2, defaultDuration: 120, revealNames: true } });
  const auth = { code: created.code, teacherToken: created.teacherToken };
  latest.set(teacher, created.state);
  assert.match(created.code, /^[A-Z2-9]{5}$/);
  assert.equal(created.state.promptBank.length, 144);
  await rejected(teacher, "teacher:lock-joining", { code: created.code, teacherToken: "wrong", locked: true }, /authorization/i);

  const players = [];
  const sessions = [];
  for (const [index, name] of ["Avery", "Blake", "Casey", "Devon", "Emery", "Frankie"].entries()) {
    const socket = await connect(url);
    const avatarId = AVATAR_CHOICES[index].id;
    const joined = await action(socket, "student:join", { code: created.code, name, avatarId });
    latest.set(socket, joined.state);
    players.push(socket);
    sessions.push({ code: created.code, name, avatarId, sessionToken: joined.sessionToken });
    assert.equal(joined.state.me.avatar.id, avatarId);
  }
  assert.equal((await waitFor(teacher, (s) => s.playerCount === 6, "six-player lobby")).connectedCount, 6);
  await rejected(players[0], "student:join", { code: created.code, name: "Avery" }, /already being used/i);

  await teacherAction(teacher, auth, "teacher:start-game");
  let teacherState = await waitFor(teacher, (s) => s.phase === "team_reveal", "team reveal");
  assert.ok(teacherState.players.every((player) => player.teamId));
  await teacherAction(teacher, auth, "teacher:continue-from-teams");
  await teacherAction(teacher, auth, "teacher:preview-prompt", { filters: { category: "Science fiction", responseLength: "short" } });
  teacherState = await waitFor(teacher, (s) => s.phase === "pre_round" && s.draftPrompt, "prompt preview");
  assert.equal(teacherState.draftPrompt.category, "Science fiction");
  await teacherAction(teacher, auth, "teacher:start-round", { prompt: teacherState.draftPrompt, durationSeconds: 120 });
  await waitFor(players[0], (s) => s.phase === "writing", "writing phase");
  const reconnectingState = await waitFor(players[5], (s) => s.phase === "writing" && s.me.teamId, "reconnecting student writing phase");
  const originalTeam = reconnectingState.me.teamId;
  const privateWriting = latest.get(players[0]);
  assert.deepEqual(privateWriting.players, []);
  assert.equal(privateWriting.round.endsAt > Date.now(), true);

  await action(players[5], "student:draft", { text: "A draft survives a dropped connection." });
  players[5].disconnect();
  await waitFor(teacher, (s) => s.connectedCount === 5, "disconnect status");
  const rejoined = await connect(url);
  const rejoinResponse = await action(rejoined, "student:join", sessions[5]);
  latest.set(rejoined, rejoinResponse.state);
  assert.equal(rejoinResponse.state.me.teamId, originalTeam);
  assert.equal(rejoinResponse.state.me.avatar.id, sessions[5].avatarId);
  assert.equal(rejoinResponse.state.round.myDraft, "A draft survives a dropped connection.");
  players[5] = rejoined;

  const responses = [
    "The moon sent a countdown, and Avery chose to answer with a song.",
    "Blake opened the red hatch. Behind it, the stars were waiting.",
    "Casey told the robot, ‘We can be brave after breakfast.’",
    "Devon followed the signal into a greenhouse full of blue rain.",
    "Emery corrected the map, then the map quietly corrected reality.",
    "Frankie found the last package from Earth and whispered, ‘Damn, they remembered us.’"
  ];
  for (let i = 0; i < players.length; i += 1) await action(players[i], "student:submit", { text: responses[i] });
  await teacherAction(teacher, auth, "teacher:end-writing");
  teacherState = await waitFor(teacher, (s) => s.phase === "review", "private review");
  assert.equal(teacherState.round.submissions.length, 6);
  assert.ok(teacherState.round.submissions.find((entry) => entry.studentName === "Frankie").flags.length > 0);
  const blake = teacherState.round.submissions.find((entry) => entry.studentName === "Blake");
  await teacherAction(teacher, auth, "teacher:moderate", { action: "edit", submissionId: blake.id, text: `${blake.text} A soft alarm began to ring.` });
  const frankie = teacherState.round.submissions.find((entry) => entry.studentName === "Frankie");
  await teacherAction(teacher, auth, "teacher:moderate", { action: "hide", submissionId: frankie.id, value: true });
  await teacherAction(teacher, auth, "teacher:start-presentation");
  teacherState = await waitFor(teacher, (s) => s.phase === "presentation", "anonymous presentation");
  assert.equal(teacherState.round.presentationCount, 5);
  const studentPresentation = await waitFor(players[0], (s) => s.phase === "presentation", "student presentation");
  assert.equal(Object.hasOwn(studentPresentation.round.currentEntry, "studentName"), false);
  assert.equal(Object.hasOwn(studentPresentation, "playerLeaderboards"), false);
  assert.equal(studentPresentation.round.entries.some((entry) => entry.id === frankie.id), false);

  for (let i = 1; i < teacherState.round.presentationCount; i += 1) await teacherAction(teacher, auth, "teacher:navigate-presentation", { direction: 1 });
  teacherState = await waitFor(teacher, (s) => s.round.presentedCount === s.round.presentationCount, "all entries presented");
  await teacherAction(teacher, auth, "teacher:start-voting");
  await waitFor(players[0], (s) => s.phase === "voting", "open voting");
  teacherState = latest.get(teacher);
  const eligible = teacherState.round.submissions.filter((entry) => teacherState.round.presentationOrder.includes(entry.id));
  const ownEntry = eligible.find((entry) => entry.playerId === latest.get(players[0]).me.id);
  await rejected(players[0], "student:vote", { submissionId: ownEntry.id }, /own response/i);
  const plannedVotes = assignVotes(players, eligible.slice(0, 3), [3, 2, 1]);
  await action(players[0], "student:vote", { submissionId: plannedVotes[0].id });
  await action(players[0], "student:vote", { submissionId: plannedVotes[0].id });
  assert.equal((await waitFor(teacher, (s) => s.round.voterCount === 1, "duplicate vote replacement")).round.voterCount, 1);
  for (let i = 1; i < players.length; i += 1) await action(players[i], "student:vote", { submissionId: plannedVotes[i].id });
  const ballotState = await waitFor(players[1], (s) => s.round.voterCount === 6, "all votes");
  assert.equal(Object.hasOwn(ballotState.round, "votes"), false);
  await teacherAction(teacher, auth, "teacher:close-voting");
  teacherState = await waitFor(teacher, (s) => s.phase === "results", "unique results");
  assert.equal(teacherState.teams.reduce((sum, team) => sum + team.score, 0), 2250);
  assert.deepEqual(games.get(created.code).currentRound.results.map((result) => result.points), [1000, 750, 500]);
  assert.equal(teacherState.round.results.length, 0, "teacher projector should not reveal winners early");
  for (let i = 0; i < 3; i += 1) await teacherAction(teacher, auth, "teacher:reveal-result");
  teacherState = await waitFor(teacher, (s) => s.round.revealCount === 3, "all podium reveals");
  assert.equal(teacherState.round.results.length, 3);
  await teacherAction(teacher, auth, "teacher:show-leaderboard");
  teacherState = await waitFor(teacher, (s) => s.phase === "leaderboard", "leaderboard");
  assert.equal(teacherState.playerLeaderboards.visible, true);
  assert.equal(teacherState.playerLeaderboards.roundsCompleted, 1);
  assert.equal(teacherState.playerLeaderboards.overall.length, 6);
  assert.equal(teacherState.playerLeaderboards.overall.reduce((sum, entry) => sum + entry.totalPoints, 0), 2250);
  assert.equal(teacherState.playerLeaderboards.overall[0].avatar.id.length > 0, true);
  const studentLeaderboard = await waitFor(players[0], (s) => s.phase === "leaderboard", "student writer leaderboard");
  assert.equal(studentLeaderboard.playerLeaderboards.overall.length, 6);
  const scoreTeam = latest.get(teacher).teams[0];
  const beforeCorrection = scoreTeam.score;
  await teacherAction(teacher, auth, "teacher:adjust-score", { teamId: scoreTeam.id, delta: -50 });
  assert.equal((await waitFor(teacher, (s) => s.teams.find((t) => t.id === scoreTeam.id).score === beforeCorrection - 50, "score correction")).teams.find((t) => t.id === scoreTeam.id).score, beforeCorrection - 50);

  await teacherAction(teacher, auth, "teacher:open-prompt-lab");
  const customPrompt = {
    id: "teacher-integration-prompt",
    text: "A polite goose audits the school talent show. Write the principal's response.",
    category: "Teacher challenge",
    difficulty: "teacher choice",
    responseLength: "medium",
    suggestion: "Aim for 150–250 words",
    timerSeconds: 30
  };
  await teacherAction(teacher, auth, "teacher:select-prompt", { prompt: { ...customPrompt, text: "" } });
  teacherState = await waitFor(teacher, (s) => s.phase === "pre_round" && s.draftPrompt?.id === customPrompt.id, "blank teacher prompt");
  assert.equal(teacherState.draftPrompt.text, "");
  await teacherAction(teacher, auth, "teacher:save-custom-prompt", { prompt: customPrompt });
  teacherState = await waitFor(teacher, (s) => s.draftPrompt?.text === customPrompt.text && s.customPrompts.length === 1, "saved teacher prompt");
  assert.equal(teacherState.draftPrompt.category, "Teacher challenge");
  await teacherAction(teacher, auth, "teacher:start-round", { prompt: teacherState.draftPrompt, durationSeconds: 30 });
  await waitFor(players[0], (s) => s.phase === "writing" && s.round.number === 2, "second writing phase");
  for (let i = 0; i < players.length; i += 1) await action(players[i], "student:draft", { text: `Round two response ${i + 1}: a polite goose audits the talent show.` });
  const internal = games.get(created.code);
  internal.currentRound.endsAt = Date.now() - 1;
  teacherState = await waitFor(teacher, (s) => s.phase === "review", "server timer expiration");
  assert.equal(teacherState.round.submissions.length, 6);
  assert.ok(teacherState.round.submissions.every((entry) => entry.automatic));
  await teacherAction(teacher, auth, "teacher:start-presentation");
  teacherState = await waitFor(teacher, (s) => s.phase === "presentation", "second presentation");
  for (let i = 1; i < teacherState.round.presentationCount; i += 1) await teacherAction(teacher, auth, "teacher:navigate-presentation", { direction: 1 });
  await teacherAction(teacher, auth, "teacher:start-voting");
  teacherState = await waitFor(teacher, (s) => s.phase === "voting", "second ballot");
  const tieEntries = teacherState.round.submissions.filter((entry) => teacherState.round.presentationOrder.includes(entry.id)).slice(0, 2);
  const tiedVotes = assignVotes(players, tieEntries, [3, 3]);
  for (let i = 0; i < players.length; i += 1) await action(players[i], "student:vote", { submissionId: tiedVotes[i].id });
  await teacherAction(teacher, auth, "teacher:close-voting");
  teacherState = await waitFor(teacher, (s) => s.phase === "tie", "tie decision");
  assert.equal(teacherState.round.tieContext.entries.length, 2);
  for (let attempt = 0; attempt < 4 && teacherState.phase === "tie"; attempt += 1) {
    const priorTie = `${teacherState.round.tieContext.placement}:${teacherState.round.tieContext.ids.join(",")}`;
    await teacherAction(teacher, auth, "teacher:resolve-tie", { method: "manual", submissionId: teacherState.round.tieContext.entries[0].id });
    teacherState = await waitFor(teacher, (s) => s.phase === "results" || (s.phase === "tie" && `${s.round.tieContext.placement}:${s.round.tieContext.ids.join(",")}` !== priorTie), "manual tie resolution");
  }
  assert.equal(teacherState.phase, "results");
  await teacherAction(teacher, auth, "teacher:end-game");
  teacherState = await waitFor(teacher, (s) => s.phase === "final", "final results");
  assert.equal(teacherState.playerLeaderboards.roundsCompleted, 2);
  assert.ok(teacherState.playerLeaderboards.overall.every((entry) => entry.roundsPlayed === 2));
  assert.ok(teacherState.playerLeaderboards.average.every((entry) => entry.averagePoints === entry.totalPoints / 2));
  internal.settings.revealNames = false;
  assert.equal(teacherSnapshot(internal).playerLeaderboards.visible, false);
  assert.deepEqual(teacherSnapshot(internal).playerLeaderboards.overall, []);
  assert.equal(studentSnapshot(internal, internal.players[latest.get(players[0]).me.id]).playerLeaderboards.visible, false);
  internal.settings.revealNames = true;

  const csvResponse = await fetch(`${url}/api/games/${created.code}/export.csv?token=${encodeURIComponent(created.teacherToken)}`);
  assert.equal(csvResponse.status, 200);
  const csv = await csvResponse.text();
  assert.match(csv, /Round,?"?/i);
  assert.match(csv, /Avery/);
  const printResponse = await fetch(`${url}/api/games/${created.code}/print?token=${encodeURIComponent(created.teacherToken)}`);
  assert.equal(printResponse.status, 200);
  assert.match(await printResponse.text(), /Print \/ Save as PDF/);

  console.log(JSON.stringify({
    ok: true,
    code: created.code,
    players: players.length,
    promptCount: created.state.promptBank.length,
    roundOne: "anonymous presentation, unique voting, scoring, reveals",
    roundTwo: "teacher-authored prompt, timer auto-submit, and manual tie resolution",
    reconnection: "draft, team, and avatar restored",
    writerLeaderboards: "total and per-round average podium points",
    exports: ["CSV", "printable PDF view"]
  }, null, 2));
}

main().then(() => {
  clients.forEach((client) => client.disconnect());
  server.close(() => process.exit(0));
}).catch((error) => {
  console.error(error.stack || error);
  clients.forEach((client) => client.disconnect());
  server.close(() => process.exit(1));
});
