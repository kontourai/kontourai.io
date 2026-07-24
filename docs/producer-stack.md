# The Producer Stack

The producer side of a reviewed claim is a composition, not one library with a
catch-all mandate. This is the public engineering path:

```text
Forage acquisition and snapshots
  → Traverse preparation and proposals with exact locators
  → Survey inspection and review
  → Lookout recheck and proposal diff
  → Surface reviewed trust export
```

The order describes how an application can carry provenance from an observed
source into a reviewed export. It is not a requirement to use every package in
every application. Each library remains independently usable and keeps the
responsibilities below deliberately separate.

## Ownership

| Stage | Owner | What it contributes | What it does not decide |
| --- | --- | --- | --- |
| Acquire and replay | [Forage](https://github.com/kontourai/forage/blob/b44f54628bcef3996da891542ff216ad86b87015/README.md) | Guarded acquisition, content-addressed snapshots, portable snapshot references, and exact snapshot replay. | Extraction schema, review disposition, trust status, or application policy. |
| Prepare and propose | [Traverse](https://github.com/kontourai/traverse/blob/67ab505e4b7096760741c6d522991bad2b94c016/README.md) | Caller-directed extraction proposals. It validates an excerpt against prepared text and derives exact `chars:<start>-<end>` locators. | Crawling, candidate resolution, human review, or trust projection. |
| Inspect and review | [Survey](https://github.com/kontourai/survey/blob/4394d8a2389654334fe5372e240e53106c7a074c/README.md) | The source → extraction → candidate → review records, review decisions, and their projection input. | Source fetching, extraction execution, application storage policy, or the final trust-status semantics. |
| Recheck and compare | [Lookout](https://github.com/kontourai/lookout/blob/c90fb403d4c6ae3540e0c2555a5a5b5be5c02d94/README.md) | Conditional rechecks over Forage snapshots and deterministic proposal-observation diffs. | Extraction, review policy, scheduling, notification, or trust-bundle authoring. |
| Validate and export | [Surface](https://github.com/kontourai/surface/blob/d3ddf3d39fac6d81e0c983f9a189426ddcad2501/README.md) | Product-facing trust-bundle construction and validation for reviewed, provenance-bearing output. | How a producer acquires, extracts, reviews, or rechecks a source. |

For a source that changes, the application can replay the exact prior and fresh
snapshots, extract or reuse proposal observations, then present only the
semantic difference for a new review round. A byte change is not by itself a
review decision; a model response is not by itself reviewed truth.

## Fieldwork is the application boundary

[Fieldwork](https://github.com/kontourai/fieldwork/blob/20d2e8f760cddebb120ff53412c09df1d17f0615/README.md)
composes this path for a local review application. It owns application
composition, selected storage roots, loopback/server policy, run identity, and
the validation and persistence of review state. It uses Survey's review
semantics and workbench surfaces rather than creating a second review contract.

That boundary matters: an embedding host can choose its own storage and launch
policy without changing the meaning of a Traverse proposal, a Survey review, or
a Surface trust bundle. Fieldwork can acquire a source, run an exact snapshot,
open a review session, recheck it later, and export only after the reviewed
state is valid.

## Runtime selection is outside task meaning

Runtime wiring is an application/host decision, not an extraction task's
semantic definition.

- [Relay](https://github.com/kontourai/relay/blob/93d386885062a629432f91a958967f1498b3a15f/README.md)
  owns provider-neutral invocation portability. It does not choose a model or
  interpret an extraction.
- [Dispatch](https://github.com/kontourai/dispatch/blob/05c823e460a618a77900ce9e2b361aa8868480d1/README.md)
  owns explicit routing, budgets, fallback, and content-free receipts. It does
  not own credentials, domain prompts, review policy, or model-quality claims.
- [Datum](https://github.com/kontourai/datum/blob/91abe34e8080b82e10422696927f09fd60807ade/README.md)
  owns configured provider/model/role resolution. It resolves configuration;
  it does not invoke a model.

Runtime adapters can make an invocation portable and its policy inspectable.
They do not establish that a provider or model is generally accurate for an
extraction task.

## Document preparation adapters

Traverse's core is deliberately free of PDF parsing and OCR engines. PDF text
and scanned-image preparation require explicit host-supplied adapters; their
presence is a declared input-preparation capability, not evidence of model or
extraction quality. See the [Fieldwork format and adapter boundary](https://github.com/kontourai/fieldwork/blob/20d2e8f760cddebb120ff53412c09df1d17f0615/README.md)
and the [Traverse proposal boundary](https://github.com/kontourai/traverse/blob/67ab505e4b7096760741c6d522991bad2b94c016/README.md).

## Evidence boundary

This topology documents public contracts and deterministic mechanics. It does
not claim general model/provider superiority, a particular recall gain from
multipass processing, or live-provider performance. Evaluation of those claims
needs a task-specific, independently authored oracle and retained evidence.
Fieldwork's public conformance examples retain comparison-neutral oracles for
their deterministic mechanics, while provider-quality evaluation remains a
separate evidence tier.
