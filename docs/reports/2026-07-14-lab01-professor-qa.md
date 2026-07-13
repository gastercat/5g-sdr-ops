# 5G SDR Lab01 Baseline Recovery 教授 Q&A 準備

- 文件狀態：`DRAFT / NEEDS_REVIEW`
- 回答原則：先給 30 秒結論，再依教授追問深度擴展；技術結果引用 Lab01 Baseline Recovery Part 3、`PROGRESS.md` Phase 4C checkpoint 與本輪 approved human-review corrections。
- 邊界原則：Git 題可引用官方機制文件，但不得把假設情境說成本專案實際事故；未測功能一律保持 `NOT TESTED`／`NOT COMPLETED`。
- 角色原則：使用 System Architect、Network Operator、Runtime Operator、Configuration Reviewer、Git Maintainer、Human Reviewer、Project Lead 等中性角色。

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
| E09 | Git history：PR #8／#10／#12／#13 checkpoint commits |
| E10 | Historical Lab01 README／runbook／result／known-issues（lower authority） |
| E11 | Approved human-review corrections：Phase 4C observed RTT 與 EPC log ownership conflict evidence |
| G01 | [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) |
| G02 | [GitHub merge methods／Squash Merge](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github) |
| G03 | [GitHub automatic branch deletion](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-the-automatic-deletion-of-branches) |
| G04 | [Git `pull`](https://git-scm.com/docs/git-pull) 與 [Git `branch`](https://git-scm.com/docs/git-branch) |
| G05 | [Git `reset`](https://git-scm.com/docs/git-reset) |

## 1. System architecture

### Q1｜這套 Lab01 到底是 5G、LTE，還是混合系統？

- **likely professor question：** 你們稱它 5G SDR Lab，但執行元件是 EPC、eNB、UE，系統定位是什麼？
- **30-second answer：** 本次具體 baseline 是 srsRAN_4G 的 EPC／eNB／UE 與 ZeroMQ sample transport，技術路徑屬 LTE／EPC 實驗平台；「5G SDR」是較大的專案脈絡，不能把本次結果說成 5G SA、gNB 或 5GC 驗證。
- **extended answer direction：** 展開 Layer 0 實驗平台與未來研究脈絡的差異，強調簡報只呈現 Lab01 已有 evidence 的 component 與 protocol state。
- **evidence reference：** E02、E04、presentation outline Slide 2／4。
- **what not to claim：** 不宣稱已驗證 NR、5GC、network slicing、URLLC 或 5G SA。
- **whether another team member should answer：** 是；若追問 5GS roadmap，由 System Architect 補充。

## 2. ZeroMQ and three-plane separation

### Q2｜為什麼 Management Plane 和 Sample Plane 要使用不同 subnet？

- **likely professor question：** 都是 Linux1 與 Linux2 之間的流量，為什麼不用同一個 subnet？
- **30-second answer：** 兩個 plane 的責任不同：Management 用於控制、SSH、Git 與審批連線；Sample 用於 ZeroMQ RF samples。不同 L3 subnet 讓路徑、位址與故障域可明確辨識，也能在驗證 sample path 時不混淆管理連線。
- **extended answer direction：** 說明 `192.168.250.0/24` 與 temporary `10.0.0.0/24` 的角色，以及 Gate B 同時驗證 sample-plane ping 與新的 management SSH session。
- **evidence reference：** E02，claim audit C05／C10。
- **what not to claim：** 不宣稱有 VLAN、QoS、實體隔離或安全認證；repository evidence 只支持 logical subnet separation。
- **whether another team member should answer：** 是；細部 routing 由 Network Operator 補充。

### Q3｜為什麼兩個 logical subnet 可以共用一張 physical NIC？

- **likely professor question：** 三平面是不是代表每台主機要有三張網卡？
- **30-second answer：** 不一定。Linux 介面可以同時配置多個 L3 address，因此同一 NIC 可依目的位址與 route 承載不同 logical subnet。這次 sample-plane address 是 temporary secondary address；logical separation 不等於 physical separation。
- **extended answer direction：** 以「interface 是承載媒介、IP prefix 是邏輯路徑」解釋；若要討論 VLAN 或 dedicated NIC，明確標成另一種未實作設計選項。
- **evidence reference：** E02；presentation outline Slide 4。
- **what not to claim：** 不宣稱本次使用 VLAN、policy routing、traffic shaping、bonding 或多 NIC。
- **whether another team member should answer：** 是；介面細節由 Network Operator 回答。

### Q4｜ZeroMQ 在這個系統中傳送什麼？

- **likely professor question：** ZeroMQ 是在傳控制訊息、IP 封包，還是 RF？
- **30-second answer：** 在此 Lab01，ZeroMQ 承載的是 eNB 與 UE 之間的 baseband RF sample transport，用來模擬雙向 radio path。它不是 Management Plane，也不是 UE 的 Internet tunnel；Attach 後的 user-plane IP 則在 `172.16.0.0/24` 表達。
- **extended answer direction：** 說明 Linux1／Linux2 device args 必須成對，peer IP 與 TX／RX TCP ports 必須互補；這也是 recovery skill 的 stop condition。
- **evidence reference：** E02、E03、E04，claim audit C02／C14。
- **what not to claim：** 不把 ZeroMQ 說成實體 OTA、S1-MME transport、Internet transport 或通用 message broker 驗證。
- **whether another team member should answer：** 否；若追問 sample format／rate，而 repository 無證據時應回答未在本簡報 evidence 範圍。

## 3. Baseline recovery method

### Q5｜為什麼不直接重跑舊 Lab01？

- **likely professor question：** 既然以前成功過，為什麼不拿舊指令或設定直接 rerun？
- **30-second answer：** 因為現況包含 Lab02 residue，而且單一舊檔、單一主機或舊教材都不能證明 host pairing、active selection、版本與 ZeroMQ direction。直接 rerun 可能重現的是混合狀態，不是權威 Lab01，所以先做 provenance 與 field-level reconciliation。
- **extended answer direction：** 依 authority ranking 說明 successful evidence、approved snapshot、paired config、matching examples 與 legacy config 的相對權重。
- **evidence reference：** E02、E03、E04，claim audit C01／C04。
- **what not to claim：** 不宣稱所有舊資料都無效；它們可以是 reference，但不能單獨覆蓋更高權威 evidence。
- **whether another team member should answer：** 是；若追問歷史來源，由 Configuration Reviewer 補充。

### Q6｜你們的 rollback strategy 是什麼？

- **likely professor question：** 如果 controlled recovery 失敗，怎麼 rollback？
- **30-second answer：** Rollback 是經 review 的受控部署程序：先驗證 backup package，再做最小核准變更；每個 gate 有 abort point，遇到非預期結果立即停止，依 approved source-to-target mapping 回到先前已知狀態。它不是在 runtime directory 執行 Git reset。
- **extended answer direction：** 展開 backup metadata、SHA-256、manifest、paired `COMPLETE` marker、local console recovery path、reverse shutdown 與 evidence handoff。
- **evidence reference：** E02、E03、E05，claim audit C07／C09／C26。
- **what not to claim：** 不描述未公開的 backup 內容、credentials 或未記錄的自動化 rollback；不說本文件授權再次 deployment。
- **whether another team member should answer：** 是；執行細節由 Runtime Operator 與 Human Reviewer共同回答。

## 4. Config provenance and field-level reconciliation

### Q7｜為什麼要逐欄 reconciliation，不能 whole-file diff 後直接選一份？

- **likely professor question：** 逐欄比對是不是太保守、太耗時？
- **30-second answer：** Whole-file 可能同時含有效 Lab01 component、Lab02 residue 與未確認 override。逐欄 reconciliation 能保留 ZeroMQ、排除 eMBMS／MBSFN residue，並把 scheduler／PHY 等欄位標成 confirmed、candidate 或 unknown，避免整檔誤判。
- **extended answer direction：** 用 active-file selection、includes、scheduler、expert、PHY 與 complementary TX／RX ports 作比對類別；說明 `CLEAN_CANDIDATE_NOT_HISTORICALLY_CONFIRMED` 的意義。
- **evidence reference：** E02、E03、E04，claim audit C04／C17。
- **what not to claim：** 不宣稱 clean candidate 等於 exact historical rollback，也不宣稱 file presence 證明 active use。
- **whether another team member should answer：** 是；欄位判定由 Configuration Reviewer 補充。

## 5. Runtime bring-up and shutdown

### Q8｜為什麼啟動是 EPC → eNB → UE，停止要反過來？

- **likely professor question：** 這只是習慣，還是系統 dependency？
- **30-second answer：** 這是本次已驗證的 operational invariant：先讓核心網初始化，再讓 eNB 建立依賴，最後 UE 搜尋、接入與 Attach；停止時先移除依賴端 UE，再停 eNB 與 EPC。這讓每個 gate 的 log 與狀態更容易隔離。
- **extended answer direction：** 對應 C0 preflight、C1 EPC、C2 eNB、C3 UE、C4 validation 與 controlled shutdown；說明下一層只在前一 gate 可接受時啟動。
- **evidence reference：** E02，claim audit C11／C12。
- **what not to claim：** 不推測其他順序一定發生哪種錯誤，也不宣稱服務目前仍在執行。
- **whether another team member should answer：** 是；若追問實際 console observation，由 Runtime Operator 回答。

### Q8A｜`/tmp/epc.log` 問題的 evidence-backed cause 與處置是什麼？

- **likely professor question：** 你們為什麼判斷 EPC logging 是 ownership conflict，實際做了什麼？
- **30-second answer：** 已記錄 evidence 顯示 pre-existing `/tmp/epc.log` 為 `user:user`，與 root-launched `srsepc` logging 發生 ownership conflict。舊 log 被保留，conflict source 被移除，EPC restart 成功，recreated log 為 `root:root`。
- **extended answer direction：** 依 observed ownership → preserved evidence → minimum corrective action → successful restart → recreated ownership 的順序回答；若追問 OS 或 application internals，回到 evidence boundary。
- **evidence reference：** E11、claim audit C18。
- **what not to claim：** 不推論 SELinux、filesystem corruption、application bug、其他 permission chain 或未記錄 root cause；不展示原始 log 內容。
- **whether another team member should answer：** 是；實際 console evidence 由 Runtime Operator 補充。

## 6. High latency and performance limitations

### Q9｜為什麼 observed average RTT 600–700 ms 不能算 URLLC validation？

- **likely professor question：** Phase 4C 真的觀察到 600–700 ms，為什麼仍不能說做過 latency／URLLC validation？
- **30-second answer：** Phase 4C 雙向 user-plane ICMP 的 observed average RTT 確實約 600–700 ms，packet loss 為 0%；但它只支持 connectivity observation。Sample count、duration、traffic load 與 controlled performance methodology 有限，因此不能形成 low-latency、URLLC、performance、reliability、stability 或 benchmark claim。
- **extended answer direction：** 說明 connectivity observation 與 controlled performance validation 的差異；若未來研究 performance，需另定 measurement point、sample plan、traffic load、duration、統計方法與 acceptance criteria。
- **evidence reference：** E02、E11，claim audit C16／C24。
- **what not to claim：** 不把 observed average RTT 說成正式 latency benchmark、穩定範圍、URLLC 結果或可推論成因。
- **whether another team member should answer：** 是；若有另行保存的量測資料，由 Performance Reviewer 回答，否則維持 `NOT TESTED`。

## 7. MBMS/eMBMS and SIB13 boundaries

### Q10｜為什麼 MBMS service 啟動不代表 MBMS validation？

- **likely professor question：** Process 已啟動，為什麼不能說 MBMS 成功？
- **30-second answer：** Process startup 只證明程序進入某個執行狀態，不能證明 eMBMS configuration、SIB13／MBSFN signaling、MCCH／PMCH、multicast user path 與 UE reception 都正確。本次 clean Lab01 candidate 是排除這些 residue，沒有執行 MBMS functional validation。
- **extended answer direction：** 將 validation chain 分成 configuration selection、broadcast signaling、multicast bearer／packet path、UE decode／service reception 與 evidence capture；每一層都需直接證據。
- **evidence reference：** E01、E02、E04，claim audit C17／C23。
- **what not to claim：** 不宣稱 MBMS、eMBMS、MBSFN、SIB13、M1、MCCH 或 PMCH 已驗證完成。
- **whether another team member should answer：** 是；若追問協定細節，由 RAN／MBMS Reviewer 說明，但不得越過本輪 evidence。

## 8. Agent/Codex operation

### Q11｜Codex 到底做了什麼？

- **likely professor question：** 哪些工作是 Codex 做的，哪些是人做的？
- **30-second answer：** Codex 依 repository 規範讀取 checkpoint、整理候選來源、建立比較與 gate 文件、做 claim-to-evidence mapping、檢查 scope／secrets／diff，並產生 handoff。Architecture、invariants、trade-off、runtime approval 與最終接受仍由 Human Reviewer 負責。
- **extended answer direction：** 用 AGENTS → SKILL → PROGRESS → scoped execution → Human Review 流程說明；區分文件工作、唯讀調查、planning 與 controlled deployment 四個 authority level。
- **evidence reference：** E03、E06、E07，claim audit C20。
- **what not to claim：** 不宣稱 Codex 自主決定 authoritative baseline、批准 runtime、取代 operator 或保證技術結果。
- **whether another team member should answer：** 否；Human Reviewer 可補充實際 review 責任。

### Q12｜Codex 可以直接修改 runtime 或 push 到 main 嗎？

- **likely professor question：** Agent 有 shell 權限時，是否能直接把設定改掉或發布？
- **30-second answer：** 不可以自動擴權。Runtime config、service、network 或 RF 動作需要明確的人工作業授權；repository 也要求 scoped branch、review 與 PR，除非任務明確授權，Codex不能 commit、push 或直接改 main。本次任務只有 docs/reports 文件權限。
- **extended answer direction：** 展開 remote agent policy 的 Level 0–4、approval gate、forbidden actions、branch protection 與 final diff review。
- **evidence reference：** E05、E06、E08、G01。
- **what not to claim：** 不宣稱工具在技術上永遠無法寫入；重點是 policy 與 task authority 明確禁止未授權動作。
- **whether another team member should answer：** 是；repository enforcement 由 Git Maintainer，runtime authority 由 Human Reviewer 補充。

## 9. AGENTS.md, SKILL.md, and PROGRESS.md

### Q13｜Codex 怎麼使用 AGENTS.md、SKILL.md 和 PROGRESS.md？

- **likely professor question：** 三份文件功能有何不同，順序為什麼重要？
- **30-second answer：** AGENTS.md 定義 repository scope、安全邊界與 startup procedure；SKILL.md 定義 Lab01 recovery 的專用流程、authority ranking 與 stop conditions；PROGRESS.md 提供最新 checkpoint、已知事實與 remaining gate。Codex 先讀規範，再套流程，最後以當前狀態限制行動。
- **extended answer direction：** 用輸入／處理／狀態模型說明：AGENTS 是 policy、SKILL 是 procedure、PROGRESS 是 state；衝突時採更嚴格邊界並回報。
- **evidence reference：** E02、E03、AGENTS.md、E06。
- **what not to claim：** 不把任何一份文件說成 runtime config，也不說 SKILL 本身授權 deployment。
- **whether another team member should answer：** 否；若追問 governance ownership，由 Project Lead 補充。

## 10. GitHub branch protection and PR workflow

### Q14｜為什麼要 branch protection 和 Pull Request？

- **likely professor question：** 文件修改也需要 PR 嗎？直接 push 不是比較快？
- **30-second answer：** PR 把變更範圍、diff、evidence、review 與合併決策放在同一個可追溯 checkpoint。Branch protection 可要求 review、status checks、conversation resolution，並限制 force push／deletion；對 evidence 文件而言，這能避免未審查的 PASS 或敏感資料直接進 main。
- **extended answer direction：** 連結 PR #8／#10／#12／#13 的 checkpoint 演進，說明 small PR、linear history 與 Human Review 的價值。
- **evidence reference：** E05、E08、E09、G01。
- **what not to claim：** 不宣稱目前 repository 已啟用所有 GitHub protection option，除非另有設定 evidence。
- **whether another team member should answer：** 是；實際 repository rules 由 Git Maintainer 回答。

## 11. Squash Merge behavior

> Appendix／advanced Git Q&A：本節不放入 main Slide 11，只在教授追問 Git mechanics 時使用。

### Q15｜Squash Merge 做了什麼，為什麼適合這種 checkpoint？

- **likely professor question：** Squash Merge 和普通 merge 有什麼差別？
- **30-second answer：** Squash Merge 把 topic branch 的多個 commits 合成一個新的 commit 放進 base branch，讓 main 保留單一、易讀的 checkpoint。代價是原 topic commit IDs 不會逐一成為 main history 的 ancestors，因此後續同步與刪 branch 要理解 ancestry 差異。
- **extended answer direction：** 畫出 topic commits A-B-C 與 main 上新 squash commit S；內容可以等價，但 commit identity、parents 與 reachability 不同。
- **evidence reference：** G02、E09。
- **what not to claim：** 不說 Squash Merge 保留每個 commit 的完整 ancestry／timestamp，也不說本草稿已完成 Squash Merge。
- **whether another team member should answer：** 是；若追問 repository merge policy，由 Git Maintainer 回答。

## 12. `pull --ff-only` failure and reset conditions

> Appendix／advanced Git Q&A：`pull --ff-only`、reset 與 repository recovery 均為備用內容，不在 main deck 展開。

### Q16｜`git pull --ff-only` 為什麼會失敗？

- **likely professor question：** Pull 失敗是不是 repository 壞掉了？
- **30-second answer：** 不一定。`--ff-only` 只允許 local branch pointer 沿單一路徑前進；若 local 與 remote 各有對方沒有的 commits，也就是 history diverged，就會拒絕整合。這是安全訊號，應先 fetch、status、log 與確認 provenance，而不是立即 merge 或 reset。
- **extended answer direction：** 區分 dirty working tree、diverged commits、錯誤 upstream 與 Squash-rewritten history；依 decision tree 先保存工作、辨認哪個 branch 應是 authority。
- **evidence reference：** G04、E05。
- **what not to claim：** 不把所有 `--ff-only` failure 都歸因於 Squash Merge，也不說本專案一定發生過該錯誤。
- **whether another team member should answer：** 是；實際 Git graph 由 Git Maintainer 檢查後回答。

### Q17｜什麼時候可以執行 `git reset --hard origin/main`？

- **likely professor question：** 如果 local main 跟 remote main 不一致，直接 hard reset 可以嗎？
- **30-second answer：** 只有在 Git repository 內，先 fetch 並確認 `origin/main` 是接受的權威、目前 branch 正確、working tree／index 沒有要保留的變更、local-only commits 已確認可丟棄或另行備份，而且有明確人工核准時，才可把 local branch 對齊 remote。`--hard` 會覆寫 tracked working tree 與 index，所以不能當預設同步動作。
- **extended answer direction：** 建議先做 `status`、`log --left-right`、建立 safety branch／backup，再由 Human Reviewer 確認 reset target；有價值的 local work 應先保存或改走 rebase／cherry-pick／new branch review。
- **evidence reference：** G05、E05、E06。
- **what not to claim：** 不說 dirty tree 可安全 reset；不在本 Q&A 執行命令；不把 remote 一律視為無條件權威。
- **whether another team member should answer：** 是；必須由 Git Maintainer 檢查 graph，Human Reviewer 核准。

### Q18｜為什麼 `git reset` 永遠不能拿來做 `/etc/srsran/` rollback？

- **likely professor question：** 都叫 rollback，為什麼不能用 Git reset 還原 runtime config？
- **30-second answer：** `/etc/srsran/` 是 active runtime configuration，不是本 repository 的 Git working tree。Runtime rollback 必須有 backup、source-to-target mapping、diff、approval、deployment、validation 與 deployment record；Git reset 只改 repository history／index／working tree，無法替代受控 runtime recovery，還可能破壞 provenance。
- **extended answer direction：** 對比 Git object state 與 live service state；說明 secrets、active-file selection、service dependency、network state 都不會由 Git reset 自動安全處理。
- **evidence reference：** AGENTS.md、E03、E05、E06。
- **what not to claim：** 不提供在 `/etc/srsran/` 初始化 Git 或執行 reset 的做法；不把 legacy `/etc/srslte/` 直接複製過去。
- **whether another team member should answer：** 否；若追問核准 recovery plan，由 Runtime Operator 補充。

## 13. Branch deletion after Squash Merge

> Appendix／advanced Git Q&A：branch deletion warning 與 `branch -D` handling 只在追問 Squash cleanup 時使用。

### Q19｜為什麼 Squash Merge 後刪除 local branch 可能出現「not fully merged」警告？

- **likely professor question：** PR 明明 merged，為什麼 `git branch -d` 還不讓刪？
- **30-second answer：** `git branch -d` 以 commit reachability 判斷 branch tip 是否已包含在 upstream／HEAD。Squash Merge 在 main 產生新的 squash commit，原 topic commits 可能不在 main ancestry；所以內容已進 main，Git 仍可能判定原 commits 未 fully merged並提出警告。
- **extended answer direction：** 先確認 PR merged、diff content 已在 main、沒有 local-only work、remote branch 狀態正確；必要時先保留 safety reference，再由 Git Maintainer 決定是否 force-delete local branch。GitHub 也可設定 PR merge 後自動刪 remote head branch。
- **evidence reference：** G02、G03、G04。
- **what not to claim：** 不把警告當成可直接忽略；不在未檢查 local-only commits 時使用 `-D`。
- **whether another team member should answer：** 是；由 Git Maintainer 確認 ancestry 與 content equivalence。

## 14. Team roles and human responsibility

### Q20｜如果 Agent 做很多工作，誰對結果負責？

- **likely professor question：** AI 產生文件和步驟後，human responsibility 在哪裡？
- **30-second answer：** Human-owned architecture 沒有轉移責任。Project Lead／Human Reviewer 負責 scope、invariants、trade-off、approval 與接受；Configuration Reviewer、Network Operator、Runtime Operator 各自確認專業 evidence；Codex 提供可審查的分析與最小執行，不是最終 authority。
- **extended answer direction：** 用 RACI 方式說明：Agent 可 Responsible 於草擬與檢查，人仍 Accountable 於風險決策與 runtime action；高風險動作需明確 approval record。
- **evidence reference：** E06、E07、claim audit C20。
- **what not to claim：** 不說「AI 做的所以人不用負責」，也不把某個私人稱呼或個人關係寫入共享文件。
- **whether another team member should answer：** 是；Project Lead 應回答 accountability 與 acceptance criteria。

## 15. Future work

### Q21｜目前到底還有哪些工作沒有完成？

- **likely professor question：** Lab01 已 `PASS / CLOSED`，是否代表整個專題完成？
- **30-second answer：** 不是。Phase 4C 已完成的是核准範圍內的 process initialization、ZeroMQ、cell search、RA／RRC／Attach、IP assignment、雙向 ICMP 與 controlled shutdown；ICMP observed average RTT 約 600–700 ms、loss 0%。NAT、Internet、TCP／iperf3、Wireshark、controlled performance／URLLC validation、MBMS／SIB13、B210 OTA、2x2 MIMO、6G LEO／NTN 都未完成或未測。
- **extended answer direction：** 將 future work 分成 connectivity extension、packet observability、performance study、reviewed config profile 與 parked research；每項先定 success criteria、evidence path、abort point 與 approval。
- **evidence reference：** E01、E02，claim audit C22–C26。
- **what not to claim：** 不把 roadmap 說成已排程、已獲資源、已授權或預期必然成功。
- **whether another team member should answer：** 是；優先順序與資源由 Project Lead 決定。

### Q22｜下一步最合理的驗證是什麼？

- **likely professor question：** 如果只能多做一件事，你們會選哪個？
- **30-second answer：** 現在不能替 Project Lead 直接決定或啟動。合理做法是先 review Phase 4C evidence，再從尚未驗證項目中選一個窄 scope，定義成功準則、命令、evidence、abort point 與 rollback，取得新核准後才執行。
- **extended answer direction：** 可提出候選比較：NAT／Internet 補齊 end-to-end path、TCP／iperf3 補 throughput、Wireshark 補 protocol observability；依風險、時間與研究問題排序。
- **evidence reference：** E02、E03，claim audit C26。
- **what not to claim：** 不在 Q&A 中授權服務 restart，不保證任何候選會通過，也不將 MBMS／URLLC／OTA 偷渡進同一 scope。
- **whether another team member should answer：** 是；由 Project Lead 與 Human Reviewer 做取捨。

## Q&A Delivery Checklist

- 先回答「有 evidence 的結論」，再說明 inference 與 future work。
- 若問題要求本文件沒有的數字、log、packet 或 config，回答 `UNKNOWN / NOT IN CURRENT EVIDENCE`。
- Git 操作題先確認是在 repository 還是 runtime；`/etc/srsran/` 永遠不走 Git reset rollback。
- RTT 題先說明 600–700 ms average RTT 與 0% loss 已觀察，再立即限定為 connectivity-only result；controlled performance／URLLC validation 未完成。
- 任何 NAT、Internet、iperf3、Wireshark、MBMS、SIB13、URLLC、B210 OTA、2x2 MIMO、6G LEO／NTN 問題都先重申未測／未完成。
- 需要現場操作或新增驗證時，回答「需另行定 scope 與 human approval」，不要臨場啟動服務。
