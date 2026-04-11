-- ArchaeologyApp V1.0 Supabase Schema

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  role text check (role in ('researcher', 'restorer', 'student')),
  institution text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. Artifacts Table
create table public.artifacts (
  id uuid default uuid_generate_v4() primary key,
  passport_id text unique not null,
  name text not null,
  type text check (type in ('painting', 'sculpture', 'ceramic', 'textile', 'metal', 'stone', 'manuscript', 'other')),
  creator text,
  date_created text,
  origin text,
  location text,
  description text,
  materials text[],
  condition text check (condition in ('excellent', 'good', 'fair', 'damaged', 'critical')),
  qr_code_data text,
  photos text[],
  user_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.artifacts enable row level security;

create policy "Artifacts are viewable by everyone"
  on artifacts for select
  using ( true );

create policy "Users can create artifacts"
  on artifacts for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own artifacts"
  on artifacts for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own artifacts"
  on artifacts for delete
  using ( auth.uid() = user_id );

-- 3. Condition Logs Table
create table public.condition_logs (
  id uuid default uuid_generate_v4() primary key,
  artifact_id uuid references public.artifacts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  condition_before text check (condition_before in ('excellent', 'good', 'fair', 'damaged', 'critical')),
  condition_after text check (condition_after in ('excellent', 'good', 'fair', 'damaged', 'critical')),
  notes text,
  photos text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.condition_logs enable row level security;

create policy "Condition logs are viewable by everyone"
  on condition_logs for select
  using ( true );

create policy "Users can insert condition logs"
  on condition_logs for insert
  with check ( auth.uid() = user_id );

-- Condition logs are append-only.
-- No delete/update policies.

-- Function for handle new user
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', COALESCE(new.raw_user_meta_data->>'role', 'student'));
  return new;
end;
$$;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Set up Realtime!
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table artifacts;
alter publication supabase_realtime add table condition_logs;
