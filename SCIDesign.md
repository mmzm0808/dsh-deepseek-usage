# 科研工作流插件（dsh-ventus-bench）完整设计稿

## 0. 项目定位

**一句话**：把"科研循环"建模成 claim 生命周期——推导、验证、证据、裁决、成稿全部沉淀进 `.rb-state.json`，AI 跑自动段，人只在四个裁决点签字，任何结论都可一键追溯。

**核心术语（首现必释）**
- claim：一条可验证的断言（如"SC 底支 $v_g^b=2t(3\sin k_x+2)/(3+2\sin k_x)^2$"）。
- tol class：误差判定档位，A/B/C 三档，各含 pass/warn 阈值。
- FSR：自由谱范围（free spectral range），$\Delta\omega=2\pi v_g/L$。
- OBC：开边界条件（open boundary condition）。
- convention_id：口径声明 id，防止"同一物理量多口径比较"出错。
- signature token：一次性人类签字令牌，使"人工裁决"技术上不可被 AI 绕过。
- stance：证据立场，`support`（支持）/ `limit`（限定）/ `counter`（反驳）。

**基线（不可推翻）**
- MVP 只做"解析↔数值核对闭环"，`rb_verify` 为硬闸门。
- 目录契约 `LaTeXDoc/<Topic>_<YYMMDD>/{sim,data,figs,notes}`，claim-id 贯穿文件名。
- `.rb-state.json` 为唯一可信源；`rb_open` 三源重建 ≤30 行 briefing。
- claim 8 态状态机；人工仅介入 mismatch/needs-review 出口、adjudicated、published、superseded。
- 三类资产登记：derivation / verifier / evidence-card。
- 环境限制：只能直接调用 run_code，write/edit 包在 run_code 内部；产物行在非 run_code 直调模式覆盖写入同路径。

---

## 1. 根因诊断

**一句话：低效不是缺工具，而是过程没被建模——状态、资产、闸门三样散落，每次会话重建。**

| # | 根因 | 证据 | 改进项 |
|---|---|---|---|
| R1 | 状态无单一入口 | 结论在 notes_*.md、约定在 CLAUDE.md、数值在 sim/ 与 data/，互不索引 | `.rb-state.json` 唯一可信源 + `rb_open` 三源重建 |
| R2 | 资产无登记 | `LaTeXDoc/EdgeDetail_260823/sim/` 实有 23 个 `py_*.py` 无注册表；`Papers/_extracted/`、`Data/ExtractedText/`、`Tests/` 分家 | `assets[]` 索引 + 启动扫描自动归位去重 |
| R3 | 解析与数值无固定核对点 | `E_b` 偶函数误述在 `sec_analytic.tex:55` 修正前存活整份文档周期 | `rb_verify` 硬闸门，无 verify_ref 不得写 tex |
| R4 | 口径未强制声明 | 摘要 8× vs 正文 43×；OBC min\|E\| vs 半无限投影带隙；`sec_flow.tex:39` Fukui Chern 网格 121 | claim 绑定 convention_id，跨口径比较直接拒绝 |
| R5 | 裁决无技术保证 | 模型可调用工具 ≠ 人类签字 | signature token + `userQuestions` 双路径 |
| R6 | 复用率低根因 | 23 个 py_*.py 中 `py_vg_closure.py`、`py_vg_signflip.py` 等本可复用，但无查询入口 | 资产登记 + tags + reusable 标记 + `rb_verify` 先查现有 verifier |

---

## 2. 总体架构

```
三源重建 ──► rb_open 立项/上下文（AI）
                │
                ▼
        rb_derive 解析推导（AI）
                │ closed_forms[] + derive_ref
                ▼
        rb_verify 数值交叉验证（AI，纯函数判定）★核心闸门★
           PASS ──► verified
           WARN ──► needs-review（人工出口）
           FAIL ──► mismatch（冻结，人工诊断）
                │
                ▼
        rb_evidence 文献/证据卡（AI 检索，人工确认 stance）
                │ evidence[] + evidence_ledger.md
                ▼
        rb_adjudicate 观点—证据—裁决（★人工★ + signature token）
                │ adjudications[]
                ▼
        rb_paper LaTeX 成稿（AI 执行，人工定稿签字）
                │ sec_*.tex + PDF + build_log
                ▼
        rb_memory_sync 长期记忆读写（★人工确认后写入★）
```

