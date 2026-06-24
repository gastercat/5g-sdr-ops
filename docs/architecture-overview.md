# Architecture Overview

本文件整理 5G 垂直應用系統總體架構。這套資料的核心不是單一 5G 基站或單一核心網，而是一個面向垂直應用的 `5G System, 5GS`。

## 架構定位

```text
UE / 垂直應用終端
        |
        | Uu / NR / E-UTRA / Wi-Fi / Non-3GPP Access
        v
5G Access Network
NG-RAN / gNB / ng-eNB / 小基站 / SDR
        |
        | NG-C / NG-U / Xn / X2 / F1
        v
5G Core Network
AMF / SMF / UPF / UDM / AUSF / PCF / NRF / NSSF / NEF / SEPP
        |
        | N6 / API / CAPIF / Edge / DN
        v
Data Network / 垂直應用服務
eMBB / URLLC / mMTC / 5GMS / MBMS / 工業控制 / 車聯網 / 安全監控
```

5GS 由 `5G Access Network`、`5G Core Network` 與 `UE` 組成。`NG-RAN` 可以包含 `gNB` 與 `ng-eNB`，並透過 `NG-C` 接 `AMF`、`NG-U` 接 `UPF`，RAN 節點之間則透過 `Xn` 互連。

## Layer 0：實驗平台與基礎設施層

```text
硬體平台：
PC / Raspberry Pi / Jetson / USRP B210 / LimeSDR / HackRF

軟體平台：
srsLTE / srsRAN / srsUE / srsENB / srsEPC
nukxDC / nukxGC
5GMS / MBMS Gateway

網路連接：
Ethernet / Wi-Fi / SDR RF / Internet
```

此層功能：

- 提供可重現的 SDR 基站與 UE 測試環境。
- 支援 LTE、NR、EPC、5GC 的混合部署。
- 讓 eMBB、URLLC、安全實驗可以在同一平台上進行。
- 作為後續 RAN、Core、QoS、Security、Application 的共同測試基座。

## Layer 1：接取網路層

```text
UE
 |
 | NR Uu
 v
gNB / ng-eNB
 |
 |-- Xn：gNB <-> gNB / gNB <-> ng-eNB
 |-- NG-C：gNB/ng-eNB <-> AMF
 `-- NG-U：gNB/ng-eNB <-> UPF
```

NG-RAN 節點可以是：

- `gNB`：提供 NR user plane 與 control plane protocol termination。
- `ng-eNB`：提供 E-UTRA user plane 與 control plane protocol termination。
- 節點間透過 `Xn interface` 互連。
- RAN 到核心網透過 `NG interface` 連接 5GC。

NR 接取層能力包含：

- FR1：sub-6 GHz。
- FR2：24 GHz 以上毫米波。
- 可擴展 numerology：15、30、60、120、240 kHz SCS。
- 10 ms radio frame、1 ms subframe。
- sub-6 頻寬可到 100 MHz，毫米波可到 400 MHz。
- 初始接入透過 PSS、SSS、PBCH、SSB、SS Burst Set。
- 支援 HARQ、Scheduling、Channel Coding、Modulation、MIMO。

## Layer 2：核心網控制層

5GC 的核心特徵是 `Service-Based Architecture, SBA`。控制面功能以 `Network Function` 提供與消費服務。

| 功能 | 角色 |
| --- | --- |
| AMF | UE 註冊、連線、移動性管理、NAS-MM 終止 |
| SMF | PDU Session 建立、修改、釋放、UPF 控制 |
| UPF | 使用者面轉送、N3/N6/N9、PDU Session Anchor |
| UDM | 訂閱資料、使用者資料管理 |
| AUSF | 認證伺服功能 |
| PCF | 政策控制、QoS policy |
| NRF | NF 註冊與服務發現 |
| NSSF | Network Slice 選擇 |
| NEF | 對第三方或應用暴露網路能力 |
| SEPP | Roaming / Inter-PLMN 控制面安全邊界 |

## Layer 3：使用者面與資料路徑層

```text
UE
 |
 v
gNB / ng-eNB
 |
 | N3
 v
UPF
 |
 | N6
 v
