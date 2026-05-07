import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { canAccessProtectedAppRoutes } from "@/lib/auth/access";
import { ensureAuthProfile } from "@/lib/auth/profile";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";

function sanitizeNextPath(nextPath: string | null): string {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/catalog";
  }

  return nextPath;
}

function buildLoginErrorRedirect(
  request: NextRequest,
  reason: "not-authorized" | "profile-setup-failed" | "magic-link-expired" | "auth-exchange-failed"
) {
  const redirectUrl = new URL("/login", request.url);
  redirectUrl.searchParams.set("error", reason);
  return NextResponse.redirect(redirectUrl);
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const authError = requestUrl.searchParams.get("error");
  const authErrorCode = requestUrl.searchParams.get("error_code");
  const nextPath = sanitizeNextPath(requestUrl.searchParams.get("next"));

  if (authError || authErrorCode) {
    if (authErrorCode === "otp_expired") {
      return buildLoginErrorRedirect(request, "magic-link-expired");
    }

    return buildLoginErrorRedirect(request, "auth-exchange-failed");
  }

  let response = NextResponse.redirect(new URL(nextPath, request.url));

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return buildLoginErrorRedirect(
        request,
        error.code === "otp_expired" ? "magic-link-expired" : "auth-exchange-failed"
      );
    }
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!canAccessProtectedAppRoutes(user?.email)) {
    await supabase.auth.signOut();
    response = NextResponse.redirect(new URL("/login?error=not-authorized", request.url));
  } else if (user?.email) {
    try {
      await ensureAuthProfile({
        id: user.id,
        email: user.email
      }, supabase);
    } catch {
      await supabase.auth.signOut();
      response = NextResponse.redirect(new URL("/login?error=profile-setup-failed", request.url));
    }
  }

  return response;
}
