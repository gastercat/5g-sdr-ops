# 2026-08-18 Professor Meeting Decision Record

狀態：`CANONICAL PROJECT DECISION RECORD / DOCUMENTATION-ONLY`

- Meeting date：2026-08-18
- Repository materialization date：2026-08-20
- Source：2026-08-18 professor meeting
- Affected project：5G SDR Operations

## Source and Provenance

本紀錄將 2026-08-18 教授會議的六項 project decisions 寫入 Repository canonical
documentation。決策內容由本次經 Human 授權的 documentation Work Unit 提供；目前
Repository **沒有**可獨立重驗的逐字會議紀錄、錄音或原始 minutes。因此，本文件保存的是
Human-authorized project decision，不把未存在的 meeting artifact 描述成 primary evidence。

本紀錄可裁定 project roadmap、curriculum direction、文件 lifecycle 與 collaboration
sequencing；它不是 Runtime evidence，也不授權 Lab start、configuration deployment、service
operation、network change、RF operation、Git commit 或 Git push。

## Decisions

### PD-01｜暑假優先完成 Lab01 與實驗手冊

- Decision：暑假階段優先完成 Lab01 與實驗手冊。
- Affected surfaces：`PROGRESS.md`、`TODO.md`、Lab01 documentation、project roadmap。
- Required effect：完成 Lab01 與完成實驗手冊是 current summer project priority 中兩個
  必須分別保留的 deliverable dimensions；Agent + Git learner revision 不再是 current
  mainline。
- Claim boundary：既有 Phase 4C 仍是 historical execution baseline。本決策不表示 Runtime 已
  revalidate、目前正在執行，或已授權新的 Lab01 recovery／restart，也不表示 Lab01 或
  實驗手冊的 completion scope／criteria 已經定義。

### PD-02｜Security 改為 Lab01～03 cross-cutting direction

- Decision：原 Lab04 資安內容改為 cross-cutting，穿插 Lab01、Lab02、Lab03。
- Affected surfaces：Lab curriculum architecture、`labs/lab04-security/`、未來 Lab01～03 manual。
- Required effect：獨立、後置 Lab04 的 teaching model 被 supersede；原始材料保留為 historical
  input，後續另行建立 cross-cutting mapping。
- Claim boundary：本決策不設計 security exercises，也不授權 false base station、DoS、OTA、RF
  transmission 或其他 security Runtime work。

### PD-03｜Student curriculum excludes Agent

- Decision：學生課程不教 Agent。
- Affected surfaces：Agent + Git Runbook lifecycle、Future Teaching、student／learner materials。
- Required effect：既有 student-facing Agent exercises 與 learner-authoring assumptions 被
  supersede，不再構成 current course direction。
- Claim boundary：Agent 仍可作為 Maintainer／internal engineering tool，並持續受 Repository
  policy、scope、evidence、authorization 與 Human Review 約束。

### PD-04｜Git 僅保留安全完成實驗所需內容

- Decision：學生課程中的 Git 僅保留安全完成實驗所需內容。
- Affected surfaces：Future Teaching、student-facing Git scope、未來 experiment manual。
- Required effect：通用 Git collaboration curriculum 不再是 current course direction；後續只可在
  另行授權的文件工作中定義 experiment-safe minimum。
- Claim boundary：本決策不撤銷 Maintainer 所需的 Repository Git governance；本 Work Unit 也不
  裁定 final command set、authentication path 或 teaching sequence。

### PD-05｜Workflow vocabulary 必須先定義再 externalize

- Decision：`Main`、`Part`、`Phase`、`Gate`、`Work Unit` 等內部工程術語需先定義，再轉換成
  external audience 可理解的語言。
- Affected surfaces：canonical documentation、future experiment manual、future external-facing
  teaching／presentation material。
- Required effect：後續另行建立 bounded vocabulary definition 與 external-language mapping。
- Claim boundary：本決策不在本 Work Unit 建立 final ontology，也不要求 mass-rewrite historical
  presentations。Git branch `main` 的技術名稱不得與 internal `Main／Mainline` 語意混為一談。

### PD-06｜Lead first，stable implementation 後再 knowledge transfer

- Decision：採 `LEAD_FIRST → KNOWLEDGE_TRANSFER_LATER`。Project Lead 可先完成 Lab01、
  Lab02，再於 stable implementation 後進行 collaborator knowledge transfer。
- Affected surfaces：collaboration authority、roadmap sequencing、handoff boundary、DR-009。
- Required effect：Project Lead 不必等待 collaborators 同步完成 Lab01／Lab02，DR-009 的
  sequencing authority question 因本決策而 resolved。
- Claim boundary：本決策不表示 permanent solo ownership、不自動授權任何 Runtime 或 Lab02
  execution、不免除 collaborators 的 future responsibilities，也不定義 knowledge-transfer
  acceptance criteria。

## Unresolved Implementation Details

- Lab01 completion scope、completion criteria 與尚未完成項目。
- Lab01 實驗手冊的 canonical path、章節結構與 completion criteria。
- Security 在 Lab01～03 的具體 topic mapping、深度、exercise 與 safety review criteria。
- Student curriculum 所需的 minimum Git concepts、commands 與 evidence workflow。
- `Main／Part／Phase／Gate／Work Unit` 的 final definitions 與 external-language mapping。
- Stable implementation 的 decision criteria、knowledge-transfer format 與 acceptance criteria。
- Project Lead 可獨立前進時仍需共同 Review 或 external authority 的 exact checkpoints。

上述項目保持 `UNRESOLVED_IMPLEMENTATION_DETAIL / NEEDS_SEPARATE_WORK_UNIT`。它們不削弱
PD-01～PD-06 的 decision authority，也不得由 Agent 在未授權情況下自行補成 curriculum、
Runtime plan 或 governance ontology。
