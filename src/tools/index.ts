import type { Tool } from "./types.js";
import { listDirTool } from "./list-dir.js";
import { readFileTool } from "./read-file.js"
import { writeFileTool } from "./write-file.js"

export const tools: Tool[] = [listDirTool, readFileTool, writeFileTool];
export const toolSpecs = tools.map((tool) => tool.spec);
const toolMap = new Map(tools.map((tool) => {
  if (tool.spec.type !== "function") {
    throw new Error("Only function tools are supported.");
  }
  return [tool.spec.function.name, tool] as const
}));

export function getTool(name: string): Tool {
  const tool = toolMap.get(name);

  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  return tool;
}
