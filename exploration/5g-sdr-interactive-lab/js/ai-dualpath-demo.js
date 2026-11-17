// System demo for the AI dual-path page. Runs in the browser only; nothing talks to a network.
//
// Path A replays a measured 2026-11-16 LTE OTA trace (60 s, looped). Path B and the optional
// path A degradation are SIMULATED with the same parameters as exploration/ai-dualpath/
// (leo_profile.py, trace_env.py). The policies are ports of policies.py. All seven policies run
// on the same per-packet outcomes, as in trace_env.simulate(), so the live table is a fair
// comparison; only the selected one is animated. Random numbers differ from Python's, so the
// numbers will not match evaluate.py exactly.
import { traces } from './data/ai-dualpath-traces.js';

const INTERVAL_S = 0.02, TIMEOUT_MS = 200, BAD_LEN_S = 3, BAD_SCALE = 2.5, BAD_LOSS_PCT = 10;
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const $ = id => document.getElementById(id);
const SANS = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const MONO = '11px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
const fmt = (v, digits = 1) => (Number.isFinite(v) ? v.toFixed(digits) : '—');

// --- seeded random numbers -----------------------------------------------------------------------
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(r) { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }

// --- path B: LEO-like profile (port of leo_profile.py, SIMULATED) --------------------------------
class Leo {
  constructor(seed) { Object.assign(this, { seed, slot: 15, lo: 20, hi: 45, jitter: 3, outage: 150, loss: 0.5, lowElev: 38, burst: 20 }); }
  ends(k) { const r = rng(this.seed * 1000003 + k); return [this.lo + (this.hi - this.lo) * r(), this.lo + (this.hi - this.lo) * r()]; }
  state(t) {
    const k = Math.floor(t / this.slot), into = t - k * this.slot, [a, b] = this.ends(k);
    const base = a + (b - a) * into / this.slot;
    return { slot: k, into, base, outage: k > 0 && into * 1000 < this.outage, loss: base > this.lowElev ? this.burst : this.loss };
  }
  sample(t, r) {
    const s = this.state(t);
    if (s.outage || r() * 100 < s.loss) return null;
    return Math.max(0, s.base + gauss(r) * this.jitter);
  }
}

