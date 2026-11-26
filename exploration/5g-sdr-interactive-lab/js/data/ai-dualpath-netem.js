// Path A degradation injection on 2026-11-26 (INJECTED_IP): tc netem on Linux2's tun_srsue, switched by
// exploration/ai-dualpath/netem_schedule.py. Copied from the evidence directory
// 2026-11-26-AI-Dualpath-netem/ (outside the repo) and the Task Evidence Record
// docs/evidence/task-evidence/2026-11-26-ai-dualpath-netem-schedule.yaml (NM-05, NM-06, NM-12, NM-13).
// These runs only show that the injection takes effect on schedule; no dual-path policy ran.

// One cycle of the schedule file used in both runs (quick.json, SHA-256 fd373794…), run for 2 cycles.
export const SCHEDULE = [
  { label: 'normal', name: '正常', seconds: 5, netem: 'loss 0%' },
  { label: 'mild', name: '輕度', seconds: 3, netem: 'loss 5% delay 15ms 10ms' },
  { label: 'severe', name: '重度', seconds: 2, netem: 'loss 40% delay 40ms 20ms' },
];

// Per run: phase events [t, label] and schedule_end t from the tool's event log (seconds on its
// monotonic clock); pingStart = estimated send time of icmp_seq 1 relative to the first phase event
// (median of reply_ts - rtt - (n-1)*0.2 over received replies, as in analysis/phase_loss.py);
// rtt = ping -D -i 0.2 -c 105 172.16.0.1 from tun_srsue, in icmp_seq order, null = no reply.
// baseline / fixed: the un-injected 50-ping check and the single-phase loss 20% run (loss-fixed.json),
// [sent, received, RTT p50 ms] plus the netem dropped counter read at the end of the fixed run.
export const RUNS = [
  {
    id: 'first', label: '第一次 · 舊版工具', time: '2026-11-26 09:14Z', tool: '421420b2', evidence: 'NM-05、NM-06',
    phases: [[0, 'normal'], [5.001, 'mild'], [8.001, 'severe'], [10.001, 'normal'], [15.001, 'mild'], [18.001, 'severe']],
    end: 20.004, pingStart: 0.038,
    baseline: [50, 50, 26.8], fixed: [100, 81, 29.8], dropped: 19,
    rtt: [34.8,33.9,32.8,31.9,30.8,30.0,28.8,27.9,26.8,25.8,24.9,23.8,23.0,21.8,20.8,20.0,18.8,18.0,36.8,35.8,35.9,34.8,34.0,33.8,32.7,33.0,51.7,50.9,29.9,28.9,48.8,27.9,46.9,45.7,null,43.8,42.8,41.8,40.8,40.0,39.8,58.8,57.9,null,67.9,null,39.8,null,null,43.9,22.8,22.0,20.7,19.8,18.9,17.8,36.9,35.8,34.9,33.9,32.8,32.0,31.8,30.8,29.9,28.8,28.0,26.8,25.7,24.9,23.8,22.9,21.8,20.9,19.8,58.8,37.9,36.8,55.8,34.9,33.8,52.9,51.9,31.1,50.7,49.9,48.8,27.8,46.9,45.8,null,null,67.9,null,79.8,null,null,83.8,63.0,null,35.7,34.9,33.7,33.0,31.8],
  },
  {
    id: 'second', label: '第二次 · 新版工具', time: '2026-11-26 10:21Z', tool: 'b1e17c8f', evidence: 'NM-12、NM-13',
    phases: [[0, 'normal'], [5.001, 'mild'], [8.002, 'severe'], [10.002, 'normal'], [15.002, 'mild'], [18.002, 'severe']],
    end: 20.004, pingStart: 0.027,
    baseline: [50, 50, 27.9], fixed: [100, 76, 29.3], dropped: 24,
    rtt: [28.8,27.6,26.9,25.8,24.8,23.9,22.8,21.9,20.8,19.7,18.8,37.8,36.9,35.8,34.8,33.9,32.7,31.9,30.7,29.7,28.9,27.8,26.8,25.8,24.9,23.8,42.8,41.9,40.8,null,53.6,52.8,51.9,null,46.7,25.8,44.8,43.9,42.7,41.9,80.8,null,58.6,57.8,77.0,55.8,null,50.6,49.7,49.0,28.7,28.0,26.7,25.8,24.8,23.8,22.9,21.8,20.8,19.9,18.7,37.9,36.8,35.8,34.9,33.8,32.8,31.7,30.8,29.9,28.7,27.9,26.7,25.9,24.7,43.8,42.9,null,37.7,56.8,35.8,34.9,33.8,33.0,51.7,50.9,30.9,49.7,null,41.7,60.8,60.9,79.8,78.9,null,74.7,95.0,53.8,null,86.8,25.9,25.8,24.7,23.9,22.8],
  },
];
export const PING_INTERVAL_S = 0.2;
