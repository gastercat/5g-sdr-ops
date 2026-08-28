# Glossary

本文件整理 5G 垂直應用系統架構與 SDR 實驗平台常用名詞。

> **適用邊界：**5GS／NR 詞條是一般技術名詞，不代表本專案已實作或驗證對應功能。
> 目前具 authority 的 Lab01 架構是使用 EPC、eNB、UE 與 ZeroMQ 的 4G／LTE historical
> execution baseline；它不是目前 Runtime live-state evidence，也不是 5G SA、gNB、5GC
> 或 Lab02 功能驗證。各實驗 claim 的狀態以 [`PROGRESS.md`](../PROGRESS.md)、
> [`architecture-overview.md`](architecture-overview.md) 與
> [`known-limitations.md`](known-limitations.md) 為準。

## 系統總體架構

| 中文名詞 | 英文名詞 | 縮寫 | 說明 |
| --- | --- | --- | --- |
| 第五代行動通訊系統 | 5G System | 5GS | 由 UE、5G Access Network、5G Core Network 組成的完整 5G 系統。 |
| 使用者設備 | User Equipment | UE | 手機、SDR UE、IoT 裝置、車載終端、工業終端等。 |
| 接取網路 | Access Network | AN | UE 連入核心網前所經過的接取層，可包含 3GPP 與 non-3GPP access。 |
| 5G 接取網路 | 5G Access Network | 5G-AN | 連接 UE 與 5GC 的接取網路，可包含 NG-RAN 或 non-3GPP AN。 |
| 下一代無線接取網路 | Next Generation Radio Access Network | NG-RAN | 5G 的無線接取網路，由 gNB 或 ng-eNB 組成。 |
| 5G 核心網路 | 5G Core Network | 5GC | 5G 的核心網路，採用服務化架構，包含 AMF、SMF、UPF 等網路功能。 |
| 資料網路 | Data Network | DN | UE 最終要存取的外部網路，例如 Internet、企業私網、邊緣應用伺服器。 |
| 垂直應用 | Vertical Application | VA | 面向特定產業或場景的應用，例如工業控制、車聯網、遠端醫療、XR。 |

## RAN／無線接取網路

| 中文名詞 | 英文名詞 | 縮寫 | 說明 |
| --- | --- | --- | --- |
| 下一代節點 B | Next Generation Node B | gNB | 5G NR 基站，提供 NR 控制面與使用者面協定終止。 |
| 下一代演進型節點 B | Next Generation evolved Node B | ng-eNB | 可連接 5GC 的 LTE/E-UTRA 基站。 |
| 5G 新無線電 | New Radio | NR | 5G 的無線介面技術。 |
| 演進型通用陸地無線接取 | Evolved Universal Terrestrial Radio Access | E-UTRA | LTE 的無線接取技術。 |
| Xn 介面 | Xn Interface | Xn | NG-RAN 節點之間的介面。 |
| 下一代介面 | Next Generation Interface | NG | NG-RAN 與 5GC 之間的介面。 |
| 控制面 NG 介面 | NG Control Plane Interface | NG-C / N2 | RAN 到 AMF 的控制面介面。 |
| 使用者面 NG 介面 | NG User Plane Interface | NG-U / N3 | RAN 到 UPF 的使用者面介面。 |
| 無線資源控制 | Radio Resource Control | RRC | 控制 UE 與 RAN 之間的連線、量測、重配置與移動性。 |
| 封包資料匯聚協定 | Packet Data Convergence Protocol | PDCP | 處理加密、完整性保護、標頭壓縮（header compression）、封包複製（packet duplication）等。 |
| 無線鏈路控制 | Radio Link Control | RLC | 負責分段、重組、重傳等功能。 |
| 媒體存取控制 | Medium Access Control | MAC | 負責排程、HARQ、邏輯通道對應等功能。 |
| 實體層 | Physical Layer | PHY | 負責調變、編碼、MIMO、無線資源映射等。 |

## NR 實體層與初始接入

