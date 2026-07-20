// Vercel Edge function — the LIVE GPT-5.6 Sol Analyst endpoint for the public web demo.
// Hardened for public exposure (OpenAI Build Week):
//  - Ignores client-supplied context entirely; reasons ONLY over a server-side canonical
//    Maya context where every delta/percentage is precomputed (no injection, no derivation).
//  - Per-IP rate limit (best-effort, in-memory per edge instance) → clean 429.
//  - Origin allowlist (no wildcard CORS in production).
//  - Request-size cap.
//  - Key is read from env (OPENAI_API_KEY); never in client, never committed.
//  - No key → a clearly-labelled DETERMINISTIC FALLBACK (mode:"mock"), never labelled live.
//  - Live responses always carry a real OpenAI response id (resp_...).
export const config = { runtime: 'edge' };

const MODEL = process.env.MODEL || 'gpt-5.6-sol';

// ---- Server-side canonical Maya context (the ONLY thing the model ever sees) ----
// Every figure, delta and percentage is precomputed here by STAKD's deterministic Keep
// Engine. The model may restate these values; it may not derive, alter or invent any.
const MAYA_CONTEXT = {
  persona: 'Maya',
  metric: 'Monthly Keep Rate = (Built - Cuts) / Built, per local calendar month, transfers excluded',
  currency: 'USD',
  this_month: { name: 'July', built_usd: 5400, cuts_usd: 3600, kept_usd: 1800, monthly_keep_rate_pct: 33.3 },
  previous_month: { name: 'June', built_usd: 5000, cuts_usd: 2500, kept_usd: 2500, monthly_keep_rate_pct: 50.0 },
  month_over_month: { built_delta_usd: 400, cuts_delta_usd: 1100, kept_delta_usd: -700, keep_rate_delta_points: -16.7 },
  cut_category_changes_usd: [
    { category: 'Family', increase_usd: 470, from_usd: 250, to_usd: 720 },
    { category: 'Food', increase_usd: 420, from_usd: 500, to_usd: 920 },
    { category: 'Housing', increase_usd: 100, from_usd: 1450, to_usd: 1550 },
    { category: 'Travel', increase_usd: 70 },
    { category: 'Insurance', increase_usd: 40 },
  ],
  biggest_cut: { label: 'August rent reserve', usd: 1550 },
  goal: { monthly_keep_rate_pct: 45, points_below_goal: 11.7 },
  ventures: [
    { name: 'Northstar Studio', built_usd: 4200, variable: false },
    { name: 'Maya Creative', variable: true },
  ],
};

const ANALYST_SYSTEM = `You are the Analyst, one specialist role inside BRIK — the reasoning layer on top of STAKD's deterministic finance engine.

Your job: explain, in plain and respectful language, WHY Maya's Monthly Keep Rate changed this month.

Hard rules:
- Every financial figure is already computed and supplied in the context. You may ONLY restate figures that appear verbatim in the context. Do NOT calculate, derive, infer, round, combine, or introduce any new number, amount, percentage, ratio or difference. If a figure is not in the context, do not mention it.
- Lead with the counterintuitive truth if there is one (e.g. income rose but they kept less).
- Name behaviours and categories, not character judgements. No shaming words ("leak", "bleed", "zombie", "wasting").
- Keep it under 110 words. Plain prose, no markdown, no headings. End with one line "Confidence: 0.xx" — a self-assessment; this confidence score is the only number you may introduce.`;

const analystInput = () => [
  { role: 'system', content: ANALYST_SYSTEM },
  { role: 'user', content:
`Structured money context — every figure below was precomputed by STAKD's deterministic Keep Engine. Restate only these figures; do not alter, derive or invent any number.

${JSON.stringify(MAYA_CONTEXT, null, 2)}

Explain why this month's Monthly Keep Rate changed.` },
];

// Deterministic fallback (no key). Uses only canonical figures. Clearly labelled, never "live".
const FALLBACK_TEXT =
`This is a keep problem, not an earning problem — income actually rose from $5,000 to $5,400. What changed is your Cuts, up $1,100 this month. Most of that is two categories: Family rose $470 (from $250 to $720) and Food rose $420 (from $500 to $920). Your biggest Cut this month is the August rent reserve at $1,550. Monthly Keep Rate is 33.3%, down 16.7 points from 50.0%, against your 45% goal. Because the shift is discretionary, a small adjustment moves it back toward target. Confidence: 0.88.`;

