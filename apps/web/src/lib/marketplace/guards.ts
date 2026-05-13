import type { Listing, ListingRequest } from "@gatorlend/core";

import { assertMarketplaceProfileReady, type Profile } from "../auth/profile-schema";

import {
  acceptListingRequest,
  assertCanRequestListing,
  cancelListingRequest,
  confirmHandoff,
  confirmReceipt
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

export function assertCanConfirmHandoffForProfile(
  profile: Pick<Profile, "username"> | null | undefined,
  request: ListingRequest,
  actingUserId: string
) {
  assertMarketplaceProfileReady(profile);
  return confirmHandoff(request, actingUserId);
}

export function assertCanConfirmReceiptForProfile(
  profile: Pick<Profile, "username"> | null | undefined,
  request: ListingRequest,
  actingUserId: string
) {
  assertMarketplaceProfileReady(profile);
  return confirmReceipt(request, actingUserId);
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
