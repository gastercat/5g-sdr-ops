# Lab02 LTE eMBMS 多點傳送學生實驗手冊

版本 v0.1　狀態：`DELIVERY CANDIDATE / HUMAN REVIEW REQUIRED`

本實驗使用 Instructor（授課教師或助教）預先準備的兩台 Linux 主機。你會先確認主機之間的 Sample Plane（樣本傳送網路），再啟動 LTE／eMBMS 元件、接收多播文字與測試影片，最後分析自己產生的 UE MAC capture（UE MAC 封包擷取檔）。

每一步都要分開記錄「做了什麼」、「實際看見什麼」與「可以據此說明什麼」。例如，ping 通了只能支持主機網路的連通性；看到影片畫面，也不能直接說整條串流沒有錯誤。

這份手冊是交付候選稿。本手冊本身不授權 Runtime（實驗系統執行）操作；編寫本文件時沒有重新執行或驗證 Runtime。操作前仍須取得 Instructor 的本次實驗授權。

## 開始前確認環境與授權

先由 Instructor 確認以下條件。任何一項不符合，先停止並詢問 Instructor。

- 兩台主機是核准用於 Lab02 的專用主機，且你已取得本次實驗需要的 `sudo` 權限。
- `/etc/srsran/epc.conf`、`mbms.conf`、`enb.conf`、`ue.conf` 已備妥並確認可用。本實驗不要求學生修改設定或處理使用者加密資料。
- Sample Plane 介面名稱與第 2 節一致。名稱不同時，由 Instructor 協助確認步驟，不自行替換。
- `srsepc`、`srsmbms`、`srsenb`、`srsue`、`socat`、`ffmpeg`、`ffplay` 已可使用。本手冊不包含安裝步驟；現有紀錄未固定 Teaching Extension（教學延伸實驗）的 OS／工具版本與設定檔雜湊。
- Instructor 已準備 UE MAC-PCAP 設定：`/etc/srsran/ue.conf` 的 `[pcap]` 包含 `enable = mac` 與 `mac_filename = /tmp/ue_mac.pcap`。學生不自行修改設定。
- 如需範例或離線備援，Instructor 可另提供 **Lab02 Reference Capture（Lab02 參考擷取檔）**：B.3D／B.3D.1 使用的 finalized Session B capture（已完成寫入的 Session B 擷取檔）。它是次要參考，不能代替自己的 Runtime capture。

本手冊的操作命令來自 recovered 2026 procedure context（已恢復的 2026 操作脈絡）。它們不是本次文件工作的重跑結果，也不保證在未準備好的環境中成功。

## 1 實驗目的與證據界線

本實驗的閱讀與操作順序如下：

1. 確認 Sample Plane 位址、路由與雙向連通性。
2. 依 EPC → MBMS-GW → eNB → UE 啟動元件，記錄 attach／eMBMS service 的實際輸出。
3. 用 `LAB02_SHARK_1` 檢查 multicast sanity（多播基本接收）。
4. 接收 FFmpeg 的 MPEG-TS 測試影片，同時記錄畫面與錯誤訊息。
5. 停止程序，等 UE capture 完成寫入，再離線觀察協定封包。

### 1.1 每一層都需要自己的觀察

請保留 **Claim ≠ Evidence（主張不等於證據）** 的區分：

- 命令執行了，不代表該階段成功。
- 元件啟動輸出，不單獨證明 eMBMS user path（使用者資料路徑）或 UE 已收到資料。
- 文字 marker（識別文字）到達，不證明完整 eMBMS／video pipeline（影片傳送流程）。
- 一份 capture 中看到代表性 SIB13、MCCH、MTCH，不代表每次 Runtime 都會有相同觀察。
- ffplay 畫面支持該次設定下、當下可見的應用結果；不證明長時間穩定、無錯誤傳送、throughput（吞吐量）或 capacity（容量）。

### 1.2 如何閱讀歷史例子

正文中的例子會註明來源，避免與你自己的結果混用：

- **Recovered procedure context（恢復的操作脈絡）**：命令與順序由 2026 任務交接提供，這次未重跑。
- **Human-reported Runtime（操作者回報的執行結果）**：既有 Task Evidence Record，簡稱 TER（任務證據紀錄），保存操作者的啟動、attach、多播與串流觀察；不等於本次獨立驗證。
- **Bounded decoded capture（有界的擷取檔解碼結果）**：B.3D／B.3D.1 對同一份既有 UE MAC capture 的離線觀察，各 frame 的來源形式分別保留。
- **Background（背景概念）**：協助理解協定，不是本次 Lab02 的成功觀察。

舊 Lab1-2 教材可用來理解名詞與教學順序；舊 Ubuntu／srsLTE 設定、截圖、1 Mbps FFmpeg profile（參數組合）與 FIFO／named-pipe workflow（具名管道流程）不直接沿用。MIB／SIB1 在本手冊屬於背景概念。

