# Getting Started – Runpod AI SDK Provider (Node)

These are minimal Node.js scripts using `@runpod/ai-sdk-provider` and the Vercel AI SDK. Each file can be executed directly to see results in your terminal.

---

## Requirements

- Node.js 18+ (or 20+ recommended)
- A Runpod account and API key
- A Runpod API key: `https://console.runpod.io/user/settings` → API Keys

## Setup

1. Copy env file and add your key:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm i
# or: pnpm i / yarn / bun
```

3. Run any example script (see below).

> Note: Runpod public endpoints are OpenAI-compatible. Streaming availability depends on the underlying model/endpoint.

---

## Examples

### 1) Text Generation

Runs `generate-text.js` with `deep-cogito/deep-cogito-v2-llama-70b`.

```bash
node generate-text.js
```

### 2) Streaming Text

Runs `stream-text.js` with `qwen/qwen3-32b-awq`.

```bash
node stream-text.js
```

### 3) Function Calling (Tools)

Runs `tools-basic.js` using a calculator tool.

```bash
node tools-basic.js
```

### 4) Image Generation

Runs `generate-image.js` using a Flux model and saves a JPG.

```bash
node generate-image.js
```

Output file name includes a timestamp, e.g. `generated-image-YYYY-MM-DDTHH-MM-SS-SSSZ.jpg`.

---

## Models and Endpoints

This project uses IDs supported by the provider and maps them to Runpod OpenAI-compatible endpoints. See `@runpod/ai-sdk-provider` `README.md` for the up-to-date list and details about `baseURL` overrides for custom endpoints.

---

## Notes

- Ensure `.env` contains `RUNPOD_API_KEY`.
- All scripts are ESM (`type: module`).
- Adjust prompts, temperatures, and model IDs as needed.
- Structured outputs via `generateObject`/`experimental_output` are not supported by the models in this provider. You can still get structured data by asking the model to return JSON and validating it yourself, or by using tool calling and returning the object in the tool input.
