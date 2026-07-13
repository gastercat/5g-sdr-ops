# 5G SDR Lab01 Baseline Recovery 簡報大綱

- 文件狀態：`DRAFT / NEEDS_REVIEW`
- 基準日期：2026-07-14
- 最新權威來源：Lab01 Baseline Recovery Part 3、`PROGRESS.md` Phase 4C checkpoint，以及本輪已核准 human-review evidence corrections
- 作業邊界：本稿只描述已留有證據的結果；不代表新的 runtime 啟動、設定部署或延伸測試授權

## Slide 1｜問題定義：如何找回可信、可重現的 Lab01

- 現況檔案、歷史材料與成功 evidence 的權威層級不同，不能混為同一種來源。
- 單一主機、單一檔案或檔案存在本身，都不足以證明 authoritative baseline。
- Linux1／Linux2 pairing、version、active selection 與 ZeroMQ direction 必須能被 trace。
- 問題核心是關閉 trust gap：讓每個 baseline claim 都能回到 evidence 與 human review。

**建議視覺：** 簡化 trust-gap 圖：Unverified sources → Paired evidence → Reviewed baseline；extended evidence map 放 appendix。

## Slide 2｜原始 Lab01 目標：先建立最小可用 SDR 核心路徑

- 原始設計以 Linux1 執行 EPC／eNB、Linux2 執行 UE，ZeroMQ 取代實體 RF sample path。
- 核心流程是依序啟動 EPC → eNB → UE，完成 cell search、Random Access、RRC 與 Attach。
- UE 取得 user-plane 位址後，以雙向 ICMP 驗證最小資料路徑。
- NAT、Internet、TCP／iperf3 與封包擷取屬原始或延伸目標，但不在本次已完成驗證聲明內。

**建議視覺：** Linux1—ZeroMQ—Linux2 的最小拓撲，將「已驗證核心路徑」與「未測延伸目標」分色。

## Slide 3｜為何需要 Baseline Recovery

- Linux1 的 eMBMS／MBSFN／SIB13／M1 與 Linux2 的 MBMS／PHY residue 被分類為非 clean Lab01 元件。
- ZeroMQ 是需保留的 Lab01 component，不可因鄰近 Lab02 residue 而一併移除。
- Authority 依 successful runtime evidence、approved snapshot、paired configuration、matching examples 與歷史材料排序。
- scheduler、expert、PHY 等欄位維持 `CONFIRMED`、`CANDIDATE` 或 `UNKNOWN`，不以存在性冒充歷史真值。

**建議視覺：** Source-authority ladder＋residue classification tree；完整 field-level evidence map 放 appendix。

## Slide 4｜最終三平面架構

- Management plane：`192.168.250.0/24`，由 Mac 控制與審批，Linux1／Linux2 分別使用 `.11`／`.12`。
- Sample plane：`10.0.0.0/24`，Linux1／Linux2 分別使用 `.1`／`.2`，作為暫時 secondary address。
- User plane：`172.16.0.0/24`，EPC SGi 為 `172.16.0.1`，UE 為 `172.16.0.2`。
- Switched Ethernet 是受控遷移方案，不宣稱為歷史拓撲的逐位元回復；歷史 USB／Wi-Fi 拓撲保留為另行核准的 fallback。

**建議視覺：** 三條水平泳道疊在 Mac、Linux1、Linux2 三節點上，清楚標示 plane、subnet 與 persistence。

## Slide 5｜Recovery Pipeline：從證據到可控執行

- 1 Inventory → 2 Compare：建立 paired sources，完成 field-level reconciliation 與 ZeroMQ direction check。
- 3 Plan → 4 Human Approval：先完成 backup、migration、validation、abort、rollback 計畫，再決定是否授權。
- 5 Backup／Migration：驗證 backup package，建立受控、temporary sample-plane topology。
- 6 Bring-up／Validate：依核准順序執行最小 runtime bring-up 與 connectivity validation。
- 7 Shutdown／Handoff：反向停止服務、保存 evidence，後續工作回到新的 approval cycle。

