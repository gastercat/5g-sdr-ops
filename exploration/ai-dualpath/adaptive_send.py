#!/usr/bin/env python3
"""Dual-path UDP sender whose per-packet path choice comes from a policy.

Works against the unchanged echo side of ../lab03-dualpath-tools/dualpath_demo.py
and uses the same packet header, so both tools can share one receiver:

  python3 ../lab03-dualpath-tools/dualpath_demo.py echo --json --bind <A> --bind <B>
  python3 adaptive_send.py --policy linucb+guard --dst-a <A> --dst-b <B> --leo-b --json

--leo-b emulates a LEO-like link on path B at the sender: a copy the profile marks
as lost is not put on the wire, and the echo of every other copy is held back by
the profile's round-trip time before the policy may see it. Path B numbers taken
with --leo-b are SIMULATED, whatever network path B really is.

Latency is round-trip time on the sender's monotonic clock, not one-way latency.
Splitting and duplication happen in this tool, not in PDCP.
"""
import argparse, heapq, json, math, os, random, select, socket, sys, time

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "lab03-dualpath-tools"))
from dualpath_demo import HDR, MAGIC, jitter, stats  # noqa: E402  same wire format and statistics

import policies as P  # noqa: E402
from leo_profile import LeoProfile  # noqa: E402


def run(a, emit=None):
    """Send a.count packets and return the summary. emit(obj) receives per-packet events."""
    emit = emit or (lambda obj: None)
    policy = P.make(a.policy, a.deadline, a.cost)
    leo = LeoProfile(seed=a.leo_seed) if a.leo_b else None
    rng = random.Random(a.leo_seed)
    paths = {"A": a.dst_a, "B": a.dst_b}
    socks = {}
    for tag, dst in paths.items():
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        src = a.src_a if tag == "A" else a.src_b
        if src:
            s.bind((src, 0))
        s.connect((dst, a.port))
        s.setblocking(False)
        socks[tag] = s
    pad = b"\0" * max(0, a.size - HDR.size)
    sent = {t: [] for t in paths}
    rx = {t: {} for t in paths}
    held = {}             # packet id -> emulated round-trip ms added on path B
    due, seq = [], 0      # (when the outcome may be shown to the policy, tie-break, id, path, rtt or None)
    done = set()          # (id, path) already shown to the policy
    actions, errors = [], []
    start = time.monotonic()

    def queue(when, pid, tag, rtt):
        nonlocal seq
        heapq.heappush(due, (when, seq, pid, tag, rtt))
        seq += 1

    def deliver(now):
        while due and due[0][0] <= now:
            when, _, pid, tag, rtt = heapq.heappop(due)
            if (pid, tag) in done:
                continue
            done.add((pid, tag))
            if rtt is not None:
                rx[tag][pid] = rtt
                emit({"event": "rtt", "id": pid, "path": tag, "rtt_ms": round(rtt, 3)})
            policy.observe(pid, tag, rtt, when - start)

    def drain(until):
        while True:
            now = time.monotonic()
            deliver(now)
            if now >= until:
                return
            wait = min(until, due[0][0]) - now if due else until - now
            r, _, _ = select.select(list(socks.values()), [], [], max(0.0, wait))
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
                tag = chr(tag)
                rtt = (now - t0) * 1000.0 + (held.get(pid, 0.0) if tag == "B" else 0.0)
                if tag in paths and rtt <= a.timeout:
                    queue(t0 + rtt / 1000.0, pid, tag, rtt)

    emit({"event": "send_start", "mode": "adaptive", "policy": policy.name, "count": a.count,
          "interval_s": a.interval, "size": a.size, "deadline_ms": a.deadline, "paths": paths,
          "emulated_b": bool(leo), "utc": time.time()})
    for pid in range(a.count):
        now = time.monotonic()
        deliver(now)
        act = policy.act(now - start, pid)
        actions.append(act)
        emit({"event": "decision", "id": pid, "action": act, "veto": getattr(policy, "last_veto", None)})
        for tag in act:
            t0 = time.monotonic()
            extra = leo.sample(t0 - start, rng) if leo and tag == "B" else 0.0
            sent[tag].append(pid)
            queue(t0 + a.timeout / 1000.0, pid, tag, None)   # ignored if an echo is shown first
            emit({"event": "tx", "id": pid, "path": tag})
            if extra is None:
                continue                                      # emulated loss: nothing goes on the wire
            if tag == "B" and leo:
                held[pid] = extra
            try:
                socks[tag].send(HDR.pack(MAGIC, pid, ord(tag), t0) + pad)
            except OSError as e:
                errors.append("send %s id=%d: %s" % (tag, pid, e))
        drain(now + a.interval)
    drain(time.monotonic() + max(a.wait, a.timeout / 1000.0 + 0.05))

    first = {}
    for pid in range(a.count):
        c = [(rx[t][pid], t) for t in paths if pid in rx[t]]
        if c:
            first[pid] = min(c)
    got = sorted(first)
    out = {"event": "summary", "mode": "adaptive", "unique_ids_sent": a.count, "paths": {},
           "errors": errors[:20], "utc": time.time()}
    for t in paths:
        ids = sorted(rx[t])
        out["paths"][t] = {"dst": paths[t], "sent": len(sent[t]), "echoed": len(ids),
                           "loss_pct": round(100.0 * (1 - len(ids) / len(sent[t])), 3) if sent[t] else None,
                           "sent_ids": sent[t], "echoed_ids": ids,
                           "rtt": stats([rx[t][i] for i in ids]), "jitter_ms": jitter([rx[t][i] for i in ids])}
    copies = sum(len(rx[t]) for t in paths)
    out["dedup"] = {"delivered_unique": len(got), "loss_pct": round(100.0 * (1 - len(got) / a.count), 3),
                    "copies_received_total": copies, "duplicates_discarded": copies - len(got),
                    "first_arrival_by_path": {t: sum(1 for i in got if first[i][1] == t) for t in paths},
                    "rtt": stats([first[i][0] for i in got]), "jitter_ms": jitter([first[i][0] for i in got]),
                    "missing_ids": [i for i in range(a.count) if i not in first]}
    out["per_packet"] = {t: [[i, round(rx[t][i], 3)] for i in sorted(rx[t])] for t in paths}
    out["size"], out["interval_s"] = a.size, a.interval
    out["policy"] = {"name": policy.name, "deadline_ms": a.deadline, "cost": a.cost,
                     "within_deadline_pct": round(100.0 * sum(1 for i in got if first[i][0] <= a.deadline) / a.count, 3),
                     "copies_per_packet": round(sum(len(x) for x in actions) / a.count, 3),
                     "actions": {k: actions.count(k) for k in ("A", "B", "AB")},
                     "vetoes": dict(getattr(policy, "vetoes", {})),
                     "emulated_b": {"seed": a.leo_seed, "note": "SIMULATED at the sender"} if leo else None}
    for s in socks.values():
        s.close()
    return out


