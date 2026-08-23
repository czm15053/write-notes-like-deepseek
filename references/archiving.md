# 按需阅读：归档与合并删除

> 提炼自 `dsh-archive-agent-notes` 与 `.agents/notes/README.md`。收尾或复盘时对照；日常改动跳过。

## 何时归档（implemented → archived）

按“未来参考价值”语义判定，而非字数/年龄/配额：

- **保留 active**：rationale、alternatives、negative guarantee、持久化/wire 语义、ownership 边界、安全规则、重引入条件仍可能指导未来改动。
- **移入 archived**：已完成且上述价值已低；冻结为 `archived/{class}/yyyy-mm-dd-topic.md`。

每新增一条 Note 即触发同域已落地 Note 的 supersession 审计：同改动内归档被完全取代者，保留并互链部分取代者。

## 怎么归档

- 移动单文件 `archived/{class}/yyyy-mm-dd-topic.md`，保留 `Status: implemented`，在状态行下方插入 `Archived: YYYY-MM-DD`，修复或删除入链；除此之外不改内容。
- 归档后永久冻结：不编辑、不重排、不移动、不作为现行权威；文档门禁跳过 archived 的出链；主动引用历史时可链入。

## 合并删除（完全取代）

仅当旧 Note 被新 Note **完全取代**时可删除；部分取代两者都留并互链。

删除前必须：保留旧 Note 的所有独特 rationale/alternative/consequence/验证要求/覆盖缺口到新 Note；修复所有入链。禁止把旧文件改写成对立面，也禁止“只留 git 历史”。

- `feature` 的新增 Note 只有在能力已从生产代码/配置/schema/持久化/wire/迁移/兼容行为中完全消失、文档不再宣称可用、测试不再以其为可用行为时，才可被后续 removal Note 合并。
