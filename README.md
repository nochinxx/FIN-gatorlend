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
