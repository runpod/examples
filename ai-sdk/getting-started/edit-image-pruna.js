import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { generateImage } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("image edit (pruna p-image-edit) with Runpod AI SDK Provider\n");

async function main() {
  const imageUrl =
    process.argv[2] || "https://image.runpod.ai/preview/pruna/p-image-t2i.png";

  // Using standard AI SDK options (prompt.images, aspectRatio, seed)
  const { image } = await generateImage({
    model: runpod.image("pruna/p-image-edit"),
    prompt: {
      text: "Transform the subject into a watercolor painting style",
      images: [imageUrl],
    },
    aspectRatio: "1:1",
    seed: 42,
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
