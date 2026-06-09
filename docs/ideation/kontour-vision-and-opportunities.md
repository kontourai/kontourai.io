# Kontour AI Vision And Opportunity Map

ARCHIVED — see docs/product-line-vision.md for the current company thesis. This file is preserved as opportunity research only.

This is a working reference for the Kontour AI company thesis, product goals, and future opportunity analysis workflow. It is meant to evolve as we review more projects and sharpen the shared abstraction.

## Company Thesis

Kontour AI builds product transparency for AI-era products.

AI makes polished claims cheap. Kontour helps products show the work behind what they ask users and agents to trust. The company should not promise perfect objective truth. The promise is evidence-backed confidence: a clear map of each Claim, its Evidence and Evidence Trace, the Policy that applies, the current Trust Snapshot, and any Transparency Gap or Conflict a human or agent should inspect before relying on it.

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
- Let complexity unfold from evidence, policies, and producer mappings instead of leading with framework vocabulary.
- Prefer examples and real caught issues over broad claims about governance, truth, or intelligence.

## Product Roles

### Veritas

Veritas is the repo and AI-agent governance wedge: merge autonomy for AI-authored code.

It lets a repo define Repo Standards, a Repo Map, requirements, evidence checks, verification authorities, readiness coverage, change guidance, and generated evidence. When an AI agent changes code, Veritas explains what evidence is missing, which requirement was not satisfied, which boundaries were crossed, and whether the change is ready to merge with reduced human review.

Veritas proves the Kontour thesis in software development:

- Code changes make claims about behavior.
- Repos define what evidence is mandatory.
- Agents need immediate, actionable feedback.
- Teams need standards feedback to tune requirements over time.

### Surface

Surface is the product transparency standard and foundation product.

It models Claims, Evidence, Evidence Traces, Policies, Trust Snapshots, Trust Panels, Surface Console workflows, Transparency Gaps, and Conflicts across product domains. Its job is to preserve domain-specific evidence while projecting it into one shared shape that humans and agents can inspect.

Surface proves the Kontour thesis beyond code:

- Public directories need sourced and fresh data.
- Regulated document workflows need verified facts, citations, and review signals.
- Developer evidence, public-data evidence, and financial-fact evidence can share one transparency vocabulary without pretending they are the same domain.

### Kontourai.io

The website is the narrative layer: two products, one trust layer.

The current public story is strongest when it stays concrete:

- Show the work behind what your product asks users and agents to trust.
- Map what your product claims.
- Show what is verified, stale, disputed, unknown, or unsupported.
- Provide evidence-backed confidence, not certainty theater.

## Reusable Foundation

The long-term foundation should include:

- Claim model: the smallest trust-bearing unit.
- Evidence model: source excerpts, tests, crawls, attestations, citations, calculations, and policy rules.
- Evidence Trace model: a path from status back to source, evidence, method, actor, timestamp, or decision.
- Check model: verification events that promote, stale, dispute, reject, or supersede claims.
- Freshness policy: validity windows and changed-since-verified detection.
- Transparency Gap and Conflict model: missing, weak, stale, private, unavailable, unverifiable, or contradictory trust elements.
- Coverage model: which product surfaces are supported by current evidence.
- Claim Group model: frameworks, checklists, and requirement sets that roll broad assertions up from concrete claims while preserving drilldown to evidence.
- Producer integration contract: product-specific imports that preserve domain evidence.
- Agent query surface: commands or MCP resources for stale, missing, disputed, and policy-bound claims.
- Surface Console: queues for high-impact unsupported claims, stale claims, transparency gaps, and conflicts.
- Learning loop: standards feedback that shows whether trust guidance improves outcomes.

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
- Code review, CI governance, and software supply-chain evidence.
- Open-source reputation and adoption metrics.
- Public directories and marketplaces.
- Regulated, finance, insurance, and document-backed workflows.
- Healthcare operations and care coordination.
- Compliance and audit workflows.
- Procurement and vendor-risk systems.
- Recruiting and credential verification.
- Education records, tutoring, and course-quality claims.
- Real estate, local services, and availability/pricing claims.
- Legal intake and contract-review workflows.
- Research synthesis and citation-heavy knowledge tools.
- Customer-support knowledge bases.
- Internal operating consoles.

