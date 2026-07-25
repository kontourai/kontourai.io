/**
 * Single source of truth for the product line shown across the site.
 *
 * Defined once so order, casing, and accents stay consistent across the site.
 */
import type { Accent } from "./theme";

export type ProductKey =
  | "veritas"
  | "flow-agents"
  | "surface"
  | "flow"
  | "survey"
  | "console";

export type KitKey = "builder-kit" | "knowledge-kit";

// Applications are standalone front doors that compose product contracts. They
// remain separate from `products`: an application does not become a primitive
// product, a ProductKey, or a navigation/icon identity.
export type ApplicationKey = "fieldwork";

export type Kit = {
  key: KitKey;
  href: string;
  label: string;
  accent: Accent;
  job: string;
};

// The two kits with dedicated site pages. They ride the Flow Agents engine, so
// nav and footer file them inside the engine's own menu rather than giving them
// top-level slots (GTM direction 2026-07-03: single-story, wedge-first).
export const kits: Kit[] = [
  {
    key: "builder-kit",
    href: "/builder-kit/",
    label: "Builder Kit",
    accent: "chalk-2",
    job: "Agent delivery on the engine: shape, build, publish, learn.",
  },
  {
    key: "knowledge-kit",
    href: "/knowledge-kit/",
    label: "Knowledge Kit",
    accent: "gold",
    job: "What the agent learned, kept with the source it came from.",
  },
];

export type Product = {
  key: ProductKey;
  href: string;
  label: string;
  accent: Accent;
  repo: string;
  homepage: {
    job: string;
    relation: string;
  };
};

export type Application = {
  key: ApplicationKey;
  href: string;
  label: string;
  accent: Accent;
  repo: string;
  packageName: string;
  job: string;
  composition: string;
};

export const applications: Application[] = [
  {
    key: "fieldwork",
    href: "/fieldwork/",
    label: "Fieldwork",
    accent: "gold-2",
    repo: "https://github.com/kontourai/fieldwork",
    packageName: "@kontourai/fieldwork",
    job: "Turn messy source text into reviewed, source-linked data you can recheck and export.",
    composition: "Use it as the ready-made front door for extraction review; the underlying libraries remain available when you need a custom host.",
  },
];

// Order is nav/footer order: the Flow Agents engine leads, the disciplines it
// wires in follow (see kits above for the engine's installable workflows).
export const products: Product[] = [
  {
    key: "flow-agents",
    href: "/flow-agents/",
    label: "Flow Agents",
    accent: "chalk-2",
    repo: "https://github.com/kontourai/flow-agents",
    homepage: {
      job: "Keep AI coding work on a reviewable path across Claude Code, Codex, Kiro, opencode, pi, and GitHub Actions.",
      relation: "Adds evidence gates, resumable state, and receipts to the agent tools you already run.",
    },
  },
  {
    key: "veritas",
    href: "/veritas/",
    label: "Veritas",
    accent: "green",
    repo: "https://github.com/kontourai/veritas",
    homepage: {
      job: "Turns your repo's standards into evidence-backed readiness reports that agents and reviewers can rely on.",
      relation: "Brings the same evidence to merge — readiness reports a reviewer or agent can act on.",
    },
  },
  {
    key: "surface",
    href: "/surface/",
    label: "Surface",
    accent: "gold",
    repo: "https://github.com/kontourai/surface",
    homepage: {
      job: "Make a claim show its evidence, freshness, policies, and unresolved gaps in one portable record.",
      relation: "Gives the rest of the suite one inspectable trust record to read and write.",
    },
  },
  {
    key: "flow",
    href: "/flow/",
    label: "Flow",
    accent: "cobalt-2",
    repo: "https://github.com/kontourai/flow",
    homepage: {
      job: "Show why work advanced, blocked, or routed back, gate by gate, with the evidence behind each transition.",
      relation: "Keeps a process from becoming done until the required proof is present or an exception is explicit.",
    },
  },
  {
    key: "survey",
    href: "/survey/",
    label: "Survey",
    accent: "gold-2",
    repo: "https://github.com/kontourai/survey",
    homepage: {
      job: "Keep the source, extracted value, alternatives, reviewer decision, and provenance together.",
      relation: "Turns reviewed producer facts into inspectable claims with the story still attached.",
    },
  },
  {
    key: "console",
    href: "/console/",
    label: "Console",
    accent: "cobalt",
    repo: "https://github.com/kontourai/console",
    homepage: {
      job: "See what is live, stale, blocked, waiting on you, and backed by proof across the suite.",
      relation: "Turns scattered evidence and process state into one operating view with clear next actions.",
    },
  },
];

// Homepage layering: foundational primitives first (Surface, Survey, Flow),
// then products usable today (Veritas, Flow Agents), then Console last (the
// operating plane over the suite).
const homepageProductOrder: ProductKey[] = ["surface", "survey", "flow", "veritas", "flow-agents", "console"];

const productsByKey = new Map(products.map((product) => [product.key, product]));

function orderedProducts(keys: ProductKey[]): Product[] {
  return keys.map((key) => {
    const product = productsByKey.get(key);
    if (!product) {
      throw new Error(`Unknown product key: ${key}`);
    }
    return product;
  });
}

export const homepageProducts = orderedProducts(homepageProductOrder);

