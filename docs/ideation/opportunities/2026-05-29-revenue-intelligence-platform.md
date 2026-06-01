# Revenue Intelligence Platform (Forecasting with Receipts)

- Source: internal product exploration.
- Date analyzed: 2026-05-29
- Workflow archetype: AI recommendation trust; high-stakes fact verification
- Entry type: curate→derive vertical (built on Surface derived-trust primitives)
- Kontour fit: Veritas low-medium (governs the platform's own repo), Surface high

## Concept

Three layers, each built on the layer below:

- L1: raw signals (emails, calls, CRM, product usage, news) → verified account facts ("500
  seats," "champion left," "budget approved"), each with source + freshness.
- L2: facts → derived deal state ("qualified," "single-threaded risk," "stage = negotiation").
- L3: deal state → forecast ("70% to close this quarter; $1.2M pipeline, $400k at-risk because
  the champion facts are 40 days stale").

Differentiator vs. today's black-box forecasting: inspectable fact-level provenance plus a
forecast that **auto-degrades as its evidence ages**. A VP asks "why does the model think this
closes?" and drills to the underlying source-linked facts; deals whose last real signal is
stale flag automatically instead of sitting green until they slip.

## Competitive landscape (researched 2026-05-29)

- **Revenue intelligence / conversation**: Gong (AI Deal Predictor — a percentile rank, not a
  probability; surfaces single-threading/stall warnings), Chorus/ZoomInfo. Salesloft + Clari
  merged (Dec 2025) into one predictive stack — a strong signal the category is consolidating.
- **Forecasting**: Clari (category leader; ML deal-health; markets an "explainable view"),
  BoostUp/Terret, Aviso (markets "WinScore Insights" that "explains why a deal will or will not
  close"), InsightSquared/Mediafly, Outreach.
- **CRM-native**: Salesforce Einstein (opportunity scoring with positive/negative factor
  drivers; close-date prediction being retired), HubSpot.
- **Data/enrichment**: ZoomInfo, Apollo, Clay supply raw account facts. AI-SDR/agent startups
  (Rox $1.2B Mar 2026, Artisan, 11x) monitor accounts, but the autonomous-SDR narrative cooled;
  buyers reverted to hybrid by 2026.

## Where the gap actually is

Partial, not empty — every incumbent is on the doorstep.

- **Factor attribution exists everywhere; provenance does not.** Einstein/Clari/Gong/Aviso show
  *which factors* moved a score (engagement up, multi-threading down). None cleanly delivers
  "70% → click → these 6 atomic, source-linked facts."
- **Trust-decay is talked about, productized by none.** The pain is documented ("a champion left
  three weeks ago," "confidence scores should be backed by evidence, not black-box numbers"),
  but no vendor auto-degrades a forecast as a function of evidence age. Gong flags inactivity —
  adjacent but reactive, not a freshness-weighted confidence model.
- **The opaque-score problem is named**: buyer guides warn against "black-box scoring with no
  transparency"; reps ignore systems they do not understand; 40% cite data distrust as a top
  barrier.

So the wedge — inspectable fact-level provenance + freshness-decaying confidence — is genuinely
underserved as a *combined, first-class* mechanism. Maps directly to derivation edge,
freshness-as-state, support-strength, and materiality.

## Demand signals

- Distrust is structural: Gartner finds fewer than 50% of sales leaders/sellers have high
  confidence in forecast accuracy.
- The data-trust gap is quantified: ~50% of CROs trust their account data vs. ~80% of RevOps
  leaders calling it poor; only ~11% report excellent data. Sandbagging/wishcasting is the named
  failure mode.
- Market & WTP: revenue intelligence ~$5B (2025), ~12–20% CAGR. WTP is proven — Gong
  $30K–$100K+/yr (enterprise much higher); Clari priced above Gong. Buyers already pay six
  figures for forecasting.

## Verdict: gap-vs-demand

A real wedge, but narrow and defensible only if fast. Demand is unambiguous (sub-50% forecast
confidence, named black-box distrust, six-figure budgets), and the specific combination
(facts-with-receipts + freshness-decaying confidence) is unshipped today.

Be skeptical:

- **Feature, not obviously a platform.** Clari/Gong already own the data pipes, factor
  attribution, and freshness signals; "drill to evidence" + "decay on stale signals" is
  plausibly a 1–3 quarter roadmap item for them. Aviso already markets explainable WinScore.
- **The hard part is the verified-fact layer, not the UI.** Curating raw signals into trusted
  atomic facts at quality is the same extraction/verification problem RevOps already fails at
  (80% bad data). If the facts are wrong, the receipts make you more accountable for being
  wrong.
- **Consolidation risk**: standalone forecasting is being absorbed into suites (Clari+Salesloft).
  A point solution faces "why not wait for Clari to add it."

Sharpest initial buyer: **RevOps leader** — owns forecast accountability, already distrusts the
data, feels the black-box gap most, and is the technical buyer who values auditability. The
**CFO who hates forecast misses** is the budget-unlocking economic buyer and best messaging
angle ("a forecast you can audit"), but RevOps is the land-and-expand entry.

## Product boundaries (owns vs. consumes)

Like the regulated vertical, this should be thin over generic foundation pieces (see
`surface-derived-trust-primitives.md`):

- **Consumes Survey** for L1: ingest raw signals (emails, calls, CRM, usage, news) and resolve
  them into verified account facts. The signal extractors are domain plugins.
- **Consumes Surface** to store/expose the verified facts and their freshness, and (via Surface
  derived trust) for L2→L3: deal state and forecast as derived claims, with freshness-decaying
  confidence falling out of the freshness cascade.
- **Owns** (the product): the sales-domain derivation logic (deal-state and forecast models),
  materiality calibration for deal value/risk, and the RevOps/CFO-facing audit and forecast UX.

## Durable moat

Assume incumbents copy the drill-down UI within a year. The defensible moat is the
fact-verification/provenance graph it consumes (Survey's verified L1 facts + Surface's derivation
edges), plus the sales-domain logic it owns — not the UI. This is also why the generic Survey
product and Surface's derived-trust capability are worth building once and reusing across verticals
rather than rebuilding per product.

## Follow-up questions

- What is the cheapest reliable path to verified atomic account facts given that RevOps data is
  ~80% bad at the source?
- Can the product ride on top of an existing CI/CRM data layer rather than re-ingesting signals?
- Does "forecast you can audit" land better with RevOps or CFO in early conversations?
