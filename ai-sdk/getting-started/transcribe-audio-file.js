import dotenv from "dotenv";
import { readFileSync } from "fs";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_transcribe as transcribe } from "ai";

dotenv.config({ quiet: true });

/**
 * Transcribe audio from a local file using RunPod's Whisper model.
 *
 * This example demonstrates transcription using a local audio file.
 * The file is read as a Uint8Array and sent to the API as base64.
 */
async function main() {
  const filePath = "transcription-demo.wav";

  console.log("Reading audio file...");
  console.log("File:", filePath);

  // Read the file as a Uint8Array
  const audioBuffer = readFileSync(filePath);
  const audioData = new Uint8Array(audioBuffer);

  console.log("File size:", audioData.length, "bytes");
  console.log("");
  console.log("Transcribing...");
  console.log("");

  const result = await transcribe({
    model: runpod.transcription("pruna/whisper-v3-large"),
    audio: audioData,
    providerOptions: {
      runpod: {
        // Optional: specify language for better accuracy
        // language: "en",
      },
    },
  });

  console.log("Transcription:");
  console.log(result.text);
  console.log("");
  console.log("Language:", result.language);
  console.log("Duration:", result.durationInSeconds, "seconds");
  console.log("Segments:", result.segments?.length || 0);

  if (result.segments && result.segments.length > 0) {
    console.log("");
    console.log("Segment details:");
    result.segments.forEach((seg, i) => {
      console.log(`  [${seg.startSecond.toFixed(2)}s - ${seg.endSecond.toFixed(2)}s] ${seg.text}`);
    });
  }
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