## Workflow Archetypes

The examples should emphasize types of trust workflows, not only literal project names. The current developer evidence, public-directory-data, and high-stakes-fact examples are useful because they make the abstraction concrete across different evidence shapes.

Use this growing taxonomy when adding projects:

- Developer evidence: code, agents, repos, CI, governance, and Veritas-local evidence checks.
- Public data trust: sourced, changing public fields such as listings, availability, pricing, schedules, and profiles.
- High-stakes fact verification: source documents, extracted facts, resolved facts, citations, and human review.
- Reputation integrity: social proof, stars, reviews, ratings, downloads, testimonials, community metrics, and benchmark claims.
- Compliance and audit evidence: policy claims, requirement checks, signoff, audit trails, and freshness.
- AI recommendation trust: agent or model outputs that need evidence before being acted on.
- Marketplace/transaction trust: availability, identity, quality, fulfillment, pricing, and dispute state.
- Knowledge and research provenance: citations, source quality, synthesis reliability, and stale claims.

The public site should eventually use this kind of archetype list to show the breadth of Kontour's foundation while staying easy to understand.

## Domain Trust Product Direction

Surface Claim Groups make the broader product shape clearer: a domain product can package expertise as groups of claims, requirements, validation strategies, and producer mappings without forking the product transparency standard. Integrity scope should travel with those claims so a user can see not only that a claim is verified, but which source version, input files, configuration, or attestation the verification depends on.

Veritas is the first vertical product built with Surface: Repo Standards project to Surface Claim Groups, requirements project to claims, and evidence checks supply evidence. The same pattern should apply to other domains when the domain has repeated assertions such as "release ready", "listing verified", "return package complete", "vendor compliant", or "source-backed fact set".

The commercial opportunity is not only storing claims. It is helping users understand why they should trust a claim: what framework it belongs to, which requirements passed, which evidence is current, what source/config integrity it is anchored to, what remains unsupported, and where a human or agent should drill down next. Surface should own the common language and rollup mechanics; each domain product should own the specialized standards, producer mapping, vocabulary, and review workflow.

Product direction to keep working toward:

- Surface: product transparency standard, Claim Group and requirement rollups, evidence drilldown, Trust Panel, Surface Console, and query surface.
- Veritas: development-governance vertical product built with Surface Claim Groups.
- Future domain packs/products: compliance, public data, fact resolution, reputation integrity, and marketplace trust, each shipping domain-specific Claim Groups and producer mappings.
- Kontourai.io: public story should describe the capability concretely without overexplaining this internal product architecture.

## Opportunity Analysis Protocol

When reviewing a new project, analyze it through this lens:

1. Identify the trust-bearing claims the project makes or evaluates.
2. Identify the evidence sources used today.
3. Separate validation logic from durable trust infrastructure.
4. Map unsupported, stale, disputed, and high-impact claims.
5. Ask where Veritas-style evidence checks applies to the project's development lifecycle.
6. Ask where Surface-style claim/evidence/freshness modeling applies to the product domain.
7. Propose producer mapping records that could preserve the project's native evidence.
8. Propose new Kontour abstractions only when the project exposes a repeated trust pattern.
9. Classify the opportunity as customer, producer mapping, wedge product, or separate company.

## Tracking System

Use this document as the human-readable working map. As the list grows, split detailed entries into `docs/ideation/opportunities/` and keep this file as the synthesis layer.

Recommended structure:

