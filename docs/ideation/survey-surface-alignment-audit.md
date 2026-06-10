# Survey and Surface Alignment Audit

Status: read-only audit. Created 2026-05-31.

This audit checks whether the current strategy documents are enough to start
implementation, and how the prototype repos align with the Survey and Surface
derived-trust goals.

## Scope and Sources

Strategy lens:

- `docs/product-line-vision.md`
- `docs/ideation/surface-derived-trust-primitives.md`
- `docs/ideation/build-plan-survey-derived-trust.md`
- `docs/ideation/opportunities/2026-05-29-regulated-advisory-platform.md`
- `docs/ideation/opportunities/2026-04-25-regulated-document-workflows.md`
- `docs/ideation/opportunities/2026-04-25-public-directory-data.md`

Code audited read-only:

- regulated-document proof source at a reviewed snapshot.
- public-directory proof source at a reviewed snapshot.
- `kontourai/surface` local sibling at `24954e615cf0e635ee863e15beefa68fc2d76aa6`

Important caveat: the regulated-document proof and `public-directory` are proof inputs. They
are useful because they independently reached similar ingestion and verification
shapes. They are not authoritative designs and should not be treated as complete
or correct.

## Summary Verdict

The planning documents are a strong strategic starting point, but not enough to
start extraction safely.

They correctly identify the reusable shape:

```text
raw source -> extraction -> candidate resolution -> review/promotion -> verified claim
verified claim -> derived claim -> stale/recompute/change explanation
```

The repo audit confirms the shape is real in both regulated and public-directory data,
but the current implementations are still domain-shaped and uneven. The next
step should be a small proof slice, not a new public Survey repo.

Recommended first implementation sequence:

1. Surface Phase 0 bake-ins: support-strength, `assumed`, materiality.
2. Surface derivation edge contract: typed input claims and method metadata.
3. Regulated proof: one source-document fact into a Surface claim, one derived derived compliance position,
   and a corrected-source stale/recompute path.
4. Public-directory product genericity check: one crawl/proposal/field-source path mapped onto
   the same Survey contract.
5. Only then scaffold or promote `kontourai/survey`.

The first proof artifact now lives in `docs/ideation/survey-proof-slice.md`, with
Surface-compatible fixtures under `docs/ideation/fixtures/survey-proof-slice/`.

## Regulated document workflows Alignment

### What aligns well

Regulated document workflows already has the core Survey spine:

- `UploadedDocument` stores stable source identity: file name, stored path,
  checksum, document type, issuer, status, text content, and created time.
- `ExtractedFact` carries document link, fact key, value, confidence, source
  type, and optional page.
- `ResolvedFact` carries selected fact, selected source, verification need,
  rationale, and candidate set.
- `VerifiedFact` carries value, verifier, verification time, and rationale.

The service path is also close to Survey:

- `uploadDocument` hashes and stores the source, classifies it, extracts facts,
  inserts extracted facts, then calls resolution.
- `resolveFacts` groups candidates by fact key, dedupes by source/confidence/
  value/checksum/label, ranks by source and confidence, marks conflicts or weak
  winners as needing verification, and auto-verifies strong single winners.
- `verifyResolvedFact` prevents unresolved conflicting facts from being promoted.

This is enough to justify the plan's claim that Survey should be extracted after
proof.

### What does not yet align

The reusable Survey boundary is not clean yet:

- Locators are too weak for the target product. `ExtractedFact` has only optional
  `page`; the Survey goal needs page/line/field/box/source URL style locators.
- Confidence is used in resolution, but it is not a trust status. Survey must
  keep confidence as extractor evidence, then rely on review/promotion and
  Surface status for trust.
- Resolution is regulated-shaped. `ResolutionSource` includes domain-specific source
  categories such as `prior_year_carry_forward` and document-confidence states.
- Verification loses some source path detail. `VerifiedFact` keeps rationale but
  not the selected candidate, locator, source checksum, or evidence method.
- Reparse deletes verified facts for the year and rebuilds from documents. That
  is useful behavior, but the derived-trust proof needs a more explicit "input
  changed -> downstream claims stale/recomputed" record.

### Best proof slice

Use a source-document path because it already maps to the strategic example and creates
a clear downstream calculation.

Proof target:

