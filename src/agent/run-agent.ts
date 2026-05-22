import type OpenAI from "openai";
import { DEFAULT_MODEL } from "../llm/client.js";
import { getTool, toolSpecs } from "../tools/index.js";
import { SYSTEM_PROMPT } from "./system-prompt.js";

export type AgentMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

type StreamToolCall = {
  id: string;
  name: string;
  arguments: string;
};

export async function runAgent(
  client: OpenAI,
  messages: AgentMessage[],
  onText: (text: string) => void,
  onToolResult: (name: string, result: string) => void,
  shouldConfirmTool: (name: string, args: Record<string, unknown>) => Promise<boolean>,
): Promise<void> {
  let finalText = "";
  if (messages.length === 0) {
    messages.push({
      role: "system",
      content: SYSTEM_PROMPT,
    });
  }
  while (true) {
    const stream = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages,
      tools: toolSpecs,
      stream: true,
    });

    const toolCalls = new Map<number, StreamToolCall>();
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;

      if (delta?.content) {
        finalText += delta.content;
        onText(delta.content);
      }

      for (const toolCall of delta?.tool_calls ?? []) {
        const index = toolCall.index;
        const current = toolCalls.get(index) ?? {
          id: "",
          name: "",
          arguments: "",
        };

        if (toolCall.id) {
          current.id = toolCall.id;
        }

        if (toolCall.function?.name) {
          current.name += toolCall.function.name;
        }

        if (toolCall.function?.arguments) {
          current.arguments += toolCall.function.arguments;
        }

        toolCalls.set(index, current);
      }
    }

    if (toolCalls.size === 0) {
      messages.push({
        role: "assistant",
        content: finalText,
      });
      return;
    }

    messages.push({
      role: "assistant",
      content: null,
      tool_calls: [...toolCalls.values()].map((toolCall) => ({
        id: toolCall.id,
        type: "function",
        function: {
          name: toolCall.name,
          arguments: toolCall.arguments,
        },
      })),
    });

    for (const toolCall of toolCalls.values()) {
      let args: Record<string, unknown>;
      let result: string;
      let tool;
      try {
        tool = getTool(toolCall.name);
      } catch (error) {
        const result = error instanceof Error
          ? `Unknown tool: ${error.message}`
          : "Unknown tool.";

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });

        continue;
      }
      try {
        args = JSON.parse(toolCall.arguments) as Record<string, unknown>;
      } catch {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: `Invalid tool arguments JSON: ${toolCall.arguments}`,
        });
        continue;
      }

      const confirmed = await shouldConfirmTool(toolCall.name, args);
      if (!confirmed) {
        result = "User denied tool execution.";
        onToolResult(toolCall.name, result);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });

        continue;
      }

      try {
        result = await tool.run(args);
      } catch (error) {
        result = error instanceof Error
          ? `Tool failed: ${error.message}`
          : "Tool failed with unknown error.";
      }
      onToolResult(toolCall.name, result);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      });
    }
  }
}
