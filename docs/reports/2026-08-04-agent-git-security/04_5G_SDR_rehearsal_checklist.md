# 5G SDR Agent + Git + Security｜演練清單

## 0. 演練底線

- [ ] 使用已人工驗收的 v3.1 PPTX；不修改、不另存重排版、不新增投影片。
- [ ] 主講只使用第 1–16 頁；第 17–23 頁只在 Q&A 依問題開啟，第 24 頁為結尾。
- [ ] 不現場執行 Git、Windows 安裝、Agent、Repository 或 Runtime 指令。
- [ ] 不用一般技術知識補成已完成的專案事實。
- [ ] 不確定現況時說 **UNKNOWN**；未實測能力或效能時說 **UNVERIFIED**。

## 1. 18–20 分鐘完整版

**目標時間：18:50；容許範圍：18:00–20:00。**

### 計時檢查點

- [ ] Slide 1–7｜Agent、Git 與安全：**7:55** 內完成。
- [ ] Slide 8–11｜工具與 Repository Quick Start：累計 **12:40**。
- [ ] Slide 12–13｜5G SDR 案例與工作包：累計 **15:20**。
- [ ] Slide 14–16｜驗收標準與下一步：於 **18:50** 收束。
- [ ] Q&A 不計入主講時間，先完成 Slide 16 的決策提問再開放。

### 完整版逐頁時間

| Slide | 時間 | 演練勾選 |
| ---: | ---: | --- |
| 1 | 0:50 | [ ] |
| 2 | 0:45 | [ ] |
| 3 | 1:15 | [ ] |
| 4 | 1:10 | [ ] |
| 5 | 1:20 | [ ] |
| 6 | 1:10 | [ ] |
| 7 | 1:25 | [ ] |
| 8 | 1:10 | [ ] |
| 9 | 1:15 | [ ] |
| 10 | 1:05 | [ ] |
| 11 | 1:15 | [ ] |
| 12 | 1:45 | [ ] |
| 13 | 0:55 | [ ] |
| 14 | 1:05 | [ ] |
| 15 | 1:35 | [ ] |
| 16 | 0:50 | [ ] |
| **合計** | **18:50** | [ ] |

## 2. 12–14 分鐘壓縮版

**目標口述：12:15；保留約 45 秒停頓與換頁緩衝，現場目標約 13:00。**

| 章節 | Slides | 壓縮時間 | 壓縮方法 |
| --- | --- | ---: | --- |
| Agent、Git 與安全 | 1–7 | 5:05 | Slide 2 只講四章；Slide 4 每類資源不展開例子；Slide 5 用一句話總結九步；Slide 7 保留三個名詞區分。 |
| 工具與 Repository | 8–11 | 2:50 | Slide 8 不逐一介紹三個工具；Slide 9 保留三層角色；Slide 10 只講「首次 Clone／已有 Repo」差異；Slide 11 聚焦 Source Authority。 |
| 案例與工作包 | 12–13 | 2:00 | Slide 12 只講已驗證項目、完成邊界與 Runtime 非現況；Slide 13 只舉兩個可認領工作包。 |
| 驗收與決策 | 14–16 | 2:20 | Slide 14 各層一句；Slide 15 保留 Need／Nice-to-have 與 PARKING；Slide 16 直接收斂五個決策。 |
| **合計** | **1–16** | **12:15** |  |

### 壓縮版逐頁時間

- [ ] S1 0:35
- [ ] S2 0:20
- [ ] S3 0:55
- [ ] S4 0:40
- [ ] S5 0:55
- [ ] S6 0:45
- [ ] S7 0:55
- [ ] S8 0:40
- [ ] S9 0:50
- [ ] S10 0:40
- [ ] S11 0:40
- [ ] S12 1:20
- [ ] S13 0:40
- [ ] S14 0:45
- [ ] S15 1:00
- [ ] S16 0:35

## 3. 每個章節可刪減與不可刪減內容

### 第一章｜Agent、Git 與安全

**可刪減：**

- [ ] Slide 2 色彩圖例只說「顏色都有文字與符號輔助」。
- [ ] Slide 4 不逐一解釋所有 CIA 字母，只保留資源愈多、風險愈大的結論。
- [ ] Slide 5 不逐項念九步，改說「Scope → 權限 → 執行 → Diff／驗證 → Human Approval → Merge or Stop」。

**不可刪減：**

- [ ] Agent 的根本差異是能對外部環境採取行動。
- [ ] CIA Triad 是風險分類，不代表控制已完成。
- [ ] Git 是 Control Surface，不是 Sandbox。
- [ ] Authentication、Authorization、Source Authority 三者必須分開。

### 第二章｜工具與 Repository Quick Start

**可刪減：**

- [ ] Slide 8 不展開 Gemini CLI 與 Claude Code 的介面差異。
- [ ] Slide 10 不逐項念兩邊各五步。
- [ ] Slide 11 只挑 PROGRESS、SKILL 與 CONTRIBUTING 說明文件角色。

**不可刪減：**

- [ ] 第一個任務 Read-only First。
- [ ] Codex 管任務與工具、Ollama 管推論服務、Model 管生成與推理。
- [ ] 更換模型不等於更換權限。
- [ ] Windows 安裝、載入、效能與工具呼叫仍為 **UNVERIFIED**。
- [ ] Source Authority 不等於 Authorization。

### 第三章｜5G SDR 案例與工作包

**可刪減：**

- [ ] Slide 12 不逐一講所有 Gate 名稱，只保留流程順序。
- [ ] Slide 13 只舉「過期文件盤點」與「前置條件整理」兩個例子。

