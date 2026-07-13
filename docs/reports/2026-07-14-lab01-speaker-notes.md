# 5G SDR Lab01 Baseline Recovery 講者備註

- 文件狀態：`DRAFT / NEEDS_REVIEW`
- 使用方式：配合 `2026-07-14-lab01-presentation-outline.md`；`must_say` 是不可省略的 claim boundary，`free_talk_zone` 是提示而非逐字稿。
- 證據原則：只把具直接 evidence 的 `KNOWN`／`PASS` 說成完成；本輪核准 human-review corrections 補充 RTT observation 與 `/tmp/epc.log` ownership conflict evidence。
- Main deck 目標時長：15–17 分鐘，不含 Q&A 與 appendix。

## Slide 1｜問題定義：如何找回可信、可重現的 Lab01

- **must_say：** 問題是 authority trust gap：單一檔案、單一主機或檔案存在本身，都不能證明 authoritative baseline。
- **optional_detail：** 必須能追溯 Linux1／Linux2 pairing、version、active selection、ZeroMQ direction 與 Human Review。
- **free_talk_zone：**
  - 說明「看得到檔案」與「能證明來源」的差異。
  - 分享為何先處理 trust gap，而不是直接 rerun。
  - 可放 10 秒一般 anecdote：錯把備份檔當 active config 的風險。
- **transition_to_next_slide：** 問題定義清楚後，先回到 Lab01 原始的最小系統目標。
- **likely_question：** 為什麼不能直接重跑舊 Lab01？
- **claim_boundary：** 本頁不展開 residue 細節，也不宣稱所有歷史來源都錯；完整 evidence map 放 appendix。
- **target_time_seconds：** 60

## Slide 2｜原始 Lab01 目標：先建立最小可用 SDR 核心路徑

- **must_say：** 最小架構是 Linux1 的 EPC／eNB、Linux2 的 UE，以及跨主機 ZeroMQ RF sample transport；Phase 4C 完成範圍到 Attach、位址分配與雙向 ICMP。
- **optional_detail：** ZeroMQ 取代模擬 RF sample path，不是 Internet、S1 control plane 或實體 OTA。
- **free_talk_zone：**
  - 說明先用軟體 sample path 建 baseline 的除錯價值。
  - 對比原始願景與本輪 approved scope。
  - 可分享先建立最小閉環再擴展驗證的工程觀察。
- **transition_to_next_slide：** 原始路徑確定後，下一頁說明哪些來源可保留、排除或只作 reference。
- **likely_question：** ZeroMQ 在這套系統傳送什麼？
- **claim_boundary：** NAT、Internet、TCP／iperf3、Wireshark、OTA 不在完成聲明內。
- **target_time_seconds：** 60

## Slide 3｜為何需要 Baseline Recovery

- **must_say：** Residue 必須逐欄分類；ZeroMQ 保留，eMBMS／MBSFN／SIB13／M1 等 Lab02 residue 排除，scheduler／PHY 等欄位依 authority 維持 confirmed、candidate 或 unknown。
- **optional_detail：** Authority 排序從 successful runtime evidence 到 approved snapshot、paired config、matching examples 與歷史材料。
- **free_talk_zone：**
  - 選一個 preserve／exclude 例子說明分類邏輯。
  - 說明 `CLEAN_CANDIDATE_NOT_HISTORICALLY_CONFIRMED` 的保守語意。
  - 可談 configuration drift，但不要加入未記錄事件。
- **transition_to_next_slide：** 來源與欄位分類完成後，下一步是清楚表達三個 logical planes。
- **likely_question：** 為什麼不能整份 config 直接換掉？
- **claim_boundary：** 不宣稱 clean candidate 是 exact historical rollback，也不宣稱本簡報部署設定。
- **target_time_seconds：** 60

## Slide 4｜最終三平面架構

- **must_say：** Management、Sample、User 三個 logical plane 分別使用 `192.168.250.0/24`、temporary `10.0.0.0/24`、`172.16.0.0/24`。
- **optional_detail：** 同一實體 NIC 可承載多個 L3 address；logical separation 不等於三張 NIC。
- **free_talk_zone：**
  - 依圖說明 Mac、Linux1、Linux2 在各 plane 的角色。
  - 從故障定位角度說明不同 subnet 的價值。
  - 可談 logical／physical separation 差異，不要加入未記錄 VLAN 或 QoS。
- **transition_to_next_slide：** 有了 architecture，接著看 recovery 的七個工作階段。
- **likely_question：** 為什麼 Management 與 Sample Plane 不同 subnet，又能共用 NIC？
- **claim_boundary：** Sample plane 未持久化、無 gateway／DNS；user plane 未證明 Internet connectivity。
- **target_time_seconds：** 75

## Slide 5｜Recovery Pipeline：從證據到可控執行

