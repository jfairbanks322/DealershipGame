const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SOURCE_PATH = path.join(ROOT, "data", "wrestlepad-stats-source.json");
const OUTPUT_PATH = path.join(ROOT, "public", "wrestlepad-stats.snapshot.js");

const REQUIRED_METRICS = [
  "total_matches",
  "total_wins",
  "ppv_ple_matches",
  "ppv_ple_wins",
  "title_match_wins",
  "cagematch_top10_avg",
  "cagematch_rated_8_plus"
];

function main() {
  const source = JSON.parse(fs.readFileSync(SOURCE_PATH, "utf8"));
  const records = Array.isArray(source.records) ? source.records : [];

  const metrics = {};
  const recordMeta = {};
  let importedCount = 0;
  let partialImportCount = 0;
  let mappedCount = 0;

  for (const record of records) {
    validateRecord(record);
    metrics[record.id] = {
      total_matches: record.metrics.total_matches,
      total_wins: record.metrics.total_wins,
      ppv_ple_matches: record.metrics.ppv_ple_matches,
      ppv_ple_wins: record.metrics.ppv_ple_wins,
      title_match_wins: record.metrics.title_match_wins,
      cagematch_top10_avg: record.metrics.cagematch_top10_avg,
      cagematch_rated_8_plus: record.metrics.cagematch_rated_8_plus
    };
    recordMeta[record.id] = {
      name: record.name || record.id,
      sourceStatus: record.sourceStatus || "seeded_fallback",
      importedMetrics: Array.isArray(record.importedMetrics) ? record.importedMetrics : [],
      sourceNotes: record.sourceNotes || "",
      cagematch: record.cagematch || null,
      verifiedAt: record.verifiedAt || null
    };
    if (record.sourceStatus === "imported") {
      importedCount += 1;
    } else if (record.sourceStatus === "partial_import") {
      partialImportCount += 1;
    } else if (record.sourceStatus === "mapped") {
      mappedCount += 1;
    }
  }

  const payload = {
    meta: {
      label: source.meta?.label || "WrestlePad stats snapshot",
      sourceKind: source.meta?.sourceKind || "seeded_snapshot",
      updatedAt: source.meta?.updatedAt || new Date().toISOString().slice(0, 10),
      importedCount,
      partialImportCount,
      mappedCount,
      recordCount: records.length,
      note: source.meta?.note || ""
    },
    metrics,
    recordMeta
  };

  const output = `window.WRESTLEPAD_STATS_SNAPSHOT = ${JSON.stringify(payload, null, 2)};\n`;
  fs.writeFileSync(OUTPUT_PATH, output);
  console.log(`Built WrestlePad stats snapshot with ${records.length} records -> ${path.relative(ROOT, OUTPUT_PATH)}`);
}

function validateRecord(record) {
  if (!record || typeof record !== "object") {
    throw new Error("Invalid record in wrestlepad stats source.");
  }
  if (!record.id || typeof record.id !== "string") {
    throw new Error("Every record needs a string id.");
  }
  if (record.name && typeof record.name !== "string") {
    throw new Error(`Record ${record.id} has an invalid name.`);
  }
  if (!record.metrics || typeof record.metrics !== "object") {
    throw new Error(`Record ${record.id} is missing metrics.`);
  }
  for (const metricName of REQUIRED_METRICS) {
    const value = record.metrics[metricName];
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error(`Record ${record.id} is missing numeric metric ${metricName}.`);
    }
  }
}

main();
