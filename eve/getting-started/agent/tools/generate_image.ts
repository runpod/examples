import { defineTool } from "eve/tools";
import { runpod } from "@runpod/ai-sdk-provider";
import { generateImage } from "ai";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { z } from "zod";

// RunPod image model id. Override with RUNPOD_IMAGE_MODEL, e.g.
// "black-forest-labs/flux-1-schnell" (fast) or "bytedance/seedream-4.0".
const MODEL = process.env.RUNPOD_IMAGE_MODEL ?? "qwen/qwen-image";
// Write into the web app's public/ dir so the browser can load the image over
// HTTP at /generated/<file>. Next.js serves files under public/ statically.
const OUTPUT_DIR = resolve(process.cwd(), "public", "generated");

export default defineTool({
  description:
    "Generate an image from a text prompt using RunPod (via the official AI SDK provider). " +
    "Returns `url` (a web path like /generated/<id>.jpeg) and `localPath`. " +
    "To show the image to the user, embed `url` in your reply as markdown: ![caption](url).",
  inputSchema: z.object({
    prompt: z.string().min(1).describe("What the image should depict."),
    aspectRatio: z
      .enum(["1:1", "4:3", "3:4", "16:9", "9:16"])
      .default("1:1")
      .describe("Image aspect ratio."),
    negative_prompt: z.string().optional().describe("What to avoid in the image."),
    seed: z.number().int().optional().describe("Seed for reproducible output."),
  }),
  outputSchema: z.object({
    url: z.string(),
    localPath: z.string(),
    mediaType: z.string(),
    model: z.string(),
  }),
  async execute({ prompt, aspectRatio, negative_prompt, seed }) {
    if (!process.env.RUNPOD_API_KEY) {
      throw new Error("RUNPOD_API_KEY is not set in the environment.");
    }

    const { image, warnings } = await generateImage({
      model: runpod.imageModel(MODEL),
      prompt,
      aspectRatio,
      ...(seed !== undefined ? { seed } : {}),
      ...(negative_prompt
        ? { providerOptions: { runpod: { negative_prompt } } }
        : {}),
    });

    if (warnings?.length) {
      console.warn(`[generate_image] provider warnings:`, warnings);
    }

    const ext = image.mediaType === "image/png" ? "png" : "jpeg";
    await mkdir(OUTPUT_DIR, { recursive: true });
    const fileName = `${randomUUID()}.${ext}`;
    const localPath = resolve(OUTPUT_DIR, fileName);
    await writeFile(localPath, image.uint8Array);

    // Web-loadable path served by Next.js from public/.
    const url = `/generated/${fileName}`;
    return { url, localPath, mediaType: image.mediaType, model: MODEL };
  },
});
