"use client";

import { useState } from "react";

import { MIN_PASSWORD_LENGTH, validatePassword } from "@/lib/auth/password";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const inputStyle = {
  padding: "0.9rem",
  borderRadius: 12,
  border: "1px solid #2a2a2a",
  background: "#141414",
  color: "#e5e5e5"
} as const;

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      validatePassword(password);

      if (password !== confirmPassword) {
        throw new Error("Password and confirm password must match.");
      }

      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password
      });

      if (updateError) {
        throw updateError;
      }

      setMessage("Password updated. Redirecting back to the app...");
      window.setTimeout(() => {
        window.location.assign("/marketplace");
      }, 600);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>New password</span>
        <input
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Confirm new password</span>
        <input
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          style={inputStyle}
        />
      </label>

      {error ? (
        <p style={{ margin: 0, padding: "0.85rem 1rem", borderRadius: 12, background: "rgba(239,68,68,0.12)", color: "#fca5a5" }}>
          {error}
        </p>
      ) : null}

      {message ? (
        <p style={{ margin: 0, padding: "0.85rem 1rem", borderRadius: 12, background: "rgba(34,197,94,0.12)", color: "#86efac" }}>
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: "fit-content",
          padding: "0.9rem 1.2rem",
          borderRadius: 999,
          border: 0,
          background: isSubmitting ? "#8f8f8f" : "#111111",
          color: "#ffffff",
          fontWeight: 700,
          cursor: isSubmitting ? "not-allowed" : "pointer"
        }}
      >
        {isSubmitting ? "Updating password..." : "Update password"}
      </button>
    </form>
  );
}
