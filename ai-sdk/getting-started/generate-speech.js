import dotenv from "dotenv";
import { writeFileSync } from "fs";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateSpeech as generateSpeech } from "ai";

dotenv.config({ quiet: true });

console.log("speech generation (Runpod AI SDK Provider)\n");

async function main() {
  // Stealth speech model id. The provider maps it to the current endpoint.
  const model = runpod.speechModel("resembleai/chatterbox-turbo");

  const text =
    process.env.RUNPOD_SPEECH_TEXT ||
    "Hello, this is Chatterbox Turbo running on Runpod.";

  // Optional: choose a built-in voice name (default is provider-side).
  const voice = process.env.RUNPOD_SPEECH_VOICE || "lucy";

  // Optional: provide a URL to 5-10 seconds of voice audio to clone.
  const voiceUrl = process.env.RUNPOD_SPEECH_VOICE_URL;

  const result = await generateSpeech({
    model,
    text,
    outputFormat: "wav",
    ...(voiceUrl
      ? {
          providerOptions: {
            runpod: { voice_url: voiceUrl },
          },
        }
      : { voice }),
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `generated-speech-${timestamp}.${result.audio.format}`;

  writeFileSync(filename, result.audio.uint8Array);

  console.log(`saved audio: ${filename}`);
  console.log(`mediaType: ${result.audio.mediaType}`);
  console.log(`size: ${(result.audio.uint8Array.length / 1024).toFixed(1)}KB`);

  if (result.warnings?.length) {
    console.log("\nwarnings:");
    console.log(result.warnings);
  }
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