// ---- Security helpers ----
const ALLOWED_ORIGINS = new Set([
  'https://brik.mystakd.com',
  'https://brik-buildweek.vercel.app',
]);
const DEFAULT_ORIGIN = 'https://brik.mystakd.com';
const MAX_BODY_BYTES = 2048;
const RATE_LIMIT = 5; // requests
const RATE_WINDOW_MS = 60_000; // per minute per IP
const hits = new Map(); // ip -> number[] timestamps (best-effort, per edge instance)

function corsHeaders(origin) {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : DEFAULT_ORIGIN;
  return {
    'access-control-allow-origin': allow,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'vary': 'origin',
  };
}

function clientIp(req) {
  const xff = req.headers.get('x-forwarded-for') || '';
  return xff.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_LIMIT) { hits.set(ip, arr); return true; }
  arr.push(now); hits.set(ip, arr);
  return false;
}

const sse = (o) => `data: ${JSON.stringify(o)}\n\n`;

export default async function handler(req) {
  const origin = req.headers.get('origin');
  const cors = corsHeaders(origin);

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { ...cors, 'content-type': 'application/json' } });

  // Request-size cap (we ignore the body, but reject oversized requests outright)
  const len = Number(req.headers.get('content-length') || 0);
  if (len > MAX_BODY_BYTES) return new Response(JSON.stringify({ error: 'payload_too_large' }), { status: 413, headers: { ...cors, 'content-type': 'application/json' } });

  // Per-IP rate limit → clean 429
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'rate_limited', message: 'Too many requests. Try again in a minute.' }), {
      status: 429, headers: { ...cors, 'content-type': 'application/json', 'retry-after': '60' },
    });
  }

  // NOTE: client-supplied context is deliberately NOT read or trusted. The model only ever
  // reasons over MAYA_CONTEXT above. (We still drain the body cheaply so the socket closes clean.)
  await req.text?.().catch(() => {});

  const key = process.env.OPENAI_API_KEY;
  const enc = new TextEncoder();
  const t0 = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (o) => controller.enqueue(enc.encode(sse(o)));

      // No key → clearly-labelled DETERMINISTIC FALLBACK (never "live", no real resp_ id)
      if (!key) {
        send({ type: 'meta', mode: 'mock', model: MODEL, id: 'fallback_' + Math.random().toString(36).slice(2, 10) });
        for (const w of FALLBACK_TEXT.match(/\S+\s*/g) || []) { send({ type: 'delta', text: w }); await new Promise((r) => setTimeout(r, 18)); }
        send({ type: 'done', mode: 'mock', ms: Date.now() - t0, tokens: Math.round(FALLBACK_TEXT.length / 4) });
        controller.close();
        return;
      }

      // Live GPT-5.6 Sol via the OpenAI Responses API, streamed
      try {
        const r = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
          body: JSON.stringify({ model: MODEL, stream: true, input: analystInput() }),
        });
        if (!r.ok || !r.body) { const e = await r.text().catch(() => ''); throw new Error(`openai ${r.status} ${e.slice(0, 140)}`); }

        const reader = r.body.getReader(); const dec = new TextDecoder();
        let buf = '', id = null, tokens = null, metaSent = false;
        for (;;) {
          const { value, done } = await reader.read(); if (done) break;
          buf += dec.decode(value, { stream: true });
          let idx;
          while ((idx = buf.indexOf('\n\n')) >= 0) {
            const block = buf.slice(0, idx); buf = buf.slice(idx + 2);
            const line = block.split('\n').find((l) => l.startsWith('data:'));
            if (!line) continue;
            const payload = line.slice(5).trim();
            if (payload === '[DONE]') continue;
            let ev; try { ev = JSON.parse(payload); } catch { continue; }
            if (ev.type === 'response.created') { id = ev.response?.id; if (!metaSent && id) { send({ type: 'meta', mode: 'live', model: MODEL, id }); metaSent = true; } }
            else if (ev.type === 'response.output_text.delta') { send({ type: 'delta', text: ev.delta }); }
            else if (ev.type === 'response.completed') { tokens = ev.response?.usage?.output_tokens ?? null; id = ev.response?.id ?? id; }
            else if (ev.type === 'error' || ev.type === 'response.error') { throw new Error(ev.error?.message || 'stream error'); }
          }
        }
        // A live response must carry a real OpenAI response id; otherwise surface an error, never a fake "live".
        if (!id) { send({ type: 'error', message: 'no response id from model' }); controller.close(); return; }
        send({ type: 'done', mode: 'live', ms: Date.now() - t0, tokens, id });
        controller.close();
      } catch (e) {
        send({ type: 'error', message: String(e.message || e) });
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { ...cors, 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache' } });
}
