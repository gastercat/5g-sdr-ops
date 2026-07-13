# 5G SDR Lab01 Baseline Recovery 圖表規劃

- 文件狀態：`DRAFT / NEEDS_REVIEW`
- 目的：定義簡報每頁的 visual grammar、資料來源與防止過度聲明的標示方式。
- 共通圖例：綠色＝`PASS / KNOWN`；藍色＝architecture／controlled action；橘色＝approval gate；灰色＝not tested／future；紅色＝stop condition／residue。
- 安全規則：不放 credentials、subscriber identifiers、完整 active config、原始 log、PCAP 或未去識別截圖。

## Slide 1｜Baseline 信任差距圖

- **圖型：** 簡化 trust-gap 三節點圖。
- **構圖：** `Unverified sources → Paired／traceable evidence → Reviewed baseline`。
- **關鍵標籤：** `single file is insufficient`、Host pairing、Version／active selection、Human Review。
- **避免誤導：** 主頁不列 residue 清單或完整 evidence map；只定義問題。

## Slide 2｜原始最小拓撲圖

- **圖型：** 節點連線圖。
- **構圖：** Linux1（EPC＋eNB）←→ ZeroMQ sample path ←→ Linux2（UE）；下方接 user-plane ICMP。
- **關鍵標籤：** EPC → eNB → UE、Attach、`172.16.0.1 ↔ 172.16.0.2`。
- **避免誤導：** NAT、Internet、iperf3、Wireshark 放在灰色虛線框「original／extended goal; not validated in Phase 4C」。

## Slide 3｜Residue 分類與 Source Authority

- **圖型：** 左側 classification tree＋右側 authority ladder。
- **分類：** Lab02 residue → `EXCLUDE`；ZeroMQ → `PRESERVE`；scheduler／PHY → `CONFIRMED / CANDIDATE / UNKNOWN`。
- **Authority ladder：** Runtime evidence → approved snapshot → paired config → matching example → historical material。
- **避免誤導：** `CLEAN_CANDIDATE_NOT_HISTORICALLY_CONFIRMED` 不畫成 exact historical truth；完整欄位表移到 appendix。

## Slide 4｜三平面架構圖

- **圖型：** 三條水平泳道 × 三個節點欄。
- **Management plane：** Mac `.10`、Linux1 `.11`、Linux2 `.12`，subnet `192.168.250.0/24`。
- **Sample plane：** Linux1 `10.0.0.1`、Linux2 `10.0.0.2`；標記 `temporary secondary addresses`。
- **User plane：** EPC SGi `172.16.0.1`、UE `172.16.0.2`；只畫兩端，不延伸 Internet cloud。
- **避免誤導：** switched Ethernet 標為 controlled migration；歷史 USB／Wi-Fi 只在角落畫作 fallback。

## Slide 5｜Recovery Pipeline

- **圖型：** 左至右 pipeline。
- **節點：** Inventory → Compare → Plan → Human Approval → Backup／Migration → Bring-up／Validate → Shutdown／Handoff。
- **主頁限制：** 只顯示七階段名稱與一行目的，不加 state badges、STOP arrows 或 artifact ledger。
- **避免誤導：** Human Approval 是獨立節點；pipeline 不表示自動 execution。

## Slide 6｜Gate／State Machine

- **圖型：** 有向狀態機。
- **主路徑：** `PENDING → AUTHORIZED → PASS / CLOSED → HANDOFF → NEEDS_APPROVAL`。
- **STOP 分支：** conflict／unexpected result → `STOP → approved rollback → review`。
- **Rollback annotation：** Backup＋source-to-target mapping＋validation；`not Git reset`。
- **避免誤導：** 主頁只表達 state semantics，不再逐一列 Phase 2E–4C 節點。

## Slide 7｜Bring-up／Shutdown 鏡像時間軸

- **圖型：** 上下雙時間軸。
- **Bring-up：** C0 Preflight → EPC → eNB → UE。
- **Shutdown：** UE → eNB → EPC。
- **Dependency annotation：** Next layer starts only after prerequisite is acceptable。
- **避免誤導：** 時間軸結尾加 `services running = false`。

## Slide 8｜Grouped Validation Matrix

