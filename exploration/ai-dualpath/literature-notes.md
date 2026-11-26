# 雙路徑傳送與 LEO 鏈路文獻對照（草案）

[工具與說明](README.md) · [競賽方案](competition-plan.md) · [路徑 A 劣化注入程序（草案）](degradation-procedure.md) ·
[Lab03 材料與交付缺口](../../labs/lab03-urllc/README.md) ·
[6G／LEO／NTN Research Parking](../../docs/research/6g-ntn-handover/README.md)

狀態：`EXPLORATION / LITERATURE_NOTES / HUMAN REVIEW REQUIRED`

本文件整理 6 個外部來源（5 篇文獻，其中一篇另有 IETF 簡報）與本 Repo 現有工作的對應，判斷哪些部分本專案做得到。

- 內容依據各來源的摘要、公開頁面或簡報整理（查閱日期 2026-11-26）；除特別註明外，未逐頁核對全文。
  寫進報告或程式註解前，需回到原文確認數值與上下文。
- 文中「可以做」是可行性判斷，**不授權**任何 Runtime、RF、網路或安裝操作；
  執行仍需當次的 Owner 授權。
- 本文件不改變 [README](README.md) 中 `SIMULATED_PROOF_OF_CONCEPT` 的定位，也不形成 Lab01～03 的交付條件。

## 1. 總覽

| 代號 | 來源 | 類型 | 與本 Repo 的對應 | 可行性 |
| --- | --- | --- | --- | --- |
| L1 | Kang et al., *Deadline-Aware Redundant Transmission on Multi-Paths for Real-Time Service*（DART），IEEE Access 2025 | 演算法 | `policies.py` 的候選新策略 | 可以做（單向延遲需另行處理） |
| L2 | Aijaz, *Packet Duplication in Dual Connectivity Enabled 5G Wireless Networks: Overview and Challenges* | 綜述 | Lab03 Duplication Mode 的理論背景 | 可引用；PDCP 層實作目前做不到 |
| L3 | Michel et al., *A First Look at Starlink Performance*，ACM IMC 2022 | 量測 | 量測方法、`leo_profile.py` 參數出處 | 方法可借用；真實 Starlink 量測做不到 |
| L4 | Mohan et al., *A Multifaceted Look at Starlink Performance*（論文與 IETF 123 IRTF Open 簡報） | 量測 | `leo_profile.py` 的 15 秒模型與措辭 | 模型修正可以做；全球量測做不到 |
| L5 | Zhao & Pan, *QoE-driven Joint Decision-Making for Multipath Adaptive Video Streaming*，IEEE GLOBECOM 2023 | 演算法＋實測 | LinUCB 對照、LinTS、劣化注入方式 | 可以做（實驗主機上的 tc 需授權） |

## 2. 逐篇對照

### L1：DART（IEEE Access 2025）

- 內容摘要：針對影音串流、線上遊戲等有時限的資料，指出多路徑下以重傳補救容易錯過期限。DART 依各路徑的
  下次可傳送時間與單向延遲，主動在多條路徑送冗餘封包，以較少的額外負擔趕上期限；容量不足時優先送出
  佇列中最小的資料塊以避免死結。
- 對應：與本目錄「每個封包決定走 A、走 B 或兩路都送」的問題幾乎相同。
- 可以做：在 `policies.py` 新增 DART 類策略，與門檻規則、LinUCB 一起用 `evaluate.py` 離線比較；
  取得授權後可用 `adaptive_send.py` 在 OTA 上執行。
- 限制：
  - DART 使用單向延遲，現有工具量測的是來回時間。需先做兩台主機的時間同步，或以 RTT/2 近似並在結果中標示。
  - 本專案以單一封包為單位，DART 以資料塊為單位，需決定如何對應。
  - 只讀到摘要；IEEE 頁面未取得全文，演算法細節 `NEEDS_CONFIRMATION`。

### L2：封包複製與雙連線（Aijaz）

- 內容摘要：綜述 URLLC 對空中介面的要求；說明 PRP 透過兩個獨立網路傳送重複封包以提高可靠度、降低延遲，
  在行動網路中可透過雙連線實現；並回顧 3GPP 在 5G 加入的封包複製功能與其挑戰。
- 對應：Lab03 的 Duplication Mode 與 ai-dualpath 的 `dup` 策略。
- 可以做：作為 Lab03 說明「應用層複製對應到哪個標準概念」的背景文獻。
- 做不到：本文為綜述，沒有可重現的實驗。PDCP 層複製與雙連線在 Repo 中仍為 `NEEDS_CONFIRMATION`，
  兩台主機沒有 nukxURLLC，目前不能宣稱已實作。

### L3：A First Look at Starlink Performance（IMC 2022）

- 內容摘要：以單一歐洲站點量測 Starlink，與同步軌道衛星服務及有線網路比較延遲、吞吐量、掉包與網頁載入。
- 方法重點：
  - QUIC 測試分為 100 MB 大量傳輸，以及約 3 Mbit/s、每秒 25 則 5～25 kB 訊息的輕量負載。
  - 由 QUIC 封包編號的缺口推算掉包率。
