const SVG_NS = 'http://www.w3.org/2000/svg';
const NODE_WIDTH = 132;
const NODE_HEIGHT = 64;

function element(name, attributes = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  return node;
}

function addMarker(defs, id, direction) {
  const marker = element('marker', {
    id, viewBox: '0 0 10 10', refX: direction === 'start' ? 2 : 8,
    refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse',
    markerUnits: 'strokeWidth'
  });
  marker.append(element('path', { d: 'M 0 1 L 9 5 L 0 9 z', class: 'marker-shape marker-shape--' + id.split('-')[1] }));
  defs.append(marker);
}

function buildDefs(defs) {
  defs.replaceChildren();
  for (const [id, direction] of [
    ['arrow-user-start', 'start'], ['arrow-user-end', 'end'],
    ['arrow-control-start', 'start'], ['arrow-control-end', 'end'],
    ['arrow-sample-start', 'start'], ['arrow-sample-end', 'end'],
    ['arrow-radio-start', 'start'], ['arrow-radio-end', 'end'],
    ['arrow-config-start', 'start'], ['arrow-config-end', 'end'],
    ['arrow-proposed-start', 'start'], ['arrow-proposed-end', 'end'],
    ['arrow-plain-start', 'start'], ['arrow-plain-end', 'end']
  ]) addMarker(defs, id, direction);
}

function edgePoint(node, toward) {
  const dx = toward.x - node.x;
  const dy = toward.y - node.y;
  if (dx === 0 && dy === 0) return { x: node.x, y: node.y };
  const sx = dx === 0 ? Infinity : (NODE_WIDTH / 2) / Math.abs(dx);
  const sy = dy === 0 ? Infinity : (NODE_HEIGHT / 2) / Math.abs(dy);
  const scale = Math.min(sx, sy);
  return { x: node.x + dx * scale, y: node.y + dy * scale };
}

function addAnnotations(labels, annotations = []) {
  for (const [index, item] of annotations.entries()) {
    const group = element('g', { 'data-annotation-index': index });
    labels.append(group);
    if (item.kind === 'divider') {
      group.append(element('line', { x1: item.x1, y1: item.y1, x2: item.x2, y2: item.y2, class: 'plane-divider' }));
    } else {
      const text = element('text', { x: item.x, y: item.y, class: item.kind === 'heading' ? 'plane-label' : 'plane-description' });
      text.textContent = item.text;
      group.append(text);
    }
  }
}

function addRegions(links, labels, regions = []) {
  for (const region of regions) {
    links.append(element('rect', { x: region.x, y: region.y, width: region.width, height: region.height, rx: 8, class: 'region-box' + (region.kind ? ' region-box--' + region.kind : ''), 'data-region-id': region.id }));
    const text = element('text', { x: region.x + 14, y: region.y + 22, class: 'region-label', 'data-region-label-id': region.id });
    text.textContent = region.label;
    labels.append(text);
  }
}

function labelWidth(text) {
  let width = 0;
  for (const character of text) width += character.codePointAt(0) > 255 ? 12 : 6.7;
  return Math.max(40, width + 16);
}

export function addNode(layer, node) {
  const group = element('g', {
    class: 'node-group', 'data-node-id': node.id, 'data-state': node.state || 'active',
    role: 'group', 'aria-label': node.label + (node.detail ? ', ' + node.detail : '')
  });
  const box = element('rect', {
    x: node.x - NODE_WIDTH / 2, y: node.y - NODE_HEIGHT / 2,
    width: NODE_WIDTH, height: NODE_HEIGHT, rx: 10,
    class: 'node-box' + (node.kind ? ' node-box--' + node.kind : '')
  });
  const title = element('text', { x: node.x, y: node.y - 3, class: 'node-name' });
  title.textContent = node.label;
  group.append(box, title);
  if (node.detail) {
    const detail = element('text', { x: node.x, y: node.y + 17, class: 'node-detail' + (node.interfaceDetail ? ' node-detail--summary' : '') });
    detail.textContent = node.detail;
    group.append(detail);
  }
  if (node.interfaceDetail) {
    const detail = element('text', { x: node.x, y: node.y + 17, class: 'node-detail node-detail--interface' });
    detail.textContent = node.interfaceDetail;
    group.append(detail);
  }
  layer.append(group);
  return group;
}

