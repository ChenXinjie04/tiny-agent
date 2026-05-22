import type OpenAI from "openai";
import { DEFAULT_MODEL } from "../llm/client.js";
import { getTool, toolSpecs } from "../tools/index.js";

export type AgentMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export async function runAgent(client: OpenAI, messages: AgentMessage[]): Promise<string> {
  while (true) {
    const res = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages,
      tools: toolSpecs,
    });

    const message = res.choices[0].message;
    messages.push(message);

    if (!message.tool_calls) {
      return message.content ?? "";
    }

    for (const toolCall of message.tool_calls) {
      if (toolCall.type !== "function") {
        throw new Error(`Unsupported tool call type: ${toolCall.type}`);
      }

      const tool = getTool(toolCall.function.name);
      const args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
      const result = await tool.run(args);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      });
    }
  }
}
