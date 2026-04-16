# FIN GatorLend

XRPL campus tokenization platform scaffold for unique campus assets using XLS-20 NFTs, Next.js, Supabase, and pnpm workspaces.

## Scope

- Public-safe, testnet-only scaffold
- Wallet adapter boundary with Crossmark as the first target
- Shared validation schemas in `packages/core`
- XRPL client and wallet adapters in `packages/xrpl`
- Supabase migration placeholder with RLS-first notes
- Shared asset model for `textbook`, `goggles`, and `lab_coat`
- First UI and minting workflow remains textbooks

## Workspace Layout

- `apps/web`: Next.js App Router web app
- `packages/core`: shared zod schemas and types
- `packages/xrpl`: XRPL client helpers and wallet adapter interfaces
- `supabase/migrations`: SQL migrations and RLS notes
- `scripts`: local utility scripts, including testnet faucet onboarding
- `docs`: contributor and agent-facing architecture rules

## Getting Started

1. Install `pnpm`.
2. Copy [`.env.example`](/Users/mariojillesca/Code/FIN-gatorlend/.env.example) to `.env` only if you need workspace-level variables.
3. Copy [`apps/web/.env.local.example`](/Users/mariojillesca/Code/FIN-gatorlend/apps/web/.env.local.example) to `apps/web/.env.local` for the web app.
4. Install dependencies with `pnpm install`.
5. Start the app with `pnpm dev:web`.

## Vercel Deployment

Use the `apps/web` project as the Vercel app root and configure the deployment with Node.js runtime support for the textbook mint flow pages.

Required environment variables for the web app:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_XRPL_NETWORK=testnet`
- `NEXT_PUBLIC_XRPL_TESTNET_RPC_URL`
- `NEXT_PUBLIC_XRPL_TESTNET_HTTP_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `XRPL_TESTNET_RPC_URL`
- `XRPL_TESTNET_HTTP_URL`

Recommended deployment checklist:

1. Add the environment variables above to the Vercel project for Preview and Production.
2. Keep all XRPL endpoints pointed at testnet only.
3. Run `pnpm install`, `pnpm typecheck`, and `pnpm build` before the demo deployment.
4. Test the deployed preview in a desktop browser with Crossmark installed and switched to XRPL testnet.

Deployment caveats:

- Crossmark is a browser extension wallet, so the mint flow only works in a browser where the extension is installed and allowed on the deployed preview domain.
- The server-side XRPL validation/finalization path uses JSON-RPC HTTP requests, which is compatible with Vercel serverless execution. It does not depend on maintaining a websocket connection on the server.
- The catalog and detail pages are intentionally dynamic because they depend on live Supabase and XRPL-backed state.

## Demo Auth

The deployed demo can be restricted with Supabase Auth email magic links plus a hardcoded allowlist in
[`apps/web/src/lib/auth/allowlist.ts`](/Users/mariojillesca/Code/FIN-gatorlend/apps/web/src/lib/auth/allowlist.ts).

Protected routes:

- `/catalog`
- `/textbooks/new`
- `/assets/[id]`

Supabase dashboard configuration for magic links:

- Site URL:
  `https://YOUR_VERCEL_DOMAIN`
- Redirect URLs:
  `http://localhost:3000/auth/callback`
  `https://YOUR_VERCEL_DOMAIN/auth/callback`
  `https://YOUR-PREVIEW-DOMAIN.vercel.app/auth/callback`

If you use Vercel preview URLs, add each preview callback URL you expect to use, or use your stable
demo domain as the primary Site URL.

## Guardrails

- Never commit seeds, private keys, service role keys, or fake credentials.
- Never place issuer or privileged XRPL logic in client code.
- Always validate Supabase metadata against on-chain XRPL state before rendering asset detail pages.
- RLS is mandatory for public-facing tables.
- Keep wallet-specific logic behind the adapter boundary.
- Crossmark first, Xaman later.

## Current State

This repo now includes a real textbook XRPL testnet mint path. The shared asset model supports textbooks, goggles, and lab coats through a typed metadata union, while textbook minting happens through Crossmark and the server verifies the resulting XLS-20 NFT before persisting the Supabase record. Transfer execution, richer authenticated Supabase access, and additional asset flows still remain TODOs.

## Current Vertical Slice

- Textbook mint form at `/textbooks/new`
- Textbook catalog at `/catalog`
- Textbook detail shell at `/assets/[id]`
- Supabase writes and reads use shared fields plus `metadata`
- Textbook creation prepares an `NFTokenMint`, signs it in Crossmark, then verifies the validated XRPL transaction before insert
- Textbook detail validates the stored record against the live XRPL NFT commitment before showing status
