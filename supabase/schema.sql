-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase Auth)
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Alerts table
create table public.alerts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users not null,
  region text not null, -- e.g. "Gangnam-gu"
  time_slot text not null, -- e.g. "Morning", "Evening", or "18:00"
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notifications log
create table public.notification_logs (
  id uuid default uuid_generate_v4() primary key,
  alert_id uuid references public.alerts not null,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  success boolean default true
);

-- Security policies (RLS)
alter table public.users enable row level security;
alter table public.alerts enable row level security;
alter table public.notification_logs enable row level security;

create policy "Users can view their own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own data" on public.users
  for update using (auth.uid() = id);

create policy "Users can view their own alerts" on public.alerts
  for select using (auth.uid() = user_id);

create policy "Users can insert their own alerts" on public.alerts
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own alerts" on public.alerts
  for delete using (auth.uid() = user_id);