## 2 拓樸與環境

先確認你在哪台主機操作。Linux1 執行網路側元件與 sender（傳送端）；Linux2 執行 UE 與 receiver（接收端）。

| 節點 | 本實驗角色 | Sample Plane 位址與介面 |
| --- | --- | --- |
| Linux1 | EPC、MBMS-GW、eNB、FFmpeg multicast sender | `10.0.0.1/24`，`enxec9a0c14d482` |
| Linux2 | srsUE、multicast receiver、ffplay | `10.0.0.2/24`，`enxec9a0c14d470` |

EPC 是演進封包核心網路，MBMS-GW 是多媒體廣播多播閘道，eNB 是 LTE 基地臺，UE 是使用者設備。正式名稱會保留在命令與觀察中。

`tun_srsue` 是 UE 側的接收路徑。兩項多播檢查使用同一 multicast group（多播群組）`239.255.1.1`，但使用不同 UDP port（連接埠）：

- 識別文字檢查：`3456`。
- MPEG-TS 影片：`1234`。

**位址提醒：**歷史回報先記錄 UE 為 `172.16.0.2/24`，controlled eNB／UE recovery（受控恢復）後另記錄為 `172.16.0.3/24`。這是不同時點的觀察，沒有合併為單一設定，也不是你本次必須取得的位址。請記錄實際值。

## 3 Sample Plane 啟動前檢查

這一步先回答「兩台主機是否具備本實驗所需的基本網路條件」。位址、路由與 ping 各自檢查不同問題；三者都符合預期，也還不能判定 LTE／eMBMS 成功。

### 3.1 確認介面與位址

Linux1：

```bash
ip -4 -o address show dev enxec9a0c14d482
```

Linux2：

```bash
ip -4 -o address show dev enxec9a0c14d470
```

**要看什麼：**Linux1 的指定介面是否有 `10.0.0.1/24`，Linux2 是否有 `10.0.0.2/24`。

**何時停止：**介面不存在、位址衝突，或不確定位址由誰設定時，先通知 Instructor。不要把名稱相近的其他介面當成替代品。

### 3.2 必要時加入本次暫時位址

只有在該節點尚無所需位址、且已確認可依本實驗設定時，才執行對應命令。

Linux1：

```bash
sudo ip address add 10.0.0.1/24 dev enxec9a0c14d482
```

Linux2：

```bash
sudo ip address add 10.0.0.2/24 dev enxec9a0c14d470
```

這是暫時的主機位址設定，不建立 persistent network profile（持久網路設定）。歷史事件曾回報介面重新枚舉後 Sample Plane 位址消失；若介面重新出現，依第 10 節檢查並通知 Instructor。

接著確認位址與 peer route（前往另一台主機的路由）。

Linux1：

```bash
ip -4 -o address show dev enxec9a0c14d482
ip route get 10.0.0.2
```

Linux2：

```bash
ip -4 -o address show dev enxec9a0c14d470
ip route get 10.0.0.1
```

**要看什麼：**位址在預期介面，route 選用對應的 Sample Plane 介面與來源位址。route 輸出說明本機預計怎麼送，不代表封包已抵達另一端。

### 3.3 分別確認兩個方向的連通性

Linux1：

```bash
ping -c 3 -I 10.0.0.1 10.0.0.2
```

Linux2：

```bash
ping -c 3 -I 10.0.0.2 10.0.0.1
```

**預期觀察：**兩個方向都收到另一端回應。記錄實際封包數、loss（遺失率）與時間，不用預期值代替結果。

**如何解讀：**雙向回應只支持檢查當下的 host-to-host Sample Plane ICMP connectivity（主機間 ICMP 連通性）。它不等於 ZeroMQ sample flow（樣本資料流）、LTE attach 或 eMBMS 已通。任一檢查不符預期時，停止並交由 Instructor 判斷。

## 4 依序啟動 EPC MBMS-GW eNB UE

使用四個分開的終端機，讓各程序留在前景。分開執行可讓你記錄每個元件的輸出，並在停止時確認各程序是否退出。依 **EPC → MBMS-GW → eNB → UE** 順序啟動，不把四個程序串成背景工作。

### 4.1 Linux1 啟動 EPC

```bash
sudo /usr/local/bin/srsepc /etc/srsran/epc.conf
```

### 4.2 Linux1 啟動 MBMS-GW

確認 EPC 已開始後，在另一個 Linux1 終端機執行：

```bash
sudo /usr/local/bin/srsmbms /etc/srsran/mbms.conf
```

### 4.3 Linux1 啟動 eNB

確認 Instructor 指示的前置程序已開始後，在另一個 Linux1 終端機執行：

```bash
sudo /usr/local/bin/srsenb /etc/srsran/enb.conf
```

### 4.4 Linux2 準備自己的 capture 並啟動 UE

