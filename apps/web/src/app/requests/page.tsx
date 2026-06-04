import Image from "next/image";
import Link from "next/link";

import { listProfilesByIds } from "@/lib/auth/profile";
import { getProfileIdentityLabel } from "@/lib/auth/profile-schema";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { formatMarketplaceAssetTypeLabel } from "@/lib/marketplace/assetTypes";
import { PUBLIC_LISTING_TYPE_LABELS } from "@/lib/marketplace/publicOptions";
import { type MarketplaceRequestSummary, listRequestsReceived, listRequestsSent } from "@/lib/marketplace/server";

import {
  acceptRequestAction,
  cancelRequestAction,
  confirmHandoffAction,
  confirmReceiptAction,
  declineRequestAction,
  dismissRequestAction
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
      style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#555555" }}
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
  if (!value) return null;
  return new Date(value).toLocaleString();
}

const TERMINAL_STATUSES = new Set(["completed", "declined", "cancelled", "disputed"]);

const textareaStyle = {
  width: "100%",
  padding: "0.8rem 0.9rem",
  borderRadius: 14,
  border: "1px solid #2a2a2a",
  background: "#141414",
  color: "#e5e5e5",
  resize: "vertical" as const
};

type RequestCardActionsProps = {
  listing: MarketplaceRequestSummary["listing"];
  request: MarketplaceRequestSummary["request"];
  mode: "received" | "sent";
};

function RequestCardActions({ listing, request, mode }: RequestCardActionsProps) {
  const acceptFormId = `accept-request-${request.id}`;
  const declineFormId = `decline-request-${request.id}`;
  const isTerminal = TERMINAL_STATUSES.has(request.status);

  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
      <Link href={`/listings/${listing.id}`} style={{ color: "#e5e5e5", fontWeight: 700, textDecoration: "none" }}>
        View listing
      </Link>

      {mode === "received" && request.status === "pending" ? (
        <div style={{ width: "100%", maxWidth: 420, display: "grid", gap: "0.65rem" }}>
          <textarea name="owner_note" form={acceptFormId} rows={2} placeholder="Accepted. Suggested meetup details..." style={textareaStyle} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.65rem" }}>
            <form id={acceptFormId} action={acceptRequestAction}>
              <input type="hidden" name="listing_id" value={listing.id} />
              <input type="hidden" name="request_id" value={request.id} />
              <input type="hidden" name="redirect_to" value="/requests?notice=accepted" />
              <FormSubmitButton pendingLabel="Accepting..." style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: 14, border: 0, background: "#1f7a36", color: "#ffffff", fontWeight: 700 }}>
                Accept
              </FormSubmitButton>
            </form>
            <form id={declineFormId} action={declineRequestAction}>
              <input type="hidden" name="listing_id" value={listing.id} />
              <input type="hidden" name="request_id" value={request.id} />
              <input type="hidden" name="redirect_to" value="/requests?notice=declined" />
              <FormSubmitButton pendingLabel="Declining..." style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: 14, border: 0, background: "#b9382f", color: "#ffffff", fontWeight: 700 }}>
                Decline
              </FormSubmitButton>
            </form>
          </div>
        </div>
      ) : null}

      {mode === "received" && request.status === "accepted" ? (
        <form action={confirmHandoffAction}>
          <input type="hidden" name="listing_id" value={listing.id} />
          <input type="hidden" name="request_id" value={request.id} />
          <input type="hidden" name="redirect_to" value="/requests?notice=handoff-confirmed" />
          <FormSubmitButton pendingLabel="Confirming..." style={{ padding: "0.7rem 0.95rem", borderRadius: 999, border: 0, background: "#111111", color: "#ffffff", fontWeight: 700 }}>
            Mark as handed off
          </FormSubmitButton>
        </form>
      ) : null}

      {mode === "sent" && request.status === "handoff_confirmed" ? (
        <form action={confirmReceiptAction}>
          <input type="hidden" name="listing_id" value={listing.id} />
          <input type="hidden" name="request_id" value={request.id} />
          <input type="hidden" name="redirect_to" value="/requests?notice=receipt-confirmed" />
          <FormSubmitButton pendingLabel="Confirming..." style={{ padding: "0.7rem 0.95rem", borderRadius: 999, border: 0, background: "#1f7a36", color: "#ffffff", fontWeight: 700 }}>
            Confirm receipt
          </FormSubmitButton>
        </form>
      ) : null}

      {mode === "sent" && request.status === "pending" ? (
        <form action={cancelRequestAction}>
          <input type="hidden" name="listing_id" value={listing.id} />
          <input type="hidden" name="request_id" value={request.id} />
          <input type="hidden" name="redirect_to" value="/requests?notice=cancelled" />
          <FormSubmitButton pendingLabel="Cancelling..." style={{ padding: "0.7rem 0.95rem", borderRadius: 999, border: "1px solid #2a2a2a", background: "#141414", color: "#e5e5e5", fontWeight: 700 }}>
            Cancel request
          </FormSubmitButton>
        </form>
      ) : null}

      {isTerminal ? (
        <form action={dismissRequestAction}>
          <input type="hidden" name="listing_id" value={listing.id} />
          <input type="hidden" name="request_id" value={request.id} />
          <input type="hidden" name="redirect_to" value="/requests?notice=dismissed" />
          <FormSubmitButton pendingLabel="Dismissing..." style={{ padding: "0.7rem 0.95rem", borderRadius: 999, border: "none", background: "transparent", color: "#666666", fontWeight: 400, fontSize: 14 }}>
            Dismiss
          </FormSubmitButton>
        </form>
      ) : null}
    </div>
  );
}

