const DM_SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();

function dmSetupSpreadsheet() {
  const existingId = DM_SCRIPT_PROPERTIES.getProperty("DM_SHEET_ID");
  if (existingId) {
    return {
      ok: true,
      spreadsheetId: existingId,
      spreadsheetUrl: "https://docs.google.com/spreadsheets/d/" + existingId + "/edit"
    };
  }

  const spreadsheet = SpreadsheetApp.create("Dealership Manager Data");
  DM_SCRIPT_PROPERTIES.setProperty("DM_SHEET_ID", spreadsheet.getId());
  const ss = SpreadsheetApp.openById(spreadsheet.getId());
  const sheets = ["settings", "users", "staff_state", "rounds", "case_files", "case_choices"];
  sheets.forEach(function(name, index) {
    const sheet = index === 0 ? ss.getSheets()[0] : ss.insertSheet(name);
    sheet.setName(name);
  });

  dmSetSheetHeader_("settings", ["key", "value"]);
  dmSetSheetHeader_("users", ["id", "username", "displayName", "passwordHash", "sales", "satisfaction", "reputation", "createdAt"]);
  dmSetSheetHeader_("staff_state", ["userId", "staffId", "morale", "trust"]);
  dmSetSheetHeader_("rounds", ["id", "presetId", "roundNumber", "category", "headline", "body", "pressure", "status", "createdAt", "closedAt"]);
  dmSetSheetHeader_("case_files", [
    "id", "roundId", "userId", "currentNodeId", "currentPhase", "selectedConsultantId",
    "status", "contextJson", "salesDelta", "satisfactionDelta", "reputationDelta", "updatedAt", "resolvedAt"
  ]);
  dmSetSheetHeader_("case_choices", [
    "id", "caseFileId", "stepIndex", "nodeId", "phase", "consultantId", "actionId",
    "label", "summary", "salesDelta", "satisfactionDelta", "reputationDelta", "createdAt"
  ]);

  dmSeedDefaults_();

  return {
    ok: true,
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl()
  };
}

function dmSeedDefaults_() {
  dmSetSetting_("teacher_username", DM_DEFAULT_TEACHER_USERNAME);
  dmSetSetting_("teacher_password_hash", dmHash_(DM_DEFAULT_TEACHER_PASSWORD));
  dmSetSetting_("sales_goal", String(DM_DEFAULT_SALES_GOAL));
  dmSetSetting_("is_open", "0");
  dmSetSetting_("session_number", "0");
  dmSetSetting_("round_number", "0");
  dmSetSetting_("current_round_id", "");
}

function dmGetSpreadsheet_() {
  const id = DM_SCRIPT_PROPERTIES.getProperty("DM_SHEET_ID");
  if (!id) {
    throw new Error("Run dmSetupSpreadsheet() first.");
  }
  return SpreadsheetApp.openById(id);
}

function dmGetSheet_(name) {
  const sheet = dmGetSpreadsheet_().getSheetByName(name);
  if (!sheet) {
    throw new Error("Missing sheet: " + name);
  }
  return sheet;
}

function dmSetSheetHeader_(name, headers) {
  const sheet = dmGetSheet_(name);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function dmReadSheetObjects_(name) {
  const sheet = dmGetSheet_(name);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) {
    return [];
  }
  const headers = values[0];
  return values.slice(1).filter(function(row) {
    return row.some(function(cell) { return cell !== ""; });
  }).map(function(row) {
    const item = {};
    headers.forEach(function(header, index) {
      item[header] = row[index];
    });
    return item;
  });
}

function dmAppendSheetObject_(name, record) {
  const sheet = dmGetSheet_(name);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(function(header) {
    return Object.prototype.hasOwnProperty.call(record, header) ? record[header] : "";
  });
  sheet.appendRow(row);
}

function dmReplaceSheetObjects_(name, records) {
  const sheet = dmGetSheet_(name);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.getRange(2, 1, Math.max(sheet.getMaxRows() - 1, 1), headers.length).clearContent();
  if (!records.length) {
    return;
  }
  const rows = records.map(function(record) {
    return headers.map(function(header) {
      return Object.prototype.hasOwnProperty.call(record, header) ? record[header] : "";
    });
  });
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

function dmGetSetting_(key) {
  const settings = dmReadSheetObjects_("settings");
  const found = settings.find(function(row) {
    return row.key === key;
  });
  return found ? String(found.value || "") : "";
}

function dmSetSetting_(key, value) {
  const settings = dmReadSheetObjects_("settings");
  const next = settings.filter(function(row) {
    return row.key !== key;
  });
  next.push({ key: key, value: value });
  dmReplaceSheetObjects_("settings", next);
}

function dmHash_(value) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value), Utilities.Charset.UTF_8);
  return digest.map(function(byte) {
    const normalized = byte < 0 ? byte + 256 : byte;
    return ("0" + normalized.toString(16)).slice(-2);
  }).join("");
}

function dmNowIso_() {
  return new Date().toISOString();
}

function dmCreateId_() {
  return Utilities.getUuid();
}
