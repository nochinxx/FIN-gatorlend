create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  message text not null,
  page_url text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.feedback enable row level security;

-- Any authenticated marketplace user can submit feedback.
create policy "feedback_insert_authenticated"
on public.feedback
for insert
to authenticated
with check (
  public.is_authenticated_sfsu_user()
  and (user_id = auth.uid() or user_id is null)
);

-- Users can only read their own feedback. Admins use the dashboard.
create policy "feedback_read_own"
on public.feedback
for select
to authenticated
using (user_id = auth.uid());
