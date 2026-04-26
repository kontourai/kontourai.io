# Public Directory Data

- Source: local public-directory product research snapshot
- Date analyzed: 2026-04-25
- Workflow archetype: Public data trust; marketplace/transaction trust
- Opportunity classification: Surface adapter candidate; product archetype reference
- Kontour fit: Veritas medium, Surface high

## Summary

A public-directory product has a trust problem that is not only whether a listed entity exists. Users rely on changing public-data claims: registration status, price, schedule, age ranges, location, provider identity, contact details, and whether a value is missing because it is unknown or intentionally not applicable.

The repo has grown into a strong public-data trust workflow with crawl runs, change proposals, field-level sources, admin attestations, review flags, provider-level rollups, field timelines, and admin-assistant actions.

## Trust-Bearing Claims

- A camp or provider exists and belongs to a community.
- A field value is current: registration status, schedule, pricing, website, category, location, contact, or age range.
- A value was extracted from a specific source URL and excerpt.
- A blank field was intentionally reviewed or attested as not applicable.
- A crawl found no changes, failed, or produced proposals.
- A proposal was approved, rejected, skipped, or partially applied.
- A camp is fully verified because required fields have approved field sources.
- A provider-level crawl or hint applies across multiple camps.
- A review flag disputes or calls attention to current data.

## Current Evidence And Validation

- `CrawlRun` and `CrawlCampLogEntry` records track crawl status, processed camps, errors, proposed changes, model, duration, and source URL.
- `CampChangeProposal` and `ProviderChangeProposal` preserve raw extraction, proposed changes, confidence, excerpts, source URLs, reviewer state, and partial approvals.
- `FieldSource` records approved field-level evidence with source URL, excerpt, and approval timestamp.
- `computeCoverage` gates verified status on required fields having approved sources or attestations.
- Admin attestations allow intentionally blank fields to count as reviewed.
- `ReviewFlag` and entity context expose disputed or needs-review records.
- Provider entities group many camps under shared crawl hints, provider pages, and provider-level crawl behavior.
- Field timelines show last update and last attestation state.
- Admin assistant actions require confirmation before mutating trust data.

## Missing, Stale, Disputed, Or High-Impact Claims

- Public data can become stale quickly around registration windows and camp schedules.
- Provider-level truth and camp-level truth need different freshness windows.
- A crawl failure should not erase prior trust; it should change the current trust state.
- AI-extracted fields need confidence and source excerpts, but confidence alone is not enough for trust.
- Parents need simple labels, while admins need field-level evidence and review workflows.
- A blank value has at least three meanings: unknown, unavailable, and intentionally not applicable.

## Veritas Fit

This workflow could use Veritas to govern changes to ingestion and trust workflows:

- If extraction parsers change, fixture outputs and proposal-review tests should change.
- If verified-status requirements change, coverage tests should change.
- If admin mutation routes change, confirmation and audit-log tests should change.
- If provider crawl behavior changes, provider/camp trust-boundary tests should change.

## Surface Fit

Public directory data is a direct Surface fit because it needs a trust report for changing public facts.

Surface should be able to represent:

- `public-data-field` claims for approved camp and provider fields.
- `field-attestation` claims for reviewed blanks, overrides, and source-backed values.
- `crawl-run` claims for extraction freshness and crawl failure state.
- `change-proposal` claims for pending, approved, rejected, skipped, or partially applied updates.
- `review-flag` claims that dispute the current public value.
- Provider-level surfaces where one source, domain, or hint applies to many child claims.

## Product Ideas

- Public-data trust console for directory products.
- Parent-facing data freshness badges that stay simple while preserving evidence drilldown.
- Provider-level evidence coverage: "12 camps, 9 current, 3 need review."
- Crawl failure triage queue that distinguishes source failure from data dispute.
- Reusable blank-field semantics: unknown, unavailable, intentionally not applicable, not yet reviewed.

## Foundation Lessons

- Trust coverage often belongs at field level, not only entity level.
- Human attestation is not a fallback; it is a first-class evidence type.
- Blank values need explicit semantics.
- Parent/consumer UX and admin/evidence UX need different levels of detail over the same trust model.
- Provider/group-level claims can govern many child claims and should be first-class in Surface.
- "Easy to understand quickly" means surfacing the trust state first, then allowing drilldown into crawl logs, proposals, excerpts, and attestations.

## Follow-Up Questions

- Should Surface add a first-class `attestation` evidence type with modes such as source, override, and intentionally blank?
- Should Surface model parent-child surfaces such as provider -> camps?
- How should stale crawl state interact with previously verified field sources?
- Which public-facing trust labels are understandable to parents without exposing admin complexity?
