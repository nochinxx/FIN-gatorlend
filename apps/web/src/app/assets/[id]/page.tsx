import Link from "next/link";
import { notFound } from "next/navigation";

import { getTextbookAssetById, reconcileTextbookAsset } from "@/lib/assets/textbooks";
import { hasSupabaseServerConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AssetDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { id } = await params;
  const hasConfig = hasSupabaseServerConfig();

  if (!hasConfig) {
    return (
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
        <h1>Asset detail</h1>
        <p>Supabase is not configured yet. Add env vars before using the detail flow.</p>
      </main>
    );
  }

  const asset = await getTextbookAssetById(id);

  if (!asset) {
    notFound();
  }

  const { xrplState, hasMismatch, expectedMetadataHash, expectedMetadataUri } = await reconcileTextbookAsset(asset);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12 }}>
            Textbook detail
          </p>
          <h1 style={{ marginBottom: "0.5rem", fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>
            {asset.metadata.title}
          </h1>
          <p style={{ maxWidth: 720, lineHeight: 1.6 }}>
            This detail view checks the recorded textbook metadata commitment against live XRPL
            state before presenting the asset as trustworthy.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <Link href="/catalog" style={{ color: "#17331d" }}>
            Catalog
          </Link>
          <Link href="/textbooks/new" style={{ color: "#17331d" }}>
            Create textbook
          </Link>
        </div>
      </div>

      <section
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          borderRadius: 24,
          background: hasMismatch ? "#ffe8e0" : "#fffaf0",
          boxShadow: "0 20px 70px rgba(18, 33, 23, 0.08)"
        }}
      >
        <h2 style={{ marginTop: 0 }}>Integrity status</h2>
        {hasMismatch ? (
          <p style={{ color: "#8b2414", fontWeight: 700 }}>
            Integrity warning: the Supabase record does not match live XRPL textbook state. Do not
            treat this asset as verified until the mismatch is resolved.
          </p>
        ) : (
          <p style={{ color: "#17331d", fontWeight: 700 }}>
            Integrity check passed against the live XRPL NFT. Current verification status:{" "}
            {asset.verification_status}.
          </p>
        )}
      </section>

      <section
        style={{
          marginTop: "1rem",
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
        }}
      >
        <article
          style={{
            padding: "1.5rem",
            borderRadius: 20,
            background: "#fffaf0",
            boxShadow: "0 20px 70px rgba(18, 33, 23, 0.08)"
          }}
        >
          <h2 style={{ marginTop: 0 }}>Supabase record</h2>
          <p>Asset type: {asset.asset_type}</p>
          <p>Owner wallet: {asset.owner_wallet}</p>
          <p>XRPL token ID: {asset.xrpl_token_id}</p>
          <p>ISBN: {asset.metadata.isbn}</p>
          <p>Course code: {asset.metadata.course_code}</p>
          <p>Edition: {asset.metadata.edition}</p>
          <p>Condition: {asset.metadata.condition}</p>
        </article>
        <article
          style={{
            padding: "1.5rem",
            borderRadius: 20,
            background: "#fffaf0",
            boxShadow: "0 20px 70px rgba(18, 33, 23, 0.08)"
          }}
        >
          <h2 style={{ marginTop: 0 }}>XRPL comparison state</h2>
          <p>Exists on recorded owner wallet: {xrplState.exists ? "Yes" : "No"}</p>
          <p>Asset type: {xrplState.asset_type}</p>
          <p>Recorded owner wallet: {xrplState.owner_wallet}</p>
          <p>XRPL token ID: {xrplState.xrpl_token_id}</p>
          <p>Expected metadata hash: {expectedMetadataHash}</p>
          <p>XRPL metadata hash: {xrplState.metadata_hash ?? "Unavailable"}</p>
          <p>Expected commitment URI: {expectedMetadataUri}</p>
          <p>XRPL commitment URI: {xrplState.metadata_uri ?? "Unavailable"}</p>
        </article>
      </section>
    </main>
  );
}
