#!/usr/bin/env python3
"""Run the seven policies against one long netem schedule, each run starting on a cycle boundary.

The operator starts netem_schedule.py once on the sender host (sudo is theirs). This controller
reads its event log over SSH, then for each run starts an echo on the echo host and a sender on
the sender host so that the first packet leaves just after the start of a schedule cycle. Every
run spans --cycles-per-run whole cycles and is followed by --gap-cycles idle cycles, so every
policy meets the same sequence of phases. Tools are fed over SSH standard input and leave no file
on either host; all output lands in --out on this machine.

  netem_comparison.py control --out DIR                     # path A before netem is applied
  netem_comparison.py plan    --events-file PATH --out DIR  # print the slot times, start nothing
  netem_comparison.py run     --events-file PATH --out DIR --rounds 3

PATH is the --log file of netem_schedule.py on the sender host. --local runs both tools on this
machine instead (rehearsal against a stand-in tc), with PATH a local file.

Path A results are INJECTED_IP; path B is emulated at the sender (--leo-b), so it is SIMULATED.
"""
import argparse, json, math, os, shlex, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lab03-dualpath-tools"))
import live_viz  # noqa: E402  bundle() is the code path the live page uses for adaptive_send.py

POLICIES = ("only_a", "only_b", "split_2_3", "dup", "threshold+guard", "linucb", "linucb+guard")
SSH = ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=8"]
ECHO_LEAD_S = 8.0      # default: start the echo this long before the slot
SEND_DELAY_S = 1.0     # first packet this long after the cycle boundary, so it never falls in the previous severe phase


def command(host, args):
    """argv that runs `python3 - args` on host (or locally when host is None), script on stdin."""
    if host is None:
        return [sys.executable, "-"] + list(args)
    return SSH + [host, "python3 - " + shlex.join(args)]


def read_events(host, path):
    if host is None:
        with open(path, encoding="utf-8") as f:
            text = f.read()
    else:
        r = subprocess.run(SSH + [host, "cat " + shlex.quote(path)], capture_output=True, text=True, timeout=20)
        if r.returncode != 0:
            raise RuntimeError("讀不到事件紀錄：%s" % r.stderr.strip())
        text = r.stdout
    out = []
    for line in text.splitlines():
        try:
            out.append(json.loads(line))
        except ValueError:
            pass
    return out


def schedule_state(events):
    """(start utc, cycle seconds, ended) from netem_schedule.py events; raises if it never started."""
    start = next((e for e in events if e.get("event") == "schedule_start"), None)
    if start is None:
        raise RuntimeError("排程尚未開始（事件紀錄沒有 schedule_start）")
    return float(start["utc"]), float(start["cycle_s"]), any(e.get("event") == "schedule_end" for e in events)


def clock_offset(host):
    """Remote wall clock minus local wall clock, seconds (0 for local); SSH delay is split evenly."""
    if host is None:
        return 0.0
    t0 = time.time()
    r = subprocess.run(SSH + [host, "python3 -c 'import time; print(repr(time.time()))'"],
                       capture_output=True, text=True, timeout=20)
    t1 = time.time()
    return float(r.stdout.strip()) - (t0 + t1) / 2


def slots(start_utc, cycle_s, now_utc, count, cycles_per_run, gap_cycles, lead=ECHO_LEAD_S):
    """Remote utc of the cycle boundary each run starts on; the first boundary leaves time for the echo."""
    first = math.ceil((now_utc + lead + 2.0 - start_utc) / cycle_s)
    step = cycles_per_run + gap_cycles
    return [start_utc + (first + k * step) * cycle_s for k in range(count)]


def jobs(rounds):
    return [(rnd, pol) for rnd in range(1, rounds + 1) for pol in POLICIES]


def sleep_until(local_t):
    while True:
        left = local_t - time.time()
        if left <= 0:
            return
        time.sleep(min(left, 0.5))


