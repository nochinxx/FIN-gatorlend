"use client";

import { useEffect, useRef, useState } from "react";

import { CrossmarkAdapter, type WalletAdapterStatus } from "@gatorlend/xrpl";

type WalletPanelState = {
  status: WalletAdapterStatus;
  address: string | null;
  network: string | null;
  error: string | null;
  available: boolean;
};

const initialState: WalletPanelState = {
  status: "idle",
  address: null,
  network: null,
  error: null,
  available: false
};

export function WalletConnectionPanel() {
  const adapterRef = useRef<CrossmarkAdapter | null>(null);
  const [state, setState] = useState<WalletPanelState>(initialState);

  useEffect(() => {
    const adapter = new CrossmarkAdapter();
    adapterRef.current = adapter;

    setState({
      status: adapter.isAvailable() ? "ready" : "idle",
      address: adapter.getAddress(),
      network: adapter.getNetwork(),
      error: null,
      available: adapter.isAvailable()
    });
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
        status: adapter.getStatus(),
        address: wallet.address,
        network: wallet.network,
        error: null,
        available: adapter.isAvailable()
      });
    } catch (error) {
      setState({
        status: adapter.getStatus(),
        address: adapter.getAddress(),
        network: adapter.getNetwork(),
        error: error instanceof Error ? error.message : "Failed to connect wallet.",
        available: adapter.isAvailable()
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
      status: adapter.getStatus(),
      address: adapter.getAddress(),
      network: adapter.getNetwork(),
      error: null,
      available: adapter.isAvailable()
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
          <strong>Network:</strong> {state.network ?? "Unknown until connected"}
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
