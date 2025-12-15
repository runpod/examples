import { writeFileSync } from "fs";

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
if (!RUNPOD_API_KEY) {
  console.error("Missing RUNPOD_API_KEY in env");
  console.error(
    'Example: RUNPOD_API_KEY="..." node benchmarks/bench-chatterbox-turbo.mjs "RTX 4090"'
  );
  process.exit(1);
}

// Final public endpoint base URL.
const BASE_URL = "https://api.runpod.ai/v2/chatterbox-turbo";
const RUNSYNC_URL = `${BASE_URL}/runsync`;

// Label the current GPU for later comparison (e.g. "A40", "A4000", "4090-optimized").
const GPU_LABEL = process.argv.slice(2).join(" ") || "unknown-gpu";

const VOICE = "lucy";

// Benchmark config
const ROUNDS = 3;
const BETWEEN_REQUESTS_MS = 150;
const INCLUDE_AUDIO_DOWNLOAD = true; // set to false to measure runsync only
const TIMEOUT_MS = 120_000;

function nowMs() {
  return Number(process.hrtime.bigint()) / 1e6;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeText(text) {
  // Keep comparable to provider behavior (newlines are normalized).
  return text.replace(/[\r\n]+/g, " ");
}

function buildCases() {
  // 20 cases with increasing length.
  // Keep tags sparse so we measure length impact more than tag parsing.
  const wordCounts = [
    5, 8, 10, 12, 15, 18, 22, 26, 30, 34, 38, 42, 46, 50, 60, 70, 80, 90, 100,
    120,
  ];

  const base =
    '[clear throat] Day zero support on Runpod: "Chatterbox Turbo" by ResembleAI. [chuckle]';
  const filler =
    "Turbo is fast, expressive, and great for real-time voice agents.";

  return wordCounts.map((words, i) => {
    const baseWords = base.split(/\s+/).length;
    const fillerWords = filler.split(/\s+/).length;

    const repeats = Math.max(0, Math.ceil((words - baseWords) / fillerWords));
    const text = normalizeText(
      `${base} ${Array.from({ length: repeats }, () => filler).join(
        " "
      )} [laugh]`
    );

    return {
      id: `case-${String(i + 1).padStart(2, "0")}`,
      targetWords: words,
      text,
    };
  });
}

async function runOnce({ text, voice }) {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), TIMEOUT_MS);

  const requestBody = {
    input: {
      prompt: text,
      voice,
    },
  };

  const t0 = nowMs();
  const res = await fetch(RUNSYNC_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RUNPOD_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
    signal: abortController.signal,
  });
  const t1 = nowMs();

  const raw = await res.text();
  clearTimeout(timeout);

  let json;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(
      `runsync failed (${res.status}): ${
        (json && json.error) || raw || "unknown error"
      }`
    );
  }

  const output = json?.output ?? json;
  const audioUrl = output?.audio_url;

  let downloadMs = null;
  let audioBytes = null;

  if (INCLUDE_AUDIO_DOWNLOAD) {
    if (typeof audioUrl !== "string") {
      throw new Error("No audio_url in response");
    }

    const t2 = nowMs();
    const audioRes = await fetch(audioUrl);
    const t3 = nowMs();

    if (!audioRes.ok) {
      throw new Error(`audio download failed (${audioRes.status})`);
    }

    const buf = await audioRes.arrayBuffer();
    downloadMs = t3 - t2;
    audioBytes = buf.byteLength;
  }

  return {
    runsyncMs: t1 - t0,
    downloadMs,
    totalMs: t1 - t0 + (downloadMs ?? 0),
    audioUrl: typeof audioUrl === "string" ? audioUrl : null,
    cost: typeof output?.cost === "number" ? output.cost : null,
    audioBytes,
  };
}

function summarize(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const p = (q) =>
    sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
  return {
    count: values.length,
    mean,
    median: p(0.5),
    p90: p(0.9),
    p95: p(0.95),
  };
}

async function main() {
  const cases = buildCases();

  // Warm-up (not recorded)
  await runOnce({ text: cases[0].text, voice: VOICE });
  await sleep(500);

  const results = [];

  for (let round = 1; round <= ROUNDS; round++) {
    console.log(`\n=== round ${round}/${ROUNDS} (${GPU_LABEL}) ===`);

    for (const c of cases) {
      const wordCount = c.text.split(/\s+/).filter(Boolean).length;

      try {
        const r = await runOnce({ text: c.text, voice: VOICE });
        results.push({
          gpu: GPU_LABEL,
          round,
          caseId: c.id,
          targetWords: c.targetWords,
          actualWords: wordCount,
          runsyncMs: r.runsyncMs,
          downloadMs: r.downloadMs,
          totalMs: r.totalMs,
          audioBytes: r.audioBytes,
          cost: r.cost,
          audioUrl: r.audioUrl,
        });

        console.log(
          `${c.id} words=${wordCount} runsync=${r.runsyncMs.toFixed(0)}ms` +
            (r.downloadMs != null
              ? ` download=${r.downloadMs.toFixed(
                  0
                )}ms total=${r.totalMs.toFixed(0)}ms`
              : "")
        );
      } catch (err) {
        results.push({
          gpu: GPU_LABEL,
          round,
          caseId: c.id,
          targetWords: c.targetWords,
          actualWords: wordCount,
          error: err?.message || String(err),
        });
        console.log(`${c.id} words=${wordCount} ERROR: ${err?.message || err}`);
      }

      await sleep(BETWEEN_REQUESTS_MS);
    }
  }

  const okTotals = results
    .filter((r) => typeof r.totalMs === "number")
    .map((r) => r.totalMs);

  if (okTotals.length) {
    console.log("\n=== summary (totalMs) ===");
    const s = summarize(okTotals);
    console.log(
      `n=${s.count} mean=${s.mean.toFixed(0)}ms median=${s.median.toFixed(
        0
      )}ms p90=${s.p90.toFixed(0)}ms p95=${s.p95.toFixed(0)}ms`
    );
  }

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `bench-chatterbox-turbo-${GPU_LABEL.replace(
    /[^a-z0-9]+/gi,
    "-"
  )}-${ts}.json`;
  writeFileSync(
    new URL(filename, import.meta.url),
    JSON.stringify(
      {
        gpu: GPU_LABEL,
        endpoint: BASE_URL,
        voice: VOICE,
        rounds: ROUNDS,
        includeAudioDownload: INCLUDE_AUDIO_DOWNLOAD,
        results,
      },
      null,
      2
    )
  );

  console.log(`\nSaved results: ${filename}`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
