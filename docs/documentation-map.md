# Repository Documentation Map

日期：2026-09-12；用途：documentation architecture 分類與 Review record。
[文件導覽](README.md) · [Delivery](../delivery/README.md) · [Exploration](../exploration/README.md) · [History](history/README.md)

## 分類依據與實體 layout

本文件記錄 Delivery First／Exploration Decoupled 的 documentation architecture 與
classification decision；分類本身不授予實作、Lab validation 或 Runtime 操作權限。
既有 PD-01～06 提供課程方向，technical／validation 狀態仍依原始文件與 evidence。

採 **index split，來源原位保存**。新增 `delivery/README.md`、`exploration/README.md` 與
`docs/history/README.md`；`docs/README.md` 整理 shared controls。此處的用途分類是本次
文件架構判斷，不是 technical acceptance 或所有權轉移；責任以中性角色表達。

理由：同一份 evidence 可支援 Delivery 又保存歷史，Runbook 同時有內部 reference 與
superseded learner 部分。整包搬動會掩蓋這些差異，並改變大量 canonical／archive 引用。
因此本次實體 moves／deletions 為零；archive payload 與 manifest 保持原樣，避免只為對稱
資料夾而破壞 provenance。

## Inventory 與 classification

盤點範圍為本 Repo tracked files 與本機文件 inventory；未讀取 Repo 外私人材料、Lab host、
active config 或 Secret。下表以用途一致的 artifact family 分組，涵蓋 root、docs、labs、
agent-prompts、checklists、reports、teaching、research、evidence 與二進位附件。

| Artifact／family（原路徑） | 用途、讀者與 lifecycle | 最終導覽與處置 |
| --- | --- | --- |
| [README](../README.md) | 初次讀者總入口 | Shared；優先分流 Delivery／Exploration |
| [PROGRESS](../PROGRESS.md) | Maintainer／Reviewer checkpoint 與 stop point | Shared + Delivery supporting；只加 navigation delta，不重寫 Runtime history |
| [TODO](../TODO.md) | 待辦 lifecycle | Shared；拆開 Delivery、communication supporting、optional exploration |
| [AGENTS](../AGENTS.md)、[CONTRIBUTING](../CONTRIBUTING.md)、[recovery skill](../.agents/skills/lab01-baseline-recovery/SKILL.md)、`.gitignore` | Repo safety／change control；不是學生教材 | 保留控制位置與適用權限；skill／gitignore 不改 |
| [Architecture](architecture-overview.md)、[decision register](decision-register.md)、[limitations](known-limitations.md) | Canonical 跨工作線知識；支撐交付審查 | Shared + Delivery supporting；正文不改 |
| [Professor decision record](decisions/2026-08-18-professor-meeting.md) | 有持續 current effect 的 project decision provenance | Shared + History 導覽；不降為失效資料 |
| [Glossary](glossary.md) | 一般通訊背景 | Delivery supporting；不等於全部詞條都是已交付功能 |
| [Hardware notes](hardware-notes.md) | 混合一般背景、硬體候選與操作方向 | Shared reference；課程必要範圍 `UNRESOLVED`，保留原位 |
| [Device status](device-status.md) | Bootstrap 設備候選與待確認狀態 | History；不是 fresh hardware inventory |
| [Project status](project-status.md)、[engineering TODO](engineering/TODO.md) | 已 superseded 的 bootstrap／recovery navigation | History；保留來源，不重算 checkbox |
| [Project direction](project-direction.md) | Historical candidate directions，含 O-RAN／FPGA／6G 等 | History + Exploration；未採納的 roadmap 不升格 |
| [Configuration governance](engineering/CONFIGURATION_GOVERNANCE.md)、[remote agent policy](engineering/CODEX_REMOTE_AGENT_POLICY.md) | Maintainer 目前需遵循的 repository／runtime 邊界；原 draft 狀態保留 | Shared controls；研究治理不代表可忽略現行控制 |
| [AI workflow](ai-workflow.md) | Internal engineering 方法與歷史 debugging 範例 | Exploration；加用途標示，不重驗舊技術規則 |
| [Agent + Git Runbook](runbooks/agent-git/README.md) | Internal engineering reference + superseded learner sections | Exploration；加返回入口，保留內容與 verification gaps |
| [Agent + Git teaching skeleton](teaching/agent-git/README.md) | Historical teaching experiment／Gate 4A feedback | Exploration + History；不因 `teaching/` 路徑變成 current course |
| [NTN research index](research/6g-ntn-handover/README.md)、[Neuro-Symbolic RRM](research/6g-ntn-handover/neuro_symbolic_rrm_handoff.md)、[Starlink reference](research/6g-ntn-handover/starlink-direct-to-cell-reference.md) | Research parking、concept prototype 與外部案例 | Exploration；保留 `NOT_INTEGRATED`，僅加 index 導覽 |
| [Generic task template](../agent-prompts/codex-task-template.md)、[review checklist](../checklists/agent-review-checklist.md) | Maintainer workflow tooling；模板不是授權 | Exploration + Shared supporting；保留 root 位置 |
| [NTN Luna Team task](../agent-prompts/ntn-reference-luna-team.md) | 一次 bounded experiment 的 task package | Exploration + History；不是本次 refactor 的執行指示或常駐 Team |
| [Lab01 README](../labs/lab01-small-cell/README.md) | 混合導航與 bootstrap 目標 | Delivery anchor；學生入口優先，原始正文標 Historical |
| [Student manual](../labs/lab01-small-cell/student-manual.md) | Student procedure draft、core／optional、protocol／Security、troubleshooting、提交 checklist | Delivery；原文與 DRAFT 狀態不改 |
| [Student config README](../labs/lab01-small-cell/student-config/README.md)、同目錄 `epc.conf`、`enb.conf`、`ue.conf.template`、`sib.conf`、`rr.conf`、`rb.conf` | Student-safe profile 與 TA provisioning；static reviewed／未 isolated Runtime validate | Delivery；全部 bytes 不改，不部署 |
| Lab01 [runbook](../labs/lab01-small-cell/runbook.md)、[recovery checklist](../labs/lab01-small-cell/recovery-checklist.md)、[known issues](../labs/lab01-small-cell/known-issues.md)、[result summary](../labs/lab01-small-cell/result-summary.md) | Historical lower-authority notes | Delivery supporting + History；加標示與手冊連結，不提升舊 NEEDS_CONFIRMATION |
| [Lab02 README](../labs/lab02-embb/README.md) | Delivery intent + historical protocol／parser／PCAP 待確認筆記 | Delivery anchor；舊列表不直接等同 minimum，保留技術正文 |
| [Lab03 README](../labs/lab03-urllc/README.md) | Delivery intent + historical hardware／PRP 方向 | Delivery anchor；baseline／Split／Duplication 方向可見，criteria 待定 |
| [Lab04 README](../labs/lab04-security/README.md) | Independent post-Lab model superseded | History + future Security mapping input；保留原位，不是第四套必做 Runtime |
| [Audits](history/README.md) 下 2026-07-10 rollback inventory、config tree、SHA-256 三份文件 | 日期限定的 residue／metadata evidence | History + canonical evidence dependency；不改 bytes／paths |
| [TEH](evidence/task-evidence/README.md)、template 與既有四份 TER | Evidence-only 機制與 recovery／runtime／research provenance | History + Shared mechanism；舊 YAML 不改，新 refactor TER 另立 |
| 六份 `reports/2026-07-14-lab01-*.md` | Claim audit、outline、speaker notes、Q&A、diagram plan、slide assets plan | History + Delivery supporting；audit 仍是 canonical dependency，其他是舊 presentation preparation |
| `presentations/2026-07-14-lab01-baseline-recovery.{pdf,pptx}`、`assets/` contact sheet 與 20 張 rendered slides | 歷史成果展示與 rendering payload | History；不是指定 final report，bytes／paths 不改 |
| `reports/2026-08-04-agent-git-security/` 全部八份檔案 | Outline、notes、Q&A、rehearsal、revision、README、manifest、SHA256SUMS | History + Exploration supporting；保存整套 integrity provenance |
| `presentations/2026-08-04-agent-git-security/` 全部四份檔案 | README、PDF、PPTX、contact sheet | History；舊教學 assumptions 不恢復，bytes／paths 不改 |

