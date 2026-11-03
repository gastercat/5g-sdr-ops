import { lab03Scenes } from './lab03.js';
import { timelineFor } from './lab01-story.js';
import { tailcatExample } from './tailcat-example.js';

const previous = lab03Scenes.at(-1);
const decision = 'docs/decision-register.md · DR-011；docs/decisions/2026-08-18-professor-meeting.md · PD-02';
const historical = 'labs/lab04-security/README.md · HISTORICAL LAB04 MATERIAL / INDEPENDENT POST-LAB MODEL SUPERSEDED';
const scopeNote = '此 Lab04 是網站中的提案展示視角，不是現行獨立課程實驗。Repository 的 Security 方向是橫跨 Lab01–03；Tailcat 為專案提案，未建立 Runtime 或安全性驗證。';
const curriculumEvidence = {
  status: 'PARTIAL', label: 'Security 方向已定，Lab01–03 映射待設計', type: 'CURRICULUM_DECISION',
  detail: '教授決策將獨立後置 Lab04 model 改為 Lab01–03 的 cross-cutting direction；topic mapping、exercise 與 acceptance criteria 尚未建立。',
  reference: decision
};
const proposedEvidence = {
  status: 'PROPOSED', label: 'Tailcat · 專案整合提案', type: 'PROJECT_PROPOSAL',
  detail: 'Host A／Host B、一般路徑與 Tailcat overlay 是教學設計示意。Tailcat 不是原始課程 Lab04 內容，沒有部署、驗收或保護效果的本專案證據。',
  reference: '5G SDR Interactive Lab · Implementation Plan v0.1 · Lab04 Security；' + historical
};
const protectionEvidence = {
  status: 'NOT_TESTED', label: '認證、授權與流量保護待驗證', type: 'SECURITY_EVIDENCE_GAP',
  detail: '可達性不證明端點身分、存取權限、機密性或傳輸保護。此網站沒有 Tailcat 配置、握手、政策、封包或 Runtime 測試。',
  reference: 'docs/known-limitations.md · claim boundaries；' + historical
};
const securityNodes = [
  { id: 'security-host-a', label: 'Host A', detail: '端點 · 身分待驗證', x: 172, y: 660, kind: 'unverified', layers: ['security'] },
  { id: 'security-host-b', label: 'Host B', detail: '端點 · 權限待驗證', x: 548, y: 660, kind: 'unverified', layers: ['security'] }
];
const plainLink = {
  id: 'security-plain', source: 'security-host-a', target: 'security-host-b', kind: 'plain',
  label: '一般可達路徑 · 保護未知', labelAt: { x: 360, y: 625 }, bidirectional: false, layers: ['security']
};
const overlayLink = {
  id: 'security-tailcat', source: 'security-host-a', target: 'security-host-b', kind: 'proposed',
  label: 'Tailcat overlay · PROPOSED', via: [{ x: 172, y: 740 }, { x: 548, y: 740 }],
  labelAt: { x: 360, y: 767 }, bidirectional: false, layers: ['overlay']
};
const conceptNodeIds = new Set(['reliability-source', 'path-a', 'path-b', 'reliability-dest']);
const radioNodeIds = new Set(['enb-host', 'ue-host', 'b210-enb', 'b210-ue']);
const wiredNodeIds = new Set(['wired-nic-enb', 'wired-nic-ue']);
const shiftedNodes = previous.nodes.map(node => conceptNodeIds.has(node.id) ? { ...node, y: node.y + 450 }
  : radioNodeIds.has(node.id) ? { ...node, y: 1380 }
  : wiredNodeIds.has(node.id) ? { ...node, y: 1510 }
  : ['nat', 'wan'].includes(node.id) ? { ...node, y: 1710 }
  : node.id === 'internet' ? { ...node, y: 1820 } : node);
const shiftedLinks = previous.links.map(link => link.id === 'sgi-nat'
  ? { ...link, via: [{ x: 710, y: 268 }, { x: 710, y: 1660 }, { x: 432, y: 1660 }], labelAt: { x: 575, y: 1660 } }
  : link.layers?.includes('reliability') && link.labelAt
    ? { ...link, labelAt: { ...link.labelAt, y: link.labelAt.y + 450 } } : link);
