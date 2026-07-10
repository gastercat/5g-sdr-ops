# 5G SDR Lab01 回復盤點稽核

## 日期與範圍

- 稽核日期：2026-07-10
- 範圍：對 Linux1（EPC + eNB）與 Linux2（UE）的 `/etc/srsran` 進行唯讀檢查。
- 目的：識別可能需要在日後經核准後回復至權威 Lab01 基線的 Lab02 eMBMS 設定證據。

## 稽核方法

稽核人員使用互動式 SSH 驗證連線，且僅使用非變更性的盤點、中繼資料、雜湊與目標文字搜尋命令。設定檔未複製至此儲存庫；僅記錄擷取的證據與 SHA-256 摘要。`user_db.csv` 未被讀取或雜湊。

## 安全邊界

未使用 `sudo` 命令。未變更任何遠端檔案、服務、路由、防火牆、介面、NetworkManager、執行階段程序或 SDR/RF 狀態。本文件未記錄密碼、訂閱者資料、私密金鑰或設定檔內容。

## 主機角色

- Linux1 — EPC 與 eNB 設定主機。
- Linux2 — UE 設定主機。

## 回復檢查清單 v0.1.1

### 已確認

- Linux1 的 `enb.conf` 選用 `sib_config = /etc/srsran/sib.conf.mbsfn`。
- Linux1 有啟用中的 `[embms]` 區段，並設定 `enable = true`；其啟用中的 M1-U 值為 `239.255.0.1` 與 `127.0.1.1`。
- Linux1 的 `sib.conf.mbsfn` 存在，且含有 SIB13 與 MBSFN 參照。
- Linux1 的 `mbms.conf` 存在，且含有啟用中的 `sgi_mb` 與 M1-U 參照。
- Linux1 scheduler 具有啟用中的覆寫值：`pusch_max_mcs = 16`、`min_nof_ctrl_symbols = 2` 與 `max_nof_ctrl_symbols = 2`。
- Linux1 的 `[expert]` 中有 `nof_phy_threads = 1`。
- Linux2 有啟用中的 `mbms_service_id = 0` 與 `mbms_service_port = 4321`。
- Linux2 啟用 MAC 封包擷取（`enable = mac`）。
- Linux2 的 `ue.conf` 未含 `pipe` 或 `named` 參照。
- Linux2 有啟用中的 PHY 值：`snr_estim_alg = empty`、`nof_phy_threads = 1` 與 `interpolate_subframe_enabled = true`。

### 已確認的 LAB02 殘留

- Linux1 啟用中的 eMBMS 與 M1-U multicast 設定。
- Linux1 啟用中的 MBSFN SIB 設定選擇，該設定包含 SIB13/MBSFN 設定。
- Linux1 含有 `sgi_mb` 與 M1-U 參照的 MBMS-GW 設定。
- Linux2 啟用中的 MBMS service ID 與 service port。

### LAB01 元件 — 非殘留

- ZeroMQ 是 Lab01 基線元件，而非 Lab02 殘留。
- Linux1 啟用中的 RF 傳輸為 `device_name = zmq`，含 eNB 識別字與 TCP 連接埠 2000/2001。
- Linux2 啟用中的 RF 傳輸為 `device_name = zmq`，含 UE 識別字與 TCP 連接埠 2001/2000。

### 待確認

- 依預期的 Lab01 拓撲（`192.168.250.11` 與 `192.168.250.12`）確認 Linux1 與 Linux2 的 ZeroMQ 對等位址。
- 確認 Lab01 基線所需的 ZeroMQ TX/RX 連接埠方向。
- 在將任何 scheduler、expert 與 UE PHY 覆寫值分類為回復項目之前，先與權威 Lab01 基線比較。
- 決定 Linux2 的 MAC PCAP 是否保留於 Lab01 作業設定檔中。

### 未知

- 未提供權威 Lab01 基線設定與變更歷程；僅憑本稽核無法證實 scheduler、expert 與 PHY 覆寫值的原始用途。
- 主機上存在檔案本身，無法證實該檔案正由執行中的程序選用。

### 延後處理

尚未嘗試任何回復或設定變更。日後的任何變更都需要明確核准、備份、已審閱的 diff、回復計畫與驗證計畫。

## 證據摘要

- 兩台主機皆提供 `/etc/srsran` 設定樹；檔案中繼資料與選定的非敏感雜湊記錄於配套稽核文件。
- `epc.conf` 未含符合 eMBMS、MBMS、MBSFN、SIB13、M1-U、SGi-mb、ZeroMQ 或 device-argument 的搜尋項目。
- Linux1 的 `sib.conf` 也含有 SIB13/MBSFN 參照，但啟用中的目標為 `sib.conf.mbsfn`。
- 本次稽核未變更任何遠端系統狀態。