// --- policies (port of policies.py) --------------------------------------------------------------
class LinkState {
  constructor(d, alpha = 0.2) {
    this.d = d; this.alpha = alpha;
    this.rtt = { A: d / 2, B: d / 2 }; this.miss = { A: 0, B: 0 }; this.streak = { A: 0, B: 0 }; this.last = { A: null, B: null };
  }
  feedback(p, rtt, now) {
    const late = rtt == null || rtt > this.d;
    this.miss[p] += this.alpha * ((late ? 1 : 0) - this.miss[p]);
    if (rtt != null) this.rtt[p] += this.alpha * (rtt - this.rtt[p]);
    this.streak[p] = late ? this.streak[p] + 1 : 0;
    this.last[p] = now;
  }
  stale(p, now, cap = 2) { return this.last[p] == null ? cap : Math.min(cap, now - this.last[p]); }
  features(now) {
    const x = [1];
    for (const p of 'AB') x.push(Math.min(2, this.rtt[p] / this.d), this.miss[p], this.stale(p, now) / 2);
    return x;
  }
}
class Policy {
  constructor(d) { this.d = d; this.state = new LinkState(d); }
  override() {}
  observe(i, p, rtt, now) { this.state.feedback(p, rtt, now); }
}
class OnlyA extends Policy { act() { return 'A'; } }
class OnlyB extends Policy { act() { return 'B'; } }
class Split extends Policy { act(t, i) { return i % 5 < 2 ? 'A' : 'B'; } }
class Dup extends Policy { act() { return 'AB'; } }
class Threshold extends Policy {
  act() {
    const s = this.state, ok = [...'AB'].filter(p => s.rtt[p] < 0.8 * this.d && s.miss[p] < 0.1);
    if (!ok.length) return 'AB';
    return ok.reduce((a, b) => (s.rtt[b] < s.rtt[a] ? b : a));
  }
}
class LinUCB extends Policy {
  constructor(d, cost = 0.1, alpha = 0.5) {
    super(d); this.cost = cost; this.alpha = alpha; this.arms = ['A', 'B', 'AB'];
    const n = this.state.features(0).length;
    this.inv = this.arms.map(() => Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (r === c ? 1 : 0))));
    this.b = this.arms.map(() => new Array(n).fill(0));
    this.pending = new Map();
  }
  act(t, i) {
    const x = this.state.features(t);
    const score = this.arms.map((_, k) => {
      const ax = mv(this.inv[k], x);
      return dot(mv(this.inv[k], this.b[k]), x) + this.alpha * Math.sqrt(Math.max(0, dot(x, ax)));
    });
    const act = this.arms[score.indexOf(Math.max(...score))];
    this.pending.set(i, { x, act, hit: {} });
    return act;
  }
  override(i, action) { this.pending.get(i).act = action; }
  update(k, x, reward) {
    const v = mv(this.inv[k], x), den = 1 + dot(x, v), m = this.inv[k];
    for (let r = 0; r < v.length; r++) for (let c = 0; c < v.length; c++) m[r][c] -= v[r] * v[c] / den;
    for (let r = 0; r < x.length; r++) this.b[k][r] += reward * x[r];
  }
  observe(i, p, rtt, now) {
    super.observe(i, p, rtt, now);
    const entry = this.pending.get(i);
    entry.hit[p] = rtt != null && rtt <= this.d;
    if (Object.keys(entry.hit).length < entry.act.length) return;
    this.pending.delete(i);
    for (const q of entry.act) this.update(this.arms.indexOf(q), entry.x, entry.hit[q] ? 1 : 0);
    if (entry.act === 'AB') this.update(2, entry.x, (Object.values(entry.hit).some(Boolean) ? 1 : 0) - this.cost);
  }
}
const mv = (m, x) => m.map(row => dot(row, x));
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
class Guarded extends Policy {
  constructor(inner) { super(inner.d); this.inner = inner; this.state = inner.state; this.vetoes = { dead: 0, probe: 0 }; this.lastVeto = null; this.lastProposal = null; }
  act(t, i) {
    const act = this.inner.act(t, i);
    this.lastVeto = null; this.lastProposal = act;
    if (act === 'AB') return act;
    const other = act === 'A' ? 'B' : 'A';
    const why = this.state.streak[act] >= 3 ? 'dead' : this.state.stale(other, t, 2) > 1 ? 'probe' : null;
    if (!why) return act;
    this.vetoes[why] += 1; this.lastVeto = why; this.inner.override(i, 'AB');
    return 'AB';
  }
  observe(i, p, rtt, now) { this.inner.observe(i, p, rtt, now); }
}
export const DEMO_POLICIES = [
  { key: 'only_a', name: '只走 A', make: d => new OnlyA(d) },
  { key: 'only_b', name: '只走 B', make: d => new OnlyB(d) },
  { key: 'split_2_3', name: '2:3 分流', make: d => new Split(d) },
  { key: 'dup', name: '全部複製', make: d => new Dup(d) },
  { key: 'threshold_guard', name: '門檻規則＋規則層', make: d => new Guarded(new Threshold(d)), adaptive: true },
  { key: 'linucb', name: 'LinUCB', make: d => new LinUCB(d), adaptive: true },
  { key: 'linucb_guard', name: 'LinUCB＋規則層', make: d => new Guarded(new LinUCB(d)), adaptive: true },
];

