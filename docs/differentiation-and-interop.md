# Differentiation and Interop

## The category claim

Kontour is inspectability infrastructure for AI-assisted work.

That is a specific, bounded claim. Adjacent categories — observability, evals,
GRC, code review, human-in-the-loop tooling, provenance signing — each produce
either records of what happened or opinions about quality. None combines
adjudicable claims, recomputable status derived from append-only testimony,
and authority-traced contestation as first-class primitives. That combination
is the unoccupied ground.

---

## How we are different

### Observability and evals

LangSmith, Langfuse, Arize, Braintrust, and their peers track traces and
attach probabilistic eval scores to mutable state. The artifact is an
engineering dashboard: useful for iteration, not for review, audit, or
downstream consumers who need to know whether a piece of work can be trusted.
There is no deterministic status function, no authority model, and no way to
formally dispute a verdict. Kontour produces adjudicable records — the same
bundle, the same function, the same inputs give the same answer to anyone who
runs the computation. These platforms are also Kontour's richest evidence
sources: their traces feed testimony, they are not head-on rivals.

### GRC and compliance automation

Vanta, Drata, and Credo AI automate evidence collection at control and program
granularity: is MFA enabled, is an access review complete, does this system
have an ISO 42001 program. Their evidence answers "is the control configured."
EU AI Act Articles 12 and 19, and Annex IV, demand event-level traceability
about what an AI system did and what was verified about specific work products
— the granularity GRC cannot reach. Kontour operates at the work-product level
and is designed to be the evidence source those programs pull from, not a
replacement for them.

### Code review

CodeRabbit, Greptile, GitHub Copilot code review, and their peers answer "is
this diff good" with AI-generated comments that vanish after merge. None
maintains a recomputable merge-readiness status derived from declared repo
standards, none accumulates a ledger of what was verified across merges, and
none models authority over disputes or AI-producer provenance. Veritas is the
standards-compliance ledger that reviewers, CI, and humans write into. The
value is what it remembers and recomputes; the gate UI is not the product.

### Human-in-the-loop tooling

Standalone approval APIs (HumanLayer, gotoHuman) and platform-native approval
mechanics (Copilot Studio, LangGraph interrupts, AgentCore policy gates) are
converging on commodity pause mechanics. The approval button is not the hard
part. The durable, recomputable record of who approved what, under which
authority, and what the claim state was at the moment of approval — that
record is what survives agent memory loss, audits, and downstream handoffs.
Flow records authority-traced approval events as append-only testimony;
pressing the button is just the input.

### Provenance and attestation

C2PA signs media bytes. in-toto and SLSA attest how a software artifact was
built, keyed by content digest. DataTrails offered horizontal immutable audit
trails without a domain-specific meaning layer; it was quietly acquired after
limited traction — a warning that append-only storage alone does not sell.
These mechanisms are signing infrastructure. Kontour adds the semantics above
the signature: claims that evolve over time, a status function anyone can
recompute, inquiries that honestly report gaps, and authority-gated contestation
that can change an outcome without mutating history.

---

## Plays nicely

