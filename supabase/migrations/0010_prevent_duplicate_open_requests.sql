-- Prevent duplicate open requests from the same requester on the same listing.

create unique index if not exists listing_requests_unique_open_request_idx
  on public.listing_requests(listing_id, requester_user_id)
  where status in ('pending', 'accepted', 'handoff_confirmed');
