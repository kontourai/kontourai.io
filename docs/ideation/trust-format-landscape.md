# Trust Format Landscape: Standards, Competitors, Positioning, Naming

Research snapshot dated 2026-06-10. This is a competitive and standards landscape for the Kontour trust format (claims + evidence + verification events + authority traces + inquiries; namespace `hachure.org/v1`) and its products (Surface, Survey, Flow, Veritas, Console). It covers: standards to align or interoperate with, adjacent competitors, positioning synthesis, and a name-collision sniff on three candidate format names. Web-sourced; key claims cite sources inline and in the Sources section. The trademark section is a sniff test, not legal advice.

## How to read this

The recurring pattern across both standards and products: everyone produces either *records of what happened* (traces, attestations, control snapshots, approval events) or *opinions about quality* (eval scores, review comments, guardrail verdicts). Nobody combines claims, evidence, verification events, authority traces, and inquiries with a deterministic status function recomputable by anyone from append-only testimony. That combination — especially the contestation primitive (inquiries with authority-gated resolution) — is unoccupied. The corollary: almost every system below is an evidence *input* or a status *output surface* for Kontour, not a head-on rival on format semantics. The head-on risks are distribution, not data model.

## 1. Standards to align or interop with

### C2PA / Content Credentials

What it covers: cryptographically verifiable provenance for media assets. The unit is the C2PA Manifest — a set of assertions (actions, capture metadata, AI-generation flags) gathered into a signed claim, bound to asset bytes via hard bindings, chaining across edits via ingredient manifests. Spec v2.4 published April 2026; governed by the C2PA coalition (Adobe, Microsoft, Google, OpenAI) under the Linux Foundation, with a formal conformance program; being fast-tracked through ISO as ISO/DIS 22144 "Authenticity of information — Content credentials."

Overlap: the strongest conceptual overlap of any standard — it literally has claims, assertions, and signatures over evidence. But its claims are about media-file provenance only, frozen at signing time, evaluated by a validator at consumption time. No status evolving over time, no dispute or inquiry mechanism, no append-only testimony stream, no authority model beyond X.509 trust lists.

Play nicely: consume C2PA manifests as a high-grade evidence class on Kontour claims; emit C2PA assertions when an AI-assisted deliverable is a media file; map vocabulary explicitly (C2PA assertion ≈ Kontour testimony item; C2PA claim ≈ a frozen signed snapshot). Gap Kontour fills: the lifecycle after the signature — post-hoc verification, contestation, and authority-gated resolution of claims about work rather than files.

### W3C Verifiable Credentials 2.0 and PROV-O

What they cover: VC Data Model 2.0 (W3C Recommendation, 15 May 2025, part of a seven-spec family including Data Integrity and Bitstring Status List) defines tamper-evident claims by an issuer about a subject, held and presented by a holder. W3C PROV/PROV-O (Recommendations since 2013, stable) models Entities, Activities, and Agents with relations like `wasGeneratedBy`, `wasAttributedTo`, and `actedOnBehalfOf`.

Overlap: VC claims are issuer-signed statements about subjects, but VC status is issuer-asserted mutable state (the issuer flips a revocation bit) — not recomputed from testimony by anyone. PROV's entity/activity/agent triad and `actedOnBehalfOf` map cleanly onto Kontour authority traces.

Play nicely: emit verification events as VCs signed by the verifying authority; use DIDs/Controlled Identifiers for actor identity; publish a JSON-LD context so `hachure.org/v1` documents carry PROV-O terms (`prov:actedOnBehalfOf`, `prov:wasDerivedFrom`) for semantic-web interop — this is cheap and buys real credibility. Gap Kontour fills: VC has no evidence model and no inquiry primitive; PROV records what happened but has no concept of claims being verified, contested, or resolved.

### in-toto / SLSA / DSSE / Sigstore