export function addLink(linkLayer, labelLayer, link, nodeById) {
  const source = nodeById.get(link.source);
  const target = nodeById.get(link.target);
  if (!source || !target) throw new Error('Link "' + link.id + '" refers to a missing node.');
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const length = Math.hypot(dx, dy) || 1;
  const offset = link.parallelOffset || 0;
  const shiftX = (-dy / length) * offset;
  const shiftY = (dx / length) * offset;
  const sourceOffset = { x: source.x + shiftX, y: source.y + shiftY };
  const targetOffset = { x: target.x + shiftX, y: target.y + shiftY };
  const via = link.via || [];
  const start = edgePoint(source, via[0] || targetOffset);
  const end = edgePoint(target, via[via.length - 1] || sourceOffset);
  const marker = 'arrow-' + link.kind;
  const geometry = via.length ? {
    points: [start, ...via, end].map(point => point.x + ',' + point.y).join(' ')
  } : { x1: start.x, y1: start.y, x2: end.x, y2: end.y };
  const line = element(via.length ? 'polyline' : 'line', {
    ...geometry,
    class: 'link-path link-path--' + link.kind,
    'data-link-id': link.id, 'data-state': link.state || 'active',
    ...(link.bidirectional === false ? {} : { 'marker-start': 'url(#' + marker + '-start)' }),
    'marker-end': 'url(#' + marker + '-end)'
  });
  linkLayer.append(line);

  const x = link.labelAt?.x ?? ((start.x + end.x) / 2 + (link.labelOffsetX || 0));
  const y = link.labelAt?.y ?? ((start.y + end.y) / 2 + (link.labelOffsetY || 0));
  const width = labelWidth(link.label);
  const box = element('rect', {
    x: x - width / 2, y: y - 10, width, height: 20, rx: 6, class: 'link-label-box'
  });
  const text = element('text', {
    x, y, class: 'link-label-text link-label-text--' + link.kind
  });
  text.textContent = link.label;
  const label = element('g', { 'data-link-label-id': link.id, 'data-state': link.state || 'active' });
  label.append(box, text);
  labelLayer.append(label);
  return line;
}

export function setNodeState(svgRoot, nodeId, state) {
  const node = svgRoot.querySelector('[data-node-id="' + nodeId + '"]');
  if (node) node.setAttribute('data-state', state);
}

export function setLinkState(svgRoot, linkId, state) {
  const link = svgRoot.querySelector('[data-link-id="' + linkId + '"]');
  if (link) link.setAttribute('data-state', state);
  const label = svgRoot.querySelector('[data-link-label-id="' + linkId + '"]');
  if (label) label.setAttribute('data-state', state);
}

// Each canvas owns its own cache; unchanged nodes and links retain DOM identity.
const canvasStates = new WeakMap();