**為什麼在這裡確認 capture：**你之後要分析的是自己這次 Runtime 產生的封包，所以 UE 啟動前就要由 Instructor 確認 `/etc/srsran/ue.conf` 的設定。學生不修改此設定。

```ini
[pcap]
enable = mac
mac_filename = /tmp/ue_mac.pcap
```

這是 recovered 2026 Session B 使用的設定。srsUE 會直接把 MAC capture 寫到 Linux2 的一般檔案 `/tmp/ue_mac.pcap`，格式使用 User DLT 149。這個流程不需要建立 FIFO／named pipe，也不要求 Wireshark 在 Runtime 中即時讀取。

eNB 開始後，在 Linux2 終端機執行：

```bash
sudo /usr/local/bin/srsue /etc/srsran/ue.conf
```

**要觀察與記錄：**各程序的實際啟動、錯誤或中止訊息。歷史 session 回報四個元件曾成功建立，但 Repo 沒有保存所有元件可通用的 literal readiness log line（逐字可比對的就緒訊息）。命令沒有立即返回 shell，不足以標記成功。

**分析時機：**UE 執行期間會持續寫入 capture，檔案可能尚未完成。完成後續實驗並依第 11 節停止 UE；等 srsUE process（程序）退出、檔案完成寫入後，再依第 12 節離線分析。Session B 的封包數與檔案大小僅是歷史參考，不是學生驗收標準。

## 5 觀察 UE attach 與 eMBMS 接受狀態

啟動後，接下來要回答「UE 是否完成 attach（接入），以及 eMBMS service（服務）是否被接受」。這需要實際 Runtime 輸出，不能由第 3 節的 ping 或設定檔存在推導。

在 Linux2 UE 終端機及 Linux1 MBMS-GW／eNB 終端機：

1. 記錄 UE attach 的明確輸出行及時間。
2. 記錄 eMBMS service acceptance（服務接受狀態）的實際輸出行及時間。
3. 記錄實際 UE interface／address（介面與位址）。不要用歷史位址代替自己的結果。

Linux2 可查詢：

```bash
ip -4 -o address show dev tun_srsue
```

**觀察限制：**Teaching Extension TER 保存 Human-reported attach 與 eMBMS service establishment（服務建立），但未保存完整 raw log（原始日誌）或適用各次實驗的通用 acceptance 字串。因此語義上的歷史結果有紀錄，逐字成功標記仍未確立。

若 Instructor 尚未指定本課要記錄的成功訊息，照實抄錄觀察並請其判讀；不要自行創造成功字串或寫成 PASS。介面位址查詢本身也不證明 attach／eMBMS 成功。

## 6 用 LAB02_SHARK_1 檢查多播基本接收

先用容易比對的文字，確認 marker 是否從 Linux1 經 multicast／UE 路徑到達 Linux2。這一步只做 multicast sanity，影片與協定觀察仍須分開進行。

先在 Linux2 啟動 receiver：

```bash
socat -u UDP4-RECV:3456,bind=239.255.1.1,ip-add-membership=239.255.1.1:tun_srsue -
```

再於 Linux1 啟動 sender：

```bash
socat -u - UDP4-DATAGRAM:239.255.1.1:3456
```

在 sender 終端機輸入以下文字後按 Enter：

```text
LAB02_SHARK_1
```

**預期觀察：**Linux2 顯示相同 marker。記錄兩端實際文字與時間；沒有看到相同文字，不記為成功。

**可以支持什麼：**Teaching Extension TER 將該次 marker 到達記為 Human-reported multicast E2E sanity（端到端多播基本接收）。你自己的結果也須由兩端記錄支持。

**不能證明什麼：**marker 不單獨證明完整 eMBMS protocol chain（協定流程）、video decode（影片解碼）、播放品質、throughput 或 capacity。

## 7 認識 MIB SIB1 SIB2 SIB13

這一節先建立閱讀 System Information（系統資訊）的背景。背景概念與實際封包觀察要分開；第 12 節再說明怎麼檢視自己的 capture。

- **MIB（主資訊區塊）**：系統資訊的基礎區塊之一。目前證據未把 MIB 列為已確認的 Lab02 capture 成功觀察。
- **SIB1（系統資訊區塊 1）**：提供 cell access（小區接入）與 system-information scheduling（系統資訊排程）相關資訊。目前也不是已確認的 Lab02 capture 成功觀察。
- **SIB2（系統資訊區塊 2）**：承載 common radio resource configuration（共用無線資源設定）等資訊。Lab02 Reference Capture 的 Frame 3 中，SIB2、SIB3、SIB13 同列於解碼出的 SystemInformation。
- **SIB13（系統資訊區塊 13）**：與 MBMS／MBSFN 相關。MBMS 指多媒體廣播多播服務；MBSFN 指多媒體廣播多播單頻網路。Reference Capture 的 Frame 3 解碼出 SIB13 與 MBSFN／MCCH configuration（設定資訊）。

