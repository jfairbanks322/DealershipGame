const assert = require("node:assert/strict");
const path = require("path");
const os = require("os");
const { io: Client } = require("socket.io-client");

process.env.STORY_SHOWDOWN_DATA_FILE = path.join(os.tmpdir(), `story-showdown-capacity-${process.pid}.json`);
const { server, games, AVATAR_CHOICES, MAX_PLAYERS_PER_GAME } = require("../server");

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
    socket.timeout(5000).emit(event, payload, (error, response) => {
      if (error) return reject(error);
      if (!response?.ok) return reject(new Error(response?.error || `${event} failed`));
      resolve(response);
    });
  });
}

function rejected(socket, event, payload, pattern) {
  return new Promise((resolve, reject) => {
    socket.timeout(5000).emit(event, payload, (error, response) => {
      if (error) return reject(error);
      try {
        assert.equal(response?.ok, false);
        assert.match(response?.error || "", pattern);
        resolve();
      } catch (assertion) { reject(assertion); }
    });
  });
}

function waitFor(socket, predicate, label, timeout = 7000) {
  const current = latest.get(socket);
  if (current && predicate(current)) return Promise.resolve(current);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off("state", listener);
      reject(new Error(`Timed out waiting for ${label}`));
    }, timeout);
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

function voteAssignments(players, targets, counts) {
  const assignments = counts.flatMap((count, index) => Array(count).fill(targets[index]));
  for (let index = 0; index < assignments.length; index += 1) {
    const playerId = latest.get(players[index]).me.id;
    if (assignments[index].playerId !== playerId) continue;
    const swapIndex = assignments.findIndex((candidate, otherIndex) => {
      if (otherIndex === index) return false;
      const otherPlayerId = latest.get(players[otherIndex]).me.id;
      return candidate.playerId !== playerId && assignments[index].playerId !== otherPlayerId;
    });
    assert.notEqual(swapIndex, -1, "a valid no-self-vote swap should exist");
    [assignments[index], assignments[swapIndex]] = [assignments[swapIndex], assignments[index]];
  }
  return assignments;
}

