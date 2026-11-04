const lab01 = {
  id: 'L1-S1',
  title: 'Lab01 · Connectivity',
  viewBox: '0 0 720 800',
  timeline: [
    { marker: '01', title: 'Lab01', subtitle: 'Connectivity', note: '目前步驟', state: 'active' },
    { marker: '02', title: 'Lab02', subtitle: 'eMBMS service', note: '後續階段', state: 'planned' },
    { marker: 'RF', title: 'RF Transition', subtitle: 'ZeroMQ → B210', note: '轉換關卡', state: 'planned' },
    { marker: '03', title: 'Lab03', subtitle: 'Reliability', note: '測量待補', state: 'planned' },
    { marker: '04', title: 'Lab04 · Security', subtitle: 'Tailcat integration', note: 'PROPOSED', state: 'proposed' }
  ],
  step: {
    title: '從連線建立到使用者流量',
    summary: 'UE 先經 eNB 與 MME 完成控制面 attach；成功建立承載後，使用者流量經 eNB、GTP-U、S-GW 與 P-GW 到達 SGi。實線表示 User Plane，虛線表示 Control Plane。',
    note: '圖中 ZeroMQ Sample Plane 的位址與執行方式來自歷史基線，不是目前 Runtime 狀態。'
  },
  regions: [
    { id: 'epc', label: 'EPC 端 · Linux1', x: 350, y: 48, width: 342, height: 494 }
  ],
  annotations: [
    { text: 'SAMPLE PLANE · ZMQ', x: 18, y: 672, kind: 'heading' },
    { text: '歷史 temporary Sample Plane · 主機間 radio samples', x: 18, y: 690, kind: 'description' },
    { x1: 18, y1: 650, x2: 702, y2: 650, kind: 'divider' }
  ],
  nodes: [
    { id: 'tun-ue', label: 'tun_srsue', detail: 'Linux2 · UE 端 TUN', interfaceDetail: '歷史 IP · 172.16.0.2', x: 82, y: 68, kind: 'interface' },
    { id: 'ue', label: 'UE', detail: 'srsue · Linux2', x: 82, y: 158, state: 'active' },
    { id: 'enb', label: 'eNB', detail: 'srsenb · Linux1', x: 252, y: 158, state: 'active' },
    { id: 'mme', label: 'MME', detail: 'srsepc · 控制面', x: 432, y: 378, state: 'active' },
    { id: 'sgw', label: 'S-GW', detail: '使用者面閘道', x: 432, y: 158, state: 'active' },
    { id: 'pgw', label: 'P-GW', detail: 'Packet Gateway', x: 612, y: 158, state: 'active' },
    { id: 'tun-sgi', label: 'srs_spgw_sgi', detail: 'Linux1 · SGi TUN', interfaceDetail: '歷史 IP · 172.16.0.1', x: 612, y: 268, kind: 'interface' },
    { id: 'hss', label: 'HSS', detail: 'srsepc · 認證資料', x: 612, y: 378 },
    { id: 'user-db', label: 'user_db.csv', detail: '設定檔 · 不展示內容', x: 432, y: 488, kind: 'file' },
    { id: 'internet', label: 'Internet', detail: '概念路徑 · 未驗證', x: 612, y: 588, state: 'active' },
    { id: 'enb-host', label: 'eNB Process', detail: 'Linux1 · 歷史主機角色', x: 252, y: 734, state: 'active', kind: 'host' },
    { id: 'ue-host', label: 'UE Process', detail: 'Linux2 · 歷史主機角色', x: 492, y: 734, state: 'active', kind: 'host' }
  ],
  links: [
    { id: 'ue-tun', source: 'tun-ue', target: 'ue', kind: 'user', label: 'UE IP', labelOffsetX: -50 },
    { id: 'uu-user', source: 'ue', target: 'enb', kind: 'user', label: 'Uu · User Plane', parallelOffset: -12, labelOffsetY: -54 },
    { id: 'uu-control', source: 'ue', target: 'enb', kind: 'control', label: 'RRC', parallelOffset: 12, labelOffsetY: 44 },
    { id: 's1-mme', source: 'enb', target: 'mme', kind: 'control', label: 'S1-MME · S1AP / SCTP', labelOffsetX: -48 },
    { id: 's11', source: 'mme', target: 'sgw', kind: 'control', label: 'S11 · GTP-C', labelOffsetX: 48 },
    { id: 's1-u', source: 'enb', target: 'sgw', kind: 'user', label: 'S1-U · GTP-U', labelOffsetY: -54 },
    { id: 'sgw-pgw', source: 'sgw', target: 'pgw', kind: 'user', label: 'GTP-U', labelOffsetY: -54 },
    { id: 'pgw-tun', source: 'pgw', target: 'tun-sgi', kind: 'user', label: 'SGi TUN', labelOffsetX: 49 },
    { id: 'sgi', source: 'tun-sgi', target: 'internet', kind: 'user', label: 'SGi', via: [{ x: 704, y: 268 }, { x: 704, y: 588 }], labelAt: { x: 684, y: 570 } },
    { id: 'mme-hss', source: 'mme', target: 'hss', kind: 'control', label: '內部查詢', labelOffsetY: -36 },
    { id: 'hss-db', source: 'user-db', target: 'hss', kind: 'config', label: '讀取檔案', bidirectional: false },
    { id: 'sample-plane', source: 'enb-host', target: 'ue-host', kind: 'sample', label: 'Ethernet · ZMQ / ZeroMQ radio samples', labelOffsetY: 43 }
  ],
  locations: [
    { term: 'tun_srsue', location: 'Linux2 · UE 主機', role: 'srsue 的 Linux TUN 介面；UE 應用程式 IP 流量的入口。位址可用畫布上的 IP / Port 按鈕查看。' },
    { term: 'ZMQ / ZeroMQ', location: 'Linux1 eNB Process ↔ Linux2 UE Process', role: '經 Ethernet 傳輸 baseband radio samples；不是 UE IP tunnel，也不是 S1-MME。' },
    { term: 'SCTP', location: 'eNB ↔ MME · S1-MME', role: '承載 S1AP 控制訊號的 transport；不承載 GTP-U 使用者資料。' },
    { term: 'HSS', location: 'Linux1 · srsepc 內部', role: '提供訂閱者與認證資料。此 srsEPC 圖以 MME 的內部查詢表示，不假設獨立外部 HSS 服務。' },
    { term: 'user_db.csv', location: 'Linux1 · /etc/srsran/user_db.csv', role: '由 HSS 讀取的訂閱者設定檔，位於 Repo 外；只標示名稱與角色，不展示任何內容或憑證。' },
    { term: 'srs_spgw_sgi', location: 'Linux1 · EPC / SPGW 主機', role: 'SPGW 的 Linux SGi TUN 介面；它是 EPC 端介面，不是另一部閘道設備。位址可用畫布上的 IP / Port 按鈕查看。' }
  ],
  interfaces: [
    {
      title: 'S1-MME · eNB ↔ MME', basis: '教學設定參考 + 協定 Port',
      endpoints: [
        'Linux1 eNB：127.0.1.1；SCTP 本地 Port 由 OS 分配（s1c_bind_port = 0，實際值未知）',
        'Linux1 MME：127.0.1.100:36412 · SCTP / S1AP'
      ],
      note: '127.0.1.x 是 Linux1 loopback；不屬於主機間 ZMQ 網段。',
      sources: [
        { label: '教學 enb.conf', reference: 'labs/lab01-small-cell/student-config/enb.conf' },
        { label: '教學 epc.conf', reference: 'labs/lab01-small-cell/student-config/epc.conf' },
        { label: 'srsRAN Port 文件 · PDF p.119', href: 'https://docs.srsran.com/_/downloads/4g/en/latest/pdf/#page=119' }
      ]
    },
    {
      title: 'S1-U · eNB ↔ S-GW / SPGW', basis: '教學設定參考 + 協定 Port',
      endpoints: ['Linux1 eNB：127.0.1.1:2152 · UDP / GTP-U', 'Linux1 SPGW：127.0.1.100:2152 · UDP / GTP-U'],
      note: 'IP 來自 gtp_bind_addr / gtpu_bind_addr；Port 是協定參考，不代表已觀察到封包或監聽。',
      sources: [
        { label: '教學 enb.conf', reference: 'labs/lab01-small-cell/student-config/enb.conf' },
        { label: '教學 epc.conf', reference: 'labs/lab01-small-cell/student-config/epc.conf' },
        { label: 'srsRAN Port 文件 · PDF p.119', href: 'https://docs.srsran.com/_/downloads/4g/en/latest/pdf/#page=119' }
      ]
    },
    {
      title: 'S11 · MME ↔ S-GW / SPGW', basis: '上游實作參考 · 非 Runtime 驗證',
      endpoints: ['Linux1 MME：@mme_s11', 'Linux1 SPGW：@spgw_s11'],
      note: '此 srsEPC 實作以 Linux abstract Unix datagram socket 傳遞 GTP-C；IP / TCP / UDP Port 不適用。@ 表示 abstract socket 名稱，並非檔案路徑。',
      sources: [{ label: '上游 mme_gtpc.cc · init_s11()', href: 'https://github.com/srsran/srsRAN_4G/blob/master/srsepc/src/mme/mme_gtpc.cc' }]
    },
    {
      title: 'ZMQ · eNB Process ↔ UE Process', basis: '歷史 Sample Plane 位址 + 教學設定',
      endpoints: [
        'eNB → UE：Linux1 TX 綁定 tcp://*:2000 → Linux2 RX tcp://10.0.0.1:2000',
        'UE → eNB：Linux2 TX 綁定 tcp://*:2001 → Linux1 RX tcp://10.0.0.2:2001'
      ],
      note: '* 是本地主機綁定位置；10.0.0.1（Linux1）與 10.0.0.2（Linux2）屬歷史 temporary 10.0.0.0/24。這裡傳輸 radio samples。',
      sources: [
        { label: '教學 enb.conf', reference: 'labs/lab01-small-cell/student-config/enb.conf' },
        { label: 'UE 教學 template', reference: 'labs/lab01-small-cell/student-config/ue.conf.template' },
        { label: '歷史架構記錄', reference: 'docs/architecture-overview.md' }
      ]
    },
    {
      title: 'UE IP · tun_srsue', basis: '歷史位址參考',
      endpoints: ['Linux2 UE 端 TUN：172.16.0.2'],
      note: 'TUN 是 IP 介面，沒有固定的 TCP / UDP Port；應用程式的 Port 另行決定。',
      sources: [{ label: '歷史架構記錄', reference: 'docs/architecture-overview.md' }]
    },
    {
      title: 'SGi TUN · srs_spgw_sgi', basis: '歷史位址參考 + 教學設定',
      endpoints: ['Linux1 EPC 端 TUN：172.16.0.1'],
      note: 'TUN 介面沒有固定 TCP / UDP Port。此位址不證明 NAT 或 Internet 連通。',
      sources: [
        { label: '歷史架構記錄', reference: 'docs/architecture-overview.md' },
        { label: '教學 epc.conf', reference: 'labs/lab01-small-cell/student-config/epc.conf' }
      ]
    },
    {
      title: 'HSS ↔ user_db.csv', basis: '元件 / 設定檔位置參考',
      endpoints: ['Linux1 srsepc 內部 HSS；設定路徑 /etc/srsran/user_db.csv'],
      note: '內部查詢與檔案讀取沒有獨立 IP / Port；不假設外部 HSS 或 Diameter 端點，不展示訂閱者資料。',
      sources: [{ label: 'srsEPC HSS 文件', href: 'https://docs.srsran.com/projects/4g/en/latest/usermanuals/source/srsepc/source/2_epc_getstarted.html' }]
    },
    {
      title: 'S-GW ↔ P-GW · 邏輯功能', basis: '架構示意 · 外部端點未建立',
      endpoints: ['此圖將 srsepc 的 SPGW 拆成 S-GW / P-GW 邏輯功能'],
      note: '不另指定外部 S5 IP / Port；右側 Internet 也未建立已驗證的外部端點。',
      sources: [{ label: 'srsEPC SPGW 文件', href: 'https://docs.srsran.com/projects/4g/en/latest/usermanuals/source/srsepc/source/2_epc_getstarted.html' }]
    }
  ],
  claim: {
    status: 'VERIFIED',
    title: '歷史 Phase 4C：bounded connectivity',
    detail: '記錄包含 Network Attach、UE 位址與雙向 bounded ICMP。',
    source: 'PROGRESS.md · Lab01 Recovered Baseline'
  },
  evidence: [
    {
      status: 'PARTIAL',
      title: '後續 EV-2 checkpoint：R5 尚未通過',
      detail: 'R0–R4、R6 有 evidence；UE → EPC ICMP 為 FAIL / UNLOCALIZED，EV-2 不宣稱完成。',
      source: 'PROGRESS.md · EV-2；TER 2026-08-30'
    },
    {
      status: 'NOT_TESTED',
      title: '未建立的 Lab01 結果',
      detail: 'TCP／iperf、NAT／Internet 與 B210 OTA 不在 Phase 4C 驗證範圍。',
      source: 'docs/known-limitations.md'
    }
  ],
  evidenceFootnote: '歷史 Phase 4C 與較後 EV-2 是分開的證據 checkpoint；不能合併成目前仍在運作或整體 Lab01 PASS 的宣稱。'
};

export default lab01;
