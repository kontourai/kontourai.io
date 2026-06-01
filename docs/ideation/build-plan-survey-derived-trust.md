# Build Plan: Survey + Surface Claim Dependencies

Status: historical plan, partially shipped. Companion to
`surface-derived-trust-primitives.md`.

Current terminology: **Survey is the producer-side contract for turning producer
observations into Surface-ready `TrustInput`; Surface owns Claim Dependency
semantics.** Earlier drafts used "derived trust" and "derived claim"; read those
as Surface Claim Dependency behavior, not a Survey-branded concept or separate
claim kind.

## Goal

Build **Survey** (producer observations → Surface `TrustInput`) as a foundation
package, extend **Surface** with multi-hop Claim Dependency behavior, then prove
both by shipping the regulated vertical and validating genericity with the sales
vertical. The platform becomes three generic pieces — **Survey → Surface → Flow**
— plus Veritas and the verticals, all consuming rather than rebuilding.

Non-negotiable boundary, from the primitives note: **provenance, not veracity.** These bound and
trace confidence; they do not manufacture correctness at the leaves.

Shared format convention: new portable Survey, Surface, Flow, and Veritas records should follow
the [Kontour Resource Shape](kontour-resource-shape.md). This is especially relevant for Survey
review records and Surface integrity anchors: Survey can prove that its review trail was emitted
and not silently changed, while Surface can store and expose the generic integrity anchor without
claiming the underlying domain value is true.

## Why Claim Dependency Semantics Are Surface, Not Survey

The test for a standalone product: does it cross a boundary Surface refuses to cross, and does it
have its own extensibility surface?

- **Survey passes.** Input is raw, non-Surface material; output is Surface
  `TrustInput`. It crosses the exact boundary Surface disclaims: producers
  collect and interpret their own evidence. Survey generalizes the producer-side
  source → extraction → candidate → review chain.
- **Claim Dependency semantics fail both.** Input and output are Surface
  **Claims** — the relationship never leaves Surface's vocabulary. There is no
  domain-plugin surface; the methods (sum / max / model / rule-application) are
  generic and few. Surface already derives across claims: Claim Groups roll
  claims up, Trust Snapshots derive status from evidence, and freshness
  propagates. Multi-hop dependency propagation plus recompute pressure is the
  generalization of what Surface already does, not a foreign concern.

**The one real seam (packaging, not product).** If recompute-on-change needs a long-running
stateful watcher rather than Surface's current on-demand report model, that is a genuine runtime
difference. Handle it as an **optional `@kontourai/surface-derive` package** (or a recompute mode
within Surface) so Surface core stays small and the heavier graph/recompute code is opt-in —
without minting a separate product brand.

## Repo and product inventory

| Repo / product | State | Role in this plan |
| --- | --- | --- |
| `kontourai/surface` (@kontourai/surface) | shipped | Owns Claim Dependency fields (`derivedFrom`, `derivationEdges`), dependency status ceilings, freshness cascade, recompute pressure, and trust reports. |
| `kontourai/survey` (@kontourai/survey) | shipped | Producer-side source → extraction → candidate → review contracts, projection to Surface `TrustInput`, field/repeated observation helpers, raw source helpers, and contract fixtures. |
| `kontourai/flow` (@kontourai/flow) | shipped | Can consume Survey-produced `TrustInput` and Surface claims as gate evidence. Not on the critical path. |
| `kontourai/veritas` (@kontourai/veritas) | shipped | Already projects Repo Standards → Surface Claim Groups, requirements → claims. Becomes an early **Claim Dependency** proof: a readiness verdict is a claim that depends on requirement claims. |
| `kontourai/flow-agents` | private, soon | Consumes Flow. Out of scope. |
| `kontourai/kontourai.io` | shipped | Public story. Updates only after the products are real. |
| Regulated-document workflow proof | exists | Has `ExtractedFact → ResolvedFact → VerifiedFact` + managed-rules + `.veritas`. **Survey L1 largely exists here** — primary harvest source. Becomes the regulated vertical. |
| public-directory-data (private) | exists | Has `crawl → proposal → field-source → attestation`. The *second, independent* instance of the Survey pipeline — the evidence Survey is a reusable product, and a genericity check. |

