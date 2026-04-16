"use client";

import { useEffect, useRef, useState } from "react";

import { CrossmarkAdapter, type WalletState } from "@gatorlend/xrpl";

type WalletPanelState = WalletState & {
  error: string | null;
};

const initialState: WalletPanelState = {
  walletType: "crossmark",
  status: "idle",
  address: null,
  network: null,
  isOnTestnet: false,
  error: null,
  available: false
};

function formatNetworkDisplay(network: WalletState["network"]): string {
  if (!network) {
    return "Unknown until connected";
  }

  const parts = [network.protocol, network.label, network.type].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "Unknown network";
}

export function WalletConnectionPanel() {
  const adapterRef = useRef<CrossmarkAdapter | null>(null);
  const [state, setState] = useState<WalletPanelState>(initialState);

  useEffect(() => {
    const adapter = new CrossmarkAdapter();
    adapterRef.current = adapter;

    const unsubscribe = adapter.subscribe((walletState) => {
      setState((current) => ({
        ...current,
        ...walletState
      }));
    });

    const syncFromAdapter = () => {
      setState((current) => ({
        ...current,
        ...adapter.refreshState()
      }));
    };

    window.addEventListener("focus", syncFromAdapter);

    return () => {
      window.removeEventListener("focus", syncFromAdapter);
      unsubscribe();
    };
  }, []);

  async function handleConnect() {
    const adapter = adapterRef.current;

    if (!adapter) {
      return;
    }

    setState((current) => ({
      ...current,
      status: "connecting",
      error: null
    }));

    try {
      const wallet = await adapter.connect();

      setState({
        ...adapter.getState(),
        error: null,
      });
    } catch (error) {
      setState({
        ...adapter.getState(),
        error: error instanceof Error ? error.message : "Failed to connect wallet.",
      });
    }
  }

  async function handleDisconnect() {
    const adapter = adapterRef.current;

    if (!adapter) {
      return;
    }

    await adapter.disconnect();

    setState({
      ...adapter.getState(),
      error: null,
    });
  }

  return (
    <section
      style={{
        marginTop: "2rem",
        padding: "1.25rem",
        borderRadius: 18,
        background: "#fffaf0",
        border: "1px solid #d9d2be"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ marginTop: 0, marginBottom: "0.35rem" }}>Wallet</h2>
          <p style={{ margin: 0, color: "#475447" }}>
            Crossmark is the first wallet integration target for the web app.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            type="button"
            onClick={handleConnect}
            disabled={!state.available || state.status === "connecting"}
            style={{
              padding: "0.7rem 1rem",
              borderRadius: 999,
              border: 0,
              background: "#17331d",
              color: "#fffaf0",
              fontWeight: 700,
              cursor: !state.available || state.status === "connecting" ? "not-allowed" : "pointer"
            }}
          >
            {state.status === "connected" ? "Reconnect Crossmark" : "Connect Crossmark"}
          </button>
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={state.status !== "connected"}
            style={{
              padding: "0.7rem 1rem",
              borderRadius: 999,
              border: "1px solid #17331d",
              background: "#fffaf0",
              color: "#17331d",
              fontWeight: 700,
              cursor: state.status !== "connected" ? "not-allowed" : "pointer"
            }}
          >
            Disconnect
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: "0.35rem", marginTop: "1rem" }}>
        <p style={{ margin: 0 }}>
          <strong>Availability:</strong> {state.available ? "Crossmark detected" : "Crossmark not detected"}
        </p>
        <p style={{ margin: 0 }}>
          <strong>Status:</strong> {state.status}
        </p>
        <p style={{ margin: 0 }}>
          <strong>Address:</strong> {state.address ?? "Not connected"}
        </p>
        <p style={{ margin: 0 }}>
          <strong>Network:</strong> {formatNetworkDisplay(state.network)}
        </p>
        <p style={{ margin: 0 }}>
          <strong>Eligible for testnet mint:</strong> {state.isOnTestnet ? "Yes" : "No"}
        </p>
        {state.error ? (
          <p style={{ margin: 0, color: "#8b2414" }}>
            <strong>Error:</strong> {state.error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
