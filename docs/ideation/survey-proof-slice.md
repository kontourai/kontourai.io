# Survey Proof Slice V0

Status: implementation proof artifact. Created 2026-05-31; refreshed
2026-06-10 after `@kontourai/survey@0.4.23` shipped.

This document records how the original Survey proof evolved into a published
package and two downstream dogfood integrations. It is intentionally narrower
than the full product: prove that regulated documents and public-directory
crawls can both emit the same raw-to-reviewed claim shape, then let Surface
derive and explain downstream trust from those claims.

Current implementation state:

- `kontourai/survey` exists as the standalone TypeScript package
  `@kontourai/survey`.
- Version `0.4.23` includes producer records, Survey-to-Surface projection
  helpers, Review Workbench resources, server-owned review session helpers, and
  server-side review-result-to-apply-action mapping helpers.
- The public-directory and regulated-rule proof consumers use the package
  through their own product adapters. Survey stays generic; product servers own
  storage, auth, target freshness, and final writes.

## Boundary

Survey owns:

- Raw source identity and retrieval context.
- Extraction observations from a source.
- Candidate resolution for a target value.
- Human or policy review outcomes.
- Promotion into verified, assumed, rejected, or needs-review claim material.

Surface owns:

- Claim status vocabulary and propagation.
- Evidence display and support strength.
- Derived claim edges.
- Freshness, stale cascades, recompute records, and counterfactual traversal.

Vertical products own:

- Domain-specific source types and field names.
- Product workflows and review UX.
- Decisions about which facts matter for the user-facing task.

## Minimal Contract

The first proof used this producer-neutral shape. The public package has since
grown into resource-shaped ReviewItem, ReviewDecision, ReviewSession, and
ReviewSessionEvent contracts plus Survey observation/projection helpers, but the
original boundary remains useful context.

```ts
type LocatorScheme = "pdf" | "text" | "html" | "structured-field";

type RawSource = {
  id: string;
  sourceRef: string;
  kind: "uploaded-document" | "web-page" | "api-record" | "manual-entry";
  checksum?: string;
  fetchedAt?: string;
  observedAt: string;
  locatorScheme: LocatorScheme;
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
  metadata?: Record<string, unknown>;
};

type ResolvedValue = {
  id: string;
  target: string;
  value: unknown;
  winnerExtractionId?: string;
  candidates: Array<{
    extractionId: string;
    value: unknown;
    confidence?: number;
  }>;
  status: "resolved" | "needs-review" | "conflict";
  rationale: string;
  metadata?: Record<string, unknown>;
};

type ReviewOutcome = {
  id: string;
  resolvedValueId: string;
  status: "verified" | "assumed" | "rejected" | "needs-review";
  actor?: string;
  reviewedAt?: string;
  rationale?: string;
  metadata?: Record<string, unknown>;
};
```

## Surface Mapping Rule

For this proof, Survey does not need to emit final Surface API objects directly.
It only needs enough information for an adapter to emit Surface-compatible
claims, evidence, and verification events.

Mapping:

- `RawSource.sourceRef` maps to Surface `Evidence.sourceRef`.
- `RawSource.checksum` maps to Surface `Evidence.integrityRef`.
- `Extraction.locator` maps to Surface `Evidence.sourceLocator`.
- `Extraction.excerpt` maps to Surface `Evidence.excerptOrSummary`.
- `Extraction.confidence` maps to `Claim.confidenceBasis.extractionConfidence`.
- `ReviewOutcome.status` maps to Surface verification event status where the
  status exists today.
- `ResolvedValue.rationale` maps to verification event notes or claim metadata.

Current Surface compatibility gap: Surface does not yet accept `assumed`, so
fixtures that need assumed semantics must either use `proposed` with metadata or
wait for the Surface Phase 0 status addition.

## Regulated Document Proof

Use one source-document source and two source facts:

- `wages`
- `federalIncomeTaxWithheld`

The vertical then derives a regulated-position claim:

```text
federalIncomeTaxWithheld >= expectedMinimumRetained amount(wages)
```

The point is not regulated correctness. The point is provenance:

```text
uploaded document
  -> extracted wages and retained amount with source locators
  -> resolved values
  -> reviewed facts
  -> derived derived compliance position
  -> corrected source creates stale/recompute pressure
```

Fixtures:

- `docs/ideation/fixtures/survey-proof-slice/regulated-document-current.surface.json`
- `docs/ideation/fixtures/survey-proof-slice/regulated-document-corrected.surface.json`

The corrected fixture deliberately models the later state as a new source and
new claims that supersede the earlier source in metadata. Surface still needs a
first-class recompute/change-record model before this can become product
behavior.

## Public-directory product Proof

Use one scalar public-directory field:

- `registrationStatus`

The proof path is:

```text
camp website URL
  -> crawl observation
  -> extracted registration status with HTML locator and excerpt
  -> resolved proposal
  -> approved field source
  -> Surface-compatible field claim
```

Fixture:

- `docs/ideation/fixtures/survey-proof-slice/public-directory-registration-status.surface.json`

This checks that Survey is not domain-specific: source URL, excerpt locator,
crawl model, and field-level approval should fit the same contract as a
regulated document.

## Acceptance Criteria

The original proof was sufficient to justify real implementation work when:

- The regulated fixture validates against current Surface input schema.
- The Public-directory product fixture validates against current Surface input schema.
- The corrected regulated fixture makes the missing Surface recompute/change-record
  behavior obvious without inventing it inside Survey.
- At least one follow-up Surface issue is refined from "add derivation" to
  "formalize structured derivation edges and recompute records."
- The first implementation boundary is clear enough to promote Survey without
  making it own crawling, parsing, ranking, domain policy, or final product
  writes.

The proof has now advanced to package-level acceptance:

- `@kontourai/survey@0.4.23` is published.
- A public-directory consumer replays persisted `ReviewSessionEvent` resources
  against a server-owned review snapshot before applying approved/rejected
  fields, and now uses the generic Survey apply-action mapper while retaining
  product-owned field writes.
- A regulated-rule consumer stores server-owned Survey review sessions and uses
  Survey apply derivation for rule conflict review actions while preserving an
  explicitly internal legacy decision path and rule-specific validation.
- Both consumers keep product-specific source acquisition, review policy,
  target freshness, authorization, and writes outside Survey.
- CI gates should keep those downstream proofs from regressing.

## Next Implementation Moves

1. Keep downstream CI gates on the Survey proof paths: public-directory review
   session/apply/browser checks and regulated-rule session/apply tests.
2. Continue deleting consumer boilerplate only when Survey can provide a generic
   helper without product branches.
3. Keep the server apply contract explicit: browser-submitted events are replay
   material, not write authority.
4. Use the next proof to decide whether Survey needs shared queue/session APIs
   beyond the current package helpers.
5. Keep Surface-derived trust behavior in Surface. Survey produces reviewed
   claims and provenance; Surface owns derived claim dependencies, freshness,
   and trust reports.
