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

-- Security policies (RLS)
alter table public.users enable row level security;

create policy "Users can view their own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own data" on public.users
  for update using (auth.uid() = id);

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

-- Add images column to reviews table (max 3 images)
alter table public.reviews add column if not exists images text[] default '{}';

-- Storage bucket for review images
insert into storage.buckets (id, name, public) 
values ('review-images', 'review-images', true)
on conflict (id) do nothing;

-- Storage RLS policies for review-images bucket
create policy "Anyone can view review images"
on storage.objects for select
using (bucket_id = 'review-images');

create policy "Authenticated users can upload review images"
on storage.objects for insert
with check (
  bucket_id = 'review-images' 
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own review images"
on storage.objects for delete
using (
  bucket_id = 'review-images' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Feedback table (anonymous suggestions)
create table public.feedback (
  id uuid default gen_random_uuid() primary key,
  category text not null check (category in ('feature', 'bug', 'other')),
  content text not null check (char_length(content) >= 5 and char_length(content) <= 500),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index feedback_created_at_idx on public.feedback(created_at desc);

alter table public.feedback enable row level security;

create policy "Anyone can submit feedback" on public.feedback
  for insert with check (true);

create policy "Service role can read feedback" on public.feedback
  for select using (false);

-- Reservation snapshots for competition rate trends
create table public.reservation_snapshots (
  id bigint generated always as identity primary key,
  snapshot_at timestamp with time zone not null default timezone('utc'::text, now()),
  district text not null,
  total_courts integer not null default 0,
  available_courts integer not null default 0,
  booked_courts integer not null default 0,
  free_courts integer not null default 0,
  paid_courts integer not null default 0
);

create index snapshots_district_time_idx
  on public.reservation_snapshots(district, snapshot_at desc);

create index snapshots_time_idx
  on public.reservation_snapshots(snapshot_at desc);

alter table public.reservation_snapshots enable row level security;

create policy "Anyone can read snapshots" on public.reservation_snapshots
  for select using (true);

create policy "Service role can insert snapshots" on public.reservation_snapshots
  for insert with check (true);

-- Push notification subscriptions
create table public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  endpoint text not null unique,
  keys_p256dh text not null,
  keys_auth text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index push_subscriptions_user_id_idx on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

create policy "Users can view their own subscriptions" on public.push_subscriptions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own subscriptions" on public.push_subscriptions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own subscriptions" on public.push_subscriptions
  for delete using (auth.uid() = user_id);

-- Alert settings for court/district notifications
create table public.alert_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  alert_type text not null check (alert_type in ('favorite_available', 'district_available')),
  target_id text not null,
  target_name text not null,
  enabled boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create unique index alert_settings_unique on public.alert_settings(user_id, alert_type, target_id);
create index alert_settings_enabled_idx on public.alert_settings(enabled) where enabled = true;

alter table public.alert_settings enable row level security;

create policy "Users can view their own alerts" on public.alert_settings
  for select using (auth.uid() = user_id);

create policy "Users can insert their own alerts" on public.alert_settings
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own alerts" on public.alert_settings
  for update using (auth.uid() = user_id);

create policy "Users can delete their own alerts" on public.alert_settings
  for delete using (auth.uid() = user_id);

-- Court status cache for change detection (service role only)
create table public.court_status_cache (
  svc_id text primary key,
  status text not null,
  svc_name text not null,
  district text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.court_status_cache enable row level security;

create policy "Service role manages court status cache" on public.court_status_cache
  for all using (true);
