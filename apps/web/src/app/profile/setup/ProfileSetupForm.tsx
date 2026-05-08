"use client";

import { useActionState } from "react";

import { normalizeUsername, validateUsername } from "@/lib/auth/username";

import {
  completeProfileSetupAction,
  type ProfileSetupState
} from "./actions";

type ProfileSetupFormProps = {
  email: string;
  defaultDisplayName: string;
  defaultMajor: string;
  defaultStudentType: string;
  nextPath: string;
};

const initialState: ProfileSetupState = {
  error: null
};

export function ProfileSetupForm({
  email,
  defaultDisplayName,
  defaultMajor,
  defaultStudentType,
  nextPath
}: ProfileSetupFormProps) {
  const [state, formAction, isPending] = useActionState(completeProfileSetupAction, initialState);

  return (
    <form action={formAction} style={{ display: "grid", gap: "1rem" }}>
      <input type="hidden" name="next_path" value={nextPath} />

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
          pattern="^[a-z0-9](?:[a-z0-9_]{1,22})[a-z0-9]$"
          placeholder="gator_reader"
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
          defaultValue={defaultDisplayName}
          placeholder="Optional display name"
          style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7" }}
        />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Major</span>
        <input
          name="major"
          defaultValue={defaultMajor}
          placeholder="Optional major"
          style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7" }}
        />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Student type</span>
        <input
          name="student_type"
          defaultValue={defaultStudentType}
          placeholder="Optional student type"
          style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7" }}
        />
      </label>

      <p style={{ margin: 0, color: "#5a5a5a", lineHeight: 1.5, fontSize: 14 }}>
        Usernames are public inside the marketplace. Use 3 to 24 lowercase letters, numbers, or
        underscores.
      </p>

      {state.error ? (
        <p style={{ margin: 0, padding: "0.85rem 1rem", borderRadius: 12, background: "#fff3ef", color: "#7f2413" }}>
          {state.error}
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
        {isPending ? "Saving profile..." : "Finish profile setup"}
      </button>
    </form>
  );
}