```text
source document source
  -> RawSource(checksum, stored path, observed time)
  -> Extraction(wages, federal retained amount, locator, confidence, method)
  -> ResolvedValue(winner, candidates, rationale)
  -> VerifiedClaim(Surface-compatible claim + evidence)
  -> Derived derived compliance position from wages/retained amount
  -> Corrected source document stales/recomputes derived position
```

Do not try to extract all of Survey from the regulated-document product. The proof should first answer:

- What is the smallest generic `RawSource`?
- What locator shape survives both PDF boxes and text extraction?
- What resolution output is generic vs. domain-only?
- What must a verified fact carry so Surface can expose provenance later?

## Public-directory product Alignment

### What aligns well

Public-directory product independently confirms the Survey pattern outside regulated:

- `FieldSource` stores excerpt, source URL, and approval timestamp.
- Camp records carry `fieldSources`, `dataConfidence`, `lastVerifiedAt`, and
  `lastCrawledAt`.
- `FieldAttestation` models field-level source/override review with status
  values including `ACTIVE`, `STALE`, and `INVALIDATED`.
- Crawl pipeline extracts public site data, computes diffs, writes proposals,
  logs crawl outcomes, records model/field changes, and tracks errors.
- Diff engine creates field-level candidate changes with old/new values,
  confidence, mode, source URL, and excerpt.
- Review approval writes field sources and marks coverage as verified when all
  required fields have approved coverage.
- Blank fields have explicit semantics: a blank value can count as covered only
  when an admin attests it as intentionally reviewed.

This is strong evidence that Survey is not only a regulated feature.

### What does not yet align

Public-directory product is also prototype-shaped:

- `FieldSource` is field-level but not a portable claim/evidence record.
- Array fields such as schedules, pricing, and age groups are handled as whole
  field replacements; per-item provenance is coarser than Survey likely needs.
- Confidence drives proposal filtering and suppression, but not a portable
  review/promotion ladder.
- `dataConfidence = VERIFIED` is a product badge, not a Surface status.
- Crawl failures and stale public data are present as product concepts, but they
  are not yet unified into a generic freshness state.
- Admin attestation exists in two forms: a camp-specific blank-field path and a
  broader entity attestation path. Survey should learn from both, but not copy
  either directly.

### Best genericity check

Use one camp field, not the whole directory.

Proof target:

```text
camp website URL
  -> RawSource(source URL, fetch/crawl run, observed time)
  -> Extraction(registrationStatus or pricing, excerpt, confidence, model)
  -> ResolvedValue(diff/proposal with old/new/candidate rationale)
  -> ReviewPolicy(approve/reject/attest blank)
  -> VerifiedClaim(Surface-compatible public-data field claim)
```

The Public-directory product check should specifically test Survey's cross-domain semantics:

- Source URL and excerpt locator instead of PDF page/box.
- Blank value semantics: unknown vs unavailable vs intentionally not applicable.
- Crawl failure as current trust state without erasing prior verification.
- Provider/camp parent-child source reuse without pushing hierarchy into Survey
  core too early.

## Surface Alignment

### What already exists

Surface is further along than the strategy docs implied:

- `Claim` already has `impactLevel`, `confidenceBasis`, `derivedFrom`, and
  `metadata`.
- `Evidence` already has `evidenceType`, `method`, `sourceRef`,
  `sourceLocator`, excerpt/summary, observed time, collector, integrity ref,
  and metadata.
- `derivedFrom` is validated and applied transitively.
- Derived claims already inherit the weakest input status through a ranking
  model.
- Stale input status already propagates through derived chains.
- Missing derived inputs and cycles emit `unsupported_inference` transparency
  gaps.
- Claim groups and requirement rollups already cover the Veritas
  readiness-as-derived-claim direction.

This means issue `kontourai/surface#14` should probably be scoped as "deepen
and formalize derivation edges" rather than "add derivation from scratch."

### What is missing or too implicit

Surface still needs the Phase 0 and Phase 2 work from the strategy:

- No `assumed` status exists in `TrustStatus`; current status values are
  `unknown`, `proposed`, `verified`, `stale`, `disputed`, `superseded`, and
  `rejected`.
- `derivedFrom` is only a string array. It lacks method metadata such as
  `sum`, `max`, `model`, or `rule-application`.
