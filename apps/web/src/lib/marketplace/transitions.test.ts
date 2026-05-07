import { describe, expect, it } from "vitest";

import {
  acceptListingRequest,
  assertCanRequestListing,
  buildMockOwnershipEvent,
  completeListingTransfer,
  declineListingRequest,
  reserveListingForAcceptedRequest,
  transferListingOwnership
} from "./transitions";

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

describe("marketplace transitions", () => {
  it("pending -> accepted allowed by owner", () => {
    const nextRequest = acceptListingRequest(pendingRequest, listing.owner_user_id);
    const nextListing = reserveListingForAcceptedRequest(listing, listing.owner_user_id);

    expect(nextRequest.status).toBe("accepted");
    expect(nextRequest.accepted_at).toBeTruthy();
    expect(nextListing.status).toBe("reserved");
  });

  it("pending -> declined allowed by owner", () => {
    const nextRequest = declineListingRequest(pendingRequest, listing.owner_user_id);

    expect(nextRequest.status).toBe("declined");
  });

  it("accepted -> completed allowed by owner", () => {
    const acceptedRequest = acceptListingRequest(pendingRequest, listing.owner_user_id);
    const reservedListing = reserveListingForAcceptedRequest(listing, listing.owner_user_id);
    const completedRequest = completeListingTransfer(acceptedRequest, listing.owner_user_id);
    const transferredListing = transferListingOwnership(
      reservedListing,
      listing.owner_user_id,
      pendingRequest.requester_user_id
    );

    expect(completedRequest.status).toBe("completed");
    expect(transferredListing.owner_user_id).toBe(pendingRequest.requester_user_id);
    expect(transferredListing.status).toBe("completed");
  });

  it("pending -> completed rejected", () => {
    expect(() => completeListingTransfer(pendingRequest, listing.owner_user_id)).toThrow(
      "Only accepted requests can be completed."
    );
  });

  it("non-owner accepting rejected", () => {
    expect(() => acceptListingRequest(pendingRequest, pendingRequest.requester_user_id)).toThrow(
      "Only the listing owner can accept this request."
    );
  });

  it("requester requesting own listing rejected", () => {
    expect(() => assertCanRequestListing(listing, listing.owner_user_id)).toThrow(
      "You cannot request your own listing."
    );
  });

  it("completed transfer creates ownership event payload correctly", () => {
    const event = buildMockOwnershipEvent(listing, pendingRequest);

    expect(event.listing_id).toBe(listing.id);
    expect(event.from_user_id).toBe(listing.owner_user_id);
    expect(event.to_user_id).toBe(pendingRequest.requester_user_id);
    expect(event.transfer_type).toBe("sell");
    expect(event.source).toBe("mock");
  });
});
