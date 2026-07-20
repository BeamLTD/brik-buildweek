# Deploy BRIK → one public link for judges

Everything in this folder is a static site (`index.html` is the hub) plus one function (`api/analyst.js`) for the live GPT-5.6 call. Pick a path:

---

## Recommended: static link + live in the video

Give judges the **static link** (works instantly, nothing to break, no cost risk) and prove the live GPT-5.6 call in your **demo video** + this **repo's server code**. This is the standard, defensible hackathon setup — most rubrics accept "live in the video + code in the repo" for the model-usage requirement, without exposing a public paid endpoint.

On the static link, the "Ask BRIK Why" beat shows the labelled `SIMULATED` fallback. Everything else is fully interactive.

### Fastest — Netlify Drop (no account, ~60 seconds)
1. Go to **app.netlify.com/drop**
2. Drag the **`brik-buildweek` folder** onto the page (it respects `.vercelignore`? No — for Netlify, first delete/exclude `server/`; or just drag these files: `index.html demo-design.html demo.html build.html`).
3. You get a public URL like `https://brik-xyz.netlify.app`. That's the judge link.

### Or — Vercel CLI
```bash
npm i -g vercel
cd brik-buildweek
vercel            # first run: log in, accept defaults. Deploys static + api/.
vercel --prod     # promote to the production URL
```
`.vercelignore` already excludes `server/`, any `.env`, and `node_modules`, so no secret can be uploaded.

---

## Upgrade: make the public link itself call GPT-5.6 live

Deploy on **Vercel** (it runs `api/analyst.js`), then add your key as an encrypted env var. Judges clicking the link get the real green `LIVE` trace.

```bash
cd brik-buildweek
vercel                                  # deploy once
vercel env add OPENAI_API_KEY           # paste your key when prompted (stored encrypted, never in the repo)
# optional: vercel env add MODEL        # if the model id isn't gpt-5.6
vercel --prod                           # redeploy so the function picks up the key
```

Open the production URL → step 3 "Ask BRIK Why" → green **LIVE · gpt-5.6 · resp_… · N tok · Nms**.

### Guard the endpoint (do this if it's public and live)
A public LLM endpoint can be hit by anyone and burn credits. Protect it:
- **Set a hard budget cap on the API key** in the OpenAI dashboard (e.g. $10/mo) — the real safety net. Do this first.
- Optionally scope the key to just this project.
- For a short judging window this is usually enough; for longer exposure, add rate-limiting or a referer check in `api/analyst.js`.

---

## Custom domain (optional)
If you own `mystakd.com`: in Vercel/Netlify → Domains → add `brik.mystakd.com` (or a path on your existing site) and update DNS as instructed. Then the judge link is `https://brik.mystakd.com`.

---

## Notes
- **Fonts** load normally on any real host (the Google Fonts CDN was only blocked inside the claude.ai artifact sandbox).
- **Local dev** still uses `server/` (`cd server && npm start` → http://localhost:8787). The Vercel function and the local server expose the same `/api/analyst` SSE contract, so the demo code is identical in both.
- **Do not** deploy the `server/` folder to a static host — it's local-only. `.vercelignore` handles this for Vercel.
