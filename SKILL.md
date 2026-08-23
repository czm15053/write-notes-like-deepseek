---
name: write-notes-like-deepseek
description: 像 DeepSeek 团队一样沉淀 Agent Notes——决策、取舍与验证一处留痕，半年后仍可追溯。Use when making a non-trivial change or decision worth revisiting. 适用于任何仓库
---

# Write Notes Like DeepSeek

> 从 DeepSeek Harness 提炼的决策沉淀纪律。宿主负责拆任务、排计划；本 Skill 只解决一件事：**为什么这样改、放弃了什么、怎么证明改对了**，都留在一处可检索、可校验的地方。

## 定位

这不是文档生成器，也不是 ADR 模板合集。它的定位是**决策留痕层**——当涉及行为、架构、契约、流程或落盘格式这类半年后会有人回头问"为什么"的地方，用一篇 Agent Note 把 rationale 钉住。包括动手前的选型与被否决的方案——无代码的决定也值得留。

- 只改格式 / 无歧义重命名 / 错别字 → 标 `not applicable`，不写。
- 不确定是否算重要改动 → 按要写处理。
- 别用"以后再补 / 代码即文档 / 改动小"给自己开绿灯。

一句话判断：**"半年后有人回来看，会想知道为什么这样改吗？"** 会，就写。

> "决策"不重——个人项目里就是"为什么选 A 没选 B"。选型、取舍、踩过的坑，都值得钉住。

## 0. 先探测，再落地

别一上来建全套目录。按宿主现状选型：

1. 有 `AGENTS.md` / `CLAUDE.md` / 贡献指南 → 读它；有 `docs/adr/`、`docs/decisions/`、Issue 模板等既有决策记录 → 沿用，语义映射到本 Skill 的 lifecycle / class 即可。
2. 没有决策记录 → 建最小 Note 树：**轻量项目只建 `.agents/notes/implemented/<class>/`**，用到 `proposed` / `rejected` / `archived` 再建；空目录可直接删。
3. 团队长期仓库 → 建全套 `proposed / implemented / rejected / archived × 6 class`。

## 1. 路径即分类

每条 Note 的路径就是身份：`{lifecycle}/{class}/yyyy-mm-dd-topic.md`

**Lifecycle（状态）：**

- `proposed` — 想法阶段，有了方案但还没落地
- `implemented` — 已落地，与代码同一次提交保持同步
- `rejected` — 审慎否掉的提案，仅当能防止重犯时保留，否则删整组
- `archived` — 已完成且未来参考价值低的 implemented 记录，冻结不可改

**Class（种类，封闭集，新增需改门禁）：**

`feature` / `bug-fix` / `simplification` / `architecture` / `process` / `testing`

> 详见 `references/classification.md`；`refactor` 不单列——用 `simplification` 的判据"可观察行为变了吗"区分。不建集中 `INDEX.md`，用目录与搜索发现。

## 2. 文件格式（门禁强制）

前三行固定：

```markdown
# Agent Note: <标题>

Status: <状态>
```

- `proposed` → `Status: proposed`
- `implemented` → `Status: implemented`
- `rejected` → `Status: rejected — <一句话原因>`

状态必须与所在 lifecycle 文件夹一致；文件名日期是**首次提出日**，状态不带日期。

**Body 骨架：**

- `proposed`：`## Problem` → `## Proposal` → …自由节… → `## Alternatives considered` → `## Acceptance criteria` → `## Risks`
- `implemented`：`## Problem` → `## Decision`（现在时） → …自由节… → `## Alternatives considered` → `## Consequences`
- `rejected`：冻结的 proposal 形态，结论在 `Status:` 行

> 禁止在 `implemented` 中出现 `## Proposal` / `## Plan` / `## Acceptance criteria` 等提案口吻；详见 `references/note-format.md`。
> 每篇 Note 必含 `## Alternatives considered`——没写就重审。
> `implemented` 用现在时描述已落地事实；一条 Note 永远不被改写成另一个决定。

模板见 `templates/`。

## 3. 什么时候写、什么时候改

跟着**做决定的时机**写，不只是提交时补。新建前先搜现有归属——同决定的改动更新那一篇，不另起新篇：

- **有想法、还没动手** → 先写 `proposed`（为什么想这么做、考虑过哪几条路），评审完再动手。纯调研/选型没有代码时，Note 本身就是交付物。
- **动手时 / 刚做完** → 写或更新 `implemented`，**最晚与代码同一次提交**，避免遗漏。有 PR 以 PR 为单位，没有就以 commit / 推送批次为单位。
- **改的是已有 Note 对应的决定** → 更新那一篇（事实、路径、验证变了就同步），不另起一篇。
- **决定没被完全取代** → 新旧两篇都留并互链。
- **决定被完全取代** → 新 Note 接管，旧 Note 按归档规则冻结，或按合并规则删除（需保留所有独特 rationale 并修复入链）。

> 判定与流转见 `references/when-to-write.md`，归档与删除见 `references/archiving.md`。

## 4. 怎么写好

- `## Consequences` 同时写**代价和收益**，不是只写"放弃了什么"。
- 自由节（package 拓扑、wire 契约、schema 等）放在 `Decision` 与 `Alternatives` 之间，保持可检索的机制名与 `must / may / never` 时序强调。
- 跨 Note 引用用相对 Markdown 链接 `[topic](../../implemented/architecture/2026-…-….md)`，不要裸数字，以便机械可校验。
- 文风与去推导痕迹见 `references/prose-checklist.md`；简化机会见 `references/simplification-checklist.md`。

## 5. 校验

```sh
npx tsx <skill目录>/scripts/verify-agent-note-tree.ts     # 路径、lifecycle、class、文件名
npx tsx <skill目录>/scripts/verify-agent-note-format.ts   # 头块、骨架、Alternatives、禁用词
```

每个校验都是独立 tsx 脚本，串进 `doc-sync` 即成门禁。团队项目可在 `CONTRIBUTING.md` / PR 模板加一句"非平凡改动必带 Note"，并把上面两个脚本接进 CI 形成闭环。详见 `references/verification.md`。

## References

按需加载：

- `references/note-format.md` — 头块与 body 骨架展开
- `references/classification.md` — 6 class 判定与边界
- `references/when-to-write.md` — 何时新建 / 更新 / 流转
- `references/archiving.md` — 归档与合并删除（含"未来参考价值"判定与新增即审计）
- `references/prose-checklist.md` — 行文与去泄露自检
- `references/simplification-checklist.md` — 简化机会自检
- `references/verification.md` — 校验脚本说明
