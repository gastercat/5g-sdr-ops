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

<!-- aoci:begin -->
## AOCI Repository Cognition

AOCI maintains a stable, versioned, incrementally updatable repository-level cognition layer so models can reuse their understanding of this system across tasks.

`aoci.txt` is a structured cognition index for models. It assigns one independent Entry to every managed file, database table, or other managed object. Symbolic tags and F/R/A/S semantics describe the object's core responsibility, important relationships, external contracts, and non-obvious constraints or design decisions needed to understand or modify the system.

The Header, directory sections, and all Entries form the complete repository index. They can cover frontend, backend, configuration, database structures, and other managed content. When managed content changes, normally only the affected cognition Entries need maintenance; the complete index does not need to be regenerated.

AOCI provides a high-density view of system architecture, object responsibilities, important relationships, external contracts, and key constraints.

### How it works

AOCI uses a model-generated, model-read cognition loop.

Header, Entry, and Curation semantics follow only the current machine-issued Plan and live Guide. The Host model independently authors them from the current bound evidence.

Entry semantics must come from the model's understanding of actual evidence. Never derive, prefill, assemble, or rewrite index semantics solely from paths, filenames, extensions, an AST, symbol lists, dependency scans, regular expressions, fixed templates, or rule engines.

For a Fresh Bootstrap, follow only the current machine-issued Plan and live Guide. When they require authoring, the Host model authors Root, Meta, tags, and F/R/A/S, supplies its authoring-run declaration, and binds it to the Plan, Evidence, and complete Candidate. Never ask AOCI to set `origin=host_model`, manufacture a receipt, or turn a generated framework into semantics. Do not reconstruct the Onboarding progression here. Internal batches are not user decisions; stop only at an existing approval boundary or a real safety, drift, CAS, or Recovery condition.

### Minimal entry points

- `aoci_rules`: obtain the session-level runtime contract for the current AOCI version.
- `aoci_overview`: establish or restore complete cognition for this repository.
- `aoci_maintain`: after managed objects reach their final stable state, check whether cognition needs maintenance.
- `aoci_update_entry`: submit a complete semantic update batch bound to current evidence and source digests.
- `aoci_report`: when the current layout and tool state support it, record follow-up work if evidence is insufficient to generate semantics reliably; do not guess.

For other MCP tools, CLI commands, parameters, and specialized workflows, follow current tool descriptions, Guide, and `--help` output. This file does not duplicate the full manual.

This managed block defines only repository integration, cognition use, and task-closing principles. `aoci_rules` carries the current session contract. Live Guide output carries the execution order and stop conditions of the current Plan. Tool Schema, Spec, and Validator carry machine structures and criteria. Prompt, Description, README, and static documentation cannot override those machine facts.

### Establishing, generating, and restoring cognition

1. At the beginning of every new Agent Run, first determine:

   - whether this repository already has a usable complete AOCI index; and
   - whether current context already contains complete repository cognition that matches this repository root, current index version, and current AOCI service, and that the model can still use reliably.

