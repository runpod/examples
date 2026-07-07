import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_transcribe as transcribe } from "ai";

dotenv.config({ quiet: true });

/**
 * Transcribe audio from a URL using RunPod's Whisper model.
 *
 * This example demonstrates transcription using an audio URL.
 * The URL is passed via providerOptions.runpod.audio.
 */
async function main() {
  const audioUrl = "https://image.runpod.ai/demo/transcription-demo.wav";

  console.log("Transcribing audio from URL...");
  console.log("URL:", audioUrl);
  console.log("");

  const result = await transcribe({
    model: runpod.transcription("pruna/whisper-v3-large"),
    // Note: When passing a URL, use new URL() - strings are interpreted as base64
    audio: new URL(audioUrl),
    providerOptions: {
      runpod: {
        // Pass the audio URL directly to RunPod (avoids downloading and re-uploading)
        audio: audioUrl,
      },
    },
  });

  console.log("Transcription:");
  console.log(result.text);
  console.log("");
  console.log("Language:", result.language);
  console.log("Duration:", result.durationInSeconds, "seconds");
  console.log("Segments:", result.segments?.length || 0);
  console.log("");
  console.log("Provider metadata:", result.providerMetadata);
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
