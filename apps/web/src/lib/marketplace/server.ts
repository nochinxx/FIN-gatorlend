import "server-only";

import {
  createListingInputSchema,
  listingImageSchema,
  createListingRequestInputSchema,
  listingRequestSchema,
  listingSchema,
  ownershipEventSchema,
  type Listing,
  type ListingImage,
  type ListingRequest
} from "@gatorlend/core";

import {
  getCurrentMarketplaceActor,
  getProfileById
} from "@/lib/auth/profile";
import { type Profile } from "@/lib/auth/profile-schema";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";

import {
  DEFAULT_MARKETPLACE_ASSET_TYPE_SUGGESTIONS,
  normalizeMarketplaceAssetType,
  validateMarketplaceAssetType
} from "./assetTypes";
import {
  buildMockOwnershipEvent,
  cancelListingRequest,
  declineListingRequest,
  reserveListingForAcceptedRequest,
  transferListingOwnership
} from "./transitions";
import {
  assertCanAcceptRequestForProfile,
  assertCanCancelRequestForProfile,
  assertCanCompleteTransferForProfile,
  assertCanCreateListingForProfile,
  assertCanDeleteListingForProfile,
  assertCanRequestListingForProfile
} from "./guards";
import {
  buildListingImageStoragePath,
  getListingCardImageUrl,
  LISTING_IMAGE_BUCKET,
  parseListingImage,
  sanitizeListingImageFileName,
  sortListingImages,
  validateListingImageFiles
} from "./listingImages";

export type AuthenticatedMarketplaceUser = {
  id: string;
  email: string;
};

export type ListingSummary = {
  listing: Listing;
  pendingRequestCount: number;
};

export type MarketplaceRequestSummary = {
  request: ListingRequest;
  listing: Listing;
  listingImageUrl: string | null;
};

export async function requireMarketplaceUser(): Promise<AuthenticatedMarketplaceUser> {
  const { user } = await getCurrentMarketplaceActor();
  return {
    id: user.id,
    email: user.email
  };
}

function createMockTokenId() {
  return `mock_${crypto.randomUUID()}`;
}

function parseOptionalRequestText(value: string | null | undefined): string | null {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
}

export async function createListing(rawInput: unknown): Promise<Listing> {
  const { user, profile } = await getCurrentMarketplaceActor();
  assertCanCreateListingForProfile(profile);
  const supabase = await createSupabaseServerAuthClient();
  const rawInputRecord =
    rawInput && typeof rawInput === "object" ? (rawInput as Record<string, unknown>) : {};
  const input = createListingInputSchema.parse({
    ...rawInputRecord,
    asset_type: validateMarketplaceAssetType(String(rawInputRecord.asset_type ?? "")),
    owner_user_id: user.id
  });

  const insertPayload = listingSchema.parse({
    ...input,
    owner_user_id: user.id,
    status: "active",
    tokenization_status: "mock_tokenized",
    mock_token_id: createMockTokenId(),
    owner_wallet: input.owner_wallet ?? null
  });

  const { data, error } = await supabase.from("listings").insert(insertPayload).select("*").single();

  if (error) {
    throw new Error(`Failed to create listing: ${error.message}`);
  }

  return listingSchema.parse(data);
}

