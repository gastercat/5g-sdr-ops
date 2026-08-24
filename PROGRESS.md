# 5G SDR Operations Progress

更新日期：2026-08-24
文件角色：`CURRENT STATE / DELTA-ONLY NAVIGATION`

## Current Status

目前 project checkpoint：

- `KNOWN / FRESH OBSERVED 2026-08-24`：Lab01 control-side 與 Linux1／Linux2 Host／Network
  Current Truth 已恢復；Mac management 為 `en5 = 192.168.250.10/24`，Linux1 為
  `enxec9a0c14d482 = 192.168.250.11/24`，Linux2 為
  `enxec9a0c14d470 = 192.168.250.12/24`。
- `KNOWN / BOUNDED RUNTIME RECOVERY TO ATTACH`：Human 選定並使用 historical execution
  profile；fresh evidence 支持 EPC／eNB startup、EPC／eNB interaction、Cell Search、Random
  Access、RRC Connected、Network Attach 與 UE `172.16.0.2`。
- `OBSERVED_ONCE / UNKNOWN`：成功 attach 後，UE terminal 出現一次
  `Error receiving samples`；後續 sample-path recovery 與 root cause 都是 `UNKNOWN`。
- `NOT VALIDATED`：本次沒有執行 user-plane ICMP、NAT／Internet、throughput、latency／URLLC
  或 performance validation。
- `KNOWN / CLEAN_STOP_AFTER_BOUNDED_RUNTIME_RECOVERY`：最終 `srsepc`、`srsenb`、`srsue`
  均已確認停止；temporary `10.0.0.1/24`、`10.0.0.2/24` 與 direct route 已移除，
  management plane 保持完整。Human reported shutdown intent 為 UE → eNB → EPC／Ctrl-C，
  但 exact sequence 未被 Codex 逐階段獨立驗證。
- `ACCEPTED / CURRENT PRIORITY`：依 2026-08-18 professor meeting PD-01，暑假階段的
  current project priority 是完成 Lab01 與實驗手冊；兩者是必須分別保留的 deliverable
  dimensions。本 priority 不等於 Runtime authorization，兩者的 completion scope／criteria
  仍待另行 recovery／definition。
- `ACCEPTED / CURRENT CURRICULUM BOUNDARY`：學生課程不教 Agent；Git 僅保留安全完成實驗
  所需內容。既有 Agent learner draft 保留為 historical material。
- `ACCEPTED / PENDING MAPPING`：Security 改為未來穿插 Lab01～03 的 cross-cutting direction；
  本次未設計 topic mapping 或 exercise。
- `NOT_AUTHORIZED`：任何新的 Runtime、Lab01 recovery、Lab02 execution、persistent network
  change、configuration deployment 或 extended validation。
- `SCHEDULED / HUMAN-REPORTED`：原訂 2026-08-25 meeting 已 postponed；下一次 meeting
  為 2026-08-26。

## Workstream Status

| Workstream | Lifecycle | Current boundary |
| --- | --- | --- |
| Lab01 completion | `FRESH BOUNDED RECOVERY TO ATTACH / COMPLETION CRITERIA UNRESOLVED` | 8/24 已 fresh-observe attach 與 UE IP，但 user plane 未驗證；不宣稱 Full Lab01 PASS |
| Lab01 experiment manual | `CURRENT SUMMER PROJECT PRIORITY / NOT YET COMPLETE` | Canonical path、章節與 completion criteria 待另行 docs-only Work Unit |
| Lab01 recovered baseline | `HISTORICAL PHASE 4C + 2026-08-24 FRESH BOUNDED RECOVERY / CLOSED` | 兩組 evidence 分開保存；目前 Runtime 已停止、temporary sample plane 已移除 |
| Lab02 eMBMS | `NOT ACTIVE / NOT AUTHORIZED` | prerequisite 完成不等於自動授權 |
| Agent + Git Runbook | `INTERNAL ENGINEERING REFERENCE / STUDENT CURRICULUM SUPERSEDED` | 可保留 Maintainer safety／governance reference；不是 current teaching mainline |
| Future Teaching | `REPLAN_REQUIRED / NOT ACTIVE COURSE` | student Agent assumptions 已由 PD-03 supersede；Git scope 受 PD-04 限制 |
| Security curriculum mapping | `CROSS-CUTTING DIRECTION / NOT YET DESIGNED` | 未來對應 Lab01～03；不授權 security exercise 或 Runtime |
| Workflow vocabulary | `EXTERNALIZATION REQUIRED / NOT YET DEFINED` | 先定義 internal terms，再另行轉換 external language |
| 6G LEO / NTN | `RESEARCH_PARKING / CONCEPT_PROTOTYPE / NOT_INTEGRATED` | 不是 Lab01／Lab02 validated mainline |
| ACP | `PARKING / OBSERVATION` | 不是正式 Protocol、Policy 或 automated gate |