What they cover: the software supply-chain attestation stack. in-toto Statements = subjects (artifact digests) + a typed predicate; SLSA Provenance is the flagship predicate (SLSA v1.2 released November 2025, OpenSSF-governed); DSSE is the signing envelope; Sigstore supplies cosign (signing), Fulcio (keyless certs bound to OIDC identity), and Rekor (public append-only transparency log; Rekor v2 went GA October 2025 with stronger append-only witnessing). GitHub Artifact Attestations and npm provenance build on this stack.

Overlap: Kontour's closest architectural sibling. Signed attestations ≈ testimony; typed predicates ≈ claim/evidence schemas; Rekor ≈ append-only testimony log; SLSA policy verification ≈ a deterministic recomputable status function. The difference is domain: in-toto/SLSA attest how an artifact was built, keyed by content digest, with binary pass/fail at admission time.

Play nicely — this is the highest-leverage interop in the report: define `hachure.org/v1` as an in-toto `predicateType`, instantly inheriting DSSE signing and the cosign toolchain; anchor testimony log entries in Rekor (or run a Tessera-based log) for third-party append-only witnessing; consume SLSA provenance as evidence on claims about software deliverables, which makes Veritas verdicts composable with GitHub's attestation story. Gap Kontour fills: no claim lifecycle (attestations are never disputed or superseded semantically), no human/authority dispute resolution, no inquiry primitive, and the whole stack is useless for claims about knowledge work and decisions that do not reduce to a hashable artifact.

### SARIF

What it covers: OASIS standard JSON format for static-analysis results (v2.1.0 standard since 2020; v2.2 in development in the OASIS TC). A `result` carries ruleId, severity, locations, stable fingerprints, and `baselineState` (new/unchanged/fixed). Emitted by CodeQL, ESLint, Semgrep, Trivy, Snyk and most SAST tools; GitHub code scanning ingests any valid SARIF 2.1.0 file.

Overlap: a SARIF result is machine-generated testimony — a tool asserting a finding with severity and a stable fingerprint. `baselineState` is a primitive status-over-time idea. But SARIF is one-shot tool output: no signatures, no append-only history (each upload replaces the picture), no authority model for who may waive a finding, no claim semantics across tools.

Play nicely: be a first-class SARIF consumer — each run becomes a batch of evidence events (tool identity → authority trace; fingerprint → claim correlation), and Kontour can express what SARIF cannot ("finding disputed by a reviewer holding authority X, status recomputed"). Optionally emit SARIF so trust status surfaces inside GitHub code scanning UIs. This is the cheapest credible Veritas integration.

### OpenTelemetry GenAI semantic conventions

What they cover: `gen_ai.*` attributes, spans, metrics, and events for LLM and agent operations — model spans, agent/tool-execution spans, token usage, plus MCP conventions. Still Development (experimental) status as of mid-2026, with an explicit opt-in stability migration plan; CNCF-governed, with Microsoft and Cisco/Outshift driving multi-agent additions.

Overlap: none on semantics — OTel describes what an AI system did for debugging. No claims, no evidence, no verification, no integrity guarantees; telemetry is mutable, sampled, retention-limited.

Play nicely: reference OTel trace IDs from Kontour evidence records so "show the work" drills down into what the agent actually executed; map `gen_ai.agent.*` and MCP attributes into authority traces; emit trust-status changes as OTel events so status appears in existing dashboards. Gap Kontour fills: observability is not inspectability — Kontour turns selected telemetry into durable, signed, disputable testimony.

### Model cards / data cards / system cards

What they cover: documentation conventions, not protocols. Hugging Face's README-plus-YAML-frontmatter model card is the de facto format; datasheets for datasets and Google's Data Cards Playbook cover data; frontier labs publish system cards per release (Anthropic, OpenAI, Google DeepMind). No standards body; increasingly pulled toward EU AI Act Annex IV content.

Overlap: cards are unverified self-attested claims in prose — "we evaluated X and found Y" with no machine-checkable evidence linkage, no signatures, no update semantics, no way to contest. They are claims without the rest of Kontour's pipeline.

