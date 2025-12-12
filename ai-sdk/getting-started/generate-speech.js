import dotenv from "dotenv";
import { writeFileSync } from "fs";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateSpeech as generateSpeech } from "ai";

dotenv.config({ quiet: true });

console.log("speech generation (Runpod AI SDK Provider)\n");

function usageAndExit() {
  console.log("usage:");
  console.log(
    "  node generate-speech.js [text] [voice] [voiceUrl]\n\n" +
      "examples:\n" +
      '  node generate-speech.js "Hello, this is Chatterbox Turbo running on Runpod"\n' +
      '  node generate-speech.js "Hello" lucy\n' +
      '  node generate-speech.js "Hello" lucy https://example.com/voice.wav\n'
  );
  process.exit(1);
}

async function main() {
  const [, , textArg, voiceArg, voiceUrlArg] = process.argv;

  // Stealth speech model id. The provider maps it to the current endpoint.
  const model = runpod.speech("resembleai/chatterbox-turbo");

  const text = textArg || "Hello, this is Chatterbox Turbo running on Runpod.";

  if (text === "--help" || text === "-h") {
    usageAndExit();
  }

  // Optional: choose a built-in voice name (default is provider-side).
  const voice = voiceArg || "lucy";

  // Optional: provide a URL to 5-10 seconds of voice audio to clone.
  const voiceUrl = voiceUrlArg;

  const { audio, providerMetadata, warnings } = await generateSpeech({
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
  const filename = `generated-speech-${timestamp}.${audio.format}`;

  writeFileSync(filename, audio.uint8Array);

  console.log(`saved audio: ${filename}`);
  console.log(`mediaType: ${audio.mediaType}`);
  console.log(`size: ${(audio.uint8Array.length / 1024).toFixed(1)}KB`);

  if (providerMetadata?.runpod) {
    console.log("\nproviderMetadata.runpod:");
    console.log(providerMetadata.runpod);
  }

  if (warnings?.length) {
    console.log("\nwarnings:");
    console.log(warnings);
  }
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
