"use client";

import { useActionState, useState } from "react";

import {
  DEFAULT_MARKETPLACE_ASSET_TYPE_SUGGESTIONS,
  formatMarketplaceAssetTypeLabel
} from "@/lib/marketplace/assetTypes";
import {
  LISTING_IMAGE_ALLOWED_TYPES,
  LISTING_IMAGE_MAX_COUNT,
  LISTING_IMAGE_MAX_BYTES,
  validateListingImageFiles
} from "@/lib/marketplace/listingImages";
import {
  PUBLIC_LISTING_TYPE_LABELS,
  PUBLIC_LISTING_TYPE_OPTIONS
} from "@/lib/marketplace/publicOptions";

import { createListingAction, type CreateListingFormState } from "./actions";

const initialState: CreateListingFormState = {
  error: null
};

type CreateListingFormProps = {
  assetTypeSuggestions: string[];
};

export function CreateListingForm({ assetTypeSuggestions }: CreateListingFormProps) {
  const [state, formAction, isPending] = useActionState(createListingAction, initialState);
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Array<{ name: string; url: string }>>([]);
  const visibleSuggestions = assetTypeSuggestions.slice(0, 3);
  const [assetTypeValue, setAssetTypeValue] = useState(
    visibleSuggestions[0] ?? DEFAULT_MARKETPLACE_ASSET_TYPE_SUGGESTIONS[0]
  );

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    try {
      validateListingImageFiles(files, {
        requireAtLeastOne: files.length > 0
      });
      for (const preview of previewUrls) {
        URL.revokeObjectURL(preview.url);
      }

      const nextPreviewUrls = files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file)
      }));
      setSelectedFiles(files);
      setPreviewUrls(nextPreviewUrls);
      setLocalError(null);
    } catch (error) {
      setSelectedFiles([]);
      setPreviewUrls([]);
      setLocalError(error instanceof Error ? error.message : "Unable to validate images.");
      event.target.value = "";
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    try {
      validateListingImageFiles(selectedFiles, {
        requireAtLeastOne: true
      });
      setLocalError(null);
    } catch (error) {
      event.preventDefault();
      setLocalError(error instanceof Error ? error.message : "Unable to validate images.");
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
      <section style={{ display: "grid", gap: "0.85rem" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Add photos of your item</h2>
          <p style={{ margin: "0.35rem 0 0", color: "#4f4f4f", lineHeight: 1.6 }}>
            Clear photos help other students understand condition before requesting.
          </p>
        </div>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span>
            Upload 1 to {LISTING_IMAGE_MAX_COUNT} photos
          </span>
          <input
            type="file"
            name="images"
            required
            multiple
            accept={LISTING_IMAGE_ALLOWED_TYPES.join(",")}
            onChange={handleFileChange}
            style={{ padding: "0.85rem", borderRadius: 12, border: "1px solid #d7d7d7" }}
          />
        </label>
        <p style={{ margin: 0, color: "#5a5a5a", fontSize: 14 }}>
          Accepted types: JPEG, PNG, WEBP. Max size: {Math.round(LISTING_IMAGE_MAX_BYTES / (1024 * 1024))}MB each.
        </p>
        <p
          style={{
            margin: 0,
            padding: "0.9rem 1rem",
            borderRadius: 14,
            background: "#fff8ea",
            color: "#6a4c00",
            lineHeight: 1.6
          }}
        >
          Only upload photos of the item. Do not upload IDs, personal documents, faces, private information, or anything sensitive.
        </p>

        {previewUrls.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 132px))", gap: "0.85rem" }}>
            {previewUrls.map((preview, index) => (
              <figure
                key={`${preview.name}-${index}`}
                style={{
                  margin: 0,
                  display: "grid",
                  gap: "0.45rem"
                }}
              >
                <div
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 16,
                    border: "1px solid #ebebeb",
                    aspectRatio: "1 / 1",
                    background: "#f7f7f7"
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview.url}
                    alt={preview.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <figcaption style={{ fontSize: 12, color: "#5a5a5a", lineHeight: 1.4 }}>
                  {index === 0 ? "Cover image" : `Image ${index + 1}`}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span>Asset type</span>
          <input
            name="asset_type"
            list="marketplace-asset-type-suggestions"
            value={assetTypeValue}
            onChange={(event) => setAssetTypeValue(event.target.value)}
            placeholder="textbook, lab coat, tutoring, calculator"
            style={{ padding: "0.85rem", borderRadius: 12, border: "1px solid #d7d7d7" }}
          />
        </label>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span>Listing type</span>
          <select name="listing_type" defaultValue="sell" style={{ padding: "0.85rem", borderRadius: 12, border: "1px solid #d7d7d7" }}>
            {PUBLIC_LISTING_TYPE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {PUBLIC_LISTING_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <datalist id="marketplace-asset-type-suggestions">
        {assetTypeSuggestions.map((value) => (
          <option key={value} value={value} />
        ))}
      </datalist>

      <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap", marginTop: "-0.35rem" }}>
        {visibleSuggestions.map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => setAssetTypeValue(value)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.45rem 0.7rem",
              borderRadius: 999,
              border: 0,
              background: assetTypeValue === value ? "#17331d" : "#f3f3f3",
              color: assetTypeValue === value ? "#ffffff" : "#444444",
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            {formatMarketplaceAssetTypeLabel(value)}
          </button>
        ))}
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
          <select name="condition" defaultValue="" style={{ padding: "0.9rem", borderRadius: 12, border: "1px solid #d7d7d7" }}>
            <option value="" disabled>Select condition</option>
            <option value="new">New</option>
            <option value="like_new">Like new</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="worn">Worn</option>
          </select>
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

      <input type="hidden" name="metadata" value="{}" />

      {localError || state.error ? (
        <p style={{ margin: 0, padding: "0.85rem 1rem", borderRadius: 12, background: "#fff3ef", color: "#7f2413" }}>
          {localError ?? state.error}
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
