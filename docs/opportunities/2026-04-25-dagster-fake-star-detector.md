# Dagster Fake Star Detector

- Source: <https://github.com/dagster-io/fake-star-detector>
- Related sources: <https://dagster.io/blog/fake-stars>
- Date analyzed: 2026-04-25
- Workflow archetype: Reputation integrity
- Opportunity classification: Surface adapter candidate; opportunity category
- Kontour fit: Veritas medium, Surface high

## Summary

`fake-star-detector` is a Dagster tutorial project for analyzing suspected fake GitHub stars on a repository.

It has two detection paths:

- A simpler GitHub API model that collects stargazers, pulls profile metadata, and flags likely fake accounts with a low-activity heuristic.
- A more complex BigQuery/dbt model that uses GH Archive public event data, overlap analysis, and clustering-style heuristics to estimate suspicious star activity.

The project is strongly validation-oriented: it asks whether a public metric, GitHub stars, deserves trust.

## Trust-Bearing Claims

- This repository has N raw GitHub stars.
- This subset of stargazers appears suspicious.
- This repository's star count contains an estimated fake-star percentage.
- This account matched a low-activity fake-star heuristic.
- This account or repository participates in suspicious overlap clusters.
- This report was generated from GitHub API data or GH Archive data for a specific time window.

## Current Evidence And Validation

- GitHub API stargazer lists and profile metadata.
- Star timestamps.
- Account creation and update timestamps.
- Followers, following, public repos, public gists, and empty profile fields.
- GH Archive event history in BigQuery.
- Actor overlap across dates, repositories, organizations, and event types.
- Derived dbt tables such as actor summaries, suspicious repo summaries, and fake-star stats.
- Generated notebooks, Gists, Dagster asset materializations, and BigQuery tables.

## Missing, Stale, Disputed, Or High-Impact Claims

- The detector can support suspicion, but suspicion is not proof that a repository owner bought stars.
- Heuristic outputs can become stale because accounts disappear, spammers adapt, and GitHub integrity teams remove actors.
- The evidence window matters. A BigQuery run over one year of GH Archive data is not the same as full historical verification.
- False positives and false negatives are part of the trust model, not footnotes.

## Veritas Fit

The detector itself could use Veritas to enforce proof lanes for heuristic changes:

- If thresholds change, tests and fixture reports should change.
- If dbt models change, expected report schema and validation fixtures should update.
- If generated claims become user-facing, the repo should require evidence that precision/recall or known-case fixtures still hold.

## Surface Fit

This is a strong Surface fit because GitHub stars are a social-proof claim.

Surface could model:

- Claim: `repo.socialProof.githubStars.rawCount = N`.
- Claim: `repo.socialProof.githubStars.estimatedFakePercent = X`.
- Evidence: GitHub API pull at timestamp T.
- Evidence: GH Archive query window.
- Check: low-activity heuristic run.
- Check: activity-cluster heuristic run.
- Status: verified for raw source extraction.
- Status: proposed for estimated fake-star percentage.
- Status: stale when the source window or GitHub state changes.
- Fault line: suspected fake stars do not prove owner intent.
- Review signal: high-impact reputation claim needs human interpretation before public accusation.

Kontour should distinguish:

- "The star count appears manipulated."
- "Some accounts look suspicious."
- "The repository owner bought stars."

Those are different claims with different evidence burdens.

## Product Ideas

- Open-source reputation auditor.
- Marketplace review integrity monitor.
- Social-proof trust badges backed by inspectable evidence.
- Investor/recruiting diligence tool for inflated traction metrics.
- Agent-readable reputation trust feed for tools that recommend packages, repos, vendors, or apps.

## Foundation Lessons

- Some claims are heuristic, probabilistic, and adversarial.
- Evidence can be strong enough to require caution without being strong enough to make an accusation.
- Trust reports need to encode uncertainty and attribution boundaries.
- Validation pipelines should expose their data windows, thresholds, and known blind spots.
- Staleness can come from adversary adaptation, not just old timestamps.

## Follow-Up Questions

- Should Surface add a first-class `heuristic_check` or `model_check` evidence/check type?
- Should reputation metrics become a named workflow archetype on the public site?
- What status vocabulary best communicates "supported suspicion, not proof"?
- Can Kontour make uncertainty understandable without introducing fake precision?

