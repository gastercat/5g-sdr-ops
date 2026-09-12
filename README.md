# 5G SDR Operations

狀態：`ACTIVE DOCUMENTATION REPOSITORY`
目前專案狀態權威：[`PROGRESS.md`](PROGRESS.md)

本 Repository 保存 5G SDR 專案的治理文件、已審閱的技術知識、非敏感稽核證據、
Runbook 與研究停放入口。它不是 Lab Runtime、`srsRAN_4G` 原始碼倉庫，也不直接
操作 `/etc/srsran/`、服務、網路或 SDR 設備。

## 從這裡開始

本專題採 **Delivery First / Exploration Decoupled**：交付方向為 Lab01～03 與
cross-cutting Security；研究與工程延伸另行保存，不成為課程完成的前提。

| 想找什麼 | 入口 |
| --- | --- |
| 教授／學生：最低交付方向、現有材料與缺口 | [Delivery](delivery/README.md) |
| Lab01 學生直接開始閱讀 | [學生實驗手冊](labs/lab01-small-cell/student-manual.md)、[教學設定](labs/lab01-small-cell/student-config/README.md) |
| Agent、Git workflow、AI、Team-mode、Harness、6G／LEO／NTN、Starlink、Control Plane 研究 | [Exploration](exploration/README.md) |
| 歷史結果、audits、Task Evidence、簡報與舊報告 | [Historical／Evidence](docs/history/README.md) |
| 目前工程狀態與下一關 | [PROGRESS](PROGRESS.md)、[TODO](TODO.md) |
| 架構、決策、限制、Repository 治理 | [Shared project controls](docs/README.md) |
| 分類理由、保留原位與尚待判斷的材料 | [Documentation map](docs/documentation-map.md) |

Lab01 手冊目前為 `DRAFT / HUMAN REVIEW REQUIRED`；其存在不代表 Full Lab01 PASS。
Lab02／03 的交付方向與既有薄弱材料在 Delivery 入口分開列明；Security 不再是第四套必做
Runtime。最新驗證狀態以 `PROGRESS.md` 為準，不以歷史成果展示替代。

來源檔案保留原路徑，避免破壞 evidence 與 archive provenance；`docs/teaching/` 的 Agent + Git
骨架依實際 lifecycle 歸於 Exploration／Historical，不是 current student curriculum。

## Source Authority

每個 claim 都必須依問題選擇來源，不能只依檔名或出現次數判斷權威：

1. 當次明確 Human decision 可裁定授權與 project decision domain。
2. 直接、可追溯的 execution evidence 可裁定當時觀察到的 Repo 或 Runtime 狀態，
   但不能自行提供後續授權。
3. `PROGRESS.md` 保存目前 project checkpoint；它不取代更細緻的 evidence boundary。
4. Procedure、Runbook 與 policy 說明如何安全工作，不代表該操作已獲授權或已執行。
5. 歷史文件、簡報、Conversation SoE 與 Handoff 提供 provenance；未與目前證據核對前，
   不得單獨升格成 current truth。

`Authentication` 回答身分、`Authorization` 回答可執行範圍、`Source Authority`
回答本次 claim 應以哪份證據或決策為準；三者不可互相替代。

## Repository Provenance

- 最早可達 Git commit：`a8412774347e6f2e2e2f3489ec1ba38d731a36f0`
  （2026-06-24，`docs: bootstrap 5G SDR ops repo`）。這是 Repo 實際 materialization
  的 Git evidence，不回推早期 proposal 日期。
- `CONTRIBUTING.md` 首次出現在
  `b19d0082c2eda7263832eb9cb12f1c672a89715b`，其後由 PR #1 進入 main history。
- PR #15 的 main commit `3387ce003f2aef839b444c6fa169f25ea4922de5` 保存 Lab01
  baseline recovery presentation delivery。
- PR #16 的 main commit `4eda478e77e440f6a19be48f0354e9a00b00f028` 保存
  2026-08-04 presentation archive。
- PR #17～#19 的 main commits `4262e95`、`17464f0`、`fa9ea8b` materialize 並增補
  Agent + Git Runbook。
- PR #20 的 main commit `885c6104675d5b7e59d8ae69c8aa02cc5b53eff7` 保存
  Future Teaching 與 6G NTN Research Parking 骨架。

## Historical and Supporting Material

歷史與 supporting material 的完整閱讀入口是 [Historical／Evidence](docs/history/README.md)。
其中 Lab01 evidence 仍支撐現有 claim；舊簡報、bootstrap backlog 與 superseded learner drafts
保留原位。教授決策仍依其適用範圍有效，不能因列在歷史導覽就視為失效。

## 安全與 Lifecycle 邊界

- 不得把 Secret、Ki、OPC、token、SSH private key 或敏感 subscriber data 寫入 Git。
- Git 提供 change tracking 與 Review surface，不是 OS sandbox，也不是 Runtime rollback。
- Dedicated SSH key 提供 credential separation 與 revocation boundary，不等於 Linux
  permission isolation、Runtime authorization 或 OS sandbox。
- Tool capability 不等於 authorization。
- Agent task completed 不等於 Human accepted、Ready for PR 或 Merged。
- 任何 Runtime start、persistent network change、configuration deployment 或 extended
  validation 都需要獨立、明確的 Human authorization。

## 協作與 Handoff

Project-facing state 由 `PROGRESS.md`、Git 與上述 canonical 文件承擔。私人 Handoff
不屬於 project Agent Harness。未來 Handoff 只應保存 navigation + delta：current delta、
stop point、next authorized gate、blocking unresolved item 與 canonical pointers；不得再複製
完整 architecture history、decision rationale 或 transitive Handoff chain。

依 2026-08-18 PD-06，Project Lead 可先完成 Lab01、Lab02，再於 stable implementation 後
進行 collaborator knowledge transfer；不要求 collaborators 同步完成。這是 sequencing
authority，不表示 permanent solo ownership、不自動授權 Runtime 或 Lab02 execution，也不
免除 collaborators 的 future responsibilities。Knowledge-transfer acceptance criteria 與共同
Review checkpoints 仍是 unresolved implementation details；見
[`DR-009`](docs/decision-register.md) 與
[`Professor Meeting Decision Record`](docs/decisions/2026-08-18-professor-meeting.md)。
