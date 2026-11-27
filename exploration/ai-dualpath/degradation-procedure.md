# 路徑 A 劣化注入程序（草案）

[工具與說明](README.md) · [競賽方案](competition-plan.md) · [Lab03 雙路徑工具](../lab03-dualpath-tools/README.md) ·
[Lab03 啟動與停止步驟](../../labs/lab03-urllc/runbook.md) ·
[2026-11-16 TER](../../docs/evidence/task-evidence/2026-11-16-ai-dualpath-ota-policy-comparison.yaml)

狀態：`EXPLORATION / PROCEDURE_DRAFT / METHOD_A_TOOL_RUN_ONCE / HUMAN REVIEW REQUIRED`

本文件整理讓路徑 A（LTE OTA）出現可控劣化的幾種做法，供 Owner 審閱與挑選。
它**不授權**任何 Runtime、RF 或網路操作，也不是已執行事項的證據。除了做法 A 的 `netem_schedule.py`
（2026-11-26 執行過一次，見做法 A），下列指令都沒有在實驗主機上執行過。
每一次執行仍需當次的 Owner 授權，並符合
[Remote Agent Policy](../../docs/engineering/CODEX_REMOTE_AGENT_POLICY.md) 與
[Configuration Governance](../../docs/engineering/CONFIGURATION_GOVERNANCE.md)。
Agent 不輸入密碼、不執行 `sudo`；需要 `sudo` 的步驟由操作者在主機上執行。

## 為什麼只調增益找不到穩態劣化

2026-11-16 的觀察（TER 的 AD-07～AD-11）：eNB 發射增益 59～70 時路徑 A 沒有穩態劣化，58 與 57 只有零星中斷。
55／55 的一次嘗試中核網沒有收到 UE 的訊息；另一次啟動在數秒內 Attach，約 5 秒後出現一次 Radio Link Failure，
之後 5 分鐘紀錄內沒有遺失。穩定與連線異常之間沒有找到穩態劣化的區間。

下列解釋是依 LTE 與 srsRAN 的一般行為所做的**推論**，尚未以本專案的量測驗證（`HYPOTHESIS`）：

- eNB 依 UE 回報的 CQI 調整 MCS。SNR 下降時先反映為吞吐量下降；探測流量只有 128 bytes、間隔 20 ms，
  低 MCS 也足以承載。
- HARQ 與 RLC AM 會重傳解碼失敗的資料。預設承載 QCI 9 在 `rb.conf` 使用 RLC AM，應用層看到的是延遲上升，
  不是遺失。
- 兩層保護用盡之後，同步或控制通道先失效，表現為中斷而不是穩定的掉包率。

另一個未確認事項：TER 記錄當日命令列只觀察到 `--rf.tx_gain` 的覆寫，沒有 `rx_gain` 的覆寫。
接收增益是否曾被調整為 `NOT_VERIFIED`。

## 做法總覽

| 代號 | 做法 | 劣化發生的位置 | 結果應使用的標示 | 需要的變更 |
| --- | --- | --- | --- | --- |
| A | `tc netem` 掛在 TUN 介面 | IP 層，LTE 之外 | `INJECTED_IP` | 執行期間的暫時 qdisc，需 `sudo` |
| B | srsRAN 內建 channel emulator | 基頻樣本，UE 或 eNB 程序內 | `INJECTED_BASEBAND` | 啟動時的命令列參數 |
| C | 固定 MCS，並讓預設承載使用 RLC UM | 真實無線鏈路，移除部分保護 | `OTA_MEASURED`，並註明保護已關閉 | 命令列參數與一份 `rb.conf` 副本 |
| D | 衰減器或接收增益 | 真實無線鏈路 | `OTA_MEASURED` | 硬體或啟動時的命令列參數 |

四種做法都不提高發射功率。提高任何增益仍需先確認屏蔽並取得 Owner 核准，見
[Lab03 啟動與停止步驟](../../labs/lab03-urllc/runbook.md)。

`INJECTED_IP` 與 `INJECTED_BASEBAND` 的結果不得寫成「OTA 劣化」或「無線通道劣化」。
路徑 B 若使用 `--leo-b`，仍是 `SIMULATED`。

## 共同前提與紀錄

