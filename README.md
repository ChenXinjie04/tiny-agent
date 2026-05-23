# tiny-agent

A terminal coding agent written in TypeScript and powered by the DeepSeek API.

This is a learning project for building a small Codex-like command line assistant from scratch. It supports multi-turn chat in the terminal and uses OpenAI-compatible function calling to run local tools such as listing directories, reading files, writing files, and running allowed shell commands.

## Features

- Interactive terminal REPL
- Multi-turn conversation history
- DeepSeek API access through the official `openai` SDK
- OpenAI-compatible tool calling
- System prompt for coding-agent behavior
- Local tools:
  - `list_dir`
  - `read_file`
  - `write_file`
  - `run_shell_command`
- Streaming model output
- Tool result display in the terminal
- Confirmation before writing files or running shell commands

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

This starts the agent from the current project directory.

Build the project:

```bash
npm run build
```

Run the built output:

```bash
npm start
```

Link the CLI command locally:

```bash
npm link
```

After linking, run the agent from any project directory:

```bash
tiny-agent
```

The workspace root is the directory where `tiny-agent` is started. File tools and shell commands are restricted to that directory.

For local evaluation, create a run directory and start the linked CLI there:

```bash
mkdir -p eval/runs/EVAL-001
cd eval/runs/EVAL-001
tiny-agent
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
- `write_file` and `run_shell_command` require user confirmation before execution.
- Tool failures are returned to the model as tool results so the agent can recover.
- This project is for learning and experimentation, so the implementation favors clarity over framework-level abstraction.
