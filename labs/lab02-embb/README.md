# Lab02 eMBB / eMBMS

[Delivery 入口](../../delivery/README.md) · [目前限制](../../docs/known-limitations.md)

## Delivery intent 與缺口

狀態：`NOT ACTIVE / NOT AUTHORIZED / STUDENT PROCEDURE PENDING`

交付方向是讓學生理解要建立的 multicast／eMBMS 應用、依可重現流程操作，並辨識最小成功
結果。現有材料尚未提供完整學生手冊、已核准最小 acceptance criteria 或功能完成證據。
Protocol-level 深度分析、完整 packet archaeology 與額外 showcase 不自動成為最低交付。

## 歷史技術目標與待確認筆記

以下保留原始架構、parser／PCAP 方向及 `NEEDS_CONFIRMATION`；不是 current validated
procedure 或已接受的 minimum checklist。具體取捨待另行 Work Unit，不由本次分類裁定。

本 Lab 目標是在 Lab01 基礎平台上加入 eMBMS / MBMS-GW，建立 multicast / broadcast 行動寬頻應用，並觀測控制面與使用者平面的資源配置。

本文件只整理已知資料與待確認項目，不代表實驗已完成。

### B.3D 單一 finalized PCAP 證據更新｜2026-09-26

`LAB02_B3D_EVIDENCE_ESTABLISHED / OBSERVED / BOUNDED`：既有 Session B UE MAC PCAP 經離線
Wireshark 解碼後有下列代表性 evidence：

| Claim | Verdict | Representative Frame | Direct Evidence | Decoder Requirement |
| --- | --- | --- | --- | --- |
| SIB13 | `ESTABLISHED` | 3 | LTE RRC `SystemInformation [ SIB2 SIB3 SIB13 ]`；tree 含 `sib13-v920`、MBSFN area 與 MCCH config | User DLT 149 → UDP；啟用 `mac_lte_udp` heuristic |
| MCCH | `ESTABLISHED` | 22 | 人工 Wireshark observation 記錄 `SDU (MCCH, length=16 bytes)` | User DLT 149 → UDP；啟用 `mac_lte_udp` heuristic；未另主張 MCCH 專用 preference 是必要條件 |
| MTCH | `ESTABLISHED` | 41 | RLC-LTE `[DL] [UM] MTCH`；Channel Type `MTCH (8)`，PDU Length 45 | User DLT 149 → UDP；啟用 `mac_lte_udp` heuristic 及 `Call RLC dissector MTCH LCIDs` |

詳細來源與 provenance 限制見 [B.3D TER](../../docs/evidence/task-evidence/2026-09-26-lab02-b3d-sib13-mcch-mtch.yaml)
及 [B.3D.1 TER](../../docs/evidence/task-evidence/2026-09-26-lab02-b3d1-dlt149-decoder-compatibility.yaml)。

此更新只確認這份既有 capture 的代表性封包；不建立跨 session 穩定性、完整教學流程、IPTV
播放或效能結論。下列 `NEEDS_CONFIRMATION` 教學／程序項目仍保留其較廣的驗收範圍，不代表
這些封包在該 finalized PCAP 中缺席。

### Teaching Extension runtime observations｜2026-09-26

`LAB02_TEACHING_EXTENSION: PASS_WITH_LIMITATIONS / HUMAN-REPORTED / BOUNDED`。以下包含 Human
Operator 提供的 Runtime 摘要，以及 PR #32 後的目視播放 follow-up 照片；不是 Codex 重新執行的
Runtime 或目前 process state：

- Runtime report 記錄 EPC、MBMS-GW、eNB、UE、UE attach 與 eMBMS service 均曾建立。UE
  address 從初始 `172.16.0.2/24` 到 controlled eNB/UE recovery 後的 `172.16.0.3/24`，兩個
  observation 分別保留，不合併成單一值。
- `MULTICAST_E2E_SANITY=PASS` 與 `MULTICAST_E2E_RECOVERY=PASS`：`LAB02_SHARK_1` 在 Sample
  Plane incident 前及 recovery 後均被報告從 Linux1 經 `239.255.1.1:3456`、eMBMS、
  `tun_srsue` 到達 Linux2。
- `VIDEO_DELIVERY_OBSERVED / DECODE_DEGRADED`：約 1 Mbps target 的 FFmpeg MPEG-TS/H.264
  stream 被 ffplay 識別，但持續出現 packet、NAL unit、macroblock 與 decode errors。
- `LOW-BITRATE STABLE DECODE OBSERVED`：`testsrc2` 的 320×180、15 fps、200 kbps target
  stream，aggregate MPEG-TS bitrate 約 248 kbps；Linux2 ffplay 曾識別 MPEG-TS/H.264
  Constrained Baseline，並在一段期間持續 decode，之後 Sample Plane 再次不穩。
