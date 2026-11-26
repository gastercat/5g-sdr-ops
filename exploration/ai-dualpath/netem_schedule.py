#!/usr/bin/env python3
"""Apply a time-varying tc netem schedule to one interface, then always remove it.

  python3 netem_schedule.py schedules/example-cycle.json --dev tun_srsue --cycles 3 --dry-run
  sudo python3 netem_schedule.py schedules/example-cycle.json --dev tun_srsue --cycles 3 \\
      --log run-<policy>-<n>.events.jsonl

Every run starts at phase 0 and writes one JSON line per event (schedule_start, phase,
schedule_end) with wall-clock "utc" and "t" (seconds since start on the monotonic clock),
so packet logs can be aligned with the phase that was active.

Safety:
- the schedule's netem arguments are checked against a keyword allow-list and handed to tc
  as an argument list, never through a shell;
- the run stops without touching the interface if it is missing or its root qdisc is
  already netem;
- the root qdisc is deleted on normal end, Ctrl-C, SIGTERM, SIGHUP and any error, and
  `tc qdisc show` is read again to confirm; if removal cannot be confirmed the exit status
  is 1 and the manual restore command is printed on stderr;
- this tool never calls sudo; whoever runs it supplies the privileges.

Results produced under this schedule are INJECTED_IP degradation, not OTA or radio impairment.
"""
import argparse, hashlib, json, math, re, signal, subprocess, sys, time

MAX_CYCLE_S = 3600.0          # one pass through all phases
MAX_RUN_S = 6 * 3600.0        # a whole run, whichever of --cycles / --duration is used
KEYWORDS = {"loss", "delay", "gemodel", "state", "duplicate", "reorder", "corrupt", "rate"}
VALUE = re.compile(r"^[0-9]+(\.[0-9]+)?(%|ms|us|kbit|mbit)?$")
DEV = re.compile(r"^[A-Za-z0-9_.:][A-Za-z0-9_.:-]{0,14}$")

EXIT_OK, EXIT_CLEANUP, EXIT_USAGE, EXIT_REFUSED, EXIT_TC = 0, 1, 2, 3, 4


class ScheduleError(ValueError):
    pass


class Stop(Exception):
    """Raised from the signal handler so the finally-block cleanup runs."""

    def __init__(self, signum):
        super().__init__(signum)
        self.signum = signum


def netem_tokens(text):
    if not isinstance(text, str) or not text.strip():
        raise ScheduleError("netem 參數必須是非空字串")
    tokens = text.split()
    for tok in tokens:
        if tok not in KEYWORDS and not VALUE.match(tok):
            raise ScheduleError("netem 參數含不允許的 token：%r" % tok)
    if tokens[0] not in KEYWORDS:
        raise ScheduleError("netem 參數必須以關鍵字開頭：%r" % text)
    return tokens


def load_schedule(raw):
    """Validate schedule JSON bytes and return (schedule dict, sha256 hex)."""
    sha = hashlib.sha256(raw).hexdigest()
    try:
        doc = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as e:
        raise ScheduleError("排程檔不是合法的 JSON：%s" % e)
    if not isinstance(doc, dict):
        raise ScheduleError("排程檔頂層必須是物件")
    name = doc.get("name")
    if not isinstance(name, str) or not name:
        raise ScheduleError("缺少 name")
    repeat = doc.get("repeat", True)
    if not isinstance(repeat, bool):
        raise ScheduleError("repeat 必須是 true 或 false")
    phases = doc.get("phases")
    if not isinstance(phases, list) or not phases:
        raise ScheduleError("phases 必須是非空陣列")
    seen, out, total = set(), [], 0.0
    for i, p in enumerate(phases):
        if not isinstance(p, dict):
            raise ScheduleError("phases[%d] 必須是物件" % i)
        label = p.get("label")
        if not isinstance(label, str) or not label:
            raise ScheduleError("phases[%d] 缺少 label" % i)
        if label in seen:
            raise ScheduleError("label 重複：%r" % label)
        seen.add(label)
        sec = p.get("seconds")
        if isinstance(sec, bool) or not isinstance(sec, (int, float)) or not math.isfinite(sec) or sec <= 0:
            raise ScheduleError("phases[%d].seconds 必須是大於 0 的有限數值" % i)
        tokens = netem_tokens(p.get("netem"))
        total += float(sec)
        out.append({"label": label, "seconds": float(sec), "netem": " ".join(tokens), "tokens": tokens})
    if total > MAX_CYCLE_S:
        raise ScheduleError("一個循環 %.1f 秒，超過上限 %.0f 秒" % (total, MAX_CYCLE_S))
    return {"name": name, "repeat": repeat, "phases": out, "cycle_s": total}, sha