**閱讀界線：**MIB／SIB1 可作概念講解，不能登記為目前證據已確認的 Lab02 成功觀察。Frame 3 是參考例子，也不是每位學生 Runtime 必然出現的紀錄。

## 8 接收 FFmpeg 的 MPEG-TS 測試影片

這一步把應用端的可視結果加入觀察：FFmpeg 產生測試影片，以 MPEG-TS（傳輸串流）輸出；UE 側以 `socat | ffplay` 接收並播放。流程記為 **FFmpeg → MPEG-TS → eMBMS → socat | ffplay**，成功與否仍看實際畫面及訊息。

先在 Linux2 啟動 receiver：

```bash
socat -u UDP4-RECV:1234,bind=239.255.1.1,ip-add-membership=239.255.1.1:tun_srsue - | ffplay -
```

再於 Linux1 啟動 FFmpeg sender：

```bash
ffmpeg -re -f lavfi -i "testsrc2=size=320x180:rate=15" -vcodec libx264 -preset ultrafast -tune zerolatency -b:v 200k -maxrate 200k -bufsize 400k -g 15 -f mpegts udp://239.255.1.1:1234
```

**為什麼先開 receiver：**先準備接收端，避免 sender 已開始而 receiver 尚未加入 multicast group。

**參數界線：**這是 recovered 2026 bounded working profile（有界的可工作實驗參數）。`200k` 是命令設定的 video bitrate target（影片位元率目標），不是 measured throughput（實測吞吐量）、eMBMS capacity 或保證的接收速率。舊教材的 1 Mbps 不作本手冊推薦 profile；也不能從這兩種嘗試推導 bitrate causality（位元率因果關係）或容量門檻。

## 9 記錄可視結果與同時出現的錯誤

**預期觀察：**Linux2 的 ffplay 視窗可顯示 test-pattern（測試圖樣）畫面，終端機則提供實際辨識的 media metadata（媒體資訊）與 warning／error（警告與錯誤）。觀察到畫面時，把當下畫面、時間與同時出現的訊息一起記錄，不只寫「成功」。

歷史 Teaching Extension 的後續有界檢查包含一張操作者提供的照片：ffplay 顯示 test-pattern frame，終端機辨識 MPEG-TS／H.264、320×180、15 fps，同時顯示 packet corruption（封包損壞訊息）與 decoder warnings（解碼器警告）。

**可以支持什麼：**照片支持該 session／設定下，拍攝當下有 end-to-end observable application result（端到端可觀察的應用結果）。Runtime 操作仍屬 Human-reported；照片不是編寫者獨立操作主機的證據。

**不能證明什麼：**單張照片不證明持續動態播放、播放時長、長時間穩定或無錯誤 delivery（傳送）。如果看到 `Packet corrupt`、`Invalid NAL unit`、macroblock（巨集區塊）或 decode／concealment（解碼／錯誤遮掩）警告，照實記錄。可視畫面與錯誤可以同時存在，不能把可視結果寫成 stream integrity PASS（串流完整性通過）。

## 10 遇到 Error receiving samples 時如何檢查

### 10.1 先把訊息當成症狀

若 `srsUE` 重複顯示 `Error receiving samples`，表示程式當下回報 sample receiving（樣本接收）錯誤。訊息沒有指出是哪個元件或原因，所以不能直接判定 srsRAN 有 bug，或 USB Ethernet adapter（USB 乙太網路介面卡）損壞。

先記下錯誤時間與兩台主機當時的介面／Sample Plane 狀態，暫停後續 LTE／eMBMS 成功判讀，再做下列有界的唯讀檢查。這些是檢查建議，不是已驗證的 repair procedure（修復程序）。

### 10.2 先查 Sample Plane 的位址

Sample Plane 檢查先看比 LTE attach／eMBMS 更低層的主機網路條件。歷史事件曾同時回報位址不見與此錯誤，這是先查它的理由；不能推廣成每次都是 Sample Plane 引起。

Linux1：

```bash
ip -4 -o address show dev enxec9a0c14d482
```

Linux2：

```bash
ip -4 -o address show dev enxec9a0c14d470
```

**檢查的問題：**`10.0.0.1/24` 是否仍在 Linux1 的 `enxec9a0c14d482`，`10.0.0.2/24` 是否仍在 Linux2 的 `enxec9a0c14d470`。

**結果怎麼看：**缺少位址或出現在不同介面，只能說目前本機設定與預期不符。記錄並停止，交由 Instructor 判斷。位址存在也不代表另一端可達、ZeroMQ 或 LTE／eMBMS 正常。

### 10.3 查前往另一端的路由

Linux1：

```bash
ip route get 10.0.0.2
```

Linux2：

```bash
ip route get 10.0.0.1
```

**檢查的問題：**Linux kernel（核心）目前選用哪個介面與 source address（來源位址）前往 peer（另一端）。

