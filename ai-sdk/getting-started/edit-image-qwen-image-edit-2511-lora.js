import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { generateImage } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("edit-image-qwen-image-edit-2511-lora\n");

async function main() {
  const imageUrl =
    process.argv[2] ||
    "https://image.runpod.ai/asset/qwen/qwen-image-edit-2511.png";

  const { image } = await generateImage({
    model: runpod.image("qwen/qwen-image-edit-2511"),
    prompt: {
      text: "A futuristic city with a slightly dark neon atmosphere and glowing street lights. The girl in the foreground, her face and body well lit by the street lighting",
      images: [imageUrl],
    },
    size: "1024x1024",
    providerOptions: {
      runpod: {
        loras: [
          {
            path: "https://huggingface.co/flymy-ai/qwen-image-anime-irl-lora/resolve/main/flymy_anime_irl.safetensors",
            scale: 1,
          },
        ],
      },
    },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `edited-image-qwen-image-edit-2511-lora-${timestamp}.jpg`;
  writeFileSync(filename, image.uint8Array);
  console.log(`saved image: ${filename}`);
  console.log(`size: ${(image.uint8Array.length / 1024).toFixed(1)}KB`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});

