"""Tests for align_phases.py on synthetic event logs. No network, no root.

    python3 -B test_align_phases.py && python3 -B -O test_align_phases.py
"""
import io
import json
import os
import tempfile
import unittest
from contextlib import redirect_stdout, redirect_stderr

import align_phases as A

T0 = 1795000000.0


def write(path, objs, junk=False):
    with open(path, "w", encoding="utf-8") as f:
        if junk:
            f.write("ssh: warning, not json\n")
        for o in objs:
            f.write(json.dumps(o) + "\n")


def netem_events(end=True):
    ev = [{"event": "schedule_start", "utc": T0, "sha256": "abc"},
          {"event": "phase", "utc": T0, "label": "normal"},
          {"event": "phase", "utc": T0 + 10, "label": "severe"},
          {"event": "phase", "utc": T0 + 12, "label": "normal"}]
    if end:
        ev.append({"event": "schedule_end", "utc": T0 + 20})
    return ev


def run_events(policy, sends, per_packet, deadline=30.0):
    """sends: [(id, path, utc)]; per_packet: {"A": [[id, rtt]], "B": [...]}."""
    ev = [{"event": "send_start", "policy": policy, "deadline_ms": deadline, "utc": T0 - 1}]
    ev += [{"event": "tx", "id": i, "path": p, "utc": t} for i, p, t in sends]
    ev.append({"event": "summary", "per_packet": per_packet})
    return ev


class AlignTest(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.events = os.path.join(self.dir.name, "events.jsonl")
        write(self.events, netem_events())

    def tearDown(self):
        self.dir.cleanup()

    def path(self, name):
        return os.path.join(self.dir.name, name)

    def test_phase_boundaries(self):
        sched = A.load_schedule(A.read_jsonl(self.events))
        self.assertEqual(A.phase_at(sched, T0 - 0.001), A.OUTSIDE)
        self.assertEqual(A.phase_at(sched, T0), "normal")
        self.assertEqual(A.phase_at(sched, T0 + 9.999), "normal")
        self.assertEqual(A.phase_at(sched, T0 + 10), "severe")
        self.assertEqual(A.phase_at(sched, T0 + 12), "normal")
        self.assertEqual(A.phase_at(sched, T0 + 20), A.OUTSIDE)
        self.assertEqual(sched[3], ["normal", "severe"])

    def test_open_schedule_has_no_end(self):
        write(self.events, netem_events(end=False))
        sched = A.load_schedule(A.read_jsonl(self.events))
        self.assertEqual(A.phase_at(sched, T0 + 1000), "normal")

    def test_metrics_per_phase(self):
        run = self.path("dup.jsonl")
        # ids 0,1 in normal (both copies), id 2 in severe: A lost, B late; id 3 in severe: A lost, B in time.
        sends = [(0, "A", T0 + 1), (0, "B", T0 + 1.0001), (1, "A", T0 + 2), (1, "B", T0 + 2.0001),
                 (2, "A", T0 + 10.5), (2, "B", T0 + 10.5001), (3, "A", T0 + 11), (3, "B", T0 + 11.0001)]
        per = {"A": [[0, 15.0], [1, 16.0]], "B": [[0, 25.0], [1, 24.0], [2, 45.0], [3, 28.0]]}
        write(run, run_events("dup", sends, per), junk=True)
        policy, deadline, rows = A.analyse_run(run, A.load_schedule(A.read_jsonl(self.events)))
        self.assertEqual((policy, deadline), ("dup", 30.0))
        n, s = rows["normal"], rows["severe"]
        self.assertEqual((n["packets"], n["within_pct"], n["copies_per_packet"], n["a_loss_pct"]), (2, 100.0, 2.0, 0.0))
        self.assertEqual(n["p95_first_rtt_ms"], 16.0)
        self.assertEqual((s["packets"], s["within_pct"], s["delivered_pct"], s["a_loss_pct"]), (2, 50.0, 100.0, 100.0))

    def test_phase_follows_first_copy(self):
        run = self.path("late-second-copy.jsonl")
        write(run, run_events("dup", [(0, "A", T0 + 9.99), (0, "B", T0 + 10.01)], {"A": [[0, 10.0]]}))
        _, _, rows = A.analyse_run(run, A.load_schedule(A.read_jsonl(self.events)))
        self.assertEqual(list(rows), ["normal"])

    def test_tx_without_utc_is_refused(self):
        run = self.path("old.jsonl")
        write(run, [{"event": "send_start", "policy": "only_a", "deadline_ms": 30},
                    {"event": "tx", "id": 0, "path": "A"}, {"event": "summary", "per_packet": {}}])
        with self.assertRaises(ValueError):
            A.analyse_run(run, A.load_schedule(A.read_jsonl(self.events)))

    def test_main_aggregates_rounds_and_writes_csv(self):
        runs = []
        for rnd, rtt in enumerate((20.0, 40.0)):
            run = self.path("r%d.jsonl" % rnd)
            write(run, run_events("only_a", [(0, "A", T0 + 1), (1, "A", T0 + 11), (2, "A", T0 + 25)],
                                  {"A": [[0, 15.0], [1, rtt], [2, 15.0]]}))
            runs.append(run)
        out_csv = self.path("out.csv")
        buf = io.StringIO()
        with redirect_stdout(buf):
            self.assertEqual(A.main(["--events", self.events, "--csv", out_csv] + runs), 0)
        text = buf.getvalue()
        self.assertIn("INJECTED_IP", text)
        self.assertIn("| only_a | 100.00（100.00–100.00）· 1.00 | 50.00（0.00–100.00）· 1.00 | 100.00（100.00–100.00）· 1.00 |", text)
        with open(out_csv, encoding="utf-8") as f:
            self.assertEqual(len(f.read().strip().splitlines()), 1 + 2 * 3)

    def test_bad_input_returns_2(self):
        empty = self.path("empty.jsonl")
        write(empty, [])
        err = io.StringIO()
        with redirect_stderr(err), redirect_stdout(io.StringIO()):
            self.assertEqual(A.main(["--events", empty, empty]), 2)
        self.assertTrue(err.getvalue())


if __name__ == "__main__":
    unittest.main()
