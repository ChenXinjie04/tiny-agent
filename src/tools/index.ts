import type { Tool } from "./types.js";
import { listDirTool } from "./list-dir.js";

export const tools: Tool[] = [listDirTool];
export const toolSpecs = tools.map((tool) => tool.spec);
const toolMap = new Map(tools.map((tool) => [tool.spec.function.name, tool]));

export function getTool(name: string): Tool {
  const tool = toolMap.get(name);

  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  return tool;
}