export async function listMarketplaceListings(): Promise<Listing[]> {
  await getCurrentMarketplaceActor();
  const supabase = await createSupabaseServerAuthClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load marketplace listings: ${error.message}`);
  }

  return (data ?? []).map((row) => listingSchema.parse(row));
}

export async function listMarketplaceAssetTypeSuggestions(): Promise<string[]> {
  await getCurrentMarketplaceActor();
  const supabase = await createSupabaseServerAuthClient();
  const { data, error } = await supabase
    .from("listings")
    .select("asset_type")
    .neq("status", "cancelled");

  if (error) {
    throw new Error(`Failed to load asset type suggestions: ${error.message}`);
  }

  const counts = new Map<string, number>();

  for (const row of data ?? []) {
    const assetType = normalizeMarketplaceAssetType(row.asset_type);

    if (!assetType) {
      continue;
    }

    counts.set(assetType, (counts.get(assetType) ?? 0) + 1);
  }

  const rankedSuggestions = [...counts.entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0]);
    })
    .map(([assetType]) => assetType);

  for (const defaultSuggestion of DEFAULT_MARKETPLACE_ASSET_TYPE_SUGGESTIONS) {
    if (!rankedSuggestions.includes(defaultSuggestion)) {
      rankedSuggestions.push(defaultSuggestion);
    }
  }

  return rankedSuggestions.slice(0, 12);
}

export async function listListingImagesByListingIds(listingIds: string[]): Promise<ListingImage[]> {
  if (listingIds.length === 0) {
    return [];
  }

  await getCurrentMarketplaceActor();
  const supabase = await createSupabaseServerAuthClient();
  const { data, error } = await supabase
    .from("listing_images")
    .select("*")
    .in("listing_id", listingIds)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load listing images: ${error.message}`);
  }

  return (data ?? []).map((row) => parseListingImage(row));
}

export async function getListingImages(listingId: string): Promise<ListingImage[]> {
  return listListingImagesByListingIds([listingId]);
}

export async function getMarketplaceListingById(id: string): Promise<Listing | null> {
  await getCurrentMarketplaceActor();
  const supabase = await createSupabaseServerAuthClient();
  const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`Failed to load listing detail: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return listingSchema.parse(data);
}

export async function getMarketplaceProfile(userId: string): Promise<Profile | null> {
  await getCurrentMarketplaceActor();
  return getProfileById(userId);
}

export async function getListingRequestsForUser(listingId: string): Promise<ListingRequest[]> {
  const { user } = await getCurrentMarketplaceActor();
  const supabase = await createSupabaseServerAuthClient();
  const { data, error } = await supabase
    .from("listing_requests")
    .select("*")
    .eq("listing_id", listingId)
    .or(`owner_user_id.eq.${user.id},requester_user_id.eq.${user.id}`)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load listing requests: ${error.message}`);
  }

  return (data ?? []).map((row) => listingRequestSchema.parse(row));
}

export async function listCurrentUserListings(): Promise<ListingSummary[]> {
  const { user } = await getCurrentMarketplaceActor();
  const supabase = await createSupabaseServerAuthClient();
  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false });

  if (listingsError) {
    throw new Error(`Failed to load your listings: ${listingsError.message}`);
  }

  const parsedListings = (listings ?? []).map((row) => listingSchema.parse(row));
  const listingIds = parsedListings.flatMap((listing) => (listing.id ? [listing.id] : []));

  if (listingIds.length === 0) {
    return [];
  }

  const { data: requests, error: requestsError } = await supabase
    .from("listing_requests")
    .select("listing_id, status")
    .in("listing_id", listingIds);

  if (requestsError) {
    throw new Error(`Failed to load your listing requests: ${requestsError.message}`);
  }

  const pendingCounts = new Map<string, number>();

  for (const request of requests ?? []) {
    if (request.status !== "pending") {
      continue;
    }

    pendingCounts.set(request.listing_id, (pendingCounts.get(request.listing_id) ?? 0) + 1);
  }

  return parsedListings.map((listing) => ({
    listing,
    pendingRequestCount: listing.id ? pendingCounts.get(listing.id) ?? 0 : 0
  }));
}

