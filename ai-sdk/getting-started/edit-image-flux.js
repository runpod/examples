import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateImage as generateImage } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("image edit (flux kontext) with Runpod AI SDK Provider\n");

async function main() {
  const imageUrl =
    process.argv[2] || "https://image.runpod.ai/asset/qwen/qwen-image-edit.png";

  const { image } = await generateImage({
    model: runpod.imageModel("black-forest-labs/flux-1-kontext-dev"),
    prompt: "change the trench coat color to blue and high heels color to red",
    aspectRatio: "1:1",
    providerOptions: {
      runpod: {
        image: imageUrl,
        output_format: "png",
        enable_safety_checker: true,
      },
    },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `edited-image-flux-${timestamp}.png`;
  writeFileSync(filename, image.uint8Array);
  console.log(`saved image: ${filename}`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
