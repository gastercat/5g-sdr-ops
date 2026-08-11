# 5G SDR Decision Register

狀態：`CANONICAL DECISION SURFACE / HUMAN-REVIEWED INPUT`

更新日期：2026-08-11

## 目的

本文件只保存已接受的 project decision、其 lifecycle 與仍未裁定的 decision debt。
它不複製 Conversation SoE、Runtime logs 或完整歷史，也不因 decision 已記錄而授予新的
Repository、Runtime 或 Lab authority。

## Status Vocabulary

| Status | 意義 |
| --- | --- |
| `ACCEPTED` | 具明確 Owner／Human authority，可作 project decision |
| `MATERIALIZED` | Decision 已形成可追溯的 Repo artifact；不表示所有內容已驗證 |
| `SATISFIED_HISTORICAL_GATE` | 歷史 prerequisite 已完成；不自動授權下一階段 |
| `CURRENT_SCOPE_BOUNDARY` | 限定目前 active／inactive lifecycle |
| `UNRESOLVED` | 缺少足夠 Owner decision；不得由 Agent 補成規則 |

## Decision Register

### DR-001｜先建立 Lab01 stable baseline，再考慮 Lab02

- Status：`ACCEPTED / SATISFIED_HISTORICAL_GATE`
- Decision：Lab01 stable baseline 是 Lab02 的歷史 prerequisite。
- Current effect：Phase 4C 已完成該歷史 recovery gate；Lab02 **未**因此自動取得新的
  execution authorization。
- Evidence：[`PROGRESS.md`](../PROGRESS.md)、
  [`2026-07-14 claim-to-evidence audit`](reports/2026-07-14-lab01-claim-evidence-audit.md)、
  Human-reviewed Part 6 SoE consolidation。

### DR-002｜由歷史 Wi-Fi bearer 遷移至 switched Ethernet sample plane

- Status：`ACCEPTED / MATERIALIZED IN HISTORICAL BASELINE`
- Decision：recovered Lab01 使用 switched Ethernet management 與 temporary dedicated
  sample plane；不是 exact historical rollback。
- Preserved provenance：USB Wi-Fi adapter／Linux1 hotspot 是 historical owner-reported
  bearer 與當時 fallback，不是 current canonical bearer。
- Evidence：[`Architecture Overview`](architecture-overview.md)、
  [`PROGRESS.md`](../PROGRESS.md)。

### DR-003｜區分 Source Authority、Authentication 與 Authorization

- Status：`ACCEPTED / MATERIALIZED`
- Decision：
  - `Authentication` 裁定身分；
  - `Authorization` 裁定可執行動作；
  - `Source Authority` 裁定該 claim 應依哪份 evidence 或 decision。
- Boundary：procedure、credential 或 tool capability 均不會自行產生 Runtime authorization。
- Evidence：[`Agent + Git Runbook`](runbooks/agent-git/README.md)、
  [`2026-08-04 presentation outline`](reports/2026-08-04-agent-git-security/01_5G_SDR_presentation_outline.md)。

### DR-004｜Private Handoff 不納入 project Agent Harness

- Status：`ACCEPTED / OWNER DECISION`
- Decision：project-facing state 由 `PROGRESS.md`、Git、project docs 與經 Review 的 team-facing
  update 承擔；Private Handoff 不作 project Agent Harness input 或 canonical database。
- Provenance：Human-reviewed Part 6 SoE consolidation；本文件不保存私人對話內容或識別資訊。
- Boundary：此 decision 不定義 external collaboration channel，也不授權對外傳送訊息。

### DR-005｜Agent + Git Runbook 成為現行 operational source

- Status：`ACCEPTED / MATERIALIZED`
- Decision：[`docs/runbooks/agent-git/README.md`](runbooks/agent-git/README.md) 是目前
  Agent + Git operational source；Future Teaching 必須重用並指向它，不得 fork 第二份權威。
- Repo provenance：PR #17 建立 scaffold；PR #18、#19 增補主要章節；PR #20 建立
  non-authoritative teaching-reuse skeleton。
- Boundary：materialized Runbook 仍是 `DRAFT / PARTIAL AUTHORING`；Windows 與 Tool Adapter
  claims 依其 verification status 保持未驗證。

### DR-006｜Workflow-first，Tool-Adapter-second

- Status：`ACCEPTED / TEACHING STRATEGY`
- Decision：先教 scope、evidence、branch、Claim Boundary、STOP 與 Human Review 的共同
  workflow，再評估 Codex、Gemini CLI、Ollama 或 Local Model adapter。
- Boundary：Adapter 出現在簡報或文件不代表已選定、已安裝或已驗證；目前替代 adapter
  仍為 `CANDIDATE / UNVERIFIED`。
- Evidence：[`Agent + Git Runbook`](runbooks/agent-git/README.md)、
  [`Future Teaching Skeleton`](teaching/agent-git/README.md)。

### DR-007｜Lab02 維持非 active mainline

- Status：`CURRENT_SCOPE_BOUNDARY / NOT_AUTHORIZED`
- Decision：Lab02 historical compatibility knowledge 可保存，但不屬目前 active execution
  mainline；任何 Lab02 Runtime 工作需新的 scope、evidence plan 與 Human authorization。
- Evidence：[`PROGRESS.md`](../PROGRESS.md)、[`Known Limitations`](known-limitations.md)。

### DR-008｜Handoff 採 Navigation + Delta

- Status：`ACCEPTED`
- Decision：Handoff 只保留 current delta、stop point、next authorized gate、blocking
  unresolved item 與 canonical pointers。
- Supersedes：把 Handoff 當成 architecture、decision、history 與 current-state database 的做法。
- Implementation：[`PROGRESS.md`](../PROGRESS.md) 已收斂為 delta-only current-state surface。

### DR-009｜Mainline non-blocking／collaboration authority boundary

- Status：`UNRESOLVED`
- Question：哪些工作可由 Mainline 在不等待協作者的情況下前進，哪些 checkpoint 必須等待
  collaborator、Instructor 或其他 external authority？
- Current evidence：Owner decision 保留持續協調；Assistant 提出的 operating model 不具
  normative authority。
- Required decision：Owner 必須另行定義角色、可獨立決策範圍、共同 gate 與 escalation path。
- Guard：本 Repository、Agent 或 Handoff 不得自行把此項目改成已接受 policy。

## Historical but Still Relevant

- Repo 最早可達 materialization commit：
  `a8412774347e6f2e2e2f3489ec1ba38d731a36f0`（2026-06-24）。
- Phase 4C 是已關閉的 historical execution baseline，不是目前 Runtime live state。
- Lab02 parser／PCAP troubleshooting 具有 compatibility provenance，但需要 current version
  與 Runtime evidence 才能升格。
- PR #16 保存 2026-08-04 presentation archive；presentation artifact 不取代 current state
  或 Runtime evidence。

## Decision Change Rule

修改 `ACCEPTED` decision 必須指出新的 authority holder、superseded decision、適用日期、
claim-level evidence 與 Human Review。新增 evidence 不會自動改變 authorization；
`UNRESOLVED` 也不會因 Handoff 或 Assistant proposal 重複出現而自動變成 policy。
