// Lab03 OTA results page: draws the saved 2026-11-12 measurements and, optionally, a run the
// viewer loads from the dual-path tool's --json output. Nothing here talks to a network.
import { measured } from './data/lab03-ota-measured.js';
import { parseRun } from './lab03-ota-run.js';

const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const $ = id => document.getElementById(id);
const redraws = [];
const MONO = '11px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
const SANS = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
// Saved data and parsed runs hold numbers or null; anything else is treated as missing.
const num = value => (typeof value === 'number' && Number.isFinite(value) ? value : null);
const fmt = (value, digits = 2) => (num(value) == null ? '—' : num(value).toFixed(digits));

function setup(canvas) {
  const box = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(box.width * ratio);
  canvas.height = Math.round(box.height * ratio);
  const context = canvas.getContext('2d');
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, box.width, box.height);
  return [context, box.width, box.height];
}
function tipFor(canvas) {
  let tip = canvas.parentNode.querySelector('.ota-tip');
  if (!tip) { tip = document.createElement('div'); tip.className = 'ota-tip'; tip.hidden = true; canvas.parentNode.append(tip); }
  return tip;
}
function showTip(canvas, x, y, lines) {
  const tip = tipFor(canvas);
  tip.textContent = lines.join('\n');
  tip.hidden = false;
  tip.style.left = Math.max(0, Math.min(canvas.clientWidth - tip.offsetWidth, x + 12)) + 'px';
  tip.style.top = Math.max(0, y - tip.offsetHeight - 8) + 'px';
}
const hideTip = canvas => { tipFor(canvas).hidden = true; };
function niceTicks(low, high, count) {
  const raw = (high - low) / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].find(k => k * power >= raw) * power;
  const ticks = [];
  for (let v = Math.ceil(low / step) * step; v <= high + 1e-9; v += step) ticks.push(Number(v.toFixed(6)));
  return ticks;
}
function roundedRect(context, x, y, w, h, r) {
  context.beginPath();
  if (context.roundRect) context.roundRect(x, y, w, h, r); else context.rect(x, y, w, h);
}

function lineChart(id, options) {
  const canvas = $(id);
  let hover = null;
  let geometry = null;
  function draw() {
    const [g, W, H] = setup(canvas);
    const L = 46, R = 12, T = 10, B = 34, pw = W - L - R, ph = H - T - B;
    const X = v => L + (v - options.x0) / (options.x1 - options.x0) * pw;
    const Y = v => T + ph - (Math.max(options.y0, Math.min(options.y1, v)) - options.y0) / (options.y1 - options.y0) * ph;
    geometry = { L, pw };
    g.font = MONO; g.lineWidth = 1; g.strokeStyle = css('--grid'); g.fillStyle = css('--muted');
    g.textBaseline = 'middle'; g.textAlign = 'right';
    for (const v of niceTicks(options.y0, options.y1, 4)) {
      g.beginPath(); g.moveTo(L, Y(v)); g.lineTo(W - R, Y(v)); g.stroke(); g.fillText(String(v), L - 6, Y(v));
    }
    g.textAlign = 'center'; g.textBaseline = 'top';
    for (const v of niceTicks(options.x0, options.x1, W < 520 ? 4 : 8)) g.fillText(String(v), X(v), T + ph + 6);
    g.fillText(options.xLabel, L + pw / 2, H - 13);
    for (const series of options.series) {
      g.strokeStyle = css(series.color); g.lineWidth = 2; g.lineJoin = 'round'; g.beginPath();
      series.xs.forEach((x, i) => (i ? g.lineTo(X(x), Y(series.ys[i])) : g.moveTo(X(x), Y(series.ys[i]))));
      g.stroke();
    }
    if (hover != null) {
      const x = X(options.series[0].xs[hover]);
      g.strokeStyle = css('--muted'); g.lineWidth = 1; g.beginPath(); g.moveTo(x, T); g.lineTo(x, T + ph); g.stroke();
      for (const series of options.series) {
        g.fillStyle = css(series.color); g.strokeStyle = css('--surface'); g.lineWidth = 2;
        g.beginPath(); g.arc(x, Y(series.ys[hover]), 4, 0, 7); g.fill(); g.stroke();
      }
    }
  }
  canvas.addEventListener('pointermove', event => {
    const box = canvas.getBoundingClientRect();
    const x = event.clientX - box.left;
    const xs = options.series[0].xs;
    const value = options.x0 + (x - geometry.L) / geometry.pw * (options.x1 - options.x0);
    let best = 0, distance = Infinity;
    xs.forEach((q, i) => { const d = Math.abs(q - value); if (d < distance) { distance = d; best = i; } });
    hover = best; draw();
    showTip(canvas, x, event.clientY - box.top, [options.xFormat(xs[best]), ...options.series.map(s => `${s.name}　${options.yFormat(s.ys[best])}`)]);
  });
  canvas.addEventListener('pointerleave', () => { hover = null; draw(); hideTip(canvas); });
  redraws.push(draw); draw();
}

