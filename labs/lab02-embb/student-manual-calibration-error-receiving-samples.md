# Calibration Section 2 草稿｜`Error receiving samples`

> 獨立 troubleshooting calibration sidecar，尚未併入 [Lab02 Student Manual](student-manual.md)。以下是有界檢查與停止條件，不是 root-cause diagnosis 或已驗證的 repair procedure。

## What happened?

如果 `srsUE` 重複顯示 `Error receiving samples`，這表示程式當下回報 sample receiving 發生錯誤。這行訊息本身沒有指出錯誤來自哪個元件或原因，因此先把它當成**症狀**，不要直接寫成 srsRAN bug，也不要判定 USB Ethernet adapter hardware failure。

先記下訊息出現的時間，以及當時兩台 host 的介面與 Sample Plane 狀態。暫停進一步的 LTE／eMBMS 成功判讀，再做下列唯讀 preflight。

## Check this first：Sample Plane preflight

Sample Plane 檢查先確認兩台 Linux host 目前的位址、peer route 與基本雙向 IP connectivity。這些是比 LTE attach／eMBMS 更低層、容易先核對的條件。過去一筆 incident report 曾同時記錄 Sample Plane address 不見與 `Error receiving samples`；這是先查 Sample Plane 的理由，**不是**證明每次出現此訊息都是 Sample Plane 引起。

### 1. 確認位址仍在預期介面

Linux1：

```bash
ip -4 -o address show dev enxec9a0c14d482
```

預期檢查 `10.0.0.1/24` 是否仍在 `enxec9a0c14d482`。

Linux2：

```bash
ip -4 -o address show dev enxec9a0c14d470
```

預期檢查 `10.0.0.2/24` 是否仍在 `enxec9a0c14d470`。

**Why this check matters：**它回答「本機目前是否仍把本實驗使用的 Sample Plane address 放在預期介面上？」

**What the result means：**若 address 缺少或掛在不同介面，代表目前的 Sample Plane host 設定與預期不符；記錄結果並停止，交由 Instructor 判斷下一步。

**What it does NOT prove：**address 存在不代表 peer 可達，也不代表 ZeroMQ、LTE attach 或 eMBMS 正常。這個查詢只看本機目前的 address state。

### 2. 查看去 peer 的 route 選擇

Linux1：

```bash
ip route get 10.0.0.2
```

Linux2：

```bash
ip route get 10.0.0.1
```

**Why this check matters：**它回答「Linux 目前打算用哪個 interface 與 source address 前往另一端？」確認結果是否選用對應的 Sample Plane 介面與來源位址。

**What the result means：**輸出顯示本機 kernel 對該目的位址選擇的 route。若 route 未選用預期的 Sample Plane interface／source，記錄輸出並停止，交由 Instructor 判斷。

**What it does NOT prove：**route selection 不代表封包實際抵達 peer，也不代表 peer 有回應。

### 3. 確認雙向基本 IP connectivity

Linux1：

```bash
ping -c 3 -I 10.0.0.1 10.0.0.2
```

Linux2：

```bash
ping -c 3 -I 10.0.0.2 10.0.0.1
```

**Why this check matters：**從兩端分別送出 ICMP echo，確認每個方向在檢查當下是否有回應；只測一個方向不足以記錄雙向結果。

**What the result means：**兩個方向都收到回應，支持「這個檢查時間點的 host-to-host Sample Plane ICMP connectivity 可用」。若任一方向失敗，記錄方向、loss 與時間，將 Sample Plane 標為尚未確認並停止後續成功判讀。

**What it does NOT prove：**ping 成功不等於 ZeroMQ sample flow 正常，也不證明 LTE attach、eMBMS service 或 multicast application 已成功。若 ping 是在錯誤發生後才執行，它也不能回溯證明錯誤發生當時的 connectivity。

## Check the host logs when the interface changed

若 interface 曾消失、名稱改變、重新出現，或 address 無故不在，記下症狀時間並查看涵蓋該時段的 kernel 與 NetworkManager 紀錄。在使用 systemd 的 host 可查：

```bash
sudo journalctl -k --since "15 minutes ago" --no-pager
sudo journalctl -u NetworkManager --since "15 minutes ago" --no-pager
```

若錯誤早於最近 15 分鐘，將 `--since` 調整至涵蓋已記錄的錯誤時間。若 host 使用不同的日誌工具或服務名稱，請詢問 Instructor 對應的唯讀查詢方式。

**Why this check matters：**kernel log 可協助確認該時段是否有 device disconnect、interface unregister 或 re-enumeration 記錄；NetworkManager log 可協助對照介面與 network profile 的後續變化。時間順序能補充「發生過哪些 host event」的觀察。

