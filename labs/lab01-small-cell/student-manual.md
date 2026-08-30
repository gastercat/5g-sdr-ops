# Lab01 學生實驗手冊｜兩節點 LTE／EPC ZeroMQ

狀態：`DRAFT / HUMAN REVIEW REQUIRED`
適用環境：Ubuntu 24.04、srsRAN_4G、兩節點 ZeroMQ Lab01
教學 profile：`lab01-student-zmq-lte`

本手冊是學生實驗流程，不是 Operator／TA recovery runbook。預期結果只作為判讀基準，
不等於學生的實際結果；學生必須記錄自己真正觀察到的輸出。未執行或未確認的項目一律標示
`NOT VALIDATED`。

## 開始前 Gate

在執行第一個指令前，由 Instructor／TA 確認下列條件：

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

---

## 1. 實驗目的與完成條件

### 1.1 學習目標

完成本實驗後，學生應能：

1. 說明 EPC、eNB、UE 在 LTE／EPC 架構中的角色。
2. 區分 Sample Plane、Control Plane 與 User Plane。
3. 從指定 revision 建置具有 ZeroMQ RF support 的 srsRAN_4G。
4. 確認 eNB／UE ZeroMQ TX、RX endpoints 互補。
5. 依 EPC → eNB → UE 啟動，辨識 Cell Search、Random Access、RRC 與 EPS attach。
6. 驗證 UE address，並執行 Core Lab01 的 DL／UL ICMP。
7. 辨識 SCTP／S1AP、NAS-EPS、GTP-U、SGi 與 ICMP 的角色。
8. 依 UE → eNB → EPC 受控停止，並回復本次建立的 temporary network state。

### 1.2 Core Lab01 完成條件

- EPC、eNB、UE 依序啟動且沒有 execution-critical error。
- UE 完成 Cell Search、Random Access、RRC connection 與 EPS attach。
- 目前 UE address 已記錄，不可只抄預期值。
- DL／UL ICMP 都有實際結果與 packet loss 記錄。
- Runtime 已 reverse-order 停止。
- 本次建立的 temporary sample-plane state 已移除；原本為 DOWN、且由本實驗設為 UP 的
  interface 才回復為 DOWN。

這些條件不包含 NAT／Internet、TCP throughput、latency／URLLC、eMBMS 或 Lab02。

---

## 2. 背景知識

### 2.1 EPC、eNB 與 UE

| 元件 | 節點與角色 | 主要觀察 |
| --- | --- | --- |
| EPC | Node 1；MME、HSS、S-GW、P-GW | S1 Setup、NAS attach、bearer、SGi |
| eNB | Node 1；LTE base station | Cell、Random Access、RRC、S1AP、GTP-U |
| UE | Node 2；software UE | Cell Search、EPS attach、`tun_srsue`、UE IP |

本 Lab 使用 srsRAN_4G 的 LTE／EPC 路徑，不是 5G SA、gNB 或 5GC 實驗。

### 2.2 三個 Plane

| Plane | Node 1 | Node 2 | 用途 |
| --- | --- | --- | --- |
| Sample | `10.0.0.1/24` | `10.0.0.2/24` | ZeroMQ baseband RF samples；temporary |
| Control | eNB ↔ MME | UE NAS 經 eNB | SCTP／S1AP／NAS-EPS signalling |
| User | `srs_spgw_sgi`、`172.16.0.1` | `tun_srsue`、預期 `172.16.0.2` | UE IP traffic／GTP-U |

Management Plane 只用於 Instructor／Operator 管理，不是 Student Teaching Config 的一部分，
也不得與 Sample Plane 混用。

### 2.3 ZeroMQ 與 User Plane

ZeroMQ 在 eNB 與 UE 間承載 baseband RF samples，用來取代實體 OTA radio path；它不是
S1AP、NAS 或一般 message-broker 功能驗證。`tun_srsue` address 出現代表 UE L3 endpoint
已建立，但不等於 ICMP、NAT、Internet 或 throughput 已通過。

### 2.4 重要協定

- **SCTP／S1AP：**eNB 與 MME 的控制面 transport 與 signalling。
- **NAS-EPS：**UE 與 MME 間的 EPS mobility management、identity、authentication 與
  security signalling；eNB 主要負責轉送。
- **GTP-U：**eNB 與 S-GW 間承載 UE user-plane IP packet 的 tunnel。
- **SGi：**P-GW 面向外部 IP network 的介面邊界。

---

