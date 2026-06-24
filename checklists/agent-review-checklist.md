# Agent Review Checklist

接受 Agent 修改前，必須先檢查 scope、invariant、可回復性、可觀測性與 evidence。

| 檢查項目 | 問題 |
| --- | --- |
| Scope | Agent 是否只改允許範圍？ |
| Invariant | 是否破壞既有封包路徑、設定檔格式或啟動順序？ |
| Reversibility | 修改是否容易回復？ |
| Observability | 修改後是否更容易觀測 Log 或封包？ |
| Testability | 是否提供可重現測試？ |
| Minimality | 是否做了過度重構？ |
| Evidence | 是否有 Log、測試結果或 diff 支撐？ |

## Review Requirements

每次修改都應包含：

- What changed
- Why it changed
- Risk
- How to test
- How to rollback

## 常見禁止事項

- 未經確認就修改 runtime config
- 未經確認就修改 eNB / UE / EPC 核心流程
- 未定義 invariant 前修改 parser 或協定邏輯
- 未看 Log 就猜測 RF 問題
- 未確認實驗階段就切換到 OTA
- 未確認風險就執行高影響力指令
- 用大量重構取代小步驗證

## Evidence Checklist

- 是否有對應的 Log？
- 是否有對應的 Wireshark packet 或 PCAP？
- 是否有修改前後 diff summary？
- 是否有測試方法與實際結果？
- 若結果未經實機確認，是否標記 `NEEDS_CONFIRMATION`？
