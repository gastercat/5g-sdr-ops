#!/usr/bin/env python3
"""Offline environment for comparing dual-path policies on identical conditions.

An episode fixes, for every packet, what would happen on path A and on path B
(round-trip ms, or None if lost). Every policy is run against the same episode,
so differences come from the policy, not from luck.

A policy only learns the outcome of the copies it actually sent, and only when the
echo would have arrived (send time + RTT), or after timeout_ms if it never does.

Path A is one of:
  replay   per-packet RTTs recorded by `dualpath_demo.py send --json` (measured)
  model    samples drawn from the published 2026-11-12 OTA baseline summary
           (min / p50 / p95 / max). Independent draws: the real link has a
           scheduling pattern this does not reproduce. MODEL, not measurement.
Optional degradation episodes on path A are always SIMULATED.

Path B is leo_profile.LeoProfile, always SIMULATED.

Stdlib only.
"""
import heapq, json, random

from leo_profile import LeoProfile

# 2026-11-12 OTA baseline, 1000 packets, round-trip ms. Source:
# docs/evidence/task-evidence/2026-11-12-lab03-b210-ota-baseline-split-dup.yaml
MEASURED_A = {"min_ms": 9.09, "p50_ms": 18.03, "p95_ms": 26.23, "max_ms": 37.88}


class PathA:
    def __init__(self, q=MEASURED_A, trace=None, bad_frac=0.0, bad_len_s=3.0, bad_scale=2.5, bad_loss_pct=10.0):
        if not 0.0 <= bad_frac < 1.0:
            raise ValueError("bad_frac must be in [0, 1)")
        if trace is not None and not trace:
            raise ValueError("trace is empty")
        self.knots = [(0.0, q["min_ms"]), (0.5, q["p50_ms"]), (0.95, q["p95_ms"]), (1.0, q["max_ms"])]
        self.trace = trace
        self.bad_frac, self.bad_len_s, self.bad_scale, self.bad_loss_pct = bad_frac, bad_len_s, bad_scale, bad_loss_pct

    def _draw(self, i, rng):
        if self.trace is not None:
            return self.trace[i % len(self.trace)]
        u = rng.random()
        for (u0, v0), (u1, v1) in zip(self.knots, self.knots[1:]):
            if u <= u1:
                return v0 + (v1 - v0) * (u - u0) / (u1 - u0)
        return self.knots[-1][1]

    def series(self, n, interval_s, rng):
        """n outcomes; the degraded state is a two-state Markov chain over time."""
        out, bad = [], False
        p_end = interval_s / self.bad_len_s
        p_start = p_end * self.bad_frac / (1.0 - self.bad_frac) if self.bad_frac else 0.0
        for i in range(n):
            bad = (rng.random() >= p_end) if bad else (rng.random() < p_start)
            r = self._draw(i, rng)
            if bad and r is not None:
                r = None if rng.random() * 100.0 < self.bad_loss_pct else r * self.bad_scale
            out.append(r)
        return out


def load_trace(path, tag="A"):
    """Per-packet RTTs of one path from `dualpath_demo.py send --json` output; lost IDs become None."""
    with open(path, encoding="utf-8") as f:
        for line in f:
            try:
                o = json.loads(line)
            except ValueError:
                continue
            if isinstance(o, dict) and o.get("event") == "summary" and tag in o.get("per_packet", {}):
                got = {int(i): float(r) for i, r in o["per_packet"][tag]}
                return [got.get(i) for i in o["paths"][tag]["sent_ids"]]
    raise ValueError("no summary with per_packet[%s] in %s (was it recorded with --json?)" % (tag, path))


def make_episode(n, interval_s, seed, path_a=None, path_b=None):
    rng = random.Random(seed)
    path_a = path_a or PathA()
    path_b = path_b or LeoProfile(seed=seed)
    a = path_a.series(n, interval_s, rng)
    t = [i * interval_s for i in range(n)]
    return {"t": t, "A": a, "B": [path_b.sample(x, rng) for x in t], "interval_s": interval_s}


def simulate(policy, ep, deadline_ms, timeout_ms=200.0):
    """Run one policy over one episode and return its metrics."""
    due, seq = [], 0  # (time the outcome is known, tie-break, packet, path, rtt or None)
    actions, best = [], []
    for i, t in enumerate(ep["t"]):
        while due and due[0][0] <= t:
            when, _, j, p, r = heapq.heappop(due)
            policy.observe(j, p, r, when)
        policy.peek = (ep["A"][i], ep["B"][i])  # read by the oracle only
        act = policy.act(t, i)
        got = []
        for p in act:
            r = ep[p][i]
            if r is not None and r > timeout_ms:
                r = None
            heapq.heappush(due, (t + (timeout_ms if r is None else r) / 1000.0, seq, i, p, r))
            seq += 1
            if r is not None:
                got.append(r)
        actions.append(act)
        best.append(min(got) if got else None)
    while due:
        when, _, j, p, r = heapq.heappop(due)
        policy.observe(j, p, r, when)
    n = len(actions)
    ok = sorted(r for r in best if r is not None)
    pct = lambda q: ok[min(len(ok) - 1, int(round(q * (len(ok) - 1))))] if ok else None
    return {"policy": policy.name, "n": n,
            "hit_pct": 100.0 * sum(1 for r in best if r is not None and r <= deadline_ms) / n,
            "delivered_pct": 100.0 * len(ok) / n,
            "copies": sum(len(a) for a in actions) / n,
            "p95_ms": pct(0.95), "p99_ms": pct(0.99),
            "vetoes": dict(getattr(policy, "vetoes", {})), "actions": actions, "best": best}
