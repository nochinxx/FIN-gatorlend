import sdk, { typings } from "@crossmarkio/sdk";

import type {
  ConnectedWallet,
  WalletAdapter,
  WalletAdapterStatus,
  WalletNetwork,
  WalletState,
  WalletStateListener,
  WalletSubmitTransactionInput,
  WalletSubmitTransactionResult
} from "./types";

function isTestnetNetwork(network: WalletNetwork): boolean {
  if (!network) {
    return false;
  }

  return network.type?.trim().toLowerCase() === "testnet";
}

function getString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function normalizeNetworkRecord(network: Record<string, unknown>): NonNullable<WalletNetwork> {
  return {
    label: getString(network, "label") ?? getString(network, "name"),
    protocol: getString(network, "protocol"),
    type: getString(network, "type"),
    rpc: getString(network, "rpc"),
    wss: getString(network, "wss")
  };
}

function extractNetworkValue(value: unknown): WalletNetwork {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const nestedNetwork = record.network;

  if (nestedNetwork && typeof nestedNetwork === "object") {
    return normalizeNetworkRecord(nestedNetwork as Record<string, unknown>);
  }

  return normalizeNetworkRecord(record);
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
  private listeners = new Set<WalletStateListener>();
  private unsubscribeSdkEvents: (() => void) | null = null;

  public getStatus(): WalletAdapterStatus {
    return this.status;
  }

  public getAddress(): string | null {
    return this.address;
  }

  public getNetwork(): WalletNetwork {
    return this.network;
  }

  public getState(): WalletState {
    return {
      walletType: this.id,
      status: this.status,
      address: this.address,
      network: this.network,
      isOnTestnet: this.isOnTestnet(),
      available: this.isAvailable()
    };
  }

  public isOnTestnet(): boolean {
    return isTestnetNetwork(this.network);
  }

  public isAvailable(): boolean {
    return typeof window !== "undefined" && Boolean(sdk.sync.isInstalled());
  }

  public refreshState(): WalletState {
    if (!this.isAvailable()) {
      if (this.status !== "connecting") {
        this.status = "idle";
      }
      this.address = null;
      this.network = null;
      return this.emitState();
    }

    const address = sdk.sync.getAddress();
    this.address = typeof address === "string" && address.length > 0 ? address : null;
    this.network = extractNetworkValue(sdk.sync.getNetwork());

    if (this.status !== "connecting") {
      this.status = this.address ? "connected" : "ready";
    }

    return this.emitState();
  }

  public subscribe(listener: WalletStateListener): () => void {
    this.listeners.add(listener);

    if (!this.unsubscribeSdkEvents) {
      this.unsubscribeSdkEvents = this.attachSdkEventListeners();
    }

    listener(this.refreshState());

    return () => {
      this.listeners.delete(listener);

      if (this.listeners.size === 0 && this.unsubscribeSdkEvents) {
        this.unsubscribeSdkEvents();
        this.unsubscribeSdkEvents = null;
      }
    };
  }

  public async connect(): Promise<ConnectedWallet> {
    this.status = "connecting";
    this.emitState();

    if (!this.isAvailable()) {
      this.status = "error";
      this.emitState();
      throw new Error("Crossmark is not available in this browser.");
    }

    const signInResponse = await sdk.methods.signInAndWait();
    const address = extractAddress(signInResponse);

    if (!address) {
      this.status = "error";
      this.emitState();
      throw new Error("Crossmark did not return a wallet address.");
    }

    this.address = address;
    this.network = extractNetworkValue(sdk.sync.getNetwork());
    this.status = "connected";
    this.emitState();

    return {
      address,
      network: this.network,
      walletType: "crossmark"
    };
  }

  public async disconnect(): Promise<void> {
    this.address = null;
    this.network = null;
    this.status = "ready";
    this.emitState();
  }

  public async signAndSubmitTransaction(
    transaction: WalletSubmitTransactionInput
  ): Promise<WalletSubmitTransactionResult> {
    if (!this.address) {
      await this.connect();
    }

    this.refreshState();

    if (!this.isOnTestnet()) {
      throw new Error("Crossmark must be connected to XRPL testnet before signing this mint.");
    }

    const response = await sdk.methods.signAndSubmitAndWait(transaction as never);

    return {
      hash: extractHash(response),
      result: response
    };
  }

  private emitState(): WalletState {
    const state = this.getState();

    for (const listener of this.listeners) {
      listener(state);
    }

    return state;
  }

  private attachSdkEventListeners(): () => void {
    const syncFromSdk = (eventPayload?: unknown) => {
      if (!this.isAvailable()) {
        this.refreshState();
        return;
      }

      const address = sdk.sync.getAddress();
      this.address = typeof address === "string" && address.length > 0 ? address : null;
      this.network = extractNetworkValue(eventPayload) ?? extractNetworkValue(sdk.sync.getNetwork());

      if (this.status !== "connecting") {
        this.status = this.address ? "connected" : "ready";
      }

      this.emitState();
    };

    const networkChangeEvent = typings.EVENTS.NETWORK_CHANGE;
    const userChangeEvent = typings.EVENTS.USER_CHANGE;
    const signOutEvent = typings.EVENTS.SIGNOUT;
    const openEvent = typings.EVENTS.OPEN;
    const closeEvent = typings.EVENTS.CLOSE;

    sdk.on(networkChangeEvent, syncFromSdk);
    sdk.on(userChangeEvent, syncFromSdk);
    sdk.on(signOutEvent, syncFromSdk);
    sdk.on(openEvent, syncFromSdk);
    sdk.on(closeEvent, syncFromSdk);

    return () => {
      sdk.removeListener(networkChangeEvent, syncFromSdk);
      sdk.removeListener(userChangeEvent, syncFromSdk);
      sdk.removeListener(signOutEvent, syncFromSdk);
      sdk.removeListener(openEvent, syncFromSdk);
      sdk.removeListener(closeEvent, syncFromSdk);
    };
  }
}
