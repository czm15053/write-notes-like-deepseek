# 按需阅读：何时写、何时改

> SKILL §3 的展开。每个非平凡改动对照一次。

## 何时必须写

按做决定的时机写：动手前写 `proposed`，实现时最晚与代码同一次提交新增或更新 `implemented`（有 PR 以 PR 为单位，没有就以 commit 为单位）。非平凡 = 改了行为、架构、跨文件契约、流程/门禁/测试策略、落盘/网络/配置格式，或其他会被后人合理追问"为什么"的决定。

- 纯机械/局部且无行为与契约变化 → 豁免，不写。
- 不确定 → 按非平凡处理，写一条。

## 新建前先搜

新建前用目录浏览或 `rg` 搜现有归属；同决定的改动更新那一张，不另起一篇。

## 新建 vs 更新

- 已有归属的决定（文件名/路径能对应上）→ **更新那一条**，不另起一篇。事实、路径、默认值、验证变了就在同一改动内同步到 Note（facts only），不改 decision 本身。
- 无归属的新决定 / 能防止重犯的否决 / 可复用复盘 → 新建。
- 一条 Note 永远不会被改写成另一个决定；被取代用新 Note 接管，旧 Note 按归档/合并规则处理。

## Lifecycle 流转

- `proposed/` → `implemented/`：重写 `Status:`，把 `## Proposal` 改为现在时的 `## Decision`，把 `## Acceptance criteria` / `## Risks` 收敛进 `## Consequences` 或 `## Testing`/`## Verification`，去掉计划口吻。
- `proposed/` → `rejected/`：仅在 `Status:` 行追加 `— <原因>` 并冻结文件。
- `implemented/` 内更新：保持现在时；与代码同一次提交保持同步（有 PR 以 PR 为单位，没有就以 commit 为单位）。

来源：Harness `.agents/notes/README.md#when-to-write-one` 与 `implemented/AGENTS.md`。
