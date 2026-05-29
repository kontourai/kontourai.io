# Surface Primitives: Derived Trust

Status: design exploration. Not shipped. Captures building blocks that
repeated across multiple product explorations on 2026-05-29.

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
- Do these belong in Surface core, or in a `surface-derive` extension so the base schema stays
  small?
- What is the smallest end-to-end slice — probably one vertical, one derivation depth of two —
  that proves the recompute-on-change behavior is real and valuable?
