-- Allow marketplace listings to use normalized free-text asset types.

alter table public.listings
  drop constraint if exists listings_asset_type_check;
