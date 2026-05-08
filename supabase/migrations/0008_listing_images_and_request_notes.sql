-- Marketplace listing photos and structured request notes.

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  public_url text,
  display_order int not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists listing_images_listing_id_idx on public.listing_images(listing_id);
create index if not exists listing_images_user_id_idx on public.listing_images(user_id);

alter table public.listing_images enable row level security;

alter table public.listing_requests
  add column if not exists availability_note text,
  add column if not exists owner_note text;

drop policy if exists "listing_images_read_visible" on public.listing_images;
create policy "listing_images_read_visible"
on public.listing_images
for select
to authenticated
using (
  public.is_authenticated_marketplace_user()
  and exists (
    select 1
    from public.listings
    where listings.id = listing_id
      and (
        listings.owner_user_id = auth.uid()
        or listings.status in ('active', 'reserved', 'transferred', 'completed')
      )
  )
);

drop policy if exists "listing_images_insert_owner" on public.listing_images;
create policy "listing_images_insert_owner"
on public.listing_images
for insert
to authenticated
with check (
  public.is_authenticated_marketplace_user()
  and user_id = auth.uid()
  and exists (
    select 1
    from public.listings
    where listings.id = listing_id
      and listings.owner_user_id = auth.uid()
  )
);

drop policy if exists "listing_images_delete_owner_or_uploader" on public.listing_images;
create policy "listing_images_delete_owner_or_uploader"
on public.listing_images
for delete
to authenticated
using (
  public.is_authenticated_marketplace_user()
  and (
    user_id = auth.uid()
    or exists (
      select 1
      from public.listings
      where listings.id = listing_id
        and listings.owner_user_id = auth.uid()
    )
  )
);
