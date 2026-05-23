#!/usr/bin/env node
import "dotenv/config";
import readline from "node:readline/promises";
import { readFile } from "node:fs/promises";
import { runAgent, type AgentMessage } from "./agent/run-agent.js";
import { createClient } from "./llm/client.js";
import { resolveInsideWorkspace } from "./tools/path-safety.js";

const client = createClient();
const messages: AgentMessage[] = []

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

type CommandRisk = "low" | "medium" | "high";
const COMMAND_RISK_RULES: Record<string, CommandRisk | Record<string, CommandRisk>> = {
  pwd: "low",
  ls: "low",
  npm: {
    run: "medium",
    test: "medium",
  },
  git: {
    status: "low",
    diff: "low",
    log: "low",
    show: "low",
    add: "high",
    commit: "high",
    branch: "high",
  },
  gcc: "low",
};


function getCommandRisk(command: string, args: string[]): CommandRisk {
  const rule = COMMAND_RISK_RULES[command];

  if (rule === undefined) {
    return "high";
  }

  if (typeof rule === "string") {
    return rule;
  }

  const subcommand = args[0];
  return subcommand ? rule[subcommand] ?? "medium" : "medium";
}

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
    const filePath = readStringArg(args, "filePath");
    const nextContent = readStringArg(args, "content");
    const resolvedPath = resolveInsideWorkspace(filePath);
    const previousContent = await readExistingFile(resolvedPath);

    process.stdout.write(`file: ${filePath}\n`);
    process.stdout.write(buildSimpleDiff(previousContent, nextContent));
  }
  if (name === "run_shell_command") {
    const command = readStringArg(args, "command");
    const commandArgs = readStringArrayArg(args, "args");
    const risk = getCommandRisk(command, commandArgs);

    process.stdout.write(`risk: ${risk}\n`);
    process.stdout.write(`command: ${command} ${commandArgs.join(" ")}\n`);
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

async function readExistingFile(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

function readStringArg(args: Record<string, unknown>, key: string): string {
  const value = args[key];

  if (typeof value !== "string") {
    throw new Error(`Expected "${key}" to be a string.`);
  }

  return value;
}


function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

function buildSimpleDiff(previousContent: string | null, nextContent: string): string {
  if (previousContent === null) {
    return [
      "diff:",
      "--- /dev/null",
      "+++ new file",
      ...nextContent.split("\n").map((line) => `+ ${line}`),
      "\n",
    ].join("\n");
  }
  const previousLines = previousContent.split("\n");
  const nextLines = nextContent.split("\n");
  const maxLength = Math.max(previousLines.length, nextLines.length);
  const output: string[] = ["diff:"];
  for (let index = 0; index < maxLength; index++) {
    const previousLine = previousLines[index];
    const nextLine = nextLines[index];

    if (previousLine === nextLine) {
      output.push(`  ${previousLine ?? ""}`);
      continue;
    }

    if (previousLine !== undefined) {
      output.push(`- ${previousLine}`);
    }

    if (nextLine !== undefined) {
      output.push(`+ ${nextLine}`);
    }
  }
  output.push("\n");
  return output.join("\n");
}

function readStringArrayArg(args: Record<string, unknown>, key: string): string[] {
  const value = args[key];

  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`Expected "${key}" to be an array of strings.`);
  }

  return value;
}
