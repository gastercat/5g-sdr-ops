# 5G SDR Operations 待辦導覽

本文件是 lifecycle（生命週期）與導覽看板，不取代
[`PROGRESS.md`](PROGRESS.md) 所記錄的目前專案 checkpoint，也不取代
[`docs/engineering/TODO.md`](docs/engineering/TODO.md) 所保存的歷史 recovery backlog provenance。
未勾選項目只代表規劃中的工作，不是已完成、已驗證或已授權的證據。

## 當前／近期規劃（Active / Near-term）

狀態：`PLANNED / NOT YET COMPLETE`（已規劃／尚未完成）

- [ ] **Agent + Git Runbook 定向學習者回饋修訂。** 另以經授權的 Work Unit
  修訂目前的 operational Runbook，重點包含 Section 3 Windows Clone 的理解斷點、
  更清楚的 Claim Boundary 說明，以及最小的 Prompt Context / Required Output 範例。
- [ ] **Instructor-led Read-only Agent dry run。** 執行第一次由 Instructor 帶領、
  範圍受限的練習並記錄整體學習者回饋；此練習不授予 Repository mutation 或
  Runtime authority。

本骨架不將上述任一項目記錄為已完成。

## 未來教學（Future Teaching）

狀態：`SKELETON / NOT ACTIVE COURSE`（骨架／尚非正式課程）

- 重用現行 [Agent + Git Runbook](docs/runbooks/agent-git/README.md)，不得建立第二份
  具獨立權威的 Runbook。
- 未來可分開整理學習者教材與 Instructor 教材，但兩者都必須依循現行 Runbook。
- 保留 Instructor-led Read-only Agent exercise，作為第一個教學橋接。
- 評估未來的 docs-only Git 協作練習；練習必須使用隔離分支並設置 Human Review Gate。

入口：[Agent + Git 未來教學骨架](docs/teaching/agent-git/README.md)。
本骨架不包含完整 Git 課程、完整 Agent 課程、課程網站或評量系統。

## Research Parking — 6G LEO / NTN（研究停放）

狀態：`RESEARCH PARKING / NOT CURRENT LAB01 OR LAB02 MAINLINE`
（研究停放／不是目前 Lab01 或 Lab02 主線）

- 將 Neuro-Symbolic RRM / Handover Supervisor 保存為文件化研究概念；不得將它描述為
  已實作或已驗證的 Runtime 功能。
- [ ] 評估 Phase A 純模擬器的可行性。
- [ ] 將目前 5G SDR telemetry 對應至候選研究 observation structures，但不得宣稱
  已完成整合。
- [ ] 另經研究與實作授權後，再評估未來的 RRM / mobility adapters。

入口：[6G LEO / NTN Handover Research Parking](docs/research/6g-ntn-handover/README.md)。

## 明確未啟動（Explicitly Not Active）

- 真實 LEO handover 實作。
- NTN scheduler 修改。
- 完整課程平台。
- Runtime automation。

既有的 v0.1 bootstrap checklist 仍保留在 Git history 中，但不會被升格為目前的
lifecycle 看板或目前專案 authority。
