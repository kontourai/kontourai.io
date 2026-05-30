# Tax Strategy Platform (Provenance-First)

- Source: internal product exploration; builds on the private `taxes` repo (see
  `2026-04-25-taxes.md`).
- Date analyzed: 2026-05-29
- Workflow archetype: High-stakes fact verification; compliance and audit evidence
- Entry type: curate→derive vertical (built on Surface derived-trust primitives)
- Kontour fit: Veritas high, Surface high

## Concept

Three layers, each built on the layer below, with every output carrying an inspectable
evidence chain:

- L1: raw documents → verified tax facts (the `taxes` repo already does this).
- L2: verified facts → tax positions (this deduction applies, this credit qualifies,
  effective rate = X), each citing facts + the governing rule + the calculation.
- L3: positions → strategy ("convert $12k to Roth to save $2,100," "you are over-withholding
  by $4k"), each citing the positions it rests on.

The differentiator is end-to-end lineage plus derived-trust invalidation: change the W-2 and
every downstream position and recommendation auto-flags as stale, and a user or auditor can
drill from a recommendation down to the source-document line and the IRS rule.

## Competitive landscape (researched 2026-05-29)

- **Consumer filing** (TurboTax, H&R Block, FreeTaxUSA): compliance engines, not planning;
  reactive nudges only.
- **Embedded tax** (Column Tax, april — april raised $38M July 2025, powers Acorns/Mercury):
  closest to live-data-into-nudges; still black-box on *why*.
- **Pro planning** (Holistiplan, Corvee, Keeper; retirement: MaxiFi, Boldin, Income Lab):
  Holistiplan OCRs a 1040 and flags strategies; MaxiFi/Boldin already do multi-year
  Roth-ladder recompute when income changes.
- **AI tax assistants** (Bizora, TaxGPT, CoCounsel Tax): already advertise citation to IRC,
  regs, rulings, and case law.

## Where the gap actually is

Be honest: two of three differentiators are partly commoditized.

- "Cite the IRS rule" — already done by Bizora/TaxGPT/CoCounsel.
- "Auto-recompute downstream when a fact changes" — already done *within a domain* by
  MaxiFi/Boldin.

What is genuinely unshipped is the **end-to-end provenance graph** that links a specific
source-document line (W-2 Box 1) → verified fact → derived position → recommendation, such
that changing the fact auto-stales the recommendation. AI tools cite the rule but not your
W-2; planners recompute but are black-box on lineage; embedded players ingest data but do not
show why. Nobody stitches document-provenance + rule-provenance + derived-trust invalidation
into one inspectable lineage. Real gap, but narrower than the original pitch.

This maps directly to the derived-trust primitives: derivation edge, freshness-as-state,
support-strength (rule actually supports the position), held assumption, materiality.

## Demand signals

- Market: US tax-prep services ~$34.9B (2025), ~5.8% CAGR.
- Regulatory tailwind: IRS Direct File cancelled for 2026 — the free-gov-filing threat
  receded.
- The wedge-shaped pain: AI tax distrust. ~50% of complex AI tax advice estimated wrong; no
  IRS safe harbor; the filer/preparer owns the error. IRC §6694 preparer penalties ($635/return
  for 2025) plus substantiation exposure make a defensible evidence trail professionally
  valuable.

## Verdict: gap-vs-demand

Provenance is a real wedge, but as a **trust-and-defensibility feature for professionals**,
not a consumer headline. Consumers do not drill into IRS code (94% Direct File satisfaction
was about simplicity). The honest demand mechanism: the AI-tax wave created a
hallucination/liability crisis, and provenance is the credible answer to "can I trust this
enough to put my name on it."

Sharpest initial buyer: **RIAs/wealth managers, then CPAs/EAs** — not consumers. RIAs already
pay for tax-aware planning (Holistiplan/Boldin proved it), make Roth-grade recommendations
daily, and need defensible documentation for fiduciary/compliance reasons.

## Where it is weak

- Differentiator erosion: rule-citation and what-if recompute already exist; the sale is the
  *integration* of provenance, harder to demo and easy to dismiss as "we already do that."
- The hard part is the data spine, not the UX: reliable document→fact extraction (Holistiplan
  still needs human OCR review) plus a maintained, machine-linkable, annually-changing map of
  IRS rules. This is also the moat.
- Provenance ≠ correctness: a verifiable chain to a wrong extracted fact is still wrong.
- Channel: april/Column own embedded distribution; incumbents own the filing relationship.
  Risk of being an acquired feature, not a company.

## Product boundaries (owns vs. consumes)

This vertical should be thin — domain rules and review UX over generic foundation pieces (see
`surface-derived-trust-primitives.md`). What it owns vs. consumes:

- **Consumes Survey** for L1: document ingestion, form extraction, fact resolution, and the
  human-review loop. The tax-form extractors are domain plugins; the resolution/review machinery
  is shared.
- **Consumes Surface** to store and expose verified facts and their provenance, and (via Surface
  derived trust) for L2→L3: positions and recommendations as derived claims, with weakest-link
  propagation and auto-stale on input change.
- **Consumes Veritas** to govern its own brittle code and the annual rule-change workflow
  (`.veritas` already present in the repo).
- **Owns** (the actual product): the IRS-rule spine (machine-linkable, annually maintained), the
  tax-domain derivation logic (positions, strategies), materiality calibration for tax dollars,
  and the RIA/CPA-facing review and reporting experience.

The moat lives in what it owns — the rule spine and domain logic — not in the foundation it
consumes. See `2026-04-25-taxes.md` for the existing claim/evidence modeling this builds on.

## Follow-up questions

- Can the RIA-facing "show-your-work + auto-stale-flagging" slice ship before the full strategy
  engine?
- How much of the IRS-rule spine can be sourced from the existing `taxes` managed-rules work?
- What is the minimum derivation depth that demonstrates auto-stale value to an RIA?
