import { defineAgent } from "eve";
import { createRunpod } from "@runpod/ai-sdk-provider";

// Brain = our self-deployed LLM on RunPod serverless (vLLM, OpenAI-compatible).
// The endpoint id comes from `runpodctl serverless create` (see .env.local).
const endpointId = process.env.RUNPOD_LLM_ENDPOINT_ID;
if (!endpointId) {
  throw new Error("RUNPOD_LLM_ENDPOINT_ID is not set (the self-deployed vLLM endpoint).");
}

// createRunpod with a custom baseURL points the provider at our endpoint's
// OpenAI-compatible route. It reads RUNPOD_API_KEY from the environment for auth.
const runpod = createRunpod({
  baseURL: `https://api.runpod.ai/v2/${endpointId}/openai/v1`,
});

// The model id must match the name vLLM serves on the endpoint (its MODEL_NAME).
const MODEL = process.env.RUNPOD_LLM_MODEL ?? "Qwen/Qwen3.6-27B-FP8";

export default defineAgent({
  model: runpod.chatModel(MODEL),
  // Custom (non-gateway) model: tell Eve the context window so it can compute
  // compaction thresholds. Matches MAX_MODEL_LEN on the vLLM endpoint.
  modelContextWindowTokens: 32768,
});
