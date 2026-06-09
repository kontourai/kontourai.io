---
name: kontour-site-refresh
description: Audit and update kontourai.io public marketing copy, product status, package versions, examples, stale site information, and public-safe product claims. Use for requests like update the site, refresh the marketing site, update product versions, recrawl Kontour products, audit stale copy, or check public-safe website information.
triggers:
  - site update
  - update the website
  - refresh the marketing site
  - product status refresh
  - update product versions
  - stale site copy
  - public-safe site audit
  - recrawl Kontour products
  - marketing site
argument-hint: "audit | refresh | update versions | update copy"
---

# Kontour Site Refresh Skill

## Purpose

Use this skill to keep `kontourai.io` accurate, public-safe, and aligned with the current Kontour product line.

This skill owns website maintenance. Use `kontour-opportunity` only for researching external projects, updating the opportunity corpus, and synthesizing product opportunities.

## Public Repo Boundary

The repository is public. Treat every committed file and every generated page as publishable.

- Use only explicit public allowlists for package, repository, and product sources.
- Do not publish private repo names, customer examples, prototype names, unreleased roadmap, secrets, or non-public package information.
- Do not use local sibling package versions as public release evidence.
- Keep uncertain, missing, stale, and private follow-up notes under `.flow-agents/product-audits/`, not in public site copy.
- Promote only reviewed, public-safe facts into `src/data/product-status.json` or marketing pages.

## Required Reads

Before making site-refresh changes, read:

1. `docs/product-line-vision.md`
2. `src/lib/products.ts`
3. `src/data/product-status.json`
4. `src/lib/product-status.ts`
5. relevant files under `src/pages/`
6. `scripts/refresh-product-status.mjs`
7. `scripts/validate.mjs`
8. `scripts/check-content-boundary.cjs`

Read `docs/ideation/kontour-vision-and-opportunities.md` only as archived ideation context, not current public positioning.

## Workflow

1. Establish scope: versions, product status, examples, copy, public-boundary audit, or full site refresh.
2. Run `npm run check:product-status` when product/package status is in scope.
3. Inspect the generated `.flow-agents/product-audits/` report.
4. Compare public metadata and page copy against `docs/product-line-vision.md` and public package/repo sources.
5. Identify missing, unclear, stale, duplicated, or internally-framed public information.
6. Update `src/data/product-status.json` through `npm run refresh:product-status` only when the source is public and allowlisted.
7. Update marketing pages only with public-safe reviewed facts.
8. Tighten checks when a stale-copy or public-boundary issue could recur.
9. Run:
   - `npm run check:content-boundary`
   - `npm run validate`
   - `npm run test:rendered` for browser-facing copy or layout changes

## Product Status Rules

- Source of truth: `src/data/product-status.json`.
- Rendering helpers: `src/lib/product-status.ts`.
- Versioned public packages: Surface, Survey, Flow, Veritas.
- Manual/public status products: Flow Agents, Console.
- Public npm registry data is acceptable release evidence.
- Local sibling checkouts are drift hints only; they must not be written as public metadata unless confirmed by a public source.

## Output

For audit-only work, return:

- stale or unclear public claims
- missing examples or weak product explanations
- public-boundary risks
- recommended edits and checks

For update work, deliver:

- scoped code/content changes
- audit artifact path when generated
- validation evidence
- any public-source gaps that remain warnings rather than proof
