# DESIGN.md — kontourai.io

> Prose companion: [Spec-driven in, evidence-backed out](https://kontourai.io/writing/spec-driven-in-evidence-backed-out/) — why this file exists and what the movement it rides is missing.

> The design.md movement says: write the spec down, and make the agent work
> from it. We agree — and this file exists to show the half the movement is
> still missing. A spec constrains what an agent *intends*. It does nothing
> about what the agent *claims afterward*. This site runs both halves:
> **spec-driven in, evidence-backed out.** This document is the spec half;
> the evidence half is enforced machinery you can check from the outside.

## What this site is

kontourai.io is the public shopfront for the Kontour product line — the
receipt layer for AI work. Its one design rule, from which everything else
follows:

**Every public claim derives from an artifact, or it doesn't ship.**

Product versions render from generated metadata, not hand-typed strings.
Receipt pages render from the actual downloadable `trust.bundle` files, not
prose about them. Enforcement tables render from one shared data module so
two pages can't drift apart. Where a claim can't be backed (organizational
independence, live stop-gate receipts, what the runtime doesn't catch), the
page says so in place — the honest-ceiling sections are part of the spec,
not an apology.

## Spec-driven in

The operating spec an agent (or human) works from in this repo:

- **`CONTEXT.md` / `AGENTS.md`** — the repo's operating contract: public-repo
  boundary, source-of-truth map, change guidance.
- **Shaped issues** — work arrives as issues with acceptance criteria,
  non-goals, and blockers recorded before implementation starts.
- **Executable spec** — the parts of the spec that matter most are not prose,
  they are checks: `check-content-boundary` (what may never appear in public
  copy), `check-theme-tokens` (the design system's accent contract),
  `check-receipts` (bundles must validate under **two** implementations and
  match their downloads byte-for-byte), `check-security-hardening` (headers,
  deploy scoping, and analytics script/beacon host consistency),
  `check-playwright-pin` (browser image lockstep), `check-sitemap`, a
  scheduled marketing-freshness desk signal (visuals and page copy vs
  released product versions), and a rendered Playwright suite that pins
  load-bearing copy — including the honesty-critical sentences — so silent
  drift fails CI.

## Evidence-backed out

What makes "done" mean *checked* rather than *claimed* in this repository:

- **Required, no-bypass status checks** on `main`: `Build, Test & Validate`
  and `Trust Verify`, with `enforce_admins` on.
- **Trust Verify** is an external anchor (a pinned, SHA-addressed action):
  on every pull request it re-runs the repo's canonical verification fresh in
  an environment the change's author doesn't control, and reconciles any
  published delivery bundle against its own results. Agent-authored bundles
  are never trusted as a source of truth — only used to detect divergence.
- **Fail-closed delivery reconciliation** (ADR 0022 adoption): a change must
  ship a `delivery/trust.bundle` or match a committed, owner-approved
  `delivery/DECLARED` exemption whose scope binds platform-set identity to a
  branch namespace. The exemptions are auditable artifacts in the repo.
- **A registry-parity gate** runs before any change-authored code executes in
  CI, so a pull request cannot rewrite the compared inputs before the
  comparison happens.
- **CODEOWNERS on the verification machinery** (`/.github/`, `/scripts/`,
  `/delivery/DECLARED`): a PR author cannot approve their own change to the
  gates they run under. Routine content merges stay autonomous; touching the
  machinery requires a human owner's review by construction.
- **Published receipts** at [/receipts/](https://kontourai.io/receipts/):
  real bundles from this product line's own pipelines, downloadable,
  recomputable under two validators (`@kontourai/surface` and the `hachure`
  reference CLI, both version-pinned in copy *and* in CI from the same
  source), led by a receipt whose verdict is a **refusal** — because green
  receipts prove a format and refusals prove a gate.

## The honest ceiling

The spec includes what the machinery does *not* do — maintained at
[/trust/](https://kontourai.io/trust/): what can't be certified, three ways
to cheat the gate and who catches each, the enforcement level per runtime,
and the named residuals (an admin can still bypass; a stale earlier pass
isn't auto-invalidated; workflow-definition changes bottom out at human
review). If you find this file claiming something those pages disclaim,
that's a bug — file it.

## Check it yourself

```sh
git clone https://github.com/kontourai/kontourai.io && cd kontourai.io
npm ci
npm run build && npm run validate   # the same canonical verification CI re-runs
npm run test:rendered               # the rendered-copy pinning suite
```

Or skip the clone and recompute a receipt from the live site — the commands
on [/receipts/](https://kontourai.io/receipts/) are the exact pinned ones CI
runs.
