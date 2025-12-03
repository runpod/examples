import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { generateText, streamText, tool } from "ai";
import { z } from "zod";

dotenv.config({ quiet: true });

const MODEL_ID = "openai/gpt-oss-120b";

console.log(`Testing model: ${MODEL_ID}`);
console.log("Make sure RUNPOD_API_KEY is set in your .env file\n");

async function testGenerateText() {
  console.log("\n=== Testing generateText ===");
  const startTime = Date.now();
  try {
    const { text, usage, finishReason } = await generateText({
      model: runpod(MODEL_ID),
      prompt: "Write a haiku about artificial intelligence.",
      temperature: 0.7,
      maxTokens: 100,
    });

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    const outputTokens = usage?.outputTokens || 0;
    const inputTokens = usage?.inputTokens || 0;
    const tokensPerSecond =
      outputTokens > 0 ? (outputTokens / totalTime).toFixed(2) : "N/A";

    console.log("Success!");
    console.log("Text:", text);
    console.log("Finish reason:", finishReason);
    console.log("\nPerformance Metrics:");
    console.log(`  Total time: ${totalTime.toFixed(2)}s`);
    console.log(`  Input tokens: ${inputTokens}`);
    console.log(`  Output tokens: ${outputTokens}`);
    console.log(`  Tokens/second: ${tokensPerSecond}`);
  } catch (error) {
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    console.error("Failed:", error?.message || error);
    console.error(`  Failed after: ${totalTime.toFixed(2)}s`);
    if (error?.statusCode) {
      console.error("  Status code:", error.statusCode);
    }
  }
}

async function testStreamText() {
  console.log("\n=== Testing streamText ===");
  const startTime = Date.now();
  let firstTokenTime = null;
  try {
    const { textStream, usage } = await streamText({
      model: runpod(MODEL_ID),
      prompt: "Count from 1 to 5, then say done.",
      temperature: 0.3,
    });

    console.log("Streaming...");
    process.stdout.write("Text: ");
    for await (const chunk of textStream) {
      if (firstTokenTime === null) {
        firstTokenTime = Date.now();
      }
      process.stdout.write(chunk);
    }
    process.stdout.write("\n");

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    const ttft = firstTokenTime
      ? ((firstTokenTime - startTime) / 1000).toFixed(3)
      : "N/A";

    if (usage) {
      try {
        const usageResolved = await usage;
        if (usageResolved) {
          const outputTokens = usageResolved.outputTokens || 0;
          const tokensPerSecond =
            outputTokens > 0 ? (outputTokens / totalTime).toFixed(2) : "N/A";
          console.log("\nPerformance Metrics:");
          console.log(`  Time to first token (TTFT): ${ttft}s`);
          console.log(`  Total time: ${totalTime.toFixed(2)}s`);
          console.log(`  Output tokens: ${outputTokens}`);
          console.log(`  Tokens/second: ${tokensPerSecond}`);
        }
      } catch {}
    }
  } catch (error) {
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    console.error("Failed:", error?.message || error);
    console.error(`  Failed after: ${totalTime.toFixed(2)}s`);
  }
}

async function testToolCalling() {
  console.log("\n=== Testing Tool Calling ===");
  const startTime = Date.now();
  try {
    const getWeather = tool({
      description: "Get the current weather for a city",
      inputSchema: z.object({
        city: z.string().describe("The name of the city"),
      }),
      execute: async ({ city }) => {
        return `The weather in ${city} is sunny, 72F with clear skies.`;
      },
    });

    const { text, toolCalls } = await generateText({
      model: runpod(MODEL_ID),
      tools: { getWeather },
      prompt: "What is the weather like in San Francisco?",
    });

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;

    console.log("Success!");
    console.log("Text:", text);
    console.log(`Total time: ${totalTime.toFixed(2)}s`);
    if (toolCalls && toolCalls.length > 0) {
      console.log("Tool calls:", JSON.stringify(toolCalls, null, 2));
      console.log(`Tool was called ${toolCalls.length} time(s)`);
    } else {
      console.log("No tool calls made");
    }
  } catch (error) {
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    console.error("Failed:", error?.message || error);
    console.error(`  Failed after: ${totalTime.toFixed(2)}s`);
  }
}

async function main() {
  await testGenerateText();
  await testStreamText();
  await testToolCalling();
  console.log("\n=== All tests completed ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
