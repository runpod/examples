import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { generateImage } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("image generation (pruna t2i) with Runpod AI SDK Provider\n");

async function main() {
  // Using standard AI SDK options (aspectRatio, seed) - no providerOptions needed
  const { image } = await generateImage({
    model: runpod.image("pruna/p-image-t2i"),
    prompt: "A majestic lion standing on a rocky cliff at sunset",
    aspectRatio: "16:9",
    seed: 42,
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `generated-image-pruna-${timestamp}.jpg`;

  writeFileSync(filename, image.uint8Array);
  console.log(`saved image: ${filename}`);
  console.log(`size: ${(image.uint8Array.length / 1024).toFixed(1)}KB`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});

