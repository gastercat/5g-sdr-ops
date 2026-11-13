"""Loopback tests for adaptive_send.py. Uses 127.0.0.1 only; no SSH, no lab host.

    python3 test_adaptive_send.py && python3 -O test_adaptive_send.py
"""
import socket
import threading
import unittest

import adaptive_send


class Echo:
    """UDP echo on an ephemeral loopback port, standing in for the dualpath_demo.py receiver."""

    def __init__(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.bind(("127.0.0.1", 0))
        self.sock.settimeout(0.05)
        self.port = self.sock.getsockname()[1]
        self.stop = threading.Event()
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()

    def _run(self):
        while not self.stop.is_set():
            try:
                data, src = self.sock.recvfrom(2048)
            except OSError:
                continue
            self.sock.sendto(data, src)

    def close(self):
        self.stop.set()
        self.thread.join(2)
        self.sock.close()


def args(port, *extra):
    return adaptive_send.parser().parse_args(
        ["--dst-a", "127.0.0.1", "--dst-b", "127.0.0.1", "--port", str(port), "--interval", "0.004",
         "--wait", "0.1", "--timeout", "60"] + list(extra))


class Loopback(unittest.TestCase):
    def setUp(self):
        self.echo = Echo()
        self.addCleanup(self.echo.close)

    def test_dup_summary_has_the_shared_shape(self):
        events = []
        out = adaptive_send.run(args(self.echo.port, "--policy", "dup", "--count", "40"), events.append)
        self.assertEqual(out["mode"], "adaptive")
        self.assertEqual(out["paths"]["A"]["sent"], 40)
        self.assertEqual(out["paths"]["B"]["echoed"], 40)
        self.assertEqual(out["dedup"]["delivered_unique"], 40)
        self.assertEqual(out["dedup"]["duplicates_discarded"], 40)
        self.assertEqual(len(out["per_packet"]["A"]), 40)
        self.assertEqual(out["policy"]["copies_per_packet"], 2.0)
        self.assertEqual(out["policy"]["within_deadline_pct"], 100.0)
        self.assertIsNone(out["policy"]["emulated_b"])
        kinds = [e["event"] for e in events]
        self.assertEqual(kinds[0], "send_start")
        self.assertEqual(kinds.count("decision"), 40)
        self.assertEqual(kinds.count("tx"), 80)
        self.assertEqual(kinds.count("rtt"), 80)

    def test_emulated_leo_holds_back_path_b(self):
        out = adaptive_send.run(args(self.echo.port, "--policy", "dup", "--count", "60", "--leo-b"))
        a, b = out["paths"]["A"]["rtt"], out["paths"]["B"]["rtt"]
        self.assertLess(a["p50_ms"], 5.0)
        self.assertGreater(b["min_ms"], 8.0)           # profile base is 20-45 ms, jitter 3 ms
        self.assertEqual(out["dedup"]["first_arrival_by_path"]["B"], 0)
        self.assertEqual(out["policy"]["emulated_b"]["seed"], 0)

    def test_learner_leaves_a_path_that_never_answers(self):
        dead = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)   # bound, never echoes
        dead.bind(("127.0.0.1", 0))
        self.addCleanup(dead.close)
        a = args(self.echo.port, "--policy", "linucb+guard", "--count", "300")
        a.dst_a, a.dst_b = "127.0.0.1", "127.0.0.1"
        # path A -> silent port, path B -> echo: needs one port per path, so patch after connect
        real = socket.socket.connect

        def connect(sock, addr, n=[0]):
            n[0] += 1
            return real(sock, ("127.0.0.1", dead.getsockname()[1] if n[0] == 1 else self.echo.port))

        socket.socket.connect = connect
        try:
            out = adaptive_send.run(a)
        finally:
            socket.socket.connect = real
        self.assertEqual(out["paths"]["A"]["echoed"], 0)
        self.assertGreater(out["policy"]["within_deadline_pct"], 85.0)
        self.assertLess(out["policy"]["copies_per_packet"], 2.0)


class Arguments(unittest.TestCase):
    def test_non_finite_numbers_are_rejected_before_anything_is_sent(self):
        import contextlib, io
        real, calls = adaptive_send.run, []
        adaptive_send.run = lambda a, emit=None: calls.append(a)
        base = ["--policy", "dup", "--dst-a", "127.0.0.1", "--dst-b", "127.0.0.1"]
        try:
            for flag in ("--interval", "--deadline", "--timeout", "--cost", "--wait"):
                for value in ("nan", "inf", "-inf"):
                    with self.assertRaises(SystemExit, msg=(flag, value)), contextlib.redirect_stderr(io.StringIO()):
                        adaptive_send.main(base + [flag, value])
            with self.assertRaises(SystemExit), contextlib.redirect_stderr(io.StringIO()):
                adaptive_send.main(base + ["--wait", "-1"])
        finally:
            adaptive_send.run = real
        self.assertEqual(calls, [])


if __name__ == "__main__":
    unittest.main(verbosity=1)
