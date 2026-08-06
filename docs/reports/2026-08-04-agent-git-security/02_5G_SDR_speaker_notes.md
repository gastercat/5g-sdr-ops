# 5G SDR Agent + Git + Security｜16 頁講者備註

## 使用方式

- 完整版目標：**18 分 50 秒**，不含 Q&A。
- 語氣：像帶大家進入同一套工作方式，不逐字朗讀投影片。
- 遇到未知事項：直接說「目前 UNKNOWN」；遇到未實測項目：明確標示 **UNVERIFIED**。
- Windows 本地 Agent 尚未完成實機驗證；ACP 仍為 **PARKING / OBSERVATION**；Lab01 只宣稱來源支持的已完成項目。

## Slide 1｜為什麼現在要導入 Agent 與 Git？

- **Opening line：**「今天不是要再講一次 Lab01 怎麼啟動，而是要回答：接下來大家要怎麼安全地進入這個專案、使用 Agent，並交出可 Review 的成果。」
- **Required points：**
  - 工程成果與決策如果散在不同地方，新加入的人很難知道從哪裡開始。
  - Agent 可以協助讀資料、整理與執行工具，但行動能力也會帶來風險。
  - Git 與受控任務包提供共同入口、差異與審查紀錄。
- **Optional detail：**可用「第一個任務不是修完整系統，而是盤點一份指定文件」作為低風險例子。
- **Claim boundary：**不暗示本次會議會重新啟動 Runtime，也不把 Agent 描述成能自行決定專案方向。
- **Transition：**「先用一頁看完今天的四段路線，再回頭定義 Agent 到底多了什麼能力。」
- **Target time：**0:50

## Slide 2｜今天會講什麼

- **Opening line：**「整份簡報會從治理共識開始，最後落到每個人的第一個安全任務。」
- **Required points：**
  - 第一章建立 Agent、Git 與安全的共同語言。
  - 第二章進入工具與 Repository Quick Start。
  - 第三章用 5G SDR 案例說明證據與工作包。
  - 第四章處理驗收標準與會議決策。
- **Optional detail：**快速說明青色、紅色、黃色與紫灰都有文字／符號輔助，不只靠顏色辨識。
- **Claim boundary：**這是教學與工作入口，不是 Runtime 操作手冊。
- **Transition：**「第一個核心問題是：Agent 和一般聊天 AI 到底差在哪裡？」
- **Target time：**0:45

## Slide 3｜Agent 和一般聊天 AI 有什麼不同

- **Opening line：**「差異不只是答案更長或更聰明，而是它能不能透過工具對外部環境做事。」
- **Required points：**
  - 聊天 AI 主要產生文字；Agent 可能讀檔、執行命令與修改內容。
  - Agent 可以理解為 LLM、Tools、Permissions 與 Task Loop 的組合。
  - CIA Triad 是討論 Agent 風險的共同語言：資料會不會外流、被改壞，或讓服務不可用。
  - 工具與權限不同，同一個模型的風險也不同。
- **Optional detail：**舉例：只讀一份 Markdown 與取得完整 Shell、網路、憑證，是完全不同的風險面。
- **Claim boundary：**Agent 不等於 autonomous decision maker；是否執行高風險動作仍取決於 Harness、批准與任務邊界。
- **Transition：**「所以接下來要看的不是模型名稱，而是 Harness 到底讓它接觸了哪些資源。」
- **Target time：**1:15

## Slide 4｜Agent 能接觸哪些資源

- **Opening line：**「我們可以把風險拆成四個入口：檔案、Shell、網路與憑證。」
- **Required points：**
  - Files 可能涉及讀取機密或修改證據。
  - Shell 可能刪除內容、改設定或中斷服務。
  - Network 可能連到外部服務或遠端主機。
  - Credentials 讓原本的工具操作延伸到更高權限。
  - 安全控制要同時做到最小權限、預設拒絕、職責分離與可稽核。
- **Optional detail：**提醒「本地模型」只描述推論位置，不自動消除檔案、Shell 或網路權限。
- **Claim boundary：**不要用模型部署位置推論資料一定安全；仍須查看實際工具、權限、記錄與外部連線。
- **Transition：**「把資源面看清楚後，我們才能建立一次受控 Agent 任務的完整生命週期。」
- **Target time：**1:10

