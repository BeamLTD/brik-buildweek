# BRIK — Build Week specification

## Locked demo story

BRIK is STAKD's reasoning layer. STAKD's deterministic engine calculates Maya's money context; the crew explains, estimates, proposes, reviews, and communicates without changing or inventing figures.

### Persona

Maya uses a six-local-calendar-month synthetic ledger. Northstar Studio is stable income and Maya Creative is variable Venture income. Transfers are excluded through STAKD's real transfer logic.

### Metric

The only headline metric is **Monthly Keep Rate**:

`Monthly Keep Rate = (Built - Cuts) / Built`

For display as a percentage, the ratio is multiplied by 100. Current and historical values come from `buildInsightContext()` and `buildBrikContext()`.

### Verified Maya snapshot

- Built this month: $5,400
- Cuts this month: $3,600
- Kept this month: $1,800
- Monthly Keep Rate: 33.3%
- Previous Monthly Keep Rate: 50.0%
- Delta: -16.7 percentage points
- Biggest Cut: Housing, $1,550
- Top Venture: Northstar Studio, $4,200
- Goal: 45% Monthly Keep Rate
- Main category increases: Family +$470; Food +$420

### Crew

- **Analyst** explains why Monthly Keep Rate changed.
- **Oracle** presents clearly labeled scenario estimates, not production Monte Carlo.
- **Strategist** proposes practical moves, including setting aside 30% of the next variable Venture payout.
- **Guardian** reviews risk and reduces that proposal from 30% to 22% because income varies and obligations are upcoming.
- **BRIK** reconciles the review into exactly three weekly moves.

### Weekly moves

1. Protect 22% of the next Maya Creative payout — `CreateStak`.
2. Review Family Cuts — `CreateCut`.
3. Check the 45% Monthly Keep Rate goal — `SetGoal`.

All moves are proposed and user-triggered. The demo does not claim autonomous money movement, live bank connection, subscription cancellation, investment advice, or production forecasting.

## Demo surfaces

The Hub (`index.html`), Product Demo (`demo-design.html`), Reasoning Demo (`demo.html`), Blueprint (`build.html`), and native BRIK Coach use this same persona, metric, formula, crew, disagreement, and verified snapshot.
