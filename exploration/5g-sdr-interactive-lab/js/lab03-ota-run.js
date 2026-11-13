// Parser for a run loaded from the dual-path tool's --json output. Pure: no DOM, no network.
// A loaded file is untrusted input. Every value goes through one conversion that accepts only a
// finite number or a plain decimal string; anything else that is present makes the whole file
// invalid, so the page shows its file-format message. Absent or null fields are allowed.
const MODE_TITLES = { baseline: 'Baseline', split: 'Split', dup: 'Duplication' };
const DECIMAL = /^-?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
const MAX_IDS = 100000;

class InvalidRun extends Error {}
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const absent = value => value === null || value === undefined;

// Finite number, or a decimal string that converts to one. Never calls a value's own methods.
function finite(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.length <= 32 && DECIMAL.test(value)) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}
function optionalNumber(value) {
  if (absent(value)) return null;
  const parsed = finite(value);
  if (parsed === undefined) throw new InvalidRun();
  return parsed;
}
function optionalCount(value) {
  const parsed = optionalNumber(value);
  if (parsed !== null && (!Number.isInteger(parsed) || parsed < 0)) throw new InvalidRun();
  return parsed;
}
function packetId(value) {
  const parsed = finite(value);
  if (parsed === undefined || !Number.isInteger(parsed) || parsed < 0) throw new InvalidRun();
  return parsed;
}
function optionalRecord(value) {
  if (absent(value)) return null;
  if (!isRecord(value)) throw new InvalidRun();
  return value;
}
function optionalList(value) {
  if (absent(value)) return [];
  if (!Array.isArray(value) || value.length > MAX_IDS) throw new InvalidRun();
  return value;
}
function stats(value) {
  const record = optionalRecord(value);
  if (!record) return null;
  const out = {};
  for (const key of ['min_ms', 'p50_ms', 'mean_ms', 'p95_ms', 'max_ms']) out[key] = optionalNumber(record[key]);
  return out.p50_ms === null ? null : out;
}

function build(summary) {
  const paths = summary.paths;
  if (!isRecord(paths)) throw new InvalidRun();
  const mode = Object.hasOwn(MODE_TITLES, summary.mode) ? summary.mode : 'baseline';
  const dedup = optionalRecord(summary.dedup) || {};
  const run = {
    mode, unique: optionalCount(summary.unique_ids_sent) ?? 0, paths: {}, per_packet: null,
    imported: true, label: '新載入：' + MODE_TITLES[mode],
    note: '這一輪是剛載入的結果，不屬於 2026-11-12 保存的證據。檔案無法證明所用的路徑，因此以路徑 A、路徑 B 標示。',
    dedup: { delivered_unique: optionalCount(dedup.delivered_unique), loss_pct: optionalNumber(dedup.loss_pct),
      duplicates_discarded: optionalCount(dedup.duplicates_discarded), rtt: stats(dedup.rtt) },
  };
  for (const key of ['A', 'B']) {
    const path = optionalRecord(paths[key]);
    if (!path) continue;
    run.paths[key] = { sent: optionalCount(path.sent), echoed: optionalCount(path.echoed), loss_pct: optionalNumber(path.loss_pct),
      jitter_ms: optionalNumber(path.jitter_ms), rtt: stats(path.rtt), ids: optionalList(path.sent_ids).map(packetId) };
  }
  if (!Object.keys(run.paths).length) throw new InvalidRun();
  const perPacket = optionalRecord(summary.per_packet);
  if (perPacket) {
    run.per_packet = {};
    for (const key of Object.keys(run.paths)) {
      run.per_packet[key] = optionalList(perPacket[key]).map(row => {
        if (!Array.isArray(row) || row.length < 2) throw new InvalidRun();
        const value = finite(row[1]);
        if (value === undefined) throw new InvalidRun();
        return [packetId(row[0]), value];
      });
    }
  }
  return run;
}

// Returns the run, or null when the text holds no valid summary.
export function parseRun(text) {
  if (typeof text !== 'string') return null;
  let summary = null;
  for (const line of text.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('{')) continue;
    try { const item = JSON.parse(trimmed); if (isRecord(item) && item.event === 'summary') summary = item; } catch { /* Skip lines that are not JSON. */ }
  }
  if (!summary) return null;
  try { return build(summary); } catch (error) { if (error instanceof InvalidRun) return null; throw error; }
}
