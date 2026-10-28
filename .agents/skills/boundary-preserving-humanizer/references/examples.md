# Before／After｜有界短例

以下是依已保存材料縮寫的教學例子，不是新增 Runtime evidence，也不是要求所有領域
使用 LTE／eMBMS 名詞。After 只能重述給定 Before 的內容與限制。

## Lab01：Attach 與 ICMP 分開

**Before**：歷史 Phase 4C 記錄 attach 與有界雙向 ICMP；milestones 保留 `REPORTED_ONLY`。
EV-2 是另一個 scope，R5 UE → EPC ICMP 為 `FAIL / UNLOCALIZED`。不支持 TCP／NAT／Internet。

**After**：先確認你讀的是哪次紀錄。Phase 4C 回報 attach 與有界雙向 ICMP；這是
`REPORTED_ONLY` 的歷史結果，不能填入自己的紀錄。EV-2 的 R5 仍是
`FAIL / UNLOCALIZED`，不能由 attach 或另一個 session 的 ICMP 推定成功。這些結果都不證明
TCP、NAT 或 Internet 可用。

**保留**：兩個 scope、reported 來源、失敗與未定位狀態；沒有補造本次成功。

## Lab02：三個 frame 是獨立觀察

**Before**：同一 Reference Capture：Frame 3 有 SIB13／MBSFN／MCCH configuration 的
screenshot-based direct decode；Frame 22 的 MCCH SDU 為 `REPORTED_ONLY`，selected-frame
screenshot 未存 Repo；Frame 41 的 RLC-LTE MTCH direct decode 需啟用
`Call RLC dissector MTCH LCIDs`。不證明完整應用或每次 Runtime 同樣結果。

**After**：先用 Frame 3 看 SIB13 中的 MBSFN 與 MCCH configuration，再分開確認 MCCH
與 MTCH。Frame 22 只保存人員回報的 MCCH SDU observation，所選 frame 截圖未存 Repo，
因此保留 `REPORTED_ONLY`。Frame 41 要啟用 `Call RLC dissector MTCH LCIDs`，才有此處
記錄的 RLC-LTE MTCH direct decode。Frame 3 與 Frame 41 的 direct decode 均由提供的截圖
支持。這三筆來自同一 Reference Capture，各自回答不同問題；
不能代替學生的本次 capture，也不證明完整應用成功或每次 Runtime 都相同。

**保留**：SIB13、MCH、MCCH、MTCH 不互換；configuration 不當作 SDU observation；
Frame 22 不升為直接驗證。Frame 41 的 decoder 設定仍可見。

## Troubleshooting：症狀與原因分開

**Before**：`Error receiving samples` 是症狀。先查 Sample Plane address、route 與雙向
connectivity；介面變動時查 kernel／NetworkManager logs。USB cause 為 `UNLOCALIZED`，
無 A/B isolation；檢查建議不是 verified repair。

**After**：看到 `Error receiving samples` 時，先記下發生時間，再核對 Sample Plane 的
address、route 與雙向 connectivity；介面曾變動時，對照該時段 kernel／NetworkManager
logs。這些檢查只幫助記錄當下的主機／網路狀態，不是已驗證的修復。USB cause 仍是
`UNLOCALIZED`，沒有 A/B isolation；不能直接判定 adapter 壞了或 srsRAN 有 bug。

**保留**：symptom ≠ root cause、event chronology ≠ causation、建議 ≠ verified fix。

## Optional Lab context

以下只供追溯範例；使用此 Skill 不必具備這些 Lab 文件：

- [Accepted protocol calibration](../../../../labs/lab02-embb/student-manual-golden-section-sib13-mcch-mtch.md)
- [Accepted troubleshooting calibration](../../../../labs/lab02-embb/student-manual-calibration-error-receiving-samples.md)
- [Lab01 reviewed delivery source](../../../../labs/lab01-small-cell/student-manual-humanized-v0.1.md)
