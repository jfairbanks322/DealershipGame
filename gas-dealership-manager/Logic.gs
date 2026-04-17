function doGet() {
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("Dealership Manager (Google Edition)")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function dmBootstrap(auth) {
  dmSetupSpreadsheet();
  const context = dmResolveAuth_(auth);
  return dmBuildBootstrap_(context);
}

function dmRegisterStudent(payload) {
  dmSetupSpreadsheet();
  const username = dmNormalizeUsername_(payload.username);
  const displayName = String(payload.displayName || "").trim();
  const password = String(payload.password || "");
  if (!username || !displayName || password.length < 4) {
    throw new Error("Provide a display name, username, and password with at least 4 characters.");
  }

  const users = dmReadSheetObjects_("users");
  if (users.some(function(user) { return user.username === username; })) {
    throw new Error("That username is already taken.");
  }

  const userId = dmCreateId_();
  dmAppendSheetObject_("users", {
    id: userId,
    username: username,
    displayName: displayName,
    passwordHash: dmHash_(password),
    sales: DM_DEFAULT_STUDENT_STATE.sales,
    satisfaction: DM_DEFAULT_STUDENT_STATE.satisfaction,
    reputation: DM_DEFAULT_STUDENT_STATE.reputation,
    createdAt: dmNowIso_()
  });

  DM_STAFF_MEMBERS.forEach(function(member) {
    dmAppendSheetObject_("staff_state", {
      userId: userId,
      staffId: member.id,
      morale: 72,
      trust: 70
    });
  });

  const currentRoundId = dmGetSetting_("current_round_id");
  if (currentRoundId) {
    const round = dmGetRoundById_(currentRoundId);
    if (round) {
      const preset = dmGetEventPreset_(round.presetId);
      dmCreateCaseFile_(round.id, userId, preset);
    }
  }

  return dmBuildBootstrap_({ role: "student", userId: userId });
}

function dmLoginStudent(payload) {
  dmSetupSpreadsheet();
  const username = dmNormalizeUsername_(payload.username);
  const password = String(payload.password || "");
  const user = dmReadSheetObjects_("users").find(function(item) {
    return item.username === username;
  });
  if (!user || user.passwordHash !== dmHash_(password)) {
    throw new Error("Invalid student login.");
  }
  return dmBuildBootstrap_({ role: "student", userId: user.id });
}

function dmLoginTeacher(payload) {
  dmSetupSpreadsheet();
  const username = dmNormalizeUsername_(payload.username);
  const password = String(payload.password || "");
  const teacherUsername = dmGetSetting_("teacher_username") || DM_DEFAULT_TEACHER_USERNAME;
  const teacherHash = dmGetSetting_("teacher_password_hash") || dmHash_(DM_DEFAULT_TEACHER_PASSWORD);
  if (username !== teacherUsername || dmHash_(password) !== teacherHash) {
    throw new Error("Invalid teacher login.");
  }
  return dmBuildBootstrap_({ role: "teacher" });
}

function dmToggleSession(auth, isOpen) {
  dmRequireTeacher_(auth);
  if (isOpen) {
    dmSetSetting_("is_open", "1");
    dmSetSetting_("session_number", String(Number(dmGetSetting_("session_number") || "0") + 1));
  } else {
    dmSetSetting_("is_open", "0");
    dmCloseCurrentRound_();
  }
  return dmBuildBootstrap_({ role: "teacher" });
}

function dmLaunchRound(auth, payload) {
  dmRequireTeacher_(auth);
  const presetId = String(payload.presetId || "").trim();
  const preset = dmGetEventPreset_(presetId);
  if (!preset) {
    throw new Error("That event chain could not be found.");
  }
  if (dmGetSetting_("is_open") !== "1") {
    throw new Error("Open the class session before launching an event.");
  }

  dmCloseCurrentRound_();

  const roundId = dmCreateId_();
  const roundNumber = Number(dmGetSetting_("round_number") || "0") + 1;
  dmAppendSheetObject_("rounds", {
    id: roundId,
    presetId: preset.id,
    roundNumber: roundNumber,
    category: preset.category,
    headline: String(payload.headline || "").trim() || preset.headline,
    body: String(payload.body || "").trim() || preset.body,
    pressure: preset.pressure,
    status: "active",
    createdAt: dmNowIso_(),
    closedAt: ""
  });
  dmSetSetting_("round_number", String(roundNumber));
  dmSetSetting_("current_round_id", roundId);

  dmReadSheetObjects_("users").forEach(function(user) {
    dmCreateCaseFile_(roundId, user.id, preset);
  });

  return dmBuildBootstrap_({ role: "teacher" });
}

function dmSubmitChoice(auth, payload) {
  const context = dmRequireStudent_(auth);
  const optionId = String(payload.optionId || "").trim();
  if (!optionId) {
    throw new Error("Choose an option.");
  }

  const currentRoundId = dmGetSetting_("current_round_id");
  const round = dmGetRoundById_(currentRoundId);
  if (!round || round.status !== "active") {
    throw new Error("There is no active event right now.");
  }
  const preset = dmGetEventPreset_(round.presetId);
  const caseFiles = dmReadSheetObjects_("case_files");
  const caseFile = caseFiles.find(function(item) {
    return item.roundId === round.id && item.userId === context.userId;
  });
  if (!caseFile || caseFile.status !== "active") {
    throw new Error("Your dealership does not have an active case.");
  }

  const node = dmGetNodeDefinition_(preset, caseFile.currentNodeId);
  if (caseFile.currentPhase === "consultant") {
    if (!node.consultants[optionId]) {
      throw new Error("That staff member is not available for this step.");
    }
    caseFile.currentPhase = "action";
    caseFile.selectedConsultantId = optionId;
    caseFile.contextJson = JSON.stringify({
      visitedConsultants: dmUnique_((dmParseJson_(caseFile.contextJson, {}).visitedConsultants || []).concat([optionId]))
    });
    caseFile.updatedAt = dmNowIso_();
    dmReplaceRecord_("case_files", "id", caseFile.id, caseFile);
    dmAppendCaseChoice_(caseFile, {
      nodeId: caseFile.currentNodeId,
      phase: "consultant",
      consultantId: optionId,
      label: dmGetStaffMemberLabel_(optionId),
      summary: "You chose to consult " + dmGetStaffMemberLabel_(optionId) + " first."
    });
    return dmBuildBootstrap_(context);
  }

  const consultant = node.consultants[caseFile.selectedConsultantId];
  const option = consultant.options.find(function(item) {
    return item.id === optionId;
  });
  if (!option) {
    throw new Error("That action is not available.");
  }

  const totals = {
    sales: Number(caseFile.salesDelta || 0) + Number(option.effects.sales || 0),
    satisfaction: Number(caseFile.satisfactionDelta || 0) + Number(option.effects.satisfaction || 0),
    reputation: Number(caseFile.reputationDelta || 0) + Number(option.effects.reputation || 0)
  };

  dmApplyStaffEffects_(context.userId, option.effects.staff || {});
  dmAppendCaseChoice_(caseFile, {
    nodeId: caseFile.currentNodeId,
    phase: "action",
    consultantId: caseFile.selectedConsultantId,
    actionId: option.id,
    label: option.label,
    summary: option.outcome,
    salesDelta: option.effects.sales || 0,
    satisfactionDelta: option.effects.satisfaction || 0,
    reputationDelta: option.effects.reputation || 0
  });

  if (!option.nextNodeId) {
    dmApplyUserTotals_(context.userId, totals);
    caseFile.status = "resolved";
    caseFile.currentPhase = "done";
    caseFile.salesDelta = totals.sales;
    caseFile.satisfactionDelta = totals.satisfaction;
    caseFile.reputationDelta = totals.reputation;
    caseFile.updatedAt = dmNowIso_();
    caseFile.resolvedAt = dmNowIso_();
    dmReplaceRecord_("case_files", "id", caseFile.id, caseFile);
  } else {
    caseFile.currentNodeId = option.nextNodeId;
    caseFile.currentPhase = "consultant";
    caseFile.selectedConsultantId = "";
    caseFile.salesDelta = totals.sales;
    caseFile.satisfactionDelta = totals.satisfaction;
    caseFile.reputationDelta = totals.reputation;
    caseFile.updatedAt = dmNowIso_();
    dmReplaceRecord_("case_files", "id", caseFile.id, caseFile);
  }

  return dmBuildBootstrap_(context);
}

function dmBuildBootstrap_(context) {
  const currentRoundId = dmGetSetting_("current_round_id");
  const currentRound = dmGetRoundById_(currentRoundId);
  const base = {
    auth: context || null,
    game: {
      isOpen: dmGetSetting_("is_open") === "1",
      sessionNumber: Number(dmGetSetting_("session_number") || "0"),
      roundNumber: Number(dmGetSetting_("round_number") || "0"),
      currentRoundId: currentRoundId || null,
      hasActiveRound: Boolean(currentRoundId)
    },
    rules: {
      salesGoal: Number(dmGetSetting_("sales_goal") || DM_DEFAULT_SALES_GOAL)
    },
    currentRound: currentRound ? dmSerializeRound_(currentRound, context) : null,
    leaderboard: dmComputeLeaderboard_(),
    presets: context && context.role === "teacher" ? dmGetEventLibrary_().map(function(preset) {
      return {
        id: preset.id,
        category: preset.category,
        pressure: preset.pressure,
        headline: preset.headline,
        body: preset.body
      };
    }) : null,
    admin: context && context.role === "teacher" ? dmBuildTeacherDashboard_() : null
  };

  if (context && context.role === "student") {
    const user = dmReadSheetObjects_("users").find(function(item) {
      return item.id === context.userId;
    });
    base.user = dmSerializeUser_(user);
  } else {
    base.user = null;
  }

  return base;
}

function dmSerializeUser_(user) {
  if (!user) {
    return null;
  }
  const staff = dmReadSheetObjects_("staff_state").filter(function(item) {
    return item.userId === user.id;
  }).map(function(item) {
    const member = DM_STAFF_MEMBERS.find(function(staffMember) {
      return staffMember.id === item.staffId;
    }) || { id: item.staffId, name: item.staffId, title: "" };
    return {
      id: item.staffId,
      name: member.name,
      title: member.title,
      badge: member.badge,
      morale: Number(item.morale),
      trust: Number(item.trust)
    };
  });
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    sales: Number(user.sales),
    satisfaction: Number(user.satisfaction),
    reputation: Number(user.reputation),
    staff: staff
  };
}

