# 5G SDR Agent + Git + Security｜16 頁主簡報大綱

## 使用範圍

- 來源：v3.1 PPTX 的第 1–16 頁與既有 Speaker Notes。
- 簡報目的：讓參與者理解 Agent 的行動風險、受控工作方式、Repository 入口與可認領的小型任務，最後確認第一個安全任務。
- 建議完整版時間：**18 分 50 秒**；可保留約 10–70 秒現場停頓，總長維持 18–20 分鐘。
- Claim Boundary：本大綱不宣稱 Windows 實機驗證完成、不把 ACP 描述成正式制度，也不擴張 Lab01 已完成範圍。

## 整體敘事摘要

簡報先回答「為什麼現在需要 Agent、Git 與安全治理」，再拆解 Agent 的能力、CIA 風險、權限與 Git 邊界；接著帶入 Codex、Ollama、Local Model 與 Repository Harness 的實際入口；最後用 Lab01 已有證據、小型工作包與 ACP 校準機制，收束到每位參與者的第一個安全任務。

## 四個章節的角色與時間

| 章節 | 投影片 | 角色 | 建議時間 |
| --- | --- | --- | ---: |
| 一、Agent、Git 與安全 | 1–7 | 建立共同語言：Agent 會行動，因此要同時治理工具、權限、證據與停止點。 | 7:55 |
| 二、工具與 Repository Quick Start | 8–11 | 說明本地 Agent 三層架構、唯讀起步方式、Repository 入口與 Source Authority。 | 4:45 |
| 三、5G SDR 案例與工作包 | 12–13 | 用 Lab01 有限且可追溯的證據示範受控流程，並把大專題拆成可認領的小任務。 | 2:40 |
| 四、驗收標準與下一步 | 14–16 | 用 Minimum Done 與 ACP 防止 Review Scope Creep，最後形成會議決策。 | 3:30 |
| **合計** | **1–16** |  | **18:50** |

## Slide 1｜為什麼現在要導入 Agent 與 Git？

- **Purpose：**建立問題背景與本次會議的共同目標。
- **One-sentence message：**工程成果、決策與入口分散時，Agent 雖能加速工作，也需要 Git 與受控流程來降低風險。
- **Key points：**
  - 工程成果與決策需要共同入口。
  - 新參與者需要可認領、可驗收的小型工作包。
  - Agent 能對環境採取行動，因此不能只討論生成品質。
- **Transition to next：**先看今天會用哪四段內容，把治理共識一路帶到第一個任務。
- **Target time：**0:50

## Slide 2｜今天會講什麼

- **Purpose：**建立四章敘事地圖與色彩語意。
- **One-sentence message：**先建立安全與治理共識，再進入工具、案例、驗收與決策。
- **Key points：**
  - 第一章回答 Agent、Git 與安全邊界。
  - 第二章說明工具與 Repository Quick Start。
  - 第三章用 5G SDR 案例連結可認領工作包。
  - 第四章確認驗收標準與下一步。
- **Transition to next：**要理解為何需要治理，先從 Agent 和一般聊天 AI 的差異開始。
- **Target time：**0:45

## Slide 3｜Agent 和一般聊天 AI 有什麼不同

- **Purpose：**定義 Agent 的核心差異與 CIA 風險入口。
- **One-sentence message：**Agent 的關鍵不是更會回答，而是能透過工具與權限對外部環境採取行動。
- **Key points：**
  - 一般聊天 AI 主要輸出文字；Agent 可能讀檔、執行命令並產生變更。
  - Agent 可概括為 LLM、Tools、Permissions 與 Task Loop 的組合。
  - 機密性、完整性、可用性提供共同風險語言。
  - Agent 不等於可以自主決定所有事情。
- **Transition to next：**風險大小取決於 Agent 實際接觸哪些資源。
- **Target time：**1:15

## Slide 4｜Agent 能接觸哪些資源

- **Purpose：**把風險從抽象模型能力落到 Harness 資源面。
- **One-sentence message：**同一個模型的風險，會隨檔案、Shell、網路與憑證權限而大幅改變。
- **Key points：**
  - Files 影響機密性與完整性。
  - Shell 可能影響完整性與可用性。
  - Network 與 Credentials 可能擴大資料外流與遠端操作風險。
  - 共同控制包含最小權限、預設拒絕、職責分離與可稽核性。
- **Transition to next：**因此每次 Agent 任務都應從 Scope、權限、證據與 Stop Point 開始。
- **Target time：**1:10

## Slide 5｜一次受控 Agent 任務的生命週期

