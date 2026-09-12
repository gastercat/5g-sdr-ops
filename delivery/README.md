# Delivery｜實驗、學生手冊與成果交付

[Repository 首頁](../README.md) · [Exploration](../exploration/README.md) · [歷史與證據](../docs/history/README.md)

這是教授、學生與 Instructor／TA 的交付入口。交付方向是 **Lab01～03 + cross-cutting
Security**；Lab01 完成與實驗手冊完成仍是兩個分開的交付面向。這份索引整理現有材料與
缺口，不新增 Lab acceptance criteria，也不表示所有材料已可執行或已完成驗收。

## 最低交付方向與現有材料

| 交付面向 | 從這裡開始 | 現有狀態與尚缺內容 |
| --- | --- | --- |
| Lab01 Small Cell | [學生實驗手冊](../labs/lab01-small-cell/student-manual.md)、[教學設定與 TA provisioning gate](../labs/lab01-small-cell/student-config/README.md) | 手冊為 `DRAFT / HUMAN REVIEW REQUIRED`；設定只有 static consistency review，尚未 isolated Runtime validate |
| Lab01 可重現流程與學生紀錄 | [Lab01 導覽](../labs/lab01-small-cell/README.md) | 手冊已有 core bring-up、DL／UL ICMP、protocol observation、Security Lens、troubleshooting、shutdown 與提交 checklist；這是程序與預期結果，不是完成證據 |
| Lab02 eMBB／eMBMS | [Lab02 材料與交付缺口](../labs/lab02-embb/README.md) | `NOT ACTIVE / NOT AUTHORIZED`；未來需交代建立目標、學生操作、成功辨識與最小 multicast／eMBMS result；現有文件主要為歷史技術待確認清單 |
| Lab03 uRLLC／PRP | [Lab03 材料與交付缺口](../labs/lab03-urllc/README.md) | `NEEDS_CONFIRMATION`；教學方向是 baseline、Split Mode、Duplication Mode 與 reliability／latency trade-off；尚缺可重現學生流程與最小結果定義 |
| Security cross-cutting | [Lab01 手冊 Security Lens](../labs/lab01-small-cell/student-manual.md#8-security-lens)、[PD-02 決策](../docs/decisions/2026-08-18-professor-meeting.md#pd-02security-改為-lab0103-cross-cutting-direction) | Lab01 已有段落；Lab01～03 整體 topic mapping／exercise 仍為 `PENDING`；[舊 Lab04](../labs/lab04-security/README.md) 只作 historical／future mapping input |
| 最終成果／成果報告 | [歷史 Lab01 簡報與 supporting reports](../docs/history/README.md) | 已有歷史成果展示；最終課程成果包的指定檔案與驗收仍待確認，不以舊簡報代替 final deliverable |

**Lab01 最短閱讀路徑：**學生手冊 → 教學設定 → 手冊內 troubleshooting 與 final checklist。
Instructor／TA 另讀 [目前進度](../PROGRESS.md) 與 [已知限制](../docs/known-limitations.md)，
確認可教學範圍及當次執行授權後才帶領實驗。

## Minimum 的界線

- Lab01 core 與 optional extensions 依既有學生手冊區分；NAT／Internet、TCP／iperf 不自動
  納入 core。手冊既有 protocol observation 與 Security Lens 也沒有在本次被刪除或加深。
- EV-2 R5 仍為 `FAIL / UNLOCALIZED`，不宣稱 EV-2 或 Full Lab01 PASS；R5A／USB 深層
  定位是另行授權的工程工作，不是學生必須完成的 debugging 作業。
- Lab02 深層 protocol analysis、packet archaeology 與額外 showcase 不自動成為最低交付。
- Lab03 的 uRLLC 名稱不代表要求完整 3GPP-grade URLLC system validation。
- Security 不構成第四套必做 Runtime；學生不必學 Agent。最低 Git 範圍仍待另外定義，
  不要求閱讀整套 Maintainer Agent + Git Runbook。

以上是本次文件分類的範圍說明；未定的成功門檻與課程驗收由後續獨立 Work Unit 處理。

## Delivery supporting

- [架構](../docs/architecture-overview.md)：有時間邊界的 Lab01 historical baseline；學生背景先讀手冊。
- [名詞表](../docs/glossary.md)：一般 LTE／5GS／NR 技術詞彙，不代表功能已實作。
- [限制](../docs/known-limitations.md)與[進度](../PROGRESS.md)：交付 Review 的 engineering claim 邊界。
- [教授決策](../docs/decisions/2026-08-18-professor-meeting.md)與[決策登錄](../docs/decision-register.md)：課程方向及未決事項。
- [歷史／Evidence 入口](../docs/history/README.md)：Phase 4C、8/24、8/30 evidence 分開保存。
- [Delivery 待辦](../TODO.md)：現有草稿、待確認缺口與下一個獨立授權關卡。

`NOT_FOUND_IN_REPO`：2026-09-12 本機文件盤點未找到「小基站架設與量測成果報告.pdf」。
這不表示該報告不存在於 Repo 外；來源、版本與交付地位保持 `UNKNOWN`，本次不匯入或重建。
