const SVG_NS = 'http://www.w3.org/2000/svg';
const TRAIL_OFFSETS = [9, 18, 27, 37, 48];
const PULSE_MS = 520;
const RING_FADE_LENGTH = 14;

function svgElement(name, attributes) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  return node;
}
const clamp = value => Math.max(0, Math.min(1, value));

// Several packets can share a link; the link stays highlighted while any of them is on it.
function setCarrier(path, packetId, carrying) {
  const carriers = path.packetCarriers || (path.packetCarriers = new Set());
  if (carrying) carriers.add(packetId); else carriers.delete(packetId);
  path.toggleAttribute('data-carrying', carriers.size > 0);
}

// A packet follows existing SVG geometry. Story authors only specify link IDs.
// Every visual here is a pure function of the caller's clock, so Pause freezes the trail,
// the encapsulation ring and the node pulses together with the packet.
export function animatePacket(svgRoot, flow, route, { holdMs = 1000 } = {}) {
  const segments = route.map(segment => {
    const { linkId, reverse = false } = typeof segment === 'string' ? { linkId: segment } : segment;
    const path = [...svgRoot.querySelectorAll('[data-link-id]')].find(item => item.dataset.linkId === linkId);
    return { path, reverse, length: path?.getTotalLength() || 0 };
  });
  if (segments.some(item => !item.path || item.path.hidden || item.path.hasAttribute('hidden') || item.length === 0)) return null;
  let totalLength = 0;
  for (const segment of segments) { segment.start = totalLength; totalLength += segment.length; }

  const layer = svgRoot.querySelector('#svg-packets');
  const group = svgElement('g', { class: 'packet', 'data-packet-id': flow.id, 'data-packet-label': flow.label });
  const trail = TRAIL_OFFSETS.map((offset, index) => svgElement('circle', {
    r: (5 - index * 0.6).toFixed(1), class: 'packet-trail', opacity: (0.8 - index * 0.14).toFixed(2)
  }));
  const ring = svgElement('circle', { r: 10, class: 'packet-ring' });
  const dot = svgElement('circle', { r: 6, class: 'packet-dot' });
  const label = svgElement('text', { x: 0, y: -16, class: 'packet-label' });
  label.textContent = flow.label;
  group.append(...trail, ring, dot, label);

  // One pulse per node the packet reaches, timed by where that node sits along the route.
  const pulses = [];
  for (const segment of segments) {
    const nodeId = segment.reverse ? segment.path.dataset.source : segment.path.dataset.target;
    const box = [...svgRoot.querySelectorAll('[data-node-id]')].find(item => item.dataset.nodeId === nodeId)?.querySelector('rect');
    if (!box) continue;
    const rect = svgElement('rect', { class: 'node-pulse', hidden: '' });
    pulses.push({
      rect, at: (segment.start + segment.length) / totalLength, final: segment === segments.at(-1),
      x: Number(box.getAttribute('x')), y: Number(box.getAttribute('y')),
      width: Number(box.getAttribute('width')), height: Number(box.getAttribute('height'))
    });
    layer.append(rect);
  }
  layer.append(group);

  function locate(distance) {
    const bounded = Math.max(0, Math.min(totalLength, distance));
    const segment = segments.find(item => bounded <= item.start + item.length) || segments.at(-1);
    const local = bounded - segment.start;
    return { segment, local, point: segment.path.getPointAtLength(segment.reverse ? segment.length - local : local) };
  }
  let carrierPath = null;
  function carry(path) {
    if (path === carrierPath) return;
    if (carrierPath) setCarrier(carrierPath, flow.id, false);
    if (path) setCarrier(path, flow.id, true);
    carrierPath = path;
  }
  function hide() {
    group.setAttribute('hidden', '');
    for (const pulse of pulses) pulse.rect.setAttribute('hidden', '');
    carry(null);
  }
  function render(timeMs, durationMs, arrivalLabel) {
    const progress = clamp(timeMs / durationMs);
    const moving = progress < 1;
    const distance = progress * totalLength;
    const { segment, local, point } = locate(distance);
    const eliminated = group.dataset.outcome === 'eliminated';
    group.setAttribute('transform', `translate(${point.x} ${point.y})`);
    group.dataset.kind = segment.path.classList.value.match(/link-path--(\w+)/)?.[1] || 'user';
    group.dataset.arrival = arrivalLabel ? 'true' : 'false';
    group.removeAttribute('hidden');
    carry(moving ? segment.path : null);

    for (const [index, circle] of trail.entries()) {
      const behind = distance - TRAIL_OFFSETS[index];
      if (!moving || behind < 0) { circle.setAttribute('hidden', ''); continue; }
      const past = locate(behind).point;
      circle.setAttribute('cx', past.x - point.x);
      circle.setAttribute('cy', past.y - point.y);
      circle.removeAttribute('hidden');
    }

    // The outer ring is the tunnel header: it closes around the packet on an encapsulating link.
    const encapsulation = moving ? segment.path.dataset.encapsulation : null;
    if (encapsulation) {
      const settled = clamp(Math.min(local, segment.length - local) / RING_FADE_LENGTH);
      ring.setAttribute('r', (10 + (1 - settled) * 5).toFixed(1));
      ring.setAttribute('opacity', settled.toFixed(2));
      ring.removeAttribute('hidden');
    } else ring.setAttribute('hidden', '');
    label.textContent = arrivalLabel || (encapsulation ? `${encapsulation}[ ${flow.label} ]` : flow.label);

    // A discarded duplicate fades out during the arrival hold instead of only changing its label.
    const fade = eliminated && arrivalLabel ? clamp((timeMs - durationMs) / holdMs) : 0;
    group.setAttribute('opacity', (1 - fade * 0.9).toFixed(2));

    for (const pulse of pulses) {
      const age = (timeMs - pulse.at * durationMs) / PULSE_MS;
      if (age < 0 || age > 1 || (pulse.final && eliminated)) { pulse.rect.setAttribute('hidden', ''); continue; }
      const grow = 3 + age * 11;
      pulse.rect.setAttribute('x', pulse.x - grow);
      pulse.rect.setAttribute('y', pulse.y - grow);
      pulse.rect.setAttribute('width', pulse.width + grow * 2);
      pulse.rect.setAttribute('height', pulse.height + grow * 2);
      pulse.rect.setAttribute('rx', 10 + grow);
      pulse.rect.setAttribute('opacity', ((1 - age) * 0.9).toFixed(2));
      pulse.rect.removeAttribute('hidden');
    }
  }
  function remove() {
    hide();
    group.remove();
    for (const pulse of pulses) pulse.rect.remove();
  }
  return { element: group, render, hide, remove };
}
