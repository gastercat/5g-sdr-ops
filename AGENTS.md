# 5G SDR Operations — Agent Instructions

## Project Scope

This repository manages 5G SDR project documentation, approved configuration templates, audit evidence, and handoff material. It does not directly operate the lab environment.

## Current Delivery Goal

Preserve the completed Lab01 Phase 4C recovered baseline as a bounded historical
execution baseline. The current summer project priority has two distinct deliverable
dimensions: completing Lab01 and completing its experiment manual. Their completion
scope and criteria remain to be recovered or defined in separately authorized Work
Units. The Agent + Git Runbook is an internal engineering reference, not
student curriculum authority. Future Security mapping across Lab01–03, student-safe
minimum Git scope, and workflow-vocabulary externalization each require a separately
authorized documentation Work Unit. Lab02 is not an active execution mainline. No
runtime restart, deployment, persistent network change, Lab02 execution, or extended
validation is authorized without a separately scoped task and explicit human approval.

## Source of Truth

- Read [PROGRESS.md](PROGRESS.md) for the current checkpoint and open questions.
- Read [docs/architecture-overview.md](docs/architecture-overview.md),
  [docs/decision-register.md](docs/decision-register.md), and
  [docs/known-limitations.md](docs/known-limitations.md) for canonical architecture,
  decisions, and claim boundaries.
- Read [docs/engineering/CONFIGURATION_GOVERNANCE.md](docs/engineering/CONFIGURATION_GOVERNANCE.md) and [docs/engineering/CODEX_REMOTE_AGENT_POLICY.md](docs/engineering/CODEX_REMOTE_AGENT_POLICY.md) for governance.
- Use [docs/audits/2026-07-10-rollback-inventory.md](docs/audits/2026-07-10-rollback-inventory.md) as evidence of observed residue, not as a confirmed Lab01 baseline.
- Use [docs/evidence/task-evidence/README.md](docs/evidence/task-evidence/README.md)
  when material execution evidence would otherwise remain only in an Agent task.
  TEH preserves provenance; it does not grant authorization or canonical authority.
- `srsRAN_4G/` manages source code and project patches. `/etc/srsran/` is the active runtime configuration on a lab host.
- `configs/` holds only human-reviewed, approved configuration templates.

## Required Startup Procedure

For every new task:

1. Read this file and [PROGRESS.md](PROGRESS.md).
2. Run the repository preflight: working-tree status, branch, and relevant file inventory.
3. Read the source documents relevant to the requested change.
4. If the task concerns Lab01 baseline work, use the `lab01-baseline-recovery` skill before taking action.
5. State whether the work is read-only, documentation-only, or requires a separately approved deployment.

## Repository Checkpoint Validation

- `PASS`: the recorded checkpoint commit equals `HEAD`.
- `PASS`: the recorded checkpoint commit is an ancestor of `HEAD`, the working tree is clean, and the checked branch matches its remote.
- `STOP`: the recorded checkpoint commit is absent from current history.
- `STOP`: the branch diverged, the working tree is dirty, or provenance is unclear.

## Safety and Runtime Boundaries

- Treat all remote inspection as read-only by default.
- Do not modify runtime configuration or start services without a separately scoped
  task and explicit human approval. Historical Phase 4C completion is not blanket
  authorization for a new run.
- Never use `git checkout`, `git reset`, or an equivalent operation as a runtime rollback mechanism in `/etc/srsran/`.
- Do not copy legacy `/etc/srslte/` files directly into `/etc/srsran/`.
- Do not infer a baseline from a single host, a single unpaired file, or an unverified history item.
- Stop when source provenance is uncertain, Linux1/Linux2 pairing is incomplete, or ZeroMQ direction is unclear.

## Baseline Recovery Workflow

Follow `.agents/skills/lab01-baseline-recovery/SKILL.md`. The required order is:

1. Inventory candidate sources without changing runtime state.
2. Compare paired Linux1 and Linux2 candidates read-only, including ZeroMQ IP and TX/RX ports.
3. Prepare a rollback plan and deployment record.
4. Obtain explicit human approval.
5. Perform only the approved minimum recovery, then validate only the explicitly
   approved items. Phase 4C verified ZeroMQ, attach, and bounded ICMP; it did not
   validate TCP or NAT.

