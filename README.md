# BRIK — The AI Wealth Reasoning Layer for STAKD

**STAKD calculates the truth. OpenAI reasons over the truth. BRIK communicates the truth.**

BRIK is not another budgeting app. It's a financial **reasoning layer** that sits on top of STAKD's deterministic financial engine and helps a builder understand four things: **what changed, why it changed, what could happen next, and what practical moves they may want to consider.**

Built for **OpenAI Build Week**.

---

## Live demo

- **Hub:** https://brik.mystakd.com
- **The Product** (how it feels): https://brik.mystakd.com/demo-design.html
- **The Reasoning** (how it thinks — live GPT): https://brik.mystakd.com/demo.html
- **The Blueprint** (how it's made): https://brik.mystakd.com/build.html

On the Reasoning page, press **Ask BRIK Why** to stream a live explanation from **GPT-5.6 Sol** via the OpenAI Responses API. The response shows a live trace — `LIVE · gpt-5.6-sol · resp_… · N tok · Nms` — and a **Generated live with OpenAI** badge.

---

## The metric

All reasoning is anchored to one number:

```
Monthly Keep Rate = ((Built − Cuts) ÷ Built) × 100
```

Per local calendar month, transfers excluded. It answers the question traditional budgeting doesn't: **not what you earned — what you kept.**

**Persona (synthetic):** Maya, a multi-venture builder, six months of history.

| | This month | Last month |
|---|---|---|
| Built | $5,400 | $5,000 |
| Cuts | $3,600 | $2,500 |
| Kept | $1,800 | $2,500 |
| **Monthly Keep Rate** | **33.3%** | 50.0% |

Δ **−16.7 pts**. Biggest cut: August rent reserve, $1,550. Goal: 45%.

---

## What is real today

**Live**
- ✅ GPT-5.6 Sol Analyst reasoning via the OpenAI **Responses API** — **streamed text** on the public web demo; strict **Structured Outputs** (JSON schema) on the native Supabase path
- ✅ Serverless **Edge Function** → OpenAI (Vercel for this web demo; Supabase `brik-explain` in the STAKD app)
- ✅ Deterministic **Keep Engine** (the math is code, not a model)
- ✅ Semantic action routing (recommendations open real STAKD screens)
- ✅ Guardian disagreement logic (visibly overrules the Strategist, 30% → 22%)
- ✅ Native STAKD integration (in-app BRIK Coach screen)

**Illustrative / roadmap**
- Production multi-agent orchestration
- Monte Carlo forecasting
- Autonomous financial actions
- Live banking integrations

The Analyst is live. Oracle, Strategist, Guardian, and BRIK synthesis are **deterministic** for this Build Week demonstration.

> Every number shown to the model is computed and allowlisted by STAKD. The model may explain those values but may not alter, replace, or derive new financial figures.

---

## What existed before Build Week

- STAKD's existing React Native / Expo application
- Transaction logging
- Deterministic Built, Cuts, Kept, and Monthly Keep Rate calculations
- Existing Supabase infrastructure
- Existing STAKD actions and navigation

## What we built during Build Week

- BRIK reasoning layer
- Synthetic Maya six-month ledger
- `buildBrikContext` adapter
- Native BRIK Coach experience
- Five-member product crew
- Live GPT-5.6 Sol Analyst integration
- Vercel public Analyst endpoint
- Authenticated Supabase `brik-explain` Edge Function
- Guardian 30% → 22% review moment
- Public Product, Reasoning, and Blueprint demonstrations
- Semantic action mapping
- Build Week testing and QA

See `BUILD_WEEK_CHANGELOG.md` and `CODEX_BUILD_LOG.md` for dated detail.

---

## The crew

One consistent crew, everywhere:

1. **Analyst** — explains *why* the Monthly Keep Rate changed, in plain language, using only verified figures.
2. **Oracle** — frames simple scenario estimates from Maya's six-month history (labeled illustrative — not a production forecast).
3. **Strategist** — ranks practical moves, each mapped to a real STAKD action (SetGoal, CreateStak, CreateCut).
4. **Guardian** — a risk gate that reviews every proposal and can cap or overrule it. In the demo it reduces the Strategist's 30% payout set-aside to **22%** because Maya's income varies and obligations are upcoming.
5. **BRIK** — reconciles the crew and is the only one that speaks to the user, warm and short.

---

## Architecture

```
Transactions
   ↓  buildInsightContext()
   ↓  buildBrikContext()
Allowlisted Financial Context
   ↓
GPT-5.6 Sol Reasoning   (Responses API — streamed on web · Structured Outputs on native)
   ↓
BRIK
   ↓
Reviewed Actions        (the user acts; nothing moves automatically)
```

**OpenAI never calculates financial figures.** It receives only structured, allowlisted context. STAKD remains the source of truth — the model may not invent, alter, or re-derive a number.

---

## Stack

- **Reasoning:** GPT-5.6 Sol · OpenAI Responses API — **streamed text** on the public web demo; strict **Structured Outputs** (JSON schema) on the native Supabase `brik-explain` path
- **Serving:** Edge Function — Vercel (web demo) · Supabase `brik-explain` (app)
- **App:** STAKD — React Native / Expo (SDK 54)
- **Data:** Supabase — Postgres + RLS
- **Tooling:** built with **Codex**

The OpenAI API key is held **server-side only** (never in the client, never committed). If no key is configured, every surface streams a clearly labeled mock so the demo never breaks.

---

## Run it locally

```bash
cd server
cp .env.example .env          # paste your OPENAI_API_KEY, set MODEL=gpt-5.6-sol
npm install
npm start                     # http://localhost:8787
```

Open `http://localhost:8787/demo.html` and press **Ask BRIK Why**. Without a key it runs in labeled mock mode; with a key it streams live GPT-5.6 Sol. See `DEPLOY.md` for the public-deploy path.

---

## Built with Codex

Codex accelerated the whole build — architecture iteration, synthetic Maya datasets, native screen implementation, navigation debugging, Edge Function development, testing/QA, and agent scaffolding.

---

## Disclaimer

STAKD and BRIK are financial **education and coaching** — not investment, tax, legal, or accounting advice. All data in this demo is **synthetic** (persona: Maya). Account linking, automated transfers, and subscription cancellation shown in the app demo are **illustrative**, not live in STAKD today.
