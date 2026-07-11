# 5G SDR Operations Progress

## Current Status

`PENDING` — Lab01 has not been recovered or validated in this repository. The current work is documentation and baseline identification only.

## Delivery Deadline

2026-07-14. Owner: 七瀨 宵｜Nanase Yoi. Support: 七賴 澪｜Nanase Rei.

## Repository State

- Repository: `/Users/gastercat/Workspace/5g-sdr-ops`
- Expected branch: `main`
- Known latest commit at this checkpoint: `1562c60`
- Runtime changes: `NONE`
- Services started: `false`

## Host and Network Topology

| Node | Role | Management IP |
| --- | --- | --- |
| Mac | Control / Git / approval | 192.168.250.10/24 |
| Linux1 | EPC / eNB | 192.168.250.11/24 |
| Linux2 | UE | 192.168.250.12/24 |

- Subnet: `192.168.250.0/24`
- Gateway: none
- DNS: none

## Completed Governance

- `KNOWN`: Configuration governance and remote-agent policy are documented.
- `KNOWN`: Lab02-to-Lab01 rollback inventory is documented as read-only audit evidence.
- `KNOWN`: Repository instruction and Lab01 recovery skill were prepared and content-reviewed on 2026-07-11.
- `NOT DONE`: No Lab01 runtime recovery or validation was performed by this documentation task.

## Known Lab02 Residue

`KNOWN` from the read-only audit; classification against an authoritative Lab01 baseline remains pending.

| Host | Observed residue or pending verification |
| --- | --- |
| Linux1 | `sib.conf.mbsfn`, eMBMS enabled, `mbms.conf`, SIB13/MBSFN configuration, scheduler or expert overrides pending verification |
| Linux2 | `mbms_service_id`, `mbms_service_port`, MAC PCAP enabled, PHY overrides pending verification |

## Current Checkpoint

**Authoritative Lab01 Baseline Identification**

`KNOWN`: ZeroMQ is a Lab01 component and must not be removed.

`PENDING`: Identify a compatible, paired Linux1/Linux2 Lab01 source and verify ZeroMQ IP and TX/RX port direction without changing runtime configuration.

## Candidate Sources

- `CANDIDATE`: successful Lab01 runtime evidence — none located in this repository.
- `CANDIDATE`: approved repository snapshot or configuration — none confirmed.
- `CANDIDATE`: traceable paired Linux1/Linux2 configuration — current audit data requires pairing and provenance review.
- `REFERENCE`: matching `srsRAN_4G` example for the installed commit — installed commit unknown.
- `REFERENCE`: historical Lab01 teaching material — lower authority only.
- `REFERENCE`: legacy `/etc/srslte` configuration — lowest authority; never copy directly to `/etc/srsran/`.

## Confirmed Facts

- `KNOWN`: Linux1 is the EPC/eNB role; Linux2 is the UE role.
- `KNOWN`: The management network is `192.168.250.0/24`, without gateway or DNS.
- `KNOWN`: Active runtime configurations live in `/etc/srsran/` and are not a Git working tree.
- `KNOWN`: `srsRAN_4G/` is the source and patch repository.
- `KNOWN`: `configs/` is reserved for manually reviewed, approved templates.
- `KNOWN`: No runtime change or service startup is recorded at this checkpoint.

## Unresolved Questions

- `UNKNOWN`: Which candidate is the authoritative Lab01 baseline?
- `UNKNOWN`: Are Linux1 and Linux2 candidate configurations traceably paired?
- `UNKNOWN`: Which `srsRAN_4G` commit/version is installed on each host, and are they compatible?
- `UNKNOWN`: Are current ZeroMQ IP addresses and TX/RX ports complementary?
- `UNKNOWN`: Which scheduler, expert, and UE PHY overrides belong to Lab01?
- `UNKNOWN`: Whether Linux2 MAC PCAP belongs in the approved Lab01 profile.

## Safety Boundaries

- Remote checks default to read-only.
- Do not modify `/etc/srsran/`, start `srsepc`, `srsenb`, or `srsue`, or perform recovery before evidence review and human approval.
- Never use `git checkout` or `git reset` as a runtime rollback mechanism.
- Never place passwords, Ki, OPC, tokens, SSH private keys, or other secrets in Git.
- Stop on uncertain provenance, incomplete host pairing, unclear ZeroMQ direction, conflicting evidence, or deployment uncertainty.

## Next Action

Use `.agents/skills/lab01-baseline-recovery/SKILL.md` to perform Phase 1 candidate inventory only. Stop for human review before beginning Phase 2 paired comparison.

## Parked Work

- Historical conversation document recovery
- SSH environment issue documentation
- RF / PHY observability expansion
- 6G / NTN side projects

## Last Updated

2026-07-11 — Documentation harness created; no runtime actions performed.
