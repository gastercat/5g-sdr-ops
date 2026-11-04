import { createPlaybackController, SCENE_DURATION_MS } from './animation/playback.js';
import { scenes } from './data/scenes.js';
import { createSceneController } from './animation/scenes.js';
import { renderScene, setVisibleLayers } from './svg/renderer.js';

const canvas = document.querySelector('#architecture-canvas');
if (!canvas) throw new Error('The page is missing the architecture canvas.');

function renderTimeline(stages) {
  const list = document.querySelector('#lab-timeline');
  if (!list) throw new Error('The page is missing the lab timeline.');
  list.replaceChildren();

  for (const stage of stages) {
    const item = document.createElement('li');
    item.className = 'timeline-step'
      + (stage.state === 'active' ? ' is-current' : '')
      + (stage.state === 'proposed' || stage.proposed ? ' is-proposed' : '');
    if (stage.state === 'active') item.setAttribute('aria-current', 'step');

    const copy = document.createElement('span');
    copy.className = 'step-copy';
    for (const [tag, value] of [['strong', stage.title], ['span', stage.subtitle]]) {
      const line = document.createElement(tag);
      line.textContent = value;
      if (tag === 'strong') line.dataset.mobileLabel = stage.marker === 'RF' ? 'RF' : `Lab${stage.marker}`;
      copy.append(line);
    }
    if (stage.state === 'active' || stage.state === 'proposed') {
      const note = document.createElement('small');
      note.textContent = stage.note;
      copy.append(note);
    }
    if (stage.sceneId) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'timeline-button'; button.dataset.targetScene = stage.sceneId;
      button.append(copy);
      button.addEventListener('click', () => {
        playback.pause();
        controller.goTo(scenes.findIndex(scene => scene.id === stage.sceneId));
        document.querySelector('[data-target-scene="' + stage.sceneId + '"]')?.focus();
      });
      item.append(button);
    } else item.append(copy);
    list.append(item);
  }
}

function renderStep(step) {
  document.querySelector('#scene-summary-title').textContent = step.title;
  document.querySelector('#scene-summary').textContent = step.summary;
  document.querySelector('#historical-note').textContent = step.note;
}


function renderLocations(locations = []) {
  const list = document.querySelector('#location-list');
  list.replaceChildren();
  for (const item of locations) {
    const term = document.createElement('dt');
    term.textContent = item.term;
    const detail = document.createElement('dd');
    const location = document.createElement('strong');
    location.textContent = item.location;
    const role = document.createElement('p');
    role.textContent = item.role;
    detail.append(location, role);
    list.append(term, detail);
  }
}

function renderInterfaces(interfaces = []) {
  const list = document.querySelector('#interface-list');
  list.replaceChildren();
  for (const item of interfaces) {
    const row = document.createElement('li');
    row.className = 'interface-entry';
    const title = document.createElement('h4');
    title.textContent = item.title;
    const basis = document.createElement('p');
    basis.className = 'interface-basis';
    basis.textContent = item.basis;
    row.append(title, basis);
    for (const endpoint of item.endpoints) {
      const line = document.createElement('p');
      line.className = 'interface-endpoint';
      line.textContent = endpoint;
      row.append(line);
    }
    const note = document.createElement('p');
    note.textContent = item.note;
    const sources = document.createElement('div');
    sources.className = 'interface-sources';
    for (const source of item.sources) {
      const reference = document.createElement(source.href ? 'a' : 'span');
      if (source.href) reference.href = source.href;
      reference.textContent = source.label + (source.reference ? ' · ' + source.reference : '');
      sources.append(reference);
    }
    row.append(note, sources);
    list.append(row);
  }
}

