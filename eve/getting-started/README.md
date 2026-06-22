# Getting Started with Eve on Runpod

An image-generating AI agent built with [**Eve**](https://www.npmjs.com/package/eve)
whose **brain is an open LLM you self-host on Runpod Serverless** (`Qwen/Qwen3.6-27B-FP8`
on vLLM, OpenAI-compatible), with a **`generate_image` tool** backed by a Runpod
image model, all behind a **Next.js web chat UI**.

```
Browser ─ Next.js chat UI ─ Eve agent
                              ├─ brain: self-deployed Qwen3.6-27B-FP8 (Runpod Serverless, vLLM)
                              └─ tool:  generate_image → Runpod image model
```

## This example is agent-first

It is **not** a `git clone && npm run dev` app — running it first requires
**deploying your own LLM endpoint** on Runpod and wiring its id + your keys into
the environment. That deploy-wire-verify flow is encoded as an agent runbook in
[`AGENTS.md`](./AGENTS.md), written to be executed by an AI coding agent (e.g.
Claude Code) using the **`eve`** and **`runpodctl`** skills.

### Recommended: hand it to your agent

1. Open this folder in your coding agent.
2. Make sure your shell has `RUNPOD_API_KEY` and `HF_TOKEN` exported (see below).
3. Tell it:

   > Read AGENTS.md and get this running.

The agent will deploy the vLLM endpoint, set `.env.local`, start the web UI, and
verify the full chain (LLM → tool → image) against the **Checks** section in
`AGENTS.md`. When it's done, open the printed URL and chat.

### Prefer to drive it yourself?

`AGENTS.md` doubles as a step-by-step human guide. The short version:

```bash
cp .env.example .env.local      # then fill in the values below
nvm use                         # Node 24
npm install
# 1) Deploy the LLM endpoint (see AGENTS.md for the exact runpodctl command),
#    then put its id in RUNPOD_LLM_ENDPOINT_ID in .env.local
npm run dev                     # starts the web chat UI on http://localhost:3000
```

## Prerequisites

- A [Runpod account](https://runpod.io) + [API key](https://console.runpod.io/user/settings) with credits.
- A [HuggingFace token](https://huggingface.co/settings/tokens) (the vLLM worker uses it to pull the model).
- [Node 24](https://nodejs.org) and [`runpodctl`](https://github.com/runpod/runpodctl).

## Environment (`.env.local`)

| Variable | What it is |
| --- | --- |
| `RUNPOD_API_KEY` | Used for both the LLM brain and the image tool. |
| `HF_TOKEN` | Passed to the vLLM worker to download the model. |
| `RUNPOD_LLM_ENDPOINT_ID` | The serverless endpoint id you get from deploying the LLM. |
| `RUNPOD_LLM_MODEL` | Served model id (default `Qwen/Qwen3.6-27B-FP8`). |

See [`.env.example`](./.env.example) for the template.

## What's in here

```
agent/
  agent.ts                  # defineAgent: brain = self-deployed endpoint via @runpod/ai-sdk-provider
  instructions.md           # system prompt
  tools/generate_image.ts   # Runpod image generation → public/generated/*.jpeg
  channels/eve.ts           # the web channel
app/, components/, lib/     # Next.js chat UI (scaffolded by `eve channels add web`)
AGENTS.md                   # the agent runbook + Checks (gotchas) — start here
.env.example                # environment template
```

## Notes

- The web UI, chat components, and tool are real source in this repo — edit them freely.
- Generated images are written to `public/generated/` and served by Next.js. This
  works for local `npm run dev`; for a Vercel deploy (read-only filesystem) serve
  images from object storage instead.
- Deploying gotchas (served model name, vLLM tool-call parser, cold starts, GPU
  capacity) are documented in [`AGENTS.md`](./AGENTS.md) — read it before deploying.
