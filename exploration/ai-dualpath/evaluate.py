#!/usr/bin/env python3
"""Compare dual-path policies offline, on identical episodes.

  python3 evaluate.py                       both built-in scenarios, 5 seeds
  python3 evaluate.py --trace-a run.jsonl   replay a recorded path A instead of the model
  python3 evaluate.py --out DIR             also write results.csv and tradeoff.png

Everything printed here is SIMULATED_PROOF_OF_CONCEPT: path B is always emulated,
and path A is a model unless --trace-a is given. See README.md.
"""
import argparse, csv, math, os, statistics, sys

import policies as P
from leo_profile import LeoProfile
from trace_env import PathA, load_trace, make_episode, simulate

SCENARIOS = {
    "stable_a": {"note": "path A as measured on 2026-11-12 (model), path B emulated LEO", "a": {}},
    "degraded_a": {"note": "path A with simulated bad periods (20% of the time), path B emulated LEO",
                   "a": {"bad_frac": 0.2}},
}


def build(deadline, cost):
    return [P.make(name, deadline, cost) for name in P.NAMES] + [P.Oracle(deadline)]


def run(a):
    trace = load_trace(a.trace_a) if a.trace_a else None
    rows = []
    for name in a.scenario or list(SCENARIOS):
        for seed in range(a.seeds):
            ep = make_episode(a.count, a.interval, seed, PathA(trace=trace, **SCENARIOS[name]["a"]), LeoProfile(seed=seed))
            for pol in build(a.deadline, a.cost):
                m = simulate(pol, ep, a.deadline, a.timeout)
                rows.append({"scenario": name, "seed": seed, "policy": m["policy"], "hit_pct": m["hit_pct"],
                             "delivered_pct": m["delivered_pct"], "copies": m["copies"], "p95_ms": m["p95_ms"],
                             "p99_ms": m["p99_ms"], "veto_dead": m["vetoes"].get("dead", 0),
                             "veto_probe": m["vetoes"].get("probe", 0)})
    return rows


def summarise(rows):
    out, order = {}, []
    for r in rows:
        k = (r["scenario"], r["policy"])
        if k not in out:
            out[k] = []
            order.append(k)
        out[k].append(r)
    table = []
    for k in order:
        g = out[k]
        mean = lambda f: statistics.mean(r[f] for r in g)
        sd = statistics.pstdev(r["hit_pct"] for r in g)
        table.append({"scenario": k[0], "policy": k[1], "hit_pct": mean("hit_pct"), "hit_sd": sd,
                      "delivered_pct": mean("delivered_pct"), "copies": mean("copies"),
                      "p95_ms": statistics.mean(r["p95_ms"] for r in g if r["p95_ms"] is not None) if any(
                          r["p95_ms"] is not None for r in g) else None})
    return table


def plot(table, path, deadline):
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        print("matplotlib not installed; skipping %s" % path, file=sys.stderr)
        return
    names = sorted({r["scenario"] for r in table}, key=list(SCENARIOS).index)
    fig, axes = plt.subplots(1, len(names), figsize=(6 * len(names), 4.5), squeeze=False)
    for ax, name in zip(axes[0], names):
        for r in (r for r in table if r["scenario"] == name):
            ax.errorbar(r["copies"], r["hit_pct"], yerr=r["hit_sd"], fmt="o", capsize=3)
            ax.annotate(r["policy"], (r["copies"], r["hit_pct"]), textcoords="offset points", xytext=(6, 4), fontsize=8)
        ax.set_title("%s (SIMULATED)" % name)
        ax.set_xlabel("copies sent per packet")
        ax.set_ylabel("echoed within %g ms (%%)" % deadline)
        ax.grid(alpha=0.3)
    fig.tight_layout()
    fig.savefig(path, dpi=150)


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--scenario", action="append", choices=list(SCENARIOS))
    p.add_argument("--seeds", type=int, default=5)
    p.add_argument("--count", type=int, default=6000, help="packets per episode")
    p.add_argument("--interval", type=float, default=0.02, help="seconds between packets")
    p.add_argument("--deadline", type=float, default=30.0, help="round-trip deadline, ms")
    p.add_argument("--timeout", type=float, default=200.0, help="ms after which a copy counts as lost")
    p.add_argument("--cost", type=float, default=0.1, help="LinUCB penalty for sending a second copy")
    p.add_argument("--trace-a", help="dualpath_demo.py send --json output to replay as path A")
    p.add_argument("--out", help="directory for results.csv and tradeoff.png")
    a = p.parse_args(argv)
    # Checked first: every comparison with NaN is False, so the range check below would let it through.
    if not all(math.isfinite(v) for v in (a.interval, a.deadline, a.timeout, a.cost)):
        p.error("--interval, --deadline, --timeout and --cost must be finite numbers")
    if a.seeds < 1 or a.count < 1 or a.interval <= 0 or a.deadline <= 0 or a.timeout < a.deadline:
        p.error("need seeds >= 1, count >= 1, interval > 0, deadline > 0 and timeout >= deadline")
    rows = run(a)
    table = summarise(rows)
    print("SIMULATED_PROOF_OF_CONCEPT | path A: %s | path B: emulated LEO | deadline %g ms | %d seeds x %d packets" % (
        "replay of " + os.path.basename(a.trace_a) if a.trace_a else "model from 2026-11-12 summary",
        a.deadline, a.seeds, a.count))
    last = None
    for r in table:
        if r["scenario"] != last:
            last = r["scenario"]
            print("\n### %s: %s\n" % (last, SCENARIOS[last]["note"]))
            print("| policy | within deadline % (sd) | delivered % | copies/packet | p95 ms |")
            print("| --- | --- | --- | --- | --- |")
        print("| %s | %.2f (%.2f) | %.2f | %.2f | %s |" % (
            r["policy"], r["hit_pct"], r["hit_sd"], r["delivered_pct"], r["copies"],
            "-" if r["p95_ms"] is None else "%.1f" % r["p95_ms"]))
    if a.out:
        os.makedirs(a.out, exist_ok=True)
        with open(os.path.join(a.out, "results.csv"), "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0]))
            w.writeheader()
            w.writerows(rows)
        plot(table, os.path.join(a.out, "tradeoff.png"), a.deadline)


if __name__ == "__main__":
    main()
