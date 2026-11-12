// Parser for a run loaded from the dual-path tool's --json output. Pure: no DOM, no network.
// Loaded files are untrusted input: keep only numbers and numeric ID lists; the page renders them as text.
const MODE_TITLES = { baseline: 'Baseline', split: 'Split', dup: 'Duplication' };
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const num = value => (value == null || value === '' || typeof value === 'boolean' || Number.isNaN(Number(value)) ? null : Number(value));
function cleanStats(q) {
  if (!isRecord(q)) return null;
  const out = {};
  for (const key of ['min_ms', 'p50_ms', 'mean_ms', 'p95_ms', 'max_ms']) out[key] = num(q[key]);
  return out.p50_ms == null ? null : out;
}
export function parseRun(text) {
  let summary = null;
  for (const line of text.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('{')) continue;
    try { const item = JSON.parse(trimmed); if (isRecord(item) && item.event === 'summary') summary = item; } catch { /* Skip lines that are not JSON. */ }
  }
  if (!isRecord(summary) || !isRecord(summary.paths)) return null;
  const mode = ['baseline', 'split', 'dup'].includes(summary.mode) ? summary.mode : 'baseline';
  const dedup = isRecord(summary.dedup) ? summary.dedup : {};
  const run = {
    mode, unique: num(summary.unique_ids_sent) || 0, paths: {}, per_packet: null,
    imported: true, label: '新載入：' + MODE_TITLES[mode],
    note: '這一輪是剛載入的結果，不屬於 2026-11-12 保存的證據。檔案無法證明所用的路徑，因此以路徑 A、路徑 B 標示。',
    dedup: { delivered_unique: num(dedup.delivered_unique), loss_pct: num(dedup.loss_pct), duplicates_discarded: num(dedup.duplicates_discarded), rtt: cleanStats(dedup.rtt) },
  };
  for (const key of ['A', 'B']) {
    const p = summary.paths[key];
    if (!isRecord(p)) continue;
    run.paths[key] = { sent: num(p.sent), echoed: num(p.echoed), loss_pct: num(p.loss_pct), jitter_ms: num(p.jitter_ms), rtt: cleanStats(p.rtt),
      ids: Array.isArray(p.sent_ids) ? p.sent_ids.map(Number).filter(Number.isInteger) : [] };
  }
  if (!Object.keys(run.paths).length) return null;
  if (isRecord(summary.per_packet)) {
    run.per_packet = {};
    for (const key of Object.keys(run.paths)) {
      const rows = Array.isArray(summary.per_packet[key]) ? summary.per_packet[key] : [];
      run.per_packet[key] = rows.filter(row => Array.isArray(row) && Number.isFinite(Number(row[0])) && Number.isFinite(Number(row[1]))).map(row => [Number(row[0]), Number(row[1])]);
    }
  }
  return run;
}
