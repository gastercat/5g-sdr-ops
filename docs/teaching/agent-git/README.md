# Agent + Git 未來教學骨架（Future Teaching Skeleton）

狀態：`SKELETON / NOT ACTIVE COURSE`（骨架／尚非正式課程）

## 目的（Purpose）

本文件是未來教學與重用骨架，不是另一份具獨立權威的 Runbook。最初的使用情境是建立
5G SDR 專案進行安全 Agent 與 Git 協作所需的最低共同能力。

在 [2026-08-04 專案會議](../../presentations/2026-08-04-agent-git-security/README.md)
之後，專案提出未來課堂重用的需求。此需求只建立未來方向，不代表課程已啟動、課綱已核准，
也不授予 Repository 或 Runtime authority。

## 現行操作權威來源（Current Operational Source）

現行操作權威來源仍是
[`docs/runbooks/agent-git/README.md`](../../runbooks/agent-git/README.md)。

本目錄中的教學材料必須重用並指向該 Runbook，不得複製、fork，或自行重新定義其中的程序、
安全規則、source authority 或 lifecycle status。任何 operational correction 都必須在另行授權
且完成 Review 的 Work Unit 中，回到現行 Runbook 本體處理。

## 教學重用邊界（Teaching Reuse Boundary）

- 此教學線用於重用以專案為基礎的協作實務，不建立通用 Agent 或 Git 課程。
- 未來可為了清楚閱讀而分開整理學習者教材與 Instructor 教材，但兩者都從屬於現行
  operational Runbook。
- 練習必須保留 Runbook 的 No Secret、No Runtime、分支、evidence、Claim Boundary
  與 Human Review 控制。
- 本骨架不代表 Windows workflow 已驗證，也不替學習者選定工具。

## 候選學習者教材（Candidate Learner Materials）

- Repository、分支、working tree、evidence 與 Human Review 概念的簡短導覽，並連回
  Runbook 對應章節。
- 待另行建立 Windows validation Work Unit 後，為幾乎沒有基礎的學習者建立
  Section 3 Windows Clone 概念橋接。
- 以最小範例具體說明 Claim Boundary、Prompt Context 與 Required Output，但不複製
  Runbook 模板。
- 一份精簡的學習者 handoff，協助辨識何時應停止並詢問 Instructor 或 Reviewer。

## 候選 Instructor 教材（Candidate Instructor Materials）

- 第一次 supervised Read-only Agent task 的帶領筆記。
- 用於檢查學習者能否區分已觀察 evidence、推論、`UNKNOWN` 與 `UNVERIFIED` 的 prompts。
- 未來 docs-only Git 練習的 Review 筆記，包含分支範圍、diff Review 與
  Human Review Gate。
- 記錄整體理解需求的回饋格式，不對個別學習者評分或排名。

## 候選練習（Candidate Exercises）

1. **Instructor-led Read-only Agent exercise。** 使用現行 Runbook 中範圍受限的
   Read-only task 作為教學橋接，並停止於 Human Review。
2. **未來 docs-only Git collaboration exercise。** 在另行授權的 Work Unit 中，
   於隔離分支修改一份指定且不含敏感資訊的 Markdown 檔案，檢閱 diff，並在 merge 前停止。

上述內容均為 candidate exercises。本文件不執行這些練習，也不將它們升格為已驗證的教學程序。

## 目前驗證狀態（Current Validation Status）

目前已進行定向學習者驗證；整體 findings 顯示：

- Section 3 Windows Clone 路徑對幾乎沒有 Git 經驗的學習者仍有理解斷點；
- Claim Boundary 對此基礎程度的學習者仍不直觀；
- Prompt Context 與 Required Output 需要最小範例；
- Instructor-led Read-only Agent task 是合理的教學橋接。

這些 findings 是現行 Runbook 的修訂輸入。本骨架不辨識、評分或排名個別學習者，
不宣稱上述缺口已解決，也不宣稱 Runbook 已納入這些 findings。

## 尚未納入範圍（Not Yet In Scope）

- 完整 Git 課程。
- 完整 Agent 課程。
- 課程網站或完整課程平台。
- 評量或評分系統。
- 多工具教科書、Windows validation procedure 或 authentication guide。
- 任何 5G SDR Runtime、lab host、service、network 或 active configuration 工作。
