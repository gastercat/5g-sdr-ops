# 5G SDR｜Agent + Git Runbook

## Lifecycle

- Version: `v0.1`
- Status: `INTERNAL ENGINEERING REFERENCE / STUDENT CURRICULUM SUPERSEDED`
- Audience: Maintainers、internal engineering users、Reviewers
- Document roles: `Owner`、`Maintainer`、`Instructor`、`Reviewer`
- Historical authored scope: Sections 0、2、3、4、5、7 and minimum Prompt / Evidence templates

## 2026-08-18 Supersession Boundary

- PD-03：學生課程不教 Agent；本文件不再是 student curriculum authority。
- PD-04：student Git scope 僅保留安全完成實驗所需內容；本文件中的通用 Git collaboration
  draft 不得直接轉成 student syllabus。
- 既有 learner sections、Gate 4A feedback 與未完成 authoring plan 保留 historical provenance，
  不得被解讀為 current learner roadmap 或待執行 exercise。
- Agent safety、scope、evidence、authorization 與 Human Review guidance 可繼續作為
  Maintainer／internal engineering reference。
- 本 reclassification 不驗證 Windows、Codex、Gemini CLI、Ollama、Local Model 或任何
  historical learner workflow。

Canonical decision source：
[`2026-08-18 Professor Meeting Decision Record`](../../decisions/2026-08-18-professor-meeting.md)。

## Claim Boundary

This document preserves a partially authored operational Runbook draft and may
serve as an internal engineering reference. Historical learning outcomes,
source mappings, verification gaps, and future writing notes remain visible for
provenance; they do not establish current student curriculum. This document does
not provide a verified Windows command sequence, grant Repository or Runtime
authority, select a learner tool, or replace current Repository rules and
project-state evidence.

Merging a documentation revision records only the reviewed content and its
lifecycle status. It does not promote any `UNVERIFIED` workflow to a validated
operational procedure.

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
| Gate 4A targeted learner review | `HISTORICAL_COMPLETED_WITH_REVISION_NEEDS` | 只代表當時定向閱讀與回饋；不是 current course authority。 |
| Gate 4B learner authoring | `HISTORICAL_NOT_AUTHORIZED / SUPERSEDED` | 原 plan 未獲授權，PD-03 後也不再是 current student teaching gate。 |

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

- 目的（Purpose）：說明閱讀順序、角色、狀態標記與停止原則。
- 學習成果（Learning outcome）：讀者能辨識目前可用內容、選擇閱讀路徑，並知道何時必須交回 `Instructor` 或 `Reviewer`。
- 候選來源（Source candidates）：`AGENTS.md`、presentation outline、speaker notes。
- 驗證狀態（Verification status）：`DRAFT_AUTHORED / TARGETED_LEARNER_REVIEWED / REVISION_REQUIRED`。
- 待辦（TODO）：依 Gate 4A feedback 修訂閱讀路徑、術語與停止條件；此狀態不等於完整 learner validation。

### 文件目前狀態

目前 Section 0、2、3、4、5、7 與 Appendix 中選定的 Prompt／Evidence 模板已有
`DRAFT` 正文。其他章節仍是 `SCAFFOLD`、`PARTIAL` 或 `UNVERIFIED`，只代表預定的
學習路徑與待辦工作；這份文件目前不得作為端到端 Windows 操作程序。

### 角色與責任

| 角色 | 責任 |
| --- | --- |
| `Owner` | 設定專案層級的方向與權限。 |
| `Maintainer` | 保護 Repository 狀態，並核准受控變更。 |
| `Instructor` | 帶領第一次受督導的學習操作。 |
| `Reviewer` | 審查範圍、差異（diff）、證據（Evidence）與宣稱邊界（Claim Boundary）。 |
| Learner | 學習對象的稱呼，不是授權角色。 |

### 狀態標籤

| 標籤 | 在本 Runbook 中的意思 |
| --- | --- |
| `DRAFT` | 已有可供審查的草稿，但尚未完成驗收。 |
| `SOURCE_MAPPED` | 已辨識來源，不代表內容已改寫或驗證。 |
| `UNVERIFIED` | 缺少指定環境或使用者的直接驗證。 |
| `CANDIDATE` | 可供評估的候選，不是已選定方案。 |
| `PARKING / OBSERVATION` | 保留觀察，不是正式制度或操作要求。 |
| `STOP` | 不得猜測或自行擴張；保存現況並交由適當角色判斷。 |

