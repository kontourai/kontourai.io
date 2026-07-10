/**
 * Trust-receipt catalog.
 *
 * Loads the real, static trust.bundle artifacts committed under
 * src/data/receipts/ and pairs each with human-stated provenance. The rendered
 * views derive everything they show from the parsed bundle here — nothing about
 * a bundle's claims, evidence, or status is hand-authored in the page copy, so
 * the view always reflects the actual downloadable artifact.
 *
 * The identical bytes are also served from public/receipts/<slug>.trust.bundle
 * for download; scripts/check-receipts.mjs enforces that the two copies match
 * and that each validates under @kontourai/surface's validateTrustBundle.
 */
import type { Accent } from "@/lib/theme";

import flowAgentsDelivery from "@/data/receipts/flow-agents-delivery.trust.bundle.json";
import governanceReady from "@/data/receipts/governance-readiness-ready.trust.bundle.json";
import governanceNotReady from "@/data/receipts/governance-readiness-not-ready.trust.bundle.json";
import flowAgentsOwnershipGuard from "@/data/receipts/flow-agents-ownership-guard.trust.bundle.json";

export interface Claim {
  id: string;
  subjectType: string;
  subjectId: string;
  facet: string;
  claimType: string;
  fieldOrBehavior: string;
  value: unknown;
  status: string;
  impactLevel?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Evidence {
  id: string;
  claimId: string;
  evidenceType: string;
  method: string;
  sourceRef: string;
  excerptOrSummary?: string;
  observedAt?: string;
  collectedBy?: string;
  passing?: boolean;
}

export interface ClaimEvent {
  id: string;
  claimId: string;
  status: string;
  actor?: string;
  method?: string;
  createdAt?: string;
  verifiedAt?: string;
}

export interface Policy {
  id: string;
  claimType: string;
  impactLevel?: string;
  requiredEvidence?: string[];
  acceptanceCriteria?: string[];
}

export interface TrustBundle {
  schemaVersion: number;
  source: string;
  claims: Claim[];
  evidence: Evidence[];
  events: ClaimEvent[];
  policies: Policy[];
}

export interface Provenance {
  /** Public repo slug that produced the artifact, e.g. kontourai/flow-agents. */
  repo: string;
  /** Immutable commit SHA the artifact (or its inputs) is pinned to. */
  commit: string;
  /** Path to the source artifact or input inside that repo. */
  path: string;
  /** Plain-language sentence describing the run that produced the bundle. */
  note: string;
}

export interface Receipt {
  slug: string;
  title: string;
  /** Short label for the originating Kontour pipeline (our own work). */
  pipeline: string;
  accent: Accent;
  /** One-line, public-safe summary of what this receipt records. */
  summary: string;
  provenance: Provenance;
  bundle: TrustBundle;
}

/** Immutable provenance is stated per-bundle; the bundle bytes carry the rest. */
export const receipts: Receipt[] = [
  {
    slug: "flow-agents-delivery",
    title: "Flow Agents delivery bundle",
    pipeline: "Kontour Flow Agents — delivery workflow",
    accent: "cobalt-2",
    summary:
      "The trust.bundle a Flow Agents delivery run emits as its own receipt: every workflow check (build, source-tree validation, verification) recorded as a claim with its evidence and status.",
    provenance: {
      repo: "kontourai/flow-agents",
      commit: "fe41e3cfbf465a2e186af39d235c7b746b3aee05",
      path: "delivery/trust.bundle",
      note:
        "Committed by the Flow Agents delivery pipeline and tracked in-repo since PR #269; this copy is taken verbatim from origin/main at the pinned commit.",
    },
    bundle: flowAgentsDelivery as unknown as TrustBundle,
  },
  {
    slug: "governance-readiness-ready",
    title: "Governance Kit readiness — ready verdict",
    pipeline: "Kontour Veritas Governance Kit — readiness adapter",
    accent: "green",
    summary:
      "A Veritas Governance Kit readiness evaluation with no blocking failures, projected into a Hachure trust.bundle whose software-readiness-verdict claim derives to verified.",
    provenance: {
      repo: "kontourai/flow-agents",
      commit: "7a083966db47672ea552f13264ea3111e08fa06b",
      path: "kits/veritas-governance/fixtures/readiness/ready.readiness-report.json",
      note:
        "Produced by running the kit's readiness-to-trust-bundle.mjs adapter (commit 1948639) over the committed readiness record above; the projection is deterministic and re-runnable.",
    },
    bundle: governanceReady as unknown as TrustBundle,
  },
  {
    slug: "governance-readiness-not-ready",
    title: "Governance Kit readiness — blocked verdict",
    pipeline: "Kontour Veritas Governance Kit — readiness adapter",
    accent: "red",
    summary:
      "A readiness evaluation that a required standard blocks: the projected software-readiness-verdict claim derives to disputed, showing what a gate looks like when it refuses to pass.",
    provenance: {
      repo: "kontourai/flow-agents",
      commit: "7a083966db47672ea552f13264ea3111e08fa06b",
      path: "kits/veritas-governance/fixtures/readiness/not-ready.readiness-report.json",
      note:
        "Produced by running the kit's readiness-to-trust-bundle.mjs adapter (commit 1948639) over the committed not-ready readiness record above; the projection is deterministic and re-runnable.",
    },
    bundle: governanceNotReady as unknown as TrustBundle,
  },
  {
    slug: "flow-agents-ownership-guard",
    title: "Flow Agents ownership-guard bundle",
    pipeline: "Kontour Flow Agents — ensure-session ownership guard",
    accent: "chalk-2",
    summary:
      "A Flow Agents workflow run's own receipt for its ensure-session ownership guard: two agents claiming the same work item are kept from colliding, recorded as claims with their evidence — including one pre-existing, unrelated test-suite gap the run discloses and waives rather than hides.",
    provenance: {
      repo: "kontourai/flow-agents",
      commit: "20eed88f025980eab845ff588ed4cd188f6b0d2a",
      path: "delivery/trust.bundle",
      note:
        "Merged to main via kontourai/flow-agents#377 ('#291: ensure-session ownership guard + per-actor current.json'); taken verbatim from delivery/trust.bundle at the merge commit.",
    },
    bundle: flowAgentsOwnershipGuard as unknown as TrustBundle,
  },
];

export function getReceipt(slug: string): Receipt | undefined {
  return receipts.find((receipt) => receipt.slug === slug);
}

/** Map a claim/status token to the site's trust-badge variant. */
export function badgeVariant(status: string): string {
  switch (status) {
    case "verified":
      return "verified";
    case "disputed":
    case "rejected":
      return "disputed";
    case "stale":
      return "stale";
    case "assumed":
      return "stale";
    case "proposed":
      return "proposed";
    default:
      return "unknown";
  }
}

export interface StatusCount {
  status: string;
  count: number;
}

export function statusCounts(bundle: TrustBundle): StatusCount[] {
  const counts = new Map<string, number>();
  for (const claim of bundle.claims) {
    counts.set(claim.status, (counts.get(claim.status) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

export interface Gap {
  kind: string;
  claimId: string;
  detail: string;
}

/**
 * Derive the open questions a skeptical reader cares about, straight from the
 * bundle: claims that carry weight but are not verified, claims other evidence
 * disputes, and high-impact claims with no supporting evidence (transparency
 * gaps). All computed from the artifact — never asserted by page copy.
 */
export function deriveGaps(bundle: TrustBundle): Gap[] {
  const evidenceByClaim = new Set(bundle.evidence.map((item) => item.claimId));
  const gaps: Gap[] = [];
  for (const claim of bundle.claims) {
    const heavy = claim.impactLevel === "high" || claim.impactLevel === "critical";
    if (claim.status === "disputed" || claim.status === "rejected") {
      gaps.push({
        kind: "disputed",
        claimId: claim.id,
        detail: `${claim.fieldOrBehavior} — evidence disputes this claim.`,
      });
    } else if (heavy && claim.status !== "verified") {
      gaps.push({
        kind: "unsupported",
        claimId: claim.id,
        detail: `${claim.fieldOrBehavior} — high-impact but status is "${claim.status}".`,
      });
    }
    if (!evidenceByClaim.has(claim.id)) {
      gaps.push({
        kind: "transparency",
        claimId: claim.id,
        detail: `${claim.fieldOrBehavior} — no evidence record links to this claim.`,
      });
    }
  }
  return gaps;
}

/** Compact, readable rendering of a claim's value field for the table. */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}
