import "dotenv/config";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateImage as generateImage } from "ai";
import { writeFileSync } from "fs";

const { image } = await generateImage({
  model: runpod.imageModel("pruna/p-image-edit"),
  prompt: `Add a decorated christmas tree, warm lights and a lot of christmas gifts.
Armchair on the right side of the room facing the window.
Armchair on the left side with a red blanket on it.
Christmas carpet between the armchairs.
The walls are decorated with christmas stickers.
Bed visible in the background.
Very snowy weather outside.`,
  aspectRatio: "16:9",
  providerOptions: {
    runpod: {
      images: ["https://image.runpod.ai/demo/empty-room.png"],
    },
  },
});

writeFileSync("staged-room.png", image.uint8Array);

