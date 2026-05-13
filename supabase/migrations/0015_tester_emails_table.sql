-- Tester emails are stored in this table instead of hardcoded in source or migrations.
-- Rows are managed via the Supabase dashboard; nothing is seeded here.
create table if not exists public.tester_emails (
  email text primary key,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.tester_emails enable row level security;

-- Only the service role can read/write this table.
-- No app-user policies — the function below uses SECURITY DEFINER to bypass RLS.

create or replace function public.is_authenticated_marketplace_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.role() = 'authenticated'
    and (
      public.current_auth_email() ~ '^[^@[:space:]]+@sfsu\.edu$'
      or exists (
        select 1 from public.tester_emails
        where email = public.current_auth_email()
      )
    );
$$;

comment on function public.is_authenticated_marketplace_user()
is 'Allows @sfsu.edu users plus any email listed in the tester_emails table.';
