# 5G SDR Agent + Git + Security｜Professor Q&A

## 回答原則

1. 先直接回答，再補來源與證據。
2. 來源沒有支持的專案現況，回答 **UNKNOWN**；尚未實測的能力或效能，回答 **UNVERIFIED**。
3. 不宣稱 Windows 實機測試已完成、不宣稱 ACP 已正式採用，也不擴張 Lab01 的完成範圍。
4. Q&A 可開啟附錄頁說明，但不在會議中執行任何指令。

## Agent fundamentals

### Q1｜Agent 和聊天 AI 的根本差異是什麼？

- **Short answer：**根本差異是 Agent 能透過工具與權限對外部環境採取行動，不只是輸出文字。
- **Expanded answer：**簡報把 Agent 表示為 LLM、Tools、Permissions 與 Task Loop 的組合。聊天 AI 通常停在回答；Agent 可能讀檔、執行命令或產生實際變更，因此風險評估必須涵蓋工具與權限。
- **Evidence source：**PPTX Slide 3 及既有 Speaker Notes。
- **Claim boundary：**不能因為系統被稱為 Agent，就推論它有完全自主決策權；實際能力取決於 Harness。
- **Follow-up question：**這個 Agent 實際被授予哪些工具與權限？

### Q2｜Agent 是否等於自主決策者？

- **Short answer：**不是。
- **Expanded answer：**Agent 可以在任務迴圈中提出或執行工具操作，但 Scope、批准條件與 Stop Point 仍應由人類與任務包控制。簡報明確標示 Agent 不等於 autonomous decision maker。
- **Evidence source：**PPTX Slide 3、Slide 5。
- **Claim boundary：**未取得批准的高風險操作，不能因 Agent 能執行就視為已授權。
- **Follow-up question：**哪些步驟必須保留 Human Approval？

### Q3｜為什麼第一個 Agent 任務要從唯讀開始？

- **Short answer：**因為唯讀任務較容易限制影響範圍、核對輸出並在異常時停止。
- **Expanded answer：**簡報建議第一個任務只盤點指定 Markdown，先讀 AGENTS.md 與任務包，輸出後停止，再確認沒有未預期變更。這讓參與者先熟悉 Scope、Source Authority 與證據格式。
- **Evidence source：**PPTX Slide 8、Slide 10、Slide 13。
- **Claim boundary：**Read-only 降低變更風險，但不代表可忽略機密性；仍要限制可讀取的檔案。
- **Follow-up question：**第一個唯讀工作包的輸入與停止點是什麼？

## CIA Triad and security controls

### Q4｜CIA Triad 如何對應 Agent 操作？

- **Short answer：**Confidentiality 對應不當讀取或外傳，Integrity 對應未授權修改，Availability 對應中斷服務或耗盡資源。
- **Expanded answer：**Files 與 Credentials 可能影響機密性；Files、Shell 與高權限帳號可能影響完整性；Shell、Network 與 Runtime 操作可能影響可用性。CIA 是分類風險的共同語言，不是單一安全產品。
- **Evidence source：**PPTX Slide 3、Slide 4。
- **Claim boundary：**CIA 分類不代表風險已被控制；仍需檢查實際工具、權限與批准流程。
- **Follow-up question：**這次工作包對三個面向各自有哪些控制？

### Q5｜簡報提出哪些共同安全控制？

- **Short answer：**最小權限、預設拒絕、職責分離與可稽核性。
- **Expanded answer：**最小權限限制工具與資料範圍；預設拒絕要求未明確允許的行為先停止；職責分離讓執行與批准不由同一角色自動完成；可稽核性要求保存 Scope、Diff、命令與驗證證據。
- **Evidence source：**PPTX Slide 4、Slide 5、Slide 23。
- **Claim boundary：**投影片說明的是治理原則，不代表每個工具目前都已技術性強制實作全部控制。
- **Follow-up question：**哪些控制是流程規則，哪些已由工具強制？

### Q6｜為什麼本地模型不等於資料一定安全？

