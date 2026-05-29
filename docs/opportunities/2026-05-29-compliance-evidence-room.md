# Compliance Evidence Room

Workflow archetype: compliance and audit evidence.

Entry type: product opportunity (built on Kontour Surface, with Veritas for code-bound controls).

## Source

- Internal product opportunity. No external project under review.

## Short Description

A continuously-evidenced control room for frameworks like SOC 2, ISO 27001, and HIPAA. Each control
is a requirement that rolls up from concrete claims, each backed by current evidence, so audit prep
stops being a once-a-year scramble of screenshots and stale spreadsheets.

## Trust-Bearing Claims

- A control is satisfied (for example, "access is reviewed quarterly").
- The evidence for that control is current, not from last year's audit.
- A control bound to code (encryption, logging, retention) holds in the live codebase.

## Evidence Used Today

- Screenshots and exported reports gathered manually near audit time.
- Spreadsheets mapping controls to owners.
- CI and security-scan output that is rarely tied back to a named control.

## Missing, Stale, Disputed, or High-Impact Claims

- Whether a control's evidence has aged past its review window.
- Whether a passing control is still passing today, not just on the audit date.
- Whether a code-bound control is actually enforced in the repo versus asserted in a policy doc.

## Veritas Fit

Medium to high for code-bound controls. Veritas Repo Standards can supply evidence for controls
that live in software (no PII in logs, approved crypto libraries, audit logging on protected paths),
projecting into Surface Claim Groups.

## Surface Fit

High. Frameworks map to Claim Groups, controls to claims, and evidence freshness to automatic
`stale` transitions. Surface's typed gaps (`freshness_breach`, `provenance_gap`) make "this control
looks green but its evidence expired" a visible state.

## New Foundation Lesson

Compliance value is in freshness, not collection. The differentiator is a control that flips to
`stale` on its own when evidence ages out, and a Claim Group rollup that drills from framework
status down to the specific expired check.

## Potential Product Ideas

- A control room that ingests CI, IdP, and security-tool evidence and rolls it up by framework.
- Veritas standards packs for code-bound controls that emit Surface evidence automatically.
- An auditor view that exposes the evidence trace per control without granting system access.

## Opportunity Classification

Wedge product candidate with clear willingness-to-pay; Surface + Veritas combination.

## Follow-Up Questions

- Which control frameworks should ship as starter Claim Groups first?
- What freshness windows are defensible per control class?
- How much of an audit can be served from inspectable evidence without a hosted console?
