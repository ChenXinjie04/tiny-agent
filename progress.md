# 进度记录 / Progress

## 当前状态

📍 **M7 计划执行模式** —— 设计已确定，准备实现 `/plan <task>` 单次计划模式。
下一步：先用 `eval/local-tasks.md` 跑一轮普通模式 baseline，再实现 plan mode 并用同一批任务对比成功率。

## 里程碑路线图

> 草稿，供讨论调整。每完成一项请勾选。

### M0 — 文档与项目骨架
- [x] 创建 CLAUDE.md
- [x] 创建 progress.md
- [x] `npm init` 初始化项目（package.json，已设为 ESM `"type": "module"`）
- [x] 配置 TypeScript（tsconfig.json，strict 模式）
- [x] 安装依赖（`openai`、`dotenv`、`typescript`、`tsx`、`@types/node`）
- [x] 配置 `.gitignore`（含 `node_modules/`、`.env`、`dist/`）
- [x] 将 `AGENTS.md`、`CLAUDE.md` 加入 `.gitignore`
- [x] 创建 `.env.example` 示例模板
- [x] 配置 `npm run dev` 脚本（含 `build`、`start`）
- [x] 创建 README.md，说明项目定位、运行方式与目录结构

### M1 — 最小对话回路
- [x] 封装 DeepSeek 客户端（`src/llm/client.ts`，导出 `createClient` + 模型/URL 常量）
- [x] 从终端读取一行输入（Node 自带 `readline/promises`）
- [x] 调用 `deepseek-chat` 并打印回复
- [x] 跑通"输入 → 模型 → 输出"的最小闭环（暂不带工具、暂不多轮）

### M2 — Agent 工具调用循环
- [x] 定义工具的描述（function-calling schema）
- [x] 实现 agent loop：模型请求调工具 → 执行 → 结果回传 → 继续
- [x] 处理多步工具调用直到模型给出最终答复

### M3 — 核心工具集
- [x] 列目录
- [x] 读文件
- [x] 写文件
- [x] 执行 shell 命令

### M4 — 交互式终端体验
- [x] REPL（持续多轮对话）
- [x] 维护对话历史
- [x] 流式输出（streaming）
- [x] 工具调用结果可在终端中展示

### M5 — 稳定性收尾
- [x] 设计 system prompt
- [x] 基础错误处理（未知工具、JSON 解析失败、工具执行失败）
- [x] API key 配置体验（`.env` / 环境变量）
- [x] 工具执行前的权限确认
- [x] 终端错误显示优化（网络、API 报错）
- [x] REPL 不因单次错误直接退出

### M6 — 安全机制
- [x] 写文件前展示 diff，而不是只展示文件名和长度
- [x] 命令执行前展示风险并请求确认
- [x] 限制工具只能操作当前项目目录
- [x] 拦截明显危险的路径和命令

### M7 — 计划执行模式
- [ ] 先跑 `eval/local-tasks.md` 的普通模式 baseline，并记录到 `eval/results.md`
- [ ] 支持 `/plan <task>` 单次开启计划执行模式
- [ ] 让模型先生成结构化 plan，再开始选择和调用工具
- [ ] 本地记录每个步骤的状态：pending / running / done / failed
- [ ] 新增仅计划模式可用的 `update_plan_step` 内部工具，由模型显式更新步骤状态
- [ ] 每次状态更新后把完整计划快照追加到 messages，旧状态历史暂时保留
- [ ] 工具执行失败后把失败结果回传给模型，由模型决定重试、跳过或停止
- [ ] 最后输出模型总结，并额外打印本地计划状态汇总

### M8 — 上下文管理
- [ ] 控制 messages 长度，避免无限增长
- [ ] 对历史对话做摘要压缩
- [ ] 压缩或替换旧的 plan 状态快照，保留最新计划状态
- [ ] 对读取过的文件生成摘要缓存
- [ ] 按任务选择相关上下文，而不是全部塞给模型

### M9 — 工程化
- [ ] 为核心工具添加测试
- [ ] 为 agent loop 添加最小测试
- [ ] 增加结构化日志
- [ ] 增加配置文件，管理模型、权限和工具开关
- [ ] 发布成可执行 CLI

