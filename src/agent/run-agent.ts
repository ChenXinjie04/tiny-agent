import type OpenAI from "openai";
import { DEFAULT_MODEL } from "../llm/client.js";
import { getTool, toolSpecs } from "../tools/index.js";

export async function runAgent(client: OpenAI, userInput: string): Promise<string> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "user", content: userInput },
  ];
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
