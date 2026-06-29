# Eve on Runpod

Build a durable backend AI agent with [**Eve**](https://www.npmjs.com/package/eve)
whose brain is an open LLM you self-host on Runpod Serverless (vLLM), that
generates images with Runpod, behind a web chat UI.

- [**getting-started**](./getting-started) — an image-generating agent running on
  a self-hosted `Qwen/Qwen3.6-27B-FP8` endpoint, with a Next.js chat UI.

```
Browser ─ Next.js chat UI ─ Eve agent
                              ├─ brain: Qwen3.6-27B-FP8 (Runpod Serverless, vLLM)
                              └─ tool:  generate_image → Runpod image model
```

See [getting-started](./getting-started) for setup and how to run it.
