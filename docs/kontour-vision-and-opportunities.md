# Kontour AI Vision And Opportunity Map

This is a working reference for the Kontour AI company thesis, product goals, and future opportunity analysis workflow. It is meant to evolve as we review more projects and sharpen the shared abstraction.

## Company Thesis

Kontour AI builds trust infrastructure for AI-era products.

AI makes plausible claims cheap. Kontour makes product claims inspectable, testable, freshness-aware, and actionable. The company should not promise perfect objective truth. The promise is evidence-backed confidence: a clear map of what is claimed, what proves it, what is stale or disputed, and what a human or agent should verify before relying on it.

## Core Questions

Kontour products should help humans and agents answer:

- What is being claimed?
- What evidence supports the claim?
- Who or what verified it?
- How was it verified?
- How long is that verification valid?
- What changed since verification?
- What is unsupported, stale, disputed, rejected, or superseded?
- What should a human or agent do next before relying on it?

## Product Principles

Kontour should make trust easy to understand quickly, even when the workflows underneath are complex.

This is a base product constraint, not just a marketing preference:

- Start with the user's claim and its current trust state.
- Make the evidence path inspectable without forcing users to read every detail.
- Show the next required action before showing implementation complexity.
- Use concrete statuses before abstract theory: verified, proposed, stale, disputed, unknown, rejected, superseded.
- Keep first-run setup small: one source, one claim class, one report, one useful catch.
- Let complexity unfold from evidence, policies, and adapters instead of leading with framework vocabulary.
- Prefer examples and real caught issues over broad claims about governance, truth, or intelligence.

## Product Roles

### Veritas

Veritas is the developer-proof wedge: bespoke lint for AI agents.

It lets a repo define local rules, proof lanes, proof-family manifests, governance blocks, and evidence artifacts. When an AI agent changes code, Veritas gives lint-style feedback about what proof is missing, which rule was violated, and which verification families are required, advisory, moving to tests, or ready to retire.

Veritas proves the Kontour thesis in software development:

- Code changes make claims about behavior.
- Repos define what proof is mandatory.
- Agents need immediate, actionable feedback.
- Teams need evidence and eval history to tune rules over time.

### Surface

Surface is the broader trust map.

It models claims, evidence, traces, checks, drift, fault lines, and coverage across product domains. Its job is to preserve domain-specific proof while projecting it into one shared report shape that humans and agents can inspect.

Surface proves the Kontour thesis beyond code:

- Public directories need sourced and fresh data.
- Tax workflows need verified facts, citations, and review signals.
- Developer proof, public-data proof, and financial-fact proof can share one trust vocabulary without pretending they are the same domain.

### Kontourai.io

The website is the narrative layer: two products, one trust layer.

The current public story is strongest when it stays concrete:

- Map what your product claims.
- Prove it.
- Show what is verified, stale, disputed, unknown, or unsupported.
- Provide evidence-backed confidence, not certainty theater.

## Reusable Foundation

The long-term foundation should include:

- Claim model: the smallest trust-bearing unit.
- Evidence model: source excerpts, tests, crawls, attestations, citations, calculations, and policy rules.
- Trace model: a path from status back to source, proof, or decision.
- Check model: verification events that promote, stale, dispute, reject, or supersede claims.
- Freshness policy: validity windows and drift detection.
- Fault-line model: conflicts between claims, evidence, policies, and sources.
- Coverage model: which product surfaces are supported by current evidence.
- Adapter contract: product-specific imports that preserve domain evidence.
- Agent query surface: commands or MCP resources for stale, missing, disputed, and policy-bound claims.
- Human review surface: queues for high-impact unsupported claims, stale claims, and conflicts.
- Learning loop: eval records that show whether trust guidance improves outcomes.

## Verification Depth And Evidence Weight

Verification is not one layer. Kontour should model how strong a verification signal is, what it actually proves, and what gaps remain.

The foundation should distinguish:

- Observation: a source said something or an event occurred.
- Extraction: a system parsed a value from source material.
- Validation: the value passed a check, heuristic, rule, or consistency test.
- Corroboration: multiple independent sources support the same claim.
- Attestation: a human or institution explicitly vouched for a claim.
- Auditability: the evidence chain can be inspected after the fact.
- Anchoring: a timestamp, signature, immutable log, or external ledger proves the evidence existed at a point in time.
- Ongoing monitoring: the claim is rechecked when time, source data, or policy changes.