export async function requestListing(
  listingId: string,
  message?: string,
  paymentMethod?: string,
  handoffLocation?: string,
  availabilityNote?: string
): Promise<ListingRequest> {
  const { user, profile } = await getCurrentMarketplaceActor();
  const supabase = await createSupabaseServerAuthClient();
  const listing = await getMarketplaceListingById(listingId);

  if (!listing) {
    throw new Error("Listing not found.");
  }

  assertCanRequestListingForProfile(profile, listing, user.id);

  const { data: existingRequest, error: existingRequestError } = await supabase
    .from("listing_requests")
    .select("id, status")
    .eq("listing_id", listingId)
    .eq("requester_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingRequestError) {
    throw new Error(`Failed to check existing request state: ${existingRequestError.message}`);
  }

  if (existingRequest) {
    if (["pending", "accepted", "handoff_confirmed"].includes(existingRequest.status)) {
      throw new Error("You already have an open request for this listing.");
    }

    throw new Error("You have already submitted a request for this listing.");
  }

  const input = createListingRequestInputSchema.parse({
    listing_id: listingId,
    message: parseOptionalRequestText(message) ?? undefined,
    payment_method: parseOptionalRequestText(paymentMethod) ?? undefined,
    handoff_location: parseOptionalRequestText(handoffLocation) ?? undefined,
    availability_note: parseOptionalRequestText(availabilityNote) ?? undefined
  });

  const insertPayload = listingRequestSchema.parse({
    ...input,
    owner_user_id: listing.owner_user_id,
    requester_user_id: user.id,
    status: "pending"
  });

  const { data, error } = await supabase
    .from("listing_requests")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("You already have an open request for this listing.");
    }

    throw new Error(`Failed to create listing request: ${error.message}`);
  }

  return listingRequestSchema.parse(data);
}

async function getRequestById(requestId: string): Promise<ListingRequest> {
  const supabase = await createSupabaseServerAuthClient();
  const { data, error } = await supabase.from("listing_requests").select("*").eq("id", requestId).single();

  if (error) {
    throw new Error(`Failed to load listing request: ${error.message}`);
  }

  return listingRequestSchema.parse(data);
}

export async function acceptRequest(requestId: string): Promise<ListingRequest> {
  const { user, profile } = await getCurrentMarketplaceActor();
  const supabase = await createSupabaseServerAuthClient();
  const request = await getRequestById(requestId);
  const listing = await getMarketplaceListingById(request.listing_id);

  if (!listing) {
    throw new Error("Listing not found.");
  }

  const nextRequest = assertCanAcceptRequestForProfile(profile, request, user.id);
  const nextListing = reserveListingForAcceptedRequest(listing, user.id);

  const { error: requestError } = await supabase
    .from("listing_requests")
    .update({
      status: nextRequest.status,
      accepted_at: nextRequest.accepted_at
    })
    .eq("id", requestId);

  if (requestError) {
    throw new Error(`Failed to accept request: ${requestError.message}`);
  }

  const { error: listingError } = await supabase
    .from("listings")
    .update({
      status: nextListing.status
    })
    .eq("id", listing.id);

  if (listingError) {
    throw new Error(`Failed to reserve listing: ${listingError.message}`);
  }

  return nextRequest;
}

export async function acceptRequestWithOwnerNote(
  requestId: string,
  ownerNote?: string
): Promise<ListingRequest> {
  const nextRequest = await acceptRequest(requestId);
  const note = parseOptionalRequestText(ownerNote);

  if (!note) {
    return nextRequest;
  }

  const supabase = await createSupabaseServerAuthClient();
  const { error } = await supabase
    .from("listing_requests")
    .update({
      owner_note: note
    })
    .eq("id", requestId);

  if (error) {
    throw new Error(`Failed to save owner response: ${error.message}`);
  }

  return listingRequestSchema.parse({
    ...nextRequest,
    owner_note: note
  });
}

export async function declineRequest(requestId: string): Promise<ListingRequest> {
  const { user } = await getCurrentMarketplaceActor();
  const supabase = await createSupabaseServerAuthClient();
  const request = await getRequestById(requestId);
  const nextRequest = declineListingRequest(request, user.id);

  const { error } = await supabase
    .from("listing_requests")
    .update({
      status: nextRequest.status
    })
    .eq("id", requestId);

  if (error) {
    throw new Error(`Failed to decline request: ${error.message}`);
  }

  return nextRequest;
}

export async function cancelRequest(requestId: string): Promise<ListingRequest> {
  const { user, profile } = await getCurrentMarketplaceActor();
  const supabase = await createSupabaseServerAuthClient();
  const request = await getRequestById(requestId);
  const nextRequest = assertCanCancelRequestForProfile(profile, request, user.id);

  const { error } = await supabase
    .from("listing_requests")
    .update({
      status: nextRequest.status
    })
    .eq("id", requestId);

  if (error) {
    throw new Error(`Failed to cancel request: ${error.message}`);
  }

  return nextRequest;
}

