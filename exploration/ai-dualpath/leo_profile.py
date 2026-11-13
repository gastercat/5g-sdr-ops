#!/usr/bin/env python3
"""Emulated LEO-like impairment for one path. SIMULATED, application layer only.

This is not a satellite link, an orbit model or an NTN implementation. It only
reproduces three coarse features that make a path time-varying:

  slot     every slot_s seconds the serving link is reassigned; the base round-trip
           time drifts linearly from one random value to another within a slot
  outage   the first outage_ms of every slot after the first lose every packet
  loss     a small random loss, raised to burst_loss_pct while the base RTT is
           above low_elev_ms (standing in for a low-elevation link)

Slot parameters depend only on (seed, slot index), so two runs with the same seed
see the same link. Per-packet randomness comes from the rng passed to sample().

Stdlib only, so the same class can run inside the echo side of the probe.
"""
import random


class LeoProfile:
    def __init__(self, seed=0, slot_s=15.0, rtt_lo_ms=20.0, rtt_hi_ms=45.0, jitter_ms=3.0,
                 outage_ms=150.0, loss_pct=0.5, low_elev_ms=38.0, burst_loss_pct=20.0):
        if slot_s <= 0 or rtt_lo_ms < 0 or rtt_hi_ms < rtt_lo_ms:
            raise ValueError("slot_s must be > 0 and 0 <= rtt_lo_ms <= rtt_hi_ms")
        self.seed, self.slot_s = seed, slot_s
        self.rtt_lo_ms, self.rtt_hi_ms, self.jitter_ms = rtt_lo_ms, rtt_hi_ms, jitter_ms
        self.outage_ms, self.loss_pct = outage_ms, loss_pct
        self.low_elev_ms, self.burst_loss_pct = low_elev_ms, burst_loss_pct

    def _ends(self, k):  # base RTT at the start and end of slot k
        r = random.Random(self.seed * 1000003 + k)
        return r.uniform(self.rtt_lo_ms, self.rtt_hi_ms), r.uniform(self.rtt_lo_ms, self.rtt_hi_ms)

    def state(self, t):
        """Link state at t seconds since the start of the run."""
        k = int(t // self.slot_s)
        into = t - k * self.slot_s
        a, b = self._ends(k)
        base = a + (b - a) * into / self.slot_s
        return {"slot": k, "base_ms": base, "outage": k > 0 and into * 1000.0 < self.outage_ms,
                "loss_pct": self.burst_loss_pct if base > self.low_elev_ms else self.loss_pct}

    def sample(self, t, rng):
        """Round-trip time in ms for a packet sent at t, or None if it is lost."""
        s = self.state(t)
        if s["outage"] or rng.random() * 100.0 < s["loss_pct"]:
            return None
        return max(0.0, rng.gauss(s["base_ms"], self.jitter_ms))
