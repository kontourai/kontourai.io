# Derived Trust: Primitives and Foundational Products

Status: design exploration. Not shipped. Captures building blocks — and two
candidate new products — that repeated across multiple product explorations on
2026-05-29.

## Why this note exists

Surface today is single-hop: a Claim points to Evidence, and Evidence points to a
Source. Claim Groups roll claims *up* (aggregation), but nothing models a claim that is
*inferred from other claims*. Several product explorations — tax, sales, diligence,
accountability ledgers, composed supply chains — independently hit the same wall and asked
for the same handful of new primitives. They are captured here as a foundation candidate,
separate from any one product, because their value is as reusable building blocks.

The shift they enable: Surface moves from "show the work behind **a claim**" to "show the
work behind **a conclusion built on many claims**" — the place where high-stakes decisions
and real willingness-to-pay live.

This note covers three decisions, not just a primitive list:
1. The seven candidate primitives (below).
2. Which primitives bake into existing products vs. become a new shared layer vs. stay
   vertical-only (see "Disposition").
3. One capability large enough to be **its own foundational product** — Survey — with its
   boundary, plus why multi-hop derived trust is a Surface capability rather than a product
   (see "New foundational product: Survey").

## The boundary these primitives do NOT cross

Surface establishes **provenance, not veracity**. It can say "this claim's evidence is this
source, and here is how you verify the evidence really came from that source." It does not
assert the claim is true. The provider establishes that the underlying data can be trusted.

This matters most for derived trust, because the failure mode compounds:

> Derived trust bounds and traces confidence; it does not manufacture correctness at the
> leaves. A verifiable chain to a wrong extracted fact is still wrong — and the receipts now
> make you *more* accountable for being wrong, not less.

Every product built on these primitives must lead with this boundary, the same way Veritas
never claims code is correct, only that it meets the repo's evidence standard.

## Candidate primitives

### 1. Derivation edge

A claim whose evidence is *other claims* plus the method that combined them. This is the
core multi-hop primitive.

- A derived claim cannot be more verified than its weakest input (weakest-link status
  propagation — no numeric scores, consistent with the existing "avoid numeric trust"
  stance).
- When an input claim changes, staled, or is disputed, every claim derived from it is
  flagged for recompute or re-review.
- Drilldown runs both ways: from a conclusion down to source lines, and the counterfactual
  "if this input flips, which conclusions flip?"

Demanded by: every curate→derive vertical (facts → positions → strategy), and composed
supply chains (tier proves to tier).

### 2. Freshness-as-state

A claim that transitions to `stale` on its own timer or on an upstream change, and forces
downstream derived claims to recompute. The temporal half of derived trust.

