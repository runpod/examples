import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateImage as generateImage } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("TEST: Pruna edit with MINIMAL providerOptions (just images)\n");

const TEST_IMAGE_1 = "https://image.runpod.ai/preview/pruna/p-image-t2i.png";
const TEST_IMAGE_2 = "https://image.runpod.ai/assets/google/nano-banana-pro-edit-asset.jpg";

async function testEditOptions() {
  // Test 1: Just prompt + 1 image (minimal)
  console.log("Test 1: prompt + 1 image (minimal providerOptions)...");
  try {
    const { image } = await generateImage({
      model: runpod.imageModel("pruna/p-image-edit"),
      prompt: "Transform into watercolor style",
      providerOptions: {
        runpod: {
          images: [TEST_IMAGE_1],
        },
      },
    });
    writeFileSync("test-pruna-edit-1-minimal.jpg", image.uint8Array);
    console.log("  SUCCESS: saved test-pruna-edit-1-minimal.jpg");
  } catch (err) {
    console.log("  FAILED:", err?.message || err);
  }

  // Test 2: prompt + aspectRatio (standard) + 1 image
  console.log("\nTest 2: prompt + aspectRatio (16:9) + 1 image...");
  try {
    const { image } = await generateImage({
      model: runpod.imageModel("pruna/p-image-edit"),
      prompt: "Transform into oil painting style",
      aspectRatio: "16:9",
      providerOptions: {
        runpod: {
          images: [TEST_IMAGE_1],
        },
      },
    });
    writeFileSync("test-pruna-edit-2-aspect-ratio.jpg", image.uint8Array);
    console.log("  SUCCESS: saved test-pruna-edit-2-aspect-ratio.jpg");
  } catch (err) {
    console.log("  FAILED:", err?.message || err);
  }

  // Test 3: prompt + 2 images
  console.log("\nTest 3: prompt + 2 images...");
  try {
    const { image } = await generateImage({
      model: runpod.imageModel("pruna/p-image-edit"),
      prompt: "Blend these images into a surreal scene",
      providerOptions: {
        runpod: {
          images: [TEST_IMAGE_1, TEST_IMAGE_2],
        },
      },
    });
    writeFileSync("test-pruna-edit-3-two-images.jpg", image.uint8Array);
    console.log("  SUCCESS: saved test-pruna-edit-3-two-images.jpg");
  } catch (err) {
    console.log("  FAILED:", err?.message || err);
  }

  // Test 4: prompt + aspectRatio + seed + 1 image
  console.log("\nTest 4: prompt + aspectRatio (1:1) + seed + 1 image...");
  try {
    const { image } = await generateImage({
      model: runpod.imageModel("pruna/p-image-edit"),
      prompt: "Add cyberpunk neon lights",
      aspectRatio: "1:1",
      seed: 42,
      providerOptions: {
        runpod: {
          images: [TEST_IMAGE_1],
        },
      },
    });
    writeFileSync("test-pruna-edit-4-aspect-seed.jpg", image.uint8Array);
    console.log("  SUCCESS: saved test-pruna-edit-4-aspect-seed.jpg");
  } catch (err) {
    console.log("  FAILED:", err?.message || err);
  }

  // Test 5: All aspect ratios for edit
  const aspectRatios = ["match_input_image", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"];
  console.log("\nTest 5: Testing all edit aspect ratios...");
  for (const ar of aspectRatios) {
    try {
      const { image } = await generateImage({
        model: runpod.imageModel("pruna/p-image-edit"),
        prompt: "Make it blue",
        aspectRatio: ar,
        providerOptions: {
          runpod: {
            images: [TEST_IMAGE_1],
          },
        },
      });
      console.log(`  ${ar}: SUCCESS`);
    } catch (err) {
      console.log(`  ${ar}: FAILED - ${err?.message || err}`);
    }
  }
}

testEditOptions().catch((err) => {
  console.error("Test suite failed:", err?.message || err);
  process.exit(1);
});

