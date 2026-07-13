# 5G SDR Lab01 Baseline Recovery Slide Assets Plan

- 文件狀態：`DRAFT / NEEDS_REVIEW`
- 適用簡報：`2026-07-14-lab01-presentation-outline.md`
- 最新技術權威：Lab01 Baseline Recovery Part 3、`PROGRESS.md` Phase 4C checkpoint 與本輪 approved human-review corrections
- 視覺邊界：綠色只代表有直接 evidence 的 `KNOWN`／`PASS`；灰色代表 `NOT TESTED`／`NOT COMPLETED`／future；橘色代表 approval；紅色代表 residue／stop condition。
- 產製原則：優先使用可編輯向量圖；screenshot 僅能使用已去識別、已核准且不含 credentials、subscriber data、完整 runtime config 或原始 logs 的素材。

## Evidence Key

| ID | Evidence |
| --- | --- |
| E01 | Lab01 Baseline Recovery Part 3 任務包 |
| E02 | `PROGRESS.md` Phase 4C checkpoint |
| E03 | `.agents/skills/lab01-baseline-recovery/SKILL.md` |
| E04 | `docs/audits/2026-07-10-rollback-inventory.md` |
| E05 | `docs/engineering/CONFIGURATION_GOVERNANCE.md` |
| E06 | `docs/engineering/CODEX_REMOTE_AGENT_POLICY.md` |
| E07 | `docs/ai-workflow.md` |
| E08 | `CONTRIBUTING.md` |
| E09 | Git history：PR #8／#10／#12／#13 對應的 checkpoint commits |
| E10 | Historical Lab01 README／runbook／result／known-issues（lower authority） |
| E11 | Approved human-review corrections：Phase 4C observed RTT 與 EPC log ownership conflict evidence |
| G01 | [GitHub：About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) |
| G02 | [GitHub：About merge methods](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github) |
| G03 | [GitHub：Automatic deletion of branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-the-automatic-deletion-of-branches) |
| G04 | [Git：`git pull`](https://git-scm.com/docs/git-pull) 與 [Git：`git branch`](https://git-scm.com/docs/git-branch) |
| G05 | [Git：`git reset`](https://git-scm.com/docs/git-reset) |

## Slide 1｜問題定義：如何找回可信、可重現的 Lab01

- **Visual objective：** 讓觀眾在十秒內理解「來源存在」與「可信 baseline」之間的 trust gap。
- **Recommended asset type：** 三節點 trust-gap flow。
- **Exact content：** `Unverified sources → Paired／traceable evidence → Reviewed baseline`；不列 residue detail。
- **Labels and annotations：** `single file is insufficient`、Host pairing、Version／active selection、Human Review。
- **Suggested layout：** 16:9 橫向三欄，每欄一個核心概念；extended evidence map 以 appendix badge 指向 A1。
- **Source evidence：** E02、E03、E04。
- **Generation method：** Mermaid：可；PowerPoint shapes：可；screenshot：否；table：可作備版；manual redraw：可。
- **Privacy or readability risks：** 不顯示 active config 或完整 evidence IDs；避免在問題定義頁提前塞入分類細節。
- **Priority：** `MUST`

## Slide 2｜原始 Lab01 目標：先建立最小可用 SDR 核心路徑

- **Visual objective：** 區分原始系統目標、Phase 4C 已驗證核心與未測延伸項目。
- **Recommended asset type：** Minimal system topology＋scope legend。
- **Exact content：** Linux1 內含 EPC／eNB，Linux2 內含 UE；兩者以 ZeroMQ sample path 連接；下方畫 `172.16.0.1 ↔ 172.16.0.2` ICMP；NAT／Internet／iperf3／Wireshark 放灰色外框。
- **Labels and annotations：** `ZeroMQ = RF sample transport`、`Phase 4C validated core`、`extended goal—NOT TESTED`。
- **Suggested layout：** 主拓撲置中，灰色延伸項目垂直排列於右側，不畫 Internet 實線箭頭。
- **Source evidence：** E01、E02、E04、簡報 outline Slide 2。
- **Generation method：** Mermaid：可作草圖；PowerPoint shapes：可；screenshot：否；table：可作備版；manual redraw：可。
- **Privacy or readability risks：** 不放 subscriber identifiers；避免把 ZeroMQ 畫成 control-plane message bus 或實體 RF OTA。
- **Priority：** `SHOULD`

## Slide 3｜為何需要 Baseline Recovery

- **Visual objective：** 同時呈現 residue classification 與 source authority ranking。
- **Recommended asset type：** Classification tree＋authority ladder。
- **Exact content：** eMBMS／MBSFN／SIB13／M1 → `EXCLUDE`；ZeroMQ → `PRESERVE`；scheduler／PHY → `CONFIRMED / CANDIDATE / UNKNOWN`；authority 從 runtime evidence 排到 historical material。
- **Labels and annotations：** `CLEAN_CANDIDATE_NOT_HISTORICALLY_CONFIRMED`、`presence ≠ authority`。
- **Suggested layout：** 左 60% classification tree，右 40% authority ladder；field-level table 移到 A1。
- **Source evidence：** E02、E03、E04。
- **Generation method：** Mermaid：可；PowerPoint shapes：可；screenshot：否；table：可作分類備版；manual redraw：可。
- **Privacy or readability risks：** 僅顯示非敏感欄位分類；不可暗示 residue 已透過本簡報部署移除。
- **Priority：** `SHOULD`

## Slide 4｜最終三平面架構

- **Visual objective：** 精確呈現三個 logical plane、三個 subnet、host roles 與 temporary／persistent 邊界。
- **Recommended asset type：** Three-lane architecture diagram。
- **Exact content：** 欄為 Mac／Linux1 EPC-eNB／Linux2 UE；列為 Management `192.168.250.0/24`、Sample `10.0.0.0/24`、User `172.16.0.0/24`；sample row 連 Linux1 `.1` 與 Linux2 `.2`；user row 連 SGi `.1` 與 UE `.2`。
- **Labels and annotations：** `control / Git / approval`、`ZeroMQ samples`、`user-plane ICMP`、`temporary secondary address`、`no sample-plane gateway or DNS`。
- **Suggested layout：** 三泳道全頁；subnet 在左、host cards 在中、persistence badge 在右；fallback 以小型 inset 表示。
- **Source evidence：** E02。
- **Generation method：** Mermaid：可作初稿；PowerPoint shapes：可；screenshot：否；table：可作 address matrix 備版；manual redraw：可。
- **Privacy or readability risks：** 位址只使用 repository 已公開角色 IP；不可把 logical subnet 畫成三張實體 NIC；不可畫 Internet connectivity。
- **Priority：** `MUST`

## Slide 5｜Recovery Pipeline：從證據到可控執行

- **Visual objective：** 只呈現 recovery 的七個工作階段與先後順序。
- **Recommended asset type：** Stage-gated pipeline。
- **Exact content：** Inventory → Compare → Plan → Human Approval → Backup／Migration → Bring-up／Validate → Shutdown／Handoff。
- **Labels and annotations：** 每節點最多一行 purpose；`Human Approval` 使用橘色 gate。
- **Suggested layout：** 單列七節點箭頭，不放 state badges、STOP arrows 或 artifact ledger。
- **Source evidence：** E02、E03、E05。
- **Generation method：** Mermaid：可；PowerPoint shapes：可；screenshot：否；table：可作備版；manual redraw：可。
- **Privacy or readability risks：** 不展示 backup 內容或 secrets；避免把 plan 自動等同 deployment authorization。
- **Priority：** `MUST`

## Slide 6｜Gate／State Machine：每一步都可停

- **Visual objective：** 說明 states、approval transitions、STOP 與 rollback semantics。
- **Recommended asset type：** Finite-state diagram。
- **Exact content：** `PENDING → AUTHORIZED → PASS / CLOSED → HANDOFF → NEEDS_APPROVAL`；conflict／unexpected result → `STOP → approved rollback → review`。
- **Labels and annotations：** `scope-bound approval`、`no blanket approval`、`rollback = backup + mapping + validation; not Git reset`。
- **Suggested layout：** 主路徑單列，STOP／rollback 分支置下；Phase 2E–4C ledger 移到 A2。
- **Source evidence：** E02、E03、E09。
- **Generation method：** Mermaid：可；PowerPoint shapes：可；screenshot：否；table：可作 gate ledger 備版；manual redraw：可。
- **Privacy or readability risks：** 不把 `PASS / CLOSED` 畫成永久授權；不在主頁塞入所有 phase labels。
- **Priority：** `MUST`

## Slide 7｜Runtime Bring-up：固定順序降低歧義

- **Visual objective：** 一眼看懂啟動、驗證與反向 shutdown 的 dependency order。
- **Recommended asset type：** Mirrored sequence diagram／timeline。
- **Exact content：** 上半部 C0 Preflight → EPC → eNB → UE；下半部 UE Stop → eNB Stop → EPC Stop。
- **Labels and annotations：** `verified dependency order`、`next starts after prerequisite`、`services running after shutdown = false`。
- **Suggested layout：** 三條 host lifeline＋中央 gate column；shutdown 使用反向箭頭與較淡色系。
- **Source evidence：** E02、E07。
- **Generation method：** Mermaid：可；PowerPoint shapes：可；screenshot：否；table：可作 sequence ledger 備版；manual redraw：可。
- **Privacy or readability risks：** 不加入 validation badges或未公開 command；不將 initialization 等同長時間穩定性。
- **Priority：** `MUST`

## Slide 8｜Validation Results：只報告直接證據支持的 PASS

- **Visual objective：** 以四群矩陣呈現 validated connectivity 與未測 scope。
- **Recommended asset type：** Validation matrix table。
- **Exact content：** Groups：Network and runtime；Attach and protocol；User plane；Not tested。
- **Labels and annotations：** User plane 顯示 `0% packet loss`、`observed average RTT 600–700 ms`；旁註 limited sample count／duration／traffic load／controlled methodology。
- **Suggested layout：** 2×2 cards 或四群 table；每群最多三行，詳細 row-level matrix 移到 A5。
- **Source evidence：** E01、E02、E11、claim audit C13–C16／C22–C24。
- **Generation method：** Mermaid：不建議；PowerPoint shapes：可用於 badges；screenshot：否；table：可且為首選；manual redraw：可。
- **Privacy or readability risks：** RTT 不可使用 performance badge；避免 `low latency`、`URLLC`、`reliable`、`stable`、`benchmark` 或「Lab01 fully validated」。
- **Priority：** `MUST`

## Slide 9｜Problems and Fixes：先定位層級，再做最小處置

- **Visual objective：** 連結每個問題、evidence、最小處置與 guardrail。
- **Recommended asset type：** Four-column problem table。
- **Exact content：** Rows：Lab02 residue、historical topology mismatch、sample-path uncertainty、EPC log ownership conflict；columns：Problem、Evidence、Minimal action、Boundary。
- **Labels and annotations：** EPC row：pre-existing `user:user` → preserve old log → remove conflict source → successful restart → recreated `root:root`。
- **Suggested layout：** 2×2 cards 或四列表格；每列右下角附 E02／E04。
- **Source evidence：** E02、E04、E11。
- **Generation method：** Mermaid：可作 card flow；PowerPoint shapes：可；screenshot：條件式可、需核准去識別素材；table：可；manual redraw：可且為預設。
- **Privacy or readability risks：** `user:user`／`root:root` 是 ownership labels，不是私人 alias；不可補寫 evidence 外 root cause 或顯示 log 內容。
- **Priority：** `SHOULD`

## Slide 10｜Agent／Codex Workflow：Human-Owned Architecture

- **Visual objective：** 精確回答 Codex 如何讀取規範、執行工作並回到人工 review。
- **Recommended asset type：** Required-document five-node chain。
- **Exact content：** `AGENTS.md → SKILL.md → PROGRESS.md → Codex execution → Human Review`。
- **Labels and annotations：** `scope`、`procedure`、`state`、`minimum action`、`approval / reject / revise`、`no autonomous main push`。
- **Suggested layout：** 單列五節點 chain；完整 Human／Codex swimlane 移到 A6。
- **Source evidence：** E02、E03、E06、E07。
- **Generation method：** Mermaid：可；PowerPoint shapes：可；screenshot：否；table：可作 responsibility matrix 備版；manual redraw：可。
- **Privacy or readability risks：** 不把 Codex 畫成最終決策者；不展示 prompt 中可能含有的私人資訊。
- **Priority：** `MUST`

## Slide 11｜GitHub PR Workflow：把證據變成可審查 checkpoint

- **Visual objective：** 只呈現正常、可審查的 Git／PR lifecycle。
- **Recommended asset type：** 單一路徑 Git lifecycle。
- **Exact content：** `branch → commit → push → PR → Review／Checks → Squash Merge → sync main → cleanup topic branch`。
- **Labels and annotations：** `target workflow—not executed by this draft`、privacy／claim check、checkpoint #8／#10／#12／#13。
- **Suggested layout：** 全頁單列流程；Git recovery移到 A3，Squash cleanup edge cases 移到 A4。
- **Source evidence：** E05、E08、E09、G01–G05。
- **Generation method：** Mermaid：可；PowerPoint shapes：可；screenshot：不建議；table：可作 command／condition 備版；manual redraw：可。
- **Privacy or readability risks：** 不顯示 remote URL、帳號或 private repository metadata；主頁不出現 reset／`-D` 指令。
- **Priority：** `MUST`

## Slide 12｜What Was Not Tested：明確定義成果邊界

- **Visual objective：** 防止觀眾把 Attach／ICMP PASS 外推成完整功能或性能驗證。
- **Recommended asset type：** 三欄 scope boundary cards。
- **Exact content：** Connectivity extensions；Observability and performance；Parked research。
- **Labels and annotations：** NAT／Internet／TCP／iperf3；Wireshark／PCAP／controlled performance methodology；MBMS／SIB13／URLLC／OTA／MIMO／6G NTN。
- **Suggested layout：** 三等寬灰色欄；RTT callout 位於 Observability 下方，明示 connectivity-only observation。
- **Source evidence：** E01、E02、E11、claim audit C16／C22–C24。
- **Generation method：** Mermaid：不建議；PowerPoint shapes：可；screenshot：否；table：可作無障礙備版；manual redraw：可。
- **Privacy or readability risks：** 灰色對比需足夠；MBMS residue exclusion 不可視覺化成 MBMS functional PASS。
- **Priority：** `MUST`

## Slide 13｜Engineering Value：把一次成功轉成治理能力

- **Visual objective：** 把工程價值連回 evidence，不使用未測 KPI。
- **Recommended asset type：** Evidence-to-value map。
- **Exact content：** 左側 Evidence／Paired comparison／Gates／Invariants／PR checkpoints；右側對應 Traceability／Isolation／Safety／Reproducibility／Handoff；每條連線附 evidence ID。
- **Labels and annotations：** `qualitative engineering value`、`not latency / throughput evidence`。
- **Suggested layout：** 左右雙欄 mapping；底部以 Human Approval 作共同基座。
- **Source evidence：** E02、E03、E05–E09、claim audit C25。
- **Generation method：** Mermaid：可；PowerPoint shapes：可；screenshot：否；table：可作文字版；manual redraw：可。
- **Privacy or readability risks：** 不使用柱高暗示量化改善；不加入 reliability／coverage 數字。
- **Priority：** `SHOULD`

## Slide 14｜Next Steps：從已關閉 milestone 進入新核准週期

- **Visual objective：** 只顯示下一個 approval-gated work cycle。
- **Recommended asset type：** 單一閉環 cycle。
- **Exact content：** Review／Handoff → Select one narrow scope → Define package → Human Approval → Minimum execution → Evidence review。
- **Labels and annotations：** Package＝success criteria／commands／evidence／abort／rollback／roles；`NEEDS_APPROVAL`。
- **Suggested layout：** 六節點環形或水平 loop；不列出完整 exclusions。
- **Source evidence：** E01、E02、E03、claim audit C26。
- **Generation method：** Mermaid：可作初稿；PowerPoint shapes：可；screenshot：否；table：可作 roadmap ledger 備版；manual redraw：可。
- **Privacy or readability risks：** 不把 roadmap 畫成已承諾排程；不暗示未來工作已獲資源或 runtime 授權。
- **Priority：** `MUST`

## Appendix／Backup Assets

- **A1 Extended evidence map：** Source authority、claim IDs、host pairing、field-level classifications。
- **A2 Detailed gate／protocol ledger：** Phase 2E–4C、C0–C4 與 protocol validation layers。
- **A3 Git recovery decision tree：** `pull --ff-only` failure、dirty/diverged/upstream checks、reset preconditions、repository/runtime boundary。
- **A4 Squash branch cleanup：** branch deletion warning、content verification、local-only commits、safety reference、reviewed `branch -D` handling。
- **A5 Detailed validation matrix：** Direct evidence、0% loss、600–700 ms observed RTT、limited methodology 與 not-tested KPIs。
- **A6 Human／Agent swimlane：** Detailed responsibility、approval 與 handoff loop。

## Asset Production Order

1. `MUST`：Slide 1、4、5、6、7、8、10、11、12、14。
2. `SHOULD`：Slide 2、3、9、13。
3. `OPTIONAL`：去識別 screenshot；僅在 Human Reviewer 明確核准來源與裁切範圍後加入。
4. Main assets 完成後再產 A1–A6；逐一回查 claim audit，確認 RTT 只作 connectivity observation，且沒有新增 performance、MBMS、URLLC、OTA 或 Git 執行聲明。
