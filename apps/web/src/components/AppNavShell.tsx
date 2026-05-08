"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

import { SignOutButton } from "./SignOutButton";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  badgeCount?: number;
};

type AppNavShellProps = {
  navItems: NavItem[];
  identityLabel: string | null;
  profileHref: string | null;
  showLogin: boolean;
  children: ReactNode;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/marketplace") {
    return pathname === "/marketplace" || pathname.startsWith("/listings/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkStyle(active: boolean): CSSProperties {
  return {
    color: active ? "#17331d" : "#111111",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: active ? 700 : 500
  };
}

function mobileNavLinkStyle(active: boolean): CSSProperties {
  return {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 12,
    color: active ? "#17331d" : "#555555",
    background: active ? "#eef6f0" : "transparent",
    textDecoration: "none"
  };
}

function menuItemStyle(): CSSProperties {
  return {
    display: "block",
    padding: "0.65rem 0.8rem",
    borderRadius: 12,
    color: "#111111",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500
  };
}

export function AppNavShell({
  navItems,
  identityLabel,
  profileHref,
  showLogin,
  children
}: AppNavShellProps) {
  const pathname = usePathname();

  return (
    <div
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: "1rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem"
      }}
    >
      {children}

      <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", marginLeft: "auto" }}>
        <nav style={{ display: "flex", alignItems: "center", gap: "0.45rem" }} aria-label="Primary">
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <div style={{ display: "none" }} />
            <div className="desktop-nav" style={{ display: "none" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={`mobile-${item.href}`}
                  href={item.href}
                  title={item.label}
                  aria-label={item.label}
                  style={{
                    ...mobileNavLinkStyle(active),
                    display: "inline-flex"
                  }}
                  className="mobile-only"
                >
                  {item.icon}
                  {item.badgeCount ? (
                    <span
                      style={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        minWidth: 18,
                        height: 18,
                        padding: "0 5px",
                        borderRadius: 999,
                        background: "#17331d",
                        color: "#ffffff",
                        fontSize: 11,
                        fontWeight: 700,
                        display: "grid",
                        placeItems: "center"
                      }}
                    >
                      {item.badgeCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }} className="desktop-only">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link key={item.href} href={item.href} style={navLinkStyle(active)}>
                  {item.badgeCount ? `${item.label} (${item.badgeCount})` : item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {showLogin ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/login" style={navLinkStyle(isActivePath(pathname, "/login"))}>
              Log in
            </Link>
            <Link
              href="/login?mode=signup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.72rem 0.95rem",
                borderRadius: 999,
                background: "#111111",
                color: "#ffffff",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 700
              }}
            >
              Sign up
            </Link>
          </div>
        ) : (
          <details style={{ position: "relative" }}>
            <summary
              style={{
                listStyle: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 42,
                height: 42,
                borderRadius: 14,
                border: "1px solid #dddddd",
                background: "#ffffff",
                cursor: "pointer"
              }}
            >
              <span style={{ display: "grid", gap: 4 }}>
                <span style={{ width: 18, height: 2, background: "#111111", borderRadius: 999 }} />
                <span style={{ width: 18, height: 2, background: "#111111", borderRadius: 999 }} />
                <span style={{ width: 18, height: 2, background: "#111111", borderRadius: 999 }} />
              </span>
            </summary>
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 0.6rem)",
                right: 0,
                minWidth: 240,
                padding: "0.6rem",
                borderRadius: 18,
                border: "1px solid #e7e7e7",
                background: "#ffffff",
                boxShadow: "0 20px 45px rgba(17, 17, 17, 0.10)"
              }}
            >
              {identityLabel ? (
                <div
                  style={{
                    padding: "0.6rem 0.8rem 0.8rem",
                    borderBottom: "1px solid #efefef",
                    marginBottom: "0.35rem",
                    fontSize: 14,
                    color: "#4f4f4f",
                    lineHeight: 1.5
                  }}
                >
                  Signed in as <strong style={{ color: "#111111" }}>{identityLabel}</strong>
                </div>
              ) : null}

              {profileHref ? (
                <Link href={profileHref} style={menuItemStyle()}>
                  Profile
                </Link>
              ) : null}

              <SignOutButton
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "0.35rem",
                  padding: "0.75rem 0.9rem",
                  borderRadius: 14,
                  border: 0,
                  background: "#111111",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              />
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
