import dotenv from "dotenv";
import { writeFileSync } from "fs";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateSpeech as generateSpeech } from "ai";

dotenv.config({ quiet: true });

async function main() {
  const { audio, providerMetadata, warnings } = await generateSpeech({
    model: runpod.speech("resembleai/chatterbox-turbo"),
    voice: "abigail",
    text: `day zero support on Runpod: [sigh] "Chatterbox Turbo" by ResembleAI, a state-of-the-art text-to-speech model. [gasp] 
      It’s ridiculously fast... and voice cloning from just five seconds. 
      Try it for free until December twenty-second, twenty-twenty-five. [chuckle] [laugh]`,
  });

  writeFileSync("chatterbox-turbo.wav", audio.uint8Array);

  console.log("saved: chatterbox-turbo.wav");
  console.log("providerMetadata:", providerMetadata);
  console.log("warnings:", warnings);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
