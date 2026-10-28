---
name: boundary-preserving-humanizer
description: Rewrite technical documentation for reader clarity while preserving facts, command semantics, evidence provenance, uncertainty, limitations, and claim strength. Use for documentation Humanizer or reader-path rewrites, not technical validation or unrelated tasks.
---

# Boundary-Preserving Humanizer

狀態：`LOCAL_PROTOTYPE / SELF_CHECKED`；七個案例為 `7/7 EXECUTOR_SELF_CHECKED`，
不是 `INDEPENDENT_AGENT_VALIDATED`；Human Review 仍須另行接受。

## Purpose

Humanization changes the reader path, not the technical truth.
讓讀者知道現在看哪一層、為何做這一步、應觀察什麼，以及結果能／不能支持什麼。
本 Skill 不授予 Runtime、Git、對外發布或 canonicalization authority；適用 repository
controls 與本次任務授權優先。

## When to Use

用於已指定技術來源與讀者的文件易讀化、學生手冊 Humanizer 或說明路徑重寫。
跨領域可使用同一方法；LTE／eMBMS 只是案例，不是輸入前提。

## When NOT to Use

不把原始技術驗證、Runtime debugging、功能實作、單純盤點或只要求逐字保存的任務
強制轉成 Humanizer。需要技術修正時，另列 finding；不藉潤飾直接修正 source truth。

## Required Inputs

- 指定的 source、authoritative context、來源優先順序與已知 evidence boundary。
- 目標讀者、重寫範圍、輸出位置，以及原稿是否必須 byte-preserving。
- 適用的 accepted calibration／style contract（若有）；沒有時不假定已接受。

可先從已授權材料恢復資訊。若必要來源缺少、互相矛盾或不能判定 claim strength，
標記 `UNKNOWN`／`UNRESOLVED` 並停止受影響 claim 的重寫；其餘可安全部分繼續。

## Workflow 與 Boundary Extraction

```text
Read source and authoritative context
→ Extract protected invariants → Choose reader path → Produce candidate
→ Run Boundary Diff → Report changes / uncertainties → Human Review
```

最小必經路徑：**Source Boundary → Rewrite Candidate → Boundary Diff → Human Review**。
開始前讀 [boundary contract](references/boundary-contract.md)，列出本次 protected invariants：
術語、命令／值、來源與時間範圍、claim strength、warning、limitation、unknown、stop condition。
區分 Observation、Interpretation、Hypothesis、Unknown；預期結果與實際結果分開。

## Reader-Path Rewrite

先給 Reader Anchor：這段回答什麼問題、在哪一層或剛發生什麼。依段落選路徑，
不強迫所有 procedure 使用相同 heading：

- Explanation：Why this matters → What to look for／do → What you should see
  → What it means → What it does NOT prove。
- Troubleshooting：What happened? → Check this first → Why this check matters
  → What the result means → What it does NOT prove → When to stop and ask Instructor。
  非教學文件以本次指定的負責角色取代 Instructor。

拆分 Action、Observation、Interpretation；術語保留正式名稱，必要解釋須有來源支持。
已清楚的 procedure 可輕量整理。需參考短例時讀 [examples](references/examples.md)；
案例不能替代本次的 domain evidence。

## Persona Polish

依指定語言與讀者調整語句和轉場；未指定 persona 時不另造角色。
不以口語別名取代正式術語，不改 command semantics，不加入新的因果、修復或成功宣稱。
Reviewer provenance 可移至 review note，但當下判讀所需的限制留在正文。

## Boundary Diff

逐項對照 source 與 candidate，使用 boundary contract 的 checklist；記錄受保護值與來源
是否一致。移動或壓縮 caveat 時，確認讀者在做決策處仍看得到它。
未檢查的項目寫 `NOT CHECKED`，證據不足寫 `INCONCLUSIVE`；不能用整體 PASS 掩蓋未知。
發現 regression 時修正 candidate 後重查，不改 authoritative source 配合 candidate。

## Human Review Gate 與 Conditional Operations

交付為 candidate；最終接受、canonical selection、staging／commit／push 或發布由 Human
Reviewer／Owner 另行決定。本 Skill 不把先前文件的接受當作本次自動接受。

| Conditional operation | 使用時機 |
| --- | --- |
| Additional Calibration | 品質不穩或領域差異重大，需要先校準段落 |
| Whole-Manual Proposal | 文件規模、風險或重排幅度較大，需要先審 reader path |
| Grill-me | 需要檢查讀者理解或表達能力，且本次範圍允許 |
| Gap Patch | Review 發現具體且可在授權內處理的缺口 |

不無條件執行以上步驟；未執行就如實記錄，不補寫 PASS。

## Stop Conditions

- 必要來源缺失、provenance conflict、重要術語或 claim 無法安全解釋。
- 發現 secret 或重大技術問題；不將敏感值帶入輸出，不自行重寫 accepted artifact。
- 繼續需要 Runtime、新 capture、未授權的 source mutation 或其他範圍外操作。

停止受影響部分，回報 finding、保留 unknown 與所需決策；不以猜測填補。

## Required Output

提供 candidate／精確路徑、來源與 invariants、主要 reader-path 改動、Boundary Diff 結果、
未解事項及 Human Review gate。保存原稿時附 byte comparison；有執行 smoke 才報實際結果。
需要檢查 Skill 本身時使用 [smoke cases](tests/smoke-cases.md)，不因本次文件 rewrite
自動啟動全套 Skill 測試或額外校準。歷史 Human Review 不能替代新 Skill 的測試。
