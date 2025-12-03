import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateImage as generateImage } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("TEST: Pruna t2i with STANDARD AI SDK options (no providerOptions)\n");

async function testStandardOptions() {
  // Test 1: Just prompt (no options)
  console.log("Test 1: Just prompt, no options...");
  try {
    const { image } = await generateImage({
      model: runpod.imageModel("pruna/p-image-t2i"),
      prompt: "A cute robot sitting on a bench in a park",
    });
    writeFileSync("test-pruna-t2i-1-just-prompt.jpg", image.uint8Array);
    console.log("  SUCCESS: saved test-pruna-t2i-1-just-prompt.jpg");
  } catch (err) {
    console.log("  FAILED:", err?.message || err);
  }

  // Test 2: prompt + aspectRatio
  console.log("\nTest 2: prompt + aspectRatio (16:9)...");
  try {
    const { image } = await generateImage({
      model: runpod.imageModel("pruna/p-image-t2i"),
      prompt: "A cute robot sitting on a bench in a park",
      aspectRatio: "16:9",
    });
    writeFileSync("test-pruna-t2i-2-aspect-ratio.jpg", image.uint8Array);
    console.log("  SUCCESS: saved test-pruna-t2i-2-aspect-ratio.jpg");
  } catch (err) {
    console.log("  FAILED:", err?.message || err);
  }

  // Test 3: prompt + aspectRatio + seed
  console.log("\nTest 3: prompt + aspectRatio (4:3) + seed...");
  try {
    const { image } = await generateImage({
      model: runpod.imageModel("pruna/p-image-t2i"),
      prompt: "A cute robot sitting on a bench in a park",
      aspectRatio: "4:3",
      seed: 42,
    });
    writeFileSync("test-pruna-t2i-3-aspect-seed.jpg", image.uint8Array);
    console.log("  SUCCESS: saved test-pruna-t2i-3-aspect-seed.jpg");
  } catch (err) {
    console.log("  FAILED:", err?.message || err);
  }

  // Test 4: prompt + seed only
  console.log("\nTest 4: prompt + seed only...");
  try {
    const { image } = await generateImage({
      model: runpod.imageModel("pruna/p-image-t2i"),
      prompt: "A cute robot sitting on a bench in a park",
      seed: 123,
    });
    writeFileSync("test-pruna-t2i-4-seed-only.jpg", image.uint8Array);
    console.log("  SUCCESS: saved test-pruna-t2i-4-seed-only.jpg");
  } catch (err) {
    console.log("  FAILED:", err?.message || err);
  }

  // Test 5: All standard aspect ratios
  const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"];
  console.log("\nTest 5: Testing all standard aspect ratios...");
  for (const ar of aspectRatios) {
    try {
      const { image } = await generateImage({
        model: runpod.imageModel("pruna/p-image-t2i"),
        prompt: "A robot",
        aspectRatio: ar,
      });
      console.log(`  ${ar}: SUCCESS`);
    } catch (err) {
      console.log(`  ${ar}: FAILED - ${err?.message || err}`);
    }
  }
}

testStandardOptions().catch((err) => {
  console.error("Test suite failed:", err?.message || err);
  process.exit(1);
});

