# 5G SDR Agent + Git + Security Presentation v3.1 修訂報告

## 結果

- 任務狀態：**PASS（Presentation-only）**
- 以 v3 PowerPoint 為基底完成 v3.1 定點修訂；主簡報維持 16 頁、內容順序未改，總頁數由 23 增為 24。
- 僅改寫主簡報第 15 頁、修改附錄模型頁第 18 頁，並在既有附錄 B 後插入第 20 頁「附錄 B2」。原第 20–23 頁順延為第 21–24 頁。
- 未修改 Repository、未存取 Lab Runtime，亦未執行簡報中的 Git recovery／branch cleanup 指令。

## 來源權威

1. v3.1 任務包：頁面範圍、精確文案、驗收條件與 STOP POINT。
2. `Acceptance Calibration Protocol（ACP）.md`：ACP 的 Need／Nice-to-have 校準機制及 `PARKING / OBSERVATION` 生命週期狀態。
3. v3 簡報：已通過 Review 的視覺語言、16 頁主簡報與既有附錄內容。
4. 官方 Git／GitHub 文件：
   - <https://git-scm.com/docs/git-pull>
   - <https://git-scm.com/docs/git-reset>
   - <https://git-scm.com/docs/git-branch>
   - <https://docs.github.com/en/pull-requests/reference/pull-request-merges>
   - <https://cli.github.com/manual/gh_pr_view>

## 修訂內容

### 第 15 頁｜ACP 快照

- 改題為「ACP 快照｜固定本輪標準，阻止 Scope Creep」。
- 主視覺改為「沒有校準時 → ACP 校準閘門 → 目前生命週期」，不再重複上一頁三張大型 Minimum／Target／Stretch 卡片。
- 明確區分：原需求錯誤、重大 Bug、安全問題、Architecture 違反屬本輪 `Need`；排版、延伸分析、額外自動化與相鄰重構預設屬下一輪 `Nice-to-have`。
- 保留 `PARKING / OBSERVATION`，未宣稱 ACP 已成為正式 Protocol、KPI、完整 Rubric、自動化或 Repository Policy。
- Speaker Notes 已加入任務包指定講稿，並補充「必要交付物缺失代表 Minimum Done 尚未達成，不是 Reviewer 新增靈感」。

### 第 18 頁｜本地模型選擇 Glossary

- 保留上方低資源、平衡、進階三張候選模型卡。
- 下半部改為 2×3 Mini Glossary Cards，分別解釋：權重／量化、RAM／VRAM、Context、速度、中文／程式理解、工具呼叫。
- 保留相同 Read-only Task 的候選模型比較流程。
- 加入警示：模型下載大小不等於實際 RAM／VRAM 用量；量化、Context、GPU Offload 與任務內容都會影響實際需求。
- 模型候選與 Windows 執行效能仍屬**未實機驗證**，沒有宣稱較大模型一定較適合 Agent。

### 第 20 頁｜附錄 B2 Git 例外處理

- 左欄：`git pull --ff-only` 因 diverged 失敗時，先確認 Working Tree clean、比對歷史、建立 Backup Branch，再於權威遠端已確認時使用 `reset --hard`。
- 右欄：PR 已 Squash Merge 但 `branch -d` 顯示未完全合併時，先以 `gh pr view` 驗證 `MERGED`、Base Branch 與 merge commit，再處理本機／遠端 branch。
- 破壞性指令前均有文字 Preconditions、警告圖示與紅色 Warning 區塊。
- 明示不得 Force Push main，且 `reset --hard`、`branch -D` 只屬受控例外，不是日常 Git 流程。
- 本次僅把官方文件核對後的命令寫入投影片；**沒有實際執行任何 recovery 或 branch deletion**。

## 驗證證據

- PowerPoint 總頁數：24。
- PDF 總頁數：24；頁面尺寸 960×540 pt，無加密、無 JavaScript。
- `slides_test.py`：PASS，`No overflow detected`。
- Template fidelity check：PASS，0 issue。
- 逐頁視覺檢查：24/24；未見文字截斷、卡片重疊或新增頁造成的頁碼錯置。
- PDF 重新渲染檢查：第 15、18、20、24 頁與 PowerPoint render 一致。
- 關鍵字檢查：`PARKING / OBSERVATION`、Backup Branch、`gh pr view`、`branch -D`、不得 Force Push main 均存在。
- 禁止字樣檢查：未發現私人稱謂、私人角色名稱、`Qwen Code` 或未解析 placeholder 文案。
- Slidesgo design attribution 保留於最後一頁。
- Repository 最終狀態：`main...origin/main`、HEAD `3387ce003f2aef839b444c6fa169f25ea4922de5`、Working Tree clean。

## 產出檔案

1. `5G_SDR_Agent_Git_Security_Team_Onboarding_Brief_2026-07-28_v3.1.pptx`
2. `5G_SDR_Agent_Git_Security_Team_Onboarding_Brief_2026-07-28_v3.1.pdf`
3. `5G_SDR_deck_contact_sheet_v3.1.png`
4. `5G_SDR_presentation_revision_report_v3.1.md`

## 風險與未解事項

- ACP 目前仍為 `PARKING / OBSERVATION`；是否進入 Draft、Pilot 或 Protocol 需另行決策。
- 模型候選的 Windows 可載入性、速度、RAM／VRAM、工具呼叫可靠度均未實機測試。
- Git 例外頁是教學與受控 playbook；實際使用仍須針對當時 Repository、PR 與遠端權威狀態重新取證。

## STOP POINT

四份 v3.1 產物已產出並完成靜態、結構與視覺驗證。依任務包停止自主美化，不新增其他 Git 情境，等待人工 Review。
