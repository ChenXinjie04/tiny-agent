import type OpenAI from "openai";

export interface Tool {
    // The schema advertised to the model (OpenAI function-calling format).
    spec: OpenAI.Chat.Completions.ChatCompletionTool;
    // Executes the tool with model-provided args, returns a string for the model.
    run(args: Record<string, unknown>): Promise<string>;
}