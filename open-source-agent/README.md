# Unsloth → Runpod → Mastra: open source agent, end to end

This walkthrough shows the full lifecycle:

1. fine-tune in an **Unsloth** notebook on a Runpod **Pod**, then **merge to float16** and **push to Hugging Face**,
2. deploy a **Runpod Serverless** **vLLM** endpoint serving your merged model (OpenAI-compatible),
3. plug that endpoint into Mastra's **PDF questions** template and ask questions over a PDF.

---

## What you will build

* A small fine-tune (SFT) on an open model using the Unsloth Docker image (inside a Pod).
* A merged **fp16** model (vLLM-ready) pushed to **Hugging Face**.
* A **Serverless** endpoint on Runpod that serves your model via an **OpenAI-compatible** API.
* A **Mastra** app (PDF questions template) that points to your endpoint.

---

## Prerequisites

### Accounts and API keys

* **Runpod account and API key**
  * If you don't have a Runpod account, sign up at [https://runpod.io](https://runpod.io)
  * After signing up, get your API key from the console: [https://console.runpod.io/user/settings](https://console.runpod.io/user/settings)
  * You'll need to add credits to your account to launch Pods and Serverless endpoints

* **Hugging Face account + token** (recommended for pushing the merged model)
  * If you don't have a Hugging Face account, sign up at [https://huggingface.co/join](https://huggingface.co/join)
  * After signing up, create an access token at [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
  * Choose "Write" permissions so you can push models to your repos
  * Note: You can skip this if you prefer to keep your model local on the Runpod volume

### Software

* **Node 18+** (to run the Mastra template locally)

### Helpful links

* Unsloth notebooks index: [https://docs.unsloth.ai/get-started/unsloth-notebooks](https://docs.unsloth.ai/get-started/unsloth-notebooks)
* Runpod Unsloth template: [https://console.runpod.io/deploy?template=pzr9tt3vvq](https://console.runpod.io/deploy?template=pzr9tt3vvq)
* Runpod console: [https://console.runpod.io](https://console.runpod.io)
* Mastra PDF questions template: [https://mastra.ai/templates/pdf-questions](https://mastra.ai/templates/pdf-questions)

---

## Step 1 — Fine-tune and merge in an Unsloth notebook (inside a Pod)

### Launch a Pod

* Template: **Unsloth (Runpod Template)** → [https://console.runpod.io/deploy?template=pzr9tt3vvq](https://console.runpod.io/deploy?template=pzr9tt3vvq)
* **Choose a GPU:** **RTX 4000 Ada (20 GB)** recommended; **RTX 4090 (24 GB)** for more speed; **A40/L40 (48 GB)** for bigger batch/longer context.
* **Attach a network volume** and mount at **`/workspace/work`** (this makes outputs persistent).
* Add **HTTP 8888** (Jupyter) and set **`JUPYTER_PASSWORD`**.

### Open Jupyter and run a notebook

* Connect → HTTP 8888 → open **"Llama3.1 (8B) – Conversational"** (or **"Llama3 (8B) – Conversational"**) from the Unsloth list.
* For the demo: **Run all** with the default settings (keep epochs = 1 for speed).

### Merge to float16 and push to Hugging Face

* The Unsloth notebook includes a **merge** step — select **`merged_16bit`** to save fp16 weights (vLLM-ready).
* The notebook also includes a **"push to hub"** cell. Add your **Hugging Face token** (from [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)) to the Pod environment and run that cell.
* Result: a merged fp16 model under your HF repo (e.g., `your-user/llama8b-merged`).

  * If you prefer not to push, you can use the merged folder on your mounted volume instead.

**Acceptance for step 1**

* You have either:

  * a Hugging Face repo containing the merged model, **or**
  * a local merged folder at **`/workspace/work/.../merged`**.

---

## Step 2 — Deploy a Runpod Serverless vLLM endpoint (OpenAI-compatible)

### Quick deploy

* In the Runpod console → **Serverless** → **Quick Deploy** → choose **vLLM**.
* Set environment:

  * `MODEL_NAME` = your **Hugging Face repo id** (e.g., `your-user/llama8b-merged`)
  * If the repo is **private**, add `HUGGING_FACE_HUB_TOKEN` (use the same HF token)
  * **Alternative**: if you didn't push to HF, set `MODEL_NAME` to your merged **volume path** (e.g., `/workspace/work/model_out/merged`)
* Deploy and copy your **ENDPOINT_ID**.

### Test in the requests tab

* In the endpoint page, open **Requests**, select **OpenAI** mode, and call **`/chat/completions`**.
* Use:

  * `model`: your merged model id (e.g., `your-user/llama8b-merged`)
  * a short message (e.g., "In one line, explain what this demo does.")

**Endpoint base URL format** (for reference in step 3):
`https://api.runpod.ai/v2/<ENDPOINT_ID>/openai/v1`

**Acceptance for step 2**

* The Requests tab returns a valid answer from **your** merged model.

---

## Step 3 — Use Mastra's PDF questions template

This template lets you upload a PDF and immediately query it—perfect for a screen demo while showcasing your own hosted model.

### Set up the template

* Open the template: [https://mastra.ai/templates/pdf-questions](https://mastra.ai/templates/pdf-questions)
* Configure it to use an **OpenAI-compatible** provider pointing at your Runpod endpoint:

  * `OPENAI_BASE_URL` → `https://api.runpod.ai/v2/<ENDPOINT_ID>/openai/v1`
  * `OPENAI_API_KEY` → your Runpod API key
  * `MODEL_NAME` → your merged model id (e.g., `your-user/llama8b-merged`)
* Follow the template's quickstart to install dependencies and run the app.

### Demo flow

* Start the PDF questions app locally.
* Upload a small PDF (agenda, one-pager, or product sheet).
* Ask a question (e.g., "Summarize this PDF in one sentence.").
* Answers will come from your Runpod **Serverless** endpoint using your merged model.

**Acceptance for step 3**

* The app runs, accepts a PDF, and answers queries through **your** Runpod endpoint.

---

## Screenshot checklist (optional polish)

1. Pod creation page showing **RTX 4000 Ada** and a **network volume** mounted at `/workspace/work`.
2. Jupyter in the Pod with the Unsloth notebook open.
3. Notebook cell output showing the **fp16 merge** and **pushed to Hugging Face**.
4. Serverless deploy screen with `MODEL_NAME` set to your **HF repo id** (or local path).
5. Requests tab showing a successful **`/chat/completions`** call.
6. Mastra **PDF questions** UI responding to a query over your uploaded PDF.

---

## Tips and pitfalls

* If your HF repo is **private**, set `HUGGING_FACE_HUB_TOKEN` on the endpoint.
* Keep all work in **`/workspace/work`** so it persists across Pod restarts.
* In Requests and Mastra, use the **same model id** you merged/pushed.
* For the workshop, keep training short (epochs = 1) so you can spend time on the endpoint and Mastra parts.

---

## Credits

* Unsloth notebooks: [https://docs.unsloth.ai/get-started/unsloth-notebooks](https://docs.unsloth.ai/get-started/unsloth-notebooks)
* Runpod Unsloth template: [https://console.runpod.io/deploy?template=pzr9tt3vvq](https://console.runpod.io/deploy?template=pzr9tt3vvq)
* Runpod console: [https://console.runpod.io](https://console.runpod.io)
* Hugging Face tokens: [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
* Mastra PDF questions template: [https://mastra.ai/templates/pdf-questions](https://mastra.ai/templates/pdf-questions)

