# FIN GatorLend

GatorLend is a market-first campus item exchange app with optional XRPL testnet verification, built with Next.js, Supabase Auth, Supabase RLS, and pnpm workspaces.

## Scope

- Public-safe, testnet-only implementation
- Market-first listing and transfer flow that works without wallet login
- Supabase Auth for signup, email verification, login, reset, and sessions
- Shared validation schemas in `packages/core`
- XRPL client and wallet adapters in `packages/xrpl`
- Shared asset model for `textbook`, `goggles`, `lab_coat`, and broader marketplace records
- Optional XRPL verification layer for selected textbook assets

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

## Auth

GatorLend now uses Supabase Auth for email/password signup, one-time email confirmation, password
login, password reset, and sessions. Access is limited to verified `@sfsu.edu` email users, with a
narrow approved-tester override for development. Wallet connection stays optional and separate from auth.

Protected routes:

- `/marketplace`
- `/listings/new`
- `/listings/[id]`
- `/requests`
- `/profile`
- `/profile/setup`
- `/my-listings`
- `/catalog`
- `/textbooks/new`
- `/assets/[id]`

Supabase Dashboard configuration:

- Site URL:
  `https://fin-gatorlend.com`
- Redirect URLs:
  `http://localhost:3000/**`
  `https://fin-gatorlend.com/**`
  `https://YOUR-PREVIEW-DOMAIN.vercel.app/**`

Resend SMTP is configured in the Supabase Dashboard, not in the app. After a verified user logs in,
the app bootstraps a `profiles` row if needed and requires a unique username before core
marketplace actions are allowed. Auth email redirects now go through `/auth/confirm`, and any
tester override must be reflected in matching Supabase RLS migrations.

See [`docs/auth.md`](/Users/mariojillesca/Code/FIN-gatorlend/docs/auth.md) for the full flow.

## Guardrails

- Never commit seeds, private keys, service role keys, or fake credentials.
- Never place issuer or privileged XRPL logic in client code.
- Always validate Supabase metadata against on-chain XRPL state before rendering asset detail pages.
- RLS is mandatory for public-facing tables.
- Keep wallet-specific logic behind the adapter boundary.
- Crossmark first, Xaman later.

## Current State

This repo now has two layers running in parallel:

- a market-first marketplace flow for SFSU users with listings, request handling, and ownership transfer tracking
- the earlier textbook XRPL testnet slice, which still supports Crossmark-backed XLS-20 minting and XRPL verification

The shared model now supports broader marketplace asset types, while XRPL minting remains optional instead of blocking normal marketplace usage.

## Current Vertical Slice

- Textbook mint form at `/textbooks/new`
- Textbook catalog at `/catalog`
- Textbook detail shell at `/assets/[id]`
- Supabase writes and reads use shared fields plus `metadata`
- Textbook creation prepares an `NFTokenMint`, signs it in Crossmark, then verifies the validated XRPL transaction before insert
- Textbook detail validates the stored record against the live XRPL NFT commitment before showing status

## Market-First Layer

- Marketplace route at `/marketplace`
- Listing creation at `/listings/new`
- Listing detail and request flow at `/listings/[id]`
- Request dashboard at `/requests`
- verified `@sfsu.edu` email/password login first, wallet optional
- unique username required before core marketplace actions
- default listings create internal records without requiring XRPL minting
- listing photos upload to Supabase Storage bucket `listing-images`
- upload path format is `{user_id}/{listing_id}/{safeFileName}`
- supported image types are JPEG, PNG, and WEBP up to 5MB each
- request / accept / decline / complete transfer lifecycle inside Supabase
- structured request notes replace full chat for now
- ownership transfer tracked off-chain for now
- payment remains external

Storage note:
- the `listing-images` bucket is created manually in Supabase Dashboard
- the bucket is public for marketplace item photos
- app code and migrations assume per-user folder RLS on `storage.objects`
- users should not upload sensitive or private images

See [`docs/current-marketplace-architecture.md`](/Users/mariojillesca/Code/FIN-gatorlend/docs/current-marketplace-architecture.md) for the current direction and limitations.
