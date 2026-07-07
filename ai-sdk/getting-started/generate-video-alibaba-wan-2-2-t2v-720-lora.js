import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateVideo as generateVideo } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("generate-video-alibaba-wan-2-2-t2v-720-lora\n");

async function main() {
  const imageUrl =
    process.argv[2] ||
    "https://image.runpod.ai/demo/japanese-garden-koi-pond-1280x720.png";

  const { video } = await generateVideo({
    model: runpod.video("alibaba/wan-2.2-t2v-720-lora"),
    prompt: {
      text: "Animate the koi pond with fish swimming, cherry blossoms falling gently, and soft ripples on the water surface",
      image: imageUrl,
    },
    aspectRatio: "16:9",
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `generated-video-alibaba-wan-2-2-t2v-720-lora-${timestamp}.mp4`;

  writeFileSync(filename, video.uint8Array);
  console.log(`saved video: ${filename}`);
  console.log(`size: ${(video.uint8Array.length / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
