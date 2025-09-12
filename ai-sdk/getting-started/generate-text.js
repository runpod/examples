import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { generateText } from "ai";

dotenv.config({ quiet: true });

console.log("simple text generation (Runpod AI SDK Provider)\n");

async function main() {
  // Choose one of the supported chat models; see provider README for list
  const model = runpod("deep-cogito/deep-cogito-v2-llama-70b");

  const { text, usage } = await generateText({
    model,
    prompt: "Write a short haiku about TypeScript and strong types.",
    temperature: 0.7,
  });

  console.log("generated text:\n");
  console.log(text);

  if (usage) {
    console.log("\nusage:");
    console.log(usage);
  }
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
