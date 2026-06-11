# Evidenced Ontology

How Kontour treats semantic mappings as first-class, reviewable, disputable
records — and why that changes what you can trust when queries cross system
boundaries.

---

## The problem: mappings are ownerless config

Every serious attempt to make data intelligible across systems eventually adds
a semantic layer. Palantir Foundry's ontology lets analysts write against
business objects instead of raw tables. dbt's semantic layer and Cube's data
model lift metric definitions above the warehouse schema. Enterprise knowledge
graphs tie vendor records, customer records, and product catalogs together so
queries do not have to understand each system's schema. All of these are
genuinely useful, and all of them share the same structural weakness: the
mappings that hold them together are unaudited configuration.

Someone, at some point, decided that `customers.acct_id` and
`crm.customer_identifier` are the same thing. Or that `revenue_usd` in the
data warehouse maps onto `net_revenue` in the semantic layer with a particular
conversion. That decision lives in a YAML file, an ontology editor, or a
migration script. There is no record of who made it, what evidence it rested
on, whether anyone reviewed it, or whether the underlying schemas have changed
since. When the answer from a cross-system query is wrong, the mapping is
usually why — and finding that out requires reconstructing intent from git
blame and Slack history.

Ontologies rot because mappings are ownerless. The business changes, schemas
diverge, field semantics drift. Nothing in the tooling creates accountability
for keeping mappings current. Nothing escalates when a mapping becomes
contested. And nothing stops a stale or disputed mapping from producing an
answer that looks verified.

---

## The Kontour answer: every mapping is an evidenced record

In Kontour, a semantic mapping is not config. It is two things at once.

First, it is a **Claim** — an assertion about a real-world relationship between
two identifiers, with schema-excerpt evidence attached, a reviewer on record,
and an authority trace establishing who held the authority to accept it. The
claim follows the same lifecycle as any other trust record: it can be proposed,
reviewed, verified, disputed, or superseded. Evidence items carry the schema
fragments and field definitions that justified the mapping. A VerificationEvent
records who accepted it and when.

Second, it is an **IdentityLink** — a record in the TrustBundle that the
resolution engine traverses when an inquiry crosses a system boundary. The
resolution engine does not consult static config; it walks the ledger of
accepted links and inherits the trust status of each link it crosses.

The connection between the two is a `mappingClaimId` on the IdentityLink
pointing at the Claim that evidences the mapping assertion. That pointer
activates the **weakest-link rule**: a query resolved through an IdentityLink
cannot return a status stronger than the status of the mapping claim behind
it. If the mapping claim is disputed, the answer is disputed. If the mapping
claim is stale, the answer is stale. A disputed mapping can never silently
produce a verified answer. Trust propagates through the semantics it traverses,
and gaps in the ontology surface as transparency gaps rather than silent
wrong answers.

The result is a direct answer to the question the existing tools cannot
answer: who decided these two fields mean the same thing, on what evidence,
and is that still true?

---

## Three relations, not OWL

The format supports exactly three IdentityLink relations.

**Equivalent** — the two subjects denote the same real-world entity. A query
against either subject resolves the same claims.

**Subsumes** — the first subject is a proper superset of the others. Useful
for expressing that a canonical entity encompasses a narrower one without
asserting strict identity.

**Converts** — the subjects are related by a unit or scale transformation,
parameterised by an optional `conversion` object carrying `factor`, `offset`,
and `note`. This handles currency normalisation, unit conversion, and scale
differences in metrics.

That is the complete vocabulary. There is no OWL-style class hierarchy,
property restriction, or rule inference engine behind it.

This is a deliberate choice, not an omission. The semantic web's promise was
that sufficiently expressive ontology languages — RDFS, OWL-DL, OWL-Full —
would let computers reason across federated data. Two decades of experience
with that promise produced a clear pattern: expressive ontologies are hard to
maintain, hard to reason about in practice, and their complexity tends to
obscure rather than resolve the question of who is accountable for each
mapping. The OWL ecosystem delivered useful vocabulary standards but did not
solve the governance problem, because a richer logic does not make mappings
more reviewable — it makes them harder to review.

The Kontour position is that a small, reviewable set of relations enforced by
a trust-status function beats a large, expressive set of relations enforced by
nobody. A human reviewer can inspect an `equivalent` or `converts` link and
decide whether the evidence justifies it. The same reviewer cannot easily
audit a set of OWL property restrictions with inference closure. Reviewed
mappings beat expressive logic when accountability is the goal.

---

## How it works: no ETL required

Data stays in source systems. Nothing is copied, migrated, or normalised into
a central store. The semantic layer is the ledger of accepted IdentityLinks,
not a replicated schema.

The workflow has four steps.

**Propose.** Survey's producer profile watches source system schemas. When a
schema changes or a new field appears, Survey's model proposes candidate
mappings — IdentityLinks with attached schema-excerpt evidence. The proposal
is a record; nothing is applied until a human accepts it. Model proposes,
human disposes.

**Review.** The candidate mapping enters a Survey review queue. The reviewer
sees the proposed relation, the evidence items (schema fragments, field
definitions, sample values where available), and the authority record of who
is qualified to accept mappings in this domain. Accepting the review creates a
VerificationEvent on the mapping Claim and promotes the IdentityLink to
accepted status.

**Resolve.** Surface's resolution engine traverses accepted IdentityLinks when
an inquiry crosses system boundaries. A question asked against a canonical
subject resolves through the link to the source-system subject, inheriting the
weakest-link status of the mapping it crossed. The inquiry record captures
which links were traversed and what their status was at resolution time.

**Propagate staleness and disputes automatically.** When a schema changes in a
monitored source system, Survey detects the drift and raises a dispute event
on affected mapping claims. The weakest-link rule then propagates that dispute
forward: every inquiry that resolves through the affected link returns disputed
status until the mapping is re-reviewed and re-accepted. No background process
needs to find and invalidate downstream answers; the status function recomputes
from the current ledger state on every resolution.

The end state: an analyst can ask a question across three systems, get an
answer with a status, and drill into exactly which mapping claims the answer
depended on, who reviewed each one, when, and whether any are currently
disputed or stale. The ontology is not a configuration artifact — it is a
ledger with a checkable state.

---

## Where it fits the product line

Evidenced ontology is not a new product. It is a natural combination of two
existing capabilities: Survey's producer profile — which handles source
monitoring, model-proposed candidates, and human review queues — and Surface's
resolution engine, which traverses IdentityLinks and applies the weakest-link
status cap through accepted mappings. Organisations already using Survey for
claim production and Surface for resolution can extend those same workflows to
cover semantic mappings between systems. The same review primitives, the same
authority model, the same trust status vocabulary. What changes is the subject
of the claim: instead of asserting a fact about an entity, the claim asserts a
relationship between two identifiers across systems — and the resolution engine
treats that relationship as traversable only when the claim behind it is in
good standing.
