"use client";

import { useState } from "react";

import {
  canAccessProtectedAppRoutes,
  canStartAuthFlow,
  isSfsuEmail
} from "@/lib/auth/access";
import { MIN_PASSWORD_LENGTH, validatePassword } from "@/lib/auth/password";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { PENDING_CONFIRM_EMAIL_KEY } from "@/lib/auth/confirm-key";

type LoginFormProps = {
  nextPath: string;
};

type AuthMode = "login" | "signup" | "forgot";

const buttonStyle = {
  padding: "0.9rem 1.2rem",
  borderRadius: 12,
  border: 0,
  background: "#111111",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer"
} as const;

export function LoginForm({ nextPath }: LoginFormProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (!canStartAuthFlow(email)) {
        throw new Error("Use your exact @sfsu.edu school email or approved tester account to access GatorLend.");
      }

      if (!password) {
        throw new Error("Password is required.");
      }

      const supabase = createSupabaseBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (signInError) {
        if (/email not confirmed/i.test(signInError.message)) {
          await supabase.auth.signOut();
          throw new Error("Please verify your email before accessing GatorLend.");
        }

        throw signInError;
      }

      if (!canAccessProtectedAppRoutes(data.user)) {
        await supabase.auth.signOut();

        if (isSfsuEmail(data.user?.email)) {
          throw new Error("Please verify your email before accessing GatorLend.");
        }

        throw new Error("Use a verified @sfsu.edu email or approved tester account to access GatorLend.");
      }

      window.location.assign(nextPath);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to log in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignupSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (!canStartAuthFlow(email)) {
        throw new Error("Use your exact @sfsu.edu school email or approved tester account to create an account.");
      }

      validatePassword(password);

      if (password !== confirmPassword) {
        throw new Error("Password and confirm password must match.");
      }

      const response = await fetch("/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        })
      });

      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to send verification email. Please try again in a few minutes.");
      }

      try {
        localStorage.setItem(PENDING_CONFIRM_EMAIL_KEY, email.trim().toLowerCase());
      } catch {
        // localStorage unavailable — confirm page will fall back to the manual button
      }

      setMessage("Check your email to verify your account. After verification, return here to log in.");
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForgotPasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (!canStartAuthFlow(email)) {
        throw new Error("Use your exact @sfsu.edu school email or approved tester account to reset your password.");
      }

      const response = await fetch("/auth/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase()
        })
      });

      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to send password reset email. Please try again in a few minutes.");
      }

      setMessage("If an account exists for that email, a password reset link has been sent.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to start password reset.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {([
          ["login", "Log in"],
          ["signup", "Sign up"],
          ["forgot", "Forgot password?"]
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value);
              setError(null);
              setMessage(null);
            }}
            style={{
              padding: "0.7rem 0.95rem",
              borderRadius: 999,
              border: value === mode ? "1px solid #111111" : "1px solid #d7d7d7",
              background: value === mode ? "#111111" : "#ffffff",
              color: value === mode ? "#ffffff" : "#111111",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "login" ? (
        <form onSubmit={handleLoginSubmit} style={{ display: "grid", gap: "1rem" }}>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ fontWeight: 600, color: "#222222" }}>School email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@sfsu.edu"
              style={{
                padding: "0.9rem 1rem",
                borderRadius: 12,
                border: "1px solid #d7d7d7",
                background: "#ffffff",
                color: "#111111"
              }}
            />
          </label>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ fontWeight: 600, color: "#222222" }}>Password</span>
            <input
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={{
                padding: "0.9rem 1rem",
                borderRadius: 12,
                border: "1px solid #d7d7d7",
                background: "#ffffff",
                color: "#111111"
              }}
            />
          </label>
          <button type="submit" disabled={isSubmitting} style={{ ...buttonStyle, opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>
      ) : null}

      {mode === "signup" ? (
        <form onSubmit={handleSignupSubmit} style={{ display: "grid", gap: "1rem" }}>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ fontWeight: 600, color: "#222222" }}>School email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@sfsu.edu"
              style={{
                padding: "0.9rem 1rem",
                borderRadius: 12,
                border: "1px solid #d7d7d7",
                background: "#ffffff",
                color: "#111111"
              }}
            />
          </label>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ fontWeight: 600, color: "#222222" }}>Password</span>
            <input
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={{
                padding: "0.9rem 1rem",
                borderRadius: 12,
                border: "1px solid #d7d7d7",
                background: "#ffffff",
                color: "#111111"
              }}
            />
          </label>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ fontWeight: 600, color: "#222222" }}>Confirm password</span>
            <input
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              style={{
                padding: "0.9rem 1rem",
                borderRadius: 12,
                border: "1px solid #d7d7d7",
                background: "#ffffff",
                color: "#111111"
              }}
            />
          </label>
          <button type="submit" disabled={isSubmitting} style={{ ...buttonStyle, opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      ) : null}

      {mode === "forgot" ? (
        <form onSubmit={handleForgotPasswordSubmit} style={{ display: "grid", gap: "1rem" }}>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ fontWeight: 600, color: "#222222" }}>School email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@sfsu.edu"
              style={{
                padding: "0.9rem 1rem",
                borderRadius: 12,
                border: "1px solid #d7d7d7",
                background: "#ffffff",
                color: "#111111"
              }}
            />
          </label>
          <button type="submit" disabled={isSubmitting} style={{ ...buttonStyle, opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? "Sending reset link..." : "Send reset link"}
          </button>
        </form>
      ) : null}

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

    </div>
  );
}
