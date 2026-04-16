import Link from "next/link";

import { listTextbookAssets } from "@/lib/assets/textbooks";
import { hasSupabaseServerConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CatalogPage() {
  const hasConfig = hasSupabaseServerConfig();
  const assets = hasConfig ? await listTextbookAssets().catch(() => []) : [];

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12 }}>
            Textbook catalog
          </p>
          <h1 style={{ marginBottom: "0.5rem", fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>
            Registered textbook assets
          </h1>
          <p style={{ maxWidth: 720, lineHeight: 1.6 }}>
            The catalog fetches only `asset_type = "textbook"` rows from Supabase. Goggles and lab
            coats remain supported in the shared domain model, but they are intentionally excluded
            from this first UI slice.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <Link href="/" style={{ color: "#17331d" }}>
            Home
          </Link>
          <Link href="/textbooks/new" style={{ color: "#17331d" }}>
            Create textbook
          </Link>
        </div>
      </div>
      {!hasConfig ? (
        <p
          style={{
            marginTop: "2rem",
            padding: "1rem",
            borderRadius: 16,
            background: "#fff1d6"
          }}
        >
          Supabase is not configured in this workspace yet. Add the env vars from
          `apps/web/.env.local.example` to run the full create, list, and detail flow.
        </p>
      ) : null}
      <section
        style={{
          marginTop: "2rem",
          display: "grid",
          gap: "1rem"
        }}
      >
        {assets.length === 0 ? (
          <article
            style={{
              padding: "1.5rem",
              borderRadius: 20,
              background: "#fffaf0",
              boxShadow: "0 20px 70px rgba(18, 33, 23, 0.08)"
            }}
          >
            <p style={{ margin: 0 }}>No textbook assets found yet.</p>
          </article>
        ) : (
          assets.map((asset) => (
            <article
              key={asset.id ?? asset.xrpl_token_id}
              style={{
                padding: "1.5rem",
                borderRadius: 20,
                background: "#fffaf0",
                boxShadow: "0 20px 70px rgba(18, 33, 23, 0.08)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ marginTop: 0, marginBottom: "0.35rem" }}>{asset.metadata.title}</h2>
                  <p style={{ margin: 0, color: "#475447" }}>
                    {asset.metadata.author} · {asset.metadata.course_code} · {asset.metadata.edition}
                  </p>
                </div>
                <p style={{ margin: 0, fontWeight: 700 }}>{asset.verification_status}</p>
              </div>
              <p style={{ marginBottom: "0.35rem" }}>Wallet: {asset.owner_wallet}</p>
              <p style={{ marginTop: 0, color: "#475447" }}>XRPL Token ID: {asset.xrpl_token_id}</p>
              <Link href={`/assets/${asset.id}`} style={{ color: "#17331d", fontWeight: 700 }}>
                View detail
              </Link>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
