# Lab02 學生實驗手冊草稿｜LTE eMBMS 多點傳送

- 狀態：`DRAFT / HUMANIZER REVIEW REQUIRED`
- 適用情境：由助教預先準備的兩台 Linux Lab host；Linux1 執行 EPC、MBMS-GW、eNB 與 FFmpeg sender，Linux2 執行 UE 與 receiver。
- 文件性質：本手冊記錄受限的教學流程；它本身不授權 Runtime 操作，也不代表本次文件工作重新執行或驗證了 Runtime。

## 開始階段

開始前請先確認：

- 兩台是核准用於 Lab02 的專用 host，學生已獲得本次實驗所需的 `sudo` 權限。
- `/etc/srsran/epc.conf`、`mbms.conf`、`enb.conf`、`ue.conf` 已由助教準備並確認可用。學生不需在本實驗中修改設定或處理使用者加密。
- 兩台 host 的 Sample Plane 介面名稱與本手冊列出的介面一致；不一致時先停止，由助教協助更新步驟。
- 確認`srsepc`、`srsmbms`、`srsenb`、`srsue`、`socat`、`ffmpeg` 與 `ffplay` 已可用。此手冊不包含安裝步驟；Repo 未固定本次 Teaching Extension 的 OS／工具版本與設定檔雜湊。
- 助教已在 `/etc/srsran/ue.conf` 預先準備 UE MAC-PCAP 設定：`[pcap]` 下為 `enable = mac` 與 `mac_filename = /tmp/ue_mac.pcap`。學生以本次 Runtime 產生的 UE MAC capture 作為主要協定觀察證據；不自行修改設定。
- 若課程需要對照範例或離線備援，導師可另提供標示清楚的 **Lab02 Reference Capture**（B.3D／B.3D.1 使用的 finalized Session B capture）。Reference Capture 不能代替學生自己的 Runtime capture。

若 Gate 未通過，停止並詢問導師及助教。Recovered 2026 commands 是記錄於本手冊的操作脈絡，並非本次重新執行的結果。

## 1. 實驗目的與證據界線

本實驗在預先準備的環境中，依序啟動 EPC、MBMS-GW、eNB 與 UE，觀察 UE attach／eMBMS service，再分別進行 multicast marker sanity 與 FFmpeg MPEG-TS 可視播放檢查。

請全程使用 **Claim ≠ Evidence**：

- 執行一個命令，只證明你執行了該命令。
- 元件啟動輸出不單獨證明 eMBMS user path 或 UE 收到資料。
- `LAB02_SHARK_1` 到達 receiver 是 multicast sanity observation，不是完整 eMBMS／video pipeline 的證明。
- 封包中的代表性 SIB13、MCCH、MTCH observation 不證明每次 Runtime 都會出現。
- ffplay 畫面只支援該次設定下的 bounded visible application result，不代表長時間穩定、無錯誤、throughput 或 capacity。

### 證據來源標籤

- **Recovered procedure context**：2026 Teaching Extension 的命令與操作順序由任務交接提供；本次沒有重跑。
- **Human-reported Runtime**：TER 記錄的 EPC／MBMS-GW／eNB／UE、attach、multicast 與 stream observations。
- **Bounded decoded capture**：B.3D／B.3D.1 對一份既有 UE MAC capture 的離線解碼結果。
- **Background**：用於解釋協定的概念；不是本次 Lab02 成功觀察。

原投影片可參考教學順序與名詞，但不直接沿用舊 Ubuntu／srsLTE 設定、舊截圖、1 Mbps FFmpeg profile 或舊 Wireshark FIFO／named-pipe workflow。MIB／SIB1 保留為 protocol background，不能記為本次已觀察成功。

## 2. Topology 與環境

| 節點 | 本實驗角色 | Sample Plane |
| --- | --- | --- |
| Linux1 | EPC、MBMS-GW、eNB、FFmpeg multicast sender | `10.0.0.1/24`，`enxec9a0c14d482` |
| Linux2 | srsUE、multicast receiver、ffplay | `10.0.0.2/24`，`enxec9a0c14d470` |

`tun_srsue` 是 UE 側的接收路徑。兩個 multicast checks 使用同一 group `239.255.1.1`，但使用不同 UDP port：

- marker sanity：`3456`
- MPEG-TS video：`1234`

UE IP 在歷史回報中先記為 `172.16.0.2/24`，controlled eNB／UE recovery 後另記為 `172.16.0.3/24`。兩者是不同時點的觀察，不是本實驗固定的預期位址；請記錄實際看到的值。

