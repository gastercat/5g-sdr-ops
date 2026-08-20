# 5G SDR Operations 待辦導覽

本文件是 lifecycle（生命週期）與導覽看板，不取代
[`PROGRESS.md`](PROGRESS.md) 所記錄的目前專案 checkpoint，也不取代
[`docs/engineering/TODO.md`](docs/engineering/TODO.md) 所保存的歷史 recovery backlog provenance。
未勾選項目只代表規劃中的工作，不是已完成、已驗證或已授權的證據。

## 當前／近期規劃（Active / Near-term）

狀態：`PLANNED / NOT YET COMPLETE`（已規劃／尚未完成）

- [ ] **Lab01 completion scope recovery／definition。** 以另行授權的 read-only／
  documentation-only Work Unit 盤點 existing canonical／historical sources，提出待
  Human Review 的 scope 與 unresolved gaps；proposal 不等於 accepted completion
  criteria，也不授權 recovery、restart 或 Runtime execution。
- [ ] **Lab01 experiment manual target。** 以另行授權的 docs-only Work Unit 定義 canonical
  path、章節範圍、現有材料來源與 completion criteria；不得把 historical Phase 4C 改寫成
  current Runtime validation。
- [ ] **Lab01 manual bounded authoring。** 只在 target、source authority、claim boundary 與
  Human Review criteria 核准後開始；本項目不授權 Lab01 recovery、restart 或 extended validation。
- [ ] **Security cross-cutting mapping。** 另行盤點 Lab01～03 可承載的 Security topics、來源與
  safety boundary；只建立 mapping，不在未授權情況下設計或執行 security exercises。
- [ ] **Student-safe minimum Git scope。** 另行定義安全完成實驗所需的 minimum Git concepts
  與 evidence workflow；不把 internal Maintainer governance 自動轉成 student curriculum。
- [ ] **Workflow vocabulary externalization。** 先定義 `Main／Part／Phase／Gate／Work Unit`
  等 internal terms，再提出 external-language mapping；不 mass-rewrite historical artifacts。

本骨架不將上述任一項目記錄為已完成。

## 未來教學（Future Teaching）

狀態：`REPLAN_REQUIRED / NOT ACTIVE COURSE`（需重新規劃／尚非正式課程）

- 依 PD-03，學生課程不教 Agent；既有 learner Agent exercise assumptions 只保留 historical
  provenance，不得繼續作為 current course roadmap。
- 依 PD-04，學生 Git scope 僅保留安全完成實驗所需內容；具體 minimum 尚待另行定義。
- Agent + Git Runbook 保留為 Maintainer／internal engineering reference，不作 student
  curriculum authority。
- Future course architecture 尚未重新設計，本文件不建立新的 learner exercise 或 syllabus。

入口：[Agent + Git 未來教學骨架](docs/teaching/agent-git/README.md)。
本骨架不授權完整 Git 課程、Agent 課程、課程網站或評量系統。

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
