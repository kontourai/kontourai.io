# Kontour Resource Shape

Status: convention. Applies to new portable Kontour records and additive
format evolution.

Kontour products should use a consistent resource shape for records that need
to move across products, agents, consoles, APIs, and exported evidence packages.
The shape is inspired by Kubernetes resources, but it is not a commitment to a
Kubernetes API server, controller model, or reconciliation loop.

## Why this exists

Kontour's products share one promise: show the work behind what humans and
agents are asked to trust. A consistent resource shape helps each product expose
that work without inventing a new envelope every time.

The convention gives agents and integrators a predictable place to look for:

- product and version identity
- record kind
- stable resource metadata
- subject/input details
- observed state or review outcome
- integrity proof or external verification anchors

It also forces producers to think through the properties that make a claim,
review, gate, or readiness record trustworthy enough to inspect.

## Base shape

```ts
type KontourResource<TSpec, TStatus, TProof = IntegrityProof> = {
  apiVersion: string;
  kind: string;
  metadata: ResourceMetadata;
  spec: TSpec;
  status?: TStatus;
  proof?: TProof;
};

type ResourceMetadata = {
  name?: string;
  uid?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  createdAt?: string;
};
```

Use product-scoped API versions:

- `surface.kontour.ai/v1alpha1`
- `survey.kontour.ai/v1alpha1`
- `flow.kontour.ai/v1alpha1`
- `veritas.kontour.ai/v1alpha1`

Use explicit `kind` values such as `ClaimReviewRecord`, `IntegrityAnchor`,
`TrustSnapshot`, `GateRun`, or `ReadinessReport`.

## Relationship to Console handoffs

Kontour Resource Shape is the recommended durable shape for product-owned
records. It is not the same thing as a Kontour Console event or projection.

Use the layers this way:

- product-owned resources carry durable product identity, observed state, and
  proof;
- Console events describe what happened so a management plane can replay,
  correlate, and build timelines;
- Console projections describe the current snapshot a management plane can
  render quickly;
- Sink delivery results describe whether a destination accepted a semantic
  record.

Console events and projections may carry, reference, or derive from resource
records. They should not replace the product-owned resource or make Kontour
Console the authority for Surface trust semantics, Flow gate semantics, Survey
review semantics, Veritas readiness policy, Flow Agents runtime behavior, or
vertical product domain truth.

When a Console ref points to a resource-shaped record, use `product`, `kind`,
and `id` as the minimum cross-product ref and enrich it with `apiVersion`,
`metadata.name`, and `metadata.uid` when available. This lets lightweight local
handoffs work immediately while preserving a path toward stronger resource
identity for reproducibility and versioning.

## Field rules

`apiVersion` identifies the product namespace and version of the resource
contract.

`kind` identifies the record type inside that product namespace.

`metadata` carries resource identity, labels, and annotations. It should not
carry trust semantics that other products must understand.

`spec` carries the declared subject, inputs, or record payload. For immutable
records, this is the thing that was reviewed, asserted, evaluated, or emitted.

`status` carries observed state, outcome, or evaluation results. For immutable
history records, `status` is the outcome recorded at emission time. If the
outcome changes later, emit a new record instead of mutating the signed history.

`proof` carries portable integrity and verification anchors. It is first-class
because trust infrastructure needs more than an arbitrary metadata string.

## Proof shape

Surface already has `integrityRef` fields. Those remain valid as shorthand and
for compatibility. New portable records should prefer a structured proof object
when the producer can supply enough detail.

```ts
type IntegrityProof = {
  integrityRef: string;
  algorithm?: string;
  canonicalization?: string;
  scope?: string;
  issuer?: string;
  subject?: string;
  audience?: string[];
  issuedAt?: string;
  validFrom?: string;
  validUntil?: string;
  tokenId?: string;
  artifactRef?: string;
  signature?: {
    format: "jws" | "cose" | "dsse" | "custom";
    keyId?: string;
    value?: string;
  };
};
```

JWT/JWS vocabulary is useful inspiration:

- `issuer` maps to who produced or signed the proof.
- `subject` maps to the reviewed resource, claim, or artifact.
- `audience` maps to intended consumers when that matters.
- `issuedAt`, `validFrom`, and `validUntil` capture time bounds.
- `tokenId` supports replay detection or external lookup.

Surface should not become JWT-shaped. The proof object should describe the
integrity anchor even when the proof is only a canonical hash, and it should be
able to grow toward signatures, transparency logs, C2PA, W3C Verifiable
Credentials, SLSA, in-toto, or other interoperability targets later.

## Product boundaries

Surface owns the generic trust transparency layer: claims, evidence, policies,
trust snapshots, integrity anchors, history views, and the console or API paths
used to inspect them.

Survey owns producer-side review and provenance records before the Surface
boundary: raw source, extraction, candidate, review outcome, and projection to
Surface-ready `TrustBundle`.

Flow owns process and gate records.

Veritas owns repo and change-readiness records.

Vertical products own domain meaning and policy. They should consume these
shapes rather than recreate them.

## Survey usage

Survey should use this shape for durable records that prove how a producer-side
claim was formed, reviewed, and projected:

```ts
type ClaimReviewRecord = KontourResource<
  {
    rawSourceId: string;
    extractionId: string;
    candidateSetId: string;
    selectedCandidateId?: string;
    targetClaim: {
      subject: string;
      field: string;
    };
  },
  {
    reviewStatus: "proposed" | "assumed" | "verified" | "rejected";
    reviewedBy?: string;
    reviewedAt?: string;
    projectedTrustBundleId?: string;
  }
>;
```

Survey proof should anchor the canonical review record. It proves that the
review trail was emitted by Survey and was not silently changed. It does not
prove that the real-world source was correct.

## Surface usage

Surface should use this shape for portable integrity and history records, such
as `IntegrityAnchor` and `TrustSnapshot`.

`IntegrityAnchor` should be generic enough for Survey, a third-party producer,
or another Kontour product to prove where a trust record came from. Surface may
store, query, and display those anchors without becoming the source of truth for
the underlying domain.

Surface may keep existing `TrustBundle` and claim/evidence shapes stable while
adding resource-shaped exports or companion records. Existing integrations
should not be forced through a breaking envelope migration.

## Non-goals

- This is not a truth guarantee. Kontour proves provenance and review posture;
  producers still own source interpretation and domain correctness.
- This is not a requirement to run Kubernetes or implement controllers.
- This is not a replacement for Surface's Open Trust Format.
- This is not a new product. It is a shared convention used by the products.

## Adoption guidance

Use this convention for new portable records, exported evidence packages,
cross-product artifacts, and console/API resources that agents are expected to
read. Keep older narrow helper shapes when they are local authoring ergonomics
and do not cross product boundaries.

Each product repo should link to this document from its `CONTEXT.md` and add
repo-specific guidance for how the convention applies locally.
