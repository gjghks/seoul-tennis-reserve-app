-- Cache table for pre-computed popular courts ranking (cron-updated)
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

-- Seed with empty row so upsert always works
insert into public.popular_courts_cache (id, data) values (1, '[]'::jsonb);
