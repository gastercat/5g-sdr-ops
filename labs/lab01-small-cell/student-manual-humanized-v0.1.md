# Lab01 開源碼小基站學生實驗手冊

版本 v0.1　狀態：`DELIVERY CANDIDATE / HUMAN REVIEW REQUIRED`

適用環境：Ubuntu 24.04、srsRAN_4G、兩節點 LTE／EPC ZeroMQ Lab01。教學 profile（設定組合）：`lab01-student-zmq-lte`。

本實驗使用兩台節點建立 LTE／EPC 路徑。你會先準備承載 ZeroMQ RF samples（無線電樣本）的主機網路，再依序啟動 EPC、eNB 與 UE，觀察 UE attach（入網）與 IP 位址，最後分別測試兩個方向的 ICMP、觀察協定並受控停止。

請在每一步分開記錄「做了什麼」、「實際看見什麼」與「結果能說明什麼」。手冊中的預期結果只供判讀，不能當成你的實際結果；未執行或未確認的項目一律標示 `NOT VALIDATED`（尚未驗證）。

這份文件提供學生流程，不能代替 Operator／TA 的 recovery runbook（系統恢復作業手冊）。候選稿本身不授權 Runtime（實驗系統執行）操作；編寫時沒有重新執行 Runtime。開始實驗仍須取得 Instructor（授課教師或助教）的本次授權。

## 開始前確認環境與授權

Gate 是進入下一階段前必須滿足的條件。在執行第一個指令前，由 Instructor／TA 確認下列事項，避免在尚未備妥的主機上開始操作：

- 已核准兩台專用 Lab host 或 VM；Node 1 執行 EPC + eNB，Node 2 執行 UE。
- 兩台均為 Ubuntu 24.04，且學生具備本實驗所需的 `sudo` 授權。
- 安裝階段可存取 package repository／Internet。
- 已提供 `git`、CMake、C/C++ build tools、ZeroMQ development package、`ip` 與
  Wireshark／`tshark` 等必要工具；optional measurement extension 另需 `iperf3`。
- 已提供 `lab01-student-zmq-lte` Student Teaching Config。
- Instructor 已完成 Subscriber Provisioning Gate。學生不得讀取、修改、截圖、複製或提交
  subscriber credential。
- 已準備三個 dedicated Runtime terminals：Node 1 EPC、Node 1 eNB、Node 2 UE；另保留
  observation terminal。
- 本次範圍已選定：Core Lab01 必做；NAT／Internet 與 TCP／iperf 均為 optional extension，
  未獲 Instructor 授權時不得執行。

若任何 Gate 未滿足，停止並通知 Instructor／TA。


## 1 實驗目的與完成條件

### 1.1 你會學到什麼

本實驗依主機網路、LTE 入網、使用者資料連通性與協定觀察的順序進行。完成後，你應能：

1. 說明 EPC、eNB、UE 在 LTE／EPC 架構中的角色。
2. 區分 Sample Plane、Control Plane 與 User Plane。
3. 從指定 revision 建置具有 ZeroMQ RF support 的 srsRAN_4G。
4. 確認 eNB／UE ZeroMQ TX、RX endpoints 互補。
5. 依 EPC → eNB → UE 啟動，辨識 Cell Search、Random Access、RRC 與 EPS attach。
6. 驗證 UE address，並執行 Core Lab01 的 DL／UL ICMP。
7. 辨識 SCTP／S1AP、NAS-EPS、GTP-U、SGi 與 ICMP 的角色。
8. 依 UE → eNB → EPC 受控停止，並回復本次建立的 temporary network state。

### 1.2 Core Lab01 核心流程的完成條件

- EPC、eNB、UE 依序啟動且沒有 execution-critical error。
- UE 完成 Cell Search、Random Access、RRC connection 與 EPS attach。
- 目前 UE address 已記錄，不可只抄預期值。
- DL／UL ICMP 都有實際結果與 packet loss 記錄。
- Runtime 已 reverse-order 停止。
- 本次建立的 temporary sample-plane state 已移除；原本為 DOWN、且由本實驗設為 UP 的
  interface 才回復為 DOWN。

這些條件不包含 NAT／Internet、TCP throughput（吞吐量）、latency（延遲）／URLLC、eMBMS 或 Lab02。

**判讀界線：**取得 UE IP 與 attach 成功，仍須另外做 ICMP 才能判斷該次使用者資料連通性。歷史實驗的結果不能預填到你的紀錄；目前 EV-2 的 R5 UE → EPC ICMP 仍是 `FAIL / UNLOCALIZED`（失敗但尚未定位），不宣稱 EV-2 或 Full Lab01 PASS。歷史範圍與來源見最後的審閱附註。


## 2 先認識元件與網路層次

### 2.1 EPC eNB 與 UE 的角色

先辨認執行中的元件，才能知道下一個輸出應該在哪個 terminal（終端機）出現。EPC 是 Evolved Packet Core（演進封包核心網路）；eNB 是 LTE 基地臺；UE 是 User Equipment（使用者設備），本 Lab 使用 software UE（軟體 UE）。

