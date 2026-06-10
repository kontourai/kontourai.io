# Survey Extraction Readiness Audit

Status: extraction-readiness analysis. Created 2026-05-31. Updated
2026-06-10 after the standalone Survey package and the vertical review-apply
helper adoptions.

This audit follows the Surface derive work and the two vertical proof PRs:

- `kontourai/surface#19` — `assumed`, structured `derivationEdges`, and report
  `changeRecords`.
- regulated-document proof issue — source document Surface trust export proof.
- `public-directory proof issue` — Public-directory product `registrationStatus` Surface trust
  export proof.

The result is now stronger than a paper plan and stronger than fixture-only
validation. The proofs show a real shared lifecycle in two vertical products.
They also show where further extraction would be premature or leaky.

## Executive Judgment

Survey is justified as a contract package and now exists as a small standalone
package. It is still not justified as a broad hosted ingestion platform.

The reusable shape is now proven in two different verticals:

```text
raw source
  -> extraction observation
  -> candidate set / proposal
  -> review or promotion
  -> Surface claim, evidence, and event
  -> Surface-derived stale/recompute/report state
```

The current package shape is right: producer-neutral builders and projection
helpers that depend on Surface and leave all domain acquisition, parsing, ranking,
materiality, and review UX in the vertical products.

Do not extract the current adapters wholesale. Extract only the concepts the
adapters repeatedly prove.

## 2026-06-10 Proof Update

Survey is now a standalone npm package consumed by both proof verticals.

- Public-directory product consumes `@kontourai/survey@^0.4.23` and uses
  Review Workbench resources plus server-owned review-session apply checks for
  crawl proposal review: current value versus proposed value, accepted or
  rejected by a reviewer. It also uses Survey's generic review-result mapper to
  derive approve/reject field actions without moving public-directory
  persistence into Survey.
- Regulated-document workflows consume `@kontourai/survey@^0.4.23` and use the
  same server-owned session/apply boundary for rule conflict review: the rule
  source candidate and current managed value stay product-owned while Survey
  supplies replayable review semantics and result validation helpers.
- Both integrations preserve product-owned observation authoring, source
  references, claim type, domain status policy, materiality, and metadata.
- Survey adds shared candidate/review wiring and candidate-role metadata that
  flows through Surface evidence, making the review decision inspectable by the
  Surface Console or any downstream trust panel.

This proves the next code-removal path: verticals can replace bespoke reviewed
candidate and apply-result wiring with Survey helpers while preserving their
Surface report behavior. It does not prove that Survey should own parsing, crawling,
regulated-rule logic, directory policy, canonical claim storage, or long-term
history.

The strongest version of this strategy is not "make the regulated-document and public-directory proofs share a
library." It is "make every producer pass through the same trust-producing
discipline before its claims can participate in Surface, Flow, Veritas, or a
vertical product." Survey should be the front door for that discipline.

## Strategic Benefit

The main benefit is not line-count reduction. It is forcing every producer to
declare the ingredients that make a claim trustworthy before the claim reaches a
customer, operator, agent, or downstream product.

Once a producer emits Survey-shaped records and Surface `TrustInput`, the rest
of the Kontour stack can reuse the same machinery:

- Surface Console can manage claims, gaps, review queues, status counts, and
  evidence requirements without per-product trust logic.
- Trust Panels can expose end-user provenance: source, excerpt, freshness,
  status, and reviewed-by context.
- Agents can inspect a consistent report shape before acting, rather than
  guessing from product-specific fields.
- Derivation and recompute are handled by Surface instead of ad hoc product
  metadata.
- Future producers must think through source identity, extraction confidence,
  locator, candidate conflicts, review authority, materiality, and downstream
  derivation before calling something verified.

That discipline is the product value. Code reduction is a secondary effect.

