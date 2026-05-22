import type { Tool } from "./types.js";
import { listDirTool } from "./list-dir.js";

export const tools: Tool[] = [listDirTool];
export const toolSpecs = tools.map((tool) => tool.spec);
const toolMap = new Map(tools.map((tool) => {
  if (tool.spec.type !== "function") {
    throw new Error("Only function tools are supported.");
  } 
  return [tool.spec.function.name, tool] as const}));

export function getTool(name: string): Tool {
  const tool = toolMap.get(name);

  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  return tool;
}
