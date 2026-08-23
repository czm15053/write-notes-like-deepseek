# 按需阅读：Note 文件格式

> SKILL §2 的展开。写/改 Note 时对照；只改代码不动 Note 时跳过。

## 头块（前三行，门禁强制）

```markdown
# Agent Note: <标题>

Status: <状态>
```

- `proposed` → `Status: proposed`
- `implemented` → `Status: implemented`
- `rejected` → `Status: rejected — <一句话原因>`

标题前必须带 `Agent Note: ` 前缀；状态不含日期与括号；必须与所在 lifecycle 文件夹一致（门禁交叉校验）。文件名日期是首次提出日，git 承载其余时间信息。

## Body 骨架

每篇 Note 都以 `## Problem` 开头——动机要能脱离方案独立成立。之后按 lifecycle区分：

**`proposed/`**

```markdown
## Problem
## Proposal
…自由节…
## Alternatives considered
## Acceptance criteria
## Risks
```

`Proposal` 可用将来时；`Acceptance criteria` 说清什么可观察状态算完成；`Risks` 同时写风险与已知取舍。

**`implemented/`**

```markdown
## Problem
## Decision
…自由节…
## Alternatives considered
## Consequences
```

`Decision` 用现在时描述已落地事实；禁止出现 `## Proposal` / `## Plan` / `## Migration plan` / `## Acceptance criteria` 等提案口吻（门禁直接拦）；用 `## Consequences` 同时记录代价与收益；可按需加 `## Testing` / `## Verification` 等现在时事实节。

**`rejected/`**

冻结的 proposal 形态，verdict 在 `Status:` 行；保留提案时的 `Alternatives` 等节，不改写为对立面。

## Alternatives considered（必写）

每篇 Note 必含 `## Alternatives considered`：每个真考虑过的备选为何没选，一段一备选（可用 `### Why not <X>?` 子节）。没写就重审——不记录打败了什么，决定就会被重审。

- 只有 2026-07-05 前且不可追溯的 pre-format Note 可用 `<!-- agent-note-format: alternatives-not-recorded (pre-format Agent Note) -->` 占位，其余一律实写。新项目可忽略此条。

## 时态与禁止改写

- `proposed` 可用将来时；`implemented` 一律现在时，描述已落地事实。
- 一条 Note 永远不被改写成另一个决定；被取代用新 Note 接管，旧 Note 按归档/合并规则处理。

## 自由节与文风

- 自由节（package 拓扑、wire 契约、schema 等）放在 `Decision` 与 `Alternatives` 之间。
- 保留可检索的机制名与 `must`/`may`/`never` 时序强调；一个事实只在一处讲透，其余链过去。
- 跨 Note 引用用相对 Markdown 链接 `[topic](../../implemented/architecture/2026-…-….md)`，不要裸数字。

来源：Harness `.agents/notes/README.md#the-file-format` 与 `implemented/process/2026-07-05-uniform-agent-note-format.md`（本项目中文单语，头块 `Agent Note:` 与 `Status:` 保持英文原文以便门禁校验，正文用中文）。
