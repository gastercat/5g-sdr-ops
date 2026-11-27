# 2026-12-18 成果發表大綱與證據對照（草案）

[Delivery 入口](README.md) · [目前進度](../PROGRESS.md) · [已知限制](../docs/known-limitations.md) ·
[決策登錄](../docs/decision-register.md)

狀態：`DRAFT / NEEDS_CONFIRMATION / NOT A DELIVERY REQUIREMENT`

這份草案整理 2026-12-18 成果發表可用的故事線、每個主張能引用的證據與說法界線，以及到發表日為止的時程。
它不新增 Lab 驗收條件，不代表任何 Lab 已完成，也不授權 Runtime 或 RF 操作。表中的證據等級沿用
[PROGRESS](../PROGRESS.md) 與各份 Task Evidence Record 的標記，發表時的說法不得比來源更肯定。

## 1. 待確認事項

下列項目決定發表的形式與取捨，目前 Repository 沒有任何來源，須由 Owner 向教授確認。

| 項目 | 狀態 | 影響 |
| --- | --- | --- |
| 發表形式（簡報、海報、書面報告或現場展示） | `NEEDS_CONFIRMATION` | 決定要不要另做書面成果報告 |
| 發表時長與問答時間 | `NEEDS_CONFIRMATION` | 決定第 2 節各段的篇幅 |
| 聽眾與評分重點（Lab01～03 交付或研究延伸） | `NEEDS_CONFIRMATION` | 決定 AI 雙路徑占多少篇幅 |
| 指定的成果包檔案與繳交位置 | `NEEDS_CONFIRMATION` | Repo 內找不到「小基站架設與量測成果報告.pdf」，舊簡報不自動等同成果報告 |
| [Lab01 完成標準提案](lab01-completion-criteria-proposal.md)的教授 Review | `PENDING PROFESSOR REVIEW` | 決定 Lab01 能否在發表中寫成「依標準完成」 |

## 2. 故事線

主軸是從單一小基站走到雙路徑可靠度：先建立 LTE 連線，再觀察廣播與可靠度的取捨，最後把雙路徑傳送做成可以量測的控制策略，
Security 穿插在各段裡，不另開一段 Runtime。各段的篇幅比例是建議值，確認時長後再換算成分鐘。

| 段落 | 篇幅 | 要讓聽眾記住的事 | 主要素材 |
| --- | --- | --- | --- |
| 1. 動機與環境 | 10% | 兩台 Linux 主機、USRP B210、法拉第籠，srsRAN 4G 開源堆疊 | [架構](../docs/architecture-overview.md)、[硬體紀錄](../docs/hardware-notes.md) |
| 2. Lab01 小基站 | 20% | 能從原始碼建置並建立 Attach，也清楚哪一步還沒通過 | E1、E2、E3 |
| 3. Lab02 eMBMS | 15% | 用同一份封包紀錄看到 SIB13、MCCH、MTCH，應用層 multicast 收發一致 | E4、E5 |
| 4. Lab03 OTA 與雙路徑 | 20% | 增益問題的排除過程，以及 OTA 上的 Split 與 Duplication 量測 | E6、E7、E8 |
| 5. AI 雙路徑策略 | 20% | 規則層加 LinUCB 的控制器，OTA 比較結果與 netem 劣化實驗 | E9～E12、E15，沿用 12/04 決賽材料 |
| 6. Security Lens | 10% | 在不開獨立 Lab04 的前提下，Tailcat 架構的一次執行結果 | E13、E14 |
| 7. 限制與下一步 | 5% | 尚未驗證的項目與原因 | 第 4 節 |

第 4 段與第 5 段的銜接點是 11/12 留下的缺口：當時沒有注入劣化，Duplication 的可靠度效益沒有被展示，
第 5 段的 netem 實驗就是為了補這個缺口。

## 3. 證據對照表

「可以說」欄是建議的發表說法，「不能說」欄列出容易被說過頭的地方。來源中的原始證據多數在 Repo 外，
現場若被要求出示原始資料，以 TER 的 provenance 說明位置，不臨時改口成已驗證。