- There is weakest-status propagation, but not a recompute/change-record model.
- There is no counterfactual traversal API: "if this input flips, which
  conclusions change?"
- There is no first-class support-strength edge. Today support strength is
  approximated through evidence method, policy requirements, and optional
  `unsupported_inference` hints.
- Materiality mostly exists as `impactLevel`, but the product language should
  decide whether that is the final materiality slot or whether claims/gaps need
  separate materiality semantics.

### Ordering adjustment

The existing Surface code suggests a sharper order:

1. Add support-strength edge semantics.
2. Add `assumed` status and propagation.
3. Decide whether `impactLevel` is the materiality slot or needs a renamed
   product-facing alias.
4. Replace or extend `derivedFrom: string[]` with a structured derivation edge
   while preserving compatibility.
5. Add recompute/change records and counterfactual traversal.

## Survey Contract Candidate

Historical note: this was the minimal contract candidate before Survey was
promoted to `kontourai/survey`. The package now exists, but the shape below
still documents the producer-neutral boundary that the implementation must not
outgrow:

```ts
type RawSource = {
  id: string;
  sourceRef: string;
  checksum?: string;
  fetchedAt?: string;
  observedAt: string;
  locatorScheme: "pdf" | "text" | "html" | "structured-field";
  metadata?: Record<string, unknown>;
};

type Extraction = {
  id: string;
  sourceId: string;
  target: string;
  value: unknown;
  locator: string;
  confidence?: number;
  method: "extraction" | "observation";
  extractor: string;
  excerpt?: string;
};

type ResolvedValue = {
  target: string;
  value: unknown;
  winnerExtractionId?: string;
  candidates: Array<{ extractionId: string; value: unknown; confidence?: number }>;
  status: "resolved" | "needs-review" | "conflict";
  rationale: string;
};

type ReviewOutcome = {
  status: "verified" | "assumed" | "rejected" | "needs-review";
  actor?: string;
  reviewedAt?: string;
  rationale?: string;
};
```

Open question: whether Survey should emit Surface `TrustInput` directly or emit
a smaller `VerifiedClaim` object that product adapters convert into Surface.
For the first proof, prefer emitting Surface-compatible fixtures without
committing to the final public API.

## First Implementation Slice

Build the first proof without creating `kontourai/survey`:

1. In `surface`, complete the small bake-ins that the proof needs:
   support-strength, `assumed`, and materiality/impact decision.
2. In the regulated-document proof, create or identify one fixture path for source document wages and federal
   retained amount.
3. Write a tiny adapter or fixture that maps that fact into Surface `TrustInput`
   with evidence method, source locator, and source identity.
4. Add one derived claim representing a derived compliance position or derived result.
5. Change the source fact in the fixture and show the derived claim becoming
   stale or recompute-needed.
6. Repeat the mapping for one Public-directory product field to test genericity.

Acceptance evidence should be fixtures and reports, not broad UI.

## Backlog Implications

Existing issues are directionally right:

- `kontourai/surface#11` support-strength edge
- `kontourai/surface#12` `assumed` status
- `kontourai/surface#13` materiality slot
- `kontourai/surface#14` derivation edges
- `kontourai/surface#15` freshness cascade
- `kontourai/surface#16` recompute records
- `kontourai/surface#17` counterfactual traversal
- `kontourai/surface#18` Veritas readiness derived claim
- regulated-document proof issue
- `public-directory proof issue` Public-directory product genericity check

Suggested issue refinement:

- Update `surface#14` to acknowledge existing `derivedFrom` behavior and focus
  on structured derivation edges plus backward compatibility.
- Keep `regulated-document-proof#1` focused on one source-document path. Avoid pulling the full return
  package into the first proof.
- Keep `public-directory#3` focused on one scalar public-data field first, then test
  arrays/blanks/failures as follow-up slices.

## Open Decisions

- Is Surface `impactLevel` the materiality slot, or should the product expose a
  separate `materiality` field/alias?
- Should Survey verified outputs be native Surface `TrustInput` or a smaller
  producer-neutral object?
- What locator grammar handles PDF boxes, text lines, HTML excerpts, and
  structured fields without becoming domain-specific?
- Should recompute be purely report-time or require a stateful
  `@kontourai/surface-derive` watcher?
- How should assumed values interact with verified values in weakest-link
  propagation: status downgrade, explicit flag, or both?
