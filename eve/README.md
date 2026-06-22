# Eve on Runpod

Build a durable backend AI agent with [**Eve**](https://www.npmjs.com/package/eve)
whose **brain is an open LLM you self-host on Runpod Serverless** (vLLM,
OpenAI-compatible), that **generates images** with Runpod, behind a **web chat UI**.

- [getting-started](./getting-started) — the full example: an image-generating
  agent running on a self-deployed `Qwen/Qwen3.6-27B-FP8` endpoint, with a Next.js
  chat UI.

## What you'll build

```
Browser ─ Next.js chat UI ─ Eve agent
                              ├─ brain: self-deployed Qwen3.6-27B-FP8 (Runpod Serverless, vLLM)
                              └─ tool:  generate_image → Runpod image model
```

## How to run it

This example is **agent-first**: the setup runbook in
[`getting-started/AGENTS.md`](./getting-started/AGENTS.md) is written to be
executed by an AI coding agent (e.g. Claude Code) using the **`eve`** and
**`runpodctl`** skills. Open the project in your agent and say *"get this
running"* — it will deploy the LLM endpoint, wire it into the agent, and verify
the full chain against the runbook's **Checks** section.

Prefer to drive it yourself? `AGENTS.md` works as a normal step-by-step guide too.

### Prerequisites

- A [Runpod account](https://runpod.io) + API key ([console](https://console.runpod.io/user/settings)) with credits.
- A [HuggingFace token](https://huggingface.co/settings/tokens) (the vLLM worker uses it to pull the model).
- Node 24 and [`runpodctl`](https://github.com/runpod/runpodctl).

See [`getting-started/AGENTS.md`](./getting-started/AGENTS.md) for the full,
verifiable walkthrough.
