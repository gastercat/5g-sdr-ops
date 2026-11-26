"""Tests for netem_schedule.py with a stand-in tc. No root, no interface is touched.

    python3 -B test_netem_schedule.py && python3 -B -O test_netem_schedule.py
"""
import io
import json
import os
import signal
import sys
import tempfile
import unittest

import netem_schedule as N

HERE = os.path.dirname(os.path.abspath(__file__))
EXAMPLE = os.path.join(HERE, "schedules", "example-cycle.json")

# Stand-in tc: appends its argv to FAKE_TC_LOG and keeps the root qdisc state in FAKE_TC_STATE.
# FAKE_TC_FAIL="<verb>:<n>" makes the n-th call of that verb fail (n=0: every call).
FAKE_TC = r'''
import json, os, sys
args = sys.argv[1:]
with open(os.environ["FAKE_TC_LOG"], "a") as f:
    f.write(json.dumps(args) + "\n")
state_file = os.environ["FAKE_TC_STATE"]
state = open(state_file).read().strip() if os.path.exists(state_file) else "none"
verb = args[1]
counts_file = state_file + ".counts"
counts = json.load(open(counts_file)) if os.path.exists(counts_file) else {}
counts[verb] = counts.get(verb, 0) + 1
json.dump(counts, open(counts_file, "w"))
fail = os.environ.get("FAKE_TC_FAIL", "")
if fail:
    fverb, n = fail.split(":")
    if fverb == verb and (int(n) == 0 or int(n) == counts[verb]):
        sys.stderr.write("RTNETLINK answers: Operation not permitted\n")
        sys.exit(2)
if state == "gone":
    sys.stderr.write('Cannot find device "%s"\n' % args[3])
    sys.exit(1)
if verb == "show":
    print("qdisc netem 8001: root refcnt 2 limit 1000 loss 5%" if state == "netem" else
          "qdisc noqueue 0: root refcnt 2")
elif verb == "add":
    if state == "netem":
        sys.stderr.write("Error: Exclusivity flag on, cannot modify.\n")
        sys.exit(2)
    open(state_file, "w").write("netem")
elif verb == "change":
    if state != "netem":
        sys.exit(2)
elif verb == "del":
    open(state_file, "w").write("none")
'''


class Clock:
    """Fake monotonic clock; every sleep overshoots by 10 ms, as a loaded host might."""

    def __init__(self, on_sleep=None):
        self.now, self.sleeps, self.on_sleep = 1000.0, 0, on_sleep

    def __call__(self):
        return self.now

    def sleep(self, d):
        self.sleeps += 1
        self.now += d + 0.01
        if self.on_sleep:
            self.on_sleep(self.sleeps)


class Fake(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.dir.cleanup)
        d = self.dir.name
        self.tc = os.path.join(d, "fake_tc.py")
        with open(self.tc, "w") as f:
            f.write(FAKE_TC)
        self.calls_file = os.path.join(d, "calls.jsonl")
        self.state_file = os.path.join(d, "state")
        self.env = {"FAKE_TC_LOG": self.calls_file, "FAKE_TC_STATE": self.state_file}
        old = {k: os.environ.get(k) for k in list(self.env) + ["FAKE_TC_FAIL"]}
        os.environ.update(self.env)
        os.environ.pop("FAKE_TC_FAIL", None)
        self.addCleanup(lambda: [os.environ.pop(k, None) if v is None else os.environ.__setitem__(k, v)
                                 for k, v in old.items()])

    def set_state(self, s):
        with open(self.state_file, "w") as f:
            f.write(s)

    def calls(self):
        if not os.path.exists(self.calls_file):
            return []
        with open(self.calls_file) as f:
            return [json.loads(line) for line in f]

    def mutating(self):
        return [c for c in self.calls() if c[1] != "show"]

    def run_main(self, *argv, clock=None, schedule=EXAMPLE):
        clock = clock or Clock()
        out, err = io.StringIO(), io.StringIO()
        code = N.main([schedule, "--dev", "tun_srsue", "--tc", self.tc] + list(argv),
                      tc_prefix=[sys.executable], clock=clock, sleep=clock.sleep,
                      wall=lambda: 1795000000.0 + clock.now, out=out, err=err)
        events = [json.loads(line) for line in out.getvalue().splitlines()]
        return code, events, err.getvalue()

    def write_schedule(self, doc):
        path = os.path.join(self.dir.name, "s.json")
        with open(path, "w") as f:
            f.write(json.dumps(doc) if not isinstance(doc, str) else doc)
        return path


