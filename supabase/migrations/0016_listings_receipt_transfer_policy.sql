-- Allow the requester to update listing ownership when confirming receipt.
-- The existing listings_update_self policy only allows the current owner to update.
-- This policy covers the second half of the two-step handoff: requester confirms
-- receipt, triggering the ownership transfer on their session.

create policy "listings_update_receipt_confirmation"
on public.listings
for update
to authenticated
using (
  public.is_authenticated_sfsu_user()
  and exists (
    select 1 from public.listing_requests
    where listing_requests.listing_id = listings.id
      and listing_requests.requester_user_id = auth.uid()
      and listing_requests.status = 'handoff_confirmed'
  )
)
with check (
  public.is_authenticated_sfsu_user()
);