export async function completeTransfer(requestId: string): Promise<{
  request: ListingRequest;
  listing: Listing;
}> {
  const { user, profile } = await getCurrentMarketplaceActor();
  const supabase = await createSupabaseServerAuthClient();
  const request = await getRequestById(requestId);
  const listing = await getMarketplaceListingById(request.listing_id);

  if (!listing) {
    throw new Error("Listing not found.");
  }

  const nextRequest = assertCanCompleteTransferForProfile(profile, request, user.id);
  const nextListing = transferListingOwnership(listing, user.id, request.requester_user_id);
  const ownershipEvent = ownershipEventSchema.parse(buildMockOwnershipEvent(listing, request));

  const { error: requestError } = await supabase
    .from("listing_requests")
    .update({
      status: nextRequest.status,
      completed_at: nextRequest.completed_at
    })
    .eq("id", requestId);

  if (requestError) {
    throw new Error(`Failed to complete request: ${requestError.message}`);
  }

  const { error: listingError } = await supabase
    .from("listings")
    .update({
      owner_user_id: nextListing.owner_user_id,
      status: nextListing.status
    })
    .eq("id", listing.id);

  if (listingError) {
    throw new Error(`Failed to transfer listing ownership: ${listingError.message}`);
  }

  const { error: eventError } = await supabase.from("ownership_events").insert(ownershipEvent);

  if (eventError) {
    throw new Error(`Failed to record ownership event: ${eventError.message}`);
  }

  return {
    request: nextRequest,
    listing: nextListing
  };
}

export async function listRequestsReceived(): Promise<MarketplaceRequestSummary[]> {
  const { user } = await getCurrentMarketplaceActor();
  const supabase = await createSupabaseServerAuthClient();
  const { data, error } = await supabase
    .from("listing_requests")
    .select("*")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load received requests: ${error.message}`);
  }

  return buildMarketplaceRequestSummaries((data ?? []).map((row) => listingRequestSchema.parse(row)));
}

export async function listRequestsSent(): Promise<MarketplaceRequestSummary[]> {
  const { user } = await getCurrentMarketplaceActor();
  const supabase = await createSupabaseServerAuthClient();
  const { data, error } = await supabase
    .from("listing_requests")
    .select("*")
    .eq("requester_user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load sent requests: ${error.message}`);
  }

  return buildMarketplaceRequestSummaries((data ?? []).map((row) => listingRequestSchema.parse(row)));
}

async function buildMarketplaceRequestSummaries(
  requests: ListingRequest[]
): Promise<MarketplaceRequestSummary[]> {
  if (requests.length === 0) {
    return [];
  }

  const listingIds = [...new Set(requests.map((request) => request.listing_id))];
  const supabase = await createSupabaseServerAuthClient();
  const { data: listingRows, error } = await supabase
    .from("listings")
    .select("*")
    .in("id", listingIds);

  if (error) {
    throw new Error(`Failed to load request listings: ${error.message}`);
  }

  const listingsById = new Map(
    (listingRows ?? []).map((row) => {
      const listing = listingSchema.parse(row);
      return [listing.id!, listing] as const;
    })
  );
  const listingImages = await listListingImagesByListingIds(listingIds);
  const listingImagesById = new Map<string, ListingImage[]>();

  for (const image of listingImages) {
    const existingImages = listingImagesById.get(image.listing_id) ?? [];
    existingImages.push(image);
    listingImagesById.set(image.listing_id, existingImages);
  }

  return requests.flatMap((request) => {
    const listing = listingsById.get(request.listing_id);

    if (!listing) {
      return [];
    }

    return [
      {
        request,
        listing,
        listingImageUrl: getListingCardImageUrl(listing, sortListingImages(listingImagesById.get(listing.id!) ?? []))
      }
    ];
  });
}

export async function getPendingReceivedRequestCount(): Promise<number> {
  const { user } = await getCurrentMarketplaceActor();
  const supabase = await createSupabaseServerAuthClient();
  const { count, error } = await supabase
    .from("listing_requests")
    .select("*", { count: "exact", head: true })
    .eq("owner_user_id", user.id)
    .eq("status", "pending");

  if (error) {
    throw new Error(`Failed to load pending request count: ${error.message}`);
  }

  return count ?? 0;
}

