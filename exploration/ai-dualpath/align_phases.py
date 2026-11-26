#!/usr/bin/env python3
"""Split dual-path sender runs by the netem phase each packet met, and compare policies per phase.

  python3 align_phases.py --events netem-events.jsonl run-*.jsonl
  python3 align_phases.py --events netem-events.jsonl run-*.jsonl --csv phases.csv --plot phases.png

Inputs are the event log of netem_schedule.py and the --json output of adaptive_send.py (or
dualpath_demo.py send --json --stream), both written on the host that runs the sender and the
netem qdisc, so their "utc" values come from one clock. A packet belongs to the phase in force when
its first copy was sent (the "utc" of its first tx event). Packets sent before the schedule started
or after it ended are counted under "outside".

Per run and phase it reports packets, the share delivered within the run's deadline, the share
delivered at all, copies per packet, path A copy loss and the p95 of the first-arriving RTT.
The per-policy table gives the mean and the min-max over runs.

Path A degradation produced this way is INJECTED_IP; path B with --leo-b is SIMULATED.
"""
import argparse, bisect, csv, json, sys

OUTSIDE = "outside"
ORDER = ("only_a", "only_b", "split_2_3", "dup", "threshold+guard", "linucb", "linucb+guard")


def read_jsonl(path):
    out = []
    with open(path, encoding="utf-8") as f:
        for n, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except ValueError:
                continue                     # e.g. a stray stderr line captured with the output
            if isinstance(obj, dict):
                out.append(obj)
    return out


def load_schedule(events):
    """Return (phase start utcs, phase labels, end utc or None, label order, schedule sha256)."""
    starts, labels, order, end, sha = [], [], [], None, None
    for e in events:
        kind = e.get("event")
        if kind == "schedule_start":
            sha = e.get("sha256")
        elif kind == "phase":
            starts.append(float(e["utc"]))
            labels.append(e["label"])
            if e["label"] not in order:
                order.append(e["label"])
        elif kind == "schedule_end":
            end = float(e["utc"])
    if not starts:
        raise ValueError("事件紀錄裡沒有 phase 事件")
    if starts != sorted(starts):
        raise ValueError("phase 事件的 utc 沒有依序遞增")
    return starts, labels, end, order, sha


def phase_at(sched, t):
    starts, labels, end, _, _ = sched
    if t < starts[0] or (end is not None and t >= end):
        return OUTSIDE
    return labels[bisect.bisect_right(starts, t) - 1]


def p95(values):
    if not values:
        return None
    v = sorted(values)
    return v[min(len(v) - 1, int(round(0.95 * (len(v) - 1))))]


def analyse_run(path, sched):
    """Return (policy, deadline, rows) where rows maps phase -> metrics for one sender run."""
    events = read_jsonl(path)
    start = next((e for e in events if e.get("event") == "send_start"), None)
    summary = next((e for e in reversed(events) if e.get("event") == "summary"), None)
    if start is None or summary is None:
        raise ValueError("%s：缺少 send_start 或 summary" % path)
    policy = start.get("policy") or start.get("mode")
    deadline = start.get("deadline_ms")
    first_tx, copies, a_sent = {}, {}, {}
    for e in events:
        if e.get("event") != "tx":
            continue
        if "utc" not in e:
            raise ValueError("%s：tx 事件沒有 utc，需用補上 utc 之後的傳送端" % path)
        pid = e["id"]
        first_tx[pid] = min(first_tx.get(pid, e["utc"]), e["utc"])
        copies[pid] = copies.get(pid, 0) + 1
        if e["path"] == "A":
            a_sent[pid] = True
    rtt = {}
    for tag, pairs in summary.get("per_packet", {}).items():
        for pid, ms in pairs:
            if pid not in rtt or ms < rtt[pid][0]:
                rtt[pid] = (ms, tag)
    a_echoed = {pid for pid, _ in summary.get("per_packet", {}).get("A", [])}
    acc = {}
    for pid, t in first_tx.items():
        r = acc.setdefault(phase_at(sched, t), {"packets": 0, "within": 0, "delivered": 0, "copies": 0,
                                                "a_sent": 0, "a_echoed": 0, "first_rtt": []})
        r["packets"] += 1
        r["copies"] += copies[pid]
        if pid in a_sent:
            r["a_sent"] += 1
            r["a_echoed"] += pid in a_echoed
        if pid in rtt:
            ms = rtt[pid][0]
            r["delivered"] += 1
            r["first_rtt"].append(ms)
            if deadline is not None and ms <= deadline:
                r["within"] += 1
    rows = {}
    for phase, r in acc.items():
        n = r["packets"]
        rows[phase] = {
            "packets": n,
            "within_pct": round(100.0 * r["within"] / n, 3) if deadline is not None else None,
            "delivered_pct": round(100.0 * r["delivered"] / n, 3),
            "copies_per_packet": round(r["copies"] / n, 3),
            "a_copies": r["a_sent"],
            "a_loss_pct": round(100.0 * (1 - r["a_echoed"] / r["a_sent"]), 3) if r["a_sent"] else None,
            "p95_first_rtt_ms": None if not r["first_rtt"] else round(p95(r["first_rtt"]), 3),
        }
    return policy, deadline, rows