- **must_say：** 七階段是 Inventory → Compare → Plan → Human Approval → Backup／Migration → Bring-up／Validate → Shutdown／Handoff。
- **optional_detail：** 本頁只講工作順序；states、STOP 與 rollback semantics 留到下一頁。
- **free_talk_zone：**
  - 選一個階段說明其輸入與輸出。
  - 分享為何 approval 位於 plan 與 execution 之間。
  - 可談先定義 evidence path 再執行的價值。
- **transition_to_next_slide：** Pipeline 回答「先後順序」，state machine 回答「何時可走、何時必須停」。
- **likely_question：** 哪一步開始需要人工核准？
- **claim_boundary：** Pipeline 不代表自動 execution，也不取代各 gate 的個別 approval。
- **target_time_seconds：** 75

## Slide 6｜Gate／State Machine：每一步都可停

- **must_say：** `PENDING → AUTHORIZED → PASS / CLOSED` 是受控 transition；provenance 衝突、scope 不清或 unexpected result 進 `STOP`，後續依 approved rollback 回到先前已知狀態。
- **optional_detail：** Rollback 是 backup＋source-to-target mapping＋validation，不是 Git reset；handoff 後 future runtime 回到 `NEEDS_APPROVAL`。
- **free_talk_zone：**
  - 說明 approval 與 PASS 為何不同。
  - 選一個 STOP condition 說明中止理由。
  - 可分享 gate 如何讓 reviewer 明確決定 go／stop。
- **transition_to_next_slide：** 進入已核准 runtime gate 後，service dependency 仍有固定順序。
- **likely_question：** Phase 4C PASS 後為什麼還不能直接重啟？
- **claim_boundary：** 既有 PASS 不等於未來 runtime、network、deployment 或 extended validation 的 blanket approval。
- **target_time_seconds：** 70

## Slide 7｜Runtime Bring-up：固定順序降低歧義

- **must_say：** C0 preflight 後，bring-up 是 EPC → eNB → UE；shutdown 是 UE → eNB → EPC，結束後服務未持續執行。
- **optional_detail：** 下一層只在前一層狀態可接受時開始，便於隔離 dependency 問題。
- **free_talk_zone：**
  - 指著 lifeline 說明 dependency order。
  - 分享反向 shutdown 的理由。
  - 可談固定順序如何改善 log timeline，但不要推測未測順序的結果。
- **transition_to_next_slide：** 順序只是 procedure，下一頁才呈現 observed validation results。
- **likely_question：** 如果 UE 先啟動會怎樣？
- **claim_boundary：** 只說已驗證順序，不推論其他順序的具體 failure。
- **target_time_seconds：** 65

## Slide 8｜Validation Results：只報告直接證據支持的 PASS

- **must_say：** 四群結果為 Network and runtime、Attach and protocol、User plane、Not tested；雙向 ICMP packet loss 0%，observed average RTT 約 600–700 ms。
- **optional_detail：** UE=`172.16.0.2`、EPC SGi=`172.16.0.1`；RTT 是 connectivity observation。
- **free_talk_zone：**
  - 指著 matrix 依四群快速走一遍。
  - 說明 0% loss 與 RTT observation 為何不等同 benchmark。
  - 可談若要 performance study，必須另定 methodology。
- **transition_to_next_slide：** Validation 過程也留下可重用的 problem／fix evidence。
- **likely_question：** 600–700 ms 是否代表 low latency 或 URLLC？
- **claim_boundary：** Sample count、duration、traffic load 與 controlled performance methodology 有限；不宣稱 performance、low latency、URLLC、reliability、stability 或 benchmark。
- **target_time_seconds：** 90

## Slide 9｜Problems and Fixes：先定位層級，再做最小處置

- **must_say：** `/tmp/epc.log` 的 recorded cause 是 pre-existing `user:user` log 與 root-launched `srsepc` logging ownership conflict；舊 log 已保留、conflict source 移除、EPC restart 成功、recreated log 為 `root:root`。
- **optional_detail：** 其他處置仍維持 residue reconciliation、controlled topology migration 與 Gate B connectivity；Phase 4C 未修改 `/etc/srsran/` 或 persistent network configuration。
- **free_talk_zone：**
  - 用 Problem → Evidence → Minimal action → Boundary 走 ownership conflict。
  - 說明保留舊 log 的 audit 價值。
  - 可談最小處置，但不補充未記錄的 OS、permission 或 application root cause。
- **transition_to_next_slide：** 這些處置受文件 chain 與 Human Review 約束，不是 Agent 自行擴權。
- **likely_question：** EPC logging issue 的根因證據是什麼？
- **claim_boundary：** 只陳述 `user:user`／root-launched process／`root:root` recreated log 等已記錄 evidence，不外推其他原因。
- **target_time_seconds：** 75

## Slide 10｜Agent／Codex Workflow：Human-Owned Architecture

