# 期限感知的雙路徑傳送策略

[Exploration 入口](../README.md) · [競賽方案](competition-plan.md) · [Lab03 雙路徑工具](../lab03-dualpath-tools/README.md) ·
[Neuro-Symbolic RRM 候選架構](../../docs/research/6g-ntn-handover/neuro_symbolic_rrm_handoff.md)

狀態：`EXPLORATION / APPLICATION_LAYER_ONLY / SIMULATED_PROOF_OF_CONCEPT`

對每個封包決定「走路徑 A、走路徑 B、或兩路都送」，比較各策略在期限內送達的比例與多送的副本數。
這是應用層的 UDP 分流與複製，不是 PDCP 層，不是 nukxURLLC，也不代表符合 3GPP URLLC 或 NTN。
本目錄不形成 Lab01～03 的交付條件，也不授權任何 Runtime 或 RF 操作。

## 哪些是量測、哪些是模擬

| 項目 | 性質 |
| --- | --- |
| 路徑 A 的預設模型 | `MODEL`：由 2026-11-12 OTA Baseline 的摘要統計（最小、中位、p95、最大）取樣，各封包獨立。實際鏈路有排程造成的規律，模型沒有重現 |
| 路徑 A 的劣化時段（`degraded_a`） | `SIMULATED` |
| 路徑 B 的類 LEO 特性 | `SIMULATED`：每 15 秒換一次鏈路、換手後短暫中斷、延遲緩慢變動、高延遲時掉包率升高。不是衛星鏈路、軌道模型或 NTN 實作 |
| `--trace-a` 重播 | 取決於錄製來源；以 `dualpath_demo.py send --json` 在 OTA 上錄到的才是量測 |

`leo_profile.py` 的參數（15 秒、20～45 ms、150 ms 中斷）目前是 `NEEDS_CONFIRMATION` 的假設值，
寫進報告前需補上公開量測文獻的出處，或改成文獻中的數值。

2026-11-12 的紀錄只保存每條路徑的摘要統計，沒有逐封包 RTT，所以目前無法重播該次量測。
要取得可重播的紀錄，需在獲授權的 OTA 執行中以 `dualpath_demo.py send --json` 重新錄製。

## 檔案

| 檔案 | 用途 |
| --- | --- |
| `leo_profile.py` | 路徑 B 的類 LEO 劣化模型，同一個 seed 產生同一條鏈路 |
| `trace_env.py` | 離線環境：先固定每個封包在兩條路徑上的結果，再讓各策略在相同條件下執行。策略只會在回音到達時得知自己送出的副本結果 |
| `policies.py` | 固定策略（只走 A、只走 B、2:3 分流、全部複製）、門檻規則、LinUCB、規則層 `Guarded`，以及不可實作的上界 `Oracle` |
| `evaluate.py` | 多個 seed 下比較各策略，輸出表格；`--out` 另存 CSV 與圖 |
| `adaptive_send.py` | 線上傳送端，沿用 `dualpath_demo.py` 的封包格式與接收端 |
| `test_ai_dualpath.py`、`test_adaptive_send.py` | 單元測試與本機 loopback 測試 |

LinUCB 需要 NumPy，`--out` 的圖需要 matplotlib；其餘只用 Python 標準函式庫。

## 規則層

`Guarded` 依 Neuro-Symbolic RRM 候選架構的分工：策略只提議，規則可以把單一路徑的提議改成兩路都送，
但不會移除副本。目前有兩條規則：

- `dead`：被提議的路徑已連續 3 個副本遺失或逾期。
- `probe`：另一條路徑超過 1 秒沒有任何回音，統計已過時。

每次改寫都會計數，並列在輸出裡。

## 離線比較

```bash
python3 evaluate.py
python3 evaluate.py --deadline 50 --seeds 10 --out /tmp/ai-dualpath
python3 evaluate.py --trace-a run.jsonl
```

輸出第一行會標示 `SIMULATED_PROOF_OF_CONCEPT` 與路徑 A 的來源。相同參數重跑會得到相同數字。

## 線上執行

本機預演（兩條路徑都是 loopback，路徑 B 加上模擬）：

```bash
python3 ../lab03-dualpath-tools/dualpath_demo.py echo --json --bind 127.0.0.1 --duration 60 > /dev/null &
python3 adaptive_send.py --policy linucb+guard --dst-a 127.0.0.1 --dst-b 127.0.0.1 --leo-b
```

在實驗主機上使用時，前提與 [Lab03 雙路徑工具](../lab03-dualpath-tools/README.md#在實驗主機上使用)相同：
EPC、eNB、UE 已由獲授權的操作者啟動並 Attach 成功。`adaptive_send.py` 需要本目錄與
`../lab03-dualpath-tools/` 的檔案，不能像 `dualpath_demo.py` 那樣只經標準輸入傳一個檔案。

`--leo-b` 的模擬在傳送端進行：被模型判定遺失的副本不會送出，其餘副本的回音會延後到模型給的來回時間之後
才讓策略看到。不論路徑 B 實際是什麼網路，加上 `--leo-b` 得到的路徑 B 數字都是模擬。

`--json` 的摘要與 `dualpath_demo.py` 同結構，另有 `policy` 區塊。Interactive Lab 的 Lab03 OTA 實測頁
可以載入，但該頁尚不認得 `adaptive` 模式，會以 Baseline 的標題顯示。

## 測試

```bash
python3 test_ai_dualpath.py && python3 -O test_ai_dualpath.py
python3 test_adaptive_send.py && python3 -O test_adaptive_send.py
```

兩種直譯器模式都要跑。測試只用本機 loopback，尚未加入 `docs-ci` workflow。

## 限制

- 延遲是傳送端量到的來回時間，不是單向延遲。
- 離線環境把超過 `--timeout` 的副本視為遺失。
- LinUCB 只對送出的副本學習；沒有規則層時，沒被使用的路徑統計會過時。
- 目前的離線結果裡，LinUCB 沒有勝過手寫的門檻規則，兩者落在「副本數換達成率」的同一條取捨線上。
- 尚無任何 OTA 上的策略比較結果。
