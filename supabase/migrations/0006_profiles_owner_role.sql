-- Expand marketplace profile roles for controlled tester/admin overrides.
-- General user access still depends on verified @sfsu.edu emails unless an
-- email is explicitly approved in app-side tester configuration.

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
    check (role in ('student', 'admin', 'owner'));
