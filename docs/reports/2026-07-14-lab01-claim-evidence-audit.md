# 5G SDR Lab01 Baseline Recovery Claim-to-Evidence Audit

- 文件狀態：`DRAFT / NEEDS_REVIEW`
- 稽核日期：2026-07-14
- 作業類型：文件與 evidence mapping；未修改 runtime、未啟動服務、未執行新的遠端驗證。
- 最新權威順序：Lab01 Baseline Recovery Part 3 與 approved human-review corrections → `PROGRESS.md` Phase 4C checkpoint → governance／skill → 歷史 Lab01 與 audit 文件。
- 判讀規則：較舊文件中的 `NEEDS_CONFIRMATION` 不會推翻較新的直接 checkpoint；未被最新證據明確覆蓋的項目仍維持 `NOT TESTED`／`UNKNOWN`。

## Evidence Catalog

| ID | 來源 | 類型 | 可支持範圍 | 限制 |
| --- | --- | --- | --- | --- |
| E01 | Lab01 Baseline Recovery Part 3 任務包 | 最新任務權威 | 簡報結構、禁止過度聲明項目、輸出與 workflow 邊界 | 任務包不是新的 runtime evidence |
| E02 | `PROGRESS.md`，Current Status／Current Checkpoint／Remaining Gate，2026-07-13 | 最新 repository checkpoint | Phase 2E–4C 狀態、三平面 topology、bring-up、Attach、ICMP、shutdown、未授權後續動作 | 不支持未列出的 extended validation |
| E03 | `.agents/skills/lab01-baseline-recovery/SKILL.md` | Recovery procedure | authority ranking、paired comparison、ZeroMQ direction、approval、stop condition、evidence schema | skill 本身不證明 runtime PASS |
| E04 | `docs/audits/2026-07-10-rollback-inventory.md` | 唯讀 audit residue evidence | Linux1／Linux2 residue、ZeroMQ 是 Lab01 component、歷史待確認項目 | 明確不是 confirmed baseline；不證明檔案 active |
| E05 | `docs/engineering/CONFIGURATION_GOVERNANCE.md` | Governance | repository／runtime 邊界、branch／PR、backup／diff／approval／deployment／validation 流程 | 文件仍為 draft；不證明執行結果 |
| E06 | `docs/engineering/CODEX_REMOTE_AGENT_POLICY.md` | Agent policy | authority levels、read-only default、runtime approval、evidence／secret rules | 不授權新的 runtime 操作 |
| E07 | `docs/ai-workflow.md` | AI workflow guidance | Human-Owned Architecture、分層除錯、啟動 invariant | 舊 runtime checklist 不可單獨作 PASS evidence |
| E08 | `CONTRIBUTING.md` | Repository workflow | scoped branch、small PR、review、no direct main | 不證明 GitHub 外部 review 內容 |
| E09 | Git history：`55d9b10`／PR #8、`edbab02`／PR #10、`65f846d`／PR #12、`fb4f195`／PR #13 | Traceable repository history | checkpoint 透過 PR 演進、各階段文件狀態 | commit subject 不替代 runtime logs |
| E10 | `labs/lab01-small-cell/README.md`、`runbook.md`、`result-summary.md`、`known-issues.md` | Historical／lower authority | 原始 Lab01 目標、預期 topology、舊有待確認清單 | 內容多為 `NEEDS_CONFIRMATION`，不得用來宣稱完成 |
| E11 | Approved human-review corrections，2026-07-13 | Confirmed Phase 4C evidence clarification | Bidirectional ICMP observed average RTT／loss；`/tmp/epc.log` ownership conflict、preservation、restart 與 recreated ownership | 只支持明列 observations；不支持 performance、URLLC、stability、benchmark 或額外 root-cause inference |

## Claim-to-Evidence Mapping

