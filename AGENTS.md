# AGENTS.md

## Project purpose
GatorLend is a market-first campus item exchange platform with optional XRPL testnet verification, built with Next.js, Supabase Auth, and pnpm workspaces.

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
- Keep Supabase Auth as the source of truth for signup, login, email verification, password reset, and sessions.
- Keep marketplace auth separate from wallet connection.
- When app-side access rules change, update matching Supabase RLS policies and migrations in the same task.

## Current wallet plan
- Crossmark first
- Xaman later via adapter

## Current auth model
- Email/password auth is handled by Supabase Auth.
- Primary access is verified `@sfsu.edu` emails.
- A narrow tester override exists for explicit development accounts and must stay aligned with RLS.
- Unique usernames are required before core marketplace actions.
- Wallet connection is optional for the market-first flow.

## Current token standard
- XLS-20 NFTs for unique assets

## Current MVP asset categories
- Textbooks
- Goggles
- Lab coats

## Current first workflow
- Textbooks

## Current market-first workflow
- User signs up with Supabase Auth and confirms email.
- App bootstraps a `profiles` row and sends users without a username to `/profile/setup`.
- Verified users can create listings, request items, and complete transfers without wallet login.
- XRPL minting remains optional for selected textbook flows and must not block the broader marketplace.

## Scaffold constraints
- Keep the repository Codespaces-friendly.
- Keep the repository public-safe and testnet-only.
- Use `pnpm` workspaces with `apps/web`, `packages/core`, and `packages/xrpl`.
- Use Next.js App Router with TypeScript and `src/`.
- Use `xrpl`, `@supabase/supabase-js`, and `zod`.
- Keep Supabase local workflows Docker-free unless explicitly requested later.