## 2026-08-24 Fresh Current Truth and Bounded Runtime Recovery

- Host／Network Current Truth 已恢復；兩端 source HEAD 同為
  `6bcbd9e5bf8686aa7085202cd847c5ddd64a9c16` 且 dirty，installed binaries present。
- Human 選定並使用 `HISTORICAL_EXECUTION_PROFILE`；clean candidate 沒有部署。
- Fresh Runtime recovery 到達 EPC／eNB／UE startup、Cell Search、RA、RRC、Attach 與 UE
  `172.16.0.2`；attach 後一次 sample receive error 的 recovery／root cause 保持 `UNKNOWN`，
  user plane 與 performance 均 `NOT VALIDATED`。
- Final clean stop：三個 Lab Runtime processes absent，temporary sample addresses／routes removed，
  management plane preserved；exact shutdown order 不是 independently verified。
- Execution provenance 見
  [`2026-08-24 TER`](docs/evidence/task-evidence/2026-08-24-lab01-current-truth-runtime-recovery.yaml)；
  TER 不自行建立 authority 或 future execution permission。

## Lab01 Recovered Baseline

以下為 Phase 4C historical baseline，與上方 2026-08-24 fresh evidence 分開保存。

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

- `CLEAN_STOP_AFTER_BOUNDED_RUNTIME_RECOVERY`：Runtime 已停止；temporary sample plane 已移除；
  management plane 保留。
- `HUMAN_REVIEW`：2026-08-24 Current Truth／Runtime evidence consolidation 尚待 Review；
  本次不 commit、不 push。
- `NEEDS_APPROVAL`：任何新的 Runtime start、persistent network change、configuration
  deployment、post-attach diagnosis、user-plane validation 或 Lab02 execution。
- `ACCEPTED`：Project Lead 可先完成 Lab01、Lab02，再於 stable implementation 後進行
  collaborator knowledge transfer；此 sequencing decision 不提供 Runtime 或 Lab02 authority。
- `UNRESOLVED_IMPLEMENTATION_DETAIL`：Lab01 completion scope／criteria、實驗手冊 completion
  criteria、Security mapping、student minimum Git scope、workflow vocabulary mapping 與
  knowledge-transfer acceptance criteria。

## Next Authorized Gate

本文件本身不授權下一個 mutation。下一個 bounded Lab01 Work Unit 必須由 Human 明確選擇；
不得預設 post-attach error diagnosis 或 user-plane validation 必然是下一步。任何選定工作仍須
重新定義 authority、scope、evidence、abort／stop point 與 cleanup boundary。

2026-08-26 meeting 的最小 review delta 是：8/24 已完成 fresh Host／Network recovery、以
historical execution profile fresh-observe attach 與 UE IP，並 clean stop；user plane 未驗證，
post-attach sample receive error 的 recovery／root cause 仍為 `UNKNOWN`。

## Canonical Pointers

- Repository navigation：[`README.md`](README.md)
- Architecture：[`docs/architecture-overview.md`](docs/architecture-overview.md)
- Decisions：[`docs/decision-register.md`](docs/decision-register.md)
- 2026-08-18 professor decisions：[`docs/decisions/2026-08-18-professor-meeting.md`](docs/decisions/2026-08-18-professor-meeting.md)
- Known limitations：[`docs/known-limitations.md`](docs/known-limitations.md)
- Task execution evidence：[`docs/evidence/task-evidence/README.md`](docs/evidence/task-evidence/README.md)
- 2026-08-24 Lab01 fresh execution evidence：[`TER`](docs/evidence/task-evidence/2026-08-24-lab01-current-truth-runtime-recovery.yaml)
- Internal Agent + Git reference：[`docs/runbooks/agent-git/README.md`](docs/runbooks/agent-git/README.md)
- Historical Future Teaching skeleton：[`docs/teaching/agent-git/README.md`](docs/teaching/agent-git/README.md)
- 6G NTN Research Parking：[`docs/research/6g-ntn-handover/README.md`](docs/research/6g-ntn-handover/README.md)

## Handoff Contract

Project Handoff 只保存：current delta、current stop point、next authorized gate、blocking
unresolved item 與 canonical document pointers。完整 architecture、decision rationale、歷史
troubleshooting 與重複 evidence 留在各自 canonical／historical surface；Handoff 不再作
Project Database。私人 Handoff 不屬於 project Agent Harness。