### M10 — Agent Runtime 化
- [ ] 引入 task session：每次任务有 id、状态和消息记录
- [ ] 记录每次模型请求、工具调用、工具结果和错误
- [ ] 支持根据日志回放一次 agent 执行过程
- [ ] 增加评估入口，用固定任务集测试 agent 表现
- [ ] 统计成功率、耗时、工具调用次数和失败原因

### M11 — Subagent 与 Multi-Agent 探索
- [ ] 设计 subagent 的最小抽象：角色、输入上下文、输出结果和权限边界
- [ ] 增加只读型 `reviewer` subagent，用局部文件上下文执行代码审查
- [ ] 增加只读型 `summarizer` subagent，用于压缩长对话或长文件内容
- [ ] 设计 coordinator 调度流程：主 agent 分配任务，subagent 返回结构化结果
- [ ] 记录 subagent 与主 agent 的上下文隔离策略，避免无关历史污染结果
- [ ] 探索 multi-agent 执行日志，记录每个 agent 的输入、输出、耗时和失败原因
- [ ] 明确当前版本边界：先支持顺序调度，不做并行执行和复杂 agent 协商

### M12 — Filesystem MCP 接入
- [ ] 理解 MCP client / server 的基本通信流程和工具发现机制
- [ ] 接入一个只读 filesystem MCP server，用于列目录和读取项目文件
- [ ] 将 MCP server 暴露的工具转换成模型可调用的 function-calling schema
- [ ] 在 agent runtime 中增加 MCP tool provider，与现有内置工具共存
- [ ] 保持写文件仍走本地 `write_file` 工具和确认流程，避免绕过安全机制
- [ ] 记录 MCP 调用日志：server、tool name、arguments、result 和错误信息
- [ ] 对比内置工具与 MCP 工具的边界、优势和复杂度

### M13 — 项目展示与评估
- [ ] 编写 ARCHITECTURE.md，解释 Agent Loop、Tool Use、Planning、Memory 和上下文管理设计
- [ ] 编写 EVAL_REPORT.md，记录固定任务集的成功率、失败原因和改进效果
- [ ] 准备 3 个真实任务 case study，展示 agent 如何完成实际开发任务
- [ ] 在 README.md 增加核心能力概览、运行截图和使用边界
- [ ] 准备 3-5 分钟 demo 脚本，覆盖一次成功任务和一次失败恢复
- [ ] 说明关键设计取舍、风险控制和验证方法

## 决策记录

> 记录关键技术选型与理由，便于日后回顾。

| 日期 | 决策 | 理由 |
|---|---|---|
| 2026-05-22 | 语言用 TypeScript / Node.js | 适合做 CLI 工具，类型安全，生态丰富 |
| 2026-05-22 | 模型 API 用 DeepSeek | OpenAI 兼容接口，可直接用 `openai` SDK |
| 2026-05-22 | 目标形态：终端 CLI agent | 类似 Claude Code 的交互式命令行 agent |
| 2026-05-22 | 包管理器用 npm | Node 自带、教程通用、对小项目足够快 |
| 2026-05-22 | `npm run dev` 用 `tsx watch` | 直接跑 TS 源码、改动自动重载，免去手动编译 |
| 2026-05-22 | M1 客户端先内联在 `index.ts` | 学习项目：先看到闭环，重构动机更清楚后再抽 `src/llm/` |
| 2026-05-22 | 项目名倾向 `tiny-agent` | 表达“小而完整”的学习版 coding agent，更直观亲切 |
| 2026-05-22 | 写文件和执行命令前需要用户确认 | 这两类工具有副作用，确认后再执行更安全 |
| 2026-05-22 | M7 只实现 `/plan <task>` 单次计划模式 | 先保持入口简单明确，避免引入长期模式开关 |
| 2026-05-22 | 计划步骤由模型分解，状态由模型调用内部工具更新 | runtime 不猜测工具属于哪一步，只负责校验、记录和回传完整计划快照 |
| 2026-05-22 | M7 暂时保留旧 plan 状态历史，M8 再压缩 | 先保证 function calling 协议简单可用，再处理上下文增长问题 |
| 2026-05-22 | M7 前先建立固定本地评估任务集 | 用同一批任务对比普通模式和 plan mode 的成功率，避免只凭体感判断效果 |
