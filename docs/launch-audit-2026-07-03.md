# kontourai.io Launch-Readiness Audit — 2026-07-03

> Fresh-eyes audit against [`launch-readiness-bar.md`](./launch-readiness-bar.md), issue #68.
> **Scope decision:** the site was audited **as it will ship** — i.e. the **PR #72 branch**
> (`feat/i1-single-headline`, commit `4cdf520`), **not** current `main`, because #72 replaces the
> homepage, nav, footer, and promotes the developers page. Every finding is tagged **`pr72`**
> (introduced or made material by #72) or **`pre-existing`** (already on `main`; #72 does not touch it).
> #72 changes only `index.astro`, `developers.astro`, `Nav.astro`, `Footer.astro`, and tests.

## How the audit was run

```
# in a detached worktree at feat/i1-single-headline @ 4cdf520
npm install && npm run build          # clean, 10 pages
npm run validate                      # scripts/validate.mjs + boundary/theme/security
npm run sync-versions:check
node scripts/check-marketing-freshness.mjs
# link crawl of dist/**/*.html (internal resolve + external curl -L)
# cold-machine command spot-checks (npx + registry.npmjs.org)
# Playwright responsive pass at 375x812 and 1280x900 against `astro preview`
```

**Sample sizes:** internal links — 100% (all distinct `href="/…"` in `dist/`, 0 broken). External links —
100% of distinct destinations (~18 URLs) via `curl -L`; npm package pages re-verified via
`registry.npmjs.org` (curl returns 403 anti-bot, not a real status). Commands — 100% of visitor-facing
shell commands resolved against the npm registry; 3 representative commands executed
(`npx @kontourai/flow-agents --help`, `… init` presence, `… flow-kit` vs `kit`). Responsive — 3 pages
(home, developers, flow-agents) × 2 viewports.

---

## Findings

Each finding maps to a bar item, has a location, evidence, severity, and a `pr72`/`pre-existing` tag.

| # | Finding | Bar item | Location | Evidence | Severity | Tag |
|---|---|---|---|---|---|---|
| F1 | **Deploy-blocking version drift.** `npm run validate` exits **1**: 5 of 6 packages' `product-status.json` pins are behind npm latest — surface `1.3.1`→`2.1.2`, flow `1.4.1`→`2.0.0` (both a full **major** behind), survey `1.1.1`→`1.5.0`, veritas `1.1.1`→`1.2.0`, flow-agents `2.3.0`→`2.4.0`. The pages render version/status from this file, so the storefront advertises stale versions and `validate` would block a clean deploy. | V1, V2 | `src/data/product-status.json`; `scripts/validate.mjs` | `validate` output: 5×`ERROR … does not match npm latest`; `sync-versions:check`: `5 stale pin(s)` | **HIGH** | pre-existing |
| F2 | **Cold-machine "verify it yourself" commands run the wrong package.** The product pages show bare `npx flow …`, `npx surface …`, `npx veritas …`, and `npx console-inspect`. On a clean machine these resolve to **unrelated third-party npm packages** (`flow` = "Flow-JS"; `surface` = "a tiny koa middleware"; `veritas` = "extension library for pragmatists"; `console-inspect` = "a shortcut to console.log(util.inspect)"). A visitor copying them runs someone else's code — directly breaking the "check it yourself" thesis. Only `npx @kontourai/flow-agents …` is correctly scoped. | T1 | `flow.astro:115-119,246`; `surface.astro:104,243`; `veritas.astro:88,187`; `console.astro:84` | `registry.npmjs.org/{flow,surface,veritas,console-inspect}` all resolve to third-party packages; `npx @kontourai/flow-agents --help` ran and listed `init` | **HIGH** | pre-existing |
| F3 | **Documented CLI subcommand is stale.** flow-agents page shows `npx @kontourai/flow-agents flow-kit activate --dest .` and `… flow-kit install-local …`, but the shipped `@kontourai/flow-agents@2.4.0` CLI subcommand is **`kit`** — `flow-kit` returns `Unknown flow-agents command: flow-kit`. | T2 | `flow-agents.astro:216-217` | Ran `npx @kontourai/flow-agents@2.4.0 flow-kit --help` → "Unknown command"; `… kit --help` → `usage: flow-agents kit <install\|activate\|inspect\|list\|status>` | **MED-HIGH** | pre-existing |
| F4 | **Shipped features unmarketed vs current versions.** `check-marketing-freshness` flags **all 6** products STALE — each `marketingReviewed.version` trails npm by a minor/major (e.g. surface reviewed at `1.0.0`, now `2.1.2`). Page copy and screenshots have not been reconciled against 1–2 majors of shipped change. | V3, V4, S1 | all `src/pages/*product*.astro`; `product-status.json` `marketingReviewed` | `check-marketing-freshness`: `6 product page(s) need a marketing pass` | **MED** | pre-existing |
| F5 | **Stray unstyled paragraph renders outside the page layout.** A bare `<p>` about attestations sits after `</Section>` (no `.container` wrapper) and renders edge-to-edge in the built page. | C2 | `veritas.astro:247` (confirmed in `dist/veritas/index.html`) | Rendered `dist` HTML shows a bare `<p>` after `</section>`, before `<footer>` | **MED** | pre-existing |
| F6 | **Developers page missing from `sitemap.xml`.** #72 promotes `/developers/` to a primary destination (adds it to nav/footer and moves the "Six products. One job." architecture tour there), but the sitemap lists 8 URLs and omits `/developers/`, so the page #72 made important is not advertised to crawlers. | E3 | `public/sitemap.xml` (built `dist/sitemap.xml`) | sitemap `<loc>`s vs `dist/**/index.html`: `/developers/` built but absent from sitemap | **MED** | pr72 |
| F7 | **Naming drift vs the public glossary.** Copy uses the code-form `TrustBundle` / `Surface TrustBundle` where the glossary's canonical public term is **"Trust bundle"**; uses "Trust Reports" and the adjective "Grounded" where the glossary's noun is **"Grounding"**. Glossary §4 *avoid*-terms are otherwise clean (0 hits for `TrustInput`, `candidateSetId`, `TrustReport`, etc.). | N1, N2 | `survey.astro:152,376`; `developers.astro:216`; `index.astro:71` | grep of `dist`: 0 avoid-list hits; `TrustBundle` present in visible copy; glossary §1 lists "Trust bundle" as canonical | **MED** | pre-existing |
| F8 | **Internal links mix trailing/no-trailing slash.** Product links from `products.ts` are slashless (`/flow`, `/surface`, …) while nav/footer/developers use trailing slash (`/flow/`); both resolve but the mix causes 301 hops depending on host config. | L3 | `src/lib/products.ts` (slashless); `Nav.astro`/`Footer.astro`/`developers.astro` (trailing) | link crawl shows both `/flow` and `/flow/` forms in `dist` | **LOW** | mixed (products.ts pre-existing; Nav/Footer/developers touched by #72) |
| F9 | **Homepage mobile DOM overflow (masked).** At 375px the homepage `scrollWidth` (638) exceeds `innerWidth` (375) due to two decorative `.glow` divs (900/720px) in the hero; `body{overflow-x:hidden}` hides it so there is **no visible/usable horizontal scroll**, but the layout relies on that one rule as its only guard. | R1 | `index.astro` hero `<Glow>`; `global.css` `.glow` | Playwright: `scrollWidth 638 vs innerWidth 375`; wheel scroll kept `scrollX=0`; other pages 375==375 | **LOW** | pr72 |
| F10 | **Orphan image assets.** `public/screenshots/flow-console.png` and `public/og/kontour-share.svg` are committed and shipped to `dist/` but referenced by no page. | S2 | `public/screenshots/flow-console.png`, `public/og/kontour-share.svg` | grep of all `dist` HTML: 0 references to either file | **LOW** | pre-existing |
| F11 | **404 page is indexable.** `/404` emits a self-`canonical` and full og tags with no `robots noindex`, so it can be indexed/canonicalized like a real page. | E3 | `404.astro` / `Layout.astro` | `dist/404.html` has `rel="canonical" href=".../404/"`, og tags, no `noindex` | **LOW** | pre-existing |
| F12 | **npm-package link asymmetry.** Surface, Survey, and Veritas link to their `npmjs.com` package page; Flow and Flow Agents do not — inconsistent "where to verify" affordance across product pages. | L2 (consistency) | `flow.astro`, `flow-agents.astro` vs `surface/survey/veritas.astro` | external-link inventory: npm links present for 3 of 6 products | **LOW** | pre-existing |
| F13 | **Dead commented-out copy awaiting an unshipped dependency.** Survey source carries a commented "collection provenance" sentence gated on `survey#71`/`veritas#83` (not in `dist`, so not visitor-visible) — a marker that an in-flight feature is half-written into the page. | C1 | `survey.astro:398-399` | source comment present; absent from `dist/survey/index.html` | **INFO** | pre-existing |

### What PASSED (positive evidence)

- **Copy quality (C1):** 0 lorem/ipsum/TODO/TBD/FIXME/"coming soon"/"click here"/AI-slop-phrase hits in visible copy. Copy is specific and on-voice.
- **Content boundary (B1):** `check-content-boundary` PASS.
- **Internal links (L1):** 0 broken — all `href="/…"` resolve to built pages.
- **External links (L2):** all destinations resolve (github repos + deep blob/tree paths, `kontourai.github.io` docs + `/survey/demo/`, `hachure.org`, npm pages) return 200.
- **SEO/meta (E1, E2):** all 10 pages have exactly one `<h1>`, unique title, description, canonical, viewport, `lang="en"`, og:image + twitter card; og image file exists.
- **Responsive (R1 partial):** developers and flow-agents have no mobile overflow; all 3 tested pages render cleanly at both viewports with usable nav (home overflow is F9, masked).
- **Naming avoid-list (N1):** 0 glossary §4 avoid-terms in shipped copy.
- **Theme + security validators:** `check-theme-tokens` and `check-security-hardening` PASS; strong CSP/security headers in `_headers`.

---

## Gate evaluation (as of 2026-07-03, against `feat/i1-single-headline` @ `4cdf520`)

**GATE STATUS: FAIL — advertising kontourai.io stays BLOCKED.**

| Bar item | Result | Note |
|---|---|---|
| V1 version pins == npm | **FAIL** | F1 — `validate` exits 1 |
| V2 no stale pins | **FAIL** | F1 — 5 stale pins |
| V3 no unmarketed features | **FAIL** | F4 — 6 products STALE |
| T1 commands run cold | **FAIL** | F2 — bare npx wrong package |
| T2 documented subcommands exist | **FAIL** | F3 — `flow-kit` unknown |
| C2 no content outside layout | **FAIL** | F5 — veritas stray `<p>` |
| E3 sitemap/404 hygiene | **FAIL** | F6 (dev missing) + F11 (404 indexable) |
| N2 canonical glossary terms | **FAIL** | F7 — `TrustBundle` |
| L3 slash consistency | **FAIL** | F8 |
| R1 no mobile overflow | **FAIL (masked)** | F9 — home only, hidden by overflow-x |
| S2 no orphan/broken assets | **FAIL** | F10 — 2 orphans |
| C1, L1, L2, B1, E1, E2, N1 | **PASS** | see positives above |
| C3, V4, S1, N3, R2 (OWNER) | **NOT SIGNED** | pending owner review |

The largest blockers are **claims-vs-reality (F1)** and **cold-machine trust commands (F2/F3)** — both HIGH,
both undermine the site's core promise, and both are `pre-existing` (not #72's to fix). #72's own must-fix
before the storefront it ships can be advertised is **F6** (add `/developers/` to the sitemap).

---

## Prioritized follow-on issues (each independently fileable)

Ordered by priority. Each maps to finding(s) above; "fixed" = the bar item flips to PASS.

1. **Reconcile kontourai.io product version claims with npm latest (unblock `validate`)** — F1. Run
   `npm run sync-versions`, update page copy/badges, re-run `npm run validate` → exit 0. *(HIGH, pre-existing)*
2. **Scope every "verify it yourself" command to `@kontourai/*` so it works on a cold machine** — F2. Replace
   bare `npx flow/surface/veritas/console-inspect` with scoped `npx @kontourai/…` or install-then-run. *(HIGH, pre-existing)*
3. **Fix stale flow-agents CLI docs: `flow-kit` → `kit`** — F3. Update `flow-agents.astro` to the shipped
   `kit` subcommand. *(MED-HIGH, pre-existing)*
4. **Marketing-freshness + screenshot refresh pass for all six product pages** — F4, S1. Reconcile copy and
   screenshots to shipped majors; bump `marketingReviewed`. *(MED, pre-existing)*
5. **Fix the veritas stray unstyled paragraph** — F5. Wrap `veritas.astro:247` in a `Section`/`.container` or remove. *(MED, pre-existing)*
6. **Add `/developers/` to `sitemap.xml`** — F6. #72's own launch fix. *(MED, pr72)*
7. **Align public copy to glossary canonical terms (`Trust bundle`, `Grounding`)** — F7. *(MED, pre-existing)*
8. **Normalize internal-link trailing slashes to kill 301 hops** — F8. Make `products.ts` and nav/footer agree. *(LOW, mixed)*
9. **Harden mobile: clamp decorative `.glow` so overflow isn't only masked by `overflow-x:hidden`** — F9. *(LOW, pr72)*
10. **Site housekeeping bundle: remove orphan assets (F10), make 404 `noindex` (F11), fix npm-link asymmetry (F12), resolve/delete the commented survey provenance line (F13).** *(LOW, mostly pre-existing)*
