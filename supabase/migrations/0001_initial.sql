-- Initial scaffold migration for FIN GatorLend.
-- Testnet only. Do not add privileged secrets, issuer seeds, or service role keys here.
-- RLS is mandatory on all public-facing tables.
-- Supabase metadata must be validated against XRPL XLS-20 state before asset detail pages render.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null unique,
  display_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  isbn text not null,
  course_code text not null,
  edition text not null,
  condition text not null,
  owner_wallet text not null,
  image_url text,
  xrpl_token_id text not null unique,
  verification_status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint assets_verification_status_check
    check (verification_status in ('pending', 'verified', 'mismatch', 'hidden'))
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  seller_wallet text not null,
  status text not null default 'draft',
  asking_price_drops bigint,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transfer_requests (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  requester_wallet text not null,
  owner_wallet text not null,
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.assets enable row level security;
alter table public.listings enable row level security;
alter table public.transfer_requests enable row level security;

-- TODO: add explicit RLS policies.
-- Suggested policy model:
-- 1. Profiles: users can read limited public profile data; users update only their own row.
-- 2. Assets: public reads may be allowed only for verified, public-safe records; owners mutate their own rows.
-- 3. Listings: public can read active listings; sellers manage their own listings.
-- 4. Transfer requests: only owners and requesters can read or mutate the relevant rows.
-- 5. All app reads should still validate Supabase metadata against XRPL before rendering detail pages.
