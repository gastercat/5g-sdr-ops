# Agent + Git Future Teaching Skeleton

Status: `SKELETON / NOT ACTIVE COURSE`

## Purpose

This document is a future teaching and reuse skeleton. It is not a separate
authoritative Runbook. The original use case is to establish the minimum shared
capability needed for safe Agent and Git collaboration in the 5G SDR project.

Future classroom reuse was requested following the
[2026-08-04 project meeting](../../presentations/2026-08-04-agent-git-security/README.md).
That request establishes a future direction only; it does not activate a
course, approve a curriculum, or grant Repository or Runtime authority.

## Current Operational Source

The current operational source remains
[`docs/runbooks/agent-git/README.md`](../../runbooks/agent-git/README.md).

Teaching materials in this directory must reuse and point to that Runbook. They
must not copy, fork, or independently redefine its procedures, safety rules,
source authority, or lifecycle status. Operational corrections belong in the
Runbook through a separately authorized and reviewed work unit.

## Teaching Reuse Boundary

- The teaching line exists to reuse project-grounded collaboration practices;
  it does not establish a general-purpose Agent or Git course.
- Future learner material and instructor material may be separated for clarity,
  but both remain subordinate to the operational Runbook.
- Exercises must preserve the Runbook's No Secret, No Runtime, branch,
  evidence, claim-boundary, and Human Review controls.
- This skeleton does not establish Windows workflow validation or select tools
  for learners.

## Candidate Learner Materials

- A short orientation to Repository, branch, working tree, evidence, and Human
  Review concepts, linked to the relevant Runbook sections.
- A near-zero-baseline bridge for the Section 3 Windows Clone concepts after a
  separate Windows validation work unit exists.
- Minimum examples that make Claim Boundary, Prompt Context, and Required
  Output concrete without duplicating the Runbook templates.
- A compact learner handoff that identifies when to stop and ask an Instructor
  or Reviewer.

## Candidate Instructor Materials

- Facilitation notes for the first supervised Read-only Agent task.
- Prompts for checking whether a learner can distinguish observed evidence,
  inference, `UNKNOWN`, and `UNVERIFIED`.
- Review notes for a future docs-only Git exercise, including branch scope,
  diff review, and the Human Review Gate.
- A feedback capture format that records aggregate comprehension needs without
  grading or ranking individuals.

## Candidate Exercises

1. **Instructor-led Read-only Agent exercise.** Use the operational Runbook's
   bounded read-only task as the teaching bridge, then stop at Human Review.
2. **Future docs-only Git collaboration exercise.** In a separately authorized
   work unit, edit one designated non-sensitive Markdown file on an isolated
   branch, review the diff, and stop before merge.

These are candidate exercises. This file neither executes them nor upgrades
them to validated teaching procedures.

## Current Validation Status

Targeted learner validation has occurred. Aggregate findings indicate that:

- the Section 3 Windows Clone path still has a comprehension gap for a learner
  with little or no prior Git experience;
- Claim Boundary is not yet intuitive at that baseline;
- Prompt Context and Required Output need minimum examples; and
- an Instructor-led Read-only Agent task is a reasonable teaching bridge.

These findings are revision inputs for the operational Runbook. This skeleton
does not identify, grade, or rank individual learners, does not claim the gaps
are resolved, and does not claim the Runbook has already incorporated them.

## Not Yet In Scope

- A full Git curriculum.
- A full Agent curriculum.
- A course website or complete course platform.
- An assessment or grading system.
- A multi-tool textbook, Windows validation procedure, or authentication guide.
- Any 5G SDR Runtime, lab-host, service, network, or active-configuration work.
