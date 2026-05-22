import { readFile } from "node:fs/promises";
import { resolveInsideWorkspace } from "./path-safety.js";
import type { Tool } from "./types.js";

export const readFileTool: Tool = {
  spec: {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the text content of a file.",
      parameters: {
        type: "object",
        properties: {
          filePath: {
            type: "string",
            description: "File path to read.",
          },
        },
        required: ["filePath"],
        additionalProperties: false,
      },
    },
  },
  async run(args) {
    const filePath = readStringArg(args, "filePath");
    const resolvedPath = resolveInsideWorkspace(filePath);

    return await readFile(resolvedPath, "utf8");
  },
}

function readStringArg(args: Record<string, unknown>, key: string): string {
  const value = args[key];

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Expected "${key}" to be a non-empty string.`);
  }

  return value;
}
