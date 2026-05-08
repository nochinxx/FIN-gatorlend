import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { listProfilesByIds } from "@/lib/auth/profile";
import { getProfileIdentityLabel } from "@/lib/auth/profile-schema";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { formatMarketplaceAssetTypeLabel } from "@/lib/marketplace/assetTypes";
import { PUBLIC_LISTING_TYPE_LABELS } from "@/lib/marketplace/publicOptions";
import { getListingDetailImageUrls } from "@/lib/marketplace/listingImages";
import {
  getListingImages,
  getListingRequestsForUser,
  getMarketplaceListingById,
  getMarketplaceProfile,
  requireMarketplaceUser
} from "@/lib/marketplace/server";

import {
  acceptRequestAction,
  cancelRequestAction,
  completeTransferAction,
  declineRequestAction,
  requestListingAction,
  uploadListingImagesAction
} from "./actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function ListingImagePlaceholder() {
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
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 7h8" />
        <path d="M9 4h6l1 3H8l1-3Z" />
        <path d="M6 7h12l-1 11H7L6 7Z" />
        <path d="M10 11v3" />
        <path d="M14 11v3" />
      </svg>
    </div>
  );
}

function formatTokenizationStatus(status: string) {
  if (status === "mock_tokenized") {
    return "Not minted on-chain";
  }

  if (status === "xrpl_testnet_minted" || status === "verified_on_chain") {
    return "Minted on XRPL";
  }

  return status.replaceAll("_", " ");
}

function formatRequestTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString();
}

type ListingDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    notice?: string;
    error?: string;
  }>;
};

