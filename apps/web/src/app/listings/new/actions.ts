"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createListing } from "@/lib/marketplace/server";

function parseOptionalNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error("Price amount must be a valid number.");
  }

  return parsed;
}

function parseOptionalText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

function parseMetadata(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return {};
  }

  try {
    return JSON.parse(value);
  } catch {
    throw new Error("Metadata must be valid JSON.");
  }
}

export type CreateListingFormState = {
  error: string | null;
};

export async function createListingAction(
  _previousState: CreateListingFormState,
  formData: FormData
): Promise<CreateListingFormState> {
  let listingId: string | undefined;

  try {
    const listing = await createListing({
      asset_type: String(formData.get("asset_type") ?? ""),
      listing_type: String(formData.get("listing_type") ?? ""),
      title: String(formData.get("title") ?? ""),
      description: parseOptionalText(formData.get("description")),
      condition: parseOptionalText(formData.get("condition")),
      image_url: parseOptionalText(formData.get("image_url")),
      price_amount: parseOptionalNumber(formData.get("price_amount")),
      price_type: parseOptionalText(formData.get("price_type")),
      payment_methods: String(formData.get("payment_methods") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      owner_wallet: null,
      xrpl_token_id: null,
      metadata: parseMetadata(formData.get("metadata"))
    });
    listingId = listing.id;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create listing."
    };
  }

  if (!listingId) {
    return {
      error: "Listing was created without a usable id."
    };
  }

  revalidatePath("/marketplace");
  revalidatePath("/my-listings");
  redirect(`/listings/${listingId}`);
}
