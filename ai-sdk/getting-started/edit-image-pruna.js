import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateImage as generateImage } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("image edit (pruna p-image-edit) with Runpod AI SDK Provider\n");

async function main() {
  const imageUrl =
    process.argv[2] || "https://image.runpod.ai/preview/pruna/p-image-t2i.png";

  const { image } = await generateImage({
    model: runpod.imageModel("pruna/p-image-edit"),
    prompt: "the lion is dressed up as santa claus, watercolor painting style",
    providerOptions: {
      runpod: {
        images: [imageUrl],
        aspect_ratio: "match_input_image",
        seed: -1,
        disable_safety_checker: false,
        enable_sync_mode: false,
      },
    },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `edited-image-pruna-${timestamp}.png`;
  writeFileSync(filename, image.uint8Array);
  console.log(`saved image: ${filename}`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
