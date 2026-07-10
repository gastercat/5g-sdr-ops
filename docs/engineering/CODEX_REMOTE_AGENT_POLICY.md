# Codex Remote Agent Policy

Version: 0.1-draft

## Purpose

Define safe, auditable operating boundaries for agents working on the 5G SDR environment.

## Scope

This policy applies to local repository work and all remote-host access associated with the lab.

## System Architecture

The environment separates a Mac controller, an EPC/eNB host, and a UE host. Documentation must describe host roles without embedding credentials, subscriber records, or configuration bodies.

## Host Inventory Rules

Record host role, approved address reference, configuration path, metadata, and non-secret hashes where approved. Do not infer that every file present is runtime-active.

## Credential Handling

Passwords must be entered interactively and must never appear in prompts, commands, logs, documents, commits, or reports. Prefer passphrase-protected SSH keys for future persistent workflows. Subscriber databases and authentication secrets must never be committed.

## Permission Levels

| Level | Name | Description |
| --- | --- | --- |
| 0 | Local read-only | Inspect repository files without modification. |
| 1 | Remote read-only audit | SSH inspection using explicitly allowed non-mutating commands. |
| 2 | Repository documentation write | Modify documentation in an isolated Git branch. |
| 3 | Remote configuration change | Requires explicit human approval, backup, diff, rollback plan, and validation plan. |
| 4 | Runtime or network control | Starting services or changing routes, firewall, interfaces, kernel, SDR, or RF requires separate explicit approval. |

## Read-only Audit Mode

Use only the approved SSH commands and gather the minimum evidence needed. Do not use sudo, alter remote state, access secrets, or read subscriber database contents.

## Repository Write Mode

Limit writes to approved documentation on an isolated branch. Review the diff for secrets and unrelated changes before committing.

## Remote Configuration Change Mode

Level 3 requires an explicit human approval gate before any remote mutation. The request must name the intended files and expected effect.

## Runtime and Service Control Mode

Level 4 requires separate approval for every service, route, firewall, interface, kernel, SDR, or RF action. No approval may be inferred from a prior audit.

## Hardware and RF Control Mode

Treat transmit, receive, gain, frequency, and attached SDR hardware actions as Level 4, even when configuration changes appear small.

## Approval Gates

Agents stop on ambiguity rather than infer permission. Approval must cover the level, target hosts, scope, validation, and rollback path.

## Allowed Command Principles

Remote commands must be explicitly non-mutating, narrowly scoped, and appropriate to the approved mode. Prefer metadata, targeted searches, and hashes over copying files.

## Forbidden Actions

Never use sudo without explicit scope approval; modify remote files; upload, rename, delete, or create remote files; start or stop services; change routes, interfaces, NetworkManager, nftables, or iptables; access private material, password hashes, shell history, or subscriber records; or place secrets in Git.

## SSH Policy

Use SSH only for remote access. Authenticate interactively unless an approved credential mechanism is available. Do not persist passwords or embed them in commands.

## Backup-before-change Rule

Before a Level 3 change, create and verify an approved backup location that excludes secrets from the repository.

## Diff-before-apply Rule

Produce a minimal proposed diff and obtain review before application. Do not apply an unreviewed remote configuration change.

## Rollback Plan Requirement

Every Level 3/4 request needs an identified baseline, rollback steps, owner, stop conditions, and validation criteria before execution.

## Git Branch and Pull Request Workflow

Use a purpose-specific branch, commit only scoped files, inspect the final diff, and do not push or open a pull request unless explicitly authorized.

## Evidence Collection

Capture command class, timestamp, host role, selected findings, metadata, and non-secret hashes. Evidence is not a backup and must not contain configuration bodies or secrets.

## Secret and Sensitive Data Handling

Public repository documents must not expose credentials, subscriber data, private keys, authentication material, or complete active configuration files.

## Incident and Abort Conditions

Abort immediately on an unexpected write prompt, ambiguous authority, missing baseline, inaccessible target, sensitive-data exposure risk, or any result inconsistent with the approved scope. Report the condition without attempting a workaround that broadens authority.

## Required Completion Report

Report preflight state, approved actions, audit findings, changed local files, sensitive-data checks, quality checks, commit result, remaining unknowns, and confirmation that no unapproved remote state changed.

## Future Agent Compatibility

Future agents must honor these permission levels, preserve evidence boundaries, and request a new approval gate when the task crosses into a higher level.
