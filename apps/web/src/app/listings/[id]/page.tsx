import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import {
  getListingRequestsForUser,
  getMarketplaceListingById,
  getMarketplaceProfile,
  requireMarketplaceUser
} from "@/lib/marketplace/server";

import {
  acceptRequestAction,
  completeTransferAction,
  declineRequestAction,
  requestListingAction
} from "./actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function resolveMarketplaceImage(imageUrl: string | null | undefined) {
  if (typeof imageUrl === "string" && /^\/(?:images|branding)\/.+\.(?:png|jpe?g|webp)$/i.test(imageUrl)) {
    return imageUrl;
  }

  return "/images/textbook.jpg";
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
  const requests = await getListingRequestsForUser(listing.id!);
  const isOwner = currentUser.id === listing.owner_user_id;
  const relatedRequest = requests.find((request) => request.requester_user_id === currentUser.id);
  const imageSrc = resolveMarketplaceImage(listing.image_url);

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
          gridTemplateColumns: "minmax(280px, 340px) minmax(0, 1fr)",
          gap: "1.5rem"
        }}
      >
        <div style={{ overflow: "hidden", borderRadius: 20, border: "1px solid #ebebeb", position: "relative", aspectRatio: "1 / 1", background: "#f7f7f7" }}>
          <Image
            src={imageSrc}
            alt={listing.title}
            fill
            sizes="340px"
            style={{
              objectFit: imageSrc.includes("calculator") ? "contain" : "cover",
              objectPosition: "center",
              padding: imageSrc.includes("calculator") ? "1rem" : 0
            }}
          />
        </div>

        <div style={{ display: "grid", gap: "1rem" }}>
          <article style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff" }}>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ padding: "0.4rem 0.7rem", borderRadius: 999, background: "#f3f3f3" }}>
                {listing.asset_type}
              </span>
              <span style={{ padding: "0.4rem 0.7rem", borderRadius: 999, background: "#f3f3f3" }}>
                {listing.listing_type}
              </span>
              <span style={{ padding: "0.4rem 0.7rem", borderRadius: 999, background: listing.xrpl_token_id ? "#edf4ff" : "#f3f3f3", color: listing.xrpl_token_id ? "#234f95" : "#444444" }}>
                {listing.xrpl_token_id ? "XRPL minted/testnet" : "Mock asset record"}
              </span>
            </div>

            <div style={{ marginTop: "1rem", display: "grid", gap: "0.5rem" }}>
              <p style={{ margin: 0 }}><strong>Owner:</strong> {ownerProfile?.display_name || ownerProfile?.email || "Verified student"}</p>
              <p style={{ margin: 0 }}><strong>Status:</strong> {listing.status}</p>
              <p style={{ margin: 0 }}><strong>Tokenization:</strong> {listing.tokenization_status}</p>
              <p style={{ margin: 0 }}><strong>Mock token:</strong> {listing.mock_token_id ?? "Not assigned"}</p>
              <p style={{ margin: 0 }}><strong>XRPL token:</strong> {listing.xrpl_token_id ?? "Not minted"}</p>
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
              <p style={{ margin: 0 }}>3. The users confirm the handoff outside the pilot.</p>
              <p style={{ margin: 0 }}>4. The owner completes the transfer to update marketplace ownership.</p>
            </div>
          </article>

          {!isOwner ? (
            <article style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff" }}>
              <h2 style={{ marginTop: 0 }}>Request this listing</h2>
              {relatedRequest ? (
                <div style={{ display: "grid", gap: "0.45rem", color: "#4a4a4a" }}>
                  <p style={{ margin: 0 }}>
                    Your current request status: <strong>{relatedRequest.status}</strong>
                  </p>
                  <p style={{ margin: 0 }}>
                    If the owner accepts, coordinate the handoff directly, then wait for the owner to complete the transfer here.
                  </p>
                </div>
              ) : (
                <form action={requestListingAction} style={{ display: "grid", gap: "0.85rem" }}>
                  <input type="hidden" name="listing_id" value={listing.id} />
                  <label style={{ display: "grid", gap: "0.35rem" }}>
                    <span>Message</span>
                    <textarea name="message" rows={3} style={{ padding: "0.85rem", borderRadius: 12, border: "1px solid #d7d7d7" }} />
                  </label>
                  <label style={{ display: "grid", gap: "0.35rem" }}>
                    <span>Exchange note</span>
                    <input name="payment_method" style={{ padding: "0.85rem", borderRadius: 12, border: "1px solid #d7d7d7" }} />
                  </label>
                  <label style={{ display: "grid", gap: "0.35rem" }}>
                    <span>Handoff location</span>
                    <input name="handoff_location" style={{ padding: "0.85rem", borderRadius: 12, border: "1px solid #d7d7d7" }} />
                  </label>
                  <button type="submit" style={{ width: "fit-content", padding: "0.85rem 1rem", borderRadius: 999, border: 0, background: "#111111", color: "#ffffff", fontWeight: 700 }}>
                    Send request
                  </button>
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
            requests.map((request) => (
              <article key={request.id} style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  <div>
                    <p style={{ margin: 0 }}><strong>Requester:</strong> {request.requester_user_id}</p>
                    <p style={{ margin: "0.35rem 0 0" }}><strong>Status:</strong> {request.status}</p>
                    {request.message ? <p style={{ margin: "0.35rem 0 0" }}><strong>Message:</strong> {request.message}</p> : null}
                    {request.payment_method ? <p style={{ margin: "0.35rem 0 0" }}><strong>Exchange note:</strong> {request.payment_method}</p> : null}
                    {request.handoff_location ? <p style={{ margin: "0.35rem 0 0" }}><strong>Handoff:</strong> {request.handoff_location}</p> : null}
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    {request.status === "pending" ? (
                      <>
                        <form action={acceptRequestAction}>
                          <input type="hidden" name="listing_id" value={listing.id} />
                          <input type="hidden" name="request_id" value={request.id} />
                          <button type="submit" style={{ padding: "0.75rem 0.95rem", borderRadius: 999, border: 0, background: "#111111", color: "#ffffff", fontWeight: 700 }}>
                            Accept
                          </button>
                        </form>
                        <form action={declineRequestAction}>
                          <input type="hidden" name="listing_id" value={listing.id} />
                          <input type="hidden" name="request_id" value={request.id} />
                          <button type="submit" style={{ padding: "0.75rem 0.95rem", borderRadius: 999, border: "1px solid #d7d7d7", background: "#ffffff", color: "#111111", fontWeight: 700 }}>
                            Decline
                          </button>
                        </form>
                      </>
                    ) : null}

                    {request.status === "accepted" ? (
                      <div style={{ display: "grid", gap: "0.5rem" }}>
                        <p style={{ margin: 0, maxWidth: 280, color: "#4a4a4a" }}>
                          Use completion only after both sides confirm that the handoff is done.
                        </p>
                        <form action={completeTransferAction}>
                          <input type="hidden" name="listing_id" value={listing.id} />
                          <input type="hidden" name="request_id" value={request.id} />
                          <button type="submit" style={{ padding: "0.75rem 0.95rem", borderRadius: 999, border: 0, background: "#111111", color: "#ffffff", fontWeight: 700 }}>
                            Complete transfer
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      ) : null}
    </main>
  );
}
