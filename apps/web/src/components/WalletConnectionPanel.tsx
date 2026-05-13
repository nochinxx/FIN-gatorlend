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
  const [desktopOnly, setDesktopOnly] = useState(false);

  useEffect(() => {
    let adapter: CrossmarkAdapter;

    try {
      adapter = new CrossmarkAdapter();
    } catch {
      setDesktopOnly(true);
      return;
    }

    adapterRef.current = adapter;

    const unsubscribe = adapter.subscribe((walletState) => {
      setState((current) => ({ ...current, ...walletState }));
    });

    const syncFromAdapter = () => {
      setState((current) => ({ ...current, ...adapter.refreshState() }));
    };

    globalThis.addEventListener("focus", syncFromAdapter);

    return () => {
      globalThis.removeEventListener("focus", syncFromAdapter);
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

  if (desktopOnly) {
    return (
      <section style={{ padding: "1.25rem", borderRadius: 18, background: "#ffffff", border: "1px solid #ebebeb" }}>
        <h2 style={{ margin: 0, fontSize: "1rem" }}>Wallet</h2>
        <p style={{ margin: "0.5rem 0 0", color: "#5c5c5c", lineHeight: 1.5 }}>
          Crossmark wallet connection is only available on desktop browsers.
        </p>
      </section>
    );
  }

  return (
    <section
      style={{
        padding: "1.25rem",
        borderRadius: 18,
        background: "#ffffff",
        border: "1px solid #ebebeb"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1rem" }}>Wallet</h2>
          <p style={{ margin: "0.35rem 0 0", color: "#5c5c5c", lineHeight: 1.5 }}>Crossmark connection status</p>
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
              background: "#111111",
              color: "#ffffff",
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
              border: "1px solid #d7d7d7",
              background: "#ffffff",
              color: "#111111",
              fontWeight: 700,
              cursor: state.status !== "connected" ? "not-allowed" : "pointer"
            }}
          >
            Disconnect
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.85rem 1rem",
          marginTop: "1rem"
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "#6a6a6a", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Availability
          </p>
          <p style={{ margin: "0.25rem 0 0" }}>{state.available ? "Crossmark detected" : "Crossmark not detected"}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "#6a6a6a", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Status
          </p>
          <p style={{ margin: "0.25rem 0 0" }}>{state.status}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "#6a6a6a", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Address
          </p>
          <p style={{ margin: "0.25rem 0 0", wordBreak: "break-all" }}>{state.address ?? "Not connected"}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "#6a6a6a", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Network
          </p>
          <p style={{ margin: "0.25rem 0 0" }}>{formatNetworkDisplay(state.network)}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "#6a6a6a", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Testnet mint
          </p>
          <p style={{ margin: "0.25rem 0 0" }}>{state.isOnTestnet ? "Enabled" : "Blocked"}</p>
        </div>
        {state.error ? (
          <div>
            <p style={{ margin: 0, fontSize: 12, color: "#8b2414", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Error
            </p>
            <p style={{ margin: "0.25rem 0 0", color: "#8b2414", lineHeight: 1.5 }}>{state.error}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
