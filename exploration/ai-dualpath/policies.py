#!/usr/bin/env python3
"""Per-packet path policies: send on A, on B, or on both ("AB").

A policy sees only the echoes of copies it sent, when they arrive. It never sees
the outcome of a path it did not use, except Oracle, which is an upper bound and
cannot be built.

  OnlyA, OnlyB, Split, Dup   fixed policies (Split and Dup match dualpath_demo.py)
  Threshold                  hand-written rule on recent RTT and miss rate
  LinUCB                     contextual bandit, one linear model per action
  Guarded                    rule layer over another policy: the policy proposes,
                             the rules may override with "AB". This follows the
                             AI-proposal / symbolic-guard / deterministic-fallback
                             split in docs/research/6g-ntn-handover/.

LinUCB needs NumPy; everything else is stdlib.
"""


class LinkState:
    """What the sender knows about each path from echoes so far."""

    def __init__(self, deadline_ms, alpha=0.2):
        self.d, self.alpha = deadline_ms, alpha
        self.rtt = {"A": deadline_ms / 2.0, "B": deadline_ms / 2.0}  # smoothed RTT of echoes received
        self.miss = {"A": 0.0, "B": 0.0}                             # smoothed share of lost or late copies
        self.streak = {"A": 0, "B": 0}                               # consecutive lost or late copies
        self.last = {"A": None, "B": None}                           # when the latest outcome became known

    def feedback(self, path, rtt, now):
        late = rtt is None or rtt > self.d
        self.miss[path] += self.alpha * ((1.0 if late else 0.0) - self.miss[path])
        if rtt is not None:
            self.rtt[path] += self.alpha * (rtt - self.rtt[path])
        self.streak[path] = self.streak[path] + 1 if late else 0
        self.last[path] = now

    def stale_s(self, path, now, cap=2.0):
        return cap if self.last[path] is None else min(cap, now - self.last[path])

    def features(self, now):
        x = [1.0]
        for p in "AB":
            x += [min(2.0, self.rtt[p] / self.d), self.miss[p], self.stale_s(p, now) / 2.0]
        return x


class Policy:
    name = "policy"

    def __init__(self, deadline_ms):
        self.d = deadline_ms
        self.state = LinkState(deadline_ms)

    def act(self, t, i):
        raise NotImplementedError

    def override(self, i, action):  # a guard replaced the action for packet i
        pass

    def observe(self, i, path, rtt, now):
        self.state.feedback(path, rtt, now)


class OnlyA(Policy):
    name = "only_a"

    def act(self, t, i):
        return "A"


class OnlyB(Policy):
    name = "only_b"

    def act(self, t, i):
        return "B"


class Split(Policy):
    def __init__(self, deadline_ms, m=2, s=3):
        super().__init__(deadline_ms)
        self.m, self.s, self.name = m, s, "split_%d_%d" % (m, s)

    def act(self, t, i):
        return "A" if i % (self.m + self.s) < self.m else "B"


class Dup(Policy):
    name = "dup"

    def act(self, t, i):
        return "AB"


class Oracle(Policy):
    """Knows both outcomes in advance. Upper bound for one copy per packet; not realisable."""
    name = "oracle"
    peek = (None, None)

    def act(self, t, i):
        ok = [p for p, r in zip("AB", self.peek) if r is not None and r <= self.d]
        return ok[0] if ok else "A"


class Threshold(Policy):
    """Use the faster path that currently looks healthy; duplicate when neither does."""
    name = "threshold"

    def __init__(self, deadline_ms, rtt_frac=0.8, miss_max=0.1):
        super().__init__(deadline_ms)
        self.rtt_frac, self.miss_max = rtt_frac, miss_max

    def act(self, t, i):
        s = self.state
        ok = [p for p in "AB" if s.rtt[p] < self.rtt_frac * self.d and s.miss[p] < self.miss_max]
        return min(ok, key=lambda p: s.rtt[p]) if ok else "AB"