function dmSerializeRound_(round, context) {
  const preset = dmGetEventPreset_(round.presetId);
  const payload = {
    id: round.id,
    roundNumber: Number(round.roundNumber || 0),
    category: round.category,
    pressure: round.pressure,
    headline: round.headline,
    body: round.body,
    status: round.status
  };
  if (context && context.role === "student") {
    const caseFile = dmReadSheetObjects_("case_files").find(function(item) {
      return item.roundId === round.id && item.userId === context.userId;
    });
    if (caseFile) {
      payload.caseFile = dmSerializeCaseFile_(caseFile, preset);
    }
  }
  return payload;
}

function dmSerializeCaseFile_(caseFile, preset) {
  const node = dmGetNodeDefinition_(preset, caseFile.currentNodeId);
  const choices = dmReadSheetObjects_("case_choices")
    .filter(function(item) { return item.caseFileId === caseFile.id; })
    .sort(function(a, b) { return Number(a.stepIndex) - Number(b.stepIndex); })
    .map(function(item) {
      return {
        phase: item.phase,
        label: item.label,
        summary: item.summary,
        salesDelta: Number(item.salesDelta || 0),
        satisfactionDelta: Number(item.satisfactionDelta || 0),
        reputationDelta: Number(item.reputationDelta || 0)
      };
    });

  const availableConsultants = caseFile.currentPhase === "consultant" && node ? Object.keys(node.consultants).map(function(id) {
    return {
      id: id,
      name: dmGetStaffMemberLabel_(id),
      prompt: node.consultants[id].prompt
    };
  }) : [];

  const availableActions = caseFile.currentPhase === "action" && node && node.consultants[caseFile.selectedConsultantId]
    ? node.consultants[caseFile.selectedConsultantId].options.map(function(option) {
      return {
        id: option.id,
        label: option.label
      };
    })
    : [];

  return {
    id: caseFile.id,
    status: caseFile.status,
    currentNodeId: caseFile.currentNodeId,
    currentPhase: caseFile.currentPhase,
    nodeTitle: node ? node.title : "",
    nodeBody: node ? node.body : "",
    selectedConsultantId: caseFile.selectedConsultantId || "",
    selectedConsultantName: caseFile.selectedConsultantId ? dmGetStaffMemberLabel_(caseFile.selectedConsultantId) : "",
    selectedConsultantPrompt: caseFile.selectedConsultantId && node && node.consultants[caseFile.selectedConsultantId]
      ? node.consultants[caseFile.selectedConsultantId].prompt
      : "",
    availableConsultants: availableConsultants,
    availableActions: availableActions,
    totals: {
      sales: Number(caseFile.salesDelta || 0),
      satisfaction: Number(caseFile.satisfactionDelta || 0),
      reputation: Number(caseFile.reputationDelta || 0)
    },
    timeline: choices
  };
}

