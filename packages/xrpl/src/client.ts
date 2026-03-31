import { Client } from "xrpl";

export const DEFAULT_XRPL_TESTNET_URL = "wss://s.altnet.rippletest.net:51233";

export type XrplNetwork = "testnet";

export function createXrplClient(url = DEFAULT_XRPL_TESTNET_URL): Client {
  return new Client(url);
}

export function assertTestnetNetwork(network: string): asserts network is XrplNetwork {
  if (network !== "testnet") {
    throw new Error("Only XRPL testnet is supported in this scaffold.");
  }
}
