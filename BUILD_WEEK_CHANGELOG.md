# BRIK — Build Week Changelog

Dated record of what was built during OpenAI Build Week, with commit hashes and file paths. Work landed on the `brik-buildweek-demo` branch of the private `BeamLTD/STAKD` repository and is mirrored to the public `BeamLTD/brik-buildweek` repository.

> All financial figures are computed by STAKD's deterministic Keep Engine. Maya is a synthetic persona. No production customer data is included.

| Date | Commit | Work | Files | Codex? | Evidence |
|---|---|---|---|---|---|
| 2026-07-18 | `8598598` | In-app **BRIK Coach** AI feature + live GPT edge function | `src/ai/*`, `src/screens/BrikCoachScreen.tsx`, `src/navigation/AppNavigator.tsx`, `supabase/functions/brik-explain/index.ts` | yes¹ | in-app live trace (video) |
| 2026-07-18 | `4d54c01` | Build Week demo deliverables (deploy-ready package) | `brik-buildweek/{index,demo,demo-design,build}.html`, `server/`, `api/analyst.js` | yes¹ | live site |
| 2026-07-19 | `b7d6100` | Final submission polish — align copy to canonical truth + live-AI status | 4 demo pages | yes¹ | — |
| 2026-07-19 | `67174b7` | Surface **GPT-5.6 Sol** model label on web + round app context to 2 decimals | 4 demo pages, `src/ai/client.ts` | yes¹ | screenshot #05 |
| 2026-07-19 | `80fc127` | Integrate design team's site refresh (BRIK mascot hero) + keep live wiring | 4 demo pages | — | hub screenshot |
| 2026-07-19 | `8daeb90` | Submission package — README, Devpost copy, video script | `README.md`, `DEVPOST.md`, `VIDEO_SCRIPT.md` | — | — |
| 2026-07-19 | `c91dedb` | CPO copy sweep + `brik.mystakd.com` live | 4 demo pages, docs | — | live branded domain |
| 2026-07-19/20 | _(this pass)_ | **Truth + security + QA sweep**: remove Agents-SDK/multi-agent overclaims; harden `/api/analyst` (server-side canonical context, rate limit, origin allowlist, size cap, prompt tightening); add before/after + Codex + third-party docs; correct Devpost/video; P1 copy + nav | `api/analyst.js`, 4 demo pages, `README.md`, `DEVPOST.md`, `VIDEO_SCRIPT.md`, new docs | — | this file + QA report |

¹ See `CODEX_BUILD_LOG.md` for Codex session detail. Where a row is marked "yes," Codex contributed to code generation, dataset creation, and/or debugging during that work. See CODEX_BUILD_LOG.md for the verified and redacted Codex session evidence.

## Timeline summary
- **Concept → live in ~2 days.** Started as an isolated demo branch (zero risk to the live v11 STAKD product), ended as a live, GPT-5.6 Sol-powered reasoning layer served at `brik.mystakd.com` plus a native in-app BRIK Coach verified in the iOS Simulator.
- **Branch:** `brik-buildweek-demo` (dated history in `git log`).
- **Public repo:** https://github.com/BeamLTD/brik-buildweek