Play nicely: decompose a card into structured claims (each eval result, limitation, and intended-use statement becomes a claim with attached evidence) and render a card as a human-readable view over a Kontour claim set — "a model card whose every line has recomputable trust status" is a crisp demo of the entire thesis.

### EU AI Act

What it covers (relevant parts): Regulation (EU) 2024/1689. For high-risk systems: Article 11 + Annex IV technical documentation (development process, validation/testing procedures and results, lifecycle change records); Article 12 automatic event logging sufficient for traceability; Article 19 providers must retain automatically generated logs at least six months (Article 26(6) imposes the same on deployers); Article 18 requires keeping Annex IV documentation ten years; Article 43 conformity assessment is mostly internal self-assessment against harmonized standards. Timeline caveat: on 7 May 2026 the Council and Parliament provisionally agreed the Digital Omnibus on AI, delaying stand-alone high-risk obligations from August 2026 to 2 December 2027 (embedded high-risk to August 2028), largely because harmonized standards were not ready. CEN-CENELEC JTC 21 is drafting those standards (prEN 18228 risk management, prEN 18284 data governance, prEN 18286 QMS) with accelerated procedures targeting availability by late 2026.

Overlap: the Act is a demand generator, not a competing format. Articles 12/19 effectively mandate an audit trail with traceability and Annex IV demands documented verification results — exactly the artifact class Kontour produces — but no EU instrument specifies any data format, and JTC 21 standards specify management processes, not interchange schemas.

Play nicely: position the testimony log as an Article 12/19-grade logging substrate (append-only is a strictly better integrity story than mutable logs when facing market-surveillance authorities); generate Annex IV evidence sections from claim/verification records; tag claims with JTC 21 / ISO control mappings. The omnibus delay extends the runway for "compliant by construction" positioning rather than killing it.

### Adjacent, briefly

OpenAI's Agents SDK has a proprietary trace/span format with no claim semantics; Anthropic has published no trace format and ecosystem energy is consolidating on OTel GenAI/MCP. AGNTCY (Linux Foundation since July 2025) defines agent description/directory/identity — a useful source of agent identity for authority traces, not a verification format. NIST AI RMF (plus the GenAI Profile, AI 600-1) and ISO/IEC 42001:2023 (with auditor-qualification standard ISO/IEC 42006:2025) define governance vocabulary and management systems whose audits need exactly the evidence Kontour's log produces; both are mapping targets, not formats.

## 2. Competitors and adjacent products

### AI observability and evals

LangSmith (LangChain; $125M raised Oct 2025 at $1.25B) positions as agent/LLM observability and evals: traces, datasets, LLM-as-judge evals, human annotation queues, 30+ evaluator templates. What it actually verifies is runtime behavior quality — probabilistic scores attached to mutable traces for engineers. Langfuse, the open-source default, was acquired by ClickHouse in January 2026; its "mostly immutable" ClickHouse observations table is an engineering optimization, not a trust guarantee — no claims, authority, or inquiries. Arize ($70M Series C, Feb 2025; Datadog and M12 investors) brings OTel traces plus eval/drift monitoring and the deepest enterprise ML distribution. W&B Weave (CoreWeave since March 2025) is model-improvement-loop oriented — lowest overlap with Kontour. Braintrust ($80M Series B, Feb 2026, $800M post; Notion, Replit, Cloudflare customers) is the strongest AI-native developer brand in evals.

Honest read: all five track traces + eval scores + sometimes human annotations. None has a deterministic recomputable status, append-only testimony semantics, authority modeling, or a dispute primitive — their artifacts are internal engineering dashboards, not adjudicable records for reviewers, auditors, or downstream consumers. They would crush Kontour on any pitch that sounds like "tracing and evals for your AI app" (developer distribution, framework gravity, funding). They are also Kontour's richest evidence sources: partner surface, not battlefield.

### Agent governance and guardrails

