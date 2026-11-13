#!/usr/bin/env python3
"""Lab03 dual-path UDP probe (application layer). Stdlib only, no root needed.

echo: bind one UDP socket per local address, echo every datagram back to its source.
send: emit packets with a Packet ID over path A and/or path B, collect echoes,
      report per-path Packet IDs, loss, RTT and jitter, plus first-arrival de-duplication.

Latency is round-trip time measured on the sender's monotonic clock, so it does not
depend on clock synchronisation between hosts. It is NOT one-way latency.
Split/duplication here happen in this tool, not in PDCP.

Modes:
  baseline  every packet on path A only
  split     ratio M:S, first M of each M+S cycle on path A, remaining S on path B
  dup       every packet on both paths with the same Packet ID
"""
import argparse, json, select, socket, struct, sys, time

HDR = struct.Struct("!4sIBd")  # magic, packet id, path tag, sender monotonic time
MAGIC = b"L3DP"


def run_echo(a):
    socks = {}
    for addr in a.bind:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.bind((addr, a.port))
        socks[s] = addr
    print(json.dumps({"event": "echo_start", "bind": a.bind, "port": a.port, "utc": time.time()}), flush=True)
    end = time.monotonic() + a.duration
    n = 0
    while time.monotonic() < end:
        r, _, _ = select.select(list(socks), [], [], 0.5)
        for s in r:
            data, src = s.recvfrom(2048)
            if len(data) < HDR.size or data[:4] != MAGIC:
                continue
            s.sendto(data, src)
            n += 1
            _, pid, tag, _ = HDR.unpack(data[:HDR.size])
            print(json.dumps({"event": "rx", "id": pid, "path": chr(tag), "local": socks[s],
                              "src": src[0], "utc": time.time()}), flush=True)
    print(json.dumps({"event": "echo_end", "echoed": n}), flush=True)


def stats(rtts):
    if not rtts:
        return None
    v = sorted(rtts)
    pct = lambda p: v[min(len(v) - 1, int(round(p * (len(v) - 1))))]
    return {"n": len(v), "min_ms": v[0], "p50_ms": pct(0.5), "mean_ms": sum(v) / len(v),
            "p95_ms": pct(0.95), "max_ms": v[-1]}


def jitter(seq):  # mean |RTT(i) - RTT(i-1)| over consecutive received IDs, ms
    d = [abs(b - a) for a, b in zip(seq, seq[1:])]
    return sum(d) / len(d) if d else None


def run_send(a):
    paths = {"A": a.dst_a}
    if a.mode != "baseline":
        if not a.dst_b:
            sys.exit("--dst-b required for split/dup")
        paths["B"] = a.dst_b
    socks = {}
    for tag, dst in paths.items():
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        src = a.src_a if tag == "A" else a.src_b
        if src:
            s.bind((src, 0))
        s.connect((dst, a.port))
        s.setblocking(False)
        socks[tag] = s
    m, sdiv = (int(x) for x in a.ratio.split(":"))
    sent = {t: [] for t in paths}
    rx = {t: {} for t in paths}
    pad = b"\0" * max(0, a.size - HDR.size)
    errors = []

    def drain(timeout):
        r, _, _ = select.select(list(socks.values()), [], [], timeout)
        now = time.monotonic()
        for s in r:
            try:
                data = s.recv(2048)
            except OSError as e:
                errors.append(str(e))
                continue
            if len(data) < HDR.size or data[:4] != MAGIC:
                continue
            _, pid, tag, t0 = HDR.unpack(data[:HDR.size])
            rx[chr(tag)].setdefault(pid, (now - t0) * 1000.0)

    print(json.dumps({"event": "send_start", "mode": a.mode, "ratio": a.ratio, "count": a.count,
                      "interval_s": a.interval, "size": a.size, "paths": paths, "utc": time.time()}), flush=True)
    for pid in range(a.count):
        if a.mode == "baseline":
            tags = ["A"]
        elif a.mode == "split":
            tags = ["A"] if (pid % (m + sdiv)) < m else ["B"]
        else:
            tags = ["A", "B"]
        for tag in tags:
            try:
                socks[tag].send(HDR.pack(MAGIC, pid, ord(tag), time.monotonic()) + pad)
                sent[tag].append(pid)
            except OSError as e:
                errors.append("send %s id=%d: %s" % (tag, pid, e))
        deadline = time.monotonic() + a.interval
        while True:
            left = deadline - time.monotonic()
            if left <= 0:
                break
            drain(left)
    end = time.monotonic() + a.wait
    while time.monotonic() < end:
        drain(0.2)

    ids = sorted(set().union(*[set(v) for v in sent.values()]))
    first = {}
    for pid in ids:
        c = [(rx[t][pid], t) for t in paths if pid in rx[t]]
        if c:
            first[pid] = min(c)
    out = {"event": "summary", "mode": a.mode, "unique_ids_sent": len(ids), "paths": {},
           "errors": errors[:20], "utc": time.time()}
    for t in paths:
        got = sorted(rx[t])
        out["paths"][t] = {
            "dst": paths[t], "sent": len(sent[t]), "echoed": len(got),
            "loss_pct": round(100.0 * (1 - len(got) / len(sent[t])), 3) if sent[t] else None,
            "sent_ids": sent[t], "echoed_ids": got,
            "rtt": stats([rx[t][i] for i in got]), "jitter_ms": jitter([rx[t][i] for i in got]),
        }
    got = sorted(first)
    out["dedup"] = {
        "delivered_unique": len(got),
        "loss_pct": round(100.0 * (1 - len(got) / len(ids)), 3) if ids else None,
        "copies_received_total": sum(len(rx[t]) for t in paths),
        "duplicates_discarded": sum(len(rx[t]) for t in paths) - len(got),
        "first_arrival_by_path": {t: sum(1 for i in got if first[i][1] == t) for t in paths},
        "rtt": stats([first[i][0] for i in got]), "jitter_ms": jitter([first[i][0] for i in got]),
        "missing_ids": [i for i in ids if i not in first],
    }
    print(json.dumps(out), flush=True)


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="role", required=True)
    e = sub.add_parser("echo")
    e.add_argument("--bind", action="append", required=True)
    e.add_argument("--port", type=int, default=47003)
    e.add_argument("--duration", type=float, default=120)
    s = sub.add_parser("send")
    s.add_argument("--mode", choices=["baseline", "split", "dup"], required=True)
    s.add_argument("--dst-a", required=True)
    s.add_argument("--dst-b")
    s.add_argument("--src-a")
    s.add_argument("--src-b")
    s.add_argument("--port", type=int, default=47003)
    s.add_argument("--count", type=int, default=200)
    s.add_argument("--interval", type=float, default=0.05)
    s.add_argument("--size", type=int, default=128)
    s.add_argument("--ratio", default="2:3")
    s.add_argument("--wait", type=float, default=3.0)
    a = p.parse_args()
    run_echo(a) if a.role == "echo" else run_send(a)


if __name__ == "__main__":
    main()
