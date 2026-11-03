// Teaching timing only: durations are presentation choices, never measurements.
// Route IDs refer to existing story links; the first fully visible alternative wins.
const sampleRoute = ['sample-enb-nic', 'sample-plane', 'sample-nic-ue'];
const samplePackets = [
  { id: 'samples-down', label: 'samples', routes: [sampleRoute], durationMs: 3600 },
  { id: 'samples-up', label: 'samples', routes: [[...sampleRoute].reverse().map(linkId => ({ linkId, reverse: true }))], durationMs: 3600, delayMs: 1000 }
];
const serviceRoutes = (tail = []) => [
  ['app-bmsc', 'bmsc-sgi-mb', 'sgi-mb-gw', 'm1', ...tail],
  ['sgi-mb-collapsed', 'm1', ...tail]
];
const pathA = ['to-path-a', 'from-path-a'];
const pathB = ['to-path-b', 'from-path-b'];
export const packetPlans = {
  'L1-S2': { caption: 'ZeroMQ 雙向 samples · 教學示意', packets: samplePackets },
  'L1-S3': { caption: 'Attach／承載控制路徑 · 省略協定往返', packets: [
    { id: 'attach', label: '控制', routes: [['uu-control', 's1-mme']], durationMs: 2200 },
    { id: 'auth', label: '查詢', routes: [['mme-hss']], delayMs: 2300, durationMs: 900 },
    { id: 'bearer', label: 'S11', routes: [['s11']], delayMs: 3400, durationMs: 1000 }
  ] },
  'L1-S4': { caption: '使用者資料 → SGi 邊界 · Internet 未測', packets: [
    { id: 'user-data', label: 'IP', routes: [['app-tun', 'ue-tun', 'uu-user', 's1-u', 'sgw-pgw', 'pgw-tun'], ['uu-user', 's1-u', 'sgw-pgw']], durationMs: 4300 }
  ] },
  'L2-S1': { caption: 'eMBMS 服務分支 · BM-SC 執行未確認', packets: [
    { id: 'service', label: '資料', routes: serviceRoutes(), durationMs: 4100 }
  ] },
  'L2-S2': { caption: 'Multicast → eNB → UE · 教學示意', packets: [
    { id: 'multicast', label: '資料', routes: serviceRoutes(['embms-radio']), durationMs: 4400 }
  ] },
  'L2-S4': { caption: 'Multicast → IPTV Sink · 非實際播放畫面', packets: [
    { id: 'playback', label: '資料', routes: [...serviceRoutes(['embms-radio', 'ue-tun', 'app-tun']), ...serviceRoutes(['embms-radio'])], durationMs: 4400 }
  ] },
  'RF-S1': { caption: '歷史 ZeroMQ samples 路徑示意', packets: samplePackets },
  'RF-S2': { caption: 'B210／OTA 目標路徑 · NOT_TESTED', packets: [
    { id: 'radio-samples', label: 'samples', routes: [['enb-b210', 'ota-rf', 'b210-ue-host']], durationMs: 4100 }
  ] },
  'L3-S1': { caption: 'Normal：P1 只走 Path A · 概念', packets: [
    { id: 'p1', label: 'P1', routes: [pathA], durationMs: 3200, arrivalLabel: 'P1 接收' }
  ] },
  'L3-S2': { caption: 'Split：P1／P2 是不同封包 · 概念', packets: [
    { id: 'p1', label: 'P1', routes: [pathA], durationMs: 3200, arrivalLabel: 'P1 接收' },
    { id: 'p2', label: 'P2', routes: [pathB], durationMs: 3600, delayMs: 500, arrivalLabel: 'P2 接收' }
  ] },
  'L3-S3': { caption: 'Duplication：同一 P1 的兩份 copy · 先後輪流示範，非路徑效能', alternateArrival: true, packets: [
    { id: 'copy-a', label: 'P1 A', routes: [pathA], durationMs: 3000, duplicateGroup: 'P1', acceptedLabel: 'P1 接收', eliminatedLabel: '重複捨棄' },
    { id: 'copy-b', label: 'P1 B', routes: [pathB], durationMs: 4200, duplicateGroup: 'P1', acceptedLabel: 'P1 接收', eliminatedLabel: '重複捨棄' }
  ] },
  'L4-S3': { caption: '一般路徑 · PROPOSED／保護未知', packets: [
    { id: 'plain', label: '資料', routes: [['security-plain']], durationMs: 3000 }
  ] },
  'L4-S4': { caption: 'Tailcat overlay · PROPOSED，保護效果未驗證', packets: [
    { id: 'overlay', label: '提案', routes: [['security-tailcat']], durationMs: 4200 }
  ] }
};
