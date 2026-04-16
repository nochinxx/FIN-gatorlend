import Link from "next/link";

import { WalletConnectionPanel } from "@/components/WalletConnectionPanel";

const checklist = [
  "Mint textbook NFTs through Crossmark behind the wallet adapter boundary",
  "Validate Supabase textbook metadata against live XRPL XLS-20 state before rendering detail views",
  "Keep issuer and privileged XRPL flows out of client code",
  "Apply RLS policies before exposing public data"
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "3rem 1.5rem"
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 900,
          padding: "2rem",
          borderRadius: 24,
          background: "linear-gradient(180deg, #fffaf0 0%, #efe4cf 100%)",
          boxShadow: "0 24px 80px rgba(18, 33, 23, 0.12)"
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#4d5f4a"
          }}
        >
          Testnet-only scaffold
        </p>
        <h1 style={{ marginBottom: "0.75rem", fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
          Campus assets, modeled as XLS-20 NFTs.
        </h1>
        <p style={{ maxWidth: 680, fontSize: "1.1rem", lineHeight: 1.6 }}>
          This initial web app is wired for a pnpm workspace with shared XRPL and schema packages.
          The first MVP workflow now mints textbook NFTs from Crossmark on XRPL testnet, then
          stores Supabase records only after the chain state is verified.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
          <Link href="/textbooks/new" style={{ color: "#17331d", fontWeight: 700 }}>
            Create textbook asset
          </Link>
          <Link
            href="/textbooks/new"
            style={{
              padding: "0.7rem 1rem",
              borderRadius: 999,
              background: "#17331d",
              color: "#fffaf0",
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            Create Textbook (Dev)
          </Link>
          <Link href="/catalog" style={{ color: "#17331d", fontWeight: 700 }}>
            View textbook catalog
          </Link>
        </div>
        <ul style={{ margin: "2rem 0 0", paddingLeft: "1.25rem", lineHeight: 1.8 }}>
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <WalletConnectionPanel />
      </section>
    </main>
  );
}
