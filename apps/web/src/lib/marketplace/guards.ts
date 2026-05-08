import type { Listing, ListingRequest } from "@gatorlend/core";

import { assertMarketplaceProfileReady, type Profile } from "../auth/profile-schema";

import {
  acceptListingRequest,
  assertCanRequestListing,
  cancelListingRequest,
  completeListingTransfer
} from "./transitions";

export function assertCanCreateListingForProfile(profile: Pick<Profile, "username"> | null | undefined) {
  assertMarketplaceProfileReady(profile);
}

export function assertCanRequestListingForProfile(
  profile: Pick<Profile, "username"> | null | undefined,
  listing: Listing,
  requesterUserId: string
) {
  assertMarketplaceProfileReady(profile);
  assertCanRequestListing(listing, requesterUserId);
}

export function assertCanAcceptRequestForProfile(
  profile: Pick<Profile, "username"> | null | undefined,
  request: ListingRequest,
  actingUserId: string
) {
  assertMarketplaceProfileReady(profile);
  return acceptListingRequest(request, actingUserId);
}

export function assertCanCompleteTransferForProfile(
  profile: Pick<Profile, "username"> | null | undefined,
  request: ListingRequest,
  actingUserId: string
) {
  assertMarketplaceProfileReady(profile);
  return completeListingTransfer(request, actingUserId);
}

export function assertCanCancelRequestForProfile(
  profile: Pick<Profile, "username"> | null | undefined,
  request: ListingRequest,
  actingUserId: string
) {
  assertMarketplaceProfileReady(profile);
  return cancelListingRequest(request, actingUserId);
}

export function assertCanDeleteListingForProfile(
  profile: Pick<Profile, "username"> | null | undefined,
  listing: Listing,
  actingUserId: string
) {
  assertMarketplaceProfileReady(profile);

  if (listing.owner_user_id !== actingUserId) {
    throw new Error("Only the owner can delete this listing.");
  }
}
