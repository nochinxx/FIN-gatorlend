import Link from "next/link";

import { BrandLogo } from "./BrandLogo";

const navLinkStyle = {
  color: "#111111",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 500
} as const;

export function AppHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "rgba(255, 255, 255, 0.96)",
        borderBottom: "1px solid #ebebeb",
        backdropFilter: "saturate(180%) blur(8px)"
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap"
        }}
      >
        <BrandLogo size="nav" priority />
        <nav style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/" style={navLinkStyle}>
            Home
          </Link>
          <Link href="/catalog" style={navLinkStyle}>
            Catalog
          </Link>
          <Link href="/textbooks/new" style={navLinkStyle}>
            Create Asset
          </Link>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.65rem 0.95rem",
              borderRadius: 999,
              background: "#111111",
              color: "#ffffff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600
            }}
          >
            Enter App
          </Link>
        </nav>
      </div>
    </header>
  );
}