- 原始 session 記錄中的 `VISIBLE_VIDEO_PLAYBACK=NOT VERIFIED` 是當時狀態：操作端透過一般
  SSH，沒有目視檢查 ffplay GUI。PR #32 後 Human Operator 另做 bounded visual-playback check；
  Human-supplied photo 顯示 Linux2 的 ffplay 視窗正在呈現 test-pattern 畫面，terminal 同時辨識
  FFmpeg 提供的 MPEG-TS/H.264 Constrained Baseline、320×180、15 fps。
- `VISIBLE_VIDEO_PLAYBACK=PASS / APPLICATION_E2E_VISIBLE_PLAYBACK=ESTABLISHED` 僅適用於這次
  bounded check；同一張照片仍顯示 `Packet corrupt`、`Invalid NAL unit`、corrupted macroblock
  與 decode/concealment errors，因此 `STREAM_INTEGRITY=DEGRADED / INTERMITTENT`。照片由 Codex
  在 task context 檢視、未複製至 Repo；Runtime 執行與操作者即時觀察仍屬 Human-reported。
- 兩個 bitrate observation 受反覆 Sample Plane instability 混淆，不建立 capacity threshold、
  bitrate causality、長時間穩定或無錯誤播放結論。
- 另有 Linux2 USB Ethernet disconnect/re-enumeration 與 Sample Plane 中斷的 Human-supplied
  log evidence；trigger 記為 established，USB disconnect 的底層原因仍是 `UNLOCALIZED`。詳見
  [Teaching Extension TER](../../docs/evidence/task-evidence/2026-09-26-lab02-teaching-extension-runtime.yaml)
  與 [Sample Plane incident TER](../../docs/evidence/task-evidence/2026-09-26-lab02-sample-plane-usb-incident.yaml)。
- 原始 session 的 Runtime controlled shutdown 由 Human Operator 回報完成。此紀錄不授權新的 Runtime、USB
  adapter A/B isolation、設定變更或 packet capture，也不改變 B.3D/B.3D.1 的既有結論。後續
  visual-playback follow-up 的 Runtime stop/current process state 未提供證據。

### 核心驗證目標

- MBMS-GW、EPC、eNB、UE 可依序啟動：NEEDS_CONFIRMATION
- eNB 正確載入 `sib.conf.mbsfn`：NEEDS_CONFIRMATION
- SIB13 可被送入 System Information：NEEDS_CONFIRMATION
- UE 可接收 eMBMS 相關 MAC-LTE 封包：NEEDS_CONFIRMATION
- 可觀測 MCCH、MTCH、MCH 資源配置：NEEDS_CONFIRMATION
- 可使用 FFmpeg / FFplay 驗證 IPTV multicast 應用：NEEDS_CONFIRMATION

### 系統架構

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

### 待確認項目

- `sib.conf.mbsfn.example` 是否已正確複製與調整：NEEDS_CONFIRMATION
- SIB13 mapping 是否符合實際 parser 支援格式：NEEDS_CONFIRMATION
- `/tmp/ue.pcap.pipe` named pipe 建立與權限：NEEDS_CONFIRMATION
- Wireshark 是否可看到 MAC-LTE 封包：NEEDS_CONFIRMATION
- `SystemInformationBlockType13` filter 或等效欄位是否可用：NEEDS_CONFIRMATION
- MCCH / MTCH / MCH 是否穩定產生：NEEDS_CONFIRMATION
- 大流量 multicast 測試與 MCH 變化：NEEDS_CONFIRMATION
- IPTV 串流驗證與截圖整理：NEEDS_CONFIRMATION

### 已知問題方向

| 問題 | 判斷方式 | 處理方向 | 狀態 |
| --- | --- | --- | --- |
| Wireshark 白屏 | named pipe 開啟順序或 UE pcap 寫入失敗 | 先建立 pipe，再開 Wireshark 監聽，最後啟動 UE | NEEDS_CONFIRMATION |
| UE 無法寫入 `/tmp/ue.pcap.pipe` | pipe 權限、開啟順序或沒有 reader | 檢查權限並確認 Wireshark 已先開啟該 pipe | NEEDS_CONFIRMATION |
| 找不到 `SystemInformationBlockType13` filter | Wireshark dissector 命名或版本差異 | 從 MAC-LTE / RRC System Information 封包展開欄位找 | NEEDS_CONFIRMATION |
| camelCase 設定導致 parser 問題 | 設定 key 名稱與 parser 預期不一致 | 回到原始碼 parser 或範例 conf 確認 key 名稱 | NEEDS_CONFIRMATION |

### 重點整理

- eMBMS 不是單純 IP multicast；需要 MBMS-GW、M1、MCH、MCCH、MTCH 與 SIB13 配合。
- SIB13 是 UE 得知 MBMS 控制資訊的關鍵。
- UE 端 MAC-LTE pcap 比 EPC 端更適合觀測 SIB13、MCCH、MTCH。
- `sgi_mb` 可觀測 MBMS-GW 上層 multicast 流量。
- M1 可觀測 MBMS-GW 到 eNB 的 GTP-U multicast 封裝。
