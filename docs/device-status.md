# Device Status

本文件用於整理設備判斷與狀態追蹤。以下狀態來自來源筆記的分類與檢查方向，未經本 repo 實機確認者一律標記 `NEEDS_CONFIRMATION`。

## 設備角色判斷

| 類別 | 可能設備 | 角色 | 狀態 |
| --- | --- | --- | --- |
| SDR / RF Front-end | USRP B210、X310、X410、N310 | RF 發射、接收、I/Q data 轉換 | NEEDS_CONFIRMATION |
| Linux Host | PC、Mini PC、Jetson、Raspberry Pi | Core Network、BBU、協定疊執行環境 | NEEDS_CONFIRMATION |
| Network | Ethernet NIC、Switch、Router | Fronthaul / Backhaul / 實驗網路連接 | NEEDS_CONFIRMATION |
| UE | Android Phone、srsUE、SDR UE | 連線、Attach、流量與封包觀測 | NEEDS_CONFIRMATION |

## 需要確認的硬體狀態

- USRP 是否可由 `uhd_find_devices` 偵測：NEEDS_CONFIRMATION
- USRP 是否可由 `uhd_usrp_probe` 成功 probe：NEEDS_CONFIRMATION
- USB 3.0 或指定高速介面是否正常：NEEDS_CONFIRMATION
- Linux Host 的 CPU / RAM / disk 是否符合實驗需求：NEEDS_CONFIRMATION
- 網路介面名稱、速率、duplex、driver 是否正確：NEEDS_CONFIRMATION
- UE 或 Android Phone 是否支援目標 LTE / NR band：NEEDS_CONFIRMATION
- SDR TX/RX gain、clock、取樣率、外接供電需求是否已確認：NEEDS_CONFIRMATION

## 檢查紀錄模板

| 日期 | 設備 | 指令或觀測方式 | 結果 | Evidence |
| --- | --- | --- | --- | --- |
| TBD | USRP B210 | `uhd_find_devices` | NEEDS_CONFIRMATION | TBD |
| TBD | USRP B210 | `uhd_usrp_probe` | NEEDS_CONFIRMATION | TBD |
| TBD | Linux Host | `lscpu`、`free -h`、`df -h` | NEEDS_CONFIRMATION | TBD |
| TBD | Network Interface | `ip addr`、`ethtool <interface>` | NEEDS_CONFIRMATION | TBD |
| TBD | UE | 工程模式或測試 App | NEEDS_CONFIRMATION | TBD |
