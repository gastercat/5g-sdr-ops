#!/usr/bin/env python3
"""Lab03 live dual-path viewer. Runs on the Mac; stdlib only.

Serves a page on http://127.0.0.1:<port>/ and, when a mode is started from the page,
runs dualpath_demo.py on the two lab hosts over SSH (echo on the EPC host, send on the
UE host) and streams every packet event to the page as it happens.

  python3 live_viz.py            # lab hosts over SSH (needs EPC/eNB/UE already running)
  python3 live_viz.py --local    # rehearsal on this Mac only; path A is SIMULATED
  python3 live_viz.py --echo-local --host-send <UE host>   # run on the EPC host itself: the receiver
                                 # starts here without SSH, only the sender goes over SSH

When ../ai-dualpath is present the page also offers an adaptive mode: the sender is
adaptive_send.py, which picks the path of every packet with a policy, and the page shows
each decision. Its optional LEO-like behaviour on path B is SIMULATED at the sender.

The server listens on 127.0.0.1 only. It never uses sudo and creates no files on the hosts.
"""
import argparse, collections, json, os, queue, re, shlex, subprocess, sys, tempfile, threading, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

HERE = os.path.dirname(os.path.abspath(__file__))
TOOL = os.path.join(HERE, "dualpath_demo.py")
PAGE = os.path.join(HERE, "live_viz.html")
MODES = ("baseline", "split", "dup", "adaptive")
# "adaptive" runs ../ai-dualpath/adaptive_send.py as the sender; it is offered only when that directory is present.
AI_DIR = os.path.join(HERE, "..", "ai-dualpath")
ADAPTIVE = os.path.join(AI_DIR, "adaptive_send.py")
BUNDLE = (("dualpath_demo", TOOL), ("leo_profile", os.path.join(AI_DIR, "leo_profile.py")),
          ("policies", os.path.join(AI_DIR, "policies.py")), ("adaptive_send", ADAPTIVE))
try:
    sys.path.insert(0, AI_DIR)
    from policies import NAMES as POLICIES
except ImportError:
    POLICIES = ()
clients = []
clients_lock = threading.Lock()
run_lock = threading.Lock()      # held for the whole of one run; only one run at a time


class Cancelled(Exception):
    pass


class Run:
    """One run's processes and its cancel flag, guarded by a single lock.

    cancel() and start() take the same lock, so once cancel() has returned no further
    process can be started for this run, and every process already started is terminated.
    """

    def __init__(self):
        self.lock = threading.Lock()
        self.cancelled = False
        self.procs = []

    def start(self, factory):
        with self.lock:
            if self.cancelled:
                raise Cancelled()
            proc = factory()
            self.procs.append(proc)
            return proc

    def cancel(self):
        with self.lock:
            self.cancelled = True
            self._terminate()

    def finish(self):
        with self.lock:
            self._terminate()

    def _terminate(self):
        while self.procs:
            proc = self.procs.pop()
            if proc.poll() is None:
                proc.terminate()


state_lock = threading.Lock()
state = {"run": None}


def emit(obj):
    data = ("data: " + json.dumps(obj) + "\n\n").encode()
    with clients_lock:
        for q in list(clients):
            q.put(data)


def remote_command(args):
    """Shell-quoted command line for the remote host; no value is ever spliced in unquoted."""
    return "python3 - " + shlex.join(args)


def spawn(args, host):
    if host is None:
        return subprocess.Popen([sys.executable, TOOL] + args, stdout=subprocess.PIPE,
                                stderr=subprocess.STDOUT, text=True, bufsize=1)
    with open(TOOL, "rb") as tool:
        return subprocess.Popen(["ssh", host, remote_command(args)], stdin=tool,
                                stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)


def bundle():
    """adaptive_send.py and the modules it imports as one script, so a host can run it from stdin."""
    src = {}
    for name, path in BUNDLE:
        with open(path, encoding="utf-8") as f:
            src[name] = f.read()
    return ("import sys, types\nSRC = %r\nfor name in %r:\n    m = types.ModuleType(name)\n"
            "    m.__file__ = name + '.py'\n    sys.modules[name] = m\n"
            "    exec(compile(SRC[name], m.__file__, 'exec'), m.__dict__)\n"
            "sys.modules['adaptive_send'].main()\n" % (src, [name for name, _ in BUNDLE]))


def spawn_adaptive(args, host):
    if host is None:
        return subprocess.Popen([sys.executable, ADAPTIVE] + args, stdout=subprocess.PIPE,
                                stderr=subprocess.STDOUT, text=True, bufsize=1)
    with tempfile.TemporaryFile() as script:
        script.write(bundle().encode())
        script.seek(0)
        return subprocess.Popen(["ssh", host, remote_command(args)], stdin=script,
                                stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)


def pump(proc, src, ready=None):
    for line in proc.stdout:
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except ValueError:
            obj = None
        if not isinstance(obj, dict):
            obj = {"event": "log", "text": line[:300]}
        obj["from"] = src
        if ready is not None and obj.get("event") == "echo_start":
            ready.set()
        emit(obj)


