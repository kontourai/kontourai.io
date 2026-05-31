# Survey Proof Slice V0

Status: proof artifact. Created 2026-05-31.

This document turns the Survey idea into a small, testable contract without
creating a standalone Survey repo yet. It is intentionally narrower than the
full product: prove that tax documents and public-directory crawls can both emit
the same raw-to-reviewed claim shape, then let Surface derive and explain
downstream trust from those claims.

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

The first proof should use this producer-neutral shape. It is not yet a public
package API.

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

## Tax Proof

Use one W-2-like source and two source facts:

- `wages`
- `federalIncomeTaxWithheld`

The vertical then derives a tax-position claim:

```text
federalIncomeTaxWithheld >= expectedMinimumWithholding(wages)
```

The point is not tax correctness. The point is provenance:

```text
uploaded document
  -> extracted wages and withholding with source locators
  -> resolved values
  -> reviewed facts
  -> derived tax position
  -> corrected source creates stale/recompute pressure
```

Fixtures:

- `docs/fixtures/survey-proof-slice/tax-w2-current.surface.json`
- `docs/fixtures/survey-proof-slice/tax-w2-corrected.surface.json`

The corrected fixture deliberately models the later state as a new source and
new claims that supersede the earlier source in metadata. Surface still needs a
first-class recompute/change-record model before this can become product
behavior.

## Campfit Proof

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

- `docs/fixtures/survey-proof-slice/campfit-registration-status.surface.json`

This checks that Survey is not tax-specific: source URL, excerpt locator,
crawl model, and field-level approval should fit the same contract as a tax
document.

## Acceptance Criteria

The proof is sufficient to justify real implementation work when:

- The tax fixture validates against current Surface input schema.
- The Campfit fixture validates against current Surface input schema.
- The corrected tax fixture makes the missing Surface recompute/change-record
  behavior obvious without inventing it inside Survey.
- At least one follow-up Surface issue is refined from "add derivation" to
  "formalize structured derivation edges and recompute records."
- No standalone `survey` repo is needed to understand the first implementation
  boundary.

## Next Implementation Moves

1. Add Surface Phase 0 bake-ins: support-strength, `assumed`, materiality alias
   or decision.
2. Add structured derivation edges while preserving `derivedFrom: string[]`.
3. Implement the W-2 fixture path inside `taxes`.
4. Implement the Campfit scalar-field mapping against `campfit`.
5. Extract shared producer contract only after those two paths converge in code.