- 數值重點：到鄰近錨點的最小 RTT 約 20 ms，到歐洲目標的中位數約 50 ms；大量傳輸時 RTT 中位數升至約 95／104 ms
  （下載／上傳），p99 約 210／310 ms。
- 可以做：
  - 現有封包帶 Packet ID，可用相同方式由編號缺口計算遺失。
  - 以「每秒 25 則小訊息」作為 `adaptive_send.py` 的標準測試負載之一。
  - 作為 `leo_profile.py` 延遲參數的文獻出處。
- 做不到：真實 Starlink 量測（沒有衛星終端）。
- 作者自述限制：單一站點、錨點與網站數量有限，屬初步特性描述。

### L4：A Multifaceted Look at Starlink Performance（論文與 IETF 簡報）

- 內容摘要：結合群眾外包測速、應用測試、RIPE Atlas 探針與受控天線實驗，分析 Starlink 的全球表現。
- 重點發現（依 IETF 簡報）：
  - 吞吐量與 RTT 在全球同步的 15 秒邊界改變，同一區間內大致穩定。
  - 作者原本推測是每 15 秒換手，但只有一顆衛星可見時效能仍在邊界改變、連線也會在邊界中斷，
    因此認為較可能是網路負載平衡，而非換手。
  - 有傳輸時 RTT 上升為 2～4 倍。
- 對應與可以做：
  - `leo_profile.py` 已採每 15 秒換一次鏈路的模型，本文可作為其出處，處理
    [README](README.md#哪些是量測哪些是模擬) 中參數為 `NEEDS_CONFIRMATION` 的問題。
  - README 目前描述為「每 15 秒換一次鏈路、換手後短暫中斷」。依本文，宜改稱「15 秒重新配置」，避免與文獻矛盾。
  - 模型可加入「負載越高、延遲越大」的效應；目前沒有。
  - 作者使用的 IRTT 是開源的細粒度延遲量測工具，可在 OTA 鏈路上與現有探測工具交叉驗證（需授權）。
- 待確認：現有模型的 150 ms 中斷長度，尚未在本文找到對應數值（`NEEDS_CONFIRMATION`）。
- 做不到：M-Lab 群眾外包資料、RIPE Atlas、衛星間鏈路、地面站與 TLE 衛星追蹤分析。

### L5：QoE 導向的多路徑串流聯合決策（GLOBECOM 2023）

- 內容摘要：以情境式多臂吃角子老虎同時選擇路徑與位元率，比較 LinTS、LinUCB 與 minRTT、輪流排程。
- 方法重點：
  - 以 Mininet 模擬兩條路徑：一條模仿衛星（高頻寬、高延遲），一條模仿鄉村寬頻（低頻寬、低延遲），
    參數依 Starlink 量測的常態分佈設定。
  - 實測時以 tc 將寬頻路徑限制在約 20 ms、30 Mbps。
- 結果重點：模擬與實測中，兩種 CMAB 方法都優於基準；實測時 LinUCB 位元率最高、重新緩衝最少。
- 對應與可以做：
  - 在 `policies.py` 新增 LinTS，與 LinUCB 一起比較。
  - 解釋本 Repo 的 LinUCB 為何沒有勝過門檻規則（`HYPOTHESIS`）：該文的兩條路徑本來差異就大，
    而本專案路徑 A 在 OTA 上很穩定，策略沒有東西需要學。可作為「需要真實劣化」的論證。
  - tc／netem 對應 [劣化注入程序](degradation-procedure.md) 的做法 A。先在 Mininet 或本機 loopback 試，
    在實驗主機上執行屬網路變更，需 Owner 授權。

## 3. 總結

| 可以做（文件或程式，不需 Runtime） | 需 Owner 授權才能做 | 目前做不到 |
| --- | --- | --- |
| 為 `leo_profile.py` 補文獻出處並修正「換手」措辭；加入負載相關延遲；新增 DART、LinTS 策略並離線比較；Lab03 引用 PRP／封包複製背景 | OTA 上執行新策略；實驗主機上以 tc／netem 注入劣化；為單向延遲做時間同步；以 IRTT 交叉量測 | 真實 Starlink／LEO 量測；PDCP 層複製或雙連線；5G NR（目前為 srsRAN_4G LTE） |

建議第一步：修正 `leo_profile.py` 與 README 的出處和措辭。只動文件與模擬參數，並直接處理現有的
`NEEDS_CONFIRMATION`。

## 4. 來源

- L1：<https://doi.org/10.1109/ACCESS.2025.3553539>
- L2：<https://arxiv.org/abs/1804.01058>
- L3：<https://research.dial.uclouvain.be/server/api/core/bitstreams/4823fc83-2489-4cba-b536-aeeb27042bf7/content>
- L4（論文）：<https://arxiv.org/abs/2310.09242>
- L4（IETF 123 簡報）：<https://datatracker.ietf.org/meeting/123/materials/slides-123-irtfopen-a-multifaceted-look-at-starlink-performance-01.pdf>
- L5：<https://pan.uvic.ca/~clarkzjw/static/globecom23.pdf>
