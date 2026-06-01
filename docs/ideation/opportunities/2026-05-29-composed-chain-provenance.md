# Composed Chain Provenance (Weakest-Link, Priced Risk)

- Source: internal product exploration.
- Date analyzed: 2026-05-29
- Workflow archetype: Compliance and audit evidence; high-stakes fact verification
- Entry type: distinct-shape exploration → primitive candidate + vertical leads
- Trust-shape novelty: breaks the single-owner assumption (each tier proves to the next; the
  final artifact carries the composed, weakest-link evidence of the whole chain)

## Concept

A multi-tier attestation chain where the final artifact carries the composed (weakest-link)
evidence of every hop, with gaps mapped to materiality so the output is a **price or a decision on
residual risk**, not a report. Maps to derivation edge (composition) + materiality primitives.

## Three markets (researched 2026-05-29)

### Carbon credits / VCM
Textbook multi-hop derived claim ("1 ton avoided"); 2023 investigation found ~90% of Verra REDD+
credits likely phantom; market fell ~61%. Ratings agencies (Sylvera, BeZero, Calyx, Renoster)
rate the *end credit*, not tier-by-tier composition. Real WTP for integrity: Sylvera's 2025 data
shows flight to quality (higher prices for higher-rated credits). **But regulatory tailwinds
collapsed in 2025** — SEC climate rule dead, EU Green Claims Directive withdrawn, CSRD Omnibus cut
~80% of companies. Demand is reputational/cyclical, not mandated. Close second.

### AI training-data lineage / content authenticity — best fit
Datasets scraped with no per-item license status; liability now concrete (NYT v. OpenAI survived
dismissal; preservation order on output logs). Two disconnected halves: C2PA/Content Credentials
(output authenticity) and licensing marketplaces (input rights, e.g., News Corp/OpenAI $250M+).
**No one composes the chain** — "trained on data with this provenance, here are the gaps, here's
your IP-indemnity price." Natural price output (indemnity). Hard mandate (EU AI Act GPAI
transparency, from Aug 2025) unlike carbon. Killer objection: C2PA does not survive distribution
(platforms strip metadata; RAND calls open-ecosystem end-to-end compliance unrealistic), and AI
labs are adverse to disclosing lineage.

### Supply chain (physical + software)
EUDR forces plot-level traceability but the EU just cut compliance cost ~75% and delayed
enforcement. DSCSA/conflict-minerals are mature, crowded compliance markets owned by incumbents.
Software (SBOM/SLSA/Sigstore) is the most technically mature composed-provenance stack but is being
absorbed into GitHub/GitLab for free — little standalone WTP.

## Verdict

Best gap-vs-demand: **AI training-data lineage** — wide-open composition gap, a hard regulatory
mandate (rare here), live expensive litigation, and a natural price output. Carbon is second
(clearest proven WTP-for-integrity, best "output is a price" fit, but collapsed regs). Software
supply chain has the best tech and worst monetization.

Hardest objection (universal): **composition is only as good as the attestation at each tier, and
the parties at the weak tiers are structurally motivated to lie or stay silent** (REDD+ developers,
AI labs, upstream smallholders). You can compose evidence you are given; you cannot manufacture it
where a tier refuses to attest. In the markets with the widest gaps, the obtainable evidence floor
is so low the composed artifact mostly says "unknown, priced high" — useful, but a harder sell than
a green checkmark.

## Disposition

Keep derivation-edge composition + materiality as Surface primitives. The strongest standalone
product lead is AI training-data lineage / IP-indemnity; treat carbon as a fast-follow if its
regulatory environment re-firms.
