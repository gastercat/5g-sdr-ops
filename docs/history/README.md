# Historical／Evidence／Project Record

[Repository 首頁](../../README.md) · [Delivery](../../delivery/README.md) · [Exploration](../../exploration/README.md)

此入口按用途連回原始路徑，不搬動歷史 payload。歷史結果只支持當時的範圍；日期較舊不代表
已失去所有用途，仍支撐 current claim 的 evidence dependency 繼續由 canonical 文件引用。

本次 navigation refactor 的 Git／檔案保留證據另見
[2026-09-12 documentation split TER](../evidence/task-evidence/2026-09-12-documentation-split.yaml)。

## Lab 與 project evidence

| 紀錄 | 用途與邊界 |
| --- | --- |
| [Phase 4C recovery TER](../evidence/task-evidence/lab01-recovery-workstream.yaml) | 去重的 historical recovery provenance；仍是 Lab01 baseline 的 supporting dependency |
| [2026-08-24 bounded recovery TER](../evidence/task-evidence/2026-08-24-lab01-current-truth-runtime-recovery.yaml) | 到 attach 的當次 evidence；不與 Phase 4C 或後續 EV-2 混成同一結果 |
| [2026-08-30 EV-1／EV-2 Part 8 TER](../evidence/task-evidence/2026-08-30-lab01-ev2-part8-runtime-usb-incident.yaml) | R5 failure、USB incident 與 bounded non-reproduction；current limitation 的 evidence dependency |
| [2026-09-09 Team experiment TER](../evidence/task-evidence/2026-09-09-starlink-dtc-luna-experiment.yaml) | 文件研究執行 provenance；不證明 Team 優勢或 NTN integration |
| [TEH index 與 template](../evidence/task-evidence/README.md) | evidence-only 保存機制，不授權或自行裁定 current truth |
| [Rollback inventory](../audits/2026-07-10-rollback-inventory.md)、[config tree](../audits/2026-07-10-config-tree.md)、[SHA-256 snapshot](../audits/2026-07-10-config-sha256.md) | 2026-07-10 residue observation；不是確認的 baseline 或 active config |
| [教授決策紀錄](../decisions/2026-08-18-professor-meeting.md) | 仍具 project decision 用途；收錄在歷史導覽不表示 superseded，current effect 見[決策登錄](../decision-register.md) |

## Lab01 歷史成果展示與 preparation

- 2026-07-14 Lab01 baseline recovery：[PDF](../presentations/2026-07-14-lab01-baseline-recovery.pdf)、[PPTX](../presentations/2026-07-14-lab01-baseline-recovery.pptx)、[contact sheet](../presentations/assets/lab01-deck-contact-sheet.png)、[rendered slides](../presentations/assets/rendered-slides/)。
- [Claim-to-evidence audit](../reports/2026-07-14-lab01-claim-evidence-audit.md)：仍支撐 canonical architecture 的歷史 claim mapping。
- [Presentation outline](../reports/2026-07-14-lab01-presentation-outline.md)、[speaker notes](../reports/2026-07-14-lab01-speaker-notes.md)、[professor Q&A](../reports/2026-07-14-lab01-professor-qa.md)。
- [Diagram plan](../reports/2026-07-14-lab01-diagram-plan.md)、[slide assets plan](../reports/2026-07-14-lab01-slide-assets-plan.md)：製作規劃，不是新交付待辦。

這套展示可支援成果說明，但不是本次重新驗證的結果，也沒有被指定為最終課程成果報告。

## Agent + Git + Security 歷史展示

2026-08-04 實際簡報、2026-07-28 準備的 v3.1 archive：

- [Presentation archive](../presentations/2026-08-04-agent-git-security/README.md)：PDF、PPTX、contact sheet。
- [Supporting reports](../reports/2026-08-04-agent-git-security/README.md)：outline、speaker notes、Q&A、rehearsal 與 revision report。
- [Archive manifest](../reports/2026-08-04-agent-git-security/ARCHIVE_MANIFEST.md)與[原 SHA256SUMS](../reports/2026-08-04-agent-git-security/SHA256SUMS.txt)：保留當時記錄的 hash discrepancy；本次不修寫歷史 checksum。

直接閱讀：[PDF](../presentations/2026-08-04-agent-git-security/5G_SDR_Agent_Git_Security_Team_Onboarding_Brief_2026-07-28_v3.1.pdf)、[PPTX](../presentations/2026-08-04-agent-git-security/5G_SDR_Agent_Git_Security_Team_Onboarding_Brief_2026-07-28_v3.1.pptx)、[contact sheet](../presentations/2026-08-04-agent-git-security/5G_SDR_deck_contact_sheet_v3.1.png)、
[outline](../reports/2026-08-04-agent-git-security/01_5G_SDR_presentation_outline.md)、
[speaker notes](../reports/2026-08-04-agent-git-security/02_5G_SDR_speaker_notes.md)、
[professor Q&A](../reports/2026-08-04-agent-git-security/03_5G_SDR_professor_QA.md)、
[rehearsal checklist](../reports/2026-08-04-agent-git-security/04_5G_SDR_rehearsal_checklist.md)、
[revision report](../reports/2026-08-04-agent-git-security/5G_SDR_presentation_revision_report_v3.1.md)。

Student Agent 與獨立 Lab04 assumptions 已由後續決策 supersede；保留整套 archive 的 bytes、
路徑與內部引用，不將它還原為 current curriculum。

## 舊材料與來源缺口

- [Lab01 原始目標／舊流程入口](../../labs/lab01-small-cell/README.md)：原始目標、runbook、recovery checklist、known issues、result notes 保留，學生改從手冊開始。
- [Lab02](../../labs/lab02-embb/README.md)與[Lab03](../../labs/lab03-urllc/README.md)：既是未來 Delivery anchor，也含尚未重新裁定的歷史 implementation notes。
- [Lab04 Security](../../labs/lab04-security/README.md)：獨立 post-Lab 模型已 superseded，保留 future cross-cutting mapping input。
- [Agent + Git teaching skeleton](../teaching/agent-git/README.md)：historical learner design；研究重用由 Exploration 導覽。
- [Project status](../project-status.md)、[engineering TODO](../engineering/TODO.md)、[project direction](../project-direction.md)、[device status](../device-status.md)：bootstrap／recovery／candidate records，不能作目前執行狀態。
- 使用者提及的最終成果 PDF 與 frozen legacy Team-mode archive 本體：`NOT_FOUND_IN_REPO`，外部位置與版本 `UNKNOWN`；見[分類盤點](../documentation-map.md)。
