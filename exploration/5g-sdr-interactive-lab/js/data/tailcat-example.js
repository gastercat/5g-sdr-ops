// Official CLI port-forwarding example, transcribed 2026-10-04.
// All addresses are local example endpoints, never project Runtime observations.
export const tailcatSource = 'https://github.com/tailscale/tailcat#forward-local-ports-to-a-tailcat-server';
export const tailcatExample = {
  layer: { id: 'tailcat-details', label: 'Tailcat 理論範例', detail: '本機 TCP 轉送 / 直接 UDP / DERP', top: 795, bottom: 995,
    note: '理論架構 · PROPOSED / NOT_TESTED。依官方 CLI 範例繪製；直接 UDP 與 DERP 中繼是可能的傳輸方式，不是兩條已通過的路徑。' },
  nodes: [
    { id: 'tc-app', label: 'Client app', detail: 'Host A · 本機應用', x: 82, y: 850 },
    { id: 'tc-forward', label: 'tailcat forward', detail: 'Host A · TCP listener', interfaceDetail: '127.0.0.1:18080', x: 267, y: 850 },
    { id: 'tc-server', label: 'tailcat serve', detail: 'Host B · TCP proxy', interfaceDetail: 'tc… · 非 IP 位址', x: 453, y: 850 },
    { id: 'tc-service', label: 'Local service', detail: 'Host B · 範例服務', interfaceDetail: '127.0.0.1:8080', x: 638, y: 850 },
    { id: 'tc-derp', label: 'DERP relay', detail: 'Bootstrap / fallback', interfaceDetail: 'IP / Port 依配置', x: 360, y: 950 }
  ].map(node => ({ ...node, kind: 'unverified', layers: ['tailcat-details'] })),
  links: [
    { id: 'tc-app-forward', source: 'tc-app', target: 'tc-forward', kind: 'plain', label: '本機 TCP', labelAt: { x: 174, y: 895 } },
    { id: 'tc-direct', source: 'tc-forward', target: 'tc-server', kind: 'proposed', label: '直接 UDP · 若可建立', labelAt: { x: 360, y: 805 } },
    { id: 'tc-server-service', source: 'tc-server', target: 'tc-service', kind: 'plain', label: '本機 TCP', labelAt: { x: 546, y: 895 } },
    { id: 'tc-relay-a', source: 'tc-forward', target: 'tc-derp', kind: 'proposed', label: 'Bootstrap', labelAt: { x: 230, y: 925 } },
    { id: 'tc-relay-b', source: 'tc-derp', target: 'tc-server', kind: 'proposed', label: '中繼備援', labelAt: { x: 490, y: 925 } }
  ].map(link => ({ ...link, layers: ['tailcat-details'] })),
  interfaces: [{
    title: 'Tailcat CLI · 理論 IP / Port 範例', basis: 'PROPOSED / NOT_TESTED · 官方文件範例，未進行實測',
    endpoints: [
      'Host A：應用連到 127.0.0.1:18080 / TCP；這是 forward 的預設 loopback listener。',
      'Host A 指令範例：tailcat forward <tc-address> 18080:8080',
      'Host B 指令範例：tailcat serve 8080；轉送到 Host B 本機 127.0.0.1:8080 / TCP。',
      '<tc-address>：由 server 產生並帶外交給 client；不是固定 IP，圖中的 tc… 只是佔位符。',
      '直接路徑：兩端外層 IP / UDP Port 由環境與 NAT 決定，本專案尚未取得。',
      'DERP：relay IP / Port 依 DERP map／自建配置決定，未指定或實測專案端點。'
    ],
    note: '兩個 127.0.0.1 屬不同主機。內層 TCP 服務端點不等於外層 UDP tunnel 端點。官方設計以 WireGuard 保護兩個 Tailcat process 間流量；本機 app／service 段不因此自動受同一隧道保護。這不是完整 Tailscale tailnet、SDR bearer 或 EPC protocol 端點，也不是專案已部署配置。',
    sources: [{ label: 'Tailcat 官方 README · 2026-10-04 查閱', href: tailcatSource, reference: 'CLI port forwarding / data plane' }]
  }],
  evidence: {
    status: 'PROPOSED', label: '官方 CLI 範例 → 理論架構', type: 'UPSTREAM_DOCUMENTATION_REFERENCE',
    detail: '以官方 port-forwarding 範例說明本機 TCP 端點、Tailcat 直接 UDP 與 DERP 備援；圖是教學轉繪，未安裝、連線或實測。官方功能說明不等於本專案安全性或 Runtime 證據。', reference: tailcatSource + ' · 查閱 2026-10-04'
  }
};
