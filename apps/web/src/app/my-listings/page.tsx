import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";

import { listProfilesByIds } from "@/lib/auth/profile";
import { getProfileIdentityLabel } from "@/lib/auth/profile-schema";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { formatMarketplaceAssetTypeLabel } from "@/lib/marketplace/assetTypes";
import { PUBLIC_LISTING_TYPE_LABELS } from "@/lib/marketplace/publicOptions";
import { getListingCardImageUrl } from "@/lib/marketplace/listingImages";
import {
  listCurrentUserListings,
  listListingImagesByListingIds,
  listRequestsReceived
} from "@/lib/marketplace/server";

import {
  acceptRequestAction,
  declineRequestAction
} from "../listings/[id]/actions";
import { deleteListingAction } from "./actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function ListingThumbPlaceholder() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        color: "#6a6a6a"
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 7h8" />
        <path d="M9 4h6l1 3H8l1-3Z" />
        <path d="M6 7h12l-1 11H7L6 7Z" />
      </svg>
    </div>
  );
}

type MyListingsPageProps = {
  searchParams: Promise<{
    notice?: string;
    error?: string;
  }>;
};

function formatRequestTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString();
}

export default async function MyListingsPage({ searchParams }: MyListingsPageProps) {
  const resolvedSearchParams = await searchParams;
  const [listings, receivedRequests] = await Promise.all([
    listCurrentUserListings(),
    listRequestsReceived()
  ]);
  const listingImages = await listListingImagesByListingIds(
    listings.flatMap(({ listing }) => (listing.id ? [listing.id] : []))
  );
  const requesterProfiles = await listProfilesByIds([
    ...new Set(receivedRequests.map((item) => item.request.requester_user_id))
  ]);
  const requesterProfilesById = new Map(requesterProfiles.map((profile) => [profile.id, profile]));
  const requestsByListingId = new Map<string, typeof receivedRequests>();
  const listingImagesById = new Map<string, typeof listingImages>();

  for (const item of receivedRequests) {
    if (!item.listing.id) {
      continue;
    }

    const currentItems = requestsByListingId.get(item.listing.id) ?? [];
    currentItems.push(item);
    requestsByListingId.set(item.listing.id, currentItems);
  }

  for (const image of listingImages) {
    const currentImages = listingImagesById.get(image.listing_id) ?? [];
    currentImages.push(image);
    listingImagesById.set(image.listing_id, currentImages);
  }

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12 }}>
            My listings
          </p>
          <h1 style={{ marginBottom: "0.5rem", fontSize: "clamp(2rem, 5vw, 3rem)" }}>Manage your listing table</h1>
          <p style={{ margin: 0, color: "#4f4f4f", lineHeight: 1.6 }}>
            Track status, review the request queue, accept or decline inline, and remove listings
            that should no longer appear in the marketplace.
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

      <section style={{ marginTop: "2rem" }}>
        {listings.length === 0 ? (
          <article style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff" }}>
            <p style={{ margin: 0 }}>You have not created any listings yet.</p>
          </article>
        ) : (
          <div style={{ overflowX: "auto", border: "1px solid #ebebeb", borderRadius: 22, background: "#ffffff" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
              <thead>
                <tr style={{ background: "#fafafa", textAlign: "left" }}>
                  <th style={{ padding: "0.95rem 1rem", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666666" }}>Item</th>
                  <th style={{ padding: "0.95rem 1rem", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666666" }}>Type</th>
                  <th style={{ padding: "0.95rem 1rem", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666666" }}>Status</th>
                  <th style={{ padding: "0.95rem 1rem", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666666" }}>Pending</th>
                  <th style={{ padding: "0.95rem 1rem", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666666" }}>Record</th>
                  <th style={{ padding: "0.95rem 1rem", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666666" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map(({ listing, pendingRequestCount }) => {
                  const listingRequests = requestsByListingId.get(listing.id!) ?? [];
                  const imageSrc = getListingCardImageUrl(listing, listingImagesById.get(listing.id!));

                  return (
                    <Fragment key={listing.id}>
                      <tr style={{ borderTop: "1px solid #f0f0f0", verticalAlign: "top" }}>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "56px minmax(0, 1fr)", gap: "0.8rem", alignItems: "start" }}>
                            <div style={{ width: 56, height: 56, overflow: "hidden", borderRadius: 12, border: "1px solid #ececec", background: "#f7f7f7", position: "relative" }}>
                              {imageSrc ? (
                                <Image
                                  src={imageSrc}
                                  alt={listing.title}
                                  fill
                                  sizes="56px"
                                  style={{
                                    objectFit: imageSrc.includes("calculator") ? "contain" : "cover",
                                    objectPosition: "center",
                                    padding: imageSrc.includes("calculator") ? "0.35rem" : 0
                                  }}
                                />
                              ) : (
                                <ListingThumbPlaceholder />
                              )}
                            </div>
                            <div style={{ display: "grid", gap: "0.35rem" }}>
                              <strong style={{ fontSize: "1rem" }}>{listing.title}</strong>
                              <span style={{ color: "#4f4f4f", lineHeight: 1.5 }}>
                                {listing.description || "No description added yet."}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "1rem", color: "#333333" }}>
                          <div style={{ display: "grid", gap: "0.2rem" }}>
                            <span>{formatMarketplaceAssetTypeLabel(listing.asset_type)}</span>
                            <span style={{ color: "#666666", textTransform: "capitalize" }}>
                              {PUBLIC_LISTING_TYPE_LABELS[listing.listing_type as keyof typeof PUBLIC_LISTING_TYPE_LABELS] ?? listing.listing_type.replaceAll("_", " ")}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <span style={{ padding: "0.35rem 0.65rem", borderRadius: 999, background: "#f3f3f3", textTransform: "capitalize" }}>
                            {listing.status}
                          </span>
                        </td>
                        <td style={{ padding: "1rem", fontWeight: 700 }}>{pendingRequestCount}</td>
                        <td style={{ padding: "1rem", fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 14 }}>
                          {listing.mock_token_id ?? "Not assigned"}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "grid", gap: "0.6rem", minWidth: 170 }}>
                            <Link href={`/listings/${listing.id}`} style={{ color: "#111111", fontWeight: 700, textDecoration: "none" }}>
                              View detail
                            </Link>
                            <form action={deleteListingAction}>
                              <input type="hidden" name="listing_id" value={listing.id} />
                              <FormSubmitButton
                                pendingLabel="Deleting..."
                                style={{ width: "100%", padding: "0.75rem 0.9rem", borderRadius: 12, border: 0, background: "#111111", color: "#ffffff", fontWeight: 700 }}
                              >
                                Delete listing
                              </FormSubmitButton>
                            </form>
                          </div>
                        </td>
                      </tr>

                      <tr style={{ borderTop: "1px solid #f5f5f5", background: "#fcfcfc" }}>
                        <td colSpan={6} style={{ padding: "1rem" }}>
                          <div style={{ display: "grid", gap: "0.9rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                              <strong>Request queue</strong>
                              <span style={{ color: "#666666", fontSize: 14 }}>
                                Oldest request appears first.
                              </span>
                            </div>

                            {listingRequests.length === 0 ? (
                              <p style={{ margin: 0, color: "#5a5a5a" }}>No requests for this listing yet.</p>
                            ) : (
                              listingRequests.map((item) => {
                                const { request } = item;
                                const acceptFormId = `my-listing-accept-${request.id}`;

                                return (
                                  <div
                                    key={request.id}
                                    style={{
                                      padding: "1rem",
                                      borderRadius: 16,
                                      border: "1px solid #ececec",
                                      background: "#ffffff",
                                      display: "grid",
                                      gap: "0.55rem"
                                    }}
                                  >
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.55rem 1rem" }}>
                                      <p style={{ margin: 0 }}><strong>Requester:</strong> {getProfileIdentityLabel(requesterProfilesById.get(request.requester_user_id))}</p>
                                      <p style={{ margin: 0 }}><strong>Status:</strong> {request.status}</p>
                                      {request.message ? <p style={{ margin: 0 }}><strong>Message:</strong> {request.message}</p> : null}
                                      {request.handoff_location ? <p style={{ margin: 0 }}><strong>Handoff:</strong> {request.handoff_location}</p> : null}
                                      {request.availability_note ? <p style={{ margin: 0 }}><strong>Availability:</strong> {request.availability_note}</p> : null}
                                      <p style={{ margin: 0, color: "#5a5a5a", fontSize: 14 }}>
                                        <strong>Requested:</strong> {formatRequestTime(request.requested_at) ?? "Pending"}
                                      </p>
                                    </div>

                                    {request.status === "pending" ? (
                                      <div style={{ width: "100%", maxWidth: 520, display: "grid", gap: "0.65rem" }}>
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
                              })
                            )}
                          </div>
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