| 元件 | 節點與角色 | 主要觀察 |
| --- | --- | --- |
| EPC | Node 1；MME、HSS、S-GW、P-GW | S1 Setup、NAS attach、bearer、SGi |
| eNB | Node 1；LTE base station | Cell、Random Access、RRC、S1AP、GTP-U |
| UE | Node 2；software UE | Cell Search、EPS attach、`tun_srsue`、UE IP |

本 Lab 使用 srsRAN_4G 的 LTE／EPC 路徑，不是 5G SA、gNB 或 5GC 實驗。

### 2.2 Sample Plane Control Plane 與 User Plane

同一組主機上有不同的資料路徑。檢查前先問：現在看的是 RF 樣本傳送、入網訊號，還是 UE 的 IP 封包？

- Sample Plane（樣本傳送網路）：供 eNB／UE 的 ZeroMQ 傳送 baseband RF samples（基頻無線電樣本）。
- Control Plane（控制平面）：承載入網與連線管理 signalling（訊號）。
- User Plane（使用者平面）：承載 UE 的 IP traffic（IP 流量）。

| Plane | Node 1 | Node 2 | 用途 |
| --- | --- | --- | --- |
| Sample | `10.0.0.1/24` | `10.0.0.2/24` | ZeroMQ baseband RF samples；temporary |
| Control | eNB ↔ MME | UE NAS 經 eNB | SCTP／S1AP／NAS-EPS signalling |
| User | `srs_spgw_sgi`、`172.16.0.1` | `tun_srsue`、預期 `172.16.0.2` | UE IP traffic／GTP-U |

Management Plane（管理平面）只供 Instructor／Operator 管理主機，不屬於 Student Teaching Config，也不得與 Sample Plane 混用。主機能被管理，不表示 LTE 或 UE IP 流量已成功。

### 2.3 ZeroMQ 與 UE IP 位址回答不同問題

ZeroMQ 在 eNB 與 UE 間承載 baseband RF samples，取代本 Lab 的實體 OTA radio path（空中無線電路徑）。這條樣本傳送路徑本身不作為 S1AP、NAS 或一般 message-broker（訊息代理）功能驗證。

接著看 UE 的 IP 路徑：`tun_srsue` 是 UE 側的虛擬網路介面。它的 address 出現，支持 UE L3 endpoint（第三層網路端點）已建立；不等於 ICMP、NAT、Internet 或 throughput 已通過。這些結果要在對應步驟另行觀察。

### 2.4 在協定觀察時會用到的名稱

- **SCTP／S1AP：**eNB 與 MME 的控制面 transport（傳輸）與 signalling（訊號）。MME 是 EPC 中負責 mobility management（移動性管理）的元件。
- **NAS-EPS：**UE 與 MME 間的 EPS mobility management、identity（身分）、authentication（認證）與 security signalling（安全訊號）；eNB 主要負責轉送。
- **GTP-U：**eNB 與 S-GW 間承載 UE user-plane IP packet 的 tunnel（通道）。S-GW 是 Serving Gateway（服務閘道）。
- **SGi：**P-GW 面向外部 IP network 的介面邊界。P-GW 是 PDN Gateway（封包資料網路閘道）；有這個邊界不表示 Internet 已可存取。

第 7 節會把這些名稱對應到觀察位置。看到一種訊息，只記錄它能支持的那一層結果。


## 3 本次教學環境與設定來源

### 3.1 先確認操作節點與方向

```text
Node 1: EPC + eNB                            Node 2: UE

10.0.0.1/24                                 10.0.0.2/24
eNB TX tcp://*:2000  -------------------->  UE RX tcp://10.0.0.1:2000
eNB RX tcp://10.0.0.2:2001  <-------------  UE TX tcp://*:2001

S-GW/P-GW SGi 172.16.0.1  <--------------> tun_srsue expected 172.16.0.2
```

上圖固定節點角色、位址規劃與 ZeroMQ 方向；不固定實體 NIC（網路介面）名稱。TX 是傳送端，RX 是接收端：eNB 的 TX 要對上 UE 的 RX，UE 的 TX 要對上 eNB 的 RX。

先在第 4 節取得本次 `ip link`／`ip addr` 輸出，再把確認的 Sample Plane interface（介面）寫入各自節點的 shell variable（命令列變數）。以下 placeholder（佔位文字）必須換成這次確認的介面名稱，不能原樣執行：

```bash
NODE1_SAMPLE_IFACE='<Node 1 fresh-observed interface>'
NODE2_SAMPLE_IFACE='<Node 2 fresh-observed interface>'
```

不可直接沿用歷史 interface name。這樣做是為了讓位址設定與最後清理都指向你本次確認的介面。

### 3.2 固定 source revision 與教學設定

本 Lab 固定 srsRAN_4G revision：

```text
6bcbd9e5bf8686aa7085202cd847c5ddd64a9c16
```

