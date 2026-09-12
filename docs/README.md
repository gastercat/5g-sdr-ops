# 文件導覽與 Shared Project Controls

[Repository 首頁](../README.md) · [Delivery](../delivery/README.md) · [Exploration](../exploration/README.md) · [Historical／Evidence](history/README.md)

`docs/` 是來源保存層，目錄名稱本身不決定 lifecycle。課程交付與研究延伸由上方兩個入口分開；
[分類盤點](documentation-map.md)記錄每組主要 artifact 的用途、保留理由及未決事項。

## Shared project controls

| 入口 | 責任 |
| --- | --- |
| [PROGRESS](../PROGRESS.md) | 目前記錄的 project checkpoint、stop point、next gate；不代表 live Runtime |
| [TODO](../TODO.md) | Delivery、supporting communication 與 optional exploration 待辦 |
| [AGENTS](../AGENTS.md)、[CONTRIBUTING](../CONTRIBUTING.md) | Repository 行為、安全、分支與 Human Review 規則 |
| [Architecture overview](architecture-overview.md) | Canonical historical Lab01 architecture 及時間邊界；同時支援 Delivery |
| [Decision register](decision-register.md)、[professor decisions](decisions/2026-08-18-professor-meeting.md) | 已接受方向、未決事項與 decision provenance |
| [Known limitations](known-limitations.md) | 跨工作線的 claim 邊界；同時支援 Delivery Review |
| [Configuration governance](engineering/CONFIGURATION_GOVERNANCE.md)、[remote agent policy](engineering/CODEX_REMOTE_AGENT_POLICY.md) | 保留原有文件狀態與適用規則；不因 Exploration 分類而撤銷 |
| [Lab01 recovery skill](../.agents/skills/lab01-baseline-recovery/SKILL.md) | 受控 recovery 程序；不是學生必讀教材或當次操作授權 |
| [Task Evidence Harness](evidence/task-evidence/README.md) | 現有 evidence 保存規則；與研究 Harness 延伸分開 |

## 其他來源的閱讀位置

- [Delivery](../delivery/README.md)：Labs、student manual／config、教學背景、成果與缺口。
- [Exploration](../exploration/README.md)：Agent + Git、AI workflow、Team experiment、6G／NTN 及 future directions。
- [Historical／Evidence](history/README.md)：audits、TER、reports、presentations、superseded teaching 與 bootstrap records。
- [Glossary](glossary.md)：Delivery supporting 的一般名詞。
- [Hardware notes](hardware-notes.md)：混合一般硬體背景與較廣的未驗證操作方向；保留原位，
  不作 Lab01 ZeroMQ 的必要設備清單。適用課程範圍為 `UNRESOLVED`。
