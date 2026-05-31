# Build Plan: Survey + Derived Trust

Status: plan. Not shipped. Companion to `surface-derived-trust-primitives.md`.

This plan reflects a refinement of the primitives note: **Survey is a standalone product;
derived trust (formerly "Derivation") is a capability of Surface, not a separate product.** See
"Why derived trust is Surface, not a product" below.

## Goal

Build **Survey** (raw → verified claims) as a new foundation product, extend **Surface** with
multi-hop derived trust, then prove both by shipping the tax vertical, then validate genericity
with the sales vertical. The platform becomes three generic pieces — **Survey → Surface → Flow** —
plus Veritas and the verticals, all consuming rather than rebuilding.

Non-negotiable boundary, from the primitives note: **provenance, not veracity.** These bound and
trace confidence; they do not manufacture correctness at the leaves.

## Why derived trust is Surface, not a product

The test for a standalone product: does it cross a boundary Surface refuses to cross, and does it
have its own extensibility surface?

- **Survey passes.** Input is raw, non-Surface material; output is Surface claims. It crosses the
  exact boundary Surface disclaims ("producers collect their own evidence" — Survey *is* that
  producer, generalized). It has a real plugin ecosystem (a different extractor per domain).
  People adopt Survey as a thing.
- **Derived trust fails both.** Input and output are *both* Surface's native Claim type — it never
  leaves Surface's vocabulary. There is no domain-plugin surface; the methods (sum / max / model /
  rule-application) are generic and few. And Surface already derives across claims: Claim Groups
  roll claims up, Trust Snapshots derive status from evidence, freshness already propagates.
  Multi-hop derivation + a freshness cascade is the *generalization of what Surface already does*,
  not a foreign concern. Nobody adopts it separately; they adopt Surface and turn on derived
  claims.

**The one real seam (packaging, not product).** If recompute-on-change needs a long-running
stateful watcher rather than Surface's current on-demand report model, that is a genuine runtime
difference. Handle it as an **optional `@kontourai/surface-derive` package** (or a recompute mode
within Surface) so Surface core stays small and the heavier graph/recompute code is opt-in —
without minting a separate product brand.

## Repo and product inventory

| Repo / product | State | Role in this plan |
| --- | --- | --- |
| `kontourai/surface` (@kontourai/surface v0.4.1, TS) | shipped | Gains derived-trust (multi-hop edges, freshness cascade, recompute) plus the bake-ins (support-strength edge, `assumed` status, materiality slot). Heavy graph/recompute code may live in an optional `surface-derive` package. |
| `kontourai/flow` (@kontourai/flow v0.1.0) | shipped | Can consume Survey-verified facts and Surface derived claims as gate evidence. Not on the critical path. |
| `kontourai/veritas` (@kontourai/veritas v0.4.0, JS) | shipped | Already projects Repo Standards → Surface Claim Groups, requirements → claims. Becomes an early **derived-trust** proof: a readiness verdict is a claim derived from requirement claims. |
| `kontourai/flow-agents` | private, soon | Consumes Flow. Out of scope. |
| `kontourai/kontourai.io` | shipped | Public story. Updates only after the products are real. |
| `taxes` (private) | exists | Has `ExtractedFact → ResolvedFact → VerifiedFact` + managed-rules + `.veritas`. **Survey L1 largely exists here** — primary harvest source. Becomes the tax vertical. |
| public-directory-data (private) | exists | Has `crawl → proposal → field-source → attestation`. The *second, independent* instance of the Survey pipeline — the evidence Survey is a reusable product, and a genericity check. |

The two repos that independently invented the same ingestion pipeline (`taxes` and
public-directory-data) are why Survey is a product, not a per-vertical feature.

## Product: Survey (raw → verified claims)

The L1 engine. Turns raw, messy, untrusted input into verified claims with provenance.

