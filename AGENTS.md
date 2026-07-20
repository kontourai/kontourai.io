# Agent Instructions

## Project Skills

Repo-local skills live in `.agents/skills/`.

Do not add new canonical project skills under runtime-specific export folders.

## Public Repo Boundary

This repository is public. Treat committed files and generated pages as
publishable.

- Do not publish private repo names, customer examples, prototype names,
  unreleased roadmap, secrets, or non-public package information.
- Use `npm run check:content-boundary` after public-facing copy or skill changes.

## Source Of Truth

- Product/domain context: `CONTEXT.md`.
- Agent-facing repo instructions: `AGENTS.md`.
- Broad verification: `npm run validate && npm run test:rendered`.
- Product pages live in `src/pages/*.astro`; shared metadata in `src/data/product-status.json` (versions must match the npm registry — the validator enforces it).
- The honesty gates: `scripts/validate.mjs` (registry/version/page-state checks) and `scripts/check-content-boundary.cjs`.

## Match Checks To Change Type

- Docs/interface-only changes: `npm run check:content-boundary` plus source inspection.
- Public copy or product metadata changes: `npm run validate && npm run test:rendered`.
- Before PR merge readiness: `npm run validate && npm run test:rendered`.
- After any Kontour package release: run `npm run sync-versions` to pull the latest npm versions into `product-status.json`, then commit. The validator enforces the match at deploy; `sync-versions --check` catches drift in CI.
- After refreshing a product page's copy/screenshots: set that product's `marketingReviewed` to the version you reconciled against (`node scripts/check-marketing-freshness.mjs` is the advisory signal the ops desk watches).

## Useful Commands

- `npm run validate && npm run test:rendered` — broad repo verification before merge readiness.
- `npm run check:content-boundary` — focused public-boundary check after public-facing copy or agent instruction changes.
- `npm run sync-versions` — refresh all version pins in `product-status.json` from npm after any release (idempotent; prints a diff of what changed)
- `npm run sync-versions:check` — CI gate: exits non-zero if any pin is stale, prints which ones

<!-- veritas:governance-block:start -->
This repo uses Veritas for AI governance. Read `.veritas/GOVERNANCE.md` before making changes.
After changes, run `veritas readiness` and address any FAIL lines before finishing.
<!-- veritas:governance-block:end -->
