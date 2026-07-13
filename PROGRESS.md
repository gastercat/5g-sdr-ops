# 5G SDR Operations Progress

## Current Status

`PENDING` — Phase 4B Gate B completed successfully. The controlled topology migration established the approved dual-plane network without persistent network configuration changes; service startup and ZeroMQ runtime validation remain pending.

## Delivery Deadline

2026-07-14. 
Owner: Project Lead.
Support: AI-assisted engineering workflow under human review.

## Repository State

- Repository: `/Users/gastercat/Workspace/5g-sdr-ops`
- Expected branch: `main`
- Last reviewed repository commit: `a2d4e4a`
- Checkpoint validation: The recorded commit may be an ancestor of current `HEAD` after reviewed PR merges; strict equality with `HEAD` is not required.
- Runtime configuration changes: `NONE`
- Temporary network changes: Linux1 `10.0.0.1/24`; Linux2 `10.0.0.2/24`
- Services started: `false`

## Host and Network Topology

| Node | Role | Management IP | Sample-plane IP |
| --- | --- | --- | --- |
| Mac | Control / Git / approval | 192.168.250.10/24 | — |
| Linux1 | EPC / eNB | 192.168.250.11/24 | 10.0.0.1/24 |
| Linux2 | UE | 192.168.250.12/24 | 10.0.0.2/24 |

- Management subnet: `192.168.250.0/24`
- Sample-plane subnet: `10.0.0.0/24`
- Sample-plane persistence: temporary runtime only
- Sample-plane gateway: none
- Sample-plane DNS: none

## Completed Governance

- `KNOWN`: Configuration governance and remote-agent policy are documented.
- `KNOWN`: Lab02-to-Lab01 rollback inventory is documented as read-only audit evidence.
- `KNOWN`: Repository instruction and Lab01 recovery skill were prepared, content-reviewed, and merged through PR #4 on 2026-07-11.
- `NOT DONE`: No Lab01 runtime recovery or validation was performed by this documentation task.

## Confirmed Lab02 Residue

`KNOWN` from the read-only audit and Phase 2 field-level reconciliation; these settings are excluded from the clean Lab01 candidate.

| Host | Confirmed residue |
| --- | --- |
| Linux1 | `sib.conf.mbsfn`, eMBMS enabled, `mbms.conf`, SIB13/MBSFN, and M1 configuration |
| Linux2 | `mbms_service_id`, `mbms_service_port`, `snr_estim_alg = empty`, and `interpolate_subframe_enabled = true` |

## Current Checkpoint

**Lab01 Baseline Recovery — Phase 4B Gate B Controlled Topology Migration Complete**

- `KNOWN`: Phase 2E field-level reconciliation passed human review.
- `KNOWN`: Evidence collection is complete.
- `KNOWN`: Engineering decisions are complete.
- `KNOWN`: The preferred topology is a controlled migration to switched Ethernet; it is not an exact historical rollback.
- `KNOWN`: Linux1 uses `192.168.250.11/24` for management and `10.0.0.1/24` as a temporary sample-plane secondary address.
- `KNOWN`: Linux2 uses `192.168.250.12/24` for management and `10.0.0.2/24` as a temporary sample-plane secondary address.
- `KNOWN`: The validated historical USB-adapter and Wi-Fi-hotspot topology remains the explicit fallback.
- `KNOWN`: Linux1 scheduler candidate values are `pusch_max_mcs = 16`, `min_nof_ctrl_symbols = 1`, and `max_nof_ctrl_symbols = 3`; classification is `CLEAN_CANDIDATE_NOT_HISTORICALLY_CONFIRMED`.
- `KNOWN`: Linux2 PHY selections are `nof_phy_threads = 1`, `snr_estim_alg = refs`, and `interpolate_subframe_enabled = false`.
- `KNOWN`: UE PCAP defaults to `enable = none`; `enable = mac` is retained as the optional observation profile.
- `KNOWN`: The clean Lab01 candidate excludes eMBMS, MBSFN, SIB13, M1, and UE MBMS residue.
- `KNOWN`: ZeroMQ is a Lab01 component and must not be removed.
- `KNOWN`: The backup, network migration, field-level configuration, startup, validation, abort, and rollback plans are complete.
- `KNOWN`: Switched Ethernet remains the primary controlled migration; it is not an exact historical rollback.
- `KNOWN`: The historical USB-adapter and Wi-Fi-hotspot topology remains a separately approved fallback.
- `KNOWN`: No deployable configurations were created.
- `KNOWN`: Apart from this approved documentation update, repository artifacts are unchanged; runtime, network, and service state remain unchanged.
- `KNOWN`: Phase 4A Gate 1 Backup: `PASS / CLOSED`.
- `KNOWN`: The backup package passed source/destination metadata, SHA-256, manifest, and paired `COMPLETE` marker validation.
- `KNOWN`: Human Review: `PASS`.
- `KNOWN`: Phase 4B: `AUTHORIZED`.
- `KNOWN`: Phase 4B Gate B controlled topology migration completed successfully.
- `KNOWN`: Cross-host bidirectional sample-plane ping passed.
- `KNOWN`: New management SSH sessions to Linux1 and Linux2 were verified after the migration.
- `KNOWN`: The repository remained clean during Gate B execution.
- `KNOWN`: No persistent network configuration was changed.
- `KNOWN`: No services were started, and `/etc/srsran/` remained unchanged.
- `KNOWN`: ZeroMQ runtime was not tested.

