import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateImage as generateImage } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("image generation (Runpod AI SDK Provider)\n");

async function main() {
  const { image } = await generateImage({
    model: runpod.imageModel("black-forest-labs/flux-1-dev"),
    prompt: "A cozy cabin in the woods at golden hour, cinematic lighting",
    aspectRatio: "4:3",
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `generated-image-${timestamp}.jpg`;

  writeFileSync(filename, image.uint8Array);
  console.log(`saved image: ${filename}`);
  console.log(`size: ${(image.uint8Array.length / 1024).toFixed(1)}KB`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