Verification should also carry weight and limits. A GitHub star count is an observed metric, not reliable social proof unless the source, actors, timing, and manipulation risk have been analyzed. A passing test proves a behavior under a known test shape, not that the product is correct in all conditions. A human attestation may be strong for intent or review, but weak if the reviewer had no source evidence.

Potential verification mechanisms:

- Source citation and excerpt.
- Deterministic test or calculation.
- Cross-source comparison.
- Human review or institutional attestation.
- Statistical or heuristic anomaly detection.
- Signed artifacts.
- Append-only logs.
- Third-party audit records.
- Public timestamping or blockchain anchoring.

Blockchain or other immutable ledgers can make sense when the product needs independent proof that an artifact, attestation, or evidence bundle existed at a specific time and was not later modified. It is not a general truth mechanism. It can strengthen auditability and tamper evidence, but it does not prove the underlying claim is correct. The useful abstraction is "anchored evidence", with blockchain as one possible implementation.

For product design, the key question is:

> What does this verification actually prove, and what would still make the claim unsafe to rely on?

## Opportunity Categories

Projects that can benefit from evidence-based truth usually have one or more of these properties:

- They expose a metric that users treat as social proof.
- They aggregate public data that can go stale.
- They transform source documents into high-stakes facts.
- They use AI to make decisions or recommendations.
- They rely on workflow claims such as "tested", "approved", "compliant", or "ready".
- They need humans and agents to share the same view of what is trusted.
- They operate in adversarial or incentive-distorted environments.

Initial categories:

- AI coding tools and agent runtimes.
- Code review, CI governance, and software supply-chain proof.
- Open-source reputation and adoption metrics.
- Public directories and marketplaces.
- Tax, finance, insurance, and document-backed workflows.
- Healthcare operations and care coordination.
- Compliance and audit workflows.
- Procurement and vendor-risk systems.
- Recruiting and credential verification.
- Education records, tutoring, and course-quality claims.
- Real estate, local services, and availability/pricing claims.
- Legal intake and contract-review workflows.
- Research synthesis and citation-heavy knowledge tools.
- Customer-support knowledge bases.
- Internal operating dashboards.

## Workflow Archetypes

The examples should emphasize types of trust workflows, not only literal project names. The current developer-proof, public-directory-data, and high-stakes-fact examples are useful because they make the abstraction concrete across different evidence shapes.

Use this growing taxonomy when adding projects:

- Developer proof: code, agents, repos, CI, governance, proof lanes.
- Public data trust: sourced, changing public fields such as listings, availability, pricing, schedules, and profiles.
- High-stakes fact verification: source documents, extracted facts, resolved facts, citations, and human review.
- Reputation integrity: social proof, stars, reviews, ratings, downloads, testimonials, community metrics, and benchmark claims.
- Compliance and audit evidence: policy claims, control checks, signoff, audit trails, and drift.
- AI recommendation trust: agent or model outputs that need evidence before being acted on.
- Marketplace/transaction trust: availability, identity, quality, fulfillment, pricing, and dispute state.
- Knowledge and research provenance: citations, source quality, synthesis reliability, and stale claims.

The public site should eventually use this kind of archetype list to show the breadth of Kontour's foundation while staying easy to understand.

## Opportunity Analysis Protocol

When reviewing a new project, analyze it through this lens:

1. Identify the trust-bearing claims the project makes or evaluates.
2. Identify the evidence sources used today.
3. Separate validation logic from durable trust infrastructure.
4. Map unsupported, stale, disputed, and high-impact claims.
5. Ask where Veritas-style proof applies to the project's development lifecycle.
6. Ask where Surface-style claim/evidence/freshness modeling applies to the product domain.
7. Propose adapter records that could preserve the project's native proof.
8. Propose new Kontour abstractions only when the project exposes a repeated trust pattern.
9. Classify the opportunity as customer, adapter, wedge product, or separate company.

## Tracking System

Use this document as the human-readable working map. As the list grows, split detailed entries into `docs/opportunities/` and keep this file as the synthesis layer.

Recommended structure:

- `docs/kontour-vision-and-opportunities.md`: company thesis, foundation, synthesis, product update plan, and top opportunities.
- `docs/opportunities/YYYY-MM-DD-project-slug.md`: one project analysis per file once entries become too long.
- `docs/opportunity-index.md`: compact table of reviewed projects, categories, fit, and extracted lessons.
- `.codex/skills/kontour-opportunity/SKILL.md`: future-session workflow for link intake, corpus synthesis, and next-iteration planning.

Use the skill as:

- `$kontour-opportunity analyze <url>` to research a link and add/update an opportunity entry.
- `$kontour-opportunity analyze --with-claude <url>` to add a Claude Opus critique pass before finalizing high-judgment entries.
- `$kontour-opportunity synthesize` to read the full corpus and update the repeated patterns.
- `$kontour-opportunity synthesize --with-claude` to challenge the synthesis before accepting new abstractions.
- `$kontour-opportunity plan` to compare the corpus against `veritas`, `surface`, and `kontourai.io` and propose the next build/refactor iteration.
- `$kontour-opportunity plan --with-claude` to have Claude critique the proposed iteration before Codex makes the final call.

Claude is a critique input, not the owner of the conclusion. Future sessions should ground Claude with this vision/goals document, the opportunity index, and relevant opportunity entries before asking for critique. They should record what was accepted, rejected, or modified from Claude's feedback.

Each project entry should capture:

- Source links.
- Short description.
- Trust-bearing claims.
- Evidence used today.
- Missing, stale, disputed, or high-impact claims.
- Veritas fit.
- Surface fit.
- New foundation lesson.
- Potential product ideas.
- Opportunity classification.
- Follow-up questions.

## Iteration Loop

Use a lightweight cadence:

1. Intake: add a project link and a short note about why it seems relevant.
2. Research: inspect the project, docs, examples, and visible behavior.
3. Map: identify claims, evidence, checks, drift, fault lines, and coverage.
4. Synthesize: extract foundation lessons that repeat across projects.
5. Plan: convert repeated lessons into a product update plan for Veritas, Surface, and the website.
6. Build: implement the smallest product/docs/schema change that makes the lesson concrete.
7. Re-check: keep the public story aligned with shipped behavior.

The synthesis should avoid treating every interesting idea as a roadmap item. A lesson becomes a product candidate only when it repeats across projects or sharply improves the foundation.

## Agent-Led Initialization

Veritas should grow beyond a static starter config into an agent-led initialization flow.

The useful mode is a guided bootstrap that first explores the codebase, then interviews the owner about boundaries the code cannot infer. The exploration pass should detect repo shape, languages, package managers, test/build commands, app surfaces, risky mutation points, existing conventions, docs, and CI. The interview pass should ask about proof boundaries, coding style, release expectations, ownership, review rules, and what must never be changed without explicit approval.

The companion repo-local Codex skill should live at `.codex/skills/veritas-init-guide/SKILL.md`. It can explore, ask questions, and prepare a guided plan, but it must hand all writes back to the deterministic CLI. The only mutation boundary remains `veritas init --apply --plan <artifact>`.

The output should be an initial Veritas adapter, proof-lane recommendations, proof-family inventory, codebase guidance, migration notes, and a concise "why this config" report. The goal is not to force a perfect ontology on day one. It is to get a repo into a coherent evidence-backed operating mode quickly, then let future check-ins refine the contract as real work exposes gaps.

Potential command shape:

- `veritas init --explore [--output <path>]`: read-only repo scan plus recommended proof lanes and boundaries.
- `veritas init --guided --answers <path>`: explore first, then capture owner intent and coding preferences in a structured artifact.
- `veritas init --apply --plan <artifact>`: write the adapter, guidance, and starter proof config after review.

## Product Update Plan Template

When enough entries accumulate, synthesize them into:

- Repeated trust pattern: what showed up across multiple projects.
- User-facing explanation: how to explain the pattern in one sentence.
- Foundation change: schema, adapter, policy, query, report, or UX primitive.
- Veritas impact: whether repo-local proof or AI-agent feedback should change.
- Surface impact: whether claim/evidence/check/status modeling should change.
- Website impact: whether the public story needs a clearer example.
- Example project: the strongest concrete proof point.
- Smallest next step: the smallest shippable change that validates the update.
- Open risk: what could be overclaimed or misunderstood.

## Current Reviewed Projects

See `docs/opportunity-index.md` for the compact list and `docs/opportunities/` for detailed entries.

