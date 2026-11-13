// Tests for the results page's run loader. Run: node test_lab03_ota_run.mjs
import assert from 'node:assert/strict';
import { parseRun } from '../5g-sdr-interactive-lab/js/lab03-ota-run.js';

const line = value => JSON.stringify(value);
const goodPath = () => ({ sent: 3, echoed: 3, loss_pct: 0, jitter_ms: 1.5, rtt: { min_ms: 9, p50_ms: 18, mean_ms: 18, p95_ms: 25, max_ms: 30 }, sent_ids: [0, 1, 2] });
const good = () => ({ event: 'summary', mode: 'dup', unique_ids_sent: 3, paths: { A: goodPath(), B: goodPath() },
  dedup: { delivered_unique: 3, loss_pct: 0, duplicates_discarded: 3, rtt: { p50_ms: 0.2 } }, per_packet: { A: [[0, 18], [1, 19.5]], B: [[0, 0.2]] } });
const hostile = { toString: null };
let cases = 0;
const rejects = (label, text) => { cases++; let result; assert.doesNotThrow(() => { result = parseRun(text); }, label); assert.equal(result, null, label); };
const withChange = change => { const value = good(); change(value); return line(value); };

// A valid file loads, with neutral naming marked by `imported`.
const run = parseRun(line({ event: 'send_start' }) + '\n' + line(good()));
assert.equal(run.imported, true);
assert.deepEqual(run.paths.A.ids, [0, 1, 2]);
assert.deepEqual(run.per_packet.A, [[0, 18], [1, 19.5]]);
assert.equal(run.dedup.rtt.p50_ms, 0.2);
// Decimal strings are accepted; absent and null fields are allowed.
const strings = parseRun(withChange(v => { v.paths.A.sent = '3'; v.paths.A.rtt.p50_ms = '18.5'; v.paths.B.rtt = null; v.dedup = null; v.per_packet = null; delete v.paths.A.jitter_ms; }));
assert.equal(strings.paths.A.sent, 3); assert.equal(strings.paths.A.rtt.p50_ms, 18.5);
assert.equal(strings.paths.B.rtt, null); assert.equal(strings.per_packet, null); assert.equal(strings.paths.A.jitter_ms, null);
// An unknown mode falls back rather than being shown.
assert.equal(parseRun(withChange(v => { v.mode = '<script>'; })).mode, 'baseline');
assert.equal(parseRun(withChange(v => { v.mode = 'toString'; })).mode, 'baseline');

// The reviewed cases: objects whose conversion would throw, and 1e999.
rejects('sent object', '{"event":"summary","paths":{"A":{"sent":{"toString":null}}}}');
rejects('sent_ids object', withChange(v => { v.paths.A.sent_ids = [0, hostile]; }));
rejects('per-packet rtt object', withChange(v => { v.per_packet.A = [[0, hostile]]; }));
rejects('per-packet id object', withChange(v => { v.per_packet.A = [[hostile, 1]]; }));
rejects('1e999 literal', line(good()).replace('"sent":3', '"sent":1e999'));
rejects('1e999 string', withChange(v => { v.paths.A.rtt.max_ms = '1e999'; }));
rejects('1e999 in per-packet', line(good()).replace('[1,19.5]', '[1,1e999]'));
// Other values that are present but not finite numbers.
for (const bad of [true, false, [], [1], {}, 'abc', '', ' 3', '0x10', 'Infinity', 'NaN', '1,5', '3px']) {
  rejects('sent ' + line(bad), withChange(v => { v.paths.A.sent = bad; }));
  rejects('rtt ' + line(bad), withChange(v => { v.paths.B.rtt.p95_ms = bad; }));
  rejects('dedup ' + line(bad), withChange(v => { v.dedup.loss_pct = bad; }));
  rejects('id ' + line(bad), withChange(v => { v.paths.A.sent_ids = [bad]; }));
  rejects('row ' + line(bad), withChange(v => { v.per_packet.A = [[0, bad]]; }));
}
for (const bad of [-1, 1.5, '2.5']) {
  rejects('count ' + bad, withChange(v => { v.paths.A.sent = bad; }));
  rejects('id ' + bad, withChange(v => { v.paths.A.sent_ids = [bad]; }));
  rejects('unique ' + bad, withChange(v => { v.unique_ids_sent = bad; }));
}
// Wrong structure.
rejects('paths null', '{"event":"summary","paths":null}');
for (const bad of [[], 'x', 7, true]) rejects('paths ' + line(bad), withChange(v => { v.paths = bad; }));
rejects('no paths', withChange(v => { v.paths = {}; }));
rejects('path A array', withChange(v => { v.paths = { A: [1] }; }));
rejects('rtt array', withChange(v => { v.paths.A.rtt = [1]; }));
rejects('dedup string', withChange(v => { v.dedup = 'x'; }));
rejects('sent_ids string', withChange(v => { v.paths.A.sent_ids = '0,1'; }));
rejects('per_packet array', withChange(v => { v.per_packet = [1]; }));
rejects('row not array', withChange(v => { v.per_packet.A = [7]; }));
rejects('row too short', withChange(v => { v.per_packet.A = [[1]]; }));
for (const text of ['', 'not json', 'null', '[1]', '{"event":"summary"}', '{"event":"other","paths":{}}', '{']) rejects('text ' + text, text);
for (const notText of [null, undefined, 7, {}]) { cases++; assert.equal(parseRun(notText), null); }

console.log(`ok: valid files load; ${cases} invalid inputs rejected without throwing`);
