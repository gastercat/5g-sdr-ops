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
        """echo -> stop -> (no send): a stop that has returned must prevent the sender from starting.

        The worker thread is held at the exact point where it is about to call Run.start for the
        sender, and released only after stop() has returned. Holding a different thread (for
        example the receiver's reader) would not pin this ordering.
        """
        spawned = []
        about_to_start_sender = threading.Event()
        stop_returned = threading.Event()
        real_start = live_viz.Run.start
        calls = []

        def gated_start(job, factory):
            calls.append(len(calls))
            if len(calls) == 2:                       # second process of the run: the sender
                about_to_start_sender.set()
                self.assertTrue(stop_returned.wait(5), "test did not release the worker")
            return real_start(job, factory)

        def fake_spawn(args, host):
            spawned.append(args[0])
            return FakeProc(['{"event": "echo_start"}'] if args[0] == "echo" else ['{"event": "summary"}'])

        live_viz.spawn = fake_spawn
        live_viz.Run.start = gated_start
        try:
            job = live_viz.begin(config(), ("dup", 10, 0.02, "2:3"))
            self.assertIsInstance(job, live_viz.Run)
            self.assertTrue(about_to_start_sender.wait(5), "worker never reached the sender start")
            self.assertEqual(spawned, ["echo"])
            live_viz.stop()                            # returns only after the run is cancelled
            stop_returned.set()
            self.wait_idle()
        finally:
            live_viz.Run.start = real_start
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
        self.assertIsInstance(live_viz.begin(config(), ("split", 10, 0.02, "2:3")), live_viz.Run)
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
        self.assertIsInstance(live_viz.begin(cfg, ("baseline", 10, 0.02, "2:3")), live_viz.Run)
        self.assertIsNone(live_viz.begin(cfg, ("baseline", 10, 0.02, "2:3")))
        release.set()
        self.wait_idle()


class StopBeforeStartIsRegistered(unittest.TestCase):
    """A stop can reach the server while its start request is still being handled."""

    def setUp(self):
        self.real_spawn, self.real_emit = live_viz.spawn, live_viz.emit
        self.spawned = []
        live_viz.emit = lambda obj: None

        def fake_spawn(args, host):
            self.spawned.append(args[0])
            proc = FakeProc(['{"event": "echo_start"}'] if args[0] == "echo" else ['{"event": "summary"}'])
            if args[0] == "send":
                proc._done.set()
            return proc

        live_viz.spawn = fake_spawn
        live_viz.cancelled_tokens.clear()

    def tearDown(self):
        live_viz.spawn, live_viz.emit = self.real_spawn, self.real_emit
        live_viz.cancelled_tokens.clear()

    def wait_idle(self):
        self.assertTrue(live_viz.run_lock.acquire(timeout=5), "run did not finish")
        live_viz.run_lock.release()

    def test_stop_then_start_with_same_token_starts_nothing(self):
        live_viz.stop("run1")                                          # arrives first
        result = live_viz.begin(config(), ("dup", 10, 0.02, "2:3"), "run1")
        self.assertEqual(result, "cancelled")
        self.assertEqual(self.spawned, [])
        self.assertIsNone(live_viz.state["run"])
        self.wait_idle()                                               # the run slot was never taken

    def test_cancelled_token_is_used_once_and_other_tokens_unaffected(self):
        live_viz.stop("run1")
        self.assertIsInstance(live_viz.begin(config(), ("baseline", 10, 0.02, "2:3"), "run2"), live_viz.Run)
        self.wait_idle()
        self.assertEqual(live_viz.begin(config(), ("baseline", 10, 0.02, "2:3"), "run1"), "cancelled")
        self.assertIsInstance(live_viz.begin(config(), ("baseline", 10, 0.02, "2:3"), "run1"), live_viz.Run)
        self.wait_idle()

    def test_stop_for_another_token_does_not_cancel_registered_run(self):
        gate = threading.Event()
        real_start = live_viz.Run.start

        def gated_start(job, factory):
            gate.wait(5)
            return real_start(job, factory)

        live_viz.Run.start = gated_start
        try:
            job = live_viz.begin(config(), ("baseline", 10, 0.02, "2:3"), "mine")
            live_viz.stop("someone-else")
            self.assertFalse(job.cancelled)
            live_viz.stop("mine")
            self.assertTrue(job.cancelled)
            gate.set()
            self.wait_idle()
        finally:
            live_viz.Run.start = real_start
        self.assertEqual(self.spawned, [])

    def test_start_handler_paused_before_registration(self):
        """The reviewed ordering over HTTP: /start paused before it registers, /stop answers 200,
        then /start resumes. No worker may be scheduled and /start must not report success."""
        import http.client
        from http.server import ThreadingHTTPServer

        paused, resume = threading.Event(), threading.Event()
        real_begin = live_viz.begin

        def paused_begin(cfg, params, token=None):
            paused.set()
            self.assertTrue(resume.wait(5))
            return real_begin(cfg, params, token)

        live_viz.begin = paused_begin
        cfg = config()
        cfg.port = 0
        live_viz.H.cfg = cfg
        server = ThreadingHTTPServer(("127.0.0.1", 0), live_viz.H)
        server.daemon_threads = True
        cfg.port = server.server_address[1]
        threading.Thread(target=server.serve_forever, daemon=True).start()
        answers = {}

        def post(name, path):
            conn = http.client.HTTPConnection("127.0.0.1", cfg.port, timeout=5)
            conn.request("POST", path)
            response = conn.getresponse()
            answers[name] = (response.status, response.read())
            conn.close()

        try:
            starter = threading.Thread(target=post, args=("start", "/start?mode=dup&count=10&interval=0.02&token=abc"))
            starter.start()
            self.assertTrue(paused.wait(5), "/start never reached registration")
            post("stop", "/stop?token=abc")
            self.assertEqual(answers["stop"][0], 200)
            resume.set()
            starter.join(5)
        finally:
            live_viz.begin = real_begin
            server.shutdown()
            server.server_close()
        self.assertEqual(answers["start"][0], 409)
        self.assertIn(b"cancelled", answers["start"][1])
        self.assertEqual(self.spawned, [])
        self.assertIsNone(live_viz.state["run"])

    def test_malformed_token_rejected(self):
        for bad in ("a b", "a;b", "$(id)", "x" * 65, ""):
            self.assertFalse(live_viz.valid_token(bad), bad)
        self.assertEqual(live_viz.request_token({"token": ["a;b"]}), (None, False))
        self.assertEqual(live_viz.request_token({}), (None, True))
        self.assertEqual(live_viz.request_token({"token": ["Run_1-a"]}), ("Run_1-a", True))

    def test_remembered_tokens_are_bounded(self):
        for i in range(live_viz.CANCELLED_TOKENS_MAX + 20):
            live_viz.stop("t%d" % i)
        self.assertEqual(len(live_viz.cancelled_tokens), live_viz.CANCELLED_TOKENS_MAX)


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