**不可刪減：**

- [ ] Lab01 已支持的項目：initialization、ZeroMQ、Attach、UE IP、雙向 ICMP、Controlled shutdown。
- [ ] Runtime 現在是否運行為 **UNKNOWN**；簡報只摘要既有 closeout evidence。
- [ ] NAT／Internet、Throughput、Wireshark／PCAP、URLLC、MBMS 不在完成宣稱內。
- [ ] L3–L4 必須另行授權與共同操作。

### 第四章｜驗收標準與下一步

**可刪減：**

- [ ] Slide 14 每個層級只保留一個例子。
- [ ] Slide 15 不逐項念所有 Nice-to-have。

**不可刪減：**

- [ ] Minimum Done 缺失仍需本輪補齊。
- [ ] 真正缺陷是 Need；Review 新改善預設進下一輪。
- [ ] ACP 不降低品質。
- [ ] ACP 目前為 **PARKING / OBSERVATION**，不是正式 Protocol。
- [ ] Slide 16 的工具、工作包、Quick Start、Git 深度與教材化決策。

## 4. 必講 Claim Boundary

- [ ] Agent 能行動，但不等於 autonomous decision maker。
- [ ] CIA 分類不是安全控制已完成的證明。
- [ ] Git 不能阻止 Secret、Repo 外檔案、網路或 Runtime 操作。
- [ ] 專用 SSH Key 只處理 Authentication；是否限制 Linux 權限為 **UNKNOWN**。
- [ ] Source Authority 是判斷依據優先性，不是系統操作授權。
- [ ] Local Model 不會自動取得 Repository／Shell，也不保證資料一定安全。
- [ ] Windows 實機安裝、模型載入、效能與工具呼叫為 **UNVERIFIED**。
- [ ] Lab01 Evidence 不代表 Runtime 現在正在運行。
- [ ] 不宣稱 NAT／Internet、Throughput、PCAP、URLLC 或 MBMS 已完成。
- [ ] ACP 維持 **PARKING / OBSERVATION**，未正式採用。
- [ ] reset --hard 與 branch -D 只出現在受控例外教材中，本次不執行。

## 5. 簡報播放與字型檢查

- [ ] PowerPoint 顯示為 16:9，總頁數 24。
- [ ] 主講頁 1–16 頁碼正確；附錄 B2 位於第 20 頁。
- [ ] 繁體中文、英文、斜線、箭頭與警告符號均正常顯示，沒有方框或缺字。
- [ ] 特別放大檢查 Slide 12、15、18、20 的小字。
- [ ] Presenter View 可看到既有 Speaker Notes。
- [ ] 外接螢幕、轉接器與投影比例已測試。
- [ ] PDF 可作為唯讀播放備援；確認 PDF 也是 24 頁。
- [ ] 不在會前使用「修復字型」或自動版面調整回寫 PPTX。
- [ ] 關閉通知、通訊軟體彈窗與會暴露私人資料的視窗。

## 6. Q&A 前應準備開啟的附錄頁

| 問題類型 | 預開頁面 | 準備重點 |
| --- | ---: | --- |
| Windows Codex + Ollama | 17｜附錄 A | 命令經文件核對，但 Windows 實機為 UNVERIFIED。 |
| 模型大小、RAM／VRAM、工具呼叫 | 18｜附錄 A2 | 候選清單不是效能排名；下載大小不等於實際記憶體。 |
| 日常 Git 入門 | 19｜附錄 B | Branch、Diff、Review、PR；不含破壞性命令。 |
| Diverged main／Squash Merge | 20｜附錄 B2 | 只講 Preconditions、證據與 Stop；不執行命令。 |
| 任務風險與授權 | 21｜附錄 C | L0–L2 起步；L3–L4 另行授權。 |
| Lab01 拓樸與 Evidence | 22｜附錄 D | 教學理解用途，不代表 Runtime 現況。 |
| 高風險批准 | 23｜附錄 E | Approval 是理解 Scope、命令、證據與 Rollback。 |

## 7. Q&A 應答演練

- [ ] 每題先用一句話直接回答。
- [ ] 第二段才補 PPTX Slide、Speaker Notes、Revision Report 或 ACP Parking Note。
- [ ] 若被問「現在是否運行」「Windows 是否通過」「模型是否最好」，先說 UNKNOWN／UNVERIFIED。
- [ ] 若問題超出來源，不即席推測；記錄成需補證據的 follow-up。
- [ ] Git 例外問題只展示附錄，不複製或執行命令。
- [ ] 每次回答後主動補一句 Claim Boundary，避免聽眾把案例擴張成整體現況。

## 8. 會議結束前需要確認的決策

- [ ] 每位參與者先使用哪一套 Agent 工具？
- [ ] 每位參與者認領哪一個小型工作包？
- [ ] 是否安排獨立 Quick Start 操作時間？
- [ ] Git 教學需要到 Branch／PR，還是另開進階課程？
- [ ] 是否希望後續發展為正式課堂教材？
- [ ] 每個工作包的 Owner、Minimum Done、Evidence Required 與 Stop Point 是否清楚？
- [ ] 若有人提出 L3–L4 或 Runtime 需求，是否已明確標記「另行授權」，沒有在會中口頭放行？

## 9. 演練紀錄

- [ ] 完整版實測時間：________
- [ ] 壓縮版實測時間：________
- [ ] 超時頁面：________
- [ ] 需要改口、不需要改投影片的項目：________
- [ ] UNKNOWN／UNVERIFIED 待補證據：________
- [ ] Q&A 後續負責人與期限：________