### 閱讀路徑

- 引導式零基礎路徑（guided zero-baseline path）：由 `Instructor` 依章節順序帶領，
  尚未完成的章節只能用來預告學習目標，不得當成已驗證步驟。
- Git 複習／Agent 使用者路徑（Git-refresher / Agent-user path）：可優先閱讀
  Section 0、4、7 與 Appendix 模板，再回到需要複習的基礎章節；未完成章節仍不是
  可直接執行的操作程序。

### 全域停止條件

遇到下列任一情況時標記 `STOP`，保留可觀察證據並交回人工判斷：

- 儲存庫（Repository）的分支（branch）、提交（commit）或工作樹（working tree）
  狀態未知。
- 任務沒有說明誰有權核准目前操作。
- 出現任務無法解釋的差異（diff）或檔案。
- 可能暴露 Secret、Private Key、token 或其他敏感資料。
- 任務要求存取 Runtime、服務、網路或 active configuration。
- 指示超出任務包的允許範圍，或與實際狀態衝突。

## 1. Windows 操作前準備

- Purpose：界定進入 Git 與 Agent 工作前需要確認的 Windows 環境條件。
- Learning outcome：讀者能辨識必要前置條件、未驗證項目與停止點。
- Source candidates：archived presentation outline、speaker notes、revision report。
- Verification status：`UNVERIFIED`；目前只有教學草案，沒有本專案 Windows 實機證據。
- TODO：另行授權後建立最小驗收矩陣；本輪不撰寫安裝或 authentication 步驟。

## 2. Git 與 GitHub 最小概念

- 目的（Purpose）：建立 Git 與 GitHub 的最低共同語言，讓初學者能判讀變更目前位於哪個階段。
- 學習成果（Learning outcome）：讀者能區分本機版本控制狀態、GitHub 協作狀態與人工審查關卡（Human Review Gate）。
- 候選來源（Source candidates）：`CONTRIBUTING.md`、presentation outline、speaker notes、professor Q&A。
- 驗證狀態（Verification status）：`DRAFT_AUTHORED / SOURCE_GROUNDED / TARGETED_LEARNER_REVIEWED / REVISION_REQUIRED`。
- 待辦（TODO）：等 Windows happy path 完成實機驗證後，再加入命令與成功畫面。

### Git 與 GitHub 的角色不同

Git 是在本機保存版本與比較差異的版本控制工具；GitHub 是保存遠端 Repository、
進行協作與 Review 的平台。使用 Git 不代表內容已上傳 GitHub；擁有 GitHub 帳號，
也不代表本機 Git 已完成設定或連線。

### 最小概念模型

| 概念 | 初學者應理解的角色 |
| --- | --- |
| 儲存庫（Repository） | 由 Git 管理的檔案、版本與歷史範圍。 |
| 本機儲存庫（Local Repository） | 位於目前電腦上的 Repository 與本機歷史。 |
| 遠端儲存庫（Remote Repository） | 位於協作平台上的 Repository；不會因本機修改而自動更新。 |
| 工作樹（Working Tree） | 目前實際看到與編輯的檔案狀態。 |
| 暫存區（Staging Area） | 已選定、準備納入下一個 Commit 的變更集合。 |
| 分支（Branch） | 指向一條工作歷史的名稱，用來隔離特定工作。 |
| 提交（Commit） | 保存於本機 Git 歷史中的一組已選定變更與說明。 |
| 遠端（Remote） | 本機用來識別遠端 Repository 的名稱與位置參照。 |
| 推送（Push） | 將本機 Commit 傳送到遠端 Branch。 |
| 拉取／擷取（Pull / Fetch） | Fetch 取得遠端狀態而不自動整合；Pull 取得後會嘗試整合到目前 Branch。實際使用方式待後續驗證章節說明。 |
| 拉取請求（Pull Request，PR） | 提出將某個 Branch 的差異交給他人 Review 與決定的協作項目。 |
| 審查（Review） | 人工檢查 Scope、Diff、Evidence、風險與宣稱邊界。 |
| 合併（Merge） | 經核准後把 PR 的變更納入目標 Branch。 |

