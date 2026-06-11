# Format Naming: Hachure Deep Clearance and Kontour-as-Format Analysis

Research snapshot dated 2026-06-10. This deepens the name-collision sniff in `trust-format-landscape.md` §4 into a fuller clearance on **Hachure** (the front-runner human-facing name for the trust format) and adds a precedent-driven analysis of naming the format after the company. The wire namespace `trust.kontour.ai/v1` is fixed and out of scope; this is about the spec/brand/package name humans say and type. Web-sourced; registry and DNS checks run live on 2026-06-10 and re-verified 2026-06-11 (npm/PyPI/crates availability, GitHub org status, RDAP for the open domains, hachure.io liveness — all unchanged). The trademark sections are a clearance *investigation*, not legal advice — a filing decision should still go through trademark counsel.

## 1. Hachure deep clearance

### 1.1 Trademark databases (USPTO, EUIPO/TMview)

- **USPTO**: no live or dead US trademark for HACHURE or HACHURES surfaced. Searched 2026-06-10 via the USPTO's post-TESS search system (TESS itself was retired 2023-11-30 — [USPTO](https://www.uspto.gov/subscription-center/2023/retiring-tess-what-know-about-new-trademark-search-system)) plus index sweeps of trademark aggregators (Justia Trademarks, TrademarkElite, uspto.report), none of which list a HACHURE mark in any class — including 9 (downloadable software) and 42 (SaaS/scientific services), the two classes that matter for a developer-facing format.
- **EUIPO/TMview**: no HACHURE mark surfaced via TMview/eSearch sweep. Caveat: "hachure" is an ordinary French word (the hatching/shading stroke), which both (a) lowers the odds anyone has registered it for software and (b) means a French-language examiner could view it as weakly descriptive for *graphics* software — but it is arbitrary for a trust format, which is the stronger position.
- **Unverifiable/residual**: official-database results were gathered by automated browser search the same day; before filing, counsel should re-run a professional full search (state marks, common-law use, Madrid filings designating the US/EU). Aggregator indexes can lag the federal register by weeks.

Net: **no registered or pending mark found in any jurisdiction checked**, in any class.

### 1.2 Existing companies and products named Hachure

