# write-notes-like-deepseek

> 像 DeepSeek 团队一样，把"为什么这样改"写下来——半年后打开还能懂。

为每一次重要改动留下一篇可检索、可校验的笔记：为什么要改、考虑过哪些备选、最终为何这样取舍。让半年后的自己或同事不用翻聊天记录，打开仓库就能看懂。

来自 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 两个月 740+ 篇笔记的实践提炼，装进任何项目都能用，不改你现有的工作流。

```bash
npx skills add czm15053/write-notes-like-deepseek
```

---

## 解决什么问题

代码会变，记忆会忘。改了一处架构，两个月后没人记得为什么这么选、放弃了哪条路、代价是什么——只能重新踩坑。

这个 Skill 只做一件事：**做决定时就写，最晚和代码同一次提交**（有 PR 以 PR 为单位，没有就以 commit 为单位）。路径即分类，文件即契约，门禁保证格式不腐烂。

---

## 一篇笔记长什么样

放在 `.agents/notes/implemented/feature/2026-08-23-xxx.md`：

```markdown
# Agent Note: 用 SQLite 存会话，为什么不用 JSONL

Status: implemented

## Problem        为什么要改？不看方案也能懂
## Decision       最终怎么做的？现在时
## Alternatives considered  认真考虑过哪 2–3 种做法，为什么没选
## Consequences   代价和收益各是什么
```

四段写完，一次改动的来龙去脉就钉住了。`Alternatives considered` 是必填项——不记录打败了什么，决定迟早被重审。格式不对，门禁直接报错。

---

## 什么时候写

| 要写 | 不用写 |
|---|---|
| 改了运行时行为或 UI 表现 | 只改空格、格式、导入顺序 |
| 改了架构、模块边界、跨文件契约 | 无歧义重命名、错别字 |
| 改了流程、门禁、测试策略 | 注释里加一句说明 |
| 改了落盘 / 网络 / 配置格式 | 文档里改个标点 |

一句话判断：**"半年后有人回来看，会想知道为什么这样改吗？"** 会，就写一篇。

> 不确定就按要写处理。别用"以后再补 / 代码即文档 / 改动小"跳过。

---

## 放在哪

路径即分类：

```
.agents/notes/{状态}/{种类}/2026-08-23-主题.md
# 例：.agents/notes/implemented/feature/2026-08-23-xxx.md
```

完整目录（轻量项目只建 `implemented/<class>/` 即可，空目录可直接删）：

```
.agents/notes/
├── implemented/
│   ├── feature/
│   ├── bug-fix/
│   ├── architecture/
│   ├── process/
│   ├── testing/
│   └── simplification/
├── proposed/   # 同上 6 类，按需创建
├── rejected/   # 同上
└── archived/   # 同上，冻结不可改
```

- **状态**：`proposed` 提议中 → `implemented` 已上线 → `rejected` 已否掉 → `archived` 归档冻结
- **种类**（6 选 1，写错会报错）：`feature` / `bug-fix` / `architecture` / `process` / `testing` / `simplification`

`refactor` 不单列——用 `simplification` 的标准判断：可观察行为变了吗？没变就是简化。

---

## 怎么用

```bash
# 1. 安装
npx skills add czm15053/write-notes-like-deepseek

# 2. 做决定时就写：有想法先写 proposed，做完最晚与代码同一次提交更新为 implemented
#    已有归属的决定 → 更新那篇；全新决定 → 新建一篇
```

校验（可选接 CI）：

```bash
npx tsx scripts/verify-agent-note-tree.ts     # 路径、状态、种类、文件名
npx tsx scripts/verify-agent-note-format.ts   # 开头三行、必备章节、Alternatives
```

---

## 让 Agent 自动执行

在项目的 `AGENTS.md` / `CLAUDE.md` 加一句钩子，Agent 就会在重要改动时自动按本 Skill 走：

```markdown
## 决策留痕

重要改动或重要决定（行为 / 架构 / 契约 / 流程 / 落盘格式，或动手前的选型与否决）执行
[write-notes-like-deepseek](.agents/skills/write-notes-like-deepseek/SKILL.md)：
有想法先写 `proposed`，落地后最晚与代码同一次提交更新为 `implemented`；被否决的写 `rejected`；
每篇必含 `## Alternatives considered`。
只改格式 / 无歧义重命名 / 错别字标 `not applicable`。
```

团队项目可在 `CONTRIBUTING.md` 或 PR 模板再加一句："非平凡改动必带 Note"，与 CI 门禁闭环：

```json
{
  "scripts": {
    "verify-agent-note-tree": "tsx .agents/skills/write-notes-like-deepseek/scripts/agent-note-tree.ts",
    "verify-agent-note-format": "tsx .agents/skills/write-notes-like-deepseek/scripts/verify-agent-note-format.ts",
    "doc-sync": "npm run verify-agent-note-tree && npm run verify-agent-note-format"
  }
}
```

---

## 包含什么

```
.
├── SKILL.md       # Agent 执行的主流程（每次必读）
├── templates/     # 三态模板：proposed / implemented / rejected
├── references/    # 按需加载：格式 / 分类 / 归档 / 行文 / 简化 / 校验
└── scripts/       # 校验脚本
```

## 参考

- 来源：[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 的 `.agents/notes/README.md`、`.agents/skills/dsh-archive-agent-notes`、`scripts/agent-note-tree.ts`、`scripts/verify-agent-note-format.ts`
- 规范：[Agent Skills](https://agentskills.io)

## 友链

- [LinuxDo](https://linux.do) — 真诚、友善、团结、专业的新生代 AI 社区

## 许可

MIT