## 3. Current Lab Environment

### 3.1 邏輯拓樸

```text
Node 1: EPC + eNB                            Node 2: UE

10.0.0.1/24                                 10.0.0.2/24
eNB TX tcp://*:2000  -------------------->  UE RX tcp://10.0.0.1:2000
eNB RX tcp://10.0.0.2:2001  <-------------  UE TX tcp://*:2001

S-GW/P-GW SGi 172.16.0.1  <--------------> tun_srsue expected 172.16.0.2
```

本手冊固定 logical roles 與 address plan，不固定實體 NIC 名稱。學生必須從 fresh `ip link`／
`ip addr` observation 找出 sample-plane interface，分別寫入：

```bash
NODE1_SAMPLE_IFACE='<Node 1 fresh-observed interface>'
NODE2_SAMPLE_IFACE='<Node 2 fresh-observed interface>'
```

不可直接沿用歷史 interface name。

### 3.2 Source 與 Config Authority

本 Lab 固定 srsRAN_4G revision：

```text
6bcbd9e5bf8686aa7085202cd847c5ddd64a9c16
```

Student Teaching Config 位於 [student-config/README.md](student-config/README.md)，profile ID 為
`lab01-student-zmq-lte`。`/etc/srsran/` 是目前 Runtime config 位置；`/etc/srslte/` 只屬 legacy
命名，不得作為本手冊的 current procedure。

`ue.conf.template` 不含 subscriber credential，也不是可直接啟動的 UE config。Instructor／TA
必須在 Repo 外 materialize `/etc/srsran/ue.conf` 與 `/etc/srsran/user_db.csv`，完成配對後只向
學生確認 Subscriber Provisioning Gate 已通過。

---

## 4. Stage 1｜Host 與 Sample-plane Network

### 4.1 Fresh inventory 與 pre-state

在兩台節點分別執行：

```bash
hostname
ip -br link
ip -4 -br addr
ip -4 route
```

記錄：

| 項目 | Node 1 | Node 2 |
| --- | --- | --- |
| sample interface |  |  |
| original link state（UP／DOWN） |  |  |
| original IPv4 |  |  |
| existing `10.0.0.0/24` route |  |  |

若 `10.0.0.1/24`、`10.0.0.2/24` 或衝突的 `10.0.0.0/24` route 已存在，先停止並通知
Instructor；不要覆蓋未知狀態。

### 4.2 Temporary address 設定

先把 fresh-observed interface 寫入本機 shell variable。若 interface 原本為 DOWN，只有在
Instructor 核准後才設定 UP，並記錄「本 Lab 將 DOWN 改為 UP」。原本已 UP 就不要重複改變。

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

Pass Gate：兩個 address 位於剛才確認的 interface；兩台都有正確 direct route；peer route
lookup 選到相同 sample interface。Address／route 正確不等於 peer 或 ZeroMQ 已通。

---

## 5. Stage 2｜Build、Install 與 Teaching Config

### 5.1 取得固定 source revision

在兩台節點各自使用 Instructor 指定的工作目錄：

```bash
git clone https://github.com/srsran/srsRAN_4G.git
cd srsRAN_4G
git checkout --detach 6bcbd9e5bf8686aa7085202cd847c5ddd64a9c16
git rev-parse HEAD
git status --short
```

`git rev-parse HEAD` 必須等於指定 SHA；checkout 若不乾淨或 provenance 不清楚，停止並通知
Instructor。本手冊固定 source revision，但不宣稱任何尚未實測的 pristine Ubuntu 24.04
clean-build PASS 或 installed-binary provenance。

### 5.2 建置與確認 ZeroMQ support

依 srsRAN_4G 官方安裝指引安裝依賴後：

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

`grep` 必須得到 `ENABLE_ZEROMQ:BOOL=ON`。沒有此結果就不要進入 Runtime。

不要執行會自動安裝 sample subscriber database 的 generic config installer。Instructor／TA 依
Student Teaching Config 的 README，以受控方式將無 Secret core configs materialize 到
`/etc/srsran/`，並另外完成 Subscriber Provisioning Gate。

### 5.3 Static pairing check

開始 Runtime 前核對：

| 項目 | eNB | UE |
| --- | --- | --- |
| TX | `tcp://*:2000` | `tcp://*:2001` |
| RX | `tcp://10.0.0.2:2001` | `tcp://10.0.0.1:2000` |
| ID | `enb` | `ue` |
| base rate | `23.04e6` | `23.04e6` |

