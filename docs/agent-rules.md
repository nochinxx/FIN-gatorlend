# Agent Rules

## Safety
- Never invent secrets or credentials.
- Never place private keys, issuer seeds, or service role keys in client code.
- Never bypass the wallet adapter interface.

## Data integrity
- Always validate Supabase asset metadata against XRPL state before rendering an asset detail page.
- If Supabase and XRPL disagree, show an integrity warning or suppress the record.

## Database
- Row Level Security (RLS) is mandatory on all public-facing tables.
- Users must only be able to mutate rows they own or are explicitly allowed to modify.

## Architecture
- XRPL logic belongs in packages/xrpl.
- Shared schemas belong in packages/core.
- UI should call app services, not wallet SDKs directly.
- Crossmark is the first wallet adapter target.
- Xaman support should be added through the same adapter boundary later.

## Scope
- Build a wallet-connected platform, not a new wallet.
- Use XLS-20 NFTs for unique assets.
- The first minting workflow is textbooks.