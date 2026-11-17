# Lab01 開源碼小基站學生實驗手冊

版本 v0.2　狀態：`DRAFT / HUMAN REVIEW REQUIRED`
適用：Ubuntu 24.04、srsRAN_4G、兩節點 LTE／EPC ZeroMQ　教學 profile：`lab01-student-zmq-lte`

> **v0.2 說明：**以 [v0.1 候選稿](student-manual-humanized-v0.1.md)為底稿，併入
> [Stage 0 環境建置補丁](environment-setup-patch.md)與 2026-11-17 課堂常見錯誤，並改成「一步一卡」的
> 短段落排版。內容尚未經 Human Review；Stage 0 套件清單仍為 `NOT VALIDATED`。v0.1 與補丁檔保留不動。

---

## 這份手冊怎麼用

- **一張卡只做一件事。**照順序做，不要跳。
- **看到「通過」才往下。**看到「停」就停手，舉手問 Instructor（授課教師或助教）。
- **只記你自己看到的。**手冊的預期結果不能抄進報告；沒做的寫 `NOT VALIDATED`。
- 想知道原因時，點開「為什麼？」區塊就好；趕時間可以先跳過。

每張卡用同樣的粗體標籤：

| 標籤 | 意思 |
| --- | --- |
| **在哪台** | 在哪台電腦執行 |
| **目標** | 這張卡要完成什麼 |
| **通過** | 看到這個就算過 |
| **停** | 停下來，通知 Instructor |
| **注意** | 這個結果**不代表**什麼（不要寫過頭） |
| **記錄** | 要記進報告的東西 |
| **提示** | 小技巧或常見情況 |

這份手冊是學生流程，不能代替 Operator／TA 的 recovery runbook。手冊本身不授權 Runtime 操作，
編寫時沒有重新執行 Runtime；開始前仍要取得 Instructor 的本次授權。

## 今天的路線

做完一段就打勾：

