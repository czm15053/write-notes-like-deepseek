# 按需阅读：校验脚本

> SKILL §5 的展开。接入 CI 时对照；本地轻量使用时跳过。

## 门禁（均为 tsx，零新增依赖）

1. **`verify-agent-note-tree`**（`scripts/agent-note-tree.ts` + `scripts/verify-agent-note-tree.ts`）
   - 校验 lifecycle 封闭集 `proposed/implemented/rejected` + `archived`、class 封闭集 6 个、路径深度 `{lifecycle}/{class}/file.md`、文件名 `yyyy-mm-dd-topic.md`、禁止 `INDEX.md`。

2. **`verify-agent-note-format`**（`scripts/verify-agent-note-format.ts`）
   - 校验头三行 `# Agent Note:` / 空行 / `Status:` 与 lifecycle 一致、Status 唯一、`## Problem` 首节、per-lifecycle 必需节与禁用节、`## Alternatives considered` 必写、grandfather 仅对 2026-07-05 前有效、禁止 legacy 债务标记。

3. **`verify-archived-agent-notes`**（可选，团队需要冻结清单时再加）
   - Harness 原版校验 `archived/` 单文件 + `Archived: YYYY-MM-DD` + sidecar 哈希 + manifest。本项目默认不带，轻量可先不接。

## 接入建议

- 轻量：接前两个即可（`archived` 用到再加第三个）。
- 完整：前两个串进 `doc-sync`，与 `verify-md-links` / `verify-doc-refs` 同链，失败即红。

来源：Harness `scripts/agent-note-tree.ts` / `verify-agent-note-format.ts` / `verify-archived-agent-notes.ts`（本项目为中文单语精简版，不含翻译配对）。
