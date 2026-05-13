"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  acceptRequestWithOwnerNote,
  cancelRequest,
  confirmHandoff,
  confirmReceipt,
  declineRequest,
  dismissRequest,
  requestListing,
  uploadListingImages
} from "@/lib/marketplace/server";

function getListingId(formData: FormData) {
  const listingId = String(formData.get("listing_id") ?? "");

  if (!listingId) {
    throw new Error("Listing id is required.");
  }

  return listingId;
}

function getRedirectTo(formData: FormData, fallback: string) {
  const redirectTo = String(formData.get("redirect_to") ?? "");
  return redirectTo.startsWith("/") ? redirectTo : fallback;
}

function buildErrorDestination(redirectTo: string, fallbackListingId: string, message: string) {
  if (redirectTo.startsWith("/requests")) {
    return `/requests?error=${encodeURIComponent(message)}`;
  }

  return `/listings/${fallbackListingId}?error=${encodeURIComponent(message)}`;
}

export async function requestListingAction(formData: FormData) {
  const listingId = getListingId(formData);
  let destination = getRedirectTo(formData, `/listings/${listingId}?notice=requested`);

  try {
    await requestListing(
      listingId,
      String(formData.get("message") ?? ""),
      String(formData.get("payment_method") ?? ""),
      String(formData.get("handoff_location") ?? ""),
      String(formData.get("availability_note") ?? "")
    );
    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/my-listings");
    revalidatePath("/requests");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to request listing.";
    destination = buildErrorDestination(destination, listingId, message);
  }

  redirect(destination);
}

export async function acceptRequestAction(formData: FormData) {
  const listingId = getListingId(formData);
  const requestId = String(formData.get("request_id") ?? "");
  let destination = getRedirectTo(formData, `/listings/${listingId}?notice=accepted`);

  try {
    await acceptRequestWithOwnerNote(requestId, String(formData.get("owner_note") ?? ""));
    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/my-listings");
    revalidatePath("/requests");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to accept request.";
    destination = buildErrorDestination(destination, listingId, message);
  }

  redirect(destination);
}

export async function declineRequestAction(formData: FormData) {
  const listingId = getListingId(formData);
  const requestId = String(formData.get("request_id") ?? "");
  let destination = getRedirectTo(formData, `/listings/${listingId}?notice=declined`);

  try {
    await declineRequest(requestId);
    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/my-listings");
    revalidatePath("/requests");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to decline request.";
    destination = buildErrorDestination(destination, listingId, message);
  }

  redirect(destination);
}

export async function confirmHandoffAction(formData: FormData) {
  const listingId = getListingId(formData);
  const rawHandoffRequestId = formData.get("request_id");
  const requestId = typeof rawHandoffRequestId === "string" ? rawHandoffRequestId : "";
  let destination = getRedirectTo(formData, "/requests?notice=handoff-confirmed");

  try {
    await confirmHandoff(requestId);
    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/requests");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to confirm handoff.";
    destination = buildErrorDestination(destination, listingId, message);
  }

  redirect(destination);
}

export async function confirmReceiptAction(formData: FormData) {
  const listingId = getListingId(formData);
  const rawReceiptRequestId = formData.get("request_id");
  const requestId = typeof rawReceiptRequestId === "string" ? rawReceiptRequestId : "";
  let destination = getRedirectTo(formData, "/requests?notice=receipt-confirmed");

  try {
    await confirmReceipt(requestId);
    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/marketplace");
    revalidatePath("/my-listings");
    revalidatePath("/requests");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to confirm receipt.";
    destination = buildErrorDestination(destination, listingId, message);
  }

  redirect(destination);
}

export async function cancelRequestAction(formData: FormData) {
  const listingId = getListingId(formData);
  const requestId = String(formData.get("request_id") ?? "");
  let destination = getRedirectTo(formData, "/requests?notice=cancelled");

  try {
    await cancelRequest(requestId);
    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/marketplace");
    revalidatePath("/my-listings");
    revalidatePath("/requests");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel request.";
    destination = buildErrorDestination(destination, listingId, message);
  }

  redirect(destination);
}

export async function dismissRequestAction(formData: FormData) {
  const listingId = getListingId(formData);
  const rawRequestId = formData.get("request_id");
  const requestId = typeof rawRequestId === "string" ? rawRequestId : "";
  const destination = getRedirectTo(formData, "/requests?notice=dismissed");

  try {
    await dismissRequest(requestId);
    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/requests");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to dismiss request.";
    redirect(`/requests?error=${encodeURIComponent(message)}`);
  }

  redirect(destination);
}

export async function uploadListingImagesAction(formData: FormData) {
  const listingId = getListingId(formData);
  const destination = `/listings/${listingId}`;
  const imageFiles = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);

  try {
    await uploadListingImages(listingId, imageFiles, {
      requireAtLeastOne: true
    });
    revalidatePath(destination);
    revalidatePath("/marketplace");
    revalidatePath("/my-listings");
  } catch (error) {
    redirect(`${destination}?error=${encodeURIComponent(error instanceof Error ? error.message : "Failed to upload images.")}`);
  }

  redirect(`${destination}?notice=images-updated`);
}
