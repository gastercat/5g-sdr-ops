import base from './lab01.js';
import { withArchitectureLayers } from './layers.js';
const layered = withArchitectureLayers(base);
export const architecture = { ...layered, links: layered.links.map(link => link.id === 'uu-user' ? { ...link, labelAt: { x: 167, y: 112 } } : link) };

export function timelineFor(activeLab) {
  const firstSceneIds = ['L1-S1', 'L2-S1', 'RF-S1', 'L3-S1', 'L4-S1'];
  return base.timeline.map((stage, index) => index < firstSceneIds.length
    ? { ...stage, sceneId: firstSceneIds[index], proposed: index === 4,
        state: index === activeLab ? 'active' : index === 4 ? 'proposed' : 'available',
        note: index === activeLab ? (index === 4 ? 'PROPOSED' : '目前階段') : index === 4 ? 'PROPOSED' : '可瀏覽' }
    : stage);
}

const common = { ...architecture, timeline: timelineFor(0), lab: 'Lab01', recommendedLayers: [], beats: [] };
const note = '這是歷史架構的教學說明，並非目前 Runtime 或逐封包時序重播。';
export const lab01Scenes = [
  {
    ...common, id: 'L1-S1', title: 'Lab01 · 基本架構', shortTitle: '基本架構',
    change: '先建立連線的骨架：UE、eNB 與 EPC。細節可由圖層開關展開。',
    description: 'UE 經 eNB 接入 EPC；EPC 以 MME、S-GW、P-GW 邏輯功能表示。Internet 是可展開的未驗證延伸。',
    step: { title: 'Connectivity：先讓 UE 接上網路', summary: 'UE 是終端，eNB 是基地台程序，EPC 提供控制與資料轉送。先看主要元件的關係，再分開看 Sample Plane、Control Plane 與 User Plane。Internet 路徑只作概念延伸。', note }
  },
  {
    ...common, focusNodeId: 'sample-nic-enb', id: 'L1-S2', title: 'Lab01 · ZeroMQ Sample Transport', shortTitle: 'ZeroMQ 樣本傳輸',
    change: '網路骨架保留；展開 eNB Process 與 UE Process 之間的 radio samples 傳輸。',
    description: 'Linux1 eNB Process 與 Linux2 UE Process 經 Ethernet／ZeroMQ 交換 radio samples；不是 UE IP tunnel 或 B210 OTA。',
    recommendedLayers: ['transport'],
    activeNodes: ['enb', 'ue', 'enb-host', 'ue-host', 'sample-nic-enb', 'sample-nic-ue'],
    activeLinks: ['sample-enb-nic', 'sample-plane', 'sample-nic-ue'],
    step: { title: '用 ZeroMQ 承載 radio samples', summary: '歷史基線把軟體 eNB 與 UE 分放兩台主機，用 Ethernet 上的 ZeroMQ 傳輸 baseband samples。它替代這一階段的實體無線傳輸；IP／Port 區域可查看 TX／RX 方向。', note },
    beats: [{ title: 'eNB Process', detail: 'Linux1 產生與接收 samples。' }, { title: 'ZeroMQ / Ethernet', detail: '沿歷史 Sample Plane 在兩台主機間傳輸。' }, { title: 'UE Process', detail: 'Linux2 的 srsUE 處理 samples；不是直接收到應用程式 IP tunnel。' }]
  },
  {
    ...common, focusNodeId: 'mme', id: 'L1-S3', title: 'Lab01 · Attach / Control Plane', shortTitle: 'Attach 與控制面',
    change: '聚焦 RRC、S1-MME、S11 及認證資料來源；資料面保留在原位。',
    description: 'UE、eNB、MME 經控制面建立連線；MME 與 S-GW 以 S11 協調承載，HSS 提供認證資料脈絡。',
    recommendedLayers: ['auth'],
    activeNodes: ['ue', 'enb', 'mme', 'sgw', 'hss', 'user-db'],
    activeLinks: ['uu-control', 's1-mme', 's11', 'mme-hss', 'hss-db'],
    step: { title: '控制面先建立 UE 的網路上下文', summary: '沿 UE → eNB → MME 閱讀控制路徑。下列四項是 attach 的概念順序，省略協定往返與實作細節，不是本次 capture 的訊息清單；歷史 attach 成功也不等於每一項安全性質都已獨立驗證。', note },
    beats: [{ title: 'Attach', detail: 'UE 向網路提出接入請求。' }, { title: 'Authentication', detail: '利用訂閱者資料進行身分認證。' }, { title: 'Security', detail: '建立控制通訊所需的安全上下文。' }, { title: 'Context Setup', detail: '協調 UE 上下文與承載；S11 連接 MME 和 S-GW。' }]
  },
  {
    ...common, focusNodeId: 'enb', id: 'L1-S4', title: 'Lab01 · User Plane', shortTitle: '使用者資料路徑',
    change: '聚焦應用程式、UE TUN、GTP-U 與 SGi；控制面繼續保留。',
    description: 'Application 經 tun_srsue、UE、eNB、S1-U／GTP-U、S-GW、P-GW 到達 srs_spgw_sgi。NAT／Internet 未驗證。',
    recommendedLayers: ['access'],
    activeNodes: ['application', 'tun-ue', 'ue', 'enb', 'sgw', 'pgw', 'tun-sgi'],
    activeLinks: ['app-tun', 'ue-tun', 'uu-user', 's1-u', 'sgw-pgw', 'pgw-tun'],
    step: { title: '使用者流量沿承載轉送', summary: 'UE 的 IP 流量經 eNB 的 S1-U／GTP-U 進入 EPC，再由 SGi TUN 交給主機網路。S-GW 與 P-GW 在圖中拆成邏輯功能。可開啟 NAT／Internet 查看延伸路徑，但它不在 Lab01 Phase 4C 的通過範圍。', note },
    beats: [{ title: 'UE → eNB', detail: '應用程式透過 UE 網路堆疊傳送資料。' }, { title: 'GTP-U → S-GW → P-GW', detail: '沿使用者面承載資料；與 S1-MME 控制面分開。' }, { title: 'SGi → 外部網路', detail: 'SGi 是出口邊界；TCP／NAT／Internet 仍為 NOT_TESTED。' }]
  },
  {
    ...common, id: 'L1-S5', title: 'Lab01 · Evidence', shortTitle: '連通性證據',
    change: '收束 connectivity 的證據範圍，再進入 Lab02 服務分支。',
    description: '歷史 Phase 4C 的 attach、UE IP、bounded ICMP 有紀錄；後續 EV-2 為 PARTIAL，TCP／NAT／Internet 未測。',
    step: { title: 'Claim 與 Evidence 要分開閱讀', summary: '歷史 Phase 4C 支持 attach、UE 位址與 bounded 雙向 ICMP。較後 EV-2 的 R5 為 FAIL / UNLOCALIZED，不能把兩個 checkpoint 合併成目前網路正常。TCP／user-plane throughput 觀察尚不能列為 VERIFIED。', note },
    beats: [{ title: 'UE attach 與 IP', detail: '歷史紀錄中 UE 接入並取得位址。' }, { title: 'Bounded ICMP', detail: '只支持當時限定測試範圍的連通性。' }, { title: 'TCP / NAT / Internet', detail: 'Phase 4C 未驗證；不能由 attach 或 ICMP 推論。' }]
  }
];
