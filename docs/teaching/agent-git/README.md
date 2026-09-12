# Agent + Git 未來教學骨架（Preserved Historical Skeleton）

導覽歸屬：[Exploration](../../../exploration/README.md)／[Historical](../../history/README.md)。
保留 `teaching/` 原路徑以維持來源引用；目錄名稱不代表 current Delivery curriculum。

狀態：`REPLAN_REQUIRED / STUDENT AGENT ASSUMPTIONS SUPERSEDED / NOT ACTIVE COURSE`

## 2026-08-18 Supersession Boundary

- PD-03：學生課程不教 Agent；本文件中的 learner Agent materials、exercise 與 tool-selection
  assumptions 已被 supersede。
- PD-04：student Git scope 僅保留安全完成實驗所需內容；minimum scope 尚待另行定義。
- 本文件保留 2026-08-04 後形成的 teaching skeleton 與 Gate 4A feedback 作 historical
  provenance，不是 current course roadmap、syllabus 或 exercise authority。
- 本 Work Unit 不重新設計課程；未來任何 curriculum 變更均須另行 Human Review。

Canonical decision source：
[`2026-08-18 Professor Meeting Decision Record`](../../decisions/2026-08-18-professor-meeting.md)。

## 目的（Purpose）

本文件保存原未來教學與重用骨架，不是另一份具獨立權威的 Runbook。最初的使用情境是在既有
5G SDR 專案中建立安全使用 Agent 與 Git 進行協作所需的最低共同能力。

依 [2026-08-04 專案會議歸檔](../../presentations/2026-08-04-agent-git-security/README.md)
與 Owner 的第一手會議紀錄，教授於會後提出 Agent + Git Runbook 的需求，先供目前兩位組員
使用，並提出未來可將其轉化為課堂教材。此需求只建立未來方向，不代表課程已啟動、課綱已
核准，也不授予 Repository 或 Runtime authority。

## Internal Engineering Reference

Maintainer／internal engineering 的 Agent safety 與 Git governance reference 是
[`docs/runbooks/agent-git/README.md`](../../runbooks/agent-git/README.md)。

該 Runbook 不是 student curriculum authority。本目錄不得再依其 historical learner sections
恢復 Agent course；任何 internal operational correction 仍必須在另行授權且完成 Review 的
Work Unit 中回到 Runbook 本體處理。

## 教學重用邊界（Teaching Reuse Boundary）

- 此教學線用於重用以專案為基礎的協作實務，不建立通用 Agent 或 Git 課程。
- 未來可為了清楚閱讀而分開整理學習者教材與 Instructor 教材，但兩者都從屬於現行
  operational Runbook。
- 練習必須保留 Runbook 的 No Secret、No Runtime、分支、evidence、Claim Boundary
  與 Human Review 控制。
- 本骨架不代表 Windows workflow 已驗證，也不替學習者選定工具。

## Preserved Historical Candidate Learner Materials

- Repository、分支、working tree、evidence 與 Human Review 概念的簡短導覽，並連回
  Runbook 對應章節。
- 待另行建立 Windows validation Work Unit 後，為幾乎沒有基礎的學習者建立
  Section 3 Windows Clone 概念橋接。
- 以最小範例具體說明 Claim Boundary、Prompt Context 與 Required Output，但不複製
  Runbook 模板。
- 一份精簡的學習者 handoff，協助辨識何時應停止並詢問 Instructor 或 Reviewer。

## Preserved Historical Candidate Instructor Materials

- 第一次 supervised Read-only Agent task 的帶領筆記。
- 用於檢查學習者能否區分已觀察 evidence、推論、`UNKNOWN` 與 `UNVERIFIED` 的 prompts。
- 未來 docs-only Git 練習的 Review 筆記，包含分支範圍、diff Review 與
  Human Review Gate。
- 記錄整體理解需求的回饋格式，不對個別學習者評分或排名。

## Preserved Historical Candidate Exercises

1. **Instructor-led Read-only Agent exercise。** 使用現行 Runbook 中範圍受限的
   Read-only task 作為教學橋接，並停止於 Human Review。
2. **未來 docs-only Git collaboration exercise。** 在另行授權的 Work Unit 中，
   於隔離分支修改一份指定且不含敏感資訊的 Markdown 檔案，檢閱 diff，並在 merge 前停止。

上述內容均為 superseded historical candidates。本文件不執行這些練習，也不得將它們升格為
current student teaching procedure。

## Historical Validation Status

依 Gate 4A learner feedback intake 紀錄，兩位目標學習者已完成對 Runbook 的定向閱讀與回饋。
這是定向學習者檢閱／驗證（targeted learner review / validation），不是完整的可用性驗證、
課程驗證或操作認證。整體發現如下：

- Section 3 Windows Clone 路徑對幾乎沒有 Git 經驗的學習者仍有理解斷點；
- Claim Boundary 對此基礎程度的學習者仍不直觀；
- Prompt Context 與 Required Output 需要最小範例；
- Instructor-led Read-only Agent task 是合理的教學橋接。

這些發現曾是 Runbook 的 learner revision input；PD-03 後不再是 current student-authoring
backlog。本骨架不辨識、評分或排名個別學習者，不宣稱上述缺口已解決，也不宣稱 Runbook
已納入這些回饋。

## 尚未納入範圍（Not Yet In Scope）

- 完整 Git 課程。
- 完整 Agent 課程。
- 課程網站或完整課程平台。
- 評量或評分系統。
- 多工具教科書、Windows validation procedure 或 authentication guide。
- 任何 5G SDR Runtime、lab host、service、network 或 active configuration 工作。
