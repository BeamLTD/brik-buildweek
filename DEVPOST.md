# BRIK — Devpost Submission Copy

*(Paste into the matching Devpost fields. Trim to length as needed.)*

---

## Project name
BRIK — The AI Wealth Reasoning Layer for STAKD

## Tagline (one line)
People know what they earn. Almost no one knows what they keep. BRIK reasons over the difference.

## Elevator pitch (≈200 chars)
BRIK is an AI reasoning layer on top of STAKD's deterministic finance engine. It explains what changed in your Monthly Keep Rate, why, and what to do — live, with GPT-5.6 Sol, never inventing a number.

---

## Inspiration
I grew up on the West Side of Chicago, one of six kids, in a home where money was always tight and never explained. Traditional budgeting apps tell you what you *earned* and where it *went*. They never tell you the thing that actually builds wealth: **what you kept.** STAKD is built around that one number — the **Keep Rate** — and BRIK is the coach that helps a builder understand it. Not more dashboards. A reasoning layer that speaks plainly and tells the truth.

## What it does
BRIK sits on top of STAKD's deterministic financial engine and answers four questions for a builder:
- **What changed** in your Monthly Keep Rate this month
- **Why** it changed (in plain, non-judgmental language)
- **What could happen next** (clearly labeled scenario estimates)
- **What practical moves** you may want to consider — each one opening a real STAKD screen; nothing moves automatically

It does this through a five-member crew — **Analyst, Oracle, Strategist, Guardian, and BRIK** — with a hard rule: the model never invents, alters, or re-derives a financial figure. STAKD calculates the truth; OpenAI reasons over it; BRIK communicates it.

The differentiator is the **Guardian**: it visibly overrules the Strategist, cutting a proposed 30% payout set-aside to 22% because the user's income is variable and obligations are upcoming. Disagreement, in the open, is what makes the advice trustworthy.

## How we built it
- **Deterministic Keep Engine** computes Monthly Keep Rate = ((Built − Cuts) ÷ Built) × 100 and hands the agents a structured, **allowlisted** context pack where every figure is citable.
- The **Analyst runs live** on **GPT-5.6 Sol** via the OpenAI **Responses API** with **Structured Outputs** (strict JSON schema), streamed to the UI with a visible trace (response id, tokens, latency).
- Served by a serverless **Edge Function** — Vercel for the public web demo, **Supabase `brik-explain`** inside the STAKD app — with the API key held server-side only.
- The STAKD app is **React Native / Expo (SDK 54)** on **Supabase (Postgres + RLS)**.
- Oracle, Strategist, Guardian, and BRIK synthesis are deterministic for this Build Week demonstration.
- Built with **Codex** — architecture, synthetic datasets, native screens, Edge Functions, and QA.

## Challenges we ran into
- **Honesty under a demo deadline.** It's easy to imply a full autonomous multi-agent system exists. We drew a hard line: label what's live (the Analyst) vs. what's deterministic or roadmap, and never let the model state a number the engine didn't compute.
- **Keeping the model on a leash.** Structured Outputs plus an allowlisted context pack means the model reasons over verified figures and returns parseable data, not free-form prose that could drift.

## Accomplishments we're proud of
- A live GPT-5.6 Sol call that reasons over real computed figures and refuses to invent — verified end-to-end on the web demo **and** in the shipping iOS/Android app.
- The Guardian override as a visible, first-class moment.
- A submission that is exactly as honest as it is impressive.

## What we learned
The trust isn't in the AI being smart — it's in the AI knowing its lane. Deterministic where money is involved; generative where language and judgment are. That boundary is the product.

## What's next
Production multi-agent orchestration, scenario forecasting, and — only behind real user review — deeper automation. And BRIK's voice: warmer, shorter, more human, surfaced as a single friendly line with the full reasoning one tap away.

## Built with
`openai` · `gpt-5.6-sol` · `responses-api` · `structured-outputs` · `supabase` · `edge-functions` · `vercel` · `react-native` · `expo` · `typescript` · `postgres` · `codex`

## Links
- **Live demo:** https://brik-buildweek.vercel.app  (custom domain in progress: https://brik.mystakd.com)
- **Repo:** https://github.com/BeamLTD/brik-buildweek
- **Video:** *(YouTube link — see VIDEO_SCRIPT.md)*
