# Getting Started with Eve on Runpod — agent runbook

> **This file is written for an AI coding agent** (e.g. Claude Code) that has the
> **`eve`** and **`runpodctl`** skills available. If you are such an agent: read
> this top to bottom, then execute the steps. Don't ask the human to do the
> setup — do it yourself with the skills, and use the **Checks** section to
> verify each part actually works. If you are a human, you can follow it too, or
> just hand it to your agent and say *"get this running."*

## What you're building

A durable backend AI agent (built with [**Eve**](https://www.npmjs.com/package/eve))
whose "brain" is an **open LLM you self-deploy on Runpod Serverless** (vLLM,
OpenAI-compatible), that can **generate images** via Runpod, exposed through a
**Next.js web chat UI**.

```
Browser (localhost:3000)
  └─ Next.js web chat UI            (app/, components/ — in this repo, yours to edit)
       └─ eve/react + eve/next      (Eve glue: serves UI + agent on one port)
            └─ Eve agent            (agent/agent.ts, agent/instructions.md)
                 ├─ brain:  self-deployed Qwen3.6-27B-FP8 on Runpod Serverless (vLLM)
                 └─ tool:   generate_image → Runpod image model → public/generated/*.jpeg
```

Everything in `agent/` and the UI is already written. Your job is to **deploy the
LLM endpoint**, **wire it in**, and **verify** it end to end.

## Skills to use

- **`eve`** — to understand/build/run the Eve app. Its docs ship in the package:
  read `node_modules/eve/docs/README.md` first (after `npm install`).
- **`runpodctl`** — to deploy and manage the Serverless LLM endpoint.

## Prerequisites (confirm before starting)

- **Node 24** (`.nvmrc` pins it; `nvm use`).
- **`RUNPOD_API_KEY`** in your environment (and a Runpod account with credits).
- **`HF_TOKEN`** in your environment (HuggingFace; the vLLM worker uses it to pull the model).
- **`runpodctl`** installed and authenticated (`runpodctl config --apiKey $RUNPOD_API_KEY`).
- Copy `.env.example` → `.env.local` and fill in `RUNPOD_API_KEY` / `HF_TOKEN`
  (leave `RUNPOD_LLM_ENDPOINT_ID` blank for now). Eve auto-loads `.env.local`.

> Why self-host the brain? The Vercel AI Gateway free tier returns `403` for
> frontier models, so a from-scratch Eve agent can't think. Self-hosting an open
> model on Runpod gives you a brain you fully control — that's the whole point.

## Steps

### 1. Install
```bash
npm install
```

### 2. Deploy the LLM brain on Runpod Serverless (use the `runpodctl` skill)

Deploy the Runpod **worker-vllm** hub image serving **`Qwen/Qwen3.6-27B-FP8`**
(latest Qwen generation as of 2026-06; FP8 ≈ 27 GB so cold starts are ~2× faster
than bf16, and it fits one 80 GB GPU comfortably).

```bash
runpodctl serverless create \
  --hub-id cm8h09d9n000008jvh2rqdsmb \
  --name eve-brain \
  --gpu-id "AMPERE_80" \
  --workers-min 0 --workers-max 1 --idle-timeout 300 \
  --env MODEL_NAME=Qwen/Qwen3.6-27B-FP8 \
  --env OPENAI_SERVED_MODEL_NAME_OVERRIDE=Qwen/Qwen3.6-27B-FP8 \
  --env HF_TOKEN=$HF_TOKEN \
  --env MAX_MODEL_LEN=32768 \
  --env GPU_MEMORY_UTILIZATION=0.90 \
  --env ENABLE_AUTO_TOOL_CHOICE=true \
  --env TOOL_CALL_PARSER=qwen3_xml \
  --env REASONING_PARSER=qwen3
```

Why each env matters (these are load-bearing — see **Checks**):
- `OPENAI_SERVED_MODEL_NAME_OVERRIDE` → forces the OpenAI `model` id to a stable
  `Qwen/Qwen3.6-27B-FP8` even when the model loads from a lowercased cache path.
- `TOOL_CALL_PARSER=qwen3_xml` → Qwen3.x emits tool calls as `<function=…><parameter=…>`;
  the wrong parser makes tool calls leak into the text and the agent never calls the tool.
- `REASONING_PARSER=qwen3` → separates the model's thinking from the answer.
- `ENABLE_AUTO_TOOL_CHOICE=true` → required for tool calling.
- `--idle-timeout 300` → keep the worker warm 5 min after a request.

`runpodctl serverless create` prints the endpoint `id`. The first request
cold-starts the worker (downloads the model, a few minutes). Wait for it:
```bash
EP=<endpoint-id>
curl -s -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -X POST "https://api.runpod.ai/v2/$EP/openai/v1/chat/completions" \
  -H 'content-type: application/json' \
  -d '{"model":"Qwen/Qwen3.6-27B-FP8","messages":[{"role":"user","content":"say OK"}],"max_tokens":256}'
```

### 3. Wire the endpoint into the agent

Put the endpoint id in `.env.local`:
```bash
RUNPOD_LLM_ENDPOINT_ID=<endpoint-id>
RUNPOD_LLM_MODEL=Qwen/Qwen3.6-27B-FP8
```
`agent/agent.ts` already uses `createRunpod({ baseURL: .../v2/<id>/openai/v1 })`
and `runpod.chatModel(RUNPOD_LLM_MODEL)`. No code change needed.

### 4. Run it
```bash
npm run dev          # Next.js web UI + agent on http://localhost:3000
```
Open http://localhost:3000 and try: **"draw me a fox astronaut on Mars"**.
The agent thinks on your self-hosted LLM, calls `generate_image`, and shows the
image inline.

## Checks (verify these — this is where it usually goes wrong)

Run these to confirm each part works. Each one maps to a real failure to avoid.

1. **Brain reachable & correct served name.** `GET /openai/v1/models` must return
   `Qwen/Qwen3.6-27B-FP8` (not a `/runpod-volume/...snapshots/...` path). If it
   returns a path, the model-store cached the repo lowercased and the served name
   fell back to the path → requests 404 with *"model does not exist"*. Fix:
   ensure `OPENAI_SERVED_MODEL_NAME_OVERRIDE` is set (it is, above). Background —
   worker-vllm bug: https://github.com/runpod-workers/worker-vllm/issues/310
   ```bash
   curl -s -H "Authorization: Bearer $RUNPOD_API_KEY" \
     "https://api.runpod.ai/v2/$EP/openai/v1/models" | grep -o '"id":"[^"]*"'
   ```

2. **Tool calling parses.** Ask for an image and confirm the agent actually
   *calls* `generate_image` (not prints `<function=generate_image>…` as text). If
   it prints raw XML, `TOOL_CALL_PARSER` is wrong — it must be `qwen3_xml` for Qwen3.x.

3. **Image renders in the UI.** The reply should contain `![...](/generated/<id>.jpeg)`
   and the image should display. If you see *"Image not available"*, the tool
   returned a filesystem path instead of a web URL — the tool here writes to
   `public/generated/` and returns `/generated/<id>` exactly so Next.js serves it.
   ```bash
   curl -s -o /dev/null -w "%{http_code} %{content_type}\n" \
     "http://localhost:3000/generated/<file>.jpeg"   # expect: 200 image/jpeg
   ```

4. **No compaction startup error.** Eve can't look up the context window for a
   custom (non-gateway) model, which aborts startup. `agent.ts` sets
   `modelContextWindowTokens: 32768` to fix this. If you change the model, update it.

5. **Capacity / cold start.** With `--workers-min 0` the endpoint scales to zero;
   the first request after idle cold-starts (~1–5 min). Don't pin a single
   datacenter (`--data-center-ids`) unless you've confirmed it has A100 capacity —
   most single-DC pins fail to provision. Leave it unpinned.

## Cost & cleanup

- The endpoint bills GPU time only while a worker is up (scales to zero at idle).
  Each generated image costs ~$0.02.
- Tear down when done:
  ```bash
  runpodctl serverless delete <endpoint-id>
  ```

## Swapping models

- Any vLLM-supported chat model works. Update `MODEL_NAME` +
  `OPENAI_SERVED_MODEL_NAME_OVERRIDE` + `RUNPOD_LLM_MODEL`, and the right
  `TOOL_CALL_PARSER` for that family (e.g. `hermes` for older Qwen3, `mistral`
  for Mistral). Keep `modelContextWindowTokens` in sync with `MAX_MODEL_LEN`.
- The image model is set in `agent/tools/generate_image.ts` (`RUNPOD_IMAGE_MODEL`,
  default `qwen/qwen-image`).

## Deploying (beyond local dev)

`npm run dev` writes images to `public/generated/`, which works locally. On a
read-only serverless host (e.g. Vercel) you'd serve generated images from object
storage / a route handler instead. Use the `eve` skill (`eve deploy`) when you go
to production.
