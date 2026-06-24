# Lab04 Security

本 Lab 目標是在受控、授權、隔離 RF 環境中理解 false base station / UE Scanner 相關風險、UE 連線資訊觀測、DoS 影響與 5G / LTE access security。

本文件只整理已知資料、待確認項目與 future work，不代表實驗已完成。

## Safety Boundary

- 必須確認實驗合法性、授權範圍與 RF 隔離環境：NEEDS_CONFIRMATION
- 不得在未授權公共頻段或非隔離環境中執行會影響商用 UE / 網路的測試。
- 所有結果需以受控環境、測試日期、硬體版本與參數為前提。

## 核心驗證目標

- 安裝 USRP、UHD、srsGUI、UE Scanner：NEEDS_CONFIRMATION
- 啟動 EPC / eNB false base station 實驗環境：NEEDS_CONFIRMATION
- 觀測 UE 嘗試連線與識別資訊：NEEDS_CONFIRMATION
- 使用 srsGUI 觀測 PUSCH / PUCCH：NEEDS_CONFIRMATION
- 比較不同 UE Scanner 參數對 UE 行為的影響：NEEDS_CONFIRMATION
- 從安全角度整理 false base station 風險與防護重點：NEEDS_CONFIRMATION

## 系統架構

```text
[PC: EPC + eNB + UE Scanner]
   |-- srsRAN / srsLTE EPC
   |-- modified eNB / UE Scanner
   |-- srsGUI
   |-- USRP B210
   |
   | LTE RF signal
   |
[UE: Android Phone]
   |-- Cell selection / reselection
   |-- Connection attempt
   |-- Possible service disruption
```

## 待執行項目

- 實驗合法性、隔離環境與 RF 安全邊界確認：NEEDS_CONFIRMATION
- Ubuntu 22.04.1 或指定環境確認：NEEDS_CONFIRMATION
- UHD 安裝與 USRP B210 初始化：NEEDS_CONFIRMATION
- `uhd_usrp_probe` 確認硬體狀態：NEEDS_CONFIRMATION
- srsGUI 編譯與安裝：NEEDS_CONFIRMATION
- UE Scanner 編譯與預設設定檔安裝：NEEDS_CONFIRMATION
- EPC / eNB / UE Scanner 啟動：NEEDS_CONFIRMATION
- 手機端 G-NetTrack Lite 或等效工具安裝：NEEDS_CONFIRMATION
- PUSCH / PUCCH 觀測：NEEDS_CONFIRMATION
- UE Scanner 不同參數對 UE 行為的影響比較：NEEDS_CONFIRMATION
- DoS 現象與防護建議整理：NEEDS_CONFIRMATION

## 已知風險與排查方向

| 可能問題 | 判斷方式 | 處理方向 | 狀態 |
| --- | --- | --- | --- |
| USRP 被辨識成 USB2.0 Hub | `lsusb`、`dmesg --follow` | 執行 `uhd_usrp_probe` 初始化 FPGA image | NEEDS_CONFIRMATION |
| UHD 版本找不到 | package manager 顯示 package unavailable | 確認軟體源與 UHD 安裝方式 | NEEDS_CONFIRMATION |
| UE 不靠近 USRP 時不觸發連線 | 手機仍連原商用基地台 | 控制距離、降低干擾、確認實驗環境隔離 | NEEDS_CONFIRMATION |
| srsGUI 看不到物理通道 | eNB / UE Scanner 未正常送出訊號 | 先確認 EPC / eNB Log，再確認 USRP RX/TX 狀態 | NEEDS_CONFIRMATION |
| DoS 現象無法重現 | UE 沒有 camp 到實驗基地台 | 調整 cell reselection 條件與參數，並保留授權與隔離 evidence | NEEDS_CONFIRMATION |

## 重點整理

- 本實驗屬於高風險安全實驗，必須在受控、授權、隔離 RF 環境中進行。
- False base station 風險核心在於誘導 UE 選擇實驗基地台。
- UE Scanner 可用於觀測 UE 連線資訊與參數變化。
- DoS 可能來自 UE 連到無外連能力或惡意配置的基地台後，行動服務被中斷。
- PUSCH / PUCCH 可協助觀測 UE 上行控制與資料通道行為。
- 安全分析應對應到 5G access security、subscriber privacy、SUCI/SUPI、authentication 與 false base station detection。
