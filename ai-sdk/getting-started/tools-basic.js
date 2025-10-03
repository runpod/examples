import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { generateText, tool } from "ai";
import { z } from "zod";

dotenv.config({ quiet: true });

console.log("function calling (tools) with Runpod AI SDK Provider\n");

// Define a simple calculator tool
const calculator = tool({
  description: "Add two numbers and return the sum",
  inputSchema: z.object({ a: z.number(), b: z.number() }),
  execute: async ({ a, b }) => {
    return a + b;
  },
});

async function main() {
  const result = await generateText({
    model: runpod("qwen/qwen3-32b-awq"),
    tools: { calculator },
    toolChoice: "auto",
    prompt:
      "Use the calculator tool to add 1337 and 42, then say the result in a sentence.",
  });

  console.log("\nfinal text:\n");
  console.log(result.text);

  if (result.toolCalls.length > 0) {
    console.log("\ntool calls:");
    console.log(result.toolCalls);
  }
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
