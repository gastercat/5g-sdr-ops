# Lab01 Runbook

本 runbook 整理 Lab01 的啟動與觀測流程。實際環境參數需依本機設定確認，未驗證項目標記 `NEEDS_CONFIRMATION`。

## 啟動順序

建議固定啟動順序：

```text
EPC -> eNB -> UE
```

需要確認：

- EPC 是否成功啟動 MME / HSS / S-GW / P-GW：NEEDS_CONFIRMATION
- eNB 是否完成 S1 Setup：NEEDS_CONFIRMATION
- UE 是否完成 Attach：NEEDS_CONFIRMATION
- UE 是否取得 `tun_srsue`：NEEDS_CONFIRMATION
- UE 是否取得 `172.16.0.x` IP：NEEDS_CONFIRMATION
- EPC 是否有正確 NAT / route：NEEDS_CONFIRMATION

## 最小檢查流程

1. 確認 process 是否啟動。
2. 確認 interface 是否存在。
3. 確認 IP / route 是否正確。
4. 檢查 EPC / eNB / UE Log。
5. 確認封包是否出現在正確介面。
6. 確認協定狀態是否符合預期。
7. 必要時再檢查設定檔是否被 parser 正確讀入。

## 封包觀測

| 介面或位置 | 觀測內容 | 狀態 |
| --- | --- | --- |
| S1-MME | S1 Setup、Attach、NAS | NEEDS_CONFIRMATION |
| S1-U | GTP-U 使用者面封包 | NEEDS_CONFIRMATION |
| SGi | NAT 後 IP 封包 | NEEDS_CONFIRMATION |
| UE | `tun_srsue` 與應用流量 | NEEDS_CONFIRMATION |

## 結果紀錄模板

| 測試 | 指令或工具 | 預期結果 | 實際結果 |
| --- | --- | --- | --- |
| Attach | EPC / eNB / UE Log | UE attach success | NEEDS_CONFIRMATION |
| IP 分配 | `ip addr` | `tun_srsue` 有 `172.16.0.x` | NEEDS_CONFIRMATION |
| Downlink ICMP | `ping` | 封包可通 | NEEDS_CONFIRMATION |
| Uplink ICMP | `ping` | 封包可通 | NEEDS_CONFIRMATION |
| TCP / throughput | `iperf` | 有吞吐量數據 | NEEDS_CONFIRMATION |
| Packet capture | Wireshark | 可觀測 S1-MME / S1-U / SGi | NEEDS_CONFIRMATION |
