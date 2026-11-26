"""Tests for the pure parts of netem_comparison.py. No SSH, no network, no root.

    python3 -B test_netem_comparison.py && python3 -B -O test_netem_comparison.py
"""
import unittest

import netem_comparison as C


class SlotTest(unittest.TestCase):
    def test_slots_start_on_cycle_boundaries_with_room_for_the_echo(self):
        start, cycle = 1000.0, 60.0
        times = C.slots(start, cycle, now_utc=1050.0, count=3, cycles_per_run=3, gap_cycles=1, lead=8.0)
        # now + lead + 2 = 1060 -> first boundary at or after it is cycle 1 (1060)
        self.assertEqual(times, [1060.0, 1300.0, 1540.0])
        for t in times:
            self.assertEqual((t - start) % cycle, 0.0)

    def test_slots_skip_a_boundary_that_is_too_close(self):
        times = C.slots(1000.0, 60.0, now_utc=1055.0, count=1, cycles_per_run=3, gap_cycles=1, lead=8.0)
        self.assertEqual(times, [1120.0])

    def test_jobs_cover_every_policy_each_round_in_page_order(self):
        todo = C.jobs(2)
        self.assertEqual(len(todo), 14)
        self.assertEqual([p for r, p in todo if r == 1], list(C.POLICIES))
        self.assertEqual(todo[7], (2, "only_a"))


class ScheduleStateTest(unittest.TestCase):
    def test_reads_start_and_end(self):
        ev = [{"event": "schedule_start", "utc": 5.0, "cycle_s": 60.0}, {"event": "phase", "utc": 5.0}]
        self.assertEqual(C.schedule_state(ev), (5.0, 60.0, False))
        self.assertTrue(C.schedule_state(ev + [{"event": "schedule_end", "utc": 9.0}])[2])

    def test_refuses_before_start(self):
        with self.assertRaises(RuntimeError):
            C.schedule_state([{"event": "schedule_refused", "reason": "netem_present"}])


class CommandTest(unittest.TestCase):
    def test_remote_arguments_are_quoted(self):
        argv = C.command("host", ["--policy", "linucb+guard", "--dst-a", "1.2.3.4; rm -rf ~"])
        self.assertEqual(argv[-2], "host")
        self.assertEqual(argv[-1], "python3 - --policy linucb+guard --dst-a '1.2.3.4; rm -rf ~'")

    def test_local_runs_this_interpreter(self):
        argv = C.command(None, ["echo"])
        self.assertEqual(argv[1:], ["-", "echo"])

    def test_sender_arguments(self):
        class A:
            dst_a, dst_b, interval, deadline = "172.16.0.1", "192.168.250.11", 0.02, 30.0
        args = C.sender_args(A, "dup", 2, 9000)
        self.assertEqual(args[args.index("--count") + 1], "9000")
        self.assertEqual(args[args.index("--leo-seed") + 1], "2")
        self.assertIn("--leo-b", args)
        self.assertIn("--json", args)


if __name__ == "__main__":
    unittest.main()
