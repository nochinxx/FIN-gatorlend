export type WalletAdapterStatus = "idle" | "ready" | "connecting" | "connected" | "error";
export type WalletNetwork = {
  label: string | null;
  protocol: string | null;
  type: string | null;
  rpc: string | null;
  wss: string | null;
} | null;
export type WalletType = "crossmark" | "xaman";

export type WalletState = {
  walletType: WalletType;
  status: WalletAdapterStatus;
  address: string | null;
  network: WalletNetwork;
  isOnTestnet: boolean;
  available: boolean;
};

export type WalletSubmitTransactionInput = Record<string, unknown>;

export type WalletSubmitTransactionResult = {
  hash: string | null;
  result: unknown;
};

export type ConnectedWallet = {
  address: string;
  network: WalletNetwork;
  walletType: WalletType;
};

export type WalletStateListener = (state: WalletState) => void;

export interface WalletAdapter {
  readonly id: WalletType;
  readonly name: string;
  getStatus(): WalletAdapterStatus;
  getAddress(): string | null;
  getNetwork(): WalletNetwork;
  getState(): WalletState;
  isOnTestnet(): boolean;
  isAvailable(): boolean;
  connect(): Promise<ConnectedWallet>;
  disconnect(): Promise<void>;
  refreshState(): WalletState;
  subscribe(listener: WalletStateListener): () => void;
  signAndSubmitTransaction(
    transaction: WalletSubmitTransactionInput
  ): Promise<WalletSubmitTransactionResult>;
}
