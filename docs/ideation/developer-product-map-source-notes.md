# Developer Product Map Source Notes

Issue: `kontourai/kontourai.io#2`

These notes record implementation tradeoffs for the public `/developers` route. They are not page copy.

## Positioning Guardrails

- Explain Kontour as product ownership boundaries and composition points, not as one monolithic platform.
- Keep Surface, Flow, Veritas, Flow Agents, Builder Kit, and Console responsibilities distinct.
- Keep public text focused on useful boundaries, current state, and fit; do not publish raw internal critique wording.
- Avoid unsupported maturity claims. Use current, near-term, and future labels where capability timing matters.
- Kubernetes-style operator support is a future possibility only, not current runtime support or a dependency.

## Public Page Shape

- First viewport should be useful to a developer evaluator, not only a brand splash.
- Use structured visual sections that can be inspected in rendered tests:
  - product ownership/layer map
  - evidence/work lifecycle flow
- Include sales/RevOps plus other workflow families so the page is not only about coding agents.
- Link to public product pages and GitHub repositories as the next inspection path.

## Tradeoffs

- Add `/developers/` as a site navigation link rather than adding it to `products`, because it is a cross-product guide rather than a product.
- Keep diagrams as responsive structured HTML so rendered-site tests can verify them without external image tooling.
- Use page-scoped CSS to avoid broad global design churn.
