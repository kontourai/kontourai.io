# AI Agent Action Approval Gateway

Workflow archetype: AI recommendation trust; compliance and audit evidence.

Entry type: product opportunity (built on Kontour Flow).

## Source

- Internal product opportunity. No external project under review.

## Short Description

A human-in-the-loop gateway for autonomous agents taking consequential actions — refunds, outbound
email, deployments, data deletion, payments. The required approval becomes an evidence-gated
transition, and every exception is recorded with the context and authority behind it.

## Trust-Bearing Claims

- An action is permitted under the current policy (for example, refunds over a threshold need approval).
- The required approval was obtained from someone with the authority to give it.
- The approver had the context needed to decide, not just a yes/no prompt.

## Evidence Used Today

- Agent logs and traces of the proposed action.
- Ad hoc Slack or email approvals with little structured context.
- Policy thresholds scattered across prompts and code.

## Missing, Stale, Disputed, or High-Impact Claims

- Whether a required handoff was skipped entirely.
- Whether the approver actually saw the relevant evidence.
- Why an exception was granted, after the fact, once chat memory is gone.

## Veritas Fit

Low to medium. Veritas could gate the agent's own codebase, but the runtime action approval is a
Flow use case.

## Surface Fit

Medium. Approvals and their context are evidence; Flow already builds on Surface, so the approval
record inherits claim/evidence/gap semantics for downstream inspection.

## New Foundation Lesson

Approval is only trustworthy if the authority and the context travel with it. Flow exceptions
should be first-class records — who accepted the gap, with what evidence, under which policy — and
must survive agent compaction so the decision can be audited later.

## Potential Product Ideas

- A drop-in approval gate for agent frameworks (LangGraph, CrewAI, OpenAI Agents) that blocks on
  high-impact actions and records the exception via Flow.
- A reviewer inbox that shows each pending action with the evidence the agent collected.
- Policy packs for common high-stakes action classes (financial, destructive, outbound comms).

## Opportunity Classification

Wedge product candidate; Flow distribution; AI-native opportunity category.

## Follow-Up Questions

- How should authority be modeled without building a full actor registry yet?
- What is the minimum context bundle an approver needs to make the record meaningful?
- How does the gateway degrade gracefully when no approver is available in time?
