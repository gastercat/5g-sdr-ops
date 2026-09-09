# Starlink Direct to Cell：LEO／NTN 實際案例

狀態：`EXTERNAL REFERENCE / RESEARCH ONLY / NOT_INTEGRATED`
查核日期：2026-09-09；Human Review：`ACCEPTED WITH EXPERIMENT LIMITATION`

Human Review 已接受本次五檔文件整合。Team 實驗有可追溯的 worker 貢獻，但未建立
相對單 Agent 的優勢；因未明訂歷史證據隔離限制，也未建立與 legacy `/Team-mode`
的獨立盲測收斂。這不改變研究 lifecycle 或 frozen legacy evidence 的 `NON_NORMATIVE` 地位。

Starlink Direct to Cell 提供一個以低軌衛星直接服務 LTE 手機的外部案例：它讓本目錄的
handover、Doppler 與服務連續性問題有具體背景，但不證明本 Repo 的
[Neuro-Symbolic RRM 候選架構](neuro_symbolic_rrm_handoff.md) 正確或必要。
本案例只整合進研究文件；Lab01／Lab02 與本研究的實作狀態不變。

## 案例事實與來源範圍

以下 `KNOWN / SOURCE-SUPPORTED` 表示公開第一手文件支持該敘述，並非本團隊實測。
來源日期與定位見文末 ledger；本文保存指定時點的案例，不作目前全球可用服務清單。

