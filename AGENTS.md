# AGENTS.md

## Project purpose
XRPL campus tokenization platform for unique campus assets using XLS-20 NFTs, Next.js, and Supabase.

## Non-negotiables
- Never commit secrets, seeds, or service role keys.
- Never put issuer or privileged XRPL logic in client code.
- Always keep wallet integrations behind the wallet adapter boundary.
- Always validate off-chain Supabase metadata against on-chain XRPL state before rendering asset detail pages.
- RLS is mandatory for public-facing database tables.
- Prefer minimal, testnet-only, verifiable implementations.
- Do not introduce Docker-required local workflows unless explicitly asked.

## Repository expectations
- Use pnpm workspaces.
- Keep shared schemas in packages/core.
- Keep XRPL logic in packages/xrpl.
- Keep docs updated when architecture changes.
- Add TODOs instead of inventing unsafe behavior.
- Use clean TypeScript and small files where practical.

## Current wallet plan
- Crossmark first
- Xaman later via adapter

## Current token standard
- XLS-20 NFTs for unique assets

## Current MVP asset categories
- Textbooks
- Goggles
- Lab coats

## Current first workflow
- Textbooks

## Scaffold constraints
- Keep the repository Codespaces-friendly.
- Keep the repository public-safe and testnet-only.
- Use `pnpm` workspaces with `apps/web`, `packages/core`, and `packages/xrpl`.
- Use Next.js App Router with TypeScript and `src/`.
- Use `xrpl`, `@supabase/supabase-js`, and `zod`.
- Keep Supabase local workflows Docker-free unless explicitly requested later.