| 中文名詞 | 英文名詞 | 縮寫 | 說明 |
| --- | --- | --- | --- |
| 頻率範圍 1 | Frequency Range 1 | FR1 | 5G NR 使用的較低頻率範圍；精確上下限依適用的 3GPP 版本與頻段定義。 |
| 頻率範圍 2 | Frequency Range 2 | FR2 | 5G NR 使用的較高頻率範圍；精確上下限依適用的 3GPP 版本與頻段定義。 |
| 毫米波 | Millimeter Wave | mmWave | 高頻大頻寬頻段，常用於高容量場景。 |
| 子載波間距 | Subcarrier Spacing | SCS | OFDM 子載波之間的頻率間隔；可用值依通道／訊號、頻率範圍與 3GPP Release 而異，例如 15、30、60、120、240、480 或 960 kHz。 |
| 資源區塊 | Resource Block | RB | 頻域上連續 12 個子載波的資源單位。 |
| 主要同步訊號 | Primary Synchronization Signal | PSS | UE 初始搜尋小區時使用。 |
| 次要同步訊號 | Secondary Synchronization Signal | SSS | UE 初始搜尋小區與取得 cell identity 時使用。 |
| 實體廣播通道 | Physical Broadcast Channel | PBCH | 傳送 MIB，協助 UE 完成初始接入。 |
| 同步訊號／實體廣播通道區塊 | Synchronization Signal/Physical Broadcast Channel Block | SS/PBCH block（SSB） | 包含 PSS、SSS、PBCH 與相關解調參考訊號，用於初始小區搜尋與接入。 |
| 實體下行控制通道 | Physical Downlink Control Channel | PDCCH | 承載下行控制資訊，例如排程指示。 |
| 實體下行共享通道 | Physical Downlink Shared Channel | PDSCH | 承載下行使用者資料或系統資訊。 |
| 實體上行共享通道 | Physical Uplink Shared Channel | PUSCH | 承載上行資料。 |
| 實體上行控制通道 | Physical Uplink Control Channel | PUCCH | 承載 HARQ-ACK、CSI、SR 等上行控制資訊。 |

## 5GC／核心網路功能

| 中文名詞 | 英文名詞 | 縮寫 | 說明 |
| --- | --- | --- | --- |
| 接取與移動管理功能 | Access and Mobility Management Function | AMF | 負責 UE 註冊、連線、移動性、NAS-MM。 |
| 會話管理功能 | Session Management Function | SMF | 負責 PDU Session 建立、修改、釋放與 UPF 控制。 |
| 使用者面功能 | User Plane Function | UPF | 負責使用者面封包轉送、N3/N6/N9、PDU Session Anchor。 |
| 統一資料管理 | Unified Data Management | UDM | 管理使用者訂閱資料與部分狀態資料。 |
| 認證伺服功能 | Authentication Server Function | AUSF | 處理 UE 認證。 |
| 政策控制功能 | Policy Control Function | PCF | 產生與控制 QoS、計費（charging）與政策（policy）規則。 |
| 網路儲存庫功能 | Network Repository Function | NRF | 提供 NF 註冊、發現與服務查詢。 |
| 網路切片選擇功能 | Network Slice Selection Function | NSSF | 協助選擇適合 UE 或服務的 network slice。 |
| 網路能力暴露功能 | Network Exposure Function | NEF | 將 5GC 能力以受控方式暴露給第三方或應用。 |
| 安全邊界保護代理 | Security Edge Protection Proxy | SEPP | 保護跨 PLMN 的控制面訊息，常用於 roaming 架構。 |

## 使用者面、會話與 QoS

| 中文名詞 | 英文名詞 | 縮寫 | 說明 |
| --- | --- | --- | --- |
| 使用者面 | User Plane | UP | 實際傳輸使用者資料的平面。 |
| 控制面 | Control Plane | CP | 負責註冊、認證、會話管理、政策控制等信令（signaling）。 |
| PDU 會話 | Protocol Data Unit Session | PDU Session | UE 與 DN 之間的資料連線單位。 |
| QoS 流 | QoS Flow | — | 5GS 中 QoS forwarding treatment 的最小粒度。 |
| 5G QoS 識別碼 | 5G QoS Identifier | 5QI | 指向特定 QoS forwarding behavior 的識別碼。 |
| 資料網路名稱 | Data Network Name | DNN | 5G 中用於識別資料網路的名稱，類似 EPC 的 APN。 |
| 單一網路切片選擇輔助資訊 | Single Network Slice Selection Assistance Information | S-NSSAI | 用於標示特定 network slice。 |

## 垂直應用

| 中文名詞 | 英文名詞 | 縮寫 | 說明 |
| --- | --- | --- | --- |
| 增強型行動寬頻 | Enhanced Mobile Broadband | eMBB | 面向高資料率、高容量、影音、XR、熱點覆蓋的 5G 場景。 |
| 超可靠低延遲通訊 | Ultra-Reliable Low-Latency Communication | URLLC | 面向低延遲、高可靠、高可用性的 5G 場景。 |
| 大規模機器型通訊 | Massive Machine Type Communications | mMTC | 面向大量低功耗、低資料量 IoT 裝置的 5G 場景。 |
| 5G 媒體串流 | 5G Media Streaming | 5GMS | 5G 中面向媒體串流的服務架構。 |
| 多媒體廣播多播服務 | Multimedia Broadcast/Multicast Service | MBMS | 用於廣播或多播內容的服務；本詞條不表示本專案已驗證 MBMS／eMBMS 功能。 |
| 關鍵通訊 | Critical Communications | — | 對延遲（latency）、可靠度（reliability）及可用性（availability）有嚴格要求的通訊服務。 |

