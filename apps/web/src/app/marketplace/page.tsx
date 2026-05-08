import Link from "next/link";
import Image from "next/image";

import { listProfilesByIds } from "@/lib/auth/profile";
import { getProfileIdentityLabel } from "@/lib/auth/profile-schema";
import { listMarketplaceListings } from "@/lib/marketplace/server";
import {
  PUBLIC_ASSET_TYPE_LABELS,
  PUBLIC_ASSET_TYPE_OPTIONS,
  PUBLIC_LISTING_TYPE_OPTIONS
} from "@/lib/marketplace/publicOptions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getListingBadge(listing: Awaited<ReturnType<typeof listMarketplaceListings>>[number]) {
  if (listing.xrpl_token_id) {
    return {
      label: "XRPL minted/testnet",
      background: "#edf4ff",
      color: "#234f95"
    };
  }

  return {
    label: "Mock asset record",
    background: "#f3f3f3",
    color: "#444444"
  };
}

function resolveMarketplaceImage(imageUrl: string | null | undefined) {
  if (typeof imageUrl === "string" && /^\/(?:images|branding)\/.+\.(?:png|jpe?g|webp)$/i.test(imageUrl)) {
    return imageUrl;
  }

  return "/images/textbook.jpg";
}

type MarketplacePageProps = {
  searchParams: Promise<{
    asset_type?: string;
    listing_type?: string;
  }>;
};

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const resolvedSearchParams = await searchParams;
  const assetTypeFilter = resolvedSearchParams.asset_type ?? "";
  const listingTypeFilter = resolvedSearchParams.listing_type ?? "";
  const listings = await listMarketplaceListings();
  const ownerProfiles = await listProfilesByIds([
    ...new Set(listings.map((listing) => listing.owner_user_id))
  ]);
  const ownerProfilesById = new Map(ownerProfiles.map((profile) => [profile.id, profile]));
  const filteredListings = listings.filter((listing) => {
    if (assetTypeFilter && listing.asset_type !== assetTypeFilter) {
      return false;
    }

    if (listingTypeFilter && listing.listing_type !== listingTypeFilter) {
      return false;
    }

    return true;
  });

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12, color: "#666666" }}>
            Verified student pilot
          </p>
          <h1 style={{ marginBottom: "0.5rem", fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>Active pilot listings</h1>
          <p style={{ maxWidth: 720, lineHeight: 1.6, color: "#4a4a4a" }}>
            Browse demo listings for common academic items posted by verified school-email users.
            The marketplace flow is listing first: create a record, send a request, confirm the
            handoff, and update ownership inside the app. Wallet usage is optional and not required
            for normal marketplace activity.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <Link href="/listings/new" style={{ color: "#17331d" }}>
            Create Listing
          </Link>
          <Link href="/catalog" style={{ color: "#17331d" }}>
            XRPL Demo
          </Link>
        </div>
      </div>

      <form style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "2rem" }}>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span style={{ fontSize: 14 }}>Asset type</span>
          <select name="asset_type" defaultValue={assetTypeFilter} style={{ padding: "0.75rem", borderRadius: 12, border: "1px solid #d7d7d7" }}>
            <option value="">All</option>
            {PUBLIC_ASSET_TYPE_OPTIONS.map((assetType) => (
              <option key={assetType} value={assetType}>
                {PUBLIC_ASSET_TYPE_LABELS[assetType]}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span style={{ fontSize: 14 }}>Listing type</span>
          <select name="listing_type" defaultValue={listingTypeFilter} style={{ padding: "0.75rem", borderRadius: 12, border: "1px solid #d7d7d7" }}>
            <option value="">All</option>
            {PUBLIC_LISTING_TYPE_OPTIONS.map((listingType) => (
              <option key={listingType} value={listingType}>
                {listingType.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" style={{ alignSelf: "end", padding: "0.8rem 1rem", borderRadius: 999, border: "1px solid #d7d7d7", background: "#ffffff" }}>
          Filter
        </button>
      </form>

      <section
        style={{
          marginTop: "1.5rem",
          padding: "1rem 1.1rem",
          borderRadius: 18,
          border: "1px solid #ebebeb",
          background: "#fafafa",
          display: "grid",
          gap: "0.45rem"
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>Pilot procedure</p>
        <p style={{ margin: 0, color: "#4f4f4f" }}>1. A verified user creates a listing.</p>
        <p style={{ margin: 0, color: "#4f4f4f" }}>2. Another verified user requests it.</p>
        <p style={{ margin: 0, color: "#4f4f4f" }}>3. The owner accepts or declines.</p>
        <p style={{ margin: 0, color: "#4f4f4f" }}>4. Both sides confirm the handoff outside the pilot.</p>
        <p style={{ margin: 0, color: "#4f4f4f" }}>5. The owner completes the transfer and the app updates ownership.</p>
      </section>

      <section style={{ marginTop: "2rem", display: "grid", gap: "1rem" }}>
        {filteredListings.length === 0 ? (
          <article style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff" }}>
            <p style={{ margin: 0 }}>No active listings match the current filters.</p>
          </article>
        ) : (
          filteredListings.map((listing) => {
            const badge = getListingBadge(listing);
            const imageSrc = resolveMarketplaceImage(listing.image_url);
            const ownerLabel = getProfileIdentityLabel(ownerProfilesById.get(listing.owner_user_id));

            return (
              <article key={listing.id} style={{ padding: "1.15rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff" }}>
                <div style={{ display: "grid", gridTemplateColumns: "112px minmax(0, 1fr)", gap: "1rem", alignItems: "start" }}>
                  <div style={{ overflow: "hidden", borderRadius: 16, border: "1px solid #efefef", background: "#f7f7f7", aspectRatio: "1 / 1", position: "relative" }}>
                    <Image
                      src={imageSrc}
                      alt={listing.title}
                      fill
                      sizes="112px"
                      style={{
                        objectFit: imageSrc.includes("calculator") ? "contain" : "cover",
                        objectPosition: "center",
                        padding: imageSrc.includes("calculator") ? "0.6rem" : 0
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 12, color: "#6a6a6a", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          {listing.asset_type} · {listing.listing_type}
                        </p>
                        <h2 style={{ margin: "0.35rem 0", fontSize: "1.25rem" }}>{listing.title}</h2>
                        <p style={{ margin: 0, color: "#4b4b4b", lineHeight: 1.6 }}>
                          {listing.description || "No description added yet."}
                        </p>
                      </div>
                      <div style={{ display: "grid", gap: "0.5rem", justifyItems: "end" }}>
                        <div style={{ padding: "0.45rem 0.7rem", borderRadius: 999, background: badge.background, color: badge.color, fontWeight: 600, fontSize: 14 }}>
                          {badge.label}
                        </div>
                        <p style={{ margin: 0, fontWeight: 700 }}>
                          {listing.price_amount ? `${listing.price_amount} ${listing.price_type ?? ""}`.trim() : "Price on request"}
                        </p>
                      </div>
                    </div>
                    <div style={{ marginTop: "1rem", display: "grid", gap: "0.4rem" }}>
                      <p style={{ margin: 0, color: "#4a4a4a" }}>Owner: {ownerLabel}</p>
                      <p style={{ margin: 0, color: "#4a4a4a" }}>Status: {listing.status}</p>
                      <p style={{ margin: 0, color: "#4a4a4a" }}>Tokenization: {listing.tokenization_status}</p>
                      <p style={{ margin: 0, color: "#4a4a4a" }}>
                        Exchange preferences: {listing.payment_methods?.length ? listing.payment_methods.join(", ") : "Flexible"}
                      </p>
                    </div>
                    <div style={{ marginTop: "1rem" }}>
                      <Link href={`/listings/${listing.id}`} style={{ color: "#111111", fontWeight: 700, textDecoration: "none" }}>
                        View listing
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