def one_run(a, name, sender_args, duration_s):
    """Echo + one sender; returns the summary or None. Starts the sender at once."""
    echo_path, run_path = os.path.join(a.out, name + ".echo.jsonl"), os.path.join(a.out, name + ".sender.jsonl")
    echo_args = ["echo", "--json", "--duration", str(round(duration_s + ECHO_LEAD_S + 10, 1))]
    for b in sorted({a.dst_a, a.dst_b}):
        echo_args += ["--bind", b]
    with open(live_viz.TOOL, "rb") as tool, open(echo_path, "w") as ef:
        echo = subprocess.Popen(command(a.host_echo, echo_args), stdin=tool, stdout=ef, stderr=subprocess.STDOUT)
    for _ in range(100):
        if os.path.getsize(echo_path) > 0:
            break
        time.sleep(0.1)
    else:
        echo.kill()
        print("  echo 沒有啟動", flush=True)
        return None, echo
    return run_sender(a, run_path, sender_args), echo


def run_sender(a, run_path, sender_args):
    with open(run_path, "w") as rf:
        rc = subprocess.run(command(a.host_send, sender_args), input=live_viz.bundle().encode(),
                            stdout=rf, stderr=subprocess.STDOUT).returncode
    summary = None
    with open(run_path) as f:
        for line in f:
            try:
                o = json.loads(line)
            except ValueError:
                continue
            if o.get("event") == "summary":
                summary = o
    if rc != 0 or summary is None:
        print("  傳送端結束狀態 %s，summary %s" % (rc, "有" if summary else "缺少"), flush=True)
        return None
    return summary


def sender_args(a, policy, seed, count):
    return ["--policy", policy, "--dst-a", a.dst_a, "--dst-b", a.dst_b, "--count", str(count),
            "--interval", str(a.interval), "--size", "128", "--wait", "2", "--deadline", str(a.deadline),
            "--leo-b", "--leo-seed", str(seed), "--json"]


def show(name, s, extra=""):
    a, b = s["paths"].get("A"), s["paths"].get("B")
    f = lambda p: "-" if not p or not p["sent"] else "%d/%d" % (p["echoed"], p["sent"])
    q = s.get("policy") or {}
    print("%s  %-24s A %-11s B %-11s 期限內 %s%%  副本 %s%s" % (
        time.strftime("%H:%M:%SZ", time.gmtime()), name, f(a), f(b), q.get("within_deadline_pct", "-"),
        q.get("copies_per_packet", "-"), extra), flush=True)


