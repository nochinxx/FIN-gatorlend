import { Client } from "xrpl";

export const DEFAULT_XRPL_TESTNET_URL = "wss://s.altnet.rippletest.net:51233";
export const DEFAULT_XRPL_TESTNET_HTTP_URL = "https://s.altnet.rippletest.net:51234";

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

export function resolveXrplTestnetHttpUrl(): string {
  return (
    process.env.XRPL_TESTNET_HTTP_URL ??
    process.env.NEXT_PUBLIC_XRPL_TESTNET_HTTP_URL ??
    DEFAULT_XRPL_TESTNET_HTTP_URL
  );
}

export async function requestXrplJsonRpc<T>(request: Record<string, unknown>): Promise<T> {
  const response = await fetch(resolveXrplTestnetHttpUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      method: request.command,
      params: [request]
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`XRPL JSON-RPC request failed with HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as {
    result?: {
      status?: string;
      error?: string;
      error_message?: string;
    };
  };

  if (payload.result?.status === "error") {
    throw new Error(payload.result.error_message ?? payload.result.error ?? "XRPL JSON-RPC request failed.");
  }

  return payload as T;
}

export function assertTestnetNetwork(network: string): asserts network is XrplNetwork {
  if (network !== "testnet") {
    throw new Error("Only XRPL testnet is supported in this scaffold.");
  }
}
