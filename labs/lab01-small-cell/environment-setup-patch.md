# Lab01 補充手冊｜Stage 0 環境建置與依賴套件安裝

狀態：`DRAFT / HUMAN REVIEW REQUIRED`
適用：Ubuntu 24.04、srsRAN_4G commit `6bcbd9e5bf8686aa7085202cd847c5ddd64a9c16`、
教學 profile `lab01-student-zmq-lte`

本文件是 [學生實驗手冊](student-manual.md) 與
[v0.1 候選稿](student-manual-humanized-v0.1.md) 的補丁，補上手冊「開始前 Gate」與
§5.2「依 srsRAN_4G 官方安裝指引安裝依賴後」之間沒有寫出的實際指令。它不改變手冊既有的
Gate、完成條件或停止條件，也不授權 Runtime 操作。

> **驗證狀態：**下列套件清單依 srsRAN_4G 官方安裝指引與本 Lab 手冊需要的工具整理，
> 編寫時**沒有**在 pristine Ubuntu 24.04 上重新執行。整份流程目前為 `NOT VALIDATED`；
> 不得把「依本補丁安裝完成」寫成 clean-build PASS。

## 補丁放在哪裡

| 手冊位置 | 本補丁對應段落 |
| --- | --- |
| 開始前 Gate：「已提供 `git`、CMake、C/C++ build tools、ZeroMQ development package…」 | §0.1–§0.5 |
| §4 Stage 1 之前 | 建議先完成 Stage 0，再做 sample-plane network |
| §5.2「依官方安裝指引安裝依賴後」 | §0.3 的 build dependencies |
| §5.2 `sudo make install`／`sudo ldconfig` 之後 | §0.6 安裝後檢查 |

若 Instructor／TA 已提供預先準備好的 host，學生只需執行 §0.1 與 §0.5 的 read-only 檢查並
記錄結果；不要重複安裝或升級已準備好的環境。

---

## 0.1 先確認主機與資源（read-only）

兩台節點都執行：

```bash
hostname
lsb_release -a
uname -r
nproc
free -h
df -h ~
```

| 項目 | Node 1（EPC + eNB） | Node 2（UE） |
| --- | --- | --- |
| hostname |  |  |
| Ubuntu 版本（須為 24.04） |  |  |
| kernel |  |  |
| CPU 核心數 |  |  |
| 可用記憶體 |  |  |
| home 可用空間 |  |  |

判讀：

- Ubuntu 不是 24.04 時，停止並通知 Instructor；本手冊未涵蓋其他版本。
- 建置 srsRAN_4G 需要數 GB 磁碟空間；可用空間明顯不足時先通知 Instructor。
- 記憶體較小（例如 VM 只有 4 GB 以下）時，§5.2 的 `make -j"$(nproc)"` 可能因記憶體不足
  而失敗，屆時改用 `make -j2` 並記錄你改了什麼。

## 0.2 更新套件索引

只更新索引，不做整機升級：

```bash
sudo apt update
```

**不要**自行執行 `sudo apt upgrade` 或 `sudo apt full-upgrade`。整機升級可能更換 kernel、
USB／網路驅動或 library 版本，屬於 host 層級變更，需由 Instructor 另行決定。

`apt update` 出現 repository、DNS 或 proxy 錯誤時，保留輸出並通知 Instructor；不要自行
修改 `/etc/apt/` 下的來源設定。

## 0.3 安裝 srsRAN_4G build dependencies（兩台都要）

Node 1 與 Node 2 都需要從 source 建置 srsRAN_4G，因此兩台都安裝：

```bash
sudo apt install -y \
  build-essential cmake git pkg-config \
  libfftw3-dev libmbedtls-dev libboost-program-options-dev \
  libconfig++-dev libsctp-dev \
  libzmq3-dev
```

各套件用途：

