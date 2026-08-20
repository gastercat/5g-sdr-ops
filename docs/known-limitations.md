# 5G SDR Known Limitations

狀態：`CANONICAL CLAIM-BOUNDARY REGISTER`

更新日期：2026-08-20

## 使用方式

本文件記錄已知未驗證範圍、歷史上仍需重驗的知識與未解衝突。`NOT TESTED`、
`NOT VALIDATED`、`HISTORICAL_NEEDS_REVALIDATION`、`UNRESOLVED` 與 `REPO_CONFLICT`
都不是失敗的委婉說法，也不得被改寫成 `PASS`。

## Lab01 Recovered Baseline

Phase 4C 可支持 initialization、ZeroMQ、cell search、Random Access、RRC Connected、
Network Attach、UE／EPC addressing、bounded bidirectional ICMP 與 controlled shutdown。
它不支持下列 completion claims：

| Claim | Status | Boundary |
| --- | --- | --- |
| NAT／Internet access | `NOT TESTED` | 歷史 as-built reference 不等於 recovered Phase 4C validation |
| TCP／iperf throughput | `NOT TESTED` | 沒有該階段 command output、KPI 或 controlled methodology |
| Wireshark／PCAP protocol observation | `NOT TESTED` | 舊 Lab 文件只保存目標或待補 evidence |
| low-latency／URLLC | `NOT VALIDATED` | observed RTT 只屬 connectivity observation |
| performance／reliability／stability benchmark | `NOT VALIDATED` | sample count、duration、load 與 methodology 不足 |
| MBMS／eMBMS／MBSFN／SIB13 function | `NOT VALIDATED` | residue classification 或 component log 不等於功能 PASS |
| B210 OTA | `NOT TESTED` | Phase 4C 使用 ZeroMQ，不是實體 RF OTA |
| 2x2 MIMO | `NOT TESTED` | 沒有 RF／MIMO execution evidence |

### RTT 與 loss

- `OBSERVED`：bounded bidirectional ICMP tests 中 packet loss 為 0%。
- `OBSERVED`：average RTT 約 0.6～0.7 秒。
- `FORBIDDEN INFERENCE`：不得因此宣稱 low latency、URLLC、performance、reliability、
  stability 或 benchmark。

### Historical Runtime identity and MBMS log boundary

- `HISTORICAL_RUNTIME_EVIDENCE / CONVERSATION_SOE_PROVENANCE`：Conversation SoE 保存
  歷史 Runtime 的 PLMN `00101` 與 TAC `7` observation；目前 Repo primary evidence 沒有重現
  該 raw output，因此不得改寫為 current Runtime identity。
- `HISTORICAL_RUNTIME_COMPONENT_OBSERVATION`：同一 provenance 保存 literal
  `MBMS service started, Service id=0, port=4321, lcid=1`；目前 Repo 未保存可直接重驗的 raw log。
  此 observation 不證明 MBMS／eMBMS functionality、SIB13／MBSFN signalling、MCCH／MTCH、
  multicast user path、UE reception 或完整 eMBMS Control Plane 正確，也不得改寫成 eMBB。

### Historical evidence conflict

舊 `PROGRESS.md` Candidate Sources 曾把 NAT 與 packet observation 列入 historical successful
Lab01 evidence；較細緻的 2026-07-14 claim-to-evidence audit 明確限制它們不是 recovered
Phase 4C completion scope。本次 canonicalization 不刪除該 provenance，但把 current claim
固定為 `NOT TESTED`。若要提升狀態，必須提供同一 scope 的 direct primary evidence。

### Clean candidate boundary

Status：`OWNER-APPROVED ENGINEERING CANDIDATE / NOT_HISTORICALLY_CONFIRMED`

| Surface | Candidate value |
| --- | --- |
| Linux1 RF | `device_name = zmq`；`tx_port = tcp://*:2000`；`rx_port = tcp://10.0.0.2:2001` |
| Linux1 PHY／SIB | `base_srate = 23.04e6`；`nof_phy_threads = 1`；`sib_config = sib.conf` |
| Linux1 scheduler | `pusch_max_mcs = 16`；`min_nof_ctrl_symbols = 1`；`max_nof_ctrl_symbols = 3` |
| UE PCAP | clean profile `enable = none`；optional observation profile `enable = mac` |
| Clean SIB source | matching-commit `srsenb/sib.conf.example`；SHA-256 `b781724b1c199e610e7f4d12b7963120c02d85da4389bccb9c5f8124ee0b57e9` |

這組 candidate 不等於歷史 active residue config、historically deployed baseline 或 current
Runtime configuration。Exact evidence index 見
[`Task Evidence Record`](evidence/task-evidence/lab01-recovery-workstream.yaml)。

### Historical source-tree provenance

`HISTORICAL_PRIMARY_OBSERVED`：Linux1 與 Linux2 的 `~/srsRAN_4G` 曾觀察為 commit
`6bcbd9e5bf8686aa7085202cd847c5ddd64a9c16`，但 working trees 並不乾淨：Linux1 有
`M srsenb/enb.conf.example` 與 `?? build/`；Linux2 有 `M srsue/ue.conf.example` 與
`?? build/`。因此 commit identity 不等於 pristine checkout，也不代表目前 source 或 Runtime
version。

## Lab02 Historical Compatibility

Lifecycle：`HISTORICAL_NEEDS_REVALIDATION / NOT ACTIVE / NOT AUTHORIZED`