**結果怎麼看：**應選用對應的 Sample Plane 介面與來源位址。不符合時記錄並停止。route selection（路由選擇）只說明本機的選擇，不證明封包已抵達或收到回應。

### 10.4 查兩個方向的基本 IP 連通性

Linux1：

```bash
ping -c 3 -I 10.0.0.1 10.0.0.2
```

Linux2：

```bash
ping -c 3 -I 10.0.0.2 10.0.0.1
```

**檢查的問題：**分別從兩端送出 ICMP echo，確認檢查當下兩個方向是否有回應。只測一個方向，不足以記錄雙向結果。

**結果怎麼看：**兩方向都有回應，支持當下的主機間 Sample Plane ICMP 可用；任一方向失敗，記錄方向、loss 與時間，標為尚未確認，停止後續成功判讀。

**仍不能證明：**ping 不證明 ZeroMQ sample flow、LTE attach、eMBMS service 或應用路徑成功。錯誤發生後才做的 ping，也不能回溯證明錯誤當時的連通性。

### 10.5 介面曾變動時查主機日誌

若介面曾消失、名稱改變、重新出現，或位址無故不在，查看涵蓋症狀時間的 kernel 與 NetworkManager 日誌。在使用 systemd 的主機可查：

```bash
sudo journalctl -k --since "15 minutes ago" --no-pager
sudo journalctl -u NetworkManager --since "15 minutes ago" --no-pager
```

若錯誤早於最近 15 分鐘，將 `--since` 調整至涵蓋已記錄的錯誤時間。服務名稱或日誌工具不同時，請 Instructor 指示對應的唯讀查詢。

**檢查的問題：**kernel log 是否記錄 device disconnect（裝置斷線）、interface unregister（介面解除註冊）或 re-enumeration（重新枚舉）；NetworkManager log 則用來對照介面與 network profile（網路設定）的後續變化。

**結果怎麼看：**記錄找到的事件與時間，交給 Instructor 評估。時間順序只補充發生過哪些 host event（主機事件），不能直接變成因果結論。歷史紀錄中，NetworkManager profile reactivation（設定重新啟用）在 kernel device event 之後；它不是已確立的 USB disconnect 原因。

**仍不能證明：**單一 log event 不證明 adapter hardware failure（硬體故障）、driver／kernel bug、srsRAN bug 或完整 root cause（根因）。沒找到 log entry，也不能證明沒有事件；須先確認時間範圍與日誌可用性。

### 10.6 合併判讀與停止條件

| 觀察 | 可以支持 | 不能據此支持 |
| --- | --- | --- |
| 位址在預期介面 | 該主機當下有對應的本機 Sample Plane 位址 | peer 可達、sample flow 或 LTE／eMBMS 正常 |
| `ip route get` 選用預期介面與 source | 本機對 peer 的路由選擇符合預期 | 封包已抵達 peer 或收到回應 |
| 兩方向 ping 都有回應 | 檢查當下有雙向主機間 ICMP 回應 | ZeroMQ、LTE attach、eMBMS 或應用路徑正常 |
| 日誌記錄 disconnect 或 re-enumeration | 該時間範圍記錄了裝置／網路事件 | adapter 已壞、完整根因，或事件必然造成此錯誤 |

**停止並通知 Instructor：**遇到下列任一情況，保存時間、主機、命令結果與相關日誌範圍，停止自行排查。

- 位址不見、在非預期介面，或介面消失／重新命名／重新枚舉。
- 路由未選用預期介面／來源位址，或任一方向 ping 沒有回應。
- 日誌出現 USB Ethernet disconnect／re-enumeration，或狀態與紀錄無法釐清。
- 位址、路由與 ping 都符合預期，但錯誤仍重複出現。

不要因為這個症狀而自行重啟整套 Runtime、修改 persistent network 設定或交換 adapter。

**歷史事件的界線：**一筆 Human-reported incident 記錄 Sample Plane 位址遺失與 `Error receiving samples`；另一段 supplied log chronology（提供的日誌時序）記錄 Linux2 USB Ethernet disconnect／`cdc_ether` unregister／re-enumeration。底層 USB disconnect cause 仍為 `UNLOCALIZED`（尚未定位），沒有 adapter swap／A-B isolation evidence（交換介面卡的對照隔離證據），不能寫成 USB 網卡已壞，也不能推廣為所有同症狀的原因。

該次紀錄另回報 Sample Plane host connectivity 恢復後，ZMQ／LTE 未自動恢復；後來的 controlled eNB／UE restart 與 attach、user plane、多播恢復屬於 **Human-reported historical sequence（操作者回報的歷史順序）**。這是各層需要分別觀察的例子，不是學生可照做的修復指令。即使基本 Sample Plane 檢查通過，仍需 Instructor 指示後續 Runtime evidence 才能判斷 LTE／eMBMS。

## 11 建議的受控停止程序

