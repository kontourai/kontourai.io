/**
 * Trust-receipt catalog.
 *
 * Loads the real, static trust.bundle artifacts committed under
 * src/data/receipts/ and pairs each with human-stated provenance. The rendered
 * views derive everything they show from the parsed bundle here — nothing about
 * a bundle's claims, evidence, or status is hand-authored in the page copy, so
 * the view always reflects the actual downloadable artifact.
 *
 * Statuses and gaps are not read out of the file. At build time every bundle
 * goes through `buildTrustReport` from @kontourai/surface — the same derivation
 * the advertised `surface report` command runs — and the pages render *its*
 * answers. That is the whole point of the page: a visitor who downloads the
 * bundle and runs the command must get the numbers they just read.
 *
 * The identical bytes are also served from public/receipts/<slug>.trust.bundle
 * for download; scripts/check-receipts.mjs enforces that the two copies match
 * and that each validates under @kontourai/surface's validateTrustBundle.
 */
import { buildTrustReport, validateTrustBundle } from "@kontourai/surface";

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

/** Map a derived trust status to the site's trust-badge variant. */
export function badgeVariant(status: string): string {
  switch (status) {
    case "verified":
      return "verified";
    case "disputed":
    case "rejected":
    case "revoked":
      return "disputed";
    case "stale":
    case "assumed":
    case "superseded":
      return "stale";
    case "proposed":
      return "proposed";
    default:
      return "unknown";
  }
}

/**
 * One-line, reader-facing gloss for each status the derivation can return.
 * Rendered next to the badge so a visitor never has to guess what a token
 * means. Kept in the derivation's own vocabulary — these are the words the
 * command prints.
 */
export const STATUS_GLOSS: Record<string, string> = {
  verified: "evidence supports it and a verification event confirmed it",
  proposed: "recorded, but nothing has confirmed it yet",
  assumed: "accepted without independent evidence — usually a disclosed waiver",
  stale: "was verified, but the evidence has aged out",
  disputed: "evidence contradicts it",
  superseded: "replaced by a later claim about the same thing",
  rejected: "checked and turned down",
  revoked: "withdrawn after the fact",
  unknown: "no status could be derived",
};

export interface StatusCount {
  status: string;
  count: number;
}

/** A claim as the validator hands it back, next to what the file stored. */
export interface DerivedClaim {
  id: string;
  subjectId: string;
  facet?: string;
  claimType: string;
  fieldOrBehavior: string;
  value: unknown;
  impactLevel?: string;
  /** Status the validator derived from evidence and events. What we render. */
  status: string;
  /** Status the producer wrote into the file. Ignored by the derivation. */
  storedStatus?: string;
  /** True when the two disagree — the file said one thing, the maths another. */
  storedStatusDiffers: boolean;
}

/** A transparency gap exactly as @kontourai/surface reports it. */
export interface DerivedGap {
  id: string;
  claimId: string;
  type: string;
  severity: string;
  message: string;
  blocking: boolean;
  policyId?: string;
}

export interface DerivedReport {
  claims: DerivedClaim[];
  statusCounts: StatusCount[];
  /** The validator's own typed transparency gaps — not a site heuristic. */
  gaps: DerivedGap[];
  /** Claims the validator lists under "High-impact unsupported", with prose. */
  highImpactUnsupported: DerivedClaim[];
  /** Distinct claim types in the bundle — what kinds of thing were checked. */
  claimTypes: string[];
  evidenceTotal: number;
  evidencePassing: number;
  evidenceFailing: number;
  /** Claims carrying neither an evidence record nor a verification event. */
  claimsWithNoSupportRecord: number;
  /** Claims whose stored status disagrees with the derived one. */
  storedStatusMismatches: number;
  statusFunctionVersion: string;
}

const reportCache = new Map<string, DerivedReport>();

/**
 * Run the published bundle through the same derivation the advertised
 * `npx @kontourai/surface report` command runs, and return what it says.
 *
 * Everything the pages badge, count, or list about a receipt comes from here,
 * so the rendered page and the command a visitor runs cannot disagree. The
 * stored `status` string is carried along only so the pages can *show* where
 * the file and the derivation differ — it never decides what is displayed.
 */
export function deriveReport(receipt: Receipt): DerivedReport {
  const cached = reportCache.get(receipt.slug);
  if (cached) return cached;

  // Clone first: the imported JSON module object is shared, and validation
  // normalises in place for older schema versions.
  const validated = validateTrustBundle(structuredClone(receipt.bundle));
  const report = buildTrustReport(validated);

  const storedById = new Map(receipt.bundle.claims.map((claim) => [claim.id, claim.status]));
  const claims: DerivedClaim[] = report.claims.map((claim) => {
    const storedStatus = storedById.get(claim.id);
    return {
      id: claim.id,
      subjectId: claim.subjectId,
      facet: claim.facet,
      claimType: claim.claimType,
      fieldOrBehavior: claim.fieldOrBehavior,
      value: claim.value,
      impactLevel: (claim as { impactLevel?: string }).impactLevel,
      status: claim.status,
      storedStatus,
      storedStatusDiffers: Boolean(storedStatus) && storedStatus !== claim.status,
    };
  });

  const counts = new Map<string, number>();
  for (const claim of claims) counts.set(claim.status, (counts.get(claim.status) ?? 0) + 1);

  const evidence = receipt.bundle.evidence;
  const supported = new Set<string>([
    ...evidence.map((item) => item.claimId),
    ...receipt.bundle.events.map((event) => event.claimId),
  ]);

  const derived: DerivedReport = {
    claims,
    statusCounts: [...counts.entries()]
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count),
    gaps: report.transparencyGaps.map((gap) => ({
      id: gap.id,
      claimId: gap.claimId,
      type: gap.type,
      severity: gap.severity,
      message: gap.message,
      blocking: gap.blocking === true,
      policyId: gap.policyId,
    })),
    highImpactUnsupported: report.summary.highImpactUnsupported.flatMap((claimId) => {
      const claim = claims.find((item) => item.id === claimId);
      return claim ? [claim] : [];
    }),
    claimTypes: [...new Set(claims.map((claim) => claim.claimType))],
    evidenceTotal: evidence.length,
    evidencePassing: evidence.filter((item) => item.passing === true).length,
    evidenceFailing: evidence.filter((item) => item.passing === false).length,
    claimsWithNoSupportRecord: receipt.bundle.claims.filter((claim) => !supported.has(claim.id))
      .length,
    storedStatusMismatches: claims.filter((claim) => claim.storedStatusDiffers).length,
    statusFunctionVersion: report.statusFunctionVersion,
  };

  reportCache.set(receipt.slug, derived);
  return derived;
}

/** Plain-language gloss for the validator's transparency-gap types. */
export const GAP_TYPE_GLOSS: Record<string, string> = {
  contradiction: "two records about the same thing disagree",
  provenance_gap: "the trail back to where this came from is incomplete",
  policy_violation: "the written policy for this claim was not satisfied",
  freshness_breach: "the supporting evidence is older than the policy allows",
  corroboration_absent: "the policy wanted a second, independent source and there isn't one",
  unsupported_inference: "a conclusion was drawn that the inputs don't carry",
};

/** Compact, readable rendering of a claim's value field for the table. */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}