export default async function ListingDetailPage({ params, searchParams }: ListingDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const listing = await getMarketplaceListingById(id);

  if (!listing) {
    notFound();
  }

  const currentUser = await requireMarketplaceUser();
  const ownerProfile = await getMarketplaceProfile(listing.owner_user_id);
  const listingImages = await getListingImages(listing.id!);
  const imageUrls = getListingDetailImageUrls(listing, listingImages);
  const [coverImage, ...galleryImages] = imageUrls;
  const requests = await getListingRequestsForUser(listing.id!);
  const requesterProfiles = await listProfilesByIds([
    ...new Set(requests.map((request) => request.requester_user_id))
  ]);
  const requesterProfilesById = new Map(requesterProfiles.map((profile) => [profile.id, profile]));
  const isOwner = currentUser.id === listing.owner_user_id;
  const relatedRequest = requests.find((request) => request.requester_user_id === currentUser.id);

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12 }}>
            Marketplace listing
          </p>
          <h1 style={{ marginBottom: "0.5rem", fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>{listing.title}</h1>
          <p style={{ maxWidth: 720, lineHeight: 1.6 }}>
            This page tracks the live marketplace procedure for one listing: request, accept,
            confirm the handoff, then complete the transfer inside the app. XRPL remains optional
            and appears only when a token exists.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <Link href="/marketplace" style={{ color: "#17331d" }}>
            Marketplace
          </Link>
          <Link href="/listings/new" style={{ color: "#17331d" }}>
            Create listing
          </Link>
        </div>
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

      <section
        style={{
          marginTop: "2rem",
          display: "grid",
          gridTemplateColumns: "minmax(240px, 300px) minmax(0, 1fr)",
          gap: "1.5rem"
        }}
      >
        <div style={{ display: "grid", gap: "0.85rem" }}>
          <div style={{ overflow: "hidden", borderRadius: 20, border: "1px solid #ebebeb", position: "relative", aspectRatio: "4 / 5", background: "#f7f7f7" }}>
            {coverImage ? (
              <Image
                src={coverImage}
                alt={listing.title}
                fill
                sizes="300px"
                style={{
                  objectFit: coverImage.includes("calculator") ? "contain" : "cover",
                  objectPosition: "center",
                  padding: coverImage.includes("calculator") ? "1rem" : 0
                }}
              />
            ) : (
              <ListingImagePlaceholder />
            )}
          </div>

          {galleryImages.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.65rem" }}>
              {galleryImages.map((imageUrl, index) => (
                <div
                  key={`${imageUrl}-${index}`}
                  style={{
                    overflow: "hidden",
                    borderRadius: 16,
                    border: "1px solid #ebebeb",
                    position: "relative",
                    aspectRatio: "1 / 1",
                    background: "#f7f7f7"
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt={`${listing.title} photo ${index + 2}`}
                    fill
                    sizes="120px"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div style={{ display: "grid", gap: "1rem" }}>
          {isOwner ? (
            <article style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff" }}>
              <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Manage listing photos</h2>
              <p style={{ margin: "0.35rem 0 1rem", color: "#4a4a4a", lineHeight: 1.6 }}>
                Add up to 5 total photos. Clear photos help other students understand condition before requesting.
              </p>
              <form action={uploadListingImagesAction} style={{ display: "grid", gap: "0.85rem" }}>
                <input type="hidden" name="listing_id" value={listing.id} />
                <label style={{ display: "grid", gap: "0.35rem" }}>
                  <span>Add more photos</span>
                  <input
                    type="file"
                    name="images"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    style={{ padding: "0.85rem", borderRadius: 12, border: "1px solid #d7d7d7" }}
                  />
                </label>
                <p style={{ margin: 0, padding: "0.85rem 1rem", borderRadius: 12, background: "#fff8ea", color: "#6a4c00" }}>
                  Only upload photos of the item. Do not upload IDs, personal documents, faces, private information, or anything sensitive.
                </p>
                <FormSubmitButton
                  pendingLabel="Uploading..."
                  style={{ width: "fit-content", padding: "0.85rem 1rem", borderRadius: 999, border: 0, background: "#111111", color: "#ffffff", fontWeight: 700 }}
                >
                  Upload photos
                </FormSubmitButton>
              </form>
            </article>
          ) : null}

          <article style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff" }}>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ padding: "0.4rem 0.7rem", borderRadius: 999, background: "#f3f3f3" }}>
                {formatMarketplaceAssetTypeLabel(listing.asset_type)}
              </span>
              <span style={{ padding: "0.4rem 0.7rem", borderRadius: 999, background: "#f3f3f3" }}>
                {PUBLIC_LISTING_TYPE_LABELS[listing.listing_type as keyof typeof PUBLIC_LISTING_TYPE_LABELS] ?? listing.listing_type.replaceAll("_", " ")}
              </span>
              <span style={{ padding: "0.4rem 0.7rem", borderRadius: 999, background: listing.xrpl_token_id ? "#edf4ff" : "#f3f3f3", color: listing.xrpl_token_id ? "#234f95" : "#444444" }}>
                {listing.xrpl_token_id ? "Minted on XRPL" : "Not minted on-chain"}
              </span>
            </div>

            <div style={{ marginTop: "1rem", display: "grid", gap: "0.5rem" }}>
              <p style={{ margin: 0 }}><strong>Owner:</strong> {getProfileIdentityLabel(ownerProfile)}</p>
              <p style={{ margin: 0 }}><strong>Status:</strong> {listing.status}</p>
              <p style={{ margin: 0 }}><strong>Tokenization:</strong> {formatTokenizationStatus(listing.tokenization_status)}</p>
              <p style={{ margin: 0 }}><strong>Record ID:</strong> {listing.mock_token_id ?? "Not assigned"}</p>
              <p style={{ margin: 0 }}><strong>XRPL token ID:</strong> {listing.xrpl_token_id ?? "Not minted"}</p>
              {listing.owner_wallet ? (
                <p style={{ margin: 0 }}><strong>Wallet:</strong> {listing.owner_wallet}</p>
              ) : null}
              <p style={{ margin: 0 }}><strong>Exchange preferences:</strong> {listing.payment_methods?.join(", ") || "Flexible"}</p>
              <p style={{ margin: 0 }}><strong>Condition:</strong> {listing.condition || "Not specified"}</p>
            </div>

            {listing.description ? (
              <p style={{ margin: "1rem 0 0", color: "#4a4a4a", lineHeight: 1.6 }}>{listing.description}</p>
            ) : null}
          </article>

          <article style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff" }}>
            <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>How this transfer works</h2>
            <div style={{ display: "grid", gap: "0.45rem", color: "#4f4f4f" }}>
              <p style={{ margin: 0 }}>1. A verified user requests this listing.</p>
              <p style={{ margin: 0 }}>2. The owner accepts or declines.</p>
              <p style={{ margin: 0 }}>3. The users confirm the handoff outside the app.</p>
              <p style={{ margin: 0 }}>4. The owner completes the transfer to update marketplace ownership.</p>
            </div>
          </article>

          {!isOwner ? (
            <article id="request-form" style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff", scrollMarginTop: "6rem" }}>
              <h2 style={{ marginTop: 0 }}>Request this listing</h2>
              {relatedRequest ? (
                <div style={{ display: "grid", gap: "0.6rem", color: "#4a4a4a" }}>
                  <p style={{ margin: 0 }}>
                    Your current request status: <strong>{relatedRequest.status}</strong>
                  </p>
                  {relatedRequest.message ? <p style={{ margin: 0 }}><strong>Your message:</strong> {relatedRequest.message}</p> : null}
                  {relatedRequest.handoff_location ? <p style={{ margin: 0 }}><strong>Preferred handoff:</strong> {relatedRequest.handoff_location}</p> : null}
                  {relatedRequest.availability_note ? <p style={{ margin: 0 }}><strong>Availability:</strong> {relatedRequest.availability_note}</p> : null}
                  {relatedRequest.owner_note ? <p style={{ margin: 0 }}><strong>Owner response:</strong> {relatedRequest.owner_note}</p> : null}
                  <div style={{ display: "grid", gap: "0.35rem", fontSize: 14 }}>
                    <span>Requested: {formatRequestTime(relatedRequest.requested_at) ?? "Pending"}</span>
                    {relatedRequest.accepted_at ? <span>Accepted: {formatRequestTime(relatedRequest.accepted_at)}</span> : null}
                    {relatedRequest.completed_at ? <span>Completed: {formatRequestTime(relatedRequest.completed_at)}</span> : null}
                  </div>
                  {relatedRequest.status === "pending" ? (
                    <form action={cancelRequestAction}>
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <input type="hidden" name="request_id" value={relatedRequest.id} />
                      <input type="hidden" name="redirect_to" value={`/listings/${listing.id}?notice=cancelled`} />
                      <FormSubmitButton
                        pendingLabel="Cancelling..."
                        style={{ width: "fit-content", padding: "0.85rem 1rem", borderRadius: 999, border: "1px solid #d7d7d7", background: "#ffffff", color: "#111111", fontWeight: 700 }}
                      >
                        Cancel request
                      </FormSubmitButton>
                    </form>
                  ) : null}
                </div>
              ) : (
                <form action={requestListingAction} style={{ display: "grid", gap: "0.85rem" }}>
                  <input type="hidden" name="listing_id" value={listing.id} />
                  <input type="hidden" name="redirect_to" value={`/listings/${listing.id}?notice=requested`} />
                  <label style={{ display: "grid", gap: "0.35rem" }}>
                    <span>Message</span>
                    <textarea name="message" rows={3} style={{ padding: "0.85rem", borderRadius: 12, border: "1px solid #d7d7d7" }} />
                  </label>
                  <label style={{ display: "grid", gap: "0.35rem" }}>
                    <span>Preferred handoff location</span>
                    <input name="handoff_location" style={{ padding: "0.85rem", borderRadius: 12, border: "1px solid #d7d7d7" }} />
                  </label>
                  <label style={{ display: "grid", gap: "0.35rem" }}>
                    <span>Availability note</span>
                    <input name="availability_note" placeholder="Weekday afternoon, library area" style={{ padding: "0.85rem", borderRadius: 12, border: "1px solid #d7d7d7" }} />
                  </label>
                  <label style={{ display: "grid", gap: "0.35rem" }}>
                    <span>Exchange note</span>
                    <input name="payment_method" style={{ padding: "0.85rem", borderRadius: 12, border: "1px solid #d7d7d7" }} />
                  </label>
                  <FormSubmitButton
                    pendingLabel="Sending request..."
                    style={{ width: "fit-content", padding: "0.85rem 1rem", borderRadius: 999, border: 0, background: "#17331d", color: "#ffffff", fontWeight: 700 }}
                  >
                    Send request
                  </FormSubmitButton>
                </form>
              )}
            </article>
          ) : null}
        </div>
      </section>

      {isOwner ? (
        <section style={{ marginTop: "1.5rem", display: "grid", gap: "1rem" }}>
          <h2 style={{ marginBottom: 0 }}>Requests</h2>
          {requests.length === 0 ? (
            <article style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff" }}>
              <p style={{ margin: 0 }}>No requests yet.</p>
            </article>
          ) : (
            requests.map((request) => {
              const acceptFormId = `listing-accept-request-${request.id}`;
              const declineFormId = `listing-decline-request-${request.id}`;

              return (
                <article key={request.id} style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  <div>
                    <p style={{ margin: 0 }}><strong>Requester:</strong> {getProfileIdentityLabel(requesterProfilesById.get(request.requester_user_id))}</p>
                    <p style={{ margin: "0.35rem 0 0" }}><strong>Status:</strong> {request.status}</p>
                    {request.message ? <p style={{ margin: "0.35rem 0 0" }}><strong>Message:</strong> {request.message}</p> : null}
                    {request.handoff_location ? <p style={{ margin: "0.35rem 0 0" }}><strong>Preferred handoff:</strong> {request.handoff_location}</p> : null}
                    {request.availability_note ? <p style={{ margin: "0.35rem 0 0" }}><strong>Availability:</strong> {request.availability_note}</p> : null}
                    {request.owner_note ? <p style={{ margin: "0.35rem 0 0" }}><strong>Owner response:</strong> {request.owner_note}</p> : null}
                    {request.payment_method ? <p style={{ margin: "0.35rem 0 0" }}><strong>Exchange note:</strong> {request.payment_method}</p> : null}
                    <p style={{ margin: "0.35rem 0 0", fontSize: 14, color: "#5a5a5a" }}>
                      Requested: {formatRequestTime(request.requested_at) ?? "Pending"}
                      {request.accepted_at ? ` · Accepted: ${formatRequestTime(request.accepted_at)}` : ""}
                      {request.completed_at ? ` · Completed: ${formatRequestTime(request.completed_at)}` : ""}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    {request.status === "pending" ? (
                      <div style={{ width: "100%", maxWidth: 420, display: "grid", gap: "0.65rem" }}>
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
                            <input type="hidden" name="redirect_to" value={`/listings/${listing.id}?notice=accepted`} />
                            <FormSubmitButton
                              pendingLabel="Accepting..."
                              style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: 14, border: 0, background: "#1f7a36", color: "#ffffff", fontWeight: 700 }}
                            >
                              Accept
                            </FormSubmitButton>
                          </form>
                          <form id={declineFormId} action={declineRequestAction}>
                            <input type="hidden" name="listing_id" value={listing.id} />
                            <input type="hidden" name="request_id" value={request.id} />
                            <input type="hidden" name="redirect_to" value={`/listings/${listing.id}?notice=declined`} />
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

                    {request.status === "accepted" ? (
                      <div style={{ display: "grid", gap: "0.5rem" }}>
                        <p style={{ margin: 0, maxWidth: 280, color: "#4a4a4a" }}>
                          Use completion only after both sides confirm that the handoff is done.
                        </p>
                        <form action={completeTransferAction}>
                          <input type="hidden" name="listing_id" value={listing.id} />
                          <input type="hidden" name="request_id" value={request.id} />
                          <input type="hidden" name="redirect_to" value={`/listings/${listing.id}?notice=completed`} />
                          <FormSubmitButton
                            pendingLabel="Completing..."
                            style={{ padding: "0.75rem 0.95rem", borderRadius: 999, border: 0, background: "#111111", color: "#ffffff", fontWeight: 700 }}
                          >
                            Complete transfer
                          </FormSubmitButton>
                        </form>
                      </div>
                    ) : null}
                  </div>
                </div>
                </article>
              );
            })
          )}
        </section>
      ) : null}
    </main>
  );
}