const [iq30, iq50] = measured.iq;
const foldCount = iq50.pss_fold.length;
const foldX = Array.from({ length: foldCount }, (_, i) => Number((i * 5 / foldCount).toFixed(4)));
lineChart('chart-pss', {
  x0: 0, x1: 5, y0: 0, y1: 180, xLabel: '5 ms 週期內的位置（ms）',
  xFormat: v => v.toFixed(2) + ' ms', yFormat: v => v.toFixed(1) + ' 倍',
  series: [{ color: '--series-off', xs: foldX, ys: iq30.pss_fold, name: 'tx_gain 30' }, { color: '--path-b', xs: foldX, ys: iq50.pss_fold, name: 'tx_gain 50' }],
});
lineChart('chart-psd', {
  x0: -5.76, x1: 5.76, y0: -62, y1: -42, xLabel: '相對 2680 MHz 的頻率偏移（MHz）',
  xFormat: v => (v >= 0 ? '+' : '') + v.toFixed(2) + ' MHz', yFormat: v => v.toFixed(1) + ' dBFS',
  series: [{ color: '--series-off', xs: iq30.psd_f, ys: iq30.psd_db, name: 'tx_gain 30' }, { color: '--path-b', xs: iq50.psd_f, ys: iq50.psd_db, name: 'tx_gain 50' }],
});

// Only the saved 2026-11-12 trial is known to be OTA and wired. A loaded file cannot prove which
// paths it used, so loaded runs get neutral names.
const SAVED_NAMES = { A: 'A　OTA', B: 'B　有線' };
const NEUTRAL_NAMES = { A: '路徑 A', B: '路徑 B' };
const namesFor = run => (run.imported ? NEUTRAL_NAMES : SAVED_NAMES);
const COLORS = { A: '--path-a', B: '--path-b' };
const TITLES = { baseline: 'Baseline', split: 'Split 2:3', dup: 'Duplication' };
const NOTES = {
  baseline: 'Baseline 只走 OTA 一條路，是後面兩個模式的對照。',
  split: 'Split 每 5 個封包前 2 個走 OTA、後 3 個走有線，兩組編號互不重疊。OTA 上有一筆 219.9 ms 的離群值，原因未查。',
  dup: 'Duplication 每個編號兩條路各送一份。以編號去重後留下 1000 個、丟棄 1000 份重複副本。每個編號都是有線那份的來回時間較短；這裡比的是各副本自己的來回時間，不是誰先抵達。',
};
let runs = measured.runs.slice();
let current = 0;
const pathKeys = run => ['A', 'B'].filter(key => run.paths[key]);