**claim 状态机（8 态 + 2 旁路）**

```
draft ──rb_derive──► derived ──rb_verify PASS──► verified ──rb_evidence──► evidenced
                        │                              │
                        ├──WARN──► needs-review ──人工──► verified/derived
                        └──FAIL──► mismatch ──人工诊断──► derived/verified
evidenced ──rb_adjudicate+token（人工）──► adjudicated ──rb_paper+人工签字──► published
published ──人工判定新证据推翻──► superseded（version+1，重入 draft）
```

**人机分界**：AI 自动完成推导、验证、检索、起草、排版；人工四节点不可绕过。

---

## 3. 七环节设计

| 环节 | 输入 | 输出 | 触发 | 沉淀位置 | 人机 |
|---|---|---|---|---|---|
| 1 立项/上下文 | 课题名或目录路径 | ≤30 行 briefing | `rb_open` | `.rb-state.json` 的 `last_opened` + `briefing_cache` | AI 自动；state 缺失标 trust: low |
| 2 解析推导/版本 | 物理量、假设、convention_id | `notes/derivations/<claim>.md`（sympy 源 + LaTeX 闭式） | `rb_derive` | `claims[].derive_ref`；assets[] 登记 derivation | AI 自动；每次修改 version+1 |
| 3 数值交叉验证 | claim_id、verifier 脚本、tol_class | `data/verify_<claim>.json` + verdict | `rb_verify` | `claims[].verify_ref`；assets[] 登记 verifier | AI 自动；判定纯函数 |
| 4 文献/证据卡 | 检索式、claim_id | evidence-card + `notes/evidence_ledger.md` | `rb_evidence` | `evidence[]`；assets[] 登记 evidence-card | AI 检索，**人工确认 stance** |
| 5 观点-证据-裁决 | claim + 证据列表 | `adjudications[]`（verdict+理由+时间戳+裁决人） | `rb_adjudicate` | `.rb-state.json` | **人工裁决**，AI 给分级建议 |
| 6 LaTeX 成稿 | 已 adjudicated claims、页数预算 | `notes/sec_<name>.tex` + 主 tex `\input` + 两遍 xelatex | `rb_paper` | `claims[].tex_ref`；`build_log[]` | AI 执行，**人工定稿签字** |
| 7 长期记忆 | 待写事实/偏好 | dsh-memory project 层条目 | `rb_memory_sync` | dsh-memory + state 锚点 | **人工确认后写入** |

---

## 4. 实现契约

### 4.1 `.rb-state.json` schema（核心字段）

```jsonc
{
  "schema": "rb/1",
  "topic": "EdgeDetail_260823",
  "root": "LaTeXDoc/EdgeDetail_260823",
  "conventions": [{ "id": "cv-gap-semi", "desc": "...", "params": { "t": 1, "phi": "pi/4" } }],
  "claims": [{
    "id": "C-014",
    "version": 2,
    "status": "published",            // draft|derived|verified|needs-review|mismatch|evidenced|adjudicated|published|superseded
    "text": "SC 底支 v_g^b = 2t(3 sin kx + 2)/(3+2 sin kx)^2",
    "convention_id": "cv-np-cell",
    "tol_class": "B",
    "derive_ref": "notes/derivations/C-014.md",
    "verify_ref": "data/verify_C-014.json",
    "evidence_refs": ["E-001"],
    "tex_ref": "notes/sec_fold.tex#vgb",
    "frozen": false,
    "superseded_by": null
  }],
  "assets": [{ "id": "asset-py-vg-001", "kind": "verifier", "path": "sim/py_vg_closure.py", "tags": ["sc-vg"], "reusable": true, "claim_id": "C-014", "hash": "..." }],
  "evidence": [{ "id": "E-001", "source": "...", "year": 2026, "ref": "sec_flow.tex:39", "link": null, "relation": "...", "stance": "support", "verified_by": "human" }],
  "adjudications": [{ "claim": "C-014", "verdict": "accepted", "by": "human", "at": "2026-08-24T13:30:00+08:00", "note": "..." }],
  "build_log": [{ "at": "...", "pdf": "EdgeDetail_260823.pdf", "pages": 10, "target_pages": 8, "exit": 0, "status": "over_budget" }],
  "ops_log": [{ "at": "...", "action": "rb_verify", "by": "ai" }]
}
```

