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

// Packages the site cites as evidence but does not market: no page, no nav, no
// icon. They still need tracked status, because page copy quotes their version
// when it prints their output — an untracked citation is one nobody can catch
// going stale.
export type ReferenceKey = "traverse";

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

export type Reference = {
  key: ReferenceKey;
  label: string;
  repo: string;
  packageName: string;
};

export const referencedPackages: Reference[] = [
  {
    key: "traverse",
    label: "Traverse",
    repo: "https://github.com/kontourai/traverse",
    packageName: "@kontourai/traverse",
  },
];

export const applications: Application[] = [
  {
    key: "fieldwork",
    href: "/fieldwork/",
    label: "Fieldwork",
    accent: "gold-2",
    repo: "https://github.com/kontourai/fieldwork",
    packageName: "@kontourai/fieldwork",
    job: "Turn messy source text into reviewed, source-linked data you can recheck and export.",
    composition: "The finished app: install it and start reviewing. Survey is the review machinery inside it, if you would rather build your own screen around it.",
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
      job: "Keep AI coding work on a reviewable path across Claude Code, Codex, Kiro, opencode, and pi.",
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

function requireProduct(key: ProductKey): Product {
  const product = productsByKey.get(key);
  if (!product) {
    throw new Error(`Unknown product key: ${key}`);
  }
  return product;
}

// Navigation grouping ------------------------------------------------------
//
// The top bar splits on what the reader is doing, not on how we built the
// suite. `Products` holds the three things somebody arrives wanting to use —
// the engine, the finished app, and the screen you watch it on — and the two
// kits sit under the engine, labeled with the engine they run on so the
// relationship survives the regrouping. Everything else is a part of the
// machine and lives under `Developers`.
export const engine = requireProduct("flow-agents");
export const operatingView = requireProduct("console");
export const disciplines: Product[] = products.filter(
  (product) => product.key !== engine.key && product.key !== operatingView.key,
);

// The lab -------------------------------------------------------------------
//
// Small packages we built for ourselves and published anyway. Every entry
// names the npm package it is advertising, and `scripts/validate.mjs` refuses
// to ship an entry whose package is not on the registry: this list previously
// carried Ephemeris and a Research Kit, neither of which was ever published, so
// the only "GitHub →" a reader could follow led somewhere they could not
// install from.
export type LabPackage = {
  slug: string;
  label: string;
  repo: string;
  packageName: string;
  description: string;
};

export const labPackages: LabPackage[] = [
  {
    slug: "cli",
    label: "Kontour CLI",
    repo: "https://github.com/kontourai/cli",
    packageName: "@kontourai/cli",
    description:
      "The kontour command. It works out which Kontour packages you already have installed and hands your command to the right one. It never reaches for the registry, downloads a missing package, or changes a version behind you — so the same command does the same thing offline.",
  },
  {
    slug: "datum",
    label: "Datum",
    repo: "https://github.com/kontourai/datum",
    packageName: "@kontourai/datum",
    description:
      "Your model registry. Define providers, models, and roles once, then resolve which backend, which model, whose key, what URL. It doesn't call models for you — apart from four opt-in commands that exist to test a connection.",
  },
  {
    slug: "bearing",
    label: "Bearing",
    repo: "https://github.com/kontourai/bearing",
    packageName: "@kontourai/bearing",
    description:
      "Which model is actually good at what, and where that judgement came from. Compiles observations into catalog snapshots you can diff, and ranks models for a given runtime — without calling any of them.",
  },
  {
    slug: "relay",
    label: "Relay",
    repo: "https://github.com/kontourai/relay",
    packageName: "@kontourai/relay",
    description:
      "One way to call a model whether it sits behind a vendor SDK, a local engine, a hosted service, or a command-line harness, so changing providers doesn't mean rewriting the call. Each adapter has to declare what it can't do — streaming, tool calls, token counts — rather than quietly approximating it.",
  },
  {
    slug: "dispatch",
    label: "Dispatch",
    repo: "https://github.com/kontourai/dispatch",
    packageName: "@kontourai/dispatch",
    description:
      "Chooses which model handles a job from rules you write — required capabilities, a token and cost budget, retries, fallbacks — and hands back a record of which one ran, why it was picked, and what it actually spent. Budgets can be held across concurrent calls and across restarts.",
  },
  {
    slug: "conduit",
    label: "Conduit",
    repo: "https://github.com/kontourai/conduit",
    packageName: "@kontourai/conduit",
    description:
      "Installs an agent's skills, hooks, commands, and context files into whichever coding tool someone is running, through one adapter instead of one per host. It probes each host for what it genuinely supports, and the install receipt lists every file written with its checksum — no file contents, no credentials.",
  },
  {
    slug: "traverse",
    label: "Traverse",
    repo: "https://github.com/kontourai/traverse",
    packageName: "@kontourai/traverse",
    description:
      "Pulls structured fields out of documents against a schema you supply, and hands back proposals for a person to review — each one still carrying the passage it came from.",
  },
  {
    slug: "forage",
    label: "Forage",
    repo: "https://github.com/kontourai/forage",
    packageName: "@kontourai/forage",
    description:
      "Fetches untrusted URLs safely and keeps a snapshot of what came back, so a crawl can be replayed instead of re-guessed. Refuses requests aimed at your internal network.",
  },
  {
    slug: "lookout",
    label: "Lookout",
    repo: "https://github.com/kontourai/lookout",
    packageName: "@kontourai/lookout",
    description:
      "Watches sources you re-check over time and tells you what changed since the last look. Built on Forage's snapshots; it doesn't extract fields itself.",
  },
  {
    slug: "plumb",
    label: "Plumb",
    repo: "https://github.com/kontourai/plumb",
    packageName: "@kontourai/plumb",
    description:
      "Runs your deployment's own health check on a schedule, and when it fails, hands the failure to an AI agent working in a separate clean clone that opens a pull request or an issue. The live checkout and production data stay outside anything that agent can reach.",
  },
  {
    slug: "ui",
    label: "Kontour UI",
    repo: "https://github.com/kontourai/ui",
    packageName: "@kontourai/ui",
    description:
      "The interface pieces our own screens are built from: buttons, panels, badges, dialogs, form controls, and the CSS variables behind them, for React or plain custom elements. Useful if you are building an operator screen that should match ours; skip it if you already have a design system you like.",
  },
];

function orderedProducts(keys: ProductKey[]): Product[] {
  return keys.map(requireProduct);
}

export const homepageProducts = orderedProducts(homepageProductOrder);

