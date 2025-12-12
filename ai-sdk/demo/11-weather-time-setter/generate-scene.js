import "dotenv/config";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateImage as generateImage } from "ai";
import { writeFileSync } from "fs";

const { image } = await generateImage({
  model: runpod.imageModel("pruna/p-image-t2i"),
  prompt: `Brandenburg Gate in Berlin, Germany, frontal view from Pariser Platz,
the iconic neoclassical monument with its columns and quadriga on top,
wide plaza in the foreground with space for people,
clear sunny day, blue sky, photorealistic photography`,
  aspectRatio: "16:9",
});

writeFileSync("scene.png", image.uint8Array);