let lastOpenedPanel = 'interface-details';
const narrowScreen = matchMedia('(max-width: 800px)');
function setExplanationVisible(visible) {
  document.querySelector('#explanation-panel').hidden = !visible;
  const button = document.querySelector('#explanation-toggle');
  button.setAttribute('aria-expanded', String(visible));
  button.textContent = visible ? '隱藏說明' : '步驟說明';
  if (visible) {
    lastOpenedPanel = 'explanation-panel';
    if (narrowScreen.matches) setInterfacesVisible(false);
  }
  syncEvidenceLinks();
}
function setInterfacesVisible(visible) {
  const button = document.querySelector('#interface-toggle');
  document.querySelector('#interface-details').hidden = !visible;
  canvas.dataset.showInterfaces = String(visible);
  button.setAttribute('aria-expanded', String(visible));
  button.textContent = visible ? '隱藏 IP / Port' : 'IP / Port';
  if (visible) {
    lastOpenedPanel = 'interface-details';
    if (narrowScreen.matches) setExplanationVisible(false);
  }
  syncEvidenceLinks();
}

document.querySelector('#interface-toggle').addEventListener('click', () => {
  const visible = document.querySelector('#interface-details').hidden;
  setInterfacesVisible(visible);
  if (visible) document.querySelector('[data-close-panel="interface-details"]').focus();
});

document.querySelector('#explanation-toggle').addEventListener('click', () => {
  const visible = document.querySelector('#explanation-panel').hidden;
  setExplanationVisible(visible);
  if (visible) document.querySelector('[data-close-panel="explanation-panel"]').focus();
});
function closePanel(id) {
  const interfaces = id === 'interface-details';
  if (interfaces) setInterfacesVisible(false); else setExplanationVisible(false);
  document.querySelector(interfaces ? '#interface-toggle' : '#explanation-toggle').focus();
}
document.querySelectorAll('[data-close-panel]').forEach(button => button.addEventListener('click', () => closePanel(button.dataset.closePanel)));
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const focusedPanel = document.activeElement.closest('.floating-panel');
  const lastPanel = document.getElementById(lastOpenedPanel);
  const panel = focusedPanel || (!lastPanel.hidden ? lastPanel : document.querySelector('.floating-panel:not([hidden])'));
  if (panel && !panel.hidden) { event.preventDefault(); closePanel(panel.id); }
});
narrowScreen.addEventListener('change', () => {
  if (!narrowScreen.matches || document.querySelector('#interface-details').hidden || document.querySelector('#explanation-panel').hidden) return;
  const closeId = lastOpenedPanel === 'interface-details' ? 'explanation-panel' : 'interface-details';
  const hadFocus = document.getElementById(closeId).contains(document.activeElement);
  if (closeId === 'interface-details') setInterfacesVisible(false); else setExplanationVisible(false);
  if (hadFocus) document.querySelector(`[data-close-panel="${lastOpenedPanel}"]`).focus();
});
const pinnedHeader = document.querySelector('.pinned-header');
new ResizeObserver(() => document.documentElement.style.setProperty('--header-height', pinnedHeader.offsetHeight + 'px')).observe(pinnedHeader);

