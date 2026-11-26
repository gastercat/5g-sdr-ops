# GNSS-SDR 接收實驗計畫（草案）

[Exploration 入口](../README.md) · [期限感知的雙路徑傳送策略](../ai-dualpath/README.md) ·
[6G／LEO／NTN Research Parking](../../docs/research/6g-ntn-handover/README.md) ·
[Hardware Notes](../../docs/hardware-notes.md) · [Decision Register](../../docs/decision-register.md)

狀態：`EXPLORATION / PLANNING_ONLY / NOT_STARTED / OWNER_DECISION_REQUIRED`

本文件整理以開源 [GNSS-SDR](https://gnss-sdr.org/) 搭配現有 USRP B210 接收 GPS L1 C/A 並完成定位所需補足的
項目、分階段做法與停止條件，供 Owner 審閱與決定是否立項。

- 它**不授權**任何 Runtime、RF、安裝、採購或網路操作，也不是已執行事項的證據；文中指令與設定都沒有在
  實驗主機上執行過。
- 它不形成 Lab01～03 或 Security 的交付條件，不屬於
  [DR-015](../../docs/decision-register.md#dr-015track-b-physical-rf-transition-成為目前主要工程優先事項)
  的 Track B 範圍，也不改變目前的工程優先順序。
- 每一階段的執行仍需當次的 Owner 授權，並符合
  [Remote Agent Policy](../../docs/engineering/CODEX_REMOTE_AGENT_POLICY.md) 與
  [Configuration Governance](../../docs/engineering/CONFIGURATION_GOVERNANCE.md)。
  Agent 不輸入密碼、不執行 `sudo`；需要 `sudo` 的步驟由操作者在主機上執行。

## 1. 範圍

| 項目 | 本計畫包含 | 本計畫不包含 |
| --- | --- | --- |
| 訊號 | GPS L1 C/A **接收** | 任何 GNSS 頻段的發射、GNSS 訊號模擬的空中播送、干擾或欺騙（spoofing） |
| 軟體 | GNSS-SDR 離線處理錄製檔、即時接收與定位（PVT） | 修改 GNSS-SDR 原始碼、多星系或多頻段接收 |
| 硬體 | 現有 USRP B210、新增 L1 主動天線與饋電配件 | 變更 srsRAN 使用中的 B210 設定或韌體 |
| 與其他工作的關係 | 第 2 節列出的候選用途，需 Owner 選定 | 自動併入 Lab03、ai-dualpath 或 NTN 研究的交付或結論 |

## 2. 為什麼要做（候選用途，待 Owner 選定）

立項前需先決定 GNSS 在本專案的用途；用途決定需要做到哪一個階段。

| 代號 | 用途 | 需要做到 | 備註 |
| --- | --- | --- | --- |
| U1 | SDR 接收鏈教學：擷取、追蹤、導航訊息解碼、定位 | 階段 3 | 與 LTE 實驗互補，只接收、風險較低 |
| U2 | 提供共同時間基準，讓 Linux1／Linux2 量測單向延遲 | 階段 3，另需時間同步方案 | ai-dualpath 的 DART 類策略需要單向延遲；GNSS-SDR 的定位輸出是否足以做主機時間同步為 `NEEDS_CONFIRMATION`，較常見的做法是 GPSDO 或帶 PPS 的 GNSS 模組 |
| U3 | 支撐 6G／NTN 研究的背景 | 階段 1～3 | NTN 終端利用 GNSS 位置與時間做延遲、都卜勒預補償屬 `NEEDS_CONFIRMATION`，引用前需查核 3GPP 原文 |

## 3. 現況與缺口

標示：`KNOWN` 為 Repo 內有紀錄；`NEEDS_CONFIRMATION` 為需要盤點或查核；`GAP` 為目前確定沒有。

### 3.1 硬體

| 項目 | 狀態 | 說明 |
| --- | --- | --- |
| RF 前端 | `KNOWN` | 已有兩台 USRP B210。B210 內建 AD9361，接收 1.5 GHz 不需要另加子板（[GNSS-SDR 設定說明](https://gnss-sdr.org/conf/)） |
| L1 主動天線 | `GAP` | 現有天線用於 LTE 頻段。需要可接 SMA 的 GPS L1 主動天線 |
| 天線饋電 | `GAP` | USRP 的 RF 埠沒有內建 bias tee。需在天線線上加 bias-T，並依天線規格提供直流電源（通常 3 V 或 5 V） |
| 輸入保護 | `GAP` | 任何 RF 輸入不得超過 -15 dBm。以同軸線接訊號產生器時需加衰減器 |
| 同軸線與轉接頭 | `NEEDS_CONFIRMATION` | 天線需拉到可見天空處；長度與 1.5 GHz 損耗依場地決定 |
| GPSDO | 選配 | 定位本身不需要；只有選定 U2 且決定以 GPSDO 提供時間基準時才需評估。Ettus 的 5 V GPS 天線是給板載 GPSDO 使用，不是接在 RX 埠 |

### 3.2 場地與設備排程

| 項目 | 狀態 | 說明 |
| --- | --- | --- |
| 天空可見度 | `GAP` | 兩台 B210 目前在法拉第籠內使用。GNSS 天線需要看得到天空，籠內無法收到衛星 |
| B210 佔用 | `KNOWN` | UE 或 eNB 執行時佔用 B210，期間無法同時擷取 GNSS。需排定時段，或使用另一台 SDR |

### 3.3 軟體

| 項目 | 狀態 | 說明 |
| --- | --- | --- |
| GNSS-SDR 與相依套件 | `GAP` | 需要 GNU Radio（含 Boost、FFTW、VOLK）、Armadillo、Abseil、matio、PugiXML、Protocol Buffers 與一個 SSL 函式庫；USRP 經由 UHD 使用（[需求說明](https://gnss-sdr.org/requirements/)） |
| 實驗主機的 UHD | `NEEDS_CONFIRMATION` | Repo 沒有記錄兩台主機 UHD 的版本與安裝方式。Lab01 使用 ZeroMQ，手冊註明不需要 UHD；Lab03 已用 B210，表示主機上有某個版本的 UHD |
| 與 srsRAN 環境的相容性 | `NEEDS_CONFIRMATION` | 以套件管理器安裝 GNSS-SDR 可能帶入第二套 UHD，影響已驗證的 srsRAN 環境。安裝位置與方式需在階段 1 決定 |
| 電腦效能 | 低風險 | 官方說明簡單設定下一般現代筆電即可即時處理；跟不上時可改處理錄製檔 |

### 3.4 治理

| 項目 | 狀態 | 說明 |
| --- | --- | --- |
| 立項決策 | `GAP` | 需要 Owner 決定是否立項、選定用途與可執行階段；建議記入 Decision Register |
| 執行授權 | `GAP` | 接收也屬 RF 操作；每次執行需當次授權，並建立 TER |
| 安裝授權 | `GAP` | 在實驗主機安裝軟體屬持續性系統變更，需另行授權 |

## 4. 分階段計畫

每個階段結束時停下，由 Owner 決定是否進入下一階段。

### 階段 0：離線首次定位（不需要硬體）

- 在**非實驗主機**（個人電腦、VM 或容器）安裝 GNSS-SDR。
- 依官方 [My first position fix](https://gnss-sdr.org/my-first-fix/) 處理公開錄製檔，得到定位輸出。
- 產出：環境版本、使用的設定檔與輸出摘要。
- 完成判準：錄製檔處理後產生定位結果。

### 階段 1：盤點（唯讀）

- 在實驗主機唯讀查詢 UHD 版本、安裝來源與 B210 韌體版本；不安裝、不變更。
- 確認場地：可見天空的位置、到 B210 的線長、電源。
- 決定安裝方案：專用電腦、隔離環境（容器或獨立 prefix），或直接安裝在實驗主機。
- 產出：盤點紀錄與建議方案，交 Owner 決定。

### 階段 2：採購與接線準備

- 依階段 1 結果列出規格：L1 主動天線、bias-T、電源、同軸線、轉接頭、衰減器。
- 採購由 Owner 或指定負責人決定與執行。
- 完成判準：配件到齊，接線圖經 Human Review。

### 階段 3：即時接收與定位（需 RF 授權）

- 前提：Owner 當次授權；B210 未被 srsRAN 使用；天線位於可見天空處並已供電。
- 以 GNSS-SDR 的 USRP 範例設定為起點：GPS L1 C/A、4 MS/s 取樣，增益依實測調整。
- 紀錄：開始與結束時間、設定檔、可見衛星數、首次定位時間、定位輸出摘要。
- 完成判準：取得定位結果，並建立 TER。單次成功只標示為 `OBSERVED`，不代表定位精度或穩定性已驗證。

### 階段 4：依用途延伸（另行規劃）

- U1：整理為學生可重現的流程。
- U2：評估以 GNSS 或 GPSDO 提供兩台主機的共同時間基準，再決定是否用於單向延遲量測。
- U3：查核 3GPP NTN 文件，把 GNSS 相關假設寫入 Research Parking。

## 5. 安全與停止條件

- 只接收。不得以空中方式發射任何 GNSS 頻段訊號；訊號模擬只能以同軸線直連並加衰減。
- RF 輸入不得超過 -15 dBm；不確定訊號強度時先加衰減。
- bias-T 的電壓依天線規格設定；不得把直流電壓直接送進 B210 的 RF 埠。
- 不得變更 srsRAN 使用中的設定、UHD 版本或 B210 韌體；安裝造成相依套件衝突時停止並回報。
- B210 正被 srsRAN 使用時，不得啟動 GNSS 擷取。
- 任一前提不成立、出現未預期的系統變更或硬體異常時，停止並回報 Owner。

## 6. 需要 Owner 決定的事項

1. 是否立項，以及選定第 2 節的哪一個用途。
2. 可執行到哪一個階段。
3. 軟體安裝位置：專用電腦、隔離環境或實驗主機。
4. 採購負責人與預算。
5. 天線擺放位置與 B210 的使用時段。

## 7. 參考資料

- [GNSS-SDR Requirements](https://gnss-sdr.org/requirements/)：作業系統、相依套件、RF 前端與天線需求。
- [GNSS-SDR Configuration（GPS L1 C/A receiver using a USRP）](https://gnss-sdr.org/conf/)：USRP 範例設定、天線饋電、輸入功率上限。
- [GNSS-SDR My first position fix](https://gnss-sdr.org/my-first-fix/)：以錄製檔完成首次定位。
- [USRP-users 郵件列表：USRP RF 埠沒有內建 bias tee](https://go.mail-archive.com/usrp-users@lists.ettus.com/msg16480.html)。
- [Ettus 5-Volt Active GPS Antenna](https://www.ettus.com/all-products/GPS-ANT-5V/)：用於板載 GPSDO 的天線。
