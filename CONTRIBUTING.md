# Contributing

本 repo 用於管理 5G SDR 專題的文件、設備狀態、Lab baseline 與實驗流程。目前主要處理 Markdown 文件，不直接操作實驗環境。

核心流程：

```text
Issue 記任務 -> Branch 做修改 -> Pull Request 合併 -> main 保持穩定
```

## 基本原則

- `main` 應保持可閱讀、可追蹤、狀態清楚。
- 每次修改應有明確目的，避免一次處理太多不相關內容。
- 未經實機確認的技術狀態需標記 `NEEDS_CONFIRMATION`。
- Lab02、Lab03、Lab04 不應寫成已完成；只能整理為待確認、待執行或 future work。
- 文件應使用繁體中文；技術名詞、Git 指令、branch、issue、pull request、commit、AI / Agent 等保留英文原文。

## Branch 命名規則

不使用複雜 Git flow。每個任務開一個簡短 branch。

建議格式：

- `docs/<topic>`：文件整理或新增。
- `lab/<lab-name>`：Lab 文件、流程或結果整理。
- `fix/<topic>`：修正錯字、格式或錯誤資訊。

範例：

- `docs/contributing`
- `lab/lab01-runbook`
- `fix/glossary-terms`

## Issue 使用方式

Issue 用來記錄任務與待確認事項。適合用於：

- 待整理文件。
- 設備狀態或實驗結果待確認。
- Lab evidence 待補。
- 文件錯誤、缺漏或格式問題。

Issue 建議包含：

- 背景：為什麼需要做。
- 目標：完成後應該長什麼樣。
- 範圍：會修改哪些文件或章節。
- 待確認：需要標記 `NEEDS_CONFIRMATION` 的項目。

## Pull Request 使用方式

Pull Request 應保持小範圍，方便 review。

PR 說明建議包含：

- 變更內容。
- 修改原因。
- 影響檔案。
- 是否新增 `NEEDS_CONFIRMATION`。
- 是否有未確認或需要指導老師、維護者確認的事項。

合併前應確認：

- 沒有加入私人稱呼、私人對話或未授權資料。
- 沒有把未驗證實驗結果寫成已完成。
- 沒有修改 runtime config、程式碼或實驗環境。
- Markdown 格式可讀，表格與清單不破版。

## Commit Message 建議

commit message 應簡短描述實際變更。

建議格式：

- `docs: add contributing guide`
- `docs: update ai workflow notes`
- `lab: organize lab01 runbook`
- `fix: correct glossary wording`

避免使用過於模糊的訊息，例如：

- `update`
- `fix`
- `misc`

## 不應提交的內容

請勿提交：

- runtime config，例如 `/etc/srsran`、`/etc/srslte` 相關設定。
- 實驗環境檔案、build output、暫存檔或自動化腳本。
- 私人對話、私人稱呼、未授權資料。
- 帳號、密碼、token、IP、SIM / USIM 敏感資訊。
- 未整理的大型 Log、PCAP 或截圖。
- 會誤導讀者以為 Lab02、Lab03、Lab04 已完成的描述。

## AI / Agent 使用提醒

AI / Agent 可以協助：

- 整理 Markdown 文件。
- 產生 checklist。
- 草擬 Issue、Pull Request 說明。
- 整理 Log 判讀方向或待確認清單。

AI / Agent 不應自動：

- 修改 runtime config。
- 操作實驗環境。
- 改動程式碼或自動化腳本。
- 將未驗證狀態寫成完成。
- 取代成員、指導老師或維護者的最終判斷。

交給 AI / Agent 的任務應明確寫出 allowed scope、forbidden scope、預期輸出與 review 重點。所有 AI / Agent 產出都需要人工 review 後才能合併。
