# 6G LEO / NTN Handover Research Parking（研究停放區）

[Exploration 入口](../../../exploration/README.md) · [Delivery 入口](../../../delivery/README.md)

> **Research Parking（研究停放）**
>
> **不屬於目前 Lab01 / Lab02 validated mainline（已驗證主線）**
>
> **尚未驗證真實 LEO / NTN Runtime integration**

- Lifecycle：`RESEARCH_PARKING / CONCEPT_PROTOTYPE`（研究停放／概念原型）
- Implementation status：`NOT_INTEGRATED`（尚未整合）

## 目的（Purpose）

本目錄保存一套供未來 6G LEO / NTN 研究使用的候選 Neuro-Symbolic RRM /
Handover Supervisor 架構，以及用來檢視研究問題的外部案例。將內容保存於 Repository
只代表文件化，不代表實作、部署、
符合標準或具備 Runtime evidence。

## 研究狀態（Research Status）

目前已定義一套 research prototype architecture，其中結合 AI proposal、symbolic guard、
dynamic trust arbitration、deterministic fallback（確定性回退策略）與 PHY-aware
constraints。此架構是未來 6G NTN / LEO handover 研究的候選起點。

本文件並未實作或驗證真實 LEO handover、NTN scheduler integration、
srsRAN scheduler integration、MAC / RRC mobility control 或 Doppler compensation。

## 核心架構（Core Architecture）

候選流程如下：

`PHY/MAC Telemetry` → `Observation Builder` → `AI Agent` → `AIProposal` →
`SymbolicGuard` → `DynamicArbitrator lambda(t)` → `RRMAction` →
`Protocol Adapter` → `MAC / RRC / Scheduler / Mobility Execution`

此架構將 AI 輸出限制在 proposal 層級。Protocol causality 與 PHY 條件可以否決 proposal，
仲裁結果則選擇已接受的 proposal 或 deterministic fallback。

## 實作 Roadmap（Implementation Roadmap）

- **Phase A — Pure Simulator：**使用合成的 orbit、link、mobility 與 handover observation
  評估此架構。
- **Phase B — 5G SDR Observability Integration：**評估既有非敏感 logs 與 metrics 是否能
  對應至研究用 observation structures。
- **Phase C — RRM / Handover Adapters：**必須另行取得設計、實作、安全與 Review 授權後，
  才能評估 adapters。

三個 Phase 都是未來候選，不是目前的實作狀態。

## 與目前 5G SDR 的關係（Relation to Current 5G SDR）

目前專案未來可能提供 srsRAN / srsLTE logs、PHY 與 MAC metrics、RRC events、
packet observations 與 ZeroMQ timing 等 observability 參考。本目錄不宣稱上述來源已完成
對應、可供本研究使用或已與 NTN model 整合；也不變更任何 Lab01 / Lab02 Runtime、
configuration、scheduler、source code 或 validation record。

## 目前限制（Current Limitations）

- 不宣稱符合 3GPP NTN compliance。
- 沒有真實 LEO / NTN handover 實作。
- 沒有 srsRAN scheduler integration。
- 沒有 MAC / RRC mobility-control implementation。
- 沒有通過驗證的真實 Doppler compensation。
- 尚未接受與其他 RAN control architecture 的 bridge；任何此類 bridge 都需要另行進行
  research intake 與決策。

## 入口文件（Entry Documents）

- [Starlink Direct to Cell：LEO／NTN 實際案例](starlink-direct-to-cell-reference.md)
  — 外部 LTE 衛星服務的來源查核、NR-NTN 分類邊界與研究問題；不是 6G 產品、
  prototype validation 或新的 implementation scope。
- [6G LEO / NTN 的 Neuro-Symbolic RRM 與 Handover Supervisor](neuro_symbolic_rrm_handoff.md)
  — 包含實質架構、state-machine constraints、edge cases、概念性 pseudocode 與
  candidate roadmap。
