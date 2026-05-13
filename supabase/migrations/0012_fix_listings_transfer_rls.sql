-- The listings_update_self policy had `owner_user_id = auth.uid()` in both
-- the USING and WITH CHECK clauses. The USING clause correctly gates updates
-- to the current owner; but the WITH CHECK blocked ownership transfers because
-- after the update the new owner_user_id no longer matches auth.uid().
--
-- Fix: drop the WITH CHECK owner_user_id constraint so the current owner can
-- transfer the listing to another user. The USING clause still ensures only
-- the current owner can initiate the update.

drop policy if exists "listings_update_self" on public.listings;

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
);