Student Teaching Config（學生教學設定）位於 [student-config/README.md](student-config/README.md)，profile ID 為 `lab01-student-zmq-lte`。本流程使用 `/etc/srsran/` 的 Runtime config；`/etc/srslte/` 是 legacy（舊版）命名，不得作為目前操作路徑。

設定分成無 Secret（機密）範本與 Instructor 準備的實際檔案。`ue.conf.template` 不含 subscriber credential（訂閱者認證資料），不能直接用來啟動 UE。Instructor／TA 必須在 Repo 外建立完整 `/etc/srsran/ue.conf` 與 `/etc/srsran/user_db.csv` 並完成配對，只向學生確認 Subscriber Provisioning Gate（訂閱者資料準備條件）已通過。學生不讀取或比對認證值。

**界線：**profile 的 static consistency review（靜態一致性審閱）不等於 isolated Runtime validation（獨立環境執行驗證）。檔案存在或設定互補，也不等於本次服務成功。


## 4 Stage 1 準備主機與 Sample Plane

### 4.1 記錄主機目前狀態

先記錄 pre-state（操作前狀態）。最後只能清理本 Lab 新增的網路狀態；沒有這份紀錄，就無法安全判斷哪些設定應保留。

在兩台節點分別執行：

```bash
hostname
ip -br link
ip -4 -br addr
ip -4 route
```

依本次輸出填寫；不要使用歷史值：

| 項目 | Node 1 | Node 2 |
| --- | --- | --- |
| sample interface |  |  |
| original link state（UP／DOWN） |  |  |
| original IPv4 |  |  |
| existing `10.0.0.0/24` route |  |  |

若 `10.0.0.1/24`、`10.0.0.2/24` 或衝突的 `10.0.0.0/24` route 已存在，先停止並通知
Instructor；不要覆蓋未知狀態。

### 4.2 設定 temporary address 並核對路由

這一步準備 ZeroMQ 使用的 Sample Plane temporary address（暫時位址），不建立持久化網路設定。先把剛確認的 interface 寫入本機 shell variable；若尚未確認名稱，不繼續。

若 interface 原本為 DOWN，只有在 Instructor 核准後才設定 UP，並記錄「本 Lab 將 DOWN 改為 UP」。原本已 UP，就略過下方區塊中設定 UP 的那一行；其餘位址與唯讀檢查依本次授權執行。

Node 1：

```bash
sudo ip link set dev "$NODE1_SAMPLE_IFACE" up    # 僅限原本 DOWN 且已核准
sudo ip address add 10.0.0.1/24 dev "$NODE1_SAMPLE_IFACE"
ip -4 -o addr show dev "$NODE1_SAMPLE_IFACE"
ip route show 10.0.0.0/24
ip route get 10.0.0.2
```

Node 2：

```bash
sudo ip link set dev "$NODE2_SAMPLE_IFACE" up    # 僅限原本 DOWN 且已核准
sudo ip address add 10.0.0.2/24 dev "$NODE2_SAMPLE_IFACE"
ip -4 -o addr show dev "$NODE2_SAMPLE_IFACE"
ip route show 10.0.0.0/24
ip route get 10.0.0.1
```

**要看什麼：**`addr show` 確認位址放在哪個介面；`route show` 確認 direct route（直接連接路由）；`route get` 顯示主機要往 peer（另一端）送出時會選哪個介面。

**通過條件：**兩個 address 位於剛確認的介面，兩台都有正確 direct route，peer route lookup 選到各自的 Sample Plane interface。不同時停止並通知 Instructor，不自行改寫路由。

**不能據此宣稱：**address／route 正確只支持本機設定與路由選擇，不等於 peer 或 ZeroMQ 已通，更不等於 LTE attach 或使用者資料傳送成功。


## 5 Stage 2 建置安裝與核對教學設定

### 5.1 取得固定 source revision 並確認來源

這一步固定 source revision（原始碼版本），讓兩端使用同一份版本基準。在兩台節點各自使用 Instructor 指定的工作目錄：

```bash
git clone https://github.com/srsran/srsRAN_4G.git
cd srsRAN_4G
git checkout --detach 6bcbd9e5bf8686aa7085202cd847c5ddd64a9c16
git rev-parse HEAD
git status --short
```

**要看什麼：**`git rev-parse HEAD` 必須等於指定 SHA；`git status --short` 用來檢查工作目錄是否有變更。checkout 不乾淨或 provenance（來源）不清楚時，停止並通知 Instructor。

**界線：**固定 source revision 不能單獨證明 `/usr/local/bin/` 的 installed binary（已安裝執行檔）由該版本建置。本手冊也不宣稱尚未實測的 pristine Ubuntu 24.04 clean-build PASS（全新作業系統的建置可重現性）；prepared host 的 EV-1 結果見審閱附註。

### 5.2 建置並確認 ZeroMQ support

