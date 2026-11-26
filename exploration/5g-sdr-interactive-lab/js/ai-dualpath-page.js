// AI dual-path page: draws the saved 2026-11-16 OTA policy comparison, the offline replay with
// simulated degradation, the path A gain steps, and the 2026-11-26 netem injection check.
// Static data only; nothing talks to a network.
import { POLICIES, online, replay, gains, outage } from './data/ai-dualpath-measured.js';
import { SCHEDULE, RUNS, PING_INTERVAL_S } from './data/ai-dualpath-netem.js';

const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const $ = id => document.getElementById(id);
const redraws = [];
const MONO = '11px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
const SANS = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const fmt = (value, digits = 2) => (typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : '—');
const colorOf = policy => (policy.adaptive ? '--path-a' : '--series-off');
const NAMES = Object.fromEntries(POLICIES.map(p => [p.key, p.name]));
NAMES.oracle = '事後最佳（參考）';

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
function tabs(containerId, items, onPick) {
  const box = $(containerId);
  let current = 0;
  const buttons = items.map((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = item.label;
    button.addEventListener('click', () => { current = index; sync(); onPick(index); });
    box.append(button);
    return button;
  });
  const sync = () => buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === current)));
  sync();
}

// --- 1. Online comparison: min–max range and mean per policy -------------------------------------
let onlineIndex = 0;
const rangeCanvas = $('chart-online');
let rangeHover = null;
function drawRange() {
  const set = online[onlineIndex];
  const [g, W, H] = setup(rangeCanvas);
  const narrow = W < 520;
  const L = narrow ? 112 : 150, R = 16, T = 8, B = 34, pw = W - L - R, ph = H - T - B;
  const rowH = ph / POLICIES.length;
  const X = v => L + v / 100 * pw;
  g.font = MONO; g.lineWidth = 1; g.strokeStyle = css('--grid'); g.fillStyle = css('--muted');
  g.textAlign = 'center'; g.textBaseline = 'top';
  for (const v of niceTicks(0, 100, narrow ? 4 : 10)) {
    g.beginPath(); g.moveTo(X(v), T); g.lineTo(X(v), T + ph); g.stroke(); g.fillText(String(v), X(v), T + ph + 6);
  }
  g.font = SANS; g.fillText('期限內送達比例（%）', L + pw / 2, H - 14);
  POLICIES.forEach((policy, i) => {
    const [mean, low, high] = set.rows[policy.key];
    const y = T + rowH * (i + .5);
    if (rangeHover === i) { g.fillStyle = css('--soft'); g.fillRect(0, T + rowH * i, W, rowH); }
    g.fillStyle = css('--ink'); g.textAlign = 'right'; g.textBaseline = 'middle'; g.font = SANS;
    g.fillText(policy.name, L - 10, y);
    g.strokeStyle = css(colorOf(policy)); g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(X(low), y); g.lineTo(X(Math.max(high, low + .15)), y); g.stroke();
    g.fillStyle = css(colorOf(policy)); g.strokeStyle = css('--page'); g.lineWidth = 2;
    g.beginPath(); g.arc(X(mean), y, 5, 0, 7); g.fill(); g.stroke();
  });
  rangeCanvas.dataset.rowH = String(rowH); rangeCanvas.dataset.top = String(T);
}
rangeCanvas.addEventListener('pointermove', event => {
  const box = rangeCanvas.getBoundingClientRect();
  const y = event.clientY - box.top;
  const i = Math.floor((y - Number(rangeCanvas.dataset.top)) / Number(rangeCanvas.dataset.rowH));
  if (i < 0 || i >= POLICIES.length) { rangeHover = null; drawRange(); hideTip(rangeCanvas); return; }
  rangeHover = i; drawRange();
  const policy = POLICIES[i];
  const [mean, low, high, delivered, copies] = online[onlineIndex].rows[policy.key];
  showTip(rangeCanvas, event.clientX - box.left, y, [policy.name, `平均 ${fmt(mean)}%（${fmt(low)}–${fmt(high)}）`, `送達 ${fmt(delivered)}% · 每封包 ${fmt(copies)} 份`]);
});
rangeCanvas.addEventListener('pointerleave', () => { rangeHover = null; drawRange(); hideTip(rangeCanvas); });

