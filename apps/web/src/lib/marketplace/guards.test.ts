import { describe, expect, it } from "vitest";

import {
  assertCanAcceptRequestForProfile,
  assertCanCancelRequestForProfile,
  assertCanCompleteTransferForProfile,
  assertCanCreateListingForProfile,
  assertCanRequestListingForProfile
} from "./guards";

const readyProfile = {
  username: "gator_reader"
};

const incompleteProfile = {
  username: null
};

const listing = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  asset_type: "textbook" as const,
  listing_type: "sell" as const,
  title: "Introduction to Algorithms",
  description: "Good condition.",
  condition: "used-good",
  image_url: "/images/textbook.jpg",
  owner_user_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  owner_wallet: null,
  price_amount: 30,
  price_type: "usd",
  payment_methods: ["cash"],
  status: "active" as const,
  tokenization_status: "mock_tokenized" as const,
  mock_token_id: "mock_algorithms",
  xrpl_token_id: null,
  metadata: {}
};

const pendingRequest = {
  id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  listing_id: listing.id,
  owner_user_id: listing.owner_user_id,
  requester_user_id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  status: "pending" as const,
  message: "Interested",
  payment_method: "cash",
  handoff_location: "Library",
  requested_at: "2026-05-06T00:00:00.000Z",
  accepted_at: null,
  completed_at: null,
  created_at: "2026-05-06T00:00:00.000Z",
  updated_at: "2026-05-06T00:00:00.000Z"
};

describe("marketplace profile guards", () => {
  it("createListing rejects user without username", () => {
    expect(() => assertCanCreateListingForProfile(incompleteProfile)).toThrow(
      "Please finish setting up your profile before using the marketplace."
    );
  });

  it("requestListing rejects user without username", () => {
    expect(() =>
      assertCanRequestListingForProfile(incompleteProfile, listing, pendingRequest.requester_user_id)
    ).toThrow("Please finish setting up your profile before using the marketplace.");
  });

  it("requestListing rejects own listing", () => {
    expect(() =>
      assertCanRequestListingForProfile(readyProfile, listing, listing.owner_user_id)
    ).toThrow("You cannot request your own listing.");
  });

  it("acceptRequest rejects non-owner", () => {
    expect(() =>
      assertCanAcceptRequestForProfile(readyProfile, pendingRequest, pendingRequest.requester_user_id)
    ).toThrow("Only the listing owner can accept this request.");
  });

  it("completeTransfer rejects non-owner", () => {
    const acceptedRequest = {
      ...pendingRequest,
      status: "accepted" as const,
      accepted_at: "2026-05-07T00:00:00.000Z"
    };

    expect(() =>
      assertCanCompleteTransferForProfile(readyProfile, acceptedRequest, pendingRequest.requester_user_id)
    ).toThrow("Only the listing owner can complete this transfer.");
  });

  it("requester can cancel pending request", () => {
    expect(() =>
      assertCanCancelRequestForProfile(readyProfile, pendingRequest, pendingRequest.requester_user_id)
    ).not.toThrow();
  });
});
