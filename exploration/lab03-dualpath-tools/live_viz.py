#!/usr/bin/env python3
"""Lab03 live dual-path viewer. Runs on the Mac; stdlib only.

Serves a page on http://127.0.0.1:<port>/ and, when a mode is started from the page,
runs dualpath_demo.py on the two lab hosts over SSH (echo on the EPC host, send on the
UE host) and streams every packet event to the page as it happens.

  python3 live_viz.py            # lab hosts over SSH (needs EPC/eNB/UE already running)
  python3 live_viz.py --local    # rehearsal on this Mac only; path A is SIMULATED

The server listens on 127.0.0.1 only. It never uses sudo and creates no files on the hosts.
"""
import argparse, json, os, queue, subprocess, sys, threading, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

HERE = os.path.dirname(os.path.abspath(__file__))
TOOL = os.path.join(HERE, "dualpath_demo.py")
PAGE = os.path.join(HERE, "live_viz.html")
clients = []
clients_lock = threading.Lock()
run_lock = threading.Lock()
procs = []
state = {"running": False}


def emit(obj):
    data = ("data: " + json.dumps(obj) + "\n\n").encode()
    with clients_lock:
        for q in list(clients):
            q.put(data)


def spawn(args_local, host, remote_cmd):
    if host is None:
        return subprocess.Popen([sys.executable, TOOL] + args_local, stdout=subprocess.PIPE,
                                stderr=subprocess.STDOUT, text=True, bufsize=1)
    return subprocess.Popen(["ssh", host, "python3 - " + remote_cmd], stdin=open(TOOL, "rb"),
                            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)


def pump(proc, src, ready=None):
    for line in proc.stdout:
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except ValueError:
            obj = {"event": "log", "text": line[:300]}
        obj["from"] = src
        if ready is not None and obj.get("event") == "echo_start":
            ready.set()
        emit(obj)


def run(cfg, mode, count, interval, ratio):
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
        emit({"event": "run_start", "mode": mode, "count": count, "interval_s": interval, "ratio": ratio,
              "simulated": local, "utc": time.time()})
        ready = threading.Event()
        pe = spawn(echo, None if local else cfg.host_echo, " ".join(echo))
        procs.append(pe)
        threading.Thread(target=pump, args=(pe, "echo", ready), daemon=True).start()
        if not ready.wait(15):
            emit({"event": "error", "text": "接收端沒有在 15 秒內啟動。請確認主機可連線，且 EPC 已啟動。"})
            return
        ps = spawn(send, None if local else cfg.host_send, " ".join(send))
        procs.append(ps)
        pump(ps, "send")
        ps.wait()
    except Exception as e:  # surfaced to the page, not swallowed
        emit({"event": "error", "text": "%s: %s" % (type(e).__name__, e)})
    finally:
        stop_procs()
        state["running"] = False
        emit({"event": "run_end", "utc": time.time()})
        run_lock.release()


def stop_procs():
    while procs:
        p = procs.pop()
        if p.poll() is None:
            p.terminate()


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
            self._send(200, json.dumps({"local": c.local, "running": state["running"],
                                        "host_echo": c.host_echo, "host_send": c.host_send,
                                        "dst_a": c.dst_a, "dst_b": c.dst_b,
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
        if u.path == "/start":
            q = parse_qs(u.query)
            mode = q.get("mode", ["baseline"])[0]
            ratio = q.get("ratio", ["2:3"])[0]
            try:
                count = max(10, min(2000, int(q.get("count", ["200"])[0])))
                interval = max(0.005, min(1.0, float(q.get("interval", ["0.02"])[0])))
                m, s = (int(x) for x in ratio.split(":"))
                assert mode in ("baseline", "split", "dup") and 0 < m < 20 and 0 < s < 20
            except Exception:
                return self._send(400, b'{"error":"bad parameters"}')
            if not run_lock.acquire(blocking=False):
                return self._send(409, b'{"error":"already running"}')
            state["running"] = True
            threading.Thread(target=run, args=(self.cfg, mode, count, interval, "%d:%d" % (m, s)), daemon=True).start()
            self._send(200, b'{"ok":true}')
        elif u.path == "/stop":
            stop_procs()
            self._send(200, b'{"ok":true}')
        else:
            self._send(404, b"{}")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--local", action="store_true", help="rehearse on this Mac; path A is simulated")
    p.add_argument("--port", type=int, default=8770)
    p.add_argument("--host-echo", default="5g-linux1-audit")
    p.add_argument("--host-send", default="5g-linux2-audit")
    p.add_argument("--dst-a", default="172.16.0.1", help="EPC SGi address (path A, OTA)")
    p.add_argument("--dst-b", default="192.168.250.11", help="EPC host wired address (path B)")
    p.add_argument("--sim-a-ms", type=float, default=18.0)
    p.add_argument("--sim-a-jitter", type=float, default=4.0)
    p.add_argument("--sim-a-loss", type=float, default=0.0)
    cfg = p.parse_args()
    H.cfg = cfg
    srv = ThreadingHTTPServer(("127.0.0.1", cfg.port), H)
    srv.daemon_threads = True
    print("Lab03 live viewer: http://127.0.0.1:%d/  (%s)  Ctrl-C to quit" % (
        cfg.port, "LOCAL REHEARSAL, path A simulated" if cfg.local else "lab hosts over SSH"), flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        stop_procs()


if __name__ == "__main__":
    main()
