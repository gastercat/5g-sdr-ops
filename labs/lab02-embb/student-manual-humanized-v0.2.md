# Lab02 LTE eMBMS 多點傳送學生實驗手冊

版本 v0.2　狀態：`DRAFT / HUMAN REVIEW REQUIRED`

> **v0.2 說明：**以 [v0.1 交付候選稿](student-manual-humanized-v0.1.md)為底稿，內容與界線不變，改成
> 「一步一卡」的短段落排版，並把較長的說明收進可展開的區塊。尚未經 Human Review；v0.1 保留不動供比對。

---

## 這份手冊怎麼用

- **一張卡只做一件事。**照順序做，不要跳。
- **看到「通過」才往下。**看到「停」就停手，問 Instructor（授課教師或助教）。
- **每一步分開記三件事：**做了什麼、實際看見什麼、可以據此說明什麼。
  例：ping 通只支持主機網路連通；看到影片畫面，也不能說整條串流沒有錯誤。
- 想知道原因時點開可展開的區塊；趕時間可以先跳過。

每張卡用同樣的粗體標籤：

| 標籤 | 意思 |
| --- | --- |
| **在哪台** | 在哪台主機執行 |
| **目標** | 這張卡要完成什麼 |
| **通過** | 預期看到的結果 |
| **停** | 停下來，通知 Instructor |
| **注意** | 這個結果**不代表**什麼 |
| **記錄** | 要記進報告的東西 |
| **參考** | 歷史或參考例子（不是你的結果） |

這份手冊是交付候選稿。手冊本身不授權 Runtime 操作；編寫時沒有重新執行或驗證 Runtime。操作前仍要取得
Instructor 的本次實驗授權。

## 今天的路線