**Owns**
- Source ingestion with stable identity (checksum, source path/URL, fetch time).
- Extraction: parse values with a locator (page/line/field), confidence, method. Domain
  extractors (tax forms, CRM signals, crawlers) are **plugins**.
- Candidate resolution: dedupe, rank by source type/confidence, detect conflicts.
- Promotion ladder: `extracted → resolved → verified`, with a human-review / attestation loop.

**Boundary**
- Surface says producers collect their own evidence — so this is out of Surface's scope *by
  design*. Survey is that producer, generalized.
- Output contract = Surface `TrustInput`: Claim + Evidence (with `method` and source locator) +
  status. Survey does not store long-term trust state; it hands verified claims to Surface.

**Plugin contract (the extensibility seam)**
```
SourceAdapter   ingest(rawRef) -> RawSource{ id, checksum, fetchedAt, locatorScheme }
Extractor       extract(RawSource) -> Extraction[]{ target, value, locator, confidence, method }
Resolver        resolve(Extraction[]) -> Candidate set -> ResolvedValue{ winner, why, conflicts }
ReviewPolicy    gate(ResolvedValue) -> auto-verify | needs-review | attest
```
Tax ships form extractors; sales ships signal extractors; the resolution/review machinery is
shared. This is the split the `taxes` and public-directory repos already converged on.

## Surface capability: derived trust

Multi-hop trust graph and recompute, added to Surface (core or `surface-derive` package).

**Adds**
- Derivation edges: `derivedClaim ← [inputClaims] via method` (sum / max / model /
  rule-application — typed and inspectable).
- Weakest-link status propagation (no numeric scores).
- Freshness cascade: an input going `stale` flips its derived claims to `stale` (recompute due).
- Recompute-on-change: re-run the method, diff, emit a "what changed" record.
- Counterfactual query: "if this input flips, which conclusions flip?"

**Stays consistent with Surface's constraints**: derived claims are normal Surface claims whose
Evidence points at the derivation; single-hop consumers ignore the edge graph and see ordinary
claims. No numeric scores. Base schema stays small; the recompute runtime is the part that may be
optional/packaged separately.

## End-to-end data flow (tax vertical, concrete)

```
W-2 PDF ──Survey.SourceAdapter──► RawSource(checksum)
        ──Survey.Extractor──────► Extraction(box1=$X, locator=page1/box1, conf, method=extraction)
        ──Survey.Resolver───────► ResolvedValue (W-2 vs prior-year vs paystub candidates)
        ──Survey.ReviewPolicy───► VerifiedClaim  ──► Surface stores claim.tax.wages = $X
                                                      Evidence{ method, source=W-2 page1/box1 }
Surface claim ──derived-trust edge──► claim.tax.position.bracket  (rule-application)
              ──derived-trust edge──► claim.tax.strategy.roth     (model: bracket + balances)
Corrected W-2 lands ──► Survey re-verifies wages ──► Surface claim updated/stale
                    ──► Surface freshness cascade ──► bracket + roth flagged stale
                    ──► recompute ──► change report: "Roth saving $2,100 → $1,650"
RIA drills: strategy.roth ──► bracket ──► wages ──► W-2 page1/box1   (full lineage)
```

Sales is the same skeleton with different plugins: signal adapters instead of form extractors,
`deal-state`/`forecast` derivation methods instead of tax positions, freshness cascade producing
"confidence decays because the champion fact is 40 days old."

## What each vertical owns vs. consumes (keeps verticals thin)

- **Tax** consumes Survey + Surface (incl. derived trust) + Veritas; owns the IRS-rule spine,
  tax-domain derivation logic, tax-dollar materiality calibration, RIA/CPA review + reporting UX.
- **Sales** consumes Survey + Surface; owns deal-state/forecast models, deal-value materiality
  calibration, RevOps/CFO audit + forecast UX.

The moat is what the vertical owns (domain logic + data spine), not the generic engines.

## Surface bake-ins (small, ship first)

