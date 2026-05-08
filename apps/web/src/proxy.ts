import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  canAccessProtectedAppRoutes,
  isEmailVerified
} from "./lib/auth/access";
import { profileNeedsSetup } from "./lib/auth/profile-schema";
import { getSupabaseAnonKey, getSupabaseUrl } from "./lib/supabase/config";

function isMarketplacePath(pathname: string): boolean {
  return pathname === "/marketplace" || pathname === "/listings/new" || pathname.startsWith("/listings/");
}

function requiresCompletedProfile(pathname: string): boolean {
  return isMarketplacePath(pathname) || pathname === "/my-listings" || pathname === "/requests";
}

function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/catalog" ||
    pathname === "/profile" ||
    pathname === "/profile/setup" ||
    pathname === "/my-listings" ||
    pathname === "/requests" ||
    pathname === "/textbooks/new" ||
    pathname.startsWith("/assets/") ||
    isMarketplacePath(pathname)
  );
}

function buildLoginRedirect(request: NextRequest, reason?: "not-authorized" | "email-not-verified") {
  const redirectUrl = new URL("/login", request.url);

  if (request.nextUrl.pathname !== "/login") {
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
  }

  if (reason) {
    redirectUrl.searchParams.set("error", reason);
  }

  return NextResponse.redirect(redirectUrl);
}

function buildProfileSetupRedirect(request: NextRequest) {
  const redirectUrl = new URL("/profile/setup", request.url);
  redirectUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}

export async function proxy(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request
  });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return buildLoginRedirect(request);
  }

  if (!isEmailVerified(user)) {
    return buildLoginRedirect(request, "email-not-verified");
  }

  if (!canAccessProtectedAppRoutes(user)) {
    return buildLoginRedirect(request, "not-authorized");
  }

  if (!requiresCompletedProfile(request.nextUrl.pathname) && request.nextUrl.pathname !== "/profile/setup") {
    return response;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return buildProfileSetupRedirect(request);
  }

  if (request.nextUrl.pathname === "/profile/setup" && !profileNeedsSetup(profile)) {
    return NextResponse.redirect(new URL("/marketplace", request.url));
  }

  if (requiresCompletedProfile(request.nextUrl.pathname) && profileNeedsSetup(profile)) {
    return buildProfileSetupRedirect(request);
  }

  return response;
}

export const config = {
  matcher: [
    "/catalog",
    "/marketplace",
    "/profile",
    "/profile/setup",
    "/my-listings",
    "/requests",
    "/textbooks/new",
    "/listings/new",
    "/assets/:path*",
    "/listings/:path*"
  ]
};
