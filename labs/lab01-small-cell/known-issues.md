# Lab01 Known Issues

以下問題來自來源筆記整理。是否仍存在需實機確認。

| 問題 | 判斷方式 | 處理方向 | 狀態 |
| --- | --- | --- | --- |
| UE 取得 `172.16.0.x` 但外連不穩 | `ip addr`、`ip route`、`ping` | 檢查 EPC 端 NAT、UE default route、SGi 對外介面 | NEEDS_CONFIRMATION |
| ZeroMQ 連線順序造成 eNB / UE 等待 | 觀察 eNB / UE 啟動 Log | 固定啟動順序：EPC -> eNB -> UE | NEEDS_CONFIRMATION |
| Wireshark 未看到預期封包 | 檢查擷取介面是否正確 | S1-MME 看控制面介面；S1-U / SGi 看 user plane 介面 | NEEDS_CONFIRMATION |
| 平台除錯容易盲猜 | Log 分層不清 | 依序分層：Process -> Interface -> IP / route -> packet -> protocol state | NEEDS_CONFIRMATION |

## 記錄原則

- 問題要附 Log 或 packet evidence。
- 解法要能回復。
- 不確定原因時，先標記 `NEEDS_CONFIRMATION`，不要直接寫成已解決。
