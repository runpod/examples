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

### 1) Text generation

Generate a short haiku using `qwen/qwen3-32b-awq` and print the text plus token usage.

```bash
node generate-text.js
```

### 2) Streaming text

Stream a bullet list of JavaScript tips from `qwen/qwen3-32b-awq` directly to the terminal and show usage.

```bash
node stream-text.js
```

### 3) Function calling (tools)

Demonstrate function calling with a simple calculator tool (adds 1337 and 42) using `qwen/qwen3-32b-awq`.

```bash
node tools-basic.js
```

### 4) Image generation

Generate an image with `black-forest-labs/flux-1-dev` and save it as a JPG with a timestamped filename.

```bash
node generate-image.js
```

### 5) Streaming reasoning (Qwen)

Stream a step‑by‑step reasoning process from `qwen/qwen3-32b-awq` and the final answer.

```bash
node stream-reasoning-qwen.js
```

Output file name includes a timestamp, e.g. `generated-image-YYYY-MM-DDTHH-MM-SS-SSSZ.jpg`.

### 6) Image edit (Flux Kontext)

Edit an existing image using `black-forest-labs/flux-1-kontext-dev` by providing an input image URL and an edit prompt.

```bash
node edit-image-flux.js https://image.runpod.ai/asset/qwen/qwen-image-edit.png
```

### 7) Image edit (Qwen)

Edit an existing image using `qwen/qwen-image-edit` with the same prompt semantics; saves a PNG file.

```bash
node edit-image-qwen.js https://image.runpod.ai/asset/qwen/qwen-image-edit.png
```

### 8) Speech generation

Generate speech audio using `experimental_generateSpeech` and save it as a WAV file.

> Note: This speech endpoint currently returns WAV only; `outputFormat` is ignored.

```bash
node generate-speech-chatterbox-turbo.js
```

---

## Models and Endpoints

This project uses IDs supported by the provider and maps them to Runpod OpenAI-compatible endpoints. See `@runpod/ai-sdk-provider` `README.md` for the up-to-date list and details about `baseURL` overrides for custom endpoints.

---

## Notes

- Ensure `.env` contains `RUNPOD_API_KEY`.
- All scripts are ESM (`type: module`).
- Adjust prompts, temperatures, and model IDs as needed.
- Structured outputs via `generateObject`/`experimental_output` are not supported by the models in this provider. You can still get structured data by asking the model to return JSON and validating it yourself, or by using tool calling and returning the object in the tool input.
