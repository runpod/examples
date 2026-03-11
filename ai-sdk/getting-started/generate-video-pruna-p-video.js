import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateVideo as generateVideo } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("generate-video-pruna-p-video\n");

async function main() {
  const { video } = await generateVideo({
    model: runpod.video("pruna/p-video"),
    prompt:
      "A golden retriever running through a sunlit meadow with wildflowers, slow motion, cinematic",
    aspectRatio: "16:9",
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `generated-video-pruna-p-video-${timestamp}.mp4`;

  writeFileSync(filename, video.uint8Array);
  console.log(`saved video: ${filename}`);
  console.log(`size: ${(video.uint8Array.length / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