Guardrails AI ($7.5M seed) runs 100+ runtime validators — ephemeral pass/fail with no record-keeping; its verdicts are verification events Kontour should ingest. Lakera (acquired by Check Point for ~$300M, Nov 2025) does runtime attack defense — orthogonal in substance, but Check Point's channel could bundle confusing "AI trust" messaging. Credo AI is the closest positioning collision ("AI governance," "evidence," Agent Registry, GAIA governance agent): its evidence is questionnaires and document collection mapped to EU AI Act / NIST / ISO 42001 at the system/program level — no claim-level granularity, no recomputation, no producer provenance; strong CISO distribution; plausible partner or acquirer. IBM watsonx.governance unifies agentic governance and security with evaluation metrics and a governed catalog, and wins regulated-enterprise RFPs on brand and framework coverage — but is stack-bound and metrics-centric rather than testimony-centric. The big 2025–2026 motion is platform agent identity: Microsoft Entra Agent ID and Agent 365 (GA May 2026), AWS Bedrock AgentCore Identity/Policy — these own who an agent is and what it may touch, normalize agent governance as a category, and produce none of the claim/evidence structure about agent *outputs*. Integrate with their identity, do not rebuild it.

### GRC and compliance automation

Vanta ($150M Series D at $4.15B, July 2025; ISO 42001 and EU AI Act products) and Drata ($100M+ ARR, 7,000+ customers, acquired SafeBase for $250M in Feb 2025) define "automated evidence collection" as API integrations pulling control-configuration state (MFA on? encryption enabled? access review done?) mapped to framework controls at the organization/system level. Neither touches evidence about individual AI-assisted work products. They would obliterate Kontour in any "compliance automation" framing — auditor networks, thousands of customers, the word "evidence" already owned in that buyer's head. The SafeBase acquisition shows GRC buying outward-facing trust artifacts (company-level trust centers) — directionally like Surface but at company granularity, which is exactly the granularity gap Kontour defends. The right relationship: Kontour attestations feed Vanta/Drata controls as evidence sources for ISO 42001/AI Act programs.

### Human-approval / HITL tooling

The cautionary tale: HumanLayer (YC F24, the most-cited HITL pure-play) pivoted away from standalone approval APIs into CodeLayer, a Claude Code orchestration IDE — evidence the "approval API" wedge alone is too thin. gotoHuman remains an indie-scale review-inbox tool whose approvals vanish into webhooks. Meanwhile approval UX is becoming a platform feature (Copilot Studio multistage approvals, LangGraph interrupts, AgentCore policy gates). Lesson for Flow: approvals are commodity input; the durable, recomputable record of who approved what, under which authority, and what changed since is the value — the Slack button is not.

### Provenance startups

Truepic (~$37M raised; founding C2PA member) does authenticated capture and C2PA credentials for media — different provenance object (pixels vs. claims about work), and its trajectory validates "provenance as infrastructure." DataTrails (ex-RKVST), the closest architectural cousin (immutable audit trails as a service), was quietly acquired by ONID in August 2025 after limited traction — a warning that horizontal "immutable audit trail" does not sell without a domain-specific meaning layer. EQTY Lab does hardware-rooted verifiable compute (Intel TDX + NVIDIA confidential computing, Accenture public-sector deals): it proves a computation happened as claimed — the strongest technical verification in the landscape — but cannot express claims, disputes, or producer provenance in human workflows. EQTY certificates are premium evidence objects in Kontour's format; complementary layers.

### AI code review / merge readiness (vs. Veritas)

CodeRabbit ($60M Series B; 2M+ connected repos), Greptile ($25M Series A, Benchmark), Graphite (acquired by Cursor, Dec 2025), and GitHub Copilot code review (GA April 2025, 1M users in a month) all answer "is this diff good?" with AI comments — opinions that disappear after merge. None maintains a deterministic, recomputable merge-readiness status derived from declared repo standards plus accumulated verification events, and none models authority over disputes or AI-producer provenance. Veritas's opening is to be the standards-compliance ledger that reviewers, CI, and humans write into — not another reviewer. The threat is distribution: GitHub and Cursor own the merge surface, and a native "merge readiness" feature from either would commoditize a standalone gate overnight. Veritas must be valuable for what it remembers and recomputes, not for the gate UI.