- **must_say：** 主流程是 `AGENTS.md → SKILL.md → PROGRESS.md → Codex execution → Human Review`。
- **optional_detail：** AGENTS 定 scope、SKILL 定 procedure、PROGRESS 定 state；Codex 做 scoped work，Human 保留 approval 與 acceptance。
- **free_talk_zone：**
  - 用一句話說明每個節點。
  - 分享規格越明確越容易 review 的觀察。
  - 若追問責任分工，再展開 appendix swimlane。
- **transition_to_next_slide：** Agent output 還要走正常 Git／PR workflow 才能成為 main checkpoint。
- **likely_question：** Codex 到底做什麼，能否直接改 runtime 或 push main？
- **claim_boundary：** Codex 不是最終 decision maker；未經授權不能修改 runtime、啟動服務或直接 push main。
- **target_time_seconds：** 65

## Slide 11｜GitHub PR Workflow：把證據變成可審查 checkpoint

- **must_say：** 正常流程是 branch → commit → push → PR → Review／Checks → Squash Merge → sync main → cleanup topic branch。
- **optional_detail：** PR #8、#10、#12、#13 保存不同 recovery checkpoints；本草稿目前未 commit、push 或建立 PR。
- **free_talk_zone：**
  - 說明 small PR 與 review 的價值。
  - 指出 privacy、claim boundary 與 diff check 在 merge 前完成。
  - Advanced Git recovery 問題留到 Q&A／appendix。
- **transition_to_next_slide：** Git workflow 管理 change boundary，下一頁則管理 technical scope boundary。
- **likely_question：** 為什麼不用直接 push main？
- **claim_boundary：** 進階 Git 復原與清理邊界案例只放在 appendix/Q&A；主 slide 不展開，也不宣稱 repository 已啟用所有 protection options。
- **target_time_seconds：** 55

## Slide 12｜What Was Not Tested：明確定義成果邊界

- **must_say：** Exclusions 分三群：Connectivity extensions、Observability and performance、Parked research。
- **optional_detail：** RTT 600–700 ms 已觀察，但只屬 connectivity result；MBMS process startup 的一般命題不構成功能驗證。
- **free_talk_zone：**
  - 每群只舉一至兩個例子。
  - 說明 observed value 與 validated KPI 的差異。
  - 詳細 protocol chain 留到 Q&A／appendix。
- **transition_to_next_slide：** 清楚標記 negative space，讓下一頁的 engineering value 不依賴誇大成果。
- **likely_question：** 為什麼 RTT observation 不是 URLLC？MBMS startup 為什麼不等於 validation？
- **claim_boundary：** 不宣稱 NAT、Internet、iperf3、Wireshark、performance、MBMS、SIB13、URLLC、OTA、MIMO 或 6G／NTN 完成。
- **target_time_seconds：** 70

## Slide 13｜Engineering Value：把一次成功轉成治理能力

- **must_say：** 工程價值在 isolation、traceability、gates、repeatable invariants 與 handoff，而非未量測的 performance KPI。
- **optional_detail：** 主頁只保留五個 qualitative pillars；extended evidence-to-value map 放 appendix。
- **free_talk_zone：**
  - 選一個 pillar 連回一個 artifact。
  - 分享哪個流程最值得後續 Lab 重用。
  - 可談 handoff 如何減少私人記憶依賴。
- **transition_to_next_slide：** 最後用單一 approval cycle 說明下一步怎麼開始。
- **likely_question：** 除了 connectivity PASS，工程價值是什麼？
- **claim_boundary：** 不宣稱 latency、throughput、coverage、reliability、stability 或 production readiness 改善。
- **target_time_seconds：** 55

## Slide 14｜Next Steps：從已關閉 milestone 進入新核准週期

- **must_say：** 下一循環是 Review／Handoff → Select one narrow scope → Define package → Human Approval → Minimum execution → Evidence review。
- **optional_detail：** Package 必須包含 success criteria、commands、evidence path、abort point、rollback 與 responsible roles。
- **free_talk_zone：**
  - 說明為何一次只選一個 narrow scope。
  - 分享哪一類 evidence gap 值得後續由 Project Lead 排序。
  - 不在主頁重列完整 exclusion list。
- **transition_to_next_slide：** Main deck 結束；依問題深度切換到 Q&A 或 appendix。
- **likely_question：** 下一步要做什麼，誰決定？
- **claim_boundary：** Cycle 不代表排程、資源、授權或成功承諾；未核准前保持停止。
- **target_time_seconds：** 55

## Appendix／Backup Talking Points

- A1 Extended evidence map：只在追問 provenance 時使用。
- A2 Detailed gate／protocol chain：只在追問 Phase 2E–4C 或 MBMS validation layers 時使用。
- A3 Git recovery：`pull --ff-only`、reset conditions 與 repository/runtime boundary。
- A4 Squash branch cleanup：deletion warning、`branch -D` safety checks。
- A5 Detailed validation matrix：RTT observation、0% loss 與 limited methodology caveats。
- A6 Human／Agent swimlane：需要追問 authority、approval 或 handoff responsibility 時使用。
