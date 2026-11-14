# Lab03 B210 OTA 啟動與停止步驟

[Lab03 README](README.md) · [2026-11-12 TER](../../docs/evidence/task-evidence/2026-11-12-lab03-b210-ota-baseline-split-dup.yaml) · [雙路徑工具](../../exploration/lab03-dualpath-tools/README.md)

狀態：`OBSERVED ONCE 2026-11-12 / NOT A STUDENT PROCEDURE / NO RUNTIME AUTHORIZED`

本文件記錄 2026-11-12 那一輪實測實際使用的啟動順序與命令，讓操作者下次能照同樣方式重現。
它只在那一次、那兩台主機上被觀察到可行；不是已驗收的流程，也不是學生教材。

**本文件不授權任何 Runtime 或 RF 操作。** 每一次執行都需要 Owner 另行明確核准，並符合下方的前提。

## 前提

| 項目 | 2026-11-12 的狀態 |
| --- | --- |
| 授權 | Owner 當次核准，並在現場監督 |
| 屏蔽 | 兩台 B210 的天線都在法拉第籠內，籠體關閉後才發射 |
| 主機 | Linux1：EPC＋eNB；Linux2：UE。各接一台 B210（USB 3） |
| 軟體 | Ubuntu 24.04、srsRAN_4G `6bcbd9e5`（`~/srsRAN_4G/build-usrp`）、UHD 4.6 |
| 設定檔 | `~/pre-lab03-rf/config/` 內的 `epc.conf`、`enb.conf`、`rr.conf`、`ue.conf`；本流程不修改它們 |
| 無線參數 | Band 7、EARFCN 3350（下行 2680 MHz／上行 2560 MHz）、50 PRB、PCI 1 |
| 權限 | `srsepc`、`srsenb`、`srsue` 都以 `sudo` 執行；密碼由操作者在主機上自行輸入 |

兩點說明：

- **為什麼要 `sudo`。** `srsepc` 與 `srsue` 建立 TUN 介面需要 root。`srsenb` 以一般使用者啟動時，
  當次兩次嘗試都在幾秒內崩潰。
- **為什麼要加 `--rf.tx_gain=70`。** 設定檔的發射增益是 eNB 30、UE 20。eNB 用 30 時，接收端偵測不到
  下行；50 可解出 MIB 但錯誤率高；70 時下行 SNR 約 20 dB。命令列覆寫不會改動設定檔。
  輻射功率沒有用儀器量測過，提高增益前要先確認屏蔽，並取得 Owner 核准。

Agent 不輸入或接收密碼，也不執行 `sudo`；下列需要 `sudo` 的步驟由操作者在主機上執行。

## 啟動前檢查

兩台主機各執行一次，不需要 `sudo`：

```bash
pgrep -a 'srsepc|srsenb|srsue'
```

```bash
uhd_find_devices
```

預期：第一個命令沒有輸出（沒有殘留程序）；第二個命令找到一台 B210。

## 啟動順序

每個程序各佔一個終端機，啟動後保持在前景。順序是 EPC → eNB → UE。

### 1. Linux1：EPC

```bash
sudo srsepc ~/pre-lab03-rf/config/epc.conf --hss.db_file=/etc/srsran/user_db.csv
```

預期：程序停在等待狀態；`ip -br addr` 可看到 `srs_spgw_sgi` 介面，位址 `172.16.0.1/24`。

`user_db.csv` 含用戶金鑰，不得複製到 Repo、文件或證據。

### 2. Linux1：eNB

`enb.conf` 以相對路徑引用其他設定檔，所以要先進到設定資料夾：

```bash
cd ~/pre-lab03-rf/config
```

```bash
sudo ~/srsRAN_4G/build-usrp/srsenb/src/srsenb enb.conf --rf.tx_gain=70
```

預期：eNB 終端機出現 `eNodeB started`；EPC 終端機出現 S1 Setup 的訊息。

### 3. Linux2：UE

```bash
sudo ~/srsRAN_4G/build-usrp/srsue/src/srsue ~/pre-lab03-rf/config/ue.conf --rf.tx_gain=70
```

預期：幾秒內出現 `Network attach successful`，並顯示 UE 取得的 IP（當次為 `172.16.0.2`）。
當次在成功之前出現過一次隨機存取回應未收到的訊息，之後自行重試成功。

## 確認連線

在 Linux2 另開一個終端機，不需要 `sudo`：

```bash
ip -br addr show tun_srsue
```

```bash
ping -c 10 -I tun_srsue 172.16.0.1
```

當次觀察：`tun_srsue` 為 `172.16.0.2/24`；10 個封包 0% 遺失，平均約 23 ms。

連線確認後，Baseline／Split／Duplication 的量測方式見
[雙路徑工具的 README](../../exploration/lab03-dualpath-tools/README.md)。

## 停止

依 UE → eNB → EPC 的順序，在各自的終端機按 `Ctrl+C`，等程序自行結束。
當次只記錄到 UE 先送出 detach 後停止；eNB 與 EPC 之間的先後是建議順序，沒有個別記錄。

停止後兩台各確認一次：

```bash
pgrep -a 'srsepc|srsenb|srsue'
```

```bash
ip -br addr
```

預期：沒有殘留程序；`tun_srsue` 與 `srs_spgw_sgi` 都已消失。

## 沒有 Attach 時

| 現象 | 當次的觀察 | 先檢查 |
| --- | --- | --- |
| UE 一直找不到 cell | eNB 發射增益 30 時下行未被偵測 | eNB 命令列是否帶了 `--rf.tx_gain=70`；天線與籠體 |
| `srsenb` 啟動後幾秒崩潰 | 以一般使用者啟動時發生 | 是否以 `sudo` 啟動 |
| eNB 沒有連上 EPC | — | EPC 是否先啟動且仍在執行 |

## 限制

- 只有一次成功的觀察，沒有重複試次；Owner 驗收 `PENDING`。
- 主機未做 NTP 同步，CPU governor 為 `powersave`；延遲數字不代表效能。
- 環境不是教材的 Ubuntu 16.04／nukxURLLC；本流程只涵蓋 OTA Attach，不涵蓋 PDCP 層的 Split／Duplication。
- 發射增益 70 是否寫入設定檔尚未決定。
