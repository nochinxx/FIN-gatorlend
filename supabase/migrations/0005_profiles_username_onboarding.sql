-- Add username-driven profile onboarding fields without replacing the existing table.
-- This keeps Supabase Auth as the source of truth while making username setup mandatory
-- for core marketplace usage.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  username text,
  display_name text,
  role text not null default 'student',
  wallet_address text,
  major text,
  student_type text,
  bio text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
  add column if not exists username text,
  add column if not exists display_name text,
  add column if not exists role text default 'student',
  add column if not exists wallet_address text,
  add column if not exists major text,
  add column if not exists student_type text,
  add column if not exists bio text,
  add column if not exists created_at timestamptz default timezone('utc', now()),
  add column if not exists updated_at timestamptz default timezone('utc', now());

update public.profiles
set email = lower(email)
where email <> lower(email);

alter table public.profiles
  alter column email set not null,
  alter column role set default 'student',
  alter column created_at set default timezone('utc', now()),
  alter column updated_at set default timezone('utc', now());

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_role_check
        check (role in ('student', 'admin'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_username_format_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_username_format_check
        check (
          username is null
          or username ~ '^[a-z0-9](?:[a-z0-9_]{1,22})[a-z0-9]$'
        );
  end if;
end
$$;

create unique index if not exists profiles_email_unique_idx
  on public.profiles(email);

create unique index if not exists profiles_username_unique_idx
  on public.profiles(username)
  where username is not null;
