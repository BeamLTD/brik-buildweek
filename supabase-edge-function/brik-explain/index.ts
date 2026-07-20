import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const OPENAI_URL = 'https://api.openai.com/v1/responses';
const TIMEOUT_MS = 20_000;
const REQUIRED_KEYS = [
  'builtThisMonth', 'cutsThisMonth', 'keptThisMonth', 'keepRate', 'previousMonthKeepRate',
  'keepRateDelta', 'biggestCut', 'topVenture', 'builderStage', 'momentumMonths',
  'categoryChanges', 'ventureChanges',
] as const;

const INSTRUCTIONS = `You are BRIK, a financial reasoning coach.

You receive financial figures that have already been calculated and verified by STAKD's deterministic engine.
Never recalculate, alter, replace, or invent a financial figure.
Do not claim certainty about future outcomes.
Do not provide investment, legal, accounting, or tax advice.
Explain financial behavior in clear, encouraging, nonjudgmental language.
Base every conclusion only on the supplied context.

Return a concise headline, why the Monthly Keep Rate changed, the most important behavioral pattern, and one or two practical adjustable next moves. Do not mention information absent from the context. Use no markdown. Any number mentioned must exactly match a number supplied in the context.`;

const RESPONSE_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['headline', 'explanation', 'primaryPattern', 'suggestedMoves', 'disclaimer'],
  properties: {
    headline: { type: 'string' }, explanation: { type: 'string' }, primaryPattern: { type: 'string' },
    suggestedMoves: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 2 },
    disclaimer: { type: 'string' },
  },
};

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'content-type': 'application/json',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: corsHeaders });

function validContext(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  if (keys.length !== REQUIRED_KEYS.length || keys.some((key) => !REQUIRED_KEYS.includes(key as typeof REQUIRED_KEYS[number]))) return false;
  const context = value as Record<string, unknown>;
  return ['builtThisMonth', 'cutsThisMonth', 'keptThisMonth', 'keepRate', 'previousMonthKeepRate', 'keepRateDelta', 'momentumMonths']
    .every((key) => typeof context[key] === 'number' && Number.isFinite(context[key] as number)) &&
    typeof context.builderStage === 'string' && Array.isArray(context.categoryChanges) && Array.isArray(context.ventureChanges);
}

function validExplanation(value: unknown) {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.headline === 'string' && typeof v.explanation === 'string' && typeof v.primaryPattern === 'string' &&
    Array.isArray(v.suggestedMoves) && v.suggestedMoves.length >= 1 && v.suggestedMoves.length <= 2 &&
    v.suggestedMoves.every((move) => typeof move === 'string') && typeof v.disclaimer === 'string';
}

function outputText(response: Record<string, unknown>): string | null {
  for (const item of Array.isArray(response.output) ? response.output : []) {
    if (!item || typeof item !== 'object' || (item as { type?: string }).type !== 'message') continue;
    for (const part of Array.isArray((item as { content?: unknown[] }).content) ? (item as { content: unknown[] }).content : []) {
      if (part && typeof part === 'object' && (part as { type?: string }).type === 'output_text' && typeof (part as { text?: unknown }).text === 'string') {
        return (part as { text: string }).text;
      }
    }
  }
  return null;
}

async function authenticated(request: Request, signal: AbortSignal) {
  const authorization = request.headers.get('authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!authorization?.startsWith('Bearer ') || !supabaseUrl || !anonKey) return false;
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { authorization, apikey: anonKey }, signal,
  });
  return response.ok;
}

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    if (!(await authenticated(request, controller.signal))) return json({ error: 'unauthorized' }, 401);

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    const model = Deno.env.get('OPENAI_MODEL');
    if (!apiKey || !model) return json({ error: 'server_not_configured' }, 503);

    let context: unknown;
    try { context = (await request.json())?.context; } catch { return json({ error: 'invalid_json' }, 400); }
    if (!validContext(context)) return json({ error: 'invalid_context' }, 400);

    const upstream = await fetch(OPENAI_URL, {
      method: 'POST', signal: controller.signal,
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model, instructions: INSTRUCTIONS, input: `VERIFIED_CONTEXT\n${JSON.stringify(context)}`,
        text: { format: { type: 'json_schema', name: 'brik_explanation', strict: true, schema: RESPONSE_SCHEMA } },
      }),
    });
    const body = await upstream.json();
    if (!upstream.ok) {
      console.error('BRIK OpenAI request failed', upstream.status, body?.error?.type ?? 'unknown');
      return json({ error: 'upstream_failed' }, 502);
    }

    const text = outputText(body);
    if (!text) return json({ error: 'missing_output' }, 502);
    let explanation: unknown;
    try { explanation = JSON.parse(text); } catch { return json({ error: 'invalid_output' }, 502); }
    if (!validExplanation(explanation)) return json({ error: 'invalid_output' }, 502);

    return json({ explanation, trace: { responseId: body.id, model, generatedAt: new Date().toISOString(), source: 'openai_responses_api' } });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return json({ error: 'timeout' }, 504);
    console.error('BRIK explanation failed', error instanceof Error ? error.name : 'unknown');
    return json({ error: 'internal_error' }, 500);
  } finally { clearTimeout(timeout); }
});
