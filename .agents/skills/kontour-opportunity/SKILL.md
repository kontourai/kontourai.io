---
name: kontour-opportunity
description: Analyze external projects, products, markets, or workflows to discover reusable Kontour transparency/trust-infrastructure primitives first, then identify stack fit, wedge products, verticals, demos, or website examples built on those primitives.
triggers:
  - kontour opportunity
  - trust primitive
  - transparency primitive
  - primitive discovery
  - evidence-based truth
  - trust opportunity
  - project link
  - product iteration
argument-hint: "analyze <url> | synthesize primitives | plan iteration"
---

# Kontour Opportunity Skill

## Purpose

Use this skill to grow Kontour AI's opportunity corpus by finding repeated transparency/trust-infrastructure primitives hiding inside specific projects, products, markets, and workflows.

Priority order:

1. Discover reusable primitives: claim/evidence shape, provenance, freshness, disputes, reviewed blanks, derived trust, gate evidence, exceptions, authority, auditability, and handoff state.
2. Map stack fit: whether the primitive belongs in Surface, Survey, Flow, Veritas, Flow Agents, Console, or a small adapter.
3. Identify buildable surfaces: wedge products, verticals, demos, examples, docs, or website stories built on the primitives.
4. Reject weak roadmap gravity: do not turn every interesting app idea into a product unless the primitive repeats or sharply strengthens the foundation.

The workflow is intentionally simple to pick up:

- `analyze <url>`: research one project and add/update an opportunity entry.
- `analyze --with-claude <url>`: research one project, then ask Claude Opus to critique the draft before finalizing.
- `synthesize`: read the vision doc plus opportunity entries and extract repeated primitive patterns.
- `synthesize --with-claude`: ask Claude Opus to challenge the repeated patterns before finalizing.
- `plan`: compare the synthesized primitives against the current repos and propose the next build/refactor iteration.
- `plan --with-claude`: ask Claude Opus to review the proposed iteration before finalizing.

## Required Context

Before doing any analysis, read:

1. `docs/product-line-vision.md`
2. `docs/ideation/kontour-vision-and-opportunities.md`
3. `docs/ideation/opportunity-index.md` if it exists
4. Existing files under `docs/ideation/opportunities/` when synthesizing or when the new link appears related to an existing entry

If the current working directory is not `kontourai.io`, locate the repo before editing. The canonical repo-local corpus lives in:

- `/Users/brian/dev/github/kontourai/kontourai.io/docs/product-line-vision.md`
- `/Users/brian/dev/github/kontourai/kontourai.io/docs/ideation/kontour-vision-and-opportunities.md`
- `/Users/brian/dev/github/kontourai/kontourai.io/docs/ideation/opportunity-index.md`
- `/Users/brian/dev/github/kontourai/kontourai.io/docs/ideation/opportunities/`

## Mode: Analyze A Link

Use when the user provides a project, repository, article, product, or website link.

Workflow:

1. Research the source. Prefer local checkouts when available. Browse when the link is external or may have changed.
2. Capture source links and date of analysis.
3. Identify the project's trust-bearing claims.
4. Identify the evidence, validation, checks, or provenance mechanisms it already uses.
5. Map what is missing, stale, disputed, high-impact, probabilistic, or adversarial.
6. Distinguish observed facts, inferred classifications, and attribution of intent.
7. Evaluate primitive and stack fit:
   - Reusable primitive: the transparency/trust shape this example reveals.
   - Stack fit: whether the shape belongs in Surface, Survey, Flow, Veritas, Flow Agents, Console, or an adapter.
   - Veritas fit: where repo-local evidence or agent feedback would help.
   - Surface fit: where claims/evidence/checks/freshness/transparency gaps would help.
   - Website fit: whether it gives a crisp example for explaining Kontour.
8. Extract one or more foundation lessons. Keep product/application ideas subordinate to the primitive.
9. Classify the opportunity as one or more:
   - primitive discovery
   - workflow archetype
   - Surface adapter candidate
   - Veritas customer/use case
   - wedge product
   - separate company category
   - research reference only
10. Write a markdown entry in `docs/ideation/opportunities/YYYY-MM-DD-project-slug.md`.
11. Update `docs/ideation/opportunity-index.md`.
12. Update the synthesis section of `docs/ideation/kontour-vision-and-opportunities.md` only when the new project changes or sharpens the general foundation.

If `--with-claude` is requested, insert a critique pass before steps 10-12:

1. Draft the analysis locally first.
2. Build a grounded Claude prompt that includes the current Kontour vision/goals from `docs/product-line-vision.md`, archived ideation context from `docs/ideation/kontour-vision-and-opportunities.md`, the opportunity index, and the draft analysis.
3. Ask Claude Opus to challenge the draft using the `ask-claude` skill conventions.
4. Save the Claude artifact under `.omx/artifacts/`.
5. Record Codex's final judgment:
   - accepted Claude suggestions
   - rejected Claude suggestions
   - modified conclusions
   - why the final analysis changed or stayed the same

Claude is a second set of eyes, not the decider. Do not paste Claude's output as the final analysis without independent judgment.

Entry template:

