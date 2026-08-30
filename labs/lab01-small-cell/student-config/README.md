# Lab01 Student Teaching Config

Profile ID：`lab01-student-zmq-lte`

Pinned srsRAN_4G revision：

```text
6bcbd9e5bf8686aa7085202cd847c5ddd64a9c16
```

這是一組供兩節點 Lab01 使用的無 Secret 教學設定：Node 1 執行 EPC 與 eNB，Node 2
執行 UE，兩端透過 `10.0.0.1/24` 與 `10.0.0.2/24` 上的 ZeroMQ sample path 配對。

## 學生取得的檔案

- `epc.conf`
- `enb.conf`
- `ue.conf.template`
- `sib.conf`
- `rr.conf`
- `rb.conf`

`ue.conf.template` 不是可直接啟動的 Runtime config。Instructor／TA 必須在 Repo 外建立
實際 `ue.conf`，並以受保護方式填入 Subscriber Provisioning 所需的敏感欄位。

## Instructor／TA Provisioning Gate

Runtime 啟動前，Instructor／TA 必須：

1. 在 Repo 外準備 `/etc/srsran/user_db.csv` 與實際 `/etc/srsran/ue.conf`。
2. 確認 EPC 與 UE 的 subscriber identity／authentication state 成對。
3. 確認學生不會讀取、修改、截圖、複製或提交 subscriber credential。
4. 將本目錄中的無 Secret core configs以受控方式 materialize 到 `/etc/srsran/`。
5. 向學生只回報「Subscriber Provisioning Gate 已完成」，不揭露敏感值。

本 Repo 不保存 `user_db.csv`、實際 UE subscriber values 或 credential-bearing derivative。

## Core 與 Optional Extensions

Core profile只涵蓋：

- LTE EPC／eNB／UE attach
- `172.16.0.1/24` 與 `172.16.0.2/24` User Plane addressing
- complementary ZeroMQ endpoints
- core LTE SIB、Radio Resource 與 bearer configuration
- 預設關閉 PCAP 與 eMBMS

下列項目不在 core profile：

- Management Plane address／interface
- NAT／Internet state
- TCP／iperf server或 measurement values
- Lab02／MBMS／eMBMS／MBSFN／SIB13
- historical recovery-only overrides

NAT／Internet 是 optional Instructor extension；TCP／iperf 是 optional measurement
extension。兩者未執行時必須記錄為 `NOT VALIDATED`。

## Validation Boundary

本 profile 已接受 static consistency review，但尚未進行 isolated Runtime validation。
Pinned source revision是 known-good-associated teaching ref；它不建立 pristine Ubuntu 24.04
clean-build PASS、installed-binary provenance或 production-security claim。

`EEA0`／`EIA1` 僅為受控教學與 interoperability baseline，不是 production-network security
recommendation。