def parser():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--policy", choices=P.NAMES, required=True)
    p.add_argument("--dst-a", required=True)
    p.add_argument("--dst-b", required=True)
    p.add_argument("--src-a")
    p.add_argument("--src-b")
    p.add_argument("--port", type=int, default=47003)
    p.add_argument("--count", type=int, default=1000)
    p.add_argument("--interval", type=float, default=0.02)
    p.add_argument("--size", type=int, default=128)
    p.add_argument("--wait", type=float, default=2.0, help="seconds to keep listening after the last packet")
    p.add_argument("--deadline", type=float, default=30.0, help="round-trip deadline, ms")
    p.add_argument("--timeout", type=float, default=200.0, help="ms after which a copy counts as lost")
    p.add_argument("--cost", type=float, default=0.1, help="LinUCB penalty for sending a second copy")
    p.add_argument("--leo-b", action="store_true", help="emulate a LEO-like link on path B (SIMULATED)")
    p.add_argument("--leo-seed", type=int, default=0)
    p.add_argument("--json", action="store_true", help="print one JSON line per event, then the summary")
    return p


def main(argv=None):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    p = parser()
    a = p.parse_args(argv)
    # Checked first: every comparison with NaN is False, so the range checks below would let it through.
    if not all(math.isfinite(v) for v in (a.interval, a.deadline, a.timeout, a.cost, a.wait)):
        p.error("--interval, --deadline, --timeout, --cost and --wait must be finite numbers")
    if (a.count < 1 or a.interval <= 0 or a.deadline <= 0 or a.timeout < a.deadline or a.wait < 0
            or a.size < HDR.size):
        p.error("need count >= 1, interval > 0, deadline > 0, timeout >= deadline, wait >= 0 and size >= %d" % HDR.size)
    out = run(a, (lambda o: print(json.dumps(o), flush=True)) if a.json else None)
    if a.json:
        print(json.dumps(out), flush=True)
        return
    q = out["policy"]
    L = ["", "=== 策略 %s ｜ %d 個 Packet ID，期限 %g ms，間隔 %g ms ===" % (q["name"], a.count, a.deadline, a.interval * 1000), ""]
    for t, v in out["paths"].items():
        r = v["rtt"] or {}
        L.append("路徑 %s%s  送出 %5d  回送 %5d  RTT 中位 %s ms  p95 %s ms" % (
            t, "（模擬 LEO）" if t == "B" and a.leo_b else "", v["sent"], v["echoed"],
            "-" if not r else "%.2f" % r["p50_ms"], "-" if not r else "%.2f" % r["p95_ms"]))
    L += ["", "期限內送達：%.2f%%　每封包平均副本數：%.2f" % (q["within_deadline_pct"], q["copies_per_packet"]),
          "決策次數：只走 A %d、只走 B %d、兩路都送 %d" % (q["actions"]["A"], q["actions"]["B"], q["actions"]["AB"])]
    if q["vetoes"]:
        L.append("規則層改為兩路都送：路徑連續失敗 %d 次、另一路太久沒有回音 %d 次" % (q["vetoes"]["dead"], q["vetoes"]["probe"]))
    if out["errors"]:
        L.append("傳送／接收錯誤 %d 筆，第一筆：%s" % (len(out["errors"]), out["errors"][0]))
    L += ["", "註：RTT 為來回時間，非單向延遲；分流／複製在應用層，非 PDCP 層。" +
          ("路徑 B 的延遲與遺失為傳送端模擬，不是實測。" if a.leo_b else ""), ""]
    print("\n".join(L), flush=True)


if __name__ == "__main__":
    main()
