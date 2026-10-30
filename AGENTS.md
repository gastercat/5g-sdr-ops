# 5G SDR Operations — Agent Instructions

## Project Scope

This repository manages 5G SDR project documentation, approved configuration templates, audit evidence, and handoff material. It does not directly operate the lab environment.

Delivery、Engineering 與 Exploration 均屬 Repository Scope；是否執行及可採取的操作，依當次明確授權與適用限制判定。Current Priority 不是工作範圍白名單，Scope 本身不授予操作權限。

## Current Delivery Goal

The current primary engineering priority is Track B Physical RF Transition, per
the 2026-10-29 Owner decision [DR-015](docs/decision-register.md#dr-015track-b-physical-rf-transition-成為目前主要工程優先事項).
Work covers Controlled RF Preparation, Mock Integration, Evidence Preservation
and verification of each explicitly scoped gate; priority does not establish Gate
Acceptance or authorize RF Runtime operations. The earlier Lab01 baseline recovery,
experiment manual and summer-delivery priority is historical and superseded as a
priority only; outstanding delivery obligations are neither completed nor cancelled
by this decision. Phase 4C remains bounded historical evidence, not current Runtime
verification or authorization. Lab01 and manual completion criteria still require
separately authorized Work Units. No runtime restart, deployment, persistent network
change, Lab02 execution, or extended validation is authorized without a separately
scoped task and explicit human approval.

The Agent + Git Runbook remains an internal engineering reference, not student
curriculum authority. Future Security mapping across Lab01–03, student-safe minimum
Git scope and workflow-vocabulary externalization each require a separately
authorized documentation Work Unit. Lab02 is not an active execution mainline.

## Source of Truth — Load by Operation

- Use [PROGRESS.md](PROGRESS.md) for current checkpoint navigation and open questions when the task depends on current project state; verify the referenced evidence before making current-state claims.
- Use [docs/architecture-overview.md](docs/architecture-overview.md),
  [docs/decision-register.md](docs/decision-register.md), and
  [docs/known-limitations.md](docs/known-limitations.md) for canonical architecture,
  decisions, and claim boundaries.
- Use [docs/engineering/CONFIGURATION_GOVERNANCE.md](docs/engineering/CONFIGURATION_GOVERNANCE.md) and [docs/engineering/CODEX_REMOTE_AGENT_POLICY.md](docs/engineering/CODEX_REMOTE_AGENT_POLICY.md) for governance.
- Use [docs/audits/2026-07-10-rollback-inventory.md](docs/audits/2026-07-10-rollback-inventory.md) as evidence of observed residue, not as a confirmed Lab01 baseline.
- Use [docs/evidence/task-evidence/README.md](docs/evidence/task-evidence/README.md)
  when material execution evidence would otherwise remain only in an Agent task.
  TEH preserves provenance; it does not grant authorization or canonical authority.
- `srsRAN_4G/` manages source code and project patches. `/etc/srsran/` is a known Lab01 configuration location; Runtime selection must be confirmed for the track, host and component using execution evidence. See [configuration governance](docs/engineering/CONFIGURATION_GOVERNANCE.md#2-管理邊界).
- `configs/` holds only human-reviewed, approved configuration templates.

## Required Startup Procedure

For every new task:

1. Read this core contract, identify the task's authority and operation types, and
   inspect working-tree status, branch and relevant files without changing them.
2. Load task-relevant sources. Read-only work does not require all of `PROGRESS.md`
   or Remote Policy unless its claims or operations depend on them. Documentation
   mutation requires working-tree protection and applicable repository mutation rules.
3. Before configuration deployment, load Configuration Governance and applicable
   review, backup, diff, approval, rollback and verification requirements. Before
   remote access, load applicable Remote Policy sections and confirm host, action,
   scope and permission level. RF/Runtime work additionally requires explicit task
   authorization, safety controls, operating procedures and stop conditions.
4. For Lab01 baseline identification, comparison, recovery planning, deployment or
   validation, load `lab01-baseline-recovery` and apply only the authorized stages.
5. State whether the task is read-only, documentation-only or separately approved
   deployment. Avoid redundant rereads of unchanged sources within the task.

Unloaded policy remains applicable. Do not infer unread content or current state,
and do not omit evidence needed for the task's claims or safety decisions.

## Repository Checkpoint Validation

Run commit comparison only when an explicit, traceable, reviewed `5g-sdr-ops`
checkpoint is identified in `PROGRESS.md` or the current authorized Task Pack;
record its source. The Agent must not select a SHA to obtain PASS or substitute
an srsRAN source commit for the repository checkpoint.

- `NOT_VERIFIED`: no explicit checkpoint input is supplied. Do not infer a SHA or report PASS; retain any task-specific prerequisite requiring a verified checkpoint. Missing input alone is not a global STOP.
- Apply the existing STOP conditions independently and before either PASS condition. A supplied checkpoint with untrusted provenance remains subject to STOP; missing input does not override dirty-tree, diverged-branch or other STOP conditions. This check does not grant authorization.
- `PASS`: the recorded checkpoint commit equals `HEAD`.
- `PASS`: the recorded checkpoint commit is an ancestor of `HEAD`, the working tree is clean, and the checked branch matches its remote.
- `STOP`: the recorded checkpoint commit is absent from current history.
- `STOP`: the branch diverged, the working tree is dirty, or provenance is unclear.

### Validation Result and Task Disposition

Keep checkpoint `PASS`, `STOP` and `NOT_VERIFIED` separate from task disposition.
A `STOP` result remains `STOP`; it must not be relabelled as `PASS`. Stop the affected
operation, including any operation requiring a verified checkpoint. Independently
authorized read-only inspection may continue only when it does not depend on the
failed provenance, can be safely isolated, preserves existing changes and evidence,
and violates no other applicable STOP or authorization condition. Report this as
`CONTINUE_READ_ONLY`, not checkpoint PASS. It grants no mutation or Runtime authority.
If safe isolation cannot be established, stop the task. Dirty, diverged, untrusted
or absent-from-history provenance retains the STOP effect defined above.

Safe isolation is a condition to verify, not authorization
to create a worktree, branch or backup, or to perform any
Git or filesystem mutation. Such operations require their
own explicit task authorization and remain subject to
applicable policy and STOP conditions.

When a STOP requires recovery, report the failed condition
and a minimal recovery proposal identifying the affected
paths, preservation and verification steps, required
mutations and approval source.

This proposal grants no execution authority.

Recovery may proceed only when an actual, applicable Owner
authorization covers the specific recovery operations and
all required policy and approval gates are satisfied.

Recovery must not waive provenance failures,
verified-checkpoint prerequisites or safety controls.

Re-run validation after recovery and report the observed
result without converting the earlier STOP to PASS.

## Safety and Runtime Boundaries

- Treat all remote inspection as read-only by default.
- Do not modify runtime configuration or start services without a separately scoped
  task and explicit human approval. Historical Phase 4C completion is not blanket
  authorization for a new run.
- Never use `git checkout`, `git reset`, or an equivalent operation as a runtime rollback mechanism in `/etc/srsran/`.
- Do not copy legacy `/etc/srslte/` files directly into `/etc/srsran/`.
- Do not infer an authoritative baseline from unverified provenance. For Lab01 baseline comparison or recovery, require paired Linux1/Linux2 evidence, compatible versions and clear ZeroMQ direction before accepting a candidate or proceeding to deployment. Missing comparison evidence stops that conclusion or dependent operation; it does not prohibit recording unknowns during authorized inventory.

## Baseline Recovery Workflow

Use [lab01-baseline-recovery](.agents/skills/lab01-baseline-recovery/SKILL.md)
for Lab01 baseline identification, comparison, recovery planning, deployment or
validation. Its detailed procedures and safety invariants remain applicable at
the relevant stages; unrelated Mock or Exploration tasks do not trigger Lab01-only
pairing or ZeroMQ procedures.

Run only authorized stages. Inventory may record unknown candidates without
accepting a baseline; comparison must resolve pairing, compatibility, selection
and ZeroMQ provenance before dependent recovery proceeds. Deployment requires
reviewed comparison, rollback planning and explicit human approval of candidate,
hosts, changes and validation scope. Identification or planning grants no deployment
authority. Validation remains limited to approved items. Phase 4C evidence does not
establish TCP or NAT validation or authorize another run.

Recording an unknown does not waive the Skill's applicable
Stop Conditions. When a stop condition is encountered,
follow the stopping scope required by the Skill, including
full task termination when specified. Record the finding
and request direction as required.

Before deployment, complete the applicable verified backup,
reviewed diff, rollback plan and explicit human approval.

"Rollback" means a reviewed, controlled deployment—not a Git operation against
Active Runtime Configuration at any location.

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

- [Delivery](delivery/README.md) indexes Lab01–03, cross-cutting Security, student materials and delivery gaps.
- [Exploration](exploration/README.md) indexes optional research and internal engineering references; existing repository controls remain applicable.
- [Historical / Evidence](docs/history/README.md) preserves source paths and evidence dependencies.
- [Documentation map](docs/documentation-map.md) records classification and unresolved lifecycle questions.

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