- `docs/ideation/kontour-vision-and-opportunities.md`: company thesis, foundation, synthesis, product update plan, and top opportunities.
- `docs/ideation/opportunities/YYYY-MM-DD-project-slug.md`: one project analysis per file once entries become too long.
- `docs/ideation/opportunity-index.md`: compact table of reviewed projects, categories, fit, and extracted lessons.
- `.agents/skills/kontour-opportunity/SKILL.md`: future-session workflow for link intake, corpus synthesis, and next-iteration planning.

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
3. Map: identify claims, evidence, checks, freshness, transparency gaps, conflicts, and coverage.
4. Synthesize: extract foundation lessons that repeat across projects.
5. Plan: convert repeated lessons into a product update plan for Veritas, Surface, and the website.
6. Build: implement the smallest product/docs/schema change that makes the lesson concrete.
7. Re-check: keep the public story aligned with shipped behavior.

The synthesis should avoid treating every interesting idea as a roadmap item. A lesson becomes a product candidate only when it repeats across projects or sharply improves the foundation.

## Agent-Led Initialization

Veritas should grow beyond a static starter config into an agent-led initialization flow.

The useful mode is a guided bootstrap that first explores the codebase, then interviews the owner about boundaries the code cannot infer. The exploration pass should detect repo shape, languages, package managers, test/build commands, work areas, risky mutation points, existing conventions, docs, and CI. The interview pass should ask about evidence boundaries, coding style, release expectations, ownership, review requirements, and what must never be changed without explicit approval.

The companion repo-local skill should live at `.agents/skills/veritas-init-guide/SKILL.md`. It can explore, ask questions, and prepare a guided plan, but it must hand all writes back to the deterministic CLI. The only mutation boundary remains `veritas init --apply --plan <artifact>`.

The output should be an initial Repo Map, evidence-check recommendations, readiness coverage inventory, codebase guidance, migration notes, and a concise "why this config" report. The goal is not to force a perfect ontology on day one. It is to get a repo into a coherent evidence-backed operating mode quickly, then let future readiness reports and standards feedback refine the contract as real work exposes gaps.

Potential command shape:

- `veritas init --explore [--output <path>]`: read-only repo scan plus recommended evidence checks and boundaries.
- `veritas init --guided --answers <path>`: explore first, then capture owner intent and coding preferences in a structured artifact.
- `veritas init --apply --plan <artifact>`: write the Repo Map, guidance, and starter evidence-check config after review.

## Product Update Plan Template

When enough entries accumulate, synthesize them into:

- Repeated trust pattern: what showed up across multiple projects.
- User-facing explanation: how to explain the pattern in one sentence.
- Foundation change: schema, producer mapping, policy, query, report, or UX primitive.
- Veritas impact: whether repo-local evidence checks, change guidance, or AI-agent feedback should change.
- Surface impact: whether claim/evidence/check/status modeling should change.
- Website impact: whether the public story needs a clearer example.
- Example project: the strongest concrete evidence point.
- Smallest next step: the smallest shippable change that validates the update.
- Open risk: what could be overclaimed or misunderstood.

## Current Reviewed Projects

See `docs/ideation/opportunity-index.md` for the compact list and `docs/ideation/opportunities/` for detailed entries.

Current seed entry:

- [Public Directory Data](docs/ideation/opportunities/2026-04-25-public-directory-data.md): public data trust and marketplace/transaction trust; strong Surface fit; shows that field-level sources, reviewed blanks, provider rollups, crawl failures, and review flags need explicit semantics.
- [Dagster Fake Star Detector](docs/ideation/opportunities/2026-04-25-dagster-fake-star-detector.md): reputation integrity; strong Surface fit; shows that Kontour needs to support heuristic, adversarial, time-bounded claims without collapsing suspicion into accusation.
- Fact Resolution: high-stakes fact verification and compliance/audit evidence; strong Surface and Veritas fit; shows that generated artifacts need a chain from raw extraction to resolved candidate to verified fact to output, with assumptions and rule-source provenance preserved.

## Current Synthesis

The current examples support a broader list of workflow archetypes than the public site shows today:

- Veritas: developer evidence.
- Public Directory Data: public data trust and marketplace/transaction trust.
- Fact Resolution: high-stakes fact verification and compliance/audit evidence.
- Fake Star Detector: reputation integrity.