## Slide 5｜一次受控 Agent 任務的生命週期

- **Opening line：**「安全不是最後補一個 Review，而是從任務一開始就把 Scope、權限與停止點寫清楚。」
- **Required points：**
  - 先定義 Scope、資料風險與最小權限。
  - 用 Branch 隔離預期的 Repository 變更。
  - 執行後必須看 Diff、做相稱驗證並保留證據。
  - Human Approval 決定是否繼續；沒有證據就停在 Gate。
  - Task Package 至少要清楚列出 Objective、Allowed／Forbidden Scope、Evidence Required 與 Stop Point。
- **Optional detail：**用 Lab01 的 Gate 概念說明：完成一階段後停止，人工看完證據再決定下一步。
- **Claim boundary：**流程圖是治理框架，不代表每個任務都已取得建立 Branch、修改檔案或操作 Runtime 的授權。
- **Transition：**「Git 在這套流程裡很重要，但它能做的事其實有清楚邊界。」
- **Target time：**1:20

## Slide 6｜Git 能控制什麼、不能控制什麼

- **Opening line：**「Git 很適合保存差異與審查歷史，但它不是作業系統的安全沙盒。」
- **Required points：**
  - Branch、Diff、Commit 與 PR 能隔離、顯示並審查 Git 內容。
  - Revert 只能回復 Git 管理的內容。
  - Git 無法阻止讀 Secret、改 Repo 外檔案、連遠端或執行破壞性 Shell。
  - Runtime rollback 必須是受控部署與驗證，不是把 Git 當成系統回復按鈕。
- **Optional detail：**若有人問 diverged main 或 Squash Merge cleanup，開附錄 B2：前者要先確認 Working Tree clean、遠端權威並建立 Backup Branch；後者要先用 PR state、Base 與 Squash Commit 證明已 Merge。兩者都是受控例外。
- **Claim boundary：**不要在主講中示範或執行 reset --hard、branch -D、Force Push 或遠端 branch deletion；教材出現不等於當下獲得執行授權。
- **Transition：**「Git 的邊界之外，登入憑證也常被誤認為權限控制，所以我們再拆開三個名詞。」
- **Target time：**1:10

## Slide 7｜Agent 資安與專用 SSH Key 案例

- **Opening line：**「專用 SSH Key 解決的是『用哪個身分登入』，不是『登入後只能做什麼』。」
- **Required points：**
  - Authentication：驗證你是誰。
  - Authorization：系統允許你做什麼。
  - Source Authority：這次判斷應以哪份資料、紀錄或核准決策為準。
  - 專用 Key 可以分離與撤銷登入憑證，但 Linux 帳號、檔案與命令權限仍需另外限制。
- **Optional detail：**舉例：一份舊 README 可以是入口，但若狀態已過期，就不能勝過較新的 PROGRESS 或經驗證紀錄。
- **Claim boundary：**目前來源只支持「專用 Key 可分離登入身分」；沒有證據證明它已自動套用低權限 Linux 帳號或命令白名單。
- **Transition：**「概念釐清後，我們可以看不同 Agent 工具如何共享同一套唯讀起步方式。」
- **Target time：**1:25

## Slide 8｜三種 Agent 工具的共同 Quick Start

- **Opening line：**「介面可以不同，但第一個任務的安全條件應該一致。」
- **Required points：**
  - 啟動工具後先進入指定 Repository，確認 Branch／Status。
  - 先讀 AGENTS.md 與任務包，再做單一 Read-only Task。
  - 輸出後停止，並確認沒有未預期變更。
  - 本地方案使用 Codex App／CLI 搭配 Ollama；其他工具同樣先做唯讀盤點。
- **Optional detail：**首次任務可以只要求整理一份 Markdown 的用途、時間點、可能過期段落與人工確認問題。
- **Claim boundary：** **UNVERIFIED：**Windows 安裝、模型載入、連線與完整流程尚未在 Windows 實機驗證；附錄 A 是經文件核對的操作草案，不是本機 PASS 證據。
- **Transition：**「要避免把所有元件混在一起，下一頁把本地 Agent 拆成三個主要層次。」
- **Target time：**1:10

