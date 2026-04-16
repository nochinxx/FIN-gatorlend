"use client";

import { useState } from "react";

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
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span style={{ fontWeight: 600 }}>Approved email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          style={{
            padding: "0.9rem 1rem",
            borderRadius: 12,
            border: "1px solid #b4b09c",
            background: "#fffdf6"
          }}
        />
      </label>

      {error ? (
        <p style={{ margin: 0, padding: "0.85rem 1rem", borderRadius: 12, background: "#ffe7de", color: "#7f2413" }}>
          {error}
        </p>
      ) : null}

      {message ? (
        <p style={{ margin: 0, padding: "0.85rem 1rem", borderRadius: 12, background: "#e9f4e3", color: "#17331d" }}>
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: "0.9rem 1.2rem",
          borderRadius: 12,
          border: 0,
          background: isSubmitting ? "#899688" : "#17331d",
          color: "#fffaf0",
          fontWeight: 700,
          cursor: isSubmitting ? "not-allowed" : "pointer"
        }}
      >
        {isSubmitting ? "Sending magic link..." : "Send magic link"}
      </button>
    </form>
  );
}