| Standard | What it is | How Kontour uses it | What Kontour adds |
|---|---|---|---|
| **C2PA / Content Credentials** | Cryptographic provenance for media assets. A signed manifest of assertions bound to asset bytes, chaining across edits. Governed by the C2PA coalition; being fast-tracked as ISO/DIS 22144. | Consume C2PA manifests as a high-grade evidence class on Kontour claims. Emit C2PA assertions when an AI-assisted deliverable is a media file. Publish explicit vocabulary mappings: C2PA assertion ≈ testimony item; C2PA claim ≈ frozen signed snapshot. | The lifecycle after the signature — post-hoc verification, status that evolves, contestation, and authority-gated resolution of claims about work rather than files. C2PA is frozen at signing time; Kontour status is recomputed from accumulating testimony. |
| **W3C Verifiable Credentials 2.0 + PROV-O** | VC 2.0 (W3C Recommendation, May 2025) defines tamper-evident issuer-signed claims. PROV-O (stable since 2013) models Entities, Activities, Agents, and delegation via `wasGeneratedBy`, `wasAttributedTo`, `actedOnBehalfOf`. | Emit verification events as VCs signed by the verifying authority. Use DIDs / Controlled Identifiers for actor identity. Publish a JSON-LD context so `hachure.org/v1` documents carry PROV-O terms (`prov:actedOnBehalfOf`, `prov:wasDerivedFrom`) for semantic-web interop. | VC status is issuer-asserted (the issuer flips a revocation bit); Kontour status is recomputed from testimony by anyone. VC has no evidence model and no inquiry primitive. PROV records what happened but has no concept of claims being verified, contested, or resolved. |
| **in-toto / SLSA / DSSE / Sigstore** | The software supply-chain attestation stack. in-toto Statements = subject digests + typed predicates. SLSA v1.2 (Nov 2025) is the flagship predicate. DSSE is the signing envelope. Sigstore provides cosign, Fulcio (keyless certs), and Rekor v2 (append-only transparency log, GA Oct 2025). | Ship `hachure.org/v1` as an in-toto `predicateType`, inheriting DSSE signing and the cosign toolchain. Anchor testimony log entries in Rekor (or a Tessera-based log) for third-party append-only witnessing. Consume SLSA provenance as evidence on claims about software deliverables. Do not invent an envelope or a log. | in-toto and SLSA cover how an artifact was built, keyed by content digest, with binary pass/fail at admission time. No claim lifecycle — attestations are never semantically disputed or superseded. No human or authority dispute resolution. No inquiry primitive. The whole stack is unused for claims about knowledge work and decisions that do not reduce to a hashable artifact. |
| **SARIF** | OASIS standard JSON format for static-analysis results (v2.1.0). A `result` carries rule ID, severity, stable fingerprint, and `baselineState`. Emitted by CodeQL, ESLint, Semgrep, Trivy, Snyk; ingested by GitHub code scanning. | First-class SARIF consumer: each run becomes a batch of evidence events (tool identity → authority trace; fingerprint → claim correlation). Optionally emit SARIF so trust status surfaces inside GitHub code scanning UIs. Do not define a parallel findings format. | SARIF is one-shot tool output with no signatures, no append-only history (each upload replaces the picture), no authority model for who may waive a finding, no claim semantics across tools. Kontour can express what SARIF cannot: "finding disputed by a reviewer holding authority X, status recomputed." |
| **OpenTelemetry GenAI semantic conventions** | `gen_ai.*` attributes, spans, metrics, and events for LLM and agent operations — model spans, agent/tool-execution spans, token usage, MCP conventions. Development/experimental status as of mid-2026; CNCF-governed. | Reference OTel trace IDs from Kontour evidence records so "show the work" drills into what the agent actually executed. Map `gen_ai.agent.*` and MCP attributes into authority traces. Emit trust-status changes as OTel events so status appears in existing dashboards. Do not build a tracing SDK. | Observability is not inspectability. OTel describes what a system did for debugging; telemetry is mutable, sampled, and retention-limited. Kontour turns selected telemetry into durable, signed, disputable testimony. |
| **EU AI Act** | Regulation (EU) 2024/1689. For high-risk systems: Article 11 + Annex IV require technical documentation and validation results; Articles 12 and 19 mandate automatic event logging sufficient for traceability, retained at least six months; Article 18 requires Annex IV documentation for ten years. High-risk standalone obligations delayed to December 2027 by the Digital Omnibus provisional agreement of May 2026. | Position the testimony log as an Article 12/19-grade logging substrate — append-only integrity is a strictly better story than mutable logs when facing market-surveillance authorities. Generate Annex IV evidence sections from claim and verification records. Tag claims with JTC 21 / ISO 42001 control mappings. | The Act is a demand generator, not a competing format. No EU instrument specifies a data interchange schema; JTC 21 harmonized standards (prEN 18228, 18284, 18286) specify management processes. Kontour is the artifact-level substrate those programs pull from — the granularity GRC automation cannot reach. |

---

## Recompute it yourself

Status in the Kontour Trust Format is a pure, versioned, deterministic function:

```
status = f(claim, evidence, events, policy, authorityTrace, now)
```

The function is specified in `spec/status-function.md` (namespace
`hachure.org/v1`, `STATUS_FUNCTION_VERSION = "1"`). The same inputs and
the same version must produce the same status in any conforming implementation.
`now` is an explicit argument so point-in-time views are reproducible without
clock-tick events or background expiry.

The specification is executable. `spec/conformance/` contains fixture bundles
with expected per-claim statuses at a fixed `now`, covering commit-scoped
verification, duration-based staleness, blocking-evidence disputes, and
authority-gated resolution. The test at `tests/spec-conformance.test.ts` loads
every fixture and asserts the reference implementation matches. An independent
implementation can run the same fixtures without touching any Kontour product.

This is the same move transparency logs made for certificates and Sigstore made
for builds, applied to claims about work. Asking you to trust a dashboard is not
the same thing as publishing the function.

---

## Assert. Observe. Resolve.

Every Kontour product is an implementation of three verbs over one ledger.

**Assert** — say what you believe, on the record. Claims registered with
subject, value, and impact.

**Observe** — attach what actually happened, append-only. Evidence,
verification events, attestations, testimony that never mutates.

**Resolve** — ask anything; every answer comes with receipts or admits it has
none. Inquiries that match a claim, derive through a named rule, or honestly
report the gap.

The discipline holding all three together: nothing inside the trust layer
silently decides. Models may propose, and proposals are records.