| Claim | Current status | 不可越過的邊界 |
| --- | --- | --- |
| Lab02／eMBMS configuration residue | `HISTORICAL_CONFIGURATION_RESIDUE_OBSERVED` | 歷史 active-selection／field evidence 不等於 current config 或 feature validation |
| SIB13 configuration mapping | `HISTORICAL_CONFIGURATION_RESIDUE_OBSERVED` | 不等於 UE Runtime observation |
| SIB13 Runtime observation | `UNRESOLVED` | 沒有足以建立 current PASS 的 primary evidence |
| MCCH Runtime observation | `UNRESOLVED` | MAC-LTE visible 不等於 MCCH validated |
| MTCH Runtime observation | `UNRESOLVED` | service／eNB starts 不等於 MTCH validated |
| Historical parser migration | `HISTORICAL_NEEDS_REVALIDATION` | 當時 source／example evidence不等於目前版本 authority |
| UE MAC PCAP／FIFO final procedure | `UNRESOLVED / HISTORICAL_NEEDS_REVALIDATION` | actual repair root cause 與 final startup／recovery procedure 尚未裁定 |
| DLT 147 vs 149 | `UNRESOLVED / VERSION_SENSITIVE` | 不建立無版本條件的固定操作步驟 |
| eMBMS Control Plane terminology | `UNRESOLVED_TERMINOLOGY` | 不宣稱 Control Plane completed |

必須持續保留：

- SIB13 config mapping ≠ SIB13 Runtime observation。
- MAC-LTE visible ≠ SIB13／MCCH／MTCH validated。
- MBMS／eNB service starts ≠ MBMS functional validation。
- Old srsLTE course material ≠ current srsRAN_4G implementation authority。

任何 Lab02 revalidation 都需要新的版本／commit、source mapping、Runtime scope、evidence plan
與 Human authorization；本文件不授權執行。

## Agent + Git Historical Runbook and Teaching

依 2026-08-18 PD-03，student Agent curriculum 已 supersede；依 PD-04，student Git scope
限於安全完成實驗所需內容。Agent + Git Runbook 保留為 internal engineering reference，既有
learner draft 與 Gate 4A feedback 只保存 historical provenance，不再構成 current teaching
backlog。Gate 4A 當時只完成 targeted learner reading／review，不是完整 usability、course 或
operational validation；下列未驗證狀態不因 lifecycle reclassification 而升格：

| Item | Status | Boundary |
| --- | --- | --- |
| Section 3 Windows Clone comprehension | `HISTORICAL_REVISION_INPUT / SUPERSEDED` | 不再是 current learner authoring item |
| Claim Boundary comprehension | `HISTORICAL_REVISION_INPUT / SUPERSEDED` | 不再是 student Agent curriculum item |
| Prompt Context／Required Output | `HISTORICAL_REVISION_INPUT / SUPERSEDED` | 不再是 student Agent curriculum item |
| Instructor-led Read-only Agent exercise | `NOT EXECUTED / SUPERSEDED` | 不得升格為 current student exercise |
| Gate 4B learner authoring | `NOT AUTHORIZED / SUPERSEDED` | 不再是 current teaching gate |
| Windows Git happy path | `UNVERIFIED / SCOPE_REQUIRES_REDEFINITION` | student-safe minimum Git scope 尚未定義 |
| Windows Codex workflow | `UNVERIFIED / INTERNAL ONLY` | 不宣稱安裝、連線或端到端驗證 |
| GitHub authentication choice | `UNRESOLVED` | 不在本次任務設定 authentication |
| Gemini CLI | `CANDIDATE / UNVERIFIED / INTERNAL ONLY` | 不是 student curriculum tool |
| Ollama／Local Model adapter | `CANDIDATE / UNVERIFIED / INTERNAL ONLY` | 架構概念不等於 Windows、安全或效能驗證 |

Future Teaching 現為 `REPLAN_REQUIRED / NOT ACTIVE COURSE`；詳見
[`docs/teaching/agent-git/README.md`](teaching/agent-git/README.md)。

## 6G LEO / NTN

6G line 的 authoritative lifecycle boundary 位於
[`docs/research/6g-ntn-handover/README.md`](research/6g-ntn-handover/README.md)。
此處只保留指標：`RESEARCH_PARKING / CONCEPT_PROTOTYPE / NOT_INTEGRATED`。

不得宣稱 real LEO handover、3GPP NTN compliance、srsRAN scheduler integration、MAC／RRC
mobility control 或 real Doppler compensation 已實作或驗證。

## Open Provenance and Governance Questions

| Item | Status | Required next evidence／decision |
| --- | --- | --- |
| Mac `.10` configuration method／Network Service／persistence | `UNRESOLVED` | 歷史 `en5 = 192.168.250.10/24` 已直接觀察；仍需設定來源與 reconnect／reboot evidence |
| Lead-first implementation details | `UNRESOLVED_IMPLEMENTATION_DETAIL` | PD-06 已裁定 sequencing authority；stable implementation、共同 Review、escalation 與 knowledge-transfer acceptance criteria 尚待定義 |

## Promotion Rule

任何 limitation 升格為 `CONFIRMED` 或 `PASS` 前，必須同時具備適用版本／日期、直接 evidence、
明確 scope、claim-level mapping 與 Human Review。Conversation summary、Handoff、簡報、檔案存在、
procedure 或 tool capability 均不能單獨完成 promotion。
