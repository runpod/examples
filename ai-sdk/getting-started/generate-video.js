import dotenv from "dotenv";
import { runpod } from "../../../ai-sdk-provider/dist/index.mjs";
import { experimental_generateVideo as generateVideo } from "../../../thirdparty/ai/packages/ai/dist/index.mjs";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("video generation (Runpod AI SDK Provider)\n");

async function main() {
  const { video } = await generateVideo({
    model: runpod.videoModel("alibaba/wan-2-2-t2v-720"),
    prompt:
      "A serene sunrise timelapse over snowy mountains, cinematic, high detail",
    resolution: "1280x720",
    durationSeconds: 5,
    fps: 24,
    providerOptions: {
      runpod: {
        // optional provider-specific params; adjust as needed
      },
    },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `generated-video-${timestamp}.mp4`;

  writeFileSync(filename, video.uint8Array);
  console.log(`saved video: ${filename}`);
  console.log(`size: ${(video.uint8Array.length / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