def parse_start(query):
    """Validate /start parameters. Returns (mode, count, interval, ratio) or None.

    Uses explicit checks, not assert, so the result is the same under python3 -O.
    """
    mode = query.get("mode", ["baseline"])[0]
    if mode not in MODES:
        return None
    try:
        count = int(query.get("count", ["200"])[0])
        interval = float(query.get("interval", ["0.02"])[0])
        parts = query.get("ratio", ["2:3"])[0].split(":")
        if len(parts) != 2:
            return None
        m, s = int(parts[0]), int(parts[1])
    except ValueError:
        return None
    if interval != interval or not (0 < m < 20 and 0 < s < 20):   # interval != interval is NaN
        return None
    count = max(10, min(2000, count))
    interval = max(0.005, min(1.0, interval))
    return mode, count, interval, "%d:%d" % (m, s)


def parse_adaptive(query):
    """Validate the extra /start parameters of adaptive mode. Returns (policy, deadline_ms, leo) or None."""
    policy = query.get("policy", ["linucb+guard"])[0]
    leo = query.get("leo", ["1"])[0]
    if policy not in POLICIES or leo not in ("0", "1"):
        return None
    try:
        deadline = float(query.get("deadline", ["30"])[0])
    except ValueError:
        return None
    if deadline != deadline:   # NaN
        return None
    return policy, max(1.0, min(150.0, deadline)), leo == "1"


def echo_host(cfg):
    """Where the receiver runs: None means this machine (rehearsal, or --echo-local on the EPC host)."""
    return None if cfg.local or getattr(cfg, "echo_local", False) else cfg.host_echo


def run(cfg, job, mode, count, interval, ratio, adaptive=None):
    try:
        dur = count * interval + 12
        local = cfg.local
        bind_a, bind_b = ("127.0.0.1", "127.0.0.1") if local else (cfg.dst_a, cfg.dst_b)
        echo = ["echo", "--json", "--duration", "%.1f" % dur, "--bind", bind_a]
        if not local:
            echo += ["--bind", bind_b]
        else:
            echo += ["--sim-a-ms", str(cfg.sim_a_ms), "--sim-a-jitter", str(cfg.sim_a_jitter),
                     "--sim-a-loss", str(cfg.sim_a_loss)]
        send = ["send", "--json", "--stream", "--mode", mode, "--ratio", ratio, "--dst-a", bind_a,
                "--count", str(count), "--interval", str(interval), "--wait", "2"]
        if mode != "baseline":
            send += ["--dst-b", bind_b]
        start = {"event": "run_start", "mode": mode, "count": count, "interval_s": interval, "ratio": ratio,
                 "simulated": local, "utc": time.time()}
        sender = spawn
        if mode == "adaptive":
            policy, deadline, leo = adaptive
            send = ["--json", "--policy", policy, "--dst-a", bind_a, "--dst-b", bind_b, "--count", str(count),
                    "--interval", str(interval), "--wait", "2", "--deadline", str(deadline)] + (["--leo-b"] if leo else [])
            start.update(policy=policy, deadline_ms=deadline, leo=leo)
            sender = spawn_adaptive
        emit(start)
        ready = threading.Event()
        pe = job.start(lambda: spawn(echo, echo_host(cfg)))
        threading.Thread(target=pump, args=(pe, "echo", ready), daemon=True).start()
        if not ready.wait(cfg.ready_timeout):
            emit({"event": "error", "text": "接收端沒有在時限內啟動。請確認主機可連線，且 EPC 已啟動。"})
            return
        ps = job.start(lambda: sender(send, None if local else cfg.host_send))
        pump(ps, "send")
        ps.wait()
    except Cancelled:
        emit({"event": "cancelled"})
    except Exception as e:  # surfaced to the page, not swallowed
        emit({"event": "error", "text": "%s: %s" % (type(e).__name__, e)})
    finally:
        job.finish()
        with state_lock:
            if state["run"] is job:
                state["run"] = None
        emit({"event": "run_end", "utc": time.time()})
        run_lock.release()


TOKEN = re.compile(r"[A-Za-z0-9_-]{1,64}\Z")
# Tokens whose stop arrived before their start was registered. Bounded so it cannot grow.
cancelled_tokens = collections.OrderedDict()
CANCELLED_TOKENS_MAX = 64


def valid_token(token):
    return isinstance(token, str) and TOKEN.match(token) is not None


def begin(cfg, params, token=None):
    """Register and start one run.

    Returns the Run; None when a run is already in progress; or the string "cancelled" when a
    stop carrying the same token was received first. Checking the token, taking the run slot
    and registering the Run all happen under state_lock, the lock stop() also takes, so a stop
    is either seen here (no run is started) or sees the registered Run (and cancels it).
    """
    with state_lock:
        if token is not None and cancelled_tokens.pop(token, None):
            return "cancelled"
        if not run_lock.acquire(blocking=False):
            return None
        job = Run()
        job.token = token
        state["run"] = job
    threading.Thread(target=run, args=(cfg, job) + tuple(params), daemon=True).start()
    return job