The public-directory and regulated-document proof paths independently invented the same ingestion pipeline. That convergence is why Survey is a product, not a per-vertical feature.

## Product: Survey (producer observations → Surface `TrustInput`)

The producer-side contract. Turns raw, messy, untrusted input into Surface-ready
claims, evidence, and events with provenance.

**Owns**
- Source ingestion with stable identity (checksum, source path/URL, fetch time).
- Extraction: parse values with a locator (page/line/field), confidence, method. Domain
  extractors (regulated forms, CRM signals, crawlers) are **plugins**.
- Candidate sets: group possible values, select a candidate, and expose Candidate
  Conflict before projection.
- Review outcomes: record producer review status and authority.

**Boundary**
- Surface says producers collect their own evidence — so this is out of Surface's scope *by
  design*. Survey is that producer, generalized.
- Output contract = Surface `TrustInput`: Claim + Evidence (with `method` and
  source locator) + VerificationEvent. Survey does not store long-term trust
  state or decide truth; it hands producer-shaped input to Surface.

**Plugin contract (the extensibility seam)**
```
SourceAdapter   ingest(rawRef) -> RawSource{ id, checksum, fetchedAt, locatorScheme }
Extractor       extract(RawSource) -> Extraction[]{ target, value, locator, confidence, method }
Resolver        resolve(Extraction[]) -> CandidateSet{ candidates, selectedCandidateId, status }
ReviewPolicy    gate(CandidateSet) -> ReviewOutcome{ status, actor, reviewedAt }
```
Regulated-document workflows ship form extractors; sales workflows ship signal extractors; the resolution/review machinery is
shared. This is the split the regulated-document and public-directory proofs already converged on.

## Surface Capability: Claim Dependencies

Multi-hop claim graph and recompute pressure in Surface.

**Adds**
- Claim Dependency edges: `Claim ← [input Claims] via method` (sum / max /
  model / rule-application — typed and inspectable).
- Weakest-link status propagation (no numeric scores).
- Freshness cascade: an input going `stale` or `superseded` creates downstream
  recompute or review pressure.
- Recompute-on-change: re-run the method, diff, emit a "what changed" record.
- Counterfactual query: "if this input flips, which conclusions flip?"

**Stays consistent with Surface's constraints**: computed values are normal
Surface claims with `derivedFrom` or `derivationEdges`; single-hop consumers
ignore the edge graph and see ordinary claims. No numeric scores.

## End-to-end data flow (regulated-document vertical, concrete)

```
source document PDF ──Survey RawSource──────► RawSource(checksum)
        ──Survey Extraction─────► Extraction(box1=$X, locator=page1/box1, confidence)
        ──Survey CandidateSet───► CandidateSet (source document vs prior-year vs paystub candidates)
        ──Survey ReviewOutcome──► ClaimTarget  ──► Surface TrustInput claim.regulated.wages = $X
                                                     Evidence{ method, source=source document page1/box1 }
Surface claim ──Claim Dependency──► claim.regulated.position.band  (rule-application)
              ──Claim Dependency──► claim.regulated.strategy.adjustment     (model: band + balances)
Corrected source document lands ──► Survey emits corrected producer observation ──► Surface claim updated/stale
                    ──► Surface freshness cascade ──► band + adjustment flagged stale
                    ──► recompute ──► change report: "strategy impact $2,100 -> $1,650"
Advisor drills: strategy.adjustment ──► band ──► amount ──► source document page1/box1   (full lineage)
```

Sales is the same skeleton with different plugins: signal adapters instead of form extractors,
`deal-state`/`forecast` derivation methods instead of derived compliance positions, freshness cascade producing
"confidence decays because the champion fact is 40 days old."

## What each vertical owns vs. consumes (keeps verticals thin)

- **Regulated advisory** consumes Survey + Surface (incl. Claim Dependencies) + Veritas; owns the official-rule spine,
  domain derivation logic, materiality materiality calibration, advisor review + reporting UX.
- **Sales** consumes Survey + Surface; owns deal-state/forecast models, deal-value materiality
  calibration, RevOps/CFO audit + forecast UX.

