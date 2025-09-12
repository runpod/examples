import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { streamText } from "ai";

dotenv.config({ quiet: true });

console.log("streaming reasoning (qwen) with Runpod AI SDK Provider\n");

async function main() {
  // stream a reasoning task and print both reasoning and final text if available
  const result = await streamText({
    model: runpod("qwen/qwen3-32b-awq"),
    prompt:
      "think step by step to count how many 'r' letters are in the word 'strawberry', then answer just the number.",
    temperature: 0,
  });

  for await (const part of result.fullStream) {
    // print reasoning and text updates if present
    const out =
      /** @type {any} */ (part).textDelta ??
      /** @type {any} */ (part).delta ??
      /** @type {any} */ (part).text;
    if (typeof out === "string" && out.length > 0) {
      process.stdout.write(out);
    }
  }

  // omit usage for now
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
