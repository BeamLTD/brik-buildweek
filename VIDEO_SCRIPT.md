# BRIK — Demo Video Script (2–3 min)

Target: **2:30**. Screen-record the live site (https://brik.mystakd.com) — do a dry run so the live GPT call streams cleanly on camera. Keep your voice conversational; you're the builder, not a narrator.

Timing is a guide. `[SCREEN]` = what's shown, `[VO]` = what you say.

**Do NOT say on camera:** all agents are live · production Agents SDK orchestration is running · the app is publicly shipping on iOS or Android · the 37.3% scenario is a projection/forecast. Record the branded URL (`brik.mystakd.com`), not the raw Vercel URL.

---

### 0:00–0:20 · The problem
`[SCREEN]` Hub page — the BRIK mascot + "STAKD!" hero.
`[VO]` "People know what they earn. Almost nobody knows what they *keep*. Every budgeting app tells you where your money went. None of them tell you the number that actually builds wealth — how much you held onto. That number is your Keep Rate. And this is BRIK — the AI reasoning layer that helps you understand it."

### 0:20–0:40 · Keep Rate + Maya
`[SCREEN]` Open **The Reasoning** (`/demo.html`). Let the boot sequence run; land on Maya's context, then "You Kept."
`[VO]` "Meet Maya — a builder with a couple of income streams. This month she built $5,400 and kept $1,800. That's a Monthly Keep Rate of 33.3% — down from 50 last month. STAKD's engine computes that deterministically. It's just math. The interesting part is *why.*"

### 0:40–1:15 · Ask BRIK Why → **live GPT**
`[SCREEN]` Step to **Ask BRIK Why**. Press it. Let the Analyst **stream live**. Point the cursor at the trace.
`[VO]` "So I ask BRIK why. This is a live call to GPT-5.6 Sol through the OpenAI Responses API — streaming right now. And notice: it explains that Maya's income actually *rose* — the drop came from higher cuts, led by two categories. Every number it says is a number our engine computed. It can't invent one."
`[SCREEN]` The **Generated live with OpenAI** badge + the `LIVE · gpt-5.6-sol · resp_… · N tok` trace.
`[VO]` "There's the proof — generated live, with the response ID and token count right there."

### 1:15–1:45 · The Guardian disagreement (the differentiator)
`[SCREEN]` The crew / moves — Strategist **30%** → Guardian **22%**.
`[VO]` "Here's what makes it trustworthy. The Strategist proposes setting aside 30% of Maya's next variable payout. But the Guardian reviews it and *overrules* it — down to 22% — because her income varies and she has obligations coming up. The agents disagree, in the open. BRIK reconciles it into one reviewed plan. Nothing moves automatically — Maya decides."

### 1:45–2:10 · Architecture + Codex
`[SCREEN]` **The Blueprint** (`/build.html`) — the pipeline and "OpenAI never calculates financial figures."
`[VO]` "Under the hood: **STAKD calculates every financial figure deterministically. The public Analyst streams a live GPT-5.6 Sol explanation through the OpenAI Responses API. In the native STAKD integration, the Supabase function also enforces a strict output schema.** The Analyst is live — the other specialist roles and BRIK synthesis are deterministic in this Build Week demonstration. OpenAI never calculates a financial figure; STAKD is the source of truth. And we built it with Codex — the datasets, the native screens, the edge functions, the tests."

### 2:10–2:30 · Close
`[SCREEN]` Back to the hub / thesis line.
`[VO]` "That's BRIK. Deterministic where money's involved. Generative where language and judgment are. **STAKD calculates the truth. OpenAI reasons over the truth. BRIK communicates the truth.**"

---

## Shot checklist (capture these live)
- [ ] Hero with BRIK mascot + STAKD! yell
- [ ] Maya's "You Kept" — 33.3%, down from 50
- [ ] **Ask BRIK Why** streaming live (don't cut away — let it type)
- [ ] **Generated live with OpenAI** badge + trace with response ID
- [ ] Strategist 30% → Guardian 22%
- [ ] Blueprint pipeline + "OpenAI never calculates" line
- [ ] Thesis close

## Tips
- Do one **rehearsal run** so the live call is warm and streams fast on camera.
- If the live endpoint is ever slow/over budget, the labeled mock still looks clean — but aim for the live green trace.
- Keep it under 3:00; most rubrics reward tight.
