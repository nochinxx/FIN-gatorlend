"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { textbookMetadataSchema } from "@gatorlend/core";
import { CrossmarkAdapter, type WalletAdapterStatus } from "@gatorlend/xrpl";
import { z } from "zod";

import {
  finalizeTextbookMintAction,
  prepareTextbookMintAction,
  type FinalizeTextbookMintActionResult
} from "./actions";

const createTextbookDraftSchema = z.object({
  asset_type: z.literal("textbook"),
  owner_wallet: z.string().min(1),
  image_url: z.string().url().or(z.literal("")),
  metadata: textbookMetadataSchema
});

type WalletPanelState = {
  status: WalletAdapterStatus;
  address: string | null;
  network: string | null;
  available: boolean;
  error: string | null;
};

const initialWalletState: WalletPanelState = {
  status: "idle",
  address: null,
  network: null,
  available: false,
  error: null
};

function SubmitButton({ disabled, isSubmitting }: { disabled: boolean; isSubmitting: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      style={{
        padding: "0.9rem 1.2rem",
        borderRadius: 12,
        border: 0,
        background: disabled ? "#899688" : "#17331d",
        color: "#fffaf0",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer"
      }}
    >
      {isSubmitting ? "Minting on XRPL..." : "Mint Textbook on XRPL"}
    </button>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = true,
  placeholder
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label style={{ display: "grid", gap: "0.35rem" }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        style={{
          padding: "0.85rem 0.95rem",
          borderRadius: 12,
          border: "1px solid #b4b09c",
          background: "#fffdf6"
        }}
      />
    </label>
  );
}

export function TextbookForm() {
  const adapterRef = useRef<CrossmarkAdapter | null>(null);
  const router = useRouter();
  const [walletState, setWalletState] = useState<WalletPanelState>(initialWalletState);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const adapter = new CrossmarkAdapter();
    adapterRef.current = adapter;

    setWalletState({
      status: adapter.isAvailable() ? "ready" : "idle",
      address: adapter.getAddress(),
      network: adapter.getNetwork(),
      available: adapter.isAvailable(),
      error: null
    });
  }, []);

  async function handleConnectWallet() {
    const adapter = adapterRef.current;

    if (!adapter) {
      return;
    }

    setWalletState((current) => ({
      ...current,
      status: "connecting",
      error: null
    }));

    try {
      const wallet = await adapter.connect();

      setWalletState({
        status: adapter.getStatus(),
        address: wallet.address,
        network: wallet.network,
        available: adapter.isAvailable(),
        error: null
      });
    } catch (error) {
      setWalletState({
        status: adapter.getStatus(),
        address: adapter.getAddress(),
        network: adapter.getNetwork(),
        available: adapter.isAvailable(),
        error: error instanceof Error ? error.message : "Failed to connect Crossmark."
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    const adapter = adapterRef.current;

    if (!adapter) {
      setSubmitError("Crossmark adapter is not ready yet.");
      setIsSubmitting(false);
      return;
    }

    if (!walletState.available) {
      setSubmitError("Crossmark is not available in this browser.");
      setIsSubmitting(false);
      return;
    }

    let ownerWallet = walletState.address;

    if (!ownerWallet) {
      try {
        const wallet = await adapter.connect();
        ownerWallet = wallet.address;
        setWalletState({
          status: adapter.getStatus(),
          address: wallet.address,
          network: wallet.network,
          available: adapter.isAvailable(),
          error: null
        });
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Failed to connect Crossmark.");
        setIsSubmitting(false);
        return;
      }
    }

    const formData = new FormData(event.currentTarget);
    const parsedDraft = createTextbookDraftSchema.safeParse({
      asset_type: "textbook",
      owner_wallet: ownerWallet,
      image_url: String(formData.get("image_url") ?? ""),
      metadata: {
        title: String(formData.get("title") ?? ""),
        author: String(formData.get("author") ?? ""),
        isbn: String(formData.get("isbn") ?? ""),
        course_code: String(formData.get("course_code") ?? ""),
        edition: String(formData.get("edition") ?? ""),
        condition: String(formData.get("condition") ?? "")
      }
    });

    if (!parsedDraft.success) {
      setSubmitError(parsedDraft.error.issues[0]?.message ?? "Please complete the textbook form.");
      setIsSubmitting(false);
      return;
    }

    try {
      const transaction = await prepareTextbookMintAction(parsedDraft.data);
      const signedResult = await adapter.signAndSubmitTransaction(transaction);

      if (!signedResult.hash) {
        setSubmitError("Crossmark did not return a transaction hash for the mint.");
        setIsSubmitting(false);
        return;
      }

      const result: FinalizeTextbookMintActionResult = await finalizeTextbookMintAction({
        ...parsedDraft.data,
        xrpl_transaction_hash: signedResult.hash
      });

      if (!result.ok) {
        setSubmitError(result.error);
        setIsSubmitting(false);
        return;
      }

      startTransition(() => {
        router.push(`/assets/${result.assetId}`);
        router.refresh();
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to mint textbook NFT.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
      <section
        style={{
          display: "grid",
          gap: "0.75rem",
          padding: "1rem",
          borderRadius: 16,
          background: "#f4eddc",
          border: "1px solid #d9d2be"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Connected wallet</h2>
            <p style={{ margin: "0.35rem 0 0", color: "#475447" }}>
              Textbook mints now come from the connected Crossmark wallet on XRPL testnet.
            </p>
          </div>
          <button
            type="button"
            onClick={handleConnectWallet}
            disabled={!walletState.available || walletState.status === "connecting" || isPending || isSubmitting}
            style={{
              padding: "0.8rem 1rem",
              borderRadius: 999,
              border: 0,
              background: "#17331d",
              color: "#fffaf0",
              fontWeight: 700,
              cursor:
                !walletState.available || walletState.status === "connecting" || isPending || isSubmitting
                  ? "not-allowed"
                  : "pointer"
            }}
          >
            {walletState.address ? "Reconnect Crossmark" : "Connect Crossmark"}
          </button>
        </div>
        <p style={{ margin: 0 }}>
          <strong>Status:</strong> {walletState.status}
        </p>
        <p style={{ margin: 0 }}>
          <strong>Address:</strong> {walletState.address ?? "Not connected"}
        </p>
        <p style={{ margin: 0 }}>
          <strong>Network:</strong> {walletState.network ?? "Unknown until connected"}
        </p>
        {!walletState.available ? (
          <p style={{ margin: 0, color: "#8b2414" }}>
            Crossmark was not detected. Install the extension and connect a funded XRPL testnet wallet.
          </p>
        ) : null}
        {walletState.error ? (
          <p style={{ margin: 0, color: "#8b2414" }}>
            <strong>Error:</strong> {walletState.error}
          </p>
        ) : null}
      </section>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
        }}
      >
        <Field label="Title" name="title" placeholder="Campbell Biology" />
        <Field label="Author" name="author" placeholder="Lisa Urry" />
        <Field label="ISBN" name="isbn" placeholder="9780134093413" />
        <Field label="Course Code" name="course_code" placeholder="BSC2010" />
        <Field label="Edition" name="edition" placeholder="11th" />
        <Field label="Condition" name="condition" placeholder="used-good" />
        <Field
          label="Image URL"
          name="image_url"
          type="url"
          required={false}
          placeholder="https://example.com/textbook.jpg"
        />
      </div>

      {submitError ? (
        <p
          style={{
            margin: 0,
            padding: "0.85rem 1rem",
            borderRadius: 12,
            background: "#ffe7de",
            color: "#7f2413"
          }}
        >
          {submitError}
        </p>
      ) : null}

      <SubmitButton
        disabled={isPending || isSubmitting || walletState.status === "connecting" || !walletState.available}
        isSubmitting={isSubmitting || isPending}
      />
    </form>
  );
}