## 3. Sample Plane preflight

### 3.1 先檢查介面與位址

Linux1：

```bash
ip -4 -o address show dev enxec9a0c14d482
```

Linux2：

```bash
ip -4 -o address show dev enxec9a0c14d470
```

若該節點尚無本實驗所需的位址，再執行對應設定命令。若介面不存在、位址衝突，或你不確定位址由誰設定，先停止並通知 Instructor。

### 3.2 設定本次 Sample Plane 位址

Linux1：

```bash
sudo ip address add 10.0.0.1/24 dev enxec9a0c14d482
```

Linux2：

```bash
sudo ip address add 10.0.0.2/24 dev enxec9a0c14d470
```

以上是本次 Sample Plane 的暫時 host address 設定，不建立 persistent network profile。既有 incident 曾回報介面重新枚舉後 Sample Plane address 消失；若介面重新出現，先依第 10 節檢查並通知 Instructor。

再確認位址及 peer route：

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

### 3.3 驗證雙向 Sample Plane connectivity

Linux1：

```bash
ping -c 3 -I 10.0.0.1 10.0.0.2
```

Linux2：

```bash
ping -c 3 -I 10.0.0.2 10.0.0.1
```

**預期觀察：**兩個位址都出現在指定介面；peer route 選用 Sample Plane；兩個方向都收到 peer 回應。記錄實際封包數與 loss，不抄寫預期值代替結果。

**解讀：**以上只確認 host 間 Sample Plane connectivity，不等於 ZeroMQ、LTE attach 或 eMBMS 已通。

## 4. EPC／MBMS-GW／eNB／UE startup

使用四個分開的終端機；每個命令留在前景執行。依序啟動，不要把四個程序串成背景工作。

### 4.1 Linux1：EPC

```bash
sudo /usr/local/bin/srsepc /etc/srsran/epc.conf
```

### 4.2 Linux1：MBMS-GW

確認 EPC 已開始後，在另一個 Linux1 terminal 執行：

```bash
sudo /usr/local/bin/srsmbms /etc/srsran/mbms.conf
```

### 4.3 Linux1：eNB

確認 Instructor 指示的前置程序已開始後，在另一個 Linux1 terminal 執行：

```bash
sudo /usr/local/bin/srsenb /etc/srsran/enb.conf
```

### 4.4 Linux2：Student Runtime Capture 與 UE

由 Instructor 在啟動 UE 前確認 `/etc/srsran/ue.conf` 的 `[pcap]` 區段包含以下設定：

```ini
[pcap]
enable = mac
mac_filename = /tmp/ue_mac.pcap
```

這是 recovered 2026 Session B 使用的設定。學生不修改此設定。UE 啟動後，srsUE 會直接把 MAC capture 寫到 Linux2 的一般檔案 `/tmp/ue_mac.pcap`；格式使用 User DLT 149。這個流程不需要建立 FIFO／named pipe，也不要求 Wireshark 在 Runtime 中即時讀取。

eNB 開始後，在 Linux2 terminal 執行：

```bash
sudo /usr/local/bin/srsue /etc/srsran/ue.conf
```

**預期觀察：**各程序留在運行中的前景終端，並記錄實際啟動、錯誤或中止訊息。Recovered session 回報這四個元件曾成功建立；Repo 沒有保存所有元件可通用的 literal readiness log line。不要只因命令沒有立即返回 shell，就標記該階段成功。

**Capture 時機：**UE 執行期間會持續寫入 `/tmp/ue_mac.pcap`。完成後續實驗並依第 11 節停止 UE；等 srsUE process 退出、檔案完成寫入後，再依第 12 節離線分析。執行期間的檔案可能尚未完成。Session B 的封包數與檔案大小只作歷史參考，不是學生驗收標準。

## 5. UE attach 與 eMBMS acceptance

在 Linux2 UE terminal 及 Linux1 MBMS-GW／eNB terminal 觀察實際輸出：

1. 記錄 UE attach 的明確輸出行及時間。
2. 記錄 eMBMS service acceptance 的實際輸出行及時間。
3. 記錄實際 UE interface／address；不要把歷史 `172.16.0.2/24` 或 `172.16.0.3/24` 當成本次必然結果。

可在 Linux2 查詢 UE interface address：

```bash
ip -4 -o address show dev tun_srsue
```

