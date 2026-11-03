import { lab02Scenes } from './lab02.js';
import { timelineFor } from './lab01-story.js';

const lab02 = lab02Scenes.at(-1);
const source = 'labs/lab03-urllc/README.md';
const boundary = 'docs/known-limitations.md · Lab01 Recovered Baseline';
const note = 'RF Transition 是 Lab03 前的中間關卡；下列 B210 與 OTA 只表示待驗證的目標架構。本網站沒有操作 SDR、無線發射或 Runtime。';
const historical = {
  status: 'VERIFIED', label: '歷史 Phase 4C：ZeroMQ samples 基線', type: 'HISTORICAL_RECORD',
  detail: 'EPC／eNB 與 UE 之間的 ZeroMQ Sample Plane 曾在 bounded Phase 4C 觀察到；這不是 B210 OTA 證據。',
  reference: 'PROGRESS.md · Confirmed Phase 4C scope；docs/architecture-overview.md · Sample Plane'
};
const rfUnverified = {
  status: 'NOT_VERIFIED', label: 'RF observation 已記錄；原始證據未核實', type: 'SCOPE_BOUNDARY',
  detail: 'PROGRESS 2026-10-29 記錄 G3-3H-A1-RX PASS；原始 evidence 尚無可攜共享 locator，維持 NOT_VERIFIED，不表示失敗或未執行。RX observation 不證明 Cell detection、Random Access、UE attach 或 User Plane PASS。',
  reference: `PROGRESS.md · RF Evidence Navigation 2026-10-29；package 2026-10-29-g3-3h-b05-b06（Repo 外，無可攜共享 locator）；${boundary}`
};
const diagramReference = {
  status: 'NOT_TESTED', label: 'RF 配線參考圖 · 非本專案驗證', type: 'USER_PROVIDED_DIAGRAM',
  detail: '圖例顯示兩台主機各以 USB 3.0 Type B 接 RF board，另有獨立 Ethernet NIC 連線；RF board 間標示 cable / antenna。實際 B210 接線、RF 媒介、NIC 位址與可達性均未在本階段驗證。',
  reference: 'Human-provided · 截圖 2026-10-04 00.12.08.png；docs/known-limitations.md · B210 OTA'
};
const transportNodes = new Set(['enb-host', 'ue-host', 'sample-nic-enb', 'sample-nic-ue']);
const serviceNodes = new Set(['mbms-gw', 'multicast-source']);
const serviceLinks = new Set(['m1', 'embms-radio']);
const radioBase = {
  ...lab02,
  lab: 'RF', timeline: timelineFor(2), baseViewBox: '0 70 720 620',
  recommendedLayers: ['transport'],
  layers: lab02.layers.map(layer => layer.id === 'transport'
    ? { ...layer, label: 'Radio transport', detail: 'ZeroMQ 基線或 B210 OTA 轉換', top: 500, bottom: 680,
        note: 'RF Transition 只改 eNB／UE 間的 radio sample transport；EPC、S1 與 UE IP 邏輯架構留在原位。B210 OTA 仍待實測。' }
    : layer.id === 'external' ? { ...layer, bottom: 1010 } : layer),
  annotations: [
    ...lab02.annotations.filter(item => !item.layers?.includes('transport')),
    { text: 'RADIO TRANSPORT · 同一組 eNB / UE 主機', x: 18, y: 535, kind: 'heading', layers: ['transport'] },
    { text: '由歷史 ZeroMQ 基線走向待驗證的實體 B210 OTA', x: 18, y: 555, kind: 'description', layers: ['transport'] },
    { x1: 18, y1: 515, x2: 702, y2: 515, kind: 'divider', layers: ['transport'] }
  ],
  nodes: lab02.nodes.map(node => {
    if (serviceNodes.has(node.id)) return { ...node, layers: ['service'] };
    if (['nat', 'wan'].includes(node.id)) return { ...node, y: 850 };
    if (node.id === 'internet') return { ...node, y: 960 };
    if (transportNodes.has(node.id)) return { ...node,
      ...(node.id === 'enb-host' ? { x: 82, y: 625 } : {}),
      ...(node.id === 'ue-host' ? { x: 638, y: 625 } : {}),
      ...(node.id === 'sample-nic-enb' ? { x: 267, y: 625 } : {}),
      ...(node.id === 'sample-nic-ue' ? { x: 453, y: 625 } : {})
    };
    return node;
  }),
  links: lab02.links.filter(link => link.id !== 'sgi-mb-collapsed').map(link =>
    serviceLinks.has(link.id) ? { ...link, layers: ['service'] }
    : link.id === 'sgi-nat' ? { ...link, via: [{ x: 710, y: 268 }, { x: 710, y: 800 }, { x: 432, y: 800 }], labelAt: { x: 575, y: 800 } } : link),
  evidenceFootnote: 'RF Gate 目前是教學檢查清單；不能由歷史 ZeroMQ、Lab02 播放或拓樸圖推論 B210 OTA 通過。',
  interfaces: [...lab02.interfaces, {
    title: 'USRP B210 / OTA · 規劃位置', basis: 'NOT_TESTED · Lab03 目標架構',
    endpoints: ['Linux1 eNB ↔ USRP B210', 'USRP B210 ↔ 低功率 OTA ↔ USRP B210', 'USRP B210 ↔ Linux2 UE'],
    note: 'USRP 是實體 radio device，OTA 不使用 ZeroMQ 的 IP／Port；頻率、增益、功率及實際 RF 結果均未在本網站設定或驗證。',
    sources: [{ label: 'Lab03 delivery intent', reference: source }, { label: 'RF 尚未測試', reference: boundary }]
  }]
};
const zmqLinks = ['sample-enb-nic', 'sample-plane', 'sample-nic-ue'];
const physicalNodes = [
  { id: 'b210-enb', label: 'USRP B210', detail: 'Linux1 · eNB 端', x: 267, y: 625, kind: 'unverified', layers: ['transport'] },
  { id: 'b210-ue', label: 'USRP B210', detail: 'Linux2 · UE 端', x: 453, y: 625, kind: 'unverified', layers: ['transport'] }
];
const physicalLinks = [
  { id: 'enb-b210', source: 'enb-host', target: 'b210-enb', kind: 'sample', label: 'USB 3.0 · 圖例', labelOffsetY: -40, bidirectional: false, layers: ['transport'] },
  { id: 'ota-rf', source: 'b210-enb', target: 'b210-ue', kind: 'radio', label: '低功率 OTA · NOT_TESTED', labelOffsetY: 42, bidirectional: false, layers: ['transport'] },
  { id: 'b210-ue-host', source: 'b210-ue', target: 'ue-host', kind: 'sample', label: 'USB 3.0 · 圖例', labelOffsetY: -40, bidirectional: false, layers: ['transport'] }
];
const referenceNodes = [
  { id: 'wired-nic-enb', label: 'NIC · eNB 主機', detail: 'Linux1 · 圖例', x: 267, y: 760, kind: 'unverified', layers: ['wired'] },
  { id: 'wired-nic-ue', label: 'NIC · UE 主機', detail: 'Linux2 · 圖例', x: 453, y: 760, kind: 'unverified', layers: ['wired'] }
];
const referenceNodeIds = ['wired-nic-enb', 'wired-nic-ue'];
const referenceLinkIds = ['wired-enb-nic', 'wired-ethernet', 'wired-nic-ue'];
const referenceLinks = [
  { id: 'wired-enb-nic', source: 'enb-host', target: 'wired-nic-enb', kind: 'config', label: 'NIC', labelOffsetX: -54, bidirectional: false, layers: ['wired'] },
  { id: 'wired-ethernet', source: 'wired-nic-enb', target: 'wired-nic-ue', kind: 'config', label: '獨立 Ethernet · 圖例', labelOffsetY: 44, bidirectional: false, layers: ['wired'] },
  { id: 'wired-nic-ue', source: 'wired-nic-ue', target: 'ue-host', kind: 'config', label: 'NIC', labelOffsetX: 54, bidirectional: false, layers: ['wired'] }
];
export const rfPhysicalArchitecture = {
  ...radioBase, focusNodeId: 'b210-enb',
  layers: [...radioBase.layers, { id: 'wired', label: '參考圖 Ethernet 配線', detail: '獨立於 RF 的兩主機 NIC 連線 · NOT_TESTED', top: 700, bottom: 825, note: '此層只對照使用者提供的配線示意；圖中的 192.168.128.x 並非本專案已驗證的管理或 Sample Plane IP，也不能據此宣稱 Lab03 Path B 已實作。' }],
  nodes: [...radioBase.nodes.filter(node => !['sample-nic-enb', 'sample-nic-ue'].includes(node.id)), ...physicalNodes, ...referenceNodes],
  links: [...radioBase.links.filter(link => !zmqLinks.includes(link.id)), ...physicalLinks, ...referenceLinks],
  sockets: radioBase.sockets.filter(socket => !['enb-zmq', 'ue-zmq'].includes(socket.id)),
  interfaces: [...radioBase.interfaces, {
    title: '2026-10-04 配線圖 · USB / NIC 範例', basis: 'USER-PROVIDED DIAGRAM · NOT PROJECT VERIFICATION',
    endpoints: ['圖例：eNB 主機 ↔ USB 3.0 Type B ↔ RF board ↔ cable / antenna ↔ RF board ↔ USB 3.0 Type B ↔ UE 主機', '圖例獨立 Ethernet：UE 側 enp4s0 192.168.128.106 ↔ eNB 側 enp3s0 192.168.128.108', '圖例 Internet 出口：wlp5s0 192.168.111.104 · NAT'],
    note: '這些 NIC 名稱與 IP 只來自此次截圖；Repo 歷史管理網是 192.168.250.x，ZeroMQ Sample Plane 曾用 10.0.0.x。未檢查目前硬體、線材、RF cable／antenna 取捨、NAT 或 Internet。',
    sources: [{ label: 'Human-provided RF reference', reference: '截圖 2026-10-04 00.12.08.png' }, { label: '目前專案邊界', reference: 'PROGRESS.md · Host / Network Current Truth；docs/known-limitations.md' }]
  }],
  locations: [...radioBase.locations,
    { term: '獨立 Ethernet NIC · 圖例', location: 'Linux1 / Linux2 主機各一端 · 可選圖層', role: '只用於對照截圖配線；不是 RF 樣本鏈路或已實作的 Lab03 Path B。' },
    { term: 'USRP B210 · eNB / UE', location: 'Linux1 與 Linux2 各一台，位於程序與 OTA 之間', role: '計畫將 ZeroMQ sample transport 換成實體無線鏈路；RX observation 為 NOT_VERIFIED，完整 OTA Gate 尚未 PASS。' }]
};
const rfClaim = { status: 'NOT_VERIFIED', label: 'RF Gate 尚無通過結果', type: 'PLANNED_GATE', detail: 'B210 偵測、Cell detection、UE attach、User Plane PASS 各需新的 RF Runtime evidence。', reference: `${source} · 核心驗證目標；${boundary}` };
export const rfScenes = [
  {
    ...radioBase, focusNodeId: 'sample-nic-enb', id: 'RF-S1', title: 'RF Transition · ZeroMQ 基線', shortTitle: '已知 ZeroMQ 基線',
    change: '保留 Lab02 的網路與服務分支；聚焦主機間已記錄的 ZeroMQ radio samples。',
    description: '歷史 Sample Plane 經 Linux1／Linux2 的 NIC 與 ZeroMQ 傳送 radio samples；此處尚未使用 B210。',
    activeNodes: ['enb-host', 'sample-nic-enb', 'sample-nic-ue', 'ue-host'], activeLinks: zmqLinks,
    claim: { status: 'VERIFIED', label: '歷史 Phase 4C：bounded ZeroMQ transport', type: 'HISTORICAL_RECORD', detail: historical.detail, reference: historical.reference },
    evidence: [historical, rfUnverified],
    step: { title: '先固定已知的 sample transport', summary: '這一步重看 Linux1 eNB Process ↔ Ethernet／ZeroMQ ↔ Linux2 UE Process。已記錄的是歷史 ZeroMQ 基線；上方 EPC、S1、eMBMS 服務元件仍保留。', note },
    beats: [{ title: 'Linux1 eNB Process', detail: '使用 ZeroMQ socket 送出／接收 samples。' }, { title: 'Ethernet / ZeroMQ', detail: '使用歷史 10.0.0.0/24 temporary Sample Plane。' }, { title: 'Linux2 UE Process', detail: '這裡尚未切換成實體 OTA。' }]
  },
  {
    ...rfPhysicalArchitecture, id: 'RF-S2', title: 'RF Transition · ZeroMQ → USRP', shortTitle: 'USRP B210 / OTA',
    change: '以 eNB 與 UE 兩端 USRP B210、低功率 OTA 表示 sample transport 的目標替換；網路架構未變。',
    description: 'eNB／UE 程序與 EPC 邏輯節點保留；ZeroMQ NIC／Socket 鏈在這個目標視圖中換成 B210 與 OTA。RX observation 已記錄但 NOT_VERIFIED；完整 OTA Gate 尚未 PASS。',
    activeNodes: ['enb-host', 'b210-enb', 'b210-ue', 'ue-host', ...referenceNodeIds], activeLinks: ['enb-b210', 'ota-rf', 'b210-ue-host', ...referenceLinkIds],
    claim: rfClaim, evidence: [historical, rfUnverified, diagramReference],
    step: { title: 'Transport changed. Network architecture did not.', summary: '把兩主機間的 radio samples 傳輸從 ZeroMQ／Ethernet 換為各一台 USRP B210 與低功率 OTA。UE、eNB、MME、S-GW、P-GW 的邏輯位置與路徑仍在同一張畫布上；這是待驗證架構。', note },
    beats: [{ title: 'eNB Process → B210', detail: 'Linux1 的實體 RF 裝置位置。' }, { title: '低功率 OTA', detail: '兩端裝置之間的預期無線鏈路，NOT_TESTED。' }, { title: 'B210 → UE Process', detail: 'Linux2 的實體 RF 裝置位置。' }]
  },
  {
    ...rfPhysicalArchitecture, id: 'RF-S3', title: 'RF Transition · Pre-Lab03 Gate', shortTitle: 'RF gate',
    change: '檢查四個 RF 前置條件；畫布仍顯示同一個 B210 目標鏈路。',
    description: 'Gate：USRP detected → Cell detected → UE attached → User Plane PASS。各項 RF Gate 尚無可獨立核實的 PASS；另有 RX observation 記錄，狀態 NOT_VERIFIED。',
    activeNodes: ['enb-host', 'b210-enb', 'b210-ue', 'ue-host', ...referenceNodeIds], activeLinks: ['enb-b210', 'ota-rf', 'b210-ue-host', ...referenceLinkIds],
    claim: rfClaim,
    evidence: [rfUnverified, ...['USRP detected', 'Cell detected', 'UE attached', 'User Plane PASS'].map(label => ({
      status: 'NOT_VERIFIED', label, type: 'RF_GATE / NO_VERIFIED_PASS',
      detail: '這是進入 Lab03 前需要實測的檢查點；目前未建立此項可獨立核實的 RF PASS；不能由 RX observation 推論，也不判定是否曾執行。', reference: source + ' · 核心驗證目標'
    })), diagramReference],
    step: { title: 'RF gate：四項都需要實測', summary: '依序確認 USRP 偵測、Cell detection、UE attach 與 User Plane。這裡只展示檢查點，沒有讀取硬體或替任何一項打勾。', note },
    beats: ['USRP detected', 'Cell detected', 'UE attached', 'User Plane PASS'].map(title => ({ title: `${title} · NOT_VERIFIED`, detail: '等待獨立的 RF Runtime 證據。' }))
  }
];