Minor version on `surface` before Survey/verticals depend on them:
- Support-strength edge (cited vs. entails) — refines `Evidence.method` + `unsupported_inference`.
- `assumed` status — beside unknown/proposed/verified; taints downstream via a derivation edge.
- Materiality slot — ordinal (not numeric), populated by verticals.

## Build sequence

Decision: **extract-after-proof, with up-front discipline.** Build the first vertical end-to-end,
but keep Survey a separate internal package and derived trust behind a clean Surface API from day
one, so promoting Survey to its own repo is mechanical. Use the second vertical to validate the
generic boundary before locking public APIs.

First vertical = **tax**: `taxes` already implements most of Survey L1 and carries `.veritas`;
sales L1 is greenfield against ~80%-bad data. Tax de-risks Survey; sales proves genericity.

- **Phase 0 — Surface bake-ins.** support-strength, `assumed`, materiality. Lowest risk.
- **Phase 1 — Survey, internal package.** Lift `ExtractedFact → ResolvedFact → VerifiedFact` out
  of `taxes` into a `survey` package with the plugin contract; tax form extractors first. Output
  verified claims into Surface. Acceptance: a W-2 yields a Surface claim with a drillable locator.
- **Phase 2 — Surface derived trust.** Edge graph + propagation + freshness cascade + recompute
  (core or `surface-derive`). First edges: tax positions from facts. Acceptance: changing a fact
  auto-stales a position and recompute emits a change record. Validate against **Veritas
  readiness-as-derived-claim** as a non-tax sanity check before tax-think calcifies.
- **Phase 3 — Tax vertical.** Rule spine + L2/L3 logic + RIA review UX. Acceptance: the full flow
  above, including "which recommendations changed and by how much" on a corrected W-2.
- **Phase 4 — Extract Survey to a standalone product.** Promote `survey` to its own repo / npm
  package with a stable public API. Gate: nothing tax-specific leaks.
- **Phase 5 — Sales vertical.** Build on standalone Survey + Surface; every change sales forces in
  the shared layers is a genericity bug to fix there.
- **Phase 6 — Public story.** Update `kontourai.io` to the three-piece architecture only once the
  products are real and the website tests are wired into CI.

## Packaging

- New repo `kontourai/survey`, npm `@kontourai/survey`, TypeScript (match `surface`), Apache-2.0.
- Derived trust ships within `surface` or as `@kontourai/surface-derive`; decide in Phase 2 based
  on whether recompute needs a long-running watcher.
- `.veritas`-governed from the start (dogfood).
- Keep the website's `scripts/validate.mjs` advertised-version check in mind if these surface
  on the site.

## Risks and open decisions

- **Genericity leak**: extracting Survey after a single vertical risks baking tax assumptions in.
  Mitigation: the Phase 5 second-vertical gate; do not 1.0 the public API until sales runs on it
  unchanged.
- **`surface-derive` packaging** (open): in-core vs. separate package — decided in Phase 2 by the
  recompute-runtime question (on-demand report vs. stateful watcher).
- **Provenance ≠ correctness** enforced in UX, not just docs — derived outputs always show leaf
  evidence, never a bare conclusion.
- **Derivation noise**: unchecked propagation makes "everything stale." Materiality is the
  throttle; needs a real policy in Phase 2.

## Naming

Topographic theme: "Kontour" = contour lines, which reveal the hidden 3-D structure behind a flat
surface — "show the work behind AI." `surface` (terrain) and `flow` (water across it) fit;
`veritas` is the deliberate outlier.

- **Survey** (new product, was "Curation") — surveyors turn raw field measurements into
  authoritative verified records; exact match for raw → verified, and a real verb. Lowercase to
  match. **Recommended and accepted.**
- Derived trust needs no product name — it is a Surface capability. If the optional package ships,
  `@kontourai/surface-derive` is descriptive and theme-neutral, which is appropriate for a
  sub-package rather than a brand.
