# RAG / AI Answer Trust Layer

Workflow archetype: AI recommendation trust; knowledge and research provenance.

Entry type: product opportunity (built on Kontour Surface).

## Source

- Internal product opportunity. No external project under review.

## Short Description

A trust layer for retrieval-augmented assistants and answer engines. Every generated answer
ships with the claim it makes, the retrieved evidence behind it, how fresh that evidence is,
and the gaps a reader should weigh before acting on it.

## Trust-Bearing Claims

- An answer asserts a factual statement to the user.
- Specific retrieved passages support that statement.
- The cited sources are current as of some point in time.

## Evidence Used Today

- Retrieved document chunks and their source URLs or IDs.
- Embedding similarity scores between question, answer, and passages.
- Source timestamps and document versions.

## Missing, Stale, Disputed, or High-Impact Claims

- Whether a cited passage actually supports the sentence attached to it, or was merely retrieved.
- Whether the cited source is the latest version or has been superseded.
- Whether the answer made an inference the evidence does not justify (observation vs conclusion).

## Veritas Fit

Low. This is a runtime answer-quality use case, not a code-governance one, though the assistant's
own repo could adopt Veritas separately.

## Surface Fit

High. Answers map to Claims, retrieved chunks to Evidence with a trace to source and timestamp,
and "no supporting passage" or "source older than policy" to Transparency Gaps. Surface's method
depth (observation vs extraction vs corroboration) captures the difference between a grounded
answer and an unsupported inference.

## New Foundation Lesson

The dangerous failure in RAG is not a missing citation but a citation that does not support its
claim. Surface should make "evidence retrieved" and "evidence supports the claim" distinct
states, so `unsupported_inference` can be surfaced even when sources are present.

## Potential Product Ideas

- An SDK that wraps any RAG pipeline and emits a Surface Trust Snapshot alongside each answer.
- A reviewer console for support/research teams to triage answers whose evidence is weak or stale.
- A producer mapping for common retrievers (vector store + reranker) that preserves passage-level evidence.

## Opportunity Classification

Wedge product candidate; downstream Surface producer; AI-native opportunity category.

## Follow-Up Questions

- What freshness window applies to a cited source before an answer goes `stale`?
- How should partial support (passage supports part of the claim) be represented?
- Can answer-time gap detection run cheaply enough to sit inline in a chat response?