| Claim ID | Slide | 簡報聲明 | 狀態 | 主要證據 | 稽核結論／限制 |
| --- | ---: | --- | --- | --- | --- |
| C01 | 1 | 現況 residue 不能由單一檔案或單一主機直接推定為 authoritative baseline | `SUPPORTED` | E03、E04 | 應保留 host pairing、version、active selection 與 ZeroMQ direction 條件 |
| C02 | 2 | 原始 Lab01 以 Linux1 EPC／eNB、Linux2 UE 與 ZeroMQ sample path 組成 | `SUPPORTED` | E02、E04、E10 | 原始文件為低權威，但 host roles 與 ZeroMQ 已被最新 checkpoint 覆蓋 |
| C03 | 2 | 原始／延伸目標含 NAT、Internet、TCP／iperf 與 packet observation | `HISTORICAL_ONLY` | E10 | 只能描述為目標，不可描述為本輪完成 |
| C04 | 3 | Linux1／Linux2 存在已確認 Lab02 residue，而 ZeroMQ 應保留 | `SUPPORTED` | E02、E04 | audit 只證明 residue observation；clean candidate classification 由 E02 支持 |
| C05 | 4 | 最終 architecture 分為 management、sample、user 三平面 | `SUPPORTED` | E02 | sample-plane 位址為 temporary runtime secondary addresses，不可描述為 persistent config |
| C06 | 4 | Switched Ethernet 是 controlled migration，不是 exact historical rollback | `SUPPORTED` | E02 | 歷史 USB／Wi-Fi topology 只是另行核准 fallback |
| C07 | 5 | Recovery pipeline 包含 inventory、comparison、plan、approval、minimum execution、validation 與 handoff | `SUPPORTED` | E02、E03、E05 | skill 定義流程，E02 支持已走到 Phase 4C 的 checkpoint |
| C08 | 6 | Phase 2E、Phase 3、Phase 4A、Phase 4B、Phase 4C 依 gate 推進 | `SUPPORTED` | E02、E09 | 不能把已關閉 gate 解讀為 future runtime blanket approval |
| C09 | 6 | Phase 4A backup 通過 metadata、SHA-256、manifest 與 paired `COMPLETE` marker | `SUPPORTED` | E02 | 只描述 checkpoint 摘要，不收錄敏感 backup 內容 |
| C10 | 6 | Gate B 驗證雙向 sample-plane ping 與新的 management SSH session，且未持久化網路設定 | `SUPPORTED` | E02、E09 | Gate B 當時未測 ZeroMQ runtime；ZeroMQ PASS 來自後續 Phase 4C |
| C11 | 7 | 經驗證的 startup sequence 為 EPC → eNB → UE | `SUPPORTED` | E02、E07 | E02 為直接 checkpoint；E07 只提供 invariant 背景 |
| C12 | 7 | Shutdown sequence 為 UE → eNB → EPC，結束後服務未持續執行 | `SUPPORTED` | E02 | 不代表永久禁止或永久正常，只是 Phase 4C 結束狀態 |
| C13 | 8 | `srsepc`、`srsenb`、`srsue` 成功初始化 | `SUPPORTED` | E02 | 不外推到效能、長時間穩定性或 OTA |
| C14 | 8 | ZeroMQ transport、cell search、Random Access、RRC Connected、Attach 成功 | `SUPPORTED` | E02 | 不外推到 MBMS、SIB13、URLLC 或 RF 功能 |
| C15 | 8 | UE=`172.16.0.2`、EPC SGi=`172.16.0.1` | `SUPPORTED` | E02 | 僅為 Phase 4C 已觀察 user-plane addressing |
| C16 | 8 | 雙向 user-plane ICMP packet loss 為 0%，observed average RTT 約 600–700 ms | `SUPPORTED_CONNECTIVITY_OBSERVATION` | E02、E11 | Sample count、duration、traffic load 與 controlled performance methodology 有限；不得推論 performance、low latency、URLLC、reliability、stability 或 benchmark |
| C17 | 9 | Clean candidate 排除 eMBMS／MBSFN／SIB13／M1／UE MBMS residue並保留 ZeroMQ | `SUPPORTED` | E02、E04 | 「排除」是 baseline classification；不宣稱本稿執行 config deployment |
| C18 | 9 | Pre-existing `/tmp/epc.log` 為 `user:user`，與 root-launched `srsepc` logging 發生 ownership conflict；舊 log 已保留、conflict source 已移除、EPC restart 成功、recreated log 為 `root:root` | `SUPPORTED` | E02、E11 | Cause 與處置只限已記錄 evidence；不得推論其他 OS、filesystem、application 或 permission root cause |
| C19 | 9 | Phase 4C 未修改 `/etc/srsran/` 或 persistent network configuration | `SUPPORTED` | E02 | temporary sample-plane address 已在 Phase 4B／4C checkpoint 明列，不可隱去 |
| C20 | 10 | Human 定義 architecture／invariants／approval，Agent 執行 evidence-oriented minimum work | `SUPPORTED_AS_PROCESS` | E03、E06、E07 | 這是治理流程聲明，不是 runtime 性能聲明 |
| C21 | 11 | PR #8、#10、#12、#13 分別形成 Phase 3、4A／4B、Gate B、Phase 4C checkpoint | `SUPPORTED` | E09 | 只說 repository history 可見的 PR／commit subject，不推論 review 對話內容 |
| C22 | 12 | NAT、Internet、TCP、iperf3、Wireshark 未在 Phase 4C 完成聲明中獲證 | `SUPPORTED_NOT_TESTED` | E01、E02、E10 | 舊 `PROGRESS.md` candidate source 提及歷史 NAT evidence，但依任務權威不得宣稱本輪完成 |
| C23 | 12 | MBMS／eMBMS／MBSFN／SIB13 未執行為本輪成功功能 | `SUPPORTED_NOT_COMPLETED` | E01、E02、E04 | 這些主要作為 residue exclusion／parked work；不可稱為功能驗證成功 |
| C24 | 12 | low-latency、URLLC、B210 OTA、2x2 MIMO、6G LEO／NTN 未完成 | `SUPPORTED_NOT_COMPLETED` | E01、E02 | E02 parked work 支持部分項目；E01 明確禁止完成聲明 |
| C25 | 13 | 工程價值來自 isolation、traceability、gates、invariants 與 PR handoff | `REASONED_SYNTHESIS` | E02、E03、E05–E09 | 屬由治理與結果推導的質性價值，不是量化 KPI |
| C26 | 14 | 後續 runtime start、persistent network change、config deployment 或 extended validation 需新核准 | `SUPPORTED` | E02、E03、E06 | 目前 checkpoint 為 handoff／review，不授權新動作 |

