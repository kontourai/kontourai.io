/**
 * Theme primitives shared across components.
 *
 * `Accent` is the finite set of accent colors the design system exposes. Every
 * accent maps to a `--color-*` token in `src/styles/global.css`, and the
 * `[data-accent="…"]` rules there resolve it to the `--accent` custom property
 * that component scoped styles consume. Keep this union in sync with those
 * rules — it's the single typed list of valid accents for component props.
 */
export type Accent =
  | "gold"
  | "gold-2"
  | "green"
  | "red"
  | "cobalt"
  | "cobalt-2"
  | "chalk-2"
  | "chalk-3";
