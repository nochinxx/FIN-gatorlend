"use client";

import { useState } from "react";

import { canStartAuthFlow } from "@/lib/auth/access";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (!canStartAuthFlow(email)) {
        throw new Error("Use an @sfsu.edu email to access the marketplace demo.");
      }

      const supabase = createSupabaseBrowserClient();
      const redirectUrl = new URL("/auth/callback", window.location.origin);
      redirectUrl.searchParams.set("next", nextPath);

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl.toString()
        }
      });

      if (signInError) {
        throw signInError;
      }

      setMessage("Magic link sent. Open the email on this device and return through the link.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to send magic link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span style={{ fontWeight: 600, color: "#222222" }}>SFSU email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          style={{
            padding: "0.9rem 1rem",
            borderRadius: 12,
            border: "1px solid #d7d7d7",
            background: "#ffffff",
            color: "#111111"
          }}
        />
      </label>

      {error ? (
        <p
          style={{
            margin: 0,
            padding: "0.85rem 1rem",
            borderRadius: 12,
            background: "#fff3ef",
            color: "#7f2413"
          }}
        >
          {error}
        </p>
      ) : null}

      {message ? (
        <p
          style={{
            margin: 0,
            padding: "0.85rem 1rem",
            borderRadius: 12,
            background: "#f5f5f5",
            color: "#111111"
          }}
        >
          {message}
        </p>
      ) : null}

      <p style={{ margin: 0, color: "#5a5a5a", lineHeight: 1.5, fontSize: 14 }}>
        First-time magic link sign-in will create your account automatically after verification.
      </p>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: "0.9rem 1.2rem",
          borderRadius: 12,
          border: 0,
          background: isSubmitting ? "#8f8f8f" : "#111111",
          color: "#ffffff",
          fontWeight: 700,
          cursor: isSubmitting ? "not-allowed" : "pointer"
        }}
      >
        {isSubmitting ? "Sending magic link..." : "Continue with magic link"}
      </button>
    </form>
  );
}
