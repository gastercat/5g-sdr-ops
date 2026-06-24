# Lab01 Small Cell

本 Lab 目標是建立開源 LTE/5G SDR 小基站實驗平台，包含 EPC、eNB、UE、ZeroMQ 無線電模擬通道與 Linux NAT 外連環境。

## 核心驗證目標

以下項目來自來源筆記，尚未由本 repo 實機確認：

- EPC / eNB / UE 可正常啟動與 Attach：NEEDS_CONFIRMATION
- UE 可取得 `tun_srsue` IP：NEEDS_CONFIRMATION
- Downlink / Uplink ICMP 與 TCP 可通：NEEDS_CONFIRMATION
- UE 可透過 NAT 連外：NEEDS_CONFIRMATION
- Wireshark 可觀測 S1-MME、S1-U、SGi 封包：NEEDS_CONFIRMATION

## 系統架構

```text
Internet
   |
[PC1: EPC + eNB]
   |-- srsEPC: MME / HSS / S-GW / P-GW
   |-- srseNB
   |-- SGi + NAT
   |
   | ZeroMQ full-duplex RF sample path
   |
[PC2: UE]
   |-- srsUE
   |-- tun_srsue
   |
UE Application / iperf / ping
```

## 角色分工類型

| 角色 | 負責項目 |
| --- | --- |
| 成員 1 | RF / ZeroMQ 參數、PHY 資源設定、效能觀測、`htop` 監控 |
| 成員 2 | Ubuntu、srsRAN_4G / srsLTE 編譯、路由、NAT、設定檔除錯 |
| 成員 3 | Wireshark、S1AP / NAS / GTP-U 封包截圖、實驗紀錄與結果整理 |

## 重點整理

- srsLTE / srsRAN 小基站平台可拆成 EPC、eNB、UE 三個主要元件。
- ZeroMQ 在本實驗中扮演 RF sample transport，不是真正空口，但可降低 SDR 硬體需求。
- `tun_srsue` 是 UE 側應用層通往核心網路的 L3 入口。
- S1-MME 主要觀測控制面，如 S1 Setup、Attach、NAS。
- S1-U / SGi 主要觀測使用者平面，如 GTP-U 與 NAT 後的 IP 封包。
- 除錯應優先看 Log 與封包流向，不直接修改設定檔。