class Validation(unittest.TestCase):
    def load(self, doc):
        return N.load_schedule(json.dumps(doc).encode())

    def base(self, **kw):
        doc = {"name": "s", "phases": [{"label": "a", "seconds": 1, "netem": "loss 1%"}]}
        doc.update(kw)
        return doc

    def test_example_loads(self):
        with open(EXAMPLE, "rb") as f:
            sched, sha = N.load_schedule(f.read())
        self.assertEqual([p["label"] for p in sched["phases"]], ["normal", "mild", "severe"])
        self.assertEqual(sched["cycle_s"], 60.0)
        self.assertEqual(len(sha), 64)

    def test_rejects_bad_seconds(self):
        for sec in (0, -1, "5", True, None, float("inf")):
            with self.subTest(sec=sec):
                with self.assertRaises(N.ScheduleError):
                    N.load_schedule(json.dumps(self.base(phases=[{"label": "a", "seconds": sec,
                                                                  "netem": "loss 1%"}])).encode())

    def test_rejects_duplicate_label(self):
        p = {"label": "a", "seconds": 1, "netem": "loss 1%"}
        with self.assertRaises(N.ScheduleError):
            self.load(self.base(phases=[p, dict(p)]))

    def test_rejects_tokens_outside_allow_list(self):
        for netem in ("loss 5%; reboot", "loss 5% && id", "loss $(id)", "loss 5% limit 1",
                      "--help", "5%", "", "loss -5%", "loss 5% `id`", "delay 10s"):
            with self.subTest(netem=netem):
                with self.assertRaises(N.ScheduleError):
                    self.load(self.base(phases=[{"label": "a", "seconds": 1, "netem": netem}]))

    def test_accepts_gemodel_and_rate(self):
        sched, _ = self.load(self.base(phases=[
            {"label": "ge", "seconds": 1, "netem": "loss gemodel 1% 10% 70% 0.1%"},
            {"label": "rate", "seconds": 1, "netem": "rate 512kbit delay 20ms"}]))
        self.assertEqual(sched["phases"][0]["tokens"], ["loss", "gemodel", "1%", "10%", "70%", "0.1%"])

    def test_rejects_cycle_over_limit(self):
        with self.assertRaises(N.ScheduleError):
            self.load(self.base(phases=[{"label": "a", "seconds": N.MAX_CYCLE_S + 1, "netem": "loss 1%"}]))

    def test_rejects_non_json_and_missing_fields(self):
        for raw in (b"{", b"[]", json.dumps({"phases": []}).encode(),
                    json.dumps({"name": "s", "phases": []}).encode(),
                    json.dumps(self.base(repeat="yes")).encode()):
            with self.subTest(raw=raw):
                with self.assertRaises(N.ScheduleError):
                    N.load_schedule(raw)

    def test_timeline_cycles_and_duration(self):
        with open(EXAMPLE, "rb") as f:
            sched, _ = N.load_schedule(f.read())
        steps, end = N.timeline(sched, cycles=2)
        self.assertEqual(end, 120.0)
        self.assertEqual([s[0] for s in steps], [0, 40, 55, 60, 100, 115])
        steps, end = N.timeline(sched, duration=50)
        self.assertEqual(([s[0] for s in steps], end), ([0, 40], 50.0))
        for kw in ({"cycles": 0}, {"duration": -1}, {"duration": float("nan")},
                   {"cycles": 1, "duration": 1}, {}, {"duration": N.MAX_RUN_S + 1}):
            with self.subTest(kw=kw):
                with self.assertRaises(N.ScheduleError):
                    N.timeline(sched, **kw)

    def test_no_repeat_limits_to_one_cycle(self):
        sched, _ = self.load(self.base(repeat=False))
        self.assertEqual(N.timeline(sched, cycles=1)[1], 1.0)
        with self.assertRaises(N.ScheduleError):
            N.timeline(sched, cycles=2)


