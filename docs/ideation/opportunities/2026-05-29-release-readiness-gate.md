# Release Readiness Gate

Workflow archetype: compliance and audit evidence; developer evidence.

Entry type: product opportunity (built on Kontour Flow + Veritas + Surface).

## Source

- Internal product opportunity. No external project under review.

## Short Description

A deploy gate that means more than a green checkmark. Instead of "all checks passed," it answers
why a release was allowed to ship — which tests, security scans, rollback plan, and repo readiness
actually had evidence, and which gaps were accepted and by whom.

## Trust-Bearing Claims

- A release is ready to deploy.
- The required tests, scans, and reviews ran and passed on this exact change.
- A rollback path exists and was verified.

## Evidence Used Today

- CI status checks (often a single opaque green/red).
- Security and dependency scan output.
- Manual "approved to deploy" sign-offs with little linked context.

## Missing, Stale, Disputed, or High-Impact Claims

- Whether a green check reflects evidence for this change or a cached/skipped run.
- Whether an approver weighed the actual risk or rubber-stamped the deploy.
- Why a known-failing or waived check was allowed through.

## Veritas Fit

High. Veritas readiness reports are natural gate evidence for the change being shipped, and feed
directly into the Flow transition that authorizes the release.

## Surface Fit

High (via Flow). The release decision, its gate evidence, and accepted exceptions become an
inspectable record rather than a checkbox.

## New Foundation Lesson

This is the clearest showcase of the full stack: Surface for claims and evidence, Flow for the
required-path transition, and Veritas for code readiness as gate evidence. It demonstrates the
"make existing systems more trustworthy, don't replace them" position by consuming CI, scanners,
and Veritas rather than reimplementing them.

## Potential Product Ideas

- A release gate that turns CI, security, and Veritas readiness into one Flow-backed transition with a report.
- Exception handling that records waived checks with owner, reason, and evidence.
- A post-incident view that reconstructs exactly why a given release was allowed to advance.

## Opportunity Classification

Stack-showcase product candidate; Flow + Veritas + Surface combination; developer-evidence category.

## Follow-Up Questions

- Which CI providers should have first-class evidence adapters?
- How should a waived gate be represented so it is honest but not blocking by default?
- What is the smallest deploy-gate slice that proves the value without a hosted service?
