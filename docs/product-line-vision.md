# Kontour AI Product Line Vision

Kontour AI builds transparency building blocks for the AI era.

AI systems can now summarize, recommend, approve, ship, transform, and act faster than humans can manually inspect. The company's opportunity is not to build another agent runtime. It is to make the work behind AI-mediated decisions visible enough that humans and agents can decide what to trust, where to pause, and what needs stronger evidence.

## Core Promise

> Show the work behind what AI-era products ask humans and agents to trust.

This is the connective tissue across the product line:

- **Surface** makes claims inspectable.
- **Flow** makes required process paths inspectable.
- **Veritas** makes code/change readiness inspectable.
- A future **agent workflow layer** will apply those primitives inside the agent tools people already use.

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

### Agent workflow layer

The agent workflow layer is not publicly named yet. It should eventually own the agent-facing distribution:

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
  Trust substrate for claims and evidence.

Flow
  Process transparency built with Surface.

Veritas
  Repo/change transparency built with Surface.
  Can act as a Flow evidence provider.

Agent workflow layer
  Agent-facing workflow distribution.
  Can consume Flow and Veritas.
```

This keeps every product focused while allowing them to reinforce each other.

## Market Position

Kontour's wedge is not "AI workflow automation."

The stronger category is:

> Transparency infrastructure for agentic systems.

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

Kontour AI builds transparency building blocks for the AI era.

### Surface

Surface shows the evidence behind product claims.

### Flow

Flow shows why work was allowed to move forward.

### Veritas

Veritas shows whether an AI-authored code change is ready to merge.

### Agent workflow layer

Coming soon: keeps agents on track inside the tools people already use.

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
- runtime-native workflow enforcement through a future agent workflow layer
- OpenTelemetry-compatible traces
- policy-as-code outputs where useful
- human approvals that include context and authority
- continuation state that survives agent memory loss

The result is a system that does not merely automate work. It shows why the work deserves trust.