### 4.2 七个工具契约

全部通过 `ctx.tools.register(defineTool(...))` 注册，参数用 value-schema DSL。

| 工具 | parameters | 关键 execute 行为 |
|---|---|---|
| `rb_open` | `{ topic: string, required }` | 三源重建（state > memory > 目录扫描），state 缺失 trust=false |
| `rb_derive` | `{ claim_id, convention_id?, expression }` | 写 derivation 文件；convention 不存在→`CONVENTION_UNKNOWN` |
| `rb_verify` | `{ claim_id, script, tol_class }` | run_code 跑 verifier 写 JSON → 读 JSON → 纯函数 `verdict(err, cls)` → 状态流转 |
| `rb_evidence` | `{ claim_id, source, year, ref, stance? }` | 建证据卡 + 写台账；stance 人工确认后才可进裁决 |
| `rb_adjudicate` | `{ claim_id, verdict, note?, signature_token }` | 校验 token；失败→`NEEDS_HUMAN_SIGNATURE` |
| `rb_paper` | `{ claim_ids[], page_budget? }` | 逐 claim 检查 gateNoVerify + gateConvention → 写 tex → 两遍编译 → build_log |
| `rb_memory_sync` | `{ facts[], project_scope? }` | 写入 dsh-memory；人工确认 |

### 4.3 三个纯函数闸门

```ts
// 三向分流
verdict(err, { pass, warn }) =
  err <= pass ? 'PASS' : err <= warn ? 'WARN' : 'FAIL'

// 硬闸门
gateNoVerify(claim) =
  claim.verify_ref && claim.status === 'adjudicated' ? pass : 'GATE_NO_VERIFY'

// 口径拒绝
gateConvention(a, b) =
  a.convention_id === b.convention_id ? pass : 'CONVENTION_MISMATCH'
```

### 4.4 signature token

```
POST /research-bench/sign
body: { claim_id, revision }
→ { token, expires: now+300s }

rb_adjudicate 校验：token 存在、未过期、claim_id+revision 匹配、单次删除
```

### 4.5 资产扫描算法

```
scan_assets(root):
  known = {a.path for a in state.assets}
  for f in glob(root+"/sim/py_*.py"):
    if f not in known: pending.append({path:f, kind:guess_kind(f), hash:sha256(f)})
  for f in glob(root+"/notes/derivations/*.md"):
    if f not in known: pending.append({path:f, kind:'derivation', hash:sha256(f)})
  for f in glob(root+"/notes/evidence_*.md"):
    if f not in known: pending.append({path:f, kind:'evidence-card', hash:sha256(f)})
  # hash 去重；AI 建议归类，人工确认入库
```

---

## 5. 证据台账（`evidence_ledger.md`）

**创建时机**：`rb_evidence` 首次写入证据卡时自动创建，不存在则建，存在则追加。

**内容骨架**：

```markdown
# 证据台账 — <Topic>
更新: <ISO 时间戳>

## 口径声明
| id | 描述 | 参数 |
|---|---|---|
| cv-gap-semi | 半无限投影带隙(λ→1) | {t:1, phi:pi/4, omg:0, tc:1} |
| cv-gap-obc | OBC min|E| (NX=6) | {t:1, phi:pi/4, omg:0, tc:1} |

## 证据卡
| claim_id | evidence_id | source | year | stance | verified_by | 关联结论 | 冲突判定 |
|---|---|---|---|---|---|---|---|
| C-011 | E-002 | Colomés & Franz arXiv:1709.01026 | 2017 | counter | human | 两条边态可同向传播(C=0) | 需补C≠0前提 |

## 待裁决冲突
- C-019 (FSR 4.4× vs 2.5×): 判定方案 = 从 ResearchSummary_260721.md 核 L_eff，
  代入 FSR比=(v_NP/v_SC)(L_SC/L_NP)，若 L_SC/L_NP 在 1.76±0.15 内则自洽
```

