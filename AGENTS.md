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

- Product pages live in `src/pages/*.astro`; shared metadata in `src/data/product-status.json` (versions must match the npm registry — the validator enforces it).
- The honesty gates: `scripts/validate.mjs` (registry/version/page-state checks) and `scripts/check-content-boundary.cjs`.

## Match Checks To Change Type

- Any change: `npm run build && npx playwright test` (13 rendered-site tests) and `node scripts/validate.mjs`.
- After any Kontour package release: run `npm run sync-versions` to pull the latest npm versions into `product-status.json`, then commit. The validator enforces the match at deploy; `sync-versions --check` catches drift in CI.
- After refreshing a product page's copy/screenshots: set that product's `marketingReviewed` to the version you reconciled against (`node scripts/check-marketing-freshness.mjs` is the advisory signal the ops desk watches).

## Useful Commands

- `npm run build` · `npx playwright test` · `node scripts/validate.mjs` · `npm run check:content-boundary`
- `npm run sync-versions` — refresh all version pins in `product-status.json` from npm after any release (idempotent; prints a diff of what changed)
- `npm run sync-versions:check` — CI gate: exits non-zero if any pin is stale, prints which ones
