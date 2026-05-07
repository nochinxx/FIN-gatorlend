-- Market-first marketplace foundation.
-- This migration replaces earlier scaffold-only `profiles` and `listings` shapes
-- with the Supabase-auth-first marketplace model. XRPL minting remains optional.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop table if exists public.profiles cascade;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  role text not null default 'student',
  wallet_address text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_role_check
    check (role in ('student', 'admin'))
);

create or replace function public.current_auth_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.is_authenticated_sfsu_user()
returns boolean
language sql
stable
as $$
  select auth.role() = 'authenticated'
    and public.current_auth_email() ~ '^[^@[:space:]]+@sfsu\.edu$';
$$;

drop table if exists public.listings cascade;

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  asset_type text not null,
  listing_type text not null,
  title text not null,
  description text,
  condition text,
  image_url text,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  owner_wallet text,
  price_amount numeric,
  price_type text,
  payment_methods text[],
  status text not null default 'active',
  tokenization_status text not null default 'mock_tokenized',
  mock_token_id text,
  xrpl_token_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint listings_asset_type_check
    check (asset_type in ('textbook', 'calculator', 'lab_coat', 'goggles', 'food_voucher', 'service', 'other')),
  constraint listings_listing_type_check
    check (listing_type in ('sell', 'lend', 'borrow_request', 'service_offer', 'voucher')),
  constraint listings_status_check
    check (status in ('draft', 'active', 'reserved', 'transferred', 'completed', 'cancelled')),
  constraint listings_tokenization_status_check
    check (tokenization_status in ('not_tokenized', 'mock_tokenized', 'xrpl_testnet_minted', 'verified_on_chain'))
);

create table if not exists public.listing_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  requester_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  message text,
  payment_method text,
  handoff_location text,
  requested_at timestamptz not null default timezone('utc', now()),
  accepted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint listing_requests_status_check
    check (status in ('pending', 'accepted', 'declined', 'handoff_confirmed', 'completed', 'cancelled', 'disputed'))
);

create table if not exists public.ownership_events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  from_user_id uuid references public.profiles(id) on delete set null,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  transfer_type text not null,
  source text not null default 'mock',
  xrpl_tx_hash text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint ownership_events_transfer_type_check
    check (transfer_type in ('sell', 'lend', 'borrow_request', 'service_offer', 'voucher')),
  constraint ownership_events_source_check
    check (source in ('mock', 'xrpl'))
);

create index if not exists listings_owner_user_id_idx on public.listings(owner_user_id);
create index if not exists listings_asset_type_idx on public.listings(asset_type);
create index if not exists listings_status_idx on public.listings(status);
create index if not exists listing_requests_listing_id_idx on public.listing_requests(listing_id);
create index if not exists listing_requests_owner_user_id_idx on public.listing_requests(owner_user_id);
create index if not exists listing_requests_requester_user_id_idx on public.listing_requests(requester_user_id);
create index if not exists ownership_events_listing_id_idx on public.ownership_events(listing_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
before update on public.listings
for each row
execute function public.set_updated_at();

drop trigger if exists listing_requests_set_updated_at on public.listing_requests;
create trigger listing_requests_set_updated_at
before update on public.listing_requests
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_requests enable row level security;
alter table public.ownership_events enable row level security;

create policy "profiles_read_basic"
on public.profiles
for select
to authenticated
using (public.is_authenticated_sfsu_user());

create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (
  auth.uid() = id
  and lower(email) ~ '^[^@[:space:]]+@sfsu\.edu$'
);

create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "listings_read_active_for_sfsu"
on public.listings
for select
to authenticated
using (
  public.is_authenticated_sfsu_user()
  and status in ('active', 'reserved', 'transferred', 'completed')
);

create policy "listings_insert_self"
on public.listings
for insert
to authenticated
with check (
  public.is_authenticated_sfsu_user()
  and owner_user_id = auth.uid()
);

create policy "listings_update_self"
on public.listings
for update
to authenticated
using (
  public.is_authenticated_sfsu_user()
  and owner_user_id = auth.uid()
)
with check (
  public.is_authenticated_sfsu_user()
  and owner_user_id = auth.uid()
);

create policy "listings_delete_self"
on public.listings
for delete
to authenticated
using (
  public.is_authenticated_sfsu_user()
  and owner_user_id = auth.uid()
);

create policy "listing_requests_read_related"
on public.listing_requests
for select
to authenticated
using (
  public.is_authenticated_sfsu_user()
  and (owner_user_id = auth.uid() or requester_user_id = auth.uid())
);

create policy "listing_requests_insert_requester"
on public.listing_requests
for insert
to authenticated
with check (
  public.is_authenticated_sfsu_user()
  and requester_user_id = auth.uid()
  and owner_user_id <> auth.uid()
  and exists (
    select 1
    from public.listings
    where listings.id = listing_id
      and listings.owner_user_id = owner_user_id
      and listings.status = 'active'
  )
);

create policy "listing_requests_update_related"
on public.listing_requests
for update
to authenticated
using (
  public.is_authenticated_sfsu_user()
  and (owner_user_id = auth.uid() or requester_user_id = auth.uid())
)
with check (
  public.is_authenticated_sfsu_user()
  and (owner_user_id = auth.uid() or requester_user_id = auth.uid())
);

create policy "ownership_events_read_related"
on public.ownership_events
for select
to authenticated
using (
  public.is_authenticated_sfsu_user()
  and (
    coalesce(from_user_id, auth.uid()) = auth.uid()
    or to_user_id = auth.uid()
    or exists (
      select 1
      from public.listings
      where listings.id = listing_id
        and listings.owner_user_id = auth.uid()
    )
  )
);

create policy "ownership_events_insert_owner_side"
on public.ownership_events
for insert
to authenticated
with check (
  public.is_authenticated_sfsu_user()
  and (
    from_user_id = auth.uid()
    or exists (
      select 1
      from public.listings
      where listings.id = listing_id
        and listings.owner_user_id = auth.uid()
    )
  )
);

-- TODO:
-- 1. If admin/staff roles need different access, add explicit role-aware policies.
-- 2. Ownership event inserts are intended to happen through server-side actions that
--    execute with the caller's authenticated session; if a service-role RPC is added
--    later, tighten or replace this insert policy accordingly.
-- 3. XRPL-backed detail pages must still validate Supabase metadata against on-chain state.
