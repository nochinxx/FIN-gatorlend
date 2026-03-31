import type { ConnectedWallet, WalletAdapter, WalletAdapterStatus } from "./types";

type CrossmarkProvider = {
  // TODO: replace with the official Crossmark browser API surface when integration starts.
  signIn?: () => Promise<{ address: string }>;
};

declare global {
  interface Window {
    crossmark?: CrossmarkProvider;
  }
}

export class CrossmarkAdapter implements WalletAdapter {
  public readonly id = "crossmark";
  public readonly name = "Crossmark";

  private status: WalletAdapterStatus = "idle";

  public getStatus(): WalletAdapterStatus {
    return this.status;
  }

  public isAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.crossmark !== "undefined";
  }

  public async connect(): Promise<ConnectedWallet> {
    this.status = "connecting";

    if (!this.isAvailable()) {
      this.status = "error";
      throw new Error("Crossmark is not available in this browser.");
    }

    // TODO: wire the official Crossmark SDK or injected provider here.
    this.status = "error";
    throw new Error("Crossmark adapter is a scaffold placeholder.");
  }

  public async disconnect(): Promise<void> {
    // TODO: clear local wallet session state when Crossmark integration is implemented.
    this.status = "ready";
  }
}
