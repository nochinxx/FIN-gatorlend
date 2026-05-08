import Link from "next/link";

import { listCurrentUserListings } from "@/lib/marketplace/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function MyListingsPage() {
  const listings = await listCurrentUserListings();

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12 }}>
            My listings
          </p>
          <h1 style={{ marginBottom: "0.5rem", fontSize: "clamp(2rem, 5vw, 3rem)" }}>Your marketplace items</h1>
          <p style={{ margin: 0, color: "#4f4f4f", lineHeight: 1.6 }}>
            Review the listings you own, track their current status, and jump into pending requests
            from the detail page.
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

      <section style={{ marginTop: "2rem", display: "grid", gap: "1rem" }}>
        {listings.length === 0 ? (
          <article style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff" }}>
            <p style={{ margin: 0 }}>You have not created any listings yet.</p>
          </article>
        ) : (
          listings.map(({ listing, pendingRequestCount }) => (
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
                  <p style={{ margin: 0 }}><strong>Mock asset ID:</strong> {listing.mock_token_id ?? "Not assigned"}</p>
                </div>
              </div>

              <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href={`/listings/${listing.id}`} style={{ color: "#111111", fontWeight: 700, textDecoration: "none" }}>
                  View listing detail
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