| 套件 | 用途 |
| --- | --- |
| `build-essential` | `gcc`／`g++`／`make` 等 C/C++ 編譯工具 |
| `cmake` | 產生 build 設定；§5.2 的 `cmake ../` 需要 |
| `git` | 取得 pinned source revision；§5.1 需要 |
| `pkg-config` | 讓 CMake 找到 library 位置 |
| `libfftw3-dev` | PHY 層 FFT 運算 |
| `libmbedtls-dev` | 加解密與 security 相關運算 |
| `libboost-program-options-dev` | 解析命令列與 config 參數 |
| `libconfig++-dev` | 讀取 `.conf` 設定檔（如 `sib.conf`、`rr.conf`） |
| `libsctp-dev` | eNB ↔ MME 的 SCTP／S1AP transport |
| `libzmq3-dev` | ZeroMQ RF sample path；沒有它就無法得到 `ENABLE_ZEROMQ:BOOL=ON` |

本 Lab 使用 ZeroMQ 取代實體 radio，**不需要**安裝 UHD（USRP driver）或其他 SDR driver。
不要因為網路教學或其他 Lab 的說明而額外加裝 SDR driver，除非 Instructor 指定。

## 0.4 安裝實驗觀察與網路工具

```bash
sudo apt install -y iproute2 iputils-ping procps
```

| 套件 | 手冊中用到的指令 |
| --- | --- |
| `iproute2` | `ip link`、`ip addr`、`ip route`（§4、§6、§10） |
| `iputils-ping` | `ping -I tun_srsue …`、`ping -I srs_spgw_sgi …`（§6.4） |
| `procps` | `pgrep -a -x srsue` 等 read-only process 檢查（§10.1） |

Ubuntu 24.04 通常已預裝這三個套件；`apt` 顯示 already the newest version 屬正常結果。

### Protocol observation 工具（§7 使用）

依 Instructor 指定的 capture 節點安裝（通常至少 Node 1；若要觀察 `tun_srsue` 則 Node 2
也需要）：

```bash
sudo apt install -y tshark
```

有桌面環境且 Instructor 允許使用 GUI 時，可改裝：

```bash
sudo apt install -y wireshark
```

安裝時可能出現 **「Should non-superusers be able to capture packets?」** 的設定畫面：

- 選 **No**（預設建議）。之後依 Instructor 的 capture policy 使用 `sudo tshark …`。
- 選 Yes 並把使用者加入 `wireshark` group 會留下持續性的權限變更，只有 Instructor 明確
  同意時才可以做；做了必須記錄在報告中，並在實驗後由 Instructor 決定是否回復。

### Optional：iperf3（§9.1 使用）

只有 Instructor 啟用 TCP／iperf Measurement Extension 時才安裝：

```bash
sudo apt install -y iperf3
```

安裝時若詢問是否要把 iperf3 設為開機自動啟動的 daemon，選 **No**。本 Lab 不在任何節點
常駐 iperf3 server；server 位置與啟動方式由 Instructor 指定。

## 0.5 安裝結果檢查（read-only）

兩台節點都執行，並把輸出貼進報告：

```bash
gcc --version | head -n 1
cmake --version | head -n 1
git --version
pkg-config --modversion libzmq
dpkg-query -W -f='${Package} ${Version}\n' \
  build-essential cmake pkg-config libfftw3-dev libmbedtls-dev \
  libboost-program-options-dev libconfig++-dev libsctp-dev libzmq3-dev
```

有安裝 capture 工具的節點另外執行：

```bash
tshark --version | head -n 1
```

| 檢查 | Node 1 | Node 2 |
| --- | --- | --- |
| gcc 版本 |  |  |
| cmake 版本 |  |  |
| libzmq 版本（`pkg-config`） |  |  |
| `dpkg-query` 是否列出全部 9 個套件 |  |  |
| tshark 版本（若有安裝） |  |  |

Pass Gate：

- `pkg-config --modversion libzmq` 印出版本號（不是 `Package libzmq was not found`）。
- `dpkg-query` 沒有 `no packages found matching …`。

任一項未通過就不要進入 §5.2；保留輸出並通知 Instructor。兩台節點的套件版本**應**一致；
不一致時記錄差異，由 Instructor 判斷是否繼續。

---

## 0.6 §5.2 安裝後檢查（read-only）

完成手冊 §5.2 的 `sudo make install` 與 `sudo ldconfig` 後，在該節點執行：

