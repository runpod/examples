import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateVideo as generateVideo } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("generate-video-kwaivgi-kling-video-o1-r2v\n");

async function main() {
  const imageUrl =
    process.argv[2] ||
    "https://image.runpod.ai/demo/hot-air-balloons-sunrise-1280x720.png";

  const { video } = await generateVideo({
    model: runpod.video("kwaivgi/kling-video-o1-r2v"),
    prompt: {
      text: "Animate the hot air balloons rising slowly through the misty valley, morning fog drifting across the landscape",
      image: imageUrl,
    },
    aspectRatio: "16:9",
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `generated-video-kwaivgi-kling-video-o1-r2v-${timestamp}.mp4`;

  writeFileSync(filename, video.uint8Array);
  console.log(`saved video: ${filename}`);
  console.log(`size: ${(video.uint8Array.length / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
