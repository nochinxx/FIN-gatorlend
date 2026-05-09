import Link from "next/link";
import Image from "next/image";

import { listProfilesByIds } from "@/lib/auth/profile";
import { getProfileIdentityLabel } from "@/lib/auth/profile-schema";
import {
  formatMarketplaceAssetTypeLabel,
  normalizeMarketplaceAssetType
} from "@/lib/marketplace/assetTypes";
import { getListingCardImageUrl } from "@/lib/marketplace/listingImages";
import {
  listListingImagesByListingIds,
  listMarketplaceAssetTypeSuggestions,
  listMarketplaceListings,
  requireMarketplaceUser
} from "@/lib/marketplace/server";
import {
  PUBLIC_LISTING_TYPE_LABELS,
  PUBLIC_LISTING_TYPE_OPTIONS
} from "@/lib/marketplace/publicOptions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getListingBadge(listing: Awaited<ReturnType<typeof listMarketplaceListings>>[number]) {
  if (listing.xrpl_token_id) {
    return {
      mobileLabel: "XRPL",
      label: "Minted on XRPL",
      background: "#edf4ff",
      color: "#234f95"
    };
  }

  return {
    mobileLabel: "Off-chain",
    label: "Not minted on-chain",
    background: "#f3f3f3",
    color: "#444444"
  };
}

function formatTokenizationStatus(status: Awaited<ReturnType<typeof listMarketplaceListings>>[number]["tokenization_status"]) {
  if (status === "mock_tokenized") {
    return "Not minted on-chain";
  }

  if (status === "xrpl_testnet_minted" || status === "verified_on_chain") {
    return "Minted on XRPL";
  }

  return status.replaceAll("_", " ");
}

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
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 7h8" />
        <path d="M9 4h6l1 3H8l1-3Z" />
        <path d="M6 7h12l-1 11H7L6 7Z" />
        <path d="M10 11v3" />
        <path d="M14 11v3" />
      </svg>
    </div>
  );
}