export async function uploadListingImages(
  listingId: string,
  files: File[],
  options?: {
    requireAtLeastOne?: boolean;
  }
): Promise<ListingImage[]> {
  const { user, profile } = await getCurrentMarketplaceActor();
  assertCanCreateListingForProfile(profile);
  const supabase = await createSupabaseServerAuthClient();
  const listing = await getMarketplaceListingById(listingId);

  if (!listing) {
    throw new Error("Listing not found.");
  }

  if (listing.owner_user_id !== user.id) {
    throw new Error("Only the listing owner can upload images.");
  }

  const existingImages = await getListingImages(listingId);
  validateListingImageFiles(files, {
    requireAtLeastOne: options?.requireAtLeastOne ?? false,
    existingCount: existingImages.length
  });

  const uploadedImages: ListingImage[] = [];
  const uploadedPaths: string[] = [];
  const insertedImageIds: string[] = [];

  try {
    for (const [index, file] of files.entries()) {
      const safeFileName = sanitizeListingImageFileName(file.name);
      const uniqueFileName = `${existingImages.length + index}-${safeFileName}`;
      const storagePath = buildListingImageStoragePath(user.id, listingId, uniqueFileName);
      const uploadResult = await supabase.storage.from(LISTING_IMAGE_BUCKET).upload(storagePath, file, {
        contentType: file.type,
        upsert: false
      });

      if (uploadResult.error) {
        throw new Error(uploadResult.error.message);
      }

      uploadedPaths.push(storagePath);
      const {
        data: { publicUrl }
      } = supabase.storage.from(LISTING_IMAGE_BUCKET).getPublicUrl(storagePath);

      const insertPayload = listingImageSchema.parse({
        listing_id: listingId,
        user_id: user.id,
        storage_path: storagePath,
        public_url: publicUrl,
        display_order: existingImages.length + index
      });

      const { data, error } = await supabase
        .from("listing_images")
        .insert(insertPayload)
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const insertedImage = parseListingImage(data);
      if (insertedImage.id) {
        insertedImageIds.push(insertedImage.id);
      }
      uploadedImages.push(insertedImage);
    }
  } catch (error) {
    if (insertedImageIds.length > 0) {
      await supabase.from("listing_images").delete().in("id", insertedImageIds);
    }

    if (uploadedPaths.length > 0) {
      await supabase.storage.from(LISTING_IMAGE_BUCKET).remove(uploadedPaths);
    }

    throw new Error(
      `Listing created, but image upload failed. You can retry adding images from the listing page. ${error instanceof Error ? error.message : ""}`.trim()
    );
  }

  if (existingImages.length === 0 && uploadedImages[0]?.public_url) {
    const { error } = await supabase
      .from("listings")
      .update({
        image_url: uploadedImages[0].public_url
      })
      .eq("id", listingId);

    if (error) {
      throw new Error(`Images uploaded, but cover image update failed: ${error.message}`);
    }
  }

  return sortListingImages([...existingImages, ...uploadedImages]);
}

export async function deleteListing(listingId: string): Promise<void> {
  const { user, profile } = await getCurrentMarketplaceActor();
  const supabase = await createSupabaseServerAuthClient();
  const listing = await getMarketplaceListingById(listingId);

  if (!listing) {
    throw new Error("Listing not found.");
  }

  assertCanDeleteListingForProfile(profile, listing, user.id);

  const existingImages = await getListingImages(listingId);
  const storagePaths = existingImages
    .map((image) => image.storage_path)
    .filter((value): value is string => Boolean(value));

  if (storagePaths.length > 0) {
    const { error: storageDeleteError } = await supabase.storage
      .from(LISTING_IMAGE_BUCKET)
      .remove(storagePaths);

    if (storageDeleteError) {
      throw new Error(`Failed to delete listing images: ${storageDeleteError.message}`);
    }
  }

  const { error } = await supabase.from("listings").delete().eq("id", listingId);

  if (error) {
    throw new Error(`Failed to delete listing: ${error.message}`);
  }
}
