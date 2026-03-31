export type WalletAdapterStatus = "idle" | "ready" | "connecting" | "connected" | "error";

export type ConnectedWallet = {
  address: string;
  walletType: "crossmark" | "xaman";
};

export interface WalletAdapter {
  readonly id: "crossmark" | "xaman";
  readonly name: string;
  getStatus(): WalletAdapterStatus;
  isAvailable(): boolean;
  connect(): Promise<ConnectedWallet>;
  disconnect(): Promise<void>;
}
