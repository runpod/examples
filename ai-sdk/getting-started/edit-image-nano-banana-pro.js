import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateImage as generateImage } from "ai";
import { writeFileSync } from "fs";

dotenv.config({ quiet: true });

console.log("image edit (nano banana pro) with Runpod AI SDK Provider\n");

async function main() {
  const imageUrl =
    process.argv[2] ||
    "https://image.runpod.ai/assets/google/nano-banana-pro-edit-asset.jpg";

  const prompt =
    process.argv[3] ||
    "Add Christmas decorations to this cozy small town: twinkling Christmas lights along rooflines and windows, festive wreaths on front doors, Christmas trees visible through warm glowing windows, vintage street lamps wrapped in evergreen garlands with red bows, gazebo in the town square decorated with lights and ornaments, picket fences adorned with festive decorations, gentle snowfall, soft blanket of snow on rooftops and streets, warm holiday atmosphere with Christmas lights creating a magical glow, maintaining the cozy Christmas aesthetic.";

  // Using standard AI SDK options (prompt.images, aspectRatio)
  // resolution and output_format still need providerOptions
  const { image } = await generateImage({
    model: runpod.image("google/nano-banana-pro-edit"),
    prompt: {
      text: prompt,
      images: [imageUrl],
    },
    aspectRatio: "16:9",
    providerOptions: {
      runpod: {
        resolution: "1k",
        output_format: "jpeg",
      },
    },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `edited-image-nano-banana-pro-${timestamp}.jpg`;
  writeFileSync(filename, image.uint8Array);
  console.log(`saved image: ${filename}`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