下圖只表示概念上的狀態關係，不是可直接執行的命令流程：

```text
遠端儲存庫（Remote Repository）
        ↓ 取得／同步
本機儲存庫（Local Repository）
        ↓ checkout
工作樹（Working Tree）
        ↓ 選擇變更
暫存區（Staging Area）
        ↓ commit
本機歷史（Local History）
        ↓ push
遠端分支（Remote Branch）
        ↓ Pull Request / Review
main
```

### 狀態不可跳級

- 修改檔案不等於已建立 Commit。
- Commit 不等於已 Push。
- Push 不等於已建立 PR。
- PR 為 Open 不等於已通過 Review。
- PR Merge 後，本機 `main` 不會自動同步。
- Git 能保存與審查差異，但不是作業系統沙盒（OS Sandbox），無法自行阻止
  Agent 讀取 Secret、修改 Repository 外檔案或操作 Runtime。

### 無命令的最小例子

一個文件工作可以先在獨立 Branch 修改一份 Markdown，由工作者與 Reviewer 檢查
差異（Diff）後建立 Commit，再透過 PR 交由 Reviewer 審查。這只是概念順序；建立
Branch、Commit、Push 或 PR 仍須由當次任務包明確授權。

## 3. 取得並認識 5g-sdr-ops

- 目的（Purpose）：說明首次取得或重新進入 Repository 時，應辨識的用途、入口文件與來源權威（Source Authority）。
- 學習成果（Learning outcome）：讀者能區分主要文件的用途、時效與授權限制，並在狀態不明時停止。
- 候選來源（Source candidates）：`README.md`、`AGENTS.md`、`PROGRESS.md`、`CONTRIBUTING.md`、presentation outline、speaker notes、professor Q&A。
- 驗證狀態（Verification status）：`DRAFT_AUTHORED / SOURCE_GROUNDED / WINDOWS_CLONE_PATH_UNVERIFIED`。
- 待辦（TODO）：Windows Clone、首次開啟與 Authentication 待實機驗證後補入。

### Repository 用途與邊界

`5g-sdr-ops` 是保存文件、治理規則、實驗紀錄與受控工作流程的 Repository。
它不是 Lab Runtime 本身，也不直接操作實驗環境。取得或 Clone 這個 Repository，
只代表取得一份 Git 工作副本，不代表取得 Runtime、設備或遠端主機的操作權限。

### 主要入口文件

| 入口 | 用途與權威限制 |
| --- | --- |
| `README.md` | 提供 Repository 定位與入口；其中歷史狀態可能過期，不能單獨作為最新進度來源。 |
| `AGENTS.md` | 定義 Agent 行為、安全、範圍與 Evidence 邊界；其中 Current Delivery Goal 可能落後，必須與 `PROGRESS.md` 核對。 |
| `PROGRESS.md` | 提供目前工程 checkpoint 與已記錄狀態；它不代表 Runtime 此刻仍在運行。 |
| `CONTRIBUTING.md` | 提供 Branch、Commit、PR 與 Review 的協作規則；不能取代當次 Task Package。 |
| `SKILL.md` | 描述特定受控程序與 Gate；程序存在不等於目前已獲執行授權。 |
| `docs/` | 保存工程文件、簡報、報告、Runbook 與稽核材料；每份文件仍須判斷日期、Lifecycle 與 Source Authority。 |

### 判斷 Source Authority 的問題

讀取文件時，依序問：

- 這份文件的用途是什麼？
- 它是規則、程序、專案狀態、歷史證據，還是教材？
- 最後相關日期、Lifecycle 或狀態為何？
- 是否有更新且可直接追溯的證據？
- 是否與 `PROGRESS.md` 或當次 Task Package 衝突？
- 它是否真的授權目前操作，或只是在描述可能使用的程序？

### Freshness 原則

