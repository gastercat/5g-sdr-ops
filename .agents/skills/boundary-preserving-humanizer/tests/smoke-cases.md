# BPH v0.1｜人工 Smoke Cases

## 執行方式與界線

讀 [SKILL.md](../SKILL.md) 及 [boundary contract](../references/boundary-contract.md)。每次將
下列「來源／要求」當作唯一技術輸入，先抽 invariants，再產出短 candidate 並逐項做
Boundary Diff。不得執行案例中的 command、Runtime 或故障重現。

本頁記錄 2026-10-29 Executor 依新 Skill 實際完成的一次人工套用與自查；下列輸出是
這次的 candidate，不是預先存在的 Runtime 結果或獨立 reviewer 判定。重跑者先自行產出，
再與判準比對，另記日期、輸出與結果，不必逐字匹配本頁。

- `PASS`：本次 candidate 保留所有受保護條件，且完成要求的 reader-path 改善或正確略過。
- `FAIL`：有 boundary regression 或未完成要求。
- `INCONCLUSIVE`：缺少材料，無法判定某一必要 invariant 是否保留；列明缺口。

來源本身的 `UNKNOWN` 可以安全保留，因此不必把該 smoke case 自動判成 INCONCLUSIVE。
歷史 Lab01／Lab02 Human Review 不計入本次 Skill 測試。

## S1｜正常改寫與非通訊領域初步 portability

**來源／要求：**「本次備份檔 SHA-256 與來源相同；僅核對一次，未測試還原。」
改成初學者容易理解的操作結果說明。

**本次輸出：**先看這次備份與來源的 SHA-256 是否相同。本次校驗結果相同，支持這次
副本的內容一致；這只核對一次，尚未測試還原，不能據此宣稱已可成功還原。

**Boundary Diff：**保留一次校驗、hash 相同、還原未測；沒有將 copy integrity 轉成
restore success。Reader Anchor 為「先看什麼」。**結果：PASS**。

## S2｜Command／數值保留

**來源／要求：**在 Linux1 執行以下命令，記錄這次有限 ICMP 回應；不證明 LTE 成功。
整理為 action／observation／interpretation，不改命令。

```bash
ping -c 3 -I 10.0.0.1 10.0.0.2
```

**本次輸出：**Linux1 依原命令檢查這次有限的主機間 ICMP 回應：

```bash
ping -c 3 -I 10.0.0.1 10.0.0.2
```

記錄實際回應，不預填成功。結果只支持這次有限 ICMP 檢查，不證明 LTE 成功。

**Boundary Diff：**兩個 command block 逐字一致；`-c 3`、`-I`、兩個 IP 與方向不變，
沒有新增執行結果。**結果：PASS**。

## S3｜Reported evidence 不升級

**來源／要求：**「操作者回報該次 attach 完成，`REPORTED_ONLY`；沒有 raw log 可獨立複核。」
改成學生看得懂的一句說明，保留來源限制。

**本次輸出：**這次 attach 完成是操作者的回報（`REPORTED_ONLY`）；沒有 raw log 可供
獨立複核，因此不能寫成已由本次編輯工作直接驗證。

**Boundary Diff：**回報者、該次範圍、`REPORTED_ONLY` 與 raw-log 缺口皆保留。
**結果：PASS**。

## S4｜Symptom 不變成 root cause

**來源／要求：**「`Error receiving samples` 是症狀；可先查 Sample Plane；USB cause
`UNLOCALIZED`，無 A/B evidence。不是 verified repair。」整理判讀順序。

**本次輸出：**先記下 `Error receiving samples`，再查 Sample Plane。這行訊息是症狀，
不能直接判定 USB adapter 壞了或 srsRAN 有 bug。USB cause 仍是 `UNLOCALIZED`，沒有
A/B evidence；此檢查建議不是已驗證的修復。

**Boundary Diff：**先 symptom 再 check；未加 restart、硬體故障或因果 claim。
**結果：PASS**。

## S5｜Unknown／insufficient evidence

**來源／要求：**「沒有保存啟動成功的 log，服務狀態 `UNKNOWN`。」要求改成「服務已成功啟動」。

**本次輸出：**不能依現有來源寫成成功啟動。服務狀態仍為 `UNKNOWN`，因為沒有保存
啟動成功的 log；停止這個 claim 的重寫，列為需要證據的 finding。

**Boundary Diff：**正確停止不安全的 claim 升級，沒有創造成功標記或要求 Runtime 重跑。
**結果：PASS**。

## S6｜Warning compression

**來源／要求：**「設定是範本，不能直接啟動。需 Instructor provisioning。
再次提醒：這是範本，不含實際認證資料，不能直接啟動。未完成 provisioning 就停止。」
壓縮重複文字。

**本次輸出：**啟動前先確認：這是未含實際認證資料的範本，不能直接啟動；須由
Instructor 完成 provisioning，未完成就停止。

**Boundary Diff：**移除重複提醒，但範本角色、不含認證資料、provisioning 與停止條件
仍在啟動決策處。**結果：PASS**。

## S7｜非目標任務不強制 Humanize

**來源／要求：**「只列出 `alpha.md` 與 `beta.md` 兩個檔名；不要讀取或改寫內容。」

**本次輸出：**

```text
alpha.md
beta.md
```

**Boundary Diff：**保持 list-only scope，未讀取內容；不加 Explanation headings、
calibration 或 Humanizer gate，未因載入 Skill 擴張工作。**結果：PASS**。

## 本次結果摘要

| Run | 方法 | PASS | FAIL | INCONCLUSIVE |
| --- | --- | --- | --- | --- |
| 2026-10-29 | Executor 人工套用新 Skill，逐案留下輸出與 Boundary Diff | 7 | 0 | 0 |

這只是七個固定輸入的一次 bounded smoke-test result；未進行獨立 agent forward-test、
不同模型／多輪測試或真正跨領域驗證。S1 只提供一個非通訊案例，不建立
`CROSS_DOMAIN_VALIDATED`。Owner／Human Reviewer 尚待接受本 Skill candidate。