const shiftedLayers = previous.layers.map(layer => layer.id === 'reliability' ? { ...layer, top: 985, bottom: 1245 }
  : layer.id === 'transport' ? { ...layer, top: 1270, bottom: 1445 }
  : layer.id === 'wired' ? { ...layer, top: 1450, bottom: 1580 }
  : layer.id === 'external' ? { ...layer, bottom: 1880 } : layer);
const shiftedRegions = previous.regions.map(region => region.id === 'reliability-concept' ? { ...region, y: 985 } : region);
const shiftedAnnotations = previous.annotations.map(item => item.layers?.includes('transport') && item.y != null
  ? { ...item, y: item.y + 450 }
  : item.layers?.includes('transport') && item.y1 != null
    ? { ...item, y1: item.y1 + 450, y2: item.y2 + 450 } : item);
const common = {
  ...previous,
  lab: 'Lab04 · PROPOSED', timeline: timelineFor(4), focusNodeId: 'security-host-a',
  baseViewBox: '0 70 720 725', recommendedLayers: ['security'],
  contextLabel: 'PROPOSED · 專案展示視角',
  canvasCaption: '既有架構持續保留；Security 區是提案中的信任問題示意。可達路徑不代表已認證、已授權或已受保護。',
  layers: [...shiftedLayers,
    { id: 'security', label: 'Security 問題視角', detail: 'Host A / B 與一般可達路徑 · PROPOSED', top: 520, bottom: 795,
      note: '此層只展示信任邊界與一般可達路徑的問題。可達性不等於認證、授權、加密或安全性 PASS。' },
    { id: 'trust', label: '信任邊界', detail: 'Trusted / Untrusted 與 Protected / Exposed 待核對', top: 555, bottom: 795,
      note: '虛線框是需要定義的信任域，不是已驗證的 trusted zone；Protected / Exposed 取決於具體流量、政策與證據。' },
    { id: 'overlay', label: 'Tailcat 提案', detail: 'Host A ↔ Host B 的 overlay 設計目標', top: 555, bottom: 795,
      note: 'Tailcat 是專案提案；路徑虛線不表示部署完成、端點已認證、流量已加密或授權政策已生效。' }
  ],
  regions: [...shiftedRegions,
    { id: 'security-concept', label: 'SECURITY VIEW · PROPOSED / NOT_TESTED', x: 10, y: 555, width: 700, height: 240, kind: 'concept', layers: ['security'] },
    { id: 'trust-a', label: 'Trust domain A · 待定義', x: 25, y: 585, width: 290, height: 190, kind: 'trust', layers: ['trust'] },
    { id: 'trust-b', label: 'Trust domain B · 待定義', x: 405, y: 585, width: 290, height: 190, kind: 'trust', layers: ['trust'] }
  ],
  annotations: [...shiftedAnnotations,
    { x1: 18, y1: 535, x2: 702, y2: 535, kind: 'divider', layers: ['security'] },
    { text: '信任問題 · 流量能走通，但誰可信？', x: 18, y: 547, kind: 'heading', layers: ['security'] },
    { text: 'Trusted? · Untrusted?', x: 72, y: 715, kind: 'description', layers: ['trust'] },
    { text: 'Protected? · Exposed?', x: 462, y: 715, kind: 'description', layers: ['trust'] }
  ],
  nodes: [...shiftedNodes, ...securityNodes],
  links: [...shiftedLinks, plainLink, overlayLink],
  interfaces: [...previous.interfaces, {
    title: 'Host A / B · Tailcat 提案', basis: 'PROPOSED · NO CONFIGURATION',
    endpoints: ['Host A / Host B：未指定本專案 IP、Port 或介面', '一般可達路徑：僅架構示意', 'Tailcat overlay：尚無端點設定、認證或授權政策證據'],
    note: '請勿把此處 Host A/B 當成已部署節點；亦不能由畫出的 overlay 推論封包保密、身分驗證或存取控制已通過。',
    sources: [{ label: '網站提案 storyboard', reference: '5G SDR Interactive Lab · Implementation Plan v0.1 · Lab04 Security' }, { label: '課程決策', reference: decision }]
  }],
  locations: [...previous.locations,
    { term: 'Host A / Host B', location: '同一 SVG 的 Security 概念區', role: '用來提出端點身分、授權與流量保護問題；不對應已部署的主機。' },
    { term: 'Tailcat overlay', location: 'Host A ↔ Host B · 可選虛線路徑', role: '專案提案，非原始課程 Lab04；沒有 Runtime 或保護效果證據。' }
  ],
  claim: { status: 'PROPOSED', label: 'Security / Tailcat 專案展示視角', type: 'TEACHING_PROPOSAL', detail: scopeNote, reference: decision + '；' + historical },
  evidence: [curriculumEvidence, proposedEvidence, protectionEvidence],
  evidenceFootnote: scopeNote,
  questions: []
};
function scene({ id, title, shortTitle, change, description, layers, activeNodes, activeLinks, step, beats, questions = [] }) {
  const example = ['L4-S4', 'L4-S5'].includes(id);
  return { ...common, ...(example ? {
    layers: [...common.layers, tailcatExample.layer],
    nodes: [...common.nodes, ...tailcatExample.nodes],
    links: [...common.links, ...tailcatExample.links],
    interfaces: [...common.interfaces.filter(item => item.title !== 'Host A / B · Tailcat 提案'), ...tailcatExample.interfaces],
    evidence: [...common.evidence, tailcatExample.evidence],
    canvasCaption: '理論架構 · PROPOSED / NOT_TESTED · 尚未進行實測。IP / Port 為官方 CLI 的本機轉送範例；直接 UDP 與 DERP 路徑均未在本專案驗證。',
    locations: [...common.locations, { term: 'Tailcat CLI 理論範例', location: '可選細節圖層 · Host A app → forward → Host B serve → local service', role: '依官方 port-forwarding 範例轉繪；兩個 loopback 屬不同主機，DERP 用於 bootstrap 與直連失敗後中繼。' }]
  } : {}), id, title, shortTitle, change, description, recommendedLayers: example ? [...layers, 'tailcat-details'] : layers,
    activeNodes: ['security-host-a', 'security-host-b', ...activeNodes, ...(example ? tailcatExample.nodes.map(node => node.id) : [])],
    activeLinks: ['security-plain', ...activeLinks, ...(example ? tailcatExample.links.map(link => link.id) : [])], step: { ...step, note: scopeNote }, beats, questions };
}
export const lab04Scenes = [
  scene({
    id: 'L4-S1', title: 'Security 視角 · 拓樸（PROPOSED）', shortTitle: '拓樸與信任問題',
    change: '保留先前 LTE 架構；在下方加入 Host A／B，先問可達性之外還缺什麼證據。',
    description: 'Host A 和 Host B 是提案中的教學端點。普通路徑只表達可達的假設，不代表任何安全保證。',
    layers: ['security'], activeNodes: ['ue', 'enb', 'mme', 'sgw', 'pgw'], activeLinks: [],
    step: { title: 'Traffic can flow. But what is trusted?', summary: '既有 UE／eNB／EPC 的拓樸仍留在畫布上；新加入的 Host A／B 只是討論安全性質的概念端點。連得通尚不足以判斷對方身分、可用權限或流量保護。' },
    beats: [{ title: '可達性', detail: '只說明路徑可能存在，不等於安全性通過。' }, { title: '信任問題', detail: '接下來分別看端點、邊界與保護範圍。' }]
  }),
  scene({
    id: 'L4-S2', title: 'Security 視角 · 信任邊界（PROPOSED）', shortTitle: '信任視角',
    change: '在同一條路徑兩端加上待定義的 trust domains；區分 trusted、untrusted、protected 與 exposed 問題。',
    description: '兩個虛線區域只是「需要定義信任邊界」的提示，並非已認證的可信區域。',
    layers: ['security', 'trust'], activeNodes: [], activeLinks: [],
    step: { title: '從拓樸切到信任視角', summary: 'Host A／B 各自處於需界定的信任域。Trusted 或 Untrusted 不是節點名稱可以決定的；Protected 與 Exposed 也要指明哪一段流量、哪項政策及驗證證據。' },
    beats: [{ title: 'Trusted / Untrusted', detail: '誰確認端點身分？邊界在哪裡？' }, { title: 'Protected / Exposed', detail: '哪條流量受保護？保護涵蓋到哪裡？' }]
  }),
  scene({
    id: 'L4-S3', title: 'Security 視角 · 一般路徑（PROPOSED）', shortTitle: '一般可達路徑',
    change: '聚焦 Host A → Host B 的一般可達路徑；保護狀態維持 UNKNOWN。',
    description: '普通路徑不自動代表明文，也不代表已加密；此處沒有封包或配置可判定。',
    layers: ['security', 'trust'], activeNodes: [], activeLinks: [],
    step: { title: 'Plain path：先看能否到達', summary: '概念上 Host A 可以沿普通網路路徑到 Host B。圖只提出要檢查的路徑；身分、授權、加密、路由與實際可達性均未在本網站驗證。' },
    beats: [{ title: 'Host A → Host B', detail: '一般網路路徑示意。' }, { title: 'Protection UNKNOWN', detail: '需要端點配置、政策與封包等證據。' }]
  }),
  scene({
    id: 'L4-S4', title: 'Security 視角 · Tailcat 提案（PROPOSED）', shortTitle: 'Tailcat overlay',
    change: '沿用 Host A／B，展開官方 CLI 的理論轉送架構；細節可由 Tailcat 理論範例圖層隱藏。',
    description: '理論架構，尚未實測：Host A 本機 TCP 18080 經 Tailcat 轉到 Host B 本機 TCP 8080；直接 UDP 與 DERP 均為待驗證路徑。',
    layers: ['security', 'trust', 'overlay'], activeNodes: [], activeLinks: ['security-tailcat'],
    step: { title: 'Tailcat：提案中的保護層', summary: '依官方 CLI 範例，Host A 的 forward 接受本機 127.0.0.1:18080，再經 Tailcat server 轉給 Host B 的 127.0.0.1:8080。連線先透過 DERP bootstrap，再嘗試直接 UDP；直連失敗可中繼。WireGuard 的設計保護範圍是兩個 Tailcat process 之間；本專案未驗證部署、授權或保護效果。' },
    beats: [{ title: '一般路徑', detail: '仍存在，不因畫上 overlay 而消失。' }, { title: 'Tailcat · PROPOSED', detail: '專案整合構想；非原始課程 Lab04，也沒有 Runtime 證據。' }]
  }),
  scene({
    id: 'L4-S5', title: 'Security 視角 · 驗證問題（PROPOSED）', shortTitle: '安全性問題',
    change: '保留一般路徑與 Tailcat 提案，列出聲稱受保護前必須回答的五個問題。',
    description: '問題清單是後續設計與驗證的入口；目前沒有任何安全性 PASS 結果。',
    layers: ['security', 'trust', 'overlay'], activeNodes: [], activeLinks: ['security-tailcat'],
    step: { title: '讓每個安全聲稱都有對應證據', summary: '逐一界定身分、權限、受保護流量與信任邊界，最後指出支撐聲稱的配置、政策與執行證據。本網站只提供檢查問題，不替提案簽發 PASS。' },
    beats: [{ title: 'Who / What / Where', detail: '認證、授權、流量與邊界。' }, { title: 'Evidence', detail: '哪一份可追溯證據能支持每個聲稱？' }],
    questions: ['誰已完成身分認證？', '誰被授予哪些操作或流量權限？', '哪些流量在什麼範圍內受保護？', '信任邊界位於哪裡？', '哪份設定、政策或實測證據支持聲稱？']
  })
];
