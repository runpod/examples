## Mastra getting-started

This example shows a minimal [Mastra](https://mastra.ai) project (built on top of the [Vercel AI SDK](https://sdk.vercel.ai)) wired to Runpod public endpoints via [@runpod/ai-sdk-provider](https://www.npmjs.com/package/@runpod/ai-sdk-provider). It includes a single agent (`weatherAgent`) with one tool to get weather information about your desired location.

### Prerequisites

- Node.js 20+
- A [Runpod](https://runpod.io) account and API key
  - Generate an API key in the [Runpod Console settings](https://console.runpod.io/user/settings)

### Setup

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file with your API key

```bash
cp .env.example .env
# then edit .env and set RUNPOD_API_KEY
```

### Run Mastra

Start the Mastra dev server and use the local playground:

```bash
npx mastra dev
```

Then open http://localhost:4111/agents/weatherAgent and chat with the `weatherAgent` to find out what the weather is like at the desired location: `What is the weather like in Berlin?`

### Models

The agent is currently configured to use `qwen/qwen3-32b-awq`, but you can use any model that supports tool calling from the [@runpod/ai-sdk-provider](https://www.npmjs.com/package/@runpod/ai-sdk-provider)

### Related examples

- [AI SDK getting-started](https://github.com/runpod/ai-sdk-provider/tree/main/examples/ai-sdk/getting-started)
