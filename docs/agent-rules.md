# Agent Rules

## Safety

- Never invent or commit secrets, credentials, seeds, or service role keys.
- Never place issuer keys or privileged XRPL logic in client code.
- Never bypass the wallet adapter interface.
- Keep the repository safe to publish publicly.

## Data Integrity

- Always validate Supabase asset metadata against XRPL state before rendering an asset detail page.
- If Supabase metadata and XRPL state disagree, show an integrity warning or suppress the record.
- Treat XRPL XLS-20 NFTs as the source of truth for ownership and token identity.

## Database

- Row Level Security (RLS) is mandatory on all public-facing tables.
- Write migrations with RLS enabled first and policies added explicitly.
- Users should only mutate rows they own or are explicitly allowed to modify.

## Architecture

- Use pnpm workspaces.
- XRPL logic belongs in `packages/xrpl`.
- Shared schemas belong in `packages/core`.
- UI code should call app services and adapters, not wallet SDKs directly.
- Crossmark is the first wallet adapter target.
- Xaman support should be added later through the same adapter boundary.

## Scope

- Build a wallet-connected platform, not a new wallet.
- Use XLS-20 NFTs for unique campus assets.
- The first minting workflow is textbooks.
- Keep the first pass minimal, typed, and testnet-only.
- Add TODOs instead of inventing unsafe or privileged behavior.