## 3. Positioning synthesis

### Lean in (where evidence-backed claims + recomputable status is unique)

1. Own "inspectability of AI-assisted work" as the category, and refuse every adjacent framing. "Observability," "evals," "guardrails," "compliance automation," and "code review" each have a funded incumbent with distribution; none of those words describes a deterministic status function over append-only testimony with authority-gated inquiries. The contestation primitive in particular — disputes as first-class, resolvable only by traced authority — exists nowhere else in this landscape and should headline the format story.
2. Lead with recomputability as the trust claim. Every adjacent system asks you to trust its dashboard (mutable state, issuer-asserted status, vendor-scored evals). Kontour's pitch — anyone can recompute a claim's status from the testimony log and get the same answer — is the same move transparency logs made for certificates and Sigstore made for builds, applied to work. Make "recompute it yourself" a literal product affordance.
3. Make Veritas the ledger behind the reviewers, not a reviewer. Consume CodeRabbit/Greptile/Copilot findings and SARIF runs as testimony; let the recomputable merge-readiness status — and its memory across merges — be the product. This sidesteps the GitHub/Cursor distribution threat by being the thing their features write into.
4. Sell the EU AI Act runway as "evidence-by-construction," targeting the artifact level GRC cannot reach. Vanta/Drata/Credo stop at control and program granularity; Articles 12/19 and Annex IV demand event-level traceability that only something shaped like Kontour's log produces. The omnibus delay to December 2027 is time to become the substrate those programs pull from, with claims pre-mapped to JTC 21 / ISO 42001 controls.
5. Use the model/system card decomposition as the flagship demo of Surface. "Here is a published system card; here is the same card where every sentence is a claim with evidence, status, and an open-inquiry count" is the most legible possible illustration of "show the work behind AI," aimed at documents the industry already argues about.

### Interop (where adopting/emitting existing standards beats inventing)

1. Ship `hachure.org/v1` as an in-toto predicate type with DSSE signing, and anchor the testimony log in a transparency log (Rekor or a Tessera-based log). This inherits a mature signing/verification toolchain and makes "append-only" independently witnessable instead of self-asserted. Do not invent an envelope or a log.
2. Adopt PROV-O vocabulary (via a JSON-LD context) for authority traces and emit verification events as W3C VCs where a portable, issuer-signed artifact is needed. Identity via DIDs/Controlled Identifiers; do not invent an identity or delegation vocabulary.
3. Consume and emit SARIF for everything code-shaped. Ingestion gets every SAST tool for free; emission puts trust status inside GitHub code scanning. Do not define a parallel findings format.
4. Treat OTel GenAI traces as the evidence drill-down, not a competing record. Reference trace IDs from evidence; map `gen_ai.agent.*`/MCP attributes into authority traces; emit status changes as OTel events. Do not build a tracing SDK.
5. Consume C2PA manifests as evidence and emit C2PA assertions for media deliverables; map terminology publicly (assertion/claim/testimony) so the formats read as siblings, especially as ISO 22144 lands. Do not extend Kontour's format to cover byte-level media binding — C2PA already won that.

## 4. Name-collision sniff: Hachure, Linework, Ledgerline

Sniff test via web-visible sources (npm/PyPI registries, GitHub, Justia/uspto.report-indexed results); not legal advice, and negative trademark results mean "nothing surfaced," not "nothing exists." A formal clearance search is warranted before committing to any name.

Hachure / Hachures — medium risk, best of the three for a developer data format. Dictionary meaning: cartographic relief lines (generic in graphics/maps; the term appears as a feature name in Rough.js, ArcGIS, Surfer, QGIS tooling). Collisions: hachure.io is a live SaaS-ish business (renders for solar/wind/storage developers) and hachureca.com is a Canadian career platform; the github.com/hachure org exists but is empty. Clean where it matters for a format: npm `hachure` and `hachures` are unregistered (404; only the adjacent `hachure-fill` polygon utility exists), PyPI `hachure` is open, GitHub repo search shows only small cartography utilities, and no HACHURE trademark surfaced in any class. Distinctive for a trust format (arbitrary term, provided the product is not map/graphics-related).

