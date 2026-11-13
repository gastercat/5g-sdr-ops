"""Tests for the offline dual-path environment and policies. No network, no lab host.

Run with both interpreters, so nothing depends on assert statements:
    python3 test_ai_dualpath.py && python3 -O test_ai_dualpath.py
"""
import json
import os
import random
import tempfile
import unittest

import policies as P
from leo_profile import LeoProfile
from trace_env import MEASURED_A, PathA, load_trace, make_episode, simulate


def episode(a, b, interval_s=0.02):
    return {"t": [i * interval_s for i in range(len(a))], "A": a, "B": b, "interval_s": interval_s}


class Leo(unittest.TestCase):
    def test_same_seed_same_link(self):
        x, y = LeoProfile(seed=3), LeoProfile(seed=3)
        self.assertEqual([x.state(t * 0.7) for t in range(60)], [y.state(t * 0.7) for t in range(60)])
        self.assertNotEqual(x.state(1.0)["base_ms"], LeoProfile(seed=4).state(1.0)["base_ms"])

    def test_outage_only_after_a_slot_change(self):
        p = LeoProfile(seed=1, slot_s=15.0, outage_ms=150.0, loss_pct=0.0, burst_loss_pct=0.0)
        rng = random.Random(0)
        self.assertIsNotNone(p.sample(0.05, rng))   # start of the run is not a handover
        self.assertIsNone(p.sample(15.05, rng))
        self.assertIsNotNone(p.sample(15.2, rng))

    def test_base_rtt_stays_in_range(self):
        p = LeoProfile(seed=2, rtt_lo_ms=20.0, rtt_hi_ms=45.0)
        for t in range(0, 300):
            self.assertTrue(20.0 <= p.state(t * 0.5)["base_ms"] <= 45.0)

    def test_bad_arguments_raise(self):
        with self.assertRaises(ValueError):
            LeoProfile(slot_s=0)
        with self.assertRaises(ValueError):
            LeoProfile(rtt_lo_ms=50, rtt_hi_ms=40)


