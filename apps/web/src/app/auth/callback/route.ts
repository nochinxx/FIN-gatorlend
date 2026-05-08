import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import {
  canAccessProtectedAppRoutes,
  isEmailVerified
} from "@/lib/auth/access";
import { ensureAuthProfile } from "@/lib/auth/profile";
import { profileNeedsSetup } from "@/lib/auth/profile-schema";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";

function sanitizeNextPath(nextPath: string | null, fallback = "/marketplace"): string {
  if (!nextPath || !nextPath.startsWith("/")) {
    return fallback;
  }

  return nextPath;
}

function buildLoginErrorRedirect(
  request: NextRequest,
  reason:
    | "not-authorized"
    | "email-not-verified"
    | "profile-setup-failed"
    | "magic-link-expired"
    | "auth-exchange-failed"
) {
  const redirectUrl = new URL("/login", request.url);
  redirectUrl.searchParams.set("error", reason);
  return NextResponse.redirect(redirectUrl);
}

function logAuthCallback(event: string, details: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[auth/callback]", event, details);
  }
}

function getOtpType(type: string | null): EmailOtpType | null {
  switch (type) {
    case "signup":
    case "invite":
    case "magiclink":
    case "recovery":
    case "email":
    case "email_change":
      return type;
    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const authErrorCode = requestUrl.searchParams.get("error_code");
  const authError = requestUrl.searchParams.get("error");
  const authType = requestUrl.searchParams.get("type");
  const otpType = getOtpType(authType);
  const nextPath = sanitizeNextPath(requestUrl.searchParams.get("next"));

  logAuthCallback("incoming", {
    hasCode: Boolean(code),
    hasTokenHash: Boolean(tokenHash),
    authErrorCode,
    authError,
    authType,
    otpType,
    nextPath
  });

  if (authError || authErrorCode) {
    logAuthCallback("supabase-error-param", {
      authErrorCode,
      authError,
      authType
    });

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
      logAuthCallback("exchangeCodeForSession-error", {
        code: error.code,
        message: error.message
      });

      return buildLoginErrorRedirect(
        request,
        error.code === "otp_expired" ? "magic-link-expired" : "auth-exchange-failed"
      );
    }
  } else if (tokenHash && otpType) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType
    });

    if (error) {
      logAuthCallback("verifyOtp-error", {
        code: error.code,
        message: error.message,
        authType: otpType
      });

      return buildLoginErrorRedirect(
        request,
        error.code === "otp_expired" ? "magic-link-expired" : "auth-exchange-failed"
      );
    }
  } else {
    logAuthCallback("missing-auth-params", {
      hasCode: Boolean(code),
      hasTokenHash: Boolean(tokenHash),
      authType,
      otpType
    });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    logAuthCallback("missing-user-after-exchange", {
      hasCode: Boolean(code),
      hasTokenHash: Boolean(tokenHash),
      authType
    });

    return buildLoginErrorRedirect(request, "auth-exchange-failed");
  }

  if (!isEmailVerified(user)) {
    logAuthCallback("user-not-verified", {
      authType,
      email: user.email
    });

    await supabase.auth.signOut();
    return buildLoginErrorRedirect(request, "email-not-verified");
  }

  if (!canAccessProtectedAppRoutes(user)) {
    logAuthCallback("user-not-authorized", {
      authType,
      email: user.email
    });

    await supabase.auth.signOut();
    return buildLoginErrorRedirect(request, "not-authorized");
  }

  if (authType === "recovery") {
    return NextResponse.redirect(new URL("/auth/reset-password", request.url));
  }

  try {
    const profile = await ensureAuthProfile(
      {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at ?? user.confirmed_at ?? null,
        confirmed_at: user.confirmed_at ?? user.email_confirmed_at ?? null
      },
      supabase
    );

    if (profileNeedsSetup(profile)) {
      logAuthCallback("profile-setup-required", {
        authType,
        email: user.email
      });

      return NextResponse.redirect(new URL("/profile/setup", request.url));
    }
  } catch (error) {
    logAuthCallback("profile-bootstrap-error", {
      authType,
      email: user.email,
      message: error instanceof Error ? error.message : "unknown"
    });

    await supabase.auth.signOut();
    return buildLoginErrorRedirect(request, "profile-setup-failed");
  }

  return response;
}
