# Accountability Ledger (Temporal Claims / Track Records)

- Source: internal product exploration.
- Date analyzed: 2026-05-29
- Workflow archetype: AI recommendation trust; reputation integrity
- Entry type: distinct-shape exploration → primitive candidate
- Trust-shape novelty: breaks the present-tense assumption (claims about the future, resolved
  later)

## Concept

Claims about the future are recorded with a resolution date and later auto-verified against what
actually happened, producing a verifiable track record per source ("this analyst's confident
calls hold 55%," "this agency missed its budget projection three years running"). Maps to the
`temporal / resolvable claim` primitive.

## Competitive landscape (researched 2026-05-29)

- **Forecasting / prediction markets** (Metaculus, Manifold, Polymarket, Kalshi): record dated
  claims and resolve them, but only inside their own walled-garden question format. Metaculus
  publishes per-user calibration; it does not grade a pundit's public statements.
- **Pundit/analyst accountability sites** (PunditTracker, PunditHawk, GuruCalls): the graveyard —
  passion projects, mostly dormant or closed.
- **Fact/promise trackers** (PolitiFact Obameter/Trump-O-Meter): gold standard for resolution but
  100% manual nonprofit journalism, per-subject.
- **Financial analyst trackers** (TipRanks): the one genuine commercial success — auto-tracks
  ~96k experts because stock calls have a machine-readable resolution source (price) and a
  high-WTP retail audience.
- **Verifiable-credential plumbing** (W3C VCs, Ceramic, UMA optimistic oracle; ForecastBench
  auto-resolving LLM forecasts): the primitive exists in isolation, unassembled into a reputation
  product.

## Verdict: cool primitive, treacherous monetization

The gap is real — no one offers track-record-as-infrastructure with portable, inspectable
evidence ("no Stripe for track records"). But the gap exists *because* it is hard to monetize:

- Resolution is cheap only where claims auto-resolve (stocks → TipRanks); strategic/political
  claims need human adjudication (PolitiFact stays nonprofit).
- High-WTP buyers are domain-specific (investors → finance), pushing you toward a vertical, not
  horizontal infra.
- Horizontal buyers (journalists, watchdogs) are public-good actors with no budget — the literal
  PunditTracker death.
- Subjects do not want to be scored, so coverage is adversarially sourced (cost + dispute
  liability).

Only two viable paths: AI-forecast evaluation-as-a-service (labs have budget, auto-resolvable) or
a finance-adjacent "verify any analyst's public calls" API. The pure domain-agnostic portable
reputation layer is a venture trap.

## Disposition

Keep `temporal / resolvable claim` as a Surface primitive (see
`surface-derived-trust-primitives.md`). Do not pursue the horizontal product; revisit only as a
vertical with auto-resolvable claims and a deep-pocketed buyer.
