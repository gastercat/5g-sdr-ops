import { rfPhysicalArchitecture } from './rf-transition.js';
import { timelineFor } from './lab01-story.js';

const source = 'labs/lab03-urllc/README.md · Delivery intent 與缺口';
const scope = 'docs/known-limitations.md · low-latency / URLLC';
const note = '此區是 Lab03 教學概念圖，不是已執行的 PRP、Split 或 Duplication Runtime。線上的 P1／P2 與播放粒子均是教學示意，不是實際封包或量測。';
const pending = {
  status: 'NOT_TESTED', label: 'Lab03 模式與量測尚未建立', type: 'DELIVERY_GAP',
  detail: 'Split、Duplication、PRP 行為與 latency／loss／jitter 比較目前缺可重現學生流程、量測及 acceptance criteria。',
  reference: `${source}；${scope}`
};
const rfGate = {
  status: 'NOT_TESTED', label: '前置 RF Gate 尚未通過', type: 'PREREQUISITE',
  detail: 'Lab03 目標架構以 USRP B210 的 LTE SDR Path A 和額外 Ethernet / Switch Path B 為基礎；B210 OTA 尚未建立本專案通過證據。',
  reference: 'labs/lab03-urllc/README.md · 系統架構；docs/known-limitations.md · B210 OTA'
};
const conceptNodes = [
  { id: 'reliability-source', label: 'Source', detail: '概念封包', x: 82, y: 665, kind: 'unverified', layers: ['reliability'] },
  { id: 'path-a', label: 'Path A', detail: 'LTE / SDR · 目標', x: 300, y: 605, kind: 'unverified', layers: ['reliability'] },
  { id: 'path-b', label: 'Path B', detail: 'Ethernet / Switch', x: 300, y: 735, kind: 'unverified', layers: ['reliability'] },
  { id: 'reliability-dest', label: 'Destination', detail: '接收端', x: 638, y: 665, kind: 'unverified', layers: ['reliability'] }
];
const branchA = [
  { id: 'to-path-a', source: 'reliability-source', target: 'path-a', kind: 'user', label: 'P1', labelAt: { x: 190, y: 612 }, bidirectional: false, layers: ['reliability'] },
  { id: 'from-path-a', source: 'path-a', target: 'reliability-dest', kind: 'user', label: 'Path A', labelAt: { x: 470, y: 608 }, bidirectional: false, layers: ['reliability'] }
];
const branchB = [
  { id: 'to-path-b', source: 'reliability-source', target: 'path-b', kind: 'user', label: 'P2', labelAt: { x: 190, y: 716 }, bidirectional: false, layers: ['reliability'] },
  { id: 'from-path-b', source: 'path-b', target: 'reliability-dest', kind: 'user', label: 'Path B', labelAt: { x: 470, y: 714 }, bidirectional: false, layers: ['reliability'] }
];
const reliabilityIds = ['reliability-source', 'path-a', 'path-b', 'reliability-dest'];
const common = {
  ...rfPhysicalArchitecture, focusNodeId: 'reliability-source', lab: 'Lab03', timeline: timelineFor(3),
  baseViewBox: '0 70 720 730', recommendedLayers: ['reliability'],
  layers: [...rfPhysicalArchitecture.layers.map(layer => layer.id === 'transport' ? { ...layer, top: 820, bottom: 995 } : layer.id === 'wired' ? { ...layer, top: 1000, bottom: 1130 } : layer.id === 'external' ? { ...layer, bottom: 1430 } : layer), {
    id: 'reliability', label: '雙路徑概念', detail: 'Path A / Path B 的封包分流或複製',
    top: 535, bottom: 795,
    note: 'Path A 對應規劃中的 LTE SDR 路徑，Path B 對應規劃中的 Ethernet / Switch 路徑。這裡沒有宣稱 PRP 或 URLLC 已實作；P1／P2 只用來說明路徑邏輯。'
  }],
  regions: [...rfPhysicalArchitecture.regions.map(region => region.kind === 'host' ? { ...region, height: 510 - region.y } : region.id === 'epc' ? { ...region, height: 500 - region.y } : region),
    { id: 'reliability-concept', label: 'Lab03 · CONCEPT / NOT_TESTED', x: 10, y: 535, width: 700, height: 260, kind: 'concept', layers: ['reliability'] }
  ],
  annotations: [
    ...rfPhysicalArchitecture.annotations.filter(item => !item.layers?.includes('transport')),
    { text: 'RADIO TRANSPORT · B210 OTA 目標', x: 18, y: 850, kind: 'heading', layers: ['transport'] },
    { text: '實體 radio 路徑仍需通過 RF Gate', x: 18, y: 870, kind: 'description', layers: ['transport'] },
    { x1: 18, y1: 830, x2: 702, y2: 830, kind: 'divider', layers: ['transport'] }
  ],
  nodes: [...rfPhysicalArchitecture.nodes.map(node => ['enb-host', 'ue-host', 'b210-enb', 'b210-ue'].includes(node.id) ? { ...node, y: 930 }
    : ['wired-nic-enb', 'wired-nic-ue'].includes(node.id) ? { ...node, y: 1060 }
    : ['nat', 'wan'].includes(node.id) ? { ...node, y: 1260 }
    : node.id === 'internet' ? { ...node, y: 1370 } : node), ...conceptNodes],
  links: rfPhysicalArchitecture.links.map(link => link.id === 'sgi-nat'
    ? { ...link, via: [{ x: 710, y: 268 }, { x: 710, y: 1210 }, { x: 432, y: 1210 }], labelAt: { x: 575, y: 1210 } } : link),
  interfaces: [...rfPhysicalArchitecture.interfaces, {
    title: 'Lab03 Path A / Path B', basis: 'NOT_TESTED · 教學目標',
    endpoints: ['Path A：規劃 LTE / SDR', 'Path B：規劃 Ethernet / Switch', '尚無經核准的 Path B 固定 IP / Port 清單；上方參考圖 NIC 位址不得代入'],
    note: '圖中兩路是概念位置；不能由實線推論 Split、Duplication 或 PRP Runtime 已建立。',
    sources: [{ label: 'Lab03 delivery intent', reference: source }]
  }],
  locations: [...rfPhysicalArchitecture.locations,
    { term: 'Path A / Path B', location: 'Lab03 畫布下方 CONCEPT 區', role: '說明單一路徑、分流與複製的差異；兩條目標路徑均尚未實測。' }
  ],
  evidence: [pending, rfGate],
  evidenceFootnote: 'Lab03 的數字、圖線與封包名稱均不代表實測。沒有量化 latency、reliability、loss、jitter 或 PRP 增益。',
  claim: { status: 'NOT_TESTED', label: 'Lab03：僅概念示意', type: 'TEACHING_CONCEPT', detail: pending.detail, reference: source }
};
function reliabilityScene({ id, title, shortTitle, change, description, sourceDetail, destDetail, links, activeLinks, step, beats, evidence = common.evidence }) {
  return {
    ...common, id, title, shortTitle, change, description,
    links: [...common.links, ...links],
    nodes: common.nodes.map(node => node.id === 'reliability-source' ? { ...node, detail: sourceDetail }
      : node.id === 'reliability-dest' ? { ...node, detail: destDetail } : node),
    activeNodes: [...(id === 'L3-S1' ? reliabilityIds.filter(nodeId => nodeId !== 'path-b') : reliabilityIds), 'wired-nic-enb', 'wired-nic-ue'],
    activeLinks: [...activeLinks, 'wired-enb-nic', 'wired-ethernet', 'wired-nic-ue'],
    evidence, step: { ...step, note }, beats
  };
}
export const lab03Scenes = [
  reliabilityScene({
    id: 'L3-S1', title: 'Lab03 · Normal Path', shortTitle: '單一路徑',
    change: '在既有網路下方增加 Path A／Path B 的教學區；先看一個封包沿 Path A 抵達。',
    description: '概念封包 P1 只走 Path A；Path B 尚未參與。RF Gate 與路徑結果均 NOT_TESTED。',
    sourceDetail: '一個封包 · P1', destDetail: 'P1 抵達 · 概念',
    links: branchA, activeLinks: branchA.map(link => link.id),
    step: { title: 'Normal：一個封包走一條路', summary: '先以 P1 沿 Path A 前往目的地作基準。Path B 的節點保留在圖上供比較；線條只是預計的資料方向。' },
    beats: [{ title: 'P1 → Path A', detail: '單一路徑的基準示意。' }, { title: 'Destination', detail: '只表示概念上的抵達，沒有 Runtime 成功紀錄。' }]
  }),
  reliabilityScene({
    id: 'L3-S2', title: 'Lab03 · Split', shortTitle: 'Split 分流',
    change: 'Path A 與 Path B 都參與；P1 和 P2 分別走不同路徑。',
    description: 'Split 是不同封包分配到不同路徑；不是把同一個封包複製兩份。此圖未表示已實作或測量。',
    sourceDetail: '不同封包 · P1 / P2', destDetail: '接收 P1 / P2 · 概念',
    links: [...branchA, ...branchB], activeLinks: [...branchA, ...branchB].map(link => link.id),
    step: { title: 'Split：不同封包分流', summary: 'P1 經 Path A，P2 經 Path B。兩個封包的內容不同；分流可能改變路徑負載，但本專案沒有可比較的吞吐、延遲或可靠度數據。' },
    beats: [{ title: 'P1 → Path A', detail: '第一個封包使用 LTE / SDR 目標路徑。' }, { title: 'P2 → Path B', detail: '另一個封包使用 Ethernet / Switch 目標路徑。' }]
  }),
  reliabilityScene({
    id: 'L3-S3', title: 'Lab03 · Duplication', shortTitle: 'Duplication 複製',
    change: '同一個 P1 產生 A、B 兩份 copy；接收端收下先到者並去除重複。',
    description: 'Duplication 是同一封包的兩份 copy 分走兩條路徑；先到先收、重複去除是概念規則，不是本專案觀察結果。',
    sourceDetail: '同一封包 · P1 × 2', destDetail: '先到先收 · 去重',
    links: [...branchA, ...branchB.map(link => link.id === 'to-path-b' ? { ...link, label: 'P1 copy B' } : link)].map(link =>
      link.id === 'to-path-a' ? { ...link, label: 'P1 copy A' } : link),
    activeLinks: [...branchA, ...branchB].map(link => link.id),
    step: { title: 'Duplication：同一封包走兩路', summary: '來源複製 P1，Copy A 沿 Path A，Copy B 沿 Path B。概念接收端接受先到的一份，後到的重複封包被去除；沒有宣稱其中哪條路徑更快。' },
    beats: [{ title: 'P1 → Copy A / Copy B', detail: '兩條路承載相同原始封包。' }, { title: 'First arrival accepted', detail: '概念上接受先到的 copy。' }, { title: 'Duplicate eliminated', detail: '另一份不交給上層；本專案尚無實測。' }]
  }),
  reliabilityScene({
    id: 'L3-S4', title: 'Lab03 · Reliability / Latency', shortTitle: '比較證據待補',
    change: '保留 Split／Duplication 的路徑示意；比較欄位只顯示待量測狀態。',
    description: 'Latency、loss、jitter 與 reliability 均無可用的受控測量值；不畫性能曲線或數字。',
    sourceDetail: '模式比較 · 概念', destDetail: '效能待測',
    links: [...branchA, ...branchB], activeLinks: [...branchA, ...branchB].map(link => link.id),
    step: { title: '比較需由相同條件的實測建立', summary: '將來可在單一路徑、Split、Duplication 下比較 latency、loss、jitter 與資源成本。目前缺測試流程、樣本、條件及驗收標準；不從線條推論改善幅度。' },
    beats: [{ title: 'Latency · NOT_TESTED', detail: '尚無受控測量值。' }, { title: 'Reliability / loss · NOT_TESTED', detail: '尚無同條件樣本或統計。' }, { title: 'Trade-off · NOT_TESTED', detail: '封包複製有額外資源成本，幅度需量測。' }],
    evidence: [pending, rfGate, { status: 'NOT_TESTED', label: 'Latency / reliability 比較數據', type: 'MEASUREMENT_PLACEHOLDER', detail: '未建立 Normal、Split、Duplication 同條件的 latency、loss、jitter 或容量測量；沒有數值可繪圖。', reference: source }]
  })
];
