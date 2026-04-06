-- ⚠️ DEV-ONLY RLS POLICIES
-- These policies allow open access for development/testing.
-- MUST be replaced before production or demo with real ownership-based policies.

-- assets
create policy "dev_assets_select_all"
on public.assets
for select
to anon, authenticated
using (true);

create policy "dev_assets_insert_all"
on public.assets
for insert
to anon, authenticated
with check (true);

create policy "dev_assets_update_all"
on public.assets
for update
to anon, authenticated
using (true)
with check (true);