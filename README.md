# kontourai.io

Public website and developer-facing product map for
[Kontour AI](https://kontourai.io): the narrative, product pages, release-status
metadata, receipts, and documentation that explain how the suite fits together.

This repository is a public read surface, not the authority for product runtime
behavior. Product repositories own their implementations and public contracts;
the files here translate verified public facts into the website.

## Local development

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev
```

Useful verification commands:

```sh
npm run check:content-boundary  # public-copy safety check
npm run validate                # metadata, security, receipts, theme, and sitemap checks
npm run test:rendered           # production build plus Playwright coverage
```

Run `npm run validate && npm run test:rendered` before treating a site change as
merge-ready.

## Source map

- [`src/pages/`](src/pages/) contains Astro routes and product pages.
- [`src/lib/products.ts`](src/lib/products.ts) is the shared public product
  catalog.
- [`src/data/product-status.json`](src/data/product-status.json) records public
  package versions, lifecycle state, source links, and marketing-review
  freshness.
- [`src/data/receipts/`](src/data/receipts/) contains the trust bundles rendered
  by the public receipts experience.
- [`docs/product-line-vision.md`](docs/product-line-vision.md) explains the public
  product-line framing; the owning product docs remain authoritative for runtime
  behavior.
- [`CONTEXT.md`](CONTEXT.md) defines repository vocabulary and source-of-truth
  boundaries; [`AGENTS.md`](AGENTS.md) records contributor and verification
  guidance.

## Keeping product claims current

After a public Kontour package release, refresh and verify version pins:

```sh
npm run sync-versions
npm run sync-versions:check
```

When product-page copy or screenshots are reviewed against a newer release,
update that product's `marketingReviewed` entry in
`src/data/product-status.json`. The validation scripts intentionally fail when
published package versions and public metadata drift.

## Public content boundary

Treat every tracked file and rendered page as publishable. Do not add secrets,
private repository names, customer details, prototype names, or unreleased
roadmap claims. The content-boundary check is required after any public-facing
copy or documentation change.
