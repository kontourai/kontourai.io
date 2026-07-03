# kontourai.io Launch-Readiness Bar

> **Status:** v1, authored 2026-07-03 for issue #68 (GTM wedge / launch readiness).
> **Owner sign-off:** site owner (Brian Anderson).
> **What this is:** a *finite* checklist that converts "ready to advertise kontourai.io" from a
> feeling into an evidence-gated decision. 23 numbered items. No open-ended items.
> Companion audit: [`launch-audit-2026-07-03.md`](./launch-audit-2026-07-03.md).

---

## The gate (record of decision)

**Advertising and traffic-driving content for kontourai.io are BLOCKED until this bar passes.**

- **"Bar passes"** = every **mechanical** item below is `PASS` (its stated command/count/page check
  succeeds) **AND** every **owner** item (marked `OWNER`) is signed off by the site owner.
- Any single `FAIL` on a mechanical item, or any un-signed `OWNER` item, means the gate is **CLOSED**:
  no paid or organic advertising, no new traffic-driving content (landing posts, launch announcements,
  ad campaigns) for this surface.
- **Explicitly still allowed while closed:** honest-caveat *private* design-partner demos, and building
  the site itself (repositioning, fixes). The gate blocks *advertising* the surface, not *improving* it.
- **Re-evaluation:** re-run the audit (rebuild + the commands below) after any fix wave. The bar is
  re-checkable at any commit; the current evaluation lives in the audit doc.

Current gate status is recorded at the bottom of the audit doc (as of 2026-07-03: **FAIL** — see audit).

---

## How to use this bar

1. Build the site **as it will ship**: `npm install && npm run build` (audit the branch that will be
   deployed, not necessarily `main`).
2. Run each item's stated command / open each stated page / count the stated thing.
3. Record `PASS` / `FAIL` per item with the literal evidence (command output, count, screenshot).
4. Owner items require a human check-box, not a command.

Every item is written so a reviewer can decide `PASS`/`FAIL` **from stated evidence** — a command exit
code, a count, a named artifact, or a named owner decision. No item is "make it feel polished."

---

## The checklist (23 items)

Legend: **Mechanical** items have a command/count anyone can run. **OWNER** items need site-owner
judgment and are check-boxes (they still name the evidence the owner reviews).

### A. Copy quality — no slop, no half-finished pages

| # | Check | How to verify (pass condition) |
|---|---|---|
| C1 | No placeholder / slop tokens in shipped copy | `grep -rniE 'lorem\|ipsum\|TODO\|TBD\|FIXME\|coming soon\|click here\|\bplaceholder\b' dist/*.html dist/**/*.html` returns **0 visible-copy hits** (the `placeholder=` email-input attribute is the only allowed match). Also 0 hits for the AI-slop phrase list: `in today's\|seamless\|leverage\|delve\|elevate\|game-chang\|revolutioniz\|unlock the\|in conclusion\|it's worth noting`. **PASS = 0.** |
| C2 | No content renders outside the page layout | Every visible block sits inside a `<Section>` / `.container`. Check: no bare top-level `<p>`/`<div>` between a closing `</section>` and `<footer>` in any `dist/**/*.html`. **PASS = 0 stray blocks.** |
| C3 | **OWNER** — Tone & voice sign-off | Owner reads all 10 pages and confirms the copy holds the "evidence over certainty theater" voice: confident but non-overclaiming, no hype, no unbacked superlatives. Evidence: owner check-box + date. |

### B. Claims vs reality — every product claim matches shipped npm versions & features

