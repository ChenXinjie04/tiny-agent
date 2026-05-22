import type OpenAI from "openai";
import {
  DEEPSEEK_REASONING_EFFORT,
  DEEPSEEK_THINKING_TYPE,
  DEFAULT_MODEL,
} from "../llm/client.js";
import { getTool, toolSpecs } from "../tools/index.js";
import { SYSTEM_PROMPT } from "./system-prompt.js";

export type AgentMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

type StreamToolCall = {
  id: string;
  name: string;
  arguments: string;
};

type DeepSeekChatRequestExtra = {
  reasoning_effort?: string;
  extra_body?: {
    thinking?: {
      type: string;
    };
  };
};

type DeepSeekAssistantMessage = OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam & {
  reasoning_content?: string;
};

export async function runAgent(
  client: OpenAI,
  messages: AgentMessage[],
  onText: (text: string) => void,
  onToolResult: (name: string, result: string) => void,
  shouldConfirmTool: (name: string, args: Record<string, unknown>) => Promise<boolean>,
): Promise<void> {
  if (messages.length === 0) {
    messages.push({
      role: "system",
      content: SYSTEM_PROMPT,
    });
  }
  while (true) {
    let finalText = "";
    let reasoningContent = "";
    const stream = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages,
      tools: toolSpecs,
      stream: true,
      reasoning_effort: DEEPSEEK_REASONING_EFFORT,
      extra_body: {
        thinking: {
          type: DEEPSEEK_THINKING_TYPE,
        },
      },
    } as OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming & DeepSeekChatRequestExtra);

    const toolCalls = new Map<number, StreamToolCall>();
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;

      const deepSeekDelta = delta as typeof delta & {
        reasoning_content?: string;
      };

      if (deepSeekDelta?.reasoning_content) {
        reasoningContent += deepSeekDelta.reasoning_content;
      }

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
      const assistantMessage: DeepSeekAssistantMessage = {
        role: "assistant",
        content: finalText,
      };

      if (reasoningContent.length > 0) {
        assistantMessage.reasoning_content = reasoningContent;
      }

      messages.push(assistantMessage);
      return;
    }

    const assistantMessage: DeepSeekAssistantMessage = {
      role: "assistant",
      content: finalText,
      tool_calls: [...toolCalls.values()].map((toolCall) => ({
        id: toolCall.id,
        type: "function",
        function: {
          name: toolCall.name,
          arguments: toolCall.arguments,
        },
      })),
    };

    if (reasoningContent.length > 0) {
      assistantMessage.reasoning_content = reasoningContent;
    }

    messages.push(assistantMessage);

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