type MarketplacePageProps = {
  searchParams: Promise<{
    asset_type?: string;
    listing_type?: string;
  }>;
};

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const resolvedSearchParams = await searchParams;
  const assetTypeFilter = normalizeMarketplaceAssetType(resolvedSearchParams.asset_type ?? "");
  const listingTypeFilter = resolvedSearchParams.listing_type ?? "";
  const currentUser = await requireMarketplaceUser();
  const [listings, assetTypeSuggestions] = await Promise.all([
    listMarketplaceListings(),
    listMarketplaceAssetTypeSuggestions()
  ]);
  const listingImages = await listListingImagesByListingIds(
    listings.flatMap((listing) => (listing.id ? [listing.id] : []))
  );
  const listingImagesById = new Map<string, typeof listingImages>();

  for (const image of listingImages) {
    const currentImages = listingImagesById.get(image.listing_id) ?? [];
    currentImages.push(image);
    listingImagesById.set(image.listing_id, currentImages);
  }
  const ownerProfiles = await listProfilesByIds([
    ...new Set(listings.map((listing) => listing.owner_user_id))
  ]);
  const ownerProfilesById = new Map(ownerProfiles.map((profile) => [profile.id, profile]));
  const filteredListings = listings.filter((listing) => {
    if (assetTypeFilter && normalizeMarketplaceAssetType(listing.asset_type) !== assetTypeFilter) {
      return false;
    }

    if (listingTypeFilter && listing.listing_type !== listingTypeFilter) {
      return false;
    }

    return true;
  });

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
      <style>{`
        .marketplace-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }
        .marketplace-card-link {
          color: inherit;
          text-decoration: none;
        }
        .marketplace-card {
          padding: 0.8rem;
          border-radius: 22px;
          border: 1px solid #ebebeb;
          background: #ffffff;
          display: grid;
          gap: 0.75rem;
          height: 100%;
        }
        .marketplace-card-image {
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid #efefef;
          background: #f7f7f7;
          aspect-ratio: 0.9 / 1;
        }
        .marketplace-card-badges {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          display: flex;
          justify-content: space-between;
          gap: 0.45rem;
          align-items: start;
          pointer-events: none;
        }
        .marketplace-card-pill {
          padding: 0.34rem 0.56rem;
          border-radius: 999px;
          font-size: 11px;
          line-height: 1.1;
          white-space: nowrap;
          backdrop-filter: blur(8px);
        }
        .marketplace-card-copy {
          display: grid;
          gap: 0.35rem;
        }
        .marketplace-card-meta {
          display: none;
        }
        @media (min-width: 900px) {
          .marketplace-grid {
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1rem;
          }
          .marketplace-card {
            padding: 1rem;
            gap: 0.9rem;
          }
          .marketplace-card-pill {
            padding: 0.42rem 0.68rem;
            font-size: 12px;
          }
          .marketplace-card-meta {
            display: grid;
            gap: 0.35rem;
          }
        }
      `}</style>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12, color: "#666666" }}>
            Marketplace
          </p>
          <h1 style={{ marginBottom: "0.5rem", fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>Active listings</h1>
          <p style={{ maxWidth: 720, lineHeight: 1.6, color: "#4a4a4a" }}>
            Browse listings for common academic items posted by verified school-email users. Create
            a listing, send a request, confirm the handoff, and update ownership inside the app.
            Wallet usage is optional and not required for normal marketplace activity.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <Link href="/listings/new" style={{ color: "#17331d" }}>
            Create Listing
          </Link>
        </div>
      </div>

      <form style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "2rem" }}>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span style={{ fontSize: 14 }}>Asset type</span>
          <input
            name="asset_type"
            list="marketplace-filter-asset-types"
            defaultValue={assetTypeFilter}
            placeholder="textbook, tutoring, lab coat"
            style={{ padding: "0.75rem", borderRadius: 12, border: "1px solid #d7d7d7" }}
          />
        </label>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span style={{ fontSize: 14 }}>Listing type</span>
          <select name="listing_type" defaultValue={listingTypeFilter} style={{ padding: "0.75rem", borderRadius: 12, border: "1px solid #d7d7d7" }}>
            <option value="">All</option>
            {PUBLIC_LISTING_TYPE_OPTIONS.map((listingType) => (
              <option key={listingType} value={listingType}>
                {PUBLIC_LISTING_TYPE_LABELS[listingType]}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" style={{ alignSelf: "end", padding: "0.8rem 1rem", borderRadius: 999, border: "1px solid #d7d7d7", background: "#ffffff" }}>
          Filter
        </button>
      </form>
      <datalist id="marketplace-filter-asset-types">
        {assetTypeSuggestions.map((assetType) => (
          <option key={assetType} value={assetType} />
        ))}
      </datalist>

      <section className="marketplace-grid" style={{ marginTop: "2rem" }}>
        {filteredListings.length === 0 ? (
          <article style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #ebebeb", background: "#ffffff", gridColumn: "1 / -1" }}>
            <p style={{ margin: 0 }}>No active listings match the current filters.</p>
          </article>
        ) : (
          filteredListings.map((listing) => {
            const badge = getListingBadge(listing);
            const imageSrc = getListingCardImageUrl(listing, listingImagesById.get(listing.id!));
            const ownerLabel = getProfileIdentityLabel(ownerProfilesById.get(listing.owner_user_id));
            const isOwner = listing.owner_user_id === currentUser.id;
            const priceLabel = listing.price_amount
              ? `${listing.price_amount} ${listing.price_type ?? ""}`.trim()
              : null;

            return (
              <Link key={listing.id} href={`/listings/${listing.id}`} className="marketplace-card-link">
                <article className="marketplace-card">
                  <div className="marketplace-card-image">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={listing.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 320px"
                        style={{
                          objectFit: imageSrc.includes("calculator") ? "contain" : "cover",
                          objectPosition: "center",
                          padding: imageSrc.includes("calculator") ? "0.6rem" : 0
                        }}
                      />
                    ) : (
                      <ListingImagePlaceholder />
                    )}

                    <div className="marketplace-card-badges">
                      {priceLabel ? (
                        <span
                          className="marketplace-card-pill"
                          style={{
                            background: "rgba(255, 255, 255, 0.94)",
                            color: "#111111",
                            fontWeight: 700
                          }}
                        >
                          {priceLabel}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span
                        className="marketplace-card-pill"
                        style={{
                          background: badge.background,
                          color: badge.color,
                          fontWeight: 600
                        }}
                      >
                        <span className="desktop-only">{badge.label}</span>
                        <span className="mobile-only">{badge.mobileLabel}</span>
                      </span>
                    </div>
                  </div>
                  <div className="marketplace-card-copy">
                    <p style={{ margin: 0, fontSize: 12, color: "#6a6a6a", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {formatMarketplaceAssetTypeLabel(listing.asset_type)}
                    </p>
                    <h2 style={{ margin: 0, fontSize: "1rem", lineHeight: 1.2 }}>{listing.title}</h2>
                    <div className="marketplace-card-meta">
                      <p style={{ margin: 0, color: "#4b4b4b", lineHeight: 1.6 }}>
                        {listing.description || "No description added yet."}
                      </p>
                      <div style={{ display: "grid", gap: "0.35rem", color: "#4a4a4a", fontSize: 14 }}>
                        <p style={{ margin: 0 }}><strong>Type:</strong> {PUBLIC_LISTING_TYPE_LABELS[listing.listing_type as keyof typeof PUBLIC_LISTING_TYPE_LABELS] ?? listing.listing_type.replaceAll("_", " ")}</p>
                        <p style={{ margin: 0 }}><strong>Owner:</strong> {ownerLabel}</p>
                        <p style={{ margin: 0 }}><strong>Status:</strong> {listing.status}</p>
                        <p style={{ margin: 0 }}><strong>Tokenization:</strong> {formatTokenizationStatus(listing.tokenization_status)}</p>
                        {!isOwner ? (
                          <p style={{ margin: 0, color: "#17331d", fontWeight: 700 }}>
                            Open listing to send request
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })
        )}
      </section>

      <section
        style={{
          marginTop: "2rem",
          padding: "1rem 1.1rem",
          borderRadius: 18,
          border: "1px solid #ebebeb",
          background: "#fafafa",
          display: "grid",
          gap: "0.45rem"
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>How it works</p>
        <p style={{ margin: 0, color: "#4f4f4f" }}>1. A verified user creates a listing.</p>
        <p style={{ margin: 0, color: "#4f4f4f" }}>2. Another verified user requests it.</p>
        <p style={{ margin: 0, color: "#4f4f4f" }}>3. The owner accepts or declines.</p>
        <p style={{ margin: 0, color: "#4f4f4f" }}>4. Both sides confirm the handoff outside the app.</p>
        <p style={{ margin: 0, color: "#4f4f4f" }}>5. The owner completes the transfer and the app updates ownership.</p>
      </section>
    </main>
  );
}
