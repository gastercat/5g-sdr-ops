# 5G SDR Operations TODO

This file is a lifecycle and navigation board. It does not replace the current
project checkpoint in [`PROGRESS.md`](PROGRESS.md) or the detailed engineering
backlog in [`docs/engineering/TODO.md`](docs/engineering/TODO.md). An unchecked
item is planned work, not evidence of completion, validation, or authorization.

## Active / Near-term

Status: `PLANNED / NOT YET COMPLETE`

- [ ] **Agent + Git Runbook targeted learner-feedback revision.** Revise the
  current operational Runbook in a separately authorized work unit, focusing on
  the Section 3 Windows Clone comprehension gap, clearer Claim Boundary
  explanations, and minimum Prompt Context / Required Output examples.
- [ ] **Instructor-led Read-only Agent dry run.** Conduct the first supervised,
  scope-bounded exercise and record aggregate learner feedback without granting
  Repository mutation or Runtime authority.

Neither item is recorded as completed by this skeleton.

## Future Teaching

Status: `SKELETON / NOT ACTIVE COURSE`

- Reuse the operational
  [Agent + Git Runbook](docs/runbooks/agent-git/README.md); do not create a
  second authoritative Runbook.
- Separate future learner materials from future instructor materials while
  keeping both dependent on the operational Runbook.
- Retain an instructor-led Read-only Agent exercise as the first teaching
  bridge.
- Consider a future docs-only Git collaboration exercise with an isolated
  branch and Human Review Gate.

Entry point: [Agent + Git Future Teaching Skeleton](docs/teaching/agent-git/README.md).
This skeleton excludes a full Git curriculum, full Agent curriculum, course
website, and assessment system.

## Research Parking — 6G LEO / NTN

Status: `RESEARCH PARKING / NOT CURRENT LAB01 OR LAB02 MAINLINE`

- Preserve the Neuro-Symbolic RRM / Handover Supervisor as a documented
  research concept, not as implemented or validated Runtime functionality.
- [ ] Evaluate Phase A pure-simulator feasibility.
- [ ] Map current 5G SDR telemetry into candidate research observation
  structures without claiming integration.
- [ ] Evaluate future RRM / mobility adapters under a separate research and
  implementation authorization.

Entry point: [6G LEO / NTN Handover Research Parking](docs/research/6g-ntn-handover/README.md).

## Explicitly Not Active

- Real LEO handover implementation.
- NTN scheduler modification.
- Complete course platform.
- Runtime automation.

The pre-existing v0.1 bootstrap checklist remains available in Git history. It
is not promoted into this current lifecycle board or treated as current project
authority.
