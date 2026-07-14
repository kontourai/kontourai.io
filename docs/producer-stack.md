# The Producer Stack

How the producer side of a claim — *source → extraction → candidate → review* —
is actually built: four composable, independently-usable libraries, each owning
one stage, that together turn raw sources into review-ready Survey inputs.

This is the engineering behind the vision's promise that **Survey makes the
producer side of a claim inspectable before it reaches Surface.** Everything a
claim asserts should trace back through this chain to the exact source content
it came from.

## The chain

```
 forage         traverse          lookout            survey
 ───────        ─────────         ─────────          ────────
 CRAWL          EXTRACT           CHANGE             SHAPE
 get the pages  what's on them    what changed       what "reviewed
 (safely)       (with receipts)   since last look    truth" looks like
```

Each stage owns one verb and deliberately refuses the others:

- **[forage](https://github.com/kontourai/forage)** — *crawl.* Fetch/frontier/
  robots/politeness/snapshots, with **SSRF- and DNS-rebinding-safe egress by
  default** (it fetches *untrusted* URLs — aggregator listings, discovered
  links — so it must). Deterministic replay + per-page provenance. Knows nothing
  about extraction. Survey-neutral, AI-free.
- **[traverse](https://github.com/kontourai/traverse)** — *extract.* Prepared
  content + a caller's `TargetFieldSchema[]` → provenance-bearing proposals,
  each with an excerpt and a locator. Never crawls, ranks, or resolves. Its
  output is a **neutral proposal type** (Survey is one consumer, proven by a
  compile-time compat check — traverse has no Survey dependency).
- **[lookout](https://github.com/kontourai/lookout)** — *change.* "Did this
  registered source drift since we last looked?" Cheap (conditional `304`),
  honest (typed results, never-throws, false-`304`-hardened), semantic
  (proposal-identity diff, not byte diff). Emits review-ready Survey inputs.
  Doesn't crawl or extract — it composes forage + traverse.
- **survey** — *shape.* What reviewed truth looks like: source → extraction →
  candidate → review → claim. The producer-side ledger the other three feed.

Dependencies point only downward — `survey ⊇ lookout → {forage, traverse}`,
`traverse → forage`, no cycles. Each library is usable alone.

## One discipline: lean core, injected seams

Every layer keeps its core dependency-light and refuses to bake in the heavy,
opinionated, or dependency-bearing parts. Those are **injected seams** the
consumer fills:

| Concern | Core stays free of it | Injected by the consumer |
|---|---|---|
| PDF parsing | traverse ships no PDF lib | `pdfTextExtractor` |
| OCR (scanned docs/images) | traverse ships no OCR | `imageTextExtractor` |
| AI extraction | traverse core is AI-free | provider adapter (behind a subpath) |
| Link intelligence | forage core is AI-free | `shouldFollow` hook |
| Snapshot storage | filesystem default | any `SnapshotStore` (object store, DB) |

The abstraction is drawn on the *right axis*: parametrize the **input** (schema +
how to turn bytes into text), fix a clean **output** (citable proposals). That's
what lets the same core serve very different consumers without knowing anything
about their domain.

## Proven by two consumers

The stack isn't speculative generality — two different apps consume it:

- **campfit** (summer-camp discovery): forage crawls provider/aggregator sites →
  traverse extracts camps → lookout detects newly-appeared providers on
  re-check → survey-shaped review. Untrusted URLs (aggregator listings,
  discovered links) are exactly why forage's default-on SSRF guard matters.
- **taxes** (household tax workflow): fetches tax-authority rule-source PDFs →
  traverse extracts withholding facts (with an injected PDF extractor + tesseract
  OCR for scanned forms) → drift-detects when a source changes → survey-shaped
  review. A *different domain* using *every* layer — including the PDF/image
  seams — validates that the abstractions generalize.

Two independent consumers of each layer is the signal that a library has earned
its boundary. campfit and taxes reaching for the same crawl/extract/change/shape
primitives, in different domains, is why these are libraries and not app code.

## How it feeds the trust ledger

This stack is the **supply side** of the producer story. Its output —
provenance-bearing proposals, drift events, review-ready candidates — is what
becomes *Assert/Observe* trust state once reviewed: a claim, on the record, whose
evidence traces back through survey → lookout/traverse → forage to the exact
snapshot bytes it came from. "Show the work" only holds if every link in that
chain keeps its receipts, which is why each layer preserves provenance
end-to-end.
