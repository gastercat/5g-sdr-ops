const SVG_NS = 'http://www.w3.org/2000/svg';
function svgElement(name, attributes) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  return node;
}

// A packet follows existing SVG geometry. Story authors only specify link IDs.
// The caller owns the clock, so Pause never leaves an independent animation running.
export function animatePacket(svgRoot, flow, route) {
  const paths = route.map(segment => {
    const { linkId, reverse = false } = typeof segment === 'string' ? { linkId: segment } : segment;
    const path = [...svgRoot.querySelectorAll('[data-link-id]')].find(item => item.dataset.linkId === linkId);
    return { path, reverse, length: path?.getTotalLength() || 0 };
  });
  if (paths.some(item => !item.path || item.path.hidden || item.path.hasAttribute('hidden') || item.length === 0)) return null;
  const totalLength = paths.reduce((sum, item) => sum + item.length, 0);
  const group = svgElement('g', { class: 'packet', 'data-packet-id': flow.id, 'data-packet-label': flow.label });
  const dot = svgElement('circle', { r: 4.5, class: 'packet-dot' });
  const label = svgElement('text', { x: 0, y: -12, class: 'packet-label' });
  label.textContent = flow.label;
  group.append(dot, label);
  svgRoot.querySelector('#svg-packets').append(group);
  function render(progress, arrivalLabel) {
    let remaining = Math.max(0, Math.min(1, progress)) * totalLength;
    let segment = paths.at(-1);
    for (const item of paths) {
      segment = item;
      if (remaining <= item.length) break;
      remaining -= item.length;
    }
    const distance = Math.min(segment.length, remaining);
    const point = segment.path.getPointAtLength(segment.reverse ? segment.length - distance : distance);
    group.setAttribute('transform', `translate(${point.x} ${point.y})`);
    group.dataset.kind = segment.path.classList.value.match(/link-path--(\w+)/)?.[1] || 'user';
    group.dataset.arrival = arrivalLabel ? 'true' : 'false';
    label.textContent = arrivalLabel || flow.label;
    group.hidden = false;
    group.removeAttribute('hidden');
  }
  return { element: group, render, remove: () => group.remove() };
}