class LinUCB(Policy):
    """Reward: 1 if a copy came back within the deadline, minus `cost` when duplicating.

    A duplicated packet reveals both paths, so it updates all three models.
    """
    name = "linucb"
    ARMS = ("A", "B", "AB")

    def __init__(self, deadline_ms, cost=0.1, alpha=0.5):
        import numpy as np
        super().__init__(deadline_ms)
        self.np, self.cost, self.alpha = np, cost, alpha
        d = len(self.state.features(0.0))
        self.inv = [np.eye(d) for _ in self.ARMS]
        self.b = [np.zeros(d) for _ in self.ARMS]
        self.pending = {}  # packet -> [features, action, {path: hit}]

    def act(self, t, i):
        np = self.np
        x = np.array(self.state.features(t))
        score = [float(self.inv[k] @ self.b[k] @ x + self.alpha * np.sqrt(x @ self.inv[k] @ x))
                 for k in range(len(self.ARMS))]
        act = self.ARMS[max(range(len(score)), key=score.__getitem__)]
        self.pending[i] = [x, act, {}]
        return act

    def override(self, i, action):
        self.pending[i][1] = action

    def _update(self, k, x, reward):
        v = self.inv[k] @ x
        self.inv[k] -= self.np.outer(v, v) / (1.0 + x @ v)  # Sherman-Morrison
        self.b[k] += reward * x

    def observe(self, i, path, rtt, now):
        super().observe(i, path, rtt, now)
        x, act, hit = self.pending[i]
        hit[path] = rtt is not None and rtt <= self.d
        if len(hit) < len(act):
            return
        del self.pending[i]
        for p in act:
            self._update(self.ARMS.index(p), x, 1.0 if hit[p] else 0.0)
        if act == "AB":
            self._update(2, x, (1.0 if any(hit.values()) else 0.0) - self.cost)


class Guarded(Policy):
    """Rules that may replace a single-path proposal with "AB". They never remove a copy.

      dead    the proposed path has missed `dead_streak` copies in a row
      probe   nothing has been heard from the other path for `probe_s` seconds,
              so its statistics are stale
    """

    def __init__(self, inner, dead_streak=3, probe_s=1.0):
        super().__init__(inner.d)
        self.inner, self.dead_streak, self.probe_s = inner, dead_streak, probe_s
        self.name = inner.name + "+guard"
        self.state = inner.state
        self.vetoes = {"dead": 0, "probe": 0}
        self.last_veto = None   # rule that replaced the latest proposal, if any

    def act(self, t, i):
        self.inner.peek = getattr(self, "peek", (None, None))
        act = self.inner.act(t, i)
        self.last_veto = None
        if act == "AB":
            return act
        other = "B" if act == "A" else "A"
        why = ("dead" if self.state.streak[act] >= self.dead_streak
               else "probe" if self.state.stale_s(other, t, self.probe_s * 2.0) > self.probe_s else None)
        if why:
            self.vetoes[why] += 1
            self.last_veto = why
            self.inner.override(i, "AB")
            return "AB"
        return act

    def observe(self, i, path, rtt, now):
        self.inner.observe(i, path, rtt, now)


NAMES = ("only_a", "only_b", "split_2_3", "dup", "threshold+guard", "linucb", "linucb+guard")


def make(name, deadline_ms, cost=0.1):
    """Build a policy from its name as printed by evaluate.py."""
    base, _, guard = name.partition("+")
    kinds = {"only_a": OnlyA, "only_b": OnlyB, "split_2_3": Split, "dup": Dup, "threshold": Threshold}
    if name not in NAMES:
        raise ValueError("unknown policy %r; choose from %s" % (name, ", ".join(NAMES)))
    pol = LinUCB(deadline_ms, cost=cost) if base == "linucb" else kinds[base](deadline_ms)
    return Guarded(pol) if guard else pol