## 未找到或不能可靠分類的項目

- `NOT_FOUND_IN_REPO`：「小基站架設與量測成果報告.pdf」。不能由檔名舉例推定它已在 Repo，
  也不能以現有 baseline recovery 簡報冒充。Repo 外是否存在、版本及 final-delivery authority
  均 `UNKNOWN`。
- `NOT_FOUND_IN_REPO`：獨立 frozen legacy Team-mode archive 本體；只在 Starlink case／TER
  找到提及。保持 `NON_NORMATIVE` 邊界，不複製私人資料或推測外部位置。
- `UNRESOLVED`：完整 Agent Control Plane／routing implementation artifact 未確認；目前只
  能導覽現有 task package、TEH、ACP parking 與相關研究。LTE Control Plane 背景仍屬手冊。
- `UNRESOLVED`：hardware notes 的課程必要範圍、Lab02／03 舊操作清單與 minimum 的精確
  對應；保持原位，不靠新 Runtime 決定分類。
- `KNOWN`：tracked tree 未有獨立 root `teaching/`、`research/`、`evidence/`、`reports/`；對應
  文件位於 `docs/`。治理文中 `configs/`、`manifests/` 等 planned layout 不當成現存 artifact；
  已存在的教學設定位於 Lab01 `student-config/`。

## Deferred items

1. `PROGRESS` 的暑假／8 月 meeting、舊「不 commit／push」stop-point 與手冊 path 待定段落
   有時間性；本次加 navigation delta 辨識已存在草稿，不重裁當時 review 或 completion criteria。
2. Lab01 舊 runbook 的 NAT／capture、Lab02 FIFO／DLT／parser、Lab03 kernel／USRP 的技術
   有效性未重驗。Historical banners 防止它們直接變成 current student procedure。
3. 學生手冊的驗收、teaching profile isolated validation、R5／USB root cause、Security mapping、
   Lab02／03 acceptance criteria 仍待分別處理；本次不新增測試或變更 core checklist。
4. AI workflow 的絕對式 invariants／舊 Runtime examples、Agent + Git 舊 learner TODO 與
   adapters 驗證缺口保留；若需內容修正，另立 engineering Work Unit。
5. 既有 canonical limitations 與較新 PROGRESS evidence 的完整逐項 reconciliation、checkpoint
   SHA 欄位規範、workflow vocabulary externalization 不在這次 navigation refactor 展開。
6. 2026-08-04 archive manifest 已記錄歷史 PPTX checksum discrepancy；不修改 frozen checksum，
   不重新製作舊 presentation 或把舊內容更新為今天的 claim。

本次 Git preflight 與保留檢查見
[documentation split TER](evidence/task-evidence/2026-09-12-documentation-split.yaml)。

## Review boundary

本次只修改 Markdown navigation／lifecycle 說明與新增本次 TER；來源內容、學生 config、
歷史 evidence payload、教授決策與 technical claims 均保留。Git diff、連結檢查與 PR 提供
review surface；technical acceptance、Lab validation 與 Runtime state 不因本次分類而改變，
不能由文件整理推出新 Lab PASS。
