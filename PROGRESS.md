# 5G SDR Operations Progress

更新日期：2026-08-11
文件角色：`CURRENT STATE / DELTA-ONLY NAVIGATION`

## Current Status

目前 project checkpoint：

- `KNOWN`：Lab01 Baseline Recovery Phase 4C 已在當時核准範圍內 `PASS / CLOSED`。
- `KNOWN`：Phase 4C 結束時已完成 controlled shutdown；服務未持續執行，
  `/etc/srsran/` 與 persistent network configuration 未被該階段修改。
- `KNOWN`：Agent + Git Runbook 是目前 active documentation／teaching workstream。
- `REVISION_REQUIRED`：Gate 4A 定向學習者檢閱已完成，回饋尚待另行授權的修訂 Work Unit 納入。
- `NOT_AUTHORIZED`：Gate 4B、任何新的 Runtime、Lab02 execution、persistent network change
  或 configuration deployment。

## Workstream Status

| Workstream | Lifecycle | Current boundary |
| --- | --- | --- |
| Lab01 recovered baseline | `HISTORICAL EXECUTION BASELINE / PASS / CLOSED` | 只支持當時 evidence 範圍；Runtime 已停止 |
| Lab02 eMBMS | `NOT ACTIVE / NOT AUTHORIZED` | prerequisite 完成不等於自動授權 |
| Agent + Git Runbook | `DRAFT / PARTIAL AUTHORING / REVISION_REQUIRED` | Gate 4A feedback 尚未納入；Gate 4B 未授權 |
| Future Teaching | `SKELETON / NOT ACTIVE COURSE` | 重用 Runbook，不建立第二份 operational authority |
| 6G LEO / NTN | `RESEARCH_PARKING / CONCEPT_PROTOTYPE / NOT_INTEGRATED` | 不是 Lab01／Lab02 validated mainline |
| ACP | `PARKING / OBSERVATION` | 不是正式 Protocol、Policy 或 automated gate |

## Lab01 Recovered Baseline

### Architecture

| Plane | Linux1 | Linux2 | Evidence boundary |
| --- | --- | --- | --- |
| Management | `192.168.250.11/24` | `192.168.250.12/24` | Ethernet management connectivity |
| Sample | `10.0.0.1/24` | `10.0.0.2/24` | temporary secondary addresses；ZeroMQ sample transport |
| UE User Plane | EPC SGi `172.16.0.1` | UE `172.16.0.2` | Phase 4C observed addressing and ICMP |

詳細架構與 Mac switch-side IP address provenance boundary 見
[`docs/architecture-overview.md`](docs/architecture-overview.md)。

Clean candidate 的 exact fields、backup 與 source provenance 由
[`Task Evidence Record`](docs/evidence/task-evidence/lab01-recovery-workstream.yaml) 提供指標；
active-residue observation 見
[`rollback inventory`](docs/audits/2026-07-10-rollback-inventory.md)。Candidate 狀態是
`OWNER-APPROVED ENGINEERING CANDIDATE / NOT_HISTORICALLY_CONFIRMED`，不是 active
configuration、historical deployment 或 current Runtime evidence。

### Confirmed Phase 4C scope

- `KNOWN`：Linux1 執行 EPC／eNB；Linux2 執行 UE。
- `KNOWN`：verified startup sequence 為 EPC → eNB → UE。
- `KNOWN`：`srsepc`、`srsenb`、`srsue` initialized。
- `KNOWN`：ZeroMQ transport、cell search、Random Access、RRC Connected 與 Network Attach 已觀察。
- `KNOWN`：`tun_srsue` 與 UE／EPC user-plane addressing 已觀察。
- `KNOWN`：雙向 ICMP 在 bounded tests 中為 0% packet loss。
- `OBSERVED`：average RTT 約 0.6～0.7 秒，只是 connectivity observation；
  不是 performance、low-latency、URLLC、reliability、stability 或 benchmark evidence。
- `KNOWN`：controlled shutdown sequence 為 UE → eNB → EPC。

歷史 evidence locator `~/5g-sdr-runtime-logs/` 僅為 `HISTORICALLY_REPORTED`；R1 沒有驗證
該路徑目前是否存在，也沒有重驗其內容。

### Explicitly outside the validated Phase 4C scope

- `NOT TESTED`：NAT／Internet access。
- `NOT TESTED`：TCP／iperf throughput。
- `NOT TESTED`：Wireshark／PCAP protocol observation。
- `NOT VALIDATED`：low-latency／URLLC／controlled performance。
- `NOT VALIDATED`：MBMS／eMBMS／SIB13 functional behavior。
- `NOT TESTED`：B210 OTA、2x2 MIMO。

早期 Candidate Sources 曾提到歷史 Lab01 evidence 涵蓋 NAT 與 packet observation；
這是 `HISTORICAL` provenance，不能用來宣稱 recovered Phase 4C 已驗證這些項目。
完整限制見 [`docs/known-limitations.md`](docs/known-limitations.md)。

## Current Stop Point

- `HUMAN_REVIEW`：本 Repository 的 docs-only change 必須先完成範圍、diff、evidence、
  Claim Boundary 與 lifecycle Review。
- `NEEDS_APPROVAL`：任何新的 Runtime start、persistent network change、configuration
  deployment、extended validation 或 Lab02 execution。
- `UNRESOLVED`：Mainline non-blocking 與 collaboration authority 的分界尚未由 Owner
  正式定義；Agent 不得自行補成 governance rule。

## Next Authorized Gate

本文件本身不授權下一個 mutation。候選下一步是另行建立範圍明確的 docs-only Work Unit，
將 Gate 4A feedback 納入 Agent + Git Runbook，或執行 Instructor-led Read-only Agent dry run。
兩者都必須在各自任務包內重新確認 authority、scope、evidence 與 stop point。

## Canonical Pointers

- Repository navigation：[`README.md`](README.md)
- Architecture：[`docs/architecture-overview.md`](docs/architecture-overview.md)
- Decisions：[`docs/decision-register.md`](docs/decision-register.md)
- Known limitations：[`docs/known-limitations.md`](docs/known-limitations.md)
- Task execution evidence：[`docs/evidence/task-evidence/README.md`](docs/evidence/task-evidence/README.md)
- Agent + Git operational source：[`docs/runbooks/agent-git/README.md`](docs/runbooks/agent-git/README.md)
- Future Teaching：[`docs/teaching/agent-git/README.md`](docs/teaching/agent-git/README.md)
- 6G NTN Research Parking：[`docs/research/6g-ntn-handover/README.md`](docs/research/6g-ntn-handover/README.md)

## Handoff Contract

Project Handoff 只保存：current delta、current stop point、next authorized gate、blocking
unresolved item 與 canonical document pointers。完整 architecture、decision rationale、歷史
troubleshooting 與重複 evidence 留在各自 canonical／historical surface；Handoff 不再作
Project Database。私人 Handoff 不屬於 project Agent Harness。
