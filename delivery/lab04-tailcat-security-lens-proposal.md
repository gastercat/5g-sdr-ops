# Lab04（組內稱呼）｜Tailcat Security Lens 提案

[Delivery 入口](README.md) · [PD-02 決策](../docs/decisions/2026-08-18-professor-meeting.md#pd-02security-改為-lab0103-cross-cutting-direction) · [舊 Lab04](../labs/lab04-security/README.md)

狀態：`PROPOSAL / DOCUMENTATION-ONLY / NOT_TESTED / NO RUNTIME AUTHORIZATION`

- 撰寫日期：2026-11-19
- 性質：提案草稿，方向已登錄為 DR-016；內容待 Owner 與教授 Review
- 不代表：Tailcat 已安裝、已連線、已驗證，或任何保護效果已成立

## 1. 定位

依 [DR-011](../docs/decision-register.md)／PD-02，Security 不再是獨立、後置的 Lab04，而是
穿插 Lab01～03 的 cross-cutting 方向。本提案是其中一項 **Security Lens 實作**：在兩台實驗室
主機之間建立 Tailcat overlay，用來討論「流量走得通」與「流量安全」之間的差距。

組內習慣把這項工作稱為「Lab04」。這只是工作暱稱，不表示恢復獨立 Lab04，也不是第四套
學生必做 Runtime。

來源：Owner 於 2026-11-19 回報，教授同意在不開獨立 Lab04 的前提下，實作原先提出的
Tailscale／Tailcat 架構作為 Security Lens（`REPORTED_BY_OWNER`）。已補登為
[DR-016](../docs/decision-register.md)。

## 2. 範圍

**在範圍內：**

- 只在本組的兩台實驗室主機之間，以及實驗室網路內進行。
- 只使用自行產生的測試流量與測試內容，不含任何個人或用戶識別資料。
- 與 LTE 協定層的安全機制做概念對照（見第 5 節）。

**不在範圍內：**

- 舊 Lab04 材料中的偽基地台、UE Scanner、DoS 與識別資訊收集。這些內容維持
  `HISTORICAL / SUPERSEDED`，本提案不引用其操作步驟，也不把它們改寫成練習。
- 商用手機、商用網路或任何非本組設備。
- 任何 RF 參數調整或新的發射行為。Tailcat 本身不涉及 SDR 或 RF。
- 完整 Tailscale tailnet、帳號管理或 ACL 政策設計（除非日後另行納入）。

## 3. 要回答的資安問題

學生（或本組）在這個 Security Lens 中要能分開回答下列問題，每一題都要指出依據的證據：

| 編號 | 問題 | 需要的證據 |
| --- | --- | --- |
| Q1 | 能連到對方的服務，能不能證明對方就是預期的主機？ | 端點身分如何建立、由誰交付位址 |
| Q2 | Overlay 的加密保護到哪一段為止？ | 外層網路介面與本機 loopback 兩處的擷取對照 |
| Q3 | 誰有權限連進來？只知道位址就夠嗎？ | 上游文件說明與負向測試（待設計） |
| Q4 | 流量走直接 UDP 還是 DERP 中繼？這對實驗室隔離代表什麼？ | 連線路徑紀錄、是否需要對外網路 |
| Q5 | Overlay 的保護和 LTE 的 AS／NAS security 各自涵蓋哪一段？ | 與 Lab01 Security Lens 的分段對照 |

依上游 README（2026-11-19 查閱），Q3 的文件答案是：預設的 `<tc-address>` 內含 pre-shared
key，**持有位址就能連入**，是一種 bearer capability；`tailcat serve --allow=...` 可把連入
限制在指定的 client node key。T6 要用實測確認這兩種行為，而不是只引用文件。

Q2 是本提案的核心觀察：依上游文件，WireGuard 保護的是兩個 Tailcat process 之間的流量；
Host A 的應用連到本機 forward listener、Host B 的 serve 轉送到本機服務，這兩段不在同一個
隧道內。這一點目前只是文件描述，尚未在本專案驗證。

## 4. 架構

依 [Interactive Lab 的 Tailcat 理論範例](../exploration/5g-sdr-interactive-lab/js/data/tailcat-example.js)
（官方 README，2026-10-04 轉錄），本提案沿用以下拓樸：

```text
Host A                                         Host B
+---------------------------+                  +---------------------------+
| client app                |                  |              local service|
|   | TCP                   |                  |                   ^ TCP   |
|   v                       |                  |                   |       |
| 127.0.0.1:18080           |   outer UDP      |   127.0.0.1:8080  |       |
| tailcat forward  ===========( WireGuard )=========> tailcat serve |       |
+---------------------------+   direct or DERP +---------------------------+
   ^ 本機段：不在隧道內                              ^ 本機段：不在隧道內
```

上圖的 Port 是官方範例值，不是本專案配置。`<tc-address>` 由 serve 端產生並帶外交給
forward 端，不是固定 IP。

### Host 對應（Owner 2026-11-19 選定先做選項 A）

| 選項 | 外層路徑 | 優點 | 需要的授權 |
| --- | --- | --- | --- |
| A（已選定，先做） | 兩台主機之間的有線實驗室網路 | 不啟動 SDR，風險最低，可先把 Q1～Q4 做完 | 遠端存取與軟體安裝 |
| B（延伸） | 經 LTE bearer（UE 端 ↔ EPC 端） | 可同時觀察 LTE 層與 overlay 層的保護範圍（Q5） | 另需 RF／Runtime 授權 |

選項 B 會把 overlay 疊在 LTE 資料路徑上，直接對應 Lab01 的 Security Lens，但必須先完成
選項 A，並另行取得 RF 執行授權。

### 選項 A 的配置（Owner 2026-11-19 決定）

| 角色 | 主機 | 說明 |
| --- | --- | --- |
| Host A（`tailcat forward`） | `5g-linux1-audit`（192.168.250.11） | 也是 EPC＋eNB 主機；本實驗不啟動 srsRAN |
| Host B（`tailcat serve`＋測試服務） | `5g-linux2-audit`（192.168.250.12） | 也是 UE 主機；本實驗不啟動 srsRAN |
| 本地 DERP relay（`derper`） | 控制端 Mac（192.168.250.10） | Owner 要求自建；放在兩端之外的第三台主機，作為 Security 觀察的一部分 |

- **對外網路：**兩台主機以組員手機熱點連外，只用於下載安裝檔。兩台主機同時有有線實驗室
  網路與熱點時，Tailcat 實際走哪個介面要在 T5 記錄，不預先假設。
- **不做持久網路變更：**不改兩台主機的路由、DNS、防火牆或 netplan 設定；若某一步需要，
  另行提出並取得授權。

### 本地 DERP 的設計與可行性關卡

採用本地 DERP 後，若 `<tc-address>` 內的 region 指向本地 relay，上游 README 說兩端
「never contact Tailscale's DERP map server or relays」。整個實驗在安裝完成後即可不依賴
實驗室外的服務，relay 也成為可以觀察的第三方（T8）。

但上游文件對本地部署有三項要求，與實驗室環境不完全相符：

| 上游要求 | 實驗室情況 | 處理 |
| --- | --- | --- |
| relay 需要 hostname 與 TLS 憑證，文件範例用 Let's Encrypt | 主機在手機熱點 NAT 後，沒有公開 DNS 名稱，Let's Encrypt 無法簽發 | 改用本組自建的測試 CA 簽發憑證；derper 與 Tailcat 是否接受，**上游未說明，需 T0 驗證** |
| derper 預設使用 TCP 80／443 與 UDP 3478（STUN） | 443 需要 root 或額外權限 | T0 時確認可否改用非特權 port，或以最小權限啟動 |
| Tailscale KB 說 DERP 不應在 NAT 後、IP 需為公開位址 | 這是給網際網路上的 tailnet；本實驗兩端與 relay 都在同一個實驗室網段 | 視為上游未涵蓋的情境，以 T0 實測為準 |

**T0 不通過時的退路：**改用預設公開 DERP 完成 T1～T7，本地 DERP 標為
`BLOCKED_BY_UPSTREAM_REQUIREMENT`，並記錄卡在哪一項。不為了讓 T0 通過而修改主機的系統
信任庫或 DNS 設定，除非另行取得授權。

## 5. 與 Lab01～03 的對應

| Lab | 既有內容 | Tailcat Security Lens 補上的觀點 |
| --- | --- | --- |
| Lab01 Small Cell | [Security Lens](../labs/lab01-small-cell/student-manual.md#8-security-lens)：入網時的 Identity、Authentication、Security Mode；本 profile 使用 `EEA0`，不提供 user-plane confidentiality | LTE 層的保護只涵蓋無線與核網的特定段落；應用到應用之間需要另一層保護，overlay 是其中一種做法 |
| Lab02 eMBB／eMBMS | `NOT ACTIVE`，尚無學生流程 | 暫不對應；Lab02 流程定義後再評估 |
| Lab03 uRLLC／PRP | 應用層 Split／Duplication 量測 | 可用性也是資安性質之一；overlay 的加密與封裝可能影響延遲，可作為日後的 trade-off 觀察（`NOT_TESTED`） |

## 6. 驗收計畫草案

以下每一項都是 `NOT_TESTED`，執行前需逐項取得授權，結果寫入 Task Evidence Record。

| 編號 | 項目 | 通過條件草案 | 對應問題 |
| --- | --- | --- | --- |
| T0 | 本地 DERP 可行性 | derper 以測試 CA 憑證啟動；Tailcat 兩端以本地 region 建立連線，且沒有連到 `tailcat.dev` | Q4 |
| T1 | 安裝與版本紀錄 | 兩台主機的 Tailcat 版本（或 commit）、來源與安裝方式有紀錄；不需要 root 執行 | — |
| T2 | 基準：不經 overlay 的本機服務 | Host B 的測試服務只在本機可用 | Q2 |
| T3 | 經 overlay 存取 | Host A 透過 forward 取得 Host B 測試服務的回應 | Q1 |
| T4 | 保護範圍觀察 | 外層介面擷取看不到測試標記字串；兩端 loopback 擷取看得到 | Q2 |
| T5 | 連線路徑 | 記錄實際走直接 UDP 或 DERP、使用的 relay region，以及對外連線的目的地 | Q4 |
| T6 | 存取控制 | 預設模式下，持有位址即可連入；啟用 `--allow` 後，未列名的 client key 被拒絕 | Q3 |
| T7 | 收尾 | 停止 process、移除暫時服務、Tailcat 與 derper 執行檔、測試 CA 與保存的 key，確認沒有殘留 listener | — |
| T8 | Relay 能看到什麼 | 強制或確認走本地 relay 時，在 relay 主機擷取，看不到測試標記字串；記錄 relay 可見的資訊（例如來源位址、公鑰） | Q2、Q4 |

測試內容只用自行產生的標記字串，例如 `LAB04-TAILCAT-TEST-<timestamp>`。

**機密處理：**`<tc-address>` 是連入憑證，不得寫進 Repo、TER、截圖或聊天紀錄；證據中以
`tc…<redacted>` 代替。預設 key 每次執行都重新產生，以 `tailcat genkey` 保存的 key 會讓位址
長期有效，收尾時要一併刪除或輪替。測試 CA 的私鑰同樣不得進 Repo。

上游說 `--via-derp` 允許經自建 relay 測試，但沒有說它會「強制」走 relay。T8 若無法強制，
就記錄實際路徑，不宣稱 relay 觀察已完成。

## 7. 上游事實與待確認事項

### 已確認（Tailcat README、INSTALL.md、LICENSE，2026-11-19 查閱）

- **授權條款：**BSD-3-Clause。
- **帳號與權限：**不需要 Tailscale 帳號，也不需要 root；WireGuard 在 userspace 執行，
  不建立 TUN／TAP 裝置，不改路由或 DNS。
- **穩定性：**上游明寫 CLI flags、輸出與 wire format 都沒有穩定性承諾。因此不指定版本，
  但每次執行都要記錄實際版本或 commit，並以當次 `--help` 為準。
- **版本：**查閱時 Releases 最新為 v0.7.0（2026-09-19），提供 Linux `.deb`、`.rpm`、
  tar.gz 與 `checksums.txt`；畫面上沒有看到 asset 簽章檔。
- **DERP：**預設使用 Tailscale 營運、有速率限制的公開 relay（`tailcat.dev` 的 DERP map），
  沒有 SLA。自建 relay 用 `derper`，只能以 `go install tailscale.com/cmd/derper` 安裝，
  沒有套件。Relay 只看得到加密後的 WireGuard 封包，但看得到兩端公鑰；pre-shared key
  讓 relay 營運者無法加入隧道。
- **自建 DERP 文件的狀態：**Tailscale KB 標示 custom DERP 為 alpha（2026-10-07 驗證）。

### 安裝方式（Owner 交由 Claude 決定，2026-11-19）

- **Tailcat：**使用 GitHub Releases 的 Linux tar.gz，解壓到使用者目錄，以
  `checksums.txt` 驗證 SHA-256 後執行。理由：不需要 root、不寫入系統套件資料庫、收尾時刪除
  目錄即可，版本由 release tag 固定。執行前以 `uname -m` 確認兩台主機的 CPU 架構再選檔。
- **derper：**relay 放在控制端 Mac，直接以 Mac 上的 Go 1.27 編譯原生執行檔，固定使用某個
  Tailscale release tag，不用 `@latest`。實驗主機不需要安裝 Go toolchain，也不必跑 relay。
  Mac 上的 port 與防火牆設定在 T0 前確認，結束後停止 derper 並移除執行檔。
- 兩者的版本、SHA-256 與來源都寫入 TER。

### Owner 已決定（2026-11-19）

- 先做選項 A，主機為 `5g-linux1-audit` 與 `5g-linux2-audit`。
- 兩台主機以手機熱點連外。
- 不指定 Tailcat 版本；安裝方式交由 Claude 決定（見上節）。
- 自建本地 DERP，放在控制端 Mac（192.168.250.10），作為 Security 觀察的一部分；可行性以 T0
  驗證，不通過時退回公開 DERP。

### 仍待確認

- derper 使用的 Tailscale release tag，以及自建測試 CA 的做法（T0 前定案）。
- 兩台主機的 CPU 架構與熱點連線狀態（T1 時確認，屬遠端唯讀檢查，仍需當次授權）。

## 8. 授權關卡

本文件只是提案，不授權任何操作。依 [AGENTS.md](../AGENTS.md) 與
[Remote Agent Policy](../docs/engineering/CODEX_REMOTE_AGENT_POLICY.md)：

1. 遠端存取、軟體安裝、啟動 process、封包擷取，每一類動作都需要 Owner 當次明確授權。
2. 選項 B 另需 RF／Runtime 授權、安全控制與停止條件。
3. 每輪執行結束後以 Task Evidence Record 保存證據，並在本文件更新各項狀態。

## 9. 來源

- [2026-08-18 Professor Meeting Decision Record](../docs/decisions/2026-08-18-professor-meeting.md)：PD-02
- [Decision Register](../docs/decision-register.md)：DR-011、DR-016
- [Interactive Lab Lab04 提案視角](../exploration/5g-sdr-interactive-lab/js/data/lab04.js)：`PROPOSED`
- [Tailcat 理論範例](../exploration/5g-sdr-interactive-lab/js/data/tailcat-example.js)：官方 README 轉錄，2026-10-04
- [Tailcat 官方 README](https://github.com/tailscale/tailcat)：2026-11-19 查閱 README、INSTALL.md、LICENSE