This also changes the management surface. A claim produced through Survey and
projected into Surface can be managed in the same place as every other claim:
the Surface Console. That means operators should not need a domain-specific trust
debugger, a camp-directory-specific trust debugger, and a separate agent-facing
report format. They should see one trust inventory with product-specific labels
on top.

The hidden benefit is producer behavior. A future producer that wants to emit a
verified claim has to answer the hard questions up front:

- What raw source did this come from?
- What exact field or span supports the value?
- Was it observed, inferred, reviewed, assumed, or superseded?
- Who or what had authority to promote it?
- How fresh is the support?
- What downstream conclusions depend on it?
- How material is it if wrong?

Those are easy questions to skip when every vertical owns its own data model.
They are much harder to skip when Survey is the shared producer contract and
Surface is the shared transparency layer.

## What Converged

Both proofs can now emit real Surface types from `@kontourai/surface`.

### Shared Concepts

| Concept | Regulated document workflows proof | Public-directory product proof | Survey candidate |
| --- | --- | --- | --- |
| Raw source | `UploadedDocument` with checksum and stored path | source URL from field source or proposal | `RawSource` |
| Extraction | `ExtractedFact` with value/confidence/source type | `FieldDiff` with new value/confidence/excerpt/source URL | `Extraction` |
| Candidate set | `ResolvedFact.candidates` | `CampChangeProposal.proposedChanges` | `CandidateSet` |
| Review/promotion | `VerifiedFact` or unresolved proposed fact | approved `fieldSources` or pending/rejected proposal | `ReviewOutcome` |
| Surface evidence | document citation | crawl observation | Surface projection helper |
| Claim Dependency | source document source facts -> retained amount position | not used yet for scalar field | Surface-owned |

This is enough convergence to keep growing Survey as a small contracts/projection
package.

### Important Difference

Regulated document workflows proves the **need** for Survey more strongly. Public-directory product proves the **shape**
more cleanly.

Regulated document workflows is still summary-object-shaped: source document parsing emits one object with wages,
federal retained amount, state wages, and state retained amount. The adapter then splits
that object into Surface field claims. Survey should eventually make those
field-level extraction targets explicit earlier.

Public-directory product is already field-shaped: `FieldDiff` carries old/new values, confidence,
excerpt, source URL, and mode. But it does not yet carry a strong reusable raw
source identity, crawl-run identity, or review outcome model.

## What The Proof Actually Proved

The proof did not prove that either vertical is architecturally complete. It
proved a narrower and more useful thing: two imperfect repos, with different
domains and different ingestion styles, can still be made to emit the same
trust-bearing record shape without changing their core workflows.

That matters because Survey should be designed for messy producers, not ideal
ones.

### Proven

- Both verticals can emit real `@kontourai/surface` `TrustInput`.
- The same Surface validator and report builder can consume both outputs.
- The trust lifecycle has common stages before it reaches Surface: source,
  extraction, candidate/proposal, review/promotion, and projection.
- `assumed`, `proposed`, `verified`, and `superseded` are useful enough to
  represent current vertical behavior without inventing a new trust status set.
- Surface-owned derivation can flag recompute pressure when a source claim is
  superseded.

### Not Proven Yet

- Survey can replace the vertical data models.
- Survey should own parsing, crawling, review UX, or domain ranking.
- The current field names are the final contract.
- Arrays and repeated entities are solved.
- Materiality can be inferred generically.
- Console workflows are complete enough to replace product admin screens.

### Failure Signals To Watch

If these appear, Survey is overreaching:

- Vertical code starts contorting domain concepts just to fit generic Survey
  fields.
- Survey needs regulated or camp-directory policy branches.
- Producers can emit `verified` without source identity, locator, freshness, and
  authority.
- Surface Console cannot explain a claim without calling back into vertical-only
  tables.
- Adapters get smaller, but review and trust behavior becomes less testable.

If those happen, keep Survey smaller and push the behavior back to the vertical.

## Code Reduction Map