- [ ] [開始前：確認授權與環境](#開始前確認授權與環境)
- [ ] [Stage 0：安裝套件](#stage-0-安裝套件)（prepared host 只做 0.1 與 0.5）
- [ ] [Stage 1：設定 Sample Plane 位址](#stage-1-設定-sample-plane-位址)
- [ ] [Stage 2：建置 srsRAN 並改設定檔](#stage-2-建置-srsran-並改設定檔)
- [ ] [Stage 3：啟動 EPC → eNB → UE，測 ping](#stage-3-啟動-epc--enb--ue測-ping)
- [ ] [Stage 4：觀察協定](#stage-4-觀察協定)
- [ ] [收尾：停止並清理](#收尾停止並清理)
- [ ] [交報告前的 Checklist](#交報告前的-checklist)

卡住了？直接看 [卡住了](#卡住了)。

---

## 開始前：確認授權與環境

**目標：**由 Instructor／TA 確認下面每一項。**任何一項沒有，就先不要打第一個指令。**

- [ ] 已核准兩台專用 Lab host 或 VM：**Node 1** 跑 EPC + eNB，**Node 2** 跑 UE。
- [ ] 兩台都是 Ubuntu 24.04，你有本實驗需要的 `sudo` 授權。
- [ ] 安裝階段可以連 package repository／Internet。
- [ ] 已有 `git`、CMake、C/C++ build tools、ZeroMQ development package、`ip`、Wireshark／`tshark`
      （選做的 measurement extension 另需 `iperf3`）。沒有的話照 [Stage 0](#stage-0-安裝套件) 安裝並記錄。
- [ ] 已提供 `lab01-student-zmq-lte` Student Teaching Config。
- [ ] Instructor 已完成 Subscriber Provisioning Gate。
      **你不可以讀取、修改、截圖、複製或提交 subscriber credential。**
- [ ] 準備好三個 Runtime 終端機（Node 1 EPC、Node 1 eNB、Node 2 UE），另外留一個 observation 終端機。
- [ ] 本次範圍已講好：Core Lab01 必做；NAT／Internet 與 TCP／iperf 是選做，**沒有授權就不做**。

**停：**任何一項沒滿足 → 停止並通知 Instructor／TA。

---

## **目標：**今天要達成什麼

### 做完 Core Lab01 的條件

- [ ] EPC、eNB、UE 依序啟動，沒有 execution-critical error。
- [ ] UE 完成 Cell Search → Random Access → RRC connection → EPS attach。
- [ ] 記下**本次**的 UE address（不能只抄預期值）。
- [ ] DL 和 UL 的 ICMP 都有實際結果與 packet loss 紀錄。
- [ ] Runtime 已依反向順序停止。
- [ ] 本次加的 temporary sample-plane state 已移除；只有「原本是 DOWN、被本實驗改成 UP」的
      interface 才改回 DOWN。

**不包含：**NAT／Internet、TCP throughput（吞吐量）、latency（延遲）／URLLC、eMBMS、Lab02。

**判讀界線：**拿到 UE IP、attach 成功，還要另外做 ICMP 才能判斷這次的使用者資料連通性。
歷史結果不能預填進你的紀錄；目前 EV-2 的 R5 UE → EPC ICMP 仍是 `FAIL / UNLOCALIZED`（失敗但尚未定位），
本手冊不宣稱 EV-2 或 Full Lab01 PASS（來源見最後的審閱附註）。

<details>
<summary>你會學到什麼（8 項學習目標）</summary>

1. 說明 EPC、eNB、UE 在 LTE／EPC 架構中的角色。
2. 區分 Sample Plane、Control Plane 與 User Plane。
3. 從指定 revision 建置具有 ZeroMQ RF support 的 srsRAN_4G。
4. 確認 eNB／UE ZeroMQ TX、RX endpoints 互補。
5. 依 EPC → eNB → UE 啟動，辨識 Cell Search、Random Access、RRC 與 EPS attach。
6. 驗證 UE address，並執行 Core Lab01 的 DL／UL ICMP。
7. 辨識 SCTP／S1AP、NAS-EPS、GTP-U、SGi 與 ICMP 的角色。
8. 依 UE → eNB → EPC 受控停止，並回復本次建立的 temporary network state。

</details>

---

## 三分鐘背景

### 誰在哪台電腦

| 元件 | 在哪 | 是什麼 | 你會看到 |
| --- | --- | --- | --- |
| EPC | Node 1 | 核心網路（MME、HSS、S-GW、P-GW） | S1 Setup、NAS attach、bearer、SGi |
| eNB | Node 1 | LTE 基地臺 | Cell、Random Access、RRC、S1AP、GTP-U |
| UE | Node 2 | 軟體手機（software UE） | Cell Search、EPS attach、`tun_srsue`、UE IP |

本 Lab 走 srsRAN_4G 的 **LTE／EPC** 路徑，不是 5G SA、gNB 或 5GC 實驗。

### 三條路（Plane）

做檢查前先問自己：**我現在看的是哪一條路？**

| Plane | 載什麼 | Node 1 | Node 2 |
| --- | --- | --- | --- |
| **Sample** | ZeroMQ 的 baseband RF samples（暫時設定） | `10.0.<排>.<Node 1 電腦編號>/24` | `10.0.<排>.<Node 2 電腦編號>/24` |
| **Control** | 入網訊號 SCTP／S1AP／NAS-EPS | eNB ↔ MME | UE NAS 經 eNB |
| **User** | UE 的 IP 封包／GTP-U | `srs_spgw_sgi`、`172.16.0.1` | `tun_srsue`、預期 `172.16.0.2` |

**注意：**Management Plane 只給 Instructor／Operator 管主機，不屬於 Student Teaching Config，也不可以和
Sample Plane 混用。主機能被管理，不代表 LTE 或 UE IP 流量成功。

<details>
<summary>為什麼要分三條路？ZeroMQ、tun_srsue 和協定名稱</summary>

**ZeroMQ：**在 eNB 與 UE 間承載 baseband RF samples（基頻無線電樣本），取代實體 OTA radio path（空中無線電路徑）。
這條路本身不作為 S1AP、NAS 或一般 message-broker 功能驗證。

**`tun_srsue`：**UE 側的虛擬網路介面。它有 address，支持 UE L3 endpoint（第三層網路端點）已建立；

**不等於** ICMP、NAT、Internet 或 throughput 已通過。

**協定名稱：**

- **SCTP／S1AP：**eNB 與 MME 的控制面 transport 與 signalling。MME 是 EPC 中負責 mobility management 的元件。
- **NAS-EPS：**UE 與 MME 間的 EPS mobility management、identity、authentication 與 security signalling；eNB 主要負責轉送。
- **GTP-U：**eNB 與 S-GW（Serving Gateway）間承載 UE user-plane IP packet 的 tunnel。
- **SGi：**P-GW（PDN Gateway）面向外部 IP network 的介面邊界；有這個邊界不表示 Internet 已可存取。

看到一種訊息，只記錄它能支持的那一層結果。

</details>

### 連線方向圖

```text
Node 1: EPC + eNB                            Node 2: UE

$NODE1_SAMPLE_IP/24                         $NODE2_SAMPLE_IP/24
eNB TX tcp://*:2000  -------------------->  UE RX tcp://$NODE1_SAMPLE_IP:2000
eNB RX tcp://$NODE2_SAMPLE_IP:2001  <-----  UE TX tcp://*:2001

S-GW/P-GW SGi 172.16.0.1  <--------------> tun_srsue expected 172.16.0.2
```

**記法：**eNB 的 TX 對上 UE 的 RX；UE 的 TX 對上 eNB 的 RX。圖固定節點角色、位址規劃與方向，
但**不固定**網卡（NIC）名稱。

### 版本與設定從哪來

- srsRAN_4G 固定版本：

  ```text
  6bcbd9e5bf8686aa7085202cd847c5ddd64a9c16
  ```

- 教學設定：[student-config/README.md](student-config/README.md)，profile ID `lab01-student-zmq-lte`。
- Runtime config 放在 `/etc/srsran/`。`/etc/srslte/` 是舊命名，**不要用**。
- `ue.conf.template` 不含 subscriber credential，**不能直接啟動 UE**。完整的 `/etc/srsran/ue.conf` 與
  `/etc/srsran/user_db.csv` 由 Instructor／TA 在 Repo 外建立並配對，只告訴你「Gate 已通過」。你不讀取或比對認證值。

**注意：**profile 的 static consistency review 不等於 isolated Runtime validation；檔案存在或設定互補，也不等於本次服務成功。

---

## 先設定你的位址（兩台都要）

**目標：**算出本組的 Sample Plane 位址，存進終端機變數。

**規則：**每台 VM 用它所在電腦的位置當位址。

```text
10.0.<排>.<電腦編號>/24      排：1～7　電腦編號：該排的 1～12
```

例：第 3 排第 5 台 → `10.0.3.5/24`。

- **同一組的兩台電腦必須在同一排**（一排一個 `/24`）。跨排分組 → 先通知 Instructor。
- 排和編號照教室標示，**不要自己挑號碼**，免得和別組重複。

**在哪台：Node 1 和 Node 2 都輸入同一組數值**（每台都要知道自己和對方的位址）：

```bash
ROW='<排，1～7>'
NODE1_PC='<Node 1 所在電腦編號>'
NODE2_PC='<Node 2 所在電腦編號>'
NODE1_SAMPLE_IP="10.0.${ROW}.${NODE1_PC}"
NODE2_SAMPLE_IP="10.0.${ROW}.${NODE2_PC}"
SAMPLE_NET="10.0.${ROW}.0/24"
echo "$NODE1_SAMPLE_IP $NODE2_SAMPLE_IP $SAMPLE_NET"
```

**通過：**`echo` 印出三個值，例如 `10.0.3.5 10.0.3.6 10.0.3.0/24`。

**注意：**這些變數只活在**目前這個終端機**。開新終端機或重開機 → 重新輸入一次。

網卡名稱等 Stage 1 查到後再填（placeholder 一定要換掉，不能原樣執行）：

```bash
NODE1_SAMPLE_IFACE='<Node 1 fresh-observed interface>'
NODE2_SAMPLE_IFACE='<Node 2 fresh-observed interface>'
```

**注意：**不可以沿用歷史 interface name；位址設定和最後清理都要指向你**本次**確認的介面。

---

## Stage 0 安裝套件

> **驗證狀態：**套件清單依 srsRAN_4G 官方安裝指引與本手冊需要的工具整理，編寫時**沒有**在 pristine
> Ubuntu 24.04 上重新執行。整個 Stage 0 是 `NOT VALIDATED`；不能把「照 Stage 0 裝完」寫成 clean-build PASS。
> Stage 0 不改變既有 Gate、完成條件或停止條件，也不授權 Runtime 操作。

**Instructor 已經準備好主機？**只做 [0.1](#01-看主機資源) 和 [0.5](#05-檢查安裝結果)，記錄結果，不要重裝或升級。

### 0.1 看主機資源

**在哪台：Node 1 和 Node 2**　**目標：**確認版本與資源夠用（只讀，不改東西）

```bash
hostname
lsb_release -a
uname -r
nproc
free -h
df -h ~
```

**記錄：**填表：

| 項目 | Node 1（EPC + eNB） | Node 2（UE） |
| --- | --- | --- |
| hostname |  |  |
| Ubuntu 版本（須為 24.04） |  |  |
| kernel |  |  |
| CPU 核心數 |  |  |
| 可用記憶體 |  |  |
| home 可用空間 |  |  |

**停：**不是 Ubuntu 24.04 → 停止（本手冊沒涵蓋其他版本）。

**停：**磁碟空間明顯不足（建置要數 GB）→ 先通知 Instructor。

**提示：**記憶體 4 GB 以下時，之後 `make -j"$(nproc)"` 可能失敗；到時改用 `make -j2`，並記錄你改了什麼。

### 0.2 更新套件索引

**在哪台：Node 1 和 Node 2**

```bash
sudo apt update
```

**不要**執行 `sudo apt upgrade` 或 `sudo apt full-upgrade`：整機升級可能換掉 kernel、USB／網路驅動或
library 版本，屬於 host 層級變更，由 Instructor 決定。

**停：**出現 repository、DNS 或 proxy 錯誤 → 保留輸出並通知 Instructor；不要自己改 `/etc/apt/`。

### 0.3 安裝建置套件

**在哪台：Node 1 和 Node 2**（兩台都要從 source 建置）

```bash
sudo apt install -y \
  build-essential cmake git pkg-config \
  libfftw3-dev libmbedtls-dev libboost-program-options-dev \
  libconfig++-dev libsctp-dev \
  libzmq3-dev
```

**注意：**本 Lab 用 ZeroMQ 取代實體 radio，**不需要** UHD（USRP driver）或其他 SDR driver。除非 Instructor 指定，不要多裝。

<details>
<summary>每個套件是做什麼的</summary>

| 套件 | 用途 |
| --- | --- |
| `build-essential` | `gcc`／`g++`／`make` 等 C/C++ 編譯工具 |
| `cmake` | 產生 build 設定；Stage 2 的 `cmake ../` 需要 |
| `git` | 取得 pinned source revision |
| `pkg-config` | 讓 CMake 找到 library 位置 |
| `libfftw3-dev` | PHY 層 FFT 運算 |
| `libmbedtls-dev` | 加解密與 security 相關運算 |
| `libboost-program-options-dev` | 解析命令列與 config 參數 |
| `libconfig++-dev` | 讀取 `.conf` 設定檔（如 `sib.conf`、`rr.conf`） |
| `libsctp-dev` | eNB ↔ MME 的 SCTP／S1AP transport |
| `libzmq3-dev` | ZeroMQ RF sample path；沒有它就無法得到 `ENABLE_ZEROMQ:BOOL=ON` |

</details>

### 0.4 安裝觀察與網路工具

**在哪台：Node 1 和 Node 2**

```bash
sudo apt install -y iproute2 iputils-ping procps
```

**通過：**顯示 already the newest version 是正常的（Ubuntu 24.04 通常已預裝）。

**封包觀察工具（Stage 4 用）：**裝在 Instructor 指定的 capture 節點（通常至少 Node 1；要看 `tun_srsue` 就 Node 2 也裝）。

```bash
sudo apt install -y tshark
```

有桌面且 Instructor 允許 GUI，可改裝 `wireshark`。

**停：**跳出 **「Should non-superusers be able to capture packets?」** → 選 **No**，之後依 capture policy 用 `sudo tshark …`。
選 Yes 並加入 `wireshark` group 會留下持續性的權限變更：只有 Instructor 明確同意才可以，做了要寫進報告，
並由 Instructor 決定是否回復。

**iperf3（選做，Instructor 啟用 TCP／iperf extension 才裝）：**

```bash
sudo apt install -y iperf3
```

**停：**問你要不要開機自動啟動 daemon → 選 **No**。本 Lab 不常駐 iperf3 server；選 Yes 會占用 port 5201，
之後出現 `Address already in use`。

<details>
<summary>這三個網路工具在手冊哪裡用到</summary>

| 套件 | 用到的指令 |
| --- | --- |
| `iproute2` | `ip link`、`ip addr`、`ip route`（Stage 1、3、收尾） |
| `iputils-ping` | `ping -I tun_srsue …`、`ping -I srs_spgw_sgi …`（Stage 3） |
| `procps` | `pgrep -a -x srsue` 等唯讀 process 檢查（收尾） |

</details>

### 0.5 檢查安裝結果

**在哪台：Node 1 和 Node 2**　**目標：**確認套件都在（只讀）

```bash
gcc --version | head -n 1
cmake --version | head -n 1
git --version
pkg-config --modversion libzmq
dpkg-query -W -f='${Package} ${Version}\n' \
  build-essential cmake pkg-config libfftw3-dev libmbedtls-dev \
  libboost-program-options-dev libconfig++-dev libsctp-dev libzmq3-dev
```

有裝 capture 工具的節點加跑 `tshark --version | head -n 1`。

**通過：**`pkg-config --modversion libzmq` 印出版本號（不是 `Package libzmq was not found`）。

**通過：**`dpkg-query` 沒有出現 `no packages found matching …`。

**停：**任一項沒過 → 不要進 Stage 2，保留輸出並通知 Instructor。

**注意：**兩台的套件版本**應該**一致；不一致時記錄差異，由 Instructor 判斷能不能繼續。

**記錄：**填表：

| 檢查 | Node 1 | Node 2 |
| --- | --- | --- |
| gcc 版本 |  |  |
| cmake 版本 |  |  |
| libzmq 版本（`pkg-config`） |  |  |
| `dpkg-query` 是否列出全部 9 個套件 |  |  |
| tshark 版本（若有安裝） |  |  |

### 0.6 VirtualBox 與還原卡（教室 Windows 電腦才需要）

**在哪台：Windows 主機**

- **VM 檔和註冊資料分開存：**VM 放在沒有還原卡保護的磁碟（例如 D 槽），`.vbox` 設定（含 MAC）會保留；
  但 C 槽上 VirtualBox 的註冊資料可能被還原。還原後管理員看不到 VM，就重新註冊：

  ```bat
  cd "C:\Program Files\Oracle\VirtualBox"
  VBoxManage list vms
  VBoxManage registervm "D:\<VM 資料夾>\<VM 名稱>.vbox"
  ```

- **`VBoxManage` 找不到：**Windows 預設沒把 VirtualBox 加進 PATH，先 `cd` 到安裝目錄。
  拼字是 `VBoxManage`，子命令是 `list vms`（不是 `vms list`）。
- **兩台 VM 的 MAC 不可以一樣：**同一份複製出來的 VM，在 Bridged 模式下先在各 VM 裡用 `ip link show`
  比對 sample interface 的 MAC。要改時 VM 先關機，並取得 Instructor 同意：

  ```bat
  VBoxManage modifyvm "<VM 名稱>" --macaddress1 020000AABB01
  ```

  自訂 MAC 第一個 byte 用 `02`（locally administered），避免和實體網卡廠商位址衝突；兩台用不同值，記進報告。

---

## Stage 1 設定 Sample Plane 位址

### 1.1 先拍下「操作前」的樣子

**在哪台：Node 1 和 Node 2**　**目標：**記錄 pre-state。最後清理時，只能清掉本 Lab 新增的東西；沒有這份紀錄就沒辦法安全判斷。

```bash
hostname
ip -br link
ip -4 -br addr
ip -4 route
```

**記錄：**用**本次**輸出填（不要抄歷史值）：

| 項目 | Node 1 | Node 2 |
| --- | --- | --- |
| sample interface |  |  |
| original link state（UP／DOWN） |  |  |
| original IPv4 |  |  |
| existing `$SAMPLE_NET` route |  |  |

查到網卡名稱後，回去填 `NODE1_SAMPLE_IFACE`／`NODE2_SAMPLE_IFACE`。

**停：**本組位址（`$NODE1_SAMPLE_IP`／`$NODE2_SAMPLE_IP`）或 `$SAMPLE_NET` route **在加入前就已經存在** → 停止，
不要覆蓋未知狀態。

**提示：**同一排的其他組也用這個 `/24`，這是正常的；但兩組的位址不能一樣。

### 1.2 加上暫時位址

**目標：**加上 ZeroMQ 用的 temporary address（不建立持久化網路設定）。網卡名稱還沒確認 → 不要繼續。

**網卡原本是 DOWN？**要 Instructor 核准才設成 UP，並記錄「本 Lab 將 DOWN 改為 UP」。原本就是 UP → 跳過第一行。

**在哪台：Node 1**

```bash
sudo ip link set dev "$NODE1_SAMPLE_IFACE" up    # 僅限原本 DOWN 且已核准
sudo ip address add "${NODE1_SAMPLE_IP}/24" dev "$NODE1_SAMPLE_IFACE"
ip -4 -o addr show dev "$NODE1_SAMPLE_IFACE"
ip route show "$SAMPLE_NET"
ip route get "$NODE2_SAMPLE_IP"
```

**在哪台：Node 2**

```bash
sudo ip link set dev "$NODE2_SAMPLE_IFACE" up    # 僅限原本 DOWN 且已核准
sudo ip address add "${NODE2_SAMPLE_IP}/24" dev "$NODE2_SAMPLE_IFACE"
ip -4 -o addr show dev "$NODE2_SAMPLE_IFACE"
ip route show "$SAMPLE_NET"
ip route get "$NODE1_SAMPLE_IP"
```

**通過：**位址在剛確認的介面上；兩台都有正確的 direct route；`route get` 選到各自的 Sample Plane interface。

**停：**不是這樣 → 停止，不要自己改路由。

**注意：**只代表本機設定和路由選擇正確；**不代表** peer 或 ZeroMQ 已通，更不代表 LTE attach 或使用者資料成功。

<details>
<summary>三個檢查各看什麼</summary>

- `addr show`：位址放在哪個介面。
- `route show`：有沒有 direct route（直接連接路由）。
- `route get`：主機往 peer（另一端）送時會選哪個介面。

</details>

**常打錯的地方（課堂紀錄）：**

| 你看到 | 原因 | 怎麼做 |
| --- | --- | --- |
| `"dev" not a valid ifname` | `dev` 後面填了 IP，或變數是空的 | `dev` 後面只接**介面名稱**（例如 `enp0s3`）；先 `echo "$NODE1_SAMPLE_IFACE"` 確認 |
| `either "local" is duplicate, or "<介面名>" is a garbage` | 少打 `dev` | 一行只放一個位址，一定要有 `dev` |
| `only /32 (or none) is supported` | `ip route get` 後面加了 `/24` | 只寫位址；這個 Warning 不影響結果 |
| `Address already assigned` | 本機已加過，或號碼填錯和別組重複 | 先 `ip -4 -o addr show` 確認；不要換號碼重試，通知 Instructor |

- 介面上**原本的位址**（例如學校 DHCP 配的）是 pre-state 的一部分：**不要刪、不要改**。
  `10.0.<排>.<電腦編號>` 是另外加上去的 temporary address。

**暫時位址會消失：**`ip address add` 加的位址只存在記憶體。VM 重開機或 NetworkManager 重新連線後就不見了 →
重做 1.1 的檢查，再照 1.2 加回去，並寫進報告。

---

## Stage 2 建置 srsRAN 並改設定檔

### 2.1 下載固定版本的 source

**在哪台：Node 1 和 Node 2**（在 Instructor 指定的工作目錄）　**目標：**兩端用同一份版本基準

```bash
git clone https://github.com/srsran/srsRAN_4G.git
cd srsRAN_4G
git checkout --detach 6bcbd9e5bf8686aa7085202cd847c5ddd64a9c16
git rev-parse HEAD
git status --short
```

**通過：**`git rev-parse HEAD` 等於上面的 SHA；`git status --short` 用來看工作目錄有沒有變更。

**停：**checkout 不乾淨，或來源（provenance）不清楚 → 停止。

**注意：**固定 source 版本**不能單獨證明** `/usr/local/bin/` 的執行檔是用這個版本建的；本手冊也不宣稱尚未實測的
pristine Ubuntu 24.04 clean-build PASS（prepared host 的 EV-1 結果見審閱附註）。

### 2.2 建置並確認有 ZeroMQ

**在哪台：Node 1 和 Node 2**（Stage 0 的 0.5 通過後）

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

**通過：**`grep` 印出 `ENABLE_ZEROMQ:BOOL=ON`。

**停：**沒有這一行 → 不要進 Runtime。

**停：**任何一步失敗 → 不要繼續安裝或啟動，交給 Instructor。`make test` 有失敗 → 不要 `make install`。

**提示：**記憶體不足 → 改用 `make -j2`。建置問題查 [安裝與建置問題](#安裝與建置問題)。

**注意：**build flag、build 或 test 成功，**不代表**教學 config 已載入、UE 已 attach 或 ICMP 已通。

**記錄：**保留建置、測試與安裝的實際結果。

### 2.3 檢查執行檔裝好了

**在哪台：剛安裝的那台**（只讀）

```bash
ls -l /usr/local/bin/srsepc /usr/local/bin/srsenb /usr/local/bin/srsue
ldd /usr/local/bin/srsenb | grep 'not found'
ldd /usr/local/bin/srsue  | grep 'not found'
```

**通過：**`ls` 列出三個執行檔（Node 1 用 `srsepc`、`srsenb`；Node 2 用 `srsue`）。

**通過：**兩行 `ldd … | grep 'not found'` **沒有任何輸出**（代表 shared library 都找得到）。

**停：**有輸出 → 先確認有沒有漏跑 `sudo ldconfig`；還是有 → 停止。

**注意：**只代表 binary 已安裝、library 找得到；**不能**證明 binary 由 pinned SHA 建置。

**不要**執行 `srsran_install_configs.sh` 或其他會自動安裝 sample subscriber database 的 generic config installer。
`/etc/srsran/` 下的無 Secret core configs 由 Instructor／TA 依 Student Teaching Config README 受控建立，
並另外完成 Subscriber Provisioning Gate。你只核對非敏感設定與 Gate 確認。

### 2.4 把設定檔改成本組位址（每組都要做）

**目標：**設定檔裡的 `rx_port` 預設是 `10.0.0.2`／`10.0.0.1`，和教室位址不同，所以**每組都要改**。

- 這一步已由 Instructor 核准，是標準步驟；但只能照下面的範圍做，超出範圍要另外問。
- 改在 `/etc/srsran/` 的設定會寫進磁碟，**重開機後還在**（和 Stage 1 的暫時位址不同：位址要重加，設定檔不用重改）。

**只能改這些：**

- 每個檔案只改 `device_args` 這一行裡 `rx_port` 的 **IP**。`tx_port`、port 號碼、`id`、`base_srate`、其他參數都不動。
- 改之前先備份。備份檔留在原目錄，不複製出 VM，不放進報告。
- **停：**`ue.conf` 含 subscriber credential：**不要用 vim、`cat`、`less` 開 `ue.conf`，也不要對它 `diff`**。
  只能用下面的 `sed` 改、用 `grep` 檢查那一行。

先確認變數還在（沒有就回 [先設定你的位址](#先設定你的位址兩台都要) 重設）：

```bash
echo "$NODE1_SAMPLE_IP $NODE2_SAMPLE_IP"
```

**Node 1：改 `enb.conf`**

```bash
sudo cp -p /etc/srsran/enb.conf /etc/srsran/enb.conf.bak-lab01
sudo vim /etc/srsran/enb.conf
```

在 vim 裡打 `/rx_port` 找到那一行，把 `rx_port=tcp://` 後面的 IP 改成 **Node 2** 的位址，`:2001` 保留
（不會 vim 看 [附錄 A](#附錄-a-vim-最小操作)）。不想用 vim，也可以用這行只改那一段：

```bash
sudo sed -i "s#rx_port=tcp://[0-9.]*:2001#rx_port=tcp://${NODE2_SAMPLE_IP}:2001#" /etc/srsran/enb.conf
```

檢查只有那一行變了：

```bash
grep -n '^device_args' /etc/srsran/enb.conf
diff /etc/srsran/enb.conf.bak-lab01 /etc/srsran/enb.conf
```

**通過：**`grep` 顯示 `rx_port=tcp://<Node 2 位址>:2001`；`diff` 只列出 `device_args` 這一行的舊值與新值。

**Node 2：改 `ue.conf`（不要打開檔案）**

```bash
sudo cp -p /etc/srsran/ue.conf /etc/srsran/ue.conf.bak-lab01
sudo sed -i "s#rx_port=tcp://[0-9.]*:2000#rx_port=tcp://${NODE1_SAMPLE_IP}:2000#" /etc/srsran/ue.conf
sudo grep -n '^device_args' /etc/srsran/ue.conf
```

**通過：**`grep` 顯示 `rx_port=tcp://<Node 1 位址>:2000`。

**停：**`grep` 的 IP 沒變 → `sed` 沒找到原本的寫法。不要自己試別的改法，通知 Instructor。

**還原：**Instructor 要求時，在對應節點執行 `sudo cp -p /etc/srsran/enb.conf.bak-lab01 /etc/srsran/enb.conf`
（Node 2 換成 `ue.conf`），再用同一個 `grep` 確認。

**注意：**設定檔正確只支持 static pairing；**不代表** ZeroMQ 已連通或 attach 成功。

### 2.5 啟動前對一次配對表

**在哪台：Node 1 和 Node 2**　**目標：**兩個方向都要互補，不能只對一端

| 項目 | eNB | UE |
| --- | --- | --- |
| TX | `tcp://*:2000` | `tcp://*:2001` |
| RX | `tcp://<NODE2_SAMPLE_IP>:2001` | `tcp://<NODE1_SAMPLE_IP>:2000` |
| ID | `enb` | `ue` |
| base rate | `23.04e6` | `23.04e6` |

另外確認 MCC／MNC、TAC、APN、EARFCN 與 radio parameters 符合 profile。不可以讀取或比對 subscriber secret values。

**停：**有不符 → 停止，不要自己替換參數。

**注意：**這張表只支持 static pairing；樣本有沒有真的在傳、LTE 有沒有成功，要看 Stage 3 的輸出。

---

## Stage 3 啟動 EPC → eNB → UE，測 ping

**順序很重要：**EPC → eNB → UE。前一個沒過，下一個不要開。

### 3.1 啟動 EPC

**在哪台：Node 1 的 EPC 終端機**

```bash
cd /etc/srsran
sudo /usr/local/bin/srsepc /etc/srsran/epc.conf
```

**通過：**config 載入成功，MME／HSS／S-GW／P-GW 初始化，process 持續在跑。

**停：**出現 fatal parse、permission、log、bind 或 dependency error → 停止，不要自己改 config。

**注意：**process 還在跑，不證明全部初始化完成，也不證明 UE attach 或資料連通。

**提示：**HSS（Home Subscriber Server）保存訂閱者資料；你不讀它的資料庫。

### 3.2 啟動 eNB

**在哪台：Node 1 的 eNB 終端機**（EPC 通過後）

```bash
cd /etc/srsran
sudo /usr/local/bin/srsenb /etc/srsran/enb.conf
```

**通過：**用 `device=zmq`、載入預期 endpoints、顯示 started，並和 EPC 完成 S1 interaction。

**記錄：**逐項記錄實際輸出，不是只記「process 在」。

**停：**沒過 → 不要啟動 UE。

**注意：**只代表 eNB 啟動與 EPC／eNB 互動；**不代表** UE attach 或 User Plane forwarding。

### 3.3 啟動 UE，記錄入網

**在哪台：Node 2 的 UE 終端機**（EPC 和 eNB 都還在跑）

```bash
cd /etc/srsran
sudo /usr/local/bin/srsue /etc/srsran/ue.conf
```

**記錄：**照終端機**實際**輸出逐項填。不可以預填 PASS，也不可以用最後一行補填沒看到的前面階段：

| Milestone | 實際輸出摘要 | 結果 |
| --- | --- | --- |
| UE config／process initialization |  |  |
| UE ZeroMQ endpoints |  |  |
| Cell Search |  |  |
| Random Access |  |  |
| RRC Connected |  |  |
| Network attach |  |  |
| UE IP |  |  |

**在哪台：Node 2 的 observation 終端機**：查 UE 位址

```bash
ip -4 -o addr show dev tun_srsue
ip route show
```

**通過：**只有在**本次輸出**真的看到時，才把位址記成實際結果。`172.16.0.2` 只是 profile 預期值。

**停：**位址不一樣（課堂曾看到 `172.16.0.6`）→ 先通知 Instructor，**不要自己改 UE 位址**。Instructor 確認後，
3.4 的 DL ping 和選做的 iperf3 都用**本次實際看到的位址**，不要從手冊抄 `.2`。
**注意：**attach 輸出和 UE address 只支持入網／位址觀察；**不代表** GTP-U forwarding、ICMP 或 Internet。

### 3.4 兩個方向各 ping 一次

**目標：**分別測 UL 和 DL。**只在** attach 完成、`tun_srsue`／`srs_spgw_sgi` 位址都確認後才做。

**UL（上行）**　在哪台：Node 2 → EPC SGi

```bash
ping -I tun_srsue -c 4 172.16.0.1
```

**DL（下行）**　在哪台：Node 1 → UE（`172.16.0.2` 換成 3.3 本次實際看到的 UE address）

```bash
ping -I srs_spgw_sgi -c 4 172.16.0.2
```

**提示：**EPC 出現 `UE Context Release Complete`：通常是 UE 閒置回到 idle，不代表 attach 失敗。先做 UL ping 把連線喚醒，
再做 DL ping；兩次仍分開記錄。

**記錄：**每個方向記 sent、received、packet loss。沒做的方向標 `NOT VALIDATED`；失敗就保留原文輸出，不改寫成成功，
也不要自己猜原因。

**通過：**收到 reply → 支持**該方向、這一次**有限封包的 ICMP 連通。

**注意：**沒收到 reply → 支持這次嘗試失敗，但不能單靠它定位是哪個元件出問題。

**注意：**ICMP **不代表** TCP throughput、NAT／Internet、low latency、URLLC 或長時間穩定；也不能用一個方向推定另一個方向。
歷史 Phase 4C 與 EV-2 的結果要照各自範圍看，不能取代你的輸出。

<details>
<summary>指令參數是什麼意思</summary>

`-I` 指定介面，`-c 4` 限定這次送 4 個封包。ICMP echo request／reply 用來觀察這次指定端點間的連通性。

</details>

---

## Stage 4 觀察協定

**目標：**用 Wireshark／`tshark` 認出訊息屬於哪一層。

**先問 Instructor 要用哪個 interface 和 capture policy。**本手冊沒有固定擷取介面和命令；不要套用歷史截圖或 Lab02 的流程。

**資料界線：**不可以收集、顯示或提交 subscriber credential、完整 identifier、authentication material，
或未去識別的敏感 PCAP。

**注意：**Core profile 預設不會讓 srsRAN 自動產生 PCAP；設定關閉不代表協定不存在。

**要找的東西：**

| 類別 | 去哪看 | 認出什麼 |
| --- | --- | --- |
| SCTP／S1AP | Node 1 loopback／S1 path | S1 Setup、UE context、release |
| NAS-EPS | 包在 S1AP 裡 | Attach、identity、authentication、Security Mode |
| GTP-U | eNB ↔ S-GW user path | Tunnel endpoint 與裡面的 UE IP packet |
| SGi／ICMP | `srs_spgw_sgi`／`tun_srsue` | Core DL／UL echo request／reply |
| Detach／release | 受控停止那段時間 | UE／eNB／EPC 的終止與 context release |

**記錄：**每一筆只記本次 observation：timestamp、capture point、display filter、message type、必要且已去識別的欄位，
以及它屬於 Control Plane 還是 User Plane。

**注意：**看到一類訊息，**不代表**表上所有類別或整個流程都驗證了。

**停：**找不到訊息 → 保留「未確認」，請 Instructor 核對觀察方式；不要直接判定協定不存在。

**注意：**Detach／release 要在受控停止時記錄實際看到的訊息；不保證每次停止都抓得到一樣的內容。

**注意：**外部歷史報告不是必要輸入；不可以用歷史截圖代替本次結果。

### Security Lens：入網時的安全觀察

本 profile 使用 `EEA0` 與 `EIA1`，是受控的教學／互通基準。**注意：**`EEA0` **不提供** user-plane confidentiality；
這不是正式網路的安全建議。

觀察 attach 時分開寫三件事：

1. **Identity（身分）：**網路需要辨識 subscriber／device。報告不可以揭露實際 identifier。
2. **Authentication（認證）：**UE 與核心網依 Instructor 預先備妥的狀態，驗證彼此的授權關係。
3. **Security Mode（安全模式）：**MME／UE 協商並啟用本 profile 允許的 NAS security algorithms。

**注意：**不可以把「attach 成功」寫成安全性足以用在 production；也不可以讀 credential 來完成報告。

---

## 選做（沒有 Instructor 授權就跳過）

### 選做 A：TCP／iperf 測量

分類：`OPTIONAL_MEASUREMENT_EXTENSION`。不在 Core 完成條件內。Instructor 明確啟用才做；沒做記 `NOT VALIDATED`。

Instructor 會先指定 server 位置、routing direction、測量時間與接受標準。通用寫法：

```bash
IPERF_SERVER_IP='<Instructor-provided address>'
iperf3 -c "$IPERF_SERVER_IP"
```

**課堂用過的寫法（server 在 Node 1 的 `srs_spgw_sgi`）：**口訣 **`-B` 填自己，`-c` 填對方。**先查自己的位址：

```bash
ip -4 -o addr show dev srs_spgw_sgi   # Node 1
ip -4 -o addr show dev tun_srsue      # Node 2
```

```bash
# Node 1：server，-B 綁定 Node 1 自己的 SGi 位址
iperf3 -s -B 172.16.0.1 -p 5202
```

```bash
# Node 2：client，-c 指向 Node 1，-B 綁定本次觀察到的 UE address；預設測 UL
UE_IP='<Stage 3 的 3.3 本次觀察到的 tun_srsue address>'
iperf3 -c 172.16.0.1 -B "$UE_IP" -p 5202 -t 10
```

- 測 DL：Instructor 同意後，在 client 加 `-R`。
- 兩端的 `-p` 必須一樣；`-p 5202` 是為了避開被占用的 5201。
- 做完回 server 終端機按 Ctrl-C，不留下常駐 server。

**記錄：**UL、DL 分開記；只做一個方向，另一個標 `NOT VALIDATED`。

**注意：**這個 extension 沒有既定 TCP／iperf PASS；指令存在不代表測過，也不能由 ICMP 或 attach 推導 throughput。

### 選做 B：NAT／Internet（Instructor 延伸）

分類：`OPTIONAL_INSTRUCTOR_EXTENSION`。Core Lab01 **不要求**改 IP forwarding 或 firewall。

**停：**只有 Instructor 先確認 `$INTERNET_IFACE`、現有 forwarding／firewall state、變更所有權與 rollback plan 後才可另行授權。
沒授權就跳過；不要把 UE address 或 ICMP 通過解讀成 NAT／Internet 成功。

獲准改 forwarding 前，先存下原本的值：

```bash
ORIGINAL_IP_FORWARD="$(sysctl -n net.ipv4.ip_forward)"
```

需要新增 NAT rule 時，Instructor 要先確認完全相同的 rule 原本不存在，記錄本次新增的 exact rule；清理時只刪除
本次建立、且仍可精確識別的那條，不可以用廣泛的 add/delete recipe 影響既有 firewall state。最後把
`net.ipv4.ip_forward` 回復為 `$ORIGINAL_IP_FORWARD`。沒做時，NAT／Internet 一律為 `NOT VALIDATED`。

---

## 收尾：停止並清理

### 停止 1：反向順序關掉程式

**目標：**先停 Runtime，再清網路（避免還在跑的程式突然沒有網路）。由持有各終端機的人依序按 **Ctrl-C**：

1. Node 2：`srsue`
2. 確認 UE 停了 → Node 1：`srsenb`
3. 確認 eNB 停了 → Node 1：`srsepc`

**記錄：**每一步保留畫面上的 shutdown 輸出。不能只用最後狀態補寫整個停止過程。

**停：**process 停不下來 → **不要**用 `kill`／`pkill`，通知 Instructor。

在對應主機的 observation 終端機確認（Node 2 查 `srsue`；Node 1 查 `srsenb`、`srsepc`）：

```bash
pgrep -a -x srsue
pgrep -a -x srsenb
pgrep -a -x srsepc
```

**通過：**沒有輸出 = 這次檢查沒看到該名稱的 process。

**注意：**不代表主機上所有 process 都停了。

### 停止 2：只清掉本 Lab 加的位址

**目標：**對照 Stage 1 的 pre-state 紀錄，確認下面的位址**真的是本 Lab 加的**。

**停：**分不清是誰加的 → 停止，不要刪未知設定。

Runtime 全部停了之後：

**在哪台：Node 1**

```bash
sudo ip address del "${NODE1_SAMPLE_IP}/24" dev "$NODE1_SAMPLE_IFACE"
ip route show "$SAMPLE_NET"
```

**在哪台：Node 2**

```bash
sudo ip address del "${NODE2_SAMPLE_IP}/24" dev "$NODE2_SAMPLE_IFACE"
ip route show "$SAMPLE_NET"
```

**只有**在 pre-state 證明網卡原本是 DOWN、而且本 Lab 曾改成 UP 時，才在**那一台**執行對應的一行：

```bash
sudo ip link set dev "$NODE1_SAMPLE_IFACE" down   # 只在 Node 1 符合上述條件
sudo ip link set dev "$NODE2_SAMPLE_IFACE" down   # 只在 Node 2 符合上述條件
```

**通過：**本 Lab 的 temporary addresses／routes 都不見了；Management Plane 和原本的 network state 沒被改動。

**停：**還有不明路由或狀態差異 → 通知 Instructor，不要擴大刪除範圍。

**注意：**清理檢查只支持本次結束時的狀態，不證明 reconnect／reboot 後的持久性。

---

## 卡住了

### 先做這四件事

1. **不要清畫面、不要一直重開。**保留目前的終端機輸出。
2. **記錄：**記下**最後一個成功的 milestone** 和**第一個原文錯誤**。
3. 檢查有沒有卡在 Gate：source SHA、ZeroMQ build flag、sample address／route、啟動順序、Subscriber Provisioning Gate。
4. 接下來需要改 config、network、credential、source，或強制結束 process → 立刻停，通知 Instructor。

先找出最後成功的是哪一層，再描述下一層出了什麼訊息；只寫症狀，不要先幫它取原因。

### 快速查表

| 你看到 | 原因 | 怎麼做 |
| --- | --- | --- |
| Windows：`VBoxMange` 不是內部或外部命令 | 拼錯，且 VirtualBox 不在 PATH | `cd` 到安裝目錄，打 `VBoxManage list vms`（0.6） |
| `"dev" not a valid ifname` | `dev` 後面填了 IP，或變數是空的 | `dev` 後面只填介面名稱（1.2） |
| `either "local" is duplicate, or "<介面名>" is a garbage` | 少打 `dev` | 補上 `dev`（1.2） |
| `only /32 (or none) is supported` | `ip route get` 加了 `/24` | 只寫位址；Warning 不影響結果 |
| iperf3：`Cannot assign requested address`、`Invalid argument` | `-B` 填了對方的 IP，本機沒有這個位址 | `-B` 填自己，`-c` 填對方（選做 A） |
| iperf3：`Address already in use` | port 5201 被占用（不是 IP 衝突） | 兩端都改成同一個 `-p`，例如 `-p 5202` |
| UE 出現 `Error receiving samples` | 症狀，原因未知 | 看下方 [Error receiving samples](#error-receiving-samples) |
| 建置或安裝失敗 | 依訊息而定 | 看下方 [安裝與建置問題](#安裝與建置問題) |

**`Address already in use` 怎麼查（只讀）：**

```bash
ss -ltnp | grep 5201
pgrep -a iperf3
systemctl status iperf3
```

- 前一個 iperf3 server 還在跑 → 回那個終端機按 Ctrl-C。不要用 `kill`／`pkill` 結束不是你啟動的 process。
- 安裝時選了開機自動啟動 → 停用或修改系統服務是 host 層級變更，先問 Instructor。
  最不會動到系統的做法：兩端都改用 `-p 5202`。

### Error receiving samples

**這是症狀，不是原因。**UE 顯示原文 `Error receiving samples`，代表出現樣本接收錯誤；這行本身沒有指出 root cause。

- **注意：**不要因此撤銷你**之前已經實際看到**的 attach milestone；也不要因為已 attach 就認定之後的 sample processing 一定正常。

**先查這個：**重跑 Stage 1 的唯讀檢查，看 Sample Plane address 和 route 是否還符合；也核對 source SHA、
ZeroMQ build flag、啟動順序與 Subscriber Provisioning Gate。（先查 Sample Plane，是因為它承載 ZeroMQ RF samples；
這是核對前提，不是已驗證的修復流程。）

| 結果 | 只能說 | 不能說 |
| --- | --- | --- |
| address 不見或 route 不符 | 當下 Sample Plane 前提有問題 | 是哪個裝置或程式造成 |
| address／route 都對 | 這些本機條件符合 | peer、ZeroMQ、LTE 或 User Plane 正常 |

**注意：**單憑這一行，不能判定 ZeroMQ、PHY、eNB、UE、network 或 srsRAN 是 root cause，也不能判定 USB Ethernet adapter
硬體故障。同時發生不等於因果。

**何時停：**記下發生時間、前一個成功 milestone、process 是否還在跑、之後有沒有新輸出 → 停止不安全的重試，通知 Instructor。
接下來需要改 config、network、credential、source 或強制結束 process，學生不繼續處理。

**注意：**目前紀錄中，sample processing 有沒有恢復、root cause 是什麼，都還是 `UNKNOWN`。即使 Sample Plane 恢復，
也要有後續 Runtime evidence 才能判斷 LTE／User Plane，不能自己補寫成已修好。

<details>
<summary>歷史限制：ICMP 失敗與 USB 事件（不用重現）</summary>

- EV-2 的 R5 UE → EPC ICMP 是一次有界的失敗觀察，狀態仍是 `FAIL / UNLOCALIZED`；attach 與 address 有紀錄，
  也沒有讓 R5 變成功。它沒有定位 UE TUN、bearer／GTP-U、SGi、return path、USB 或 host networking 的原因。
- Linux2 曾出現 USB／kernel device layer 的介面消失事件，和 R5 的關係只屬 `POTENTIAL_CORRELATION_ONLY`（可能相關）；
  exact root cause 仍是 `UNKNOWN`。後續 120-second UE-active 觀察的 `NOT_REPRODUCED`（該次未重現），
  不表示已修復、adapter 已證明穩定，也不排除或解釋 R5。
- 這些是歷史限制，**不是**要你重現故障、做 USB A/B isolation 或採用新的修復步驟。深層定位交給 Instructor；
  R5A 尚未開始，必須另行授權。

</details>

### 安裝與建置問題

**停：**需要改 source、改系統設定，或安裝 Stage 0 以外的套件 → 停止，通知 Instructor。

| 你看到 | 可能缺少 | 怎麼做 |
| --- | --- | --- |
| `cmake ../` 後 `grep ENABLE_ZEROMQ` 沒有輸出 | `libzmq3-dev` | 回 0.5 檢查 libzmq；補裝後**刪除 `build/` 目錄重新 cmake**，並記錄 |
| CMake 顯示 `Could NOT find SCTP` 或類似訊息 | `libsctp-dev` | 同上 |
| CMake 找不到 FFTW、MbedTLS、Boost、libconfig | 對應的 `-dev` 套件 | 同上 |
| `make` 中途 `Killed` 或 `c++: fatal error: Killed signal` | 記憶體不足 | 改 `make -j2` 重跑並記錄 |
| `make` 出現 compiler error（不是缺套件） | 不在學生處置範圍 | 保留第一個原文錯誤，通知 Instructor |
| `make test` 有測試失敗 | 不在學生處置範圍 | 記下失敗的 test 名稱，不 `make install`，通知 Instructor |
| `apt` 被鎖（`Could not get lock /var/lib/dpkg/lock-frontend`） | 有其他 apt 在跑 | 等幾分鐘再試；還是鎖住 → 通知 Instructor，不要刪 lock 檔 |

**注意：**補裝套件後重跑 CMake，只能刪你自己在 2.2 建的 `srsRAN_4G/build/`；不要刪 source tree 或其他目錄。

### 速查卡

- `dev` 後面接**介面名稱**，不是 IP；`ip address add` 一行一個位址，一定要有 `dev`。
- `ip route get` 後面不要加 `/24`。
- Sample Plane 位址是 `10.0.<排>.<電腦編號>/24`，同組兩台必須同一排。
- 重開機或網路重連 → 位址會消失，照 Stage 1 重查、重加；2.4 改過的設定檔不用重改。
- UE address 以本次輸出為準；和手冊不同 → 先通知 Instructor。
- iperf3：`-B` 填自己，`-c` 填對方；`Address already in use` → 兩端換同一個 `-p`。
- 每個方向（UL／DL、ICMP／TCP）分開記；沒做的寫 `NOT VALIDATED`。

---

## 交報告前的 Checklist

### **記錄：**報告要附的東西

照「做了什麼 → 看到什麼 → 能說明什麼」的順序整理。每一項都是**本次**結果；沒做寫 `NOT VALIDATED`，
失敗就保留失敗，不用歷史結果補。

- [ ] Stage 0 主機資源表（0.1）、安裝檢查輸出（0.5）、執行檔檢查結果（2.3）
- [ ] 偏離 Stage 0 的地方（例如 `make -j2`、Wireshark non-superuser capture、修改 VM MAC）與 Instructor 核准情形
- [ ] Host／sample-interface fresh inventory 與 pre-state
- [ ] source SHA 與 ZeroMQ build flag 的檢查結果
- [ ] 實際使用的非敏感 config profile ID 與 ZeroMQ pairing
- [ ] EPC、eNB、UE 的 startup milestones 與 UE IP
- [ ] Core DL／UL ICMP 的實際 packet loss
- [ ] Stage 4 去識別化的 protocol observation
- [ ] 反向停止與 temporary-state cleanup 的結果
- [ ] 沒做的選做項目標示 `NOT VALIDATED`

**不可以交：**subscriber credential、identifier、private key、subscriber database、未去識別的 PCAP，
或含敏感資訊的終端機截圖。

### 最後逐項打勾

- [ ] Node roles 與 plane boundaries 已說明。
- [ ] Stage 0 的 0.5 已通過，或 Instructor 已確認使用 prepared host。
- [ ] 兩台 VM 的 sample interface MAC 不重複（VirtualBox 環境）。
- [ ] Source HEAD 等於 pinned SHA。
- [ ] `ENABLE_ZEROMQ:BOOL=ON` 已確認。
- [ ] Subscriber Provisioning Gate 由 Instructor 確認完成。
- [ ] eNB／UE ZeroMQ endpoints 互補。
- [ ] Cell Search → Random Access → RRC → EPS attach 有本次輸出。
- [ ] UE IP 由本次輸出確認。
- [ ] DL／UL ICMP 都有本次結果，或明確標示 `NOT VALIDATED`。
- [ ] Protocol observation 已去識別化。
- [ ] UE → eNB → EPC 受控停止。
- [ ] temporary sample-plane state 已清理，並依 pre-state 回復 link state。
- [ ] NAT／Internet 與 TCP／iperf 沒有被誤寫成 Core PASS。
- [ ] 沒有提交任何 subscriber／credential material。

---

## 附錄 A vim 最小操作

本 Lab 只需要用 vim 改 `enb.conf` 的**一行**（2.4）。

**不要用 vim 開 `ue.conf` 或 `user_db.csv`**，兩個都含 subscriber credential。

**只要記兩個模式：**

- **Normal 模式**：剛開檔時的模式。打的字是指令，不會寫進檔案。
- **Insert 模式**：按 `i` 進入，左下角出現 `-- INSERT --`，這時才是在打字。按 `Esc` 回 Normal。

**提示：**不知道自己在哪個模式 → 先按 `Esc`。

| 想做的事 | 按鍵（Normal 模式） |
| --- | --- |
| 顯示行號 | `:set number` 再按 Enter |
| 搜尋文字 | `/rx_port` 再按 Enter；按 `n` 跳到下一個 |
| 移動游標 | 方向鍵；`0` 到行首、`$` 到行尾 |
| 刪除游標所在的字元 | `x` |
| 開始輸入 | `i`（游標前）或 `a`（游標後） |
| 復原上一步 | `u` |
| 存檔並離開 | `:wq` 再按 Enter |
| 不存檔離開 | `:q!` 再按 Enter |

**改 `rx_port` IP 的六步：**

1. `sudo vim /etc/srsran/enb.conf` 開檔。
2. 打 `/rx_port` 再按 Enter，游標跳到 `rx_port` 開頭。
3. 用方向鍵移到舊 IP 的第一個數字，用 `x` 一個一個刪掉舊 IP（`:2001` 不要刪）。
4. 按 `i`，打新的 IP，按 `Esc`。
5. 確認這一行其他地方沒變，打 `:wq` 存檔離開。改壞了 → 打 `:q!` 放棄，重新開檔。
6. 回到 2.4 跑 `grep` 和 `diff` 檢查。

**常見狀況：**

| 你看到 | 意思 | 怎麼做 |
| --- | --- | --- |
| `E325: ATTENTION` 或 `Found a swap file` | 檔案可能正被另一個 vim 開著，或上次 vim 沒正常結束 | 按 `q` 離開，確認沒有別的終端機在編輯它，再通知 Instructor；不要自己刪 `.swp` 檔 |
| `E45: 'readonly' option is set` 或 `Permission denied` | 開檔時漏了 `sudo` | 打 `:q!` 離開，用 `sudo vim …` 重開 |
| 按了 `Ctrl-S` 畫面不動 | 終端機暫停輸出 | 按 `Ctrl-Q` 恢復，不用關終端機 |

---

## 審閱附註（給 Instructor／Reviewer，學生可跳過）

本節供 Instructor／Reviewer 核對來源，不是學生操作步驟，也不提供新的執行授權。各時間與 profile 的結果分開保存：

- **歷史 Phase 4C：**canonical checkpoint 保存初始化、ZeroMQ、cell search、Random Access、RRC Connected、Network Attach、UE／EPC addressing、有界雙向 ICMP 與受控停止。Recovered TER 的 Phase 4C milestones 是 `REPORTED_ONLY`（回報結果）；原始 terminal／ICMP output 未在該 record 保存，不能改寫成目前獨立重驗。這些觀察不支持 NAT／Internet、TCP／iperf、performance、reliability、stability、low latency 或 URLLC。
- **2026-08-24 bounded recovery：**fresh evidence 到達 UE attach，並觀察到 UE IP `172.16.0.2`；該次沒有 fresh-validate user-plane ICMP、NAT／Internet、TCP／iperf、throughput、latency 或 URLLC。TER E06A 的完整 EPC initialization 為 Human-reported，E06B／E07 保存當時 review 的 eNB／UE terminal evidence，screenshots 沒有複製進 Repo。
- **2026-08-24 post-attach 與停止：**曾觀察到一次 literal `Error receiving samples`；sample processing 是否恢復與 root cause 均為 `UNKNOWN`。TER E09 支持 final process absence；UE → eNB → EPC／Ctrl-C 是 `REPORTED_ONLY` 的停止意圖，exact sequence／method 未逐階段獨立驗證，不能憑最後狀態補出完整歷程。
- **2026-08-30 EV-1：**prepared Ubuntu 24.04 的 pinned clean-source build、ZeroMQ-enabled build、isolated install 與 upstream tests 已有有界 PASS 紀錄；TER E01 為 `REPORTED_ONLY`。這不等於 pristine Ubuntu dependency-install reproducibility，也不驗證教學 config parser／load 或 Runtime。
- **2026-08-30 EV-2：**R0、R1、R2、R3、R4、R6 已有各自 evidence；R1／R2 initialization 與 R3 attach milestones 保留 `REPORTED_ONLY`，TUN addresses 與 final process absence 有另行 bounded checks。R5 UE → EPC ICMP 為 `FAIL / UNLOCALIZED`，不建立該次 reverse ICMP 結果，也不支持 EV-2 或 Full Lab01 PASS。USB 事件、恢復與 `NOT_REPRODUCED` 的限制保留在「卡住了」的歷史限制，不能轉成 root-cause 或永久修復 claim。
- **Stage 4 封包觀察：**原手冊的歷史 Stage 4 結果仍是 historical evidence，不能替代學生本次 observation。Known limitations 將 recovered Phase 4C 的 Wireshark／PCAP protocol observation 列為 `NOT TESTED`；2026-08-24 recovery 也沒有驗證本 Stage。舊 Lab 文件保存的目標或待補 evidence 不建立該 scope 的完成 claim，也不能由此宣稱整個專案從未觀察過封包。
- **歷史 residue：**MBMS／eMBMS residue 不等於 Lab02／eMBMS validation，不納入本 Lab 核心成功標準。
- **Student Teaching Config：**`lab01-student-zmq-lte` 已完成 static consistency review，但尚未 isolated Runtime validate；teaching-profile design approval 不等於 Runtime validation。EV-2 的 run-specific artifacts／materialized inputs 不被改寫成這份 profile 的全面驗證。
- 本手冊沒有 Full Lab01 PASS 或 TCP／iperf PASS claim；舊教材要求執行的項目不自動成為 2026 已驗證結果。
- **Stage 0 套件清單：**依 srsRAN_4G 官方 Installation Guide 的 build dependency 與 ZeroMQ 需求整理，並加入本手冊各 Stage 實際使用的工具；未在 pristine Ubuntu 24.04 上重新執行，狀態 `NOT VALIDATED`。套件版本未固定；若需要可重現的版本基準，需另行以 Work Unit 記錄實測版本。
- **2026-11-17 課堂紀錄（`REPORTED_ONLY`）：**來源為 Repo 外的課堂現場問題紀錄，原始 terminal output 未保存於 Repo。回報內容：UE address 為 `172.16.0.6`（profile 預期 `.2`）；ICMP DL（Node 1 → UE）4/4 收到、0% loss、平均 RTT 70.4 ms；iperf3 TCP UL（UE → `172.16.0.1:5202`）10.39 秒傳送 8.75 MBytes，平均 7.07 Mbits/sec（每秒最低 4.19、最高 10.5）。ICMP UL 未出現在該紀錄；iperf3 TCP DL（`-R`）是否已測未確認；IP forwarding／NAT 依 Instructor 當次決定未執行，為 `NOT VALIDATED`。此紀錄不建立 Full Lab01、TCP／iperf 或 throughput PASS，也不改變 EV-2 R5 的 `FAIL / UNLOCALIZED`。
- **待審閱的開放問題：**課堂紀錄中 Sample Plane 位址是加在帶有學校 DHCP 位址的同一張 Bridged 網卡上。「三分鐘背景」要求 Management Plane 不得與 Sample Plane 混用；該網卡是否屬於 Management Plane、此配置是否可接受，需 Instructor／Reviewer 決定。UE 取得 `.6` 而非 `.2` 的原因亦為 `UNKNOWN`。
- **教室位址規劃：**依 Instructor 決定，Sample Plane 由固定 `10.0.0.1/24`／`10.0.0.2/24` 改為 `10.0.<排>.<電腦編號>/24`（7 排、每排 8～12 台，每組兩台 VM 在兩台電腦上）。一排一個 `/24`，同組須同排。未經 Runtime 驗證，`NOT VALIDATED`。`student-config/` 範本的 `rx_port` 仍為 `10.0.0.x`，由 Stage 2 的 2.4 逐組修改。
- **2.4 設定修改：**v0.1 的學生流程不修改 `/etc/srsran/`。v0.2 依 Instructor 核准，讓學生只修改 `enb.conf`／`ue.conf` 中 `rx_port` 的 IP；`ue.conf` 只以 `sed`＋`grep` 處理，避免學生看到 credential。此流程未經 Runtime 驗證，`NOT VALIDATED`。
- **v0.2 相對 v0.1 的行為差異：**v0.1 §6.3 原寫「不自行改位址或 ping 的目標」；v0.2 改為通知 Instructor 並經確認後，DL ping／iperf3 使用本次實際 UE address。選做 A 新增 server 位於 Node 1 SGi 的 iperf3 範例，仍屬 optional extension，需 Instructor 啟用。
- **v0.2 排版：**改為「一步一卡」與 `<details>` 收合，降低閱讀負擔；章節編號由 v0.1 的 §4～§12 改為 Stage 0～4、收尾、卡住了與 Checklist；指令內容不變，只有 iperf3 範例中 `UE_IP` placeholder 的章節名稱改為本版編號。

審閱來源：

- [目前進度與 EV-2 限制](../../PROGRESS.md)
- [Canonical architecture](../../docs/architecture-overview.md)
- [Known limitations](../../docs/known-limitations.md)
- [歷史 recovery workstream TER](../../docs/evidence/task-evidence/lab01-recovery-workstream.yaml)
- [2026-08-24 bounded recovery TER](../../docs/evidence/task-evidence/2026-08-24-lab01-current-truth-runtime-recovery.yaml)
- [2026-08-30 EV-1／EV-2 TER](../../docs/evidence/task-evidence/2026-08-30-lab01-ev2-part8-runtime-usb-incident.yaml)
- [Phase 4C claim-to-evidence audit](../../docs/reports/2026-07-14-lab01-claim-evidence-audit.md)
- [v0.1 候選稿](student-manual-humanized-v0.1.md)與 [Stage 0 環境建置補丁](environment-setup-patch.md)（本版合併來源）

## 學生閱讀來源

- [Student Teaching Config](student-config/README.md)
- [srsRAN_4G Installation Guide](https://docs.srsran.com/projects/4g/en/latest/general/source/1_installation.html)
- Pinned source tree：srsRAN_4G commit
  `6bcbd9e5bf8686aa7085202cd847c5ddd64a9c16`
