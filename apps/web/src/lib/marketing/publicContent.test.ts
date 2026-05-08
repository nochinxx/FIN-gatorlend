import { describe, expect, it } from "vitest";

import {
  CURRENT_MVP_LINE,
  FOOTER_DISCLAIMER,
  LANDING_FEATURED_ITEMS,
  LANDING_HERO_BODY,
  PILOT_DISCLAIMER,
  PUBLIC_MARKETING_TEXT
} from "./publicContent";
import {
  PUBLIC_ASSET_TYPE_OPTIONS,
  PUBLIC_LISTING_TYPE_OPTIONS
} from "../marketplace/publicOptions";

describe("public marketing copy", () => {
  it("renders the independent pilot disclaimer", () => {
    expect(PILOT_DISCLAIMER).toContain("independent student-built pilot");
    expect(FOOTER_DISCLAIMER).toContain("Not affiliated with");
  });

  it("does not use risky affiliation or expansion phrasing in marketing copy", () => {
    expect(PUBLIC_MARKETING_TEXT).not.toContain("SFSU marketplace");
    expect(PUBLIC_MARKETING_TEXT).not.toContain("CSU system");
  });

  it("does not mention risky categories in public landing marketing copy", () => {
    expect(PUBLIC_MARKETING_TEXT).not.toContain("food voucher");
    expect(PUBLIC_MARKETING_TEXT).not.toContain("meal swipe");
    expect(PUBLIC_MARKETING_TEXT).not.toContain("service");
    expect(PUBLIC_MARKETING_TEXT).not.toContain("voucher");
  });

  it("keeps payment language out of the primary public marketing copy", () => {
    expect(LANDING_HERO_BODY.toLowerCase()).not.toContain("payment");
    expect(PUBLIC_MARKETING_TEXT.toLowerCase()).not.toContain("coordinate payment");
    expect(PUBLIC_MARKETING_TEXT.toLowerCase()).not.toContain("complete payment");
  });

  it("does not show real-looking prices in featured items", () => {
    for (const item of LANDING_FEATURED_ITEMS) {
      expect(item.label).not.toMatch(/\$/);
      expect(item.recordLabel).toBe("Mock Asset ID");
    }
  });

  it("keeps the current MVP line on internal ownership tracking", () => {
    expect(CURRENT_MVP_LINE).toContain("internal ownership tracking");
  });
});

describe("public marketplace options", () => {
  it("does not expose food_voucher or service asset types by default", () => {
    expect(PUBLIC_ASSET_TYPE_OPTIONS).not.toContain("food_voucher");
    expect(PUBLIC_ASSET_TYPE_OPTIONS).not.toContain("service");
  });

  it("does not expose voucher listing type by default", () => {
    expect(PUBLIC_LISTING_TYPE_OPTIONS).not.toContain("voucher");
  });

  it("does expose service listings", () => {
    expect(PUBLIC_LISTING_TYPE_OPTIONS).toContain("service_offer");
  });
});
