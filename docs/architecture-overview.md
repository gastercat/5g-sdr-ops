# 5G SDR Canonical Architecture Overview

狀態：`CANONICAL KNOWLEDGE / DOCUMENTATION-ONLY`
適用範圍：Lab01 recovered baseline、Repository／Runtime boundary 與相鄰 lifecycle boundary

## 目的與時間邊界

本文件保存已由 Repository evidence 與 Human-reviewed SoE consolidation 對齊的最小架構。
它描述的是 **Lab01 Phase 4C historical execution baseline**，不是目前服務正在運作的證據，
也不是 5G SA、gNB、5GC、Lab02 或 6G Runtime implementation。

原本的 5GS／NR 一般理論 overview 保留於 Git history；它沒有被用作 Lab01 Runtime PASS
evidence，避免把理論能力誤寫成本專案已實作能力。

## Source Authority

本架構的主要 Repo evidence：

1. [`PROGRESS.md`](../PROGRESS.md) 的 Phase 4C checkpoint 與 current boundary。
2. [`docs/reports/2026-07-14-lab01-claim-evidence-audit.md`](reports/2026-07-14-lab01-claim-evidence-audit.md)
   的 claim-to-evidence mapping。
3. [`docs/engineering/CONFIGURATION_GOVERNANCE.md`](engineering/CONFIGURATION_GOVERNANCE.md)
   的 Repository／active configuration boundary。
4. [`docs/audits/2026-07-10-rollback-inventory.md`](audits/2026-07-10-rollback-inventory.md)
   僅作 residue observation，不是 whole-file baseline authority。
5. [`Task Evidence Record`](evidence/task-evidence/lab01-recovery-workstream.yaml)
   保存歷史 Agent task 的 direct／reported execution provenance；不自行裁定 authority。

Conversation SoE 提供 decision provenance 與歷史 incident boundary；摘要重複不算第二份
execution evidence。任何後續 Runtime 狀態仍須新的直接 evidence 與明確 authorization。

## Repository 與 Runtime 邊界

| Surface | 責任 | 不代表 |
| --- | --- | --- |
| `5g-sdr-ops` | 文件、已清理的核准範本、稽核 evidence、Runbook、decision 與 lifecycle navigation | Lab host、active configuration 或 service controller |
| `srsRAN_4G/` | 原始碼、patch 與版本 | `/etc/srsran/` 已部署狀態 |
| `/etc/srsran/` | Lab host active runtime configuration | Git working tree 或可用 `git reset` 回復的目標 |
| `configs/` | 僅容納 Human-reviewed、無 Secret 的核准範本 | 自動 deployment authority |

## Lab01 三平面架構

```text
                         Management Plane
                192.168.250.0/24 over Ethernet

   historical Mac en5 192.168.250.10 / control / Git / approval
                     |              |
                     v              v
       Linux1 192.168.250.11   Linux2 192.168.250.12
       EPC + eNB host          UE host

                         Sample Plane
              temporary 10.0.0.0/24 over Ethernet

       Linux1 10.0.0.1  <---- ZeroMQ ---->  10.0.0.2 Linux2
                         RF sample transport

                        UE User Plane

       EPC SGi 172.16.0.1  <---- ICMP ---->  172.16.0.2 UE
                                                   |
                                                   `-- tun_srsue
```

### Management Plane

- Linux1：`192.168.250.11/24`，EPC／eNB host。
- Linux2：`192.168.250.12/24`，UE host。
- Mac：歷史 Phase 4B Gate A 的 `ifconfig` 直接觀察到 `en5 = 192.168.250.10/24`；
  同一 workstream 亦直接觀察到從 Mac 對 Linux1、Linux2 執行 restricted SSH 成功。
- Management subnet 沒有由本 baseline 定義 gateway 或 DNS。

Mac exact address 的狀態是 `HISTORICAL_PRIMARY_OBSERVED`，只證明歷史查詢當下存在且可用；
設定方法、Network Service 名稱、reconnect／reboot 後 persistence 仍為 `UNRESOLVED`，也不得
推論目前 Runtime 仍配置為 `.10`。

### Sample Plane

- Linux1：`10.0.0.1/24`。
- Linux2：`10.0.0.2/24`。
- 用途：承載 eNB 與 UE 之間的 ZeroMQ baseband RF samples。
- Phase 4B／4C 使用 temporary secondary addresses；不是 persistent network configuration。
- Sample Plane 不等於 Management、S1、Internet、UE tunnel 或實體 RF OTA。

### UE User Plane

- EPC SGi：`172.16.0.1`。
- UE：`172.16.0.2`，並觀察到 `tun_srsue`。
- Phase 4C 只證明 bounded bidirectional ICMP connectivity；沒有證明 NAT、Internet、TCP、
  throughput、low latency 或 URLLC。

## Runtime Component Pipeline

```text
Linux1                                      Linux2

