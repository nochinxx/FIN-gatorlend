import type {
  ConnectedWallet,
  WalletAdapter,
  WalletAdapterStatus,
  WalletNetwork,
  WalletSubmitTransactionInput,
  WalletSubmitTransactionResult
} from "./types";

export class XamanAdapter implements WalletAdapter {
  public readonly id = "xaman";
  public readonly name = "Xaman";

  private status: WalletAdapterStatus = "idle";
  private address: string | null = null;
  private network: WalletNetwork = null;

  public getStatus(): WalletAdapterStatus {
    return this.status;
  }

  public getAddress(): string | null {
    return this.address;
  }

  public getNetwork(): WalletNetwork {
    return this.network;
  }

  public isAvailable(): boolean {
    return false;
  }

  public async connect(): Promise<ConnectedWallet> {
    this.status = "error";
    throw new Error("Xaman support is not implemented yet. Use Crossmark first.");
  }

  public async disconnect(): Promise<void> {
    this.address = null;
    this.network = null;
    this.status = "ready";
  }

  public async signAndSubmitTransaction(
    _transaction: WalletSubmitTransactionInput
  ): Promise<WalletSubmitTransactionResult> {
    this.status = "error";
    throw new Error("Xaman support is not implemented yet. Use Crossmark first.");
  }
}
