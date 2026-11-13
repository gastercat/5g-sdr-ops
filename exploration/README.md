# Exploration｜研究與工程延伸

[Repository 首頁](../README.md) · [Delivery](../delivery/README.md) · [歷史與證據](../docs/history/README.md)

這裡保存可供研究、學習與成果展示的工程內容。它們不形成 Lab01～03 或 Security 的
最低交付義務，也不以研究完整度作為課程交付前提。來源保留原路徑；下表按用途導覽，
每份文件原有的 `DRAFT`、`UNVERIFIED`、`SUPERSEDED` 與 `NOT_INTEGRATED` 仍有效。

## 工程與 AI workflow

| 主題 | 入口 | 用途與 lifecycle |
| --- | --- | --- |
| Agent + Git | [Internal Runbook](../docs/runbooks/agent-git/README.md) | Maintainer engineering reference；部分章節仍為 draft／scaffold，不是學生課程 |
| Agent + Git 教學實驗 | [Preserved teaching skeleton](../docs/teaching/agent-git/README.md) | `REPLAN_REQUIRED / NOT ACTIVE COURSE`；保留 Gate 4A feedback 與 superseded learner assumptions，不重啟課程 |
| AI-assisted engineering | [AI Workflow](../docs/ai-workflow.md) | 工程方法與歷史 debugging examples；不是 current Lab procedure 或學生 syllabus |
| 任務設計、routing／evaluation | [通用任務模板](../agent-prompts/codex-task-template.md)、[Agent review checklist](../checklists/agent-review-checklist.md) | 內部工程輔助；模板範例不構成當次授權或已採用的 automated gate |
| Bounded Team experiment | [NTN reference task package](../agent-prompts/ntn-reference-luna-team.md)、[2026-09-09 TER](../docs/evidence/task-evidence/2026-09-09-starlink-dtc-luna-experiment.yaml) | 保存單次文件研究實驗；未證明相對單 Agent 優勢，不是常駐 Team-mode／Control Plane |
| Harness、Governance、ACP | [TEH](../docs/evidence/task-evidence/README.md)、[Agent + Git verification status](../docs/runbooks/agent-git/README.md#verification-status)、[shared controls](../docs/README.md) | TEH 是 evidence-only 現有機制；ACP 為 `PARKING / OBSERVATION`。研究治理設計不撤銷既有 repo safety rules |

## 通訊研究與 future architecture

| 主題 | 入口 | 用途與 lifecycle |
| --- | --- | --- |
| 6G／LEO／NTN | [Research Parking](../docs/research/6g-ntn-handover/README.md) | `RESEARCH_PARKING / CONCEPT_PROTOTYPE / NOT_INTEGRATED` |
| Neuro-Symbolic RRM／Handover Supervisor | [候選架構](../docs/research/6g-ntn-handover/neuro_symbolic_rrm_handoff.md) | Pipeline、constraints、概念性 pseudocode 與候選 roadmap；不是 Runtime implementation |
| Starlink Direct to Cell | [外部參考案例](../docs/research/6g-ntn-handover/starlink-direct-to-cell-reference.md) | 保存 2026-09-09 來源查核及研究問題；不是本 Repo 的 NTN implementation 或 prototype validation |
| 期限感知的雙路徑傳送策略 | [工具與說明](ai-dualpath/README.md) | `EXPLORATION / APPLICATION_LAYER_ONLY / SIMULATED_PROOF_OF_CONCEPT`；離線比較固定策略、門檻規則與 LinUCB，路徑 B 的類 LEO 特性為模擬。尚無 OTA 上的策略比較，不是 PDCP 層或 NTN 實作 |
| 其他 future architecture | [Historical candidate directions](../docs/project-direction.md) | O-RAN、FPGA、AI／ML、RIS 等舊候選未因列出而採納 |

## 教學視覺化

| 主題 | 入口 | 用途與 lifecycle |
| --- | --- | --- |
| 5G SDR Interactive Lab | [網站來源](5g-sdr-interactive-lab/index.html)、[PR 40 remediation 記錄](5g-sdr-interactive-lab/review/pr40-remediation.md) | 靜態教學視覺化，由 `Interactive Lab Pages` workflow 封裝；不是網路模擬器、即時 telemetry 或 Runtime evidence。Lab04／Tailcat 視角為 `PROPOSED`，各場景狀態以其證據頁標示的範圍為限 |
| Lab03 雙路徑探測與即時檢視 | [工具與說明](lab03-dualpath-tools/README.md)、[Lab03 OTA 實測頁來源](5g-sdr-interactive-lab/lab03-ota.html) | `ENGINEERING AID / APPLICATION_LAYER_ONLY`；2026-11-12 單次實測的工具與結果視覺化，不是 PDCP 層實作、學生流程或驗收標準，也不授權 Runtime |

## Control Plane 與尚未收錄的材料

「Control Plane」需依上下文辨識：學生理解 LTE signalling 是
[Lab01 手冊](../labs/lab01-small-cell/student-manual.md)的一部分；Lab02 深層協定研究可由
[舊技術清單](../labs/lab02-embb/README.md)與[版本／證據限制](../docs/known-limitations.md)定位。
這些不代表已交付額外 protocol controller。

Agent Control Plane／routing 系統方面，本 Repo 只有上述 task package、Runbook、TEH 與
研究提及，未找到可獨立確認的完整 Control Plane implementation artifact。
Starlink 案例提及 frozen legacy Team-mode 的 `NON_NORMATIVE` 地位；本次未在 Repo 找到
該獨立 archive 本體，來源與位置保留 `UNKNOWN`。不引入私人 Handoff 或 Repo 外資料。

[Optional exploration 待辦](../TODO.md)只保存候選；任何新研究、實作或驗證需另行授權。
