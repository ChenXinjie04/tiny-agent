import { readdir } from "node:fs/promises";
import path from "node:path";
import type { Tool } from "./types.js";

export const listDirTool: Tool = {
spec: {
    type: "function",
    function: {
      name: "list_dir",
      description: "List files and directories inside a directory.",
      parameters: {
        type: "object",
        properties: {
          dirPath: {
            type: "string",
            description: "Directory path to list.",
          },
        },
        required: ["dirPath"],
        additionalProperties: false,
      },
    },
  },
async run(args) {
    const dirPath = readStringArg(args, "dirPath");
    const resolvedPath = path.resolve(process.cwd(), dirPath);

    const entries = await readdir(resolvedPath, { withFileTypes: true });

    return entries
      .map((entry) => (entry.isDirectory() ? `${entry.name}/` : entry.name))
      .join("\n");
  },
}

function readStringArg(args: Record<string, unknown>, key: string): string {
  const value = args[key];

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Expected "${key}" to be a non-empty string.`);
  }

  return value;
}

