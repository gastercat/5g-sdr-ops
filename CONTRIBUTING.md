# Contributing

本 repo 用於管理 5G SDR 專題的文件、設備狀態、Lab baseline 與實驗流程。目前主要處理 Markdown 文件，不直接操作實驗環境。

文件歸類請先讀 [Delivery](delivery/README.md)、[Exploration](exploration/README.md) 與
[分類盤點](docs/documentation-map.md)。歷史 evidence 保留來源與日期，分類不升降驗證狀態。

核心流程：

```text
Issue 記任務 -> Branch 做修改 -> Pull Request 合併 -> main 保持穩定
```

## 基本原則

- `main` 應保持可閱讀、可追蹤、狀態清楚。
- 每次修改應有明確目的，避免一次處理太多不相關內容。
- 未經實機確認的技術狀態需標記 `NEEDS_CONFIRMATION`。
- Lab02、Lab03 不應寫成已完成；Security 採 cross-cutting direction，舊 Lab04 只作 historical／future mapping input。
- 文件應使用繁體中文；技術名詞、Git 指令、branch、issue、pull request、commit、AI / Agent 等保留英文原文。

## Branch 命名規則

不使用複雜 Git flow。每個任務開一個簡短 branch。

建議格式：

- `docs/<topic>`：文件整理或新增。
- `lab/<lab-name>`：Lab 文件、流程或結果整理。
- `fix/<topic>`：修正錯字、格式或錯誤資訊。

範例：

- `docs/contributing`
- `lab/lab01-runbook`
- `fix/glossary-terms`

## Issue 使用方式

Issue 用來記錄任務與待確認事項。適合用於：

- 待整理文件。
- 設備狀態或實驗結果待確認。
- Lab evidence 待補。
- 文件錯誤、缺漏或格式問題。

Issue 建議包含：

- 背景：為什麼需要做。
- 目標：完成後應該長什麼樣。
- 範圍：會修改哪些文件或章節。
- 待確認：需要標記 `NEEDS_CONFIRMATION` 的項目。

## Pull Request 使用方式

Pull Request 應保持小範圍，方便 review。

PR 說明建議包含：

- 變更內容。
- 修改原因。
- 影響檔案。
- 是否新增 `NEEDS_CONFIRMATION`。
- 是否有未確認或需要指導老師、維護者確認的事項。

合併前應確認：

- 沒有加入私人稱呼、私人對話或未授權資料。
- 沒有把未驗證實驗結果寫成已完成。
- 變更限於已授權的 Repository 範圍；文件 CI 不涉及 active runtime config、實驗服務或實驗環境操作。
- Markdown 格式可讀，表格與清單不破版。

## Commit Message 建議

commit message 應簡短描述實際變更。

建議格式：

- `docs: add contributing guide`
- `docs: update ai workflow notes`
- `lab: organize lab01 runbook`
- `fix: correct glossary wording`

避免使用過於模糊的訊息，例如：

- `update`
- `fix`
- `misc`

## 不應提交的內容

請勿提交：

- runtime config，例如 `/etc/srsran`、`/etc/srslte` 相關設定。
- 實驗環境檔案、build output、暫存檔或未經授權的自動化腳本。
  本庫的文件品質 CI、檢查程式與其版本鎖定設定可經 PR Review 納入；
  此範圍不包含 Lab Runtime、部署或網路操作。
- 私人對話、私人稱呼、未授權資料。
- 真實帳號憑證、密碼、token、SIM / USIM 機密及未經授權公開的敏感網路資訊。
  已核准的教學／實驗私有 IP 與必要網路拓樸資訊可提交，不因包含 IP 位址而一律視為敏感資料。
- 未整理的大型 Log、PCAP 或截圖。
- 會誤導讀者以為 Lab02、Lab03 已完成，或獨立 Lab04 仍是必做 Runtime 的描述。

## AI / Agent 使用提醒

AI / Agent 可以協助：

- 整理 Markdown 文件。
- 產生 checklist。
- 草擬 Issue、Pull Request 說明。
- 整理 Log 判讀方向或待確認清單。

AI / Agent 不應自動：

- 修改 runtime config。
- 操作實驗環境。
- 在任務未明確授權時改動程式碼或自動化腳本。
- 將未驗證狀態寫成完成。
- 取代成員、指導老師或維護者的最終判斷。

交給 AI / Agent 的任務應明確寫出 allowed scope、forbidden scope、預期輸出與 review 重點。所有 AI / Agent 產出都需要人工 review 後才能合併。

## PR Template 與文件 CI

新 PR 使用 [PR template](.github/pull_request_template.md)，填寫變更原因、影響與風險、
實際驗證結果、證據限制及回復方式；不適用者說明原因。Template 的 checklist 是人工
Review 提示，不會由 CI 自動判定內容真實性，也不代表取得 Runtime 操作授權。

`Documentation CI` 對所有指向 `main` 的 PR、`main` 的 push 與手動觸發執行三項檢查。
沒有 path filters；純附件 PR 也應產生全部 checks。

| Check 名稱 | 檢查內容 | 限制 |
| --- | --- | --- |
| `docs-quality` | 全庫 Markdown 基本格式、YAML 語法／重複 key、PR 差異空白 | 不判定技術 claim 或實機結果 |
| `local-links` | 全庫 Markdown 的本地文件與圖片連結 | 離線執行；不驗證外部網址或標題 anchor |
| `secret-scan` | 目前檔案及 PR／push 新增 commits 的 Gitleaks 掃描 | 無法保證辨識所有敏感資料；仍需人工檢查 SIM／USIM 資料 |