async function main() {
  assert.equal(MAX_PLAYERS_PER_GAME, 30);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const teacher = await connect(url);
  const created = await action(teacher, "game:create", { settings: { teamCount: 8, totalRounds: 1, defaultDuration: 120 } });
  const auth = { code: created.code, teacherToken: created.teacherToken };
  latest.set(teacher, created.state);
  assert.equal(created.state.settings.teamCount, 8);
  assert.equal(created.state.teams.length, 8);

  const players = [];
  const sessions = [];
  for (let index = 1; index <= MAX_PLAYERS_PER_GAME; index += 1) {
    const socket = await connect(url);
    const name = `Writer ${String(index).padStart(2, "0")}`;
    const avatarId = AVATAR_CHOICES[(index - 1) % AVATAR_CHOICES.length].id;
    const joined = await action(socket, "student:join", { code: created.code, name, avatarId });
    latest.set(socket, joined.state);
    players.push(socket);
    sessions.push({ code: created.code, name, avatarId, sessionToken: joined.sessionToken });
  }

  let teacherState = await waitFor(teacher, (state) => state.playerCount === 30 && state.connectedCount === 30, "30-player lobby");
  assert.equal(teacherState.maxPlayers, 30);

  players[0].disconnect();
  await waitFor(teacher, (state) => state.connectedCount === 29, "one disconnected writer");
  const reconnected = await connect(url);
  const resumed = await action(reconnected, "student:join", sessions[0]);
  latest.set(reconnected, resumed.state);
  players[0] = reconnected;
  assert.equal(resumed.state.playerCount, 30);
  assert.equal(resumed.state.me.name, "Writer 01");
  assert.equal(resumed.state.me.avatar.id, sessions[0].avatarId);

  const overflow = await connect(url);
  await rejected(overflow, "student:join", { code: created.code, name: "Writer 31" }, /full.*30 students/i);

  await teacherAction(teacher, auth, "teacher:start-game");
  teacherState = await waitFor(teacher, (state) => state.phase === "team_reveal", "team reveal");
  assert.equal(teacherState.teams.length, 8);
  const teamSizes = teacherState.teams.map((team) => teacherState.players.filter((player) => player.teamId === team.id).length);
  assert.equal(teamSizes.reduce((sum, size) => sum + size, 0), 30);
  assert.ok(Math.max(...teamSizes) - Math.min(...teamSizes) <= 1, "teams should be balanced within one writer");

  await teacherAction(teacher, auth, "teacher:continue-from-teams");
  const prompt = {
    id: "capacity-prompt",
    text: "Write the opening of a story where every classroom clock begins counting backward.",
    category: "Teacher challenge",
    difficulty: "accessible",
    responseLength: "short",
    suggestion: "Aim for one vivid paragraph",
    timerSeconds: 120
  };
  await teacherAction(teacher, auth, "teacher:start-round", { prompt, durationSeconds: 120 });
  await waitFor(players[0], (state) => state.phase === "writing", "30-player writing phase");

  for (let index = 0; index < players.length; index += 1) {
    await action(players[index], "student:submit", { text: `Writer ${String(index + 1).padStart(2, "0")} heard the final bell ring first and followed its echo into tomorrow.` });
  }
  await teacherAction(teacher, auth, "teacher:end-writing");
  teacherState = await waitFor(teacher, (state) => state.phase === "review" && state.round.submissions.length === 30, "30 submitted responses");
  const reviewedSubmissions = teacherState.round.submissions;

  await teacherAction(teacher, auth, "teacher:start-presentation");
  teacherState = await waitFor(teacher, (state) => state.phase === "presentation", "30-entry presentation");
  for (let index = 1; index < teacherState.round.presentationCount; index += 1) {
    await teacherAction(teacher, auth, "teacher:navigate-presentation", { direction: 1 });
  }
  teacherState = await waitFor(teacher, (state) => state.round.presentedCount === 30, "all 30 entries presented");
  const targets = teacherState.round.presentationOrder.slice(0, 3).map((id) => reviewedSubmissions.find((entry) => entry.id === id));

  await teacherAction(teacher, auth, "teacher:start-voting");
  await waitFor(players[0], (state) => state.phase === "voting", "30-player ballot");
  const assignments = voteAssignments(players, targets, [15, 10, 5]);
  for (let index = 0; index < players.length; index += 1) {
    await action(players[index], "student:vote", { submissionId: assignments[index].id });
  }
  await waitFor(teacher, (state) => state.round.voterCount === 30, "30 submitted ballots");

  await teacherAction(teacher, auth, "teacher:close-voting");
  teacherState = await waitFor(teacher, (state) => state.phase === "results", "30-player results");
  assert.deepEqual(games.get(created.code).currentRound.results.map((result) => result.votes), [15, 10, 5]);
  assert.equal(teacherState.teams.reduce((sum, team) => sum + team.score, 0), 2250);
  for (let index = 0; index < 3; index += 1) await teacherAction(teacher, auth, "teacher:reveal-result");
  await teacherAction(teacher, auth, "teacher:show-leaderboard");
  teacherState = await waitFor(teacher, (state) => state.phase === "final", "30-player final standings");
  assert.equal(teacherState.playerCount, 30);
  assert.equal(teacherState.playerLeaderboards.overall.length, 30);
  assert.deepEqual(teacherState.playerLeaderboards.overall.slice(0, 3).map((entry) => entry.totalPoints), [1000, 750, 500]);

  console.log(JSON.stringify({
    ok: true,
    players: teacherState.playerCount,
    maxPlayers: teacherState.maxPlayers,
    teamSizes: teamSizes.sort((a, b) => b - a),
    submissions: 30,
    ballots: 30,
    overflowJoin: "rejected",
    reconnectAtCapacity: "restored"
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
