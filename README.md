# FIN GatorLend

XRPL campus tokenization platform scaffold for unique campus assets using XLS-20 NFTs, Next.js, Supabase, and pnpm workspaces.

## Scope

- Public-safe, testnet-only scaffold
- Wallet adapter boundary with Crossmark as the first target
- Shared validation schemas in `packages/core`
- XRPL client and wallet adapters in `packages/xrpl`
- Supabase migration placeholder with RLS-first notes
- First asset workflow: textbooks

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

## Guardrails

- Never commit seeds, private keys, service role keys, or fake credentials.
- Never place issuer or privileged XRPL logic in client code.
- Always validate Supabase metadata against on-chain XRPL state before rendering asset detail pages.
- RLS is mandatory for public-facing tables.
- Keep wallet-specific logic behind the adapter boundary.
- Crossmark first, Xaman later.

## Current State

This is an initial scaffold. Minting, transfer execution, authenticated Supabase access, and wallet SDK integration are intentionally left as TODOs.
