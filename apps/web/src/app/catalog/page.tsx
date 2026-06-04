import Link from "next/link";
import Image from "next/image";

import { listTextbookAssets } from "@/lib/assets/textbooks";
import { hasSupabaseServerConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_TEXTBOOK_IMAGE = "/images/textbook.jpg";

function isSafeLocalImagePath(value: string | null | undefined): value is string {
  if (!value) {
    return false;
  }

  return /^\/(?:images|branding)\/.+\.(?:png|jpe?g|webp)$/i.test(value);
}

function resolveCatalogImage(imageUrl: string | null | undefined): string {
  if (!isSafeLocalImagePath(imageUrl)) {
    return DEFAULT_TEXTBOOK_IMAGE;
  }

  return imageUrl;
}

function getImageObjectFit(imageSrc: string) {
  if (imageSrc.includes("calculator")) {
    return "contain" as const;
  }

  return "cover" as const;
}

function getStatusTone(verificationStatus: string) {
  if (verificationStatus === "verified") {
    return {
      dot: "#4ade80",
      background: "rgba(34,197,94,0.12)",
      color: "#86efac",
      label: "Verified"
    };
  }

  return {
    dot: "#eab308",
    background: "rgba(234,179,8,0.12)",
    color: "#fde047",
    label: verificationStatus === "pending" ? "Pending review" : verificationStatus
  };
}

export default async function CatalogPage() {
  const hasConfig = hasSupabaseServerConfig();
  const assets = hasConfig ? await listTextbookAssets().catch(() => []) : [];

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12, color: "#777777" }}>
            Advanced verification layer
          </p>
          <h1 style={{ marginBottom: "0.5rem", fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>XRPL-backed textbook assets</h1>
          <p style={{ maxWidth: 720, lineHeight: 1.6, color: "#9a9a9a" }}>
            This route is the optional XRPL verification slice, not the default marketplace flow.
            It shows textbook assets that have been minted or registered against XRPL testnet and
            reconciled against Supabase metadata.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <Link href="/" style={{ color: "#4ade80" }}>Home</Link>
          <Link href="/marketplace" style={{ color: "#4ade80" }}>Marketplace</Link>
          <Link href="/textbooks/new" style={{ color: "#4ade80" }}>Mint Demo Asset</Link>
        </div>
      </div>
      {!hasConfig ? (
        <p
          style={{
            marginTop: "2rem",
            padding: "1rem",
            borderRadius: 16,
            background: "rgba(234,179,8,0.12)",
            color: "#fde047"
          }}
        >
          Supabase is not configured in this workspace yet. Add the env vars from
          `apps/web/.env.local.example` to run the full create, list, and detail flow.
        </p>
      ) : null}
      <section style={{ marginTop: "2rem", display: "grid", gap: "1rem" }}>
        {assets.length === 0 ? (
          <article style={{ padding: "1.5rem", borderRadius: 20, border: "1px solid #242424", background: "#111111" }}>
            <p style={{ margin: 0 }}>No assets have been listed yet.</p>
          </article>
        ) : (
          assets.map((asset) => {
            const statusTone = getStatusTone(asset.verification_status);
            const imageSrc = resolveCatalogImage(asset.image_url);

            return (
              <article
                key={asset.id ?? asset.xrpl_token_id}
                style={{ padding: "1.15rem", borderRadius: 20, border: "1px solid #242424", background: "#111111" }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "112px minmax(0, 1fr)", gap: "1rem", alignItems: "start" }}>
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
                    <Image
                      src={imageSrc}
                      alt={asset.metadata.title}
                      fill
                      sizes="112px"
                      style={{
                        objectFit: getImageObjectFit(imageSrc),
                        objectPosition: "center",
                        padding: imageSrc.includes("calculator") ? "0.6rem" : 0
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 12, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          {asset.metadata.course_code}
                        </p>
                        <h2 style={{ margin: "0.35rem 0", fontSize: "1.25rem" }}>{asset.metadata.title}</h2>
                        <p style={{ margin: 0, color: "#9a9a9a", lineHeight: 1.6 }}>
                          {asset.metadata.author} · {asset.metadata.edition} · {asset.metadata.condition}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.45rem",
                          padding: "0.45rem 0.7rem",
                          borderRadius: 999,
                          background: statusTone.background,
                          color: statusTone.color,
                          fontWeight: 600,
                          fontSize: 14,
                          height: "fit-content"
                        }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: 999, background: statusTone.dot, flexShrink: 0 }} />
                        {statusTone.label}
                      </div>
                    </div>
                    <div style={{ marginTop: "1rem", display: "grid", gap: "0.4rem" }}>
                      <p style={{ margin: 0, color: "#9a9a9a" }}>Owner wallet: {asset.owner_wallet}</p>
                      <p style={{ margin: 0, color: "#9a9a9a", fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: 14 }}>
                        Token ID: {asset.xrpl_token_id.slice(0, 14)}...
                      </p>
                    </div>
                    <div style={{ marginTop: "1rem" }}>
                      <Link href={`/assets/${asset.id}`} style={{ color: "#4ade80", fontWeight: 700, textDecoration: "none" }}>
                        View asset
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