另外確認 MCC／MNC、TAC、APN、EARFCN 與 radio parameters 均符合 profile；不得讀取或
比對 subscriber secret values。

---

## 6. Stage 3｜Runtime Bring-up 與 Core Connectivity

### 6.1 Stage 3A：EPC

在 Node 1 EPC terminal 執行：

```bash
cd /etc/srsran
sudo /usr/local/bin/srsepc /etc/srsran/epc.conf
```

確認 config 成功載入、MME／HSS／S-GW／P-GW 初始化，且 process 持續執行。若出現 fatal
parse、permission、log、bind 或 dependency error，停止；不要自行修改 config。

### 6.2 Stage 3B：eNB

EPC 通過後，在 Node 1 eNB terminal 執行：

```bash
cd /etc/srsran
sudo /usr/local/bin/srsenb /etc/srsran/enb.conf
```

確認 eNB 使用 `device=zmq`、載入預期 endpoints、顯示 started，且與 EPC 完成 S1 interaction。
未通過就不要啟動 UE。

### 6.3 Stage 3C：UE attach

EPC 與 eNB 均持續執行後，在 Node 2 UE terminal 執行：

```bash
cd /etc/srsran
sudo /usr/local/bin/srsue /etc/srsran/ue.conf
```

依 terminal 實際輸出記錄下列 milestone，不可預先填 PASS：

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

`172.16.0.2` 是 profile 的預期值；只在 fresh output 中確實看到時才記錄為實際結果。

### 6.4 Stage 3D：Core DL／UL ICMP

僅在 attach 完成且 `tun_srsue`／`srs_spgw_sgi` address 已確認後執行。

Node 2 → EPC SGi：

```bash
ping -I tun_srsue -c 4 172.16.0.1
```

Node 1 → UE：

```bash
ping -I srs_spgw_sgi -c 4 172.16.0.2
```

逐項記錄 sent、received 與 packet loss。單向或雙向未執行時標示 `NOT VALIDATED`；failure
保留 literal output，不得改寫成成功或直接歸因。

---

## 7. Stage 4｜Protocol Observation

依 Instructor 指定的 interface 與 capture policy 使用 Wireshark／`tshark`。不得收集、顯示
或提交 subscriber credential、完整 identifier、authentication material 或未去識別的敏感
PCAP。Core profile 預設不由 srsRAN process 自動產生 PCAP。

### 7.1 必須辨識的訊息

| 類別 | 可觀察位置 | 辨識重點 |
| --- | --- | --- |
| SCTP／S1AP | Node 1 loopback／S1 path | S1 Setup、UE context、release |
| NAS-EPS | S1AP 內封裝 | Attach、identity、authentication、Security Mode |
| GTP-U | eNB ↔ S-GW user path | Tunnel endpoint 與 inner UE IP packet |
| SGi／ICMP | `srs_spgw_sgi`／`tun_srsue` | Core DL／UL echo request／reply |
| Detach／release | controlled shutdown window | UE／eNB／EPC 的終止與 context release |

### 7.2 學生紀錄格式

每項只記錄本次 observation：timestamp、capture point、display filter、message type、必要且已
去識別的欄位，以及它屬於 Control Plane 或 User Plane。外部歷史報告不是學生執行本 Stage
的必要輸入，也不得用歷史截圖替代本次結果。

---

## 8. Security Lens

本 profile 使用 `EEA0` 與 `EIA1` 作為受控 teaching／interoperability baseline。`EEA0`
不提供 user-plane confidentiality；這不是 production-network security recommendation。

觀察 EPS attach 時，分開說明：

1. **Identity：**網路需要辨識 subscriber／device；報告不得揭露實際 identifier。
2. **Authentication：**UE 與核心網依預先 provisioned state 驗證彼此授權關係。
3. **Security Mode：**MME／UE 協商並啟用本 profile 允許的 NAS security algorithms。

不得把「attach 成功」寫成安全性足以供 production 使用，也不得讀取 credential 來完成報告。

---

## 9. Optional Extensions

### 9.1 TCP／iperf Measurement Extension

分類：`OPTIONAL_MEASUREMENT_EXTENSION`。只有 Instructor 明確啟用時執行；否則記錄
`NOT VALIDATED`。

```bash
IPERF_SERVER_IP='<Instructor-provided address>'
iperf3 -c "$IPERF_SERVER_IP"
```