- **Short answer：**因為推論在本機只處理模型位置，Agent 仍可能擁有檔案、Shell、網路與憑證權限。
- **Expanded answer：**Ollama 在本機提供推論服務，但 Repository 與工具操作由 Codex 介面與 Harness 控制。若 Agent 仍能讀取敏感檔案或連到外部網路，資料風險並不會因模型在本地就自動消失。
- **Evidence source：**PPTX Slide 4、Slide 9、Slide 17。
- **Claim boundary：**沒有針對目前 Windows 環境做資料流或網路實測，因此整體資料安全狀態為 **UNVERIFIED**。
- **Follow-up question：**實際部署時是否停用外部網路並限制可讀路徑？

## Git workflow

### Q7｜為什麼 Git 不是安全 Sandbox？

- **Short answer：**因為 Git 只能管理被追蹤內容與歷史，不能阻止作業系統層的讀檔、網路、Secret 或 Runtime 操作。
- **Expanded answer：**Branch、Diff、Commit、PR 與 Revert 能支援隔離和審查，但 Agent 仍可能修改 Repo 外檔案、執行破壞性 Shell 或接觸遠端主機。Git Revert 也不等於 Runtime rollback。
- **Evidence source：**PPTX Slide 6 及既有 Speaker Notes。
- **Claim boundary：**不能把「有 Branch」寫成「Agent 已被完整隔離」。
- **Follow-up question：**Repo 外資源由哪一層限制？

### Q8｜為什麼禁止直接 Push main？

- **Short answer：**因為直接 Push main 會繞過 Branch 隔離、Diff Review 與 Pull Request 的人工審查流程。
- **Expanded answer：**主簡報要求以 Branch 保存工作差異，再經 Review 與 Human Approval 決定是否合併。Slide 16 的底線是 Read-only 起步且不直接修改 main。
- **Evidence source：**PPTX Slide 5、Slide 6、Slide 16、附錄 B。
- **Claim boundary：**簡報說明的是本專案的安全工作原則；不延伸成所有 Repository 的通用政策。
- **Follow-up question：**這次工作包允許建立哪一類 Branch？

### Q9｜執行 Pull 前為什麼要先檢查 Working Tree？

- **Short answer：**因為本機未處理的變更可能與同步內容衝突，或讓後續差異與來源難以判讀。
- **Expanded answer：**簡報把「已有 Repo」與「第一次 Clone」分開。已有 Repo 時先看 Working Tree 與 Branch，確認安全後才同步並讀目前進度。
- **Evidence source：**PPTX Slide 10、附錄 B。
- **Claim boundary：**本次交付沒有執行 Pull 或其他 Git 指令；投影片只是流程說明。
- **Follow-up question：**若 Working Tree 不乾淨，誰決定如何處理既有變更？

### Q10｜Squash Merge 為什麼會影響 Branch 刪除判斷？

- **Short answer：**因為 Squash Merge 在 main 建立新的單一 Commit，原分支 Commit 不一定成為 main 的祖先。
- **Expanded answer：**Git 的安全刪除判斷依 Commit ancestry；即使內容已透過 Squash Merge 進入 main，branch -d 仍可能顯示 not fully merged。附錄 B2 因此要求先以 PR state、Base Branch 與 Squash Commit 驗證，再考慮 branch -D。
- **Evidence source：**PPTX Slide 20 及既有 Speaker Notes；v3.1 Revision Report。
- **Claim boundary：**不得用 branch -D 略過尚未 Review、尚未 Merge 或仍包含唯一成果的 branch。
- **Follow-up question：**PR 的 MERGED 狀態與 main 上的 Squash Commit 是否都已確認？

### Q11｜reset --hard 為什麼可以出現在教材？

- **Short answer：**因為教材要說明受控例外的前置條件與風險，不是把它列為日常指令。
- **Expanded answer：**附錄 B2 只在 Working Tree clean、origin/main 已確認為權威、本機額外 Commit 不需保留為正式歷史，且已建立 Backup Branch 時，才描述 reset --hard 的用途。頁面同時禁止 Force Push main、直接 Merge 或跳過歷史比對。
- **Evidence source：**PPTX Slide 20 及既有 Speaker Notes；v3.1 Revision Report。
- **Claim boundary：**本次沒有執行 reset --hard，也沒有授權在目前 Repository 執行；實際案例需重新取證與批准。
- **Follow-up question：**如果其中一個前置條件不成立，安全停止點是什麼？

