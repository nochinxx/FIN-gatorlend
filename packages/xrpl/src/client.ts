import { Client } from "xrpl";

export const DEFAULT_XRPL_TESTNET_URL = "wss://s.altnet.rippletest.net:51233";

export type XrplNetwork = "testnet";

export function resolveXrplTestnetUrl(): string {
  return (
    process.env.XRPL_TESTNET_RPC_URL ??
    process.env.NEXT_PUBLIC_XRPL_TESTNET_RPC_URL ??
    DEFAULT_XRPL_TESTNET_URL
  );
}

export function createXrplClient(url = resolveXrplTestnetUrl()): Client {
  return new Client(url);
}

export function assertTestnetNetwork(network: string): asserts network is XrplNetwork {
  if (network !== "testnet") {
    throw new Error("Only XRPL testnet is supported in this scaffold.");
  }
}
