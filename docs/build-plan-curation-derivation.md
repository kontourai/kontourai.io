# Build Plan: Curation and Derivation

Status: plan. Not shipped. Companion to `surface-derived-trust-primitives.md`.
Working names are **Curation** and **Derivation**; see "Naming" for themed
candidates (Survey / Gradient).

## Goal

Build the two generic foundation products identified in the primitives note, then prove them by
shipping the tax vertical on top, then validate genericity with the sales vertical. The platform
becomes four generic pieces — **Curation → Surface → Derivation → Flow** — that verticals consume
rather than rebuild.

The non-negotiable boundary, repeated from the primitives note: **provenance, not veracity.**
These products bound and trace confidence; they do not manufacture correctness at the leaves.

## Repo and product inventory

What exists today and what each contributes to or consumes from the two new products.

| Repo / product | State | Role in this plan |
| --- | --- | --- |
| `kontourai/surface` (@kontourai/surface v0.4.1, TS) | shipped | Stores/exposes single-hop claims, evidence, freshness, gaps. Receives a small set of bake-in additions (support-strength edge, `assumed` status, materiality slot). Stays single-hop and generic. |
| `kontourai/flow` (@kontourai/flow v0.1.0) | shipped | Process gates. Can consume Curation-verified facts and Derivation outputs as gate evidence. Not on the critical path. |
| `kontourai/veritas` (@kontourai/veritas v0.4.0, JS) | shipped | Already projects Repo Standards → Surface Claim Groups and requirements → claims. Becomes an early **Derivation** proof: a readiness verdict is a claim derived from requirement claims. |
| `kontourai/flow-agents` | private, soon | Consumes Flow. Out of scope here. |
| `kontourai/kontourai.io` | shipped | Public story. Updates only after the products are real. |
| `taxes` (private) | exists | Has `ExtractedFact → ResolvedFact → VerifiedFact` + managed-rules + `.veritas`. **Curation L1 largely exists here** — primary harvest source. Becomes the tax vertical. |
| public-directory-data (private) | exists | Has `crawl → proposal → field-source → attestation`. The *second, independent* instance of the Curation pipeline — the evidence that Curation is a reusable shape, and a genericity check. |

The two repos that independently invented the same ingestion pipeline (`taxes` and
public-directory-data) are why Curation is a product, not a per-vertical feature.

## Product 1: Curation (raw → verified claims)

The L1 engine. Turns raw, messy, untrusted input into verified claims with provenance.

**Owns**
- Source ingestion with stable identity (checksum, source path/URL, fetch time).
- Extraction: parse values from a source with a locator (page/line/field), confidence, and
  method. Domain extractors (tax forms, CRM signals, crawlers) are **plugins**.
- Candidate resolution: dedupe, rank by source type/confidence, detect conflicts.
- Promotion ladder: `extracted → resolved → verified`, with a human-review / attestation loop.

**Boundary**
- Surface says producers collect their own evidence — so this is out of Surface's scope *by
  design*. Curation is that producer, generalized.
- Output contract = Surface `TrustInput`: a Claim + Evidence (with `method` and a source locator)
  + status. Curation never stores long-term trust state itself; it hands verified claims to
  Surface.

**Plugin contract (the extensibility seam)**
```
SourceAdapter   ingest(rawRef) -> RawSource{ id, checksum, fetchedAt, locatorScheme }
Extractor       extract(RawSource) -> Extraction[]{ target, value, locator, confidence, method }
Resolver        resolve(Extraction[]) -> Candidate set -> ResolvedValue{ winner, why, conflicts }
ReviewPolicy    gate(ResolvedValue) -> auto-verify | needs-review | attest
```
Tax ships form extractors; sales ships signal extractors; the resolution/review machinery is
shared. This is the exact split the `taxes` and public-directory repos already converged on.

## Product 2: Derivation (claims → derived claims)

The multi-hop trust graph and recompute runtime.

**Owns**
- Derivation edges: `derivedClaim ← [inputClaims] via method` (sum / max / model /
  rule-application — typed and inspectable).
- Weakest-link status propagation (no numeric scores).
- Freshness cascade: an input going `stale` flips its derived claims to `stale` (recompute due).
- Recompute-on-change: re-run the method, diff the result, emit a "what changed" record.
- Counterfactual query: "if this input flips, which conclusions flip?"

**Boundary**
- Surface stays single-hop: it stores claims and direct evidence. Derivation **owns the edge
  graph** (referencing Surface claim IDs) and writes derived claims *back into Surface* as normal
  claims whose Evidence points at the derivation. Surface does not need to know a claim is derived
  except through that evidence pointer.
- Input = Surface claims. Output = Surface claims (the derived ones) + a change report.

**Why a separate product, not a Surface extension**: a graph + recompute engine is a different
concern from a small, inspectable claim schema. Keeping them apart honors "Surface remains generic
and small."

## End-to-end data flow (tax vertical, concrete)

```
W-2 PDF ──Curation.SourceAdapter──► RawSource(checksum)
        ──Curation.Extractor──────► Extraction(box1=$X, locator=page1/box1, conf, method=extraction)
        ──Curation.Resolver───────► ResolvedValue (W-2 vs prior-year vs paystub candidates)
        ──Curation.ReviewPolicy───► VerifiedClaim  ──► Surface stores claim.tax.wages = $X
                                                        Evidence{ method, source=W-2 page1/box1 }
Surface claim ──Derivation edge──► claim.tax.position.bracket  (rule-application)
              ──Derivation edge──► claim.tax.strategy.roth     (model, depends on bracket + balances)
Corrected W-2 lands ──► Curation re-verifies wages ──► Surface claim updated/stale
                    ──► Derivation freshness cascade ──► bracket + roth flagged stale
                    ──► recompute ──► change report: "Roth saving $2,100 → $1,650"
RIA drills: strategy.roth ──► bracket ──► wages ──► W-2 page1/box1   (full lineage)
```