- 新 Commit 日期不代表文件中的每一段內容都是最新狀態。
- 舊文件仍可能保有目前有效的安全規則。
- 新文件也可能只是保存歷史資料或教學摘要。
- 判斷時以文件角色、內容證據與當次問題的適用性為主，不只看檔案時間戳。
- 發現來源互相衝突時，保留較嚴格的安全邊界並標記 `STOP`，不得自行選擇方便的版本。

### 初次進入 Repository 的概念性檢查順序

以下只描述每一步的目的，不提供命令：

1. 確認目前所在的 Repository，避免在錯誤工作區判斷或操作。
2. 確認 Branch 與 Working Tree 狀態已知，先保護既有變更。
3. 閱讀 `AGENTS.md`，理解安全、行為與停止邊界。
4. 閱讀 `PROGRESS.md`，辨識目前記錄的工程 checkpoint 與未決事項。
5. 閱讀 `CONTRIBUTING.md`，理解本 Repository 的協作規則。
6. 找到當次 Task Package，確認實際授權範圍與必要 Evidence。
7. 狀態、來源或權限不清楚時標記 `STOP`，交回人工判斷。

## 4. 建立安全的 Agent 任務

- 目的（Purpose）：把目標、允許／禁止範圍、證據（Evidence）、宣稱邊界（Claim Boundary）與停止點（Stop Point）寫成可審查（Review）的任務包。
- 學習成果（Learning outcome）：讀者能辨識一個安全任務是否具備足夠範圍與授權資訊。
- 候選來源（Source candidates）：`AGENTS.md`、Agent Policy、`codex-task-template.md`、presentation outline。
- 驗證狀態（Verification status）：`DRAFT_AUTHORED / SOURCE_GROUNDED / TARGETED_LEARNER_REVIEWED / REVISION_REQUIRED`。
- 待辦（TODO）：依 Gate 4A feedback 增加最小 Prompt Context／Required Output 例子；不在本輪執行 Agent 任務。

### 核心原則

Agent 能執行某項操作，不代表它已獲得該操作的授權。來源文件可以說明工作應如何
受控，但不會自行授予執行權限；有效授權必須來自當次任務包，且不得超出 Repository
規則與安全邊界。

一個可審查的任務包至少要寫清楚下列欄位：

| 欄位 | 初學者應寫清楚的內容 |
| --- | --- |
| Task（任務） | 這次工作的短名稱。 |
| Objective（目標） | 完成時應得到什麼結果。 |
| Context（背景） | 判斷任務所需、且不含敏感資料的必要資訊。 |
| Allowed Scope（允許範圍） | 可讀取或變更的精確檔案、目錄與操作；能唯讀就明寫唯讀。 |
| Forbidden Scope（禁止範圍） | 明確排除 Secret、Runtime、`main`、無關檔案與破壞性復原操作。 |
| Required Evidence（必要證據） | 可被他人觀察、重查並理解的狀態、差異與驗證結果。 |
| Claim Boundary（宣稱邊界） | 哪些結論有證據，哪些仍為 `UNKNOWN`、`UNVERIFIED` 或 `CANDIDATE`。 |
| Stop Point（停止點） | 發生哪些情況必須停止，完成後停在哪個人工關卡。 |
| Required Output（必要輸出） | Reviewer 應收到的結果格式與必要欄位。 |

允許範圍應盡可能指名精確檔案、目錄或唯讀目標。禁止範圍不是附註，而是用來
保護 Secret、Runtime、`main`、無關檔案與不可逆風險的明確邊界。必要證據必須能讓
Reviewer 看出 Agent 實際觀察了什麼、做了什麼、沒有做什麼，以及哪些事項尚未驗證。

如果實際 Repository 狀態與任務假設不一致，Agent 必須 `STOP`，不得自行修復、改寫
目標或擴張搜尋。Agent 回報完成只代表它已做到任務包允許的停止點；人工核准是另一個
獨立決定。

### 非執行範例：唯讀 Markdown 盤點

以下只是任務包寫法示例，不是對任何工具的執行指令：

