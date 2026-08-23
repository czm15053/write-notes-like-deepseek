# 按需阅读：Class 分类

> SKILL §1 的展开。新建 Note 选 class 时对照。

## 封闭集（6 个，新增需改门禁）

| Class | 覆盖范围 |
|---|---|
| `feature` | 新增面向用户或模型的能力 |
| `bug-fix` | 修缺陷或补 postmortem 暴露的缺口 |
| `simplification` | 不新增能力的前提下删代码/行为/表面 |
| `architecture` | 已发布源码的结构性决定——包如何关联、运行时词汇是什么 |
| `process` | 代码之外的工具/策略/流程——门禁、包管理、vendoring 等 |
| `testing` | 测试 infra 与策略 |

判定技巧：

- `architecture` vs `process`：前者是"发出去的源码长什么样"，后者是"围绕源码的工具链与工作流"。
- `refactor` 不单列——用 `simplification` 的判据"可观察行为变了吗"区分；行为不变即 simplification，行为变了归对应 feature/bug-fix/architecture。
- 拿不准时看这条 Note 以后会被谁检索：找能力演进看 `feature`，找结构决策看 `architecture`，找门禁/发布看 `process`。

## 门禁

`scripts/agent-note-tree.ts` 定义 `AGENT_NOTE_CLASSES` 常量；`verify-agent-note-classification` 拒绝未知 class 文件夹与 lifecycle 根下的散落 `.md`。新增 class 必须同时改常量与本文档，否则门禁直接红。

详见 Harness 原文：`implemented/process/2026-06-20-agent-note-classification.md`。