Sales is the same skeleton with different plugins: signal adapters instead of form extractors,
`deal-state` and `forecast` derivation methods instead of tax positions, freshness cascade
producing the "confidence decays because the champion fact is 40 days old" behavior.

## What each vertical owns vs. consumes (keeps verticals thin)

- **Tax** consumes Curation + Surface + Derivation + Veritas; owns the IRS-rule spine,
  tax-domain derivation logic, tax-dollar materiality calibration, RIA/CPA review + reporting UX.
- **Sales** consumes Curation + Surface + Derivation; owns deal-state/forecast models, deal-value
  materiality calibration, RevOps/CFO audit + forecast UX.

The moat is what the vertical owns (domain logic + data spine), not the generic engines.

## Surface bake-ins (small, ship first)

Minor version on `surface` before the new products depend on them:
- Support-strength edge (cited vs. entails) — refines `Evidence.method` + `unsupported_inference`.
- `assumed` status — beside unknown/proposed/verified; taints downstream via a derivation edge.
- Materiality slot — ordinal (not numeric), populated by verticals.

## Build sequence

Decision: **extract-after-proof, with up-front discipline.** Build the first vertical end-to-end,
but architect Curation and Derivation as separate internal packages from day one (monorepo or
clear package boundaries), so promoting them to standalone repos is mechanical, not a rewrite. Use
the second vertical to validate the generic boundary before locking public APIs.

First vertical = **tax**, because `taxes` already implements most of Curation L1 and carries
`.veritas`; sales L1 is greenfield against ~80%-bad data. Tax de-risks Curation; sales then proves
genericity.

- **Phase 0 — Surface bake-ins.** Ship support-strength, `assumed`, materiality. Unblocks both
  products. Lowest risk.
- **Phase 1 — Curation, internal.** Lift the `ExtractedFact → ResolvedFact → VerifiedFact`
  pipeline out of `taxes` into a `curation` package with the plugin contract above; tax form
  extractors as the first plugin. Output verified claims into Surface. Acceptance: a W-2 produces
  a Surface claim with a drillable source locator.
- **Phase 2 — Derivation, internal.** Edge graph + propagation + freshness cascade + recompute,
  reading/writing Surface claims. First edges: tax positions from facts. Acceptance: changing a
  fact auto-stales a position and recompute emits a change record. Validate against Veritas
  (readiness-as-derived-claim) as a non-tax sanity check.
- **Phase 3 — Tax vertical.** Domain rule spine + L2/L3 derivation logic + RIA review UX on top.
  Acceptance: the end-to-end flow above, including "which recommendations changed and by how much"
  on a corrected W-2.
- **Phase 4 — Extract to standalone products.** Promote `curation` and `derivation` to their own
  repos/npm packages with stabilized public APIs. Gate: their interfaces are clean enough that
  nothing tax-specific leaks.
- **Phase 5 — Sales vertical.** Build on the now-standalone products; treat every place sales
  needs a Curation/Derivation change as a genericity bug to fix in the shared layer.
- **Phase 6 — Public story.** Update `kontourai.io` to the four-piece architecture only once the
  products are real and the website tests are wired into CI.

## Packaging

- New repos `kontourai/<curation>` and `kontourai/<derivation>`, npm `@kontourai/*`, TypeScript
  (match `surface`), Apache-2.0 (matches the site footer / org license).
- Each `.veritas`-governed from the start (dogfood; they are exactly the kind of brittle,
  high-trust code Veritas is for).
- Versioning: keep the website's `scripts/validate.mjs` advertised-version check pattern in mind
  if these ever appear on the site.

## Risks and open decisions

- **Genericity leak**: extracting after a single vertical risks baking tax assumptions into the
  "generic" layer. Mitigation: the second-vertical gate in Phase 5; do not 1.0 the public API
  until sales runs on it unchanged.
- **Curation packaging timing** (open): standalone package in Phase 1, or grow inside `taxes`
  until Phase 4? Leaning standalone-internal early so the seam is honest.
- **Provenance ≠ correctness** must be enforced in UX, not just docs — derived outputs should
  always show the leaf evidence, never a bare conclusion.
- **Derivation noise**: unchecked propagation makes "everything stale." Materiality is the
  throttle; needs a real policy in Phase 2.
- **Build-up-front vs. extract** is settled as extract-after-proof; revisit only if Phase 1 shows
  the `taxes` pipeline is already clean enough to lift wholesale.

## Naming

Theme read: the line is **topographic / cartographic** — "Kontour" is contour lines, and contour
lines reveal the hidden 3-D structure behind a flat surface, which is precisely "show the work
behind AI." `surface` (the terrain) and `flow` (water across it) fit; `veritas` is the deliberate
outlier (the truth/verification product). Lowercase styling like the others.

Recommended themed names:
- **Curation → `survey`.** Surveyors take raw field measurements and produce authoritative,
  verified records — an exact semantic match for raw → verified claims, and a real verb users say.
  Alt: `strata` (raw sediment compacting into verified geological layers; evocative but less
  obviously "ingestion").
- **Derivation → `gradient`.** Double meaning: the mathematical derivative (derivation) *and* the
  topographic gradient derived from contour spacing. Alts: `relief` (the derived 3-D terrain from
  flat contours — strongest "reveal the hidden structure" reading, but overloaded everyday word),
  `watershed` (hydrology: an upstream change cascades downstream — captures recompute, but long).

Working names (Curation / Derivation) are used throughout this plan; a rename is a cheap pass once
chosen.
