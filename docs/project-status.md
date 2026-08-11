# Project Status（Historical Bootstrap Pointer）

狀態：`SUPERSEDED FOR CURRENT STATE / HISTORICAL BOOTSTRAP`

本路徑原本保存 2026-06-24 bootstrap 階段的四個 Lab 狀態表。該表中的 Lab01
`NEEDS_CONFIRMATION` 已被後續 Phase 4C evidence 部分 supersede；若在此重建另一份
current-status 表，會與 `PROGRESS.md` 形成第二個權威來源，因此不再於本檔更新狀態。

目前請使用：

- [`PROGRESS.md`](../PROGRESS.md)：current checkpoint、stop point、next gate 與 workstream lifecycle。
- [`docs/architecture-overview.md`](architecture-overview.md)：Lab01 recovered architecture。
- [`docs/known-limitations.md`](known-limitations.md)：Lab01 未測項目、Lab02 歷史待重驗與教學缺口。
- [`TODO.md`](../TODO.md)：Active／Near-term、Future Teaching 與 Research Parking 導覽。
- [`Lab03 URLLC / PRP`](../labs/lab03-urllc/README.md) 與
  [`Lab04 Security`](../labs/lab04-security/README.md)：`HISTORICAL REFERENCE /
  NEEDS_CONFIRMATION / NOT ACTIVE / NOT_AUTHORIZED`；不構成 current workstream。

## Preserved Historical Boundary

- Lab01 bootstrap 目標曾包含 EPC／eNB／UE、Attach、ICMP／TCP、NAT 與 Wireshark；
  後續 evidence 只讓其中明確驗證的子集升格。
- Lab02、Lab03、Lab04 沒有因 Lab01 Phase 4C 完成而自動變成 active 或 authorized。
- Git history 保留原始 bootstrap table 與其 provenance；本檔不將舊狀態重寫成新事實。