**證據限制：**Teaching Extension TER 保存 Human-reported attach 與 eMBMS service establishment，但沒有提供可在手冊中固定要求的完整 raw log 或通用 acceptance 字串。因此本節的語義結果有歷史 evidence，literal pass marker 尚未 canonicalize。若 Instructor 尚未指定本課要記錄的成功訊息，學生照實抄錄觀察，不自行創造成功字串或 PASS。

## 6. LAB02_SHARK_1 multicast sanity

此 check 只驗證 marker 是否從 Linux1 經 multicast／UE 路徑到達 Linux2。先在 Linux2 啟動 receiver：

```bash
socat -u UDP4-RECV:3456,bind=239.255.1.1,ip-add-membership=239.255.1.1:tun_srsue -
```

再於 Linux1 啟動 sender：

```bash
socat -u - UDP4-DATAGRAM:239.255.1.1:3456
```

在 sender terminal 輸入以下 marker 後按 Enter：

```text
LAB02_SHARK_1
```

**預期觀察：**Linux2 receiver 顯示相同 marker。記錄兩端實際文字與時間；沒有看到相同 marker 時，不要記為成功。

**解讀：**Teaching Extension TER 將此 marker 的到達記為 Human-reported multicast E2E sanity。它不證明完整 eMBMS protocol chain、video decode、播放品質或 capacity。

## 7. Protocol background：MIB／SIB1／SIB2／SIB13

以下用於認識 LTE system information，不把背景知識混寫成本次成功觀察：

- **MIB：**系統資訊的基礎區塊之一；本手冊不把它列為本次已 canonicalize 的 Lab02 capture observation。
- **SIB1：**提供 cell access／system-information scheduling 相關資訊；本手冊不把它列為本次已 canonicalize 的 Lab02 capture observation。
- **SIB2：**承載 common radio resource configuration 等資訊。Lab02 Reference Capture 的 Frame 3 observation 與 SIB2、SIB3、SIB13 同列於 decoded SystemInformation。
- **SIB13：**與 MBMS／MBSFN 相關。Lab02 Reference Capture 的 Frame 3 直接解碼到 SIB13 及 MBSFN／MCCH configuration；這不是每位學生本次 Runtime 的預期成功紀錄。

MIB／SIB1 可作概念講解；目前 evidence set 不支持把它們記成 Lab02 本次的成功觀察。

## 8. FFmpeg → MPEG-TS → eMBMS → socat｜ffplay

先在 Linux2 啟動 receiver：

```bash
socat -u UDP4-RECV:1234,bind=239.255.1.1,ip-add-membership=239.255.1.1:tun_srsue - | ffplay -
```

再於 Linux1 啟動 FFmpeg sender：

```bash
ffmpeg -re -f lavfi -i "testsrc2=size=320x180:rate=15" -vcodec libx264 -preset ultrafast -tune zerolatency -b:v 200k -maxrate 200k -bufsize 400k -g 15 -f mpegts udp://239.255.1.1:1234
```

這是 recovered 2026 bounded working profile。`200k` 是本命令設定的 video bitrate target，不是 measured throughput、eMBMS capacity 或可保證的接收速率。舊教材的 1 Mbps 值不作為本手冊的推薦 profile。

**為什麼先開 receiver：**先準備接收端，避免 sender 已開始而 receiver 尚未加入 multicast group。

## 9. 預期可視結果與限制

**預期學生觀察：**Linux2 的 ffplay 視窗可顯示 test-pattern 畫面；terminal 可記錄 ffplay 實際辨識的 media metadata 與 warning/error。觀察到畫面時，記錄當下畫面及同時出現的訊息；不要只記錄「成功」。

Teaching Extension evidence 包含 bounded follow-up photo：該照片顯示 ffplay 正呈現 test-pattern frame，terminal 辨識 MPEG-TS／H.264、320×180、15 fps；同時存在 packet corruption 與 decoder warnings。照片能支持該次檢查當下有可見 application output，不證明持續動態播放、長時間穩定或無錯誤 delivery。

若出現 `Packet corrupt`、`Invalid NAL unit`、macroblock 或 decode/concealment warnings，照實記錄。可視畫面與錯誤訊息可以同時存在；不得將可視結果改寫為 stream integrity PASS。

## 10. `Error receiving samples` troubleshooting

若 srsUE 重複出現 `Error receiving samples`，先暫停後續步驟，不要直接歸因於 srsRAN，也不要立即判定 USB Ethernet adapter 損壞。

依下列界線檢查並記錄：

