import Image from "next/image";
import Link from "next/link";

import { listProfilesByIds } from "@/lib/auth/profile";
import { getProfileIdentityLabel } from "@/lib/auth/profile-schema";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { type MarketplaceRequestSummary, listRequestsReceived, listRequestsSent } from "@/lib/marketplace/server";

import {
  acceptRequestAction,
  cancelRequestAction,
  completeTransferAction,
  declineRequestAction
} from "../listings/[id]/actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RequestsPageProps = {
  searchParams: Promise<{
    notice?: string;
    error?: string;
  }>;
};

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
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 7h8" />
        <path d="M9 4h6l1 3H8l1-3Z" />
        <path d="M6 7h12l-1 11H7L6 7Z" />
      </svg>
    </div>
  );
}

function formatRequestTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString();
}

type RequestCardProps = {
  item: MarketplaceRequestSummary;
  counterpartLabel: string;
  counterpartTitle: string;
  mode: "received" | "sent";
};

function RequestCard({ item, counterpartLabel, counterpartTitle, mode }: RequestCardProps) {
  const { listing, request, listingImageUrl } = item;
  const acceptFormId = `accept-request-${request.id}`;
  const declineFormId = `decline-request-${request.id}`;

  return (
    <article style={{ padding: "1.25rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff" }}>
      <div style={{ display: "grid", gridTemplateColumns: "96px minmax(0, 1fr)", gap: "1rem" }}>
        <div
          style={{
            overflow: "hidden",
            borderRadius: 16,
            border: "1px solid #efefef",
            background: "#f7f7f7",
            aspectRatio: "1 / 1",
            position: "relative"
          }}
        >
          {listingImageUrl ? (
            <Image
              src={listingImageUrl}
              alt={listing.title}
              fill
              sizes="96px"
              style={{ objectFit: listingImageUrl.includes("calculator") ? "contain" : "cover", objectPosition: "center", padding: listingImageUrl.includes("calculator") ? "0.5rem" : 0 }}
            />
          ) : (
            <ListingImagePlaceholder />
          )}
        </div>

        <div style={{ display: "grid", gap: "0.45rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666666" }}>
                {listing.asset_type} · {listing.listing_type}
              </p>
              <h2 style={{ margin: "0.3rem 0 0", fontSize: "1.1rem" }}>{listing.title}</h2>
            </div>
            <span style={{ padding: "0.4rem 0.7rem", borderRadius: 999, background: "#f3f3f3", color: "#444444", height: "fit-content", textTransform: "capitalize" }}>
              {request.status}
            </span>
          </div>

          <p style={{ margin: 0 }}><strong>{counterpartTitle}:</strong> {counterpartLabel}</p>
          {request.message ? <p style={{ margin: 0 }}><strong>Requester message:</strong> {request.message}</p> : null}
          {request.handoff_location ? <p style={{ margin: 0 }}><strong>Preferred handoff:</strong> {request.handoff_location}</p> : null}
          {request.availability_note ? <p style={{ margin: 0 }}><strong>Availability:</strong> {request.availability_note}</p> : null}
          {request.owner_note ? <p style={{ margin: 0 }}><strong>Owner response:</strong> {request.owner_note}</p> : null}
          {request.payment_method ? <p style={{ margin: 0 }}><strong>Exchange note:</strong> {request.payment_method}</p> : null}
          <p style={{ margin: 0, color: "#5a5a5a", fontSize: 14 }}>
            Requested: {formatRequestTime(request.requested_at) ?? "Pending"}
            {request.accepted_at ? ` · Accepted: ${formatRequestTime(request.accepted_at)}` : ""}
            {request.completed_at ? ` · Completed: ${formatRequestTime(request.completed_at)}` : ""}
          </p>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
            <Link href={`/listings/${listing.id}`} style={{ color: "#111111", fontWeight: 700, textDecoration: "none" }}>
              View listing
            </Link>

            {mode === "received" && request.status === "pending" ? (
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
                    <input type="hidden" name="redirect_to" value="/requests?notice=accepted" />
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
                    <input type="hidden" name="redirect_to" value="/requests?notice=declined" />
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

            {mode === "received" && request.status === "accepted" ? (
              <form action={completeTransferAction}>
                <input type="hidden" name="listing_id" value={listing.id} />
                <input type="hidden" name="request_id" value={request.id} />
                <input type="hidden" name="redirect_to" value="/requests?notice=completed" />
                <FormSubmitButton
                  pendingLabel="Completing..."
                  style={{ padding: "0.7rem 0.95rem", borderRadius: 999, border: 0, background: "#111111", color: "#ffffff", fontWeight: 700 }}
                >
                  Complete transfer
                </FormSubmitButton>
              </form>
            ) : null}

            {mode === "sent" && request.status === "pending" ? (
              <form action={cancelRequestAction}>
                <input type="hidden" name="listing_id" value={listing.id} />
                <input type="hidden" name="request_id" value={request.id} />
                <input type="hidden" name="redirect_to" value="/requests?notice=cancelled" />
                <FormSubmitButton
                  pendingLabel="Cancelling..."
                  style={{ padding: "0.7rem 0.95rem", borderRadius: 999, border: "1px solid #d7d7d7", background: "#ffffff", color: "#111111", fontWeight: 700 }}
                >
                  Cancel request
                </FormSubmitButton>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const resolvedSearchParams = await searchParams;
  const [receivedRequests, sentRequests] = await Promise.all([listRequestsReceived(), listRequestsSent()]);
  const counterpartProfiles = await listProfilesByIds([
    ...new Set([
      ...receivedRequests.map((item) => item.request.requester_user_id),
      ...sentRequests.map((item) => item.request.owner_user_id)
    ])
  ]);
  const profilesById = new Map(counterpartProfiles.map((profile) => [profile.id, profile]));

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12, color: "#666666" }}>
            Requests
          </p>
          <h1 style={{ marginBottom: "0.5rem", fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>Manage listing requests</h1>
          <p style={{ maxWidth: 720, lineHeight: 1.6, color: "#4a4a4a" }}>
            Review requests you received and requests you sent, keep handoff details structured,
            and complete marketplace transfers without adding chat or notifications yet.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <Link href="/marketplace" style={{ color: "#17331d" }}>
            Marketplace
          </Link>
          <Link href="/my-listings" style={{ color: "#17331d" }}>
            My Listings
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

      <section style={{ marginTop: "2rem", display: "grid", gap: "1rem" }}>
        <div>
          <h2 style={{ marginBottom: "0.35rem" }}>Requests I received</h2>
          <p style={{ margin: 0, color: "#4f4f4f" }}>Requests from other students on listings you own.</p>
        </div>
        {receivedRequests.length === 0 ? (
          <article style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff" }}>
            <p style={{ margin: 0 }}>No received requests yet.</p>
          </article>
        ) : (
          receivedRequests.map((item) => (
            <RequestCard
              key={item.request.id}
              item={item}
              counterpartLabel={getProfileIdentityLabel(profilesById.get(item.request.requester_user_id))}
              counterpartTitle="Requester"
              mode="received"
            />
          ))
        )}
      </section>

      <section style={{ marginTop: "2.5rem", display: "grid", gap: "1rem" }}>
        <div>
          <h2 style={{ marginBottom: "0.35rem" }}>Requests I sent</h2>
          <p style={{ margin: 0, color: "#4f4f4f" }}>Track your outgoing requests and see owner responses clearly.</p>
        </div>
        {sentRequests.length === 0 ? (
          <article style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff" }}>
            <p style={{ margin: 0 }}>No sent requests yet.</p>
          </article>
        ) : (
          sentRequests.map((item) => (
            <RequestCard
              key={item.request.id}
              item={item}
              counterpartLabel={getProfileIdentityLabel(profilesById.get(item.request.owner_user_id))}
              counterpartTitle="Owner"
              mode="sent"
            />
          ))
        )}
      </section>
    </main>
  );
}