These are the areas most likely to shrink or standardize after Survey exists.

### Regulated document workflows

Keep in the regulated-document product:

- source document, paystub, 1099, 1098, and return parsing.
- Regulated fact keys and domain labels.
- Household and regulated-year workflows.
- Retained amount and return-package calculations.
- Any domain-specific conflict rules.

Move toward Survey:

- Document/source identity as a reusable `RawSource`.
- Field-level extraction records instead of one domain summary object.
- Candidate ranking output shape.
- Review/promotion result shape.
- Claim/evidence/event projection boilerplate.
- Locator grammar normalization.

Likely code reduction:

- `surface-adapter.ts` should shrink once Survey provides `toSurfaceTrustInput`
  helpers.
- Parts of `ResolvedFact` and `VerifiedFact` may become adapters over Survey
  records instead of regulated-owned trust lifecycle records.
- Parser output should become closer to `Extraction[]`, reducing translation
  from summary objects into claim fields.

Likely non-reduction:

- The regulated resolver may not shrink much at first. It contains actual domain
  precedence and conflict behavior, not just generic trust plumbing.
- The parser may initially grow because field-level locators and confidence are
  more precise than today's summary object.
- More tests will be needed because the trust boundary becomes more explicit.

That is acceptable. The first win is better claim discipline and Surface
interoperability. Deleting code comes later, after the Survey contract stabilizes.

### Public-directory product

Keep in Public-directory product:

- Camp/provider domain model.
- Crawl target selection, scraper strategy, and admin UX.
- Directory-specific labels and filters.
- Array semantics for schedules, pricing, and age groups until per-item
  provenance is proven.

Move toward Survey:

- Source URL/crawl run identity.
- Field extraction observations.
- Proposal/candidate shape.
- Review outcome shape for approve/reject/attest blank.
- Surface projection boilerplate.
- Freshness state for stale crawl evidence.

Likely code reduction:

- `surface-trust-export.ts` should shrink to domain field selection plus a
  Survey projection call.
- `FieldDiff` and `FieldSource` can either become Survey-backed records or
  product read models over Survey records.
- Review approval can eventually write a Survey `ReviewOutcome` and let product
  tables remain a denormalized view.

Likely non-reduction:

- Crawling, scraping, and admin approval remain Public-directory product concerns.
- Directory-specific field labels and display grouping remain Public-directory product concerns.
- Array-level provenance probably needs another proof before it becomes Survey
  scope.

Public-directory product should use Survey to normalize source/extraction/review provenance, not
to become a generic public-directory product by accident.

## Extraction Candidates

### Strong Candidates

These are good Survey v0 material:

```ts
type RawSource = {
  id: string;
  kind: "uploaded-document" | "web-page" | "api-record" | "manual-entry";
  sourceRef: string;
  observedAt: string;
  fetchedAt?: string;
  checksum?: string;
  locatorScheme: "pdf" | "text" | "html" | "structured-field";
  metadata?: Record<string, unknown>;
};

type Extraction = {
  id: string;
  sourceId: string;
  target: string;
  value: unknown;
  confidence?: number;
  locator?: string;
  excerpt?: string;
  extractor: string;
  extractedAt: string;
  metadata?: Record<string, unknown>;
};

type CandidateSet = {
  id: string;
  target: string;
  candidates: Array<{
    extractionId: string;
    value: unknown;
    confidence?: number;
    sourceRank?: number;
    metadata?: Record<string, unknown>;
  }>;
  selectedExtractionId?: string;
  status: "resolved" | "needs-review" | "conflict";
  rationale?: string;
  metadata?: Record<string, unknown>;
};

type ReviewOutcome = {
  id: string;
  candidateSetId: string;
  status: "verified" | "assumed" | "rejected" | "needs-review";
  actor?: string;
  reviewedAt?: string;
  rationale?: string;
  metadata?: Record<string, unknown>;
};
```