Markdown 第一版規則為 MD009、MD010、MD040；允許合法的兩個尾端空白換行。
YAML 只要求可解析且不含重複 key，不強制行長、縮排風格或文件起始符。
所有 CI 檢查均不自動修檔，不部署或啟動實驗服務。PR 中的 workflow、工具 lockfiles、
檢查程式與任何例外也必須人工 Review，避免檢查規則被意外削弱。

### 本機重現

以下命令供 Linux x86_64、Python 3.12、Node.js 24 使用；下載／安裝步驟需要網路，
工具裝在暫存目錄與 `.github/ci/node_modules/`。不要將依賴、快取或測試輸出提交。

```bash
ci_tools_dir="$(mktemp -d)"
python3 -m venv "$ci_tools_dir/venv"
"$ci_tools_dir/venv/bin/python" -m pip install --require-hashes -r .github/ci/requirements.txt
npm ci --prefix .github/ci --ignore-scripts --no-audit --no-fund --cache "$ci_tools_dir/npm-cache"
python3 .github/ci/install_tools.py lychee "$ci_tools_dir/bin"
python3 .github/ci/install_tools.py gitleaks "$ci_tools_dir/bin"
export PATH="$ci_tools_dir/bin:$ci_tools_dir/venv/bin:$PATH"
python3 .github/ci/checks.py docs-quality
python3 .github/ci/checks.py local-links
python3 .github/ci/checks.py secret-scan
python3 .github/ci/test_checks.py
```

本機檢查包含 Git 追蹤檔案及尚未追蹤、未被忽略的新檔案；刪除中的檔案不再當作輸入，
但其他文件對它的引用仍會失敗。忽略的憑證與安裝目錄不作為掃描輸入；符號連結會失敗，
須先人工審閱。預設不掃描全部 Git 歷史；要重現 PR 的差異與逐 commit 掃描，明確傳入
已存在本機的 base/head SHA：

```bash
python3 .github/ci/checks.py docs-quality --base BASE_SHA --head HEAD_SHA
python3 .github/ci/checks.py secret-scan --base BASE_SHA --head HEAD_SHA
```

上面的 `BASE_SHA`／`HEAD_SHA` 需替換為實際 SHA。CI checkout 完整歷史，PR 使用事件中的
base/head，push 使用 before/after；手動觸發只檢查目前檔案。無效或全零 base 會失敗，
不能當成已檢查歷史。逐 commit 掃描可發現同一 PR 中曾新增、後來又刪除的祕密；
它不是對既有全部歷史的追溯稽核。

### 例外與工具更新

唯一的本地連結例外是根目錄 `.local/lab02-b3c/lab02-ue-mac-finalized.pcap`：
`PROGRESS.md` 將它作為不隨 Git 保存的歷史 PCAP 證據引用。檢查程式僅排除此精確目標，
不排除整份文件或整個 `.local/`；例外不代表本次已讀取或驗證該 PCAP。
新的例外必須在 PR 說明來源、原因與精確範圍，經人工 Review。

Gitleaks 預設沒有本庫自訂 allowlist，且不接受 `gitleaks:allow` 行內註解作為略過依據。
若需處理合成資料誤報，應用精確 fingerprint 或限定規則、路徑與值的設定，說明理由；
真實祕密應移除並交由持有人撤銷／輪替，不以 allowlist 隱藏。掃描輸出會遮蔽敏感值。

工具更新應同時更新版本、lockfile／SHA-256 與驗收結果。npm 使用 lockfile 的 integrity，
Python 使用完整版本及 `--require-hashes`，二進位下載以 `binaries.json` 中的 SHA-256 驗證。
GitHub Actions 固定完整 commit SHA，註解保留版本；下載來源為相應官方 release／registry。

### Required checks 啟用與驗收

提交 workflow 不會自動啟用 GitHub 的合併門檻。現有 ruleset `5G SDR Main Protection v1`
（ID `18769462`）已要求 PR、解決 review threads，並禁止刪除與 force push；其既有
review 條件應保留。管理者在導入 PR 的三個 checks 首次成功後、合併之前：

1. 在 GitHub Repository Settings → Rules → Rulesets 開啟上述 `main` ruleset。
2. 加入 required status checks：`docs-quality`、`local-links`、`secret-scan`，
   指定來源為 GitHub Actions，並啟用 **Require branches to be up to date before merging**。
3. 保留 ruleset 的其他條件、bypass 與 review 設定。不得只用新的簡化規則覆蓋既有規則。
4. 以故意失敗的測試 PR 確認不能合併，再修正該 PR，確認三項成功後解除此檢查阻擋。
   另確認純文件及純附件 PR 均有三項 checks。
5. 合併後確認新 PR 會帶出 template，並確認 `main` 的 push workflow 成功。

啟用與 GitHub 實際驗收完成前，狀態應記為「本機已驗證／GitHub rollout 待完成」，
不能僅憑本機結果宣稱合併門檻已生效。若帳號權限或方案受限，記錄具體阻擋項目。
CI 失效時先以修正 PR 處理；如需回復導入，管理者須同步調整 required checks，
避免 workflow 撤回後留下永久等待的檢查。
