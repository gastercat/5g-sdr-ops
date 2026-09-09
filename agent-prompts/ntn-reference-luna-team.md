# NTN Reference Case — Minimal Luna Team

狀態：`EXPERIMENT / INTERNAL ENGINEERING / NOT POLICY`

本 task package 用於一次已授權的 NTN／LEO reference-case 文件工作。
它不是學生教材、常駐 Agent、`/Team-mode` skill 安裝或新的 Control Plane。
再次使用須有新的 task scope；本次執行證據見
[2026-09-09 TER](../docs/evidence/task-evidence/2026-09-09-starlink-dtc-luna-experiment.yaml)。

## 為何是這兩個角色

本 Repo 的主要風險是把外部衛星服務混同為 3GPP NR-NTN compliance，或把研究案例
升格成 Lab 實作與已接受架構。兩項責任可獨立檢查，因此採兩個 Luna worker，
由既有 Parent Maintainer 整合並唯一寫入；不另設通用 planner、writer 或 communication agent。

| Role / task name | Model | 輸入與工作 | 交付 | Authority |
| --- | --- | --- | --- | --- |
| Satellite Evidence Reviewer / `satellite_evidence` | `gpt-5.6-luna` | Repo NTN boundary、Starlink／operator／3GPP 第一手來源；核對 LTE、LEO、NR-NTN 與 dated service milestone | Claim、URL、日期、支持範圍、unknown ledger | Read-only research；不裁定 Repo decision |
| Research Boundary Reviewer / `research_boundary` | `gpt-5.6-luna` | AGENTS、PROGRESS、canonical architecture／decisions／limitations、NTN prototype；先檢查落點，再審 draft | 最多五項具體 finding：位置、風險、修正建議與 unresolved issue | Read-only review；不自行升格 blocker 或改檔 |
| Parent Maintainer | 本次既有 parent model | 整合來源、處理分歧、寫入與驗證 | Reviewable diff、finding disposition、TER | 僅本次已授權文件；不等於 Human acceptance |

## 執行契約

1. Parent 完成 Repo preflight 與 checkpoint provenance 檢查，在獨立文件分支工作。
2. 以 `collaboration.spawn_agent` 啟動上列兩個 worker，明確指定 Luna，
   使用 `fork_turns: none` 與限縮 task context；worker 先讀 Repo instructions。
3. Evidence worker 查公開第一手來源；Boundary worker 同時判讀 Repo 的文件權威。
   Parent 同時準備案例結構與核對關鍵來源。
4. Parent 形成 draft 後，以 `followup_task` 請同一 Boundary worker 審查實際 diff。
5. Parent 對 findings 逐項採納、限縮或說明未採納理由；檢查 diff、內部連結與敏感資料。
   保留可 review 的未提交文件，完成一次 experiment 後停止。

Worker output 使用 `KNOWN / SOURCE-SUPPORTED`、`INFERENCE`、`UNKNOWN` 區分事實、
推論與缺證；供應商報告不得改寫為本 Repo 的獨立實測。

## Budget、禁止事項與停止條件

- 最多兩個 concurrent workers；Evidence 一個 task turn，Boundary 最多兩個 task turns。
  不允許 nested delegation、自動重試或自動升級模型；Parent synthesis 為既有工作。
- 這是 task-turn budget，不是 tool-call 或 token 上限。實際費用與相對單 Agent 效率若無
  usage evidence，保持 `UNKNOWN`；不宣稱本實驗已證明省費或模型多樣性。
- Worker 不改檔、不操作 Git 狀態、不存取 lab、不傳訊給外部人員；shared workspace 的
  read-only 分工是操作契約，不是獨立 OS sandbox。
- Parent 寫入限研究文件、必要 navigation、本 task package 與 execution evidence。
  不改 runtime、configs、source、accepted decisions、student curriculum 或 global agent settings。
- 不 commit、push、merge、部署或擴大 validation。來源不足時保留 unknown 或刪除 claim；
  需 implementation／runtime 或超過 budget 才能解決的項目留待另行授權。
- Acceptance：案例可由研究入口找到，claims 有日期與來源，技術類別及 Repo scope 清楚，
  至少一項 worker finding 有可追溯的處理結果，文件檢查完成。Human Review 保持 `PENDING`。
