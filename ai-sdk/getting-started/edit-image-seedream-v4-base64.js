import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateImage as generateImage } from "ai";
import { writeFileSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ quiet: true });

console.log("image edit (seedream v4 base64) with Runpod AI SDK Provider\n");

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

function guessMimeFromPath(p) {
  const ext = path.extname(p).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

async function urlToDataUrl(url) {
  const res = await fetch(url);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return `data:${contentType};base64,${base64}`;
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
    "dress the model in the clothes and hat. turn the model into a character figure. behind it, place a box with the character's image printed on it, and a computer showing the blender modeling process on its screen. in front of the box, add a round plastic base with the character figure standing on it. set the scene indoors if possible.";

  const pathsArg = process.argv[3];
  let images;

  if (pathsArg) {
    // Local file paths (relative to this script) or absolute paths, comma-separated
    const paths = pathsArg
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    images = paths.map((p) => {
      const absPath = path.isAbsolute(p) ? p : path.join(scriptDir, p);
      return fileToDataUrl(absPath);
    });
  } else {
    // Fallback: download defaults and convert to base64 data URLs
    const urls = [
      "https://image.runpod.ai/uploads/WiTaxr1AYF/2c15cbc9-9b03-4d59-bd60-ff3fa024b145.jpg",
      "https://image.runpod.ai/uploads/z6CJphVJ3K/5917c2ca-cfca-45b8-be37-9b47f0269d85.jpg",
      "https://image.runpod.ai/uploads/RIlkUROadB/9023cbea-5943-44b4-9f23-1f3f14407f34.jpg",
      "https://image.runpod.ai/uploads/EhfbtkEZO5/59291e4b-4949-4c79-bd4a-7e2a3426dbe8.jpg",
    ];
    images = await Promise.all(urls.map((u) => urlToDataUrl(u)));
  }

  const { image } = await generateImage({
    model: runpod.image("bytedance/seedream-4.0-edit"),
    prompt: {
      text: prompt,
      images,
    },
    size: "1024x1024",
    providerOptions: {
      runpod: {
        enable_safety_checker: true,
      },
    },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `edited-image-seedream-v4-base64-${timestamp}.png`;
  writeFileSync(filename, image.uint8Array);
  console.log(`saved image: ${filename}`);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