```markdown
# <Project Name>

- Source: <url>
- Related sources: <urls>
- Date analyzed: YYYY-MM-DD
- Workflow archetype: <archetype>
- Opportunity classification: <classification>
- Kontour fit: Veritas <low|medium|high>, Surface <low|medium|high>

## Summary

## Trust-Bearing Claims

## Current Evidence And Validation

## Missing, Stale, Disputed, Or High-Impact Claims

## Veritas Fit

## Surface Fit

## Product Ideas

## Foundation Lessons

## Primitive Discovery

The reusable transparency/trust-infrastructure primitive this example reveals. State whether it appears broadly reusable, narrowly vertical, or only a research reference.

## Follow-Up Questions

## Claude Critique

Optional. Include only when `--with-claude` was used.

- Artifact: `.omx/artifacts/<file>.md`
- Accepted:
- Rejected:
- Codex final judgment:
```

## Mode: Synthesize

Use when the user asks what the collected project list says about the company vision, foundation, or reusable primitive layer.

Workflow:

1. Read the product-line vision doc, ideation vision doc, opportunity index, and all opportunity entries.
2. Group projects by workflow archetype and repeated trust/inspectability primitive.
3. Identify which primitives repeat and which are one-off curiosities.
4. Update `docs/ideation/kontour-vision-and-opportunities.md` with:
   - repeated patterns
   - workflow archetypes
   - sharpened product principles
   - candidate foundation changes
   - product/application ideas only when grounded in repeated primitives
5. Keep claims grounded in the reviewed entries. Do not overstate product readiness.

If `--with-claude` is requested, ask Claude Opus to critique the repeated patterns, possible overfitting, missing abstractions, and product-story clarity. Codex must then write its own synthesis verdict, including what it accepted and rejected from Claude.

Output should include:

- What is becoming clearer.
- What product foundation should change.
- What should not become roadmap yet.
- Which product/application ideas are merely examples built on existing primitives.
- Which examples best explain the vision quickly.

## Mode: Plan

Use when the user wants the next product iteration.

Workflow:

1. Read `docs/product-line-vision.md` and the opportunity corpus.
2. Inspect current state of `../veritas`, `../surface`, and current `kontourai.io`.
3. Compare the primitive corpus against shipped behavior, docs, schemas, CLI, tests, and website copy.
4. Propose the next iteration as concrete work:
   - primitive/foundation changes
   - Veritas changes
   - Survey changes
   - Surface changes
   - Flow or Console changes
   - Website/docs changes
   - tests or verification needed
   - examples/case studies to add
5. Prefer small, shippable updates over broad conceptual rewrites.
6. Explicitly preserve the product principle that Kontour must be easy to understand quickly.

If `--with-claude` is requested, ask Claude Opus to review the proposed product iteration for:

- overbuilding
- missing evidence or test strategy
- weak abstractions
- confusing public story
- places where the plan copies examples instead of extracting the pattern

Codex must then finalize the plan with explicit accepted/rejected critique notes.

Do not implement the plan unless the user asks for implementation or the request clearly asks to make the updates.

## Claude Critique Prompt Shape

Use the local Claude CLI through the `ask-claude` skill. Prefer Opus:

```bash
claude -p --model opus "<prompt>"
```

Prompt Claude as an external architecture/product critic, not as the owner of the answer. Include:

- the current Kontour thesis, goals, and product principles from `docs/product-line-vision.md`, plus reusable foundation, workflow archetypes, and current synthesis from `docs/ideation/kontour-vision-and-opportunities.md`
- the opportunity index from `docs/ideation/opportunity-index.md`
- relevant existing opportunity entries when they share an archetype or pattern
- the project draft, synthesis draft, or plan draft being critiqued
- the relevant workflow archetypes
- the specific questions to challenge
- a request for concrete accepted/rejected-worthy recommendations

Do not use Claude for simple mechanical entries unless the user asks for it or the analysis introduces a new abstraction, high-stakes roadmap decision, schema/protocol change, or verification-depth question.

## Workflow Archetypes

Use these as the current starting taxonomy, and refine as examples accumulate:

- Developer evidence: code, agents, repos, CI, governance, and Veritas evidence checks.
- Public data trust: sourced, changing public fields such as listings, availability, pricing, schedules, and profiles.
- High-stakes fact verification: source documents, extracted facts, resolved facts, citations, and human review.
- Reputation integrity: social proof, stars, reviews, ratings, downloads, testimonials, and benchmark claims.
- Compliance and audit evidence: policy claims, control checks, signoff, audit trails, and drift.
- AI recommendation trust: agent or model outputs that need evidence before being acted on.
- Marketplace/transaction trust: availability, identity, quality, fulfillment, pricing, and dispute state.
- Knowledge and research provenance: citations, source quality, synthesis reliability, and stale claims.

## Quality Bar

- Make the direct answer easy to understand before adding detail.
- Prefer concrete examples over broad abstractions.
- Preserve uncertainty and evidence limits.
- Do not collapse suspicion into accusation.
- Do not add a new abstraction unless it appears reusable.
- Verify repository state and run relevant checks before claiming edits are complete.