def timeline(sched, cycles=None, duration=None):
    """Return ([(offset_s, cycle, index)], end_s): each phase start before the end of the run."""
    if (cycles is None) == (duration is None):
        raise ScheduleError("--cycles 與 --duration 必須二選一")
    if cycles is not None:
        if cycles < 1:
            raise ScheduleError("--cycles 必須至少為 1")
        end = cycles * sched["cycle_s"]
    else:
        if not math.isfinite(duration) or duration <= 0:
            raise ScheduleError("--duration 必須是大於 0 的有限數值")
        end = float(duration)
    if not sched["repeat"] and end > sched["cycle_s"] + 1e-9:
        raise ScheduleError("排程設定 repeat=false，執行長度不可超過一個循環（%.1f 秒）" % sched["cycle_s"])
    if end > MAX_RUN_S:
        raise ScheduleError("執行長度 %.1f 秒，超過上限 %.0f 秒" % (end, MAX_RUN_S))
    steps, t, cycle = [], 0.0, 0
    while t < end - 1e-9:
        for i, p in enumerate(sched["phases"]):
            if t >= end - 1e-9:
                break
            steps.append((t, cycle, i))
            t += p["seconds"]
        cycle += 1
    return steps, end


class Runner:
    def __init__(self, tc, dev, emit, clock=time.monotonic, sleep=time.sleep, wall=time.time, err=sys.stderr):
        self.tc, self.dev, self.emit = list(tc), dev, emit
        self.clock, self.sleep, self.wall, self.err = clock, sleep, wall, err

    def call(self, *args):
        try:
            r = subprocess.run(self.tc + list(args), capture_output=True, text=True, timeout=15)
        except (OSError, subprocess.TimeoutExpired) as e:
            return 127, "", str(e)
        return r.returncode, r.stdout, r.stderr

    def root_is_netem(self):
        """True / False, or None when the interface cannot be read (gone or never existed)."""
        rc, out, _ = self.call("qdisc", "show", "dev", self.dev)
        if rc != 0:
            return None
        return any(line.startswith("qdisc netem ") and " root " in line + " " for line in out.splitlines())

    def restore_hint(self):
        return "tc qdisc del dev %s root && tc qdisc show dev %s" % (self.dev, self.dev)

    def run(self, sched, sha, steps, end):
        start = self.clock()
        t = lambda: round(self.clock() - start, 3)
        base = {"dev": self.dev, "schedule": sched["name"], "sha256": sha}
        state = self.root_is_netem()
        if state is None:
            self.err.write("找不到介面 %s，未做任何變更。\n" % self.dev)
            self.emit(dict(event="schedule_refused", reason="no_device", utc=self.wall(), **base))
            return EXIT_REFUSED
        if state:
            self.err.write("%s 的 root qdisc 已經是 netem，不覆蓋，未做任何變更。\n" % self.dev)
            self.emit(dict(event="schedule_refused", reason="netem_present", utc=self.wall(), **base))
            return EXIT_REFUSED

        added = attempted = False
        reason, code = "error", EXIT_TC
        old = {s: signal.signal(s, self._stop) for s in (signal.SIGTERM, signal.SIGHUP)}
        try:
            for offset, cycle, idx in steps:
                wait = start + offset - self.clock()
                if wait > 0:
                    self.sleep(wait)
                p = sched["phases"][idx]
                verb = "change" if added else "add"
                attempted = True
                rc, _, stderr = self.call("qdisc", verb, "dev", self.dev, "root", "netem", *p["tokens"])
                if rc != 0:
                    self.err.write("tc qdisc %s 失敗（%d）：%s\n" % (verb, rc, stderr.strip()))
                    break
                if not added:
                    added = True
                    start = self.clock()            # phase 0 is in force from here; later phases follow it
                    self.emit(dict(event="schedule_start", utc=self.wall(), t=t(), cycle_s=sched["cycle_s"],
                                   planned_end_s=round(end, 3), **base))
                self.emit({"event": "phase", "utc": self.wall(), "t": t(), "planned_t": round(offset, 3), "cycle": cycle,
                           "index": idx, "label": p["label"], "netem": p["netem"]})
            else:
                wait = start + end - self.clock()
                if wait > 0:
                    self.sleep(wait)
                reason, code = "completed", EXIT_OK
        except KeyboardInterrupt:
            reason, code = "interrupted", 128 + signal.SIGINT
        except Stop as s:
            reason, code = "signal_%s" % signal.Signals(s.signum).name, 128 + s.signum
        except Exception as e:  # noqa: BLE001  any failure still has to remove the qdisc
            self.err.write("執行中發生例外：%r\n" % e)
            reason, code = "error", EXIT_TC
        finally:
            for s in old:                       # cleanup must not be cut short by a second signal
                signal.signal(s, signal.SIG_IGN)
            prev_int = signal.signal(signal.SIGINT, signal.SIG_IGN)
            try:
                removed, note = self.cleanup(attempted)
            finally:
                signal.signal(signal.SIGINT, prev_int)
                for s, h in old.items():
                    signal.signal(s, h)
        self.emit({"event": "schedule_end", "utc": self.wall(), "t": t(), "reason": reason,
                   "removed": removed, "note": note})
        if not removed:
            self.err.write("無法確認 netem 已移除，請手動執行：\n  %s\n" % self.restore_hint())
            return EXIT_CLEANUP
        return code

    def _stop(self, signum, _frame):
        raise Stop(signum)

    def cleanup(self, attempted):
        """Remove the netem root qdisc if this run may have added it; return (removed, note).

        The preflight saw no netem root, so a netem root found here is ours, even when a signal
        arrived between a successful add and its bookkeeping. Anything else is left untouched.
        """
        if not attempted:
            return True, "nothing_added"
        state = self.root_is_netem()
        if state is None:
            return True, "device_gone"       # the qdisc disappears with tun_srsue when srsue exits
        if not state:
            return True, "nothing_added"
        rc, _, stderr = self.call("qdisc", "del", "dev", self.dev, "root")
        state = self.root_is_netem()
        if state is None:
            return True, "device_gone"       # the qdisc disappears with tun_srsue when srsue exits
        if state:
            self.err.write("tc qdisc del 失敗（%d）：%s\n" % (rc, stderr.strip()))
            return False, "netem_still_present"
        return True, "deleted" if rc == 0 else "absent_after_failed_del"


