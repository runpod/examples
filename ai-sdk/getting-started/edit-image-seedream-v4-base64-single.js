import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { generateImage } from "ai";
import { writeFileSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ quiet: true });

console.log(
  "image edit (seedream v4 base64 single) with Runpod AI SDK Provider\n"
);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

function guessMimeFromPath(p) {
  const ext = path.extname(p).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

function fileToDataUrl(filePath) {
  const mime = guessMimeFromPath(filePath);
  const file = readFileSync(filePath);
  const base64 = file.toString("base64");
  return `data:${mime};base64,${base64}`;
}

async function main() {
  const prompt =
    process.argv[2] ||
    "change the logo colors to a neon gradient and add a subtle glow";

  const inputPath = process.argv[3] || "runpod.png";
  const absPath = path.isAbsolute(inputPath)
    ? inputPath
    : path.join(scriptDir, inputPath);
  const imageDataUrl = fileToDataUrl(absPath);

  console.log(imageDataUrl.slice(0, 30));

  const { image } = await generateImage({
    model: runpod.image("bytedance/seedream-4.0-edit"),
    prompt: {
      text: prompt,
      images: [imageDataUrl],
    },
    size: "1024x1024",
    providerOptions: {
      runpod: {
        enable_safety_checker: true,
      },
    },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `edited-image-seedream-v4-base64-single-${timestamp}.png`;
  writeFileSync(filename, image.uint8Array);
  console.log(`saved image: ${filename}`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
