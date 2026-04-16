"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { textbookMetadataSchema } from "@gatorlend/core";
import { CrossmarkAdapter, type WalletState } from "@gatorlend/xrpl";
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

type WalletPanelState = WalletState & {
  error: string | null;
};

const initialWalletState: WalletPanelState = {
  walletType: "crossmark",
  status: "idle",
  address: null,
  network: null,
  isOnTestnet: false,
  available: false,
  error: null
};

function getWalletRequirementMessage(walletState: WalletPanelState): string | null {
  if (!walletState.available) {
    return "Install Crossmark to mint textbooks from a wallet.";
  }

  if (!walletState.address) {
    return "Connect Crossmark before minting a textbook NFT.";
  }

  if (!walletState.network) {
    return "Crossmark network could not be detected. Reconnect and confirm XRPL testnet.";
  }

  if (!walletState.isOnTestnet) {
    return `Switch Crossmark to XRPL testnet before minting. Current network: ${formatNetworkDisplay(walletState.network)}.`;
  }

  return null;
}

function formatNetworkDisplay(network: WalletState["network"]): string {
  if (!network) {
    return "Unknown until connected";
  }

  const parts = [network.protocol, network.label, network.type].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "Unknown network";
}

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
  const [pendingRegistrationHash, setPendingRegistrationHash] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const mintRequirementMessage = getWalletRequirementMessage(walletState);
  const canMint =
    walletState.available &&
    walletState.status === "connected" &&
    Boolean(walletState.address) &&
    walletState.isOnTestnet &&
    mintRequirementMessage === null;

  useEffect(() => {
    const adapter = new CrossmarkAdapter();
    adapterRef.current = adapter;

    const applyWalletState = (state: WalletState) => {
      setWalletState((current) => ({
        ...current,
        ...state
      }));
    };

    const unsubscribe = adapter.subscribe(applyWalletState);
    const syncFromAdapter = () => {
      applyWalletState(adapter.refreshState());
    };

    window.addEventListener("focus", syncFromAdapter);

    return () => {
      window.removeEventListener("focus", syncFromAdapter);
      unsubscribe();
    };
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
      await adapter.connect();

      setWalletState({
        ...adapter.getState(),
        error: null
      });
    } catch (error) {
      setWalletState({
        ...adapter.getState(),
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

    const currentWalletState = adapter.refreshState();
    setWalletState((current) => ({
      ...current,
      ...currentWalletState
    }));

    const currentRequirementMessage = getWalletRequirementMessage({
      ...walletState,
      ...currentWalletState
    });

    if (currentRequirementMessage) {
      setSubmitError(currentRequirementMessage);
      setIsSubmitting(false);
      return;
    }

    const ownerWallet = currentWalletState.address;

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
      const transactionHash = pendingRegistrationHash
        ? pendingRegistrationHash
        : await (async () => {
            const transaction = await prepareTextbookMintAction(parsedDraft.data);
            const signedResult = await adapter.signAndSubmitTransaction(transaction);

            if (!signedResult.hash) {
              throw new Error("Crossmark did not return a transaction hash for the mint.");
            }

            return signedResult.hash;
          })();

      const result: FinalizeTextbookMintActionResult = await finalizeTextbookMintAction({
        ...parsedDraft.data,
        xrpl_transaction_hash: transactionHash
      });

      if (!result.ok) {
        setPendingRegistrationHash(transactionHash);
        setSubmitError(
          `${result.error} Mint may already be on-chain. Use the same form state and try finalization again. Transaction hash: ${transactionHash}`
        );
        setIsSubmitting(false);
        return;
      }

      setPendingRegistrationHash(null);

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
          <strong>Network:</strong> {formatNetworkDisplay(walletState.network)}
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
        {mintRequirementMessage ? (
          <p style={{ margin: 0, color: "#8b2414", fontWeight: 600 }}>{mintRequirementMessage}</p>
        ) : (
          <p style={{ margin: 0, color: "#17331d", fontWeight: 600 }}>
            Wallet connected on XRPL testnet. Minting is enabled.
          </p>
        )}
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

      {pendingRegistrationHash ? (
        <p
          style={{
            margin: 0,
            padding: "0.85rem 1rem",
            borderRadius: 12,
            background: "#fff1d6",
            color: "#6b4a00"
          }}
        >
          A mint transaction was already signed and submitted. Submitting again will retry registration
          only with transaction hash {pendingRegistrationHash}.
        </p>
      ) : null}

      <SubmitButton
        disabled={!canMint || isPending || isSubmitting || walletState.status === "connecting"}
        isSubmitting={isSubmitting || isPending}
      />
    </form>
  );
}
