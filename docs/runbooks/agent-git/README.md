# 5G SDR｜Agent + Git Runbook

## Lifecycle

- Version: `v0.1`
- Status: `DRAFT / SCAFFOLD`
- Audience: Windows Git beginners
- Document roles: `Owner`、`Maintainer`、`Instructor`、`Reviewer`
- Current scope: chapter scaffold and source map only

## Claim Boundary

This document is an authoring scaffold. It identifies intended learning
outcomes, candidate sources, verification gaps, and future writing work. It
does not provide a verified Windows command sequence, grant Repository or
Runtime authority, select a tool for every learner, or replace the current
Repository rules and project-state evidence.

Merging this scaffold records the approved information architecture only.
It does not promote any `UNVERIFIED` workflow to an operational procedure.

## Safety Boundary

- No Secret：不得讀取、記錄或提交密碼、token、Private Key 或其他敏感資料。
- No Runtime：本 Runbook 不授權操作 Lab Runtime、服務、網路或 active configuration。
- No direct main modification：文件變更必須使用範圍明確的 branch 並經 Review。
- Read-only first：第一次 Agent 任務從範圍明確、可驗證的唯讀工作開始。
- Human review required：Agent 產出不得自行升格為已核准成果。
- Unknown state means STOP：來源、權限、working tree 或預期結果不明時停止，不猜測、不擴張範圍。

## Verification Status

| Item | Status | Boundary |
| --- | --- | --- |
| Windows Git happy path | `UNVERIFIED` | 尚未形成並完成本專案的 Windows 實機驗收流程。 |
| Windows Codex workflow | `UNVERIFIED` | 不得描述為已完成安裝、連線或端到端驗證。 |
| Gemini CLI | `CANDIDATE / UNVERIFIED` | 尚未決定為學員工具，也沒有本專案實機證據。 |
| Local LLM + Ollama + Codex | `CANDIDATE / UNVERIFIED` | 架構說明不等於 Windows 整合、效能或安全驗證。 |
| ACP | `PARKING / OBSERVATION` | 不是正式 Protocol、Repository Policy 或已採用的驗收制度。 |

## Source Authority

- Repository rules and safety：以 [`AGENTS.md`](../../../AGENTS.md)、
  [`CODEX_REMOTE_AGENT_POLICY.md`](../../engineering/CODEX_REMOTE_AGENT_POLICY.md)
  與 [`CONTRIBUTING.md`](../../../CONTRIBUTING.md) 為主要來源，並依任務範圍選用。
- Current project state：以 [`PROGRESS.md`](../../../PROGRESS.md) 為目前 checkpoint
  來源，仍須核對其更新日期與本次直接證據。
- Teaching support：使用已歸檔的 Agent + Git + Security presentation reports
  作為教學語言、概念與 Claim Boundary 的 supporting source。
- Historical documents：舊 README、TODO、Lab 文件、簡報與案例不得覆蓋目前
  Repository 狀態、直接證據或當次人工授權。
- A procedure source describes how work may be controlled; it does not grant
  execution authority.

## 0. 如何使用這份 Runbook

- Purpose：說明閱讀順序、角色、狀態標記與停止原則。
- Learning outcome：讀者能選擇適合自己的閱讀路徑，並知道何時必須交回 `Instructor` 或 `Reviewer`。
- Source candidates：`AGENTS.md`、presentation outline、speaker notes。
- Verification status：`SCAFFOLD`；尚未建立角色別閱讀路線或使用情境。
- TODO：定義首次帶領、獨立重跑、Review 與例外查詢的入口。

## 1. Windows 操作前準備

- Purpose：界定進入 Git 與 Agent 工作前需要確認的 Windows 環境條件。
- Learning outcome：讀者能辨識必要前置條件、未驗證項目與停止點。
- Source candidates：archived presentation outline、speaker notes、revision report。
- Verification status：`UNVERIFIED`；目前只有教學草案，沒有本專案 Windows 實機證據。
- TODO：另行授權後建立最小驗收矩陣；本輪不撰寫安裝或 authentication 步驟。

## 2. Git 與 GitHub 最小概念

- Purpose：建立 Repository、working tree、branch、commit、remote 與 Pull Request 的最低共同語言。
- Learning outcome：讀者能區分本機 Git 狀態、GitHub 協作狀態與 Human Review Gate。
- Source candidates：`CONTRIBUTING.md`、presentation outline、professor Q&A。
- Verification status：`PARTIAL`；概念有來源，但尚未形成經 Windows 驗證的新手說明。
- TODO：補齊名詞、狀態關係與非破壞性的理解範例，不加入未驗證命令流程。

