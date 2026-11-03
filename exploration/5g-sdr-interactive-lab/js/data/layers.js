// Optional detail layers from the supplied architecture illustration.
// Bounds extend the canvas only when their detail is visible; core coordinates stay fixed.
export function withArchitectureLayers(base) {
  const nodeLayers = {
    'tun-ue': ['access'], 'tun-sgi': ['access', 'external'],
    hss: ['auth'], 'user-db': ['auth'], internet: ['external'],
    'enb-host': ['transport'], 'ue-host': ['transport']
  };
  return {
    ...base,
    baseViewBox: '0 70 720 380',
    layers: [
      { id: 'hosts', label: '主機 / EPC 邊界', detail: 'PC2 / Linux2 與 PC1 / Linux1 的配置關係', top: -110, bottom: 680, note: '主機框表示部署角色；EPC 區域包含核心網路元件、主機介面與設定檔。Internet 位於主機框外。' },
      { id: 'access', label: 'Application / TUN', detail: '應用程式、UE TUN 與 EPC SGi TUN', top: -90, bottom: 450, note: 'Application 經 tun_srsue 使用 UE 的 IP 網路；TUN 在成功 attach 後建立。未將參考圖的 DHCP 註記作為本專案已驗證機制。' },
      { id: 'auth', label: 'HSS / 設定檔', detail: '認證資料查詢及 user_db.csv 讀取', top: 70, bottom: 560, note: 'HSS 與訂閱者檔案屬 Linux1 EPC 端；只顯示位置與角色，不展示檔案內容。' },
      { id: 'transport', label: 'Socket / 網路介面', detail: 'S1、S11 Socket、lo 與 ZMQ Sample NIC', top: -65, bottom: 995, note: '方塊標出 Socket 端點；lo 是 Linux1 的 loopback。下方以相同主機角色展開 ZMQ 傳輸，不代表多出兩台主機。ens4 / ens3 為參考圖介面名稱，不是目前實機名稱。TCP / UDP / Unix 端點值可用 IP / Port 按鈕查看。' },
      { id: 'external', label: 'NAT / Internet', detail: 'SGi → NAT → 出口介面 → 外部網路（未驗證）', top: 70, bottom: 785, note: 'NAT / Internet：NOT_TESTED。ens3 與出口 IP 是參考圖範例；沒有套用 NAT 設定，也沒有證明外部網路可達。' }
    ],
    regions: [
      { id: 'pc2', label: 'PC2 / Linux2 · UE', x: 0, y: -95, width: 165, height: 755, kind: 'host', layers: ['hosts'] },
      { id: 'pc1', label: 'PC1 / Linux1 · eNB + EPC', x: 174, y: -95, width: 540, height: 755, kind: 'host', layers: ['hosts'] },
      ...base.regions.map(region => ({ ...region, layers: ['hosts'] }))
    ],
    annotations: [
      { text: 'S1-MME / S1-U · Linux1 lo (loopback)', x: 190, y: -35, kind: 'description', layers: ['transport'] },
      { text: 'ZMQ SAMPLE PLANE · 相同主機的傳輸細節', x: 18, y: 825, kind: 'heading', layers: ['transport'] },
      { text: 'Socket → 網路介面 → Ethernet → 網路介面 → Socket', x: 18, y: 847, kind: 'description', layers: ['transport'] },
      { x1: 18, y1: 805, x2: 702, y2: 805, kind: 'divider', layers: ['transport'] }
    ],
    nodes: [
      ...base.nodes.map(node => ({ ...node, layers: nodeLayers[node.id],
        ...(node.id === 'internet' ? { y: 720 } : {}),
        ...(node.id === 'enb-host' ? { x: 82, y: 930 } : {}),
        ...(node.id === 'ue-host' ? { x: 638, y: 930 } : {})
      })),
      { id: 'application', label: 'Application', detail: 'Linux2 · UE 應用程式', x: 82, y: -32, layers: ['access'] },
      { id: 'sample-nic-enb', label: 'Sample NIC', detail: '圖例 ens4 · Linux1', interfaceDetail: '歷史 · 10.0.0.1', x: 267, y: 930, kind: 'network', layers: ['transport'] },
      { id: 'sample-nic-ue', label: 'Sample NIC', detail: '圖例 ens3 · Linux2', interfaceDetail: '歷史 · 10.0.0.2', x: 453, y: 930, kind: 'network', layers: ['transport'] },
      { id: 'nat', label: 'NAT', detail: 'NOT_TESTED', x: 432, y: 610, kind: 'unverified', layers: ['external'] },
      { id: 'wan', label: '出口介面', detail: '圖例 ens3 · 未驗證', interfaceDetail: '圖例 · 10.0.2.15', x: 612, y: 610, kind: 'network', layers: ['external'] }
    ],
    links: [
      ...base.links.filter(link => !['sgi', 'sample-plane'].includes(link.id)).map(link => ({ ...link,
        ...(link.id === 'sgw-pgw' ? { label: 'SPGW 邏輯路徑' } : {})
      })),
      { id: 'app-tun', source: 'application', target: 'tun-ue', kind: 'user', label: 'IP traffic', labelOffsetX: 52 },
      { id: 'sgi-nat', source: 'tun-sgi', target: 'nat', kind: 'user', label: 'SGi · 未驗證延伸', via: [{ x: 710, y: 268 }, { x: 710, y: 560 }, { x: 432, y: 560 }], labelAt: { x: 575, y: 560 } },
      { id: 'nat-wan', source: 'nat', target: 'wan', kind: 'user', label: 'NAT / forwarding', labelOffsetY: 44 },
      { id: 'wan-internet', source: 'wan', target: 'internet', kind: 'user', label: '未驗證', labelOffsetX: 50 },
      { id: 'sample-enb-nic', source: 'enb-host', target: 'sample-nic-enb', kind: 'sample', label: 'ZMQ Socket', labelOffsetY: -47 },
      { id: 'sample-plane', source: 'sample-nic-enb', target: 'sample-nic-ue', kind: 'sample', label: 'Ethernet', labelOffsetY: 44 },
      { id: 'sample-nic-ue', source: 'sample-nic-ue', target: 'ue-host', kind: 'sample', label: 'ZMQ Socket', labelOffsetY: -47 }
    ],
    sockets: [
      { id: 'enb-s1c', linkId: 's1-mme', endpoint: 'source', label: 'eNB · SCTP Socket' },
      { id: 'mme-s1c', linkId: 's1-mme', endpoint: 'target', label: 'MME · SCTP Socket' },
      { id: 'enb-s1u', linkId: 's1-u', endpoint: 'source', label: 'eNB · GTP-U Socket' },
      { id: 'spgw-s1u', linkId: 's1-u', endpoint: 'target', label: 'SPGW · GTP-U Socket' },
      { id: 'mme-s11', linkId: 's11', endpoint: 'source', label: 'MME · Unix Socket' },
      { id: 'spgw-s11', linkId: 's11', endpoint: 'target', label: 'SPGW · Unix Socket' },
      { id: 'enb-zmq', linkId: 'sample-enb-nic', endpoint: 'source', label: 'eNB · ZMQ Socket 組' },
      { id: 'ue-zmq', linkId: 'sample-nic-ue', endpoint: 'target', label: 'UE · ZMQ Socket 組' }
    ].map(socket => ({ ...socket, layers: ['transport'] })),
    interfaces: [
      ...base.interfaces,
      { title: '網路介面 · lo / Sample NIC', basis: '教學設定 + 參考圖命名',
        endpoints: ['Linux1 lo：S1 端點 127.0.1.1 / 127.0.1.100', 'Linux1 Sample NIC：10.0.0.1（圖例 ens4）', 'Linux2 Sample NIC：10.0.0.2（圖例 ens3）'],
        note: 'ens3 / ens4 僅用來對照參考圖；目前實機介面名稱與狀態未驗證。網路介面、TUN 與 Socket 是不同層次。',
        sources: [{ label: '使用者提供架構圖', reference: '截圖 2026-10-03 13.39.10.png' }, { label: '教學 S1 設定', reference: 'labs/lab01-small-cell/student-config/enb.conf' }] },
      { title: 'NAT → 出口介面 → Internet', basis: 'NOT_TESTED · 參考圖範例',
        endpoints: ['Linux1 圖例出口：ens3 / 10.0.2.15'],
        note: '此為圖例 outgoing IP，並非已驗證的專案出口。未建立 NAT 規則或 Internet 通過的證據。',
        sources: [{ label: '使用者提供架構圖', reference: '截圖 2026-10-03 13.39.10.png' }, { label: '專案驗證邊界', reference: 'docs/known-limitations.md' }] }
    ]
  };
}
