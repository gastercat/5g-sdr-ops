# Lab01 Recovery Checklist

本 checklist 用於 Lab01 啟動失敗、Attach 失敗、封包不通或 Wireshark 看不到封包時的分層排查。

## Process

- EPC process 是否存在：NEEDS_CONFIRMATION
- eNB process 是否存在：NEEDS_CONFIRMATION
- UE process 是否存在：NEEDS_CONFIRMATION
- 啟動順序是否為 EPC -> eNB -> UE：NEEDS_CONFIRMATION

## Interface

- EPC / eNB 端實體或虛擬介面是否存在：NEEDS_CONFIRMATION
- UE 端 `tun_srsue` 是否存在：NEEDS_CONFIRMATION
- ZeroMQ RF sample path 是否使用一致參數：NEEDS_CONFIRMATION

## IP / Route

- UE 是否取得 `172.16.0.x`：NEEDS_CONFIRMATION
- UE default route 是否正確：NEEDS_CONFIRMATION
- EPC NAT 是否正確：NEEDS_CONFIRMATION
- SGi 對外介面是否正確：NEEDS_CONFIRMATION

## Log

- EPC 是否顯示 MME / HSS / S-GW / P-GW 啟動成功：NEEDS_CONFIRMATION
- eNB 是否完成 S1 Setup：NEEDS_CONFIRMATION
- UE 是否完成 Attach：NEEDS_CONFIRMATION
- Log 是否有 RF、ZMQ、route 或 auth 錯誤：NEEDS_CONFIRMATION

## Packet

- S1-MME 是否有控制面封包：NEEDS_CONFIRMATION
- S1-U 是否有 GTP-U 封包：NEEDS_CONFIRMATION
- SGi 是否有 NAT 後封包：NEEDS_CONFIRMATION
- Wireshark 擷取介面是否正確：NEEDS_CONFIRMATION

## Decision

- 若 process 未啟動，先修啟動流程。
- 若 interface 不存在，先修介面與裝置層。
- 若 IP / route 錯誤，先修路由與 NAT。
- 若 Log 顯示協定錯誤，再檢查設定檔與版本差異。
- 若封包未出現在預期介面，先確認擷取位置，不要直接改設定檔。
