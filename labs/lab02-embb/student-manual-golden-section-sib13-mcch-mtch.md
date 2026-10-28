# Golden Section 草稿｜SIB13 → MCCH → MTCH

> 獨立校準稿，尚未併入 [Lab02 Student Manual](student-manual.md)。Frame 3／22／41 是 Lab02 Reference Capture 的例子；學生仍應先分析自己 Runtime 產生的 capture。

## 先分清三個觀察問題

這個順序是協助閱讀封包的路徑，不表示三個 frame 已證明完整、連續或因果相連的 eMBMS 傳輸：

| 觀察 | 要回答的問題 |
| --- | --- |
| SIB13 | System Information 中是否看得到 MBMS／MBSFN 相關資訊與 MCCH configuration？ |
| MCCH | 是否有一筆可辨認為 MCCH 的 control-channel observation？ |
| MTCH | 是否有一筆在 RLC-LTE 中解碼為 MTCH 的 downlink observation？ |

可以把它們先理解為「system information 提供背景、MCCH 是控制側觀察、MTCH 是 traffic-channel 側觀察」。每一項都要看自己的封包證據；看到其中一項，不代表另外兩項也已觀察到。

## 1. SIB13：先看 MBMS／MBSFN 的 System Information

### Why this matters

先看 SIB13，是為了確認這份 capture 的 System Information 中有沒有 MBMS／MBSFN 相關資訊，以及其中是否解碼出 MCCH configuration。這幫助你理解後面為什麼要分開找 MCCH 與 MTCH。

### What to look for

在 LTE RRC SystemInformation 中找 SIB13。展開解碼樹時，可留意 `sib13-v920`、MBSFN area information 與 `mcch-Config-r9` 等欄位。

### What you should see

Lab02 Reference Capture 的 Frame 3 顯示 `SystemInformation [ SIB2 SIB3 SIB13 ]`；解碼樹中可見 SIB13、MBSFN area information 與 MCCH configuration。Frame 3 是這份 Reference Capture 的例子，不是學生自己的 capture 必須使用的 frame number。

### What it means

這支持「在這份 capture 中，SIB13 的 MBMS／MBSFN 相關資訊及 MCCH configuration 可被解碼觀察到」。SIB13 observation 與稍後尋找一筆實際 MCCH SDU，是兩個不同問題。

### What it does NOT prove

單靠 SIB13 或 configuration 欄位，不證明 MCCH SDU 已被觀察到、不證明 MTCH 已被解碼，也不證明 UE 已收到應用資料或出現可視播放。

## 2. MCCH：辨認控制側 observation

### Why this matters

MCCH 是這條閱讀路徑中的 control-channel observation。SIB13 裡看見 MCCH configuration，和在封包中辨認到 MCCH，是兩件事：前者是 System Information 的內容；後者要有對應的封包 observation。

### What to look for

在封包解碼結果中，確認觀察是否明確標示 MCCH。不要只因為看到 MCH 或 MCH Scheduling Information，就把它改寫成已觀察到 MCCH。

### What you should see

Lab02 Reference Capture 的 Frame 22 observation 記錄了 MCH tree、2-byte MCH Scheduling Information，以及一筆 16-byte MCCH SDU。Frame 22 的證據標記保留為 `REPORTED_ONLY`：保存的來源是人員提供的 Wireshark observation；所選 frame 的 screenshot 或 raw decoder export 沒有存入 Repo。這個標記描述可供複核的來源形式，不表示 MCCH 在 capture 中不存在。

### What it means

這筆 observation 支持「Reference Capture 的 Frame 22 被回報解碼為 MCCH SDU」。它與 Frame 3 的 SIB13 observation 分開記錄，也不能只靠 MCH 的存在取代。

### What it does NOT prove

它不證明 MCCH 的完整內容或服務控制流程，也不單獨證明 MTCH 封包或應用資料已到達 UE。因為 Frame 22 的保存來源是 reported observation，不能把它改標成 screenshot-backed direct evidence。

## 3. MTCH：辨認 traffic-channel observation

### Why this matters