The moat is what the vertical owns (domain logic + data spine), not the generic engines.

## Surface bake-ins (small, ship first)

Minor version on `surface` before Survey/verticals depend on them:
- Support-strength edge (cited vs. entails) — refines `Evidence.method` + `unsupported_inference`.
- `assumed` status — beside unknown/proposed/verified; taints downstream through
  Claim Dependency edges.
- Materiality slot — ordinal (not numeric), populated by verticals.

## Build sequence

Decision: **extract-after-proof, with up-front discipline.** Build the first vertical end-to-end,
but keep Survey a separate internal package and Claim Dependencies behind a clean Surface API from
day one, so promoting Survey to its own repo is mechanical. Use the second vertical to validate the
generic boundary before locking public APIs.

First vertical = **regulated documents**: the regulated-document proof already implements most of Survey L1 and carries governance evidence;
sales L1 is greenfield against ~80%-bad data. Regulated-document workflows de-risk Survey; sales proves genericity.

- **Phase 0 — Surface bake-ins.** support-strength, `assumed`, materiality. Lowest risk.
- **Phase 1 — Survey, internal package.** Lift `ExtractedFact → ResolvedFact → VerifiedFact` out
  of the regulated-document proof into a `survey` package with the plugin contract; regulated form extractors first. Output
  verified claims into Surface. Acceptance: a source document yields a Surface claim with a drillable locator.
- **Phase 2 — Surface Claim Dependencies.** Edge graph + propagation + freshness cascade + recompute
  (core or `surface-derive`). First edges: derived compliance positions from facts. Acceptance: changing a fact
  auto-stales a position and recompute emits a change record. Validate against **Veritas
  readiness-as-dependent-claim** as a cross-domain sanity check before regulated-think calcifies.
- **Phase 3 — Regulated vertical.** Rule spine + L2/L3 logic + advisor review UX. Acceptance: the full flow
  above, including "which recommendations changed and by how much" on a corrected source document.
- **Phase 4 — Extract Survey to a standalone product.** Promote `survey` to its own repo / npm
  package with a stable public API. Gate: nothing domain-specific leaks.
- **Phase 5 — Sales vertical.** Build on standalone Survey + Surface; every change sales forces in
  the shared layers is a genericity bug to fix there.
- **Phase 6 — Public story.** Update `kontourai.io` to the three-piece architecture only once the
  products are real and the website tests are wired into CI.

## Packaging

- Repo `kontourai/survey`, npm `@kontourai/survey`, TypeScript (match `surface`), Apache-2.0.
- Claim Dependency recompute runtime ships within `surface` or as `@kontourai/surface-derive`; decide in Phase 2 based
  on whether recompute needs a long-running watcher.
- `.veritas`-governed from the start (dogfood).
- Keep the website's `scripts/validate.mjs` advertised-version check in mind if these surface
  on the site.

## Risks and open decisions

- **Genericity leak**: extracting Survey after a single vertical risks baking regulated assumptions in.
  Mitigation: the Phase 5 second-vertical gate; do not 1.0 the public API until sales runs on it
  unchanged.
- **`surface-derive` packaging** (open): in-core vs. separate package — decided in Phase 2 by the
  recompute-runtime question (on-demand report vs. stateful watcher).
- **Provenance ≠ correctness** enforced in UX, not just docs — computed outputs always show leaf
  evidence, never a bare conclusion.
- **Dependency noise**: unchecked propagation makes "everything stale." Materiality is the
  throttle; needs a real policy in Phase 2.

## Naming

Topographic theme: "Kontour" = contour lines, which reveal the hidden 3-D structure behind a flat
surface — "show the work behind AI." `surface` (terrain) and `flow` (water across it) fit;
`veritas` is the deliberate outlier.

- **Survey** (new product, was "Curation") — surveyors turn raw field measurements into
  disciplined producer observations; exact match for raw source → reviewed claim input, and a real
  verb. Lowercase to match. **Recommended and accepted.**
- Claim Dependency behavior needs no product name — it is a Surface capability. If the optional package ships,
  `@kontourai/surface-derive` is descriptive and theme-neutral, which is appropriate for a
  sub-package rather than a brand.
