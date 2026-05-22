# 进度记录 / Progress

## 当前状态

📍 **M4 交互式终端体验** —— 已完成 REPL 与对话历史维护。
下一步：实现 **流式输出（streaming）**，让模型回复边生成边显示。

## 里程碑路线图

> 草稿，供讨论调整。每完成一项请勾选。

### M0 — 文档与项目骨架
- [x] 创建 CLAUDE.md
- [x] 创建 progress.md
- [x] `npm init` 初始化项目（package.json，已设为 ESM `"type": "module"`）
- [x] 配置 TypeScript（tsconfig.json，strict 模式）
- [x] 安装依赖（`openai`、`dotenv`、`typescript`、`tsx`、`@types/node`）
- [x] 配置 `.gitignore`（含 `node_modules/`、`.env`、`dist/`）
- [x] 创建 `.env.example` 示例模板
- [x] 配置 `npm run dev` 脚本（含 `build`、`start`）

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
- [ ] 流式输出（streaming）

### M5 — 打磨
- [ ] 设计 system prompt
- [ ] 错误处理（网络、API、工具执行失败）
- [ ] API key 配置体验（`.env` / 环境变量）
- [ ] （可选）工具执行前的权限确认

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