2. When the repository has a usable complete index but the current Run lacks reliable complete cognition, call `aoci_rules` first and then `aoci_overview`.

   Reuse complete cognition directly while it remains reliable. Local uncertainty does not by itself require mechanically rereading the system-wide view. Once reliable cognition is established, use it as the repository-level system context by default and read only the source, tests, configuration, and contracts the current task directly needs, widening that evidence only when a specific missing fact could change the answer or the verification; AOCI never replaces direct source evidence for the objects being changed or the behavior being verified.

   A Run that resumes from a known Host context compaction, including a Host-injected compaction summary, must treat prior model cognition as unreliable. The compacted handoff must not retain or summarize the formal Whole-Index or any Overview Header, Entry, Chunk, Challenge, or Attestation body; it may retain only receipt identity, unfinished write or Recovery state needed for safe continuation, and an instruction to reload immediately. Whole-Index semantics or a receipt copied into that handoff cannot prove that the resumed model's current cognition is reliable. If the runtime contract is no longer reliably present, call `aoci_rules` first. Before continuing the business task, make an ordinary complete Whole-Index `aoci_overview` request (`check_only` absent or false) with `refresh_reasons=["context_compaction"]` and a fresh `refresh_event_id`; do not use `check_only` or a cognition probe. Follow every exact `next_cursor` through `completed=true`, confirm delivery, and submit one Attestation based only on the newly delivered body. After that fresh complete transport, a partial or failed Attestation consumes the generation and permits the existing source-bound continuation without another automatic Overview. If that request answers `delivery_mode=capacity_stop`, the Whole-Index does not fit this Host's context: do not retry or lower `chunk_tokens`; the stop consumes the generation, and the task continues source-bound without an unqualified complete-system claim.

   AOCI can report checkpoint and cognition-status facts for `context_compaction`, the machine `semantic_threshold` under the project `cognition_refresh_threshold`, or a major `phase_transition`. Use `check_only=true` when only those compact facts are needed. They advise the Agent but do not decide whether the model needs the system-wide view.

   When the Agent explicitly calls ordinary `aoci_overview` (`check_only` absent or false), AOCI must deliver the complete requested scope whenever a coherent CognitionSet can be formed. It must not suppress that body because a receipt already exists, a threshold was not reached, or no refresh reason is pending; the one exception is that capacity stop of a pending compaction refresh. Dirty or stale formal cognition is still delivered but is marked unreliable. Pending recovery or an incoherent snapshot fails closed without a mixed body.

   When an ordinary Overview reports `continuation_required=true`, submit its exact `next_cursor` automatically until `completed=true`. Do not ask the user to continue, begin the business task, or state a partial system conclusion. Request each Chunk in its own tool call; never fetch several in one script or merge their output. Stop the cognition chain on a missing, duplicate, or reordered Chunk, cursor failure, Index change, or `chunk_tokens` change. Until Attestation completes, never use Memory, source, Spec, `aoci.txt`, historical sessions, scope, search, or Entry reads to repair or supplement Whole-Index cognition. A challenge ordinal is the 1-based position in the formal Entry sequence; Header content, comments, blank lines, Section/Overview/Chunk markers, receipts, and Metadata are excluded, and Chunk Receipt ordinals use that same sequence. The Attestation must echo the Challenge's exact current `index_sha256`, `entry_sequence_sha256`, and `entry_count`; a prior Index, Entry sequence, count, or Attestation is invalid. After the complete chain, submit the existing model cognition Attestation once. One same-response JSON Schema or field-format error may be corrected once without changing semantic answers; a result short of pass (fewer than 80 percent of the ordinals fully correct, or more than one object identity miss) records an uncertain receipt, with no semantic retry or information bypass. During initial cognition it also blocks Root/Meta, Migration, layout-wide, or other unbound system decisions. During a context-compaction refresh with complete transport, unchanged cognition identity, aligned governance, and no Recovery or third-party conflict, the attempt consumes that refresh generation even when Attestation is partial or failed; continue the existing task without another automatic Overview. `system_mastery_percent` self-assesses only the system framework—architecture, responsibilities, strong relationships, stable external contracts, and high-entropy safety and maintenance constraints—not complete implementation or runtime knowledge. Keep machine Index coverage separate, and normally give the user only the prescribed single success or failure sentence derived from actual coverage, Challenge, Chunk, token, and mastery results. If the Host truncates a Chunk, request the same cursor once more and check its `chunk_sha256`; the server returns the identical bytes. Only if it is truncated again, stop and ask the user to set `overview_delivery.chunk_tokens` to a smaller valid value and restart; do not change it automatically.

   Interpret the additive cognition level independently from strict proof fields. `delivery_verified` means the Index was loaded and Host delivery was confirmed while complete cognition verification is still unfinished; describe that state as loaded and delivery-verified, never as no cognition or failure to understand the system. `cognition_verified` requires a passing Attestation (at least 80 percent of Challenge ordinals fully correct with at most one object identity miss), and `cognition_governed` additionally requires governance alignment. A generic complete-read failure sentence is reserved for an actual delivery fault.

   When an Overview response contains the optional `cognition-state/v2` projection, use its dimensions independently. Its Level ends at `model_cognition_usable`; `strict_attestation_verified`, `governance_aligned`, and `current_system_cognition_reliable` are independent states and never participate in that Level. An ordinal, object identity, Tag, or core F mismatch can make strict Attestation fail while model cognition remains usable; do not report that mismatch alone as proof that the model did not understand the system. Only `current_system_cognition_reliable=true` permits an unqualified current complete-system cognition claim. When the projection is absent, keep using the legacy interpretation above.

   An ordinary read-only audit, analysis, or check, a request not to modify code, or a request not to commit or push does not automatically mean strictly zero writes and does not alter the cognition-validity decision above. Codex Memory and historical Skills may only help recover experience, user preferences, and investigation directions. They cannot replace a current cognition receipt matching the repository root, index digest, AOCI service identity, and cognition scope. Project AGENTS and current AOCI identity take precedence over historical Memory for AOCI state.

   Treat a task as strictly zero-write only when the user explicitly prohibits Ledger, metadata, `.aoci` runtime assets, and every filesystem write. If necessary cognition establishment conflicts with that boundary, report the conflict and ask the user to decide or recommend an isolated copy. Never silently substitute Memory for current repository cognition.