- EPC、eNB、UE 已由獲授權的操作者依 Lab03 步驟啟動並 Attach 成功。
- 先在未注入的狀態下錄一段路徑 A 的逐封包紀錄，作為同一天的對照。
- 每段紀錄寫下：UTC 起訖時間、兩個程序的完整命令列、使用的做法與參數、注入排程的起始時間。
- 各策略是依序執行的。要比較策略，每一輪都必須從排程的同一個相位開始，否則各策略面對的劣化不同。
- 以 UTC 對齊兩台主機的紀錄前，先在兩台確認 `timedatectl show -p NTPSynchronized` 為 `yes`。
  2026-11-26 的唯讀檢查（`OBSERVED`）：Linux1、Linux2 都由 `systemd-timesyncd` 向 `ntp.ubuntu.com` 對時且已同步；
  這依賴主機能連上網際網路，只是當日狀態，每次執行前仍要重新確認。未同步時，對齊改用單一主機的時間。
- 結束後依各節的「還原」步驟處理，並依 Lab03 步驟確認沒有殘留程序與介面。

參數名稱已對照 `srsRAN_4G` commit `6bcbd9e5bf8686aa7085202cd847c5ddd64a9c16` 的 `srsenb/enb.conf.example`、
`srsenb/rb.conf.example`、`srsue/ue.conf.example`、`srsenb/src/main.cc` 與 `srsue/src/main.cc`（2026-11-16 讀取）。
實驗主機上執行的 binary 是否由這個 commit 建置，需在執行前另行確認。

## 做法 A：`tc netem`

路徑 A 的探測封包由 Linux2 的 `tun_srsue` 送出，回音由 Linux1 的 `srs_spgw_sgi` 送回。netem 只作用在介面的
送出方向：掛在 `tun_srsue` 影響去程，掛在 `srs_spgw_sgi` 影響回程。只掛一側就足以讓來回探測出現遺失。

`sch_netem` 模組：2026-11-26 兩台主機（kernel 6.8.0-147／149）都有；Linux2 在第一次使用時自動載入，
不需要另外安裝 `linux-modules-extra`。kernel 更新後需重新確認；安裝套件屬於主機變更，需另行授權。

執行前先記錄現況（不需要 `sudo`）：

```bash
tc qdisc show dev tun_srsue
```

固定遺失與抖動（操作者在 Linux2 執行）：

```bash
sudo tc qdisc add dev tun_srsue root netem loss 5% delay 10ms 5ms
```

突發遺失，使用 Gilbert-Elliott 模型（進入壞狀態的機率 1%、離開的機率 10%、壞狀態遺失 70%、好狀態遺失 0.1%）：

```bash
sudo tc qdisc add dev tun_srsue root netem loss gemodel 1% 10% 70% 0.1%
```

隨時間變化的排程。固定的劣化無法區分自適應策略與「只走路徑 B」，所以比較策略時應使用這一種。

比較策略時使用 [`netem_schedule.py`](netem_schedule.py)。排程放在 JSON 檔（範例
[`schedules/example-cycle.json`](schedules/example-cycle.json)：每 60 秒循環一次，40 秒正常、15 秒輕度劣化、
5 秒重度劣化），每次執行都從相位 0 開始，每次切換寫一行帶 UTC 的事件，並記錄排程檔的 SHA-256。
正常結束、Ctrl-C、`SIGTERM`、`SIGHUP` 或任何錯誤都會移除 qdisc 並再讀一次確認；無法確認時以狀態 1 結束，
並在 stderr 印出還原指令。`tc qdisc show` 讀不到狀態（逾時、找不到 `tc` 等，但不是「介面不存在」）時，
清理不執行刪除，同樣以狀態 1 結束。介面不存在、root qdisc 已經是 netem，或執行前就讀不到狀態時，
它不做任何變更就停止。第一次 `tc qdisc add` 被 `tc` 拒絕時也不清理，避免刪掉別人在預檢之後才加上的 netem；
但 `tc` 超過 15 秒沒有回應而被終止時，kernel 可能已經套用，這種情況仍會檢查並移除 root netem。
每個階段至少 0.5 秒。執行中只有第一個 Ctrl-C、`SIGTERM` 或 `SIGHUP` 會中斷排程，之後的訊號在清理完成、
結束狀態確定前都被忽略。

結束狀態：0 正常完成、1 無法確認已移除、2 參數錯誤、3 拒絕執行（未做變更）、4 `tc` 錯誤；
被中斷時為 128 加訊號編號（Ctrl-C 為 130、`SIGTERM` 為 143、`SIGHUP` 為 129），此時 qdisc 已移除。

它不呼叫 `sudo`；`sudo` 由操作者自己加。2026-11-26 已在 Linux2 的 dummy 介面與 `tun_srsue` 上各執行過一次，
確認切換、中斷清理與拒絕覆蓋的行為，見
[2026-11-26 TER](../../docs/evidence/task-evidence/2026-11-26-ai-dualpath-netem-schedule.yaml)。
該次執行的是 SHA-256 `421420b2…` 的版本。之後加入結束狀態、新增失敗時不清理、
階段長度下限與下述參數檢查的版本（`c4c2302`，SHA-256 `b1e17c8f…`）在同日重新於兩種介面上執行，結束狀態
0／129／130／143／2／3、清理與保留他人 netem 皆符合預期（同一份 TER 的 NM-09～NM-13）。讀取失敗（`state_unknown`）
與新增失敗的路徑沒有在主機上觸發，只以替身 `tc` 測試。其後加入的 `add` 逾時處理、相關係數拒絕與訊號處理
（`c4c2302` 之後的版本）同樣只以替身 `tc` 測試。2026-11-27 以 main 上的版本（自 `d6b0e40` 起未變，SHA-256 `1948ced2…`）在 `tun_srsue`
上執行一次 90 循環的長排程並完成七種策略的比較，Ctrl-C 後移除 netem，見
[2026-11-27 TER](../../docs/evidence/task-evidence/2026-11-27-ai-dualpath-netem-policy-comparison.yaml)；
`add` 逾時與相關係數拒絕的路徑仍沒有在主機上觸發。

`tc qdisc change` 不會重設新階段沒寫到的 `rate`、`corrupt`、`reorder`，會沿用上一階段的值。因此排程只要有
任一階段用到其中一個，每個階段都必須寫出它，例如正常階段寫 `loss 0% rate 0`，否則載入排程時就會被拒絕。
`loss gemodel` 則不同：2026-11-27 在 Linux2 的 dummy 介面上，`change … loss 0%` 之後 `tc qdisc show` 不再顯示
`gemodel`（同時 `delay` 也被清除），因此 `comparison-burst.json` 不需要另外寫出重設。
2026-11-26 在 Linux2（kernel 6.8.0-149、iproute2-6.1.0）以 `tc qdisc show` 觀察到這個行為（`OBSERVED`，TER NM-11）：
`change` 成 `loss 5%` 後 `reorder`、`corrupt`、`rate` 都留著，`delay` 被重設。`rate 0`、`corrupt 0%` 等歸零寫法
尚未測試，第一次使用時需確認 `tc` 接受且確實清除。

`loss`、`delay`、`duplicate` 的相關係數（例如 `loss 40% 25%` 的 25%、`delay 40ms 20ms 25%` 的 25%）放在另一個
同樣只在寫出時才送出的屬性，預期也會沿用上一階段的值（`NEEDS_CONFIRMATION`，NM-11 沒有測試相關係數）。
工具一律拒絕帶相關係數的排程；需要突發性遺失時可改用 `loss gemodel` 或 `loss state`。依 iproute2 與 kernel 行為的
理解，這兩種寫法的參數每次寫出都會重送，下一階段沒寫時遺失模型會回到一般的隨機遺失；但這點同樣是
`NEEDS_CONFIRMATION`（NM-11 沒有測試 `gemodel`／`state`），第一次使用前需在主機上以 `tc qdisc show` 確認。

先檢查排程（不需要 `sudo`，不碰介面）：

```bash
python3 netem_schedule.py schedules/example-cycle.json --dev tun_srsue --cycles 3 --dry-run
```

策略比較時，排程只由操作者在 Linux2 啟動**一次**，涵蓋全部執行；控制端的
[`netem_comparison.py`](netem_comparison.py) 經 SSH 讀取排程的事件紀錄，讓每一輪傳送都從某個循環開頭後約 1 秒開始，
跑 `--cycles-per-run` 個完整循環，再空 `--gap-cycles` 個循環給下一輪準備。每個策略因此遇到相同順序的階段，
操作者也只需要執行一次 `sudo`。傳送端與 netem 在同一台主機，兩邊的 `utc` 來自同一個時鐘。

```bash
# 操作者（Linux2）：一次長排程，循環數依 plan 的輸出決定，結束時按 Ctrl-C
sudo python3 netem_schedule.py schedules/comparison-burst.json --dev tun_srsue --cycles <N> \
  --log <dir>/netem-events.jsonl
# 控制端：先看時間表，再執行
python3 netem_comparison.py plan --events-file <dir>/netem-events.jsonl --out <out>
python3 netem_comparison.py run  --events-file <dir>/netem-events.jsonl --out <out> --rounds 3
python3 align_phases.py --events <out>/netem-events.jsonl <out>/r*.sender.jsonl --csv phases.csv --plot phases.png
```

[`schedules/comparison-burst.json`](schedules/comparison-burst.json) 的重度階段使用 Gilbert-Elliott 突發遺失
（`loss gemodel 5% 10% 100% 0%`，平均約 33%，一次連續約 10 個封包）。從 `gemodel` 切回 `loss 0%` 時遺失模型是否回到
一般隨機模式尚未在主機上確認（`NEEDS_CONFIRMATION`），使用前先在 dummy 介面上以 `tc qdisc show` 確認。

`--cycles` 與 `--duration` 必須擇一，避免無限執行；`--log` 指定的檔案已存在時會拒絕覆寫。
兩支傳送端的逐封包 `tx` 事件帶 `utc`（牆上時鐘）；[`align_phases.py`](align_phases.py) 依每個封包第一份副本的送出時間
判斷當時的階段，輸出各策略逐階段的期限內送達比例、副本數與路徑 A 的副本遺失。`netem_comparison.py` 已在本機以替身
`tc` 與 loopback 預演過，尚未在實驗主機上執行。

下面是原本手寫的等效指令，保留作為對照；它不會記錄每次切換，也不會檢查既有的 qdisc。

```bash
sudo bash -c '
  dev=tun_srsue
  trap "tc qdisc del dev $dev root 2>/dev/null" EXIT
  tc qdisc add dev $dev root netem loss 0%
  date -u +"schedule_start %Y-%m-%dT%H:%M:%SZ"
  while :; do
    tc qdisc change dev $dev root netem loss 0%;               sleep 40
    tc qdisc change dev $dev root netem loss 5% delay 15ms 10ms; sleep 15
    tc qdisc change dev $dev root netem loss 40% delay 40ms 20ms; sleep 5
  done'
```

驗證：`tc -s qdisc show dev tun_srsue` 的 `dropped` 計數會增加；`dualpath_demo.py send --mode baseline --json`
的遺失率應接近設定值。

還原：

```bash
sudo tc qdisc del dev tun_srsue root
tc qdisc show dev tun_srsue
```

`tun_srsue` 在 `srsue` 結束時消失，qdisc 也隨之消失；這個設定不會跨重開機保存。
遺失率與延遲的數值是範例，不是建議值，也不代表任何真實鏈路。

## 做法 B：srsRAN 內建 channel emulator

`srsue` 與 `srsenb` 都有 `[channel.dl]` 與 `[channel.ul]` 選項，可以在基頻樣本上加入 AWGN、衰落、延遲，
或週期性的鏈路中斷。依上游原始碼，UE 的 `channel.dl` 作用在收到的下行樣本上（`srsue/src/phy/sync.cc`），
與 RF 裝置種類無關。它不改變天線上的發射功率。

未確認事項（`NEEDS_CONFIRMATION`）：

- 尚未在 B210、50 PRB 的設定下執行；額外的運算是否造成樣本遲到（late 或 overflow）未知。
- `awgn.snr` 是相對於 `awgn.signal_power`（dBFS）計算的，實際得到的 SNR 需以 UE 的訊號量測校正。
- 週期性中斷的 `t_off_ms` 多長會觸發 RRC 重建或重新 Attach 未知，應從短的數值開始。

命令列覆寫不會改動設定檔。在 Lab03 的 UE 啟動指令後加上參數，例如加入雜訊：

```bash
sudo ~/srsRAN_4G/build-usrp/srsue/src/srsue ~/pre-lab03-rf/config/ue.conf --rf.tx_gain=70 \
  --channel.dl.enable=true --channel.dl.awgn.enable=true --channel.dl.awgn.snr=8
```

週期性中斷（每 10 秒正常後中斷 0.2 秒），可提供隨時間變化的劣化：

```bash
sudo ~/srsRAN_4G/build-usrp/srsue/src/srsue ~/pre-lab03-rf/config/ue.conf --rf.tx_gain=70 \
  --channel.dl.enable=true --channel.dl.rlf.enable=true \
  --channel.dl.rlf.t_on_ms=10000 --channel.dl.rlf.t_off_ms=200
```

衰落模型使用 `--channel.dl.fading.enable=true --channel.dl.fading.model=epa5`（上游範例另列 `eva70`、`etu300`）。

還原：停止 `srsue`，以不含 `--channel.*` 的原指令重新啟動。

channel emulator 的參數在 `srsue` 啟動時固定，不能像 netem 一樣在執行中切換。比較時先以
`netem_comparison.py control --name probe-<標籤>` 做單路探測，選定劣化程度後以
`netem_comparison.py series --rounds 3` 依序執行七種策略（同一輪共用路徑 B 的 LEO 種子，可配對分析）。
結果標示 `INJECTED_BASEBAND`。

## 做法 C：固定 MCS 與 RLC UM

目的是讓真實的解碼錯誤傳到應用層，而不是被 link adaptation 與 ARQ 吸收。兩個步驟可以分開試。

**固定 MCS。** `scheduler.pdsch_mcs` 與 `scheduler.pusch_mcs` 預設為 -1（依 CQI 調整）；指定數值後忽略 CQI。
在 Lab03 的 eNB 啟動指令後加上：

```bash
sudo ~/srsRAN_4G/build-usrp/srsenb/src/srsenb enb.conf --rf.tx_gain=60 \
  --scheduler.pdsch_mcs=20 --scheduler.pusch_mcs=16
```

MCS 與增益的數值是起點，不是已知可用的組合。建議先固定增益，由低 MCS 往上調，直到單路探測出現遺失。
MCS 太高時 UE 可能無法完成 Attach。

**預設承載改用 RLC UM。** 預設承載的 QCI 來自 HSS 的訂閱者檔案。該檔案含憑證，位於 Repo 外，本程序不修改它。
替代做法是複製一份 `rb.conf`，把 `qci = 9` 區塊的 `ul_am`／`dl_am` 換成上游範例 `qci = 7` 區塊的
`ul_um`／`dl_um` 內容，再用命令列指向副本：

```bash
cp ~/pre-lab03-rf/config/rb.conf ~/pre-lab03-rf/config/rb-um-experiment.conf
# 編輯副本後：
sudo ~/srsRAN_4G/build-usrp/srsenb/src/srsenb enb.conf --rf.tx_gain=60 \
  --enb_files.rb_config=rb-um-experiment.conf
```

未確認事項（`NEEDS_CONFIRMATION`）：

- Lab03 設定資料夾目前使用的 `rb.conf` 內容，以及 `enb.conf` 中 `rb_config` 的相對路徑寫法。
- QCI 9 搭配 RLC UM 在這個版本的 eNB 與 UE 上能否正常建立承載。
- 改用 UM 後殘餘的遺失率；HARQ 仍會重傳，遺失可能仍然很低。

建立副本屬於主機檔案變更，需 Owner 授權；原本的 `rb.conf` 不動。

還原：停止 `srsenb`，以原指令重新啟動；副本可保留或由操作者刪除，並記錄在當次的紀錄中。

## 做法 D：衰減器與接收增益

- 在天線埠加固定或步進衰減器，比調整軟體增益更容易重現，也不受增益步階的限制。衰減器的頻段要涵蓋
  2560／2680 MHz。現有設備是否有衰減器為 `UNKNOWN`。
- 先確認接收增益是否生效：`srsue` 的 `rf.rx_gain` 預設為 -1（使用 AGC），`srsenb` 預設為 50。
  指定 `--rf.rx_gain=<數值>` 可單獨降低一側的接收增益，不影響發射功率。AGC 開啟時，降低對方的發射增益可能被
  部分補償，這也可能是增益步階看不到穩態劣化的原因之一（`HYPOTHESIS`）。
- 移動天線或加入遮蔽物可以產生隨時間變化的衰落，但難以重現，較適合展示，不適合比較策略。

## 建議的執行順序

這是建議，由 Owner 決定是否採用：

1. 做法 A 的時變排程，用來比較七種策略。它最容易控制與重現，結果標示 `INJECTED_IP`。
2. 做法 B 的週期性中斷或 AWGN，作為更接近無線層的第二組結果，標示 `INJECTED_BASEBAND`。
3. 時間允許時再試做法 C，取得一段 `OTA_MEASURED` 的真實遺失。

每一組都先做單路探測確認劣化程度，再做策略比較；每個策略至少 3 輪，並保留未注入的對照。

## 停止條件

出現下列任一情況時停止注入並還原，記錄現象後回報 Owner：

- UE 脫離或反覆重新 Attach，且移除注入後沒有恢復。
- 主機的管理連線或路徑 B 的有線連線受到影響。
- 介面名稱、位址或程序命令列與預期不符。
- 需要提高任何發射增益、修改訂閱者檔案，或安裝套件才能繼續。

## 完成後的紀錄

執行後的結果應另立 Task Evidence Record，不寫回本文件。本文件只保存程序；
[README](README.md) 的「哪些是量測、哪些是模擬」在取得結果後再更新。
