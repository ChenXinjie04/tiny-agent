import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { Tool } from "./types.js";

export const writeFileTool: Tool = {
  spec: {
    type: "function",
    function: {
      name: "write_file",
      description: "Write text content to a file.",
      parameters: {
        type: "object",
        properties: {
          filePath: {
            type: "string",
            description: "File path to write.",
          },
          content: {
            type: "string",
            description: "Text content to write.",
          },
        },
        required: ["filePath", "content"],
        additionalProperties: false,
      },
    },
  },

  async run(args) {
    const filePath = readStringArg(args, "filePath");
    const content = readStringArg(args, "content");
    const resolvedPath = path.resolve(process.cwd(), filePath);

    await writeFile(resolvedPath, content, "utf8");

    return `Wrote file: ${resolvedPath}`;
  },
};

function readStringArg(args: Record<string, unknown>, key: string): string {
  const value = args[key];

  if (typeof value !== "string") {
    throw new Error(`Expected "${key}" to be a string.`);
  }

  return value;
}