這一節提供 conservative recommendation（保守建議），**不是已驗證的歷史 shutdown sequence（停止順序）**。Teaching Extension TER 只保存操作者回報完成 shutdown，未保存可逐步驗證的完整順序，也未由 Codex 獨立確認停止後程序狀態。

保留各程序的前景終端機，依序停止並等待退出：

1. Linux1 的 FFmpeg sender 按 `Ctrl-C`，停止新的 video datagrams（影片資料報）。
2. Linux2 的 video receiver／ffplay pipeline 與 multicast sanity receiver 按 `Ctrl-C`。marker sender 若仍在執行，也在其終端機停止。
3. 依 **UE → eNB → MBMS-GW → EPC** 反向順序，在各自前景終端機按 `Ctrl-C`。等待每個程序退出，記錄結果。
4. 不使用 `killall -9` 作為正常停止方式。程序未退出或終端機狀態不明時，停止並通知 Instructor，不自行強制終止。
5. Runtime 停止後，僅對本次確定新增的 temporary Sample Plane 位址，在 Instructor 確認後移除。不要移除來源不明或原本就存在的位址。

Linux1：

```bash
sudo ip address del 10.0.0.1/24 dev enxec9a0c14d482
```

Linux2：

```bash
sudo ip address del 10.0.0.2/24 dev enxec9a0c14d470
```

6. 檢查兩台目前的 Sample Plane 位址，記錄實際結果。

**記錄界線：**不要把本建議寫成歷史 session 曾逐項執行、由 Codex 驗證、零殘留程序或目前停機狀態。UE 退出並完成 capture 寫入後，才進入第 12 節。

## 12 分析自己的 capture 與 SIB13 MCCH MTCH

### 12.1 先開自己的 Runtime capture

你的主要協定觀察材料，是第 4.4 節設定後、由自己這次 UE Runtime 產生的 `/tmp/ue_mac.pcap`。依第 11 節確認 srsUE 已退出、檔案完成寫入後，在 Linux2 查看檔案資訊：

```bash
ls -l /tmp/ue_mac.pcap
```

`ls -l` 用來查看檔案資訊；分析時機仍以 UE 退出並完成寫入為前提，不把檔案存在或大小當成成功判準。封包數與大小不設固定門檻，也不要求與 Session B 相同。

在 Wireshark 中離線開啟自己的檔案，依以下 decoder（解碼器）設定檢視結果：

1. 將 User DLT `149` 對應至 UDP。
2. 啟用 `mac_lte_udp`，讓 MAC／RLC／RRC payload（承載內容）可被解碼。
3. 要直接解碼 MTCH 時，再啟用 `Call RLC dissector MTCH LCIDs`。

**設定界線：**Wireshark GUI 版本與選單位置尚未確認；以上是設定名稱，不是固定版本的選單導引。Live Wireshark attachment（執行中即時連接）不是必要條件。若尚未正確解碼，先記錄 decoder 尚未配置的狀態；零筆 filter match（篩選符合結果）或 decoder 錯誤，不證明協定不存在，也不單獨證明 capture 損壞。

**舊流程提醒：**`mkfifo /tmp/ue.pcap.pipe` 加 live Wireshark 是 legacy workflow（歷史流程），不是 2026 Session B 的 current procedure（本次恢復的流程）。本手冊不要求建立 FIFO 或即時讀取。

### 12.2 參考檔只能協助辨認觀察

Instructor 可提供 **Lab02 Reference Capture**：B.3D／B.3D.1 使用的 finalized Session B UE MAC PCAP。用途限於 Instructor 示範、decoder 對照、troubleshooting comparison（排障比較）或離線教學備援。它不能代替你的 Runtime capture，也不能把參考檔的結果登記成自己本次的結果。

以下 Frame 3／22／41 都只指這份 Reference Capture。自己的 frame number（封包編號）、packet count（封包數）與內容不必相同。

### 12.3 先分清三個觀察問題

SIB13 → MCCH → MTCH 是閱讀封包的路徑，不表示三個 frame 已證明完整、連續或因果相連的 eMBMS 傳輸。先看系統資訊，再分開看控制通道與流量通道：

| 觀察 | 要回答的問題 |
| --- | --- |
| SIB13 | System Information 中是否有 MBMS／MBSFN 相關資訊與 MCCH configuration？ |
| MCCH（多播控制通道） | 是否有一筆可辨認為 MCCH 的 control-channel observation（控制通道觀察）？ |
| MTCH（多播流量通道） | 是否有一筆在 RLC-LTE 中解碼為 MTCH 的 downlink observation（下行觀察）？ |

MCH（多播傳輸通道）、MCCH、MTCH 是不同層次的觀察。看到 MCH，不能直接寫成已觀察到 MCCH 或 MTCH；三項都要有各自的封包證據。

### 12.4 SIB13 先看 MBMS 與 MBSFN 系統資訊

