# 本地评估任务集

用于在 M7 计划执行模式前后，对比 agent 完成固定 coding 任务的成功率。

评估任务必须操作临时 fixture 项目，不能修改 tiny-agent 自身源码、README 或进度文档。

## 使用方式

1. 运行前复制或重建 `eval/fixtures/basic-ts-app` 到本地评估目录，例如 `eval/runs/EVAL-001`。
2. 在 M7 实现前，逐个让普通模式 agent 只操作对应临时目录，记录到 `eval/results.md`。
3. 在 M7 实现后，用同一批任务再次运行，但入口改为 `/plan <task>`。
4. 每个任务从干净 fixture 开始，运行后直接删除临时目录。
5. 评分只看临时目录最终状态，不看模型自我评价。

## 恢复现场

不要直接改 tiny-agent 自身源码。每个任务都使用 workspace 内的一次性本地副本：

```bash
rm -rf eval/runs/EVAL-001
mkdir -p eval/runs
cp -R eval/fixtures/basic-ts-app eval/runs/EVAL-001
```

测试结束后删除该任务目录即可恢复现场：

```bash
rm -rf eval/runs/EVAL-001
```

如果需要复查结果，先用 `diff -ru eval/fixtures/basic-ts-app eval/runs/EVAL-001` 保存差异，再删除本地副本。

`eval/runs/` 已加入 `.gitignore`，所以测试过程中产生的修改不会进入版本控制。

## 结果统计

每个任务记录一行：

- 分数：`1`、`0.5` 或 `0`
- 构建：`pass` 或 `fail`
- 工具确认次数：人工批准 `write_file` 和 `run_shell_command` 的总次数
- 失败原因：从固定分类中选一个主要原因

汇总时按下面公式计算：

- 成功数：分数为 `1` 的任务数
- 成功率：成功数 / 总任务数
- 平均分：所有任务分数之和 / 总任务数
- 构建通过率：构建为 `pass` 的任务数 / 总任务数

## 评分标准

| 分数 | 含义 |
|---|---|
| 1 | 成功：满足全部验收标准，且 `npm run build` 通过 |
| 0.5 | 部分成功：主要功能完成，但有小问题、漏改文档或需要人工修正 |
| 0 | 失败：无法完成核心目标、破坏已有功能，或构建失败 |

## 指标

- 成功率：`成功任务数 / 总任务数`
- 平均分：所有任务分数平均值
- 构建通过率：`npm run build` 通过次数 / 总任务数
- 工具确认次数：人工批准 `write_file` 和 `run_shell_command` 的次数
- 失败原因：规划错误、读上下文不足、工具参数错误、实现错误、验证不足

## 任务

### EVAL-001：补齐 README 的 plan mode 说明

提示词：

```text
只操作临时测试项目目录。更新该目录里的 README，加入 /plan <task> 模式说明。说明它会先生成计划、逐步更新状态、最后输出计划汇总。不要修改 src 目录。
```

验收标准：

- 临时测试项目的 README 出现 `/plan <task>`。
- 说明包含生成计划、更新步骤状态、最终汇总三个要点。
- 临时测试项目的 `src/` 没有被修改。
- `npm run build` 通过。

### EVAL-002：修复 TypeScript 格式小问题

提示词：

```text
只操作临时测试项目目录。检查 src/index.ts 的基础格式问题，只做不改变行为的整理：补齐明显缺失的分号，移除多余空行。完成后运行构建。
```

验收标准：

- `src/index.ts` 中明显缺失的语句分号被补齐。
- 没有改变运行逻辑。
- `npm run build` 通过。

### EVAL-003：新增只读安全命令

提示词：

```text
只操作临时测试项目目录。允许示例 CLI 执行只读 shell 命令 rg，并把它的风险标记为 low。只修改必要位置，完成后运行构建。
```

验收标准：

- 临时测试项目的 `COMMAND_RISK_RULES` 包含 `rg: "low"`。
- 没有放宽其他未知命令的风险。
- `npm run build` 通过。

### EVAL-004：改进工具失败文案

提示词：

```text
只操作临时测试项目目录。当工具执行失败时，让回传给模型的结果同时包含工具名，方便模型判断是哪一个工具失败。保持终端展示逻辑不变，完成后运行构建。
```

验收标准：

- 临时测试项目的 `runAgent` 捕获工具执行异常时，tool message 内容包含工具名。
- 未改变成功工具调用的消息格式。
- `npm run build` 通过。

### EVAL-005：新增 CLI 帮助命令

提示词：

```text
只操作临时测试项目目录。给示例 CLI 增加 --help 支持：当 argv 包含 --help 时打印一段简短用法并退出，不执行主逻辑。完成后运行构建。
```

验收标准：

- 临时测试项目支持 `node dist/index.js --help` 输出用法。
- 未破坏无参数运行时的原有输出。
- `npm run build` 通过。

## Fixture 要求

`eval/fixtures/basic-ts-app` 应该是一个很小的 TypeScript 项目，包含：

- `package.json` 和 `tsconfig.json`
- `README.md`
- `src/index.ts`
- `src/agent/run-agent.ts`

fixture 代码可以刻意保留少量格式问题，用于测试 agent 的编辑能力。
