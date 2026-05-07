"use client";

import { useActionState } from "react";

import {
  PUBLIC_ASSET_TYPE_LABELS,
  PUBLIC_ASSET_TYPE_OPTIONS,
  PUBLIC_LISTING_TYPE_OPTIONS
} from "@/lib/marketplace/publicOptions";

import { createListingAction, type CreateListingFormState } from "./actions";

const initialState: CreateListingFormState = {
  error: null
};

export function CreateListingForm() {
  const [state, formAction, isPending] = useActionState(createListingAction, initialState);

  return (
    <form action={formAction} style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span>Asset type</span>
          <select name="asset_type" defaultValue="textbook" style={{ padding: "0.85rem", borderRadius: 12, border: "1px solid #d7d7d7" }}>
            {PUBLIC_ASSET_TYPE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {PUBLIC_ASSET_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span>Listing type</span>
          <select name="listing_type" defaultValue="sell" style={{ padding: "0.85rem", borderRadius: 12, border: "1px solid #d7d7d7" }}>
            {PUBLIC_LISTING_TYPE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Title</span>
        <input name="title" required style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7" }} />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Description</span>
        <textarea name="description" rows={4} style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7" }} />
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span>Condition</span>
          <input name="condition" style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7" }} />
        </label>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span>Image URL</span>
          <input name="image_url" placeholder="/images/textbook.jpg" style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7" }} />
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span>Reference value</span>
          <input name="price_amount" inputMode="decimal" style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7" }} />
        </label>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span>Reference type</span>
          <input name="price_type" placeholder="estimate, replacement, note" style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7" }} />
        </label>
      </div>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Exchange preferences</span>
        <input name="payment_methods" placeholder="meet near library, weekday afternoon, flexible" style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7" }} />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span>Metadata JSON</span>
        <textarea
          name="metadata"
          rows={6}
          defaultValue={"{}"}
          style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7", fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
        />
      </label>

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
        {isPending ? "Creating listing..." : "Create listing"}
      </button>
    </form>
  );
}
