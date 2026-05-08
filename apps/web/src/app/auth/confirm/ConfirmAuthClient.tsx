"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { EmailOtpType } from "@supabase/supabase-js";

import {
  canAccessProtectedAppRoutes,
  isEmailVerified
} from "@/lib/auth/access";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function sanitizeNextPath(nextPath: string | undefined): string {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/marketplace";
  }

  return nextPath;
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

function redirectToLogin(reason: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[auth/confirm] redirecting to login", { reason });
  }

  window.location.assign(`/login?error=${encodeURIComponent(reason)}`);
}

export function ConfirmAuthClient() {
  const [message, setMessage] = useState("Confirming your email link...");
  const searchParams = useSearchParams();

  useEffect(() => {
    let isCancelled = false;

    async function completeAuth() {
      const nextPath = sanitizeNextPath(searchParams.get("next") ?? undefined);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash") ?? hashParams.get("token_hash");
      const authErrorCode = searchParams.get("error_code") ?? hashParams.get("error_code");
      const authError = searchParams.get("error") ?? hashParams.get("error");
      const authType = searchParams.get("type") ?? hashParams.get("type");
      const otpType = getOtpType(authType);
      const hasAccessToken = Boolean(hashParams.get("access_token"));

      if (process.env.NODE_ENV !== "production") {
        console.log("[auth/confirm] incoming", {
          href: window.location.href,
          pathname: window.location.pathname,
          search: window.location.search,
          hashKeys: Array.from(hashParams.keys()),
          hasCode: Boolean(code),
          hasTokenHash: Boolean(tokenHash),
          hasAccessToken,
          authErrorCode,
          authError,
          authType,
          otpType,
          nextPath
        });
      }

      if (authError || authErrorCode) {
        redirectToLogin(authErrorCode === "otp_expired" ? "magic-link-expired" : "auth-exchange-failed");
        return;
      }

      const supabase = createSupabaseBrowserClient();

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          if (process.env.NODE_ENV !== "production") {
            console.log("[auth/confirm] exchangeCodeForSession error", {
              code: error.code,
              message: error.message
            });
          }

          redirectToLogin(error.code === "otp_expired" ? "magic-link-expired" : "auth-exchange-failed");
          return;
        }

        if (process.env.NODE_ENV !== "production") {
          console.log("[auth/confirm] exchangeCodeForSession success");
        }
      } else if (tokenHash && otpType) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType
        });

        if (error) {
          if (process.env.NODE_ENV !== "production") {
            console.log("[auth/confirm] verifyOtp error", {
              code: error.code,
              message: error.message,
              authType: otpType
            });
          }

          redirectToLogin(error.code === "otp_expired" ? "magic-link-expired" : "auth-exchange-failed");
          return;
        }

        if (process.env.NODE_ENV !== "production") {
          console.log("[auth/confirm] verifyOtp success", {
            authType: otpType
          });
        }
      } else if (!hasAccessToken) {
        if (process.env.NODE_ENV !== "production") {
          console.log("[auth/confirm] missing usable auth params");
        }

        redirectToLogin("auth-exchange-failed");
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (process.env.NODE_ENV !== "production") {
        console.log("[auth/confirm] session after exchange", {
          hasSession: Boolean(session),
          hasAccessToken: Boolean(session?.access_token),
          userId: session?.user?.id ?? null,
          email: session?.user?.email ?? null
        });
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (process.env.NODE_ENV !== "production") {
        console.log("[auth/confirm] user after exchange", {
          hasUser: Boolean(user),
          email: user?.email ?? null,
          emailConfirmedAt: user?.email_confirmed_at ?? null
        });
      }

      if (!user?.email) {
        redirectToLogin("auth-exchange-failed");
        return;
      }

      if (!isEmailVerified(user)) {
        await supabase.auth.signOut();
        redirectToLogin("email-not-verified");
        return;
      }

      if (!canAccessProtectedAppRoutes(user)) {
        await supabase.auth.signOut();
        redirectToLogin("not-authorized");
        return;
      }

      if (!isCancelled) {
        setMessage(authType === "recovery" ? "Opening password reset..." : "Redirecting to your account...");
      }

      window.location.assign(authType === "recovery" ? "/auth/reset-password" : nextPath);
    }

    void completeAuth();

    return () => {
      isCancelled = true;
    };
  }, [searchParams]);

  return (
    <section
      style={{
        width: "100%",
        maxWidth: 520,
        padding: "2rem",
        borderRadius: 24,
        background: "#ffffff",
        border: "1px solid #ebebeb",
        boxShadow: "0 10px 40px rgba(17, 17, 17, 0.05)",
        textAlign: "center"
      }}
    >
      <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>Finishing sign-in</h1>
      <p style={{ margin: "0.9rem 0 0", lineHeight: 1.6, color: "#4f4f4f" }}>{message}</p>
    </section>
  );
}
