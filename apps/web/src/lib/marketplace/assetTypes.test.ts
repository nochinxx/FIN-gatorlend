import { describe, expect, it } from "vitest";

import {
  formatMarketplaceAssetTypeLabel,
  normalizeMarketplaceAssetType,
  validateMarketplaceAssetType
} from "./assetTypes";

describe("marketplace asset type helpers", () => {
  it("normalizes spacing, case, and separators", () => {
    expect(normalizeMarketplaceAssetType("  Lab_Coat  ")).toBe("lab coat");
  });

  it("formats a readable label", () => {
    expect(formatMarketplaceAssetTypeLabel("chem tutoring")).toBe("Chem Tutoring");
  });

  it("rejects empty asset types", () => {
    expect(() => validateMarketplaceAssetType("   ")).toThrow("Asset type is required.");
  });
});
