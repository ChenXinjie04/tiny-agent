import "dotenv/config";
import readline from "node:readline/promises";
import { runAgent, type AgentMessage } from "./agent/run-agent.js";
import { createClient } from "./llm/client.js";

const client = createClient();
const messages: AgentMessage[] = []

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


while (true) {
  const input = await rl.question("You: ");
  if (input === "exit" || input === "quit") {
    break;
  }
  if (input.trim().length === 0) {
    continue;
  }
  messages.push({ role: "user", content: input })
  try {
    await runAgent(client, messages, (text) => process.stdout.write(text), printToolResult, confirmToolExecution,);
  } catch (error) {
    process.stdout.write(`\n[error] ${formatError(error)}\n\n`);
  }
  process.stdout.write("\n");
}
rl.close();

async function confirmToolExecution(name: string, args: Record<string, unknown>): Promise<boolean> {
  if (name !== "write_file" && name !== "run_shell_command") {
    return true;
  }
  process.stdout.write(`\n[confirm] ${name}\n`);
  if (name === "write_file") {
    process.stdout.write(`file: ${String(args.filePath)}\n`);
    process.stdout.write(`content length: ${String(args.content ?? "").length} chars\n`);
  }
  if (name === "run_shell_command") {
    process.stdout.write(`command: ${String(args.command)} ${(args.args as string[] | undefined)?.join(" ") ?? ""}\n`);
  }
  const answer = await rl.question("Allow? [y/N] ");
  return answer.trim().toLowerCase() === "y";
}

function printToolResult(name: string, result: string) {
  process.stdout.write(`\n`);
  process.stdout.write(`┌─ tool: ${name}\n`);
  process.stdout.write(`│\n`);

  for (const line of result.split("\n")) {
    process.stdout.write(`│ ${line}\n`);
  }

  process.stdout.write(`└─ done\n\n`);
}

function formatError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Unknown error.";
  }

  const apiError = error as Error & {
    status?: number;
    code?: string;
    type?: string;
  };

  return [
    apiError.status ? `HTTP ${apiError.status}` : undefined,
    apiError.code,
    apiError.type,
    error.message,
  ].filter(Boolean).join(" - ");
}
