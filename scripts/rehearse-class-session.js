const http = require("http");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 3000);
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

function buildStudents(avatarOptions) {
  const stamp = Date.now();
  return [
    {
      key: "steady",
      displayName: "Rehearsal Steady",
      username: `rehearsal_steady_${stamp}`,
      password: "class123",
      pauseMs: 140,
      avatarId: avatarOptions[0]?.id || null
    },
    {
      key: "bold",
      displayName: "Rehearsal Bold",
      username: `rehearsal_bold_${stamp}`,
      password: "class123",
      pauseMs: 260,
      avatarId: avatarOptions[1]?.id || avatarOptions[0]?.id || null
    },
    {
      key: "balanced",
      displayName: "Rehearsal Balanced",
      username: `rehearsal_balanced_${stamp}`,
      password: "class123",
      pauseMs: 380,
      avatarId: avatarOptions[2]?.id || avatarOptions[0]?.id || null
    }
  ];
}

function chooseFromList(items, studentKey, stepIndex) {
  if (!Array.isArray(items) || !items.length) {
    return null;
  }

  if (studentKey === "bold") {
    return items[items.length - 1];
  }
  if (studentKey === "balanced") {
    return items[stepIndex % items.length];
  }
  return items[0];
}

function chooseOptionId(studentCase, studentKey) {
  expect(studentCase, "Student case disappeared mid-rehearsal.");

  if (studentCase.currentPhase === "consultant") {
    const consultant = chooseFromList(studentCase.availableConsultants, studentKey, studentCase.stepIndex || 1);
    expect(consultant?.id, `No consultant option was available for ${studentKey}.`);
    return consultant.id;
  }

  if (studentCase.currentPhase === "action") {
    const option = chooseFromList(studentCase.actionOptions, studentKey, studentCase.stepIndex || 1);
    expect(option?.id, `No action option was available for ${studentKey}.`);
    return option.id;
  }

  throw new Error(`Unknown case phase: ${studentCase.currentPhase}`);
}

function pickPreset(presets) {
  const preferredOrder = [
    "open-close-kitchen-feud",
    "wrong-orders-handwriting",
    "viral-gossip-backfire",
    "food-heaven-rivalry"
  ];

  for (const presetId of preferredOrder) {
    const match = (presets || []).find((entry) => entry.id === presetId);
    if (match) {
      return match;
    }
  }

  return (presets || [])[0] || null;
}

async function runStudentFlow(student) {
  let snapshot = student.bootstrap;
  let turnsTaken = 0;

  for (let guard = 0; guard < 24; guard += 1) {
    const round = snapshot.currentRound;
    expect(round, `No current round was available for ${student.username}.`);

    if (round.userResponse) {
      return {
        username: student.username,
        displayName: student.displayName,
        turnsTaken,
        responseId: round.userResponse.id,
        optionLabel: round.userResponse.optionLabel,
        salesDelta: round.userResponse.salesDelta,
        satisfactionDelta: round.userResponse.satisfactionDelta,
        reputationDelta: round.userResponse.reputationDelta
      };
    }

    const studentCase = round.studentCase;
    const beforePhase = studentCase?.currentPhase || null;
    const beforeStep = studentCase?.stepIndex || null;
    const optionId = chooseOptionId(studentCase, student.key);

    const response = await requestJson({
      path: "/api/respond",
      method: "POST",
      cookie: student.cookie,
      payload: { optionId }
    });

    expect(response.status === 200, `Response submission failed for ${student.username} at ${beforePhase}.`);
    snapshot = response.body;
    turnsTaken += 1;
    await sleep(student.pauseMs);

    const updatedRound = snapshot.currentRound;
    expect(updatedRound, `Current round disappeared after a response for ${student.username}.`);

    if (updatedRound.userResponse) {
      continue;
    }

    const updatedCase = updatedRound.studentCase;
    expect(updatedCase, `Student case disappeared after a response for ${student.username}.`);
    expect(
      updatedCase.currentPhase !== beforePhase || updatedCase.stepIndex !== beforeStep,
      `Case progress did not change for ${student.username} after sending ${optionId}.`
    );
  }

  throw new Error(`Rehearsal flow did not resolve for ${student.username} within the guard limit.`);
}

function verifyLeaderboards(teacherBootstrap, students) {
  const leaderboards = teacherBootstrap.body?.leaderboards || {};
  const overall = leaderboards.overall?.entries || [];
  const revenue = leaderboards.revenue?.entries || [];
  const culture = leaderboards.culture?.entries || [];

  expect(overall.length === students.length, "Overall leaderboard did not include every rehearsal student.");
  expect(revenue.length === students.length, "Revenue leaderboard did not include every rehearsal student.");
  expect(culture.length === students.length, "Culture leaderboard did not include every rehearsal student.");

  students.forEach((student) => {
    expect(
      overall.some((entry) => entry.username === student.username),
      `Overall leaderboard is missing ${student.username}.`
    );
  });
}

