---
name: veritas-init-guide
description: Guide AI-assisted Veritas initialization with read-only exploration, owner interviews, and reviewed plan artifacts while preserving the CLI mutation boundary.
triggers:
  - veritas init guide
  - veritas init
  - agent-led initialization
  - guided bootstrap
  - init plan
argument-hint: "explore | guided | apply"
---

# Veritas Init Guide

## Purpose

Use this skill when a repo needs AI-assisted Veritas initialization. The skill can explore the target repo, ask the owner for missing intent, and prepare a reviewed guided plan. It must not mutate the Veritas target repo directly. The CLI remains the only write path.

## Hard Boundary

- Treat `veritas init --explore` and `veritas init --guided` as read-only surfaces.
- Never hand-edit `.veritas/` files in the target repo.
- Never bypass `veritas init --apply --plan <artifact>`.
- Keep any site or commentary edits separate from Veritas repo state changes.

## Required Context

Before writing anything, read:

1. The approved plan, PRD, and test spec for agent-led initialization.
2. The target repo's docs, package metadata, test/build scripts, CI, and instruction files.
3. Existing Veritas output conventions, if present, so the plan matches current behavior.

If a required artifact is missing, stop and report the gap instead of guessing.

## Workflow

### 1. Explore

Run the deterministic CLI first:

```sh
veritas init --explore --root <repo> --output <repo>/.veritas/init-plans/<slug>.json
```

Use the stdout JSON and saved artifact as the baseline. Do not write starter files during exploration.

### 2. Inspect Beyond The CLI

Review repo context that the scanner may not fully infer:

- repo shape and package manager
- app, docs, and test surfaces
- CI and verification commands
- AGENTS.md, CLAUDE.md, and other instruction files
- risky mutation points and files agents should not touch

Record only evidence-backed observations.

### 3. Interview The Owner

Ask concise questions that fill the gaps the repo cannot answer:

- required proof boundaries
- preferred style and conventions
- release and verification expectations
- review rules and approval boundaries
- files or directories that must stay off-limits
- any instruction targets that must be preserved or activated

Prefer structured answers that can be serialized into the guided plan artifact.

### 4. Draft The Guided Plan

Write the owner answers into the guided plan artifact. Keep unanswered items unresolved instead of inventing defaults. Preserve the CLI-owned fields that drive apply behavior.

### 5. Apply Only Through CLI

After review, run:

```sh
veritas init --apply --plan <guided-plan>
```

Do not mutate the target repo by any other route. If a payload or target drifts from the reviewed artifact, fail and ask for a fresh plan instead of silently regenerating.

### 6. Verify

After apply, run the repo's verification gates and, if the website or docs changed, run the site checks required by that repo. Report exactly what passed and what remains unverified.

## Output Shape

When you finish, summarize:

- explored repo facts
- owner questions asked
- answers captured
- plan artifact path
- apply command used or deferred
- verification results

## Notes

- This skill is a workflow wrapper, not a bootstrap writer.
- The CLI owns parsing, validation, hashing, payload parity, and file mutation.
- The skill owns context gathering, question design, and artifact preparation.