Instructor 確認依 srsRAN_4G 官方安裝指引安裝依賴後，執行下列建置流程。這一步確認本次 build（建置）納入 ZeroMQ support；沒有它，就不能使用本 Lab 的 RF sample path：

```bash
mkdir build
cd build
cmake ../
grep '^ENABLE_ZEROMQ:BOOL=ON$' CMakeCache.txt
make -j"$(nproc)"
make test
sudo make install
sudo ldconfig
```

**要看什麼：**`grep` 必須得到 `ENABLE_ZEROMQ:BOOL=ON`。建置、測試與安裝也必須保留實際結果；沒有此 ZeroMQ 結果，就不要進入 Runtime。若流程失敗，不繼續安裝或啟動，交給 Instructor 確認。

**不能據此宣稱：**build flag、build 或 test 成功，不等於教學 config 已成功載入、UE 已 attach 或 ICMP 已通過。

不要執行會自動安裝 sample subscriber database（範例訂閱者資料庫）的 generic config installer（通用設定安裝器）。Instructor／TA 依 Student Teaching Config README，受控建立 `/etc/srsran/` 下的無 Secret core configs，並另外完成 Subscriber Provisioning Gate。學生只核對非敏感設定與 Gate 確認。

### 5.3 啟動前核對 ZeroMQ pairing

開始 Runtime 前，按下表核對 eNB／UE 的 TX、RX endpoints（端點）。兩個方向都必須互補，不能只核對其中一端：

| 項目 | eNB | UE |
| --- | --- | --- |
| TX | `tcp://*:2000` | `tcp://*:2001` |
| RX | `tcp://10.0.0.2:2001` | `tcp://10.0.0.1:2000` |
| ID | `enb` | `ue` |
| base rate | `23.04e6` | `23.04e6` |

另外確認 MCC／MNC（行動國碼／網路碼）、TAC（追蹤區碼）、APN（存取點名稱）、EARFCN（無線頻道編號）與 radio parameters（無線參數）符合 profile；不得讀取或比對 subscriber secret values。

設定不符時停止並通知 Instructor，不自行替換參數。這份表只支持 static pairing（靜態配對）；ZeroMQ 是否實際傳送樣本與 LTE 是否成功，仍要看下一階段輸出。


## 6 Stage 3 啟動元件並驗證 Core Connectivity

### 6.1 Stage 3A 啟動 EPC

先啟動 EPC，準備 eNB 後續互動所需的核心網路元件。在 Node 1 EPC terminal 執行：

```bash
cd /etc/srsran
sudo /usr/local/bin/srsepc /etc/srsran/epc.conf
```

**要觀察：**config 成功載入，MME／HSS／S-GW／P-GW 初始化，且 process（程序）持續執行。HSS 是保存訂閱者資料的 Home Subscriber Server（歸屬用戶伺服器）；學生不讀取其資料庫。

**結果意義：**這些輸出支持 EPC 啟動階段的狀態；process 存在本身不證明全部初始化完成，也不證明 UE attach 或資料連通性。

**停止條件：**遇到 fatal parse、permission、log、bind 或 dependency error（設定解析、權限、日誌、綁定位址或依賴的致命錯誤），停止並通知 Instructor；不要自行修改 config。

### 6.2 Stage 3B 啟動 eNB

確認 EPC 通過後，再啟動 eNB，觀察基地臺與核心網路的 S1 interaction（S1 互動）。在 Node 1 eNB terminal 執行：

```bash
cd /etc/srsran
sudo /usr/local/bin/srsenb /etc/srsran/enb.conf
```

**要觀察：**eNB 使用 `device=zmq`、載入預期 endpoints、顯示 started，並與 EPC 完成 S1 interaction。逐項記錄實際輸出，不只記錄 process 是否存在。

**結果意義：**這是 eNB 啟動與 EPC／eNB 互動的觀察，還不能證明 UE attach 或 User Plane forwarding（使用者資料轉送）。未通過就不要啟動 UE，通知 Instructor。

### 6.3 Stage 3C 啟動 UE 並記錄 attach

EPC 與 eNB 均持續執行後，才啟動 UE。這一步看 UE 是否依序找到 cell（無線小區）、完成接入與入網。在 Node 2 UE terminal 執行：

```bash
cd /etc/srsran
sudo /usr/local/bin/srsue /etc/srsran/ue.conf
```

Cell Search（小區搜尋）、Random Access（隨機接入）、RRC Connected（無線資源控制連線）與 Network attach 是不同 milestone（階段標記）。依 terminal 實際輸出逐項記錄，不可預先填 PASS，也不能用最後一個訊息補填沒有看到的前段輸出：

| Milestone | 實際輸出摘要 | 結果 |
| --- | --- | --- |
| UE config／process initialization |  |  |
| UE ZeroMQ endpoints |  |  |
| Cell Search |  |  |
| Random Access |  |  |
| RRC Connected |  |  |
| Network attach |  |  |
| UE IP |  |  |

在 Node 2 observation terminal 確認目前 UE address：

