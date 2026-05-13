"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { EmailOtpType } from "@supabase/supabase-js";

import {
  canAccessProtectedAppRoutes,
  isEmailVerified
} from "@/lib/auth/access";
import { PENDING_CONFIRM_EMAIL_KEY } from "@/lib/auth/confirm-key";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

// "checking"  — reading localStorage, deciding whether to auto-submit
// "prompt"    — no localStorage key found; waiting for user to click
// "working"   — token exchange in progress (auto or manual)
type Stage = "checking" | "prompt" | "working";

function sanitizeNextPath(nextPath: string | undefined): string {
  return nextPath?.startsWith("/") ? nextPath : "/marketplace";
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

type SupabaseBrowserClient = ReturnType<typeof createSupabaseBrowserClient>;

function redirectToLogin(reason: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[auth/confirm] redirecting to login", { reason });
  }

  globalThis.location.assign(`/login?error=${encodeURIComponent(reason)}`);
}

function otpErrorReason(code: string | undefined): string {
  return code === "otp_expired" ? "magic-link-expired" : "auth-exchange-failed";
}

async function exchangeToken(
  supabase: SupabaseBrowserClient,
  code: string | null,
  tokenHash: string | null,
  otpType: EmailOtpType | null,
  hasAccessToken: boolean
): Promise<string | null> {
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return error ? otpErrorReason(error.code) : null;
  }

  if (tokenHash && otpType) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType });
    return error ? otpErrorReason(error.code) : null;
  }

  return hasAccessToken ? null : "auth-exchange-failed";
}

export function ConfirmAuthClient() {
  const [stage, setStage] = useState<Stage>("checking");
  const searchParams = useSearchParams();

  async function completeAuth() {
    const hashParams = new URLSearchParams(globalThis.location.hash.replace(/^#/, ""));

    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash") ?? hashParams.get("token_hash");
    const authErrorCode = searchParams.get("error_code") ?? hashParams.get("error_code");
    const authError = searchParams.get("error") ?? hashParams.get("error");
    const authType = searchParams.get("type") ?? hashParams.get("type");
    const otpType = getOtpType(authType);
    const hasAccessToken = Boolean(hashParams.get("access_token"));
    const nextPath = sanitizeNextPath(searchParams.get("next") ?? undefined);

    if (authError || authErrorCode) {
      redirectToLogin(authErrorCode === "otp_expired" ? "magic-link-expired" : "auth-exchange-failed");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const exchangeError = await exchangeToken(supabase, code, tokenHash, otpType, hasAccessToken);

    if (exchangeError) {
      redirectToLogin(exchangeError);
      return;
    }

    try {
      localStorage.removeItem(PENDING_CONFIRM_EMAIL_KEY);
    } catch {
      // ignore
    }

    const { data: { user } } = await supabase.auth.getUser();

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

    globalThis.location.assign(authType === "recovery" ? "/auth/reset-password" : nextPath);
  }

  function handleConfirmClick() {
    setStage("working");
    void completeAuth();
  }

  useEffect(() => {
    let hasPendingEmail = false;

    try {
      hasPendingEmail = Boolean(localStorage.getItem(PENDING_CONFIRM_EMAIL_KEY));
    } catch {
      // localStorage unavailable — treat as no key
    }

    if (hasPendingEmail) {
      setStage("working");
      void completeAuth();
    } else {
      setStage("prompt");
    }
  // searchParams is stable after mount; exhaustive-deps would add it but it never changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 520,
    padding: "2rem",
    borderRadius: 24,
    background: "#ffffff",
    border: "1px solid #ebebeb",
    boxShadow: "0 10px 40px rgba(17, 17, 17, 0.05)",
    textAlign: "center",
    display: "grid",
    gap: "1.2rem"
  };

  if (stage === "checking" || stage === "working") {
    return (
      <section style={cardStyle}>
        <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>Finishing sign-in</h1>
        <p style={{ margin: 0, lineHeight: 1.6, color: "#4f4f4f" }}>Signing you in&hellip;</p>
      </section>
    );
  }

  return (
    <section style={cardStyle}>
      <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>Confirm sign-in</h1>
      <p style={{ margin: 0, lineHeight: 1.6, color: "#4f4f4f" }}>
        Click below to complete your sign-in. Make sure you&rsquo;re opening this link in the same
        browser where you signed up.
      </p>
      <button
        type="button"
        onClick={handleConfirmClick}
        style={{
          padding: "0.9rem 1.2rem",
          borderRadius: 12,
          border: 0,
          background: "#111111",
          color: "#ffffff",
          fontWeight: 700,
          cursor: "pointer",
          fontSize: "1rem"
        }}
      >
        Sign me in
      </button>
    </section>
  );
}
