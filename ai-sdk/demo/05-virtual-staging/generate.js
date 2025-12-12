import "dotenv/config";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateImage as generateImage } from "ai";
import { writeFileSync } from "fs";

const { image } = await generateImage({
  model: runpod.imageModel("pruna/p-image-t2i"),
  prompt: `A photorealistic empty room interior, white walls, hardwood floor,
large window on the left wall with natural daylight streaming in,
open doorway on the right wall leading to another bright room,
clean minimalist space, no furniture, architectural photography style`,
  aspectRatio: "16:9",
  seed: 42,
});

writeFileSync("empty-room.png", image.uint8Array);

