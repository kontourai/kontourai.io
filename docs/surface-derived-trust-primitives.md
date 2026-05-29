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
3. Two capabilities large enough to be **their own foundational products** — Curation and
   Derivation — with their boundaries (see "New foundational products").

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

### B. New shared layer, not Surface core (see Derivation Engine, below)

- **Derivation edge** and **freshness propagation** are the multi-hop engine. They could be
  bolted onto Surface, but a graph + recompute runtime would bloat a deliberately-thin claim
  schema. Recommendation (resolves open question #3): keep Surface core single-hop and put
  derivation in a separate foundation product. This preserves "base schema small" while giving
  the big bets their engine.

### C. Vertical-only — do NOT bake into the foundation

These are *different trust shapes*, not generic extensions; putting them in the shared core
would dilute its genericity.

- **Temporal / resolvable claim** → pull into a vertical only when it needs track records. The
  research verdict (horizontal monetization trap) is also the argument against making it core.
- **Multi-party + adjudication** → the adversarial-substrate product only. Surface assumes a
  single trusted producer; adversarial multi-party submission is a different model that would
  complicate every other use case.

## New foundational products (peers to Surface and Flow)

The bake-in analysis surfaced two capabilities large and generic enough to be their own
products — peers to Surface/Flow, not verticals like Veritas. Together with Surface and Flow
they make the platform **four foundational pieces, not two**, and the tax and sales bets need
only these four generic pieces plus their own domain rules and review UX — the strongest proof
of the platform thesis.

### Curation (raw → verified claims)

The L1 ingestion engine: turn raw, messy, untrusted input into verified claims with provenance.

- **Owns**: source ingestion, extraction, candidate resolution (dedupe, rank, conflict),
  promotion from extracted → resolved → verified, and the human-review/attestation loop.
- **Boundary**: Surface explicitly says producers collect their own evidence, so this is *out
  of Surface's scope by design*. Curation produces the verified claims Surface then stores and
  exposes. Domain extractors (tax forms, CRM signals, crawlers) are plugins; the resolution and
  review machinery is shared.
- **Why it's a product, not a vertical feature**: the `taxes` repo
  (`ExtractedFact → ResolvedFact → VerifiedFact`) and the public-directory repo
  (`crawl → proposal → field-source → attestation`) independently invented the same pipeline.
  Two repos converging on one shape is the signal for a reusable primitive. Competitive research
  on both tax and sales concluded the moat is this verified-fact spine, not the UI.

### Derivation (claims → derived claims)

The multi-hop trust graph and recompute runtime (bucket B above, as a standalone product).

- **Owns**: derivation edges, weakest-link status propagation, freshness cascade,
  recompute-on-change, and the counterfactual query ("if this input flips, which conclusions
  flip?").
- **Boundary**: Surface stores and exposes single claims and their direct evidence; Derivation
  computes the claims that are *inferred from other claims* and keeps them current. Surface stays
  single-hop and generic; Derivation is the optional graph layer on top.
- **Why separate from Surface**: a graph/recompute engine is a different concern from a small,
  inspectable claim schema. Keeping them apart honors the vision's "Surface remains generic and
  small" constraint.

Provisional product-line architecture:

```text
Curation     raw, untrusted input        -> verified claims + provenance
Surface      verified claims             -> stored, inspectable single-hop trust state
Derivation   claims                      -> derived claims (multi-hop, recompute-on-change)
Flow         required-path process       -> evidence-gated transitions
Veritas      repo standards (vertical)   -> merge readiness, built on the above
Verticals    tax / sales / lineage       -> domain rules + review, built on Curation+Derivation
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
- Surface core vs. separate layer (was open): resolved above — Surface core stays single-hop;
  derivation/recompute lives in a separate Derivation product. Remaining sub-question: does
  Curation also warrant its own package now, or grow inside the first vertical until a second
  vertical confirms the shared shape?
- What is the smallest end-to-end slice — probably one vertical, one derivation depth of two —
  that proves the recompute-on-change behavior is real and valuable?
- For the two new products: build Curation and Derivation as shared packages up front, or
  extract them from the first vertical (tax or sales) once it works? Extraction-after-proof is
  lower-risk but risks baking domain assumptions into the "generic" layer.
