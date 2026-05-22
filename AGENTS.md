# AGENTS.md

本文件是这个项目的"说明书"，供每次 Codex 会话快速了解项目背景与约定。

## 项目目标

用 **TypeScript** 编写一个调用 **DeepSeek API** 的**终端交互式 coding agent**——类似 Codex 的命令行助手：能在终端中多轮对话，并通过工具调用读写文件、执行命令来帮助完成编码任务。

这是一个从零自建、用于学习与实践的项目。

## 技术栈

| 维度 | 选择 |
|---|---|
| 语言/运行时 | TypeScript / Node.js |
| 包管理器 | **npm**（Node 自带，教程通用） |
| 模型 API | **DeepSeek**（OpenAI 兼容接口） |
| SDK | 官方 `openai` npm 包，base URL 指向 DeepSeek |
| CLI 交互 | 待定（M4 阶段再选） |

## DeepSeek 接入约定

- **Base URL**：`https://api.deepseek.com`
- **模型**：
  - `deepseek-chat`（V3）—— 默认模型，**支持 function calling（工具调用）**
  - `deepseek-reasoner`（R1）—— 推理模型，**不支持 function calling**
- **API Key**：通过环境变量 `DEEPSEEK_API_KEY` 读取。
  - ⚠️ **绝不硬编码进源码，绝不提交进仓库**（用 `.env` + `.gitignore`）。
- 因为是 OpenAI 兼容接口，可直接用 `openai` SDK：
  ```ts
  import OpenAI from "openai";
  const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  });
  ```

## 计划目录结构

> 规划中，随实现调整。

```
src/
  index.ts        # CLI 入口
  agent/          # agent loop、对话状态管理
  tools/          # 工具实现（读文件、写文件、列目录、执行命令…）
  llm/            # DeepSeek 客户端封装
```

## 命令约定

> 待项目初始化（M0）后填入实际脚本，目前为预期约定。

- 开发：`npm run dev`
- 构建：`npm run build`
- 运行：`npm start`

## 代码风格

- TypeScript **strict 模式**。
- 优先小而专注的模块，单一职责。
- 工具调用遵循标准 **function-calling 协议**（OpenAI 兼容格式）。
- **代码与配置文件中的所有注释一律用英文**（文档如本文件、progress.md 仍用中文）。

## 协作约定

- 每完成一个里程碑，更新 `progress.md`（勾选任务、记录决策）。
- 路线图与当前进度见 `progress.md`。
- 后续对话默认不举例，回答尽量控制在 200 字内；只有明确要求例子或需要代码时再展开。
