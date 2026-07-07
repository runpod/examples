import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateVideo as generateVideo } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("generate-video-openai-sora-2-i2v\n");

async function main() {
  const imageUrl =
    process.argv[2] ||
    "https://image.runpod.ai/demo/mountain-lake-reflection-1280x720.png";

  const { video } = await generateVideo({
    model: runpod.video("openai/sora-2-i2v"),
    prompt: {
      text: "Animate the mountain lake with gentle ripples breaking the mirror-like reflection, clouds drifting slowly over snow-capped peaks, wildflowers swaying in the breeze",
      image: imageUrl,
    },
    aspectRatio: "16:9",
    duration: 4,
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `generated-video-openai-sora-2-i2v-${timestamp}.mp4`;

  writeFileSync(filename, video.uint8Array);
  console.log(`saved video: ${filename}`);
  console.log(`size: ${(video.uint8Array.length / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
