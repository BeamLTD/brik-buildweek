// Vercel serverless function — the LIVE GPT-5.6 Analyst endpoint for the public site.
// Mirrors server/server.mjs so the deployed /api/analyst behaves exactly like local dev.
// The key is read from the Vercel env var OPENAI_API_KEY (never in the client, never committed).
// If no key is configured, it streams a clearly-labelled mock so the site never breaks.
export const config = { runtime: 'edge' };

const MODEL = process.env.MODEL || 'gpt-5.6';

const ANALYST_SYSTEM = `You are the Analyst, one agent inside BRIK — the AI reasoning layer on top of STAKD's deterministic finance engine.

Your job: explain, in plain and respectful language, WHY the user's Monthly Keep Rate changed this month.

Hard rules:
- Use ONLY the numbers in the provided context. Every figure you state must be one of those numbers (or an exact difference/percentage derived from them). Never invent, round differently, or estimate a figure.
- Lead with the counterintuitive truth if there is one (e.g. income rose but they kept less).
- Name behaviours and categories, not character judgements. No shaming words ("leak", "bleed", "zombie", "wasting").
- Keep it under 110 words. Plain prose, no markdown, no headings. End with a one-line "Confidence: 0.xx".`;

const MOCK_TEXT =
`This is a keep problem, not an earning problem — income actually rose from $5,000 to $5,400. What changed is your Cuts, up $1,100 this month. Most of that is two categories: Family rose $470 (from $250 to $720) and Food rose $420 (from $500 to $920). Housing is still your biggest Cut at $1,550. Monthly Keep Rate is 33.3%, down 16.7 points from 50.0%, against your 45% goal. Because the shift is discretionary, a small adjustment moves it back toward target. Confidence: 0.88.`;

const analystInput = (ctx) => [
  { role: 'system', content: ANALYST_SYSTEM },
  { role: 'user', content:
`Structured money context — every figure below was precomputed by STAKD's deterministic Keep Engine. Do not alter or invent any number.

${JSON.stringify(ctx, null, 2)}

Explain why this month's Monthly Keep Rate changed.` }
];

const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type' };
const sse = (o) => `data: ${JSON.stringify(o)}\n\n`;

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405, headers: cors });

  const key = process.env.OPENAI_API_KEY;
  const { context } = await req.json().catch(() => ({}));
  const enc = new TextEncoder();
  const t0 = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (o) => controller.enqueue(enc.encode(sse(o)));

      // No key configured → labelled mock (site still works)
      if (!key) {
        send({ type: 'meta', mode: 'mock', model: MODEL, id: 'resp_mock_' + Math.random().toString(36).slice(2, 10) });
        for (const w of MOCK_TEXT.match(/\S+\s*/g) || []) { send({ type: 'delta', text: w }); await new Promise(r => setTimeout(r, 20)); }
        send({ type: 'done', mode: 'mock', ms: Date.now() - t0, tokens: Math.round(MOCK_TEXT.length / 4) });
        controller.close();
        return;
      }

      // Live GPT-5.6 via the OpenAI Responses API, streamed and translated to our SSE shape
      try {
        const r = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
          body: JSON.stringify({ model: MODEL, stream: true, input: analystInput(context || {}) })
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
            const line = block.split('\n').find(l => l.startsWith('data:'));
            if (!line) continue;
            const payload = line.slice(5).trim();
            if (payload === '[DONE]') continue;
            let ev; try { ev = JSON.parse(payload); } catch { continue; }
            if (ev.type === 'response.created') { id = ev.response?.id; if (!metaSent) { send({ type: 'meta', mode: 'live', model: MODEL, id }); metaSent = true; } }
            else if (ev.type === 'response.output_text.delta') { send({ type: 'delta', text: ev.delta }); }
            else if (ev.type === 'response.completed') { tokens = ev.response?.usage?.output_tokens ?? null; id = ev.response?.id ?? id; }
            else if (ev.type === 'error' || ev.type === 'response.error') { throw new Error(ev.error?.message || 'stream error'); }
          }
        }
        send({ type: 'done', mode: 'live', ms: Date.now() - t0, tokens, id });
        controller.close();
      } catch (e) {
        send({ type: 'error', message: String(e.message || e) });
        controller.close();
      }
    }
  });

  return new Response(stream, { headers: { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache', ...cors } });
}