**What the result means：**若紀錄顯示介面 disconnect／re-enumeration，只能記錄該 host event 與時間，再交給 Instructor 評估。Repo 保存的一筆歷史 incident 中，NetworkManager profile reactivation 發生在 kernel device event 之後；這不把 NetworkManager 定為 USB disconnect 的原因。

**What it does NOT prove：**單一 log event 不能判定 USB adapter hardware failure、driver／kernel bug、srsRAN bug，或哪一個 event 是完整故障 root cause。沒有找到 log entry 也不等於已證明該時段沒有 event；需確認查詢涵蓋的時間與 host log 是否可用。

## What the results mean together

| Observation | 可以支持 | 不能據此支持 |
| --- | --- | --- |
| Expected address 在預期介面 | 該 host 當下有對應的本機 Sample Plane address | peer 可達、sample flow 或 LTE／eMBMS 正常 |
| `ip route get` 選用預期介面與 source | 本機對 peer 的 route 選擇符合預期 | 封包已抵達 peer 或收到回應 |
| 兩方向 ping 都收到回應 | 檢查當下有雙向 host-to-host ICMP response | ZeroMQ、LTE attach、eMBMS 或應用路徑正常 |
| kernel／NetworkManager 記錄 disconnect 或 re-enumeration | 該 host 在查詢時間範圍內記錄了相關 device／network event | adapter 已壞、事件 root cause，或該事件必然造成 `Error receiving samples` |

這些觀察是分層的。即使 address、route 與 bidirectional ping 都符合預期，也只表示基本 host-level Sample Plane checks 在該時間點通過；仍需 Instructor 指示後續 Runtime evidence，才能判斷 LTE 或 eMBMS 狀態。

## When to stop and ask Instructor

遇到下列任一情況，保存錯誤時間、host、命令結果或相關 log 範圍，停止自行排查並通知 Instructor：

- Sample Plane address 不見、出現在非預期介面，或 interface 消失／重新命名／重新枚舉。
- Route 沒有選用預期的 Sample Plane interface／source，或任一方向的 ping 沒有回應。
- kernel／NetworkManager log 出現 USB Ethernet disconnect／re-enumeration，或目前狀態與紀錄無法釐清。
- Sample Plane 的 address、route、ping checks 都通過，但 `Error receiving samples` 仍重複出現。

不要只因為看到這個症狀就重啟整套 Runtime、修改 persistent network 設定或交換 adapter。這些動作不能由目前 evidence 推導為安全或已驗證的修復程序。

## Why not blame srsRAN or the USB Ethernet adapter?

一筆既有 Human-reported incident 記錄了 Sample Plane address 遺失與 `Error receiving samples`，並在另一段 supplied log chronology 中記錄 Linux2 USB Ethernet disconnect／`cdc_ether` unregister／re-enumeration。這支持「該次事件中，Sample Plane 與 host interface 狀態值得檢查」；不等於已證明 adapter hardware failure，也不能推廣成所有相同訊息的原因。該 incident 的底層 USB disconnect cause 仍為 `UNLOCALIZED`，沒有 adapter swap／A-B isolation evidence。

同一歷史紀錄還指出，Sample Plane host connectivity 後來雖被回報恢復，ZMQ／LTE 並未自動恢復；之後 controlled eNB／UE restart 與 attach、user plane、multicast 恢復屬 Human-reported historical sequence。這是不同層次需要分別觀察的例子，**不是**本手冊建議學生照做的 repair procedure。

---

## Reviewer-only provenance anchors

以下是編輯複核索引，不屬於學生段落：

- `Error receiving samples` 與兩端 Sample Plane address 缺少的 incident observation：Sample Plane USB incident TER，SPI-01。
- Manual address restoration 後 host-level connectivity 恢復、ZMQ／LTE 未自動恢復的歷史回報：同一 TER，SPI-02；不可當作 repair instruction。
- Linux2 USB Ethernet disconnect／re-enumeration 與 NetworkManager event 順序：同一 TER，SPI-03／SPI-04／SPI-05；底層原因仍 `UNLOCALIZED`，沒有 A/B experiment。
- Address／route／雙向 ping commands 與 claim boundary：原 Student Manual 第 3 節及 B.1 TER 的 bounded observation；pass 只限檢查時間窗。

Sources: [Sample Plane USB incident TER](../../docs/evidence/task-evidence/2026-09-26-lab02-sample-plane-usb-incident.yaml), [Lab02 Student Manual](student-manual.md), [B.1 core Runtime bring-up TER](../../docs/evidence/task-evidence/2026-09-25-lab02-b1-core-runtime-bring-up.yaml), [PROGRESS.md](../../PROGRESS.md).