// --- one policy running against the shared outcomes (trace_env.simulate, incrementally) -----------
class Runner {
  constructor(spec, d) {
    this.spec = spec; this.d = d; this.policy = spec.make(d);
    this.events = []; this.records = []; this.sent = 0; this.done = 0; this.hit = 0; this.copies = 0;
  }
  send(i, t, out) {
    const act = this.policy.act(t, i);
    const rec = { i, t, act, veto: this.policy.lastVeto || null, proposal: this.policy.lastProposal || null, res: {}, known: 0, best: null };
    for (const p of act) {
      let r = out[p];
      if (r != null && r > TIMEOUT_MS) r = null;
      rec.res[p] = r;
      if (r != null) rec.best = rec.best == null ? r : Math.min(rec.best, r);
      this.events.push({ when: t + (r == null ? TIMEOUT_MS : r) / 1000, i, p, r, rec });
    }
    this.events.sort((a, b) => a.when - b.when);
    this.sent += 1; this.copies += act.length;
    this.records.push(rec);
    if (this.records.length > 400) this.records.shift();
    return rec;
  }
  advance(t) {
    while (this.events.length && this.events[0].when <= t) {
      const e = this.events.shift();
      this.policy.observe(e.i, e.p, e.r, e.when);
      e.rec.known += 1;
      if (e.rec.known === e.rec.act.length) {
        this.done += 1;
        if (e.rec.best != null && e.rec.best <= this.d) this.hit += 1;
      }
    }
  }
}

// --- the shared world: per-packet outcomes on both paths ---------------------------------------
class World {
  constructor(traceKey, deadline, seed = 7) {
    this.trace = traces[traceKey]; this.d = deadline; this.leo = new Leo(seed); this.r = rng(seed);
    this.t = 0; this.next = 0; this.badUntil = -1;
    this.runners = DEMO_POLICIES.map(spec => new Runner(spec, deadline));
  }
  outcome(i, t) {
    let a = this.trace.rtt[i % this.trace.rtt.length];
    if (t < this.badUntil && a != null) a = this.r() * 100 < BAD_LOSS_PCT ? null : a * BAD_SCALE;
    return { A: a, B: this.leo.sample(t, this.r) };
  }
  step(dt) {
    const end = this.t + dt;
    while (this.next * INTERVAL_S <= end) {
      const ts = this.next * INTERVAL_S;
      for (const runner of this.runners) runner.advance(ts);
      const out = this.outcome(this.next, ts);
      for (const runner of this.runners) runner.send(this.next, ts, out);
      this.next += 1;
    }
    this.t = end;
    for (const runner of this.runners) runner.advance(end);
  }
  traceRtt(t) { return this.trace.rtt[Math.floor(t / INTERVAL_S) % this.trace.rtt.length]; }
}

// --- UI ------------------------------------------------------------------------------------------
const SPEEDS = [{ v: 0.05, label: '慢動作 ×0.05' }, { v: 0.25, label: '×0.25' }, { v: 1, label: '實際速度 ×1' }, { v: 5, label: '快轉 ×5' }];
const ui = { trace: 'g59', deadline: 30, policy: 4, speed: 0, playing: false };
let world = new World(ui.trace, ui.deadline);
const flow = $('demo-flow'), strip = $('demo-strip');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function group(id, items, get, set) {
  const box = $(id);
  const buttons = items.map((item, index) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = item;
    b.addEventListener('click', () => { set(index); sync(); });
    box.append(b);
    return b;
  });
  const sync = () => buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === get())));
  sync();
  return sync;
}
function reset() { world = new World(ui.trace, ui.deadline); draw(); renderStats(true); }
group('demo-policy', DEMO_POLICIES.map(p => p.name), () => ui.policy, i => { ui.policy = i; draw(); renderStats(true); });
group('demo-trace', ['59／53 實測', '58／53 實測（含真實中斷）'], () => (ui.trace === 'g59' ? 0 : 1), i => { ui.trace = i ? 'g58' : 'g59'; syncJump(); reset(); });
group('demo-deadline', ['期限 30 ms', '期限 50 ms'], () => (ui.deadline === 30 ? 0 : 1), i => { ui.deadline = i ? 50 : 30; reset(); });
group('demo-speed', SPEEDS.map(s => s.label), () => ui.speed, i => { ui.speed = i; });

