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

-- Reviews table for tennis court reviews
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  court_id text not null, -- SVCID from Seoul API
  court_name text not null,
  district text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  content text not null check (char_length(content) >= 10 and char_length(content) <= 500),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for faster queries
create index reviews_court_id_idx on public.reviews(court_id);
create index reviews_user_id_idx on public.reviews(user_id);
create index reviews_created_at_idx on public.reviews(created_at desc);

-- Enable RLS for reviews
alter table public.reviews enable row level security;

-- Anyone can read reviews (for AdSense content)
create policy "Anyone can view reviews" on public.reviews
  for select using (true);

-- Only authenticated users can insert their own reviews
create policy "Authenticated users can insert reviews" on public.reviews
  for insert with check (auth.uid() = user_id);

-- Users can update their own reviews
create policy "Users can update their own reviews" on public.reviews
  for update using (auth.uid() = user_id);

-- Users can delete their own reviews
create policy "Users can delete their own reviews" on public.reviews
  for delete using (auth.uid() = user_id);

-- Prevent duplicate reviews (one review per user per court)
create unique index reviews_user_court_unique on public.reviews(user_id, court_id);