Linework — medium-high risk, the most crowded. linework.app is an active tattoo-business SaaS with an Android app and Zapier listing; Project Linework is a well-known open cartographic vector data project (literally a data-format-adjacent use of the name); and Naver/LINE's enterprise platform LINE WORKS is one letter away with serious legal capacity. npm/PyPI are open and the GitHub user is dormant, but the brand space is contested. Only unrelated-class marks surfaced (LINEWORKS CONSTRUCTION, Reg. 5604303; LINE WORK BUCKET PRODUCTS, SN 97211164).

Ledgerline — medium risk with a hard blocker: the exact npm name `ledgerline` is taken by an active expense-tracking CLI (v0.1.3, published Aug 2025). ledgerline.app is a live accounting/inventory SaaS (Nigeria-focused), the GitHub user is squatted, and the name attracts constant independent fintech reinvention. No LEDGERLINE mark surfaced, but the name sits adjacent to the actively enforced LEDGER family (Ledger SAS hardware wallets; LEDGEREDGE Reg. 6542547 in Class 9). Semantically it also implies accounting, which mismatches a general trust format.

Read: if choosing among these three for the format name, Hachure is the relatively cleanest (open package namespaces, no surfaced marks, collisions confined to non-developer verticals), with the caveat that the GitHub org and .io domain are taken and the word is generic within cartography. Linework has a same-name open data project plus a near-name giant; Ledgerline loses the npm namespace outright.

## Sources

Standards:

- C2PA specification v2.4: https://spec.c2pa.org/specifications/specifications/2.4/specs/C2PA_Specification.html and conformance program: https://c2pa.org/conformance/
- ISO/DIS 22144 Content credentials: https://www.iso.org/standard/90726.html
- W3C Verifiable Credentials 2.0 Recommendation press release (May 2025): https://www.w3.org/press-releases/2025/verifiable-credentials-2-0/ and VC overview: https://www.w3.org/TR/vc-overview/
- W3C PROV-O: https://www.w3.org/TR/prov-o/
- in-toto attestation spec: https://github.com/in-toto/attestation/blob/main/spec/v1/envelope.md and SLSA provenance predicate: https://github.com/in-toto/attestation/blob/main/spec/predicates/provenance.md
- SLSA v1.2 (Nov 2025): https://slsa.dev/spec/v1.2/ and announcement: https://slsa.dev/blog/2025/11/announce-slsa-v1.2
- Sigstore Rekor v2 GA (Oct 2025): https://blog.sigstore.dev/rekor-v2-ga/ and cosign: https://github.com/sigstore/cosign
- SARIF v2.1.0 OASIS Standard: https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html and SARIF 2.2 development: https://github.com/oasis-tcs/sarif-spec
- GitHub SARIF support for code scanning: https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning
- OpenTelemetry GenAI semantic conventions: https://opentelemetry.io/docs/specs/semconv/gen-ai/ and agent spans: https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/
- Hugging Face model cards: https://huggingface.co/docs/hub/model-cards ; Anthropic system cards: https://www.anthropic.com/system-cards ; Google DeepMind model cards: https://deepmind.google/models/model-cards/
- EU AI Act Article 19: https://artificialintelligenceact.eu/article/19/ and Article 26: https://artificialintelligenceact.eu/article/26/ ; implementation timeline: https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act
- Digital Omnibus on AI provisional agreement (7 May 2026): https://www.consilium.europa.eu/en/press/press-releases/2026/05/07/artificial-intelligence-council-and-parliament-agree-to-simplify-and-streamline-rules/ ; analysis: https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/
- CEN-CENELEC JTC 21: https://jtc21.eu/ and acceleration measures (Oct 2025): https://www.cencenelec.eu/news-events/news/2025/brief-news/2025-10-23-ai-standardization/ ; EC standardisation: https://digital-strategy.ec.europa.eu/en/policies/ai-act-standardisation
- AGNTCY at Linux Foundation: https://www.linuxfoundation.org/press/linux-foundation-welcomes-the-agntcy-project-to-standardize-open-multi-agent-system-infrastructure-and-break-down-ai-agent-silos
- OpenAI Agents SDK tracing: https://openai.github.io/openai-agents-python/tracing/

