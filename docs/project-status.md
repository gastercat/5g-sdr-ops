# Project Status

本文件彙整四個 Lab 的狀態。所有來源筆記中的完成度尚未由本 repo 實機驗證，因此狀態一律保守標記。

| Lab | 主題 | 目前整理狀態 | 下一步 |
| --- | --- | --- | --- |
| Lab01 | 小基站平台建置與量測 | 來源筆記記載已有基礎平台與除錯流程；本 repo 尚未實機確認，NEEDS_CONFIRMATION | 整理 ICMP/TCP/iperf 與 Wireshark 結果，補 evidence |
| Lab02 | eMBB / eMBMS | 待確認；不可視為已完成 | 確認 SIB13、MCCH、MTCH、MCH、IPTV multicast evidence |
| Lab03 | uRLLC / PRP | 待執行 / future work | 先確認 USRP、nukxURLLC、Split/Duplication 基礎驗證 |
| Lab04 | Access Security | 待執行 / future work | 先確認合法授權、隔離 RF 環境，再建置 UHD、srsGUI、UE Scanner |

## NEEDS_CONFIRMATION 狀態

- Lab01 EPC / eNB / UE 是否可穩定啟動：NEEDS_CONFIRMATION
- Lab01 UE 是否取得 `tun_srsue` 與 `172.16.0.x`：NEEDS_CONFIRMATION
- Lab01 ICMP / TCP / iperf 結果：NEEDS_CONFIRMATION
- Lab01 Wireshark S1-MME / S1-U / SGi 封包觀測結果：NEEDS_CONFIRMATION
- Lab02 `sib.conf.mbsfn` 是否正確 mapping 至 SIB13：NEEDS_CONFIRMATION
- Lab02 UE MAC-LTE pcap 是否可觀測 System Information / SIB13：NEEDS_CONFIRMATION
- Lab02 MCCH / MTCH / MCH 是否穩定出現：NEEDS_CONFIRMATION
- Lab02 IPTV multicast 驗證結果：NEEDS_CONFIRMATION
- Lab03 Split Mode / Duplication Mode / PRP 量測：NEEDS_CONFIRMATION
- Lab04 UE Scanner / false base station 實驗環境與合法性：NEEDS_CONFIRMATION