```text
Task（任務）: 盤點指定 Markdown 文件
Objective（目標）: 回報文件用途、主要標題、來源線索與未驗證事項
Context（背景）: 這是第一次唯讀文件練習
Allowed Scope（允許範圍）: 只讀取 docs/<designated-file>.md
Forbidden Scope（禁止範圍）: 不修改檔案、不讀取 Secret、不存取 Runtime、不查看其他路徑
Required Evidence（必要證據）: 目標路徑、觀察到的標題、來源提示與 UNKNOWN 項目
Claim Boundary（宣稱邊界）: 只回報文件內可直接觀察的內容，不推論目前專案狀態
Stop Point（停止點）: 目標不存在、內容可能敏感或實際狀態與任務假設不符時 STOP
Required Output（必要輸出）: 提交唯讀盤點報告，停在人工審查（Human Review）
```

## 5. 第一次 Read-only Agent 任務

- 目的（Purpose）：以工具中立的唯讀練習，讓學員學會限制範圍、辨識 Evidence 與保留未知事項。
- 學習成果（Learning outcome）：讀者能建立一份只讀取指定 Markdown 的 Task Package，核對回報並停在 Human Review。
- 候選來源（Source candidates）：`AGENTS.md`、`codex-task-template.md`、presentation outline、speaker notes、professor Q&A。
- 驗證狀態（Verification status）：`DRAFT_AUTHORED / EXERCISE_DEFINED / NOT_LEARNER_EXECUTED`。
- 待辦（TODO）：在另行授權的 Instructor-led dry run 後，記錄整體可讀性、工具差異與修正需求。

### 練習目標與範圍

正式練習目標檔案是：

`docs/runbooks/agent-git/README.md`

練習讓學員寫出唯讀 Task Package，要求 Agent 只讀取這一份 Markdown，並由學員
判斷 Evidence、`UNKNOWN` 與 `UNVERIFIED` 是否被正確使用。Agent 不得修改
Repository，結果停在 Human Review。這是工具中立的 `DRAFT`；不代表 Windows、
Codex、Gemini CLI 或其他 Agent 工具已完成實機驗證。

### 練習前提

- 學員已能進入由 `Instructor` 指定的 Repository 工作區。
- Repository、Branch 與 Working Tree 狀態必須已知。
- 練習不要求 Runtime、設備、SSH、Token 或 Private Key。
- Working Tree 狀態不明時標記 `STOP`，不開始練習。

### 學員任務

只盤點目標 README 中的：

- Lifecycle
- Safety Boundary
- Verification Status
- 已撰寫章節
- Known Gaps
- Authoring Gate

### 正式 Task Package 範例

```text
Task（任務）: 盤點 Agent + Git Runbook 的文件狀態
Objective（目標）: 從指定 README 回報 Lifecycle、安全邊界、驗證狀態、章節狀態與已知缺口
Context（背景）: 這是由 Instructor 帶領的第一次工具中立唯讀練習
Allowed Scope（允許範圍）: 只讀取 docs/runbooks/agent-git/README.md
Forbidden Scope（禁止範圍）: 不修改任何檔案；不讀取其他 Repository 路徑；不存取 Runtime、網路服務或 Secret；不執行 Git 狀態變更
Required Evidence（必要證據）: 實際讀取路徑、Lifecycle、Safety Boundary、Verification Status、已撰寫與未撰寫章節、Known Gaps、Authoring Gate、Files Changed: NONE、未驗證項目
Claim Boundary（宣稱邊界）: 只回報指定 README 可直接觀察的內容；不得推論 5G SDR Runtime 現況，Files Changed: NONE 只表示本練習未執行寫入
Stop Point（停止點）: 目標不存在、必要段落缺失、內容可能敏感或實際狀態與任務假設不符時 STOP；正常完成時停在 Human Review
Required Output（必要輸出）: 使用 Appendix 的 Evidence Report Template 回報並等待人工判斷
```

### 預期 Evidence

- 實際讀取路徑。
- 文件 Lifecycle。
- Safety Boundary 條目。
- Verification Status 表格中的狀態。
- 已撰寫與未撰寫章節。
- Known Gaps。
- `Files Changed: NONE`。
- 所有仍為 `UNKNOWN` 或 `UNVERIFIED` 的項目。

`Files Changed: NONE` 必須由 Agent 明確回報；`Instructor` 或 `Reviewer` 仍應依已知的
Repository 起始與最終狀態確認練習沒有產生未預期變更。

### Instructor／Reviewer 驗收問題