The repeated foundation lessons so far:

- Trust should start with a concrete claim and status, then reveal the evidence path.
- Evidence can be deterministic, human-attested, heuristic, source-cited, or generated by a workflow.
- Verification needs depth and weight. Kontour should explain what a check proves, what it does not prove, and whether additional corroboration or anchoring is needed.
- Human review and attestation are first-class parts of the trust model.
- Staleness can come from time, source changes, crawl failure, annual rule rollover, or adversary adaptation.
- Transparency Gaps and Conflicts need to preserve distinctions such as suspicion vs accusation, blank vs intentionally unavailable, and calculated value vs assumption-backed value.
- Product UX should make the first answer simple while preserving enough trace detail for high-stakes review.

## Current Product Rework

The product is evolving from a trust vocabulary into a product transparency standard. The first implementation slice makes verification typed and requirement-aware while staying easy to explain.

Shipped protocol concepts:

- `schemaVersion: 2`: explicit Surface trust input/report versioning.
- `Evidence.method`: required verification method: observation, extraction, validation, corroboration, attestation, auditability, anchoring, or monitoring.
- `Check.method`: the verification method used by a check.
- `Check.actor`: the system, human, institution, agent, or workflow that performed the check.
- `VerificationPolicy.requiredMethods`: the minimum method or combination of methods needed for a claim type.
- `VerificationPolicy.requiresCorroboration`: whether one evidence item is not enough.
- `TrustReport.evidenceRequirementsByClaimId`: current technical field for report-derived requirement data without duplicating policy on every claim.
- Claim Groups: checklists or requirement sets that group claims. The current Surface schema field is `TrustInput.claimGroups`.
- `TrustReport.claimGroupRollups`: current technical name for report-derived Claim Group status from the underlying claim statuses.
- Typed Transparency Gaps and Conflicts:
  - `contradiction`: two claims have incompatible values.
  - `provenance_gap`: claim exists but evidence is absent or broken.
  - `policy_violation`: claim was verified by a weaker method than required.
  - `freshness_breach`: prior verification exceeded its validity window.
  - `corroboration_absent`: claim requires independent support but has only one source.
  - `unsupported_inference`: evidence supports an observation or suspicion but not the stronger inferred claim.

This avoids numeric evidence weights for now. Evidence methods and requirement data are easier to understand, harder to game, and enough to expose real gaps.

Veritas bridge:

- Evidence checks now use explicit objects with stable IDs, commands, methods, and optional supported claim IDs.
- Example: `npm test` provides `validation` for `claim.api.rate-limit`.
- Veritas evidence emits selected evidence-check metadata so Surface can import method metadata instead of inferring from command strings.
- Requirement results now project as concrete Surface claims even when a repo has not manually authored each requirement claim.
- Repo Standards now project as Surface Claim Groups, preserving drilldown from standards status to requirement claim, evidence, and event.

Website change:

- Add method/verification depth to the Surface vocabulary.
- Add Claim Groups and requirement rollups to the Surface/Veritas public story.
- Expand examples from three literal projects to workflow archetypes: developer evidence, public data trust, high-stakes fact verification, and reputation integrity.
- Keep the first explanation simple: claim -> status -> evidence method -> gap/next action.

Avoid for now:

- Numeric trust scores.
- Blockchain integration beyond modeling `anchoring` as one evidence method.
- Actor registry.
- Hosted Surface Console.
- Complex alerting.
- Too many use-case cards before the schema is real.

Implemented first iteration:

1. Added method/requirement/transparency-gap fields to Surface schemas and examples.
2. Updated Surface docs/site vocabulary and examples.
3. Added Veritas evidence-check metadata with `method` and supported Surface claims.
4. Added a reputation-integrity fixture showing observation vs corroboration gap vs unsupported accusation.
5. Added Surface Claim Group/requirement rollups and Veritas Repo Standards projection into those groups.
