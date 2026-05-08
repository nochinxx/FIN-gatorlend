import { canAccessProtectedAppRoutes } from "@/lib/auth/access";
import { getCurrentUserProfile } from "@/lib/auth/profile";
import { getProfileIdentityLabel, profileNeedsSetup } from "@/lib/auth/profile-schema";
import { getPendingReceivedRequestCount } from "@/lib/marketplace/server";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";

import { AppNavShell } from "./AppNavShell";
import { BrandLogo } from "./BrandLogo";

function iconStyle() {
  return { width: 20, height: 20, display: "block" } as const;
}

function StorefrontIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle()}>
      <path d="M4 10h16" />
      <path d="M6 10l1-5h10l1 5" />
      <path d="M5 10v8h14v-8" />
      <path d="M9 18v-4h6v4" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle()}>
      <path d="M9 6h11" />
      <path d="M9 12h11" />
      <path d="M9 18h11" />
      <path d="M4 6h.01" />
      <path d="M4 12h.01" />
      <path d="M4 18h.01" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle()}>
      <path d="M4 13.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7.5" />
      <path d="M4 13.5h4l2 3h4l2-3h4" />
      <path d="M5 13.5v4.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4.5" />
    </svg>
  );
}

function PlusSquareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle()}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}

export async function AppHeader() {
  const supabase = await createSupabaseServerAuthClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const canAccessApp = canAccessProtectedAppRoutes(user);
  const profile = canAccessApp ? await getCurrentUserProfile() : null;
  const identityLabel = canAccessApp ? getProfileIdentityLabel(profile) : null;
  const needsSetup = profileNeedsSetup(profile);
  const pendingReceivedRequestCount =
    canAccessApp && !needsSetup ? await getPendingReceivedRequestCount() : 0;

  const navItems = canAccessApp
    ? [
        { href: "/marketplace", label: "Marketplace", icon: <StorefrontIcon /> },
        { href: "/my-listings", label: "My Listings", icon: <ListIcon /> },
        { href: "/requests", label: "Requests", icon: <InboxIcon />, badgeCount: pendingReceivedRequestCount || undefined },
        { href: "/listings/new", label: "Create", icon: <PlusSquareIcon /> }
      ]
    : [];

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
      <style>{`
        .mobile-only { display: inline-flex; }
        .desktop-only { display: none !important; }
        @media (min-width: 640px) {
          .mobile-only { display: none !important; }
          .desktop-only { display: flex !important; }
        }
        summary::-webkit-details-marker { display: none; }
      `}</style>
      <AppNavShell
        navItems={navItems}
        identityLabel={identityLabel}
        profileHref={user ? (needsSetup ? "/profile/setup" : "/profile") : null}
        showLogin={!user}
      >
        <BrandLogo size="nav" priority />
      </AppNavShell>
    </header>
  );
}