Competitors:

- LangSmith: https://www.langchain.com/langsmith-platform and evaluator templates: https://www.langchain.com/blog/reusable-langsmith-evaluator-templates
- Langfuse acquisition by ClickHouse (Jan 2026): https://clickhouse.com/blog/clickhouse-acquires-langfuse-open-source-llm-observability
- Arize $70M Series C: https://www.prnewswire.com/news-releases/arize-ai-secures-70m-series-c-to-fix-ais-biggest-problem-making-llms-and-ai-agents-work-in-the-real-world-302381601.html
- CoreWeave/W&B Weave: https://coreweave.com/blog/coreweave-completes-acquisition-of-weights-biases and https://wandb.ai/site/weave/
- Braintrust $80M Series B (Feb 2026): https://www.braintrust.dev/blog/announcing-series-b
- Guardrails AI: https://github.com/guardrails-ai/guardrails ; Check Point acquires Lakera: https://www.checkpoint.com/press-releases/check-point-acquires-lakera-to-deliver-end-to-end-ai-security-for-enterprises/
- Credo AI: https://www.credo.ai/product ; IBM watsonx.governance agentic announcement: https://newsroom.ibm.com/2025-06-18-ibm-introduces-industry-first-software-to-unify-agentic-governance-and-security
- Microsoft Entra Agent ID: https://learn.microsoft.com/en-us/entra/agent-id/what-is-microsoft-entra-agent-id
- Vanta ISO 42001: https://www.vanta.com/products/iso-42001 ; Drata: https://drata.com/ and SafeBase acquisition: https://techcrunch.com/2025/02/12/security-compliance-firm-drata-acquires-safebase-for-250m/
- HumanLayer/CodeLayer: https://www.humanlayer.dev/ and https://www.ycombinator.com/companies/humanlayer ; gotoHuman: https://www.gotohuman.com/
- Truepic: https://www.truepic.com/ ; DataTrails: https://www.businesswire.com/news/home/20231114945413/en/RKVST-Rebrands-as-DataTrails ; EQTY Lab Verifiable Compute: https://www.businesswire.com/news/home/20241218897420/en/EQTY-Lab-Intel-and-NVIDIA-Unveil-Verifiable-Compute-A-Solution-to-Secure-Trusted-AI
- Code review category: https://siliconangle.com/2025/09/23/greptile-bags-25m-funding-take-coderabbit-graphite-ai-code-validation/ ; Greptile benchmarks: https://www.greptile.com/benchmarks ; Cursor acquires Graphite: https://fortune.com/2025/12/19/cursor-ai-coding-startup-graphite-competition-heats-up/ ; Copilot code review: https://docs.github.com/copilot/concepts/agents/code-review

Naming sniff:

- Hachure meaning: https://en.wikipedia.org/wiki/Hachure_map ; hachure.io: https://www.hachure.io/ ; hachureca.com: https://hachureca.com/ ; npm hachure-fill: https://registry.npmjs.org/hachure-fill ; QGIS hachures repo: https://github.com/pinakographos/Hachures
- Linework: https://zapier.com/apps/linework/integrations (linework.app) ; Project Linework: https://github.com/mapsam/project-linework ; LINE WORKS: https://sumble.com/tech/line-works ; LINEWORKS CONSTRUCTION mark: https://trademarks.justia.com/875/35/lineworks-construction-87535828.html
- Ledgerline: npm package https://registry.npmjs.org/ledgerline ; ledgerline.app: https://ledgerline.app/ ; ledger line meaning: https://en.wikipedia.org/wiki/Ledger_line ; LEDGEREDGE mark: https://trademarks.justia.com/901/27/ledgeredge-90127262.html