- **Purpose：**提供可重複使用的九步受控工作流程。
- **One-sentence message：**安全的 Agent 任務是先界定、再執行，先看證據、再決定是否放行。
- **Key points：**
  - 先定義 Scope、風險與最小權限。
  - 以 Branch 隔離變更，執行後 Review Diff 並測試。
  - Human Approval 與 Merge／Stop 是明確 Gate。
  - Task Package 至少要有 Objective、Allowed／Forbidden Scope、Evidence Required 與 Stop Point。
- **Transition to next：**Git 能支援其中的隔離與稽核，但不能取代作業系統安全控制。
- **Target time：**1:20

## Slide 6｜Git 能控制什麼、不能控制什麼

- **Purpose：**校正「有 Git 就安全」的錯誤期待。
- **One-sentence message：**Git 是變更控制與稽核介面，不是保護檔案、Secret、網路或 Runtime 的 Sandbox。
- **Key points：**
  - Branch、Diff、Commit、PR 與 Revert 能留下可審查的 Git 內容。
  - Git 無法阻止讀取 Secret、修改 Repo 外檔案或執行破壞性 Shell。
  - Git Revert 不等於 Runtime rollback。
  - Diverged main 與 Squash Merge cleanup 只在附錄 B2 作為受控例外說明，不是日常流程。
- **Transition to next：**即使登入憑證被分離，也要再區分 Authentication、Authorization 與 Source Authority。
- **Target time：**1:10

## Slide 7｜Agent 資安與專用 SSH Key 案例

- **Purpose：**拆開身分、權限與判斷依據三個概念。
- **One-sentence message：**專用 SSH Key 只分離登入身分；系統權限與資料的 Source Authority 必須另外判斷。
- **Key points：**
  - Authentication 回答「你是誰」。
  - Authorization 回答「你可以做什麼」。
  - Source Authority 回答「哪份資料能作為這次判斷依據」。
  - 專用 Key 不會自動降低 Linux 帳號、檔案或命令權限。
- **Transition to next：**建立概念後，下一章把它套進三種 Agent 工具的唯讀 Quick Start。
- **Target time：**1:25

## Slide 8｜三種 Agent 工具的共同 Quick Start

- **Purpose：**給出不同工具共用的安全起步方式。
- **One-sentence message：**不論使用哪個 Agent 介面，第一個任務都應是範圍明確、唯讀且可驗證的工作。
- **Key points：**
  - 啟動工具後先進入指定 Repository，再確認 Branch／Status。
  - 閱讀 AGENTS.md 與任務包後才執行 Read-only Task。
  - 工作結束後再次檢查是否有未預期變更。
  - Windows 完整安裝與連接流程在附錄 A，但實機驗證為 **UNVERIFIED**。
- **Transition to next：**本地方案還需要分清 Agent 介面、Ollama 與 Model 各自負責什麼。
- **Target time：**1:10

## Slide 9｜Agent 介面、Ollama Server 與 Model 是不同層

- **Purpose：**說明三層本地 Agent 架構與工具邊界。
- **One-sentence message：**Codex 管理任務與工具，Ollama 提供推論服務，Model 負責生成與推理；更換模型不等於更換權限。
- **Key points：**
  - User 決定任務、範圍與停止點。
  - Codex App／CLI 是 Agent 介面與工具協調層。
  - Ollama Server 載入模型並提供本機推論 API。
  - Local Model 生成內容與工具呼叫建議，不會直接取得 Repository 或 Shell。
  - Repository／Shell／Tools 的操作仍須經 Agent 介面與權限控制。
- **Transition to next：**理解工具層後，再看第一次取得 Repository 與日常同步的差別。
- **Target time：**1:15

## Slide 10｜如何取得並理解 Repository

- **Purpose：**區分首次 Clone 與已有 Repo 的安全入口。
- **One-sentence message：**Repository 不是只有程式碼；進入後要先看工作目錄、入口文件與目前進度，再決定是否同步或選任務。
- **Key points：**
  - 首次加入：Clone、進入目錄、確認狀態、讀入口文件、做唯讀任務。
  - 已有 Repo：先檢查 Working Tree 與 Branch，再安全同步。
  - Pull 前不要忽略本機尚未處理的變更。
- **Transition to next：**接著要知道 README、AGENTS、PROGRESS、SKILL 與 CONTRIBUTING 各能證明什麼。
- **Target time：**1:05

## Slide 11｜如何使用 5g-sdr-ops Agent Harness

- **Purpose：**建立文件角色與 Source Authority 的實務判讀。
- **One-sentence message：**Harness 的價值不只是列出要讀的文件，而是說明每份文件的適用範圍、時效與證據權重。
- **Key points：**
  - README 是目的與入口，狀態段可能過期。
  - AGENTS 定義安全與行為邊界，但目前目標仍需核對。
  - PROGRESS 記錄工程進度；SKILL 定義程序與 Gate，但不等於當前操作授權。
  - CONTRIBUTING 管理 Branch／Commit／PR 流程，不負責證明專案現況。
  - Source Authority 必須搭配日期、來源與任務情境判斷。
