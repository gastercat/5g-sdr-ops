# 5G SDR Operations

狀態：`ACTIVE DOCUMENTATION REPOSITORY`
目前專案狀態權威：[`PROGRESS.md`](PROGRESS.md)

本 Repository 保存 5G SDR 專案的治理文件、已審閱的技術知識、非敏感稽核證據、
Runbook 與研究停放入口。它不是 Lab Runtime、`srsRAN_4G` 原始碼倉庫，也不直接
操作 `/etc/srsran/`、服務、網路或 SDR 設備。

## 目前快照

- **Lab01：**Phase 4C recovered baseline 已在當時核准範圍內完成，服務已受控停止。
  這是歷史執行 baseline，不是目前 Runtime 正在運作的證據，也不提供後續啟動授權。
- **Agent + Git：**現行操作來源是
  [`docs/runbooks/agent-git/README.md`](docs/runbooks/agent-git/README.md)。Gate 4A
  定向學習者檢閱已完成，但回饋尚待修訂；Gate 4B 未獲授權。
- **Lab02：**不是目前 active mainline，沒有因 Lab01 prerequisite 完成而自動取得執行授權。
- **Future Teaching：**僅為 `SKELETON / NOT ACTIVE COURSE`。
- **6G LEO / NTN：**僅為 `RESEARCH_PARKING / CONCEPT_PROTOTYPE`，沒有 Runtime integration。
- **ACP：**維持 `PARKING / OBSERVATION`，不是正式 Protocol 或 Repository gate。

## Canonical Knowledge Map

| 問題 | 目前權威入口 | 邊界 |
| --- | --- | --- |
| 現在在做什麼、停在哪裡 | [`PROGRESS.md`](PROGRESS.md) | 只保存 current delta、stop point、next gate 與 blockers |
| Lab01 recovered architecture | [`docs/architecture-overview.md`](docs/architecture-overview.md) | 區分 Management／Sample／UE User Plane 與歷史 bearer 演進 |
| 已接受與未決決策 | [`docs/decision-register.md`](docs/decision-register.md) | `UNRESOLVED` 不得由 Agent 自行裁定 |
| 已知限制與未驗證項目 | [`docs/known-limitations.md`](docs/known-limitations.md) | 歷史 evidence 不等於 current Runtime validation |
| Agent 與 Repository 規則 | [`AGENTS.md`](AGENTS.md) | 規則不等於某次 Runtime authorization |
| 設定與 Runtime 邊界 | [`docs/engineering/CONFIGURATION_GOVERNANCE.md`](docs/engineering/CONFIGURATION_GOVERNANCE.md) | `/etc/srsran/` 不是 Git working tree |
| Agent + Git 操作 | [`docs/runbooks/agent-git/README.md`](docs/runbooks/agent-git/README.md) | Future Teaching 不得建立第二份 Runbook |
| 未來教學重用 | [`docs/teaching/agent-git/README.md`](docs/teaching/agent-git/README.md) | `SKELETON / NOT ACTIVE COURSE` |
| 6G LEO / NTN | [`docs/research/6g-ntn-handover/README.md`](docs/research/6g-ntn-handover/README.md) | `RESEARCH_PARKING / NOT_INTEGRATED` |
| Lifecycle 待辦導覽 | [`TODO.md`](TODO.md) | 未勾選項目不是完成或授權證據 |

## Source Authority

每個 claim 都必須依問題選擇來源，不能只依檔名或出現次數判斷權威：

1. 當次明確 Human decision 可裁定授權與 project decision domain。
2. 直接、可追溯的 execution evidence 可裁定當時觀察到的 Repo 或 Runtime 狀態，
   但不能自行提供後續授權。
3. `PROGRESS.md` 保存目前 project checkpoint；它不取代更細緻的 evidence boundary。
4. Procedure、Runbook 與 policy 說明如何安全工作，不代表該操作已獲授權或已執行。
5. 歷史文件、簡報、Conversation SoE 與 Handoff 提供 provenance；未與目前證據核對前，
   不得單獨升格成 current truth。

`Authentication` 回答身分、`Authorization` 回答可執行範圍、`Source Authority`
回答本次 claim 應以哪份證據或決策為準；三者不可互相替代。

## Repository Provenance

- 最早可達 Git commit：`a8412774347e6f2e2e2f3489ec1ba38d731a36f0`
  （2026-06-24，`docs: bootstrap 5G SDR ops repo`）。這是 Repo 實際 materialization
  的 Git evidence，不回推早期 proposal 日期。
- `CONTRIBUTING.md` 首次出現在
  `b19d0082c2eda7263832eb9cb12f1c672a89715b`，其後由 PR #1 進入 main history。
- PR #15 的 main commit `3387ce003f2aef839b444c6fa169f25ea4922de5` 保存 Lab01
  baseline recovery presentation delivery。
- PR #16 的 main commit `4eda478e77e440f6a19be48f0354e9a00b00f028` 保存
  2026-08-04 presentation archive。
- PR #17～#19 的 main commits `4262e95`、`17464f0`、`fa9ea8b` materialize 並增補
  Agent + Git Runbook。
- PR #20 的 main commit `885c6104675d5b7e59d8ae69c8aa02cc5b53eff7` 保存
  Future Teaching 與 6G NTN Research Parking 骨架。

## Historical and Supporting Material

下列內容保留 provenance，但不與 canonical current-state surface 競爭：

- `labs/lab01-small-cell/`：早期 Lab01 目標、Runbook、checklist 與 result notes。
- `labs/lab02-embb/`：歷史 Lab02／eMBMS 待確認項目；不是 current execution authority。
- `docs/reports/`、`docs/presentations/`：報告、簡報與 claim-to-evidence supporting material。
- `docs/audits/`：特定時間點的唯讀 observation；檔案存在不證明 active 或 authoritative。
- [`Task Evidence Harness`](docs/evidence/task-evidence/README.md)：保存 Agent-task execution
  provenance；不授權或自行建立 canonical truth。
- [`docs/device-status.md`](docs/device-status.md)：bootstrap 階段的設備狀態與待確認項目；不是目前實機狀態證據。
- `docs/project-status.md`、`docs/engineering/TODO.md`、`docs/project-direction.md`：
  已降級的 bootstrap／recovery／candidate-direction 歷史入口。

## 安全與 Lifecycle 邊界

- 不得把 Secret、Ki、OPC、token、SSH private key 或敏感 subscriber data 寫入 Git。
- Git 提供 change tracking 與 Review surface，不是 OS sandbox，也不是 Runtime rollback。
- Dedicated SSH key 提供 credential separation 與 revocation boundary，不等於 Linux
  permission isolation、Runtime authorization 或 OS sandbox。
- Tool capability 不等於 authorization。
- Agent task completed 不等於 Human accepted、Ready for PR 或 Merged。
- 任何 Runtime start、persistent network change、configuration deployment 或 extended
  validation 都需要獨立、明確的 Human authorization。

## 協作與 Handoff

Project-facing state 由 `PROGRESS.md`、Git 與上述 canonical 文件承擔。私人 Handoff
不屬於 project Agent Harness。未來 Handoff 只應保存 navigation + delta：current delta、
stop point、next authorized gate、blocking unresolved item 與 canonical pointers；不得再複製
完整 architecture history、decision rationale 或 transitive Handoff chain。

本 Repository 不預設由單一成員永久承擔全部實驗維護責任；設備集中保管也不等於成果、
測試與維護責任全部集中於同一成員。這只保存 responsibility boundary，不裁定仍為
[`UNRESOLVED`](docs/decision-register.md)
的 collaboration authority operating model。
