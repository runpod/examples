import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { generateImage } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("edit-image-qwen-image-edit-2511\n");

async function main() {
  const { image } = await generateImage({
    model: runpod.image("qwen/qwen-image-edit-2511"),
    prompt:
      "A futuristic city with a slightly dark neon atmosphere and glowing street lights. The girl in the foreground, her face and body well lit by the street lighting",
    size: "1024x1024",
    providerOptions: {
      runpod: {
        images: ["https://image.runpod.ai/asset/qwen/qwen-image-edit-2511.png"],
      },
    },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `edited-image-qwen-2511-${timestamp}.jpg`;

  writeFileSync(filename, image.uint8Array);
  console.log(`saved image: ${filename}`);
  console.log(`size: ${(image.uint8Array.length / 1024).toFixed(1)}KB`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