const initialParams = new URLSearchParams(location.search);
const selectedLayers = new Set();
const layerOverrides = new Map();
const knownLayers = new Set(scenes.flatMap(scene => (scene.layers || []).map(layer => layer.id)));
for (const entry of (initialParams.get('layers') || '').split(',')) {
  const [id, value] = entry.split(':');
  if (knownLayers.has(id) && ['0', '1'].includes(value)) layerOverrides.set(id, value === '1');
}
let currentScene;
function syncEvidenceLinks() {
  if (!currentScene) return;
  const params = new URLSearchParams({ scene: currentScene.id });
  if (layerOverrides.size) params.set('layers', [...layerOverrides].map(([id, value]) => `${id}:${value ? 1 : 0}`).join(','));
  if (!document.querySelector('#interface-details').hidden) params.set('ip', '1');
  if (!document.querySelector('#explanation-panel').hidden) params.set('notes', '1');
  document.querySelectorAll('[data-evidence-link]').forEach(link => { link.href = './evidence.html?' + params; });
}
function applyLayers(sceneChanged = false) {
  const { visibleLinks } = setVisibleLayers(canvas, currentScene, selectedLayers);
  document.querySelector('#layer-count').textContent = `${(currentScene.layers || []).filter(layer => selectedLayers.has(layer.id)).length} / ${(currentScene.layers || []).length}`;
  document.querySelectorAll('#layer-controls input').forEach(input => { input.checked = selectedLayers.has(input.value); });
  const notes = document.querySelector('#layer-notes');
  notes.replaceChildren();
  for (const layer of currentScene.layers || []) if (selectedLayers.has(layer.id)) {
    const paragraph = document.createElement('p');
    paragraph.textContent = layer.note;
    notes.append(paragraph);
  }
  document.querySelector('.legend-sample-item').hidden = !currentScene.links.some(link => visibleLinks.has(link.id) && link.kind === 'sample');
  document.querySelector('.legend-radio-item').hidden = !currentScene.links.some(link => visibleLinks.has(link.id) && link.kind === 'radio');
  document.querySelector('.legend-plain-item').hidden = !currentScene.links.some(link => visibleLinks.has(link.id) && link.kind === 'plain');
  document.querySelector('.legend-proposed-item').hidden = !currentScene.links.some(link => visibleLinks.has(link.id) && link.kind === 'proposed');
  document.querySelector('#socket-legend').hidden = !canvas.querySelector('[data-socket-id]:not([hidden])');
  syncEvidenceLinks();
  if (sceneChanged) playback.setScene(currentScene, visibleLinks);
  else playback.setVisibleLinks(visibleLinks);
  document.querySelector('#canvas-description').textContent = currentScene.description + ' 開啟圖層：' + ((currentScene.layers || []).filter(layer => selectedLayers.has(layer.id)).map(layer => layer.label).join('、') || '無，僅顯示核心架構');
}
function renderLayerControls(layers = []) {
  const list = document.querySelector('#layer-controls');
  list.replaceChildren();
  for (const layer of layers) {
    const label = document.createElement('label');
    label.className = 'layer-option';
    const input = document.createElement('input');
    input.type = 'checkbox'; input.value = layer.id; input.checked = selectedLayers.has(layer.id);
    input.setAttribute('aria-controls', 'architecture-canvas layer-notes');
    const copy = document.createElement('span');
    const title = document.createElement('strong'); title.textContent = layer.label;
    const detail = document.createElement('span'); detail.textContent = layer.detail;
    copy.append(title, detail); label.append(input, copy); list.append(label);
    input.addEventListener('change', () => {
      layerOverrides.set(layer.id, input.checked);
      if (input.checked) selectedLayers.add(layer.id); else selectedLayers.delete(layer.id);
      applyLayers();
    });
  }
}

const previous = document.querySelector('#scene-previous');
const next = document.querySelector('#scene-next');
const reset = document.querySelector('#scene-reset');
const panelKeys = new Map();
function updatePanel(key, data, render) {
  const signature = JSON.stringify(data);
  if (panelKeys.get(key) !== signature) {
    render();
    panelKeys.set(key, signature);
  }
}

const sceneSelect = document.querySelector('#scene-select');
for (const [index, scene] of scenes.entries()) {
  const option = document.createElement('option'); option.value = index;
  option.textContent = `${scene.lab} · ${scene.shortTitle}`; sceneSelect.append(option);
}
function renderQuestions(questions = []) {
  const section = document.querySelector('#security-questions');
  const list = section.querySelector('ol');
  list.replaceChildren();
  for (const question of questions) {
    const item = document.createElement('li'); item.textContent = question; list.append(item);
  }
  section.hidden = questions.length === 0;
}
function renderBeats(beats = []) {
  const list = document.querySelector('#scene-beats'); list.replaceChildren();
  for (const beat of beats) {
    const row = document.createElement('li');
    const title = document.createElement('strong'); title.textContent = beat.title;
    const detail = document.createElement('p'); detail.textContent = beat.detail;
    row.append(title, detail); list.append(row);
  }
  list.hidden = beats.length === 0;
}

