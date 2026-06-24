# AI Workflow

本文件整理 5G SDR 專案中使用 AI / Agent 的工程工作方式。核心原則是：

```text
Human-Owned Architecture, AI-Assisted Execution
```

人負責架構、邊界、不可違反條件、取捨與審查；AI 負責協助分析、整理、產生可執行步驟、整理 Log、整理封包觀察點，以及產出可交付 Agent 的任務規格。

## AI 在本專案中的定位

AI 可以扮演：

- 系統工程教練
- Log 分析助手
- 架構審查員
- 風險檢查員
- Agent 任務規格產生器
- 文件與實驗報告整理助手
- Junior Engineer 的任務規劃者

AI 不應扮演：

- 未經審查的最終決策者
- 未定義邊界前的核心邏輯代工者
- 憑空猜測問題來源的除錯者
- 不看 Log、不看封包、不看設定檔就直接修改系統的人

## Human-Owned Architecture 原則

| 決策類型 | 負責者 | 說明 |
| --- | --- | --- |
| Architecture | 人 | 系統怎麼分層、模組如何互動、資料流如何設計 |
| Invariants | 人 | 哪些條件不能被破壞，例如封包路徑、時序、設定檔一致性 |
| Boundaries | 人 | 哪些範圍 AI 可以改，哪些不能改 |
| Runtime Reasoning | 人主導，AI 協助 | 系統執行時每一層是否符合預期 |
| Trade-off | 人 | 穩定性、效能、可重現性、實驗成本之間的取捨 |
| Review | 人 | 最終審查 AI 或 Agent 的輸出是否可接受 |

## AI 可協助的範圍

- 整理實驗流程
- 產生 checklist
- 整理 Log 判讀方向
- 解釋設定檔欄位
- 草擬 `README.md`
- 產生 Agent 可執行的任務 prompt
- 建立測試步驟
- 整理 Wireshark filter
- 產生報告章節草稿
- 根據錯誤訊息建立除錯樹
- 幫忙做 code review checklist
- 小範圍標準範例、文件格式整理

## AI 不應自動處理的範圍

- 未經確認就修改核心設定檔
- 未經確認就改 eNB / UE / EPC 的核心流程
- 未定義 invariant 前改 parser 或協定邏輯
- 未看 Log 就猜測 RF 問題
- 未確認實驗階段就切換到 OTA
- 未確認風險就執行高影響力指令
- 用大量重構取代小步驗證

## Strict Coach Mode 使用規則

Strict Coach Mode 的目的不是讓 AI 拒絕協助，而是確保使用者保留架構能力。

適合啟用的情境：

- 需要設計系統架構
- 需要定義資料流與模組邊界
- 需要判斷 invariant
- 需要做協定流程推理
- 需要進行 runtime reasoning
- 需要做 trade-off 決策
- 需要檢查 Agent 的修改是否安全

不需要過度啟用的情境：

- 查語法
- 查 Linux 指令用途
- 產生 boilerplate
- 建立測試模板
- 重排文件格式
- 產生表格
- 將 Log 整理成重點

## AI 回答基本流程

建議 AI 依照下列順序回應：

1. 先判斷問題層級
2. 說明目前所在系統層
3. 列出已知事實
4. 列出未知變數
5. 提出最小驗證步驟
6. 指出可能風險
7. 給出下一個可執行動作
8. 若適合，產生給 Agent 的精準任務 spec

## 問題層級分類

| 類型 | 說明 | AI 應做的事 |
| --- | --- | --- |
| Reasoning Gap | 使用者不知道為什麼會這樣 | 用系統模型解釋，不直接跳解法 |
| Abstraction Gap | 使用者不知道該怎麼分層 | 協助畫出模組、資料流、邊界 |
| Pattern Gap | 使用者不知道業界常見做法 | 教 pattern 與適用條件 |
| Idiom Gap | 使用者不熟語言或工具慣例 | 直接教語法與慣用法 |
| Framework Gap | 使用者不熟工具鏈 | 解釋工具鏈與執行順序 |
| Runtime Gap | 系統跑起來但不知道哪裡壞 | 建立 Log / packet / interface 驗證順序 |
| Agent Spec Gap | 想交給 Agent 但不知道怎麼下指令 | 產出可貼給 Agent 的精準 prompt |

## 本專案除錯總原則

除錯時禁止盲猜，必須依照系統層級往下收斂。

```text
Process 是否啟動
  -> Interface 是否存在
  -> IP / route 是否正確
  -> Log 是否有錯誤
  -> 封包是否出現在正確介面
  -> 協定狀態是否符合預期
  -> 設定檔是否被 parser 正確讀入
  -> 原始碼邏輯是否需要檢查
```

## Runtime Reasoning 清單

### eNB / EPC / UE 啟動檢查

- EPC 是否成功啟動 MME / HSS / S-GW / P-GW
- eNB 是否完成 S1 Setup
- UE 是否完成 Attach
- UE 是否取得 `tun_srsue`
- UE 是否取得 `172.16.0.x` IP
- eNB / UE 是否使用相同 RF 或 ZMQ 參數
- EPC 是否有正確 NAT / route

### eMBMS / SIB13 檢查

- `sib.conf.mbsfn` 是否存在
- `sib1` 的 `si_mapping_info` 是否包含 SIB13
- eNB Log 是否顯示 MBSFN / MCCH / PMCH 相關設定
- UE MAC-LTE pcap 是否有 System Information
- Wireshark 是否能解析 MAC-LTE / RRC
- MCCH / MTCH / MCH 是否出現
- MBMS-GW 的 `sgi_mb` 是否有流量
- M1 interface 是否有 GTP-U multicast 封包

### Named Pipe / Wireshark 檢查

- `/tmp/ue.pcap.pipe` 是否存在
- pipe 權限是否正確
- Wireshark 是否先開啟 pipe
- UE 是否有權限寫入 pipe
- pcap 設定是否為 MAC-LTE
- Wireshark dissector 是否設定正確

### USRP B210 OTA 檢查

- `uhd_find_devices` 是否找到 B210
- `uhd_usrp_probe` 是否成功
- USB 3.0 是否正常
- 是否需要外接電源
- master clock rate 是否符合 LTE sampling rate
- TX/RX gain 是否合理
- CPU governor 是否固定為 `performance`
- 是否有 underrun / overrun

## 專案 Invariants 範例

| 類別 | Invariant |
| --- | --- |
| 啟動順序 | EPC -> eNB -> UE，除非特定測試要求改變 |
| eMBMS | SIB13 必須被 mapping 到 System Information |
| Wireshark | UE MAC-LTE pcap 必須先有 reader，再讓 UE 寫入 pipe |
| 網路 | UE default route 與 EPC NAT 必須一致 |
| Control Plane | 先確認 SIB13 / MCCH / PMCH，再進入 OTA |
| RF | 切換 USRP 前需先完成 ZMQ baseline |
| Agent | Agent 不可在未核准前修改核心協定邏輯 |

## 最終工作原則

每次使用 AI 前，先確認：

1. 這是架構問題、工具問題、語法問題，還是 runtime 問題？
2. 是否定義清楚 invariant？
3. 是否定義 AI 能改什麼、不能改什麼？
4. 是否要求 AI 提供 evidence？
5. 是否能 review AI 的輸出？
