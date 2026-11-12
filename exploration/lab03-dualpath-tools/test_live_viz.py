"""Tests for live_viz.py that need no network, SSH or lab host.

Run with both interpreters, because one finding was specific to -O:
    python3 test_live_viz.py && python3 -O test_live_viz.py
"""
import io
import shlex
import threading
import types
import unittest

import live_viz


class FakeProc:
    """Stand-in for subprocess.Popen: yields prepared lines, then blocks until terminated."""

    def __init__(self, lines):
        self._lines = lines
        self._done = threading.Event()
        self.terminated = False
        self.stdout = self._iter()

    def _iter(self):
        for line in self._lines:
            yield line
        self._done.wait(5)

    def poll(self):
        return 0 if self._done.is_set() else None

    def terminate(self):
        self.terminated = True
        self._done.set()

    def wait(self):
        self._done.wait(5)


def config():
    return types.SimpleNamespace(local=True, dst_a="127.0.0.1", dst_b="127.0.0.1", host_echo=None, host_send=None,
                                 sim_a_ms=1.0, sim_a_jitter=0.0, sim_a_loss=0.0, ready_timeout=5.0)


class StopOrdering(unittest.TestCase):
    def setUp(self):
        self.real_spawn = live_viz.spawn
        self.real_emit = live_viz.emit
        self.events = []
        live_viz.emit = self.events.append

    def tearDown(self):
        live_viz.spawn = self.real_spawn
        live_viz.emit = self.real_emit

    def wait_idle(self):
        self.assertTrue(live_viz.run_lock.acquire(timeout=5), "run did not finish")
        live_viz.run_lock.release()

    def test_stop_between_receiver_ready_and_sender_spawn(self):
        """echo -> stop -> (no send): a stop that has returned must prevent the sender from starting."""
        spawned = []
        echo_ready = threading.Event()
        stop_returned = threading.Event()

        def fake_spawn(args, host):
            spawned.append(args[0])
            if args[0] == "echo":
                return FakeProc(['{"event": "echo_start"}'])
            return FakeProc(['{"event": "summary"}'])

        def fake_emit(obj):
            self.events.append(obj)
            if obj.get("event") == "echo_start":
                # The run thread is here, after the receiver reported ready and before it
                # tries to start the sender. Hold it until stop() has fully returned.
                echo_ready.set()
                stop_returned.wait(5)

        live_viz.spawn = fake_spawn
        live_viz.emit = fake_emit
        job = live_viz.begin(config(), ("dup", 10, 0.02, "2:3"))
        self.assertIsNotNone(job)
        self.assertTrue(echo_ready.wait(5))
        live_viz.stop()
        stop_returned.set()
        self.wait_idle()
        self.assertEqual(spawned, ["echo"], "sender was started after stop() returned")
        self.assertTrue(job.cancelled)
        self.assertIn("cancelled", [e.get("event") for e in self.events])
        self.assertIsNone(live_viz.state["run"])

    def test_stop_before_any_process(self):
        job = live_viz.Run()
        job.cancel()
        with self.assertRaises(live_viz.Cancelled):
            job.start(lambda: self.fail("factory must not run after cancel"))

    def test_cancel_terminates_started_processes(self):
        job = live_viz.Run()
        proc = job.start(lambda: FakeProc([]))
        job.cancel()
        self.assertTrue(proc.terminated)

    def test_normal_run_starts_both(self):
        spawned = []

        def fake_spawn(args, host):
            spawned.append(args[0])
            proc = FakeProc(['{"event": "echo_start"}'] if args[0] == "echo" else ['{"event": "summary"}'])
            if args[0] == "send":
                proc._done.set()
            return proc

        live_viz.spawn = fake_spawn
        self.assertIsNotNone(live_viz.begin(config(), ("split", 10, 0.02, "2:3")))
        self.wait_idle()
        self.assertEqual(spawned, ["echo", "send"])

    def test_second_start_refused_while_running(self):
        release = threading.Event()

        def fake_spawn(args, host):
            proc = FakeProc([])
            threading.Thread(target=lambda: (release.wait(5), proc.terminate()), daemon=True).start()
            return proc

        live_viz.spawn = fake_spawn
        cfg = config()
        cfg.ready_timeout = 0.3
        self.assertIsNotNone(live_viz.begin(cfg, ("baseline", 10, 0.02, "2:3")))
        self.assertIsNone(live_viz.begin(cfg, ("baseline", 10, 0.02, "2:3")))
        release.set()
        self.wait_idle()


class StartParameters(unittest.TestCase):
    def q(self, **kw):
        return {k: [v] for k, v in kw.items()}

    def test_defaults(self):
        self.assertEqual(live_viz.parse_start({}), ("baseline", 200, 0.02, "2:3"))

    def test_rejects_unknown_or_shell_like_mode(self):
        for mode in ("dup; touch /tmp/x", "dup && id", "$(id)", "`id`", "dup\nid", "", "DUP", "dup "):
            self.assertIsNone(live_viz.parse_start(self.q(mode=mode)), mode)

    def test_rejects_bad_numbers_and_ratio(self):
        for bad in (self.q(count="x"), self.q(interval="fast"), self.q(interval="nan"), self.q(ratio="2"),
                    self.q(ratio="2:3:4"), self.q(ratio="0:3"), self.q(ratio="2:99"), self.q(ratio="a:b"),
                    self.q(ratio="2:3; id")):
            self.assertIsNone(live_viz.parse_start(bad), bad)

    def test_clamps_and_normalises(self):
        self.assertEqual(live_viz.parse_start(self.q(mode="split", count="999999", interval="0.0001", ratio="02:03")),
                         ("split", 2000, 0.005, "2:3"))

    def test_validation_does_not_depend_on_assert(self):
        # Under python3 -O, __debug__ is False and assert statements are removed.
        # The rejection above must hold either way; this records which mode ran.
        self.assertIsNone(live_viz.parse_start(self.q(mode="dup; id")))
        self.assertIn(__debug__, (True, False))


class RemoteCommand(unittest.TestCase):
    def test_arguments_are_shell_quoted(self):
        hostile = ["send", "--mode", "dup; touch /tmp/x", "--dst-a", "$(id)", "--ratio", "2:3 && id", "it's"]
        command = live_viz.remote_command(hostile)
        self.assertTrue(command.startswith("python3 - "))
        self.assertEqual(shlex.split(command)[2:], hostile)

    def test_plain_arguments_unchanged(self):
        self.assertEqual(live_viz.remote_command(["echo", "--bind", "172.16.0.1", "--duration", "16.0"]),
                         "python3 - echo --bind 172.16.0.1 --duration 16.0")

    def test_non_object_json_line_becomes_log(self):
        seen = []
        real = live_viz.emit
        live_viz.emit = seen.append
        try:
            live_viz.pump(types.SimpleNamespace(stdout=io.StringIO('[1, 2]\n"text"\nnot json\n{"event": "rx"}\n')), "echo")
        finally:
            live_viz.emit = real
        self.assertEqual([e["event"] for e in seen], ["log", "log", "log", "rx"])


if __name__ == "__main__":
    unittest.main(verbosity=1)
