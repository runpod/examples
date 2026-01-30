import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { generateImage } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("generate-image-z-image-turbo\n");

async function main() {
  const { image } = await generateImage({
    model: runpod.image("tongyi-mai/z-image-turbo"),
    prompt:
      "A minimalist poster with a futuristic camera on a clean white background. Include the text 'Tongyi-MAI Z-Image Turbo' in bold modern typography below the camera, crisp studio lighting, product hero shot.",
    size: "1280x720",
    seed: 42,
    providerOptions: {
      runpod: {
        strength: 0.8,
        output_format: "png",
        enable_safety_checker: true,
      },
    },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `generated-image-z-image-turbo-${timestamp}.png`;

  writeFileSync(filename, image.uint8Array);
  console.log(`saved image: ${filename}`);
  console.log(`size: ${(image.uint8Array.length / 1024).toFixed(1)}KB`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