1. 在 Linux1 確認 `10.0.0.1/24` 仍在 `enxec9a0c14d482`；在 Linux2 確認 `10.0.0.2/24` 仍在 `enxec9a0c14d470`。
2. 重新確認 peer route，並依第 3 節確認兩個方向的 Sample Plane connectivity。
3. 記錄 error 發生時間；查看該時段的 kernel 與 NetworkManager logs，留意 USB Ethernet disconnect、介面 unregister、re-enumeration／重新註冊事件。在使用 systemd 的 host，可用以下唯讀查詢：

   ```bash
   sudo journalctl -k --since "15 minutes ago" --no-pager
   sudo journalctl -u NetworkManager --since "15 minutes ago" --no-pager
   ```

   若錯誤早於最近 15 分鐘，將 `--since` 的時間範圍調回已記錄的錯誤時間。若服務名稱或日誌工具不同，請 Instructor 指示對應查詢方式。
4. 若介面消失、重編號或有不確定狀態，停止並通知 Instructor。不要自行重啟全套 Runtime、調整持久網路設定或交換 adapter。

既有 incident TER 記錄到 Linux2 USB Ethernet disconnect／re-enumeration 與 Sample Plane 中斷的時間關聯，但底層原因仍為 `UNLOCALIZED`。NetworkManager 的重新啟用發生在 kernel device event 之後，不因此成為 root cause。這些 troubleshooting steps 是 bounded checks，不是根因判定流程。

## 11. Recommended controlled shutdown

以下是為學生手冊提出的 conservative recommendation，不是已驗證的歷史 shutdown sequence。Teaching Extension TER 只記錄 Human Operator 回報完成 shutdown，沒有保存可 canonicalize 的完整逐步順序。

1. 在 Linux1 FFmpeg sender terminal 按 `Ctrl-C`，停止新 video datagrams。
2. 在 Linux2 video receiver／ffplay pipeline 與 multicast sanity receiver terminal 按 `Ctrl-C`；若 marker sender 仍在執行，也在其 terminal 停止。
3. 依 Runtime dependency 反向順序，在各自前景 terminal 按 `Ctrl-C`：UE → eNB → MBMS-GW → EPC。等待每個程序退出並記錄結果。
4. 不使用 `killall -9` 作為正常停止方式。程序未退出或 terminal 狀態不明時，停止並通知 Instructor，不自行強制終止。
5. Runtime 停止後，只對本次確定新增的 temporary Sample Plane 位址，並在 Instructor 確認後移除：

Linux1：

```bash
sudo ip address del 10.0.0.1/24 dev enxec9a0c14d482
```

Linux2：

```bash
sudo ip address del 10.0.0.2/24 dev enxec9a0c14d470
```

6. 檢查兩台目前的 Sample Plane address，並記錄實際結果。不得將本推薦步驟寫成歷史 session 曾逐項執行或由 Codex 驗證。

## 12. Student Runtime Capture 與離線協定觀察

### 12.1 學生自己的 Runtime capture（主要證據）

本次實驗的主要協定觀察材料，是學生依第 4.4 節設定、由自己這次 UE Runtime 產生的 `/tmp/ue_mac.pcap`。依第 11 節停止 UE 並確認 srsUE process 已退出後，在 Linux2 確認檔案已完成寫入：

```bash
ls -l /tmp/ue_mac.pcap
```

檔案大小與封包數不設固定門檻。請在 Wireshark 中離線開啟自己的檔案，再依下列 decoder 設定檢視實際解碼結果：

1. 將 User DLT `149` 對應至 UDP。
2. 啟用 `mac_lte_udp`，讓 MAC／RLC／RRC payload 可被解碼。
3. 若要直接解碼 MTCH，再啟用 `Call RLC dissector MTCH LCIDs`。

Wireshark GUI 版本與選項位置未由現有證據確認，介面可能不同；本流程不要求在 Runtime 中 live attach Wireshark。若尚未正確解碼，先記為 decoder 尚未配置；零筆 filter match 或 decoder 錯誤不能證明協定不存在，也不能單獨證明 capture 損壞。請記錄自己檔案中實際看到的 frame 與資訊，不要求 frame 編號或內容與範例相同。

舊 Lab1-2 的 `mkfifo /tmp/ue.pcap.pipe` 加 live Wireshark 是 **legacy workflow**，不是 2026 Session B 使用的 current procedure；本手冊不要求照該方式建立 FIFO 或即時讀取 capture。