def dead_a(s):
    a = s["paths"].get("A")
    return bool(a and a["sent"] >= 50 and a["echoed"] == 0)


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("what", choices=["control", "plan", "run"])
    p.add_argument("--out", required=True)
    p.add_argument("--events-file", help="netem_schedule.py 的 --log 檔（在傳送端主機上）")
    p.add_argument("--host-send", default="5g-linux2-audit")
    p.add_argument("--host-echo", default="5g-linux1-audit")
    p.add_argument("--local", action="store_true", help="兩端都在本機執行（預演用）")
    p.add_argument("--dst-a", default="172.16.0.1")
    p.add_argument("--dst-b", default="192.168.250.11")
    p.add_argument("--rounds", type=int, default=3)
    p.add_argument("--cycles-per-run", type=int, default=3)
    p.add_argument("--gap-cycles", type=int, default=1)
    p.add_argument("--interval", type=float, default=0.02)
    p.add_argument("--deadline", type=float, default=30.0)
    p.add_argument("--control-count", type=int, default=3000)
    p.add_argument("--echo-lead", type=float, default=ECHO_LEAD_S, help="echo 提前幾秒啟動")
    a = p.parse_args(argv)
    if a.local:
        a.host_send = a.host_echo = None
    os.makedirs(a.out, exist_ok=True)

    if a.what == "control":
        name = "control-only_a"
        dur = a.control_count * a.interval
        s, echo = one_run(a, name, sender_args(a, "only_a", 0, a.control_count), dur)
        echo.wait()
        if s is None:
            return 1
        show(name, s, "（未注入）")
        return 0

    if not a.events_file:
        p.error("plan 與 run 需要 --events-file")
    events = read_events(a.host_send, a.events_file)
    start, cycle_s, ended = schedule_state(events)
    if ended:
        print("排程已經結束，不執行。", flush=True)
        return 1
    offset = clock_offset(a.host_send)
    todo = jobs(a.rounds)
    times = slots(start, cycle_s, time.time() + offset, len(todo), a.cycles_per_run, a.gap_cycles, a.echo_lead)
    count = int(round(a.cycles_per_run * cycle_s / a.interval))
    last_end = times[-1] + a.cycles_per_run * cycle_s + 5
    print("循環 %.1f 秒，每輪 %d 個循環（%d 個封包），共 %d 輪；主機時鐘差 %+.3f 秒" % (
        cycle_s, a.cycles_per_run, count, len(todo), offset), flush=True)
    print("排程至少要持續到開始後 %.0f 秒（約 %d 個循環）；最後一輪約在 %s 結束" % (
        last_end - start, math.ceil((last_end - start) / cycle_s), time.strftime("%H:%M:%SZ", time.gmtime(last_end))), flush=True)
    for (rnd, pol), t in zip(todo, times):
        print("  r%d %-16s 開始於 %s" % (rnd, pol, time.strftime("%H:%M:%SZ", time.gmtime(t))))
    if a.what == "plan":
        return 0

    for (rnd, pol), t in zip(todo, times):
        name = "r%d-%s" % (rnd, pol.replace("+", "_"))
        _, _, ended = schedule_state(read_events(a.host_send, a.events_file))
        if ended:
            print("STOP：排程已經結束（%s 之前）" % name, flush=True)
            return 1
        if time.time() > t - offset - a.echo_lead:
            print("STOP：已經趕不上 %s 的開始時間；不讓它錯開相位執行" % name, flush=True)
            return 1
        sleep_until(t - offset - a.echo_lead)
        echo_path = os.path.join(a.out, name + ".echo.jsonl")
        # The echo only has to outlive the sender: lead + delay + sending + the sender's 2 s wait + margin.
        echo_s = a.echo_lead + SEND_DELAY_S + count * a.interval + 2 + 5
        echo_args = ["echo", "--json", "--duration", str(round(echo_s, 1))]
        for b in sorted({a.dst_a, a.dst_b}):
            echo_args += ["--bind", b]
        with open(live_viz.TOOL, "rb") as tool, open(echo_path, "w") as ef:
            echo = subprocess.Popen(command(a.host_echo, echo_args), stdin=tool, stdout=ef, stderr=subprocess.STDOUT)
        ready = time.time() + 5
        while os.path.getsize(echo_path) == 0 and time.time() < ready and echo.poll() is None:
            time.sleep(0.1)
        if os.path.getsize(echo_path) == 0:
            echo.kill()
            print("STOP：%s 的 echo 沒有啟動" % name, flush=True)
            return 1
        sleep_until(t - offset + SEND_DELAY_S)
        s = run_sender(a, os.path.join(a.out, name + ".sender.jsonl"), sender_args(a, pol, rnd, count))
        echo.wait()
        if s is None:
            print("STOP：%s 沒有 summary" % name, flush=True)
            return 1
        show(name, s)
        if dead_a(s):
            print("STOP：%s 的路徑 A 完全沒有回應，UE 可能已斷線" % name, flush=True)
            return 1
    with open(os.path.join(a.out, "netem-events.jsonl"), "w", encoding="utf-8") as f:
        for e in read_events(a.host_send, a.events_file):
            f.write(json.dumps(e, ensure_ascii=False) + "\n")
    print("DONE；可以請操作者按 Ctrl-C 結束排程，再執行：align_phases.py --events %s %s" % (
        os.path.join(a.out, "netem-events.jsonl"), os.path.join(a.out, "r*.sender.jsonl")), flush=True)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (RuntimeError, OSError, subprocess.TimeoutExpired) as e:
        print("STOP：%s" % e, flush=True)
        sys.exit(1)
