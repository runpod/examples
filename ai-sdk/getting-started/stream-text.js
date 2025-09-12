import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { streamText } from "ai";

dotenv.config({ quiet: true });

console.log("streaming text (Runpod AI SDK Provider)\n");

async function main() {
  // Note: Streaming availability depends on the underlying model/endpoint.
  const { textStream, usage } = await streamText({
    model: runpod("qwen/qwen3-32b-awq"),
    prompt: "List 5 lesser-known JavaScript tips in bullet points.",
    temperature: 0.3,
  });

  for await (const chunk of textStream) {
    process.stdout.write(chunk);
  }

  process.stdout.write("\n\n");
  if (usage) {
    try {
      const usageResolved = await usage;
      if (usageResolved) {
        console.log("usage:");
        console.log(usageResolved);
      }
    } catch {}
  }
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