Current seed entry:

- [Public Directory Data](opportunities/2026-04-25-public-directory-data.md): public data trust and marketplace/transaction trust; strong Surface fit; shows that field-level sources, reviewed blanks, provider rollups, crawl failures, and review flags need explicit semantics.
- [Dagster Fake Star Detector](opportunities/2026-04-25-dagster-fake-star-detector.md): reputation integrity; strong Surface fit; shows that Kontour needs to support heuristic, adversarial, time-bounded claims without collapsing suspicion into accusation.
- Fact Resolution: high-stakes fact verification and compliance/audit evidence; strong Surface and Veritas fit; shows that generated artifacts need a chain from raw extraction to resolved candidate to verified fact to output, with assumptions and rule-source provenance preserved.

## Current Synthesis

The current examples support a broader list of workflow archetypes than the public site shows today:

- Veritas: developer proof.
- Public Directory Data: public data trust and marketplace/transaction trust.
- Fact Resolution: high-stakes fact verification and compliance/audit evidence.
- Fake Star Detector: reputation integrity.

The repeated foundation lessons so far:

- Trust should start with a concrete claim and status, then reveal the evidence path.
- Evidence can be deterministic, human-attested, heuristic, source-cited, or generated by a workflow.
- Verification needs depth and weight. Kontour should explain what a check proves, what it does not prove, and whether additional corroboration or anchoring is needed.
- Human review and attestation are first-class parts of the trust model.
- Staleness can come from time, source changes, crawl failure, annual rule rollover, or adversary adaptation.
- Fault lines need to preserve distinctions such as suspicion vs accusation, blank vs intentionally unavailable, and calculated value vs assumption-backed value.
- Product UX should make the first answer simple while preserving enough trace detail for high-stakes review.

## Current Product Rework

The product is evolving from a trust vocabulary into a trust protocol. The first implementation slice makes verification typed and requirement-aware while staying easy to explain.

Shipped protocol concepts:

- `schemaVersion: 2`: explicit Surface trust input/report versioning.
- `Evidence.method`: required verification method: observation, extraction, validation, corroboration, attestation, auditability, anchoring, or monitoring.
- `Check.method`: the verification method used by a check.
- `Check.actor`: the system, human, institution, agent, or workflow that performed the check.
- `VerificationPolicy.requiredMethods`: the minimum method or combination of methods needed for a claim type.
- `VerificationPolicy.requiresCorroboration`: whether one evidence item is not enough.
- `TrustReport.proofRequirementsByClaimId`: report-derived proof requirements without duplicating policy on every claim.
- Typed fault lines:
  - `contradiction`: two claims have incompatible values.
  - `provenance_gap`: claim exists but evidence is absent or broken.
  - `policy_violation`: claim was verified by a weaker method than required.
  - `freshness_breach`: prior verification exceeded its validity window.
  - `corroboration_absent`: claim requires independent support but has only one source.
  - `unsupported_inference`: evidence supports an observation or suspicion but not the stronger inferred claim.

This avoids numeric evidence weights for now. Evidence methods and proof requirements are easier to understand, harder to game, and enough to expose real gaps.

Veritas bridge:

- Proof lanes now use explicit objects with stable IDs, commands, methods, and optional supported claim IDs.
- Example: `npm test` provides `validation` for `claim.api.rate-limit`.
- Veritas evidence emits `selected_proof_lanes` so Surface can import proof method metadata instead of inferring from command strings.

Website change:

- Add method/verification depth to the Surface vocabulary.
- Expand examples from three literal projects to workflow archetypes: developer proof, public data trust, high-stakes fact verification, and reputation integrity.
- Keep the first explanation simple: claim -> status -> evidence method -> gap/next action.

Avoid for now:

- Numeric trust scores.
- Blockchain integration beyond modeling `anchoring` as one evidence method.
- Actor registry.
- Hosted dashboard.
- Complex alerting.
- Too many use-case cards before the schema is real.

Implemented first iteration:

1. Added method/proof-requirement/fault-line fields to Surface schemas and examples.
2. Updated Surface docs/site vocabulary and examples.
3. Added Veritas proof-lane metadata with `method` and supported Surface claims.
4. Added a reputation-integrity fixture showing observation vs corroboration gap vs unsupported accusation.
