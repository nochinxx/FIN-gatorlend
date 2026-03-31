import { Client, Wallet, fundWallet } from "xrpl";

const XRPL_TESTNET_RPC_URL =
  process.env.XRPL_TESTNET_RPC_URL ?? "wss://s.altnet.rippletest.net:51233";

async function main(): Promise<void> {
  const client = new Client(XRPL_TESTNET_RPC_URL);

  await client.connect();

  try {
    // TODO: decide whether this script should create a new wallet, fund an existing address,
    // or support both flows. Keep this testnet-only.
    const wallet = Wallet.generate();

    console.log("Generated testnet wallet address:", wallet.address);
    console.log("TODO: implement faucet onboarding flow against the XRPL testnet faucet.");

    // Placeholder reference so the intended library API stays visible in the scaffold.
    void fundWallet;
  } finally {
    await client.disconnect();
  }
}

main().catch((error) => {
  console.error("fund-test-wallet scaffold failed:", error);
  process.exitCode = 1;
});