## Prohibited Completion Claims

下列項目在本簡報中只能標為 `NOT TESTED`、`NOT COMPLETED`、`PARKED` 或「原始／延伸目標」，不得使用 `PASS`、`完成`、`成功驗證` 等措辭：

| 項目 | 允許措辭 | 禁止措辭 | 原因 |
| --- | --- | --- | --- |
| NAT | Phase 4C 未驗證 | NAT 已完成／可用 | 最新完成範圍只到雙向 ICMP，且任務包明確禁止完成聲明 |
| Internet | 未測外連／route | 已可上網 | 無最新直接證據 |
| iperf3／TCP | 未測 throughput／TCP | iperf3 已通／效能達標 | 無 command output 或 KPI evidence |
| Wireshark／PCAP | 未執行 packet observation | 已看到 S1-MME／S1-U／SGi | 歷史文件仍為待確認 |
| MBMS／eMBMS／MBSFN／SIB13 | residue exclusion／parked | 功能完成 | 本輪目標是排除 residue，不是驗證服務功能 |
| low-latency／URLLC | Observed average RTT 600–700 ms、0% loss僅作 connectivity observation；controlled validation 未完成 | 已達低延遲／URLLC／performance／reliability／stability benchmark | Sample count、duration、traffic load 與 controlled methodology 有限 |
| B210 OTA | parked／not tested | OTA 已完成 | 本輪使用 ZeroMQ，不是實體 RF OTA |
| 2x2 MIMO | future／not tested | MIMO 已完成 | 無 RF／MIMO evidence |
| 6G LEO／NTN | parked research | 6G LEO 已完成 | 不屬 Lab01 Phase 4C 範圍 |

