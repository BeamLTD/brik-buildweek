// BRIK live demo server
// --------------------------------------------------------------------------
// Serves the BRIK demo files AND a real GPT-5.6 Analyst endpoint.
//
// The one rule that makes BRIK trustworthy: the model never invents a number.
// STAKD's deterministic Keep Engine computes every figure; the server hands those
// verified numbers to GPT-5.6 (OpenAI Responses API, streamed) and the model only
// reasons over them. The response id + usage are streamed back as a visible trace.
//
// Run:   OPENAI_API_KEY=sk-... npm start        (real GPT-5.6)
//        npm start                              (no key → clearly-labelled mock,
//                                                so the pipeline is demoable offline)
// Then open http://localhost:8787/demo.html  → step 3 "Ask BRIK Why".
// --------------------------------------------------------------------------
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');            // brik-buildweek/  (the demo files)
const PORT = Number(process.env.PORT || 8787);
const MODEL = process.env.MODEL || 'gpt-5.6';
const KEY = process.env.OPENAI_API_KEY;

// Lazy-load the OpenAI SDK only when a key is present, so mock mode needs no install of nothing extra.
let client = null;
if (KEY) {
  try {
    const { default: OpenAI } = await import('openai');
    client = new OpenAI({ apiKey: KEY });
  } catch (e) {
    console.warn('[brik] openai SDK not installed — run `npm install` in server/. Falling back to mock.');
  }
}

const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.mjs':'text/javascript',
  '.css':'text/css', '.md':'text/markdown; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg',
  '.svg':'image/svg+xml', '.json':'application/json', '.ico':'image/x-icon' };

// --- The Analyst agent -----------------------------------------------------
const ANALYST_SYSTEM = `You are the Analyst, one agent inside BRIK — the AI reasoning layer on top of STAKD's deterministic finance engine.

Your job: explain, in plain and respectful language, WHY the user's Keep Rate changed this month.

Hard rules:
- Use ONLY the numbers in the provided context. Every figure you state must be one of those numbers (or an exact difference/percentage derived from them). Never invent, round differently, or estimate a figure.
- Lead with the counterintuitive truth if there is one (e.g. income rose but they kept less).
- Name behaviours and categories, not character judgements. No shaming words ("leak", "bleed", "zombie", "wasting").
- Keep it under 110 words. Plain prose, no markdown, no headings. End with a one-line "Confidence: 0.xx".`;

function analystInput(ctx) {
  return [
    { role: 'system', content: ANALYST_SYSTEM },
    { role: 'user', content:
`Structured money context — every figure below was precomputed by STAKD's deterministic Keep Engine. Do not alter or invent any number.

${JSON.stringify(ctx, null, 2)}

Explain why this month's Keep Rate changed.` }
  ];
}

const MOCK_TEXT =
`This is a keep problem, not an earning problem — income actually rose from $5,000 to $5,400. What changed is your Cuts, up $1,100 this month. Most of that is two categories: Family rose $470 (from $250 to $720) and Food rose $420 (from $500 to $920). Housing is still your biggest Cut at $1,550. Monthly Keep Rate is 33.3%, down 16.7 points from 50.0%, against your 45% goal. Because the shift is discretionary, a small adjustment moves it back toward target. Confidence: 0.88.`;

// --- HTTP ------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, live: !!client, model: MODEL }));
  }

  if (url.pathname === '/api/analyst' && req.method === 'POST') {
    return handleAnalyst(req, res);
  }

  // static files (the demos)
  let p = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.join(ROOT, decodeURIComponent(p));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
});

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch { return {}; }
}

async function handleAnalyst(req, res) {
  const body = await readBody(req);
  const ctx = body?.context || {};
  res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);
  const t0 = Date.now();

  // --- mock mode (no key): stream a canned explanation through the real pipe ---
  if (!client) {
    const id = 'resp_mock_' + Math.random().toString(36).slice(2, 10);
    send({ type: 'meta', mode: 'mock', model: MODEL, id });
    for (const chunk of MOCK_TEXT.match(/\S+\s*/g) || []) { send({ type: 'delta', text: chunk }); await sleep(22); }
    send({ type: 'done', mode: 'mock', ms: Date.now() - t0, tokens: Math.round(MOCK_TEXT.length / 4), id });
    return res.end();
  }

  // --- live GPT-5.6 (OpenAI Responses API, streamed) ---
  try {
    const stream = await client.responses.create({ model: MODEL, input: analystInput(ctx), stream: true });
    let id = null, tokens = null;
    for await (const event of stream) {
      switch (event.type) {
        case 'response.created':   id = event.response?.id; send({ type: 'meta', mode: 'live', model: MODEL, id }); break;
        case 'response.output_text.delta': send({ type: 'delta', text: event.delta }); break;
        case 'response.completed': tokens = event.response?.usage?.output_tokens ?? null; id = event.response?.id ?? id; break;
        case 'error':
        case 'response.error':     throw new Error(event.error?.message || 'stream error');
      }
    }
    send({ type: 'done', mode: 'live', ms: Date.now() - t0, tokens, id });
    res.end();
  } catch (e) {
    console.error('[brik] analyst error:', e.message);
    send({ type: 'error', message: String(e.message || e) });
    res.end();
  }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

server.listen(PORT, () => {
  console.log(`\n  BRIK live server → http://localhost:${PORT}`);
  console.log(`  Analyst model    → ${MODEL}  ${client ? '(LIVE — GPT-5.6 via OpenAI Responses API)' : '(MOCK — set OPENAI_API_KEY for a live call)'}`);
  console.log(`  Open             → http://localhost:${PORT}/demo.html  (step 3 · Ask BRIK Why)\n`);
});