Data Network / Edge / Application Server
```

一般 5G SA 架構中，UE 經由 NG-RAN 接入，控制面走 AMF / SMF，使用者面從 RAN 經 N3 到 UPF，再由 N6 到 Data Network。UPF 可以放在核心網中心，也可以下沉到邊緣以降低 latency。

URLLC 或高可靠場景可以延伸成冗餘路徑：

```text
              |-- gNB / Path A -- UPF1 -- DN
UE -- Dual Connectivity
              `-- gNB / Path B -- UPF2 -- DN
```

## 垂直應用服務層

```text
5G Vertical Applications
|-- eMBB：高頻寬、大容量、影音、XR、5GMS、MBMS
|-- URLLC：低延遲、高可靠、工業控制、車聯網、遠端控制
`-- mMTC：大規模感測器、IoT、低功耗、大連線數
```

### eMBB 子架構

eMBB 的目標是高資料率、高容量、熱點覆蓋、影音內容與行動寬頻體驗。

```text
eMBB Application
4K/8K Video / XR / Cloud Service / FWA / WLL / 5GMS / MBMS
        |
        v
QoS Flow / 5QI / Network Slice
        |
        v
NR High Bandwidth / Massive MIMO / mmWave / Carrier Aggregation
        |
        v
UPF / Edge Cache / Content Delivery / Data Network
```

### URLLC 子架構

URLLC 的目標是低延遲、高可靠、高可用性，應用於工業控制、智慧電網、車聯網、遠端駕駛、遠端醫療、任務關鍵通訊。

```text
URLLC Application
Factory Automation / Remote Driving / Smart Grid / Mission Critical
        |
        v
URLLC QoS Flow / Priority / Policy / QoS Monitoring
        |
        v
NR URLLC Mechanisms
Configured Grant / Short PUSCH / LCP Restriction / Packet Duplication
        |
        v
Redundant User Plane
Dual Connectivity / Two PDU Sessions / Two N3 Tunnels / TSN FRER
        |
        v
Edge UPF / Local Processing / Deterministic Network
```

### mMTC / IoT 支援架構

```text
Massive IoT / Sensors / Smart Devices
        |
        v
Direct Connection 或 Relay UE
        |
        v
低功耗接取 / 小封包 / 大連線密度
        |
        v
5GC Subscription / Policy / Efficient Control Plane
        |
        v
IoT Application / Data Platform
```

## QoS、切片與政策控制層

```text
Application Requirement
        |
        v
Service Profile
Bandwidth / Latency / Reliability / Mobility / Security
        |
        v
Network Slice Selection
NSSF / S-NSSAI / DNN
        |
        v
QoS and Policy Control
PCF / SMF / AMF / 5QI / QoS Flow
        |
        v
RAN Resource Control
Scheduler / LCP / Numerology / DRB / SRB
```

`QoS Flow` 是 5GS 中 QoS forwarding treatment 的最小粒度；`5QI` 則作為 QoS forwarding behavior 的參考指標。

## 多接取與遷移架構

```text
Legacy / Migration Architecture
|-- Option 1：LTE + EPC
|-- Option 2：NR gNB + 5GC，5G SA
|-- Option 3：EN-DC，LTE eNB + NR en-gNB + EPC，5G NSA
|-- Option 4：NR as Master + ng-eNB as Secondary + 5GC
|-- Option 5：LTE ng-eNB + 5GC
`-- Option 7：E-UTRA as Master + NR as Secondary + 5GC
```

此層決定實驗平台是 LTE/EPC 為主的 NSA、NR/5GC 為主的 SA、LTE 與 NR 混合的 MR-DC，或支援 Wi-Fi、non-3GPP、NPN 的多接取架構。

## 安全架構層

```text
Security Architecture
|-- Access Security：UE <-> gNB <-> AMF
|-- Authentication：UE / USIM <-> SEAF <-> AUSF <-> UDM/ARPF
|-- Subscriber Privacy：SUPI / SUCI / 5G-GUTI
|-- NAS / AS Security：Ciphering / Integrity
|-- SBA Security：NF-to-NF secure communication
|-- Inter-PLMN Security：SEPP / N32 / IPUPS
|-- Product Assurance：SECAM / SCAS
`-- Lawful Interception：ADMF / POI / MDF / LEMF
```

5G 安全橫跨 UE、RAN、Core、SBA、Roaming、LI、OAM，包含 network access security、network domain security、user domain security、application domain security、SBA domain security 等安全域。