## 3. 取得並認識 5g-sdr-ops

- Purpose：說明首次取得或重新進入 Repository 時應辨識的入口與文件角色。
- Learning outcome：讀者能區分 `README.md`、`AGENTS.md`、`PROGRESS.md`、`SKILL.md` 與 `CONTRIBUTING.md` 的用途與權威限制。
- Source candidates：`README.md`、`AGENTS.md`、`PROGRESS.md`、`CONTRIBUTING.md`、presentation outline。
- Verification status：`PARTIAL`；文件角色有來源，Windows clone happy path 尚未驗證。
- TODO：建立不含敏感資料的 Repository orientation 與 freshness 檢查方式。

## 4. 建立安全的 Agent 任務

- Purpose：把目標、允許／禁止範圍、Evidence、Claim Boundary 與 Stop Point 寫成可 Review 的任務包。
- Learning outcome：讀者能辨識一個安全任務是否具備足夠範圍與授權資訊。
- Source candidates：`AGENTS.md`、Agent Policy、`codex-task-template.md`、presentation outline。
- Verification status：`SOURCE_MAPPED`；尚未改寫為 Windows Git beginners 使用的精簡模板。
- TODO：保留最小必要欄位，移除不適合第一次任務的進階 orchestration 語言。

## 5. 第一次 Read-only Agent 任務

- Purpose：讓讀者在不修改 Repository 的前提下練習 preflight、來源判讀、證據回報與停止。
- Learning outcome：讀者能完成一次範圍明確的唯讀盤點，並確認沒有未預期變更。
- Source candidates：`AGENTS.md`、`codex-task-template.md`、speaker notes、professor Q&A。
- Verification status：`UNVERIFIED`；尚未定義或實測正式練習包。
- TODO：決定單一 Markdown 盤點題目、預期輸出、禁止範圍與驗收證據。

## 6. Git 文件修改最小閉環

- Purpose：描述文件工作從 preflight、隔離變更、Review Diff 到提交人工審查的最小生命週期。
- Learning outcome：讀者能說明每個階段的目的、證據與停止條件。
- Source candidates：`CONTRIBUTING.md`、`AGENTS.md`、presentation outline、professor Q&A。
- Verification status：`UNVERIFIED`；尚無經 Windows 實機驗證的端到端 happy path。
- TODO：另行授權後建立最小文件任務流程；不得把破壞性 Git 例外寫成日常步驟。

## 7. Human Review Gate

- Purpose：定義送交 Review 前的最小證據與 Reviewer 的決策邊界。
- Learning outcome：讀者能區分 Agent 執行完成、可送 Review、Human approval 與 Merge。
- Source candidates：`AGENTS.md`、Agent Policy、`agent-review-checklist.md`、rehearsal checklist。
- Verification status：`SOURCE_MAPPED`；現有 checklist 偏 Runtime，需要改寫成文件任務版本。
- TODO：建立只涵蓋 scope、diff、格式、來源、Claim Boundary 與未驗證事項的 Review Gate。

## 8. 常見停止與恢復情境

- Purpose：整理 working tree、branch、權限、來源與遠端狀態不明時的安全停止方式。
- Learning outcome：讀者能先保存證據並停止，再由 `Maintainer` 或 `Reviewer` 決定後續處置。
- Source candidates：`AGENTS.md`、Agent Policy、professor Q&A、revision report。
- Verification status：`PARTIAL`；已有受控例外案例，但缺少新手安全 decision tree。
- TODO：優先涵蓋非破壞性停止情境；進階 Git recovery 僅能放在清楚隔離的例外說明。

## 9. Instructor 帶領的第一次完整操作

- Purpose：提供 `Instructor` 帶領學員完成首次安全工作循環的教學骨架。
- Learning outcome：學員能在即時確認下完成 preflight、唯讀任務、文件變更與 Human Review Gate 的概念串接。
- Source candidates：speaker notes、rehearsal checklist、Authoritative IA。
- Verification status：`NOT_AUTHORED`；目前沒有 Instructor session script。
- TODO：定義教學節點、示範範圍、學員回述與停止條件，不在本輪撰寫逐步操作。
  The first supervised mutation exercise must be docs-only, branch-based,
  and limited to a designated non-sensitive Markdown file.

