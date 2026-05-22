import "dotenv/config";
import readline from "node:readline/promises";
import { runAgent, type AgentMessage } from "./agent/run-agent.js";
import { createClient } from "./llm/client.js";

const client = createClient();
const messages: AgentMessage[] = []

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


while (true) {
  const input = await rl.question("You: ");
  if (input === "exit" || input === "quit") {
    break;
  }
  if (input.trim().length === 0) {
    continue;
  }
  messages.push({ role: "user", content: input })
  await runAgent(client, messages, (text) => {
    process.stdout.write(text);
  });
  process.stdout.write("\n");
}
rl.close();
