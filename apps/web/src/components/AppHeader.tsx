import Link from "next/link";

import { canAccessProtectedAppRoutes } from "@/lib/auth/access";
import { getCurrentUserProfile } from "@/lib/auth/profile";
import { getProfileIdentityLabel, profileNeedsSetup } from "@/lib/auth/profile-schema";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";

import { BrandLogo } from "./BrandLogo";
import { SignOutButton } from "./SignOutButton";

const navLinkStyle = {
  color: "#111111",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 500
} as const;

export async function AppHeader() {
  const supabase = await createSupabaseServerAuthClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const canAccessApp = canAccessProtectedAppRoutes(user);
  const profile = canAccessApp ? await getCurrentUserProfile() : null;
  const identityLabel = canAccessApp ? getProfileIdentityLabel(profile) : null;
  const needsSetup = profileNeedsSetup(profile);

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
          <Link href="/marketplace" style={navLinkStyle}>
            Marketplace
          </Link>
          <Link href="/my-listings" style={navLinkStyle}>
            My Listings
          </Link>
          <Link href="/catalog" style={navLinkStyle}>
            XRPL Demo
          </Link>
          <Link href="/listings/new" style={navLinkStyle}>
            Create Listing
          </Link>
          {user ? (
            <Link href={needsSetup ? "/profile/setup" : "/profile"} style={navLinkStyle}>
              {needsSetup ? "Finish Profile" : "Profile"}
            </Link>
          ) : null}
          {identityLabel ? (
            <span style={{ fontSize: 14, color: "#4f4f4f" }}>
              Signed in as <strong>{identityLabel}</strong>
            </span>
          ) : null}
          {user ? (
            <SignOutButton
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.65rem 0.95rem",
                borderRadius: 999,
                border: 0,
                background: "#111111",
                color: "#ffffff",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer"
              }}
            />
          ) : (
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
          )}
        </nav>
      </div>
    </header>
  );
}