const playButton = $('demo-play');
function setPlaying(on) {
  ui.playing = on;
  playButton.textContent = on ? '暫停' : (world.t > 0 ? '繼續' : '開始演示');
  playButton.setAttribute('aria-pressed', String(on));
  if (on) { last = performance.now(); requestAnimationFrame(frame); }
}
playButton.addEventListener('click', () => setPlaying(!ui.playing));
$('demo-reset').addEventListener('click', () => { reset(); setPlaying(false); });
$('demo-degrade').addEventListener('click', () => { world.badUntil = world.t + BAD_LEN_S; draw(); });
function jumpTo(t) {
  // Simulate up to t without drawing; every runner sees the same outcomes either way.
  while (world.t < t) world.step(Math.min(0.5, t - world.t));
  draw(); renderStats(true);
}
$('demo-jump-b').addEventListener('click', () => jumpTo((Math.floor((world.t + 0.5) / 15) + 1) * 15 - 0.4));
const jumpA = $('demo-jump-a');
jumpA.addEventListener('click', () => { if (world.t > 27.3) reset(); jumpTo(27.3); });
function syncJump() { jumpA.hidden = ui.trace !== 'g58'; }
syncJump();

// --- drawing -------------------------------------------------------------------------------------
function setup(canvas) {
  const box = canvas.getBoundingClientRect(), ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(box.width * ratio); canvas.height = Math.round(box.height * ratio);
  const g = canvas.getContext('2d'); g.setTransform(ratio, 0, 0, ratio, 0, 0); g.clearRect(0, 0, box.width, box.height);
  return [g, box.width, box.height];
}
function box(g, x, y, w, h, label, sub) {
  g.fillStyle = css('--surface'); g.strokeStyle = css('--node-stroke-strong'); g.lineWidth = 1.5;
  g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, 6); else g.rect(x, y, w, h); g.fill(); g.stroke();
  g.fillStyle = css('--ink'); g.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(label, x + w / 2, y + h / 2 - 8);
  g.fillStyle = css('--muted'); g.font = SANS; g.fillText(sub, x + w / 2, y + h / 2 + 10);
}
function draw() {
  const runner = world.runners[ui.policy];
  const [g, W, H] = setup(flow);
  const narrow = W < 600, bw = narrow ? 50 : 84, x0 = bw + 10, x1 = W - bw - 10;
  const lanes = narrow ? { A: H * 0.25, B: H * 0.66 } : { A: H * 0.3, B: H * 0.72 };
  box(g, 0, H / 2 - 34, bw, 68, 'UE', '傳送端');
  box(g, W - bw, H / 2 - 34, bw, 68, 'EPC', '回送端');
  const speed = SPEEDS[ui.speed].v;
  const leo = world.leo.state(world.t);
  const aBad = world.t < world.badUntil, aRtt = world.traceRtt(world.t);
  for (const p of 'AB') {
    const y = lanes[p], color = css(p === 'A' ? '--path-a' : '--path-b');
    g.strokeStyle = color; g.globalAlpha = .35; g.lineWidth = 1;
    for (const dy of [-9, 9]) { g.beginPath(); g.moveTo(x0, y + dy); g.lineTo(x1, y + dy); g.stroke(); }
    g.globalAlpha = 1;
    g.fillStyle = color; g.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'; g.textAlign = 'left'; g.textBaseline = 'bottom';
    g.fillText(p === 'A' ? (narrow ? 'A　OTA 實測' : 'A　LTE OTA（實測重播）') : (narrow ? 'B　LEO 模擬' : 'B　類 LEO（模擬）'), x0, y - 16);
    // State badges for the path right now.
    let badge = '';
    if (p === 'A') {
      if (aBad) badge = `模擬劣化中 · 剩 ${fmt(world.badUntil - world.t, 1)} s`;
      else if (aRtt == null || aRtt > 100) badge = '實測紀錄：' + (aRtt == null ? '遺失' : `延遲 ${fmt(aRtt, 0)} ms` + (aRtt > TIMEOUT_MS ? (narrow ? '，逾時' : '（超過 200 ms 逾時，算遺失）') : ''));
    } else badge = leo.outage ? '換手中斷（150 ms）' : `換手倒數 ${fmt(15 - leo.into, 1)} s` + (narrow ? '' : ` · 基準 ${fmt(leo.base, 0)} ms`) + (leo.loss > 1 ? ' · 低仰角掉包' : '');
    if (badge) {
      const warn = (p === 'A' && (aBad || aRtt == null || aRtt > 100)) || (p === 'B' && (leo.outage || leo.loss > 1));
      g.font = SANS; g.fillStyle = css(warn ? '--late' : '--muted');
      // Narrow screens have no room beside the lane name, so the badge goes under the lane.
      if (narrow) { g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(badge, x0, y + 16); } else { g.textAlign = 'right'; g.fillText(badge, x1, y - 16); }
    }
    g.fillStyle = css('--muted'); g.font = MONO; g.textAlign = 'left'; g.textBaseline = 'middle';
    if (!narrow) { g.fillText('→', x0 - 2 - 8, y - 9); g.fillText('←', x0 - 2 - 8, y + 9); }
  }
  // Copies in flight: out on the upper track, back on the lower one. Times are sim seconds.
  const fadeS = 0.5 * speed;
  for (const rec of runner.records) {
    for (const p of rec.act) {
      const r = rec.res[p], y = lanes[p], age = world.t - rec.t;
      if (age < 0) continue;
      if (r == null) {
        const travel = 0.012;
        if (age > travel + fadeS) continue;
        const x = x0 + (x1 - x0) * 0.45 * Math.min(1, age / travel);
        g.globalAlpha = age > travel ? Math.max(0, 1 - (age - travel) / fadeS) : 1;
        if (age <= travel) dotAt(g, x, y - 9, css(p === 'A' ? '--path-a' : '--path-b'));
        else cross(g, x, y - 9, css('--late'));
        g.globalAlpha = 1;
        continue;
      }
      const rs = r / 1000;
      if (age > rs + fadeS) continue;
      if (age <= rs / 2) dotAt(g, x0 + (x1 - x0) * age / (rs / 2), y - 9, css(p === 'A' ? '--path-a' : '--path-b'));
      else {
        const k = Math.min(1, (age - rs / 2) / (rs / 2));
        g.globalAlpha = age > rs ? Math.max(0, 1 - (age - rs) / fadeS) : 1;
        dotAt(g, x1 - (x1 - x0) * k, y + 9, css(r > world.d ? '--late' : (p === 'A' ? '--path-a' : '--path-b')));
        g.globalAlpha = 1;
      }
    }
  }
  g.fillStyle = css('--muted'); g.font = MONO; g.textAlign = 'right'; g.textBaseline = 'bottom';
  g.fillText(`t = ${fmt(world.t, 2)} s · 封包 #${world.next}`, W, H);
  drawStrip(runner);
}
function dotAt(g, x, y, color) { g.fillStyle = color; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
function cross(g, x, y, color) { g.strokeStyle = color; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 4, y - 4); g.lineTo(x + 4, y + 4); g.moveTo(x + 4, y - 4); g.lineTo(x - 4, y + 4); g.stroke(); }

