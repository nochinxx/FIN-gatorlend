import Link from "next/link";

import { listProfilesByIds } from "@/lib/auth/profile";
import { getProfileIdentityLabel } from "@/lib/auth/profile-schema";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { listCurrentUserListings, listRequestsReceived } from "@/lib/marketplace/server";

import {
  acceptRequestAction,
  declineRequestAction
} from "../listings/[id]/actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type MyListingsPageProps = {
  searchParams: Promise<{
    notice?: string;
    error?: string;
  }>;
};

export default async function MyListingsPage({ searchParams }: MyListingsPageProps) {
  const resolvedSearchParams = await searchParams;
  const [listings, receivedRequests] = await Promise.all([
    listCurrentUserListings(),
    listRequestsReceived()
  ]);
  const requesterProfiles = await listProfilesByIds([
    ...new Set(receivedRequests.map((item) => item.request.requester_user_id))
  ]);
  const requesterProfilesById = new Map(requesterProfiles.map((profile) => [profile.id, profile]));
  const requestsByListingId = new Map<string, typeof receivedRequests>();

  for (const item of receivedRequests) {
    if (!item.listing.id) {
      continue;
    }

    const currentItems = requestsByListingId.get(item.listing.id) ?? [];
    currentItems.push(item);
    requestsByListingId.set(item.listing.id, currentItems);
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12 }}>
            My listings
          </p>
          <h1 style={{ marginBottom: "0.5rem", fontSize: "clamp(2rem, 5vw, 3rem)" }}>Your marketplace items</h1>
          <p style={{ margin: 0, color: "#4f4f4f", lineHeight: 1.6 }}>
            Review the listings you own, track their current status, and handle pending requests
            directly from this page.
          </p>
        </div>
        <Link
          href="/listings/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.85rem 1rem",
            borderRadius: 999,
            background: "#111111",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: 700,
            height: "fit-content"
          }}
        >
          Create listing
        </Link>
      </div>

      {resolvedSearchParams.notice ? (
        <p style={{ marginTop: "1.5rem", padding: "0.9rem 1rem", borderRadius: 12, background: "#edf7ef", color: "#1f5f30" }}>
          Action completed: {resolvedSearchParams.notice}
        </p>
      ) : null}

      {resolvedSearchParams.error ? (
        <p style={{ marginTop: "1.5rem", padding: "0.9rem 1rem", borderRadius: 12, background: "#fff3ef", color: "#7f2413" }}>
          {resolvedSearchParams.error}
        </p>
      ) : null}

      <section style={{ marginTop: "2rem", display: "grid", gap: "1rem" }}>
        {listings.length === 0 ? (
          <article style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff" }}>
            <p style={{ margin: 0 }}>You have not created any listings yet.</p>
          </article>
        ) : (
          listings.map(({ listing, pendingRequestCount }) => {
            const listingRequests = requestsByListingId.get(listing.id!) ?? [];

            return (
              <article
                key={listing.id}
                style={{ padding: "1.25rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ display: "grid", gap: "0.35rem" }}>
                    <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 12, color: "#666666" }}>
                      {listing.asset_type} · {listing.listing_type}
                    </p>
                    <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{listing.title}</h2>
                    <p style={{ margin: 0, color: "#4a4a4a" }}>{listing.description || "No description added yet."}</p>
                  </div>
                  <div style={{ display: "grid", gap: "0.4rem", justifyItems: "end" }}>
                    <p style={{ margin: 0 }}><strong>Status:</strong> {listing.status}</p>
                    <p style={{ margin: 0 }}><strong>Pending requests:</strong> {pendingRequestCount}</p>
                    <p style={{ margin: 0 }}><strong>Record ID:</strong> {listing.mock_token_id ?? "Not assigned"}</p>
                  </div>
                </div>

                <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <Link href={`/listings/${listing.id}`} style={{ color: "#111111", fontWeight: 700, textDecoration: "none" }}>
                    View listing detail
                  </Link>
                </div>

                {listingRequests.length > 0 ? (
                  <section style={{ marginTop: "1rem", display: "grid", gap: "0.85rem" }}>
                    <p style={{ margin: 0, fontWeight: 700 }}>Request queue</p>
                    {listingRequests.map((item) => {
                      const { request } = item;
                      const acceptFormId = `my-listing-accept-${request.id}`;

                      return (
                        <div key={request.id} style={{ padding: "1rem", borderRadius: 16, border: "1px solid #efefef", background: "#fafafa", display: "grid", gap: "0.55rem" }}>
                          <p style={{ margin: 0 }}><strong>Requester:</strong> {getProfileIdentityLabel(requesterProfilesById.get(request.requester_user_id))}</p>
                          <p style={{ margin: 0 }}><strong>Status:</strong> {request.status}</p>
                          {request.message ? <p style={{ margin: 0 }}><strong>Message:</strong> {request.message}</p> : null}
                          {request.handoff_location ? <p style={{ margin: 0 }}><strong>Preferred handoff:</strong> {request.handoff_location}</p> : null}
                          {request.availability_note ? <p style={{ margin: 0 }}><strong>Availability:</strong> {request.availability_note}</p> : null}

                          {request.status === "pending" ? (
                            <div style={{ width: "100%", maxWidth: 460, display: "grid", gap: "0.65rem" }}>
                              <textarea
                                name="owner_note"
                                form={acceptFormId}
                                rows={2}
                                placeholder="Accepted. Suggested meetup details..."
                                style={{ width: "100%", padding: "0.8rem 0.9rem", borderRadius: 14, border: "1px solid #d7d7d7", resize: "vertical" }}
                              />
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.65rem" }}>
                                <form id={acceptFormId} action={acceptRequestAction}>
                                  <input type="hidden" name="listing_id" value={listing.id} />
                                  <input type="hidden" name="request_id" value={request.id} />
                                  <input type="hidden" name="redirect_to" value="/my-listings?notice=accepted" />
                                  <FormSubmitButton
                                    pendingLabel="Accepting..."
                                    style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: 14, border: 0, background: "#1f7a36", color: "#ffffff", fontWeight: 700 }}
                                  >
                                    Accept
                                  </FormSubmitButton>
                                </form>
                                <form action={declineRequestAction}>
                                  <input type="hidden" name="listing_id" value={listing.id} />
                                  <input type="hidden" name="request_id" value={request.id} />
                                  <input type="hidden" name="redirect_to" value="/my-listings?notice=declined" />
                                  <FormSubmitButton
                                    pendingLabel="Declining..."
                                    style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: 14, border: 0, background: "#b9382f", color: "#ffffff", fontWeight: 700 }}
                                  >
                                    Decline
                                  </FormSubmitButton>
                                </form>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </section>
                ) : null}
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