MTCH 是 traffic-channel 側的觀察，與 MCCH 的 control-channel observation 不同。分開看，才能回答「是否解碼到 MTCH」；不能把 Frame 22 的 MCCH observation 當成 Frame 41 的 MTCH evidence。

### What to look for

檢查 RLC-LTE decode 是否明確標示 MTCH。若解碼器只顯示 MCH SDU 或 LCID 數值，先不要僅依該數值判定 MTCH。

### What you should see

Lab02 Reference Capture 的 Frame 41 直接解碼為 RLC-LTE downlink UM MTCH；解碼樹顯示 Channel Type `MTCH (8)`、Channel ID 0、PDU Length 45。這項 MTCH decode 需要啟用 Wireshark 的 `Call RLC dissector MTCH LCIDs` preference。

### What it means

這支持「在套用該 RLC dissector preference 後，Reference Capture 的 Frame 41 可被直接解碼為 MTCH」。解碼器設定決定這筆 frame 如何被呈現；設定未啟用時看不到 MTCH decode，不能單獨推論 capture 中沒有 MTCH。

### What it does NOT prove

Frame 41 不證明 MTCH 持續傳送、payload 對應到特定影片、影片完整抵達，或應用播放成功。這些都需要各自的 evidence。

## What to look for：離線 decoder 設定

分析自己的 capture 或 Reference Capture 時，已恢復的 Wireshark decode path 是：

1. 將 User DLT `149` 對應至 UDP。
2. 啟用 `mac_lte_udp`。
3. 要直接解碼 MTCH 時，再啟用 `Call RLC dissector MTCH LCIDs`。

Wireshark GUI 版本與選單位置未由現有 evidence 確認。這裡列出的是 decoder 設定名稱，不是指定某個版本的 GUI 操作路徑。Live Wireshark attachment 不是取得或分析學生 capture 的必要條件。

## 把三個 frame 放在一起閱讀

| Reference Capture frame | 本例回答的問題 | Evidence boundary |
| --- | --- | --- |
| 3 | System Information 中是否有 SIB13 與 MBSFN／MCCH configuration？ | screenshot-based direct decode；只代表此 capture |
| 22 | 是否觀察到 MCCH SDU？ | 人員提供的 observation；保留 `REPORTED_ONLY`，所選 frame screenshot 未存入 Repo |
| 41 | 是否有 RLC-LTE downlink PDU 解碼為 MTCH？ | screenshot-based direct decode；需啟用 `Call RLC dissector MTCH LCIDs`；只代表此 capture |

請先記錄自己 capture 中實際解碼到的 frame 與內容，再用 Reference Capture 理解如何辨認這些 observation。不要要求自己的 frame number、packet count 或封包內容和範例相同；也不要把零筆 filter match 當成協定不存在，因為結果可能受 decoder configuration 影響。

這三個例子來自同一份 finalized capture。它們支持的是該 capture 中各自有界的 SIB13、MCCH 與 MTCH observation；單一 capture 不能推論每次 Runtime 都會得到相同行為，也不證明連續傳輸、完整 eMBMS pipeline、visible playback、throughput、capacity 或長期穩定性。

---

## Reviewer-only provenance anchors

以下是編輯複核索引，不屬於學生段落：

- Frame 3：B.3D TER，B3D-01，screenshot-based direct decode。
- Frame 22：B.3D TER，B3D-02，human observation；保留 `REPORTED_ONLY`，selected-frame screenshot 未存入 Repo。
- Frame 41：B.3D TER，B3D-03，screenshot-based direct decode；MTCH RLC preference 是必要設定。
- Decoder path：B.3D.1 TER，B3D1-02／B3D1-03；User DLT 149 → UDP、`mac_lte_udp`、`Call RLC dissector MTCH LCIDs`。

Sources: [B.3D TER](../../docs/evidence/task-evidence/2026-09-26-lab02-b3d-sib13-mcch-mtch.yaml), [B.3D.1 TER](../../docs/evidence/task-evidence/2026-09-26-lab02-b3d1-dlt149-decoder-compatibility.yaml), [Lab02 README](README.md).
