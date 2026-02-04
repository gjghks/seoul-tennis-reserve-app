-- Reviews table for tennis court reviews
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  court_id text not null,
  court_name text not null,
  district text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  content text not null check (char_length(content) >= 10 and char_length(content) <= 500),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for faster queries
create index if not exists reviews_court_id_idx on public.reviews(court_id);
create index if not exists reviews_user_id_idx on public.reviews(user_id);
create index if not exists reviews_created_at_idx on public.reviews(created_at desc);

-- Enable RLS for reviews
alter table public.reviews enable row level security;

-- Anyone can read reviews (for AdSense content)
drop policy if exists "Anyone can view reviews" on public.reviews;
create policy "Anyone can view reviews" on public.reviews
  for select using (true);

-- Only authenticated users can insert their own reviews
drop policy if exists "Authenticated users can insert reviews" on public.reviews;
create policy "Authenticated users can insert reviews" on public.reviews
  for insert with check (auth.uid() = user_id);

-- Users can update their own reviews
drop policy if exists "Users can update their own reviews" on public.reviews;
create policy "Users can update their own reviews" on public.reviews
  for update using (auth.uid() = user_id);

-- Users can delete their own reviews
drop policy if exists "Users can delete their own reviews" on public.reviews;
create policy "Users can delete their own reviews" on public.reviews
  for delete using (auth.uid() = user_id);

-- Prevent duplicate reviews (one review per user per court)
create unique index if not exists reviews_user_court_unique on public.reviews(user_id, court_id);
