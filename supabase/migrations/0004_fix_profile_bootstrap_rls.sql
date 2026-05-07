-- Fix first-time profile bootstrap under RLS.
-- The original marketplace policies relied on public.profiles to prove that a
-- user had an @sfsu.edu email. That made first-login profile creation brittle,
-- because the row being inserted did not exist yet.

create or replace function public.current_auth_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.is_authenticated_sfsu_user()
returns boolean
language sql
stable
as $$
  select auth.role() = 'authenticated'
    and public.current_auth_email() ~ '^[^@[:space:]]+@sfsu\.edu$';
$$;

comment on function public.current_auth_email()
is 'Returns the authenticated user email from the JWT claim for RLS checks.';

comment on function public.is_authenticated_sfsu_user()
is 'Checks the authenticated JWT email against the SFSU domain without requiring a profiles row first.';