測試前由 Instructor 指定 server 所在位置、routing direction、duration 與接受標準。這個
extension 沒有既定 TCP／iperf PASS，也不得由 ICMP 或 attach 結果推導 throughput。

### 9.2 NAT／Internet Instructor Extension

分類：`OPTIONAL_INSTRUCTOR_EXTENSION`。Core Lab01 不要求修改 IP forwarding 或 firewall。
只有 Instructor 先確認 `$INTERNET_IFACE`、現有 forwarding／firewall state、變更所有權與
rollback plan 後，才可另行授權。

在任何獲准的 forwarding mutation 前，先保存實際 pre-state：

```bash
ORIGINAL_IP_FORWARD="$(sysctl -n net.ipv4.ip_forward)"
```

若 extension 需要新增 NAT rule，Instructor 必須先確認完全相同 rule 原本不存在，記錄本次
新增的 exact rule，cleanup 時只刪除本次建立且仍可精確識別的 rule；不得以廣泛的 add/delete
recipe 影響既有 firewall state。最後將 `net.ipv4.ip_forward` 回復為
`$ORIGINAL_IP_FORWARD`。未執行時，NAT／Internet 一律為 `NOT VALIDATED`。

---

## 10. Controlled Shutdown 與 Cleanup

### 10.1 Reverse-order shutdown

由持有各 Runtime terminal 的 Human Operator 依序送出 Ctrl-C／SIGINT：

1. Node 2：`srsue`
2. 確認 UE 停止後，Node 1：`srsenb`
3. 確認 eNB 停止後，Node 1：`srsepc`

每一步保留 visible shutdown output。若 process 未停止，不要自行使用 `kill`／`pkill`；停止並
通知 Instructor。

可用 read-only check 確認：

```bash
pgrep -a -x srsue
pgrep -a -x srsenb
pgrep -a -x srsepc
```

無輸出才表示該名稱的 process 未被觀察到。

### 10.2 移除 temporary sample-plane state

確認 Runtime 全部停止後：

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

最後確認 temporary addresses／routes 已消失，而不屬於本 Lab 的 Management Plane 與既有
network state 未被改變。

---

## 11. Troubleshooting 與已知限制

遇到問題時只做下列學生層級處置：

1. 保留目前 terminal output，不要反覆重啟或清除畫面。
2. 記錄最後一個成功 milestone 與第一個 literal error。
3. 確認是否碰到 Gate：source SHA、ZeroMQ build flag、sample address／route、啟動順序或
   Subscriber Provisioning Gate。
4. 若繼續需要改 config、network、credential、source 或強制終止 process，立即停止並通知
   Instructor。

### `Error receiving samples`

若 UE 顯示 literal `Error receiving samples`：

- 不得因此撤銷先前已實際觀察到的 attach milestone。
- 也不得單憑這一行判定 ZeroMQ、PHY、eNB、UE 或 network 是 root cause。
- 記錄發生時點、前一個成功 milestone、process 是否仍執行與後續是否有新輸出，然後停止
  unsafe retry 並通知 Instructor。

目前既有紀錄對 sample processing 是否恢復與 root cause 都仍為 `UNKNOWN`。

---

## 12. 學生提交與 Final Checklist

### 12.1 提交內容

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

### 12.2 Final Checklist

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

---

## Maintainer Claim Boundary（不屬於學生操作步驟）

- 2026-08-24 bounded recovery 的 fresh evidence 到達 UE attach，並觀察到 UE IP
  `172.16.0.2`；該次沒有 fresh-validate user-plane ICMP、NAT／Internet、TCP／iperf、
  throughput、latency 或 URLLC。
- 歷史 Stage 4 實驗結果仍是 historical evidence，不可替代學生本次 observation。
- 沒有 Full Lab01 PASS 或 TCP／iperf PASS claim。
- Attach 後曾觀察到一次 literal `Error receiving samples`；sample processing 是否恢復與
  root cause 均為 `UNKNOWN`。
- 歷史 MBMS／eMBMS residue 不等於 Lab02／eMBMS validation。
- `lab01-student-zmq-lte` 已完成 static consistency review，但尚未 isolated Runtime validate；
  teaching-profile design approval 不等於 Runtime validation。

## Student-facing Sources

- [Student Teaching Config](student-config/README.md)
- [srsRAN_4G Installation Guide](https://docs.srsran.com/projects/4g/en/latest/general/source/1_installation.html)
- Pinned source tree：srsRAN_4G commit
  `6bcbd9e5bf8686aa7085202cd847c5ddd64a9c16`
