import { packetPlans } from './packet-flows.js';
import { lab01Scenes } from './lab01-story.js';
import { lab02Scenes } from './lab02.js';
import { rfScenes } from './rf-transition.js';
import { lab03Scenes } from './lab03.js';
import { lab04Scenes } from './lab04.js';

// Data order defines the story; Lab04 is a proposed visualization, not current curriculum.
export const scenes = [...lab01Scenes, ...lab02Scenes, ...rfScenes, ...lab03Scenes, ...lab04Scenes].map(scene => ({ ...scene, animation: packetPlans[scene.id] || null }));