function renderOnline() {
  const set = online[onlineIndex];
  const a = set.rows.only_a, best = POLICIES.filter(p => p.adaptive).map(p => [p, set.rows[p.key]]).sort((x, y) => y[1][0] - x[1][0])[0];
  $('online-facts').innerHTML = [
    [`${fmt(a[0])}%`, '只走 A 的期限內送達'],
    [`${fmt(best[1][0])}%`, `最好的自適應策略（${best[0].name}）`],
    [`${fmt(set.rows.dup[0])}%`, '全部複製（每封包 2 份）'],
    [`${set.rounds} × ${set.packets}`, '輪數 × 每輪封包數'],
  ].map(([v, k]) => `<div><b>${v}</b><span>${k}</span></div>`).join('');
  const head = '<thead><tr><th>策略</th><th>期限內送達 % 平均</th><th>最小–最大</th><th>送達 %</th><th>每封包副本數</th></tr></thead>';
  const body = POLICIES.map(p => {
    const [mean, low, high, delivered, copies] = set.rows[p.key];
    return `<tr><td><i class="ota-dot" style="background:var(${colorOf(p)})"></i>${p.name}</td><td>${fmt(mean)}</td><td>${fmt(low)}–${fmt(high)}</td><td>${fmt(delivered)}</td><td>${fmt(copies)}</td></tr>`;
  }).join('');
  $('online-table').innerHTML = head + '<tbody>' + body + '</tbody>';
  drawRange();
}
tabs('online-tabs', online, index => { onlineIndex = index; renderOnline(); });
redraws.push(drawRange);
renderOnline();

