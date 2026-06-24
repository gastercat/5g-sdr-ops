# Lab02 eMBB / eMBMS

本 Lab 目標是在 Lab01 基礎平台上加入 eMBMS / MBMS-GW，建立 multicast / broadcast 行動寬頻應用，並觀測控制面與使用者平面的資源配置。

本文件只整理已知資料與待確認項目，不代表實驗已完成。

## 核心驗證目標

- MBMS-GW、EPC、eNB、UE 可依序啟動：NEEDS_CONFIRMATION
- eNB 正確載入 `sib.conf.mbsfn`：NEEDS_CONFIRMATION
- SIB13 可被送入 System Information：NEEDS_CONFIRMATION
- UE 可接收 eMBMS 相關 MAC-LTE 封包：NEEDS_CONFIRMATION
- 可觀測 MCCH、MTCH、MCH 資源配置：NEEDS_CONFIRMATION
- 可使用 FFmpeg / FFplay 驗證 IPTV multicast 應用：NEEDS_CONFIRMATION

## 系統架構

```text
[PC1: EPC + eNB + MBMS-GW + BM-SC]
   |-- srsEPC
   |-- srseNB
   |-- srsMBMS / MBMS-GW
   |-- sgi_mb
   |-- FFmpeg multicast source
   |
   | ZeroMQ RF sample path
   |
[PC2: UE]
   |-- srsUE
   |-- MAC PDU export
   |-- FFplay multicast receiver
   |
Wireshark:
   - sgi_mb
   - M1
   - UE MAC-LTE named pipe
```

## 待確認項目

- `sib.conf.mbsfn.example` 是否已正確複製與調整：NEEDS_CONFIRMATION
- SIB13 mapping 是否符合實際 parser 支援格式：NEEDS_CONFIRMATION
- `/tmp/ue.pcap.pipe` named pipe 建立與權限：NEEDS_CONFIRMATION
- Wireshark 是否可看到 MAC-LTE 封包：NEEDS_CONFIRMATION
- `SystemInformationBlockType13` filter 或等效欄位是否可用：NEEDS_CONFIRMATION
- MCCH / MTCH / MCH 是否穩定產生：NEEDS_CONFIRMATION
- 大流量 multicast 測試與 MCH 變化：NEEDS_CONFIRMATION
- IPTV 串流驗證與截圖整理：NEEDS_CONFIRMATION

## 已知問題方向

| 問題 | 判斷方式 | 處理方向 | 狀態 |
| --- | --- | --- | --- |
| Wireshark 白屏 | named pipe 開啟順序或 UE pcap 寫入失敗 | 先建立 pipe，再開 Wireshark 監聽，最後啟動 UE | NEEDS_CONFIRMATION |
| UE 無法寫入 `/tmp/ue.pcap.pipe` | pipe 權限、開啟順序或沒有 reader | 檢查權限並確認 Wireshark 已先開啟該 pipe | NEEDS_CONFIRMATION |
| 找不到 `SystemInformationBlockType13` filter | Wireshark dissector 命名或版本差異 | 從 MAC-LTE / RRC System Information 封包展開欄位找 | NEEDS_CONFIRMATION |
| camelCase 設定導致 parser 問題 | 設定 key 名稱與 parser 預期不一致 | 回到原始碼 parser 或範例 conf 確認 key 名稱 | NEEDS_CONFIRMATION |

## 重點整理

- eMBMS 不是單純 IP multicast；需要 MBMS-GW、M1、MCH、MCCH、MTCH 與 SIB13 配合。
- SIB13 是 UE 得知 MBMS 控制資訊的關鍵。
- UE 端 MAC-LTE pcap 比 EPC 端更適合觀測 SIB13、MCCH、MTCH。
- `sgi_mb` 可觀測 MBMS-GW 上層 multicast 流量。
- M1 可觀測 MBMS-GW 到 eNB 的 GTP-U multicast 封裝。