## Slide 9｜Agent 介面、Ollama Server 與 Model 是不同層

- **Opening line：**「本地 Agent 不是一個單一程式；至少要分成 Agent 介面、推論服務與模型三層。」
- **Required points：**
  - Codex App／CLI 接收任務、管理工作迴圈並協調工具。
  - Ollama Server 載入模型、處理推論請求並提供本機 API。
  - Local Model 負責理解、生成與推理，也可能提出工具呼叫建議。
  - Repository、Shell 與 Tools 是外部資源；實際動作必須經 Codex 的權限與批准機制。
  - 更換模型不等於更換安全邊界。
- **Optional detail：**用一句對照記憶：「Codex 管任務與工具，Ollama 管推論服務，Model 管生成與推理。」
- **Claim boundary：** **UNVERIFIED：**候選模型在 Windows 的實際效能、工具呼叫可靠度與記憶體需求尚未測試；模型本身不被宣稱可直接存取 Repository。
- **Transition：**「理解工具層次後，再看進入 Repository 時要先做哪些判斷。」
- **Target time：**1:15

## Slide 10｜如何取得並理解 Repository

- **Opening line：**「第一次 Clone 和手上已經有一份 Repo，是兩個不同情境。」
- **Required points：**
  - 第一次加入先 Clone、進入目錄、確認 Branch／Status、讀入口文件。
  - 已有 Repo 時先看 Working Tree 與 Branch，不能直接假設 Pull 安全。
  - 安全同步後再讀目前進度並選擇任務。
- **Optional detail：**強調 Repository 同時保存規則、進度、證據與協作流程，不只是下載區。
- **Claim boundary：**這一頁只說明流程順序，不授權現在執行 Clone、Pull 或任何 Git recovery。
- **Transition：**「接著要知道進入 Repo 後，每份文件各自能回答什麼問題。」
- **Target time：**1:05

## Slide 11｜如何使用 5g-sdr-ops Agent Harness

- **Opening line：**「文件很多並不等於資訊清楚；關鍵是知道每份文件能證明什麼、不能證明什麼。」
- **Required points：**
  - README 是入口與專案目的，但狀態段可能過期。
  - AGENTS 是安全與行為邊界，不一定代表最新專案目標。
  - PROGRESS 是進度證據，但仍要看更新日期。
  - SKILL 定義程序與 Gate，不等於當前操作授權。
  - CONTRIBUTING 定義 Git 流程，不負責證明 Runtime 現況。
- **Optional detail：**Source Authority 不是「最正式的檔名永遠獲勝」，而是依問題選擇最新、已驗證且適用的來源。
- **Claim boundary：**任何舊文件、對話摘要或 Handoff，在未與目前證據核對前，都不能單獨升格成已確認現況。
- **Transition：**「下一頁用 Lab01 看看這套 Harness 如何把流程、證據與完成邊界串起來。」
- **Target time：**1:15

## Slide 12｜5G SDR 的真實工作案例

- **Opening line：**「Lab01 最值得帶走的，不只是最後連通，而是每一步都有 Gate、證據與收束。」
- **Required points：**
  - 流程從唯讀盤點、備份與授權 Gate，進到受控 Runtime Validation，再受控關閉。
  - 已有證據支持 EPC、eNB、UE initialization 與 ZeroMQ 2000／2001。
  - 流程也記錄 Cell Search、RA、RRC Connected、Attach、UE IP 與雙向 ICMP 0% packet loss。
  - Controlled shutdown 為 PASS，結果透過進度與 Git 紀錄收束。
  - NAT／Internet、Throughput、Wireshark／PCAP、URLLC 與 MBMS 不在完成宣稱內。
- **Optional detail：**可以指出完成狀態是既有 Engineering Closeout 的摘要，不需也不應現場重跑。
- **Claim boundary：**本頁不表示 Runtime 現在正在運行；未列為完成的項目維持 NOT TESTED／NOT COMPLETED，不以一般 5G 知識補成專案成果。
- **Transition：**「有了完整案例後，我們要把大型專題拆成新參與者可以安全開始的小任務。」
- **Target time：**1:45

