// Scenes stack optional detail in fixed vertical bands. When the bands in between are switched
// off, the canvas keeps a tall empty gap. This closes such gaps for display only: everything
// below a gap moves up by the same amount, so the layout inside each band is untouched and
// the scene data keeps its authored coordinates. The canvas is then framed to what is visible.
const NODE_HALF_HEIGHT = 32;
const LABEL_HALF_HEIGHT = 10;
const MAX_GAP = 90;
const KEPT_GAP = 48;
const FRAME_PADDING = 30;

export function isVisible(item, selectedLayers) {
  return (!item.layers || item.layers.some(id => selectedLayers.has(id)))
    && !(item.hiddenWhenLayers || []).some(id => selectedLayers.has(id));
}

function occupiedSpans(scene, selectedLayers) {
  const spans = [];
  const nodes = new Map(scene.nodes.filter(node => isVisible(node, selectedLayers)).map(node => [node.id, node]));
  for (const node of nodes.values()) spans.push([node.y - NODE_HALF_HEIGHT, node.y + NODE_HALF_HEIGHT]);
  for (const link of scene.links) {
    const source = nodes.get(link.source);
    const target = nodes.get(link.target);
    if (!source || !target || !isVisible(link, selectedLayers)) continue;
    for (const point of link.via || []) spans.push([point.y, point.y]);
    const labelY = link.labelAt?.y ?? ((source.y + target.y) / 2 + (link.labelOffsetY || 0));
    spans.push([labelY - LABEL_HALF_HEIGHT, labelY + LABEL_HALF_HEIGHT]);
  }
  // A region only pins its label row and its bottom edge, so a tall host box can still shrink.
  for (const region of scene.regions || []) if (isVisible(region, selectedLayers)) {
    spans.push([region.y, region.y + 28], [region.y + region.height, region.y + region.height]);
  }
  for (const item of scene.annotations || []) if (isVisible(item, selectedLayers)) {
    if (item.kind === 'divider') spans.push([Math.min(item.y1, item.y2), Math.max(item.y1, item.y2)]);
    else spans.push([item.y - 12, item.y + 4]);
  }
  return spans.sort((a, b) => a[0] - b[0]);
}

function findGaps(spans) {
  const gaps = [];
  let bottom = spans[0]?.[1];
  for (const [top, end] of spans) {
    if (top - bottom > MAX_GAP) gaps.push({ from: bottom, to: top, removed: top - bottom - KEPT_GAP });
    bottom = Math.max(bottom, end);
  }
  return gaps;
}

export function compactScene(scene, selectedLayers) {
  const spans = occupiedSpans(scene, selectedLayers);
  if (!spans.length || !scene.baseViewBox) return scene;
  const gaps = findGaps(spans);
  const moveY = y => {
    let shift = 0;
    for (const gap of gaps) {
      if (y >= gap.to) shift += gap.removed;
      else if (y > gap.from) shift += Math.max(0, y - gap.from - KEPT_GAP);
    }
    return y - shift;
  };
  const movePoint = point => ({ ...point, y: moveY(point.y) });
  const [frameX, , frameWidth] = scene.baseViewBox.split(' ').map(Number);
  const top = Math.min(...spans.map(span => moveY(span[0]))) - FRAME_PADDING;
  const bottom = Math.max(...spans.map(span => moveY(span[1]))) + FRAME_PADDING;
  return {
    ...scene,
    baseViewBox: [frameX, top, frameWidth, bottom - top].join(' '),
    layers: [], // Layer bounds no longer size the canvas; the visible content does.
    nodes: scene.nodes.map(movePoint),
    links: scene.links.map(link => ({
      ...link,
      ...(link.via ? { via: link.via.map(movePoint) } : {}),
      ...(link.labelAt ? { labelAt: movePoint(link.labelAt) } : {})
    })),
    regions: (scene.regions || []).map(region => ({ ...region, y: moveY(region.y), height: moveY(region.y + region.height) - moveY(region.y) })),
    annotations: (scene.annotations || []).map(item => item.kind === 'divider'
      ? { ...item, y1: moveY(item.y1), y2: moveY(item.y2) } : movePoint(item))
  };
}
