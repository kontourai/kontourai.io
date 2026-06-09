import statusData from "@/data/product-status.json";

export type ProductStatusKey = keyof typeof statusData.products;

export type ProductStatus = {
  key: ProductStatusKey;
  label: string;
  packageName: string | null;
  version: string | null;
  phase: string;
  sourceUrl: string | null;
  publicNotes: string;
};

export const productStatusCheckedAt = statusData.checkedAt;

export const productStatus = statusData.products as Record<ProductStatusKey, ProductStatus>;

export function getProductStatus(key: ProductStatusKey): ProductStatus {
  return productStatus[key];
}

export function productBadge(status: ProductStatus): string {
  return status.version ? `v${status.version}` : status.phase;
}

export function currentPackageLine(status: ProductStatus): string {
  if (!status.packageName || !status.version) {
    return status.publicNotes;
  }

  const line = `Current package: ${status.packageName} v${status.version}.`;
  return status.publicNotes ? `${line} ${status.publicNotes}` : line;
}
