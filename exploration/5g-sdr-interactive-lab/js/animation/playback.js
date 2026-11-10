import { animatePacket } from '../svg/packets.js';

export const SCENE_DURATION_MS = 12000;
const CYCLE_DURATION_MS = 6000;
const ARRIVAL_HOLD_MS = 1000;

// One clock owns packets and automatic scene navigation. No animation timers live in data or renderer.
export function createPlaybackController({ canvas, advance, onStateChange }) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let playing = false, scene, visibleLinks = new Set(), packets = [];
  let frameId = null, lastTime = null, elapsed = 0, lastCycle = -1;
  let finished = false;
  const routeVisible = route => route.every(segment => visibleLinks.has(typeof segment === 'string' ? segment : segment.linkId));
  function clearPackets() {
    packets.forEach(packet => packet.visual.remove());
    packets = [];
    canvas.querySelector('#svg-packets').replaceChildren();
    lastCycle = -1;
  }
  function getState() {
    return { playing, reducedMotion: reducedMotion.matches, finished,
      caption: scene?.animation && !scene.animation.packets.some(flow => flow.routes.some(routeVisible))
        ? '此示意路徑已隱藏；可由「顯示圖層」開啟'
        : scene?.animation?.caption || '本步聚焦架構／證據，沒有封包移動' };
  }
  function notify() {
    canvas.dataset.playbackState = playing ? 'playing' : 'paused';
    onStateChange(getState());
  }
  function prepareCycle(cycle) {
    clearPackets();
    lastCycle = cycle;
    const plan = scene?.animation;
    if (!plan || reducedMotion.matches) return;
    const flows = plan.packets;
    const arrivals = new Map();
    for (const [index, flow] of flows.entries()) {
      const route = flow.routes.find(routeVisible);
      if (!route) continue;
      const duration = plan.alternateArrival && cycle % 2 ? flows[flows.length - 1 - index].durationMs : flow.durationMs;
      const visual = animatePacket(canvas, flow, route);
      if (!visual) continue;
      const packet = { flow, visual, duration, delay: flow.delayMs || 0 };
      packets.push(packet);
      if (flow.duplicateGroup) {
        const current = arrivals.get(flow.duplicateGroup);
        if (!current || packet.delay + duration < current.delay + current.duration) arrivals.set(flow.duplicateGroup, packet);
      }
    }
    for (const packet of packets) {
      packet.arrivalLabel = packet.flow.duplicateGroup
        ? (arrivals.get(packet.flow.duplicateGroup) === packet ? packet.flow.acceptedLabel || '先到接收' : packet.flow.eliminatedLabel || '重複捨棄')
        : packet.flow.arrivalLabel;
      packet.visual.element.dataset.outcome = packet.flow.duplicateGroup
        ? (arrivals.get(packet.flow.duplicateGroup) === packet ? 'accepted' : 'eliminated') : 'delivery';
    }
  }
  function renderPackets() {
    const cycle = Math.floor(elapsed / CYCLE_DURATION_MS);
    if (cycle !== lastCycle) prepareCycle(cycle);
    const cycleTime = elapsed % CYCLE_DURATION_MS;
    for (const packet of packets) {
      const time = cycleTime - packet.delay;
      if (time < 0 || time > packet.duration + ARRIVAL_HOLD_MS) packet.visual.element.setAttribute('hidden', '');
      else packet.visual.render(time / packet.duration, time >= packet.duration ? packet.arrivalLabel : null);
    }
  }
  function tick(now) {
    frameId = null;
    if (!playing) return;
    if (lastTime !== null) elapsed += Math.min(now - lastTime, 100); // Background tabs never skip the story.
    lastTime = now;
    if (elapsed >= SCENE_DURATION_MS) {
      elapsed = 0;
      if (!advance()) { pause(); finished = true; notify(); return; }
    }
    renderPackets();
    frameId = requestAnimationFrame(tick);
  }
  function pause() {
    playing = false;
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null; lastTime = null;
    canvas.getAnimations({ subtree: true }).forEach(animation => animation.finish());
    notify();
  }
  function play() {
    if (playing) return;
    playing = true; finished = false; lastTime = null;
    renderPackets(); notify();
    frameId = requestAnimationFrame(tick);
  }
  function setScene(nextScene, nextVisibleLinks) {
    scene = nextScene; visibleLinks = new Set(nextVisibleLinks);
    elapsed = 0; finished = false; lastTime = null;
    clearPackets();
    if (playing) renderPackets();
    notify();
  }
  function setVisibleLinks(nextVisibleLinks) {
    visibleLinks = new Set(nextVisibleLinks);
    clearPackets();
    if (playing) renderPackets();
    notify();
  }
  function reset() { pause(); elapsed = 0; finished = false; clearPackets(); notify(); }
  reducedMotion.addEventListener('change', () => {
    clearPackets();
    canvas.getAnimations({ subtree: true }).forEach(animation => animation.finish());
    if (playing) renderPackets();
    notify();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) pause(); });
  window.addEventListener('pagehide', pause);
  return { play, pause, reset, setScene, setVisibleLinks, getState };
}