- Agent 是否只讀取指定檔案？
- 回報是否能追溯到文件內容？
- 是否把 `UNVERIFIED` 誤寫成已完成？
- 是否產生未授權推論？
- 是否明確回報 `Files Changed: NONE`？
- 是否停在 Human Review？

### 結果分類

- `ACCEPT_FOR_NEXT_GATE`：Evidence 完整且沒有越界，可交由人工決定下一關。
- `REQUEST_CHANGES`：回報需要在相同唯讀邊界內修正後重新 Review。
- `STOP_AND_ESCALATE`：出現範圍、安全、來源或狀態問題，停止並交回人工判斷。

## 6. Git 文件修改最小閉環

- Purpose：描述文件工作從 preflight、隔離變更、Review Diff 到提交人工審查的最小生命週期。
- Learning outcome：讀者能說明每個階段的目的、證據與停止條件。
- Source candidates：`CONTRIBUTING.md`、`AGENTS.md`、presentation outline、professor Q&A。
- Verification status：`UNVERIFIED`；尚無經 Windows 實機驗證的端到端 happy path。
- TODO：另行授權後建立最小文件任務流程；不得把破壞性 Git 例外寫成日常步驟。

## 7. 人工審查關卡（Human Review Gate）

- 目的（Purpose）：定義送交 Review 前的最小證據與 Reviewer 的決策邊界。
- 學習成果（Learning outcome）：讀者能區分 Agent 執行完成、可送 Review、Human approval 與 Merge。
- 候選來源（Source candidates）：`AGENTS.md`、Agent Policy、`agent-review-checklist.md`、rehearsal checklist。
- 驗證狀態（Verification status）：`DRAFT_AUTHORED / SOURCE_GROUNDED / TARGETED_LEARNER_REVIEWED / REVISION_REQUIRED`。
- 待辦（TODO）：依 Gate 4A feedback 由目標學習者與 `Reviewer` 重新檢視判斷問題；不在本輪升格為正式 checklist。

人工審查關卡（Human Review Gate）是文件任務的人工決策點。Reviewer 依下列問題
判斷，不以 Agent 語氣自信或「已完成」字樣代替證據：

| 檢查面向 | Reviewer 判斷方式 |
| --- | --- |
| 範圍（Scope） | 是否只接觸任務明確授權的檔案與操作？ |
| 差異（Diff） | Reviewer 是否能理解每一項變更及其必要性？ |
| 來源依據（Source grounding） | 事實宣稱是否能追溯到已指明的來源？ |
| 宣稱邊界（Claim Boundary） | `DRAFT`、`UNVERIFIED`、`CANDIDATE` 是否被如實保留？ |
| 安全（Safety） | 是否維持 No Secret、No Runtime、No direct main modification？ |
| 驗證（Validation） | 任務要求的檢查是否確實執行，且結果與未執行項目均已回報？ |
| 非預期狀態（Unexpected state） | 是否存在無法解釋的檔案、錯誤或環境差異？若有，結果必須是 `STOP`。 |

### 決策結果

| 結果 | 意義 |
| --- | --- |
| `ACCEPT_FOR_NEXT_GATE` | 本次 Evidence 足以進入下一個明確授權關卡，不等於自動建立 PR 或 Merge。 |
| `REQUEST_CHANGES` | 指定可修正項目與邊界，另行執行受控修改。 |
| `STOP_AND_ESCALATE` | 發現權限、安全、來源或狀態問題；保存證據並交由適當角色決定。 |

### 狀態不可互相替代

| 狀態 | 僅代表 |
| --- | --- |
| Agent task completed | Agent 已到達任務包指定的停止點。 |
| Ready for Human Review | 必要輸出與 Evidence 已整理完成，可交由 Reviewer 判斷。 |
| Human accepted | 人工已接受目前結果或下一關；不自動授權其他 Git 操作。 |
| Ready for PR | 已完成拉取請求（Pull Request，PR）前審查；建立 PR 仍須任務明確授權。 |
| Merged | GitHub 已確認內容合併；不得從前述任一狀態推定。 |

上述狀態彼此不等價，也不能因前一狀態成立就自動升格到下一狀態。

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

## 附錄（Appendix）｜名詞、速查、模板、Evidence 與工具 Adapter

