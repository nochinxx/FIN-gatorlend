import type { ConnectedWallet, WalletAdapter, WalletAdapterStatus } from "./types";

export class XamanAdapter implements WalletAdapter {
  public readonly id = "xaman";
  public readonly name = "Xaman";

  private status: WalletAdapterStatus = "idle";

  public getStatus(): WalletAdapterStatus {
    return this.status;
  }

  public isAvailable(): boolean {
    return false;
  }

  public async connect(): Promise<ConnectedWallet> {
    this.status = "error";
    throw new Error("Xaman support is not implemented yet. Use Crossmark first.");
  }

  public async disconnect(): Promise<void> {
    this.status = "ready";
  }
}