```bash
ip -4 -o addr show dev tun_srsue
ip route show
```

`172.16.0.2` 是 profile 的預期值；只在本次輸出確實看到時才記錄為實際結果。若不符，先通知 Instructor，不自行改位址或 ping 的目標。

**結果意義：**attach 輸出與 UE address 支持各自的入網／位址觀察；它們不單獨證明 GTP-U forwarding、ICMP 或 Internet。下一步另測 ICMP。

### 6.4 Stage 3D 分別測試 Core DL 與 UL ICMP

ICMP echo request／reply（回應請求／回覆）用來觀察這次指定端點間的連通性。僅在 attach 完成且 `tun_srsue`／`srs_spgw_sgi` address 已確認後執行；任一條件未確認，就不進入本步。

`-I` 指定介面，`-c 4` 限定本次封包數。兩個方向各自記錄，不能由其中一個方向推定另一方向成功。

UL（上行），Node 2 → EPC SGi：

```bash
ping -I tun_srsue -c 4 172.16.0.1
```

DL（下行），Node 1 → UE：

```bash
ping -I srs_spgw_sgi -c 4 172.16.0.2
```

**要記錄：**逐項填寫 sent（送出）、received（收到）與 packet loss（封包遺失率）。單向或雙向未執行時標示 `NOT VALIDATED`；failure 保留 literal output（原文輸出），不得改寫成成功或直接歸因。

**結果意義：**實際收到 reply，支持該方向、該次有限封包測試的 ICMP 連通性。沒有 reply，支持該次嘗試失敗，不能單憑此結果定位哪個元件有問題。

**不能據此宣稱：**ICMP 不證明 TCP throughput、NAT／Internet、low latency、URLLC 或長時間穩定。歷史 Phase 4C 與 EV-2 的結果必須按各自範圍閱讀，不能取代你的輸出。


## 7 Stage 4 觀察協定並分層解讀

前一階段用 terminal 與 ICMP 看執行結果；這一階段用 protocol observation（協定觀察）辨識訊息種類與所在層次。依 Instructor 指定的 interface 與 capture policy（擷取規範）使用 Wireshark／`tshark`。本手冊未固定擷取介面與命令，必須先由 Instructor 提供本次方式，不能自行套用歷史截圖或 Lab02 的 capture 流程。

**資料界線：**不得收集、顯示或提交 subscriber credential、完整 identifier（識別資料）、authentication material（認證材料）或未去識別的敏感 PCAP（封包擷取檔）。Core profile 預設不由 srsRAN process 自動產生 PCAP；設定關閉不表示協定不存在。

### 7.1 看什麼訊息與位置

| 類別 | 可觀察位置 | 辨識重點 |
| --- | --- | --- |
| SCTP／S1AP | Node 1 loopback／S1 path | S1 Setup、UE context、release |
| NAS-EPS | S1AP 內封裝 | Attach、identity、authentication、Security Mode |
| GTP-U | eNB ↔ S-GW user path | Tunnel endpoint 與 inner UE IP packet |
| SGi／ICMP | `srs_spgw_sgi`／`tun_srsue` | Core DL／UL echo request／reply |
| Detach／release | controlled shutdown window | UE／eNB／EPC 的終止與 context release |

### 7.2 記錄觀察並限制結論

每項只記錄本次 observation：timestamp（時間）、capture point（擷取位置）、display filter（顯示篩選條件）、message type（訊息種類）、必要且已去識別的欄位，以及它屬於 Control Plane 或 User Plane。

**如何解讀：**SCTP／S1AP 與 NAS-EPS 協助辨識控制面互動；GTP-U 協助辨識 tunnel 與其中的 UE IP packet；SGi／ICMP 則看 echo request／reply。Detach／release 要在 controlled shutdown window（受控停止時段）記錄實際看到的訊息，不保證每次停止都能擷取到同樣內容。

**不能據此宣稱：**看到一類訊息，不代表上表所有類別或整個流程都已驗證。沒有找到訊息時，保留未確認狀態並請 Instructor 核對觀察方式，不直接判定協定不存在。

外部歷史報告不是執行本 Stage 的必要輸入；不得用歷史截圖替代本次結果。歷史封包觀察的來源與未保存原始材料的限制見審閱附註。


## 8 Security Lens 入網時的安全觀察

本節只辨認 EPS attach 中的身分、認證與 Security Mode（安全模式），不要求讀取機密資料。教學 profile 使用 `EEA0` 與 `EIA1` 作為受控 teaching／interoperability baseline（教學／互通基準）。`EEA0` 不提供 user-plane confidentiality（使用者資料機密性）；這不是 production-network security recommendation（正式網路安全建議）。

觀察時分開說明：

1. **Identity（身分）：**網路需要辨識 subscriber／device；報告不得揭露實際 identifier。
2. **Authentication（認證）：**UE 與核心網依 Instructor 預先 provisioned state（備妥的狀態）驗證彼此授權關係。
3. **Security Mode（安全模式）：**MME／UE 協商並啟用本 profile 允許的 NAS security algorithms（安全演算法）。

