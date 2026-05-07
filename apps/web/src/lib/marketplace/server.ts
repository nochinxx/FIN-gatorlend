import "server-only";

import {
  createListingInputSchema,
  createListingRequestInputSchema,
  listingRequestSchema,
  listingSchema,
  ownershipEventSchema,
  type CreateListingInput,
  type Listing,
  type ListingRequest
} from "@gatorlend/core";

import { canAccessMarketplaceRoutes } from "@/lib/auth/access";
import { ensureAuthProfile } from "@/lib/auth/profile";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";

import {
  acceptListingRequest,
  assertCanRequestListing,
  buildMockOwnershipEvent,
  completeListingTransfer,
  declineListingRequest,
  reserveListingForAcceptedRequest,
  transferListingOwnership
} from "./transitions";

type AuthenticatedMarketplaceUser = {
  id: string;
  email: string;
};

export async function requireMarketplaceUser(): Promise<AuthenticatedMarketplaceUser> {
  const supabase = await createSupabaseServerAuthClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email || !canAccessMarketplaceRoutes(user.email)) {
    throw new Error("Marketplace actions require a logged-in SFSU user.");
  }

  return {
    id: user.id,
    email: user.email
  };
}

async function ensureProfile(user: AuthenticatedMarketplaceUser) {
  await ensureAuthProfile(user);
}

function createMockTokenId() {
  return `mock_${crypto.randomUUID()}`;
}

export async function createListing(rawInput: unknown): Promise<Listing> {
  const currentUser = await requireMarketplaceUser();
  await ensureProfile(currentUser);
  const supabase = await createSupabaseServerAuthClient();
  const rawInputRecord =
    rawInput && typeof rawInput === "object" ? (rawInput as Record<string, unknown>) : {};
  const input = createListingInputSchema.parse({
    ...rawInputRecord,
    owner_user_id: currentUser.id
  });

  const insertPayload = listingSchema.parse({
    ...input,
    owner_user_id: currentUser.id,
    status: "active",
    tokenization_status: "mock_tokenized",
    mock_token_id: createMockTokenId()
  });

  const { data, error } = await supabase.from("listings").insert(insertPayload).select("*").single();

  if (error) {
    throw new Error(`Failed to create listing: ${error.message}`);
  }

  return listingSchema.parse(data);
}

export async function listMarketplaceListings(): Promise<Listing[]> {
  await ensureProfile(await requireMarketplaceUser());
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
  await ensureProfile(await requireMarketplaceUser());
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

export async function getMarketplaceProfile(userId: string): Promise<{
  id: string;
  email: string;
  display_name: string | null;
} | null> {
  await ensureProfile(await requireMarketplaceUser());
  const supabase = await createSupabaseServerAuthClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  return data;
}

export async function getListingRequestsForUser(listingId: string): Promise<ListingRequest[]> {
  const currentUser = await requireMarketplaceUser();
  await ensureProfile(currentUser);
  const supabase = await createSupabaseServerAuthClient();
  const { data, error } = await supabase
    .from("listing_requests")
    .select("*")
    .eq("listing_id", listingId)
    .or(`owner_user_id.eq.${currentUser.id},requester_user_id.eq.${currentUser.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load listing requests: ${error.message}`);
  }

  return (data ?? []).map((row) => listingRequestSchema.parse(row));
}

export async function requestListing(
  listingId: string,
  message?: string,
  paymentMethod?: string,
  handoffLocation?: string
): Promise<ListingRequest> {
  const currentUser = await requireMarketplaceUser();
  await ensureProfile(currentUser);
  const supabase = await createSupabaseServerAuthClient();
  const listing = await getMarketplaceListingById(listingId);

  if (!listing) {
    throw new Error("Listing not found.");
  }

  assertCanRequestListing(listing, currentUser.id);

  const input = createListingRequestInputSchema.parse({
    listing_id: listingId,
    message,
    payment_method: paymentMethod,
    handoff_location: handoffLocation
  });

  const insertPayload = listingRequestSchema.parse({
    ...input,
    owner_user_id: listing.owner_user_id,
    requester_user_id: currentUser.id,
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
  const currentUser = await requireMarketplaceUser();
  await ensureProfile(currentUser);
  const supabase = await createSupabaseServerAuthClient();
  const request = await getRequestById(requestId);
  const listing = await getMarketplaceListingById(request.listing_id);

  if (!listing) {
    throw new Error("Listing not found.");
  }

  const nextRequest = acceptListingRequest(request, currentUser.id);
  const nextListing = reserveListingForAcceptedRequest(listing, currentUser.id);

  // TODO: wrap these writes in a DB transaction or RPC if the workflow grows more complex.
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
  const currentUser = await requireMarketplaceUser();
  await ensureProfile(currentUser);
  const supabase = await createSupabaseServerAuthClient();
  const request = await getRequestById(requestId);
  const nextRequest = declineListingRequest(request, currentUser.id);

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
  const currentUser = await requireMarketplaceUser();
  await ensureProfile(currentUser);
  const supabase = await createSupabaseServerAuthClient();
  const request = await getRequestById(requestId);
  const listing = await getMarketplaceListingById(request.listing_id);

  if (!listing) {
    throw new Error("Listing not found.");
  }

  const nextRequest = completeListingTransfer(request, currentUser.id);
  const nextListing = transferListingOwnership(listing, currentUser.id, request.requester_user_id);
  const ownershipEvent = ownershipEventSchema.parse(buildMockOwnershipEvent(listing, request));

  // TODO: move these three writes into a DB transaction or RPC for stronger atomicity.
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
