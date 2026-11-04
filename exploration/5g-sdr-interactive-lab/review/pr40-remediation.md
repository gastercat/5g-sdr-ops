# PR 40 targeted remediation — 2026-11-03

Base PR head: bc79d2b06155eb5fbc8738506b8e373892bdbf1a. Scope: PR branch only; merge, Settings changes and deployment NOT_AUTHORIZED.

## First Pages deployment prerequisite (F1)

The repository API reports has_pages=false. The pinned configure-pages action.yml defines enablement=false by default. Enabling a disabled site through that action would require a token other than GITHUB_TOKEN and additional permissions. No token or permission expansion is included.

Source: https://github.com/actions/configure-pages/blob/983d7736d9b0ae728b81ab479565c72886d7745b/action.yml

Before the first merge intended to publish, the Repository Administrator must obtain separate Owner authorization, open Settings → Pages → Build and deployment → Source, select GitHub Actions, and verify the selected Source remains GitHub Actions after reload. This task does not authorize that action. Existing workflow must not be expected to create the site automatically.

After an authorized merge, verify the main push workflow succeeds, its github-pages environment URL, index.html, evidence.html and relative CSS/JS resources; check L4-S4, themes, evidence return and narrow layout. These deployed-site checks are NOT_EXECUTED in this task. A disabled site should fail configuration rather than silently broaden permissions.

## Evidence corrections (F2, F4)

PROGRESS.md RF Evidence Navigation (2026-10-29) records G3-3H-A1-RX PASS with no independently checkable raw evidence. Package 2026-10-29-g3-3h-b05-b06 is external and has no portable shared locator. Raw package inspection is NOT_EXECUTED. Historical RX observation uses NOT_VERIFIED; the overall RF Gate uses NO VERIFIED PASS. NOT_TESTED is limited to named target tests, including the complete B210 OTA end-to-end target and Lab03 modes/measurements; it does not describe all RF work. Individual gate checkpoints remain NOT_VERIFIED where execution history cannot be independently established; no claim of failure or non-execution. RX does not establish Cell Detection, Random Access, Attach or User Plane PASS. known-limitations.md's NOT TESTED B210 OTA row describes the historical Phase 4C ZeroMQ scope, not all later RF work.

MCCH Frame 22 remains HUMAN_OBSERVATION / REPORTED_ONLY. The B3D-02 record has neither selected-frame screenshot nor raw decoder export in the repository and does not independently re-decode it. Its badge and aggregate channel claim are PARTIAL; SIB13/MTCH historical screenshot statuses remain unchanged.

## CI regression checks (F3)

Removed whole-PR publication scope rejection. Relevant website changes still trigger JS syntax and explicit artifact allowlist checks; unrelated documentation paths are accepted. Existing secret scan remains required. No PR artifact is uploaded.

Reproduce: python3 .github/ci/test_interactive_lab_pages.py

The tests execute the real workflow shell step in disposable Git repositories:

| Case | Result |
| --- | --- |
| A website only | PASS |
| B ordinary documentation only | PASS (website check skipped) |
| C website and synthetic manual | PASS |
| D unexpected artifact root file | PASS (rejected as required) |

## Browser runtime smoke (F5)

Executed against loopback HTTP with existing in-app Chromium browser automation, without installing dependencies. UI locators drove controls; DOM assertions checked results.

| Check | Result |
| --- | --- |
| Next / Previous / Reset | PASS |
| Scene select (Duplication) | PASS |
| Play / Pause pressed state | PASS |
| SVG layer toggle | PASS |
| Evidence navigation / return with scene | PASS |
| Query scene recovery L4-S4 | PASS |
| Lab04 PROPOSED label | PASS |
| 320px document layout, local canvas scrolling | PASS |
| Reduced-motion media emulation, zero packet elements while playing | PASS |
| RF NOT_VERIFIED and MCCH PARTIAL evidence display | PASS |
| Browser console errors | none observed |

Limitations: targeted smoke, not exhaustive animation timing, student usability, cross-browser or projection-device testing. Browser automation was executed through the existing session; no browser package is added to CI. Node syntax validation is separate from Browser Runtime. Actual Pages deployment is NOT_EXECUTED. SDR Runtime and canonical evidence were untouched.