| ID | KNOWN / SOURCE-SUPPORTED | 適用範圍 |
| --- | --- | --- |
| C1 | Starlink 表示，2024-01-08 透過 Direct to Cell 衛星與 T-Mobile 頻譜，完成未改裝手機的雙向簡訊測試；系統使用 LTE／4G。 | 供應商的歷史測試報告，並非所有裝置、地區或服務均可用。[S1](https://starlink.com/public-files/DIRECT_TO_CELL_FIRST_TEXT_UPDATE.pdf) |
| C2 | 早期技術報告描述 LEO 衛星上的 LTE modem，並以 laser backhaul 接入 Starlink 網路；與合作電信商的整合類似 roaming partner。 | 高階產品架構，未揭露完整 core／RAN protocol split。[S1](https://starlink.com/public-files/DIRECT_TO_CELL_FIRST_TEXT_UPDATE.pdf) |
| C3 | 2025-07-23，T-Mobile 發布 T-Satellite 當日可用的公告，描述衛星訊息服務；文中的 app 能力是後續計畫。 | 美國電信商的 dated launch evidence；不把後續計畫當成當日或目前已驗證能力。[S2](https://www.t-mobile.com/news/network/t-satellite-now-available) |
| C4 | Starlink 的早期技術報告列出高速相對移動、Doppler、時序延遲，以及手機低天線增益／發射功率等挑戰。 | 支持研究問題的存在，不提供可直接使用的控制門檻或效能保證。[S1](https://starlink.com/public-files/DIRECT_TO_CELL_FIRST_TEXT_UPDATE.pdf) |

## LEO、NTN 與行動通訊世代要分開

`INFERENCE / WORKING CLASSIFICATION`：LEO 描述軌道；本案例使用 NTN 作為
「非地面接取」的廣義分類。
LTE／NR 則是無線接取技術。不能因為訊號來自衛星，就把產品標成 NR-NTN 或 6G。
本目錄名稱中的「6G」是既有研究方向，不是 Starlink 此案例的產品世代。

| 比較面向 | 本案例可支持的理解 | 不能據此推出 |
| --- | --- | --- |
| Starlink Direct to Cell | 公開描述為 LTE 手機接取、onboard LTE modem。[S1](https://starlink.com/public-files/DIRECT_TO_CELL_FIRST_TEXT_UPDATE.pdf) | 已採用 NR、gNB、5GC 或通過 Rel-17 NR-NTN conformance |
| 3GPP NR-NTN | TR 38.863 的 metadata 列出初始 Rel-17 與 `NR_NTN_solutions-Core` 關聯。[S3](https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=3926) | Starlink 產品屬於該 work item 或已通過標準驗證 |
| 3GPP IoT NTN | TR 36.763 研究 NB-IoT／eMTC 的 NTN 支援，metadata 明確區分 LTE RAN 與 NR。[S4](https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=3747) | 所有 LTE 手機衛星服務都是此 IoT NTN 方案 |

這是分類與證據邊界，並非對 Starlink 所有產品版本作「不符合任何 NTN 標準」的判定。
S3、S4 本次只查核官方 metadata，沒有進行完整 normative specification 或 conformance review。

## 對既有研究的價值

下表是 `INFERENCE / RESEARCH QUESTIONS`，不是 implementation requirements 或已接受的
architecture bridge；不授權資料蒐集、simulator、adapter、runtime 或 protocol 實作。

| 外部案例帶來的問題 | 可用來質疑既有候選架構之處 | 尚缺的證據 |
| --- | --- | --- |
| 衛星、波束與手機之間的可見窗口會變動 | 只看 SINR 或模型 confidence 是否足以選擇目標？visibility 與 dwell time 的來源是否可靠？ | 可見窗口、beam／cell mapping 與量測更新時序 |
| Doppler 與時序延遲需要處理 | 候選 guard 使用的 residual CFO／delay 是實測、估算，還是根本不可取得？ | 補償後的量測、誤差分布與介面可用性 |
| 服務連續性與衛星移動相關 | 衛星切換、beam 切換與 UE 可見的 RRC handover 是否真的一一對應？ | Protocol traces、trigger、timer 與核心網路錨定方式 |
| 終端 link budget 有限制 | 發生 link loss 時，deterministic fallback 是否仍有可用動作？ | 中斷條件、恢復行為與可用量測 |

`UNKNOWN`：這些來源未建立 Starlink 的 handover state machine、scheduler policy、
內部 telemetry、Doppler compensation 演算法、AI 使用情況或 fallback 設計。
商業服務的存在不能支持「Starlink 使用 AIProposal／SymbolicGuard／lambda(t)」。
既有 prototype 仍須與更簡單的 deterministic 方法比較，案例本身無法裁定哪種設計較好。

## 與 Repo 架構的關係

Lab01 保存的是 Linux1 EPC／eNB、Linux2 UE 與 ZeroMQ sample transport 的有界歷史證據，
詳見 [canonical architecture](../../architecture-overview.md) 與
[current checkpoint](../../../PROGRESS.md)。LTE／eNB 術語相近，不表示 Lab01 能重現衛星
channel、beam mobility 或 Direct to Cell。既有 ICMP RTT 也不能當作衛星 latency。

本次未改 source、configs、scheduler、MAC／RRC、runtime、validation record 或研究 roadmap。
NTN lifecycle 維持 [研究入口](README.md) 所列 `RESEARCH_PARKING / NOT_INTEGRATED`；
任何後續實作仍需要另行定義 scope 與授權。

## Source ledger

全部來源於 2026-09-09 開啟查核；保留定位與日期，不保存整份外部文件。
供應商與電信商對服務的報告屬第一手自述；3GPP metadata 則只裁定標準文件分類。

| ID | 來源與日期 | 查核定位／支持內容 |
| --- | --- | --- |
| S1 | [SpaceX first text update](https://starlink.com/public-files/DIRECT_TO_CELL_FIRST_TEXT_UPDATE.pdf)；內文明示 2024-01-02 launch／01-08 test，精確發布日未列 | PDF pp. 1–3：測試、LTE、LEO、物理限制、Starlink 到 operator core 的高階路徑；舊 roadmap 不作現況 |
| S2 | [T-Mobile — We Don't Just Build Networks – We Show Up](https://www.t-mobile.com/news/network/t-satellite-now-available)；2025-07-23 | 當日上線與 messaging 描述；不採泛化 coverage 保證、用戶引言或未來 app 計畫作效能 evidence |
| S3 | [3GPP TR 38.863 metadata](https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=3926)；2021-07-21 建檔 | General／Related Work Items：初始 Rel-17、NR NTN 工作項目；不是產品認證 |
| S4 | [3GPP TR 36.763 metadata](https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=3747)；2020-04-20 建檔，2020-04-21 clarification | General／Remarks：NB-IoT／eMTC，LTE RAN 而非 NR；不是 Starlink compliance evidence |
