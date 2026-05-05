const http = require("http");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 3137);
const TEACHER_USERNAME = process.env.TEACHER_USERNAME || "teacher";
const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD || "showroom";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestJson({ path, method = "GET", payload = null, cookie = "" }) {
  return new Promise((resolve, reject) => {
    const body = payload ? JSON.stringify(payload) : "";
    const req = http.request(
      {
        hostname: HOST,
        port: PORT,
        path,
        method,
        headers: {
          Accept: "application/json",
          ...(body
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body)
              }
            : {}),
          ...(cookie ? { Cookie: cookie } : {})
        }
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          let parsed = null;
          try {
            parsed = raw ? JSON.parse(raw) : null;
          } catch (error) {
            reject(new Error(`Could not parse JSON from ${method} ${path}: ${raw.slice(0, 240)}`));
            return;
          }

          const nextCookieHeader = Array.isArray(res.headers["set-cookie"])
            ? res.headers["set-cookie"][0]
            : res.headers["set-cookie"];
          const nextCookie = nextCookieHeader ? String(nextCookieHeader).split(";")[0] : cookie;

          resolve({
            status: res.statusCode,
            body: parsed,
            cookie: nextCookie
          });
        });
      }
    );

    req.on("error", reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function buildStudents(avatarOptions, count = 10) {
  const stamp = Date.now();
  return Array.from({ length: count }, (_, index) => ({
    key: `student-${index + 1}`,
    displayName: `Alliance Test ${index + 1}`,
    username: `alliance_test_${stamp}_${index + 1}`,
    password: "class123",
    avatarId: avatarOptions[index % Math.max(1, avatarOptions.length)]?.id || null,
    cookie: "",
    bootstrap: null
  }));
}

function byTeam(students, teamId) {
  return students.filter((student) => student.teamId === teamId);
}

function getStudentOperator(students, teamId, kind) {
  const match = byTeam(students, teamId).find((student) => {
    if (kind === "diplomacy") {
      return Boolean(student.bootstrap?.user?.allianceState?.isOperator);
    }
    return Boolean(student.bootstrap?.currentRound?.sabotage?.isOperator);
  });
  expect(match, `Could not find the ${kind} operator for team ${teamId}.`);
  return match;
}

function getTeacherTeams(teacherBody) {
  return (
    teacherBody?.currentRound?.teacherSnapshot?.teams ||
    teacherBody?.admin?.teamBoard ||
    teacherBody?.admin?.teams ||
    teacherBody?.admin?.teamCatalog ||
    []
  );
}

function getTeacherTeam(teacherBody, teamId) {
  const team = getTeacherTeams(teacherBody).find((entry) => entry.id === teamId);
  expect(team, `Teacher snapshot is missing team ${teamId}.`);
  return team;
}

function getRoundPreset(teacherBody) {
  const presets = teacherBody?.presets || [];
  expect(presets.length, "No round presets were available to publish.");
  return presets[0];
}

function getChallengeAnswer(challenge) {
  expect(challenge, "No sabotage challenge was available.");
  const displaySequence = Array.isArray(challenge.displaySequence) ? challenge.displaySequence : [];
  const displayGrid = Array.isArray(challenge.displayGrid) ? challenge.displayGrid : [];
  const options = Array.isArray(challenge.options) ? challenge.options : [];

  switch (challenge.gameId) {
    case "memory-sweep":
      return displaySequence.slice();
    case "reverse-relay":
      return displaySequence.slice().reverse();
    case "double-agent":
      return displaySequence.slice().reverse();
    case "count-lock": {
      const count = displayGrid.filter((symbol) => symbol === challenge.targetSymbol).length;
      return [String(count)];
    }
    case "spot-the-intruder": {
      const counts = new Map();
      displayGrid.forEach((symbol) => {
        counts.set(symbol, (counts.get(symbol) || 0) + 1);
      });
      const odd = [...counts.entries()].find(([, count]) => count === 1)?.[0];
      expect(odd, "Could not solve intruder challenge.");
      return [odd];
    }
    case "pattern-pulse": {
      let nextSymbol = options[0];
      for (let patternLength = 1; patternLength <= displaySequence.length; patternLength += 1) {
        const pattern = displaySequence.slice(0, patternLength);
        const valid = displaySequence.every((symbol, index) => symbol === pattern[index % pattern.length]);
        if (valid) {
          nextSymbol = pattern[displaySequence.length % pattern.length];
          break;
        }
      }
      return [nextSymbol];
    }
    default:
      throw new Error(`Unsupported sabotage challenge type: ${challenge.gameId}`);
  }
}

function buildFailureAnswer(challenge) {
  const answer = getChallengeAnswer(challenge);
  const symbolPool = Array.isArray(challenge.symbolPool) && challenge.symbolPool.length
    ? challenge.symbolPool
    : ["A", "B", "C", "D"];
  if (!answer.length) {
    return ["?"];
  }
  const failed = answer.slice();
  const replacement = symbolPool.find((symbol) => symbol !== failed[0]) || "X";
  failed[0] = replacement;
  return failed;
}

async function refreshTeacher(cookie) {
  const response = await requestJson({ path: "/api/bootstrap", method: "GET", cookie });
  expect(response.status === 200, "Teacher bootstrap refresh failed.");
  return response;
}

async function refreshStudents(students) {
  for (const student of students) {
    const response = await requestJson({ path: "/api/bootstrap", method: "GET", cookie: student.cookie });
    expect(response.status === 200, `Bootstrap refresh failed for ${student.username}.`);
    student.bootstrap = response.body;
  }
}

async function main() {
  console.log(`Verifying alliance and sabotage flows against http://${HOST}:${PORT}`);

  const teacherLogin = await requestJson({
    path: "/api/admin/login",
    method: "POST",
    payload: { username: TEACHER_USERNAME, password: TEACHER_PASSWORD }
  });
  expect(teacherLogin.status === 200, "Teacher login failed.");
  let teacherCookie = teacherLogin.cookie;

  const resetResponse = await requestJson({
    path: "/api/admin/reset",
    method: "POST",
    cookie: teacherCookie,
    payload: { scope: "full" }
  });
  expect(resetResponse.status === 200, "Full reset failed.");

  let teacherBootstrap = await refreshTeacher(teacherCookie);
  const teamIds = (teacherBootstrap.body?.admin?.teamCatalog || []).map((team) => team.id);
  expect(teamIds.length >= 5, "Expected at least five active teams for the alliance test.");

  const avatarOptions = teacherBootstrap.body?.avatarOptions || [];
  const students = buildStudents(avatarOptions, 10);
  for (const student of students) {
    const registration = await requestJson({
      path: "/api/register",
      method: "POST",
      payload: {
        displayName: student.displayName,
        username: student.username,
        password: student.password,
        avatarId: student.avatarId
      }
    });
    expect(registration.status === 201, `Registration failed for ${student.username}.`);
    student.cookie = registration.cookie;
    student.bootstrap = registration.body;
  }

  for (let index = 0; index < students.length; index += 1) {
    const teamId = teamIds[index % 5];
    const assignResponse = await requestJson({
      path: "/api/admin/student/team",
      method: "POST",
      cookie: teacherCookie,
      payload: {
        userId: students[index].bootstrap.user.id,
        teamId
      }
    });
    expect(assignResponse.status === 200, `Could not assign ${students[index].username} to ${teamId}.`);
    students[index].teamId = teamId;
  }

  const openSession = await requestJson({
    path: "/api/admin/session",
    method: "POST",
    cookie: teacherCookie,
    payload: { isOpen: true }
  });
  expect(openSession.status === 200, "Opening the session failed.");

  teacherBootstrap = await refreshTeacher(teacherCookie);
  const preset = getRoundPreset(teacherBootstrap.body);
  const publishRound = await requestJson({
    path: "/api/admin/round/publish",
    method: "POST",
    cookie: teacherCookie,
    payload: {
      presetId: preset.id,
      headline: preset.headline || preset.title || "Alliance Test Event",
      body: preset.body || "Alliance verification round"
    }
  });
  expect(publishRound.status === 200, "Publishing the round failed.");
  teacherBootstrap = await refreshTeacher(teacherCookie);

  await refreshStudents(students);

  const [teamA, teamB, teamC, teamD, teamE] = teamIds;
  const diplomacyA = getStudentOperator(students, teamA, "diplomacy");
  const diplomacyB = getStudentOperator(students, teamB, "diplomacy");
  const diplomacyC = getStudentOperator(students, teamC, "diplomacy");

  let response = await requestJson({
    path: "/api/team-alliances/offer",
    method: "POST",
    cookie: diplomacyA.cookie,
    payload: { targetTeamId: teamB }
  });
  expect(response.status === 200, "Team A could not offer an alliance to Team B.");

  await refreshStudents(students);
  const teamBIncoming = getStudentOperator(students, teamB, "diplomacy").bootstrap.user.allianceState.pendingIncoming || [];
  expect(teamBIncoming.length > 0, "Team B never received Team A's alliance offer.");

  response = await requestJson({
    path: "/api/team-alliances/respond",
    method: "POST",
    cookie: diplomacyB.cookie,
    payload: {
      allianceId: teamBIncoming[0].id,
      decision: "accept"
    }
  });
  expect(response.status === 200, "Team B could not accept Team A's alliance.");

  response = await requestJson({
    path: "/api/team-alliances/offer",
    method: "POST",
    cookie: diplomacyA.cookie,
    payload: { targetTeamId: teamC }
  });
  expect(response.status === 200, "Team A could not offer a second alliance to Team C.");

  await refreshStudents(students);
  const teamCIncoming = getStudentOperator(students, teamC, "diplomacy").bootstrap.user.allianceState.pendingIncoming || [];
  expect(teamCIncoming.length > 0, "Team C never received Team A's alliance offer.");

  response = await requestJson({
    path: "/api/team-alliances/respond",
    method: "POST",
    cookie: diplomacyC.cookie,
    payload: {
      allianceId: teamCIncoming[0].id,
      decision: "accept"
    }
  });
  expect(response.status === 200, "Team C could not accept Team A's alliance.");

  await refreshStudents(students);
  teacherBootstrap = await refreshTeacher(teacherCookie);

  const teamAStudent = byTeam(students, teamA)[0];
  expect(teamAStudent.bootstrap.user.allianceState.activeAlliances.length === 2, "Team A did not end up with two active alliances.");
  expect(
    teamAStudent.bootstrap.currentRound.sabotage.availableTargets.some((team) => team.id === teamB),
    "Allied teams disappeared from the sabotage target list."
  );

  const sabotageA = getStudentOperator(students, teamA, "sabotage");
  const beforeJoint = {
    teamB: getTeacherTeam(teacherBootstrap.body, teamB),
    teamD: getTeacherTeam(teacherBootstrap.body, teamD)
  };

  response = await requestJson({
    path: "/api/team-sabotage/start",
    method: "POST",
    cookie: sabotageA.cookie,
    payload: {
      targetTeamId: teamD,
      sabotageType: teamAStudent.bootstrap.currentRound.sabotage.sabotageTypes[0].id,
      levelId: "medium",
      supportTeamId: teamB
    }
  });
  expect(response.status === 200, "Joint sabotage could not be started.");
  const jointChallenge = response.body.currentRound.sabotage.outgoing.challenge;

  response = await requestJson({
    path: "/api/team-sabotage/resolve",
    method: "POST",
    cookie: sabotageA.cookie,
    payload: { sequence: getChallengeAnswer(jointChallenge) }
  });
  expect(response.status === 200, "Joint sabotage could not be resolved.");
  expect(response.body.currentRound.sabotage.outgoing.status === "success", "Joint sabotage did not resolve as a success.");

  teacherBootstrap = await refreshTeacher(teacherCookie);
  const afterJoint = {
    teamB: getTeacherTeam(teacherBootstrap.body, teamB),
    teamD: getTeacherTeam(teacherBootstrap.body, teamD)
  };
  expect(
    afterJoint.teamB.sales > beforeJoint.teamB.sales
      || afterJoint.teamB.satisfaction > beforeJoint.teamB.satisfaction
      || afterJoint.teamB.reputation > beforeJoint.teamB.reputation
      || afterJoint.teamB.avgMorale > beforeJoint.teamB.avgMorale
      || afterJoint.teamB.avgTrust > beforeJoint.teamB.avgTrust,
    "Supporting ally did not receive a visible joint-operation bonus."
  );
  expect(
    afterJoint.teamD.sales < beforeJoint.teamD.sales
      || afterJoint.teamD.satisfaction < beforeJoint.teamD.satisfaction
      || afterJoint.teamD.reputation < beforeJoint.teamD.reputation
      || afterJoint.teamD.avgMorale < beforeJoint.teamD.avgMorale
      || afterJoint.teamD.avgTrust < beforeJoint.teamD.avgTrust,
    "Target team did not take a visible hit from the successful joint sabotage."
  );

  await refreshStudents(students);
  const sabotageC = getStudentOperator(students, teamC, "sabotage");
  response = await requestJson({
    path: "/api/team-sabotage/start",
    method: "POST",
    cookie: sabotageC.cookie,
    payload: {
      targetTeamId: teamA,
      sabotageType: byTeam(students, teamC)[0].bootstrap.currentRound.sabotage.sabotageTypes[1].id,
      levelId: "high",
      frameTeamId: teamE
    }
  });
  expect(response.status === 200, "Framed betrayal could not be started.");
  const frameChallenge = response.body.currentRound.sabotage.outgoing.challenge;
  response = await requestJson({
    path: "/api/team-sabotage/resolve",
    method: "POST",
    cookie: sabotageC.cookie,
    payload: { sequence: getChallengeAnswer(frameChallenge) }
  });
  expect(response.status === 200, "Framed betrayal could not be resolved.");
  expect(response.body.currentRound.sabotage.outgoing.status === "success", "Framed betrayal did not resolve as a success.");

  teacherBootstrap = await refreshTeacher(teacherCookie);
  expect(!teacherBootstrap.body.currentRound.sabotageBroadcast, "A successful framed betrayal should not create a public caught popup.");

  await refreshStudents(students);
  const sabotageB = getStudentOperator(students, teamB, "sabotage");
  response = await requestJson({
    path: "/api/team-sabotage/start",
    method: "POST",
    cookie: sabotageB.cookie,
    payload: {
      targetTeamId: teamA,
      sabotageType: byTeam(students, teamB)[0].bootstrap.currentRound.sabotage.sabotageTypes[0].id,
      levelId: "high",
      frameTeamId: teamE
    }
  });
  expect(response.status === 200, "Failed betrayal test could not be started.");
  const failedChallenge = response.body.currentRound.sabotage.outgoing.challenge;
  response = await requestJson({
    path: "/api/team-sabotage/resolve",
    method: "POST",
    cookie: sabotageB.cookie,
    payload: { sequence: buildFailureAnswer(failedChallenge) }
  });
  expect(response.status === 200, "Failed betrayal test could not be resolved.");
  expect(response.body.currentRound.sabotage.outgoing.status === "failed", "Failed betrayal did not resolve as a failure.");

  teacherBootstrap = await refreshTeacher(teacherCookie);
  expect(teacherBootstrap.body.currentRound.sabotageBroadcast, "Failed betrayal did not create a public broadcast.");
  expect(
    teacherBootstrap.body.currentRound.sabotageBroadcast.type === "betrayal-exposed",
    `Expected betrayal-exposed broadcast, got ${teacherBootstrap.body.currentRound.sabotageBroadcast.type || "nothing"}.`
  );
  const teamAAfterFailure = getTeacherTeam(teacherBootstrap.body, teamA);
  expect(
    !(teamAAfterFailure.allianceState.activeAlliances || []).some((alliance) => alliance.otherTeamId === teamB),
    "Alliance A-B should have been broken after the failed betrayal."
  );

  console.log("Alliance and sabotage verification passed.");
  console.log(JSON.stringify({
    roundMode: teamAStudent.bootstrap.currentRound.sabotage.roundMode,
    broadcast: teacherBootstrap.body.currentRound.sabotageBroadcast,
    teamAAlliances: teamAAfterFailure.allianceState.activeAlliances.map((entry) => entry.otherTeamName),
    teamBLatestBetrayal: getTeacherTeam(teacherBootstrap.body, teamB).allianceState.latestBetrayal,
    teamALatestBetrayal: teamAAfterFailure.allianceState.latestBetrayal
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