**為什麼先看：**SIB13 讓你先檢查這份 capture 的 System Information 有沒有 MBMS／MBSFN 相關資訊，以及其中是否解碼出 MCCH configuration。接著再找一筆實際 MCCH SDU，回答的是另一個問題。

**要看什麼：**在 LTE RRC SystemInformation 中找 SIB13；展開解碼樹，留意 `sib13-v920`、MBSFN area information（區域資訊）與 `mcch-Config-r9`。

**參考例子：**Frame 3 顯示 `SystemInformation [ SIB2 SIB3 SIB13 ]`，解碼樹可見 SIB13、MBSFN area information 與 MCCH configuration。這是 screenshot-based direct decode（以提供的截圖支持的直接解碼觀察），只代表 Reference Capture。

**代表什麼：**在這份 capture 中，SIB13 的 MBMS／MBSFN 資訊及 MCCH configuration 可被解碼觀察到。

**不能證明什麼：**SIB13 或 configuration 欄位不證明 MCCH SDU（服務資料單元）已被觀察、不證明 MTCH 已解碼，也不證明 UE 收到應用資料或出現可視播放。

### 12.5 MCCH 分開辨認控制側觀察

**為什麼分開看：**SIB13 中看到 MCCH configuration，與在封包中辨認 MCCH 是兩件事。後者需要封包解碼結果明確標示 MCCH。

**要看什麼：**確認封包中的 MCCH 標示。不要只因為有 MCH 或 MCH Scheduling Information（排程資訊），就記成 MCCH。

**參考例子：**Frame 22 的 observation 記錄 MCH tree（解碼樹）、2-byte MCH Scheduling Information，以及 16-byte MCCH SDU。

**為什麼保留 `REPORTED_ONLY`：**保存的來源是人員提供的 Wireshark observation；所選 frame 的 screenshot（截圖）或 raw decoder export（原始解碼匯出）沒有存入 Repo。這個標記表示可複核的來源形式，不表示 MCCH 在 capture 中不存在，也不能改標為 screenshot-backed direct evidence（有截圖支持的直接證據）。

**代表什麼：**Reference Capture 的 Frame 22 被回報解碼為 MCCH SDU。這項觀察與 Frame 3 分開記錄，不能只靠 MCH 存在取代。

**不能證明什麼：**不證明 MCCH 完整內容或完整服務控制流程，也不單獨證明 MTCH 或應用資料到達 UE。

### 12.6 MTCH 看 RLC-LTE 的下行解碼

**為什麼分開看：**MTCH 是 traffic-channel（流量通道）側的觀察，與 MCCH 的控制側觀察不同。Frame 22 的 MCCH observation 不能當作 Frame 41 的 MTCH evidence。

**要看什麼：**RLC-LTE（LTE 無線鏈路控制解碼）是否明確標示 MTCH。只顯示 MCH SDU 或 LCID（邏輯通道識別碼）數值時，不僅依該數值判定 MTCH。

**參考例子：**啟用 `Call RLC dissector MTCH LCIDs` preference（解碼偏好設定）後，Frame 41 直接解碼為 RLC-LTE downlink UM MTCH；樹中顯示 Channel Type `MTCH (8)`、Channel ID 0、PDU Length 45。UM 為 Unacknowledged Mode（非確認模式）。這項結果由提供的截圖支持。

**代表什麼：**套用該 RLC dissector（RLC 解碼器）設定後，這份 Reference Capture 的 Frame 41 可直接解碼為 MTCH。設定未啟用時看不到 MTCH decode，不能單獨推論 capture 沒有 MTCH。

**不能證明什麼：**Frame 41 不證明 MTCH 持續傳送、payload 對應特定影片、影片完整抵達或應用播放成功。每一項都需要自己的證據。

### 12.7 把結果放在一起仍要保留界線

| Reference Capture frame | 記錄的觀察與問題 | 來源與限制 |
| --- | --- | --- |
| 3 | LTE RRC SystemInformation 含 SIB2、SIB3、SIB13；SIB13／MBSFN 與 MCCH configuration | screenshot-based direct decode；只代表這份 capture |
| 22 | MCH Scheduling Information 2 bytes；MCCH SDU 16 bytes | 人員提供的 observation；保留 `REPORTED_ONLY`；所選 frame 截圖未存入 Repo |
| 41 | RLC-LTE downlink UM MTCH；Channel Type MTCH (8)，Channel ID 0，PDU Length 45 | screenshot-based direct decode；需啟用 `Call RLC dissector MTCH LCIDs`；只代表這份 capture |

先記錄自己 capture 實際解碼到的 frame 與內容，再用參考檔理解如何辨認。三個例子來自同一份 finalized capture，支持各自有界的 SIB13、MCCH、MTCH observation；單一 capture 不能推論每次 Runtime 都有相同行為，也不證明連續 MCH／MCCH／MTCH、完整 eMBMS pipeline、visible playback（可視播放）、throughput、capacity 或長期穩定。