## Slide 13｜暑假方向與可認領工作包

- **Opening line：**「第一個任務不用是『負責整個 Lab03』，可以只是交付一份前置條件盤點。」
- **Required points：**
  - 環境維護、GitHub 文件、後續 Lab、可觀測性與課堂教材都能拆成小型交付。
  - 小型工作包要有清楚輸出與 Review 邊界。
  - 初次參與建議從 L0–L2 開始。
  - L3–L4 涉及受控環境或 Runtime，需要另行授權與共同操作。
- **Optional detail：**請大家先選一個最容易在短時間內完成並被驗證的工作包。
- **Claim boundary：**列出方向不代表所有後續 Lab 已開始、已完成或已取得 Runtime 操作權限。
- **Transition：**「任務拆小之後，下一個問題就是：做到什麼程度可以交？」
- **Target time：**0:55

## Slide 14｜做到什麼程度，能夠交給我 Review？

- **Opening line：**「可以送 Review，不等於必須做到沒有任何改善空間。」
- **Required points：**
  - Minimum Done 是本輪必須完成的 Scope、交付物與證據。
  - Target Quality 是團隊正常期待，例如結構清楚、判斷有證據。
  - Stretch Optional 是加分項，不阻塞本輪交付。
  - Review 後才想到的新改善，預設進下一輪。
- **Optional detail：**用文件盤點例子：指出過期段落、證據與修正建議是 Minimum；統一全庫格式或做自動化通常是後續工作。
- **Claim boundary：**這套三層標準目前仍是試行說明；ACP 為 **PARKING / OBSERVATION**，不是已正式採用的團隊 Protocol。
- **Transition：**「真正困難的不是三層怎麼命名，而是 Review 當下要怎麼分類新的想法。」
- **Target time：**1:05

## Slide 15｜ACP 快照｜固定本輪標準，阻止 Scope Creep

- **Opening line：**「ACP 不降低品質，它處理的是 Review 越接近完成、改善想法越容易變多的情況。」
- **Required points：**
  - 沒有校準時，任務可能從小修一路擴張到相鄰重構，讓 Minimum Done 消失。
  - 先問：新問題是否代表原需求或成果本身有缺陷？
  - 原需求錯誤、重大 Bug、安全問題、Architecture 違反屬本輪 Need。
  - 排版、延伸分析、額外自動化或相鄰重構，預設進下一輪 Improvement。
  - 必要交付物缺失仍是 Minimum Done 未達成，不能假裝成下一輪項目。
  - 目前只累積案例，Lifecycle 停在 **PARKING / OBSERVATION**。
- **Optional detail：**可以直接說：「Reviewer 的靈感，不等於新的 Mandatory Requirement。」
- **Claim boundary：**不得宣稱 ACP 已設 KPI、完整 Rubric、自動化、Repository Policy 或正式 Protocol；是否升級到 Draft／Pilot 仍待決策。
- **Transition：**「最後，我們把今天的內容轉成每個人的工具、工作包與後續安排。」
- **Target time：**1:35

## Slide 16｜本次需要確認的決策與下一步

- **Opening line：**「如果今天只帶走一件事，就是每個人都要知道自己的第一個安全任務。」
- **Required points：**
  - 確認每位參與者先使用哪套 Agent 工具。
  - 確認每位參與者認領哪個小型工作包。
  - 決定是否安排獨立 Quick Start。
  - 決定 Git 教學深度與是否發展為正式課堂教材。
  - 重申底線：Read-only 起步、不直接修改 main、Runtime 操作另行協調。
- **Optional detail：**Q&A 前先準備附錄 A／A2、B／B2、C、D、E，依問題開啟，不照順序播放。
- **Claim boundary：**會議決策是下一步安排，不等於已授權 Repository write、Git recovery、Runtime access 或正式採用 ACP。
- **Transition：**「接下來進入 Q&A；若問題超過現有證據，我會直接標示 UNKNOWN 或 UNVERIFIED。」
- **Target time：**0:50