type RequestCardProps = {
  item: MarketplaceRequestSummary;
  counterpartLabel: string;
  counterpartTitle: string;
  mode: "received" | "sent";
};

function RequestCard({ item, counterpartLabel, counterpartTitle, mode }: RequestCardProps) {
  const { listing, request, listingImageUrl } = item;

  return (
    <article style={{ padding: "1.25rem", borderRadius: 20, border: "1px solid #242424", background: "#111111" }}>
      <div style={{ display: "grid", gridTemplateColumns: "96px minmax(0, 1fr)", gap: "1rem" }}>
        <div
          style={{
            overflow: "hidden",
            borderRadius: 16,
            border: "1px solid #242424",
            background: "#1a1a1a",
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
              <p style={{ margin: 0, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888888" }}>
                {formatMarketplaceAssetTypeLabel(listing.asset_type)} · {PUBLIC_LISTING_TYPE_LABELS[listing.listing_type as keyof typeof PUBLIC_LISTING_TYPE_LABELS] ?? listing.listing_type.replaceAll("_", " ")}
              </p>
              <h2 style={{ margin: "0.3rem 0 0", fontSize: "1.1rem" }}>{listing.title}</h2>
            </div>
            <span style={{ padding: "0.4rem 0.7rem", borderRadius: 999, background: "rgba(255,255,255,0.08)", color: "#aaaaaa", height: "fit-content", textTransform: "capitalize" }}>
              {request.status}
            </span>
          </div>

          <p style={{ margin: 0 }}><strong>{counterpartTitle}:</strong> {counterpartLabel}</p>
          {request.message ? <p style={{ margin: 0 }}><strong>Requester message:</strong> {request.message}</p> : null}
          {request.handoff_location ? <p style={{ margin: 0 }}><strong>Preferred handoff:</strong> {request.handoff_location}</p> : null}
          {request.availability_note ? <p style={{ margin: 0 }}><strong>Availability:</strong> {request.availability_note}</p> : null}
          {request.owner_note ? <p style={{ margin: 0 }}><strong>Owner response:</strong> {request.owner_note}</p> : null}
          {request.payment_method ? <p style={{ margin: 0 }}><strong>Exchange note:</strong> {request.payment_method}</p> : null}
          <p style={{ margin: 0, color: "#9a9a9a", fontSize: 14 }}>
            Requested: {formatRequestTime(request.requested_at) ?? "Pending"}
            {request.accepted_at ? ` · Accepted: ${formatRequestTime(request.accepted_at)}` : ""}
            {request.completed_at ? ` · Completed: ${formatRequestTime(request.completed_at)}` : ""}
          </p>

          <RequestCardActions listing={listing} request={request} mode={mode} />
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
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12, color: "#777777" }}>
            Requests
          </p>
          <h1 style={{ marginBottom: "0.5rem", fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>Manage listing requests</h1>
          <p style={{ maxWidth: 720, lineHeight: 1.6, color: "#9a9a9a" }}>
            Review requests you received and requests you sent, keep handoff details structured,
            and complete marketplace transfers without adding chat or notifications yet.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <Link href="/marketplace" style={{ color: "#4ade80" }}>Marketplace</Link>
          <Link href="/my-listings" style={{ color: "#4ade80" }}>My Listings</Link>
        </div>
      </div>

      {resolvedSearchParams.notice ? (
        <p style={{ marginTop: "1.5rem", padding: "0.9rem 1rem", borderRadius: 12, background: "rgba(34,197,94,0.12)", color: "#86efac" }}>
          {{
            accepted: "Request accepted.",
            declined: "Request declined.",
            cancelled: "Request cancelled.",
            dismissed: "Request dismissed.",
            "handoff-confirmed": "Handoff confirmed — waiting for the requester to confirm receipt.",
            "receipt-confirmed": "Receipt confirmed. Ownership has been transferred."
          }[resolvedSearchParams.notice] ?? `Action completed: ${resolvedSearchParams.notice}`}
        </p>
      ) : null}

      {resolvedSearchParams.error ? (
        <p style={{ marginTop: "1.5rem", padding: "0.9rem 1rem", borderRadius: 12, background: "rgba(239,68,68,0.12)", color: "#fca5a5" }}>
          {resolvedSearchParams.error}
        </p>
      ) : null}

      <section style={{ marginTop: "2rem", display: "grid", gap: "1rem" }}>
        <div>
          <h2 style={{ marginBottom: "0.35rem" }}>Requests I received</h2>
          <p style={{ margin: 0, color: "#9a9a9a" }}>Requests from other students on listings you own.</p>
        </div>
        {receivedRequests.length === 0 ? (
          <article style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #242424", background: "#111111" }}>
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
          <p style={{ margin: 0, color: "#9a9a9a" }}>Track your outgoing requests and see owner responses clearly.</p>
        </div>
        {sentRequests.length === 0 ? (
          <article style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #242424", background: "#111111" }}>
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
