#!/usr/bin/env python3
"""Lab03 dual-path UDP probe, demo variant with human-readable output.

Same measurement logic as dualpath_probe.py (the version used for the 2026-11-12
evidence, kept unchanged). This file only changes how results are printed:
readable lines and a summary table by default, the original JSON with --json.

Stdlib only, no root needed.

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
import argparse, heapq, json, random, select, socket, struct, sys, time

HDR = struct.Struct("!4sIBd")  # magic, packet id, path tag, sender monotonic time
MAGIC = b"L3DP"


def say(a, obj, text):
    print(json.dumps(obj) if a.json else text, flush=True)


def fmt(v, nd=2):
    return "-" if v is None else ("%." + str(nd) + "f") % v


def run_echo(a):
    names = {"A": a.name_a, "B": a.name_b}
    socks = {}
    for addr in a.bind:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.bind((addr, a.port))
        socks[s] = addr
    say(a, {"event": "echo_start", "bind": a.bind, "port": a.port, "utc": time.time()},
        "接收端啟動，監聽 %s，%d 秒後自動結束" % ("、".join(a.bind), a.duration))
    seen = {}
    last = None
    total_ids = 0
    end = time.monotonic() + a.duration
    n = 0
    sim = a.sim_a_ms is not None or a.sim_a_loss > 0
    if sim:
        say(a, {"event": "sim", "path": "A", "delay_ms": a.sim_a_ms, "jitter_ms": a.sim_a_jitter, "loss_pct": a.sim_a_loss},
            "【模擬】路徑 A 加入人為延遲／遺失，僅供預演，不是 OTA 實測")
    due = []
    while time.monotonic() < end:
        wait = 0.5 if not due else max(0.0, min(0.5, due[0][0] - time.monotonic()))
        r, _, _ = select.select(list(socks), [], [], wait)
        while due and due[0][0] <= time.monotonic():
            _, _, s2, d2, src2 = heapq.heappop(due)
            s2.sendto(d2, src2)
        for s in r:
            data, src = s.recvfrom(2048)
            if len(data) < HDR.size or data[:4] != MAGIC:
                continue
            _, pid, tag, _ = HDR.unpack(data[:HDR.size])
            if sim and chr(tag) == "A":
                if random.random() * 100 < a.sim_a_loss:
                    continue
                dly = max(0.0, random.gauss(a.sim_a_ms or 0.0, a.sim_a_jitter)) / 2000.0
                heapq.heappush(due, (time.monotonic() + 2 * dly, n, s, data, src))
            else:
                s.sendto(data, src)
            n += 1
            now = time.monotonic()
            if last is not None and now - last > 1.5:   # idle gap: a new sender run started
                total_ids += len(seen)
                seen = {}
                if not a.json:
                    print("-" * 60 + " 新的一輪", flush=True)
            last = now
            seen[pid] = seen.get(pid, 0) + 1
            say(a, {"event": "rx", "id": pid, "path": chr(tag), "local": socks[s], "src": src[0], "utc": time.time()},
                "ID %5d  路徑 %s（%s）  進入介面 %-15s 來源 %-15s%s" % (
                    pid, chr(tag), names.get(chr(tag), "?"), socks[s], src[0],
                    "  ← 同 ID 第 %d 份" % seen[pid] if seen[pid] > 1 else ""))
    say(a, {"event": "echo_end", "echoed": n},
        "接收端結束：共收到 %d 個封包（各輪不重複 Packet ID 合計 %d 個）" % (n, total_ids + len(seen)))


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
            if pid not in rx[chr(tag)]:
                rx[chr(tag)][pid] = (now - t0) * 1000.0
                if a.stream:
                    print(json.dumps({"event": "rtt", "id": pid, "path": chr(tag),
                                      "rtt_ms": round(rx[chr(tag)][pid], 3)}), flush=True)

    say(a, {"event": "send_start", "mode": a.mode, "ratio": a.ratio, "count": a.count,
            "interval_s": a.interval, "size": a.size, "paths": paths, "utc": time.time()},
        "傳送開始：模式 %s，%d 個 Packet ID，間隔 %g ms，約需 %.0f 秒…" % (
            a.mode, a.count, a.interval * 1000, a.count * a.interval + a.wait))
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
                if a.stream:
                    print(json.dumps({"event": "tx", "id": pid, "path": tag}), flush=True)
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
    if a.json:
        # demo variant only: per-packet RTT so a viewer can plot it
        out["per_packet"] = {t: [[i, round(rx[t][i], 3)] for i in sorted(rx[t])] for t in paths}
        out["size"] = a.size
        out["interval_s"] = a.interval
        out["ratio"] = a.ratio
        print(json.dumps(out), flush=True)
        return
    names = {"A": a.name_a, "B": a.name_b}
    title = {"baseline": "Baseline（單路）", "split": "Split（分流 A:B = %s）" % a.ratio,
             "dup": "Duplication（雙路複製）"}[a.mode]
    L = ["", "=== %s ｜ %d 個 Packet ID，%d bytes，間隔 %g ms ===" % (title, len(ids), a.size, a.interval * 1000), "",
         "%-14s %6s %6s %8s %9s %9s %9s %9s" % ("路徑", "送出", "回送", "遺失%", "RTT中位", "RTT p95", "RTT最大", "jitter"),
         "-" * 78]
    for t in paths:
        p = out["paths"][t]
        r = p["rtt"] or {}
        L.append("%-14s %6d %6d %8s %9s %9s %9s %9s" % (
            "%s %s" % (t, names[t]), p["sent"], p["echoed"], fmt(p["loss_pct"], 1),
            fmt(r.get("p50_ms")), fmt(r.get("p95_ms")), fmt(r.get("max_ms")), fmt(p["jitter_ms"])))
        if p["sent_ids"]:
            L.append("    前幾個 Packet ID：%s%s" % (" ".join(str(i) for i in p["sent_ids"][:10]),
                                               " …" if len(p["sent_ids"]) > 10 else ""))
    d = out["dedup"]
    r = d["rtt"] or {}
    L += ["", "合併結果（以 Packet ID 去重）",
          "  送達的不重複 ID：%d / %d（遺失 %s%%）" % (d["delivered_unique"], len(ids), fmt(d["loss_pct"], 1))]
    if a.mode == "dup":
        L += ["  收到副本總數：%d，重複而丟棄：%d" % (d["copies_received_total"], d["duplicates_discarded"]),
              "  每個 ID 較短 RTT 的路徑：" + "，".join("%s %s %d" % (t, names[t], d["first_arrival_by_path"][t]) for t in paths),
              "  每個 ID 取較短 RTT 後：中位 %s ms，p95 %s ms，最大 %s ms" % (
                  fmt(r.get("p50_ms")), fmt(r.get("p95_ms")), fmt(r.get("max_ms")))]
    else:
        L.append("  合併 RTT：中位 %s ms，p95 %s ms，最大 %s ms" % (
            fmt(r.get("p50_ms")), fmt(r.get("p95_ms")), fmt(r.get("max_ms"))))
    if d["missing_ids"]:
        L.append("  未送達的 ID：%s%s" % (" ".join(str(i) for i in d["missing_ids"][:20]),
                                     " …" if len(d["missing_ids"]) > 20 else ""))
    if errors:
        L.append("  傳送／接收錯誤 %d 筆，第一筆：%s" % (len(errors), errors[0]))
    L += ["", "註：RTT 為來回時間（ms），非單向延遲；分流／複製在應用層，非 PDCP 層。", ""]
    print("\n".join(L), flush=True)


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
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
    for q in (e, s):
        q.add_argument("--json", action="store_true", help="print the original JSON lines instead")
        q.add_argument("--name-a", default="OTA")
        q.add_argument("--name-b", default="有線")
    e.add_argument("--sim-a-ms", type=float, default=None, help="rehearsal only: simulated round-trip delay on path A")
    e.add_argument("--sim-a-jitter", type=float, default=0.0)
    e.add_argument("--sim-a-loss", type=float, default=0.0, help="rehearsal only: simulated loss %% on path A")
    s.add_argument("--stream", action="store_true", help="with --json: also print one line per packet sent/echoed")
    a = p.parse_args()
    run_echo(a) if a.role == "echo" else run_send(a)


if __name__ == "__main__":
    main()
