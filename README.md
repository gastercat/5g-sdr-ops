# 5G SDR Ops

Status: v0.1 low-risk documentation bootstrap  
Date: 2026-06-24

本 repository 用於整理 5G SDR 專題的文件、設備狀態、Lab baseline、會議紀錄、實驗流程與後續交接資料。

目前此 repo 的定位不是實驗程式碼主倉庫，也不是直接執行 Lab02 或修改實驗環境的工作區，而是專題的「運維與文件管理區」。

---

## 1. Repository 目的

本 repo 主要用於：

- 記錄 5G SDR 專題目前狀態
- 保存設備盤點與使用狀態
- 整理 Lab01 stable baseline recovery 文件
- 保存 Lab01～Lab04 的 runbook、checklist、known issues
- 沉澱 HackMD / 會議紀錄中的已確認內容
- 建立後續課程化、助教化、交接用文件
- 避免實驗狀態、設定檔與操作紀錄混在一起

---

## 2. v0.1 範圍

目前 v0.1 僅處理低風險文件工作。

### v0.1 包含

- docs/device-status.md
- docs/project-status.md
- docs/project-direction.md
- TODO.md
- 初始文件骨架
- 尚未確認事項標記為 NEEDS_CONFIRMATION

### v0.1 不包含

- 不推進 Lab02
- 不修改 runtime config
- 不上電測試設備
- 不更動 /etc/srslte/*.conf
- 不讓 Agent 直接操作實驗環境
- 不承諾 6G / LEO 主線
- 不建立完整課程教材

---

## 3. 目前文件結構

5g-sdr-ops/
- README.md
- TODO.md
- docs/
  - device-status.md
  - project-status.md
  - project-direction.md
- labs/lab01-small-cell/
- checklists/
- agent-prompts/

---

## 4. 目前專題狀態

目前 5G SDR 專題處於會議後整理階段，尚未形成新的技術決議。

短期內不適合直接推進 Lab02 或大幅修改實驗環境。  
目前優先工作是：

1. 設備盤點
2. Lab01 stable baseline recovery
3. HackMD / 原始紀錄整理
4. GitHub 文件沉澱
5. 責任邊界文件化

---

## 5. 設備狀態

目前部分實驗設備已集中保管，詳細狀態仍待確認。

初步設備清單：

- Linux 主機 x2
- Switch x1
- USRP x2
- 天線 x8
- 線材 / 電源 / 配件：NEEDS_CONFIRMATION

詳細內容請見：

- docs/device-status.md

---

## 6. Lab01 Stable Baseline

Lab01 已有過成功實作成果，但目前尚未完整整理成可追蹤、可重現、可回復的 stable baseline。

後續 Lab01 baseline recovery 目標：

- 保存 Lab01 使用過的 config
- 整理 Lab01 啟動流程
- 定義 Lab01 成功判定
- 整理 known issues
- 建立 recovery checklist
- 避免 Lab02 修改覆蓋 Lab01 狀態

相關文件預計放置於：

- labs/lab01-small-cell/

---

## 7. 文件狀態標記

| 標記 | 意義 |
|---|---|
| DRAFT | 草稿，尚未正式確認 |
| NEEDS_CONFIRMATION | 需要實機、組員或教授確認 |
| CONFIRMED | 已確認 |
| DEFERRED | 暫緩處理 |
| FUTURE_WORK | 未來可做，但不屬於目前版本 |

---

## 8. 協作原則

本 repo 目前以文件整理與狀態保存為主。

基本原則：

- 未確認內容不可寫成已完成事實
- 所有未知狀態標記為 NEEDS_CONFIRMATION
- 不將私人對話、草稿推理或非專題內容放入 repo
- 不在未確認狀態下修改實驗環境
- 重要變更需透過 Git commit 保存
- 實驗結果需保留 log、截圖、Wireshark 或 Git diff 等證據

---

## 9. Agent / AI 使用原則

本專題可使用 Agent / AI 工具作為工程輔助，包括：

- 整理文件草稿
- 分析錯誤訊息
- 產生 checklist
- 比對設定檔差異
- 協助建立 runbook

但所有納入 repo 的內容皆需人工確認。

Agent / AI 產生內容不得直接視為正確結果，必須透過以下方式驗證：

- Git diff
- 實機測試
- log
- Wireshark 觀測
- 人工 review
- 組員或教授確認

---

## 10. 核心邊界

目前此 repo 的核心邊界是：

本 repo 用於降低 5G SDR 專題狀態混亂，不代表單一成員需要承擔全部實驗維護責任。

設備暫時集中保管，不等於所有成果、測試與維護責任都由單一成員承擔。

---

## 11. Maintainer

負責人：TBD  
設備暫存者：TBD  
專題小組：TBD

---

## 12. License / Visibility

目前 repo 建議先維持 private。  
待內容清理完成、確認沒有私人資訊、敏感設定或未授權資料後，再決定是否公開。