## SSH and identity

### Q12｜專用 SSH Key 是否已限制 Agent 權限？

- **Short answer：**沒有這項證據；專用 Key 只分離登入身分。
- **Expanded answer：**SSH Key 處理 Authentication。登入後能存取哪些檔案、命令與 sudo，仍由 Linux 帳號與系統 Authorization 決定。
- **Evidence source：**PPTX Slide 7 及既有 Speaker Notes。
- **Claim boundary：** **UNKNOWN：**來源沒有證明已部署低權限帳號、命令白名單或其他 Linux 權限限制。
- **Follow-up question：**目標帳號目前有哪些檔案、命令與 sudo 權限？

### Q13｜Authentication 與 Authorization 有何不同？

- **Short answer：**Authentication 驗證身分；Authorization 決定該身分可以做什麼。
- **Expanded answer：**專用 SSH Key 可驗證登入身分並獨立撤銷，但不會自動改變 Linux 帳號的有效權限。兩者必須分開設計與驗證。
- **Evidence source：**PPTX Slide 7。
- **Claim boundary：**成功登入不能當成操作已獲批准的證據。
- **Follow-up question：**高風險命令是否還有額外 Approval Gate？

## Source Authority

### Q14｜Source Authority 與 Authorization 有何不同？

- **Short answer：**Source Authority 決定哪份資料可作為判斷依據；Authorization 決定系統允許執行什麼操作。
- **Expanded answer：**正式狀態文件、已驗證紀錄或核准決策可能具有較高 Source Authority，但它們本身不會授予 Shell、檔案或 Runtime 權限。反過來，帳號有權限也不代表手上的資訊是最新或權威的。
- **Evidence source：**PPTX Slide 7、Slide 11。
- **Claim boundary：**不要把「文件說明某程序」解讀為「目前已授權執行該程序」。
- **Follow-up question：**這個問題的最新且適用來源是哪一份？

### Q15｜README、AGENTS、PROGRESS、SKILL 與 CONTRIBUTING 各自負責什麼？

- **Short answer：**README 是入口，AGENTS 是安全邊界，PROGRESS 是工程進度，SKILL 是程序與 Gate，CONTRIBUTING 是 Git 協作流程。
- **Expanded answer：**這些文件的新鮮度與證明能力不同。README 的狀態可能過期；SKILL 定義怎麼做，但不等於現在獲得授權；CONTRIBUTING 也不能單獨證明 Runtime 現況。
- **Evidence source：**PPTX Slide 11。
- **Claim boundary：**任何文件都要搭配日期、任務問題與其他證據核對，不能只憑檔名判定。
- **Follow-up question：**若文件互相矛盾，哪個 Gate 應先停止並要求人工裁決？

### Q16｜對話摘要或 Handoff 可以直接算已確認事實嗎？

- **Short answer：**不可以，必須先和目前 Repository、正式狀態或 Runtime evidence 核對。
- **Expanded answer：**Source Authority 的重點是適用性、時效與可追溯證據。對話或 Handoff 可提供線索，但不能自動取代目前的 PROGRESS、命令輸出或核准紀錄。
- **Evidence source：**PPTX Slide 7、Slide 11 的 Source Authority 定義。
- **Claim boundary：**沒有現行證據時應標示 UNKNOWN，而不是從舊摘要補成現況。
- **Follow-up question：**目前缺少哪一項可直接驗證的證據？

## Codex / Ollama / Local Model

### Q17｜Codex、Ollama 與模型分別負責什麼？