// --- 2. Offline replay trade-off: copies/packet vs within-deadline % ---------------------------
const replaySets = [replay.stable, replay.degraded];
let replayIndex = 1;
const tradeCanvas = $('chart-tradeoff');
let tradePoints = [];
function drawTrade(hoverKey = null) {
  const set = replaySets[replayIndex];
  const [g, W, H] = setup(tradeCanvas);
  const L = 46, R = 18, T = 14, B = 36, pw = W - L - R, ph = H - T - B;
  const y0 = 30, y1 = 100;
  const X = v => L + (v - .9) / (2.1 - .9) * pw;
  const Y = v => T + ph - (v - y0) / (y1 - y0) * ph;
  g.font = MONO; g.lineWidth = 1; g.strokeStyle = css('--grid'); g.fillStyle = css('--muted');
  g.textAlign = 'right'; g.textBaseline = 'middle';
  for (const v of niceTicks(y0, y1, 7)) { g.beginPath(); g.moveTo(L, Y(v)); g.lineTo(W - R, Y(v)); g.stroke(); g.fillText(String(v), L - 6, Y(v)); }
  g.textAlign = 'center'; g.textBaseline = 'top';
  for (const v of [1, 1.25, 1.5, 1.75, 2]) g.fillText(v.toFixed(2), X(v), T + ph + 6);
  g.font = SANS; g.fillText('每封包副本數（越右越耗頻寬）', L + pw / 2, H - 14);
  const keys = [...POLICIES.map(p => p.key), 'oracle'];
  tradePoints = keys.map(key => {
    const [within, sd, , copies] = set.rows[key];
    return { key, x: X(copies), y: Y(within), within, sd, copies };
  });
  // Several policies land within a few pixels of each other, so labels are pushed apart
  // vertically (top to bottom) and joined to their point by a leader line when moved.
  g.font = SANS;
  const placed = tradePoints.map(p => ({ left: p.x - 7, width: 14, y: p.y }));
  const byY = [...tradePoints].sort((a, b) => a.y - b.y || a.x - b.x);
  for (const p of byY) {
    const width = g.measureText(NAMES[p.key]).width;
    const side = p.x + 12 + width > W - R ? -1 : 1;
    const left = side > 0 ? p.x + 12 : p.x - 12 - width;
    let y = p.y;
    const hits = () => placed.some(q => left < q.left + q.width + 4 && q.left < left + width + 4 && Math.abs(q.y - y) < 15);
    while (hits()) y += 15;
    p.label = { left, width, y, side };
    placed.push({ left, width, y });
  }
  for (const p of tradePoints) {
    const policy = POLICIES.find(q => q.key === p.key);
    const color = css(policy ? colorOf(policy) : '--muted');
    const { left, width, y, side } = p.label;
    if (Math.abs(y - p.y) > 1) {
      g.strokeStyle = css('--muted'); g.lineWidth = 1; g.beginPath();
      g.moveTo(p.x, p.y); g.lineTo(side > 0 ? left - 2 : left + width + 2, y); g.stroke();
    }
    g.lineWidth = 2; g.strokeStyle = color;
    g.beginPath(); g.arc(p.x, p.y, p.key === hoverKey ? 7 : 5, 0, 7);
    if (policy) { g.fillStyle = color; g.fill(); } else { g.fillStyle = css('--page'); g.fill(); g.stroke(); }
    g.fillStyle = css(p.key === hoverKey ? '--ink' : '--muted'); g.textBaseline = 'middle'; g.textAlign = 'left';
    g.fillText(NAMES[p.key], left, y);
  }
}
tradeCanvas.addEventListener('pointermove', event => {
  const box = tradeCanvas.getBoundingClientRect();
  const x = event.clientX - box.left, y = event.clientY - box.top;
  const near = tradePoints.map(p => [p, Math.hypot(p.x - x, p.y - y)]).sort((a, b) => a[1] - b[1])[0];
  if (!near || near[1] > 24) { drawTrade(); hideTip(tradeCanvas); return; }
  const p = near[0];
  drawTrade(p.key);
  showTip(tradeCanvas, x, y, [NAMES[p.key], `期限內 ${fmt(p.within)}%（標準差 ${fmt(p.sd)}）`, `每封包 ${fmt(p.copies)} 份`]);
});
tradeCanvas.addEventListener('pointerleave', () => { drawTrade(); hideTip(tradeCanvas); });
function renderReplay() {
  const set = replaySets[replayIndex];
  const head = '<thead><tr><th>策略</th><th>期限內送達 %（標準差）</th><th>送達 %</th><th>每封包副本數</th><th>p95 ms</th></tr></thead>';
  const body = [...POLICIES.map(p => p.key), 'oracle'].map(key => {
    const [within, sd, delivered, copies, p95] = set.rows[key];
    const policy = POLICIES.find(q => q.key === key);
    const dot = policy ? `<i class="ota-dot" style="background:var(${colorOf(policy)})"></i>` : '<i class="ota-dot is-ring"></i>';
    return `<tr><td>${dot}${NAMES[key]}</td><td>${fmt(within)}（${fmt(sd)}）</td><td>${fmt(delivered)}</td><td>${fmt(copies)}</td><td>${fmt(p95, 1)}</td></tr>`;
  }).join('');
  $('replay-table').innerHTML = head + '<tbody>' + body + '</tbody>';
  drawTrade();
}
tabs('replay-tabs', [{ label: replay.degraded.label }, { label: replay.stable.label }], index => { replayIndex = index ? 0 : 1; renderReplay(); });
redraws.push(() => drawTrade());
renderReplay();

