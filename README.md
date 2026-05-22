# coding-agent

A terminal coding agent written in TypeScript and powered by the DeepSeek API.

This is a learning project for building a small Codex-like command line assistant from scratch. It supports multi-turn chat in the terminal and uses OpenAI-compatible function calling to run local tools such as listing directories, reading files, writing files, and running allowed shell commands.

## Features

- Interactive terminal REPL
- Multi-turn conversation history
- DeepSeek API access through the official `openai` SDK
- OpenAI-compatible tool calling
- Local tools:
  - `list_dir`
  - `read_file`
  - `write_file`
  - `run_shell_command`
- Streaming model output

## Tech Stack

- TypeScript
- Node.js
- npm
- DeepSeek API
- `openai` SDK
- `tsx` for local development

## Requirements

- Node.js
- npm
- DeepSeek API key

## Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file:

```bash
DEEPSEEK_API_KEY=your_api_key_here
```

The API key is read from the environment and should never be committed.

## Scripts

Run in development mode:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Run the built output:

```bash
npm start
```

## Project Structure

```text
src/
  index.ts        # CLI entry
  agent/          # Agent loop and conversation handling
  llm/            # DeepSeek/OpenAI-compatible client
  tools/          # Local tool definitions and implementations
```

## Notes

- The default model should be `deepseek-chat`, because it supports function calling.
- `deepseek-reasoner` does not support function calling.
- Shell command execution should stay restricted through an allowlist.
- This project is for learning and experimentation, so the implementation favors clarity over framework-level abstraction.