function renderTabs() {
  const tabs = $('mode-tabs');
  tabs.replaceChildren();
  runs.forEach((run, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.id = 'mode-tab-' + index;
    button.textContent = run.label || TITLES[run.mode] || '載入的結果';
    button.setAttribute('aria-pressed', String(index === current));
    button.addEventListener('click', () => { current = index; render(); });
    tabs.append(button);
  });
}
function renderFacts(run) {
  const d = run.dedup || {};
  const facts = [[fmt(run.unique, 0), '送出的 Packet ID'], [fmt(d.delivered_unique, 0), '送達（去重後）'], [fmt(d.loss_pct, 1) + '%', '遺失率'],
    [fmt(d.rtt && d.rtt.p50_ms) + ' ms', run.mode === 'dup' ? '每個 ID 較短來回延遲的中位數' : '合併來回延遲中位數']];
  if (run.mode === 'dup') facts.splice(3, 0, [fmt(d.duplicates_discarded, 0), '丟棄的重複副本']);
  $('mode-facts').replaceChildren(...facts.map(([value, label]) => {
    const cell = document.createElement('div'), strong = document.createElement('b'), span = document.createElement('span');
    strong.textContent = value; span.textContent = label; cell.append(strong, span); return cell;
  }));
}
function renderStats(run) {
  const table = $('mode-stats');
  table.replaceChildren();
  const head = table.createTHead().insertRow();
  for (const title of ['路徑', '送出', '回送', '遺失', '最小 ms', '中位 ms', 'p95 ms', '最大 ms', 'jitter ms']) {
    const th = document.createElement('th'); th.textContent = title; head.append(th);
  }
  const body = table.createTBody();
  for (const key of pathKeys(run)) {
    const p = run.paths[key], q = p.rtt || {}, row = body.insertRow();
    const first = row.insertCell(), dot = document.createElement('i');
    dot.className = 'ota-dot'; dot.style.background = `var(${COLORS[key]})`; first.append(dot, namesFor(run)[key]);
    for (const text of [fmt(p.sent, 0), fmt(p.echoed, 0), fmt(p.loss_pct, 1) + '%', fmt(q.min_ms), fmt(q.p50_ms), fmt(q.p95_ms), fmt(q.max_ms), fmt(p.jitter_ms)]) row.insertCell().textContent = text;
  }
}

let laneHits = [];
function drawLanes(run) {
  const canvas = $('chart-lanes');
  const [g, W] = setup(canvas);
  const L = 64, R = 10, count = Math.max(1, Math.min(60, num(run.unique) || 60)), cell = (W - L - R) / count;
  laneHits = [];
  ['A', 'B'].forEach((key, rowIndex) => {
    const ids = new Set(run.paths[key] ? run.paths[key].ids : []);
    const y = 14 + rowIndex * 36;
    g.font = SANS; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = css('--muted'); g.fillText(namesFor(run)[key], 0, y + 13);
    for (let i = 0; i < count; i++) {
      const x = L + i * cell, w = Math.max(1.5, cell - 2);
      g.fillStyle = ids.has(i) ? css(COLORS[key]) : css('--grid');
      roundedRect(g, x + 1, y, w, 26, Math.min(3, w / 2)); g.fill();
      laneHits.push({ x, w: cell, y, id: i });
    }
  });
  g.fillStyle = css('--muted'); g.font = MONO; g.textAlign = 'center'; g.textBaseline = 'top';
  for (let i = 0; i < count; i += (W < 520 ? 10 : 5)) g.fillText(String(i), L + i * cell + cell / 2, 92);
  $('lanes-title').textContent = `前 ${count} 個 Packet ID 走哪條路`;
  $('lanes-caption').textContent = `每一格是一個 Packet ID（由左到右 0 到 ${count - 1}）。有顏色表示該編號從這條路徑送出。`;
}
$('chart-lanes').addEventListener('pointermove', event => {
  const canvas = event.currentTarget, box = canvas.getBoundingClientRect();
  const x = event.clientX - box.left, y = event.clientY - box.top;
  const hit = laneHits.find(q => x >= q.x && x < q.x + q.w && y >= q.y - 5 && y < q.y + 31);
  if (!hit) { hideTip(canvas); return; }
  const run = runs[current];
  const on = pathKeys(run).filter(key => run.paths[key].ids.includes(hit.id)).map(key => namesFor(run)[key].replace('　', ' '));
  showTip(canvas, x, y, ['Packet ID ' + hit.id, on.join(' ＋ ') || '未送出']);
});
$('chart-lanes').addEventListener('pointerleave', event => hideTip(event.currentTarget));

