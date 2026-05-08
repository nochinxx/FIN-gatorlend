"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { deleteListing } from "@/lib/marketplace/server";

export async function deleteListingAction(formData: FormData) {
  const listingId = String(formData.get("listing_id") ?? "");

  if (!listingId) {
    redirect("/my-listings?error=Missing+listing+id");
  }

  try {
    await deleteListing(listingId);
  } catch (error) {
    redirect(`/my-listings?error=${encodeURIComponent(error instanceof Error ? error.message : "Failed to delete listing.")}`);
  }

  revalidatePath("/marketplace");
  revalidatePath("/my-listings");
  revalidatePath("/requests");
  redirect("/my-listings?notice=listing-deleted");
}