class Run(Fake):
    def test_two_cycles_call_sequence(self):
        code, events, err = self.run_main("--cycles", "2")
        self.assertEqual(code, 0, err)
        verbs = [c[1] for c in self.mutating()]
        self.assertEqual(verbs, ["add"] + ["change"] * 5 + ["del"])
        self.assertEqual(self.mutating()[0], ["qdisc", "add", "dev", "tun_srsue", "root", "netem", "loss", "0%"])
        self.assertEqual(self.mutating()[1][-5:], ["loss", "5%", "delay", "15ms", "10ms"])
        self.assertEqual(self.mutating()[-1], ["qdisc", "del", "dev", "tun_srsue", "root"])
        kinds = [e["event"] for e in events]
        self.assertEqual(kinds, ["schedule_start"] + ["phase"] * 6 + ["schedule_end"])
        self.assertEqual(events[0]["schedule"], "example-cycle")
        self.assertEqual([(e["cycle"], e["label"]) for e in events if e["event"] == "phase"],
                         [(0, "normal"), (0, "mild"), (0, "severe"), (1, "normal"), (1, "mild"), (1, "severe")])
        self.assertEqual(events[-1]["reason"], "completed")
        self.assertTrue(events[-1]["removed"])

    def test_switch_times_do_not_accumulate_error(self):
        code, events, err = self.run_main("--cycles", "3")
        self.assertEqual(code, 0, err)
        phases = [e for e in events if e["event"] == "phase"]
        self.assertEqual(len(phases), 9)
        for e in phases:
            self.assertLess(e["t"] - e["planned_t"], 0.0105, e)   # one sleep overshoot, not n of them
        self.assertLess(events[-1]["t"] - 180.0, 0.0105)

    def test_timeline_starts_when_phase_zero_is_applied(self):
        clock = Clock()
        real_call = N.Runner.call

        def slow_call(runner, *args):          # each tc call costs 0.3 s of host time
            clock.now += 0.3
            return real_call(runner, *args)
        N.Runner.call = slow_call
        self.addCleanup(setattr, N.Runner, "call", real_call)
        code, events, err = self.run_main("--cycles", "1", clock=clock)
        self.assertEqual(code, 0, err)
        self.assertEqual(events[0]["t"], 0.0)
        mild = [e for e in events if e.get("label") == "mild"][0]
        # issued at 40 s after phase 0 took effect (not 40 s minus preflight and add time);
        # "t" is taken once tc returns, so it trails by one call, never by more
        self.assertAlmostEqual(mild["t"], 40.0 + 0.3, delta=0.02)
        self.assertAlmostEqual(events[-1]["t"], 60.0 + 0.3 * 3, delta=0.02)   # end, then del + show

    def test_refuses_existing_netem(self):
        self.set_state("netem")
        code, events, err = self.run_main("--cycles", "1")
        self.assertEqual(code, N.EXIT_REFUSED)
        self.assertEqual(self.mutating(), [])
        self.assertEqual(events[-1]["reason"], "netem_present")

    def test_refuses_missing_device(self):
        self.set_state("gone")
        code, events, _ = self.run_main("--cycles", "1")
        self.assertEqual(code, N.EXIT_REFUSED)
        self.assertEqual(self.mutating(), [])

    def test_failed_add_changes_nothing(self):
        os.environ["FAKE_TC_FAIL"] = "add:0"
        code, events, err = self.run_main("--cycles", "1")
        self.assertEqual(code, N.EXIT_TC)
        self.assertEqual([c[1] for c in self.mutating()], ["add"])     # no del of a qdisc we never added
        self.assertEqual(events[-1]["note"], "nothing_added")

    def test_failed_change_still_deletes(self):
        os.environ["FAKE_TC_FAIL"] = "change:2"
        code, events, err = self.run_main("--cycles", "2")
        self.assertEqual(code, N.EXIT_TC)
        self.assertEqual([c[1] for c in self.mutating()], ["add", "change", "change", "del"])
        self.assertTrue(events[-1]["removed"])
        self.assertIn("tc qdisc change", err)

    def test_sigterm_mid_run_deletes(self):
        clock = Clock(on_sleep=lambda n: os.kill(os.getpid(), signal.SIGTERM) if n == 3 else None)
        before = signal.getsignal(signal.SIGTERM)
        code, events, _ = self.run_main("--cycles", "2", clock=clock)
        self.assertEqual(code, 128 + signal.SIGTERM)
        self.assertEqual(self.mutating()[-1][1], "del")
        self.assertEqual(events[-1]["reason"], "signal_SIGTERM")
        self.assertTrue(events[-1]["removed"])
        self.assertIs(signal.getsignal(signal.SIGTERM), before)

    def test_ctrl_c_mid_run_deletes(self):
        def interrupt(n):
            if n == 2:
                raise KeyboardInterrupt
        code, events, _ = self.run_main("--cycles", "2", clock=Clock(on_sleep=interrupt))
        self.assertEqual(code, 128 + signal.SIGINT)
        self.assertEqual(self.mutating()[-1][1], "del")
        self.assertEqual(events[-1]["reason"], "interrupted")

    def test_failed_delete_reports_restore_command(self):
        os.environ["FAKE_TC_FAIL"] = "del:0"
        code, events, err = self.run_main("--cycles", "1")
        self.assertEqual(code, N.EXIT_CLEANUP)
        self.assertFalse(events[-1]["removed"])
        self.assertIn("tc qdisc del dev tun_srsue root", err)

    def test_device_gone_during_run_counts_as_removed(self):
        def vanish(n):
            if n == 2:
                self.set_state("gone")      # srsue exited: tun_srsue and its qdisc are gone
        code, events, _ = self.run_main("--cycles", "1", clock=Clock(on_sleep=vanish))
        self.assertEqual(code, N.EXIT_TC)
        self.assertTrue(events[-1]["removed"])
        self.assertEqual(events[-1]["note"], "device_gone")

    def test_dry_run_never_calls_tc(self):
        code, events, _ = self.run_main("--cycles", "1", "--dry-run")
        self.assertEqual(code, 0)
        self.assertEqual(self.calls(), [])
        self.assertEqual([e["planned_t"] for e in events], [0, 40, 55, 60])
        self.assertEqual(events[-1]["cmd"][-4:], ["del", "dev", "tun_srsue", "root"])

    def test_log_file_is_never_overwritten(self):
        log = os.path.join(self.dir.name, "events.jsonl")
        code, _, _ = self.run_main("--cycles", "1", "--log", log)
        self.assertEqual(code, 0)
        with open(log) as f:
            lines = [json.loads(line) for line in f]
        self.assertEqual(lines[0]["event"], "schedule_start")
        n = len(self.calls())
        code, _, err = self.run_main("--cycles", "1", "--log", log)
        self.assertEqual(code, N.EXIT_USAGE)
        self.assertEqual(len(self.calls()), n)

    def test_bad_inputs_touch_nothing(self):
        bad = self.write_schedule({"name": "x", "phases": [{"label": "a", "seconds": 1, "netem": "loss 1%; id"}]})
        for argv, schedule in ((["--cycles", "1"], bad), (["--duration", "0"], EXAMPLE)):
            with self.subTest(argv=argv):
                code, _, _ = self.run_main(*argv, schedule=schedule)
                self.assertEqual(code, N.EXIT_USAGE)
        for dev in ("--dev=-x", "--dev=tun;id", "--dev=" + "x" * 16):
            with self.subTest(dev=dev):
                code = N.main([EXAMPLE, dev, "--cycles", "1", "--tc", self.tc],
                              tc_prefix=[sys.executable], out=io.StringIO(), err=io.StringIO())
                self.assertEqual(code, N.EXIT_USAGE)
        self.assertEqual(self.calls(), [])


if __name__ == "__main__":
    unittest.main()
