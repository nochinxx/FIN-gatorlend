-- Soft delete for listing requests from the user's perspective.
-- Each side can independently dismiss a request from their view;
-- the row is preserved for audit/admin purposes.
alter table public.listing_requests
  add column if not exists dismissed_by_owner_at timestamptz,
  add column if not exists dismissed_by_requester_at timestamptz;
