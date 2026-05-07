# Current Marketplace Architecture

## Direction

GatorLend is now market-first.

The current product direction is:
- SFSU email login first
- wallet optional
- mock-tokenized marketplace records by default
- request / accept / complete transfer lifecycle inside Supabase
- XRPL minting remains available as an optional verification and advanced asset layer

## What Requires a Wallet

Wallet connection is **not required** for:
- `/marketplace`
- `/listings/new`
- `/listings/[id]`

Wallet/XRPL is still used for the existing textbook NFT slice:
- `/textbooks/new`
- `/catalog`
- `/assets/[id]`

That older slice remains intact and should not be broken while the market-first layer expands.

## Auth Model

- Supabase Auth magic link login
- protected routes require an authenticated user
- `@sfsu.edu` is the primary domain gate
- the existing allowlist remains as a compatibility fallback

## Marketplace Data Model

### Listings

Listings are the core market object.

Important fields:
- `asset_type`
- `listing_type`
- `title`
- `owner_user_id`
- `status`
- `tokenization_status`
- `mock_token_id`
- `xrpl_token_id`
- `metadata`

Default product behavior:
- normal listings are created with `tokenization_status = mock_tokenized`
- `mock_token_id` is generated server-side
- wallet fields are optional

### Listing Requests

Requests track interest in another user’s listing.

Lifecycle:
- `pending`
- `accepted`
- `declined`
- `handoff_confirmed`
- `completed`
- `cancelled`
- `disputed`

### Ownership Events

Ownership changes are recorded separately from request state.

For the current market-first flow:
- transfer source is `mock`
- no payment processing occurs inside the app
- ownership changes only after the owner completes the transfer

## Listing Lifecycle

1. Authenticated SFSU user creates a listing.
2. Listing is stored in Supabase as a mock-tokenized record.
3. Another authenticated SFSU user requests the listing.
4. Listing owner accepts or declines.
5. Payment/handoff happens externally.
6. Owner completes the transfer in the app.
7. Listing ownership changes in Supabase.
8. Ownership event is recorded.

## XRPL Relationship

XRPL is now an optional layer, not the default requirement for marketplace usage.

Current meaning of tokenization states:
- `not_tokenized`: no token representation
- `mock_tokenized`: app-managed mock asset record
- `xrpl_testnet_minted`: minted on XRPL testnet
- `verified_on_chain`: validated against XRPL state

The app must never claim that a mock asset is on-chain.

## Current Limitations

- payment is coordinated externally
- no dispute workflow beyond tracked state
- no real transactional DB wrapper yet for multi-step transfer writes
- owner/request updates are validated in server logic, not solely in SQL
- goggles, calculators, services, vouchers, and other assets are market-supported but not yet XRPL-minted flows
- textbook XRPL minting remains the only full blockchain vertical slice
