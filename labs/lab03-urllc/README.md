# Lab03 URLLC / PRP

本 Lab 目標是建立支援 uRLLC 的雙路徑傳輸實驗環境，驗證 Split Mode 與 Duplication Mode 對封包可靠度與延遲的影響。

本文件只整理已知資料、待確認項目與 future work，不代表實驗已完成。

## 核心驗證目標

- 建立 EPC / eNB 與 UE 雙主機環境：NEEDS_CONFIRMATION
- 建立 LTE / SDR 路徑與額外 Ethernet / Switch 路徑：NEEDS_CONFIRMATION
- 啟用 Split Mode 觀測分流：NEEDS_CONFIRMATION
- 啟用 Duplication Mode 觀測重複傳輸：NEEDS_CONFIRMATION
- 量測 PRP 對 packet loss、latency、jitter 的影響：NEEDS_CONFIRMATION

## 系統架構

```text
[Machine 1: EPC + eNB]
   |-- srsEPC
   |-- srseNB
   |-- USRP B210
   |-- NIC1 / NIC2
   |
   | Path A: LTE SDR path
   | Path B: Ethernet / Switch redundant path
   |
[Machine 2: UE]
   |-- srsUE
   |-- USRP B210
   |-- tun_srsue
   |-- PRP / Split / Duplication logic
   |
Application traffic
```

## 待執行項目

- Ubuntu 16.04 / lowlatency kernel 或相容替代環境確認：NEEDS_CONFIRMATION
- UHD / USRP B210 初始化：NEEDS_CONFIRMATION
- `nukxURLLC` clone、build、install：NEEDS_CONFIRMATION
- `common.h` 中 NUK / NUK_UE define 設定：NEEDS_CONFIRMATION
- EPC / eNB / UE 基本 attach 測試：NEEDS_CONFIRMATION
- UE proxy IP address 設定：NEEDS_CONFIRMATION
- Split Mode 啟動與封包路徑觀測：NEEDS_CONFIRMATION
- Duplication Mode 啟動與封包重複情況觀測：NEEDS_CONFIRMATION
- PRP 對 latency / reliability 的量測表：NEEDS_CONFIRMATION
- 與 Lab01 基礎平台差異整理：NEEDS_CONFIRMATION

## 已知風險與排查方向

| 可能問題 | 判斷方式 | 處理方向 | 狀態 |
| --- | --- | --- | --- |
| USRP B210 無法被偵測 | `uhd_find_devices`、`uhd_usrp_probe` | 檢查 USB3、UHD image、權限與外接供電 | NEEDS_CONFIRMATION |
| lowlatency kernel 不相容 | `uname -r`、開機選單 | 固定 kernel 版本或改用可重現的相容環境 | NEEDS_CONFIRMATION |
| Split Mode 沒有分流 | Wireshark 比對兩條路徑 | 檢查 proxy IP、route table、split mode 參數 | NEEDS_CONFIRMATION |
| Duplication Mode 沒有重複封包 | 同一 flow 是否出現在兩條路徑 | 檢查 duplication enable、PRP / 應用層封包複製邏輯 | NEEDS_CONFIRMATION |
| 延遲數據不穩 | 多次量測差異過大 | 固定 CPU governor、關閉背景程式、記錄 `htop` 與 RF 狀態 | NEEDS_CONFIRMATION |

## 重點整理

- uRLLC 的核心不是只追求高吞吐，而是低延遲、高可靠與低抖動。
- Split Mode 偏向資源分流；Duplication Mode 偏向可靠度提升。
- PRP 的價值在於多路徑冗餘，但代價是頻寬消耗增加。
- 量測時應同時記錄 latency、packet loss、jitter 與 CPU 負載。
- 除錯順序應為硬體偵測 -> 介面 IP -> route -> srsLTE attach -> mode 行為 -> 效能量測。
