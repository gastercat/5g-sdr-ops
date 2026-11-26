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
- rate, corrupt and reorder are not reset by `tc qdisc change` when a phase omits them, so a
  schedule using any of them must name it in every phase;
- the run stops without touching the interface if it is missing or its root qdisc is
  already netem;
- the root qdisc is deleted on normal end, Ctrl-C, SIGTERM, SIGHUP and any error, and
  `tc qdisc show` is read again to confirm; if removal cannot be confirmed the exit status
  is 1 and the manual restore command is printed on stderr;
- a failed add leaves the interface alone, so a netem someone else added after the preflight
  is never deleted;
- this tool never calls sudo; whoever runs it supplies the privileges.

Exit status: 0 completed, 1 removal unconfirmed, 2 usage, 3 refused without change, 4 tc error,
128+signal number when interrupted (130 SIGINT, 143 SIGTERM, 129 SIGHUP) with the qdisc removed.

Results produced under this schedule are INJECTED_IP degradation, not OTA or radio impairment.
"""
import argparse, hashlib, json, math, re, signal, subprocess, sys, time

MIN_PHASE_S = 0.5             # shorter phases would mostly be tc call time, and a typo could
                              # otherwise expand into millions of steps
MAX_CYCLE_S = 3600.0          # one pass through all phases
MAX_RUN_S = 6 * 3600.0        # a whole run, whichever of --cycles / --duration is used
KEYWORDS = {"loss", "delay", "gemodel", "state", "duplicate", "reorder", "corrupt", "rate"}
VALUE = re.compile(r"^[0-9]+(\.[0-9]+)?(%|ms|us|kbit|mbit)?$")
DEV = re.compile(r"^[A-Za-z0-9_.:][A-Za-z0-9_.:-]{0,14}$")
# `tc qdisc change` resends these netem attributes only when the phase names them, and the kernel
# keeps the previous value when an attribute is absent, so they can leak into later phases
# (observed on Linux2, TER NM-11, which also saw the delay value reset). The loss, delay and
# duplicate values themselves are in the always-sent base options and reset. The loss model is
# expected to fall back to random when no gemodel/state is given (NEEDS_CONFIRMATION: not tested).
STICKY = ("rate", "corrupt", "reorder")
# The loss, delay and duplicate correlations travel in a separate attribute that is likewise sent
# only when written, so they are expected to leak the same way (not yet tested on the host). They
# are refused outright: the most values each keyword may take is its own value(s), no correlation.
# (`loss gemodel ...` / `loss state ...` put their values after the gemodel/state keyword.)
NO_CORR = {"loss": 1, "delay": 2, "duplicate": 1}

EXIT_OK, EXIT_CLEANUP, EXIT_USAGE, EXIT_REFUSED, EXIT_TC = 0, 1, 2, 3, 4
RC_TIMEOUT, RC_NOEXEC = 124, 127    # Runner.call() results that are not tc's own exit status
HANDLED = (signal.SIGINT, signal.SIGTERM, signal.SIGHUP)


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
    i = 0
    while i < len(tokens):                      # count the values that follow each keyword
        j = i + 1
        while j < len(tokens) and tokens[j] not in KEYWORDS:
            j += 1
        if tokens[i] in NO_CORR and j - i - 1 > NO_CORR[tokens[i]]:
            raise ScheduleError("netem 參數 %r 帶有相關係數（%s 之後的值太多）；tc qdisc change 會沿用沒寫出的"
                                "相關係數，本工具不接受" % (text, tokens[i]))
        i = j
    return tokens


def check_sticky(phases):
    """Raise ScheduleError unless every STICKY keyword used by any phase is named in every phase.

    Conservative on purpose: it also rejects some safe schedules (e.g. a first phase without
    rate followed by one with it), but each phase then states its full setting on its own and
    nothing can carry over, including the wrap from the last phase back to phase 0.
    """
    used = [k for k in STICKY if any(k in p["tokens"] for p in phases)]
    for p in phases:
        missing = [k for k in used if k not in p["tokens"]]
        if missing:
            raise ScheduleError("階段 %r 缺少 %s：只要有任一階段使用這些參數，每個階段都必須寫出"
                                "（例如 rate 0、corrupt 0%%），否則 tc qdisc change 會沿用上一階段的值"
                                % (p["label"], "、".join(missing)))


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
        if isinstance(sec, bool) or not isinstance(sec, (int, float)) or not math.isfinite(sec) or sec < MIN_PHASE_S:
            raise ScheduleError("phases[%d].seconds 必須是至少 %.1f 的有限數值" % (i, MIN_PHASE_S))
        tokens = netem_tokens(p.get("netem"))
        total += float(sec)
        out.append({"label": label, "seconds": float(sec), "netem": " ".join(tokens), "tokens": tokens})
    if total > MAX_CYCLE_S:
        raise ScheduleError("一個循環 %.1f 秒，超過上限 %.0f 秒" % (total, MAX_CYCLE_S))
    check_sticky(out)
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
    def __init__(self, tc, dev, emit, clock=time.monotonic, sleep=time.sleep, wall=time.time, err=sys.stderr,
                 tc_timeout=15.0):
        self.tc, self.dev, self.emit = list(tc), dev, emit
        self.clock, self.sleep, self.wall, self.err = clock, sleep, wall, err
        self.tc_timeout = tc_timeout
        self._fired = False

    def call(self, *args):
        """Run tc; return (rc, stdout, stderr). rc is RC_TIMEOUT when tc was killed after
        tc_timeout seconds (the kernel may already have applied the change) and RC_NOEXEC when
        tc could not be started (nothing was applied)."""
        try:
            r = subprocess.run(self.tc + list(args), capture_output=True, text=True, timeout=self.tc_timeout)
        except subprocess.TimeoutExpired as e:
            return RC_TIMEOUT, "", "timeout after %ss: %s" % (self.tc_timeout, e)
        except OSError as e:
            return RC_NOEXEC, "", str(e)
        return r.returncode, r.stdout, r.stderr

    def qdisc_state(self):
        """Root qdisc state: "netem" or "other" when read, "gone" when tc says the device does not
        exist, "unknown" for any other failure (timeout, tc missing, unexpected error).

        Only "gone" may be taken as proof that no netem is left; "unknown" never is.
        """
        rc, out, stderr = self.call("qdisc", "show", "dev", self.dev)
        if rc != 0:
            return "gone" if "Cannot find device" in stderr else "unknown"
        netem = any(line.startswith("qdisc netem ") and " root " in line + " " for line in out.splitlines())
        return "netem" if netem else "other"

    def restore_hint(self):
        return "tc qdisc del dev %s root && tc qdisc show dev %s" % (self.dev, self.dev)

    def run(self, sched, sha, steps, end):
        start = self.clock()
        t = lambda: round(self.clock() - start, 3)
        base = {"dev": self.dev, "schedule": sched["name"], "sha256": sha}
        try:                                    # nothing is changed before the first add
            refused = self.preflight(base)
        except KeyboardInterrupt:
            self.err.write("執行前被中斷，未做任何變更。\n")
            return 128 + signal.SIGINT
        except Exception as e:  # noqa: BLE001  e.g. the log cannot be written
            self.err.write("執行前發生例外，未做任何變更：%r\n" % e)
            return EXIT_REFUSED
        if refused:
            return EXIT_REFUSED

        # added: an add succeeded. adding: an add was issued and did not come back with a known
        # result (still in flight when a signal arrived, or killed on timeout), so the kernel may
        # have applied it. Cleanup acts only in these two cases; an add that tc itself rejected
        # leaves whatever is on the interface (possibly someone else's netem) alone.
        added = adding = False
        reason, code, error = "error", EXIT_TC, None
        self._fired = False
        old = {}
        try:
            try:
                for s in HANDLED:
                    old[s] = signal.signal(s, self._on_signal)
                for offset, cycle, idx in steps:
                    wait = start + offset - self.clock()
                    if wait > 0:
                        self.sleep(wait)
                    p = sched["phases"][idx]
                    verb = "change" if added else "add"
                    adding = not added
                    rc, _, stderr = self.call("qdisc", verb, "dev", self.dev, "root", "netem", *p["tokens"])
                    if rc != RC_TIMEOUT:
                        adding = False
                    if rc != 0:
                        self.err.write("tc qdisc %s 失敗（%d）：%s\n" % (verb, rc, stderr.strip()))
                        break
                    if not added:
                        added = True
                        start = self.clock()        # phase 0 is in force from here; later phases follow it
                        self.emit(dict(event="schedule_start", utc=self.wall(), t=t(), cycle_s=sched["cycle_s"],
                                       planned_end_s=round(end, 3), **base))
                    self.emit({"event": "phase", "utc": self.wall(), "t": t(), "planned_t": round(offset, 3),
                               "cycle": cycle, "index": idx, "label": p["label"], "netem": p["netem"]})
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
                reason, code, error = "error", EXIT_TC, e
            finally:
                # Plain assignment first: no call before it, so no signal handler can run here.
                # From now on _on_signal only returns, so nothing can cut cleanup short.
                self._fired = True
                for s in old:                   # tc children inherit SIG_IGN, so a Ctrl-C sent to the
                    signal.signal(s, signal.SIG_IGN)   # process group cannot kill the del either
            removed, note = self.cleanup(added or adding)
            if error is not None:
                self.err.write("執行中發生例外：%r\n" % error)
            try:
                self.emit({"event": "schedule_end", "utc": self.wall(), "t": t(), "reason": reason,
                           "removed": removed, "note": note})
            except Exception as e:  # noqa: BLE001  the exit status below must still describe the cleanup
                self.err.write("無法寫入 schedule_end：%r\n" % e)
            if not removed:
                self.err.write("無法確認 netem 已移除，請手動執行：\n  %s\n" % self.restore_hint())
                return EXIT_CLEANUP
            return code
        finally:                                # handlers come back only once the exit code is settled
            for s, h in old.items():
                signal.signal(s, h)

    def preflight(self, base):
        """Return True (after logging why) when the run must stop without touching the interface."""
        state = self.qdisc_state()
        if state == "other":
            return False
        msg, reason = {
            "gone": ("找不到介面 %s，未做任何變更。", "no_device"),
            "unknown": ("無法讀取 %s 的 qdisc（tc 失敗或逾時），未做任何變更。", "state_unknown"),
            "netem": ("%s 的 root qdisc 已經是 netem，不覆蓋，未做任何變更。", "netem_present"),
        }[state]
        self.err.write(msg % self.dev + "\n")
        self.emit(dict(event="schedule_refused", reason=reason, utc=self.wall(), **base))
        return True

    def _on_signal(self, signum, _frame):
        """Turn the first SIGINT/SIGTERM/SIGHUP of a run into an exception; ignore the rest.

        One exception per run is enough to leave the schedule loop. A second one could land in
        an except or finally block and skip cleanup, so later signals are dropped.
        """
        if self._fired:
            return
        self._fired = True
        if signum == signal.SIGINT:
            raise KeyboardInterrupt
        raise Stop(signum)

    def cleanup(self, may_own):
        """Remove the netem root qdisc if this run may have added it; return (removed, note).

        may_own is true after a successful add, and also when an add did not come back with a
        known result: still in flight when a signal arrived, or killed on timeout (RC_TIMEOUT).
        The kernel may have applied such an add, and the preflight saw no netem root, so a netem
        root found here is ours. Only an add that tc itself rejected, or no add at all, leaves the
        interface untouched; do not treat a timeout as a rejection. A state that cannot be read
        is never counted as removed: without a confirmed netem root nothing is deleted, and the
        caller exits 1.
        """
        if not may_own:
            return True, "nothing_added"
        state = self.qdisc_state()
        if state == "gone":
            return True, "device_gone"       # the qdisc disappears with tun_srsue when srsue exits
        if state == "other":
            return True, "nothing_added"
        if state == "unknown":
            self.err.write("無法讀取 %s 的 qdisc，未執行刪除。\n" % self.dev)
            return False, "state_unknown"
        rc, _, stderr = self.call("qdisc", "del", "dev", self.dev, "root")
        state = self.qdisc_state()
        if state == "gone":
            return True, "device_gone"
        if state == "other":
            return True, "deleted" if rc == 0 else "absent_after_failed_del"
        self.err.write("tc qdisc del 失敗（%d）：%s\n" % (rc, stderr.strip()))
        return False, "netem_still_present" if state == "netem" else "state_unknown"


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
    try:
        sys.exit(main())
    except KeyboardInterrupt:      # Ctrl-C before the run started: nothing was changed
        sys.exit(128 + signal.SIGINT)
