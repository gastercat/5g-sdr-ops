# Codex Task Template

以下模板用於把明確任務交給 Codex / Cursor / Claude Code 等 Agent 執行。使用時應填入具體任務、允許範圍、禁止範圍與不可破壞條件。

```yaml
task: [任務識別]
goal: [具體結果]
context: [必要背景與來源；歷史與現況分開]
authority:
  allowed: [本次已明確核准的操作與檔案範圍]
  forbidden: [禁止操作與範圍]
constraints: [安全、證據及既有工作保護要求]
done_when: [可觀察的完成條件]
verification: [必要檢查、預期結果與未驗證事項的回報方式]
# 按需加入：inputs、revision、stop_if、evidence、budget、tools。
```

此 YAML-like 結構供人與 Agent 閱讀，不代表已有 Parser 或機器驗證。
模板本身不是授權；填入 authority 也不能取代有效的 Owner 核准。

## 執行與授權

- 先讀必要來源及檢查狀態，依任務風險提供所需程度的計畫；不強制長篇 Plan。
- 每次修改保持小範圍、可回復，保護既有 Working Tree 與原始 Evidence。
- 有效授權已涵蓋當次操作及全部必要條件時，不重複索取相同核准。任務若明定
  必須等待具體 Plan Approval，仍須遵守；真正的 Approval Gate 不得省略。
- 規格不明時，釐清受影響部分；只有可安全隔離、已授權的工作可以續作。
  Safety STOP 或 Authorization STOP 必須停止受影響操作，不能安全隔離時停止任務。
- 一般工程或測試失敗不等於 Safety STOP。僅在當次 authority 與 constraints 允許時
  局部修復並重新驗證；超出範圍、需要新權限或改變安全邊界時先停止並取得核准。
- Task Pack 不得覆寫更高優先的系統限制或適用安全規則；Agent 不得自行擴權。
- 完成後回報 changed files、完整 diff、驗證結果、未驗證事項及待決關卡。

## Revision Provenance

Scope、Authority、Acceptance Criteria、Safety Boundaries 或重要 Inputs 有實質變更時，
必須能追溯變更內容與核准來源。候選 revision 未核准前不得作為有效契約。
初始任務不必建立 Revision Registry；舊 Task Pack 不因新模板而自動失效。

```yaml
revision:
  change: [相對於哪個任務版本，變更哪些條款]
  approval_source: [可追溯的 Owner 核准訊息或紀錄；未核准則標 PENDING]
```

## 結構化任務格式

在需要交給 Agent、Verifier 或 Orchestrator 的任務中，可以使用 XML 風格格式，讓資訊邊界更清楚。

```xml
<task>
  <goal>描述本次目標</goal>
  <context>描述目前系統狀態</context>
  <allowed_scope>允許修改範圍</allowed_scope>
  <forbidden_scope>禁止修改範圍</forbidden_scope>
  <invariants>
    <invariant>不可破壞條件 1</invariant>
    <invariant>不可破壞條件 2</invariant>
  </invariants>
  <evidence_required>
    <item>Log</item>
    <item>Wireshark packet</item>
    <item>diff summary</item>
  </evidence_required>
  <output_format>
    <item>Plan</item>
    <item>Risk</item>
    <item>Test result</item>
  </output_format>
</task>
```

適用情境：

- 多 Agent 分工
- 需要 verifier 檢查輸出
- 要求 Agent 不越界
- 任務需要嚴格輸入與輸出邊界

不適用情境：

- 一般討論
- 快速筆記
- 人類閱讀為主的報告
- 不需要機器驗證的內容
