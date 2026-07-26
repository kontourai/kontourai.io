/**
 * Screenshot provenance for captions.
 *
 * Captions used to interpolate the *live* product version into a claim about a
 * *frozen* PNG — a page said "v0.2.5 snapshot" while the manifest recorded the
 * capture as v0.2.4. It was true by accident and re-stamped itself every
 * release, with no capture having happened: string interpolation routing
 * around the marketing-assets guard.
 *
 * A caption's version must come from the same manifest `check:marketing-assets`
 * verifies the bytes against, so a stale capture reads as stale instead of
 * silently inheriting today's version number.
 */
import marketingAssets from "@/data/marketing-assets.json";

export type MarketingAsset = {
  asset: string;
  sha256: string;
  capturedAgainstVersion: string;
  capturedAt: string;
};

/**
 * Look up a committed visual's capture provenance. Throws at build time if the
 * asset isn't in the manifest — an unmanifested screenshot has no verifiable
 * provenance, so it must not render a provenance claim.
 */
export function assetCapture(asset: string): MarketingAsset {
  const entry = (marketingAssets.assets as MarketingAsset[]).find(
    (candidate) => candidate.asset === asset,
  );
  if (!entry) {
    throw new Error(`marketing asset not in src/data/marketing-assets.json: ${asset}`);
  }
  return entry;
}
