import {
  listingRequestSchema,
  listingSchema,
  ownershipEventSchema,
  type Listing,
  type ListingRequest,
  type OwnershipEvent
} from "@gatorlend/core";

export function assertCanRequestListing(listing: Listing, requesterUserId: string) {
  if (listing.owner_user_id === requesterUserId) {
    throw new Error("You cannot request your own listing.");
  }

  if (listing.status !== "active") {
    throw new Error("Only active listings can be requested.");
  }
}

export function acceptListingRequest(request: ListingRequest, actingUserId: string): ListingRequest {
  if (request.owner_user_id !== actingUserId) {
    throw new Error("Only the listing owner can accept this request.");
  }

  if (request.status !== "pending") {
    throw new Error("Only pending requests can be accepted.");
  }

  return listingRequestSchema.parse({
    ...request,
    status: "accepted",
    accepted_at: new Date().toISOString()
  });
}

export function declineListingRequest(request: ListingRequest, actingUserId: string): ListingRequest {
  if (request.owner_user_id !== actingUserId) {
    throw new Error("Only the listing owner can decline this request.");
  }

  if (request.status !== "pending") {
    throw new Error("Only pending requests can be declined.");
  }

  return listingRequestSchema.parse({
    ...request,
    status: "declined"
  });
}

export function completeListingTransfer(request: ListingRequest, actingUserId: string): ListingRequest {
  if (request.owner_user_id !== actingUserId) {
    throw new Error("Only the listing owner can complete this transfer.");
  }

  if (request.status !== "accepted") {
    throw new Error("Only accepted requests can be completed.");
  }

  return listingRequestSchema.parse({
    ...request,
    status: "completed",
    completed_at: new Date().toISOString()
  });
}

export function reserveListingForAcceptedRequest(listing: Listing, actingUserId: string): Listing {
  if (listing.owner_user_id !== actingUserId) {
    throw new Error("Only the listing owner can reserve this listing.");
  }

  if (listing.status !== "active") {
    throw new Error("Only active listings can be reserved.");
  }

  return listingSchema.parse({
    ...listing,
    status: "reserved"
  });
}

export function transferListingOwnership(
  listing: Listing,
  actingUserId: string,
  nextOwnerUserId: string
): Listing {
  if (listing.owner_user_id !== actingUserId) {
    throw new Error("Only the current listing owner can transfer ownership.");
  }

  if (listing.status !== "reserved") {
    throw new Error("Only reserved listings can be transferred.");
  }

  return listingSchema.parse({
    ...listing,
    owner_user_id: nextOwnerUserId,
    status: "completed"
  });
}

export function buildMockOwnershipEvent(
  listing: Listing,
  request: ListingRequest
): OwnershipEvent {
  return ownershipEventSchema.parse({
    listing_id: listing.id,
    from_user_id: request.owner_user_id,
    to_user_id: request.requester_user_id,
    transfer_type: listing.listing_type,
    source: "mock"
  });
}