## Source Conflict and Staleness Notes

- `PROGRESS.md` 是最新 checkpoint；`docs/engineering/TODO.md` 與 `labs/lab01-small-cell/` 多處仍保留早期未完成／`NEEDS_CONFIRMATION` 狀態，簡報不以這些舊標籤否定 Phase 4C 已有的直接證據。
- 舊文件對 NAT、Internet、TCP、iperf、Wireshark 的描述僅支持「原始目標或待補 evidence」，不支持完成聲明。
- `PROGRESS.md` 的 Candidate Sources 提到歷史成功 evidence 曾涵蓋 NAT 與 packet observation，但本次 Part 3 權威明確要求不宣稱這些項目完成，因此簡報一律標為 Phase 4C `NOT TESTED`。
- Architecture overview 中的 5GS、URLLC、MIMO 等一般性內容不等於 Lab01 runtime evidence，本簡報不使用該文件支持完成聲明。
- E11 補充的 600–700 ms observed average RTT 與 0% loss 只更新 connectivity observation，不改變 performance／URLLC 未驗證邊界。
- E11 補充 `/tmp/epc.log` 的 ownership conflict cause 與已記錄處置，但不授權推論更深層 OS 或 application cause。

## Review Checklist

- [ ] 每個綠色 `PASS` 都能回指 C13–C16 或其他 `SUPPORTED` claim。
- [ ] RTT 一律搭配 `observed average`、limited methodology 與 connectivity-only boundary；不使用 performance badge。
- [ ] EPC log cause 只包含 `user:user` pre-existing log、root-launched `srsepc`、preserved old log、removed conflict source、successful restart、recreated `root:root`。
- [ ] 每次提到 sample-plane IP 都同時說明其 temporary／non-persistent 性質。
- [ ] 每次提到 recovery 都避免將其描述為 Git rollback 或 active config copy。
- [ ] 未放入 credentials、Ki、OPC、subscriber identifiers、private keys、原始 logs 或 PCAP。
- [ ] 未將 NAT、Internet、iperf3、Wireshark、MBMS、SIB13、low-latency、URLLC、B210 OTA、2x2 MIMO、6G LEO／NTN 說成完成。
- [ ] 結尾保留新的 human approval gate，不暗示本文件授權 runtime restart 或 deployment。

## Lab01 Baseline Recovery Record

- Phase: handoff
- Runtime modified: false
- Services started: false
- Authority selected: CONFIRMED
- Candidate sources:
  - source: `PROGRESS.md` Phase 4C checkpoint
    host role: Mac controller／Linux1 EPC-eNB／Linux2 UE
    authority rank: 1（latest confirmed runtime evidence）
    status: CONFIRMED
  - source: `docs/audits/2026-07-10-rollback-inventory.md`
    host role: Linux1 EPC-eNB／Linux2 UE
    authority rank: supporting residue evidence
    status: CANDIDATE
  - source: approved human-review corrections，2026-07-13
    host role: Linux1 EPC-eNB／Linux2 UE
    authority rank: confirmed Phase 4C evidence clarification
    status: CONFIRMED
- ZeroMQ pairing: CONFIRMED
- Evidence: E01–E11 與 C01–C26；本稿未執行新的 runtime validation，僅納入已核准 evidence clarification
- Stop condition or approval reference: 任何後續 runtime、persistent network、config deployment 或 extended validation 均為 `NEEDS_APPROVAL`
- Next action: Human Reviewer 審查簡報內容與 Phase 4C evidence handoff；本文件不授權新執行