## 10. 學員獨立重跑與驗收

- Purpose：定義學員在沒有逐步提示時重跑流程所需的最小證據。
- Learning outcome：學員能提交可由 `Reviewer` 判讀的結果，並正確保留 `UNKNOWN`／`UNVERIFIED`。
- Source candidates：`agent-review-checklist.md`、rehearsal checklist、Authoritative IA。
- Verification status：`NOT_AUTHORED`；目前沒有 Runbook 專用 learner acceptance checklist。
- TODO：建立學員驗收條件、失敗回報格式與 Instructor 回收決策。

## Appendix｜名詞、速查、模板、Evidence 與工具 Adapter

- Purpose：集中放置不應中斷主要學習流程的參考資料。
- Learning outcome：讀者能查找名詞、非破壞性命令提示、任務模板與 Evidence 欄位，並辨識 Adapter 的驗證狀態。
- Source candidates：`CONTRIBUTING.md`、`codex-task-template.md`、`agent-review-checklist.md`、Lab01 recovery skill、archived presentation reports。
- Verification status：`PARTIAL / CANDIDATE`；Gemini CLI、Ollama 與 Local Model Adapter 均未驗證。
- TODO：分別規劃 glossary、cheatsheet、prompt、Evidence 與 Adapter；本輪不建立子目錄或正文。

## Source Map

| Runbook section | Primary source | Supporting source | Freshness risk | Rewrite required | Verification gap |
| --- | --- | --- | --- | --- | --- |
| 0 | `AGENTS.md` | Outline、speaker notes | `MEDIUM`：專案目標段落可能落後於 `PROGRESS.md` | Yes：改成角色別閱讀入口 | 使用方式尚未驗收 |
| 1 | `NONE — verified Windows source absent` | Outline、speaker notes、revision report | `HIGH` | Yes：未來須依實測證據撰寫 | Windows environment 未驗證 |
| 2 | `CONTRIBUTING.md` | Outline、professor Q&A | `MEDIUM`：文件較早且缺少新手定義 | Yes | Windows Git／GitHub 理解流程未驗證 |
| 3 | `README.md`、`AGENTS.md`、`PROGRESS.md` | `CONTRIBUTING.md`、outline | `HIGH`：歷史狀態段落可能互相衝突 | Yes：依文件角色拆分 | Clone happy path 未驗證 |
| 4 | `AGENTS.md`、Agent Policy | Task template、outline | `MEDIUM`：來源偏治理語言 | Yes：改為新手任務包 | 新手模板尚未驗收 |
| 5 | `AGENTS.md`、task template | Speaker notes、professor Q&A | `MEDIUM` | Yes：建立單一練習 | First read-only exercise 缺失 |
| 6 | `CONTRIBUTING.md`、`AGENTS.md` | Outline、professor Q&A | `MEDIUM` | Yes：補目的、證據與 Stop | Windows Git happy path 未驗證 |
| 7 | `AGENTS.md`、Agent Policy | Review checklist、rehearsal checklist | `MEDIUM`：現有 checklist 偏 Runtime | Yes：改為 docs-only Review | Reviewer 驗收流程未實測 |
| 8 | `AGENTS.md`、Agent Policy | Professor Q&A、revision report | `MEDIUM/HIGH`：supporting cases 為歷史例外 | Yes：建立 novice-safe decision tree | 常見停止情境未驗收 |
| 9 | `NONE — session script absent` | Speaker notes、rehearsal checklist | `MEDIUM`：來源為簡報交付材料 | Yes | Instructor session script 缺失 |
| 10 | `NONE — learner checklist absent` | Review checklist、rehearsal checklist | `MEDIUM` | Yes | Learner acceptance checklist 缺失 |
| Appendix | Task template、Review checklist | Professor Q&A、recovery skill、revision report | `MEDIUM/HIGH`：多份來源具情境限制 | Yes：分離日常與例外 | Tool Adapter 均未完成驗證 |

## Known Gaps

- Windows environment validation
- GitHub authentication choice
- Clone happy path
- First read-only exercise
- Instructor session script
- Learner acceptance checklist
- Member C tool decision

## Authoring Gate

下一個 Authoring Work Unit 必須重新確認 working tree、授權範圍、目標章節與
所需驗證。這份 scaffold 不會自行授權補寫 Windows 命令、選擇 Agent 工具、
建立 Adapter，或操作 Repository 以外的環境。
