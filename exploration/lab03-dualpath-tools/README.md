# Lab03 雙路徑探測與即時檢視工具

[Exploration 入口](../README.md) · [Lab03 README](../../labs/lab03-urllc/README.md) ·
[2026-11-12 TER](../../docs/evidence/task-evidence/2026-11-12-lab03-b210-ota-baseline-split-dup.yaml)

狀態：`ENGINEERING AID / APPLICATION_LAYER_ONLY / NOT STUDENT PROCEDURE`

這些是 2026-11-12 Lab03 B210／OTA 實測使用與衍生的工具，只用 Python 標準函式庫
（`dl_iq_check.py` 另需 NumPy）。它們在應用層以 UDP 做分流與複製，不是 PDCP 層，也不是
nukxURLLC；不構成 Lab03 的學生流程或驗收標準。

本目錄不授權任何 Runtime 或 RF 操作。在實驗主機上執行前，仍需當次的 Owner 授權與
[Remote Agent Policy](../../docs/engineering/CODEX_REMOTE_AGENT_POLICY.md) 要求的條件。

## 檔案

| 檔案 | 用途 | 驗證範圍 |
| --- | --- | --- |
| `dualpath_probe.py` | 帶 Packet ID 的 UDP 探測，支援 baseline／split／dup，輸出 JSON | 2026-11-12 的 Baseline、Split、Duplication 量測由它產生 |
| `dl_iq_check.py` | 對 11.52 Msps 的 complex64 IQ 做頻譜與 PSS 折疊偵測 | 2026-11-12 的下行偵測由它產生；合成資料自測 |
| `dualpath_demo.py` | 與 `dualpath_probe.py` 相同的量測邏輯，改為易讀輸出；`--json --stream` 逐封包輸出 | 於本機 loopback 測試；Owner 回報曾用於一次現場 Demo，Repo 內無該次輸出 |
| `live_viz.py`、`live_viz.html` | 在本機 `127.0.0.1` 提供即時頁面，經 SSH 在兩台主機執行 `dualpath_demo.py` | 同上；另有 `test_live_viz.py` |
| `test_live_viz.py` | `live_viz.py` 的單元測試：停止與啟動的時序（含停止早於啟動登記的請求順序）、`/start` 參數驗證、遠端命令的引號 | 以替身程序與本機 loopback HTTP 執行，不連實驗主機；由 `docs-ci` 執行 |
| `test_lab03_ota_run.mjs` | Interactive Lab 結果頁匯入解析器的測試：有效檔案可載入，無效數值與結構一律拒絕且不拋例外 | Node 執行；由 `docs-ci` 執行 |

`dualpath_demo.py` 的 `--sim-a-ms`、`--sim-a-jitter`、`--sim-a-loss` 只供預演，會在路徑 A
加上人為延遲與遺失；以這些選項得到的數字是 `SIMULATED_PROOF_OF_CONCEPT`，不是 OTA 實測。

## 預演（不需要實驗室）

```bash
python3 live_viz.py --local --sim-a-loss 8
```

用瀏覽器開啟 `http://127.0.0.1:8770/`。兩條路徑都在同一台電腦上，頁面頂端會標示預演模式。

## 在實驗主機上使用

前提：EPC、eNB、UE 已由獲授權的操作者啟動並 Attach 成功；控制端可用 SSH 金鑰連到兩台主機。
工具不使用 sudo，也不在主機上留檔。

```bash
python3 live_viz.py --host-echo <EPC 主機的 SSH 別名> --host-send <UE 主機的 SSH 別名> \
  --dst-a <EPC SGi 位址> --dst-b <EPC 主機的有線位址>
```

不經即時頁面、只要一份可保存的結果時：

```bash
ssh <UE 主機> "python3 - send --mode dup --dst-a <EPC SGi 位址> --dst-b <EPC 有線位址> --count 200 --json" \
  < dualpath_demo.py > run.jsonl
```

接收端需先在 EPC 主機以同樣方式執行 `echo --bind <SGi 位址> --bind <有線位址>`。
`run.jsonl` 可載入 Interactive Lab 的
[Lab03 OTA 實測頁](../5g-sdr-interactive-lab/lab03-ota.html)。

## 測試

```bash
python3 test_live_viz.py && python3 -O test_live_viz.py
```

```bash
node test_lab03_ota_run.mjs
```

Python 測試兩種直譯器模式都要跑：參數驗證不得依賴 `assert`。測試只用本機 loopback，不使用 SSH 或實驗主機。`docs-ci` workflow 會在每個 PR 執行這三行。

## 限制

- 延遲是傳送端單調時鐘量到的來回時間，不是單向延遲。
- Duplication 的「較短 RTT 的路徑」比較各副本自己的來回時間，不是實際抵達順序；JSON 欄位名
  `first_arrival_by_path` 即此統計。
- 去重在傳送端對回送封包進行，接收端只回送。
- 即時頁面只顯示封包；UE 佔用 B210 期間無法同時擷取 IQ，沒有即時波形。
- `live_viz.py` 只監聽 `127.0.0.1`。停止回應成功後不會再啟動新的程序，已啟動的本機 SSH 程序會被終止；
  頁面的停止請求帶有該輪的識別碼，若比啟動請求先完成登記，伺服器會拒絕那次啟動。
  主機上的接收端仍可能要等自身時限到才結束。
- 即時頁面在預演模式以中性名稱標示路徑；只有對實驗主機執行時才標示 OTA／有線，而這取決於啟動時
  給的位址，工具本身無法驗證路徑。
