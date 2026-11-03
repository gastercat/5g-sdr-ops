import { architecture, timelineFor } from './lab01-story.js';
const protocolRecord = 'docs/evidence/task-evidence/2026-09-26-lab02-b3d-sib13-mcch-mtch.yaml';
const playbackRecord = 'docs/evidence/task-evidence/2026-09-26-lab02-teaching-extension-runtime.yaml';
const note = '本頁引用已記錄的 Session B／Teaching Extension 歷史證據；沒有重新執行 Runtime、讀取 PCAP 或重看未存入 Repo 的照片。';
const bmScScope = { status: 'PARTIAL', label: 'BM-SC · 架構角色有記錄；Runtime 未確認', type: 'COURSE_ARCHITECTURE_REFERENCE', detail: 'Lab02 README 的歷史系統草圖把 BM-SC 列在 PC1；啟動、配置與執行驗收仍為 NEEDS_CONFIRMATION。節點及連線僅作架構參考。', reference: 'labs/lab02-embb/README.md · 系統架構／核心驗證目標' };
const integrity = { status: 'PARTIAL', label: '串流完整性：DEGRADED / INTERMITTENT', type: 'PHOTO + HUMAN_REPORT', detail: '目視播放照片同時有 Packet corrupt、Invalid NAL unit 與 decode/concealment errors。可見畫面不等於無錯誤、連續或長時間穩定播放。', reference: playbackRecord + ' · TE-06；PROGRESS.md · PR #33 follow-up' };
const untested = { status: 'NOT_TESTED', label: '本網站未建立的結果', type: 'SCOPE_BOUNDARY', detail: '未新增 Runtime、跨 session 穩定性、容量上限或效能證據；既有 latency 仍 DEFERRED / UNLOCALIZED。', reference: 'PROGRESS.md · Lab02 Teaching Extension；' + playbackRecord };
const claim = { status: 'PARTIAL', label: 'Lab02：PASS_WITH_LIMITATIONS', type: 'HISTORICAL_REPORT', detail: 'Session B 與 Teaching Extension 已記錄 multicast E2E 和 bounded visible playback；保留人工來源及串流降級限制。', reference: 'PROGRESS.md · Lab02 Session B／Teaching Extension；labs/lab02-embb/README.md' };
const protocolEvidence = [
  { status: 'VERIFIED', label: 'SIB13 · Frame 3', type: 'SCREENSHOT / OBSERVED', detail: '歷史 Wireshark 紀錄：SystemInformation [SIB2 SIB3 SIB13] 與 sib13-v920、MBSFN／MCCH config。只適用於該 finalized capture。', reference: protocolRecord + ' · B3D-01' },
  { status: 'PARTIAL', label: 'MCCH · Frame 22（人工觀察）', type: 'HUMAN_OBSERVATION / REPORTED_ONLY', detail: 'Canonical 記錄為 ESTABLISHED：SDU (MCCH, length=16 bytes)。來源是人工觀察轉錄；該 frame 的截圖未存入 Repo，本網站沒有獨立重解碼。', reference: protocolRecord + ' · B3D-02' },
  { status: 'VERIFIED', label: 'MTCH · Frame 41', type: 'SCREENSHOT / OBSERVED', detail: '歷史紀錄直接解碼 RLC-LTE [DL] [UM] MTCH，Channel Type MTCH (8)，PDU Length 45；不等於應用播放或穩定性證據。', reference: protocolRecord + ' · B3D-03' }
];
const common = {
  ...architecture, lab: 'Lab02', timeline: timelineFor(1), baseViewBox: '0 -215 720 665',
  recommendedLayers: [], beats: [], claim, evidence: [bmScScope, integrity, untested],
  evidenceFootnote: 'VERIFIED 僅表示該項歷史證據在 Repo 已建立，並非本網站的新 Runtime 驗證。Frame 3／22／41 來自同一份 finalized PCAP；MCCH 的 REPORTED_ONLY 來源不升級為獨立觀察。播放 follow-up 是另一組證據，不能用 MTCH 單獨推論。',
  layers: [
    ...architecture.layers.map(layer => layer.id === 'hosts' ? { ...layer, top: -230, detail: 'Linux1 加入 srsMBMS、BM-SC 與 multicast source；EPC 區域保留' } : layer),
    { id: 'service', label: 'eMBMS 服務', detail: 'Application／BM-SC、sgi_mb、MBMS-GW 與 M1', top: -215, bottom: 450, note: 'Lab02 歷史架構草圖列出 BM-SC，但啟動／配置仍 NEEDS_CONFIRMATION；虛線框節點只表示參考角色。服務來源經 sgi_mb TUN 進入 MBMS-GW，再由 M1 到 eNB。M1 與應用 multicast 是不同區段。' }
  ],
  regions: architecture.regions.map(region => region.id === 'pc1' ? { ...region, y: -215, height: 875, label: 'PC1 / Linux1 · eNB + EPC + MBMS' } : region),
  annotations: architecture.annotations.map((item, index) => index === 0 ? { ...item, x: 350, y: 28 } : item),
  nodes: [
    ...architecture.nodes.map(node => node.id === 'tun-ue' ? { ...node, interfaceDetail: '位址依 session 變化' } : node),
    { id: 'mbms-gw', label: 'MBMS-GW', detail: 'Linux1 · srsMBMS', x: 252, y: -152 },
    { id: 'multicast-source', label: 'Application', detail: 'Linux1 · multicast source', interfaceDetail: 'IP / Port below', x: 612, y: -152 },
    { id: 'bm-sc', label: 'BM-SC', detail: '架構參考 · 執行未確認', x: 432, y: -152, kind: 'unverified', layers: ['service'] },
    { id: 'sgi-mb', label: 'sgi_mb', detail: 'Linux1 · MBMS TUN', interfaceDetail: '172.16.0.254/32', x: 432, y: -42, kind: 'interface', layers: ['service'] }
  ],
  links: [
    ...architecture.links,
    { id: 'sgi-mb-collapsed', source: 'multicast-source', target: 'mbms-gw', kind: 'user', label: 'SGI_MB · 展開查看介面', labelOffsetY: 44, bidirectional: false, hiddenWhenLayers: ['service'] },
    { id: 'app-bmsc', source: 'multicast-source', target: 'bm-sc', kind: 'user', label: 'Application · 來源', labelOffsetY: 44, bidirectional: false, layers: ['service'] },
    { id: 'bmsc-sgi-mb', source: 'bm-sc', target: 'sgi-mb', kind: 'user', label: '參考角色路徑', labelAt: { x: 550, y: -86 }, bidirectional: false, layers: ['service'] },
    { id: 'sgi-mb-gw', source: 'sgi-mb', target: 'mbms-gw', kind: 'user', label: 'SGI_MB · sgi_mb', via: [{ x: 252, y: -42 }], labelAt: { x: 342, y: -92 }, bidirectional: false, layers: ['service'] },
    { id: 'm1', source: 'mbms-gw', target: 'enb', kind: 'user', label: 'M1 · GTP-U', labelOffsetX: 48, bidirectional: false }
  ],
  interfaces: [
    ...architecture.interfaces.map(item => item.title === 'UE IP · tun_srsue' ? { ...item, basis: 'Lab02 歷史人工報告 · 位址轉換', endpoints: ['初始 UE：172.16.0.2/24', 'controlled recovery 後 UE：172.16.0.3/24'], note: '兩個 session observation 分別保留，不合併成固定配置。參考圖的 174.16.0.2/24 與 Repo 報告的 172.16.0.2/24 不同；此處保留報告並明列差異，不宣稱目前 Runtime 位址。TUN 沒有固定 TCP / UDP Port。', sources: [{ label: 'Teaching Extension · TE-01', reference: playbackRecord }] } : item),
    { title: 'SGI_MB · sgi_mb', basis: 'HUMAN-REPORTED · Teaching Extension', endpoints: ['Linux1 TUN：172.16.0.254/32', '應用 multicast route：239.255.1.0/24 via sgi_mb', 'sanity：239.255.1.1:3456；video：239.255.1.1:1234'], note: '不同應用使用不同 Port；此處是歷史報告，並非本次監聽或流量觀察。參考圖的 sgi_mb 174.16.0.254/24 與報告 172.16.0.254/32 不同，因此不以插圖值覆寫專案記錄。', sources: [{ label: 'TE-01／TE-02／TE-03', reference: playbackRecord }] },
    { title: 'M1 · MBMS-GW → eNB', basis: 'USER-PROVIDED DIAGRAM · NOT PROJECT VERIFICATION', endpoints: ['圖例參考：lo 127.0.1.100 ↔ 127.0.1.1；UDP 2153 (multicast)', '圖例 M1 group：239.255.0.0/24；應用群組另見下列 sgi_mb 記錄'], note: 'IP／Port／group 只轉錄自參考圖，沒有在本專案 Runtime 或設定中核實。不要與應用 multicast 群組混為一談。', sources: [{ label: 'Human-provided reference diagrams', reference: '截圖 2026-10-03 20.29.21.png；20.29.30.png' }, { label: 'Lab02 架構記錄', reference: 'labs/lab02-embb/README.md' }, { label: 'srsRAN eMBMS', href: 'https://docs.srsran.com/projects/4g/en/next/app_notes/source/embms/source/' }] }
  ],
  locations: [
    ...architecture.locations,
    { term: 'MBMS-GW / srsMBMS', location: 'Linux1 · 既有 eNB / EPC 主機', role: '接收 sgi_mb 的 multicast 資料，經 M1 送至 eNB 的 eMBMS bearer。' },
    { term: 'Application / BM-SC', location: 'Linux1 / PC1 · Lab02 歷史架構草圖', role: 'Application 是 multicast／FFmpeg source；BM-SC 僅表示草圖中的功能角色，啟動與執行仍 NEEDS_CONFIRMATION。' },
    { term: 'IPTV Sink', location: 'Linux2 / PC2 · UE 應用端', role: '播放步驟中的 ffplay 接收端；圖中位置表示角色，不代表本網站即時播放。' }
  ]
};
const serviceLinks = ['sgi-mb-collapsed', 'app-bmsc', 'bmsc-sgi-mb', 'sgi-mb-gw', 'm1', 'embms-radio'];
const radioLink = { id: 'embms-radio', source: 'enb', target: 'ue', kind: 'user', label: 'eMBMS · MCH / MTCH', via: [{ x: 252, y: 232 }, { x: 82, y: 232 }], labelAt: { x: 165, y: 254 }, bidirectional: false };
const delivery = { ...common, links: [...common.links, radioLink] };
export const lab02Scenes = [
  {
    ...common, focusNodeId: 'sgi-mb', id: 'L2-S1',
    canvasCaption: 'Lab02 歷史架構示意；BM-SC 執行未確認。串流完整性 DEGRADED / INTERMITTENT；可見畫面與動畫不代表穩定播放或目前 Runtime。', title: 'Lab02 · 加入 MBMS-GW', shortTitle: '加入 MBMS-GW',
    change: '新增 multicast source、BM-SC 架構參考、MBMS-GW、SGI_MB 與 M1；Lab01 的元件與位置保留。',
    recommendedLayers: ['service'],
    description: '原有 LTE 架構上方新增 srsMBMS 分支：應用來源經 SGI_MB 到 MBMS-GW，再由 M1 送到 eNB。',
    activeNodes: ['multicast-source', 'bm-sc', 'sgi-mb', 'mbms-gw', 'enb'], activeLinks: serviceLinks.filter(id => id !== 'embms-radio'),
    step: { title: 'Service：在既有網路加上 eMBMS', summary: 'Lab01 解決接入與基本傳輸；Lab02 加入服務來源和 MBMS-GW，讓同一份 multicast 內容進入 eNB 的 eMBMS bearer。BM-SC 以虛線框呈現歷史架構角色，仍待確認。原有 MME、S-GW、P-GW 與 S1 連線仍留在畫布上。', note },
    beats: [{ title: 'BM-SC', detail: '參考角色；本專案啟動／執行狀態仍 NEEDS_CONFIRMATION。' }, { title: 'SGI_MB / M1', detail: '應用 multicast 經 sgi_mb 到 MBMS-GW，再由 M1 到 eNB。' }]
  },
  {
    ...delivery, focusNodeId: 'sgi-mb', id: 'L2-S2',
    canvasCaption: 'Lab02 歷史架構示意；BM-SC 執行未確認。串流完整性 DEGRADED / INTERMITTENT；可見畫面與動畫不代表穩定播放或目前 Runtime。', title: 'Lab02 · Multicast Path', shortTitle: 'Multicast 傳送路徑',
    change: '沿新增分支追蹤 payload：Application → BM-SC 參考角色 → sgi_mb → MBMS-GW → M1 → UE。',
    recommendedLayers: ['service'],
    description: '應用 multicast payload 經 SGI_MB、MBMS-GW、M1 與 eNB 的 eMBMS 下行到 UE。此圖只畫一個 UE，不是多 UE 測量。',
    activeNodes: ['multicast-source', 'bm-sc', 'sgi-mb', 'mbms-gw', 'enb', 'ue'], activeLinks: serviceLinks,
    claim: { status: 'VERIFIED', label: 'Session B：multicast E2E 已記錄', type: 'HISTORICAL_RECORD', detail: 'PROGRESS 記錄 LAB02_SHARK_1 在 239.255.1.1:3456 送出與接收內容一致。Teaching Extension 的 incident 前與 recovery 後成功另屬 HUMAN-REPORTED。', reference: 'PROGRESS.md · Lab02 Session B；' + playbackRecord + ' · TE-02' },
    step: { title: '讓服務沿 eMBMS 分支送達', summary: '服務 payload 走 MBMS-GW → M1 → eNB → UE，並不是繞經原有 S-GW／P-GW 的單播資料線。eMBMS 可用於把相同內容送給多個接收者；本圖與此處證據只呈現已記錄的一個 UE 路徑。', note },
    beats: [{ title: 'Application → BM-SC 參考角色', detail: 'Lab02 架構草圖列出 BM-SC；執行狀態與流程 NEEDS_CONFIRMATION。' }, { title: 'MBMS-GW → eNB', detail: 'M1 承載 GTP-U multicast。' }, { title: 'eNB → UE', detail: '經 eMBMS 的 MCH / MTCH 傳送服務資料。' }]
  },
  {
    ...delivery, id: 'L2-S3',
    canvasCaption: '代表性 frame 僅適用既有 capture；MCCH 為 REPORTED_ONLY 人工觀察轉錄，本網站未重新解碼。', title: 'Lab02 · SIB13 / MCCH / MTCH', shortTitle: '控制資訊與通道證據',
    change: '在同一條服務路徑上，區分控制資訊與 payload 通道；核對三個代表性 frame。',
    recommendedLayers: ['service'],
    description: 'SIB13 提供 MBSFN／MCCH 設定，MCCH 提供 eMBMS 控制資訊，MTCH 承載服務資料；三項歷史 frame 證據不是一次互動訊息時序。',
    activeNodes: ['enb', 'ue'], activeLinks: [],
    claim: { status: 'PARTIAL', label: 'B.3D：通道歷史記錄；MCCH 為 REPORTED_ONLY', type: 'CANONICAL_RECORD', detail: '同一份 52-packet finalized UE MAC PCAP 記錄 SIB13、MCCH 與 MTCH。MCH 存在本身不足以證明 MCCH／MTCH；SIB13／MTCH 有歷史 screenshot observation；MCCH Frame 22 僅為 HUMAN_OBSERVATION / REPORTED_ONLY，原始截圖及 decoder export 未存入 Repo，未獨立重解碼。', reference: protocolRecord + '；2026-09-26-lab02-b3d1-dlt149-decoder-compatibility.yaml' },
    evidence: [bmScScope, ...protocolEvidence, untested],
    step: { title: '先知道如何接收，再辨識服務資料', summary: 'SIB13 → MCCH → MTCH 是閱讀依存關係：前兩項是控制資訊，MTCH 是服務資料通道。下列 frame 編號是同一份歷史 capture 的代表例，不是每次實驗固定的編號，也不代表本網站正在解碼。', note },
    beats: [{ title: 'SIB13 · Frame 3', detail: '找到 MBSFN／MCCH 設定；歷史 screenshot observation。' }, { title: 'MCCH · Frame 22', detail: 'eMBMS 控制資訊；人工觀察轉錄，REPORTED_ONLY。' }, { title: 'MTCH · Frame 41', detail: '服務 payload 通道；RLC-LTE [DL] [UM] MTCH 直接解碼記錄。' }]
  },
  {
    ...delivery, focusNodeId: 'sgi-mb', id: 'L2-S4',
    canvasCaption: 'Lab02 歷史架構示意；BM-SC 執行未確認。串流完整性 DEGRADED / INTERMITTENT；可見畫面與動畫不代表穩定播放或目前 Runtime。', title: 'Lab02 · Application / Playback', shortTitle: '應用與目視播放',
    change: '把 IPTV source 經 BM-SC 參考角色、eMBMS 與 UE 接到 IPTV sink；核對 bounded 目視證據。',
    description: 'Linux1 服務來源經 MBMS-GW、eNB、UE 與 tun_srsue 到 Linux2 Application／ffplay。歷史照片支持 bounded visible playback，同時顯示解碼錯誤。',
    recommendedLayers: ['access', 'service'],
    links: delivery.links.map(link => ['ue-tun', 'app-tun'].includes(link.id) ? { ...link, source: link.target, target: link.source, bidirectional: false } : link),
    nodes: delivery.nodes.map(node => node.id === 'multicast-source' ? { ...node, label: 'IPTV Source', detail: 'Linux1 · FFmpeg' } : node.id === 'application' ? { ...node, label: 'IPTV Sink', detail: 'Linux2 · ffplay' } : node),
    activeNodes: ['multicast-source', 'bm-sc', 'sgi-mb', 'mbms-gw', 'enb', 'ue', 'tun-ue', 'application'], activeLinks: [...serviceLinks, 'ue-tun', 'app-tun'],
    claim: { status: 'VERIFIED', label: 'Visible Playback：bounded follow-up PASS', type: 'PHOTO_RECORD / BOUNDED', detail: 'PR #33 納入的 TE-06 記錄：Human-supplied photo 顯示 Linux2 ffplay test-pattern 畫面。照片先前在 task context 檢視、未存入 Repo；此次網站工作沒有重看照片或驗證 Runtime。', reference: playbackRecord + ' · TE-06；PROGRESS.md · PR #33 follow-up' },
    evidence: [bmScScope, integrity, untested],
    step: { title: '可見播放已建立，完整性仍有限制', summary: 'Application 在此對應 Linux2 的 ffplay 接收端。目視 follow-up 補足了原始 session 尚未確認的可見畫面；同一張照片仍有封包與解碼錯誤，不能推論無錯誤播放、持續時間或容量上限。畫布上的 Application 是位置示意，不是重製的實驗畫面。', note },
    beats: [{ title: 'Multicast payload', detail: '來自 Linux1 的應用來源。' }, { title: 'UE → IPTV Sink', detail: '透過 UE 的 tun_srsue 交給 Linux2 的 ffplay。' }, { title: 'Visible playback', detail: 'TE-06／PR #33 支持限定時刻的可見畫面；串流仍 DEGRADED / INTERMITTENT。' }]
  }
];