- **Short answer：**Codex 管理任務與工具，Ollama 提供本地推論服務，模型負責理解、生成與推理。
- **Expanded answer：**Codex App／CLI 接收任務、管理工作迴圈並套用 Sandbox／Approval；Ollama 載入模型並提供本機 API；Qwen3、Gemma 4 等模型產生內容或工具呼叫建議。
- **Evidence source：**PPTX Slide 9 及既有 Speaker Notes。
- **Claim boundary：**這是元件角色說明，不是 Windows 實機整合 PASS 證據。
- **Follow-up question：**Repository 工具操作在哪一層被批准或拒絕？

### Q18｜Local Model 會直接取得 Repository 或 Shell 嗎？

- **Short answer：**不會直接取得；工具動作必須經 Agent 介面與權限控制。
- **Expanded answer：**模型接收推論輸入並產生輸出或工具建議。是否能讀 Repository、執行 Shell 或使用網路，由 Codex Harness 的工具與權限決定。
- **Evidence source：**PPTX Slide 9。
- **Claim boundary：**不能把架構設計說明當成每個實際部署都已正確隔離；部署狀態仍須驗證。
- **Follow-up question：**目前 Harness 實際暴露哪些工具？

### Q19｜Windows 是否已經實際驗證？

- **Short answer：**沒有；目前為 **UNVERIFIED**。
- **Expanded answer：**附錄 A 的命令經文件核對，但既有 Speaker Notes 明確寫出未在 Windows 實機執行。模型載入、記憶體、速度與工具呼叫也沒有 Windows 實測結果。
- **Evidence source：**PPTX Slide 8、Slide 17、Slide 18；v3.1 Revision Report。
- **Claim boundary：**不得把「官方文件列出 Windows 支援」改寫成「本專案已完成 Windows 驗證」。
- **Follow-up question：**Windows 實測的最小驗收矩陣要包含哪些項目？

## Local model selection

### Q20｜模型參數愈大是否一定愈適合 Agent？

- **Short answer：**不一定。
- **Expanded answer：**較大模型可能改善部分複雜任務，但也增加權重、Context、等待與記憶體成本。Agent 還需要指令遵循、工具格式與 Stop Point 可靠度，必須用相同任務實測。
- **Evidence source：**PPTX Slide 18 及既有 Speaker Notes。
- **Claim boundary：** **UNVERIFIED：**候選模型尚未完成 Windows 效能與工具呼叫比較。
- **Follow-up question：**用來比較候選模型的固定唯讀任務是什麼？

### Q21｜權重、量化、RAM 與 VRAM 分別代表什麼？

- **Short answer：**權重是模型學到的參數；量化是用較低精度保存權重；RAM 是系統記憶體；VRAM 是 GPU 專用記憶體。
- **Expanded answer：**較低精度通常能降低檔案與記憶體需求，但可能影響品質或穩定性。更多模型層能放進 VRAM 時通常較快；VRAM 不足時可能改用 RAM／CPU 或無法載入。
- **Evidence source：**PPTX Slide 18 及既有 Speaker Notes。
- **Claim boundary：**模型下載大小不等於實際 RAM／VRAM 用量；實際需求受量化、Context、GPU Offload 與任務內容影響。
- **Follow-up question：**目標硬體的 RAM、VRAM 與可接受等待時間是多少？

### Q22｜本地模型應如何選擇？

- **Short answer：**先按硬體與任務選候選，再用同一個唯讀任務比較可載入性、速度、記憶體、錯誤與指令遵循。
- **Expanded answer：**評估不能只看參數量。還要比較 Context、繁中與程式理解、工具呼叫格式、Scope 遵循與停止條件，再決定升級或降級。
- **Evidence source：**PPTX Slide 18。
- **Claim boundary：**簡報中的模型卡是候選清單，不是採購、部署或已驗證效能排名。
- **Follow-up question：**哪些指標要在 Windows 實測中記錄？

## 5G SDR Lab01 evidence

### Q23｜Lab01 實際驗證了哪些項目？

