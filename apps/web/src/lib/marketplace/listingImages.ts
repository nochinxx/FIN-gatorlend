import { listingImageSchema, type Listing, type ListingImage } from "@gatorlend/core";

import { normalizeMarketplaceAssetType } from "./assetTypes";

export const LISTING_IMAGE_BUCKET = "listing-images";
export const LISTING_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const LISTING_IMAGE_MAX_COUNT = 5;
export const LISTING_IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
] as const;

type UploadableListingImage = {
  name: string;
  type: string;
  size: number;
};

const SAFE_LOCAL_IMAGE_PATH = /^\/(?:images|branding)\/.+\.(?:png|jpe?g|webp)$/i;

const DEMO_THUMBNAILS: Record<string, string> = {
  textbook: "/images/textbook.jpg",
  calculator: "/images/calculator.jpeg",
  lab_coat: "/images/lab-coat.jpeg"
};

export function isAllowedListingImageType(type: string): boolean {
  return LISTING_IMAGE_ALLOWED_TYPES.includes(type as (typeof LISTING_IMAGE_ALLOWED_TYPES)[number]);
}

export function validateListingImageFile(file: UploadableListingImage) {
  if (!isAllowedListingImageType(file.type)) {
    throw new Error("Images must be JPEG, PNG, or WEBP.");
  }

  if (file.size > LISTING_IMAGE_MAX_BYTES) {
    throw new Error("Each image must be 5MB or smaller.");
  }
}

export function validateListingImageFiles(
  files: UploadableListingImage[],
  options?: {
    requireAtLeastOne?: boolean;
    existingCount?: number;
  }
) {
  const requireAtLeastOne = options?.requireAtLeastOne ?? false;
  const existingCount = options?.existingCount ?? 0;

  if (requireAtLeastOne && files.length === 0) {
    throw new Error("Add at least one image before publishing your listing.");
  }

  if (files.length > LISTING_IMAGE_MAX_COUNT || existingCount + files.length > LISTING_IMAGE_MAX_COUNT) {
    throw new Error(`You can upload up to ${LISTING_IMAGE_MAX_COUNT} images per listing.`);
  }

  for (const file of files) {
    validateListingImageFile(file);
  }
}

export function sanitizeListingImageFileName(fileName: string): string {
  const baseName = fileName.split(/[\\/]/).pop() ?? "image";
  const match = /^(.+?)(\.[a-zA-Z0-9]+)?$/.exec(baseName);
  const rawStem = match?.[1] ?? "image";
  const rawExtension = (match?.[2] ?? "").toLowerCase();
  const safeStem = rawStem
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const safeExtension = [".jpg", ".jpeg", ".png", ".webp"].includes(rawExtension) ? rawExtension : "";
  const stem = safeStem || "image";

  return `${stem}${safeExtension}`;
}

export function buildListingImageStoragePath(userId: string, listingId: string, fileName: string): string {
  const safeFileName = sanitizeListingImageFileName(fileName);
  return `${userId}/${listingId}/${safeFileName}`;
}

export function parseListingImage(row: unknown): ListingImage {
  return listingImageSchema.parse(row);
}

export function sortListingImages(images: ListingImage[]): ListingImage[] {
  return [...images].sort((left, right) => {
    if (left.display_order !== right.display_order) {
      return left.display_order - right.display_order;
    }

    return (left.created_at ?? "").localeCompare(right.created_at ?? "");
  });
}

export function resolveStoredListingImageUrl(images: ListingImage[] | null | undefined): string | null {
  const [firstImage] = sortListingImages(images ?? []);
  return firstImage?.public_url ?? null;
}

export function resolveLegacyListingImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  if (SAFE_LOCAL_IMAGE_PATH.test(imageUrl)) {
    return imageUrl;
  }

  return null;
}

export function getListingCardImageUrl(
  listing: Pick<Listing, "asset_type" | "image_url">,
  images?: ListingImage[] | null
): string | null {
  const normalizedAssetType = normalizeMarketplaceAssetType(listing.asset_type);

  return (
    resolveStoredListingImageUrl(images) ??
    resolveLegacyListingImageUrl(listing.image_url) ??
    DEMO_THUMBNAILS[normalizedAssetType] ??
    null
  );
}

export function getListingDetailImageUrls(
  listing: Pick<Listing, "asset_type" | "image_url">,
  images?: ListingImage[] | null
): string[] {
  const storedImages = sortListingImages(images ?? [])
    .map((image) => image.public_url)
    .filter((value): value is string => Boolean(value));

  if (storedImages.length > 0) {
    return storedImages;
  }

  const fallback =
    resolveLegacyListingImageUrl(listing.image_url) ??
    DEMO_THUMBNAILS[normalizeMarketplaceAssetType(listing.asset_type)] ??
    null;
  return fallback ? [fallback] : [];
}