class PathAModel(unittest.TestCase):
    def test_model_matches_published_summary(self):
        v = sorted(PathA().series(20000, 0.02, random.Random(0)))
        self.assertTrue(MEASURED_A["min_ms"] <= v[0] and v[-1] <= MEASURED_A["max_ms"])
        self.assertAlmostEqual(v[len(v) // 2], MEASURED_A["p50_ms"], delta=0.5)
        self.assertAlmostEqual(v[int(0.95 * len(v))], MEASURED_A["p95_ms"], delta=0.7)

    def test_bad_periods_take_about_the_requested_share(self):
        v = PathA(bad_frac=0.2, bad_scale=10.0, bad_loss_pct=0.0).series(100000, 0.02, random.Random(1))
        share = sum(1 for r in v if r > MEASURED_A["max_ms"]) / len(v)
        self.assertTrue(0.15 < share < 0.25, share)

    def test_replay_and_load_trace(self):
        doc = {"event": "summary", "paths": {"A": {"sent_ids": [0, 1, 2, 3]}},
               "per_packet": {"A": [[0, 10.0], [1, 11.5], [3, 12.0]]}}
        with tempfile.TemporaryDirectory() as d:
            f = os.path.join(d, "run.jsonl")
            with open(f, "w", encoding="utf-8") as h:
                h.write('{"event": "send_start"}\nnot json\n' + json.dumps(doc) + "\n")
            trace = load_trace(f)
            self.assertEqual(trace, [10.0, 11.5, None, 12.0])
            with open(f, "w", encoding="utf-8") as h:
                h.write('{"event": "summary", "paths": {}}\n')
            with self.assertRaises(ValueError):
                load_trace(f)
        self.assertEqual(PathA(trace=trace).series(6, 0.02, random.Random(0)), [10.0, 11.5, None, 12.0, 10.0, 11.5])
        with self.assertRaises(ValueError):
            PathA(trace=[])


class Simulation(unittest.TestCase):
    def test_fixed_policies_and_bounds(self):
        ep = make_episode(3000, 0.02, 7, PathA(bad_frac=0.2))
        m = {p.name: simulate(p, ep, 30.0) for p in (P.OnlyA(30.0), P.OnlyB(30.0), P.Dup(30.0), P.Oracle(30.0))}
        self.assertEqual(m["only_a"]["copies"], 1.0)
        self.assertEqual(m["dup"]["copies"], 2.0)
        self.assertEqual(m["oracle"]["copies"], 1.0)
        self.assertGreaterEqual(m["dup"]["hit_pct"], max(m["only_a"]["hit_pct"], m["only_b"]["hit_pct"]))
        self.assertEqual(m["oracle"]["hit_pct"], m["dup"]["hit_pct"])

    def test_split_matches_probe_pattern(self):
        m = simulate(P.Split(30.0), episode([10.0] * 10, [10.0] * 10), 30.0)
        self.assertEqual(m["actions"], ["A", "A", "B", "B", "B"] * 2)

    def test_outcome_is_not_seen_before_the_echo_arrives(self):
        seen = []

        class Spy(P.OnlyA):
            def act(self, t, i):
                seen.append(("act", i, t))
                return "A"

            def observe(self, i, path, rtt, now):
                seen.append(("obs", i, now))

        simulate(Spy(30.0), episode([50.0, None, 5.0, 5.0], [None] * 4, interval_s=0.02), 30.0, timeout_ms=100.0)
        when = {i: now for kind, i, now in seen if kind == "obs"}
        self.assertAlmostEqual(when[0], 0.05)          # sent at 0, echo after 50 ms
        self.assertAlmostEqual(when[1], 0.02 + 0.1)    # lost: known only at the timeout
        order = [(kind, i) for kind, i, _ in seen]
        self.assertLess(order.index(("act", 2)), order.index(("obs", 0)))

    def test_copies_slower_than_the_timeout_count_as_lost(self):
        m = simulate(P.OnlyA(30.0), episode([500.0, 10.0], [None, None]), 30.0, timeout_ms=200.0)
        self.assertEqual(m["delivered_pct"], 50.0)


class Learning(unittest.TestCase):
    def test_linucb_moves_to_the_path_that_works(self):
        ep = episode([None] * 600, [10.0] * 600)
        m = simulate(P.LinUCB(30.0), ep, 30.0)
        self.assertGreater(sum(1 for a in m["actions"][300:] if a == "B"), 280)

    def test_guard_duplicates_on_a_dead_path_and_reports_it(self):
        ep = episode([None] * 100, [10.0] * 100)
        g = P.Guarded(P.OnlyA(30.0), dead_streak=3, probe_s=1e9)
        m = simulate(g, ep, 30.0, timeout_ms=40.0)
        self.assertEqual(m["actions"][0], "AB")        # nothing known about B yet: probe
        self.assertIn("A", m["actions"][1:4])          # A alone until three misses are known
        self.assertTrue(all(a == "AB" for a in m["actions"][10:]))
        self.assertGreater(m["vetoes"]["dead"], 80)
        self.assertGreater(m["hit_pct"], 90.0)

    def test_guard_probes_an_idle_path(self):
        g = P.Guarded(P.OnlyA(30.0), probe_s=0.5)
        m = simulate(g, episode([10.0] * 200, [10.0] * 200), 30.0)
        probes = m["actions"].count("AB")
        self.assertTrue(4 <= probes <= 12, probes)     # about one per 0.5 s over 4 s
        self.assertEqual(m["vetoes"]["probe"], probes)

    def test_guard_never_removes_a_copy(self):
        m = simulate(P.Guarded(P.Dup(30.0)), episode([10.0] * 50, [10.0] * 50), 30.0)
        self.assertEqual(m["copies"], 2.0)


if __name__ == "__main__":
    unittest.main(verbosity=1)
