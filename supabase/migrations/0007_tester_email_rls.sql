-- Align database RLS with the app-side approved tester override.
-- Normal access still requires a verified @sfsu.edu email, but specific
-- development tester emails are also allowed through the marketplace policies.

create or replace function public.is_authenticated_marketplace_user()
returns boolean
language sql
stable
as $$
  select auth.role() = 'authenticated'
    and (
      public.current_auth_email() ~ '^[^@[:space:]]+@sfsu\.edu$'
      or public.current_auth_email() in (
        'mariojillesca@gmail.com'
      )
    );
$$;

create or replace function public.is_authenticated_sfsu_user()
returns boolean
language sql
stable
as $$
  select public.is_authenticated_marketplace_user();
$$;

comment on function public.is_authenticated_marketplace_user()
is 'Allows authenticated marketplace users with verified @sfsu.edu emails plus explicit development tester emails.';

comment on function public.is_authenticated_sfsu_user()
is 'Backward-compatible alias for marketplace RLS checks.';

drop policy if exists "profiles_read_basic" on public.profiles;
create policy "profiles_read_basic"
on public.profiles
for select
to authenticated
using (public.is_authenticated_marketplace_user());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (
  auth.uid() = id
  and public.is_authenticated_marketplace_user()
  and lower(email) = public.current_auth_email()
);

drop policy if exists "listings_read_active_for_sfsu" on public.listings;
create policy "listings_read_active_for_sfsu"
on public.listings
for select
to authenticated
using (
  public.is_authenticated_marketplace_user()
  and status in ('active', 'reserved', 'transferred', 'completed')
);

drop policy if exists "listings_insert_self" on public.listings;
create policy "listings_insert_self"
on public.listings
for insert
to authenticated
with check (
  public.is_authenticated_marketplace_user()
  and owner_user_id = auth.uid()
);

drop policy if exists "listings_update_self" on public.listings;
create policy "listings_update_self"
on public.listings
for update
to authenticated
using (
  public.is_authenticated_marketplace_user()
  and owner_user_id = auth.uid()
)
with check (
  public.is_authenticated_marketplace_user()
  and owner_user_id = auth.uid()
);

drop policy if exists "listings_delete_self" on public.listings;
create policy "listings_delete_self"
on public.listings
for delete
to authenticated
using (
  public.is_authenticated_marketplace_user()
  and owner_user_id = auth.uid()
);

drop policy if exists "listing_requests_read_related" on public.listing_requests;
create policy "listing_requests_read_related"
on public.listing_requests
for select
to authenticated
using (
  public.is_authenticated_marketplace_user()
  and (owner_user_id = auth.uid() or requester_user_id = auth.uid())
);

drop policy if exists "listing_requests_insert_requester" on public.listing_requests;
create policy "listing_requests_insert_requester"
on public.listing_requests
for insert
to authenticated
with check (
  public.is_authenticated_marketplace_user()
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

drop policy if exists "listing_requests_update_related" on public.listing_requests;
create policy "listing_requests_update_related"
on public.listing_requests
for update
to authenticated
using (
  public.is_authenticated_marketplace_user()
  and (owner_user_id = auth.uid() or requester_user_id = auth.uid())
)
with check (
  public.is_authenticated_marketplace_user()
  and (owner_user_id = auth.uid() or requester_user_id = auth.uid())
);

drop policy if exists "ownership_events_read_related" on public.ownership_events;
create policy "ownership_events_read_related"
on public.ownership_events
for select
to authenticated
using (
  public.is_authenticated_marketplace_user()
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
