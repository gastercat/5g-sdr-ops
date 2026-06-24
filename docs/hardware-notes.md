# Hardware Notes

本文件整理設備角色、5G 訊號實作方式與常用硬體檢查方向。

## 設備角色

### NI / USRP 類設備

NI 設備通常為 USRP 或 PXI 系統，在 SDR 實驗中扮演無線電射頻前端與無線電單元角色。它們負責將數位訊號轉換為類比訊號、升頻至指定頻段並透過天線發射；同時也負責接收電磁波並降頻、數位化。

常見型號：

- USRP B210
- USRP X310
- USRP X410
- USRP N310

### Linux 電腦

Linux 電腦扮演核心網路與基頻處理單元角色。它可以運行開源 5G / LTE 通訊協定疊，負責調變、編解碼、控制面流程、使用者面封包路由與實驗觀測。

## 如何實作 5G 訊號

一般實作步驟：

1. 選擇並安裝軟體協定疊，例如 OpenAirInterface、srsRAN 或 GNU Radio。
2. 將 NI / USRP 設備透過 USB 3.0、10G/40G Ethernet 或 PCIe 連接至 Linux 電腦。
3. 安裝硬體驅動，例如 `UHD`。
4. 設定 5G NR 參數，例如 Band、Bandwidth、SCS、發射功率。
5. 啟動軟體後，由 Linux 電腦產生 I/Q data stream，再交給 SDR 硬體進行 RF 發射或接收。
6. 使用另一台 SDR、商用 UE 或封包/頻譜工具驗證行為。

## 先備知識

### 無線通訊

- 訊號與系統：FFT / IFFT、數位濾波器、取樣定理。
- 數位調變：QPSK、16-QAM、64-QAM、256-QAM、BER。
- 多天線技術：MIMO、Spatial Multiplexing。

### 5G NR

- OFDM：Subcarrier、Cyclic Prefix。
- 5G 頻段：FR1、FR2、mmWave。
- 3GPP：Release 15 / 16 的 SA / NSA 基本概念。

### 光通訊與前傳/後傳

- 光纖傳輸：單模、多模、衰減、色散。
- CPRI / eCPRI：BBU 與 RU 間的前傳協定。
- RoF：Radio over Fiber。

## 常用硬體檢查指令

| 目的 | 指令 |
| --- | --- |
| 查看 CPU | `lscpu` |
| 查看記憶體 | `free -h` |
| 查看硬碟 | `lsblk`、`df -h` |
| 查看網路介面 | `ip addr`、`ip link` |
| 查看路由 | `ip route` |
| 查看網卡 driver 與速率 | `ethtool <interface>` |
| 查看 USB 裝置 | `lsusb` |
| 查看 kernel 偵測訊息 | `dmesg --follow` |
| 查看 USRP | `uhd_find_devices`、`uhd_usrp_probe` |
| 查看 UHD image | `uhd_images_downloader` |
| 查看執行中程序 | `ps aux`、`htop` |
| 查看即時網路流量 | `iftop`、`tcpdump`、Wireshark |

## 硬體規格查詢方向

| 硬體 | 查詢位置 | 需要確認的規格 |
| --- | --- | --- |
| USRP B210 | Ettus Research / NI 官方文件 | 頻率範圍、取樣率、USB 3.0、TX/RX channel、clock、gain、供電需求 |
| LimeSDR | Lime Microsystems 官方文件 | 頻率範圍、取樣率、RX/TX channel、driver、校正方式 |
| HackRF | Great Scott Gadgets 官方文件 | 半雙工限制、頻率範圍、取樣率、TX/RX 切換限制 |
| PC / Mini PC | 廠商規格表與 `lscpu`、`free -h`、`lsblk` | CPU 核心數、記憶體、硬碟、網卡數量、USB 版本 |
| Ethernet NIC | `ip link`、`ethtool`、廠商規格 | 介面名稱、速率、duplex、driver、是否穩定 |
| Switch / Router | 廠商規格表 | LAN 速率、是否隔離網段、是否有 DHCP/NAT 干擾 |
| Android UE | 手機規格與測試 App | 支援 LTE band、Android 版本、工程模式資訊、cell reselection 行為 |

## 重要知識點關鍵字

- 系統與架構：SDR、O-RAN、5GC、gNB、SA、NSA。
- 軟體與工具：USRP、UHD、OpenAirInterface、srsRAN、GNU Radio、DPDK。
- 通訊理論：OFDM、Massive MIMO、Beamforming、I/Q Data、LDPC、Polar Codes。
- 光通訊與介面：WDM、eCPRI、Fronthaul、Backhaul。
