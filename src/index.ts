import "dotenv/config";
import readline from "node:readline/promises";
import { createClient, DEFAULT_MODEL } from "./llm/client.js";

const client = createClient();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const prompt = await rl.question("You: ");
rl.close();

const res = await client.chat.completions.create({
  model: DEFAULT_MODEL,
  messages: [{ role: "user", content: prompt }],
});

console.log("AI:", res.choices[0].message.content);
