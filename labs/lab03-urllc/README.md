# Lab03 URLLC / PRP

[Delivery 入口](../../delivery/README.md) · [目前進度](../../PROGRESS.md)

## Delivery intent 與缺口

狀態：`OTA BASELINE OBSERVED ONCE / SPLIT・DUPLICATION APPLICATION-LAYER ONLY / STUDENT PROCEDURE PENDING / NO NEW RUNTIME AUTHORIZED`

教學方向是觀察 baseline、Split Mode、Duplication Mode，並比較 reliability／latency
trade-off。現有文件仍缺可重現學生流程、最小比較結果與已核准 acceptance criteria；
uRLLC 名稱不構成完整 3GPP-grade URLLC system validation 的要求或成果聲明。

## 2026-11-12 實測摘要

Owner 於當次授權並現場監督的一輪 B210／OTA 實測。來源、分工與限制見 [2026-11-12 TER](../../docs/evidence/task-evidence/2026-11-12-lab03-b210-ota-baseline-split-dup.yaml)；
原始證據在 Repo 外。以下為單一試次的觀察，Owner 驗收 `PENDING`。

| 項目 | 觀察 | 限制 |
| --- | --- | --- |
| 環境 | 兩台 Ubuntu 24.04、srsRAN_4G `6bcbd9e5`、UHD 4.6、各一台 B210（USB 3）；天線置於法拉第籠內 | 不是教材的 Ubuntu 16.04／nukxURLLC 環境；兩台主機沒有 nukxURLLC |
| 下行與發射增益 | eNB `tx_gain=30` 時接收端未偵測到 LTE 下行；命令列改 50 可解 MIB，70 時下行 SNR 約 20 dB | 未以儀器量測輻射功率；設定檔仍為 eNB 30／UE 20 |
| OTA Baseline | eNB 與 UE 皆以命令列用發射增益 70 時 Attach 成功一次；雙向 ICMP 0% loss；UDP 1000／1000，來回延遲中位數約 18 ms | 來回時間而非單向；約 20 秒、低速率 |
| Split（2:3） | 路徑 A（OTA）400／400、路徑 B（有線）600／600，兩組 Packet ID 互斥、合計 1000 | 應用層 UDP 分流，不是 PDCP 層 |
| Duplication | 兩路徑各 1000／1000；以 Packet ID 去重後唯一 ID 1000、重複副本 1000；每個 ID 取較短 RTT 後的中位數 0.23 ms | 應用層複製；未注入路徑劣化，可靠度效益未展示 |

路徑 B 為兩台主機之間的有線管理網段。上述結果不是 performance、reliability 或 URLLC
validation，也不授權新的 Runtime 或 RF 執行。

當次使用的啟動順序、命令與停止方式記錄在 [啟動與停止步驟](runbook.md)；它是單次觀察的紀錄，
不是已驗收的學生流程。

## 歷史技術目標與待確認筆記

以下保留舊版硬體／軟體與量測方向；版本相容性及哪些項目納入最小實驗仍待另行裁定。
標有 `OBSERVED 2026-11-12` 的項目僅指上表的單次觀察。
本次不將它們標為已完成或自動變成學生必做清單。

本 Lab 目標是建立支援 uRLLC 的雙路徑傳輸實驗環境，驗證 Split Mode 與 Duplication Mode 對封包可靠度與延遲的影響。

本文件整理已知資料、單次實測觀察、待確認項目與 future work，不代表實驗已完成或已驗收。

### 核心驗證目標

- 建立 EPC / eNB 與 UE 雙主機環境：OBSERVED 2026-11-12（B210 OTA Attach 一次）
- 建立 LTE / SDR 路徑與額外 Ethernet / Switch 路徑：OBSERVED 2026-11-12（有線管理網段作為第二路徑）
- 啟用 Split Mode 觀測分流：應用層 OBSERVED 2026-11-12；PDCP 層 NEEDS_CONFIRMATION
- 啟用 Duplication Mode 觀測重複傳輸：應用層 OBSERVED 2026-11-12；PDCP 層 NEEDS_CONFIRMATION
- 量測 PRP 對 packet loss、latency、jitter 的影響：單次無劣化量測已保存；劣化條件下的影響 NEEDS_CONFIRMATION

### 系統架構

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

### 待執行項目

- Ubuntu 16.04 / lowlatency kernel 或相容替代環境確認：Ubuntu 24.04＋srsRAN_4G 可完成 OTA Attach（OBSERVED 2026-11-12）；是否採為 Lab03 環境 NEEDS_CONFIRMATION
- UHD / USRP B210 初始化：OBSERVED 2026-11-12
- `nukxURLLC` clone、build、install：NEEDS_CONFIRMATION
- `common.h` 中 NUK / NUK_UE define 設定：NEEDS_CONFIRMATION
- EPC / eNB / UE 基本 attach 測試：OBSERVED 2026-11-12（發射增益以命令列用 70）
- UE proxy IP address 設定：NEEDS_CONFIRMATION
- Split Mode 啟動與封包路徑觀測：應用層 OBSERVED 2026-11-12；nukxURLLC 版本 NEEDS_CONFIRMATION
- Duplication Mode 啟動與封包重複情況觀測：應用層 OBSERVED 2026-11-12；nukxURLLC 版本 NEEDS_CONFIRMATION
- PRP 對 latency / reliability 的量測表：NEEDS_CONFIRMATION
- 與 Lab01 基礎平台差異整理：NEEDS_CONFIRMATION

### 已知風險與排查方向

| 可能問題 | 判斷方式 | 處理方向 | 狀態 |
| --- | --- | --- | --- |
| USRP B210 無法被偵測 | `uhd_find_devices`、`uhd_usrp_probe` | 檢查 USB3、UHD image、權限與外接供電 | NEEDS_CONFIRMATION |
| lowlatency kernel 不相容 | `uname -r`、開機選單 | 固定 kernel 版本或改用可重現的相容環境 | NEEDS_CONFIRMATION |
| Split Mode 沒有分流 | Wireshark 比對兩條路徑 | 檢查 proxy IP、route table、split mode 參數 | NEEDS_CONFIRMATION |
| Duplication Mode 沒有重複封包 | 同一 flow 是否出現在兩條路徑 | 檢查 duplication enable、PRP / 應用層封包複製邏輯 | NEEDS_CONFIRMATION |
| UE 找不到 cell 或無法 Attach | 接收端唯收解碼的 SNR；比對 eNB／UE 發射增益 | 2026-11-12 觀察到 `tx_gain=30` 時下行未被偵測；調整增益需 Owner 核准並在屏蔽環境內進行 | OBSERVED 2026-11-12 |
| 延遲數據不穩 | 多次量測差異過大 | 固定 CPU governor、關閉背景程式、記錄 `htop` 與 RF 狀態 | NEEDS_CONFIRMATION |

### 重點整理

- uRLLC 的核心不是只追求高吞吐，而是低延遲、高可靠與低抖動。
- Split Mode 偏向資源分流；Duplication Mode 偏向可靠度提升。
- PRP 的價值在於多路徑冗餘，但代價是頻寬消耗增加。
- 量測時應同時記錄 latency、packet loss、jitter 與 CPU 負載。
- 除錯順序應為硬體偵測 -> 介面 IP -> route -> srsLTE attach -> mode 行為 -> 效能量測。
