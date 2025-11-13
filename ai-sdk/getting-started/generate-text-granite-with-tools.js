import dotenv from "dotenv";
import { runpod } from "@runpod/ai-sdk-provider";
import { generateText, tool } from "ai";
import { z } from "zod";

dotenv.config({ quiet: true });

console.log("text generation with tools (IBM Granite model)\n");

// Define a weather tool for demonstration
const getWeather = tool({
  description: "Get the current weather for a location",
  inputSchema: z.object({
    location: z.string().describe("The city name"),
    unit: z
      .enum(["celsius", "fahrenheit"])
      .optional()
      .describe("Temperature unit"),
  }),
  execute: async ({ location, unit = "celsius" }) => {
    // Simulated weather data
    return `Current weather in ${location}: 22°${
      unit === "fahrenheit" ? "F" : "C"
    }, partly cloudy`;
  },
});

async function main() {
  const model = runpod("ibm-granite/granite-4.0-h-small");

  const { text, toolCalls, usage } = await generateText({
    model,
    tools: { getWeather },
    toolChoice: "auto",
    prompt:
      "What is the weather like in San Francisco and New York? Use the weather tool to get current conditions.",
    temperature: 0.7,
  });

  console.log("generated text:\n");
  console.log(text);

  if (toolCalls.length > 0) {
    console.log("\ntool calls executed:");
    console.log(toolCalls);
  }

  if (usage) {
    console.log("\nusage:");
    console.log(usage);
  }
}

main().catch((err) => {
  console.error("failed:", err?.message || err);
  process.exit(1);
});