"Rollback" means a reviewed, controlled deployment—not a Git operation against active configuration.

## Sensitive Data Policy

Never write credentials or secrets to Git, documentation, evidence, prompts, or command output. This includes passwords, Ki, OPC, tokens, SSH private keys, and other sensitive identifiers. Redact or omit sensitive values from any proposed evidence.

Do not write personal aliases, private role names, or relationship terms into public or team-shared repository documents. Use neutral engineering roles such as Owner, Operator, Reviewer, Maintainer, Human Reviewer, or Project Lead. This rule applies to progress reports, handoffs, review records, commit-facing documentation, and all other shared project artifacts. Private conversational names must remain outside the repository.

## Validation and Evidence Rules

- Keep confirmed facts, candidates, and unknowns distinct.
- A PASS claim requires traceable evidence; do not manufacture PASS, successful attach, or deployment records.
- Record source path, host role, commit/version where known, observation time, and non-sensitive comparison result.
- A configuration file's presence does not prove it is active or authoritative.
- Conflicting evidence or incompatible srsRAN commits is a stop condition.
- Create a Task Evidence Record when a task produces material Runtime, Git,
  controlled-mutation, backup, recovery, deployment, or current-state evidence that
  would otherwise exist only in task context. It is normally unnecessary for
  brainstorming, explanation-only work, or trivial docs changes reconstructable from Git.
- A Task Evidence Record may preserve `OBSERVED`, `REPORTED_ONLY`, or
  `NOT_FOUND_IN_THREAD`; it must not label itself `AUTHORITATIVE`, `OWNER_ACCEPTED`,
  `CANONICAL`, or `CURRENT_TRUTH`.

## Progress and Handoff Rules

- Update [PROGRESS.md](PROGRESS.md) only when the task explicitly authorizes repository documentation changes.
- During read-only investigation, report proposed progress updates in the task output and wait for human approval before editing the file.
- Record only the current checkpoint, decision-relevant evidence, and next gate; do not turn it into a full history log.
- Treat project Handoff as navigation + delta: current delta, stop point, next
  authorized gate, blocking unresolved item, and canonical pointers. Private
  Handoff is not part of the project Agent Harness.
- Preserve explicit `KNOWN`, `UNKNOWN`, `PENDING`, and `NEEDS_APPROVAL` labels.
- Do not claim a runtime change, service start, validation, or approval unless it actually occurred.

## Task Classification

Classify work before acting:

| Type | Examples | Default authority |
| --- | --- | --- |
| Documentation | instructions, evidence summaries, runbooks | repository-only edits |
| Read-only investigation | inventory, metadata, configuration comparison | no runtime changes |
| Recovery planning | source mapping, abort points, validation plan | no deployment |
| Controlled deployment | approved runtime configuration recovery | explicit human approval required |

If a request moves from one type to another, stop and obtain the authority
required by the new type. A request to inspect or document does not authorize
deployment or service operation.

## Repository Navigation

- `labs/lab01-small-cell/` contains the Lab01 runbook, checklist, issues, and result summary.
- `docs/architecture-overview.md`, `docs/decision-register.md`, and
  `docs/known-limitations.md` contain the canonical architecture, accepted or
  unresolved decisions, and current claim boundaries.
- `docs/audits/` holds read-only configuration inventories and non-sensitive audit evidence.
- `docs/evidence/task-evidence/` holds compact Agent-task execution provenance; it
  does not supersede `PROGRESS.md` or the canonical knowledge surfaces.
- `docs/engineering/` holds configuration governance, remote-agent policy, and engineering TODOs.
- `agent-prompts/` and `checklists/` support repeatable review work, but do not supersede this file or `PROGRESS.md`.

When instructions conflict, preserve the stricter safety boundary and raise the
conflict rather than silently choosing a permissive interpretation.

## Change Hygiene

- Make the smallest scoped change that satisfies the task.
- Preserve user changes in a dirty working tree; do not overwrite unrelated work.
- For documentation changes, inspect the final diff and run `git diff --check`.
- Do not commit or push unless the task explicitly authorizes it.
- Report files changed, files intentionally untouched, validation results, and any remaining gate.