srsepc
  |
  v
srsenb  -- ZeroMQ RF sample transport -->  srsue
  ^                                         |
  `-----------------------------------------'
                                            v
                                         tun_srsue
```

- Verified bring-up sequence：EPC → eNB → UE。
- Observed protocol path：cell search → Random Access → RRC Connected → Network Attach。
- Controlled shutdown sequence：UE → eNB → EPC。
- Phase 4C 結束時服務已停止；以上不是目前 live-state claim。

## Historical Bearer Evolution

```text
historical owner-reported Lab01
USB Wi-Fi adapter / Linux1 hotspot bearer
                  |
                  v
recovered Phase 4B/4C baseline
switched Ethernet management + dedicated temporary sample plane
```

- Wi-Fi／USB topology 保留為 historical architecture provenance 與當時文件中的 fallback。
- Switched Ethernet sample plane 有後續 direct validation，並 supersede「Wi-Fi 是 current
  Lab01 bearer」的成熟度。
- 這是 controlled migration，不是把舊 `/etc/srslte/` whole-file configuration 複製回去。

## Source Authority、Authentication 與 Authorization

| 概念 | 回答的問題 | 邊界 |
| --- | --- | --- |
| `Authentication` | 你是誰？ | 身分驗證不決定可執行範圍 |
| `Authorization` | 你可以做什麼？ | 權限不證明資料正確或最新 |
| `Source Authority` | 哪份證據／決策可裁定這個 claim？ | Procedure source 不自行授予執行權 |

Source Authority 依 claim domain、適用性、時間與 directness 判斷。Repo Owner decision 可裁定
project decision；execution evidence 可裁定當時 observation；Instructor input 可裁定 course
requirement，但不自動裁定 implementation。

## Agent 與 Git Security Boundaries

- AI／Agent 可以提出、讀取或修改其 Task Package 明確授權的內容；tool capability 不等於 authorization。
- Dedicated SSH key 提供 credential separation 與 revocation boundary，不提供 Linux permission
  isolation、Runtime authorization 或 OS sandbox。
- Git 提供 change tracking、review 與 change-control surface，不是 OS sandbox，也不能讓
  destructive Runtime action 自動變安全。
- `Agent task completed` ≠ `Human accepted` ≠ `Ready for PR` ≠ `Merged`。
- Secret、Ki、OPC、token、private key 與敏感 subscriber data 不得進入 Git 或 evidence output。

## Lab02 Historical Compatibility Boundary

`HISTORICAL_CONFIGURATION_RESIDUE_OBSERVED`：Lab01 recovery 的唯讀 configuration
inspection 直接觀察到 Linux1 `enb.conf` 指向
`sib_config = /etc/srsran/sib.conf.mbsfn`；配套 audit 亦保存 Linux1 eMBMS／MBSFN／SIB13／M1
references，以及 Linux2 MBMS service fields 與 selected PHY residue。這是歷史 configuration
residue，不是 current active-config claim，也不證明 Lab02／eMBMS 功能曾通過驗證。它可以與
Phase 4C 的 Lab01 core-path PASS 同時成立。

舊 srsLTE course material 是 lower-authority historical reference，不能直接取代 current
srsRAN_4G source、example 或 Runtime evidence。Human-reviewed Part 6 SoE consolidation
保存的歷史 Lab02 incident 只支持下列邊界；目前 Repo 並無足以重驗 incident 細節的 raw evidence：

- SIB13 configuration mapping ≠ SIB13 Runtime observation。
- eNB／service starts ≠ MBMS functional validation。
- MAC-LTE visible ≠ SIB13／MCCH／MTCH validated。
- DLT、FIFO startup／recovery 與 eMBMS Control Plane terminology 均可能 version-sensitive。

上述細節只保留為 `HISTORICAL_NEEDS_REVALIDATION`；Lab02 不是目前 active mainline，
也沒有新的 execution authorization。見 [`docs/known-limitations.md`](known-limitations.md)。

## 6G LEO / NTN Boundary

6G LEO / NTN 只存在於
[`docs/research/6g-ntn-handover/`](research/6g-ntn-handover/README.md) 的
`RESEARCH_PARKING / CONCEPT_PROTOTYPE / NOT_INTEGRATED` 文件線。它不是 Lab01／Lab02
architecture extension，也不代表 real LEO handover、3GPP NTN compliance、scheduler、
MAC／RRC mobility control 或 Doppler compensation 已實作或驗證。

## Claim Boundary Summary

已確認與未驗證項目的 canonical register 見
[`docs/known-limitations.md`](known-limitations.md)。任何新 evidence 若要改變本文件，必須
記錄來源、時間、適用 scope、claim-level diff 與 Human Review；不得用 Handoff 重述或
Assistant proposal 直接覆蓋。
