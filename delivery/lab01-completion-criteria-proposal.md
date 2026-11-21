# Lab01｜完成範圍與完成標準提案

[Delivery 入口](README.md) · [學生實驗手冊](../labs/lab01-small-cell/student-manual.md) · [目前進度](../PROGRESS.md) · [教授決策](../docs/decisions/2026-08-18-professor-meeting.md#unresolved-implementation-details)

狀態：`PROPOSAL / PENDING PROFESSOR REVIEW / NOT EXECUTED`

- 撰寫日期：2026-11-21
- 提案者：Yoi
- 性質：提案草稿。內容是提案者逐題確認後的決定，最終由教授 Review 與裁定
- 執行狀態：驗證用的 fresh run 尚未執行，本文件不建立 Lab01 完成、EV-2 PASS 或 Full Lab01 PASS

## 1. 定位

[教授決策紀錄](../docs/decisions/2026-08-18-professor-meeting.md#unresolved-implementation-details)
把 Lab01 completion scope 與 completion criteria 列為
`UNRESOLVED_IMPLEMENTATION_DETAIL / NEEDS_SEPARATE_WORK_UNIT`，本提案就是這個 Work Unit 的草案。
本提案依 README 的 *Delivery First / Exploration Decoupled* 原則，把「Lab01 完成」定義為**課程交付**的完成，也就是證明這個 Lab 能在課堂上完整帶領一次，並留下可追溯的證據。
完整 user-plane 驗證、R5 根因定位與其他工程驗證屬於 Exploration，不是 Lab01 完成的前提。

決策權維持既有規則，提案者負責提出版本，教授是最終裁定者。本提案在教授 Review 前不修改
學生手冊與 [Delivery 入口](README.md)的 Minimum 界線，也不登錄新的 Decision Record。

## 2. 現況

[PROGRESS](../PROGRESS.md) 目前的 Lab01 狀態是
`EV-2 PARTIAL / R5 FAIL UNLOCALIZED / COMPLETION CRITERIA UNRESOLVED`。EV-2 各項結果整理自 [2026-08-30 EV-2 Part 8 TER](../docs/evidence/task-evidence/2026-08-30-lab01-ev2-part8-runtime-usb-incident.yaml)：

| 項目 | 檢查內容 | 結果 | 證據等級 |
| --- | --- | --- | --- |
| R0 | Preflight：sample plane、routes、host transport | PASS | `OBSERVED` |
| R1 | EPC startup | PASS | `REPORTED_ONLY` |
| R2 | eNB startup 與 S1 Setup | PASS | `REPORTED_ONLY` |
| R3 | UE attach | PASS | `REPORTED_ONLY` |
| R4 | `172.16.0.1`／`172.16.0.2` 位址 | PASS | `REPORTED_ONLY` |
| R5 | UE → EPC ICMP | `FAIL / UNLOCALIZED` | `OBSERVED` |
| R6 | 受控停止，processes 已結束 | PASS | `OBSERVED` |

R5 只執行過一次 `ping -I tun_srsue -c 3 172.16.0.1`，3 個封包全部遺失，根因仍是 `UNKNOWN`。
另外，學生手冊 v0.2 記錄了 2026-11-17 的課堂執行（`REPORTED_ONLY`），當時 UE 取得
`172.16.0.6`，Node 1 → UE 的 DL ICMP 為 4/4，iperf3 UL 約 7.07 Mbit/s，UL ICMP 沒有紀錄。
這次課堂執行不改變 R5 的狀態。

Repo 內沒有找到教授指定 Lab01 必須展示哪些項目的文件。舊的 ICMP／TCP、NAT 與 Wireshark 目標
在 [Lab01 導覽](../labs/lab01-small-cell/README.md)中標為 `NEEDS_CONFIRMATION`，不是 acceptance criteria。

## 3. 提案的完成標準

### 3.1 Core

Core 以學生手冊 §1.2 為基礎，維持越小越好，而且每一項都要能從原始輸出客觀判斷：

| 編號 | Core 項目 | 判斷方式 |
| --- | --- | --- |
| C1 | EPC、eNB、UE 依序啟動，沒有 execution-critical error | 三個元件的啟動輸出 |
| C2 | UE 完成 Cell Search、Random Access、RRC connection 與 EPS attach | UE 與 EPC 的輸出 |
| C3 | UE 取得 `172.16.0.0/24` 範圍內的位址，並照實際輸出記錄 | `tun_srsue` 的位址輸出 |
| C4 | DL 與 UL ICMP 都已執行，並如實記錄結果與 packet loss | 兩個方向的 `ping` 原始輸出 |
| C5 | Runtime 依 UE → eNB → EPC 反向停止 | 停止過程與 process 檢查輸出 |
| C6 | 本次建立的 temporary sample-plane state 已移除 | 清理前後的 interface 狀態 |

C3 不寫死 `172.16.0.2`。UE 位址會隨 EPC 狀態改變，課堂與 Lab02 已觀察過 `.3`、`.6`，
寫死預期值會把正常結果判成失敗。

C4 只要求如實記錄，ICMP 的結果不論 0% 或 100% loss 都算達成 Core。這是本提案最需要教授
確認的一點，因為它把 Core 的判準從「網路是否已經打通」改成「流程是否完整執行並如實留下
證據」。為了避免誤讀，網路結果一律在完成紀錄裡單獨列出，格式見第 6 節。

### 3.2 Optional

NAT／Internet 與 TCP／iperf 維持學生手冊與[教學設定](../labs/lab01-small-cell/student-config/README.md)
目前的寫法，只在教授或助教授權時執行。執行了就照實記錄，沒有執行就標
`NOT VALIDATED`，兩者都不影響 Lab01 完成認定。

### 3.3 R5 與 R5A

由於 C4 只要求如實記錄，EV-2 R5 的 FAIL 不會阻擋 Lab01 完成。R5A Counter
Localization 維持在 Exploration，是選做的工程工作，要執行時仍需另外取得授權。

## 4. 驗證用的 fresh run

舊證據只作參考，Lab01 完成需要一次新的執行紀錄。本提案只要求**一次**合格的 fresh run，
用來證明 Lab01 可以在課堂上交付。學生個人的評分標準屬於教授的權限，不在本提案範圍內。

這次 fresh run 在上課時進行，由 Yoi 操作鍵盤，帶著學生一步一步完成，學生手冊作為輔助。
因此這次執行能證明「這個 Lab 在 Maintainer 帶領下可以完整跑完」，但**不能**證明學生只看
手冊就能自行完成。手冊是否足以讓學生獨立操作，留給手冊 Review 另行判斷，與 Lab01 完成
維持兩個分開的交付面向。

執行時依下列規則處理：

1. 開始前記下使用的學生手冊 commit，之後手冊再修改，不影響這次的完成認定。
2. 所有超出手冊的動作都記進偏差清單，例如額外的指令、手冊沒寫的設定與口頭補充。
   這份清單之後直接作為修訂手冊的依據。
3. 課堂上遇到問題時，可以參考 Maintainer 文件並臨時 debug，每個動作都記進偏差清單。
4. 如果遇到 USB 斷線、`Error receiving samples` 等狀況，導致 Core 項目無法完成，或修復時
   需要修改設定、重啟服務，這次執行就記為 `INCOMPLETE`，必須從頭重跑完整流程，不能從
   中途接續。每一次嘗試的紀錄都要保留，不刪除失敗的那次。

## 5. 證據與資料處理

驗證用 fresh run 的每一項 Core，都要有 `OBSERVED` 等級的原始終端機輸出或截圖，口頭回報
不算通過。這些輸出由 Maintainer 整理成 Task Evidence，存放在
`docs/evidence/task-evidence/`，並註明第 4 節記下的手冊 commit。

存進 Repo 前，先遮掉 IMSI、K、OPc 等 SIM 憑證與個人帳號，並在 Task Evidence 註明遮掉了
哪些欄位。`192.168.250.x`、`172.16.0.x` 這類內網位址已經記錄在 PROGRESS，可以保留。

學生自己的資料只交給教授與助教，不進入 Repo，也不經過 Maintainer。本節的 `OBSERVED`
要求只適用於驗證用的 fresh run。

## 6. 完成紀錄格式

完成紀錄一律分成三欄，讓「流程完成」與「網路結果」不會混在同一個 `PASS` 裡：

```text
Lab01: COMPLETE (guided, maintainer-operated)
DL ICMP: <實際結果，例如 PASS 3/3 received>
UL ICMP: <實際結果，例如 FAIL 3/3 lost>
Manual self-sufficiency: NOT VALIDATED
```

`Lab01` 欄位依第 4 節記為 `COMPLETE`、`INCOMPLETE` 或 `NOT STARTED`。ICMP 欄位照原始輸出
填寫，不加以詮釋。`Manual self-sufficiency` 在手冊 Review 另外完成判斷之前，固定記為
`NOT VALIDATED`。

## 7. 與現有文件不同之處

下列幾點與 Repo 現有的寫法不同，需要教授確認後才能更新對應文件：

| 項目 | 現有寫法 | 本提案 | 教授確認後要更新的文件 |
| --- | --- | --- | --- |
| ICMP 的判準 | 手冊 §1.2 要求 DL／UL ICMP 有實際結果與 packet loss 記錄，沒有說明失敗是否算完成 | 如實記錄即達成 Core，結果另列 | 學生手冊 §1.2 |
| 執行者 | 手冊假設學生依手冊自行操作 | 驗證 run 由 Maintainer 帶領，手冊為輔助 | 學生手冊、Delivery 入口 |
| 完成紀錄 | 沒有規定格式 | 第 6 節的三欄格式 | Delivery 入口、PROGRESS |
| 學生資料 | 手冊 §12.1 列出學生交付物，沒有規定交給誰 | 只交給教授與助教，不進 Repo | 學生手冊 §12 |
| 完成標準本身 | `UNRESOLVED_IMPLEMENTATION_DETAIL` | 本提案 | 教授決策紀錄、Decision Register |

## 8. 不在範圍內

- 執行 fresh run、R5A 或任何 Runtime 操作。本提案不授權這些工作。
- 學生個人的評分標準與課程成績。
- 學生手冊內容的 Review 與修訂。
- Lab02、Lab03 與 Security cross-cutting 的完成標準。
- 最終成果報告的指定檔案與驗收方式。

## 9. 請教授確認的問題

1. Lab01 完成是否以課程交付為準，也就是第 1 節的定位？
2. C4 只要求 DL／UL ICMP 如實記錄、不要求一定要通，這個判準是否可以接受？
3. 由 Maintainer 帶領的一次課堂 fresh run，是否足以作為 Lab01 可以交付的證據？
4. 學生資料只交給教授與助教、不進 Repo 的做法，是否符合課程的資料處理要求？
5. 確認後，是否同意依第 7 節更新學生手冊、Delivery 入口與 PROGRESS，並登錄為新的 Decision
   Record？

## 附錄：決策來源

本提案的內容來自 Yoi 於 2026-11-21 逐題確認的決定，依決策順序整理如下：

| 本文位置 | 決定內容 |
| --- | --- |
| 第 1 節 | 完成以課程交付為準，工程驗證放到 Exploration，由提案者提出版本、教授最終裁定 |
| 第 3.1 節 | 分 Core／Optional 兩層，Core 以手冊 §1.2 為基礎，ICMP 只要求如實記錄，UE 位址不寫死 |
| 第 3.2、3.3 節 | Optional 維持手冊現狀，R5A 維持選做 |
| 第 4 節 | 一次 fresh run 即可，課堂上由 Yoi 操作並帶領學生，記錄手冊 commit 與偏差清單，允許 debug，中途中斷記為 `INCOMPLETE` 並從頭重跑 |
| 第 5 節 | 驗證 run 需要 `OBSERVED` 證據，存入 Repo 前遮掉 SIM 憑證，學生資料不進 Repo |
| 第 6 節 | 完成紀錄分欄，流程與網路結果分開，並標示手冊自足性未驗證 |
