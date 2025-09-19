import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateImage as generateImage } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("image generation (seedream v4 t2i) with Runpod AI SDK Provider\n");

async function main() {
  const prompt =
    process.argv.slice(2).join(" ") ||
    "American retro 1950s illustration style — an abandoned atomic-age town in ruins, cracked pavement and faded road signs, rusted 1950s cars half-buried in dust, tilted power lines, pastel-colored buildings crumbling under a hazy golden sky — soft film grain, worn paper texture, sunbeams breaking through dusty air — wisps of eerie green radiation mist drifting along the ground, faint green glow seeping from cracked windows and broken streetlamps, subtle radioactive haze hanging in the distance, wide desolate street receding into the horizon, eerie yet nostalgic atmosphere.";

  const { image } = await generateImage({
    model: runpod.imageModel("bytedance/seedream-4.0"),
    prompt,
    // This model supports large sizes; default to 2048x2048
    size: "2048x2048",
    providerOptions: {
      runpod: {
        negative_prompt: "",
        seed: -1,
        enable_safety_checker: true,
      },
    },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `generated-image-seedream-v4-${timestamp}.png`;
  writeFileSync(filename, image.uint8Array);
  console.log(`saved image: ${filename}`);
  console.log(`size: ${(image.uint8Array.length / 1024).toFixed(1)}kb`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
