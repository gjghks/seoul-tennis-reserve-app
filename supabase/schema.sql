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

-- Optional district slug for linking to court detail page
alter table public.alert_settings add column if not exists district_slug text;

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

-- Site visit counter (daily aggregation)
create table public.site_visits (
  visit_date date primary key default (now() at time zone 'Asia/Seoul')::date,
  visit_count integer not null default 1,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.site_visits enable row level security;

create policy "Anyone can read visit counts" on public.site_visits
  for select using (true);

-- Atomic increment function for visit counting
create or replace function increment_site_visit()
returns json
language plpgsql
security definer
as $$
declare
  kst_today date;
  today_count integer;
  total_count bigint;
begin
  kst_today := (now() at time zone 'Asia/Seoul')::date;

  insert into public.site_visits (visit_date, visit_count)
  values (kst_today, 1)
  on conflict (visit_date)
  do update set
    visit_count = site_visits.visit_count + 1,
    updated_at = now();

  select visit_count into today_count
  from public.site_visits
  where visit_date = kst_today;

  select coalesce(sum(visit_count), 0) into total_count
  from public.site_visits;

  return json_build_object('today', today_count, 'total', total_count);
end;
$$;

-- Pre-computed popular courts ranking (single-row cache, cron-updated)
create table public.popular_courts_cache (
  id integer primary key default 1 check (id = 1),
  data jsonb not null default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.popular_courts_cache enable row level security;

create policy "Anyone can read popular courts cache" on public.popular_courts_cache
  for select using (true);

create policy "Service role can manage popular courts cache" on public.popular_courts_cache
  for all using (true);

insert into public.popular_courts_cache (id, data) values (1, '[]'::jsonb);

-- Favorites table (user favorite courts)
create table if not exists public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users not null,
  svc_id text not null,
  svc_name text not null,
  district text not null,
  place_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique(user_id, svc_id)
);

create index if not exists idx_favorites_user_id on public.favorites(user_id);
create index if not exists idx_favorites_svc_id on public.favorites(svc_id);

alter table public.favorites enable row level security;

create policy "Users can view their own favorites" on public.favorites
  for select using (auth.uid() = user_id);

create policy "Users can insert their own favorites" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own favorites" on public.favorites
  for delete using (auth.uid() = user_id);

-- Tennis player profiles
create table if not exists public.player_profiles (
  user_id uuid references auth.users not null primary key,
  career_years integer check (career_years >= 0 and career_years <= 50),
  ntrp_rating numeric(2,1) check (ntrp_rating >= 1.0 and ntrp_rating <= 7.0),
  skill_level text check (skill_level in ('beginner', 'intermediate', 'advanced', 'pro')),
  preferred_hand text check (preferred_hand in ('right', 'left', 'both')),
  age_group text check (age_group in ('10s', '20s', '30s', '40s', '50s', '60s_plus')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.player_profiles enable row level security;

create policy "Users can view their own profile" on public.player_profiles
  for select using (auth.uid() = user_id);

create policy "Users can insert their own profile" on public.player_profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own profile" on public.player_profiles
  for update using (auth.uid() = user_id);

-- Game records (match history)
create table if not exists public.game_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,

  -- Date and location
  played_at timestamptz not null,
  duration_minutes integer check (duration_minutes > 0 and duration_minutes <= 600),
  location_type text not null check (location_type in ('seoul_court', 'custom')),
  court_id text,
  court_name text not null,
  district text,

  -- Match info
  match_type text not null check (match_type in (
    'singles', 'mens_doubles', 'womens_doubles', 'mixed_doubles'
  )),
  match_format text not null check (match_format in (
    '4game_nodeuce', '6game_1set', '3set_match', '8game_proset', 'tiebreak', 'custom'
  )),
  score jsonb not null default '{"sets":[]}',
  result text not null check (result in ('win', 'loss', 'draw', 'retired')),
  court_surface text check (court_surface in (
    'hard', 'clay', 'artificial_grass', 'grass', 'indoor', 'other'
  )),

  -- Opponent info
  opponent_name text,
  opponent_level text,

  -- Misc
  cost integer check (cost >= 0),
  notes text check (char_length(notes) <= 1000),
  images text[] default '{}',

  -- Sharing
  is_public boolean default false,
  share_token text unique,

  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists game_records_user_id_idx
  on public.game_records(user_id);
create index if not exists game_records_played_at_idx
  on public.game_records(user_id, played_at desc);
create index if not exists game_records_share_token_idx
  on public.game_records(share_token) where share_token is not null;
create index if not exists game_records_match_type_idx
  on public.game_records(user_id, match_type);

alter table public.game_records enable row level security;

create policy "Users can view their own records" on public.game_records
  for select using (auth.uid() = user_id);

create policy "Users can insert their own records" on public.game_records
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own records" on public.game_records
  for update using (auth.uid() = user_id);

create policy "Users can delete their own records" on public.game_records
  for delete using (auth.uid() = user_id);

-- Storage bucket for game record images
insert into storage.buckets (id, name, public)
values ('record-images', 'record-images', true)
on conflict (id) do nothing;

create policy "Anyone can view record images"
  on storage.objects for select
  using (bucket_id = 'record-images');

create policy "Authenticated users can upload record images"
  on storage.objects for insert
  with check (
    bucket_id = 'record-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own record images"
  on storage.objects for delete
  using (
    bucket_id = 'record-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