不得把「attach 成功」寫成安全性足以供 production 使用，也不得讀取 credential 來完成報告。


## 9 Optional Extensions 選做延伸項目

### 9.1 TCP 與 iperf 測量延伸

本節另回答 TCP 測量問題，沒有納入 Core Lab01 完成條件。分類：`OPTIONAL_MEASUREMENT_EXTENSION`。只有 Instructor 明確啟用時執行；否則記錄 `NOT VALIDATED`。下方指令只在 Instructor 已提供測試條件時使用：

```bash
IPERF_SERVER_IP='<Instructor-provided address>'
iperf3 -c "$IPERF_SERVER_IP"
```

測試前由 Instructor 指定 server（伺服器）所在位置、routing direction（路由方向）、duration（測量時間）與接受標準。這個 extension 沒有既定 TCP／iperf PASS；指令存在不表示測量已執行，更不得由 ICMP 或 attach 推導 throughput。

### 9.2 NAT 與 Internet 的 Instructor 延伸

本節涉及主機 forwarding（轉送）與 firewall（防火牆）狀態，必須另行控制。分類：`OPTIONAL_INSTRUCTOR_EXTENSION`。Core Lab01 不要求修改 IP forwarding 或 firewall。

只有 Instructor 先確認 `$INTERNET_IFACE`、現有 forwarding／firewall state、變更所有權與 rollback plan（回復計畫）後，才可另行授權。未取得授權就略過本節，不把 UE address 或 ICMP 通過解讀成 NAT／Internet 成功。

在任何獲准的 forwarding mutation 前，先保存實際 pre-state：

```bash
ORIGINAL_IP_FORWARD="$(sysctl -n net.ipv4.ip_forward)"
```

若 extension 需要新增 NAT rule，Instructor 必須先確認完全相同 rule 原本不存在，記錄本次
新增的 exact rule，cleanup 時只刪除本次建立且仍可精確識別的 rule；不得以廣泛的 add/delete
recipe 影響既有 firewall state。最後將 `net.ipv4.ip_forward` 回復為
`$ORIGINAL_IP_FORWARD`。未執行時，NAT／Internet 一律為 `NOT VALIDATED`。


## 10 受控停止並回復本次暫時狀態

### 10.1 依反向順序停止 Runtime

先停止 Runtime，再清理 Sample Plane，避免仍在執行的程序失去其網路前提。由持有各 Runtime terminal 的 Human Operator（人工操作者）依序送出 Ctrl-C／SIGINT：

1. Node 2：`srsue`
2. 確認 UE 停止後，Node 1：`srsenb`
3. 確認 eNB 停止後，Node 1：`srsepc`

每一步保留 visible shutdown output。若 process 未停止，不要自行使用 `kill`／`pkill`；停止並
通知 Instructor。

在對應主機的 observation terminal 做 read-only check（唯讀檢查）：Node 2 核對 `srsue`，Node 1 核對 `srsenb` 與 `srsepc`。以下列出三個檢查命令，不要求在同一主機核對全部元件：

```bash
pgrep -a -x srsue
pgrep -a -x srsenb
pgrep -a -x srsepc
```

無輸出才表示該次檢查未觀察到該名稱的 process；不等於主機上所有 process 都已停止。逐步停止與輸出都要保留，不能只用最後狀態補寫完整停止歷程。

### 10.2 只清理本 Lab 建立的 Sample Plane 狀態

先對照第 4 節的 pre-state 與本次變更紀錄，確認下面的位址確實由本 Lab 新增。不能辨識變更所有權時，停止並交給 Instructor，不刪除未知設定。

確認 Runtime 全部停止後，在各自節點只刪除本 Lab 新增的位址並查看路由：

Node 1：

```bash
sudo ip address del 10.0.0.1/24 dev "$NODE1_SAMPLE_IFACE"
ip route show 10.0.0.0/24
```

Node 2：

```bash
sudo ip address del 10.0.0.2/24 dev "$NODE2_SAMPLE_IFACE"
ip route show 10.0.0.0/24
```

只有當 pre-state 紀錄證明 interface 原本為 DOWN，且本 Lab 曾把它改為 UP，才執行：

```bash
sudo ip link set dev "$NODE1_SAMPLE_IFACE" down   # 只在 Node 1 符合上述條件
sudo ip link set dev "$NODE2_SAMPLE_IFACE" down   # 只在 Node 2 符合上述條件
```

`down` 的兩行也分別在對應節點執行，且各自都必須符合上述條件。最後確認本 Lab 的 temporary addresses／routes 已消失，Management Plane 與既有 network state 未被改變；若仍有未知路由或狀態差異，通知 Instructor，不擴大刪除範圍。

這些清理檢查支持本次結束狀態，不證明 reconnect／reboot 後的 persistence（持久性）。


## 11 Troubleshooting 問題判讀與停止條件