### Weak Candidates

Do not extract these yet:

- Domain-specific source ranking such as prior-period carry-forward precedence.
- source document summary parsing.
- Public-directory product array diffs for schedules, pricing, and age groups.
- Full review workflow state machines.
- Database schemas.
- UI review components.
- Crawler or PDF parser integrations.

## Surface Boundary

Survey should depend on Surface. Surface should not depend on Survey.

Surface owns:

- `TrustInput`, `Claim`, `Evidence`, `VerificationEvent`.
- Trust statuses, including `assumed`.
- `derivationEdges` and support strength.
- `changeRecords`, stale/recompute/report derivation.
- Console and analytics projections.

Survey owns:

- Producer-side source/extraction/candidate/review records.
- Helpers that project those records into Surface records.
- Fixtures that prove multiple verticals can use the same producer contract.

Verticals own:

- Domain parsing and acquisition.
- Product workflows and UX.
- Domain-specific policy and materiality decisions.

This is why the proof PRs were updated to import Surface directly instead of
recreating Surface-shaped local schemas. Local lookalike schemas are useful for
the first sketch, but they are dangerous after Surface has the primitives:

- They can drift from the real `TrustInput`.
- They hide breaking changes until integration time.
- They make the proof weaker because it validates against a copy of the
  contract, not the contract.

Survey should not copy Surface either. Survey should depend on Surface and offer
projection helpers that return Surface types. A vertical should be able to emit
Survey records, call a Survey projection helper, and then pass the result to
Surface validation/reporting without a translation fork.

## Success Criteria

Survey v0 should be considered successful only if the next slice proves all of
these:

- Regulated document workflows and Public-directory product can produce golden Survey records from real-ish fixtures.
- Survey can project those records into the same Surface report shape the proof
  PRs already produce.
- At least one rejected proposal, one assumed/attested blank, one stale source,
  and one superseded source are represented without vertical-specific contract
  fields.
- Surface Console or a console-ready JSON read model can show claim status,
  evidence, freshness, materiality, and review context from the shared shape.
- Removing the proof adapters does not remove the ability to explain claim
  provenance to an end user.
- The vertical repos keep ownership of domain policy instead of importing
  product rules into Survey.

The measurable target is modest: replace duplicated projection boilerplate and
fixtures, not rewrite ingestion.

## Evidence Matrix

| Question | Current answer | Confidence |
| --- | --- | --- |
| Can verticals emit Surface-native trust records? | Yes, both proof PRs import `@kontourai/surface` and validate exports. | High |
| Do both verticals share a pre-Surface lifecycle? | Yes: source, extraction, candidate/proposal, review/promotion. | High |
| Is Survey justified as a package? | Yes, as contracts plus projection helpers. | Medium-high |
| Is Survey justified as a service? | Not yet. There is no evidence that hosting, queues, storage, or orchestration are shared. | Low |
| Can code be removed immediately? | Some adapter boilerplate, but domain logic mostly stays. | Medium |
| Is the Surface Console benefit real? | Yes, if producers emit enough source/review/materiality metadata. | Medium-high |
| Are array/repeated-entity claims solved? | No. Public-directory product schedule/pricing/age arrays need a separate proof. | Low |
| Is materiality generic? | No. Survey can require it, but verticals should decide it. | Medium |

## Testing Depth

The current validation is enough for proof-of-shape. It is not yet enough for a
stable shared package.

### Current Evidence

Regulated document workflows:

- `npm run typecheck`
- `npm test`
- pre-push `lint`, `typecheck`, `test`, `build`
- generated source document corrected-source export validated with installed
  `@kontourai/surface`
- Surface report produced one recompute `changeRecord`

Public-directory product:

- `npx tsc --noEmit`
- `npm run test:surface`
- `npm run test:access`
- generated registration-status export validated with installed
  `@kontourai/surface`
- Surface report produced one verified current claim and one proposed candidate

