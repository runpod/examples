import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { generateImage } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("generate-image-alibaba-wan-2.6\n");

async function main() {
  const { image } = await generateImage({
    model: runpod.image("alibaba/wan-2.6"),
    prompt:
      'A spectacular complete Chinese dragon sculpture made of neon light tubes, full body visible from head to flowing tail, positioned behind a large street-level neon sign reading "WAN 2.6" in bright cyan and magenta, cyberpunk city background, wet streets reflecting all the neon colors, the dragon wraps gracefully but its entire form is visible, photorealistic, cinematic lighting. Negative prompt: incomplete, cropped, blurry',
    size: "1280x1280",
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `generated-image-alibaba-wan-2.6-${timestamp}.jpg`;

  writeFileSync(filename, image.uint8Array);
  console.log(`saved image: ${filename}`);
  console.log(`size: ${(image.uint8Array.length / 1024).toFixed(1)}KB`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
