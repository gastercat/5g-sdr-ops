# 5G SDR 工程待辦事項

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

## 延後處理

- [ ] Lab02 eMBMS 與 SIB13。
- [ ] B210 OTA。
- [ ] 2x2 MIMO。
- [ ] RF 與 PHY 可觀測性。
- [ ] Lab03 URLLC。
- [ ] 6G LEO 與 NTN 研究。
