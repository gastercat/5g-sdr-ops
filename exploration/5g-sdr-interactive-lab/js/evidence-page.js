import { scenes } from './data/scenes.js';
import { renderEvidence } from './ui/evidence.js';

const params = new URLSearchParams(location.search);
const select = document.querySelector('#evidence-scene');
for (const scene of scenes) {
  const option = document.createElement('option'); option.value = scene.id;
  option.textContent = `${scene.lab} · ${scene.shortTitle}`; select.append(option);
}
function showScene(scene) {
  select.value = scene.id;
  params.set('scene', scene.id);
  document.querySelector('#evidence-scene-title').textContent = scene.title;
  renderEvidence(scene.claim, scene.evidence, scene.evidenceFootnote);
  document.querySelectorAll('[data-architecture-link]').forEach(link => { link.href = './index.html?' + params; });
}
select.addEventListener('change', () => showScene(scenes.find(scene => scene.id === select.value)));
showScene(scenes.find(scene => scene.id === params.get('scene')) || scenes[0]);
const header = document.querySelector('.pinned-header');
new ResizeObserver(() => document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px')).observe(header);
