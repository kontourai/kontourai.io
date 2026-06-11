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
- After any Kontour package release: update `product-status.json` versions or the validator fails the next deploy.

## Useful Commands

- `npm run build` · `npx playwright test` · `node scripts/validate.mjs` · `npm run check:content-boundary`