function drawStrip(runner) {
  const [g, W, H] = setup(strip);
  const L = 44, n = 150, cw = (W - L) / n, rows = [['A', 'A'], ['B', 'B'], ['結果', null]], rh = (H - 22) / 3;
  const recs = runner.records.slice(-n);
  g.font = SANS; g.textAlign = 'right'; g.textBaseline = 'middle';
  rows.forEach(([label], k) => { g.fillStyle = css('--muted'); g.fillText(label, L - 8, rh * k + rh / 2); });
  recs.forEach((rec, j) => {
    const x = L + (n - recs.length + j) * cw;
    rows.forEach(([, p], k) => {
      let color = null;
      const resolved = rec.known === rec.act.length;
      if (p) {
        if (!rec.act.includes(p)) return;
        const r = rec.res[p], back = world.t >= rec.t + (r == null ? TIMEOUT_MS : r) / 1000;
        color = !back ? '--soft' : r == null ? '--ink' : r > world.d ? '--late' : (p === 'A' ? '--path-a' : '--path-b');
      } else {
        color = !resolved ? '--soft' : rec.best != null && rec.best <= world.d ? '--ok' : '--late';
      }
      g.fillStyle = css(color);
      g.fillRect(x, rh * k + 3, Math.max(1, cw - (cw > 2.5 ? 1 : 0)), rh - 6);
    });
  });
  g.fillStyle = css('--muted'); g.font = MONO; g.textAlign = 'left'; g.textBaseline = 'bottom';
  g.fillText('← 較早', L, H); g.textAlign = 'right'; g.fillText(`最近 ${n} 個封包（${fmt(n * INTERVAL_S, 0)} 秒）→`, W, H);
}

