-- Remove hardcoded personal email from RLS function.
-- Access is now limited to @sfsu.edu accounts at the DB level.
-- Non-sfsu.edu tester access is handled at the app layer via TESTER_EMAILS env var.

create or replace function public.is_authenticated_marketplace_user()
returns boolean
language sql
stable
as $$
  select auth.role() = 'authenticated'
    and public.current_auth_email() ~ '^[^@[:space:]]+@sfsu\.edu$';
$$;

comment on function public.is_authenticated_marketplace_user()
is 'Allows authenticated users with verified @sfsu.edu emails.';