```bash
ls -l /usr/local/bin/srsepc /usr/local/bin/srsenb /usr/local/bin/srsue
ldd /usr/local/bin/srsenb | grep 'not found'
ldd /usr/local/bin/srsue  | grep 'not found'
```

判讀：

- `ls` 應列出三個執行檔；Node 1 實際會用到 `srsepc`、`srsenb`，Node 2 會用到 `srsue`。
- `ldd … | grep 'not found'` **沒有輸出**才代表沒有找不到的 shared library。若有輸出，
  先確認是否漏跑 `sudo ldconfig`，仍有問題就停止並通知 Instructor。
- 這一步只能說明 binary 已安裝且 library 可被找到，**不能**證明 binary 由 pinned SHA
  建置，也不等於 config 已載入或 UE 可 attach。

不要執行 `srsran_install_configs.sh` 或其他會產生 sample subscriber database 的 generic
config installer；`/etc/srsran/` 由 Instructor／TA 依
[Student Teaching Config](student-config/README.md) 受控建立。

---

## 0.7 常見安裝／建置問題（學生層級處置）

只做下列判讀；需要改 source、改系統設定或安裝本補丁以外的套件時，停止並通知 Instructor。

| 現象 | 可能缺少 | 學生處置 |
| --- | --- | --- |
| `cmake ../` 後 `grep ENABLE_ZEROMQ` 沒有輸出 | `libzmq3-dev` | 回到 §0.5 檢查 libzmq；補裝後**刪除 `build/` 目錄重新 cmake**，並記錄 |
| CMake 顯示 `Could NOT find SCTP` 或類似訊息 | `libsctp-dev` | 同上 |
| CMake 顯示找不到 FFTW、MbedTLS、Boost、libconfig | 對應 `-dev` 套件 | 同上 |
| `make` 中途被 `Killed` 或出現 `c++: fatal error: Killed signal` | 記憶體不足 | 改用 `make -j2` 重跑並記錄 |
| `make` 出現 compiler error 而非缺套件 | 不在學生處置範圍 | 保留第一個 literal error，通知 Instructor |
| `make test` 有部分測試失敗 | 不在學生處置範圍 | 記錄失敗的 test 名稱，不繼續 `make install`，通知 Instructor |
| `apt` 被鎖定（`Could not get lock /var/lib/dpkg/lock-frontend`） | 其他 apt 程序執行中 | 等候數分鐘再試；仍被鎖定則通知 Instructor，不要刪除 lock 檔 |

補裝套件後重新執行 CMake 時，只能刪除你自己在 §5.2 建立的 `srsRAN_4G/build/` 目錄；
不要刪除 source tree 或其他目錄。

---

## 提交時補充的內容

在手冊 §12.1 的提交內容中，另外附上：

- §0.1 主機與資源表。
- §0.5 安裝結果檢查輸出（gcc、cmake、libzmq、`dpkg-query`、tshark）。
- §0.6 安裝後檢查結果。
- 若有偏離本補丁（例如改用 `make -j2`、選擇 Wireshark non-superuser capture），寫明偏離
  內容與 Instructor 核准情形。

## Maintainer 附註（不屬於學生操作步驟）

- 套件清單依 srsRAN_4G 官方 Installation Guide 的 build dependency 與 ZeroMQ 需求整理，
  並加入本手冊 §4、§6、§7、§9、§10 實際使用的工具。未在 pristine Ubuntu 24.04 上重新執行，
  狀態 `NOT VALIDATED`。
- 本補丁沒有確認 pinned commit 在 Ubuntu 24.04 預設 toolchain 下的 clean-build 結果；
  prepared host 的歷史 build 結果仍以 [PROGRESS](../../PROGRESS.md) 與相關 TER 為準。
- 套件版本未固定；若需要可重現的版本基準，需另行以 Work Unit 記錄實測版本。

## 參考來源

- [srsRAN_4G Installation Guide](https://docs.srsran.com/projects/4g/en/latest/general/source/1_installation.html)
- [Lab01 學生實驗手冊](student-manual.md)
- [Student Teaching Config](student-config/README.md)