def parser():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("schedule", help="排程 JSON 檔")
    ap.add_argument("--dev", required=True, help="要掛 netem 的介面，例如 tun_srsue")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--cycles", type=int, help="完整循環次數")
    g.add_argument("--duration", type=float, help="執行秒數")
    ap.add_argument("--log", help="事件紀錄 JSONL；檔案已存在時拒絕覆寫。預設寫到 stdout")
    ap.add_argument("--dry-run", action="store_true", help="只印出 tc 指令與時間點，不碰介面")
    ap.add_argument("--tc", default="tc", help="tc 執行檔（測試用）")
    return ap


def main(argv=None, tc_prefix=None, **runner_kw):
    a = parser().parse_args(argv)
    err = runner_kw.get("err", sys.stderr)
    if not DEV.match(a.dev):
        err.write("介面名稱不合法：%r\n" % a.dev)
        return EXIT_USAGE
    try:
        with open(a.schedule, "rb") as f:
            sched, sha = load_schedule(f.read())
        steps, end = timeline(sched, a.cycles, a.duration)
    except (OSError, ScheduleError) as e:
        err.write("%s\n" % e)
        return EXIT_USAGE
    tc = list(tc_prefix or []) + [a.tc]

    if a.dry_run:
        out = runner_kw.get("out", sys.stdout)
        for n, (offset, cycle, idx) in enumerate(steps):
            p = sched["phases"][idx]
            cmd = tc + ["qdisc", "change" if n else "add", "dev", a.dev, "root", "netem"] + p["tokens"]
            out.write(json.dumps({"event": "dry_run", "planned_t": round(offset, 3), "cycle": cycle, "index": idx,
                                  "label": p["label"], "cmd": cmd}, ensure_ascii=False) + "\n")
        out.write(json.dumps({"event": "dry_run", "planned_t": round(end, 3),
                              "cmd": tc + ["qdisc", "del", "dev", a.dev, "root"]}) + "\n")
        return EXIT_OK

    try:
        log = open(a.log, "x", encoding="utf-8") if a.log else runner_kw.get("out", sys.stdout)
    except OSError as e:
        err.write("無法建立紀錄檔：%s\n" % e)
        return EXIT_USAGE

    def emit(obj):
        log.write(json.dumps(obj, ensure_ascii=False) + "\n")
        log.flush()

    try:
        return Runner(tc, a.dev, emit, **{k: v for k, v in runner_kw.items() if k != "out"}).run(sched, sha, steps, end)
    finally:
        if a.log:
            log.close()


if __name__ == "__main__":
    sys.exit(main())