**与裁决点联动**：adjudicate 前必须读该 claim 全部证据行；措辞强度（只能写"已验证"不能写"已证明"）、口径选择（多口径须列来源）、猜想是否入文（标 conjecture）、冲突当场写含参数/判据/阈值的判定方案。

---

## 6. UI 设计（7 个触点 + 2 个亮点）

**视觉规范**：深蓝/灰/白冷静配色；状态色语义化（PASS 绿、WARN 琥珀、FAIL 红）并配形状三重编码（●▲■）；直角分隔、精确数值、网格对齐；≤200ms 过渡；异常用温和文案不堆红叉。

| 触点 | 输入 | 输出 | 触发 | 沉淀 | 人机 |
|---|---|---|---|---|---|
| Briefing 侧栏 | state 三源 | ≤30 行简报 | 会话开始/`rb_open` | `briefing_cache` | AI |
| 验证结果面板 | `verify_*.json` | 误差标尺 + 阈值带 | `rb_verify` 完成 | `verify_ref` | AI |
| 状态流转视图 | claims[] | 里程碑轨道 | 打开/状态变化 | 只读 state | AI 推进，人工锁点 |
| 追溯光路 | claim_id | derive→verify→evidence→tex 链路 | 点击 claim | 只读 state | AI |
| 证据台账视图 | `evidence_ledger.md` | 表格+口径声明+冲突 | `rb_evidence` 后 | `evidence[]` | AI 起草，人工确认 stance |
| 裁决签字点 | claim+证据摘要 | accepted/limited/rejected + token | 用户点击 | `adjudications[]` | **人工** |
| Build 状态条 | `build_log[]` | 页数/预算/exit | `rb_paper` 后 | `build_log` | AI 执行，人工定稿 |

**交互亮点（耳目一新）**：
1. **追溯光路**——点击任一 claim，四条引用以一条光路横向展开，每个节点可直接打开对应文件。比弹窗少一层点击，操作路径最短。
2. **误差标尺**——对数刻度 + 阈值带替代红绿灯，数据优先、理科直白。PASS/WARN/FAIL 三重编码（形状+颜色+数值）。

---

## 7. 竞品对照（调研结论）