function dmComputeLeaderboard_() {
  return dmReadSheetObjects_("users")
    .map(function(user) {
      const staff = dmReadSheetObjects_("staff_state").filter(function(item) {
        return item.userId === user.id;
      });
      const teamHealth = staff.length
        ? staff.reduce(function(sum, item) {
            return sum + Number(item.morale) + Number(item.trust);
          }, 0) / (staff.length * 2)
        : 0;
      return {
        userId: user.id,
        displayName: user.displayName,
        sales: Number(user.sales),
        satisfaction: Number(user.satisfaction),
        reputation: Number(user.reputation),
        teamHealth: Math.round(teamHealth)
      };
    })
    .sort(function(a, b) {
      if (b.sales !== a.sales) {
        return b.sales - a.sales;
      }
      return b.teamHealth - a.teamHealth;
    });
}

function dmBuildTeacherDashboard_() {
  const users = dmReadSheetObjects_("users");
  const rounds = dmReadSheetObjects_("rounds")
    .sort(function(a, b) { return Number(b.roundNumber || 0) - Number(a.roundNumber || 0); });
  const currentRoundId = dmGetSetting_("current_round_id");
  const currentRound = currentRoundId ? dmGetRoundById_(currentRoundId) : null;
  const caseFiles = dmReadSheetObjects_("case_files");

  const students = users
    .map(function(user) {
      const caseFile = currentRound ? caseFiles.find(function(item) {
        return item.roundId === currentRound.id && item.userId === user.id;
      }) : null;
      const caseStatus = dmDescribeTeacherCaseStatus_(caseFile, currentRound);
      return {
        userId: user.id,
        displayName: user.displayName,
        sales: Number(user.sales),
        satisfaction: Number(user.satisfaction),
        reputation: Number(user.reputation),
        caseStatus: caseStatus.label,
        nodeTitle: caseStatus.nodeTitle,
        caseTotals: caseStatus.totals
      };
    })
    .sort(function(a, b) { return a.displayName.localeCompare(b.displayName); });

  const activeCases = currentRound ? caseFiles.filter(function(item) {
    return item.roundId === currentRound.id;
  }) : [];
  const resolvedCount = activeCases.filter(function(item) {
    return item.status === "resolved";
  }).length;

  return {
    currentRound: currentRound ? {
      id: currentRound.id,
      roundNumber: Number(currentRound.roundNumber || 0),
      category: currentRound.category,
      headline: currentRound.headline,
      pressure: currentRound.pressure,
      activeStudents: activeCases.length,
      resolvedStudents: resolvedCount
    } : null,
    students: students,
    recentRounds: rounds.slice(0, 8).map(function(round) {
      return {
        id: round.id,
        roundNumber: Number(round.roundNumber || 0),
        category: round.category,
        headline: round.headline,
        pressure: round.pressure,
        status: round.status
      };
    })
  };
}