- `PENDING`: Gate B completion evidence requires human review before any service startup or ZeroMQ runtime test.

## Candidate Sources

- `CONFIRMED`: successful Lab01 as-built evidence supports the historical ZeroMQ design, attach, UE address assignment, ICMP/GTP-U, NAT, and packet observation.
- `CONFIRMED`: the field-level clean Lab01 candidate is complete and has passed human engineering review.
- `REFERENCE`: matching-commit `srsRAN_4G` examples support selected clean-candidate fields but are not whole-file authority.
- `REFERENCE`: current Linux1/Linux2 configurations preserve some Lab01 values but contain confirmed Lab02 residue and are not complete recovery sources.
- `REFERENCE`: historical Lab01 teaching material — lower authority only.
- `REFERENCE`: legacy `/etc/srslte` configuration — lowest authority; never copy directly to `/etc/srsran/`.

## Confirmed Facts

- `KNOWN`: Linux1 is the EPC/eNB role; Linux2 is the UE role.
- `KNOWN`: The management network is `192.168.250.0/24`, without gateway or DNS.
- `KNOWN`: Active runtime configurations live in `/etc/srsran/` and are not a Git working tree.
- `KNOWN`: `srsRAN_4G/` is the source and patch repository.
- `KNOWN`: `configs/` is reserved for manually reviewed, approved templates.
- `KNOWN`: No runtime change or service startup is recorded at this checkpoint.

## Remaining Gate

- `KNOWN`: The Phase 3 plan passed human review; planning is complete.
- `KNOWN`: Phase 4A Gate 1 Backup is `PASS / CLOSED`; its human review passed.
- `KNOWN`: Phase 4B Gate A management-interface verification passed.
- `KNOWN`: Phase 4B Gate B controlled topology migration completed successfully.
- `NEEDS_APPROVAL`: Human review of Gate B evidence is required before any subsequent runtime or service action.

## Safety Boundaries

- Remote checks default to read-only.
- Do not modify `/etc/srsran/`, start `srsepc`, `srsenb`, or `srsue`, or perform recovery before evidence review and human approval.
- Never use `git checkout` or `git reset` as a runtime rollback mechanism.
- Never place passwords, Ki, OPC, tokens, SSH private keys, or other secrets in Git.
- Stop on uncertain provenance, incomplete host pairing, unclear ZeroMQ direction, conflicting evidence, or deployment uncertainty.

## Next Action

Review the Phase 4B Gate B evidence. Do not start services, modify `/etc/srsran/`, or test ZeroMQ runtime without separate authorization.

## Parked Work

- Historical conversation document recovery
- SSH environment issue documentation
- RF / PHY observability expansion
- 6G / NTN side projects

## Last Updated

2026-07-13 — Phase 4B Gate B controlled topology migration completed; dual-plane connectivity passed without persistent network, runtime configuration, or service changes.
