import OpenAI from "openai";

// DeepSeek exposes an OpenAI-compatible API, so we reuse the openai SDK.
export const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";

// DeepSeek V4 model. Supports tool calls, including thinking-mode tool calls.
export const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-pro";

export const DEEPSEEK_THINKING_TYPE =
  process.env.DEEPSEEK_THINKING_TYPE ?? "enabled";

export const DEEPSEEK_REASONING_EFFORT =
  process.env.DEEPSEEK_REASONING_EFFORT ?? "high";
/**
 * Build a DeepSeek client from the DEEPSEEK_API_KEY environment variable.
 * Fails fast with a clear message instead of an opaque SDK stack trace.
 */
export function createClient(): OpenAI {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("Missing DEEPSEEK_API_KEY. Set it in your .env file.");
    process.exit(1);
  }

  return new OpenAI({ apiKey, baseURL: DEEPSEEK_BASE_URL });
}