## URLLC 技術機制

| 中文名詞 | 英文名詞 | 縮寫 | 說明 |
| --- | --- | --- | --- |
| 邏輯通道優先處理映射限制 | Logical Channel Prioritization Mapping Restrictions | LCP mapping restrictions | RRC 可為每個邏輯通道設定映射限制，以控制可使用的子載波間距、PUSCH 傳輸時間、服務小區及 grant 等；具體參數依 3GPP Release。`NEEDS_CONFIRMATION`：本專案適用的 Release 尚未指定。 |
| 封包複製 | Packet Duplication | — | PDCP 將同一封包複製到多條 RLC 或傳輸路徑，提高可靠度。 |
| 雙連線 | Dual Connectivity | DC | UE 同時連接兩個 RAN 節點或兩條傳輸腿。 |
| 配置授權 | Configured Grant | CG | 預先配置上行資源，減少排程等待時間。 |
| 雙 PDU 會話冗餘 | Redundant PDU Sessions | — | 為同一應用建立兩條 PDU Session，提高端到端可靠性。 |
| 影格複製與消除 | Frame Replication and Elimination for Reliability | FRER | TSN 中用於複製封包並在接收端消除重複封包的機制。 |
| 時間敏感網路 | Time-Sensitive Networking | TSN | 提供確定性延遲（deterministic latency）與可靠傳輸的乙太網路技術族。 |

## 安全、認證與身分

| 中文名詞 | 英文名詞 | 縮寫 | 說明 |
| --- | --- | --- | --- |
| 網路接取安全 | Network Access Security | — | UE 安全接入網路與服務的安全功能集合。 |
| 主要認證 | Primary Authentication | — | UE 與網路之間的相互認證（mutual authentication）。 |
| 5G 認證與金鑰協議 | 5G Authentication and Key Agreement | 5G AKA | 5G 原生的 AKA 認證程序。 |
| 訂閱永久識別碼 | Subscription Permanent Identifier | SUPI | 5G 中使用者永久訂閱識別。 |
| 訂閱隱藏識別碼 | Subscription Concealed Identifier | SUCI | 對 SUPI 做隱私保護後的識別碼。 |
| 5G 全球唯一臨時 UE 識別碼 | 5G Globally Unique Temporary UE Identity | 5G-GUTI | 避免在 signaling 中暴露永久身分的臨時識別碼。 |
| 安全保證方法論 | Security Assurance Methodology | SECAM | 衡量 3GPP network product 安全特性的流程與方法。 |
| 安全保證規範 | Security Assurance Specification | SCAS | 特定 network product class 的安全需求與測試案例。 |
| 合法監聽 | Lawful Interception | LI | 電信商依合法授權提供通訊攔截能力。 |

## 實驗平台與開源工具

| 中文名詞 | 英文名詞 | 縮寫 | 說明 |
| --- | --- | --- | --- |
| 軟體定義無線電 | Software Defined Radio | SDR | 以軟體實作大量無線通訊功能的無線平台。 |
| 通用軟體無線電周邊 | Universal Software Radio Peripheral | USRP | 常用 SDR 硬體平台。 |
| USRP Hardware Driver | USRP Hardware Driver | UHD | USRP 的硬體驅動與工具鏈。 |
| srsRAN | Software Radio Systems RAN | srsRAN | 開源 4G/5G RAN 軟體。 |
| srsLTE | Software Radio Systems LTE | srsLTE | srsRAN 前身，開源 LTE 系統。 |
| srsUE | Software Radio Systems UE | srsUE | 開源 LTE UE。 |
| srsENB | Software Radio Systems eNB | srsENB | 開源 LTE eNB。 |
| srsEPC | Software Radio Systems EPC | srsEPC | 開源 EPC。 |
| 封包擷取 | Packet Capture | PCAP | 擷取封包供分析，例如 Wireshark 分析。 |
| Wireshark | Wireshark Protocol Analyzer | — | 常用封包分析工具；工具存在不代表本專案已完成 PCAP 協定觀測（protocol observation）。 |
