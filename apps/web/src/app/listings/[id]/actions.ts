"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  acceptRequest,
  completeTransfer,
  declineRequest,
  requestListing
} from "@/lib/marketplace/server";

function getListingId(formData: FormData) {
  const listingId = String(formData.get("listing_id") ?? "");

  if (!listingId) {
    throw new Error("Listing id is required.");
  }

  return listingId;
}

export async function requestListingAction(formData: FormData) {
  const listingId = getListingId(formData);
  let destination = `/listings/${listingId}?notice=requested`;

  try {
    await requestListing(
      listingId,
      String(formData.get("message") ?? ""),
      String(formData.get("payment_method") ?? ""),
      String(formData.get("handoff_location") ?? "")
    );
    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/my-listings");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to request listing.";
    destination = `/listings/${listingId}?error=${encodeURIComponent(message)}`;
  }

  redirect(destination);
}

export async function acceptRequestAction(formData: FormData) {
  const listingId = getListingId(formData);
  const requestId = String(formData.get("request_id") ?? "");
  let destination = `/listings/${listingId}?notice=accepted`;

  try {
    await acceptRequest(requestId);
    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/my-listings");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to accept request.";
    destination = `/listings/${listingId}?error=${encodeURIComponent(message)}`;
  }

  redirect(destination);
}

export async function declineRequestAction(formData: FormData) {
  const listingId = getListingId(formData);
  const requestId = String(formData.get("request_id") ?? "");
  let destination = `/listings/${listingId}?notice=declined`;

  try {
    await declineRequest(requestId);
    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/my-listings");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to decline request.";
    destination = `/listings/${listingId}?error=${encodeURIComponent(message)}`;
  }

  redirect(destination);
}

export async function completeTransferAction(formData: FormData) {
  const listingId = getListingId(formData);
  const requestId = String(formData.get("request_id") ?? "");
  let destination = `/listings/${listingId}?notice=completed`;

  try {
    await completeTransfer(requestId);
    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/marketplace");
    revalidatePath("/my-listings");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to complete transfer.";
    destination = `/listings/${listingId}?error=${encodeURIComponent(message)}`;
  }

  redirect(destination);
}