- [ ] [開始前：確認環境與授權](#開始前確認環境與授權)
- [ ] [設定你的位址](#設定你的位址兩台都要)
- [ ] [Step 1：檢查 Sample Plane](#step-1-檢查-sample-plane)
- [ ] [Step 2：依序啟動 EPC → MBMS-GW → eNB → UE](#step-2-依序啟動-epc--mbms-gw--enb--ue)
- [ ] [Step 3：記錄 attach 與 eMBMS](#step-3-記錄-attach-與-embms)
- [ ] [Step 4：多播文字測試 `LAB02_SHARK_1`](#step-4-多播文字測試-lab02_shark_1)
- [ ] [Step 5：接收測試影片](#step-5-接收測試影片)
- [ ] [Step 6：受控停止](#step-6-受控停止)
- [ ] [Step 7：分析自己的 capture](#step-7-分析自己的-capture)
- [ ] [Step 8：整理結論](#step-8-整理結論)

出現 `Error receiving samples`？看 [卡住了](#卡住了error-receiving-samples)。

---

## 開始前：確認環境與授權

**目標：**由 Instructor 確認下面每一項。任何一項不符合 → 先停止並詢問 Instructor。

- [ ] 兩台主機是核准用於 Lab02 的專用主機，你有本次實驗需要的 `sudo` 權限。
- [ ] Lab02 專用設定資料夾 `/etc/srsran/lab02/` 內的 `epc.conf`、`mbms.conf`、`enb.conf`、`ue.conf`，以及
      `enb.conf` 引用的 MBSFN 版 `sib.conf`、`rr.conf`、`rb.conf`，已備妥並確認可用；不與 Lab01 的
      `/etc/srsran/*.conf` 共用。**你不需要修改設定，也不處理使用者加密資料。**
- [ ] 已照 [設定你的位址](#設定你的位址兩台都要) 確認本組 Sample Plane 位址（`10.0.<排>.<電腦編號>/24`）
      與本次介面名稱。不確定 → 由 Instructor 協助，不自己替換。
- [ ] Instructor 已依本組位址設定 `/etc/srsran/lab02/enb.conf` 與 `ue.conf` 的 ZeroMQ `rx_port`：
      eNB 指向 `tcp://<LINUX2_SAMPLE_IP>:2001`，UE 指向 `tcp://<LINUX1_SAMPLE_IP>:2000`。你不自己改。
- [ ] `srsepc`、`srsmbms`、`srsenb`、`srsue`、`socat`、`ffmpeg`、`ffplay` 都能用。
      （本手冊不含安裝步驟；現有紀錄未固定 Teaching Extension 的 OS／工具版本與設定檔雜湊。）
- [ ] Instructor 已準備 UE MAC-PCAP 設定：`/etc/srsran/lab02/ue.conf` 的 `[pcap]` 有 `enable = mac` 與
      `mac_filename = /tmp/ue_mac.pcap`。你不自己改。
- [ ] （選用）Instructor 可另外提供 **Lab02 Reference Capture**：B.3D／B.3D.1 使用的 finalized Session B capture。
      它只是次要參考，**不能代替你自己的 Runtime capture**。

**注意：**本手冊的命令來自 recovered 2026 procedure context（已恢復的 2026 操作脈絡），不是這次文件工作的重跑結果，
也不保證在沒準備好的環境中成功。

---

## **目標：**今天要做什麼

1. 確認 Sample Plane 位址、路由與雙向連通。
2. 依 EPC → MBMS-GW → eNB → UE 啟動，記錄 attach／eMBMS service 的實際輸出。
3. 用 `LAB02_SHARK_1` 檢查 multicast sanity（多播基本接收）。
4. 接收 FFmpeg 的 MPEG-TS 測試影片，同時記錄畫面與錯誤訊息。
5. 停止程序，等 UE capture 寫完，再離線看協定封包。

### 每一層都要有自己的證據

記住 **Claim ≠ Evidence（主張不等於證據）**：

| 你看到 | 不代表 |
| --- | --- |
| 命令執行了 | 該階段成功 |
| 元件啟動輸出 | eMBMS user path 通了，或 UE 已收到資料 |
| 文字 marker 到達 | 完整 eMBMS／video pipeline 成功 |
| 一份 capture 裡有代表性 SIB13、MCCH、MTCH | 每次 Runtime 都會一樣 |
| ffplay 有畫面 | 長時間穩定、無錯誤傳送、throughput 或 capacity |

ffplay 畫面只支持「該次設定下、當下可見」的應用結果。

<details>
<summary>怎麼讀手冊裡的歷史例子（**參考：**的四種來源）</summary>

正文例子都會註明來源，避免和你自己的結果混用：

- **Recovered procedure context（恢復的操作脈絡）**：命令與順序由 2026 任務交接提供，這次未重跑。
- **Human-reported Runtime（操作者回報的執行結果）**：既有 Task Evidence Record（TER，任務證據紀錄）保存操作者的
  啟動、attach、多播與串流觀察；不等於本次獨立驗證。
- **Bounded decoded capture（有界的擷取檔解碼結果）**：B.3D／B.3D.1 對同一份既有 UE MAC capture 的離線觀察，
  各 frame 的來源形式分別保留。
- **Background（背景概念）**：協助理解協定，不是本次 Lab02 的成功觀察。

舊 Lab1-2 教材可以用來理解名詞與教學順序；舊 Ubuntu／srsLTE 設定、截圖、1 Mbps FFmpeg profile 與
FIFO／named-pipe workflow 不直接沿用。MIB／SIB1 在本手冊屬於背景概念。

</details>

---

## 誰在哪台

| 節點 | 跑什麼 | Sample Plane 位址與介面 |
| --- | --- | --- |
| Linux1 | EPC、MBMS-GW、eNB、FFmpeg multicast sender（傳送端） | `10.0.<排>.<Linux1 電腦編號>/24`，`$LINUX1_SAMPLE_IFACE` |
| Linux2 | srsUE、multicast receiver（接收端）、ffplay | `10.0.<排>.<Linux2 電腦編號>/24`，`$LINUX2_SAMPLE_IFACE` |

- EPC：演進封包核心網路　MBMS-GW：多媒體廣播多播閘道　eNB：LTE 基地臺　UE：使用者設備
  （命令與觀察中保留正式名稱）
- `tun_srsue` 是 UE 側的接收路徑。兩項多播檢查用同一個 multicast group `239.255.1.1`，但 UDP port 不同：

| 檢查 | port |
| --- | --- |
| 識別文字 `LAB02_SHARK_1` | `3456` |
| MPEG-TS 影片 | `1234` |

**UE 位址提醒：**歷史回報先記錄 UE 為 `172.16.0.2/24`，controlled eNB／UE recovery 後另記錄為 `172.16.0.3/24`。
這是不同時點的觀察，沒有合併成單一設定，也不是你這次一定要拿到的位址。**記錄：**記錄你的實際值。

---

## 設定你的位址（兩台都要）

**目標：**算出本組的 Sample Plane 位址與介面，存進終端機變數。

**規則（與 Lab01 相同）：**Linux1 和 Linux2 是兩台不同電腦上的 VM，用所在電腦的位置當位址：

```text
10.0.<排>.<電腦編號>/24      排：1～7　電腦編號：該排的 1～12
```

- **同一組的兩台電腦必須在同一排。**排和編號照教室標示。
- 介面名稱以**本次** `ip -br link` 的輸出為準，不沿用歷史主機的 USB adapter 名稱。

**在哪台：Linux1 和 Linux2 都輸入同一組數值：**

```bash
ROW='<排，1～7>'
LINUX1_PC='<Linux1 所在電腦編號>'
LINUX2_PC='<Linux2 所在電腦編號>'
LINUX1_SAMPLE_IP="10.0.${ROW}.${LINUX1_PC}"
LINUX2_SAMPLE_IP="10.0.${ROW}.${LINUX2_PC}"
LINUX1_SAMPLE_IFACE='<Linux1 本次確認的 Sample Plane 介面>'
LINUX2_SAMPLE_IFACE='<Linux2 本次確認的 Sample Plane 介面>'
echo "$LINUX1_SAMPLE_IP $LINUX2_SAMPLE_IP $LINUX1_SAMPLE_IFACE $LINUX2_SAMPLE_IFACE"
```

**通過：**`echo` 印出四個值。

**注意：**變數只活在目前的終端機。開新終端機或重開機 → 重新輸入。

---

## Step 1 檢查 Sample Plane

**目標：**回答一個問題：**兩台主機有沒有本實驗需要的基本網路條件？**

**注意：**位址、路由、ping 三項都過了，也還不能判定 LTE／eMBMS 成功。

### 1.1 看位址在不在

**在哪台：Linux1**

```bash
ip -4 -o address show dev "$LINUX1_SAMPLE_IFACE"
```

**在哪台：Linux2**

```bash
ip -4 -o address show dev "$LINUX2_SAMPLE_IFACE"
```

**通過：**Linux1 的介面上有 `$LINUX1_SAMPLE_IP/24`，Linux2 的介面上有 `$LINUX2_SAMPLE_IP/24`。

**停：**介面不存在、位址衝突，或不確定位址是誰設的 → 通知 Instructor。不要拿名稱相近的其他介面頂替。

### 1.2 沒有位址才加

**目標：**只有在該台**還沒有**所需位址、且已確認可以照本實驗設定時，才執行。

**在哪台：Linux1**

```bash
sudo ip address add "${LINUX1_SAMPLE_IP}/24" dev "$LINUX1_SAMPLE_IFACE"
```

**在哪台：Linux2**

```bash
sudo ip address add "${LINUX2_SAMPLE_IP}/24" dev "$LINUX2_SAMPLE_IFACE"
```

**注意：**這是暫時的位址，不建立 persistent network profile。

**參考：**歷史事件曾回報介面重新枚舉後 Sample Plane 位址消失；介面重新出現時，照 [卡住了](#卡住了error-receiving-samples)
檢查並通知 Instructor。

接著確認位址與前往另一台的路由：

**在哪台：Linux1**

```bash
ip -4 -o address show dev "$LINUX1_SAMPLE_IFACE"
ip route get "$LINUX2_SAMPLE_IP"
```

**在哪台：Linux2**

```bash
ip -4 -o address show dev "$LINUX2_SAMPLE_IFACE"
ip route get "$LINUX1_SAMPLE_IP"
```

**通過：**位址在預期介面上；route 選用對應的 Sample Plane 介面與來源位址。

**注意：**route 輸出只說明本機**打算**怎麼送，不代表封包已到另一端。

### 1.3 兩個方向各 ping 一次

**在哪台：Linux1**

```bash
ping -c 3 -I "$LINUX1_SAMPLE_IP" "$LINUX2_SAMPLE_IP"
```

**在哪台：Linux2**

```bash
ping -c 3 -I "$LINUX2_SAMPLE_IP" "$LINUX1_SAMPLE_IP"
```

**通過：**兩個方向都收到另一端的回應。

**記錄：**記錄實際封包數、loss 與時間，不用預期值代替。

**停：**任一項不符預期 → 停止，交給 Instructor 判斷。

**注意：**雙向回應只支持「檢查當下」的 host-to-host Sample Plane ICMP connectivity；**不代表** ZeroMQ sample flow、LTE attach
或 eMBMS 已通。

---

## Step 2 依序啟動 EPC → MBMS-GW → eNB → UE

**目標：**開 **四個**終端機，每個程式留在前景跑（不要串成背景工作），順序是 **EPC → MBMS-GW → eNB → UE**。
分開跑才能記下每個元件的輸出，停止時也能確認各自有沒有退出。

**為什麼每次都要先 `cd /etc/srsran/lab02`？**

- Lab02 用自己的設定資料夾，不用 Lab01 的 `/etc/srsran/*.conf`。
- `enb.conf` 用相對路徑引用 `sib.conf`、`rr.conf`、`rb.conf`；先 `cd` 才會讀到這個資料夾裡的 **MBSFN 版** `sib.conf`。
- **注意：**資料夾裡缺檔時，srsRAN 可能改讀其他位置的同名檔（例如 Lab01 的 `/etc/srsran/sib.conf`）：看起來能啟動，
  但不會有 SIB13。所以由 Instructor 確認檔案都在；你不自己補檔或複製。

### 2.1 啟動 EPC

**在哪台：Linux1 終端機 1**

```bash
cd /etc/srsran/lab02
sudo /usr/local/bin/srsepc /etc/srsran/lab02/epc.conf
```

### 2.2 啟動 MBMS-GW

**在哪台：Linux1 終端機 2**（EPC 已開始後）

```bash
cd /etc/srsran/lab02
sudo /usr/local/bin/srsmbms /etc/srsran/lab02/mbms.conf
```

### 2.3 啟動 eNB

**在哪台：Linux1 終端機 3**（Instructor 指示的前置程序已開始後）

```bash
cd /etc/srsran/lab02
sudo /usr/local/bin/srsenb /etc/srsran/lab02/enb.conf
```

### 2.4 啟動 UE（同時開始錄自己的 capture）

**為什麼現在要確認 capture：**之後要分析的是**你這次** Runtime 產生的封包，所以 UE 啟動前，Instructor 要先確認
`/etc/srsran/lab02/ue.conf` 有這段設定（你不改它）：

```ini
[pcap]
enable = mac
mac_filename = /tmp/ue_mac.pcap
```

**參考：**這是 recovered 2026 Session B 用的設定。srsUE 會直接把 MAC capture 寫到 Linux2 的一般檔案 `/tmp/ue_mac.pcap`
（格式 User DLT 149）。**不需要**建立 FIFO／named pipe，也不需要 Wireshark 在 Runtime 中即時讀取。

**在哪台：Linux2 終端機**（eNB 開始後）

```bash
cd /etc/srsran/lab02
sudo /usr/local/bin/srsue /etc/srsran/lab02/ue.conf
```

**記錄：**四個程式各自的實際啟動、錯誤或中止訊息。

**注意：**命令沒有立刻回到 shell，**不足以**標記成功。

**參考：**歷史 session 回報四個元件曾成功建立，但 Repo 沒有保存所有元件通用的逐字就緒訊息（literal readiness log line）。

**現在還不要分析 capture：**UE 執行期間會一直寫入，檔案還沒完成。做完後面的實驗、依 [Step 6](#step-6-受控停止)
停止 UE、等 srsUE 退出且檔案寫完，再到 [Step 7](#step-7-分析自己的-capture) 離線分析。
Session B 的封包數與檔案大小只是歷史參考，不是驗收標準。

---

## Step 3 記錄 attach 與 eMBMS

**目標：**回答：**UE 有沒有完成 attach？eMBMS service 有沒有被接受？**這要看實際 Runtime 輸出，不能從 Step 1 的 ping
或「設定檔存在」推出來。

**在哪台：Linux2 UE 終端機**、**Linux1 MBMS-GW／eNB 終端機**：

- [ ] **記錄：**UE attach 的明確輸出行與時間
- [ ] **記錄：**eMBMS service acceptance 的實際輸出行與時間
- [ ] **記錄：**實際 UE interface／address（不要用歷史位址代替）

**在哪台：Linux2** 可以這樣查位址：

```bash
ip -4 -o address show dev tun_srsue
```

**停：**Instructor 還沒指定這堂課要記的成功訊息 → 照實抄錄你看到的，請 Instructor 判讀；**不要自己發明成功字串或寫 PASS**。

**注意：**查介面位址本身，不證明 attach／eMBMS 成功。

<details>
<summary>為什麼沒有固定的「成功字串」？</summary>

Teaching Extension TER 保存了 Human-reported attach 與 eMBMS service establishment，但沒有保存完整 raw log，
也沒有適用每次實驗的通用 acceptance 字串。所以「歷史上語義上有成功」有紀錄，但「逐字成功標記」還沒確立。

</details>

---

## Step 4 多播文字測試 LAB02_SHARK_1

**目標：**用一段好比對的文字，看 marker 有沒有從 Linux1 經 multicast／UE 路徑到 Linux2。這一步只做 multicast sanity；
影片和協定觀察另外做。

**1）先開接收端**　在哪台：Linux2

```bash
socat -u UDP4-RECV:3456,bind=239.255.1.1,ip-add-membership=239.255.1.1:tun_srsue -
```

**2）再開傳送端**　在哪台：Linux1

```bash
socat -u - UDP4-DATAGRAM:239.255.1.1:3456
```

**3）在傳送端輸入這段文字，按 Enter：**

```text
LAB02_SHARK_1
```

**通過：**Linux2 顯示相同的 marker。

**記錄：**兩端的實際文字與時間。**沒看到相同文字，就不記成功。**

**注意：**marker 到了，**不代表**完整 eMBMS protocol chain、video decode、播放品質、throughput 或 capacity。

**參考：**Teaching Extension TER 把該次 marker 到達記為 Human-reported multicast E2E sanity；你的結果要由你自己兩端的紀錄支持。

---

## Step 5 接收測試影片

**目標：**加上應用端的可見結果：FFmpeg 產生測試影片，以 MPEG-TS 送出；UE 側用 `socat | ffplay` 接收播放。
流程：**FFmpeg → MPEG-TS → eMBMS → socat | ffplay**。成功與否看實際畫面和訊息。

**1）先開接收端**　在哪台：Linux2（先開，免得 sender 開始時 receiver 還沒加入 multicast group）

```bash
socat -u UDP4-RECV:1234,bind=239.255.1.1,ip-add-membership=239.255.1.1:tun_srsue - | ffplay -
```

**2）再開 FFmpeg 傳送端**　在哪台：Linux1

```bash
ffmpeg -re -f lavfi -i "testsrc2=size=320x180:rate=15" -vcodec libx264 -preset ultrafast -tune zerolatency -b:v 200k -maxrate 200k -bufsize 400k -g 15 -f mpegts udp://239.255.1.1:1234
```

**注意：**`200k` 是命令設定的 video bitrate **目標**，不是實測 throughput、eMBMS capacity，也不是保證的接收速率。

<details>
<summary>為什麼用這組參數？</summary>

這是 recovered 2026 bounded working profile（有界的可工作實驗參數）。舊教材的 1 Mbps 不作本手冊推薦 profile；
也不能從這兩種嘗試推導 bitrate causality（位元率因果關係）或容量門檻。

</details>

### 5.1 記錄畫面和同時出現的錯誤

**通過：**Linux2 的 ffplay 視窗可以顯示 test-pattern 畫面；終端機會顯示實際辨識到的 media metadata 與 warning／error。

**記錄：**看到畫面時，**一起記下**：當下畫面、時間、同時出現的訊息。不要只寫「成功」。

**記錄：**看到 `Packet corrupt`、`Invalid NAL unit`、macroblock 或 decode／concealment 警告 → 照實記錄。

**畫面和錯誤可以同時存在。**不能把「看得到畫面」寫成 stream integrity PASS。

**注意：**單張照片**不代表**持續動態播放、播放時長、長時間穩定或無錯誤傳送。

<details>
<summary>**參考：**歷史例子：那張 ffplay 照片代表什麼</summary>

歷史 Teaching Extension 後續的有界檢查中，有一張操作者提供的照片：ffplay 顯示 test-pattern frame，終端機辨識
MPEG-TS／H.264、320×180、15 fps，同時顯示 packet corruption 與 decoder warnings。

照片支持「該 session／設定下、拍攝當下」有 end-to-end observable application result。Runtime 操作仍屬 Human-reported；
照片不是編寫者獨立操作主機的證據。

</details>

### 背景：MIB、SIB1、SIB2、SIB13（Step 7 會用到）

| 名稱 | 是什麼 | 在本 Lab 的地位 |
| --- | --- | --- |
| MIB | 主資訊區塊，系統資訊的基礎區塊之一 | 背景概念；**不是**已確認的 Lab02 capture 成功觀察 |
| SIB1 | cell access 與 system-information scheduling 相關資訊 | 背景概念；**不是**已確認的 Lab02 capture 成功觀察 |
| SIB2 | common radio resource configuration 等資訊 | **參考：**Reference Capture Frame 3 中與 SIB3、SIB13 同列於解碼出的 SystemInformation |
| SIB13 | 與 MBMS／MBSFN 相關（MBMS：多媒體廣播多播服務；MBSFN：多媒體廣播多播單頻網路） | **參考：**Reference Capture Frame 3 解碼出 SIB13 與 MBSFN／MCCH configuration |

**注意：**MIB／SIB1 只能當概念講解，不能登記為目前證據已確認的 Lab02 成功觀察。Frame 3 是參考例子，不是每位學生的
Runtime 都一定會出現。

---

## Step 6 受控停止

**注意：**這是**保守建議**，不是已驗證的歷史 shutdown sequence。Teaching Extension TER 只保存「操作者回報完成 shutdown」，
沒有可逐步驗證的完整順序，也沒有由 Codex 獨立確認停止後的程序狀態。

**目標：**在各自的前景終端機依序停止，等每個程式退出：

1. **在哪台：Linux1**：FFmpeg sender 按 `Ctrl-C`（停止新的 video datagrams）。
2. **在哪台：Linux2**：video receiver／ffplay pipeline 和 multicast sanity receiver 按 `Ctrl-C`。marker sender 如果還在跑，也在它的終端機停掉。
3. 反向順序 **UE → eNB → MBMS-GW → EPC**，在各自終端機按 `Ctrl-C`。等每個程式退出，**記錄：**記錄結果。
4. 不用 `killall -9` 當正常停止方式。程式沒退出或終端機狀態不明 → 通知 Instructor，不自己強制結束。
5. Runtime 停完後，**只有**本次確定新增的 temporary Sample Plane 位址，在 Instructor 確認後才移除。
   來源不明或原本就有的位址不要刪。

**在哪台：Linux1**

```bash
sudo ip address del "${LINUX1_SAMPLE_IP}/24" dev "$LINUX1_SAMPLE_IFACE"
```

**在哪台：Linux2**

```bash
sudo ip address del "${LINUX2_SAMPLE_IP}/24" dev "$LINUX2_SAMPLE_IFACE"
```

6. 檢查兩台目前的 Sample Plane 位址，**記錄：**記錄實際結果。

**注意：**不要把這個建議寫成「歷史 session 曾逐項執行」「已由 Codex 驗證」「零殘留程序」或「目前已停機」。

**通過：**UE 退出、capture 寫完，才進 Step 7。

---

## Step 7 分析自己的 capture

### 7.1 先開你自己的檔案

**目標：**你的主要協定觀察材料，是 Step 2.4 之後由**你這次** UE Runtime 產生的 `/tmp/ue_mac.pcap`。

**在哪台：Linux2**（確認 srsUE 已退出、檔案寫完後）

```bash
ls -l /tmp/ue_mac.pcap
```

**注意：**`ls -l` 只是看檔案資訊；檔案存在或大小**不是**成功判準。封包數與大小沒有固定門檻，也不需要和 Session B 一樣。

在 Wireshark **離線**開啟你的檔案，依序設定 decoder：

1. 把 User DLT `149` 對應到 UDP。
2. 啟用 `mac_lte_udp`，讓 MAC／RLC／RRC payload 可以被解碼。
3. 要直接解碼 MTCH 時，再啟用 `Call RLC dissector MTCH LCIDs`。

**注意：**Wireshark GUI 版本與選單位置尚未確認；上面是**設定名稱**，不是固定版本的選單導引。Live Wireshark attachment 不是必要條件。

**停：**還沒解碼成功 → 先記錄「decoder 尚未配置」的狀態。

**注意：**零筆 filter match 或 decoder 錯誤，**不證明**協定不存在，也不單獨證明 capture 損壞。

**舊流程提醒：**`mkfifo /tmp/ue.pcap.pipe` 加 live Wireshark 是 legacy workflow，不是 2026 Session B 的
current procedure。本手冊不要求建立 FIFO 或即時讀取。

### 7.2 參考檔只能幫你「認得」

**參考：**Instructor 可能提供 **Lab02 Reference Capture**：B.3D／B.3D.1 用的 finalized Session B UE MAC PCAP。
用途只限 Instructor 示範、decoder 對照、troubleshooting comparison 或離線教學備援。

**注意：**它**不能**代替你的 Runtime capture，也不能把參考檔的結果登記成你這次的結果。
下面的 Frame 3／22／41 都只指這份 Reference Capture；你的 frame number、packet count 與內容不必相同。

### 7.3 三個問題分開回答

SIB13 → MCCH → MTCH 是**閱讀封包的順序**，不表示三個 frame 已證明完整、連續或有因果關係的 eMBMS 傳輸。

| 觀察 | 要回答的問題 |
| --- | --- |
| SIB13 | System Information 中有沒有 MBMS／MBSFN 相關資訊與 MCCH configuration？ |
| MCCH（多播控制通道） | 有沒有一筆可以認出是 MCCH 的 control-channel observation？ |
| MTCH（多播流量通道） | 有沒有一筆在 RLC-LTE 中解碼為 MTCH 的 downlink observation？ |

**注意：**MCH（多播傳輸通道）、MCCH、MTCH 是不同層次。看到 MCH，不能直接寫成已觀察到 MCCH 或 MTCH；三項都要有各自的封包證據。

### 7.4 SIB13：先看系統資訊

**找：**LTE RRC SystemInformation 裡的 SIB13；展開解碼樹，留意 `sib13-v920`、MBSFN area information 與 `mcch-Config-r9`。

**參考：**Frame 3 顯示 `SystemInformation [ SIB2 SIB3 SIB13 ]`，解碼樹可見 SIB13、MBSFN area information 與
MCCH configuration。這是 screenshot-based direct decode（以提供的截圖支持的直接解碼觀察），只代表 Reference Capture。

**代表：**在這份 capture 中，SIB13 的 MBMS／MBSFN 資訊及 MCCH configuration 可以被解碼觀察到。

**不代表：**已觀察到 MCCH SDU、MTCH 已解碼、UE 收到應用資料或出現可視播放。

### 7.5 MCCH：另外認出控制側

**找：**封包裡明確的 MCCH 標示。不要只因為有 MCH 或 MCH Scheduling Information 就記成 MCCH。
（SIB13 裡看到 MCCH configuration，和在封包中認出 MCCH 是兩件事。）

**參考：**Frame 22 的 observation 記錄 MCH tree、2-byte MCH Scheduling Information，以及 16-byte MCCH SDU。

**代表：**Reference Capture 的 Frame 22 被回報解碼為 MCCH SDU；這項觀察和 Frame 3 分開記錄，不能只靠 MCH 存在取代。

**不代表：**MCCH 完整內容或完整服務控制流程，也不單獨證明 MTCH 或應用資料到達 UE。

<details>
<summary>為什麼 Frame 22 標成 <code>REPORTED_ONLY</code>？</summary>

保存的來源是人員提供的 Wireshark observation；所選 frame 的 screenshot 或 raw decoder export 沒有存入 Repo。
這個標記表示「可複核的來源形式」，不表示 MCCH 在 capture 中不存在，也不能改標為 screenshot-backed direct evidence。

</details>

### 7.6 MTCH：看 RLC-LTE 的下行解碼

**找：**RLC-LTE 是否明確標示 MTCH。只看到 MCH SDU 或 LCID 數值時，不能只靠那個數值判定 MTCH。
（MTCH 是流量通道側的觀察；Frame 22 的 MCCH 不能當作 Frame 41 的 MTCH 證據。）

**參考：**啟用 `Call RLC dissector MTCH LCIDs` 後，Frame 41 直接解碼為 RLC-LTE downlink UM MTCH；樹中顯示
Channel Type `MTCH (8)`、Channel ID 0、PDU Length 45（UM = Unacknowledged Mode，非確認模式）。這項結果由提供的截圖支持。

**代表：**套用該 RLC dissector 設定後，這份 Reference Capture 的 Frame 41 可以直接解碼為 MTCH。

**注意：**設定沒啟用時看不到 MTCH decode，不能單獨推論 capture 沒有 MTCH。

**不代表：**MTCH 持續傳送、payload 對應特定影片、影片完整抵達或應用播放成功；每一項都要有自己的證據。

### 7.7 三個參考 frame 一覽

| Reference Capture frame | 觀察 | 來源與限制 |
| --- | --- | --- |
| 3 | LTE RRC SystemInformation 含 SIB2、SIB3、SIB13；SIB13／MBSFN 與 MCCH configuration | screenshot-based direct decode；只代表這份 capture |
| 22 | MCH Scheduling Information 2 bytes；MCCH SDU 16 bytes | 人員提供的 observation；保留 `REPORTED_ONLY`；所選 frame 截圖未存入 Repo |
| 41 | RLC-LTE downlink UM MTCH；Channel Type MTCH (8)，Channel ID 0，PDU Length 45 | screenshot-based direct decode；需啟用 `Call RLC dissector MTCH LCIDs`；只代表這份 capture |

**先記你自己 capture 實際解碼到的 frame 與內容**，再用參考檔幫助辨認。

**注意：**三個例子來自同一份 finalized capture，各自支持有界的 SIB13、MCCH、MTCH observation；單一 capture 不能推論每次
Runtime 都一樣，也不證明連續 MCH／MCCH／MTCH、完整 eMBMS pipeline、visible playback、throughput、capacity 或長期穩定。

---

## Step 8 整理結論

**目標：**報告以**你自己實際看到的結果**為主體；歷史紀錄與 Reference Capture 只當對照，來源不要混寫。

| 證據 | 可以支持 | 不支持 |
| --- | --- | --- |
| **參考：**歷史 UE attach／eMBMS service runtime report | 2026 Teaching Extension 操作者回報該次 attach 與服務建立 | 本次文件工作重新驗證、通用逐字成功標記或跨 session 成功 |
| `LAB02_SHARK_1` | 該次回報的 marker 到達 Linux2；你的結果要由你自己的紀錄支持 | 單靠 marker 證明完整 eMBMS 協定、影片、throughput 或 capacity |
| 你自己的 UE MAC capture | 本次 Runtime 檔案中實際解碼到的內容（依你的紀錄與 decoder 設定） | 每次都有相同封包、只有設定就算觀察到協定，或效能結論 |
| **參考：**Reference Capture Frame 3／22／41 | 一份既有 capture 的代表性觀察，分別保留 direct／reported 來源 | 代替你的 Runtime 證據、每次相同封包、連續 MCH／MCCH／MTCH、應用播放或效能 |
| **參考：**歷史 bounded ffplay photo | 指定 session／設定下拍攝當下可見 test-pattern，屬端到端可觀察應用結果 | 長時間穩定、無 packet／decode errors、無損 delivery、throughput、capacity 或 bitrate threshold |

**注意：**本實驗**沒有**建立 capacity／performance benchmark、長時間穩定性、bitrate causality、USB hardware root cause
或 UE → EPC latency root cause。這些未知不能用背景概念、舊教材或一次成功觀察補上。

---

## 卡住了：Error receiving samples

**這是症狀，不是原因。**`srsUE` 重複顯示 `Error receiving samples`，代表程式當下回報 sample receiving 錯誤；
訊息沒有指出是哪個元件或原因。**注意：**不能直接判定 srsRAN 有 bug，也不能判定 USB Ethernet adapter 壞了。

**先做：**
1. **記錄：**記下錯誤時間，以及兩台當時的介面／Sample Plane 狀態。
2. 暫停後續 LTE／eMBMS 的成功判讀。
3. 照下面 A → D 做**唯讀**檢查。

**注意：**這些是檢查建議，不是已驗證的 repair procedure。

**提示：**先查 Sample Plane，是因為它比 LTE attach／eMBMS 更低層、容易核對；**參考：**歷史事件曾同時回報位址不見與此錯誤。
這是先查它的理由，**不能**推廣成每次都是 Sample Plane 引起。

### A. 位址還在嗎？

**在哪台：Linux1**

```bash
ip -4 -o address show dev "$LINUX1_SAMPLE_IFACE"
```

**在哪台：Linux2**

```bash
ip -4 -o address show dev "$LINUX2_SAMPLE_IFACE"
```

**目標：**`$LINUX1_SAMPLE_IP/24` 是否還在 Linux1 的 `$LINUX1_SAMPLE_IFACE`；`$LINUX2_SAMPLE_IP/24` 是否還在 Linux2 的 `$LINUX2_SAMPLE_IFACE`。

**停：**缺少，或出現在別的介面 → 只能說目前本機設定與預期不符；記錄並停止，交給 Instructor。

**注意：**位址還在，也不代表另一端可達、ZeroMQ 或 LTE／eMBMS 正常。

### B. 路由選對了嗎？

**在哪台：Linux1**

```bash
ip route get "$LINUX2_SAMPLE_IP"
```

**在哪台：Linux2**

```bash
ip route get "$LINUX1_SAMPLE_IP"
```

**目標：**Linux kernel 目前選哪個介面與 source address 前往 peer。

**通過：**選用對應的 Sample Plane 介面與來源位址。不符 → 記錄並停止。

**注意：**route selection 只說明本機的選擇，不證明封包已抵達或收到回應。

### C. 兩個方向 ping 得通嗎？

**在哪台：Linux1**

```bash
ping -c 3 -I "$LINUX1_SAMPLE_IP" "$LINUX2_SAMPLE_IP"
```

**在哪台：Linux2**

```bash
ping -c 3 -I "$LINUX2_SAMPLE_IP" "$LINUX1_SAMPLE_IP"
```

**目標：**兩端各自送 ICMP echo；只測一個方向不足以記錄雙向結果。

**通過：**兩方向都有回應 → 支持「當下」主機間 Sample Plane ICMP 可用。

**停：**任一方向失敗 → 記錄方向、loss 與時間，標為尚未確認，停止後續成功判讀。

**注意：**ping 不證明 ZeroMQ sample flow、LTE attach、eMBMS service 或應用路徑成功；錯誤發生**之後**才做的 ping，
也不能回推錯誤當時的連通性。

### D. 介面曾經變動？看主機日誌

介面曾消失、改名、重新出現，或位址無故不見時，查涵蓋症狀時間的 kernel 與 NetworkManager 日誌（systemd 主機）：

```bash
sudo journalctl -k --since "15 minutes ago" --no-pager
sudo journalctl -u NetworkManager --since "15 minutes ago" --no-pager
```

- 錯誤早於 15 分鐘前 → 把 `--since` 調整到涵蓋已記錄的錯誤時間。
- 服務名稱或日誌工具不同 → 請 Instructor 指示對應的唯讀查詢。

**目標：**kernel log 有沒有 device disconnect、interface unregister 或 re-enumeration；NetworkManager log 用來對照介面與
network profile 後續的變化。

**記錄：**記下找到的事件與時間，交給 Instructor 評估。

**注意：**時間順序只補充「發生過哪些 host event」，不能直接變成因果結論。單一 log event 不證明 adapter hardware failure、
driver／kernel bug、srsRAN bug 或完整 root cause。沒找到 log entry 也不證明沒有事件；先確認時間範圍與日誌是否可用。

**參考：**歷史紀錄中，NetworkManager profile reactivation 出現在 kernel device event 之後；它不是已確立的 USB disconnect 原因。

### 一張表看懂 A～D

| 觀察 | 可以支持 | 不能支持 |
| --- | --- | --- |
| 位址在預期介面 | 該主機當下有對應的本機 Sample Plane 位址 | peer 可達、sample flow 或 LTE／eMBMS 正常 |
| `ip route get` 選用預期介面與 source | 本機對 peer 的路由選擇符合預期 | 封包已抵達 peer 或收到回應 |
| 兩方向 ping 都有回應 | 檢查當下有雙向主機間 ICMP 回應 | ZeroMQ、LTE attach、eMBMS 或應用路徑正常 |
| 日誌記錄 disconnect 或 re-enumeration | 該時間範圍記錄了裝置／網路事件 | adapter 已壞、完整根因，或事件必然造成此錯誤 |

### 出現下面任何一項，就停手通知 Instructor

保存時間、主機、命令結果與相關日誌範圍，停止自己排查：

- 位址不見、在非預期介面，或介面消失／改名／重新枚舉。
- 路由沒選用預期介面／來源位址，或任一方向 ping 沒有回應。
- 日誌出現 USB Ethernet disconnect／re-enumeration，或狀態與紀錄對不起來。
- 位址、路由、ping 都正常，但錯誤還是一直出現。

**停：**不要因為這個症狀自己重啟整套 Runtime、修改 persistent network 設定或交換 adapter。

<details>
<summary>**參考：**歷史事件的界線（不是可以照做的修復指令）</summary>

- 一筆 Human-reported incident 記錄 Sample Plane 位址遺失與 `Error receiving samples`；另一段 supplied log chronology
  記錄 Linux2 USB Ethernet disconnect／`cdc_ether` unregister／re-enumeration。底層 USB disconnect cause 仍為
  `UNLOCALIZED`（尚未定位），沒有 adapter swap／A-B isolation evidence，不能寫成 USB 網卡已壞，也不能推廣為所有同症狀的原因。
- 該次紀錄另回報 Sample Plane host connectivity 恢復後，ZMQ／LTE 沒有自動恢復；後來的 controlled eNB／UE restart
  與 attach、user plane、多播恢復屬於 **Human-reported historical sequence**。這是「各層要分別觀察」的例子，
  不是學生可以照做的修復指令。
- 即使基本 Sample Plane 檢查通過，仍需 Instructor 指示後續 Runtime evidence 才能判斷 LTE／eMBMS。

</details>

---

## 審閱附註（給 Instructor／Reviewer，學生可跳過）

以下供 Instructor／Reviewer 追溯來源。正文已保留會影響學生判讀的限制；附註不把這份 candidate 提升為已接受的
canonical artifact。

- 狀態與歷史摘要：[Lab02 README](README.md)、[PROGRESS.md](../../PROGRESS.md)。README 的歷史待確認項目不直接轉為本手冊的操作流程。
- 命令與順序：原 [Student Manual](student-manual.md) 保存任務交接恢復的 2026 procedure context；本次排版未重跑。
- 啟動、attach、多播與影片：[Teaching Extension TER](../../docs/evidence/task-evidence/2026-09-26-lab02-teaching-extension-runtime.yaml)，TE-01／TE-02 為操作者回報；後續 TE-06 照片支持當下畫面及同時存在的錯誤。照片於任務脈絡檢視，未存入 Repo。TE-05／TE-07 shutdown 為回報，非獨立程序狀態檢查。
- Sample Plane 症狀與日誌：[Sample Plane USB incident TER](../../docs/evidence/task-evidence/2026-09-26-lab02-sample-plane-usb-incident.yaml)，SPI-01 為位址缺少與症狀的回報，SPI-02 為歷史恢復順序，SPI-03／SPI-04／SPI-05 保留事件時序與 `UNLOCALIZED` 根因。原始 host logs 未存入 Repo。
- 位址、路由與雙向 ping 的有界觀察：[B.1 core Runtime bring-up TER](../../docs/evidence/task-evidence/2026-09-25-lab02-b1-core-runtime-bring-up.yaml)。基本網路結果只適用於檢查時間窗。
- Reference Capture：[B.3D TER](../../docs/evidence/task-evidence/2026-09-26-lab02-b3d-sib13-mcch-mtch.yaml)，B3D-01／B3D-03 為 screenshot-based direct decode，B3D-02 保留 `REPORTED_ONLY`。來源截圖屬任務脈絡證據，未封存於 Repo；本次未開啟或重新解碼 PCAP。
- Decoder：[B.3D.1 TER](../../docs/evidence/task-evidence/2026-09-26-lab02-b3d1-dlt149-decoder-compatibility.yaml)，B3D1-02／B3D1-03 保存 DLT／heuristic 與 MTCH 設定。Wireshark GUI 版本與選單未知；未證明等效 TShark CLI 設定的解碼結果，也未建立版本相容性矩陣。不增列 MCCH 專用 preference 為必需條件。
- 編輯依據：[Style Contract v0.1](student-manual-style-contract-v0.1.md)、[SIB13 → MCCH → MTCH calibration](student-manual-golden-section-sib13-mcch-mtch.md)、[Error receiving samples calibration](student-manual-calibration-error-receiving-samples.md)。
- **v0.2 排版：**內容取自 v0.1，改為「一步一卡」與 `<details>` 收合；章節由 v0.1 的 §1～§13 改為 Step 1～8，`Error receiving samples`（v0.1 §10）移到文末「卡住了」，MIB／SIB 背景（v0.1 §7）移到 Step 5 之後、Step 7 之前。命令、數值與界線未變更；v0.2 未重跑 Runtime。教室位址與 `/etc/srsran/lab02/` 設定資料夾沿用 v0.1 目前內容，兩者皆 `NOT VALIDATED`。

**正式授課前仍需確認：**Instructor 完成主機、工具與 config provisioning，確認 UE MAC-PCAP 設定，並指定 attach／eMBMS
acceptance 的逐字觀察標記；若安排參考示範，另提供標示清楚的 Lab02 Reference Capture。這些缺口不得由舊投影片或推測補寫。
