const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SOURCE_PATH = path.join(ROOT, "data", "wrestlepad-stats-source.json");
const OUTPUT_DIR = path.join(ROOT, "public", "assets", "wrestlers");
const SNAPSHOT_PATH = path.join(ROOT, "public", "wrestlepad-portraits.snapshot.js");
const USER_AGENT = "WrestlePadPrototype/1.0 (local dev portrait fetcher)";
const THUMB_SIZE = 320;
const FETCH_RETRY_DELAYS_MS = [700, 1400, 2400];

async function main() {
  const source = JSON.parse(fs.readFileSync(SOURCE_PATH, "utf8"));
  const records = Array.isArray(source.records) ? source.records : [];

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const paths = {};
  let fetchedCount = 0;

  for (const record of records) {
    const title = record.wikimedia?.pageTitle;
    if (!title) {
      continue;
    }

    let thumbnail = null;
    try {
      thumbnail = await fetchThumbnailInfo(title);
    } catch (error) {
      record.portrait = {
        ...(record.portrait || {}),
        status: "error",
        fetchedAt: new Date().toISOString(),
        sourceUrl: null,
        localPath: null,
        error: String(error.message || error)
      };
      continue;
    }
    if (!thumbnail?.source) {
      record.portrait = {
        ...(record.portrait || {}),
        status: "missing",
        fetchedAt: new Date().toISOString(),
        sourceUrl: null,
        localPath: null
      };
      continue;
    }

    const extension = inferExtension(thumbnail.source, thumbnail.mimeType);
    const filename = `${record.id}.${extension}`;
    const filePath = path.join(OUTPUT_DIR, filename);
    try {
      await downloadFile(thumbnail.source, filePath);
    } catch (error) {
      record.portrait = {
        ...(record.portrait || {}),
        status: "error",
        fetchedAt: new Date().toISOString(),
        sourceUrl: thumbnail.source,
        localPath: null,
        error: String(error.message || error)
      };
      continue;
    }

    const localPath = `/assets/wrestlers/${filename}`;
    paths[record.id] = localPath;
    fetchedCount += 1;

    record.portrait = {
      status: "fetched",
      fetchedAt: new Date().toISOString(),
      sourceUrl: thumbnail.source,
      localPath,
      width: thumbnail.width || null,
      height: thumbnail.height || null
    };
  }

  source.meta = {
    ...(source.meta || {}),
    portraitsUpdatedAt: new Date().toISOString().slice(0, 10)
  };

  fs.writeFileSync(SOURCE_PATH, JSON.stringify(source, null, 2) + "\n");

  const payload = {
    meta: {
      label: "WrestlePad portrait snapshot",
      sourceKind: "wikimedia_cache",
      updatedAt: new Date().toISOString().slice(0, 10),
      fetchedCount,
      recordCount: records.length,
      note: "Portraits are cached locally from Wikimedia page images."
    },
    paths
  };

  fs.writeFileSync(SNAPSHOT_PATH, `window.WRESTLEPAD_PORTRAITS = ${JSON.stringify(payload, null, 2)};\n`);
  console.log(`Fetched ${fetchedCount} WrestlePad portraits -> ${path.relative(ROOT, SNAPSHOT_PATH)}`);
}

async function fetchThumbnailInfo(title) {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("prop", "pageimages");
  url.searchParams.set("piprop", "thumbnail|name");
  url.searchParams.set("pithumbsize", String(THUMB_SIZE));
  url.searchParams.set("titles", title);

  const response = await fetchWithRetries(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Wikimedia thumbnail info for ${title}: ${response.status}`);
  }

  const payload = await response.json();
  const pages = payload.query?.pages || {};
  const page = Object.values(pages)[0];
  return page?.thumbnail || null;
}

async function downloadFile(url, filePath) {
  const response = await fetchWithRetries(url);
  if (!response.ok) {
    throw new Error(`Failed to download portrait ${url}: ${response.status}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, bytes);
}

async function fetchWithRetries(url) {
  let lastResponse = null;
  for (let attempt = 0; attempt <= FETCH_RETRY_DELAYS_MS.length; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        "user-agent": USER_AGENT
      }
    });
    if (response.ok || response.status !== 429 || attempt === FETCH_RETRY_DELAYS_MS.length) {
      return response;
    }
    lastResponse = response;
    await sleep(FETCH_RETRY_DELAYS_MS[attempt]);
  }
  return lastResponse;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function inferExtension(url, mimeType) {
  if (typeof mimeType === "string") {
    if (mimeType.includes("png")) {
      return "png";
    }
    if (mimeType.includes("webp")) {
      return "webp";
    }
  }
  const cleanUrl = url.split("?")[0];
  const ext = path.extname(cleanUrl).replace(".", "").toLowerCase();
  if (ext) {
    return ext;
  }
  return "jpg";
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