**建議視覺：** 僅畫七節點 pipeline；states、STOP 與 rollback semantics 留到 Slide 6。

## Slide 6｜Gate／State Machine：每一步都可停

- `PENDING` 只有在 evidence package 完整並經 Human Review 後才能轉為 `AUTHORIZED`。
- `AUTHORIZED` 只涵蓋明列的 gate、target、action 與 validation scope，不會自動擴張。
- 預期結果成立才進 `PASS / CLOSED`；衝突、provenance 不明或 unexpected result 立即進 `STOP`。
- Rollback 是依已核准 backup 與 source-to-target mapping 回到先前已知狀態，不是 Git reset。
- Handoff 後任何 runtime、persistent network、deployment 或 extended validation 回到 `NEEDS_APPROVAL`。

**建議視覺：** `PENDING → AUTHORIZED → PASS / CLOSED` 主路徑，並以 `STOP → approved rollback` 與 `NEEDS_APPROVAL` 分支表示語意。

## Slide 7｜Runtime Bring-up：固定順序降低歧義

- C0 preflight 先確認核准範圍與前置狀態，再允許任何 service start。
- Bring-up dependency 固定為 EPC → eNB → UE；下一層只在前一層可接受時開始。
- Runtime observation 集中在三個 service lifecycle，validation 結果留到 Slide 8。
- Shutdown 採 UE → eNB → EPC 的反向順序，先停止依賴端。
- 結束後 `srsepc`、`srsenb`、`srsue` 均未持續執行。

**建議視覺：** 只畫 EPC／eNB／UE lifeline 與鏡像 bring-up／shutdown sequence，不放 validation badges。

## Slide 8｜Validation Results：只報告直接證據支持的 PASS

- **Network and runtime：** management／sample connectivity 已建立；三個 services 成功初始化並完成 controlled shutdown。
- **Attach and protocol：** ZeroMQ transport、cell search、Random Access、RRC Connected 與 Network Attach 已驗證。
- **User plane：** UE=`172.16.0.2`、EPC SGi=`172.16.0.1`；雙向 ICMP packet loss 為 0%，observed average RTT 約 600–700 ms。
- **Result boundary：** RTT 只作 connectivity observation；sample count、duration、traffic load 與 controlled performance methodology 有限，不支持 performance、low-latency、URLLC、reliability、stability 或 benchmark claim。
- **Not tested：** NAT、Internet、TCP／iperf3、Wireshark／PCAP 與受控 performance validation。

**建議視覺：** 四群 validation matrix：Network and runtime、Attach and protocol、User plane、Not tested。

## Slide 9｜Problems and Fixes：先定位層級，再做最小處置

- 問題：Lab02 residue 與 Lab01 元件混雜；處置：成對、逐欄 reconciliation，保留 ZeroMQ 並排除 eMBMS／MBSFN 類 residue。
- 問題：歷史網路拓撲不適合作為唯一部署假設；處置：採受控 switched Ethernet migration，歷史拓撲保留為 fallback。
- 問題：跨主機 sample path 需先證明；處置：Gate B 先驗證雙向 sample-plane ping 與新的管理 SSH session。
- EPC log：pre-existing `/tmp/epc.log` 為 `user:user`，與 root-launched `srsepc` logging 發生 ownership conflict；舊 log 已保留、conflict source 已移除、EPC restart 成功，recreated log 為 `root:root`。不推論其他原因。
- Phase 4C 未修改 `/etc/srsran/` 或 persistent network configuration。

**建議視覺：** 四列「Problem → Evidence → Minimal fix → Guardrail」表格。

## Slide 10｜Agent／Codex Workflow：Human-Owned Architecture