- **Short answer：**已有證據支持 EPC、eNB、UE initialization、ZeroMQ 2000／2001、Cell Search、RA、RRC Connected、Attach、UE IP、雙向 ICMP 0% packet loss與受控關閉。
- **Expanded answer：**流程經過 Read-only Inventory、備份與授權 Gate、受控 Runtime Validation、Controlled Shutdown，再以進度與 Git 紀錄收束。Slide 12 把治理、Runtime evidence 與驗證結果分開呈現。
- **Evidence source：**PPTX Slide 12 及既有 Speaker Notes；v3.1 Revision Report。
- **Claim boundary：**這些是既有 Engineering Closeout 證據，不表示 Runtime 現在正在運行。
- **Follow-up question：**每項 PASS 的原始 Evidence 與時間點在哪裡？

### Q24｜現在 Lab01 Runtime 是否仍在運行？

- **Short answer：**簡報不支持這項結論；目前狀態應回答 **UNKNOWN**。
- **Expanded answer：**Slide 12 明確說明它使用已完成流程的既有 Evidence，並不重新啟動 Runtime，也不表示服務現在正在運行。若要確認現況，需要另行授權與即時 Runtime evidence。
- **Evidence source：**PPTX Slide 12 Speaker Notes。
- **Claim boundary：**本次任務禁止 Runtime access，因此沒有做現況查詢。
- **Follow-up question：**若要確認現況，誰能授權、需要哪些非侵入式證據？

### Q25｜為什麼沒有宣稱 Throughput 或 URLLC？

- **Short answer：**因為現有來源沒有支持它們已完成或已測試。
- **Expanded answer：**完成宣稱限於 initialization、ZeroMQ、Attach、UE IP、雙向 ICMP 與 Controlled Shutdown。NAT／Internet、Throughput、Wireshark／PCAP、URLLC 與 MBMS 被明確列在完成邊界之外。
- **Evidence source：**PPTX Slide 12 及既有 Speaker Notes。
- **Claim boundary：**未測試或不在範圍內的項目維持 NOT TESTED／NOT COMPLETED；不能用一般技術推論補成專案成果。
- **Follow-up question：**未來若要驗證 Throughput，需新增哪些授權與驗收證據？

### Q26｜Phase 4A–4C PASS／CLOSED 代表整個 5G SDR 專案完成嗎？

- **Short answer：**不代表；它只描述 Lab01 Recovery 的既定階段已收束。
- **Expanded answer：**Slide 12 的 PASS／CLOSED 對應該次盤點、備份與授權、受控驗證及關閉流程。後續 Lab、NAT、Throughput、URLLC、MBMS 或其他研究方向仍不在這個完成宣稱內。
- **Evidence source：**PPTX Slide 12、Slide 13。
- **Claim boundary：**不得把特定 Phase closeout 擴張成整個專案或所有 Lab 已完成。
- **Follow-up question：**下一個工作包要處理哪一個明確、可驗收的未完成範圍？

## ACP

### Q27｜ACP 是否在降低品質要求？

- **Short answer：**不是；ACP 是固定本輪已約定的完成標準，並把真正缺陷與下一輪改善分開。
- **Expanded answer：**原需求錯誤、重大 Bug、安全問題或 Architecture 違反仍可阻塞本輪；排版、延伸分析、額外自動化與相鄰重構預設進下一輪。必要交付物缺失仍代表 Minimum Done 未達成。
- **Evidence source：**PPTX Slide 14、Slide 15 及 Speaker Notes；ACP Parking Note。
- **Claim boundary：**ACP 不允許用「Nice-to-have」掩蓋缺少必要交付物或已知重大錯誤。
- **Follow-up question：**這個新問題是成果缺陷，還是下一輪能做得更好的地方？

### Q28｜ACP 現在是否已正式採用？

- **Short answer：**沒有；目前為 **PARKING / OBSERVATION**。
- **Expanded answer：**目前只先累積案例，不制定 KPI、完整 Rubric、自動化或正式 Repository Policy。生命週期後續可能進入 Draft、Pilot 與 Protocol，但尚未到達。
- **Evidence source：**PPTX Slide 14、Slide 15；ACP Parking Note；v3.1 Revision Report。
- **Claim boundary：**不得宣稱 ACP 已是正式制度、正式 Protocol 或已完成成效驗證。
- **Follow-up question：**要從 Observation 進入 Draft，最低需要哪些案例與決策？