const LOG_LOW = Math.log10(0.1), LOG_HIGH = Math.log10(300);
const logPosition = value => (Math.log10(Math.min(300, Math.max(0.1, value))) - LOG_LOW) / (LOG_HIGH - LOG_LOW);
let rttHits = [];
function drawRtt(run) {
  const canvas = $('chart-rtt'), keys = pathKeys(run);
  canvas.style.height = (60 + keys.length * 44) + 'px';
  const [g, W, H] = setup(canvas);
  const L = 64, R = 16, T = 8, ph = H - T - 30, pw = W - L - R;
  const X = v => L + logPosition(v) * pw;
  rttHits = [];
  g.font = MONO; g.textAlign = 'center'; g.textBaseline = 'top';
  for (const v of [0.1, 1, 10, 100]) {
    g.strokeStyle = css('--grid'); g.lineWidth = 1; g.beginPath(); g.moveTo(X(v), T); g.lineTo(X(v), T + ph); g.stroke();
    g.fillStyle = css('--muted'); g.fillText(v + ' ms', X(v), T + ph + 6);
  }
  keys.forEach((key, index) => {
    const q = run.paths[key].rtt, y = T + (index + 0.5) * ph / keys.length;
    g.fillStyle = css('--muted'); g.font = SANS; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(namesFor(run)[key], 0, y);
    if (!q) return;
    g.strokeStyle = css(COLORS[key]); g.lineCap = 'round';
    g.lineWidth = 2; g.beginPath(); g.moveTo(X(q.min_ms), y); g.lineTo(X(q.max_ms), y); g.stroke();
    g.lineWidth = 8; g.beginPath(); g.moveTo(X(q.p50_ms), y); g.lineTo(X(q.p95_ms), y); g.stroke();
    g.fillStyle = css(COLORS[key]); g.strokeStyle = css('--surface'); g.lineWidth = 2;
    g.beginPath(); g.arc(X(q.p50_ms), y, 7, 0, 7); g.fill(); g.stroke();
    g.fillStyle = css('--ink'); g.font = MONO; g.textAlign = 'left'; g.textBaseline = 'bottom';
    g.fillText('中位 ' + fmt(q.p50_ms) + ' ms', Math.min(X(q.p50_ms) + 2, W - 110), y - 11);
    rttHits.push({ y, key, q, name: namesFor(run)[key] });
  });
}
$('chart-rtt').addEventListener('pointermove', event => {
  const canvas = event.currentTarget, box = canvas.getBoundingClientRect(), y = event.clientY - box.top;
  const hit = rttHits.find(q => Math.abs(q.y - y) < 20);
  if (!hit) { hideTip(canvas); return; }
  const q = hit.q;
  showTip(canvas, event.clientX - box.left, y, [hit.name, `最小 ${fmt(q.min_ms)} ms`, `中位 ${fmt(q.p50_ms)} ms`, `p95　${fmt(q.p95_ms)} ms`, `最大 ${fmt(q.max_ms)} ms`]);
});
$('chart-rtt').addEventListener('pointerleave', event => hideTip(event.currentTarget));