async function main() {
  console.log(`Running Feast Haven rehearsal against http://${HOST}:${PORT}`);

  const teacherLogin = await requestJson({
    path: "/api/admin/login",
    method: "POST",
    payload: {
      username: TEACHER_USERNAME,
      password: TEACHER_PASSWORD
    }
  });
  expect(teacherLogin.status === 200, "Teacher login failed.");
  const teacherCookie = teacherLogin.cookie;

  const resetResponse = await requestJson({
    path: "/api/admin/reset",
    method: "POST",
    cookie: teacherCookie,
    payload: { scope: "full" }
  });
  expect(resetResponse.status === 200, "Full reset failed.");

  const openSession = await requestJson({
    path: "/api/admin/session",
    method: "POST",
    cookie: teacherCookie,
    payload: { isOpen: true }
  });
  expect(openSession.status === 200, "Opening the class session failed.");
  expect(openSession.body.game?.isOpen === true, "Class session did not report as open.");

  const teacherBootstrap = await requestJson({
    path: "/api/bootstrap",
    method: "GET",
    cookie: teacherCookie
  });
  expect(teacherBootstrap.status === 200, "Teacher bootstrap fetch failed.");

  const selectedPreset = pickPreset(teacherBootstrap.body.presets || []);
  expect(selectedPreset, "No Feast Haven scenario presets were available.");

  const publishResponse = await requestJson({
    path: "/api/admin/round/publish",
    method: "POST",
    cookie: teacherCookie,
    payload: {
      presetId: selectedPreset.id
    }
  });
  expect(publishResponse.status === 200, "Publishing a rehearsal round failed.");
  expect(
    publishResponse.body.currentRound?.presetId === selectedPreset.id,
    "Published round did not match the chosen preset."
  );

  const students = [];
  for (const student of buildStudents(teacherBootstrap.body.avatarOptions || [])) {
    const registerResponse = await requestJson({
      path: "/api/register",
      method: "POST",
      payload: {
        displayName: student.displayName,
        username: student.username,
        password: student.password,
        ...(student.avatarId ? { avatarId: student.avatarId } : {})
      }
    });

    expect(registerResponse.status === 201, `Student registration failed for ${student.username}.`);
    students.push({
      ...student,
      cookie: registerResponse.cookie,
      bootstrap: registerResponse.body
    });
  }

  const flowResults = [];
  for (const student of students) {
    const result = await runStudentFlow(student);
    flowResults.push(result);
  }

  const teacherAfterPlay = await requestJson({
    path: "/api/bootstrap",
    method: "GET",
    cookie: teacherCookie
  });
  expect(teacherAfterPlay.status === 200, "Teacher bootstrap fetch after rehearsal failed.");

  const currentRound = teacherAfterPlay.body.currentRound;
  expect(currentRound, "Teacher dashboard no longer had an active round after rehearsal.");
  expect(currentRound.responseCount === students.length, "Not every rehearsal student completed the round.");
  expect(currentRound.responseRate === 100, "Response rate did not reach 100% after rehearsal.");
  expect(
    Number.isFinite(currentRound.timingStats?.averageResponseMs),
    "Round timing stats did not populate after rehearsal."
  );

  const admin = teacherAfterPlay.body.admin;
  expect(admin, "Teacher admin payload was missing after rehearsal.");
  expect(admin.metrics?.studentCount === students.length, "Teacher metrics student count was incorrect.");
  expect(admin.recentResponses?.length >= students.length, "Recent responses did not capture the rehearsal runs.");
  expect(admin.analytics?.fastestResponder, "Fastest responder analytics did not populate.");
  expect(admin.analytics?.slowestResponder, "Slowest responder analytics did not populate.");
  expect(admin.students?.length === students.length, "Teacher student roster length was incorrect after rehearsal.");

  students.forEach((student) => {
    const teacherStudent = admin.students.find((entry) => entry.username === student.username);
    expect(teacherStudent, `Teacher dashboard is missing ${student.username}.`);
    expect(
      Number.isFinite(teacherStudent.timingStats?.averageResolutionMs),
      `Timing stats did not populate for ${student.username}.`
    );
    expect(
      teacherStudent.currentRoundTiming?.state === "completed",
      `${student.username} did not show as completed in the teacher timing panel.`
    );
  });

  verifyLeaderboards(teacherAfterPlay, students);

  console.log("Feast Haven rehearsal complete.");
  console.log(`Scenario: ${currentRound.headline}`);
  console.log(`Students: ${students.map((student) => student.username).join(", ")}`);
  flowResults.forEach((result) => {
    console.log(
      `- ${result.displayName}: ${result.turnsTaken} submissions, ${result.optionLabel}, deltas ${result.salesDelta}/${result.satisfactionDelta}/${result.reputationDelta}`
    );
  });
  console.log(
    `Round timing avg: ${currentRound.timingStats.averageResponseMs} ms | fastest: ${admin.analytics.fastestResponder?.studentName || "n/a"} | slowest: ${admin.analytics.slowestResponder?.studentName || "n/a"}`
  );
  console.log(
    `Leaderboards verified: overall ${teacherAfterPlay.body.leaderboards.overall.entries.length}, revenue ${teacherAfterPlay.body.leaderboards.revenue.entries.length}, culture ${teacherAfterPlay.body.leaderboards.culture.entries.length}`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