| 編號 | 可以說 | 證據等級 | 來源 | 不能說 |
| --- | --- | --- | --- | --- |
| E1 | 固定版本的 srsRAN_4G 已完成乾淨建置、ZeroMQ 建置與上游測試 | `KNOWN / EV-1 PASS` | [PROGRESS](../PROGRESS.md#current-status) | 任何全新 Ubuntu 都能重現安裝 |
| E2 | 2026-08-24 以歷史設定恢復到 Attach，UE 取得位址 | `KNOWN / BOUNDED` | [PROGRESS](../PROGRESS.md#current-status) | Lab01 完成、EV-2 PASS、Full Lab01 PASS |
| E3 | EV-2 的 R5（UE 到 EPC 的 ICMP）目前未通過，原因尚未定位 | `FAIL / UNLOCALIZED` | [PROGRESS](../PROGRESS.md#current-status) | R5 與 USB 斷線有因果關係 |
| E4 | Lab02 應用層 multicast 送出與接收內容一致 | `OBSERVED` | [PROGRESS](../PROGRESS.md#lab02-session-b-closeout2026-0925-26) | Lab02 已是可執行的學生實驗 |
| E5 | 同一份 PCAP 直接看到 SIB13、MCCH、MTCH | `OBSERVED` | [B.3D TER](../docs/evidence/task-evidence/2026-09-26-lab02-b3d-sib13-mcch-mtch.yaml) | 完整的 eMBMS 效能驗證 |
| E6 | 發射增益 30 時 UE 收不到下行，提高後可解 MIB，增益過低是主因 | `OBSERVED`，主因屬推論 | [Lab03 OTA TER](../docs/evidence/task-evidence/2026-11-12-lab03-b210-ota-baseline-split-dup.yaml) | 已用儀器確認原因 |
| E7 | B210 OTA Attach 成功一次，單路 UDP 1000／1000，來回延遲中位數約 18 ms | `OBSERVED / BOUNDED` | 同上 | URLLC、可靠度或效能驗證 |
| E8 | OTA 與有線雙路徑的 Split（2:3）與 Duplication 各量測一次，皆 0% loss | `OBSERVED / APPLICATION_LAYER_ONLY` | 同上 | PDCP 層實作、Duplication 已證明提升可靠度 |
| E9 | 七種策略在 OTA 上各 3 輪，路徑 A 穩定時只走 A 在 30 ms 內已達 99.87% | `OBSERVED / APPLICATION_LAYER_ONLY` | [AI 雙路徑 OTA TER](../docs/evidence/task-evidence/2026-11-16-ai-dualpath-ota-policy-comparison.yaml) | 自適應策略優於固定策略 |
| E10 | 目前的結果裡 LinUCB 沒有勝過門檻規則，兩者落在同一條副本數與達成率的取捨線上 | `OBSERVED` | [AI 雙路徑 README](../exploration/ai-dualpath/README.md#限制) | AI 策略比規則好 |
| E11 | 分段調低增益後路徑 A 僅出現少量劣化，離線重播下各策略差距不超過 0.25 個百分點 | `OBSERVED / BOUNDED` | [AI 雙路徑 OTA TER](../docs/evidence/task-evidence/2026-11-16-ai-dualpath-ota-policy-comparison.yaml) | 真實劣化下的線上比較結果 |
| E12 | 以 `tc netem` 在路徑 A 注入劣化的做法已確認有效 | `OBSERVED`（`INJECTED_IP`） | [netem TER](../docs/evidence/task-evidence/2026-11-26-ai-dualpath-netem-schedule.yaml) | netem 下的策略比較結果，見下方說明 |
| E13 | 教授同意以 Tailcat 架構作為 Security Lens，不另開獨立 Lab04 | `ACCEPTED / REPORTED_BY_OWNER` | [DR-016](../docs/decision-register.md#dr-016tailcat-security-lens-作為-security-cross-cutting-的實作方向) | Repo 內有教授的書面意見 |
| E14 | 2026-11-19 執行一次，T0、T2～T8 通過，T1 完成，T8 同日補做 | `OBSERVED` | [Lab04 TER](../docs/evidence/task-evidence/2026-11-19-lab04-tailcat-security-lens.yaml) | Lab01～03 的 Security mapping 已完成 |
| E15 | 2026-11-27 在同一個 netem 長排程下七種策略各 3 輪：輕度階段門檻規則與全部複製無顯著差異但副本數 1.92，LinUCB 以約 1.3 的副本數換來低 4～5.5 個百分點；正常階段只走 A 已與全部複製相當；重度階段各策略無法區分 | `OBSERVED`（路徑 A `INJECTED_IP`、路徑 B `SIMULATED`；配對 bootstrap 95% CI） | [netem 比較 TER](../docs/evidence/task-evidence/2026-11-27-ai-dualpath-netem-policy-comparison.yaml)、[P0 重新分析 TER](docs/evidence/task-evidence/2026-11-27-ai-dualpath-netem-p0-reanalysis.yaml) | OTA 或無線劣化下的結果、LinUCB 接近全部複製、重度劣化時某個策略較好、真實衛星鏈路 |

E12 之後的 netem 策略比較已在 2026-11-27 執行並留下 TER（E15，[PR 71](https://github.com/gastercat/5g-sdr-ops/pull/71)）。
發表時依 E15 的「可以說」：結果只代表這一個 IP 層注入排程，不是 OTA 或無線劣化；重度階段只有三輪、每輪約 750 個封包，
不用來排名策略。

## 4. 限制與下一步（第 7 段素材）

- Lab01：完成標準仍待教授 Review，依標準的 fresh run 尚未執行，R5 尚未定位。
- Lab02：已有協定層證據，但沒有學生最小流程，目前不是進行中的交付。
- Lab03：只有一次 OTA 量測，Split 與 Duplication 在應用層實作，PDCP 層的做法仍待決定。
- AI 雙路徑：路徑 B 的類 LEO 特性是模擬，延遲是來回時間；netem 比較只代表一個 IP 層注入排程，OTA 或無線劣化下的線上比較尚未完成。
- Security：Lab01～03 的整體 topic mapping 仍為 `PENDING`。

## 5. 時程

| 期間 | 工作 | 是否需要 Runtime 授權 |
| --- | --- | --- |
| 11/26～11/29 | 向教授確認第 1 節的待確認事項，同時請教授 Review Lab01 完成標準提案 | 否 |
| 11/26～12/03 | 以 `netem_comparison.py` 執行策略比較並建立 TER（11/27 已完成，E15）；準備 12/04 決賽 | 比較已於 11/27 經 Owner 授權執行 |
| 12/05～12/10 | 撰寫 Lab03 學生最小流程、Security cross-cutting mapping，把決賽材料拆進第 5 段 | 否 |
| 12/08 前後 | 選做：依 Lab01 完成標準執行一次 fresh run，保留緩衝以免 R5 重現時來不及 | 需要 |
| 12/11～12/16 | 依確認後的形式製作簡報或報告，演練一次並對照第 3 節檢查每個主張 | 否 |
| 12/17 | 凍結版本，確認互動網頁與展示素材可離線開啟 | 否 |

## 6. 預期問答

| 可能的問題 | 回答方向 | 依據 |
| --- | --- | --- |
| Lab01 算完成了嗎？ | 能建立 Attach，R5 尚未通過，完成標準在教授 Review 中 | E2、E3 |
| 為什麼 AI 策略沒有比較好？ | 路徑 A 穩定時只走 A 就夠；netem 注入輕度劣化時，LinUCB 是用較少副本換略低的送達率（約 1.3 份、低 4～5.5 個百分點），門檻規則則接近全部複製也接近 2 份副本，兩者是取捨而不是勝負 | E9、E10、E15 |
| Duplication 到底有沒有用？ | 11/12 沒有劣化，效益未展示；11/27 netem 注入下，輕度階段全部複製約 59%、只走 A 約 27%，重度階段 37% 對 0%，代價是 2 倍副本 | E8、E15 |
| 這是 URLLC 嗎？ | 不是 3GPP 等級的 URLLC 驗證，是應用層的雙路徑實驗 | E7、E8 |
| 類 LEO 鏈路是真的衛星嗎？ | 不是，是傳送端以應用層模擬的時變特性，參數為假設值 | E9 |

## 7. 可用的展示素材

- [互動實驗網頁](../exploration/5g-sdr-interactive-lab/index.html)，含 Lab03 OTA 與 AI 雙路徑頁面。
- [2026-07-14 Lab01 簡報](../docs/presentations/2026-07-14-lab01-baseline-recovery.pptx)，可沿用環境介紹，但內容早於 8/24 與之後的證據，需更新。
- 12/04 決賽的 A0 海報與 7 分鐘展示稿（`NOT_FOUND_IN_REPO`，完成後再決定是否放入 Repository）。
