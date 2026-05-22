import "dotenv/config";
import readline from "node:readline/promises";
import { runAgent } from "./agent/run-agent.js";
import { createClient } from "./llm/client.js";

const client = createClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


const prompt = await rl.question("You: ");
rl.close();

const answer = await runAgent(client, prompt);

console.log("AI:", answer);
