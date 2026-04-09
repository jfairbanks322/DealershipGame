#!/usr/bin/env node

const { runBackgroundMetadataRefresh } = require("../server");

async function main() {
  const args = new Set(process.argv.slice(2));
  const force = args.has("--force");
  const asJson = args.has("--json");
  const result = await runBackgroundMetadataRefresh({ force });

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(result.message);
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exitCode = 1;
});