const VETO = { dead: '提議的路徑連續 3 份失敗', probe: '另一條路超過 1 秒沒有回音' };
const SINGLE = { A: '只送 A', B: '只送 B', AB: 'A、B 都送' };
let lastStats = 0;
function renderStats(force = false) {
  const now = performance.now();
  if (!force && now - lastStats < 250) return;
  lastStats = now;
  const runner = world.runners[ui.policy], s = runner.policy.state;
  const pct = r => (r.done ? fmt(100 * r.hit / r.done, 2) : '—');
  $('demo-facts').innerHTML = [
    [runner.sent, '已送出的封包'],
    [pct(runner) + (runner.done ? '%' : ''), `期限 ${world.d} ms 內送達`],
    [runner.sent ? fmt(runner.copies / runner.sent, 2) : '—', '每封包副本數'],
    [runner.policy.vetoes ? `${runner.policy.vetoes.dead}／${runner.policy.vetoes.probe}` : '—', '規則層改寫（dead／probe）'],
  ].map(([v, k]) => `<div><b>${v}</b><span>${k}</span></div>`).join('');
  const rec = runner.records[runner.records.length - 1];
  let decision = '還沒有送出封包。';
  if (rec) {
    decision = `封包 #${rec.i}：${SINGLE[rec.act]}`;
    if (rec.veto) decision = `封包 #${rec.i}：策略提議${SINGLE[rec.proposal]}，規則層改成 A、B 都送（${VETO[rec.veto]}）`;
  }
  $('demo-decision').textContent = decision;
  $('demo-view').textContent = `策略目前看到的：A 平滑 RTT ${fmt(s.rtt.A)} ms、失敗率 ${fmt(100 * s.miss.A, 0)}%　·　B 平滑 RTT ${fmt(s.rtt.B)} ms、失敗率 ${fmt(100 * s.miss.B, 0)}%`;
  $('demo-board').innerHTML = '<thead><tr><th>策略</th><th>完成</th><th>期限內 %</th><th>副本數</th></tr></thead><tbody>'
    + world.runners.map((r, k) => `<tr${k === ui.policy ? ' class="is-current"' : ''}><td><i class="ota-dot" style="background:var(${r.spec.adaptive ? '--path-a' : '--series-off'})"></i>${r.spec.name}</td><td>${r.done}</td><td>${pct(r)}</td><td>${r.sent ? fmt(r.copies / r.sent, 2) : '—'}</td></tr>`).join('')
    + '</tbody>';
}

let last = 0;
function frame(now) {
  if (!ui.playing) return;
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  world.step(dt * SPEEDS[ui.speed].v);
  draw(); renderStats();
  requestAnimationFrame(frame);
}
// Pause when the demo scrolls out of view so it does not run in the background.
new IntersectionObserver(entries => { if (!entries[0].isIntersecting && ui.playing) setPlaying(false); }).observe(flow);
let resizeTimer = 0;
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(draw, 120); });
new MutationObserver(() => draw()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
// Never starts on its own; with reduced motion the viewer still chooses when to play.
if (reduceMotion) playButton.dataset.reducedMotion = 'true';
draw(); renderStats(true);
