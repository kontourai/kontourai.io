/**
 * Single source of truth for the product line shown in the Nav and Footer.
 *
 * Defined once so order, casing, and accents stay consistent across the site.
 * Order follows the homepage layering: products you can use today, then the
 * foundational primitives, then Console (the operating plane over the suite).
 */
import type { Accent } from "./theme";

export type ProductKey =
  | "veritas"
  | "flow-agents"
  | "surface"
  | "flow"
  | "survey"
  | "console";

export const products: { key: ProductKey; href: string; label: string; accent: Accent }[] = [
  { key: "veritas", href: "/veritas", label: "Veritas", accent: "green" },
  { key: "flow-agents", href: "/flow-agents", label: "Flow Agents", accent: "chalk-2" },
  { key: "surface", href: "/surface", label: "Surface", accent: "gold" },
  { key: "flow", href: "/flow", label: "Flow", accent: "cobalt-2" },
  { key: "survey", href: "/survey", label: "Survey", accent: "gold-2" },
  { key: "console", href: "/console", label: "Console", accent: "cobalt" },
];