// --- 3. Gain steps table and the one real outage -----------------------------------------------
$('gain-table').innerHTML = '<thead><tr><th>發射增益 eNB／UE</th><th>量測</th><th>回送／送出</th><th>p50 ms</th><th>p95 ms</th><th>max ms</th><th>30 ms 內 %</th><th>備註</th></tr></thead><tbody>'
  + gains.map(([gain, test, sent, echoed, p50, p95, max, within, note]) =>
    `<tr${max > 700 ? ' class="is-flag"' : ''}><td>${gain}</td><td>${test}</td><td>${echoed}／${sent}</td><td>${fmt(p50, 1)}</td><td>${fmt(p95, 1)}</td><td>${fmt(max, 1)}</td><td>${fmt(within)}</td><td class="is-text">${note}</td></tr>`).join('')
  + '</tbody>';

const outageCanvas = $('chart-outage');
function drawOutage(hover = null) {
  const [g, W, H] = setup(outageCanvas);
  const L = 46, R = 12, T = 10, B = 34, pw = W - L - R, ph = H - T - B;
  const n = outage.rtt.length, y1 = 800;
  const X = i => L + i / (n - 1) * pw;
  const Y = v => T + ph - Math.min(v, y1) / y1 * ph;
  g.font = MONO; g.lineWidth = 1; g.strokeStyle = css('--grid'); g.fillStyle = css('--muted');
  g.textAlign = 'right'; g.textBaseline = 'middle';
  for (const v of niceTicks(0, y1, 4)) { g.beginPath(); g.moveTo(L, Y(v)); g.lineTo(W - R, Y(v)); g.stroke(); g.fillText(String(v), L - 6, Y(v)); }
  g.textAlign = 'center'; g.textBaseline = 'top';
  for (let id = outage.firstId; id <= outage.firstId + n - 1; id += 50) g.fillText(String(id), X(id - outage.firstId), T + ph + 6);
  g.font = SANS; g.fillText('Packet ID（每 20 ms 一個）', L + pw / 2, H - 14);
  g.strokeStyle = css('--path-b'); g.setLineDash([4, 4]); g.beginPath(); g.moveTo(L, Y(30)); g.lineTo(W - R, Y(30)); g.stroke(); g.setLineDash([]);
  g.fillStyle = css('--path-b'); g.textAlign = 'right'; g.textBaseline = 'bottom'; g.font = MONO; g.fillText('期限 30 ms', W - R, Y(30) - 3);
  g.strokeStyle = css('--path-a'); g.lineWidth = 2; g.lineJoin = 'round'; g.beginPath();
  let drawing = false;
  outage.rtt.forEach((v, i) => {
    if (v == null) { drawing = false; return; }
    if (drawing) g.lineTo(X(i), Y(v)); else g.moveTo(X(i), Y(v));
    drawing = true;
  });
  g.stroke();
  g.fillStyle = css('--path-b');
  outage.rtt.forEach((v, i) => { if (v == null) g.fillRect(X(i) - 1.5, T + ph - 10, 3, 10); });
  if (hover != null) {
    const v = outage.rtt[hover];
    g.strokeStyle = css('--muted'); g.lineWidth = 1; g.beginPath(); g.moveTo(X(hover), T); g.lineTo(X(hover), T + ph); g.stroke();
    if (v != null) { g.fillStyle = css('--path-a'); g.strokeStyle = css('--surface'); g.lineWidth = 2; g.beginPath(); g.arc(X(hover), Y(v), 4, 0, 7); g.fill(); g.stroke(); }
  }
  outageCanvas.dataset.left = String(L); outageCanvas.dataset.width = String(pw);
}
outageCanvas.addEventListener('pointermove', event => {
  const box = outageCanvas.getBoundingClientRect();
  const x = event.clientX - box.left;
  const n = outage.rtt.length;
  const i = Math.max(0, Math.min(n - 1, Math.round((x - Number(outageCanvas.dataset.left)) / Number(outageCanvas.dataset.width) * (n - 1))));
  drawOutage(i);
  const v = outage.rtt[i];
  showTip(outageCanvas, x, event.clientY - box.top, [`Packet ID ${outage.firstId + i}`, v == null ? '遺失（沒有回送）' : `RTT ${v.toFixed(1)} ms`]);
});
outageCanvas.addEventListener('pointerleave', () => { drawOutage(); hideTip(outageCanvas); });
redraws.push(() => drawOutage());
drawOutage();