| 方向 | 工具 | 优点 | 缺点 | 可借鉴点 | 来源 |
|---|---|---|---|---|---|
| 可复现/出版 | Quarto | 文件即产物、一键 render、dashboard 原生 | 无状态机、无验证闸门 | `rb_paper` 两遍编译 | [Quarto](https://www.so.com/link?m=bWl3htikxPVX%2FckEYFSSaBhQgGVNqc3VVpGmp1Ch6HTQLQDHgCbNuMXrcvLDsUrIDemRzOG4haGv92JxfkZ1SiH9s9XTVSXqjLGOlPyenr802ypM7i1bk29QnWE3CsVru4QwbNWyqC%2BfGgzLqpZ2dGv637l4jR55nk5%2FsuouqsfKyUnVB) |
| 写作审阅 | Overleaf | track changes + comment 内嵌 | 不管"为什么能写" | 裁决签字点 | [教程](http://www.bilibili.com/video/av113586533898056) |
| 文献卡片 | Obsidian+Zotero | 元数据+双向链接+Dataview | 无 stance、无验证绑定 | evidence-card schema | [指南](https://www.so.com/link?m=bfmigojMbAMp%2BOpJNtOFJnInUwA7osa7D76C79H01JbgueZ8OoZGya%2F89KeRo097WFlud0WMjkgJa6vgqS9Mi1p03nxXZkwG0T8sJ5eh4CTFMwkE7KZgyO0z0nzJP%2FqQEpeITwAMLP4sFM7HcKDPu87ZvM03KZduryV5%2FeC8fPyMl1KsKtP%2BjozF37oGiiqkSKtk7S4nMhiprH5%2FFBD7ylRm9Pf2UYqjW%2Bsyg9b5DZP7ysU54ILwsnA%3D%3D) |
| 数值面板 | Streamlit/Dash | 脚本式、回调联动、图表密集 | 只展示不做断言比对 | 误差标尺 | [对比](https://ai.so.com/search/soc0a7cddf88d22977c89aa982fd31b4f9?search=%E6%AF%94%E8%BE%83Plotly%20Dash%20%E5%92%8C%20Streamlit&src=so_result_natural&srcg=so_result_natural) |
| 交互文档 | Jupyter Book/MyST | 代码+叙述+引用一体 | 无跨会话状态索引 | verifier 脚本+JSON 契约 | [Jupyter 网页化](https://www.so.com/link?m=z0%2Fcvfcpbge1xrlCBNLJSCOtUXav123x2z4Fft0sUCSC3CHoqNYd7wJaS2icJcJD85dk03%2Bu0tJlqLajQQE0SqfABKJEcUxqahd4eCurXr%2BorW8zKdFwcK9fhkuiKO5kooI%2B8u1R0RmULi35%2FAyxV%2B%2BOUW1NpTnVjDBMCDHSEUZnbu%2BhNWIT5w7Ad%2BBsDguEam4EcJfmXy4PSaIn3Y9WB1x7vvmg%3D) |

**差异点**：以上工具都是单向产出；我们加的是**状态机 + 硬闸门 + stance 分级 + signature token**，四者组合后验证不再靠自觉，成稿不再靠口头承诺。

---

## 8. MVP 落地清单与增强路线图

**MVP（1 天）**
1. `dsh-ventus-bench` 骨架（package.json + 合法 `- insert:` patch + Config schema）。
2. `gates.ts` 三纯函数 + 单测。
3. `.rb-state.json` 接 `ctx.storage` json backend。
4. `rb_verify`（run_code 执行 verifier → 读 JSON → 纯函数判定）+ 3 样例回灌（PASS/PASS/FAIL）。
5. `rb_open` briefing。
6. `dsh plugin --profile <scratch> add` + `--dump-config`。
7. `ops_log[]` 埋点。

**增强路线图**
- V1（+2–3 天）：追溯光路只读版、验证误差标尺面板、evidence_ledger 自动生成。
- V2（+1 周）：裁决签字点 + signature token 路由、状态轨道交互、资产自动扫描去重、`rb_paper` 自动两遍编译 + 片段回退。
- V3（+2 周）：通用域包抽象（湿实验/统计判据）、多课题并行简报。

---

## 9. 贯穿案例（EdgeDetail_260823）的落点

- **口径陷阱**：摘要 8× vs 正文 43×；"体能隙差 2×"仅指 OBC min|E|——台账列出每个口径来源，裁决时人工选主口径，其余标 alternative。
- **证据不一致**：边缘态数 12 vs 40 多口径（统一用半无限带隙 + w_edge 阈值 0.10）；SC 局域 Chern +2.00 vs |C|=1（统一 Fukui 归一化网格 121，见 `sec_flow.tex:39`）；TRS/helical 与 Chern ±1 互斥（`notes_E_symmetry.md:34-37`）；SC 符号约定 II.C vs XII.B（以 `build_H_sc_ribbon.m` 为准）。
- **最终裁决方案**：同一体哈密顿量下只改终止方式扫描（平直 vs 锯齿），统一判据；所有"两支必反向"类 claim 补 `|C|=1` 前提，排除反手征反例（arXiv:1709.01026）。

---

## 10. 验收标准

| 项 | 状态 |
|---|---|
| 读后能复述七环节输入输出、人机分工、7 个 UI 触点 | ✅ 设计完成 |
| 所有新设计映射到目录契约与 `.rb-state.json`，无平行体系 | ✅ |
| ≥3 个竞品具体对照结论（实际 5 个） | ✅ |
| 含 MVP 清单（1 天）与增强路线图（V1–V3） | ✅ |
| LaTeX 成稿可复现可回退（build_log + 片段回退） | ✅ |
| 重复操作 ↓≥50%、重述 0–1 次 | ⏳ 需实现后跑 3 个循环度量 |

---

以上为完整设计稿。