# Boundary Contract v0.1

## Preserve

下列內容先抽取為 protected invariants，再重寫表達：

- Technical facts 與正式 domain terminology；可旁註解釋，不重新命名。
- Command semantics、命令順序、arguments、數值／單位、IP／port／interface、config／decoder
  parameters；換行或整理不得改其意義。需要更動技術值時另提 finding，不在 Humanizer 修改。
- Evidence provenance、來源形式、時間／session 範圍與 observation status。
- Claim strength、預期與實際 observation 的區分。
- Warning、limitation、unknown、stop condition 與所需授權。

## Allowed Rewrite

改善 reader path、拆分過長敘述、用有來源的必要解釋銜接術語；區分 Action、Observation、
Interpretation，減少重複，依讀者程度調整深度。不能因改善可讀性而擴張 technical truth。

### Claim Strength Check

| 類別 | 寫法與檢查 |
| --- | --- |
| Observation | 誰／何種材料在何範圍觀察到什麼；保留 direct、reported、historical 標記 |
| Interpretation | 只說明該 observation 可支持的窄結論，不混入未觀察的結果 |
| Hypothesis | 明示為假設／可能性及尚缺的證據，不寫成原因或建議修復 |
| Unknown | 保留 `UNKNOWN`／`UNRESOLVED`／insufficient evidence，不用流暢文字填補 |

重寫前後逐一比對。這是 claim 分類，不把所有 observation 都提升為直接驗證。

### Boundary-Aware Compression

可合併重複句，但 warning／limitation 必須在操作或結果判讀當下可見。
Reviewer 索引可移至附註；若移動後讀者會把 recommendation 當 verified fix，或把
reference 當 current-session evidence，就不能這樣壓縮。原文的 unknown 與停止條件不可消失。

## Forbidden Transformations

| 不可進行的轉換 | 必須保留的差別 |
| --- | --- |
| Symptom → Root cause | 錯誤訊息與已證明原因不同 |
| Correlation → Causation | 同時／先後事件不自動構成因果 |
| Reported → Independently verified | 回報與獨立複核不同 |
| Bounded → Universal | 一次／有限觀察不能保證每次或長期結果 |
| Configuration present → Runtime success | 設定存在不代表執行成功 |
| Reference evidence → Current-session evidence | 範例不能成為讀者本次結果 |
| Decode observation → Complete application success | 某層解碼不證明完整應用結果 |
| Unknown → Certainty | 證據不足不能補成確定敘述 |

不得新增 unsupported fix、causal explanation、performance／capacity claim；decoder failure
或 zero matches 不自動證明 protocol absence。各領域的 claim 仍依該任務來源判斷。

## Boundary Diff Checklist

- [ ] Technical facts、術語意義、command semantics 與 technical values 不變。
- [ ] Evidence source、provenance、時間／session 範圍及預期／實際 observation 不變。
- [ ] Claim strength 不變；Observation／Interpretation／Hypothesis／Unknown 仍分開。
- [ ] Warning、limitation、unknown、stop condition 均保留在需要判讀的位置。
- [ ] 未加入 unsupported generalization、causation、fix 或成功宣稱。
- [ ] 讀者能辨認 why、action、observation、interpretation 與何時停止。

逐項附簡短比對結果；不適用可寫 `N/A` 並說明，未做／無法確認不得填 PASS。