- `AGENTS.md`：定義 repository scope、安全邊界與 startup procedure。
- `SKILL.md`：定義 Lab01 recovery procedure、authority ranking 與 stop conditions。
- `PROGRESS.md`：提供 current checkpoint、`KNOWN`／`UNKNOWN` 與 remaining gate。
- `Codex execution`：只在 task authority 內執行最小、可稽核、非敏感工作。
- `Human Review`：保留 architecture、trade-off、approval 與 acceptance responsibility。

**建議視覺：** 主 slide 只畫 `AGENTS.md → SKILL.md → PROGRESS.md → Codex execution → Human Review` 五節點 chain；詳細 swimlane 放 appendix。

## Slide 11｜GitHub PR Workflow：把證據變成可審查 checkpoint

- 正常流程：Task → scoped branch → commit → push → Pull Request。
- PR 先做 diff、claim boundary、privacy 與 required review／checks。
- 通過後以 Squash Merge 形成單一 main checkpoint，再同步 local main。
- 合併後確認 remote／local 狀態，再清理 topic branch。
- PR #8、#10、#12、#13 示範用小範圍 checkpoint 保存 recovery 狀態演進。

**建議視覺：** 主 slide 只畫正常 `branch → commit → push → PR → Review／Checks → Squash Merge → sync main`；Git recovery 與 branch deletion edge cases 放 appendix／Q&A。

## Slide 12｜What Was Not Tested：明確定義成果邊界

- **Connectivity extensions：** NAT、Internet route／外連、TCP 與 iperf3 未測。
- **Observability and performance：** Wireshark／PCAP、throughput、受控 latency／reliability／stability／benchmark methodology 未完成。
- Observed average RTT 約 600–700 ms 只屬 ICMP connectivity observation，不是 low-latency 或 URLLC validation。
- **Parked research：** MBMS／eMBMS／MBSFN／SIB13、B210 OTA、2x2 MIMO、URLLC、6G LEO／NTN 未完成。
- 所有 exclusions 均需另行定義 scope、evidence 與 human approval，不能由 Phase 4C PASS 外推。

**建議視覺：** 三欄 scope boundary：Connectivity extensions、Observability and performance、Parked research。

## Slide 13｜Engineering Value：把一次成功轉成治理能力

- 三平面分離降低 management、sample 與 user traffic 互相混淆的風險。
- 成對證據與 field-level reconciliation 讓 baseline 決策可追溯、可反駁、可重做。
- Gate 與 stop condition 將高風險 runtime 操作切成可審查的最小步驟。
- 固定 bring-up／shutdown invariant 提升故障定位與重現性。
- PR checkpoint 與敏感資料邊界使工程成果可安全交接，而不依賴私人記憶。

**建議視覺：** 五個 value pillar：Isolation、Traceability、Safety、Reproducibility、Handoff。

## Slide 14｜Next Steps：從已關閉 milestone 進入新核准週期

- 1 Review／handoff：確認 Phase 4C evidence、claim boundary 與 unresolved questions。
- 2 Select one narrow scope：只選一個下一階段工作，不同 validation 不綁成一次執行。
- 3 Define package：success criteria、commands、evidence path、abort point、rollback 與 responsible roles。
- 4 Human Approval → approved minimum execution → new evidence review；未核准前保持停止。

**建議視覺：** 單一循環：Review → Select scope → Define package → Human Approval → Minimum execution → Evidence review。

## Appendix／Backup Assets（不計入 14 頁 main deck）

- A1：Extended source-authority／claim-evidence map。
- A2：Detailed Phase 2E–4C gate ledger 與 protocol validation chain。
- A3：`pull --ff-only` failure 與 repository recovery decision tree。
- A4：Squash Merge 後 branch deletion warning、`branch -D` 條件與 safety checks。
- A5：Detailed validation evidence matrix，包含 RTT observation caveats 與未測 KPI。
- A6：Detailed Human／Agent responsibility swimlane。
