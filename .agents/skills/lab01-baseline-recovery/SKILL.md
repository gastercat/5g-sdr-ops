---
name: lab01-baseline-recovery
description: Safely identify, compare, review, and recover the authoritative srsRAN_4G Lab01 ZeroMQ baseline without modifying runtime configurations before approval.
---

# Lab01 Baseline Recovery

## Purpose

Identify the authoritative srsRAN_4G Lab01 ZeroMQ baseline and, only after approval, recover the smallest necessary configuration set with auditable evidence. This skill protects runtime state; it is not authorization to deploy.

## When to Use

Use for any request to identify, compare, plan recovery of, deploy, or validate the Lab01 EPC/eNB/UE baseline. Read `AGENTS.md` and `PROGRESS.md` first.

## Inputs

- Current checkpoint and constraints from `PROGRESS.md`.
- Paired Linux1 (EPC/eNB) and Linux2 (UE) candidate sources.
- Installed `srsRAN_4G` commit/version for each host when available.
- Non-sensitive runtime metadata, approved repository snapshots, and successful Lab01 evidence.

Do not collect or record passwords, Ki, OPC, tokens, or private keys.

## Host Roles and Network

| Host | Role | Management IP |
| --- | --- | --- |
| Mac | Control, Git, approval | 192.168.250.10/24 |
| Linux1 | EPC / eNB | 192.168.250.11/24 |
| Linux2 | UE | 192.168.250.12/24 |

The management subnet is `192.168.250.0/24`; it has no gateway and no DNS. Remote checks are read-only unless an approved deployment phase explicitly says otherwise.

## Authority Ranking

Rank candidates from strongest to weakest:

1. Successful Lab01 runtime evidence.
2. Approved repository snapshot or configuration.
3. Traceable paired Linux1 and Linux2 configuration.
4. Matching `srsRAN_4G` example for the installed commit.
5. Historical Lab01 teaching material.
6. Legacy `/etc/srslte` configuration.

Lower-ranked material can inform comparison but cannot override stronger, contradictory evidence. Legacy configuration must never be copied directly to `/etc/srsran/`.

## Phase 1 Candidate Inventory

1. Confirm repository state and read the progress checkpoint.
2. Inventory candidate source, host role, timestamp, version/commit, and a non-sensitive hash or diff reference.
3. Label each item `CANDIDATE`, `CONFIRMED`, `UNKNOWN`, or `REJECTED` with a reason.
4. Separate Lab02 eMBMS/MBSFN residue from possible Lab01 components. ZeroMQ is a preserved Lab01 component, not residue.
5. Do not edit runtime files, copy configurations, or start services.

## Phase 2 Read-only Comparison

Compare paired Linux1 and Linux2 candidates read-only:

- Confirm EPC/eNB and UE roles are paired and use compatible `srsRAN_4G` commits.
- Compare active-file selection, includes, scheduler/expert/PHY overrides, and Lab02-specific eMBMS/MBSFN settings.
- Verify ZeroMQ peer IP addresses and that TX/RX TCP ports are complementary in both directions. Do not accept an ambiguous `device_args` interpretation.
- Record differences without exposing sensitive values.

Stop if pairing, version compatibility, active-file selection, or ZeroMQ direction cannot be proven.

## Phase 3 Rollback Plan

Prepare, but do not execute, a controlled recovery plan containing:

- authoritative candidate and ranking rationale;
- exact approved source-to-target mapping;
- Lab02 residue excluded or retained with rationale;
- prerequisite backup and verification approach;
- ordered minimum deployment steps and explicit abort points;
- validation commands, expected non-sensitive observations, and evidence paths.

Do not use Git rollback operations in `/etc/srsran/`. `configs/` may contain only human-reviewed, approved templates.

## Human Approval Gate

Obtain explicit human approval after the comparison and plan are reviewed. The approval must identify the candidate, target hosts, intended changes, and validation scope. Without it, remain read-only and report the next evidence needed.

## Phase 4 Controlled Deployment

After approval only, deploy the minimum reviewed configuration changes. Preserve the approved record, apply the plan in order, and stop at the first unexpected result. Do not broaden the scope, substitute candidates, or make exploratory runtime edits.

## Phase 5 Minimal Validation

After the approved deployment:

1. Validate complementary ZeroMQ connectivity and TX/RX direction.
2. Perform the minimum approved attach validation.
3. Validate ICMP, TCP, and NAT only within the approved scope.
4. Capture non-sensitive evidence and record PASS, FAIL, or INCONCLUSIVE exactly as observed.

No service may be started merely to gather baseline-identification evidence.

## Evidence Requirements

For each decision or validation, record source, host role, timestamp, `srsRAN_4G` commit/version where known, command or observation type, redacted result, and conclusion. A PASS requires direct evidence. An absent source, unpaired configuration, or unresolved contradiction remains `UNKNOWN`.

## Stop Conditions

Stop and request direction if any of these occur:

- No paired Linux1/Linux2 source can be found.
- ZeroMQ TX/RX is not complementary.
- The srsRAN commit is incompatible.
- Lab02 residue cannot be separated from Lab01 settings.
- Runtime changes are needed to continue identification.
- Evidence and source material conflict.
- Any deployment uncertainty remains.

## Forbidden Actions

- Modifying `/etc/srsran/` before approval.
- Starting `srsepc`, `srsenb`, or `srsue` before approval.
- SSH actions that are not read-only during inventory or comparison.
- `git checkout`, `git reset`, or equivalent rollback against active runtime configuration.
- Copying `/etc/srslte/` directly to `/etc/srsran/`.
- Committing secrets or recording sensitive credentials.
- Claiming a PASS without evidence.

## Required Output Schema

```markdown
## Lab01 Baseline Recovery Record

- Phase: inventory | comparison | plan | awaiting-approval | deployment | validation | stopped
- Runtime modified: true | false
- Services started: true | false
- Authority selected: CONFIRMED | CANDIDATE | NONE
- Candidate sources:
  - source: ...
    host role: ...
    authority rank: ...
    status: CONFIRMED | CANDIDATE | UNKNOWN | REJECTED
- ZeroMQ pairing: CONFIRMED | UNKNOWN | CONFLICT
- Evidence: ...
- Stop condition or approval reference: ...
- Next action: ...
```
