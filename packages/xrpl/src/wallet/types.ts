export type WalletAdapterStatus = "idle" | "ready" | "connecting" | "connected" | "error";
export type WalletNetwork = string | null;

export type WalletSubmitTransactionInput = Record<string, unknown>;

export type WalletSubmitTransactionResult = {
  hash: string | null;
  result: unknown;
};

export type ConnectedWallet = {
  address: string;
  network: WalletNetwork;
  walletType: "crossmark" | "xaman";
};

export interface WalletAdapter {
  readonly id: "crossmark" | "xaman";
  readonly name: string;
  getStatus(): WalletAdapterStatus;
  getAddress(): string | null;
  getNetwork(): WalletNetwork;
  isAvailable(): boolean;
  connect(): Promise<ConnectedWallet>;
  disconnect(): Promise<void>;
  signAndSubmitTransaction(
    transaction: WalletSubmitTransactionInput
  ): Promise<WalletSubmitTransactionResult>;
}
