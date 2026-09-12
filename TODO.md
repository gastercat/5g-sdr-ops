# 5G SDR Operations 待辦導覽

[Delivery](delivery/README.md) · [Exploration](exploration/README.md) · [歷史／Evidence](docs/history/README.md)

本文件整理尚需獨立授權的工作，不取代 [PROGRESS](PROGRESS.md) 或已接受決策。
未勾選項目不代表已授權；材料存在也不等於完成。原 recovery backlog 保留於
[engineering TODO](docs/engineering/TODO.md)。

## Delivery｜目前優先：Lab01 與實驗手冊

狀態：`PLANNED / NOT YET COMPLETE`

- [ ] **Lab01 completion scope／criteria。** 依 existing evidence 與 Human Review 收斂完成
  範圍；EV-2 R5 仍為 `FAIL / UNLOCALIZED`。R5A 是另行授權的工程定位，不是學生 debugging
  必修，也不因這份待辦而啟動。
- [ ] **Lab01 手冊 Review 與 completion criteria。** [學生手冊](labs/lab01-small-cell/student-manual.md)
  已有 `DRAFT / HUMAN REVIEW REQUIRED` 正文，[教學設定](labs/lab01-small-cell/student-config/README.md)
  已有 static consistency review；後續需核對章節、來源與交付要求，不再把「建立檔案」當成
  尚未開始，也不在本次認定手冊完成或 teaching profile Runtime PASS。
- [ ] **Lab01 bounded authoring。** 只在確定 target、claim boundary 與 Review criteria 的獨立
  Work Unit 修訂內容；現有 core／optional scope 保留，不自動加入 research-grade validation。
- [ ] **最終成果包來源與交付清單。** 另行確認指定成果報告的版本與位置；本 Repo 未找到
  「小基站架設與量測成果報告.pdf」，既有歷史簡報不自動等同 final report。

## Delivery｜後續 Lab 與 cross-cutting 教學缺口

狀態：`PENDING DEFINITION / NO EXECUTION AUTHORIZATION`

- [ ] **Lab02 最小學生流程。** 另行定義建立目標、操作、成功辨識與 multicast／eMBMS
  最小結果；原 protocol／packet 待確認清單不直接成為全部 minimum requirement。
- [ ] **Lab03 最小比較流程。** 另行定義 baseline、Split Mode、Duplication Mode 與
  reliability／latency trade-off 的學生紀錄；不要求完整 3GPP-grade URLLC validation。
- [ ] **Security cross-cutting mapping。** Lab01 手冊已有 Security Lens；仍需另行盤點
  Lab01～03 整體 topics、來源與 safety boundary，舊 Lab04 不恢復成獨立必做 Runtime。
- [ ] **Student-safe minimum Git scope。** 另行定義安全完成實驗所需概念與 commands；
  學生不教 Agent，不把 Maintainer governance 改成完整 Git curriculum。

## Delivery supporting／Shared communication

- [ ] **Workflow vocabulary externalization。** 保留 PD-05 的待辦：先定義
  `Main／Part／Phase／Gate／Work Unit` 等 internal terms，再轉換 external language。
  本項仍是已記錄的文件需求；不等於要求學生學整套 workflow，也不 mass-rewrite 歷史文件。
- [ ] **Knowledge-transfer acceptance。** PD-06 的 sequencing 維持有效；stable implementation、
  knowledge transfer 與共同 Review 的具體 criteria 仍待獨立定義。

## Optional Exploration｜工程與教學實驗

狀態：`INTERNAL REFERENCE / OPTIONAL / NOT STUDENT CURRICULUM`

[Exploration 入口](exploration/README.md)集中 Agent + Git、AI workflow、Team experiment、
Harness／Control Plane 相關資料。這些不阻擋最低課程交付。

- Agent + Git Runbook 保留 Maintainer reference；learner revision 與
  [teaching skeleton](docs/teaching/agent-git/README.md) 是 `REPLAN_REQUIRED / NOT ACTIVE COURSE`。
  舊 Gate 4A feedback 與 Gate 4B plan 不恢復成學生 backlog。
- Windows／tool adapters、routing／evaluation、Team-mode、ACP、Control Plane 與 Harness
  延伸若要繼續，必須另立工程／研究 Work Unit；不宣稱已選定方案或已驗證優勢。
- 既有 Repository governance 繼續適用；研究治理架構的改良是另一件事。

## Optional Exploration｜6G LEO／NTN

狀態：`RESEARCH_PARKING / CONCEPT_PROTOTYPE / NOT_INTEGRATED`

入口：[研究文件](docs/research/6g-ntn-handover/README.md)，包含 Neuro-Symbolic RRM 與
Starlink 外部案例。下列保持候選，不構成 Lab minimum：

- [ ] 評估 Phase A 純模擬器的可行性。
- [ ] 評估 SDR telemetry 與研究 observation structures 的可能對應；不宣稱已整合。
- [ ] 另經研究與實作授權後，再評估 RRM／mobility adapters。

真實 LEO handover、NTN scheduler、完整課程平台及 Runtime automation 均未由本文件啟動。
分類過程發現的 stale content 見[deferred items](docs/documentation-map.md#deferred-items)；
本次 PR 到 Human Review 即停止，不自動開始下一輪 cleanup。