### Missing Evidence

Before Survey is more than a contracts package, add:

- Golden JSON fixtures committed in both repos.
- Golden fixtures in `kontourai.io` or `survey` that validate with Surface.
- Rejected proposal example.
- Blank/attested-not-applicable example.
- Stale source example for Public-directory product.
- Regulated conflict example with two source document candidates requiring review.
- Locator tests across PDF/page, text, HTML excerpt, and structured field.
- Candidate ranking tests that prove domain ranking can remain outside Survey.
- Round-trip tests from Survey records to Surface report.
- Console-read-model fixture that proves Surface can display trust state without
  vertical callbacks.
- Negative contract tests that reject claims without source identity or review
  authority when status is `verified`.

## Better Design Opportunities

### 1. Move Field-Level Extraction Earlier

Regulated document workflows should stop treating source document as one opaque summary object if the goal is
trust transparency. The parser can still parse a full form, but the trust layer
should see field-level extractions:

```text
source-doc.wages
source-doc.federalIncomeTaxWithheld
source-doc.stateWages
source-doc.stateRetained amount
```

That unlocks precise locators, field-level confidence, and better recompute
records.

### 2. Separate Candidate Status From Trust Status

Both repos blur candidate lifecycle and trust status:

- Regulated document workflows has `needsVerification`, `selectedSource`, and `VerifiedFact`.
- Public-directory product has `PENDING`, `APPROVED`, `REJECTED` proposals plus `dataConfidence`.

Survey should model candidate/review lifecycle. Surface should model trust
status. The adapter can map from one to the other.

### 3. Treat Approved Product Fields As Read Models

Public-directory product `fieldSources` and regulated-document product `verified_facts` can become product read
models over Survey/Surface records, not the canonical trust lifecycle. This
would reduce future migration pain.

### 4. Make Materiality Explicit At Projection Time

The proofs currently choose `impactLevel` manually. Survey should not decide
materiality globally, but projection helpers should force producers to provide
materiality or choose a policy default.

### 5. Build Console Readiness Into The Contract

A producer record should carry enough information for Surface Console to answer:

- What source supports this claim?
- Who or what reviewed it?
- Is it current?
- What changed?
- What downstream conclusions need recompute?
- What evidence is missing?
- Which claims are high-impact and unsupported?

This is why Survey matters. It makes the Surface Console and Trust Panel
possible without each product inventing its own trust management model.

## Recommendation

Merge the two proof PRs after review, then create a small Survey contracts
package.

Do not start with a broad ingestion service. Start with:

- Types.
- Fixture builders.
- Surface projection helpers.
- Golden fixtures from the regulated-document and public-directory proofs.
- Contract tests against `@kontourai/surface`.

Suggested initial package scope:

```text
@kontourai/survey
  src/types.ts
  src/to-surface.ts
  fixtures/regulated-source-doc-corrected.ts
  fixtures/public-directory-registration-status.ts
  tests/contracts.test.ts
```

The first success criterion for Survey is not that vertical repos delete a lot
of code immediately. It is that both verticals can replace their proof adapters
with a smaller call into Survey while preserving the same Surface report output.

That should be the next proving step:

```text
vertical fixture
  -> Survey records
  -> Survey projection helper
  -> Surface TrustInput
  -> Surface report / console-ready read model
```

If that chain holds across the regulated-document and public-directory proofs, Survey is real. If it only works
by adding vertical-specific branches inside Survey, the abstraction is too big.

## Next Validation Plan

1. Merge or update the regulated-document and public-directory proof issues to include golden fixture output.
2. Add rejected/stale/blank-attested cases in Public-directory product.
3. Add conflict/needing-review case in the regulated-document product.
4. Create Survey contracts package only after those fixtures are stable.
5. Replace proof adapter boilerplate with Survey projection helpers.
6. Measure code removed from each vertical and document what stayed vertical.
