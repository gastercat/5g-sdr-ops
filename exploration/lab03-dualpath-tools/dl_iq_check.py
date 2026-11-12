#!/usr/bin/env python3
"""LTE downlink presence check on a complex64 IQ file captured at 11.52 Msps (10 MHz cell).

Prints JSON: total power, PSD occupied-band vs guard-band ratio, and a PSS detector that
folds |correlation|^2 over the 5 ms PSS period for each N_id_2 and several CFO hypotheses.
Written 2026-11-12 for Lab03; not the 11/05 G1/G2 method.
"""
import json, sys
import numpy as np

FS = 11.52e6
NFFT = 768           # 15 kHz * 768 = 11.52 MHz
HALF = 57600         # samples per 5 ms


def pss_time(nid2):
    u = {0: 25, 1: 29, 2: 34}[nid2]
    n = np.arange(62)
    d = np.where(n < 31, np.exp(-1j * np.pi * u * n * (n + 1) / 63),
                 np.exp(-1j * np.pi * u * (n + 1) * (n + 2) / 63))
    X = np.zeros(NFFT, complex)
    X[np.r_[NFFT - 31:NFFT, 1:32]] = d   # subcarriers -31..-1, +1..+31
    return np.fft.ifft(X)


def main(path):
    x = np.fromfile(path, dtype=np.complex64)
    x = x[int(0.01 * FS):]               # drop first 10 ms (tuning transient)
    out = {"file": path.split("/")[-1], "samples_used": int(x.size),
           "power_dbfs": float(10 * np.log10(np.mean(np.abs(x) ** 2) + 1e-20)),
           "peak_abs": float(np.max(np.abs(x)))}
    # PSD
    nseg = x.size // 4096
    seg = x[:nseg * 4096].reshape(nseg, 4096) * np.hanning(4096)
    psd = np.fft.fftshift(np.mean(np.abs(np.fft.fft(seg, axis=1)) ** 2, axis=0))
    f = np.fft.fftshift(np.fft.fftfreq(4096, 1 / FS))
    inband = psd[(np.abs(f) > 0.1e6) & (np.abs(f) < 4.4e6)].mean()
    guard = psd[(np.abs(f) > 4.8e6) & (np.abs(f) < 5.5e6)].mean()
    out["psd_inband_minus_guard_db"] = float(10 * np.log10(inband / guard))
    edges = np.linspace(-5.76e6, 5.76e6, 17)
    ref = np.median(psd)
    out["psd_profile_db_rel_median"] = [round(float(10 * np.log10(psd[(f >= a) & (f < b)].mean() / ref)), 2)
                                        for a, b in zip(edges, edges[1:])]
    # PSS folded detector
    nper = min(x.size // HALF - 1, 30)
    y = x[:(nper + 1) * HALF]
    t = np.arange(y.size) / FS
    best = None
    res = []
    for cfo in np.arange(-12e3, 12.1e3, 3e3):
        yc = y * np.exp(-2j * np.pi * cfo * t).astype(np.complex64)
        for nid2 in range(3):
            h = np.conj(pss_time(nid2)[::-1]).astype(np.complex64)
            c = np.abs(np.convolve(yc, h, mode="valid")[:nper * HALF]) ** 2
            fold = c.reshape(nper, HALF).sum(axis=0)
            pk = float(fold.max() / np.median(fold))
            r = {"cfo_hz": float(cfo), "nid2": nid2, "peak_over_median": round(pk, 2),
                 "offset": int(fold.argmax())}
            res.append(r)
            if best is None or pk > best["peak_over_median"]:
                best = r
    out["pss_periods_folded"] = int(nper)
    out["pss_best"] = best
    out["pss_peak_over_median_by_nid2_max"] = {
        str(k): max(r["peak_over_median"] for r in res if r["nid2"] == k) for k in range(3)}
    print(json.dumps(out))


if __name__ == "__main__":
    main(sys.argv[1])