- 目的（Purpose）：集中放置不應中斷主要學習流程的參考資料。
- 學習成果（Learning outcome）：讀者能查找名詞、非破壞性命令提示、任務模板與 Evidence 欄位，並辨識 Adapter 的驗證狀態。
- 候選來源（Source candidates）：`CONTRIBUTING.md`、`codex-task-template.md`、`agent-review-checklist.md`、Lab01 recovery skill、archived presentation reports。
- 驗證狀態（Verification status）：`PARTIAL_AUTHORING`；Prompt template：`DRAFT`；Evidence template：`DRAFT`；Tool adapters：`CANDIDATE / UNVERIFIED`。
- 待辦（TODO）：名詞表、命令速查與 Tool Adapter 仍待後續工作單；Prompt／Evidence 模板需依 Gate 4A feedback 修訂。

### 最小提示詞模板（Prompt Template）

這個工具中立模板只描述任務邊界，不代表已授權任何未列出的操作：

| 欄位 | 使用說明 |
| --- | --- |
| Task（任務） | 用短句辨識這次工作。 |
| Objective（目標） | 說明完成時必須交付的具體結果。 |
| Context（背景） | 提供必要背景，不放入 Secret 或不必要的私人資訊。 |
| Allowed Scope（允許範圍） | 列出可接觸的精確路徑、唯讀目標與已核准操作。 |
| Forbidden Scope（禁止範圍） | 列出不可接觸的檔案、環境與操作。 |
| Required Evidence（必要證據） | 指定 Reviewer 能觀察與重查的證據。 |
| Claim Boundary（宣稱邊界） | 限定可以下什麼結論，並保留未知與未驗證事項。 |
| Stop Point（停止點） | 指定遇到什麼狀態或完成哪一關就停止。 |
| Required Output（必要輸出） | 指定回報格式、必要欄位與交付對象。 |

```text
Task（任務）:
Objective（目標）:
Context（背景）:
Allowed Scope（允許範圍）:
Forbidden Scope（禁止範圍）:
Required Evidence（必要證據）:
Claim Boundary（宣稱邊界）:
Stop Point（停止點）:
Required Output（必要輸出）:
```

### 證據回報範本（Evidence Report Template）

Evidence 是可觀察、可重查且與判斷直接相關的資料；只有語氣肯定的摘要本身不是
Evidence。`UNKNOWN` 與 `UNVERIFIED` 都是有效結果，不應用推測補齊。

| 欄位 | 使用說明 |
| --- | --- |
| Result（結果） | 使用任務指定的結果標籤，並用一句話說明。 |
| Starting State（起始狀態） | 記錄開始時可直接觀察的分支（branch）、HEAD、工作樹（working tree）或文件狀態。 |
| Actions Performed（已執行操作） | 只列實際執行的操作。 |
| Files Read（已讀取檔案） | 列出本次直接讀取的檔案。 |
| Files Changed（已變更檔案） | 列出所有變更；沒有變更時明確寫 `NONE`。 |
| Validation（驗證） | 列出實際執行的檢查與各自結果。 |
| Evidence（證據） | 提供支持結論的狀態、差異或來源位置。 |
| Unexpected Findings（非預期發現） | 記錄與任務假設不一致的項目。 |
| Unverified Items（未驗證項目） | 保留缺少直接證據的事項。 |
| Stop Reason（停止原因） | 說明為何停止；正常到達 Stop Point 也應記錄。 |
| Final State（最終狀態） | 記錄停止時可直接觀察的狀態。 |
| Human Decision Required（需要人工決定） | 明確寫出需要哪個人工判斷或下一關授權。 |

```text
Result（結果）:
Starting State（起始狀態）:
Actions Performed（已執行操作）:
Files Read（已讀取檔案）:
Files Changed（已變更檔案）:
Validation（驗證）:
Evidence（證據）:
Unexpected Findings（非預期發現）:
Unverified Items（未驗證項目）:
Stop Reason（停止原因）:
Final State（最終狀態）:
Human Decision Required（需要人工決定）:
```

這份回報不會自行授權提交（commit）、推送（push）、建立 PR 或合併（merge）；只有
當次任務包明確授予相關操作時，Agent 才能執行。

