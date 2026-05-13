export const DEFAULT_MARKETPLACE_ASSET_TYPE_SUGGESTIONS = [
  "textbook",
  "lab coat"
] as const;

export function normalizeMarketplaceAssetType(input: string | null | undefined): string {
  const normalized = (input ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9 '&/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized;
}

export function validateMarketplaceAssetType(input: string | null | undefined): string {
  const normalized = normalizeMarketplaceAssetType(input);

  if (!normalized) {
    throw new Error("Asset type is required.");
  }

  if (normalized.length < 2) {
    throw new Error("Asset type must be at least 2 characters.");
  }

  if (normalized.length > 40) {
    throw new Error("Asset type must be 40 characters or fewer.");
  }

  return normalized;
}

export function formatMarketplaceAssetTypeLabel(input: string | null | undefined): string {
  const normalized = normalizeMarketplaceAssetType(input);

  if (!normalized) {
    return "Other";
  }

  return normalized.replace(/\b\w/g, (character) => character.toUpperCase());
}
