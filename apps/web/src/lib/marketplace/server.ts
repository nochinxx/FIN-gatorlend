import "server-only";

import {
  createListingInputSchema,
  createListingRequestInputSchema,
  listingRequestSchema,
  listingSchema,
  ownershipEventSchema,
  type Listing,
  type ListingRequest
} from "@gatorlend/core";

import {
  getCurrentMarketplaceActor,
  getProfileById
} from "@/lib/auth/profile";
import { type Profile } from "@/lib/auth/profile-schema";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";

import {
  buildMockOwnershipEvent,
  declineListingRequest,
  reserveListingForAcceptedRequest,
  transferListingOwnership
} from "./transitions";
import {
  assertCanAcceptRequestForProfile,
  assertCanCompleteTransferForProfile,
  assertCanCreateListingForProfile,
  assertCanRequestListingForProfile
} from "./guards";

export type AuthenticatedMarketplaceUser = {
  id: string;
  email: string;
};

export type ListingSummary = {
  listing: Listing;
  pendingRequestCount: number;
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

export async function createListing(rawInput: unknown): Promise<Listing> {
  const { user, profile } = await getCurrentMarketplaceActor();
  assertCanCreateListingForProfile(profile);
  const supabase = await createSupabaseServerAuthClient();
  const rawInputRecord =
    rawInput && typeof rawInput === "object" ? (rawInput as Record<string, unknown>) : {};
  const input = createListingInputSchema.parse({
    ...rawInputRecord,
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
    .order("created_at", { ascending: false });

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
  handoffLocation?: string
): Promise<ListingRequest> {
  const { user, profile } = await getCurrentMarketplaceActor();
  const supabase = await createSupabaseServerAuthClient();
  const listing = await getMarketplaceListingById(listingId);

  if (!listing) {
    throw new Error("Listing not found.");
  }

  assertCanRequestListingForProfile(profile, listing, user.id);

  const input = createListingRequestInputSchema.parse({
    listing_id: listingId,
    message,
    payment_method: paymentMethod,
    handoff_location: handoffLocation
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
