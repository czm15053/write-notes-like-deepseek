# 按需阅读：归档、冻结与 manifest 封印机制

> 提炼自 `deepseek-harness` 的 `dsh-archive-agent-notes` 与 `verify-archived-agent-notes`。收尾、复盘或大版本跃迁时对照；日常改动跳过。

---

## 1. 何时归档（implemented → archived）

严格依据**「未来指导价值」**语义判定，而非单纯以时间长短或行数评判：

- **保留在活跃树（`implemented/`）**：
  只要该决策的决策依据、被否决路线、边界假设、持久化/wire 格式、安全规则或重新引入条件，对未来的代码重构与维护仍有指导价值，就继续保留在 `implemented/` 中，并随代码重构一同就地维护。
- **移入归档树（`archived/`）**：
  已彻底落地、逻辑已深度稳定，且未来重构基本不会再推翻或重审该决定的记录；或者被后续大版本架构完全取代（Superseded）的历史 Note。

> ⚠️ 严禁归档 `proposed/` 记录：过时或放弃的提案直接移入 `rejected/` 或物理删除。

---

## 2. 归档的标准操作流

归档动作将单文件从 `implemented/{class}/...` 移动到 `archived/{class}/...`（注意：省略 `implemented` 目录层级）：

1. **移动文件**：
   ```bash
   git mv .agents/notes/implemented/architecture/2026-08-18-xxx.md .agents/notes/archived/architecture/2026-08-18-xxx.md
   ```
2. **插入归档日期标记**：
   保留 `Status: implemented` 行，紧随其后插入一行 `Archived: YYYY-MM-DD`，前后保留空行：
   ```markdown
   # Agent Note: xxx

   Status: implemented

   Archived: 2026-08-31

   ## Problem
   ...
   ```
   除该标记外，**禁止修改归档正文的任何其他字符**。
3. **修复入站链接**：
   全局搜索引用了该 Note 旧路径的 Markdown 相对链接，修改为新归档路径或新取代 Note 路径。
4. **计算哈希并封印入 `manifest.json`（可选进阶）**：
   在 `.agents/notes/archived/manifest.json` 中记录该归档文件的 SHA-256 哈希值。一旦封印，后续任何对归档内容的篡改都会在门禁中报警。

---

## 3. 永久冻结契约（Frozen Immutable Contract）

一旦进入 `archived/`：
- **永久只读**：严禁编辑、格式化、更新或移动。
- **免除日常扫描**：门禁脚本（`verify-agent-note-tree` 和 `verify-agent-note-format`）默认跳过 `archived/` 目录，归档文件的出站链接失效不会阻塞日常 CI 构建。
- **不可作为当前行为依据**：代码冲突或架构评审时，以 `implemented/` 为现行法律，`archived/` 仅作为历史考据参考。
