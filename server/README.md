# BRIK live server

Serves the BRIK demos **and** a real GPT-5.6 Analyst endpoint. The whole point: the "Ask BRIK Why" beat is an actual OpenAI call, not a mock — streamed, with a visible trace — while every dollar figure stays deterministic (computed by STAKD's Keep Engine, handed to the model as verified input the model may not alter).

## Run it live (real GPT-5.6)

```bash
cd brik-buildweek/server
npm install
cp .env.example .env          # then paste your key into .env
npm start                     # node --env-file .env server.mjs  (Node 20.6+ auto-loads .env)
```

Node 20.6+ loads `.env` automatically. On older Node, run: `node --env-file=.env server.mjs`, or `OPENAI_API_KEY=sk-... npm start`.

Open **http://localhost:8787/demo.html** → step **3 · Ask BRIK Why**. You'll see GPT-5.6 stream the explanation, then a green **LIVE** trace: `gpt-5.6 · resp_… · N tok · Nms`.

## Run it offline (mock, for a machine with no key)

```bash
npm start        # no .env → streams a canned explanation through the same pipe,
                 # labelled SIMULATED, so the demo never dies on stage.
```

## How it works

- `GET /` , `/demo.html`, etc. — serves the demo files from `../`.
- `POST /api/analyst` — takes the deterministic context pack, calls `openai.responses.create({ model, stream:true })`, and streams Server-Sent Events back:
  - `{type:'meta', mode:'live'|'mock', model, id}`
  - `{type:'delta', text}`  … repeated
  - `{type:'done', ms, tokens, id}`
- The demo (`demo.html`, step 3) calls this endpoint. If the server isn't running (bare file / published artifact), it falls back to a clearly-labelled deterministic mock.

## Security

The API key lives only in `.env` / the server process. It is never sent to the browser, embedded in the demo, or committed. That's also why a published artifact can't call GPT-5.6 directly — a browser-side key would be exposed, and the artifact sandbox blocks external calls. The server is the correct place for the key.

## Swapping the model

`MODEL` env var (default `gpt-5.6`). Change it in `.env` if the exact model id differs.