const playButton = document.querySelector('#scene-play');
const playbackStatus = document.querySelector('#playback-status');
const playback = createPlaybackController({
  canvas,
  advance: () => {
    if (!controller.getState().canNext) return false;
    controller.next();
    return true;
  },
  onStateChange: state => {
    playButton.textContent = state.playing ? '暫停' : '播放';
    playButton.setAttribute('aria-pressed', String(state.playing));
    playButton.setAttribute('aria-label', state.playing ? '暫停場景與封包示意' : '播放場景與封包示意');
    const mode = state.finished ? '播放完畢' : state.playing ? `播放中 · 每步 ${SCENE_DURATION_MS / 1000} 秒` : '已暫停 · 可手動切換';
    const motion = state.reducedMotion ? '減少動態：只切換靜態場景' : state.caption;
    playbackStatus.textContent = `${mode} · ${motion}`;
  }
});
playButton.addEventListener('click', () => {
  if (playback.getState().playing) playback.pause();
  else {
    if (playback.getState().finished) controller.reset();
    playback.play();
  }
});

const controller = createSceneController(scenes, ({ scene, index, total, canPrevious, canNext }) => {
  currentScene = scene;
  selectedLayers.clear();
  for (const layer of scene.layers || []) {
    if (layerOverrides.get(layer.id) ?? (scene.recommendedLayers || []).includes(layer.id)) selectedLayers.add(layer.id);
  }
  sceneSelect.value = index;
  document.querySelector('#scene-change').textContent = scene.change;
  document.querySelector('.context-label').textContent = scene.contextLabel || '歷史架構示意';
  document.querySelector('.canvas-caption').textContent = scene.canvasCaption || '歷史架構示意；淡化表示非目前重點，路徑不代表已驗證。';
  renderQuestions(scene.questions || []);
  document.querySelector('#scene-title').textContent = scene.title;
  document.querySelector('#scene-position').textContent = `${index + 1} / ${total} · ${scene.shortTitle || scene.title}`;
  canvas.dataset.sceneId = scene.id;
  document.querySelector('#canvas-title').textContent = scene.title;
  document.querySelector('#canvas-description').textContent = scene.description;
  previous.disabled = !canPrevious;
  next.disabled = !canNext;
  updatePanel('timeline', scene.timeline, () => renderTimeline(scene.timeline));
  updatePanel('step', scene.step, () => renderStep(scene.step));
  updatePanel('beats', scene.beats, () => renderBeats(scene.beats));
  updatePanel('locations', scene.locations, () => renderLocations(scene.locations));
  updatePanel('interfaces', scene.interfaces, () => renderInterfaces(scene.interfaces));
  document.querySelector('#claim-preview').textContent = `${scene.claim.status} · ${scene.claim.label || scene.claim.title}`;
  updatePanel('layers', scene.layers, () => renderLayerControls(scene.layers));
  renderScene(canvas, scene);
  applyLayers(true);
  if (scene.focusNodeId) requestAnimationFrame(() => {
    if (canvas.dataset.sceneId !== scene.id) return;
    const target = [...canvas.querySelectorAll('[data-node-id]')].find(node => node.dataset.nodeId === scene.focusNodeId);
    if (target && !target.hasAttribute('hidden')) target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
  });
});
sceneSelect.addEventListener('change', () => { playback.pause(); controller.goTo(Number(sceneSelect.value)); });
previous.addEventListener('click', () => { playback.pause(); controller.previous(); });
next.addEventListener('click', () => { playback.pause(); controller.next(); });
reset.addEventListener('click', () => {
  playback.reset();
  layerOverrides.clear();
  selectedLayers.clear();
  document.querySelectorAll('#layer-controls input').forEach(input => { input.checked = false; });
  controller.reset();
  applyLayers();
  setInterfacesVisible(false);
  setExplanationVisible(false);
  document.querySelector('.canvas-scroll').scrollLeft = 0;
  document.querySelectorAll('details').forEach(detail => { detail.open = false; });
  document.querySelector('#main-content').scrollIntoView({ block: 'start', behavior: 'instant' });
});
const initialIndex = scenes.findIndex(scene => scene.id === initialParams.get('scene'));
if (initialIndex >= 0) controller.goTo(initialIndex);
setInterfacesVisible(initialParams.get('ip') === '1');
setExplanationVisible(initialParams.get('notes') === '1');
