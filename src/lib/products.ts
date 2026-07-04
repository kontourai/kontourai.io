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
  developerComposition?: {
    owns: string;
    composes: string;
  };
};

export const products: Product[] = [
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
    developerComposition: {
      owns: "repo standards, readiness checks, evidence findings, exceptions, and code-change governance",
      composes: "projects code-change readiness into evidence other products can inspect",
    },
  },
  {
    key: "flow-agents",
    href: "/flow-agents/",
    label: "Flow Agents",
    accent: "chalk-2",
    repo: "https://github.com/kontourai/flow-agents",
    homepage: {
      job: "Flow and Veritas discipline inside Claude Code, Codex, Kiro, and GitHub Actions — without becoming a runtime.",
      relation: "Carries Flow and Veritas discipline into the agent tools you already run, without becoming a runtime.",
    },
    developerComposition: {
      owns: "agent workflows, skills, kits, local sidecars, verification loops, and handoff discipline",
      composes: "coordinates Builder Kit work and can consume Flow, Veritas, and Surface signals",
    },
  },
  {
    key: "surface",
    href: "/surface/",
    label: "Surface",
    accent: "gold",
    repo: "https://github.com/kontourai/surface",
    homepage: {
      job: "One shape for claims, evidence, freshness, policies, and gaps — readable by a person, an agent, or another system.",
      relation: "The foundation: every other product reads and writes its trust state as one Surface shape.",
    },
    developerComposition: {
      owns: "portable claims, evidence, policies, status, Trust Reports, and trust vocabulary",
      composes: "makes product facts inspectable for Console, Flow gates, Veritas reports, and downstream operators",
    },
  },
  {
    key: "flow",
    href: "/flow/",
    label: "Flow",
    accent: "cobalt-2",
    repo: "https://github.com/kontourai/flow",
    homepage: {
      job: "Shows why a process was allowed to advance — gate by gate, with the evidence behind each transition.",
      relation: "Reads that evidence to gate work, advancing a process only when the proof for each step is there.",
    },
    developerComposition: {
      owns: "process paths, transitions, gates, route-backs, exceptions, and next-action semantics",
      composes: "uses Surface or Veritas evidence as gate input without owning claim truth or repo policy",
    },
  },
  {
    key: "survey",
    href: "/survey/",
    label: "Survey",
    accent: "gold-2",
    repo: "https://github.com/kontourai/survey",
    homepage: {
      job: "Turns sources, extractions, candidates, and reviews into Surface-ready claims with provenance attached.",
      relation: "Feeds Surface — turning raw sources, extractions, and reviews into claims with provenance attached.",
    },
  },
  {
    key: "console",
    href: "/console/",
    label: "Console",
    accent: "cobalt",
    repo: "https://github.com/kontourai/console",
    homepage: {
      job: "Claim status, process state, proof, queues, decisions, and next actions across all products in one operating plane.",
      relation: "Sits over all of it — one operating plane for status, proof, queues, and decisions across the suite.",
    },
  },
];

// Homepage layering: foundational primitives first (Surface, Survey, Flow),
// then products usable today (Veritas, Flow Agents), then Console last (the
// operating plane over the suite).
const homepageProductOrder: ProductKey[] = ["surface", "survey", "flow", "veritas", "flow-agents", "console"];
const developerCompositionOrder: ProductKey[] = ["surface", "flow", "veritas", "flow-agents"];

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

// Composition contracts cover implementation layers with product-owned contracts.
// Survey feeds Surface and Console observes product-owned projections elsewhere
// on the page, so they are intentionally omitted from this specific card list.
export const developerCompositionProducts = orderedProducts(developerCompositionOrder).map((product) => {
  if (!product.developerComposition) {
    throw new Error(`Missing developer composition copy for ${product.key}`);
  }
  return {
    ...product,
    developerComposition: product.developerComposition,
  };
});