// --- 4. Path A degradation injection (INJECTED_IP, 2026-11-26) ---------------------------------
// Each ping is assigned to the phase in force at its estimated send time, the same way as
// analysis/phase_loss.py, so the per-phase numbers match the Task Evidence Record.
const PHASE = Object.fromEntries(SCHEDULE.map(p => [p.label, p]));
function packetsOf(run) {
  return run.rtt.map((rtt, i) => {
    const t = run.pingStart + i * PING_INTERVAL_S;
    const phase = t >= run.phases[0][0] && t < run.end ? run.phases.filter(([start]) => start <= t).at(-1)[1] : 'after';
    return { seq: i + 1, t, rtt, phase };
  });
}
function phaseRows(run) {
  const rows = new Map([...SCHEDULE.map(p => [p.label, []]), ['after', []]]);
  for (const p of packetsOf(run)) rows.get(p.phase).push(p);
  return [...rows].map(([label, list]) => {
    const got = list.filter(p => p.rtt != null).map(p => p.rtt).sort((a, b) => a - b);
    return { label, sent: list.length, received: got.length, p50: got.length ? got[Math.floor(got.length / 2)] : null };
  });
}
let netemIndex = 0;
const netemCanvas = $('chart-netem');
let netemPoints = [];
function drawNetem(hoverSeq = null) {
  const run = RUNS[netemIndex];
  const [g, W, H] = setup(netemCanvas);
  const L = 46, R = 12, T = 22, B = 52, pw = W - L - R, ph = H - T - B;
  const x1 = 21, y1 = 100, lostY = T + ph + 12;
  const X = t => L + t / x1 * pw;
  const Y = v => T + ph - Math.min(v, y1) / y1 * ph;
  // Phase bands, taken from the logged switch times, not the plan.
  run.phases.forEach(([start, label], i) => {
    const stop = i + 1 < run.phases.length ? run.phases[i + 1][0] : run.end;
    if (label !== 'normal') { g.fillStyle = css(`--band-${label}`); g.fillRect(X(start), T, X(stop) - X(start), ph); }
    g.fillStyle = css('--muted'); g.font = SANS; g.textAlign = 'left'; g.textBaseline = 'bottom';
    if (X(stop) - X(start) > 26) g.fillText(PHASE[label].name, X(start) + 4, T - 4);
  });
  g.font = MONO; g.lineWidth = 1; g.strokeStyle = css('--grid'); g.fillStyle = css('--muted');
  g.textAlign = 'right'; g.textBaseline = 'middle';
  for (const v of niceTicks(0, y1, 4)) { g.beginPath(); g.moveTo(L, Y(v)); g.lineTo(W - R, Y(v)); g.stroke(); g.fillText(String(v), L - 6, Y(v)); }
  g.fillText('遺失', L - 6, lostY);
  g.textAlign = 'center'; g.textBaseline = 'top';
  for (let t = 0; t <= 20; t += W < 520 ? 5 : 2) g.fillText(String(t), X(t), lostY + 10);
  g.font = SANS; g.fillText('排程開始後的秒數（縱軸 RTT，ms）', L + pw / 2, H - 16);
  g.strokeStyle = css('--muted'); g.setLineDash([3, 3]);
  g.beginPath(); g.moveTo(X(run.end), T); g.lineTo(X(run.end), lostY + 6); g.stroke(); g.setLineDash([]);
  netemPoints = packetsOf(run).map(p => ({ ...p, x: X(p.t), y: p.rtt == null ? lostY : Y(p.rtt) }));
  for (const p of netemPoints) {
    const hover = p.seq === hoverSeq;
    if (p.rtt == null) {
      g.strokeStyle = css('--late'); g.lineWidth = hover ? 2.5 : 1.8; const s = hover ? 5 : 3.5;
      g.beginPath(); g.moveTo(p.x - s, p.y - s); g.lineTo(p.x + s, p.y + s); g.moveTo(p.x + s, p.y - s); g.lineTo(p.x - s, p.y + s); g.stroke();
    } else {
      g.fillStyle = css('--path-a'); g.strokeStyle = css('--page'); g.lineWidth = 1.5;
      g.beginPath(); g.arc(p.x, p.y, hover ? 5 : 3, 0, 7); g.fill(); g.stroke();
    }
  }
}
netemCanvas.addEventListener('pointermove', event => {
  const box = netemCanvas.getBoundingClientRect();
  const x = event.clientX - box.left, y = event.clientY - box.top;
  const near = netemPoints.map(p => [p, Math.abs(p.x - x)]).sort((a, b) => a[1] - b[1])[0];
  if (!near || near[1] > 12) { drawNetem(); hideTip(netemCanvas); return; }
  const p = near[0];
  drawNetem(p.seq);
  const phase = p.phase === 'after' ? '排程結束後' : `${PHASE[p.phase].name}（${PHASE[p.phase].netem}）`;
  showTip(netemCanvas, x, y, [`icmp_seq ${p.seq} · 約 ${p.t.toFixed(2)} s`, phase, p.rtt == null ? '遺失（沒有回覆）' : `RTT ${p.rtt.toFixed(1)} ms`]);
});
netemCanvas.addEventListener('pointerleave', () => { drawNetem(); hideTip(netemCanvas); });
function renderNetem() {
  const run = RUNS[netemIndex];
  const planned = [0, 5, 8, 10, 15, 18];
  const drift = Math.max(...run.phases.map(([t], i) => Math.abs(t - planned[i]))) * 1000;
  const [sent, received] = run.fixed;
  $('netem-facts').innerHTML = [
    [`${sent - received}／${run.dropped}`, '固定 20%：ping 遺失／netem 丟棄計數'],
    [`≤ ${Math.round(drift)} ms`, '6 次切換與計劃時間的最大差距'],
    [`${run.baseline[1]}／${run.baseline[0]}`, `注入前對照收到／送出，RTT 中位數 ${fmt(run.baseline[2], 1)} ms`],
    [run.tool, `工具 SHA-256 前 8 碼 · ${run.time}`],
  ].map(([v, k]) => `<div><b>${v}</b><span>${k}</span></div>`).join('');
  const head = '<thead><tr><th>階段</th><th class="is-text">netem 設定</th><th>送出</th><th>收到</th><th>遺失 %</th><th>RTT 中位數 ms</th></tr></thead>';
  const body = phaseRows(run).map(r => {
    const name = r.label === 'after' ? '排程結束後' : PHASE[r.label].name;
    const setting = r.label === 'after' ? '已移除' : `<code>${PHASE[r.label].netem}</code>`;
    return `<tr><td>${name}</td><td class="is-text">${setting}</td><td>${r.sent}</td><td>${r.received}</td><td>${fmt(100 * (r.sent - r.received) / r.sent, 1)}</td><td>${fmt(r.p50, 1)}</td></tr>`;
  }).join('');
  $('netem-table').innerHTML = head + '<tbody>' + body + '</tbody>';
  drawNetem();
}
tabs('netem-tabs', RUNS, index => { netemIndex = index; renderNetem(); });
redraws.push(() => drawNetem());
renderNetem();

let resizeTimer = 0;
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => redraws.forEach(f => f()), 120); });
new MutationObserver(() => redraws.forEach(f => f())).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
const header = document.querySelector('.pinned-header');
new ResizeObserver(() => document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px')).observe(header);