| Entity | What it is | Status | Conflict risk |
|---|---|---|---|
| [hachure.io](https://www.hachure.io/) | Photo/video/interactive renders of solar, wind, storage projects for permitting and community engagement; brand of Dialogue Theory (Boston); clients incl. GE Renewable Energy, Dominion | Active (site live, copyright 2024, working contact) | **Low.** Service business (3D visualization for energy developers), not a developer tool, data format, or software product. No US registration found; their rights would be common-law, scoped to renewable-energy visualization services. A trust format for AI-assisted work is a different channel, different buyer, different goods. Closest shared turf is "software-adjacent services in class 42," which is broad enough that counsel should note it, but likelihood-of-confusion is hard to argue between solar-farm renders and a trust spec. |
| HACHURE LTD (UK) | Clothing retail company, Harrogate | **Dissolved 2024-04-02** ([Companies House](https://find-and-update.company-information.service.gov.uk/company/13314952)) | None. Dead entity, unrelated class (25/35). |
| hachureca.com | Canadian career/recruiting platform | Live (HTTP 200, 2026-06-10) | Low. Different vertical, different country, no mark surfaced. |
| Generic cartography/graphics uses | "Hachure" is the standard term for relief/hatching strokes — a fill style in [Rough.js](https://roughjs.com/), feature names in ArcGIS, QGIS, Surfer; npm has the adjacent `hachure-fill` polygon utility | Ongoing generic use | None as a legal conflict (generic in *that* field, arbitrary in ours). Mild discoverability cost: searches for "hachure" return cartography content; "hachure format" / "hachure spec" will need SEO work initially. |

### 1.3 Package registries and code hosting (checked live 2026-06-10)

| Namespace | Status |
|---|---|
| npm `hachure` | **Available** (registry 404) |
| npm `hachures` | **Available** (registry 404) |
| PyPI `hachure` | **Available** (404) |
| crates.io `hachure` | **Available** ("crate does not exist") |
| GitHub org `hachure` | **Taken but dormant**: created 2016-11-23, zero public repos, no profile name/URL/description. Effectively squatted. GitHub does not generally release inactive org names, so plan on `hachure-format`, `hachuredev`, or housing the spec under the existing Kontour org. |

### 1.4 Domains (DNS + RDAP, 2026-06-10)

| Domain | Status |
|---|---|
| hachure.dev | **Unregistered** (RDAP 404) |
| hachure.org | **Unregistered** (RDAP 404) |
| hachure.ai | **Unregistered** (RDAP 404) |
| gethachure.com | **Unregistered** (RDAP 404) |
| hachure.io | Registered and active — the solar-render company |
| hachure.com | Registered, parked on Afternic nameservers (aftermarket; presumably buyable, price unknown) |

`hachure.dev` + `hachure.org` is the natural pair for a spec (spec site on .org or .dev, mirroring graphql.org / opentelemetry.io patterns). Register all four open ones immediately — total cost is trivial and this is the most perishable part of the clearance.

### 1.5 Pronunciation and spelling risk

- Pronunciation: /hæˈʃʊər/ ("ha-SHOOR"), French-derived. Expect a sizable minority to say "HATCH-er" or "ha-CHUR." Comparable to names the industry absorbed fine (Kubernetes, nginx, Qt); a one-line pronunciation note on the spec homepage handles it.
- Spelling: predictable misspellings are *hatchure*, *hashure*, *hachour*. Worth registering `hatchure` typo-domains only if the project gets traction; not a blocker.
- Familiarity upside: a slice of front-end developers already know the word from Rough.js's `fillStyle: "hachure"`, which gives it a faintly hand-drawn, craft connotation — not a bad resonance for "marks of verification laid over work."
- Semantic fit: hachures are the small strokes cartographers layer onto a map to show the terrain's true shape — a defensible metaphor for testimony layered onto work to reveal its trust contours, and it rhymes conceptually with "Kontour" without containing it.

### 1.6 Verdict: **clear-to-proceed** (with three mechanical caveats)

No registered trademark surfaced in US or EU in any class; the only active same-name business is in an unrelated vertical with no registration; every package namespace that matters is open; four good domains are unregistered. The caveats are operational, not blocking: (1) the GitHub `hachure` org is squatted — pick `hachure-format` or similar; (2) hachure.io and hachure.com are not gettable cheaply — use .dev/.org; (3) file US classes 9 + 42 (and an EUTM) promptly, since the whole point of clearance is to move before someone else does. Re-verify with counsel before filing.

## 2. Naming the format after the company: precedents

The wire namespace already says `kontour.ai`; the open question is whether the *human-facing* name should too. Five precedents:

| Format | Origin company | Did company association help or hurt? | Governance move that made it work |
|---|---|---|---|
| **GraphQL** (Facebook, 2015) | Helped early (Facebook-scale credibility), then became a liability — the 2017 BSD+Patents license controversy showed how company association can chill adoption overnight. | Facebook moved GraphQL to a neutral GraphQL Foundation under the Linux Foundation (announced [Nov 2018](https://www.linuxfoundation.org/press/press-release/intent_to_form_graphql)); the Foundation became "a fully neutral home for the GraphQL trademark" ([graphql.org](https://graphql.org/community/foundation/)) with a formal LF trademark policy ([graphql.org/brand](https://graphql.org/brand/)). Crucially, the *name* never had Facebook in it, so donation required no rename. |
| **Swagger → OpenAPI** (SmartBear, 2015) | The Swagger brand built adoption, but a vendor-owned name capped it: enterprises and rival vendors (Google, Microsoft, IBM) would not standardize on a competitor's trademark. | SmartBear donated the *spec* to the Linux Foundation's OpenAPI Initiative but **kept the Swagger trademark for its tools** — which forced the spec to be renamed OpenAPI on 2016-01-01 ([Wikipedia](https://en.wikipedia.org/wiki/OpenAPI_Specification), [Swagger blog](https://swagger.io/blog/api-strategy/difference-between-swagger-and-openapi/)). A decade later "Swagger vs OpenAPI" is still a top search query — the rename created permanent confusion. This is the cautionary tale: a name you can't donate is a name the standard will shed. |
| **Protocol Buffers** (Google, OSS 2008) | Google association mostly helped (battle-tested at scale); the name is descriptive, not "Google-branded." Never donated to a foundation — Google explicitly prioritizes its own needs in external contributions ([protobuf.dev](https://protobuf.dev/)) — and it still won as a de facto format. But note: protobuf is an *implementation-led* format, not a multi-vendor standard; nobody needs to sit on its governance board to adopt it. | None — retained by Google. Works because adoption never required neutrality, only utility. The lesson transfers poorly to a *trust* format, where neutrality is part of the product. |
| **Markdown** (John Gruber, personal project, 2004) | No company, no trademark, no governance — adoption exploded, then fragmented into incompatible dialects. The 2014 "Standard Markdown" episode (Gruber objected; project renamed to CommonMark — [Atwood](https://blog.codinghorror.com/standard-markdown-is-now-common-markdown/), [InfoQ](https://www.infoq.com/news/2014/09/markdown-commonmark/)) shows the failure mode of *no* mark stewardship: nobody can bless a successor spec, so the ecosystem forks on the name itself. | None, and it cost the ecosystem a decade of dialect chaos. Lesson: someone should own and steward the mark — the question is only who, eventually. |
| **OpenTelemetry** (OpenTracing + OpenCensus merger, 2019) | Born neutral: vendor-neutral name, CNCF-owned marks from day one, seed governance from Google, Lightstep, Microsoft, Uber ([Google OSS blog](https://opensource.googleblog.com/2019/05/opentelemetry-merger-of-opencensus-and.html)); CNCF graduation 2026 as "de facto observability standard." The merger happened partly *because* two single-steward projects splitting the community was the biggest problem. | Foundation-native from the start — the cleanest pattern, but it presumes multi-vendor founding energy Kontour doesn't have yet. |

Pattern: company-association helps a format get its first thousand users (credibility, docs, funding) and hurts at the standardization step (competitors won't build on your trademark). Every spec that crossed that step either had a donatable neutral name (GraphQL, OpenTelemetry) or paid a permanent rename tax (Swagger→OpenAPI). The only company-retained survivor (protobuf) won on utility in a domain where neutrality didn't matter — the opposite of a trust format, whose pitch *is* "anyone can recompute the status; no vendor is the oracle."

### Recommendation for Kontour

**Name the format Hachure** (separate brand), not "Kontour" and not "Kontour Trust Format."

- **"Kontour" (company-as-format)**: maximizes short-term brand compounding, but it is the Swagger trap with the spelling pre-installed. If the spec is later donated, either the company surrenders its own name's trademark to a foundation (untenable — it's also the product-line brand for Surface/Survey/Flow/Veritas/Console) or the spec gets renamed and eats the OpenAPI confusion tax. It also permanently undercuts the neutrality pitch: "trust format, recomputable by anyone, owned by Kontour" reads as a contradiction to exactly the platform/enterprise adopters who matter. (Separate flag, unverified here: "Kontur" collides with SKB Kontur, a large Russian software firm — another reason not to stretch the company mark across more surface area.)
- **"Kontour Trust Format"**: descriptive and safe, but compound vendor-prefixed names get abbreviated ("KTF") or shed the prefix in practice, and donation still forces the Swagger-style rename — same trap, worse brand.
- **"Hachure"**: a clean, clear, ownable mark (per §1) that can be *donated with the spec* — trademark and all, GraphQL-style — while Kontour keeps its company and product names untouched. Company association still accrues ("Hachure, created by Kontour AI") exactly as "GraphQL, created by Facebook" did, but the exit to a foundation is a press release, not a rename. The fixed `trust.kontour.ai/v1` namespace is fine under this plan: wire identifiers routinely outlive branding (XML namespaces still point at 1990s URLs; in-toto predicateType URLs carry vendor domains) and a donated spec can alias a successor namespace in v2 without breaking v1.

Sequencing: register the four open domains and npm/PyPI/crates names this week; file HACHURE in US classes 9 + 42 and as an EUTM; publish the spec as "Hachure — the Kontour trust format" so both names compound from day one; pre-write the trademark-donation intent into the spec's governance doc (even one paragraph) — it costs nothing now and is exactly the signal enterprise adopters look for.

## Sources

USPTO/TESS retirement: https://www.uspto.gov/subscription-center/2023/retiring-tess-what-know-about-new-trademark-search-system · USPTO search: https://tmsearch.uspto.gov/search/search-information · EUIPO/TMview: https://www.tmdn.org/tmview/ · hachure.io: https://www.hachure.io/ · HACHURE LTD: https://find-and-update.company-information.service.gov.uk/company/13314952 · hachureca.com: https://hachureca.com/ · Rough.js: https://roughjs.com/ · GraphQL Foundation: https://graphql.org/community/foundation/, https://www.linuxfoundation.org/press/press-release/intent_to_form_graphql, https://graphql.org/brand/ · OpenAPI rename: https://en.wikipedia.org/wiki/OpenAPI_Specification, https://swagger.io/blog/api-strategy/difference-between-swagger-and-openapi/ · Protobuf: https://protobuf.dev/, https://opensource.googleblog.com/2008/07/protocol-buffers-googles-data.html · Markdown/CommonMark: https://blog.codinghorror.com/standard-markdown-is-now-common-markdown/, https://www.infoq.com/news/2014/09/markdown-commonmark/ · OpenTelemetry: https://opensource.googleblog.com/2019/05/opentelemetry-merger-of-opencensus-and.html, https://www.cncf.io/blog/2021/08/26/opentelemetry-becomes-a-cncf-incubating-project/ · Registry/DNS/RDAP checks run live 2026-06-10 (npm registry, PyPI JSON API, crates.io API, GitHub API, rdap.org).