Demanded by: sales forecasting ("last real buyer signal is 40 days old → confidence
decays"), tax ("the W-2 changed → the Roth recommendation is stale"), compliance ("this
control's evidence aged past its review window"). Competitive research found this is
universally complained about and productized by no one — the strongest-validated primitive.

### 3. Support-strength edge

A typed link between Evidence and Claim that distinguishes "this source was cited" from
"this source actually entails the claim." Promotes the existing `unsupported_inference` gap
to a first-class relationship.

Demanded by: any RAG/answer/extraction flow (a retrieved passage is not the same as a
supporting passage), tax (does this rule actually support this deduction?), diligence (does
this filing actually support this metric?). This is the durable building block left behind
when the thin "RAG trust layer" product idea was discarded.

### 4. Held assumption

An evidence-less value, deliberately used, that taints everything downstream so derived
claims carry the flag forward. Distinct from "unknown" (it is knowingly assumed) and from
"verified" (it has no evidence).

Demanded by: tax (`taxes.md` explicitly asked how to model a value that is calculated
correctly but depends on an assumption), any financial projection.

### 5. Materiality

A first-class signal of impact, so alerts, review queues, and (where relevant) risk pricing
rank by consequence rather than by missingness. Not every stale or missing fact carries
equal product risk.

Demanded by: tax (`taxes.md` asked for a review queue ordered by materiality, not
missingness), composed chains (gap → materiality → price), sales (which stale fact actually
threatens the forecast).

### 6. Temporal / resolvable claim

A claim about the future, recorded with a resolution date, later verified against what
actually happened — producing a track record for a source over time.

Demanded by: the accountability-ledger exploration. Captured as a primitive even though the
*horizontal product* on top of it does not monetize well (see opportunity entry); it is a
clean building block for verticals with auto-resolvable claims.

### 7. Multi-party claim + adjudication record

Claims submitted by mutually-distrusting parties, with submitter identity, conflict as a
first-class state, and a neutral adjudication record. Kontour owned by neither party.

Demanded by: the adversarial-substrate exploration (disputes, chargebacks, enforcement).
Captured as a primitive; the research showed the *product* only adopts when a forum already
compels both parties onto the record.

## Disposition: bake-in vs. new layer vs. vertical-only

The seven items above are not all the same kind of thing. The deciding test, from the
product-line vision: **does it stay generic across every domain, and does it keep Surface's
base schema small?** That sorts them into three buckets.

### A. Bake into existing products (generic, foundation-level)

These refine what Surface/Veritas already do and stay domain-neutral:

- **Support-strength edge** → Surface core. Refines existing `Evidence.method` and the
  `unsupported_inference` gap; promotes "cited vs. entails" to a first-class link.
- **Held assumption** → Surface core. A small new status (`assumed`) beside
  unknown/proposed/verified, that taints downstream via a derivation edge.
- **Materiality** → Surface provides the *slot* (the Claim already carries impact); keep it
  ordinal, not numeric, to respect the no-scores rule. Verticals calibrate the scale
  (financial materiality ≠ deal materiality).
- **Veritas** needs no new primitive — it is the proof case. The move is letting a Veritas
  readiness verdict be consumed as a derived claim.

### B. Surface capability (a Surface extension, not a separate product)

- **Derivation edge** and **freshness propagation** are the multi-hop engine. Earlier this note
  floated them as a separate product ("Derivation"); on reflection that fails the product test
  (see "Why derived trust is not its own product" below): its input and output are both Surface's
  native Claim type, it has no domain-plugin surface, and Surface already derives across claims
  (Claim Groups roll up; Trust Snapshots derive status; freshness already propagates). So this is
  a **Surface capability**. The only real seam is runtime: if recompute-on-change needs a
  long-running watcher rather than Surface's on-demand report model, ship it as an optional
  `@kontourai/surface-derive` package — a sub-package, not a brand. This preserves "base schema
  small" without inventing a product.

### C. Vertical-only — do NOT bake into the foundation

These are *different trust shapes*, not generic extensions; putting them in the shared core
would dilute its genericity.

- **Temporal / resolvable claim** → pull into a vertical only when it needs track records. The
  research verdict (horizontal monetization trap) is also the argument against making it core.
- **Multi-party + adjudication** → the adversarial-substrate product only. Surface assumes a
  single trusted producer; adversarial multi-party submission is a different model that would
  complicate every other use case.

## New foundational product: Survey

The bake-in analysis surfaced **one** capability large and generic enough to be its own product
(working name **Survey**) — a peer to Surface/Flow, not a vertical like Veritas. With Surface
(now multi-hop) and Flow, the platform is **three foundational pieces**, and the tax and sales
bets need only these three plus their own domain rules and review UX — the strongest proof of the
platform thesis.

### Survey (raw → verified claims)

The L1 ingestion engine: turn raw, messy, untrusted input into verified claims with provenance.

- **Owns**: source ingestion, extraction, candidate resolution (dedupe, rank, conflict),
  promotion from extracted → resolved → verified, and the human-review/attestation loop.
- **Boundary**: Surface explicitly says producers collect their own evidence, so this is *out
  of Surface's scope by design*. Survey produces the verified claims Surface then stores and
  exposes. Domain extractors (tax forms, CRM signals, crawlers) are plugins; the resolution and
  review machinery is shared.
- **Why it's a product, not a vertical feature**: the `taxes` repo
  (`ExtractedFact → ResolvedFact → VerifiedFact`) and the public-directory repo
  (`crawl → proposal → field-source → attestation`) independently invented the same pipeline.
  Two repos converging on one shape is the signal for a reusable primitive. Competitive research
  on both tax and sales concluded the moat is this verified-fact spine, not the UI.

### Why derived trust is NOT its own product

Multi-hop derivation was previously floated as a second product ("Derivation"). It fails the
product test on both axes:
- **No boundary crossing**: its input and output are both Surface's native Claim type — it never
  leaves Surface's vocabulary. (Survey, by contrast, turns non-Surface raw input into claims.)
- **No extensibility surface**: the methods (sum / max / model / rule-application) are generic and
  few; there is no per-domain plugin ecosystem.
- **Surface already derives**: Claim Groups roll claims up, Trust Snapshots derive status from
  evidence, freshness already propagates. Multi-hop + cascade generalizes what Surface does.

So derived trust is a **Surface capability** (bucket B), optionally packaged as
`@kontourai/surface-derive` if recompute needs a stateful runtime — a sub-package, not a brand.

Provisional product-line architecture:

```text
Survey       raw, untrusted input        -> verified claims + provenance
Surface      verified + derived claims   -> stored, inspectable trust state (now multi-hop)
Flow         required-path process       -> evidence-gated transitions
Veritas      repo standards (vertical)   -> merge readiness, built on the above
Verticals    tax / sales / lineage       -> domain rules + review, built on Survey + Surface
```

## What this unlocks: the "living document" class

The combination of derivation edges, freshness-as-state, and support-strength enables a class
of product that is not defined by domain but by behavior:

> Any high-stakes artifact that is authored once but should **flinch when its inputs change** —
> because every assertion in it is an edge in a graph that recomputes.

A living tax return, a living research report, a living contract, a living forecast. This is
the outside-the-box generalization of Veritas: Veritas makes *code* flinch when standards are
not met; this class makes *conclusions* flinch when their evidence shifts.

## Discarded product ideas that fed this note

These were captured earlier as opportunity entries, then cut as too thin (provenance wrappers
around the easy part, with the hard "is this trustworthy" work left to the provider). Their
useful residue is the primitives above.

- **RAG / AI answer trust layer** → residue: the support-strength edge (primitive 3).
- **Compliance evidence room** → residue: freshness-as-state (primitive 2); the product itself
  was a console over checks the customer already runs.
- **AI agent action approval gateway** → no residue: a gate that blocks on an action and records
  an exception is the literal definition of a Flow gate. Fully covered by Flow already.

## Open questions

- How far can status propagation go before "everything is stale" becomes noise? Materiality is
  the likely throttle.
- Should derivation method be a typed, inspectable object (sum, max, model, rule-application)
  or free-form?
- Derived trust as Surface core vs. optional package (was "core vs. separate product"): resolved
  to a Surface *capability*; the remaining sub-question is in-core vs. `@kontourai/surface-derive`,
  decided by whether recompute needs a stateful watcher.
- What is the smallest end-to-end slice — probably one vertical, one derivation depth of two —
  that proves the recompute-on-change behavior is real and valuable?
- For Survey: build as a shared package up front, or extract from the first vertical (tax) once it
  works? Extraction-after-proof is lower-risk but risks baking domain assumptions into the
  "generic" layer (see the build plan's Phase 4/5 genericity gate).
