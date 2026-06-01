# Kontour AI Product Line Vision

Kontour AI shows the work behind AI.

Agents now act, decide, summarize, recommend, and ship faster than humans can manually inspect. Kontour AI builds the products that show the work behind every step — what was claimed, what evidence supports it, which gates the work passed, and what's still uncertain — so humans and other agents can decide what to trust, where to pause, and what needs stronger evidence.

## Core Promise

> Show the work behind what AI-era products ask humans and agents to trust.

This is the connective tissue across the product line:

- **Surface** makes claims inspectable.
- **Flow** makes required process paths inspectable.
- **Veritas** makes code/change readiness inspectable.
- **Flow Agents** applies those primitives inside the agent tools people already use.

## Why This Is Different

The market already has workflow engines, durable execution systems, agent frameworks, observability platforms, human approval tools, and policy engines.

Kontour should not compete by replacing those systems. Kontour should make them more trustworthy by creating portable, inspectable transparency artifacts:

- a claim with evidence, policy, freshness, and gaps
- a process transition with gate evidence and exceptions
- a code change with repo standards and merge readiness
- an agent workflow with continuation state and next-action evidence

The differentiator is the relationship between **what was expected**, **what happened**, **what evidence supports it**, and **what remains uncertain**.

## Product Boundaries

### Surface

Surface is the foundation. It owns claim/evidence transparency:

- Claims
- Evidence
- Evidence Traces
- Policies
- Trust Snapshots
- Trust Panels
- Transparency Gaps
- Conflicts

Surface should remain generic. Products built with Surface should not force users to learn Surface vocabulary unless they are integrating at the infrastructure layer.

### Flow

Flow owns process transparency:

- Flow Definitions
- Flow Runs
- Steps
- Gates
- Transitions
- Gate Evidence
- Exceptions
- Continuation
- Flow Reports

Flow answers: "Why was this process allowed to advance?"

Flow should integrate with workflow engines, durable runtimes, agent frameworks, approval tools, observability systems, and policy engines. It should not replace them.

### Veritas

Veritas owns repo/change transparency:

- Repo Standards
- Repo Map
- Requirements
- Evidence Checks
- Change Guidance
- Merge Readiness
- Standards Feedback

Veritas answers: "Is this code change ready to merge under this repo's standards?"

Veritas can provide evidence to Flow gates in development workflows.

### Flow Agents

Keep your coding agent on the required path across Claude Code, Codex, Kiro, and GitHub Actions. Flow Agents brings Flow-backed workflows and Kontour evidence into the agent tools you already use. It should own the agent-facing distribution:

- Work modes
- Skills
- Provider settings
- Runtime adapters
- Native harness hooks
- Console views
- Flow-backed workflow packs

It answers: "How do I get useful agent behavior in the tool I already use without remembering every workflow step?"

It can consume Flow to enforce workflow state across Codex, Claude Code, Kiro, GitHub Actions, Hermes, Pi, Droid, and future agent harnesses.

## Product-Line Architecture

```text
Surface
  Shared transparency foundation.
  Claims, evidence, freshness, gaps, policies, trust snapshots.

Veritas
  AI-authored code vertical built on Surface.
  Repo standards, requirements, evidence checks, readiness reports.

Flow
  Process transparency substrate.
  Steps, gates, transitions, runs, exceptions, Flow Reports.

Flow Agents
  AI agentic-work vertical built on Flow + Veritas.
  Work modes, skills, runtime adapters, hooks, console.
```

This keeps every product focused while allowing them to reinforce each other.

## Shared Resource Shape

New portable Kontour records should follow the
[Kontour Resource Shape](kontour-resource-shape.md): `apiVersion`, `kind`,
`metadata`, `spec`, optional `status`, and optional `proof`.

This convention gives Surface, Survey, Flow, Veritas, vertical products, and
agents a consistent envelope for trust-bearing records without turning every
product into the same product. Surface still owns claim and evidence
transparency. Survey still owns producer-side review and provenance before the
Surface boundary. Flow and Veritas use the same shape for their own process and
readiness records.

## Market Position

Kontour's wedge is not "AI workflow automation."

The stronger category is:

> Inspectability infrastructure for AI-assisted work.

That category includes:

- evidence-backed confidence
- process gates
- visible exceptions
- inspectable approvals
- runtime-portable reports
- policy-aware evidence
- trust state that humans and agents can both read

## Messaging

### Company

Kontour AI shows the work behind AI.

### Surface

The shared foundation under Kontour's products. One shape for claims, evidence, freshness, and gaps so the same trust state can be read by a person, an agent, or another system.

### Flow

Process transparency for any required-path work. Flow shows why a process was allowed to move forward — gate by gate, with the evidence behind each transition.

### Veritas

Merge autonomy for AI-authored code. Veritas turns your repo's standards into evidence-backed readiness reports the agent reads back.

### Flow Agents

Keep your coding agent on the required path across Claude Code, Codex, Kiro, and GitHub Actions. Flow Agents brings Flow-backed workflows and Kontour evidence into the agent tools you already use.

## What To Avoid

Avoid positioning Kontour as:

- an agent runtime company
- a workflow automation suite
- a BPM replacement
- an observability-only vendor
- a human approval app
- a generic policy engine
- a code review bot

Those categories are crowded and pull the company away from the sharper promise.

## What To Combine

The unique product motion combines:

- Surface-style claims and evidence
- Flow-style required-path gates
- Veritas-style repo readiness
- runtime-native workflow enforcement through Flow Agents
- OpenTelemetry-compatible traces
- policy-as-code outputs where useful
- human approvals that include context and authority
- continuation state that survives agent memory loss

The result is a system that does not merely automate work. It shows why the work deserves trust.