function dmDescribeTeacherCaseStatus_(caseFile, round) {
  if (!round || !caseFile) {
    return {
      label: "Waiting",
      nodeTitle: "",
      totals: { sales: 0, satisfaction: 0, reputation: 0 }
    };
  }
  const preset = dmGetEventPreset_(round.presetId);
  const node = dmGetNodeDefinition_(preset, caseFile.currentNodeId);
  if (caseFile.status === "resolved") {
    return {
      label: "Resolved",
      nodeTitle: node ? node.title : "Case closed",
      totals: {
        sales: Number(caseFile.salesDelta || 0),
        satisfaction: Number(caseFile.satisfactionDelta || 0),
        reputation: Number(caseFile.reputationDelta || 0)
      }
    };
  }
  if (caseFile.currentPhase === "consultant") {
    return {
      label: "Choosing who to consult",
      nodeTitle: node ? node.title : "",
      totals: {
        sales: Number(caseFile.salesDelta || 0),
        satisfaction: Number(caseFile.satisfactionDelta || 0),
        reputation: Number(caseFile.reputationDelta || 0)
      }
    };
  }
  return {
    label: "Choosing action",
    nodeTitle: caseFile.selectedConsultantId ? dmGetStaffMemberLabel_(caseFile.selectedConsultantId) : (node ? node.title : ""),
    totals: {
      sales: Number(caseFile.salesDelta || 0),
      satisfaction: Number(caseFile.satisfactionDelta || 0),
      reputation: Number(caseFile.reputationDelta || 0)
    }
  };
}