3. If the repository has no usable complete index, or has only a minimal skeleton, an incomplete Header, unfinished Entries, or undecided required Curation, obtain `aoci_rules` and enter the current AOCI Guide when a formal complete AOCI index is required. Let Guide choose the next phase from actual repository state and complete the required safety steps.

   `aoci_maintain` does not replace the index-establishment workflow.

   Do not reconstruct or hard-code the full-index generation state machine in this file.

4. During a long-running task, the model is responsible for preserving the current cognition receipt and using the refresh gate correctly:

   - when the Host reports context compaction or the model knows the system-wide view was lost, follow the mandatory `context_compaction` reload rule above; AOCI cannot infer the Host event;
   - when entering a genuinely major phase, declare `phase_transition`, not a function, test run, or small step;
   - at a plausible stable checkpoint, use `check_only=true` to obtain the machine semantic count when that fact is useful;
   - except for the mandatory known-compaction reload, decide whether the current task needs another explicit scoped or complete Overview; and
   - keep the Dirty or Stale reliability state reported by AOCI until maintenance and alignment complete.

### Task closing and cognition maintenance

5. A purely read-only question, analysis, version check, or task that changes no AOCI-managed object does not require a maintenance-tool call. The AOCI version in use is `cognition_receipt.mcp_service_version` in any `aoci_overview` check_only or `aoci_maintain` response; the binary path is the `command` in the project's `.mcp.json`, and the CLI need not be on PATH.

6. When AOCI-managed objects change, call `aoci_maintain` once after they reach the task's final stable state. Do not maintain files individually after each intermediate edit.

7. If maintenance returns actual semantic candidates, the Host model must independently author the complete tag and F/R/A/S updates from each candidate's bound object and necessary evidence. Submit the complete candidate set for that current machine-issued batch in one `aoci_update_entry` call while preserving each path and the domain batch identity; `source_sha256` and `candidate_id` may be omitted, since the server takes them from the issued batch. `max_entries` limits one request and atomic transaction, not the logical plan, Whole-Index, or Managed Scope. When `remaining` is nonzero, call Maintain again after the successful Apply and continue from the new preimage; never shrink Index coverage or slice a returned batch to satisfy transport limits.

   When evidence is insufficient and the current layout supports `aoci_report`, use it instead of guessing, applying a template, or generating unsupported cognition merely to eliminate follow-up work.

8. Obey structured tool states and safety boundaries:

   - `repair_required`: repair only the explicitly identified candidates, then resubmit the complete current machine-issued batch;
   - `stopped`: end that write attempt and inspect `failed_step`, error, formal-write evidence, and Recovery. In auto mode, a proven zero-write closure is followed by a fresh Plan; a complete Intent with provable postimage is resumed; a policy-selected Rollback with exact preimage is completed and replanned. Stop the user task only when proof is unavailable, third-party bytes conflict, approval or external action is required, or another real safety boundary applies;
   - never ignore conflicts, approvals, human decisions, permissions, or safety signals; and
   - after alignment, do not repeat maintenance or writes; `refresh_ready_for_overview` is a checkpoint fact, and the Agent decides whether to request an ordinary complete Overview for its next phase.

   If any managed object changes after maintenance completes, the previous result is invalid. Complete closing again from the new final stable state.

9. When the user limits only business-file scope and does not explicitly forbid repository-managed assets, AOCI-managed assets may be updated during closing to preserve cognition consistency. Distinguish them from business files in audits and commits.

   When the user explicitly forbids changes to `aoci.txt`, `.aoci`, metadata, or any additional file, obey that restriction, do not write, and report any remaining inconsistency accurately.

### Specialized workflows

Initialization, complete-index generation, Header generation, Entries generation, database-structure indexing, Curation, human review, and failure recovery must follow only the instructions, commands, and safety stops returned by the current AOCI Guide or tool at the corresponding stage.

Do not preload, guess, or reconstruct these specialized workflows. The relevant Guide, tool descriptions, model Prompt, and CLI help provide platform invocation, request format, batch limits, approval rules, index-format details, and recovery steps as needed.
<!-- aoci:end -->
