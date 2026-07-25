import registry from '@/data/public-evidence-registry.json';

export type PublicEvidenceSource = {
  id: string;
  subject: string;
  scope?: 'comparison-only';
  sourcePath: string;
  url: string;
};

export type PublicEvidenceClaim = {
  id: string;
  pagePath: string;
  sourceIds: string[];
};

const sources = new Map<string, PublicEvidenceSource>(
  registry.sources.map((source) => [source.id, source]),
);
const claims = new Map<string, PublicEvidenceClaim>(
  registry.claims.map((claim) => [claim.id, claim]),
);

/** Resolve the canonical sources bound to one public claim. */
export function getPublicEvidenceClaimSources(claimId: string): PublicEvidenceSource[] {
  const claim = claims.get(claimId);
  if (!claim) {
    throw new Error(`Unknown public evidence claim: ${claimId}`);
  }
  return claim.sourceIds.map((sourceId) => {
    const source = sources.get(sourceId);
    if (!source) {
      throw new Error(`Public evidence claim ${claimId} references unknown source ${sourceId}`);
    }
    return source;
  });
}

/** Resolve one source only when the registry explicitly binds it to the claim. */
export function getPublicEvidenceClaimSourceUrl(claimId: string, sourceId: string): string {
  const source = getPublicEvidenceClaimSources(claimId).find((candidate) => candidate.id === sourceId);
  if (!source) {
    throw new Error(`Public evidence claim ${claimId} is not supported by source ${sourceId}`);
  }
  return source.url;
}