def aggregate(results, phases):
    """results: [(name, policy, deadline, rows)] -> {(policy, phase): {mean, min, max, copies, runs}}."""
    out = {}
    for _, policy, _, rows in results:
        for phase in phases:
            if phase in rows and rows[phase]["within_pct"] is not None:
                out.setdefault((policy, phase), []).append(rows[phase])
    agg = {}
    for key, rs in out.items():
        w = [r["within_pct"] for r in rs]
        agg[key] = {"runs": len(rs), "mean": round(sum(w) / len(w), 3), "min": min(w), "max": max(w),
                    "copies": round(sum(r["copies_per_packet"] for r in rs) / len(rs), 3),
                    "packets": sum(r["packets"] for r in rs)}
    return agg


def table(agg, policies, phases):
    head = "| 策略 | " + " | ".join("%s：期限內 %%（最小–最大）· 副本" % p for p in phases) + " |"
    lines = [head, "| --- |" + " --- |" * len(phases)]
    for pol in policies:
        cells = []
        for ph in phases:
            a = agg.get((pol, ph))
            cells.append("—" if a is None else "%.2f（%.2f–%.2f）· %.2f" % (a["mean"], a["min"], a["max"], a["copies"]))
        lines.append("| %s | %s |" % (pol, " | ".join(cells)))
    return "\n".join(lines)


def plot(agg, policies, phases, path):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    fig, ax = plt.subplots(figsize=(2.6 + 1.6 * len(phases), 4.2))
    width = 0.8 / max(1, len(policies))
    for i, pol in enumerate(policies):
        xs, ys, lo, hi = [], [], [], []
        for j, ph in enumerate(phases):
            a = agg.get((pol, ph))
            if a is None:
                continue
            xs.append(j + (i - (len(policies) - 1) / 2) * width)
            ys.append(a["mean"])
            lo.append(a["mean"] - a["min"])
            hi.append(a["max"] - a["mean"])
        ax.bar(xs, ys, width, yerr=[lo, hi], capsize=2, label=pol)
    ax.set_xticks(range(len(phases)))
    ax.set_xticklabels(phases)
    ax.set_ylabel("within deadline (%)")
    ax.set_ylim(0, 100)
    ax.legend(fontsize=8, loc="upper left", bbox_to_anchor=(1.01, 1), frameon=False)
    ax.set_title("Per-phase delivery within deadline (path A: INJECTED_IP, path B: SIMULATED)", fontsize=9)
    fig.tight_layout()
    fig.savefig(path, dpi=200)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("runs", nargs="+", help="傳送端 --json 輸出（一個執行一個檔）")
    ap.add_argument("--events", required=True, help="netem_schedule.py 的事件紀錄")
    ap.add_argument("--csv", help="逐執行、逐階段的結果")
    ap.add_argument("--plot", help="各策略逐階段的期限內送達比例（PNG，需要 matplotlib）")
    a = ap.parse_args(argv)
    try:
        sched = load_schedule(read_jsonl(a.events))
        results = []
        for path in a.runs:
            policy, deadline, rows = analyse_run(path, sched)
            results.append((path, policy, deadline, rows))
    except (OSError, ValueError, KeyError) as e:
        sys.stderr.write("%s\n" % e)
        return 2
    phases = list(sched[3])
    if any(OUTSIDE in r[3] for r in results):
        phases.append(OUTSIDE)
    policies = []
    for _, pol, _, _ in results:
        if pol not in policies:
            policies.append(pol)
    policies.sort(key=lambda x: (ORDER.index(x) if x in ORDER else len(ORDER), x))   # page order, others last
    print("# path A: INJECTED_IP（netem 排程 sha256 %s）；path B 若用 --leo-b 為 SIMULATED" % (sched[4] or "unknown"))
    print("# 期限：%s ms" % ", ".join(sorted({str(d) for _, _, d, _ in results})))
    agg = aggregate(results, phases)
    print(table(agg, policies, phases))
    if a.csv:
        with open(a.csv, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["run", "policy", "deadline_ms", "phase", "packets", "within_pct", "delivered_pct",
                        "copies_per_packet", "a_copies", "a_loss_pct", "p95_first_rtt_ms"])
            for path, pol, dl, rows in results:
                for ph in phases:
                    if ph in rows:
                        r = rows[ph]
                        w.writerow([path, pol, dl, ph, r["packets"], r["within_pct"], r["delivered_pct"],
                                    r["copies_per_packet"], r["a_copies"], r["a_loss_pct"], r["p95_first_rtt_ms"]])
    if a.plot:
        plot(agg, policies, [p for p in phases if p != OUTSIDE], a.plot)
    return 0


if __name__ == "__main__":
    sys.exit(main())