- **圖型：** 四群矩陣。
- **Network and runtime：** management／sample connectivity、service initialization、controlled shutdown。
- **Attach and protocol：** ZeroMQ、cell search、RA、RRC、Attach。
- **User plane：** assigned IPs、bidirectional ICMP 0% loss、observed average RTT 600–700 ms。
- **Not tested：** NAT、Internet、TCP／iperf3、Wireshark／PCAP、controlled performance validation。
- **避免誤導：** RTT 旁固定標 `connectivity observation; limited sample count／duration／load／methodology; not a benchmark`。

## Slide 9｜Problem／Fix／Guardrail 表

- **圖型：** 四列、四欄表格。
- **欄位：** Problem、Evidence、Minimal fix、Guardrail。
- **列：** Lab02 residue、歷史 topology mismatch、sample-path uncertainty、EPC log ownership conflict。
- **EPC evidence row：** pre-existing `user:user` log → preserve old log → remove conflict source → successful EPC restart → recreated `root:root` log。
- **避免誤導：** 不補充 evidence 外的 root cause；residue 處置不可畫成未記錄的 active-config deployment。

## Slide 10｜五節點 Agent Document Chain

- **圖型：** 單列五節點 chain。
- **節點：** `AGENTS.md → SKILL.md → PROGRESS.md → Codex execution → Human Review`。
- **副標：** Scope → Procedure → State → Scoped work → Approval／Acceptance。
- **控制點：** 主頁不加雙泳道；完整 Human／Agent responsibility swimlane 放 appendix。

## Slide 11｜Normal Git／PR Workflow

- **圖型：** 單一路徑 lifecycle。
- **流程：** branch → commit → push → PR → Review／Checks → Squash Merge → sync main → cleanup topic branch。
- **Checkpoint inset：** PR #8、#10、#12、#13 只作歷史例子。
- **避免誤導：** 主頁不畫 `pull --ff-only`、reset、deletion warning 或 `branch -D`；本草稿尚未 commit／push／PR。

## Slide 12｜三群 Scope Boundary

- **圖型：** 三欄灰色 boundary cards。
- **Connectivity extensions：** NAT、Internet、TCP、iperf3。
- **Observability and performance：** Wireshark／PCAP、throughput、controlled latency／reliability／stability／benchmark methodology。
- **Parked research：** MBMS／SIB13、URLLC、B210 OTA、2x2 MIMO、6G LEO／NTN。
- **避免誤導：** 600–700 ms 只標為 observed ICMP RTT，不可放在 PASS performance badge。

## Slide 13｜Engineering Value Pillars

- **圖型：** 五柱圖，不使用量化高度。
- **柱名：** Isolation、Traceability、Safety、Reproducibility、Handoff。
- **基座：** Evidence + Governance + Human Approval。
- **避免誤導：** 不加入 latency、throughput、coverage 或 reliability 數字。

## Slide 14｜Next Approval-Gated Work Cycle

- **圖型：** 單一閉環 cycle。
- **路徑：** Review／Handoff → Select one narrow scope → Define package → Human Approval → Minimum execution → Evidence review。
- **Package callout：** Success criteria、commands、evidence、abort、rollback、roles。
- **避免誤導：** 不重列 exclusion list、不標日期或完成百分比；approval 前不進 execution。

## Appendix／Backup Diagrams

- **A1 Extended evidence map：** Source authority、claim IDs、host pairing 與 field-level classifications。
- **A2 Detailed gate／protocol ledger：** Phase 2E–4C、C0–C4 與 validation layers。
- **A3 Git recovery decision tree：** `pull --ff-only` failure → inspect dirty state／divergence／upstream／Squash history → preserve work → Human Review。
- **A4 Squash branch cleanup：** PR merged? content verified? local-only commits? safety reference? → safe `-d` or reviewed `-D` decision。
- **A5 Detailed validation matrix：** Direct evidence、RTT observation caveats、not-tested KPI 與 claim boundaries。
- **A6 Human／Agent swimlane：** Scope／procedure／state／execution／approval responsibility detail。

## 產圖與審查清單

- 所有 IP 僅使用 repository 已公開的角色位址，不加入 credentials 或 subscriber data。
- 所有 `PASS` 徽章必須能回指 claim-evidence audit 的 evidence ID。
- 所有未測項目固定使用灰色與 `NOT TESTED`，不以「planned success」措辭呈現。
- 匯出前檢查色彩對比、字級、箭頭方向與 Linux1／Linux2 role pairing。
- 本文件只規劃視覺，不產生 runtime topology 變更或新的驗證結果。
