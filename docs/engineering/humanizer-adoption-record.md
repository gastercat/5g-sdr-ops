# Boundary-Preserving Humanizer v0.1｜Process Adoption Record

日期：2026-10-29。角色：Owner／Executor／Human Reviewer。
本紀錄為 `HUMAN_REVIEW_REQUIRED` 的納管候選；歷史接受與交付狀態依 Owner 本次
Humanizer Repository Integration v0.1 Task Pack 確認，不是本次重新執行的技術驗證。

## Method Origin 與保存範圍

先在 Lab02 建立 SIB13 → MCCH → MTCH Golden Section 與 troubleshooting calibration；
兩份案例通過 Human Review 後萃取 Style Contract v0.1，完成 Lab02 Whole-Manual
Humanizer。Lab01 直接複用同一 reader-path 方法，技術依據仍分別使用各 Lab 的來源。
兩份學生手冊已完成教授交付，屬 Owner 本次確認的 delivery history。

| 原位保存的文件 | 本次記錄的 lifecycle |
| --- | --- |
| [Style Contract v0.1](../../labs/lab02-embb/student-manual-style-contract-v0.1.md) | `ACCEPTED_METHOD_REFERENCE` |
| [SIB13 → MCCH → MTCH](../../labs/lab02-embb/student-manual-golden-section-sib13-mcch-mtch.md) | `ACCEPTED_CALIBRATION` |
| [Error receiving samples](../../labs/lab02-embb/student-manual-calibration-error-receiving-samples.md) | `ACCEPTED_CALIBRATION` |
| [Lab01 Humanized Manual](../../labs/lab01-small-cell/student-manual-humanized-v0.1.md) | `HUMAN_REVIEWED_DELIVERY_SOURCE` |
| [Lab02 Humanized Manual](../../labs/lab02-embb/student-manual-humanized-v0.1.md) | `HUMAN_REVIEWED_DELIVERY_SOURCE` |

五份文件原位、原名、byte-preserving；內文仍有 draft／candidate／Human Review Required
等當時標記，本次不覆寫。上表只記錄審閱與交付 lifecycle，不將候選稿提升為 canonical
manual，也不賦予 Runtime validation 或操作權限。Repo canonical manual selection 仍 `PENDING`。

## Adopted Workflow

```text
Technical Source
      ↓
Boundary Extraction
      ↓
Reader-Path Rewrite
      ↓
Persona Polish
      ↓
Boundary Diff
      ↓
Human Review
```

Persona Polish 只調整表達；不改正式術語、命令、來源、主張強度或限制。

## Actual Process Deviations

| Step | Actual Disposition |
| --- | --- |
| Third Calibration | `NOT_REQUIRED` |
| Whole-Manual Rewrite Proposal | `BYPASSED` |
| Boundary Diff | `PASS_REPORTED` |
| Full Grill-me | `ABBREVIATED` |
| Gap Patch | `NOT_PERFORMED / NO_BLOCKER_IDENTIFIED` |
| Professor Delivery | `USER_CONFIRMED` |
| Repo Canonical Manual Selection | `PENDING` |

`PASS_REPORTED` 指既有 Executor review report 的結果，不代表本次獨立重驗。
未執行的步驟不補寫 PASS；`NO_BLOCKER_IDENTIFIED` 也不是沒有任何未知或缺口。
本次未重新製作 Word、檢查教授收件或啟動 Runtime。

## Lessons for Reuse

- Calibration 用於品質控制，不是固定次數的形式要求。
- 已有 accepted calibration 且 scope 清楚時，可省略 Whole-Manual Proposal；大幅重排或
  風險較高時再使用，不把本次省略變成通用免審條款。
- Boundary Diff 不可省略；Human Review 保留最終接受權。
- Grill-me 是可選的理解／表達檢查，不自動成為所有文件的 blocker。
- Gap Patch 只在具體 finding 存在時需要；documentation delivery 不等於 Runtime validation。

## 本次納管準備與待決事項

- 準備時 branch 為 `main`，HEAD 為 `4493f6dce87d84f29b842dd46095d7bd983f76a9`。
  本機 `origin/main` 與 HEAD 一致；未向遠端 refresh，不把本機 ref 視為遠端即時狀態。
- 五份成果當時均為 untracked、未命中 ignore 規則；未 stage／commit，未修改
  `.git/info/exclude`。納管完成須另行授權，不宣稱本次已保存於 Git history。
- Lab02 原始 `labs/lab02-embb/student-manual.md` 存在於本機但未追蹤；多份成果仍連至它。
  本機可解析不表示 clean checkout 可解析。該來源的納管／外部保存方式及 canonical
  selection 仍需 Owner 決定；本次不解除其 local exclude，也不修補 accepted artifact。
- 新方法候選位於 `.agents/skills/boundary-preserving-humanizer/SKILL.md`。
  它是另一組待審變更，不追溯改變五份成果的技術 authority；先單獨接受保存範圍，再審方法。

### PR submission：Lab02 source-manual lifecycle

Owner 補充：原始 [Lab02 Student Manual](../../labs/lab02-embb/student-manual.md) 當時因互動
網站工作隔離未提交手冊而加入 local exclude；exclude 不表示內容被拒絕或有已知安全缺陷。
本次 PR 將其原樣納管為 `PRESERVED_SOURCE_DRAFT / NOT_AUTOMATICALLY_CANONICAL`，補足
前述 clean-checkout source link dependency；上段未追蹤狀態保留為準備階段的歷史快照。
原始檔為 19,501 bytes，SHA-256：
`fbd4121f0059f5e621e6d84d3884acbad3c74d5d254d4ed01127c5fd271ea9fd`。
`.git/info/exclude` 不變；納管不等於正式授課接受、Runtime validation 或 canonical selection。

### Byte-preservation baseline（SHA-256）

以下固定本次開始時的檔案版本，供本次前後比對及後續精確納管。未另取得先前 Human Review
的獨立 hash manifest；「已接受」依 Owner 本次指認，不宣稱由 hash 證明歷史接受狀態。

| 文件 | SHA-256 |
| --- | --- |
| Lab01 Humanized Manual | `1e8ed053e6c20dd044bbdfe972043989cb2ec87f62e5e4d394724ff32983281b` |
| Lab02 Humanized Manual | `e6eab8c26f45febc5f1606c1c61e977faf837fa380ab9de2b3e77306d4d3ad34` |
| Style Contract v0.1 | `36d36a6fd966f43adf2878023c0e89d452b63e4eeda7120df36dc2e43ba3b161` |
| Golden Section | `f51963c9ca9671660a832c1aeb5696ded3b58ce42d9e47dd78244d0dfe6a4c76` |
| Troubleshooting Calibration | `92a7819ae68d7ed69b28802b2e17b8e1552a0a8cada3f2960bd1a3266e378da3` |
