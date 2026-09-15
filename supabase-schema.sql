-- Run this once in your Supabase project's SQL editor (Dashboard -> SQL Editor -> New query)
-- Creates a "profiles" table that stores the extra signup fields Supabase Auth doesn't hold
-- itself (username, phone, city, admin flag, suspension flag), keyed to auth.users.

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  username text unique,
  phone text,
  city text,
  is_admin boolean default false,
  suspended boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Anyone signed in can read basic profile info (needed to show names/ratings on tasks)
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- A user can only insert their own profile row
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- A user can update their own profile row
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Admins (rows where is_admin = true) can update ANY profile — needed for the
-- suspend/unsuspend feature in the admin dashboard.
create policy "Admins can update any profile"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );
