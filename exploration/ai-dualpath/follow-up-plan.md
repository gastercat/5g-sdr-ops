# netem 比較之後的後續實驗方案（提案）

狀態：`PROPOSAL / NOT AUTHORIZED`。本文件只列出方案，不授權任何 Runtime、RF 或 `sudo` 操作；
是否執行、何時執行由 Owner 決定。12/18 發表前以海報與 Demo 為優先。

**Owner 決定（2026-11-27）：** 發表前做 P0 與 P2（先試週期性中斷），P1、P3 留到發表後。
P0 已完成，見 [P0 重新分析 TER](../../docs/evidence/task-evidence/2026-11-27-ai-dualpath-netem-p0-reanalysis.yaml)。
P2 同日嘗試週期性中斷後中止，改到發表後，見 [P2 TER](../../docs/evidence/task-evidence/2026-11-27-ai-dualpath-p2-channel-rlf.yaml)。

依據：[2026-11-27 TER](../../docs/evidence/task-evidence/2026-11-27-ai-dualpath-netem-policy-comparison.yaml)
（NC-07～NC-10）與 Repo 外 `2026-11-28-AI-Dualpath-netem-comparison/run/phases.csv`。

## 1. 這次結果留下的問題

**重度階段比較的其實是路徑 B 的模擬。** 重度階段的延遲是 40±20 ms，已超過 30 ms 期限，所以只走 A 在三輪都是 0%，
路徑 A 的副本在這段幾乎沒有用。`netem_comparison.py` 每輪使用一個 LEO 種子、七種策略共用（`--leo-seed` 等於輪次），
因此同一輪內各策略的結果很接近只走 B：

| 輪次 | 只走 B | 全部複製 | 門檻規則＋規則層 | LinUCB | LinUCB＋規則層 |
| --- | --- | --- | --- | --- | --- |
| r1 | 41.3% | 40.5% | 40.7% | 42.8% | 43.0% |
| r2 | 62.1% | 62.2% | 64.6% | 63.9% | 65.4% |
| r3 | 9.1% | 8.1% | 7.2% | 7.0% | 8.2% |

（重度階段、30 ms 期限內比例，每格約 750 個封包。）TER 中「重度階段三輪差 7～65%」主要反映三個不同的路徑 B 狀態，
不是同一條件下的隨機雜訊；這個排程無法區分策略在重度階段的好壞。

**其他缺口：**

- 輕度階段自適應策略與全部複製只差約 1～5 個百分點，只有三輪，沒有信賴區間。
- netem 只注入在 UE 上行（`tun_srsue` 送出方向），而且是 IP 層，不是無線層。
- 執行前 Linux2 的 USB 管理網卡掉線（NC-04），原因未確定；長時間比較全程依賴這條連線。
- 輪與輪之間間隔 4 分鐘，UE 可能進入 RRC 閒置，每輪開頭多出連線建立時間（NC-05、NC-09）。

## 2. 方案

依建議順序排列。每一項都另立 TER，結果標示照 [劣化注入程序](degradation-procedure.md#做法總覽) 的規則。

### P0：離線重新分析既有資料（不需要 Runtime）

- 以「輪」為配對單位：同一輪的七種策略面對相同的 netem 排程與相同的路徑 B 種子，可比較每輪內的差值
  （例如各策略減去同輪的全部複製），而不是只看三輪平均。
- 以封包為單位做 bootstrap，為每個階段的期限內比例與差值加上信賴區間。
- 做法：在 `align_phases.py` 加一個配對輸出，或另寫分析腳本；輸入只有既有的 `r*.sender.jsonl` 與 `netem-events.jsonl`。
- 產出：補充分析檔，放在 Repo 外證據目錄；若改變 TER 的結論，另以新的 TER 或 TER 補註記錄，不改寫 NC-10 的原始數字。
- 估計：半天以內，不需要授權。

### P1：做法 A 的加強版（`INJECTED_IP`）

目標是讓重度階段的路徑 A「很差但仍可能在期限內」，策略的選擇才會影響結果。

- 新排程（例）：正常 30 秒 → 輕度 15 秒 → 重度 15 秒，重度改為 `loss gemodel 5% 10% 100% 0% delay 20ms 10ms`。
  數值是起點，需先在 dummy 介面與單路探測確認。
- 每個策略 5 輪（5 個 LEO 種子），維持「同輪共用種子」的配對設計；另加一組固定種子、只換 netem 隨機性的重複，
  區分兩個來源的變異。
- 可選：在 Linux1 的 `srs_spgw_sgi` 加下行 netem，涵蓋回程；需要 Linux1 的 `sudo`，由 Owner 執行。
- 時間：7 策略 × 5 輪 × 每輪 4 分鐘，約 140 分鐘，加上準備與收尾約 3 小時。
- 需要的工具變更：`netem_comparison.py` 增加可指定種子清單與輪間 keepalive（見第 3 節）；改動後先以替身 `tc` 測試。

### P2：做法 B，srsRAN channel emulator（`INJECTED_BASEBAND`）

- 先以單路探測確認 `--channel.dl.rlf`（週期性中斷）或 AWGN 的劣化程度，從短的 `t_off_ms` 開始，
  確認不會造成反覆重新 Attach；未確認事項見 [做法 B](degradation-procedure.md#做法-bsrsran-內建-channel-emulator)。
- channel emulator 的參數在 srsue 啟動時固定，無法像 netem 一樣在執行中切換，因此比較設計為「每種劣化程度各一段」，
  不是時變排程。
- 結果比 P1 更接近無線層，但仍不是 OTA 劣化。
- **2026-11-27 嘗試結果：** eNB 給 UE 的計時器為 `N310=1`、`t310=200 ms`，`t_off_ms=50` 的中斷就觸發 RLF；
  第二次中斷後路徑 A 完全中斷，移除參數後 UE 也無法 Attach，需重啟整組 Runtime。週期性中斷在目前設定下不適合比較。
  發表後若重做，可改用 AWGN（持續劣化、不中斷），或先檢討 eNB 的 RLF 計時器（屬設定變更）。

### P3：做法 C／D（`OTA_MEASURED`）

- 需要先確認是否有涵蓋 2560／2680 MHz 的衰減器（目前 `UNKNOWN`），或接受固定 MCS 與 RLC UM 的設定副本。
- 劣化程度難以重現，較適合作為展示或單一試次的佐證，不適合作為主要的策略比較。

## 3. 執行前的共同前提

- **Linux2 管理網卡：** 換到其他 USB 埠或換一支網卡，或讓 B210 使用外接電源；每次啟動 Runtime 後先觀察 15 分鐘，
  期間定時做唯讀檢查。觀察期掉線即停止，不開始比較。
- **輪間 keepalive：** 在輪與輪之間由 UE 端每秒送一個小封包到 EPC，避免 RRC 閒置；keepalive 封包不計入結果，
  比較開始前停止。
- **授權與紀錄：** 每個遠端、Runtime、RF 動作都需 Owner 當次核准，`sudo` 由 Owner 執行；結束時刪除主機上的工具與紀錄檔；
  結果另立 TER，不寫回本文件。

## 4. 仍需 Owner 決定的事

1. P2 改到發表後：改用 AWGN，或先檢討 eNB 的 RLF 計時器。
2. P1 的排程數值與輪數，以及是否加入下行注入（發表後）。