- **Transition to next：**下一頁用 Lab01 展示治理、Runtime evidence 與完成邊界如何一起收束。
- **Target time：**1:15

## Slide 12｜5G SDR 的真實工作案例

- **Purpose：**用已存在的 Lab01 證據示範受控流程。
- **One-sentence message：**Lab01 的完成宣稱來自盤點、授權 Gate、受控驗證、關閉與 Git 紀錄，而不是單一成功畫面。
- **Key points：**
  - 流程涵蓋 Read-only Inventory、備份與授權 Gate、受控 Runtime Validation、Controlled Shutdown 與進度／PR 收束。
  - 已有證據支持 EPC、eNB、UE initialization、ZeroMQ 2000／2001、Attach、UE IP 與雙向 ICMP。
  - Controlled shutdown 為 PASS。
  - NAT／Internet、Throughput、Wireshark／PCAP、URLLC 與 MBMS 不在完成宣稱內。
  - 本頁是既有證據摘要，不表示 Runtime 目前正在運行。
- **Transition to next：**這種大流程可以再拆成低風險、可認領的小型工作包。
- **Target time：**1:45

## Slide 13｜暑假方向與可認領工作包

- **Purpose：**把專題方向轉為可開始、可 Review 的第一個任務。
- **One-sentence message：**參與者不必先承擔整條研究線，可以從 L0–L2 的明確小型交付開始。
- **Key points：**
  - 環境維護可先做版本與設備 Inventory。
  - GitHub 文件可先盤點一份過期文件。
  - Lab02／03／04 可先整理前置條件與成功標準。
  - 可觀測性與課堂教材也可拆成 Log Source Inventory 或單頁 Quick Start。
  - L3–L4 需要另行授權與共同操作。
- **Transition to next：**工作包要能順利交付，還需要事前定義什麼叫做「可以送 Review」。
- **Target time：**0:55

## Slide 14｜做到什麼程度，能夠交給我 Review？

- **Purpose：**介紹 Minimum Done、Target Quality 與 Stretch Optional。
- **One-sentence message：**達成事前約定的 Minimum Done 就能提交 Review；更高品質與加分項不能回溯性改寫最低完成條件。
- **Key points：**
  - Minimum Done：原定 Scope、交付物與證據齊全，且沒有已知重大錯誤。
  - Target Quality：結構清楚、有證據且他人可接續。
  - Stretch Optional：更多圖表、測試、自動化或教材化，不阻塞本輪交付。
  - ACP 目前為 **PARKING / OBSERVATION**，不是正式團隊制度。
- **Transition to next：**下一頁不再重複三層標準，而是說明 Review 新想法如何被分類。
- **Target time：**1:05

## Slide 15｜ACP 快照｜固定本輪標準，阻止 Scope Creep

- **Purpose：**解釋 ACP 的校準閘門與生命週期。
- **One-sentence message：**ACP 不降低品質；它把真正缺陷留在本輪修正，把 Reviewer 新想到的改善預設放入下一輪。
- **Key points：**
  - 沒有校準時，Review 可能從小修延伸成相鄰重構，讓 Minimum Done 消失。
  - 原需求錯誤、重大 Bug、安全問題與 Architecture 違反屬本輪 Need。
  - 排版、延伸分析、額外自動化與相鄰重構預設屬下一輪 Nice-to-have。
  - 必要交付物缺失代表 Minimum Done 尚未達成，不是新的 Improvement。
  - Lifecycle 為 Parking → Observation → Draft → Pilot → Protocol；目前停在 **PARKING / OBSERVATION**。
- **Transition to next：**有了工具、工作包與驗收邊界，最後要把會議轉成具體決策。
- **Target time：**1:35

## Slide 16｜本次需要確認的決策與下一步

- **Purpose：**收束會議並形成可執行的下一步。
- **One-sentence message：**會議結束前，每位參與者應知道要用什麼工具、認領哪個小任務，以及需要哪些後續操作安排。
- **Key points：**
  - 確認每位參與者的 Agent 工具。
  - 確認第一個小型工作包。
  - 決定是否安排獨立 Quick Start。
  - 決定 Git 教學深度與是否發展為正式課堂教材。
  - 暫定底線：Read-only 起步、不直接修改 main、Runtime 操作另行協調。
- **Transition to next：**進入 Q&A；依問題開啟附錄 A、A2、B、B2、C、D 或 E，不現場執行指令。
- **Target time：**0:50