## Source Map

| Runbook section | Primary source | Supporting source | Freshness risk | Rewrite required | Verification gap |
| --- | --- | --- | --- | --- | --- |
| 0 | `AGENTS.md` | Outline、speaker notes | `MEDIUM`：專案目標必須持續與 `PROGRESS.md` 對齊 | 部分完成：`DRAFT` 閱讀入口已撰寫；Gate 4A targeted review 已完成 | `REVISION_REQUIRED`；不是完整 usability validation |
| 1 | `NONE — verified Windows source absent` | Outline、speaker notes、revision report | `HIGH` | Yes：未來須依實測證據撰寫 | Windows environment 未驗證 |
| 2 | `CONTRIBUTING.md` | Outline、speaker notes、professor Q&A | `MEDIUM`：文件較早且缺少新手定義 | 部分完成：概念 `DRAFT` 已撰寫；Gate 4A targeted review 已完成 | Windows 命令仍為 `UNVERIFIED`；理解缺口待修訂 |
| 3 | `README.md`、`AGENTS.md`、`PROGRESS.md` | `CONTRIBUTING.md`、outline、speaker notes、professor Q&A | `HIGH`：歷史狀態段落可能互相衝突 | 部分完成：Repository orientation `DRAFT` 已撰寫 | Windows Clone 與 Authentication 仍為 `UNVERIFIED` |
| 4 | `AGENTS.md`、Agent Policy | Task template、outline | `MEDIUM`：來源偏治理語言 | 部分完成：新手 `DRAFT` 已撰寫；Gate 4A targeted review 已完成 | Claim Boundary 與 Prompt example 為 `REVISION_REQUIRED` |
| 5 | `AGENTS.md`、task template | Outline、speaker notes、professor Q&A | `MEDIUM`：練習尚未由學員執行 | 部分完成：First read-only exercise 已定義 | Instructor-led execution 為 `NOT EXECUTED` |
| 6 | `CONTRIBUTING.md`、`AGENTS.md` | Outline、professor Q&A | `MEDIUM` | Yes：補目的、證據與 Stop | Windows Git happy path 未驗證 |
| 7 | `AGENTS.md`、Agent Policy | Review checklist、rehearsal checklist | `MEDIUM`：現有 checklist 偏 Runtime | 部分完成：docs-only Gate 已撰寫；Gate 4A targeted review 已完成 | 判斷問題為 `REVISION_REQUIRED` |
| 8 | `AGENTS.md`、Agent Policy | Professor Q&A、revision report | `MEDIUM/HIGH`：supporting cases 為歷史例外 | Yes：建立 novice-safe decision tree | 常見停止情境未驗收 |
| 9 | `NONE — session script absent` | Speaker notes、rehearsal checklist | `MEDIUM`：來源為簡報交付材料 | Yes | Instructor session script 缺失 |
| 10 | `NONE — learner checklist absent` | Review checklist、rehearsal checklist | `MEDIUM` | Yes | Learner acceptance checklist 缺失 |
| Appendix | Task template、Review checklist | Professor Q&A、recovery skill、revision report | `MEDIUM/HIGH`：多份來源具情境限制 | 部分完成：Prompt／Evidence `DRAFT` 已撰寫；Gate 4A targeted review 已完成 | 最小例子需修訂；Tool Adapters 為 `CANDIDATE / UNVERIFIED` |

## Known Gaps

- Windows environment validation
- GitHub authentication choice
- Clone happy path
- Section 3 Windows Clone comprehension revision
- Claim Boundary minimum example
- Prompt Context／Required Output minimum example
- First read-only exercise learner execution and validation
- Instructor session script
- Learner acceptance checklist
- Learner tool selection

## Authoring Gate

Gate 4A targeted learner review 與原 Gate 4B authoring plan 均保留 historical provenance；
PD-03 後，Gate 4B 不再是 current student teaching gate。任何後續變更必須另行確認 working
tree、internal engineering purpose、授權範圍、目標章節與所需驗證。本文件不會自行授權
恢復 learner Agent authoring、補寫 Windows 命令、選擇 Agent 工具、建立 Adapter，或操作
Repository 以外的環境。