先找出最後成功的一層，再描述下一層出了什麼訊息。保留症狀，不先替它命名原因。只做下列學生層級處置：

1. 保留目前 terminal output，不要反覆重啟或清除畫面。
2. 記錄最後一個成功 milestone 與第一個 literal error。
3. 確認是否碰到 Gate：source SHA、ZeroMQ build flag、sample address／route、啟動順序或
   Subscriber Provisioning Gate。
4. 若繼續需要改 config、network、credential、source 或強制終止 process，立即停止並通知
   Instructor。

### 11.1 Error receiving samples 是症狀

**發生什麼事：**若 UE 顯示 literal `Error receiving samples`，表示出現樣本接收錯誤的症狀；它本身沒有指出 root cause（根本原因）。不得因此撤銷先前已實際觀察到的 attach milestone，也不能把已 attach 解讀為後續 sample processing 一定正常。

**先核對什麼：**沿用第 4 節已列出的唯讀檢查，確認本次 Sample Plane address 與 route 是否仍符合 Gate；也核對 source SHA、ZeroMQ build flag、啟動順序與 Subscriber Provisioning Gate。先檢查 Sample Plane，是因為它承載本 Lab 的 ZeroMQ RF samples；這只是核對前提，不是已驗證的 repair procedure（修復流程）。

**如何解讀：**address 消失或 route 不符，支持當下的 Sample Plane 前提有問題；不能據此定位是哪個裝置或程式造成。address／route 符合，只支持這些本機條件，不能證明 peer、ZeroMQ、LTE 或 User Plane 正常。

**不能據此宣稱：**單憑這一行，不能判定 ZeroMQ、PHY（實體層）、eNB、UE、network 或 srsRAN 是 root cause，也不能判定 USB Ethernet adapter（USB 乙太網路轉接器）硬體故障。事件同時發生也不等於因果關係。

**何時停止：**記錄發生時點、前一個成功 milestone、process 是否仍執行與後續是否有新輸出。停止 unsafe retry（不安全的重試）並通知 Instructor。若接下來要改 config、network、credential、source 或強制終止 process，學生不繼續處置。

目前既有紀錄對 sample processing 是否恢復與 root cause 都仍為 `UNKNOWN`。即使 Sample Plane 狀態恢復，也須另有後續 Runtime evidence 才能判斷 LTE／User Plane，不能自行補寫為已修復。

### 11.2 ICMP 失敗與 USB 事件的界線

EV-2 的 R5 UE → EPC ICMP 是一次有界的失敗觀察，狀態仍為 `FAIL / UNLOCALIZED`；attach 與 address 已有紀錄，也沒有使 R5 變成成功。它不定位 UE TUN、bearer／GTP-U、SGi、return path（回程路徑）、USB 或 host networking 的原因。

Linux2 曾出現 USB／kernel device layer 的介面消失事件，與 R5 的關係只屬 `POTENTIAL_CORRELATION_ONLY`（可能相關）；exact root cause 仍為 `UNKNOWN`。後續 120-second UE-active 觀察的 `NOT_REPRODUCED`（該次未重現），不表示問題已修復、adapter 已證明穩定，也不排除或解釋 R5。

這些是歷史限制，不是要求學生重現故障、做 USB A/B isolation 或採用新的修復步驟。深層定位交給 Instructor；R5A 尚未開始，必須另行授權。


## 12 提交本次結果並完成 Final Checklist

### 12.1 報告需要保留什麼

請按操作、觀察、解讀的順序整理報告。每一項保留本次結果；未執行就明寫 `NOT VALIDATED`，失敗就保留失敗，不用歷史結果補齊。

- Host／sample-interface fresh inventory 與 pre-state。
- 固定 source SHA 與 ZeroMQ build flag 的檢查結果。
- 實際使用的非敏感 config profile ID 與 ZeroMQ pairing。
- EPC、eNB、UE 的 startup milestones 與 UE IP。
- Core DL／UL ICMP 的實際 packet loss。
- Stage 4 去識別化 protocol observation。
- reverse-order shutdown 與 temporary-state cleanup 結果。
- optional extension 若未執行，清楚標示 `NOT VALIDATED`。

禁止提交 subscriber credential、identifier、private key、subscriber database、未去識別 PCAP
或含敏感資訊的 terminal screenshot。

### 12.2 Final Checklist 完成前逐項核對

- [ ] Node roles 與 plane boundaries 已說明。
- [ ] Source HEAD 等於 pinned SHA。
- [ ] `ENABLE_ZEROMQ:BOOL=ON` 已確認。
- [ ] Subscriber Provisioning Gate 由 Instructor 確認完成。
- [ ] eNB／UE ZeroMQ endpoints 互補。
- [ ] Cell Search → Random Access → RRC → EPS attach 有本次輸出。
- [ ] UE IP 由本次輸出確認。
- [ ] DL／UL ICMP 都有本次結果，或明確標示 `NOT VALIDATED`。
- [ ] Protocol observation 已去識別化。
- [ ] UE → eNB → EPC 受控停止。
- [ ] temporary sample-plane state 已清理並依 pre-state 回復 link state。
- [ ] NAT／Internet 與 TCP／iperf 沒有被誤寫為 Core PASS。
- [ ] 未提交任何 subscriber／credential material。


