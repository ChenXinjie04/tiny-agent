import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Tool } from "./types.js";

const ALLOWED_COMMANDS = new Set(["npm", "git", "ls", "pwd", "gcc"]);
const execFileAsync = promisify(execFile);

export const runShellCommandTool: Tool = {
  spec: {
    type: "function",
    function: {
      name: "run_shell_command",
      description: "Run a shell command and return stdout and stderr.",
      parameters: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description: "Executable name only, for example npm or git. Do not include arguments.",
          },
          args: {
            type: "array",
            items: { type: "string" },
            description: "Command arguments, for example ['run', 'build'].",
          },
        },
        required: ["command"],
        additionalProperties: false,
      },
    },
  },
  async run(args) {
    const command = readStringArg(args, "command");
    const commandArgs = readStringArrayArg(args, "args");

    if (!ALLOWED_COMMANDS.has(command)) {
      throw new Error(`Command not allowed: ${command}`);
    }
    const { stdout, stderr } = await execFileAsync(command, commandArgs, {
      cwd: process.cwd(),
    });

    return [stdout, stderr].filter(Boolean).join("\n");
  },
};

function readStringArg(args: Record<string, unknown>, key: string): string {
  const value = args[key];

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Expected "${key}" to be a non-empty string.`);
  }

  return value;
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