function dmResolveAuth_(auth) {
  if (!auth || !auth.role) {
    return null;
  }
  if (auth.role === "teacher") {
    return { role: "teacher" };
  }
  if (auth.role === "student" && auth.userId) {
    return { role: "student", userId: String(auth.userId) };
  }
  return null;
}

function dmRequireTeacher_(auth) {
  const context = dmResolveAuth_(auth);
  if (!context || context.role !== "teacher") {
    throw new Error("Teacher access required.");
  }
  return context;
}

function dmRequireStudent_(auth) {
  const context = dmResolveAuth_(auth);
  if (!context || context.role !== "student") {
    throw new Error("Student access required.");
  }
  return context;
}

function dmGetRoundById_(roundId) {
  if (!roundId) {
    return null;
  }
  return dmReadSheetObjects_("rounds").find(function(round) {
    return round.id === roundId;
  }) || null;
}

function dmCloseCurrentRound_() {
  const currentRoundId = dmGetSetting_("current_round_id");
  if (!currentRoundId) {
    return;
  }
  const round = dmGetRoundById_(currentRoundId);
  if (round) {
    round.status = "closed";
    round.closedAt = dmNowIso_();
    dmReplaceRecord_("rounds", "id", round.id, round);
  }
  dmSetSetting_("current_round_id", "");
}

function dmCreateCaseFile_(roundId, userId, preset) {
  if (!preset) {
    return;
  }
  const existing = dmReadSheetObjects_("case_files").find(function(item) {
    return item.roundId === roundId && item.userId === userId;
  });
  if (existing) {
    return;
  }
  dmAppendSheetObject_("case_files", {
    id: dmCreateId_(),
    roundId: roundId,
    userId: userId,
    currentNodeId: preset.rootNodeId,
    currentPhase: "consultant",
    selectedConsultantId: "",
    status: "active",
    contextJson: "{}",
    salesDelta: 0,
    satisfactionDelta: 0,
    reputationDelta: 0,
    updatedAt: dmNowIso_(),
    resolvedAt: ""
  });
}

function dmReplaceRecord_(sheetName, keyField, keyValue, nextRecord) {
  const records = dmReadSheetObjects_(sheetName).map(function(record) {
    return record[keyField] === keyValue ? nextRecord : record;
  });
  dmReplaceSheetObjects_(sheetName, records);
}

function dmAppendCaseChoice_(caseFile, data) {
  const existing = dmReadSheetObjects_("case_choices").filter(function(item) {
    return item.caseFileId === caseFile.id;
  });
  dmAppendSheetObject_("case_choices", {
    id: dmCreateId_(),
    caseFileId: caseFile.id,
    stepIndex: existing.length,
    nodeId: data.nodeId,
    phase: data.phase,
    consultantId: data.consultantId || "",
    actionId: data.actionId || "",
    label: data.label || "",
    summary: data.summary || "",
    salesDelta: Number(data.salesDelta || 0),
    satisfactionDelta: Number(data.satisfactionDelta || 0),
    reputationDelta: Number(data.reputationDelta || 0),
    createdAt: dmNowIso_()
  });
}

function dmApplyStaffEffects_(userId, effects) {
  const state = dmReadSheetObjects_("staff_state").map(function(record) {
    if (record.userId !== userId || !effects[record.staffId]) {
      return record;
    }
    record.morale = dmClamp_(Number(record.morale) + Number(effects[record.staffId].morale || 0), 0, 100);
    record.trust = dmClamp_(Number(record.trust) + Number(effects[record.staffId].trust || 0), 0, 100);
    return record;
  });
  dmReplaceSheetObjects_("staff_state", state);
}

function dmApplyUserTotals_(userId, totals) {
  const users = dmReadSheetObjects_("users").map(function(user) {
    if (user.id !== userId) {
      return user;
    }
    user.sales = Number(user.sales) + Number(totals.sales || 0);
    user.satisfaction = dmClamp_(Number(user.satisfaction) + Number(totals.satisfaction || 0), 0, 100);
    user.reputation = dmClamp_(Number(user.reputation) + Number(totals.reputation || 0), 0, 100);
    return user;
  });
  dmReplaceSheetObjects_("users", users);
}

function dmClamp_(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function dmParseJson_(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function dmNormalizeUsername_(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
}

function dmUnique_(items) {
  return Array.from(new Set(items));
}

function dmGetStaffMemberLabel_(staffId) {
  const member = DM_STAFF_MEMBERS.find(function(item) {
    return item.id === staffId;
  });
  return member ? member.name : staffId;
}
