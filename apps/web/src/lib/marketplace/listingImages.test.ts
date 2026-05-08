import { describe, expect, it } from "vitest";

import {
  buildListingImageStoragePath,
  getListingCardImageUrl,
  getListingDetailImageUrls,
  LISTING_IMAGE_MAX_BYTES,
  sanitizeListingImageFileName,
  validateListingImageFiles
} from "./listingImages";

describe("listing image validation", () => {
  it("accepts jpeg png and webp", () => {
    expect(() =>
      validateListingImageFiles([
        { name: "a.jpg", type: "image/jpeg", size: 1024 },
        { name: "b.png", type: "image/png", size: 1024 },
        { name: "c.webp", type: "image/webp", size: 1024 }
      ])
    ).not.toThrow();
  });

  it("rejects unsupported file type", () => {
    expect(() =>
      validateListingImageFiles([{ name: "a.gif", type: "image/gif", size: 1024 }], {
        requireAtLeastOne: true
      })
    ).toThrow("Images must be JPEG, PNG, or WEBP.");
  });

  it("rejects over 5MB", () => {
    expect(() =>
      validateListingImageFiles([{ name: "a.jpg", type: "image/jpeg", size: LISTING_IMAGE_MAX_BYTES + 1 }], {
        requireAtLeastOne: true
      })
    ).toThrow("Each image must be 5MB or smaller.");
  });

  it("rejects more than 5 files", () => {
    expect(() =>
      validateListingImageFiles(
        new Array(6).fill(null).map((_, index) => ({
          name: `${index}.jpg`,
          type: "image/jpeg",
          size: 1024
        })),
        { requireAtLeastOne: true }
      )
    ).toThrow("You can upload up to 5 images per listing.");
  });
});

describe("listing image storage helpers", () => {
  it("includes user id and listing id", () => {
    expect(buildListingImageStoragePath("user-1", "listing-1", "photo.jpg")).toBe(
      "user-1/listing-1/photo.jpg"
    );
  });

  it("sanitizes file name", () => {
    expect(sanitizeListingImageFileName("Campus Photo!!.JPG")).toBe("campus-photo.jpg");
  });

  it("avoids path traversal", () => {
    expect(buildListingImageStoragePath("user-1", "listing-1", "../secret.png")).toBe(
      "user-1/listing-1/secret.png"
    );
  });
});

describe("listing image display", () => {
  const listing = {
    asset_type: "textbook" as const,
    image_url: null
  };

  it("first image becomes cover", () => {
    expect(
      getListingCardImageUrl(listing, [
        {
          listing_id: "listing-1",
          user_id: "user-1",
          storage_path: "user-1/listing-1/first.jpg",
          public_url: "https://example.com/first.jpg",
          display_order: 0
        },
        {
          listing_id: "listing-1",
          user_id: "user-1",
          storage_path: "user-1/listing-1/second.jpg",
          public_url: "https://example.com/second.jpg",
          display_order: 1
        }
      ])
    ).toBe("https://example.com/first.jpg");
  });

  it("old listings without images still render fallback", () => {
    expect(getListingCardImageUrl(listing, [])).toBe("/images/textbook.jpg");
    expect(getListingDetailImageUrls(listing, [])).toEqual(["/images/textbook.jpg"]);
  });
});