## 13 整理本次結果能支持的結論

提交紀錄時，以自己實際看見的結果作主體。歷史紀錄與 Reference Capture 留作對照，來源不要混寫。

| 證據 | 可以支持 | 不支持 |
| --- | --- | --- |
| 歷史 UE attach／eMBMS service runtime report | 2026 Teaching Extension 操作者回報該次 attach 與服務建立 | 本次文件工作重新驗證、通用逐字成功標記或跨 session 成功 |
| `LAB02_SHARK_1` | 該次回報的 marker 到達 Linux2；自己的結果須由自己的紀錄支持 | 單靠 marker 證明完整 eMBMS 協定、影片、throughput 或 capacity |
| 自己的 UE MAC capture | 本次 Runtime 檔案中實際解碼到的內容，依自己的記錄與 decoder 設定 | 每次都有相同封包、僅有設定就算已觀察協定，或效能結論 |
| Reference Capture Frame 3／22／41 | 一份既有 capture 的代表性觀察，分別保留 direct／reported 來源 | 代替自己的 Runtime 證據、每次相同封包、連續 MCH／MCCH／MTCH、應用播放或效能 |
| 歷史 bounded ffplay photo | 指定 session／設定下拍攝當下可見 test-pattern，屬端到端可觀察應用結果 | 長時間穩定、無 packet／decode errors、無損 delivery、throughput、capacity 或 bitrate threshold |

本實驗沒有建立 capacity／performance benchmark（容量／效能基準）、長時間穩定性、bitrate causality、USB hardware root cause 或 UE → EPC latency root cause（延遲根因）。這些未知不能用背景概念、舊教材或一次成功觀察補上。

## 審閱附註 來源與正式授課前待確認事項

以下供 Instructor／Reviewer（審閱者）追溯來源。正文已保留會影響學生判讀的限制；附註不把這份 candidate 提升為已接受的 canonical artifact（正式依據文件）。

- 狀態與歷史摘要：[Lab02 README](README.md)、[PROGRESS.md](../../PROGRESS.md)。README 的歷史待確認項目不直接轉為本手冊的操作流程。
- 命令與順序：原 [Student Manual](student-manual.md) 保存任務交接恢復的 2026 procedure context；本次 Humanizer 未重跑。
- 啟動、attach、多播與影片：[Teaching Extension TER](../../docs/evidence/task-evidence/2026-09-26-lab02-teaching-extension-runtime.yaml)，TE-01／TE-02 為操作者回報；後續 TE-06 照片支持當下畫面及同時存在的錯誤。照片於任務脈絡檢視，未存入 Repo。TE-05／TE-07 shutdown 為回報，非獨立程序狀態檢查。
- Sample Plane 症狀與日誌：[Sample Plane USB incident TER](../../docs/evidence/task-evidence/2026-09-26-lab02-sample-plane-usb-incident.yaml)，SPI-01 為位址缺少與症狀的回報，SPI-02 為歷史恢復順序，SPI-03／SPI-04／SPI-05 保留事件時序與 `UNLOCALIZED` 根因。原始 host logs 未存入 Repo。
- 位址、路由與雙向 ping 的有界觀察：[B.1 core Runtime bring-up TER](../../docs/evidence/task-evidence/2026-09-25-lab02-b1-core-runtime-bring-up.yaml)。基本網路結果只適用於檢查時間窗。
- Reference Capture：[B.3D TER](../../docs/evidence/task-evidence/2026-09-26-lab02-b3d-sib13-mcch-mtch.yaml)，B3D-01／B3D-03 為 screenshot-based direct decode，B3D-02 保留 `REPORTED_ONLY`。來源截圖屬任務脈絡證據，未封存於 Repo；本次未開啟或重新解碼 PCAP。
- Decoder：[B.3D.1 TER](../../docs/evidence/task-evidence/2026-09-26-lab02-b3d1-dlt149-decoder-compatibility.yaml)，B3D1-02／B3D1-03 保存 DLT／heuristic 與 MTCH 設定。Wireshark GUI 版本與選單未知；未證明等效 TShark CLI 設定的解碼結果，也未建立版本相容性矩陣。不增列 MCCH 專用 preference 為必需條件。
- 編輯依據：[Style Contract v0.1](student-manual-style-contract-v0.1.md)、[SIB13 → MCCH → MTCH calibration](student-manual-golden-section-sib13-mcch-mtch.md)、[Error receiving samples calibration](student-manual-calibration-error-receiving-samples.md)。本次只改善閱讀路徑。

**正式授課前仍需確認：**Instructor 完成主機、工具與 config provisioning（設定準備），確認 UE MAC-PCAP 設定，並指定 attach／eMBMS acceptance 的逐字觀察標記；若安排參考示範，另提供標示清楚的 Lab02 Reference Capture。這些缺口不得由舊投影片或推測補寫。