def stop(token=None):
    """Cancel a run. After this returns, that run starts no further process.

    Without a token: cancel the registered run, if any.
    With a token: cancel the registered run only if it carries that token; if that run has not
    been registered yet, remember the token so its start is refused when it arrives.
    """
    with state_lock:
        job = state["run"]
        if token is not None:
            if job is None or getattr(job, "token", None) != token:
                cancelled_tokens[token] = True
                while len(cancelled_tokens) > CANCELLED_TOKENS_MAX:
                    cancelled_tokens.popitem(last=False)
                return
    if job is not None:
        job.cancel()


def request_token(query):
    """Token from a query string: (token or None, ok). A present but malformed token is an error."""
    values = query.get("token")
    if not values:
        return None, True
    return (values[0], True) if valid_token(values[0]) else (None, False)


class H(BaseHTTPRequestHandler):
    cfg = None

    def log_message(self, *a):
        pass

    def _send(self, code, body, ctype="application/json"):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        u = urlparse(self.path)
        if u.path == "/":
            self._send(200, open(PAGE, "rb").read(), "text/html; charset=utf-8")
        elif u.path == "/config":
            c = self.cfg
            self._send(200, json.dumps({"local": c.local, "running": state["run"] is not None,
                                        "echo_local": bool(getattr(c, "echo_local", False)),
                                        "host_echo": c.host_echo, "host_send": c.host_send,
                                        "dst_a": c.dst_a, "dst_b": c.dst_b, "policies": list(POLICIES),
                                        "sim": {"ms": c.sim_a_ms, "jitter": c.sim_a_jitter, "loss": c.sim_a_loss}}).encode())
        elif u.path == "/events":
            q = queue.Queue()
            with clients_lock:
                clients.append(q)
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            try:
                self.wfile.write(b": connected\n\n")
                self.wfile.flush()
                while True:
                    try:
                        data = q.get(timeout=10)
                    except queue.Empty:
                        data = b": keepalive\n\n"
                    self.wfile.write(data)
                    self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError, OSError):
                pass
            finally:
                with clients_lock:
                    if q in clients:
                        clients.remove(q)
        else:
            self._send(404, b"{}")

    def do_POST(self):
        u = urlparse(self.path)
        if self.headers.get("Origin") not in (None, "http://127.0.0.1:%d" % self.cfg.port,
                                               "http://localhost:%d" % self.cfg.port):
            return self._send(403, b'{"error":"origin"}')
        query = parse_qs(u.query)
        token, token_ok = request_token(query)
        if not token_ok:
            return self._send(400, b'{"error":"bad token"}')
        if u.path == "/start":
            params = parse_start(query)
            if params is not None and params[0] == "adaptive":
                extra = parse_adaptive(query)
                params = None if extra is None else params + (extra,)
            if params is None:
                return self._send(400, b'{"error":"bad parameters"}')
            result = begin(self.cfg, params, token)
            if result == "cancelled":
                return self._send(409, b'{"error":"cancelled"}')
            if result is None:
                return self._send(409, b'{"error":"already running"}')
            self._send(200, b'{"ok":true}')
        elif u.path == "/stop":
            stop(token)
            self._send(200, b'{"ok":true}')
        else:
            self._send(404, b"{}")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--local", action="store_true", help="rehearse on this Mac; path A is simulated")
    p.add_argument("--echo-local", action="store_true",
                   help="this machine is the EPC host: start the receiver here without SSH; "
                        "only the sender uses SSH (--host-send). Measured, not simulated")
    p.add_argument("--port", type=int, default=8770)
    p.add_argument("--host-echo", default="5g-linux1-audit")
    p.add_argument("--host-send", default="5g-linux2-audit")
    p.add_argument("--dst-a", default="172.16.0.1", help="EPC SGi address (path A, OTA)")
    p.add_argument("--dst-b", default="192.168.250.11", help="EPC host wired address (path B)")
    p.add_argument("--sim-a-ms", type=float, default=18.0)
    p.add_argument("--sim-a-jitter", type=float, default=4.0)
    p.add_argument("--sim-a-loss", type=float, default=0.0)
    p.add_argument("--ready-timeout", type=float, default=15.0, help="seconds to wait for the receiver to start")
    cfg = p.parse_args()
    if cfg.local and cfg.echo_local:
        p.error("--local and --echo-local cannot be combined: --local simulates path A on one machine")
    H.cfg = cfg
    srv = ThreadingHTTPServer(("127.0.0.1", cfg.port), H)
    srv.daemon_threads = True
    print("Lab03 live viewer: http://127.0.0.1:%d/  (%s)  Ctrl-C to quit" % (
        cfg.port, "LOCAL REHEARSAL, path A simulated" if cfg.local else
        "receiver on this host, sender over SSH" if cfg.echo_local else "lab hosts over SSH"), flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        stop()


if __name__ == "__main__":
    main()
