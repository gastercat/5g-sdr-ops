// Click or press Enter on a node to see what the scene data already says about it:
// its connections, where it lives, and the interface endpoints that name it.
// Nothing here is authored separately; every line comes from the current scene.
function append(parent, tag, text, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  parent.append(node);
  return node;
}

// "S1-U · eNB ↔ S-GW / SPGW" names eNB, S-GW and SPGW; match whole names only.
const namesIn = title => title.split(/[·↔/→]/).map(part => part.trim());

export function createNodeInspector({ canvas, panel, getScene }) {
  const body = panel.querySelector('[data-inspector-body]');
  const heading = panel.querySelector('[data-inspector-title]');
  let selectedId = null;
  const nodeElement = id => [...canvas.querySelectorAll('[data-node-id]')].find(item => item.dataset.nodeId === id);
  const shown = element => element && !element.hasAttribute('hidden');

  function mark(relatedNodes, relatedLinks) {
    canvas.toggleAttribute('data-inspecting', selectedId !== null);
    for (const item of canvas.querySelectorAll('[data-node-id]')) {
      item.toggleAttribute('data-related', relatedNodes.has(item.dataset.nodeId));
      item.setAttribute('aria-expanded', String(item.dataset.nodeId === selectedId));
    }
    for (const item of canvas.querySelectorAll('[data-link-id]')) item.toggleAttribute('data-related', relatedLinks.has(item.dataset.linkId));
    for (const item of canvas.querySelectorAll('[data-link-label-id]')) item.toggleAttribute('data-related', relatedLinks.has(item.dataset.linkLabelId));
  }

  function place() {
    const target = nodeElement(selectedId);
    if (!shown(target)) return;
    const box = target.getBoundingClientRect();
    const header = document.querySelector('.pinned-header')?.getBoundingClientRect().bottom || 0;
    const margin = 12;
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const minTop = header + margin;
    const maxTop = innerHeight - height - margin;
    const maxLeft = innerWidth - width - margin;
    const centred = box.left + box.width / 2 - width / 2;
    // First position that fits without covering the node: below, above, right, then left.
    const spot = [
      { left: centred, top: box.bottom + 10, fits: box.bottom + 10 <= maxTop },
      { left: centred, top: box.top - height - 10, fits: box.top - height - 10 >= minTop },
      { left: box.right + 12, top: box.top, fits: box.right + 12 <= maxLeft },
      { left: box.left - width - 12, top: box.top, fits: box.left - width - 12 >= margin }
    ].find(option => option.fits) || { left: centred, top: box.bottom + 10 };
    panel.style.left = Math.max(margin, Math.min(maxLeft, spot.left)) + 'px';
    panel.style.top = Math.max(minTop, Math.min(maxTop, spot.top)) + 'px';
  }

  function close({ restoreFocus = false } = {}) {
    if (selectedId === null) return;
    const previous = nodeElement(selectedId);
    selectedId = null;
    panel.hidden = true;
    mark(new Set(), new Set());
    if (restoreFocus) previous?.focus();
  }

  function open(id) {
    const scene = getScene();
    const node = scene.nodes.find(item => item.id === id);
    if (!node || !shown(nodeElement(id))) return;
    selectedId = id;
    heading.textContent = node.label;
    body.replaceChildren();
    append(body, 'p', [node.detail, node.interfaceDetail].filter(Boolean).join(' · '), 'inspector-detail');

    const links = scene.links.filter(link => (link.source === id || link.target === id)
      && shown([...canvas.querySelectorAll('[data-link-id]')].find(item => item.dataset.linkId === link.id)));
    const relatedNodes = new Set([id]);
    if (links.length) {
      append(body, 'h4', '連線');
      const list = append(body, 'ul', null, 'inspector-links');
      for (const link of links) {
        const otherId = link.source === id ? link.target : link.source;
        relatedNodes.add(otherId);
        const other = scene.nodes.find(item => item.id === otherId);
        const arrow = link.bidirectional === false ? (link.source === id ? '→' : '←') : '↔';
        const row = append(list, 'li');
        append(row, 'span', `${arrow} ${other.label}`, 'inspector-peer');
        append(row, 'span', link.label);
      }
    }

    const location = (scene.locations || []).find(item => item.term === node.label);
    if (location) {
      append(body, 'h4', '位置與作用');
      append(body, 'p', location.location, 'inspector-location');
      append(body, 'p', location.role);
    }

    const interfaces = (scene.interfaces || []).filter(item => namesIn(item.title).includes(node.label));
    if (interfaces.length) {
      append(body, 'h4', '介面端點');
      for (const item of interfaces) {
        append(body, 'p', item.title, 'inspector-interface');
        append(body, 'p', item.basis, 'interface-basis');
        for (const endpoint of item.endpoints) append(body, 'p', endpoint, 'interface-endpoint');
      }
      append(body, 'p', '端點為教學設定或歷史參考，不是目前 Runtime 的監聽狀態。完整說明與來源見「IP / Port」。', 'muted');
    }

    mark(relatedNodes, new Set(links.map(link => link.id)));
    panel.hidden = false;
    place();
  }

  function activate(event) {
    const target = event.target.closest?.('[data-node-id]');
    if (!target || !canvas.contains(target)) return false;
    if (target.dataset.nodeId === selectedId) close(); else open(target.dataset.nodeId);
    return true;
  }
  canvas.addEventListener('click', event => { if (!activate(event)) close(); });
  canvas.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (activate(event)) event.preventDefault();
  });
  panel.querySelector('[data-inspector-close]').addEventListener('click', () => close({ restoreFocus: true }));
  addEventListener('scroll', () => { if (selectedId !== null) place(); }, { passive: true, capture: true });
  addEventListener('resize', () => { if (selectedId !== null) place(); });

  return { close, isOpen: () => selectedId !== null };
}
