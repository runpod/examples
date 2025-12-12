import "dotenv/config";
import { runpod } from "@runpod/ai-sdk-provider";
import { experimental_generateImage as generateImage } from "ai";
import { writeFileSync } from "fs";

const weather = {
  clearSkies: "Clear Skies",
  heavyFog: "Heavy Fog",
  rainyNight: "Rainy Night",
  heavySnowstorm: "Heavy Snowstorm",
  lightRain: "Light Rain",
  thunderstorm: "Thunderstorm",
  mistyMorning: "Misty Morning",
  sandstorm: "Sandstorm",
  auroraBorealis: "Aurora Borealis",
};

const time = {
  brightMidday: "Bright Midday",
  goldenHour: "Golden Hour",
  twilight: "Twilight",
  midnight: "Midnight",
  sunrise: "Sunrise",
  blueHour: "Blue Hour",
};

// Select your combination
const selectedWeather = weather.heavySnowstorm;
const selectedTime = time.twilight;

const { image } = await generateImage({
  model: runpod.imageModel("pruna/p-image-edit"),
  prompt: `Change the weather to ${selectedWeather} and the time of day to ${selectedTime}. Keep all other details exactly as they are.`,
  aspectRatio: "16:9",
  providerOptions: {
    runpod: {
      images: ["https://image.runpod.ai/demo/brandenburg-gate.png"],
    },
  },
});

// Generate filename from selections
const weatherKey = Object.keys(weather).find(
  (k) => weather[k] === selectedWeather
);
const timeKey = Object.keys(time).find((k) => time[k] === selectedTime);
const filename = `brandenburg-gate-${weatherKey}-${timeKey}.png`;

writeFileSync(filename, image.uint8Array);
console.log(`saved: ${filename}`);
