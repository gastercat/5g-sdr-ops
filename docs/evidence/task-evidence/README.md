# Task Evidence Harness（TEH）v0.1

狀態：`PROTOCOL v0.1 / EVIDENCE-ONLY`

## 目的

Task Evidence Harness（TEH）保存 Agent／Codex task 中具決策價值、但可能隨 task context
消失的 execution provenance。單筆紀錄稱為 Task Evidence Record（TER）。TEH 用來維持
Task → Evidence → Claim 的可追溯性，並避免 [`PROGRESS.md`](../../../PROGRESS.md) 兼任
Evidence Database。

TEH **不是** Current State、Authority Register、Runtime controller 或 authorization mechanism。
收錄 evidence 不會自行核准 claim、變更 canonical knowledge 或授權任何後續操作。

## Knowledge Surface 分工

| Surface | 責任 | 不負責 |
| --- | --- | --- |
| `PROGRESS.md` | Current state、delta、stop point、next gate | 長期 evidence database |
| Conversation SoE | Conversation、decision、historical rationale provenance | 自動形成 Repo current truth |
| TEH | Agent-task execution provenance 與 evidence directness | Current State、authority adjudication |
| Canonical docs | Project 目前接受的 architecture、decision、limitation、procedure 或 state | 保存完整 task transcript |

Canonical 入口包括 [`Architecture Overview`](../../architecture-overview.md)、
[`Decision Register`](../../decision-register.md) 與
[`Known Limitations`](../../known-limitations.md)。Evidence 若要改變其中任何 claim，仍需適用
scope、authority adjudication 與 Human Review。

## Protocol Invariants

- **TEH-01：**Evidence preservation != authority adjudication。
- **TEH-02：**Task completed != claim validated。
- **TEH-03：**Codex summary != independent corroboration of the same underlying raw evidence。
- **TEH-04：**Missing from Repo != never historically observed。
- **TEH-05：**Historical evidence != current Runtime truth。
- **TEH-06：**TER 不得保存 Secret、credential 或受保護敏感內容。
- **TEH-07：**保留 material literal observations，但不複製完整 task transcript 或大型 raw logs。

## TER Creation Gate

下列情況應建立 TER：

- Task 產生會影響 canonical project claim 的 Runtime evidence。
- 重要 Git／Repo provenance 沒有其他 durable surface。
- Task 執行需要日後追溯的 controlled mutation。
- Task 驗證或否證 Current State。
- Task 產生 backup、recovery 或 deployment evidence。
- Material evidence 否則只存在於 Agent task context。

下列情況通常不需要 TER：brainstorming、explanation-only、planning-only 且無 execution
evidence，或可由 Git 完整重建的 trivial docs change。

## Record Vocabulary

| Dimension | Allowed values | Boundary |
| --- | --- | --- |
| Evidence type | `COMMAND_OUTPUT`、`LOG`、`SCREENSHOT`、`GIT`、`FILE_ARTIFACT`、`HUMAN_OBSERVATION`、`CODEX_REPORT` | Type 不代表 authority |
| Directness | `PRIMARY`、`REPORTED` | Summary 不可把 `REPORTED` 升成 `PRIMARY` |
| Record claim status | `OBSERVED`、`REPORTED_ONLY`、`NOT_FOUND_IN_THREAD` | 只描述 record 內 evidence |

TER 不得使用 `AUTHORITATIVE`、`OWNER_ACCEPTED`、`CANONICAL` 或 `CURRENT_TRUTH` 作為
record claim status。Authority 與 canonicalization 必須在 TEH 外依 project governance 裁定。

## Minimal Workflow

1. 記錄 task identity、authorization boundary 與當時 Repo context；未知值明列 `UNKNOWN`。
2. 只保存足以支撐 claim 的 literal observation、artifact pointer 與 limitation。
3. 標示 evidence type、directness、confidence 與 source location。
4. 對同一 raw evidence 的重疊報告去重，不把摘要重複視為 corroboration。
5. 排除 credential、subscriber data、private key、完整敏感 config 與大型 logs。
6. 由 TEH 外的 Human Review 決定 claim 是否進入 canonical surface。

## Files

- [`TASK_EVIDENCE_RECORD_TEMPLATE.yaml`](TASK_EVIDENCE_RECORD_TEMPLATE.yaml)：TER v0.1
  通用最小 template。
- [`lab01-recovery-workstream.yaml`](lab01-recovery-workstream.yaml)：兩份重疊 historical
  recovery records 去重後的初始 TER；不代表 current Runtime state。
- [`2026-08-24-lab01-current-truth-runtime-recovery.yaml`](2026-08-24-lab01-current-truth-runtime-recovery.yaml)：
  2026-08-24 fresh Host／Network observation、bounded attach recovery、post-attach error boundary、
  final process stop 與 temporary sample-plane cleanup evidence；不授權下一次 Runtime。
- [`2026-08-30-lab01-ev2-part8-runtime-usb-incident.yaml`](2026-08-30-lab01-ev2-part8-runtime-usb-incident.yaml)：
  2026-08-30 EV-1 clean-source build、EV-2 R0–R6 bounded Runtime evidence、R5 ICMP failure、
  USB physical-link incident、same-port replug recovery 與 120-second controlled non-reproduction；
  不將 USB incident 視為 R5 的已證明 root cause，亦不授權 R5A。
