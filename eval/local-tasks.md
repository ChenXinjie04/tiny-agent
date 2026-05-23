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
- 失败原因：规划错误、读上下文不足、工具参数错误、实现错误、验证不足

## 任务

### EVAL-001：多文件一致性修改

提示词：

```text
只操作临时测试项目目录 eval/runs/EVAL-001。给示例 CLI 增加 --help 支持：当 argv 包含 --help 时打印一段简短用法并退出，不执行默认主逻辑。同时更新 README，说明默认运行、--version 和 --help 三种用法。完成后运行构建，并验证 --help、--version 和无参数运行的输出。
```

验收标准：

- `src/index.ts` 支持 `--help`，输出简短用法。
- `README.md` 同时说明默认运行、`--version` 和 `--help`。
- `node dist/index.js --help` 输出用法。
- `node dist/index.js --version` 仍输出版本号。
- `node dist/index.js` 仍输出原有默认结果。
- `npm run build` 通过。

### EVAL-002：工具失败结果包含上下文

提示词：

```text
只操作临时测试项目目录 eval/runs/EVAL-002。改进 src/agent/run-agent.ts：当工具执行失败时，返回给调用方的错误字符串必须包含工具名和原始错误信息，方便判断是哪一个工具失败；成功工具调用的返回值必须保持不变。完成后运行构建，并用一个会抛错的临时工具做最小验证。
```

验收标准：

- `runAgentTool` 捕获工具异常时，返回内容包含 `tool.name`。
- 失败返回内容仍包含原始错误信息。
- 成功工具调用仍直接返回 `tool.run()` 的结果，不额外包裹。
- `npm run build` 通过。

### EVAL-003：包含可跳过步骤的任务

提示词：

```text
只操作临时测试项目目录 eval/runs/EVAL-003。先检查项目脚本和 README。若 README 已存在，不要创建新 README，只更新现有 README 增加一节 “Validation”；若 package.json 没有 test 脚本，明确跳过测试并说明原因；最后必须运行 npm run build。不要修改 src 目录。
```

验收标准：

- 未创建额外 README 文件，只更新现有 `README.md`。
- `README.md` 增加 `Validation` 相关说明。
- 如果没有 `test` 脚本，最终说明中明确测试被跳过及原因。
- 临时测试项目的 `src/` 没有被修改。
- `npm run build` 通过。

## Fixture 要求

`eval/fixtures/basic-ts-app` 应该是一个很小的 TypeScript 项目，包含：

- `package.json` 和 `tsconfig.json`
- `README.md`
- `src/index.ts`
- `src/agent/run-agent.ts`

fixture 代码可以刻意保留少量格式问题，用于测试 agent 的编辑能力。
