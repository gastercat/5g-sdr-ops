# Project Direction

本文件整理 5G SDR 平台可延伸方向。未經排程或實機驗證的項目不視為 v0.1 承諾。

## 近期方向

- 建立可重現的 SDR 小基站實驗平台。
- 先完成 EPC / eNB / UE / ZeroMQ baseline。
- 以 Log、interface、route、packet capture 作為 runtime evidence。
- 將 Lab01 的 ICMP、TCP、iperf、Wireshark 結果整理成可追蹤表格。
- 將 Lab02 eMBMS 的 SIB13、MCCH、MTCH、MCH 觀測流程標準化。

## 中期方向

- eMBB / eMBMS：整理 MBMS-GW、SIB13、M1、`sgi_mb`、UE MAC-LTE pcap 的觀測流程。
- URLLC：整理 Split Mode、Duplication Mode、PRP、latency、packet loss、jitter 的實驗設計。
- Security：在受控、授權、隔離 RF 環境中整理 UE Scanner / false base station 風險與防護觀察。
- O-RAN：研究 O-RAN Split 7.2x、O-RU、O-DU、O-CU 之間的互通性。
- FPGA / Hardware Acceleration：評估 RFNoC 或 FPGA offload 對 FFT、編解碼、低延遲處理的幫助。

## Future Work

以下項目僅列為 future work，不是 v0.1 承諾：

- B5G / 6G 技術探討。
- AI / ML 輔助 Channel Estimation。
- RIS / Reconfigurable Intelligent Surfaces。
- NTN / Non-Terrestrial Network。
- LEO / 低軌衛星通訊。
- 衛星通道 Doppler Shift 與長距離 latency 模擬。

## 查資料原則

- 優先看本機實際設定檔，不只看簡報截圖。
- 優先看 Log 與封包證據，不只看理論架構。
- 查硬體規格時要確認版本，例如 B200/B210、USB2/USB3、UHD 版本差異。
- 引用程式碼或硬體規格時，應標註版本、commit、作業系統與測試日期。
