// Navigation is independent of DOM, SVG geometry and lab narrative.
export function createSceneController(scenes, onChange) {
  if (!Array.isArray(scenes) || scenes.length === 0) throw new Error('At least one scene is required.');
  const ids = new Set();
  for (const scene of scenes) {
    if (!scene.id || ids.has(scene.id)) throw new Error('Scene IDs must be present and unique.');
    ids.add(scene.id);
    const nodes = new Set(scene.nodes.map(node => node.id));
    const links = new Set(scene.links.map(link => link.id));
    if (nodes.size !== scene.nodes.length || links.size !== scene.links.length) throw new Error('Node and link IDs must be unique within a scene.');
    for (const link of scene.links) {
      if (!nodes.has(link.source) || !nodes.has(link.target)) throw new Error('Link endpoints must exist in the scene.');
    }
    for (const id of scene.activeNodes || []) if (!nodes.has(id)) throw new Error('Unknown active node: ' + id);
    for (const id of scene.activeLinks || []) if (!links.has(id)) throw new Error('Unknown active link: ' + id);
    const packetIds = new Set();
    for (const flow of scene.animation?.packets || []) {
      if (!flow.id || packetIds.has(flow.id) || !flow.label) throw new Error('Packet flows need unique IDs and labels.');
      packetIds.add(flow.id);
      if (!(flow.durationMs > 0) || (flow.delayMs || 0) < 0) throw new Error('Packet timing must be positive.');
      if (!flow.routes?.length || flow.routes.some(route => !route.length)) throw new Error('Packet flows need a route.');
      for (const route of flow.routes) for (const segment of route) {
        const id = typeof segment === 'string' ? segment : segment.linkId;
        if (!links.has(id)) throw new Error('Unknown packet route link: ' + id);
      }
    }
  }
  let index = 0;
  const getState = () => ({ scene: scenes[index], index, total: scenes.length, canPrevious: index > 0, canNext: index < scenes.length - 1 });
  function goTo(nextIndex) {
    if (!Number.isInteger(nextIndex)) throw new Error('Scene index must be an integer.');
    const next = Math.max(0, Math.min(scenes.length - 1, nextIndex));
    if (next !== index) {
      index = next;
      onChange(getState());
    }
    return getState();
  }
  onChange(getState());
  return { getState, goTo, previous: () => goTo(index - 1), next: () => goTo(index + 1), reset: () => goTo(0) };
}