## 審閱附註 歷史證據與教學設定界線

本節供 Instructor／Reviewer 核對來源，不是學生操作步驟，也不提供新的執行授權。各時間與 profile 的結果分開保存：

- **歷史 Phase 4C：**canonical checkpoint 保存初始化、ZeroMQ、cell search、Random Access、RRC Connected、Network Attach、UE／EPC addressing、有界雙向 ICMP 與受控停止。Recovered TER 的 Phase 4C milestones 是 `REPORTED_ONLY`（回報結果）；原始 terminal／ICMP output 未在該 record 保存，不能改寫成目前獨立重驗。這些觀察不支持 NAT／Internet、TCP／iperf、performance、reliability、stability、low latency 或 URLLC。
- **2026-08-24 bounded recovery：**fresh evidence 到達 UE attach，並觀察到 UE IP `172.16.0.2`；該次沒有 fresh-validate user-plane ICMP、NAT／Internet、TCP／iperf、throughput、latency 或 URLLC。TER E06A 的完整 EPC initialization 為 Human-reported，E06B／E07 保存當時 review 的 eNB／UE terminal evidence，screenshots 沒有複製進 Repo。
- **2026-08-24 post-attach 與停止：**曾觀察到一次 literal `Error receiving samples`；sample processing 是否恢復與 root cause 均為 `UNKNOWN`。TER E09 支持 final process absence；UE → eNB → EPC／Ctrl-C 是 `REPORTED_ONLY` 的停止意圖，exact sequence／method 未逐階段獨立驗證，不能憑最後狀態補出完整歷程。
- **2026-08-30 EV-1：**prepared Ubuntu 24.04 的 pinned clean-source build、ZeroMQ-enabled build、isolated install 與 upstream tests 已有有界 PASS 紀錄；TER E01 為 `REPORTED_ONLY`。這不等於 pristine Ubuntu dependency-install reproducibility，也不驗證教學 config parser／load 或 Runtime。
- **2026-08-30 EV-2：**R0、R1、R2、R3、R4、R6 已有各自 evidence；R1／R2 initialization 與 R3 attach milestones 保留 `REPORTED_ONLY`，TUN addresses 與 final process absence 有另行 bounded checks。R5 UE → EPC ICMP 為 `FAIL / UNLOCALIZED`，不建立該次 reverse ICMP 結果，也不支持 EV-2 或 Full Lab01 PASS。USB 事件、恢復與 `NOT_REPRODUCED` 的限制保留在第 11 節，不能轉成 root-cause 或永久修復 claim。
- **Stage 4 封包觀察：**原手冊的歷史 Stage 4 結果仍是 historical evidence，不能替代學生本次 observation。Known limitations 將 recovered Phase 4C 的 Wireshark／PCAP protocol observation 列為 `NOT TESTED`；2026-08-24 recovery 也沒有驗證本 Stage。舊 Lab 文件保存的目標或待補 evidence 不建立該 scope 的完成 claim，也不能由此宣稱整個專案從未觀察過封包。
- **歷史 residue：**MBMS／eMBMS residue 不等於 Lab02／eMBMS validation，不納入本 Lab 核心成功標準。
- **Student Teaching Config：**`lab01-student-zmq-lte` 已完成 static consistency review，但尚未 isolated Runtime validate；teaching-profile design approval 不等於 Runtime validation。EV-2 的 run-specific artifacts／materialized inputs 不被改寫成這份 profile 的全面驗證。
- 本手冊沒有 Full Lab01 PASS 或 TCP／iperf PASS claim；舊教材要求執行的項目不自動成為 2026 已驗證結果。

審閱來源：

- [目前進度與 EV-2 限制](../../PROGRESS.md)
- [Canonical architecture](../../docs/architecture-overview.md)
- [Known limitations](../../docs/known-limitations.md)
- [歷史 recovery workstream TER](../../docs/evidence/task-evidence/lab01-recovery-workstream.yaml)
- [2026-08-24 bounded recovery TER](../../docs/evidence/task-evidence/2026-08-24-lab01-current-truth-runtime-recovery.yaml)
- [2026-08-30 EV-1／EV-2 TER](../../docs/evidence/task-evidence/2026-08-30-lab01-ev2-part8-runtime-usb-incident.yaml)
- [Phase 4C claim-to-evidence audit](../../docs/reports/2026-07-14-lab01-claim-evidence-audit.md)


## 學生閱讀來源

- [Student Teaching Config](student-config/README.md)
- [srsRAN_4G Installation Guide](https://docs.srsran.com/projects/4g/en/latest/general/source/1_installation.html)
- Pinned source tree：srsRAN_4G commit
  `6bcbd9e5bf8686aa7085202cd847c5ddd64a9c16`
