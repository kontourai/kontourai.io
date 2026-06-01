# Adversarial Evidence Substrate (Neutral Dispute Record)

- Source: internal product exploration.
- Date analyzed: 2026-05-29
- Workflow archetype: Compliance and audit evidence; marketplace/transaction trust
- Entry type: distinct-shape exploration → primitive candidate
- Trust-shape novelty: breaks the mutual-trust assumption (two parties who distrust each other;
  Kontour owned by neither)

## Concept

Mutually-distrusting parties submit competing claims + provenance-tracked evidence; conflicts are
first-class; a neutral (human or agent) adjudicates from one inspectable record. Maps to the
`multi-party claim + adjudication record` primitive.

## Competitive landscape (researched 2026-05-29)

Key analog: **Online Dispute Resolution** — Modria (eBay/PayPal spin-out, acquired by Tyler
Technologies 2017) already runs neutral evidence exchange for property assessment appeals and several
court systems. It validates the pattern, but succeeded only where a forum already owned both
parties.

Domain scan:

- **Legal e-discovery** (Relativity, Everlaw, DISCO, Logikcull): single-party tools; each side
  runs its own instance and *produces* to the opponent. The neutral already exists — the court.
  Confidentiality ethics make a counterparty-adjacent SaaS a breach risk. Weakest fit.
- **Chargebacks / payment disputes**: strongest gap-vs-demand. ~$34B/yr pain; friendly fraud the
  leading fraud type. But the neutral substrate already works and is monetized — Visa Verifi /
  Order Insight shares transaction provenance pre-dispute (deflects 45–70%); Compelling Evidence
  3.0 codifies a provenance schema + automatic liability shift. The hardest objection: the card
  networks already own the neutral rail and both parties.
- **Insurance subrogation**: real, quantified leakage, but adjusters will not leave their claim
  platform; carriers prefer stronger one-sided demand packages; inter-carrier arbitration already
  plays neutral. Moderate; sell to one side, not as a substrate.
- **CLM / breach disputes** (Ironclad): single-party authoring; breach disputes are low-frequency
  and resolve into litigation. Thin.

## Verdict

Best gap-vs-demand is **off-network payment disputes** — B2B/invoice, ACH, marketplace, crypto —
where no Visa-equivalent neutral exists and "who owns the record" is unsettled. On-rail card
disputes are owned by Visa/Mastercard.

The single hardest objection is structural, not technical: **a neutral substrate only gets
adopted when something already compels both adversaries onto it** — a court, a marketplace, a card
network. Voluntary adoption by two parties who distrust each other *and* a third-party SaaS is the
core go-to-market risk. The wedge customer is a **forum** (regulator, platform, arbitration body)
that drags both adversaries in — never the adversaries themselves.

## Disposition

Keep `multi-party claim + adjudication record` as a Surface primitive. Pursue a product only via a
forum wedge customer, and only in an off-network dispute domain.
