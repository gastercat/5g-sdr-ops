# 5G SDR 設定治理規範

版本：0.1-draft
狀態：Draft

## 1. 目的

本規範用於避免 Lab01、Lab02、Linux1 與 Linux2 之間未被追蹤的設定漂移。Git 歷程用於管理已核准的專案產物，不取代安全的執行階段部署程序。

## 2. 管理邊界

| 類型 | 位置 | Git 管理 | 說明 |
| --- | --- | --- | --- |
| 原始碼 | `srsRAN_4G/` | 是 | 管理 srsRAN 原始碼、patch 與版本 |
| 核准設定 | `5g-sdr-ops/configs/` | 是 | 儲存已清理且經 Review 的設定範本 |
| 執行階段設定 | `/etc/srsran/` | 否 | 主機實際使用的 active config |
| 敏感資料 | 主機受限位置 | 否 | subscriber 與驗證資料 |
| 稽核證據 | `docs/audits/` | 是 | 儲存盤點、雜湊與稽核報告 |
| 部署狀態 | `manifests/` | 是 | 未來記錄已部署 Profile 與版本 |

## 3. 系統角色

- Mac：控制端、Git 工作站與人工核准端。
- Linux1：EPC / eNB 執行主機。
- Linux2：UE 執行主機。
- 主機角色不得以永久 Git 分支表示。

## 4. Repository 職責

`srsRAN_4G` Repository 管理原始碼與 patch。`5g-sdr-ops` 管理文件、已清理的核准設定、manifests、稽核證據與受控部署工具。`/etc/srsran/` 不是 Git working tree。

## 5. Profile 管理

預計建立的 Profile 為 `lab01` 與 `lab02`。Profile 應以目錄與 manifests 表示；已驗證狀態可使用標籤識別。永久 `lab01` 或 `lab02` 分支不是一般儲存機制。

## 6. 分支策略

`main` 代表已審閱且已核准的專案狀態。每項範圍明確的變更均使用短期分支，例如：

- `config/lab01-rollback`
- `config/zeromq-address-update`
- `config/lab02-embms`
- `code/enb-observability`
- `docs/configuration-governance-v0.1`

變更進入 `main` 前必須使用 Pull Request。依 Repository 規範，禁止 force push 與直接修改 `main`。

## 7. 設定部署流程

核准設定 → 備份 active config → 產生差異 → 人工核准 → 部署 → 語法與設定驗證 → 啟動前檢查 → 執行階段驗證 → 記錄 deployment state

代理可準備證據與提議變更，但未經明確核准不得部署。

## 8. 回復原則

每項設定變更均需要回復計畫。備份若包含敏感資料，必須加上時間戳記並存放於 Git working tree 之外。回復必須還原至先前已知的啟用中狀態；僅執行 Git checkout 並非已核准的執行階段回復程序。

## 9. 敏感資料與禁止提交項目

不得提交下列項目：

- `user_db.csv`
- Ki
- OPC
- 密碼
- access tokens
- SSH private keys
- private certificates
- 含敏感流量的 PCAP 或 PCAPNG 檔案
- core dumps
- 原始 shell history
- build artifacts
- 含有憑證或 subscriber identifiers 的執行階段日誌

`user_db.csv.example` 僅可於日後以明確的合成 placeholder values 建立。

## 10. 版本與標籤

預計使用的標籤範例：

- `lab01-baseline-v0.1`
- `lab02-embms-v0.1`

只有在相符的設定與驗證證據完成審閱後才能建立標籤。本任務不得建立標籤。

## 11. 未來預計目錄

```text
5g-sdr-ops/
├── configs/
│   ├── common/
│   ├── linux1-epc-enb/
│   ├── linux2-ue/
│   └── profiles/
├── manifests/
├── scripts/
│   ├── audit/
│   ├── backup/
│   ├── deploy/
│   └── validate/
└── docs/
    ├── audits/
    ├── engineering/
    ├── architecture/
    ├── labs/
    └── reports/
```

此為預計結構；除本次文件檔案外，本任務不得建立這些目錄。

## 12. 當前狀態

本節不保存會快速過期的 project checkpoint。目前狀態一律以
[`PROGRESS.md`](../../PROGRESS.md) 為入口，已知未驗證範圍見
[`docs/known-limitations.md`](../known-limitations.md)。

- `KNOWN`：Lab01 Phase 4C recovered baseline 已在當時核准範圍內完成並受控停止。
- `KNOWN`：歷史 Lab02 residue inventory 保留為 observation evidence，不是 current active config authority。
- `NOT AUTHORIZED`：本文件不授權新的 recovery、deployment、service start、persistent
  network change 或 extended validation。
- `NEEDS_APPROVAL`：任何 active configuration 工作必須重新進入 backup → diff → Human
  approval → deployment → validation 的受控流程。