let packetHits = [];
function drawPerPacket(run) {
  const panel = $('per-packet-panel');
  panel.hidden = !run.per_packet;
  if (!run.per_packet) return;
  const [g, W, H] = setup($('chart-per-packet'));
  const L = 52, R = 12, T = 10, B = 34, pw = W - L - R, ph = H - T - B, last = Math.max(1, (num(run.unique) || 2) - 1);
  const X = i => L + i / last * pw, Y = v => T + ph - logPosition(v) * ph;
  packetHits = [];
  g.font = MONO;
  for (const v of [0.1, 1, 10, 100]) {
    g.strokeStyle = css('--grid'); g.lineWidth = 1; g.beginPath(); g.moveTo(L, Y(v)); g.lineTo(W - R, Y(v)); g.stroke();
    g.fillStyle = css('--muted'); g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(v + ' ms', L - 6, Y(v));
  }
  g.textAlign = 'center'; g.textBaseline = 'top'; g.fillStyle = css('--muted');
  for (const v of niceTicks(0, last, W < 520 ? 4 : 8)) g.fillText(String(v), X(v), T + ph + 6);
  g.fillText('Packet ID', L + pw / 2, H - 13);
  for (const key of pathKeys(run)) {
    g.fillStyle = css(COLORS[key]);
    for (const [id, value] of run.per_packet[key] || []) {
      const x = X(id), y = Y(value);
      g.beginPath(); g.arc(x, y, 2.2, 0, 7); g.fill();
      packetHits.push({ x, y, id, value, name: namesFor(run)[key] });
    }
  }
}
$('chart-per-packet').addEventListener('pointermove', event => {
  const canvas = event.currentTarget, box = canvas.getBoundingClientRect();
  const x = event.clientX - box.left, y = event.clientY - box.top;
  let best = null, distance = 400;
  for (const q of packetHits) { const d = (q.x - x) ** 2 + (q.y - y) ** 2; if (d < distance) { distance = d; best = q; } }
  if (!best) { hideTip(canvas); return; }
  showTip(canvas, x, y, ['Packet ID ' + best.id, `${best.name}　${fmt(best.value)} ms`]);
});
$('chart-per-packet').addEventListener('pointerleave', event => hideTip(event.currentTarget));

function render() {
  const run = runs[current];
  renderTabs(); renderFacts(run); drawLanes(run); drawRtt(run); drawPerPacket(run); renderStats(run);
  $('mode-note').textContent = run.note || NOTES[run.mode] || '';
  const names = namesFor(run);
  for (const node of document.querySelectorAll('[data-path-name]')) node.textContent = names[node.dataset.pathName];
  $('rtt-caption').textContent = run.imported
    ? '載入的結果：檔案無法證明兩條路徑實際是什麼，因此只標示為路徑 A 與路徑 B。延遲是傳送端量到的來回時間，不是單向延遲。'
    : '有線路徑約 0.2 ms，OTA 約 20 ms，相差近百倍，所以用對數刻度。延遲是傳送端量到的來回時間，不是單向延遲。';
}
redraws.push(() => { const run = runs[current]; drawLanes(run); drawRtt(run); drawPerPacket(run); });
render();

$('run-file').addEventListener('change', event => {
  const file = event.target.files[0], message = $('run-message');
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener('error', () => { message.textContent = '讀不到這個檔案，請再選一次。'; });
  reader.addEventListener('load', () => {
    let run = null;
    try { run = parseRun(String(reader.result)); } catch { run = null; }
    if (!run) { message.textContent = '這個檔案不是有效的結果：找不到摘要，或其中有不是數字的值。請確認是傳送端加了 --json 的輸出。'; return; }
    runs = runs.filter(item => !item.label); runs.push(run); current = runs.length - 1; render();
    message.textContent = `已載入 ${run.unique} 個 Packet ID` + (run.per_packet ? '，含逐封包延遲。' : '。這個檔案沒有逐封包延遲。');
  });
  reader.readAsText(file);
});

let resizeTimer;
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => redraws.forEach(draw => draw()), 120); });
new MutationObserver(() => redraws.forEach(draw => draw())).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
const header = document.querySelector('.pinned-header');
new ResizeObserver(() => document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px')).observe(header);
