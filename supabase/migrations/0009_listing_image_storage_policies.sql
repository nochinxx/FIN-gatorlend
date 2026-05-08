-- Supabase Storage policies for the manually created public bucket:
--   listing-images
-- Expected object path:
--   {auth.uid()}/{listing_id}/{safeFileName}

drop policy if exists "listing_images_public_read" on storage.objects;
create policy "listing_images_public_read"
on storage.objects
for select
to public
using (bucket_id = 'listing-images');

drop policy if exists "listing_images_insert_own_folder" on storage.objects;
create policy "listing_images_insert_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "listing_images_update_own_folder" on storage.objects;
create policy "listing_images_update_own_folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "listing_images_delete_own_folder" on storage.objects;
create policy "listing_images_delete_own_folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