| # | Check | How to verify (pass condition) |
|---|---|---|
| V1 | Version pins match npm latest (deploy-blocking) | `npm run validate` **exits 0**. This runs `scripts/validate.mjs`, which fails if any `src/data/product-status.json` `version` != the package's npm `dist-tags.latest` (surface, survey, flow, veritas, flow-agents, console). **PASS = exit 0.** |
| V2 | No stale version pins | `npm run sync-versions:check` reports **0 stale pin(s)** (`scripts/sync-versions.mjs --check`). **PASS = 0.** |
| V3 | No unmarketed shipped features | `node scripts/check-marketing-freshness.mjs` reports **0 `STALE`** lines (each product's `marketingReviewed.version` covers the current npm minor/major), or every `STALE` is explicitly owner-accepted in the audit. |
| V4 | **OWNER** — Feature claims reconciled per page | For each product page, owner confirms the page's claimed features/CLI/behavior match the current shipped package, and sets `marketingReviewed` to the reviewed version. Evidence: `npm run check:product-status` dry-run report + owner check-box. |

### C. Dead links & routes (internal + external)

| # | Check | How to verify (pass condition) |
|---|---|---|
| L1 | 0 broken internal links | Crawl every `href="/…"` in `dist/**/*.html`; each must resolve to a built file in `dist/`. **PASS = 0 unresolved.** |
| L2 | External links resolve | `curl -sSL -o /dev/null -w '%{http_code}'` every distinct external URL (100% sample — the set is small). All return `200`/`3xx`. `npmjs.com` package pages must be verified via `registry.npmjs.org` (curl gets a 403 anti-bot, not a real 404). **PASS = no real 4xx/5xx.** |
| L3 | Internal links use one canonical slash form | `grep -rnoE 'href="/(flow\|surface\|survey\|veritas\|console\|flow-agents\|developers)"' dist/**/*.html` — internal product links use a single trailing-slash convention (avoids 301 hops). **PASS = 0 mixed-form links.** |

### D. Trust / "verify it yourself" commands run on a cold machine

| # | Check | How to verify (pass condition) |
|---|---|---|
| T1 | Every visitor-facing command runs as written on a clean machine | For each shell command shown on the site, the invoked package must be one Kontour owns. In particular **no bare `npx <name>`** where `<name>` is an unscoped public package Kontour does not control (`registry.npmjs.org/<name>` must not resolve to a third party). Scoped `npx @kontourai/<pkg> …` or install-then-run (`npm install -D @kontourai/<pkg>` before the bin is used) is required. Spot-check by resolving each command's package + running one representative command. **PASS = every command targets a Kontour-owned package.** |
| T2 | Documented subcommands exist in the shipped CLI | For each `npx @kontourai/<pkg> <sub>` shown, run `npx @kontourai/<pkg>@latest --help` and confirm `<sub>` is a registered command. **PASS = every documented subcommand is registered.** |

### E. Stale screenshots vs current UIs

| # | Check | How to verify (pass condition) |
|---|---|---|
| S1 | **OWNER** — Screenshots match the current shipped UI | For each `<img>` screenshot, owner compares it to the current product UI at npm-latest. Mechanical proxy that gates the owner check: a screenshot is *suspect* if its product's `marketingReviewed.version` is a major/minor behind npm latest (see V3). **PASS = owner confirms each screenshot current, or files a refresh finding.** |
| S2 | No orphan or broken image assets | Every `<img src>`/og image resolves to a file in `dist/`, **and** every committed file under `public/screenshots/` + `public/og/` is referenced by at least one page. **PASS = 0 broken refs AND 0 orphan files.** |

### F. Naming consistency vs the public glossary (`ops/strategy/glossary.md`)

| # | Check | How to verify (pass condition) |
|---|---|---|
| N1 | No glossary "avoid" terms in shipped copy | `grep -riE 'TrustInput\|Claim Package\|candidateSetId\|extractionId\|sourceId\|TrustReport\|TrustSnapshotDerivation' dist/**/*.html` (the glossary §4 avoid-list) returns **0**. **PASS = 0.** |
| N2 | Public copy uses canonical glossary terms | Visible copy uses the glossary §1 public term, not its internal/code form: e.g. **"Trust bundle"** not `TrustBundle`, **"Requirement"** not bare "Rule", **"Grounding"** where the noun is meant. Check: grep visible copy for camelCase code forms of glossary terms. **PASS = 0 unmapped code-form terms in visible copy.** |
| N3 | **OWNER** — New public terms are in the glossary | Owner confirms every product/feature proper noun used on a page appears in `ops/strategy/glossary.md` (or is added/mapped there). Evidence: owner check-box against the page naming inventory. |

### G. Content-boundary compliance

| # | Check | How to verify (pass condition) |
|---|---|---|
| B1 | Public-copy safety line holds | `npm run check:content-boundary` (`scripts/check-content-boundary.cjs`) **exits 0** — no banned private-vertical names, internal-preview copy, or secret-prone tracked files. **PASS = exit 0.** |

### H. SEO / meta basics

| # | Check | How to verify (pass condition) |
|---|---|---|
| E1 | Per-page meta completeness | Every built page has exactly **one `<h1>`**, a unique non-empty `<title>`, a `<meta name="description">`, a `<link rel="canonical">`, `<meta name="viewport">`, and `<html lang>`. Check via per-page grep counts. **PASS = all present, h1 count == 1 on every page.** |
| E2 | Social/share cards | `og:image` + `twitter:card` present on every page and the og image file exists in `dist/`. **PASS = present + file exists.** |
| E3 | Sitemap / robots / 404 hygiene | `dist/sitemap.xml` lists every indexable built page (diff sitemap `<loc>`s vs `dist/**/index.html`, excluding `/404`); `dist/robots.txt` exists; the 404 page is **not** indexable (has `noindex` and no self-canonical). **PASS = no indexable page missing from sitemap AND 404 is noindex.** |

### I. Responsive / mobile sanity

| # | Check | How to verify (pass condition) |
|---|---|---|
| R1 | No horizontal overflow on mobile | At 375×812 (Playwright), for every page `document.documentElement.scrollWidth <= window.innerWidth`, i.e. no content wider than the viewport (not merely masked by `overflow-x:hidden`). **PASS = no page exceeds viewport width.** |
| R2 | **OWNER** — Manual mobile pass | Owner reviews mobile screenshots of the key pages (home, developers, one product page): nav usable, tap targets reachable, no overlap/clipping. Evidence: owner check-box + screenshot set. |

---

## Item count & category coverage (finiteness proof)

- **Total items: 23** (fixed). Mechanical: 18 (C1, C2, V1, V2, V3, L1, L2, L3, T1, T2, S2, N1, N2, B1, E1, E2, E3, R1). Owner: 5 (C3, V4, S1, N3, R2).
- **Every issue #68 minimum category is covered:** copy quality → A (C1–C3); dead links → C (L1–L3); stale
  screenshots → E (S1–S2); stale claims vs shipped versions → B (V1–V4); naming vs glossary → F (N1–N3).
  Plus the site-specific additions requested: trust/verify commands → D (T1–T2), content boundary → G (B1),
  SEO/meta → H (E1–E3), responsive → I (R1–R2).

## Named validators (repo tooling this bar leans on)

- `npm run validate` → `scripts/validate.mjs` (deploy-blocking npm-version-vs-metadata) + `check-content-boundary.cjs` + `check-theme-tokens.mjs` + `check-security-hardening.mjs`
- `npm run sync-versions:check` → `scripts/sync-versions.mjs --check`
- `node scripts/check-marketing-freshness.mjs` (advisory feature-freshness)
- `npm run check:product-status` → `scripts/refresh-product-status.mjs --dry-run`
- `npm run check:content-boundary` → `scripts/check-content-boundary.cjs`
- Glossary source of truth: `ops/strategy/glossary.md` (canonical public vocabulary; read-only reference).
