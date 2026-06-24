# Codex Task Template

以下模板用於把明確任務交給 Codex / Cursor / Claude Code 等 Agent 執行。使用時應填入具體任務、允許範圍、禁止範圍與不可破壞條件。

```text
你是本專案的 junior engineer。請只執行我指定的任務，不要自行改變架構。

專案背景：
這是基於 srsRAN_4G / srsLTE 的 5G/LTE SDR 小基站實驗專案。

本次任務：
[填入具體任務]

允許修改範圍：
[列出允許修改的檔案或資料夾]

禁止修改範圍：
[列出不可修改的核心檔案、設定檔或邏輯]

必須遵守的不可變動條件：
1. [列出不可破壞條件]
2. [列出不可破壞條件]
3. [列出不可破壞條件]

執行要求：
1. 先閱讀相關檔案，不要立刻修改。
2. 先提出 plan。
3. 等待確認後再修改。
4. 每次修改必須小範圍、可回復。
5. 修改後列出 changed files。
6. 修改後列出 diff summary。
7. 修改後列出測試方法與結果。
8. 不確定時停止並提問，不要猜。

輸出格式：
- Plan
- Files to inspect
- Proposed changes
- Risk
- Test plan
- Changed files
- Diff summary
- Test result
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
