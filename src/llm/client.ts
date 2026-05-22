import OpenAI from "openai";

// DeepSeek exposes an OpenAI-compatible API, so we reuse the openai SDK.
export const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

// Default chat model (V3). Supports function calling.
export const DEFAULT_MODEL = "deepseek-v4-pro";

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
