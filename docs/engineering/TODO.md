# 5G SDR 工程待辦事項

狀態：`SUPERSEDED / HISTORICAL RECOVERY BACKLOG`

本清單保存 Lab01 recovery 前期的 backlog provenance。未勾選項目不代表目前仍未完成，
也不構成新的 execution authorization；其中 baseline、ZeroMQ、Attach 與 ICMP 等狀態已由
後續 Phase 4C evidence 部分 supersede。Current checkpoint 請見
[`PROGRESS.md`](../../PROGRESS.md)，目前 lifecycle 導覽請見 [`TODO.md`](../../TODO.md)，
未驗證範圍請見 [`docs/known-limitations.md`](../known-limitations.md)。

以下原始 checkbox 為避免改寫歷史而保留，不再作 current backlog authority。

## 稽核

- [ ] 待所有文件產出並完成審閱後，將回復盤點文件標記為完成。
- [x] 新增設定樹快照。
- [x] 新增 SHA-256 快照。

## 回復

- [ ] 識別權威 Lab01 基線。
- [ ] 修改前備份啟用中的設定。
- [ ] 將 `enb.conf` 的 `sib_config` 回復為一般 `sib.conf`。
- [ ] 停用啟用中的 eMBMS 設定。
- [ ] 檢閱 UE MBMS service 設定。
- [ ] 決定是否保留 MAC PCAP。
- [ ] 驗證 scheduler、expert 與 PHY 覆寫值。

## ZeroMQ

- [ ] 驗證 Linux1 與 Linux2 的 `device_args`。
- [ ] 驗證位址 `192.168.250.11` 與 `192.168.250.12`。
- [ ] 驗證 TX/RX 連接埠方向。

## 驗證

- [ ] 最小化 EPC/eNB/UE attach。
- [ ] 下行與上行 ICMP。
- [ ] 下行與上行 TCP。
- [ ] NAT 與 Internet route 驗證。
- [ ] S1-MME 觀測。
- [ ] S1-U 觀測。
- [ ] SGi 觀測。

## 治理

- [ ] 審閱 Codex 遠端代理規範 v0.1-draft。
- [ ] 新增不含憑證的儲存庫專屬主機盤點。
- [ ] 定義設定備份位置。
- [ ] 定義核准與回復報告範本。

## 設定治理

- [ ] 定義 configs/ 目錄結構。
- [ ] 建立 Lab01 核准設定 Profile。
- [ ] 建立 Lab02 eMBMS 設定 Profile。
- [ ] 建立不含真實憑證的 user_db.csv.example。
- [ ] 補充設定、憑證、PCAP、日誌、core dump 與 build artifact 的 .gitignore 規則。
- [ ] 定義備份、差異檢查、核准、部署、驗證與回復流程。
- [ ] 建立 deployment state manifest。
- [ ] 定義 Lab01 與 Lab02 的標籤命名規則。
- [ ] 定義 Linux1 與 Linux2 的主機角色清單，但不得包含登入密碼。
- [ ] 確認 srsRAN_4G 上游、專案 fork 與本機 checkout 的關係。
- [ ] 定義 Linux1 與 Linux2 必須使用的 srsRAN_4G commit 或 tag。
- [ ] 設計核准設定同步至 /etc/srsran/ 的人工部署流程。

## 延後處理

- [ ] Lab02 eMBMS 與 SIB13。
- [ ] B210 OTA。
- [ ] 2x2 MIMO。
- [ ] RF 與 PHY 可觀測性。
- [ ] Lab03 URLLC。
- [ ] 6G LEO 與 NTN 研究。
