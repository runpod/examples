import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateVideo as generateVideo } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("generate-video-kwaivgi-kling-v2-6-std-motion-control\n");

async function main() {
  const imageUrl =
    process.argv[2] ||
    "https://image.runpod.ai/demo/person-standing-garden-1280x720.png";

  const videoUrl =
    process.argv[3] ||
    "https://image.runpod.ai/demo/person-motion-reference.mp4";

  const { video } = await generateVideo({
    model: runpod.video("kwaivgi/kling-v2.6-std-motion-control"),
    prompt: {
      text: "Animate the person with natural swaying motion, hair blowing gently in the wind, subtle body movement",
      image: imageUrl,
    },
    aspectRatio: "16:9",
    providerOptions: {
      runpod: {
        video: videoUrl,
      },
    },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `generated-video-kwaivgi-kling-v2-6-std-motion-control-${timestamp}.mp4`;

  writeFileSync(filename, video.uint8Array);
  console.log(`saved video: ${filename}`);
  console.log(`size: ${(video.uint8Array.length / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