export function renderScene(svgRoot, scene) {
  const defs = svgRoot.querySelector('#svg-defs');
  const links = svgRoot.querySelector('#svg-links');
  const nodes = svgRoot.querySelector('#svg-nodes');
  const labels = svgRoot.querySelector('#svg-labels');
  const packets = svgRoot.querySelector('#svg-packets');
  if (!defs || !links || !nodes || !labels || !packets) throw new Error('The SVG canvas is missing a required layer.');
  let state = canvasStates.get(svgRoot);
  if (!state) {
    buildDefs(defs);
    const regions = element('g');
    const regionLabels = element('g');
    const annotations = element('g');
    links.prepend(regions);
    labels.append(regionLabels, annotations);
    state = { nodes: new Map(), links: new Map(), regions, regionLabels, annotations };
    canvasStates.set(svgRoot, state);
  }
  svgRoot.setAttribute('viewBox', scene.viewBox);
  const regionsKey = JSON.stringify(scene.regions || []);
  if (regionsKey !== state.regionsKey) {
    state.regions.replaceChildren();
    state.regionLabels.replaceChildren();
    addRegions(state.regions, state.regionLabels, scene.regions);
    state.regionsKey = regionsKey;
  }
  const annotationsKey = JSON.stringify(scene.annotations || []);
  if (annotationsKey !== state.annotationsKey) {
    state.annotations.replaceChildren();
    addAnnotations(state.annotations, scene.annotations);
    state.annotationsKey = annotationsKey;
  }
  const nodeById = new Map(scene.nodes.map(node => [node.id, node]));
  const linkIds = new Set(scene.links.map(link => link.id));
  for (const [id, cached] of state.links) {
    if (!linkIds.has(id)) {
      cached.element.remove(); cached.label.remove(); state.links.delete(id);
    }
  }
  for (const [id, cached] of state.nodes) {
    if (!nodeById.has(id)) { cached.element.remove(); state.nodes.delete(id); }
  }
  for (const node of scene.nodes) {
    const key = JSON.stringify(node);
    let cached = state.nodes.get(node.id);
    if (!cached || cached.key !== key) {
      cached?.element.remove();
      cached = { key, element: addNode(nodes, node) };
      state.nodes.set(node.id, cached);
    }
    setNodeState(svgRoot, node.id, scene.activeNodes ? (scene.activeNodes.includes(node.id) ? 'active' : 'inactive') : (node.state || 'active'));
  }
  for (const link of scene.links) {
    const key = JSON.stringify([link, nodeById.get(link.source), nodeById.get(link.target)]);
    let cached = state.links.get(link.id);
    if (!cached || cached.key !== key) {
      cached?.element.remove(); cached?.label.remove();
      const line = addLink(links, labels, link, nodeById);
      cached = { key, element: line, label: labels.lastElementChild };
      state.links.set(link.id, cached);
    }
    setLinkState(svgRoot, link.id, scene.activeLinks ? (scene.activeLinks.includes(link.id) ? 'active' : 'inactive') : (link.state || 'active'));
  }

  const socketsKey = JSON.stringify([scene.sockets || [], scene.nodes, scene.links]);
  if (state.socketsKey !== socketsKey) {
    state.socketLayer?.remove();
    state.socketLayer = element('g');
    labels.append(state.socketLayer);
    for (const socket of scene.sockets || []) {
      const line = state.links.get(socket.linkId)?.element;
      if (!line) continue;
      const point = line.getPointAtLength(socket.endpoint === 'source' ? 0 : line.getTotalLength());
      const group = element('g', { 'data-socket-id': socket.id });
      const title = element('title'); title.textContent = socket.label;
      group.append(title, element('rect', { x: point.x - 5, y: point.y - 5, width: 10, height: 10, rx: 1, class: 'socket-marker' }));
      state.socketLayer.append(group);
    }
    state.socketsKey = socketsKey;
  }
}

// Layers describe visibility only; focus still comes from the current scene.
export function setVisibleLayers(svgRoot, scene, selectedLayers) {
  const allowed = item => (!item.layers || item.layers.some(id => selectedLayers.has(id)))
    && !(item.hiddenWhenLayers || []).some(id => selectedLayers.has(id));
  const show = (selector, visible) => svgRoot.querySelector(selector)?.toggleAttribute('hidden', !visible);
  const visibleNodes = new Set(scene.nodes.filter(allowed).map(node => node.id));
  const visibleLinks = new Set();
  for (const node of scene.nodes) show('[data-node-id="' + node.id + '"]', visibleNodes.has(node.id));
  for (const link of scene.links) {
    const visible = allowed(link) && visibleNodes.has(link.source) && visibleNodes.has(link.target);
    if (visible) visibleLinks.add(link.id);
    show('[data-link-id="' + link.id + '"]', visible);
    show('[data-link-label-id="' + link.id + '"]', visible);
  }
  for (const region of scene.regions || []) {
    show('[data-region-id="' + region.id + '"]', allowed(region));
    show('[data-region-label-id="' + region.id + '"]', allowed(region));
  }
  (scene.annotations || []).forEach((item, index) => show('[data-annotation-index="' + index + '"]', allowed(item)));
  for (const socket of scene.sockets || []) {
    const selector = '[data-socket-id="' + socket.id + '"]';
    show(selector, allowed(socket) && visibleLinks.has(socket.linkId));
    const link = svgRoot.querySelector('[data-link-id="' + socket.linkId + '"]');
    svgRoot.querySelector(selector)?.setAttribute('data-state', link?.getAttribute('data-state') || 'active');
  }
  if (scene.baseViewBox) {
    const [x, y, width, height] = scene.baseViewBox.split(' ').map(Number);
    let top = y, bottom = y + height;
    for (const layer of scene.layers || []) if (selectedLayers.has(layer.id)) {
      top = Math.min(top, layer.top); bottom = Math.max(bottom, layer.bottom);
    }
    svgRoot.setAttribute('viewBox', [x, top, width, bottom - top].join(' '));
  }
  return { visibleNodes, visibleLinks };
}