### 12.2 Lab02 Reference Capture（Instructor 範例）

Instructor 可提供 B.3D／B.3D.1 使用的 finalized Session B UE MAC PCAP，並清楚標示為 **Lab02 Reference Capture**。它的用途是 Instructor 示範、decoder 對照、troubleshooting comparison，或離線教學備援。它是次要參考材料，不能代替學生自己的 Runtime capture，也不能把其中的觀察登記為學生本次實驗結果。

下表中的 frame 編號與內容只適用於 Lab02 Reference Capture：

| Reference Frame | Recorded observation | Evidence provenance 與限制 |
| --- | --- | --- |
| 3 | LTE RRC SystemInformation 含 SIB2、SIB3、SIB13；tree 含 SIB13／MBSFN 與 MCCH configuration | B.3D screenshot-based direct decode；只代表 Reference Capture |
| 22 | MCH Scheduling Information 2 bytes；MCCH SDU 16 bytes | B.3D TER 保存 task-supplied human-reviewed observation；所選 frame 截圖未存入 Repo；保持 `REPORTED_ONLY` |
| 41 | RLC-LTE downlink UM MTCH，Channel Type MTCH (8)，PDU Length 45 | B.3D screenshot-based direct decode；啟用 `Call RLC dissector MTCH LCIDs` 後取得；只代表 Reference Capture |

**解讀：**MCH、MCCH、MTCH 是不同層次的 observation。只看到 MCH 不足以主張 MCCH 或 MTCH；Frame 41 的 MTCH claim 依賴 RLC-LTE decode，而非單靠 LCID 數值。這些代表性封包不證明連續傳送、完整服務成功或應用播放。

## 13. What this lab proves／does not prove

| Evidence | 可支持的結論 | 不支持的結論 |
| --- | --- | --- |
| UE attach／eMBMS service runtime report | 2026 Teaching Extension 中 Human Operator 回報該次 attach 與 service establishment | 本次文件工作重新驗證；通用 literal acceptance marker；跨 session 成功 |
| `LAB02_SHARK_1` | 該次回報的 multicast marker sanity 到達 Linux2 | 單靠 marker 證明完整 eMBMS protocol、video、throughput 或 capacity |
| 學生自己的 UE MAC capture | 該學生本次 Runtime 產生之 capture 中實際解碼到的內容（依其記錄及 decoder 設定） | 每次 Runtime 都有相同封包；只因設定存在就認定協定已觀察；效能 |
| Lab02 Reference Capture Frame 3／22／41 | 一份既有 capture 中的代表性 SIB13／MCCH／MTCH observations，並保留各自的 direct／reported provenance | 代替學生自己的 Runtime evidence；每次 Runtime 都有相同封包；連續 MCH／MCCH／MTCH；應用播放或效能 |
| Bounded ffplay photo | 指定 session／設定下當下可見 test-pattern output；屬 end-to-end observable application result | 長時間穩定、無 packet/decode errors、無損 delivery、throughput、capacity 或 bitrate threshold |

**不可推論：**本實驗沒有建立 capacity／performance benchmark、長時間穩定性、bitrate causality、USB hardware root cause，或 UE → EPC latency root cause。

## Canonical evidence 與待補資料

- Lab02 狀態與 B.3D／Teaching Extension summary：[Lab02 README](README.md)、[PROGRESS.md](../../PROGRESS.md)。
- Sample Plane incident 與 bounded checks：[Sample Plane USB incident TER](../../docs/evidence/task-evidence/2026-09-26-lab02-sample-plane-usb-incident.yaml)。
- UE attach、multicast、video 與可視播放限制：[Teaching Extension TER](../../docs/evidence/task-evidence/2026-09-26-lab02-teaching-extension-runtime.yaml)。
- 封包 observation：[B.3D TER](../../docs/evidence/task-evidence/2026-09-26-lab02-b3d-sib13-mcch-mtch.yaml) 與 [B.3D.1 TER](../../docs/evidence/task-evidence/2026-09-26-lab02-b3d1-dlt149-decoder-compatibility.yaml)。

在供學生正式操作前，Instructor 尚須確認 host／工具與 config provisioning、確保 UE MAC-PCAP 設定已備妥，並指定 attach／eMBMS acceptance 的 literal observation marker。若課程安排參考示範，再另行提供明確標示的 Lab02 Reference Capture；不得以它代替學生自己的 Runtime capture。這些缺口不得以舊投影片或推測補寫。
