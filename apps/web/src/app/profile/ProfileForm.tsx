"use client";

import { useActionState } from "react";

import { normalizeUsername, validateUsername } from "@/lib/auth/username";

import { updateProfileAction, type ProfileFormState } from "./actions";

type ProfileFormProps = {
  email: string;
  username: string;
  displayName: string;
  major: string;
  studentType: string;
  bio: string;
  walletAddress: string;
};

const initialState: ProfileFormState = {
  error: null,
  success: null
};

export function ProfileForm({
  email,
  username,
  displayName,
  major,
  studentType,
  bio,
  walletAddress
}: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} style={{ display: "grid", gap: "1rem" }}>
      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>School email</span>
        <input
          value={email}
          readOnly
          style={{
            padding: "0.9rem",
            borderRadius: 12,
            border: "1px solid #d7d7d7",
            background: "#f5f5f5"
          }}
        />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Username</span>
        <input
          name="username"
          required
          minLength={3}
          maxLength={24}
          defaultValue={username}
          pattern="^[a-z0-9](?:[a-z0-9_]{1,22})[a-z0-9]$"
          onChange={(event) => {
            event.currentTarget.value = normalizeUsername(event.currentTarget.value);
            event.currentTarget.setCustomValidity("");

            try {
              validateUsername(event.currentTarget.value);
            } catch (error) {
              event.currentTarget.setCustomValidity(
                error instanceof Error ? error.message : "Enter a valid username."
              );
            }
          }}
          style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7" }}
        />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Display name</span>
        <input
          name="display_name"
          defaultValue={displayName}
          style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7" }}
        />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Major</span>
        <input
          name="major"
          defaultValue={major}
          style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7" }}
        />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Student type</span>
        <input
          name="student_type"
          defaultValue={studentType}
          style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7" }}
        />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Bio</span>
        <textarea
          name="bio"
          rows={4}
          defaultValue={bio}
          style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7" }}
        />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Wallet address</span>
        <input
          name="wallet_address"
          defaultValue={walletAddress}
          placeholder="Optional XRPL wallet"
          style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7" }}
        />
      </label>

      {state.error ? (
        <p style={{ margin: 0, padding: "0.85rem 1rem", borderRadius: 12, background: "#fff3ef", color: "#7f2413" }}>
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p style={{ margin: 0, padding: "0.85rem 1rem", borderRadius: 12, background: "#edf7ef", color: "#1f5f30" }}>
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        style={{
          width: "fit-content",
          padding: "0.9rem 1.2rem",
          borderRadius: 999,
          border: 0,
          background: isPending ? "#8f8f8f" : "#111111",
          color: "#ffffff",
          fontWeight: 700,
          cursor: isPending ? "not-allowed" : "pointer"
        }}
      >
        {isPending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
