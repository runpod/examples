import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { generateText } from "ai";
import { experimental_generateImage as generateImage } from "ai";

dotenv.config({ quiet: true });

console.log("Testing Runpod Error Handling\n");
console.log("This example demonstrates how errors are properly surfaced to users.\n");

async function testChatError() {
  console.log("1. Testing chat model error (invalid API key)...");
  try {
    // Use an invalid API key to trigger an authentication error
    const providerWithBadKey = runpod({
      apiKey: "invalid-key-for-testing",
    });
    const model = providerWithBadKey.chatModel("qwen/qwen3-32b-awq");
    
    await generateText({
      model,
      prompt: "Hello",
    });
  } catch (err) {
    console.log("   Error caught:");
    console.log(`   Message: ${err?.message || err}`);
    console.log(`   Type: ${err?.constructor?.name || typeof err}`);
    if (err?.cause) {
      console.log(`   Cause: ${err.cause}`);
    }
    console.log();
  }
}

async function testImageErrorInvalidSize() {
  console.log("2. Testing image model error (unsupported size)...");
  try {
    await generateImage({
      model: runpod.imageModel("black-forest-labs/flux-1-dev"),
      prompt: "A test image",
      size: "9999x9999", // Invalid size
    });
  } catch (err) {
    console.log("   Error caught:");
    console.log(`   Message: ${err?.message || err}`);
    console.log(`   Type: ${err?.constructor?.name || typeof err}`);
    console.log();
  }
}

async function testImageErrorInvalidModel() {
  console.log("3. Testing image model error (invalid model ID)...");
  try {
    await generateImage({
      model: runpod.imageModel("nonexistent/model-id"),
      prompt: "A test image",
    });
  } catch (err) {
    console.log("   Error caught:");
    console.log(`   Message: ${err?.message || err}`);
    console.log(`   Type: ${err?.constructor?.name || typeof err}`);
    console.log();
  }
}

async function testImageErrorInvalidApiKey() {
  console.log("4. Testing image model error (invalid API key)...");
  console.log("   (Skipping - requires environment variable manipulation)");
  console.log("   To test: Set RUNPOD_API_KEY=invalid-key and run the image generation example");
  console.log();
}

async function main() {
  await testChatError();
  await testImageErrorInvalidSize();
  await testImageErrorInvalidModel();
  await testImageErrorInvalidApiKey();
  
  console.log("Error handling test complete!");
  console.log("\nNote: The errors above should show actual error messages from Runpod API,");
  console.log("not generic messages like 'Unknown error' or 'Failed to download image'.");
}

main().catch((err) => {
  console.error("Unexpected error:", err?.message || err);
  process.exit(1);
});

