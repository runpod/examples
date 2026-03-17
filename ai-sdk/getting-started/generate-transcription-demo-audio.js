import dotenv from "dotenv";
import { writeFileSync } from "fs";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateSpeech as generateSpeech } from "ai";

dotenv.config({ quiet: true });

// This is the text we'll generate and then transcribe back
const DEMO_TEXT = `Welcome to Runpod. This is a demonstration of the Whisper transcription model.
Whisper can accurately transcribe speech in over 90 languages.
Let's see how well it works with this audio sample.`;

async function main() {
  console.log("Generating demo audio for transcription testing...");
  console.log("Text:", DEMO_TEXT);

  const { audio, providerMetadata, warnings } = await generateSpeech({
    model: runpod.speech("resembleai/chatterbox-turbo"),
    voice: "abigail",
    text: DEMO_TEXT,
  });

  const filename = "transcription-demo.wav";
  writeFileSync(filename, audio.uint8Array);

  console.log("\nSaved:", filename);
  console.log("File size:", audio.uint8Array.length, "bytes");
  console.log("providerMetadata:", providerMetadata);
  console.log("warnings:", warnings);
  console.log("\nNext steps:");
  console.log("1. Upload to R2: cd /Users/timpietrusky/data/dev/runpod/r2 && bun run cli.ts u ../examples/ai-sdk/getting-started/transcription-demo.wav demo/transcription-demo.wav");
  console.log("2. Get public URL: bun run cli.ts url demo/transcription-demo.wav");
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
