import sdk from "@crossmarkio/sdk";

import type {
  ConnectedWallet,
  WalletAdapter,
  WalletAdapterStatus,
  WalletNetwork,
  WalletSubmitTransactionInput,
  WalletSubmitTransactionResult
} from "./types";

function normalizeNetwork(network: unknown): WalletNetwork {
  if (!network) {
    return null;
  }

  if (typeof network === "string") {
    return network;
  }

  if (typeof network === "object") {
    for (const key of ["name", "label", "network", "slug", "id"]) {
      const value = (network as Record<string, unknown>)[key];

      if (typeof value === "string" && value.length > 0) {
        return value;
      }
    }
  }

  return null;
}

function extractAddress(response: unknown): string | null {
  if (typeof response !== "object" || !response) {
    return null;
  }

  const nestedData = (response as { response?: { data?: { address?: unknown } } }).response?.data;
  if (typeof nestedData?.address === "string" && nestedData.address.length > 0) {
    return nestedData.address;
  }

  const responseData = (response as { data?: { address?: unknown } }).data;
  if (typeof responseData?.address === "string" && responseData.address.length > 0) {
    return responseData.address;
  }

  return null;
}

function extractHash(response: unknown): string | null {
  if (typeof response !== "object" || !response) {
    return null;
  }

  const hash =
    (response as { response?: { data?: { resp?: { result?: { hash?: unknown } } } } }).response?.data
      ?.resp?.result?.hash ??
    (response as { response?: { data?: { resp?: { hash?: unknown } } } }).response?.data?.resp?.hash;

  return typeof hash === "string" && hash.length > 0 ? hash : null;
}

export class CrossmarkAdapter implements WalletAdapter {
  public readonly id = "crossmark";
  public readonly name = "Crossmark";

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
    return typeof window !== "undefined" && Boolean(sdk.sync.isInstalled());
  }

  public async connect(): Promise<ConnectedWallet> {
    this.status = "connecting";

    if (!this.isAvailable()) {
      this.status = "error";
      throw new Error("Crossmark is not available in this browser.");
    }

    const signInResponse = await sdk.methods.signInAndWait();
    const address = extractAddress(signInResponse);

    if (!address) {
      this.status = "error";
      throw new Error("Crossmark did not return a wallet address.");
    }

    this.address = address;
    this.network = normalizeNetwork(sdk.sync.getNetwork());
    this.status = "connected";

    return {
      address,
      network: this.network,
      walletType: "crossmark"
    };
  }

  public async disconnect(): Promise<void> {
    // Crossmark does not expose a public app-side sign-out method in the SDK surface used here.
    // This only clears the app session state and leaves the wallet extension itself untouched.
    this.address = null;
    this.network = null;
    this.status = "ready";
  }

  public async signAndSubmitTransaction(
    transaction: WalletSubmitTransactionInput
  ): Promise<WalletSubmitTransactionResult> {
    if (!this.address) {
      await this.connect();
    }

    const response = await sdk.methods.signAndSubmitAndWait(transaction as never);

    return {
      hash: extractHash(response),
      result: response
    };
  }
}
