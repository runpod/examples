import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { generateImage } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("generate-image-alibaba-wan-2-6\n");

async function main() {
  const { image } = await generateImage({
    model: runpod.image("alibaba/wan-2.6"),
    prompt:
      "A majestic Chinese dragon made of flowing neon light tubes, coiling through a cyberpunk city at night, reflections on wet streets, vibrant pink and cyan colors, ultra detailed, cinematic composition. Negative prompt: blurry, watermark, text, low resolution",
    size: "1280x1280",
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `generated-image-alibaba-wan-2-6-${timestamp}.jpg`;

  writeFileSync(filename, image.uint8Array);
  console.log(`saved image: ${filename}`);
  console.log(`size: ${(image.uint8Array.length / 1024).toFixed(1)}KB`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
