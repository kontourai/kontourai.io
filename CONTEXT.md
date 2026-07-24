# Kontourai.io Context

This repository is the public Kontour AI website. Treat every committed file and
generated page as publishable public material.

## Source Of Truth

- Agent-facing repo instructions: `AGENTS.md`.
- Product page source: `src/pages/*.astro`.
- Shared product catalog: `src/lib/products.ts`.
- Public package/status metadata: `src/data/product-status.json`.
- Broad verification: `npm run validate && npm run test:rendered`.

## Glossary

- Public repo boundary: committed source, docs, scripts, public assets, and
  rendered output must be safe for a public repository. Do not include private
  repo names, customer examples, prototype names, unreleased roadmap, secrets,
  or non-public package information.
- Product pages: route-level Astro pages that explain public Kontour products.
  Product pages should derive live package/status copy from
  `src/data/product-status.json` instead of hard-coding versions or release
  status.
- Product status metadata: the `products` records in
  `src/data/product-status.json`. `version`, `phase`, `sourceUrl`,
  `publicNotes`, and `marketingReviewed` are public-facing claims and must stay
  aligned with the package and page copy they describe.
- Marketing review freshness: `marketingReviewed` records the public package
  version and date last reconciled against a product page's copy or screenshots.
  Refresh it when marketing content is reviewed against a newer package release.
- Content boundary: the public-copy safety line enforced by
  `npm run check:content-boundary`. Run it after public-facing copy or agent
  instruction changes, and fix any finding before merge readiness.
- Public evidence registry: `src/data/public-evidence-registry.json` is the
  canonical claim-to-source map for immutable public evidence. `npm run
  check:public-evidence` is deterministic and runs in the default validation
  path; `npm run check:public-evidence-reachability` is an explicit anonymous
  live check that reports `PASS`, `FAIL`, or `NOT_VERIFIED` without using
  credentials. Its exit codes are `0` for all reachable, `1` for any failure,
  and `2` when nothing failed but at least one source could not be verified.
  Named comparison sources stay scoped to their comparison page.
- Package version sync: after a public Kontour package release, run
  `npm run sync-versions` to update package pins in `product-status.json`.
  `npm run sync-versions:check` detects stale pins without writing changes.

## Change Guidance

- Keep this site aligned to public facts only. If a claim cannot be verified
  from public package metadata, public docs, or committed source, do not add it.
- Use `npm run validate && npm run test:rendered` for merge readiness.
- Use focused commands from `AGENTS.md` while iterating, but do not treat them as
  a replacement for the broad verification command.
