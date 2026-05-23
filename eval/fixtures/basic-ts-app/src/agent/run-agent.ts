export type Tool = {
  name: string;
  run: () => Promise<string>;
};

export async function runAgentTool(tool: Tool): Promise<string> {
  try {
    return await tool.run();
  } catch (error) {
    return error instanceof Error
      ? `Tool failed: ${error.message}`
      : "Tool failed with unknown error.";
  }
}
