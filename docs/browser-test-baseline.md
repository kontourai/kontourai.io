# Browser Test Baseline

Kontour web surfaces should have a small real-browser gate when the rendered UI is part of the product evidence. Static unit tests are not enough for review consoles, docs sites, generated pages, or admin flows where layout, hydration, local storage, navigation, and console errors can break the user-facing proof.

## Minimum Standard

Every web-facing repo should expose a browser-test script once it has a meaningful rendered surface:

- `test:browser` for product apps, consoles, and examples.
- `test:rendered` is acceptable for static documentation sites that already use that name.
- CI must run the browser test on pull requests before merge.
- CI must install or provide the browser binary explicitly.
- Tests should fail on page runtime errors and unexpected console errors.
- Tests should cover at least one desktop viewport and one mobile viewport for primary workflows.
- Tests should assert user-visible outcomes, not pixel-perfect screenshots by default.
- Screenshots/traces are useful on retry or failure, but should not be the main assertion.

## What To Test

The first browser tests in a repo should cover the path that proves the product boundary:

- **Survey**: Review Workbench loads, records decisions/notes/navigation into `ReviewSessionEvent`s, reloads persisted state, and keeps review controls usable on mobile.
- **kontourai.io**: rendered pages build, route, and expose product vocabulary, metadata, analytics posture, and product-line pages.
- **Surface**: console or docs pages render inspectable claims, evidence, authority, integrity, and derived-trust state.
- **Flow**: console UI renders process state, transitions, and evidence links without breaking browser runtime.
- **Veritas**: rendered docs or console pages expose readiness/governance status when those pages are part of release evidence.
- **Verticals**: browser tests are required for Survey-backed review/admin flows, not for every backend-only rule or ingestion change.

## CI Shape

Preferred CI shape:

1. install dependencies
2. install/provide browser runtime
3. build
4. run browser tests
5. run static validation

For static sites, a Playwright container is acceptable. For package repos, install Chromium with `npx playwright install --with-deps chromium` before `npm run verify`.

## Boundaries

Browser tests should not become broad end-to-end tests for external systems. Keep them local and deterministic:

- use local fixtures and generated build output
- avoid live third-party calls
- avoid timing assumptions where a state assertion is available
- do not encode product-specific downstream assumptions in shared package browser tests
- keep one browser first unless cross-browser behavior is itself a product risk

The purpose is to prove the rendered product contract works in a real browser, not to replace unit, integration, or Veritas readiness checks.
